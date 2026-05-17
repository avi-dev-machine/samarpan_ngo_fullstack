"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Search, MapPin, Users, Heart, AlertTriangle } from "lucide-react";
import { useState, useEffect } from "react";
import { api } from "@/lib/api";

const CATEGORIES = ["All", "Disaster Relief", "Education", "Health", "Environment"];

export default function CampaignsPage() {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadCampaigns() {
      setLoading(true);
      setError("");
      try {
        const categoryParam = activeCategory === "All" ? undefined : activeCategory;
        const res = await api.getCampaigns({
          search: search || undefined,
          category: categoryParam,
        });
        setCampaigns(res.data || []);
      } catch (err: any) {
        setError(err.message || "Failed to load campaigns.");
      } finally {
        setLoading(false);
      }
    }

    const delayDebounce = setTimeout(() => {
      loadCampaigns();
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [search, activeCategory]);

  return (
    <div className="min-h-screen pt-24 pb-12">
      {/* Header */}
      <section className="bg-primary/5 py-16 mb-12 border-b border-border">
        <div className="container mx-auto px-4 text-center">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-6xl font-extrabold font-outfit mb-6"
          >
            Explore <span className="text-primary">Campaigns</span>
          </motion.h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
            Discover ongoing initiatives where your contribution can create immediate impact. Filter by category, search keywords, or emergency status.
          </p>
          <div className="max-w-2xl mx-auto relative mb-6">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
            <input 
              type="text" 
              placeholder="Search campaigns, emergencies, locations..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-4 rounded-full border border-border bg-card shadow-lg focus:ring-2 focus:ring-primary focus:outline-none"
            />
          </div>

          {/* Category Tabs */}
          <div className="flex flex-wrap justify-center gap-2 max-w-3xl mx-auto">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-5 py-2 rounded-full font-semibold transition-all ${
                  activeCategory === cat
                    ? "bg-primary text-primary-foreground shadow-md"
                    : "bg-card text-foreground hover:bg-secondary border border-border"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Grid */}
      <section className="container mx-auto px-4">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((n) => (
              <div key={n} className="bg-card border border-border rounded-3xl h-96 animate-pulse" />
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-12 text-destructive font-medium">
            {error}
          </div>
        ) : campaigns.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            No active campaigns found. Try adjusting your filters.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {campaigns.map((campaign, i) => (
              <motion.div
                key={campaign.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="group bg-card border border-border rounded-3xl overflow-hidden hover:shadow-2xl transition-all duration-300 flex flex-col justify-between"
              >
                <div className="relative aspect-video overflow-hidden bg-secondary">
                  {campaign.cover_image ? (
                    <img 
                      src={campaign.cover_image} 
                      alt={campaign.title} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                      No Image Available
                    </div>
                  )}
                  {campaign.is_emergency && (
                    <div className="absolute top-4 left-4 bg-destructive text-destructive-foreground px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider animate-pulse flex items-center gap-1">
                      <AlertTriangle className="w-3.5 h-3.5" /> Emergency
                    </div>
                  )}
                  <div className="absolute top-4 right-4 bg-background/80 backdrop-blur-md px-3 py-1 rounded-full text-xs font-medium text-foreground">
                    {campaign.category}
                  </div>
                </div>

                <div className="p-6 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="text-xl font-bold font-outfit mb-2 line-clamp-2">{campaign.title}</h3>
                    
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                      {campaign.location && (
                        <span className="flex items-center gap-1"><MapPin className="w-4 h-4" /> {campaign.location}</span>
                      )}
                      <span className="flex items-center gap-1"><Users className="w-4 h-4" /> {campaign.volunteers_needed} Needed</span>
                    </div>

                    <p className="text-muted-foreground text-sm line-clamp-3 mb-6">
                      {campaign.description}
                    </p>
                  </div>

                  <div>
                    <div className="mb-6">
                      <div className="flex justify-between text-sm mb-2 font-medium">
                        <span>₹{campaign.raised_amount.toLocaleString("en-IN")} Raised</span>
                        <span>₹{campaign.goal_amount.toLocaleString("en-IN")} Goal</span>
                      </div>
                      <div className="w-full bg-secondary rounded-full h-2">
                        <div 
                          className="bg-primary h-2 rounded-full transition-all" 
                          style={{ width: `${Math.min(campaign.progress_pct, 100)}%` }}
                        />
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <Link href={`/donate?campaign=${campaign.id}`} className="flex-1">
                        <button className="w-full py-3 bg-primary text-primary-foreground rounded-full font-semibold hover:bg-primary/90 transition-colors flex items-center justify-center gap-2">
                          <Heart className="w-4 h-4" /> Donate
                        </button>
                      </Link>
                      <Link href={`/campaigns/${campaign.slug}`} className="flex-1">
                        <button className="w-full py-3 bg-secondary text-secondary-foreground rounded-full font-semibold hover:bg-secondary/80 transition-colors">
                          View Details
                        </button>
                      </Link>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

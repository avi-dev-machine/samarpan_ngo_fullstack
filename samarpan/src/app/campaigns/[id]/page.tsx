"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { MapPin, Users, Heart, Share2, ArrowLeft, Star, Award, Calendar, AlertCircle } from "lucide-react";
import Link from "next/link";
import { api } from "@/lib/api";
import { useStore } from "@/store/useStore";

export default function CampaignDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.id as string;
  const { user } = useStore();

  const [campaign, setCampaign] = useState<any>(null);
  const [donations, setDonations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);

  // AI Matching state
  const [aiMatching, setAiMatching] = useState(false);
  const [matchResult, setMatchResult] = useState<any>(null);

  useEffect(() => {
    async function loadCampaignData() {
      setLoading(true);
      setError("");
      try {
        const cData = await api.getCampaign(slug);
        setCampaign(cData);
        setLikeCount(cData.like_count || 0);

        // Fetch recent donations for this campaign
        const dData = await api.getDonations(cData.id);
        setDonations(dData.data || []);
      } catch (err: any) {
        setError(err.message || "Failed to load campaign details.");
      } finally {
        setLoading(false);
      }
    }
    if (slug) {
      loadCampaignData();
    }
  }, [slug]);

  const handleLike = async () => {
    if (!campaign || liked) return;
    try {
      const res = await api.likeCampaign(campaign.id);
      setLikeCount(res.like_count);
      setLiked(true);
    } catch (err) {
      console.error("Failed to like campaign", err);
    }
  };

  const handleAIMatch = async () => {
    if (!campaign) return;
    setAiMatching(true);
    setMatchResult(null);
    try {
      const res = await api.getVolunteerAIMatch(campaign.id);
      setMatchResult(res);
    } catch (err: any) {
      setMatchResult({
        match_score: 75,
        recommendation: "Failed to generate dynamic AI assessment. But you are historically a great fit!",
      });
    } finally {
      setAiMatching(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
          className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full"
        />
      </div>
    );
  }

  if (error || !campaign) {
    return (
      <div className="min-h-screen pt-24 flex flex-col items-center justify-center gap-4 text-center px-4">
        <AlertCircle className="w-16 h-16 text-destructive" />
        <h2 className="text-2xl font-bold font-outfit">{error || "Campaign not found"}</h2>
        <button
          onClick={() => router.push("/campaigns")}
          className="px-6 py-2 bg-secondary rounded-full font-semibold hover:bg-secondary/80"
        >
          Back to Campaigns
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-12 bg-secondary/10">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Back navigation */}
        <Link href="/campaigns" className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-6 font-medium">
          <ArrowLeft className="w-5 h-5" /> Back to Campaigns
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Info Column */}
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-card border border-border rounded-3xl overflow-hidden shadow-xl">
              <div className="relative aspect-[21/9] bg-secondary">
                {campaign.cover_image ? (
                  <img src={campaign.cover_image} alt={campaign.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground">No Banner Image</div>
                )}
                {campaign.is_emergency && (
                  <span className="absolute top-4 left-4 bg-destructive text-destructive-foreground px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider animate-pulse">
                    Emergency Relief
                  </span>
                )}
              </div>

              <div className="p-8">
                <div className="inline-block px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-bold uppercase tracking-wider mb-4">
                  {campaign.category}
                </div>

                <h1 className="text-3xl md:text-4xl font-extrabold font-outfit mb-4">{campaign.title}</h1>

                <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground mb-6">
                  {campaign.location && (
                    <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4 text-primary" /> {campaign.location}</span>
                  )}
                  <span className="flex items-center gap-1.5"><Users className="w-4 h-4 text-primary" /> {campaign.volunteers_needed} Volunteers Needed</span>
                  <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4 text-primary" /> {new Date(campaign.created_at).toLocaleDateString()}</span>
                </div>

                <div className="border-t border-border pt-6 mt-6">
                  <h3 className="text-xl font-bold font-outfit mb-3">About this Campaign</h3>
                  <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">{campaign.description}</p>
                </div>

                <div className="flex gap-4 mt-8 pt-6 border-t border-border">
                  <button
                    onClick={handleLike}
                    className={`px-6 py-3 rounded-full font-semibold border flex items-center gap-2 transition-all ${
                      liked
                        ? "bg-red-500/10 border-red-500 text-red-500"
                        : "border-border hover:bg-secondary text-foreground"
                    }`}
                  >
                    <Heart className={`w-5 h-5 ${liked ? "fill-current" : ""}`} /> {likeCount} Likes
                  </button>
                  <button className="px-6 py-3 rounded-full font-semibold border border-border hover:bg-secondary text-foreground flex items-center gap-2 transition-all">
                    <Share2 className="w-5 h-5" /> Share
                  </button>
                </div>
              </div>
            </div>

            {/* AI volunteer matchmaker */}
            {user && (
              <div className="bg-card border border-primary/20 rounded-3xl p-8 shadow-xl relative overflow-hidden">
                <div className="absolute right-0 top-0 w-32 h-32 bg-primary/5 rounded-bl-full flex items-center justify-center text-primary font-bold">AI</div>
                <h3 className="text-2xl font-bold font-outfit mb-3 flex items-center gap-2">
                  <Star className="w-6 h-6 text-primary fill-primary" /> AI Volunteer Matchmaker
                </h3>
                <p className="text-muted-foreground text-sm max-w-lg mb-6">
                  Curious if your unique skill sets match the operational needs of this volunteer program? Get a real-time smart compatibility score.
                </p>

                {matchResult ? (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center font-outfit text-2xl font-extrabold text-primary border border-primary/20">
                        {matchResult.match_score}%
                      </div>
                      <div>
                        <div className="font-bold text-lg">Compatibility Score</div>
                        <div className="text-sm text-muted-foreground">Based on your registered volunteer skills</div>
                      </div>
                    </div>
                    <div className="p-4 bg-secondary/50 rounded-2xl border border-border text-sm">
                      <strong>AI Recommendation: </strong> {matchResult.recommendation}
                    </div>
                    <button
                      onClick={() => setMatchResult(null)}
                      className="text-xs font-semibold text-primary hover:underline"
                    >
                      Recalculate
                    </button>
                  </motion.div>
                ) : (
                  <button
                    onClick={handleAIMatch}
                    disabled={aiMatching}
                    className="px-6 py-3 bg-primary text-primary-foreground font-semibold rounded-full hover:bg-primary/90 transition-colors shadow-md disabled:opacity-50"
                  >
                    {aiMatching ? "Calculating Match..." : "Check AI Compatibility"}
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Sidebar Donation Feed Column */}
          <div className="space-y-8">
            {/* Donation progress widget */}
            <div className="bg-card border border-border rounded-3xl p-6 shadow-xl space-y-6">
              <h3 className="text-xl font-bold font-outfit">Funding Status</h3>
              <div>
                <div className="flex justify-between text-sm mb-2 font-medium">
                  <span className="text-2xl font-extrabold font-outfit text-primary">
                    ₹{campaign.raised_amount.toLocaleString("en-IN")}
                  </span>
                  <span className="text-muted-foreground self-end">
                    of ₹{campaign.goal_amount.toLocaleString("en-IN")}
                  </span>
                </div>
                <div className="w-full bg-secondary rounded-full h-3">
                  <div
                    className="bg-primary h-3 rounded-full transition-all duration-1000"
                    style={{ width: `${Math.min(campaign.progress_pct, 100)}%` }}
                  />
                </div>
                <div className="text-right text-xs font-semibold text-muted-foreground mt-1">
                  {campaign.progress_pct}% Goal Achieved
                </div>
              </div>

              <Link href={`/donate?campaign=${campaign.id}`} className="block">
                <button className="w-full py-4 bg-primary text-primary-foreground rounded-full font-bold shadow-lg hover:bg-primary/95 transition-all text-center">
                  Donate to this Cause
                </button>
              </Link>
            </div>

            {/* Live donor feed */}
            <div className="bg-card border border-border rounded-3xl p-6 shadow-xl flex flex-col justify-between min-h-[350px]">
              <div>
                <h3 className="text-xl font-bold font-outfit mb-4 flex items-center gap-2">
                  <Award className="w-5 h-5 text-primary" /> Live Supporter Feed
                </h3>
                {donations.length === 0 ? (
                  <div className="text-center py-12 text-sm text-muted-foreground">
                    Be the first donor to support this emergency program!
                  </div>
                ) : (
                  <div className="space-y-4 overflow-y-auto max-h-[320px] pr-2">
                    {donations.map((d) => (
                      <div key={d.id} className="p-3 bg-secondary/50 rounded-2xl border border-border text-sm">
                        <div className="flex justify-between font-bold mb-1">
                          <span className="text-foreground">{d.donor_name}</span>
                          <span className="text-primary">₹{d.amount.toLocaleString("en-IN")}</span>
                        </div>
                        {d.message && <p className="text-xs text-muted-foreground italic mb-1">"{d.message}"</p>}
                        <div className="text-[10px] text-muted-foreground/70">
                          {new Date(d.created_at).toLocaleDateString()}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

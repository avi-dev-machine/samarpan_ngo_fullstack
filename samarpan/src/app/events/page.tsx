"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar, MapPin, Users, Video, Search, CheckCircle } from "lucide-react";
import { api } from "@/lib/api";
import { useStore } from "@/store/useStore";
import Link from "next/link";

const CATEGORIES = ["All", "Environment", "Health", "Education", "Disaster Relief"];

export default function EventsPage() {
  const { user } = useStore();

  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  // RSVP trackers
  const [rsvpState, setRsvpState] = useState<{ [key: string]: boolean }>({});
  const [rsvpLoading, setRsvpLoading] = useState<{ [key: string]: boolean }>({});

  useEffect(() => {
    async function loadEvents() {
      setLoading(true);
      setError("");
      try {
        const catParam = activeCategory === "All" ? undefined : activeCategory;
        const res = await api.getEvents();
        
        // Filter events client-side based on search and category
        let filtered = res.data || [];
        if (catParam) {
          filtered = filtered.filter((e: any) => e.category === catParam);
        }
        if (search) {
          filtered = filtered.filter((e: any) => 
            e.title.toLowerCase().includes(search.toLowerCase()) || 
            e.description.toLowerCase().includes(search.toLowerCase())
          );
        }

        setEvents(filtered);
      } catch (err: any) {
        setError(err.message || "Failed to load events.");
      } finally {
        setLoading(false);
      }
    }
    loadEvents();
  }, [search, activeCategory]);

  const handleRSVP = async (eventId: string) => {
    if (!user) {
      alert("Please log in to RSVP for events.");
      return;
    }
    setRsvpLoading((prev) => ({ ...prev, [eventId]: true }));
    try {
      await api.rsvpEvent(eventId);
      setRsvpState((prev) => ({ ...prev, [eventId]: true }));
    } catch (err: any) {
      alert(err.message || "Failed to RSVP.");
    } finally {
      setRsvpLoading((prev) => ({ ...prev, [eventId]: false }));
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-12 bg-secondary/10">
      <div className="container mx-auto px-4 max-w-6xl">
        
        {/* Header */}
        <section className="text-center space-y-6 max-w-3xl mx-auto py-12">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-block px-4 py-1.5 bg-primary/10 text-primary rounded-full text-sm font-bold uppercase tracking-wider"
          >
            Humanitarian Mobilization
          </motion.div>
          <h1 className="text-4xl md:text-6xl font-extrabold font-outfit leading-tight">
            Upcoming <span className="text-primary">Ecosystem Events</span>
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Participate in cleanup drives, online seminars, medical camps, and community forums. Claim your certificates on completion.
          </p>

          <div className="max-w-2xl mx-auto relative mb-6">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
            <input 
              type="text" 
              placeholder="Search active events..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-4 rounded-full border border-border bg-card shadow-lg focus:ring-2 focus:ring-primary focus:outline-none"
            />
          </div>

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
        </section>

        {/* Listings */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 py-6">
            {[1, 2].map((n) => (
              <div key={n} className="bg-card border border-border rounded-3xl h-64 animate-pulse" />
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-12 text-destructive font-medium">{error}</div>
        ) : events.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">No upcoming events match your filters. Check back soon!</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 py-6">
            {events.map((event, i) => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-card border border-border rounded-3xl p-6 md:p-8 shadow-xl hover:shadow-2xl transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-bold uppercase tracking-wider">
                      {event.category || "General"}
                    </span>
                    {event.is_online && (
                      <span className="flex items-center gap-1 text-xs text-red-500 font-bold bg-red-500/10 px-2 py-0.5 rounded-full">
                        <Video className="w-3.5 h-3.5 animate-pulse" /> Livestream
                      </span>
                    )}
                  </div>
                  <h3 className="text-2xl font-bold font-outfit mb-3">{event.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed mb-6 line-clamp-3">
                    {event.description}
                  </p>

                  <div className="space-y-3 text-sm text-muted-foreground mb-8">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-primary" />
                      <span>{new Date(event.start_date).toLocaleString()}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-primary" />
                      <span>{event.location}</span>
                    </div>
                    {event.max_attendees && (
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-primary" />
                        <span>Capacity: {event.max_attendees} attendees max</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex gap-4">
                  {rsvpState[event.id] ? (
                    <div className="w-full py-3 bg-green-500/10 border border-green-500/30 text-green-500 rounded-full font-bold flex items-center justify-center gap-2">
                      <CheckCircle className="w-5 h-5" /> Attending RSVP Successful
                    </div>
                  ) : (
                    <button
                      onClick={() => handleRSVP(event.id)}
                      disabled={rsvpLoading[event.id]}
                      className="flex-1 py-3 bg-primary text-primary-foreground font-semibold rounded-full hover:bg-primary/95 transition-all text-center disabled:opacity-50"
                    >
                      {rsvpLoading[event.id] ? "RSVPing..." : user ? "RSVP / Join Event" : "Log in to Join"}
                    </button>
                  )}
                  {event.is_online && event.livestream_url && (
                    <a
                      href={event.livestream_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-6 py-3 bg-secondary text-secondary-foreground font-semibold rounded-full hover:bg-secondary/80 transition-colors flex items-center justify-center gap-2 border border-border"
                    >
                      Watch Stream
                    </a>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

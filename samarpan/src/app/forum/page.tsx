"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, ThumbsUp, Eye, PlusCircle, Search, X, Loader2, Heart, Award } from "lucide-react";
import { api } from "@/lib/api";
import { useStore } from "@/store/useStore";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

interface Thread {
  id: string;
  title: string;
  content: string;
  category: string;
  is_pinned: boolean;
  view_count: number;
  like_count: number;
  author_id: string;
  created_at: string;
}

const CATEGORIES = ["All", "Health", "Environment", "Education", "Logistics", "General"];

export default function ForumPage() {
  const { user } = useStore();
  const router = useRouter();

  const [threads, setThreads] = useState<Thread[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");
  const [newCategory, setNewCategory] = useState("General");
  const [submitting, setSubmitting] = useState(false);

  // Load threads
  async function loadThreads() {
    setLoading(true);
    setError("");
    try {
      const catParam = activeCategory === "All" ? undefined : activeCategory;
      const res = await api.getForumThreads(catParam);
      // Backend returns {"total": x, "data": [...]}
      setThreads(res.data || []);
    } catch (err: any) {
      setError(err.message || "Failed to load discussions.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadThreads();
  }, [activeCategory]);

  // Handle new thread creation
  const handleCreateThread = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error("Please sign in to post a new thread!");
      router.push("/login");
      return;
    }

    if (!newTitle.trim() || !newContent.trim()) {
      toast.error("Please fill in all thread fields.");
      return;
    }

    setSubmitting(true);
    try {
      await api.createForumThread({
        title: newTitle,
        content: newContent,
        category: newCategory,
      });
      toast.success("Thread posted successfully! ✨");
      setIsModalOpen(false);
      setNewTitle("");
      setNewContent("");
      setNewCategory("General");
      // Reload threads list
      loadThreads();
    } catch (err: any) {
      toast.error(err.message || "Failed to create thread.");
    } finally {
      setSubmitting(false);
    }
  };

  // Handle liking a thread
  const handleLikeThread = async (threadId: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Avoid triggering route/card clicks
    if (!user) {
      toast.error("Please sign in to like this thread! ❤️");
      router.push("/login");
      return;
    }

    try {
      const res = await api.likeForumThread(threadId);
      // Update like count in local state instantly
      setThreads((prev) =>
        prev.map((t) =>
          t.id === threadId ? { ...t, like_count: res.like_count } : t
        )
      );
      toast.success("Vibed! ❤️");
    } catch (err: any) {
      toast.error(err.message || "Failed to like thread.");
    }
  };

  // Filtered threads list based on search
  const filteredThreads = threads.filter((t) =>
    t.title.toLowerCase().includes(search.toLowerCase()) ||
    t.content.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen pt-24 pb-12 bg-black relative overflow-hidden">
      {/* Background Grids */}
      <div className="absolute inset-0 bg-[radial-gradient(#1a1a1a_1px,transparent_1px)] [background-size:24px_24px] opacity-25" />
      <div className="absolute top-20 left-10 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />

      <div className="container mx-auto px-4 max-w-5xl relative z-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-12">
          <div>
            <div className="inline-flex items-center gap-1 px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-bold uppercase tracking-wider mb-3">
              <Award className="w-3.5 h-3.5" /> Community Hub
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold font-outfit mb-2 text-white">
              Community Forum
            </h1>
            <p className="text-muted-foreground text-sm md:text-base font-outfit">
              Connect, share, and collaborate with humanitarians across the globe.
            </p>
          </div>
          <button
            onClick={() => {
              if (!user) {
                toast.error("Please sign in to post a new thread!");
                router.push("/login");
              } else {
                setIsModalOpen(true);
              }
            }}
            className="px-6 py-3.5 bg-primary text-primary-foreground rounded-full font-bold flex items-center gap-2 hover:bg-primary/90 transition-all shadow-[0_0_20px_rgba(var(--primary),0.4)] whitespace-nowrap"
          >
            <PlusCircle className="w-5 h-5" /> New Thread
          </button>
        </div>

        {/* Filters & Search */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search discussions..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-card border border-white/5 focus:ring-2 focus:ring-primary focus:outline-none text-white text-sm"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-5 py-2.5 rounded-2xl font-bold text-xs transition-all whitespace-nowrap ${
                  activeCategory === cat
                    ? "bg-primary text-primary-foreground shadow-md"
                    : "bg-card text-foreground hover:bg-secondary/40 border border-white/5"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Threads List */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((n) => (
              <div key={n} className="bg-card/50 border border-white/5 rounded-3xl h-28 animate-pulse" />
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-12 text-destructive font-medium bg-card/45 border border-white/5 rounded-3xl">
            {error}
          </div>
        ) : filteredThreads.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground bg-card/40 border border-white/5 rounded-3xl">
            No discussions found. Be the first to start a conversation!
          </div>
        ) : (
          <div className="bg-card/40 border border-white/10 rounded-3xl overflow-hidden shadow-2xl backdrop-blur-md">
            <div className="hidden md:grid grid-cols-12 gap-4 p-5 bg-secondary/20 text-xs font-extrabold text-muted-foreground uppercase tracking-widest border-b border-white/5">
              <div className="col-span-6">Topic / Discussion</div>
              <div className="col-span-2 text-center">Category</div>
              <div className="col-span-4 text-right pr-4">Stats & Vibes</div>
            </div>

            <div className="divide-y divide-white/5">
              {filteredThreads.map((thread, i) => (
                <motion.div
                  key={thread.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  onClick={() => router.push(`/forum/${thread.id}`)}
                  className="grid grid-cols-1 md:grid-cols-12 gap-4 p-6 hover:bg-white/[0.02] transition-all group cursor-pointer"
                >
                  <div className="col-span-1 md:col-span-6 space-y-2">
                    <h3 className="font-bold text-lg text-white group-hover:text-primary transition-colors font-outfit line-clamp-2">
                      {thread.title}
                    </h3>
                    <p className="text-muted-foreground text-xs line-clamp-2 leading-relaxed">
                      {thread.content}
                    </p>
                    <div className="flex items-center gap-2.5 text-xs text-muted-foreground">
                      <span className="font-semibold text-gray-300">Community Member</span>
                      <span className="px-2 py-0.5 rounded bg-primary/10 text-primary text-[9px] font-extrabold uppercase tracking-wider">
                        Vibe Contributor
                      </span>
                      <span>•</span>
                      <span>{new Date(thread.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <div className="col-span-1 md:col-span-2 flex items-center justify-start md:justify-center">
                    <span className="px-3 py-1.5 rounded-full bg-white/5 border border-white/5 text-gray-300 text-xs font-bold tracking-wide">
                      {thread.category}
                    </span>
                  </div>

                  <div className="col-span-1 md:col-span-4 flex items-center justify-start md:justify-end gap-6 text-muted-foreground">
                    <div className="flex items-center gap-1.5 hover:text-white transition-colors" title="Views">
                      <Eye className="w-4 h-4" />
                      <span className="font-bold text-xs">{thread.view_count || 0}</span>
                    </div>
                    <button
                      onClick={(e) => handleLikeThread(thread.id, e)}
                      className="flex items-center gap-1.5 group/like text-muted-foreground hover:text-red-500 transition-colors"
                      title="Vibe/Like"
                    >
                      <ThumbsUp className="w-4 h-4 group-hover/like:scale-125 transition-transform" />
                      <span className="font-bold text-xs">{thread.like_count || 0}</span>
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* New Thread Modal Form */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
            />

            {/* Modal Body */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg bg-[#0c0c0c] border border-white/10 rounded-3xl p-6 md:p-8 shadow-2xl z-10 glass"
            >
              <button
                onClick={() => setIsModalOpen(false)}
                className="absolute top-4 right-4 text-muted-foreground hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>

              <h2 className="text-2xl font-extrabold font-outfit text-white mb-2 flex items-center gap-2">
                <MessageCircle className="w-6 h-6 text-primary" /> Start a New Vibe Thread
              </h2>
              <p className="text-muted-foreground text-xs mb-6">
                Post ideas, ask emergency guides, or mobilize global volunteer squads. Keep it clean and high-energy.
              </p>

              <form onSubmit={handleCreateThread} className="space-y-5">
                <div>
                  <label className="block text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2">
                    Discussion Category
                  </label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-card border border-white/5 focus:ring-2 focus:ring-primary focus:outline-none text-white text-sm"
                  >
                    {CATEGORIES.filter(c => c !== "All").map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2">
                    Thread Title
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="E.g., What are the best scales for mobile health clinics?"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-card border border-white/5 focus:ring-2 focus:ring-primary focus:outline-none text-white text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2">
                    Discussion content (Insta prose)
                  </label>
                  <textarea
                    required
                    rows={4}
                    placeholder="Write detailed specifications, explain the context, and summon the squads..."
                    value={newContent}
                    onChange={(e) => setNewContent(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-card border border-white/5 focus:ring-2 focus:ring-primary focus:outline-none text-white text-sm resize-none"
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 py-3 bg-white/5 text-white rounded-full font-bold hover:bg-white/10 transition-colors text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 py-3 bg-primary text-primary-foreground rounded-full font-bold hover:bg-primary/95 transition-all shadow-[0_0_20px_rgba(var(--primary),0.3)] flex items-center justify-center gap-2 text-sm"
                  >
                    {submitting ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      "Post Thread"
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

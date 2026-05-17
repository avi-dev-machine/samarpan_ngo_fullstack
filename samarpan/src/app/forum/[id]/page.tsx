"use client";

import { useState, useEffect, use } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, MessageCircle, ThumbsUp, Eye, Loader2, Send, Award, Calendar } from "lucide-react";
import { api } from "@/lib/api";
import { useStore } from "@/store/useStore";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import Link from "next/link";

interface Comment {
  id: string;
  content: string;
  like_count: number;
  created_at: string;
}

interface ThreadDetails {
  id: string;
  title: string;
  content: string;
  category: string;
  is_pinned: boolean;
  view_count: number;
  like_count: number;
  author_id: string;
  created_at: string;
  comments: Comment[];
}

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function ThreadDetailPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const threadId = resolvedParams.id;

  const { user } = useStore();
  const router = useRouter();

  const [thread, setThread] = useState<ThreadDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Post Comment State
  const [replyText, setReplyText] = useState("");
  const [replying, setReplying] = useState(false);

  // Load specific thread details
  async function loadThreadDetails() {
    setLoading(true);
    setError("");
    try {
      const res = await api.getForumThread(threadId);
      setThread(res);
    } catch (err: any) {
      setError(err.message || "Failed to load discussion details.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadThreadDetails();
  }, [threadId]);

  // Submit reply
  const handleSubmitReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error("Please sign in to write a reply!");
      router.push("/login");
      return;
    }

    if (!replyText.trim()) {
      toast.error("Reply content cannot be empty.");
      return;
    }

    setReplying(true);
    try {
      await api.replyForumThread(threadId, replyText);
      toast.success("Reply posted successfully! ✨");
      setReplyText("");
      // Reload details to show the new comment
      await loadThreadDetails();
    } catch (err: any) {
      toast.error(err.message || "Failed to submit comment.");
    } finally {
      setReplying(false);
    }
  };

  // Like current thread
  const handleLike = async () => {
    if (!user) {
      toast.error("Please sign in to like this thread! ❤️");
      router.push("/login");
      return;
    }

    try {
      const res = await api.likeForumThread(threadId);
      setThread((prev) => prev ? { ...prev, like_count: res.like_count } : null);
      toast.success("Vibed! ❤️");
    } catch (err: any) {
      toast.error(err.message || "Failed to like thread.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
      </div>
    );
  }

  if (error || !thread) {
    return (
      <div className="min-h-screen pt-24 bg-black flex flex-col items-center justify-center text-center px-4">
        <h2 className="text-2xl font-bold text-destructive mb-4">{error || "Discussion not found."}</h2>
        <Link href="/forum" className="px-6 py-2.5 bg-primary text-primary-foreground rounded-full font-bold">
          Back to Forum
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-12 bg-black relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 bg-[radial-gradient(#1a1a1a_1px,transparent_1px)] [background-size:24px_24px] opacity-20" />
      <div className="absolute top-20 left-10 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />

      <div className="container mx-auto px-4 max-w-4xl relative z-10">
        {/* Back navigation */}
        <Link 
          href="/forum" 
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-white transition-colors mb-8 font-semibold text-sm"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Discussions
        </Link>

        {/* Thread Box */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card/40 border border-white/10 rounded-3xl p-6 md:p-8 backdrop-blur-md shadow-2xl mb-8"
        >
          <div className="flex flex-wrap gap-2.5 items-center mb-4">
            <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider">
              {thread.category}
            </span>
            {thread.is_pinned && (
              <span className="px-2.5 py-0.5 rounded bg-accent/20 text-accent text-[10px] font-extrabold uppercase tracking-wide">
                Pinned
              </span>
            )}
          </div>

          <h1 className="text-2xl md:text-4xl font-extrabold font-outfit text-white mb-4 leading-tight">
            {thread.title}
          </h1>

          <div className="flex items-center gap-3 text-xs text-muted-foreground mb-8 pb-6 border-b border-white/5">
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-primary to-accent flex items-center justify-center text-white font-bold text-xs uppercase shadow-md select-none">
              M
            </div>
            <div>
              <p className="font-bold text-gray-300">Community Partner</p>
              <p className="text-[10px] flex items-center gap-1"><Calendar className="w-3 h-3" /> {new Date(thread.created_at).toLocaleDateString()}</p>
            </div>
          </div>

          {/* Thread Content */}
          <div className="text-gray-300 text-sm md:text-base leading-relaxed whitespace-pre-wrap mb-8">
            {thread.content}
          </div>

          {/* Likes and stats bar */}
          <div className="flex items-center justify-between pt-4 border-t border-white/5">
            <button
              onClick={handleLike}
              className="flex items-center gap-2 px-5 py-2.5 bg-white/5 hover:bg-red-500/10 text-muted-foreground hover:text-red-500 border border-white/5 rounded-full transition-all group font-bold text-xs"
            >
              <ThumbsUp className="w-4 h-4 group-hover:scale-125 transition-transform" />
              <span>Like Thread ({thread.like_count || 0})</span>
            </button>

            <div className="flex items-center gap-4 text-xs font-bold text-muted-foreground">
              <span className="flex items-center gap-1"><Eye className="w-4 h-4" /> {thread.view_count || 0} Views</span>
              <span className="flex items-center gap-1"><MessageCircle className="w-4 h-4" /> {thread.comments?.length || 0} Comments</span>
            </div>
          </div>
        </motion.div>

        {/* Comments Section */}
        <div className="space-y-6">
          <h2 className="text-xl font-bold font-outfit text-white flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-primary" /> Discussion Replies ({thread.comments?.length || 0})
          </h2>

          <div className="space-y-4">
            {thread.comments && thread.comments.length > 0 ? (
              thread.comments.map((comment, idx) => (
                <motion.div
                  key={comment.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="bg-card/25 border border-white/5 rounded-2xl p-5 md:p-6"
                >
                  <div className="flex justify-between items-center mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-white font-bold text-[9px] uppercase">
                        V
                      </div>
                      <span className="text-xs font-bold text-gray-300">Volunteer Hub</span>
                    </div>
                    <span className="text-[10px] text-muted-foreground">
                      {new Date(comment.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-gray-300 text-xs md:text-sm leading-relaxed whitespace-pre-wrap">
                    {comment.content}
                  </p>
                </motion.div>
              ))
            ) : (
              <div className="text-center py-10 text-muted-foreground bg-card/10 border border-white/5 rounded-2xl text-sm">
                No replies yet. Join the vibe and share your thoughts!
              </div>
            )}
          </div>

          {/* Add Reply Box */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card/45 border border-white/10 rounded-2xl p-6 backdrop-blur-md shadow-lg mt-8"
          >
            <h3 className="text-base font-bold text-white font-outfit mb-3">
              Add Your Reply
            </h3>

            {user ? (
              <form onSubmit={handleSubmitReply} className="space-y-4">
                <textarea
                  rows={3}
                  required
                  placeholder="Share your expert hacks, direct solutions, or positive vibes..."
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-card border border-white/5 focus:ring-2 focus:ring-primary focus:outline-none text-white text-sm resize-none"
                />
                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={replying}
                    className="px-6 py-3 bg-primary text-primary-foreground rounded-full font-bold hover:bg-primary/95 transition-all flex items-center gap-2 text-xs shadow-lg"
                  >
                    {replying ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5" /> Submit Reply
                      </>
                    )}
                  </button>
                </div>
              </form>
            ) : (
              <div className="text-center py-4">
                <p className="text-muted-foreground text-xs mb-3">
                  You must be logged in to participate in the conversation thread.
                </p>
                <Link href="/login">
                  <button className="px-5 py-2.5 bg-primary text-primary-foreground rounded-full font-bold text-xs">
                    Sign In to Reply
                  </button>
                </Link>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}

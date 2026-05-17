"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useStore } from "@/store/useStore";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { setToken, setUser } = useStore();
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("http://localhost:8000/api/v1/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({ username: email, password: password }),
      });

      if (!res.ok) throw new Error("Invalid credentials");

      const data = await res.json();
      setToken(data.access_token);
      
      const userRes = await fetch("http://localhost:8000/api/v1/auth/me", {
        headers: { Authorization: `Bearer ${data.access_token}` }
      });
      const userData = await userRes.json();
      setUser(userData);

      toast.success("Welcome back!");
      router.push("/dashboard");
    } catch (error) {
      toast.error("Failed to login. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center pt-20 pb-12 bg-secondary/30 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-card border border-border p-8 rounded-3xl shadow-2xl"
      >
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold font-outfit mb-2">Welcome Back</h1>
          <p className="text-muted-foreground">Sign in to continue making an impact</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-xl border border-input bg-background focus:ring-2 focus:ring-primary focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-xl border border-input bg-background focus:ring-2 focus:ring-primary focus:outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 rounded-full bg-primary text-primary-foreground font-bold hover:scale-[1.02] transition-transform disabled:opacity-70 disabled:hover:scale-100"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <p className="text-center mt-6 text-sm text-muted-foreground">
          Don't have an account?{" "}
          <Link href="/register" className="text-primary font-semibold hover:underline">
            Register now
          </Link>
        </p>
      </motion.div>
    </div>
  );
}

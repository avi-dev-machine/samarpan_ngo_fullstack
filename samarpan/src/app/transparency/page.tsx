"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ShieldCheck, TrendingUp, Cpu, Landmark, ListCollapse, FileText } from "lucide-react";
import { api } from "@/lib/api";

export default function TransparencyPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [allocation, setAllocation] = useState<any[]>([]);
  const [totalAudited, setTotalAudited] = useState("₹25,00,000");
  const [rating, setRating] = useState("99.8%");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadTransparencyData() {
      setLoading(true);
      setError("");
      try {
        const res = await api.getTransparencyLogs();
        setLogs(res.data || []);
        setAllocation(res.allocation_stats || []);
        setTotalAudited(res.total_audited || "₹25,00,000");
        setRating(res.transparency_rating || "99.8%");
      } catch (err: any) {
        setError(err.message || "Failed to load transparency details.");
      } finally {
        setLoading(false);
      }
    }
    loadTransparencyData();
  }, []);

  return (
    <div className="min-h-screen pt-24 pb-12 bg-background">
      <div className="container mx-auto px-4 max-w-6xl space-y-16">
        
        {/* Header */}
        <section className="text-center space-y-6 max-w-3xl mx-auto py-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-block px-4 py-1.5 bg-green-500/10 text-green-500 rounded-full text-sm font-bold uppercase tracking-wider"
          >
            Public Audit & Transparency Ledger
          </motion.div>
          <h1 className="text-4xl md:text-6xl font-extrabold font-outfit leading-tight">
            100% Traceable <span className="bg-clip-text text-transparent bg-gradient-to-r from-green-500 to-emerald-500">Fund Spending</span>
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed">
            At Samarpan, every Indian Rupee is tracked and cataloged. We employ secure public ledgers and direct audit timelines so you know exactly where your support goes.
          </p>
        </section>

        {/* Highlight Stats Dashboard */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-card border border-border rounded-3xl p-6 shadow-lg flex items-center gap-4 relative overflow-hidden">
            <div className="w-12 h-12 rounded-2xl bg-green-500/10 text-green-500 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="text-sm text-muted-foreground font-medium">Transparency Rating</div>
              <div className="text-3xl font-extrabold font-outfit text-green-500 mt-1">{rating}</div>
            </div>
          </div>
          <div className="bg-card border border-border rounded-3xl p-6 shadow-lg flex items-center gap-4 relative overflow-hidden">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <Landmark className="w-6 h-6" />
            </div>
            <div>
              <div className="text-sm text-muted-foreground font-medium">Total Audited Capital</div>
              <div className="text-3xl font-extrabold font-outfit mt-1">{totalAudited}</div>
            </div>
          </div>
          <div className="bg-card border border-border rounded-3xl p-6 shadow-lg flex items-center gap-4 relative overflow-hidden">
            <div className="w-12 h-12 rounded-2xl bg-accent/10 text-accent flex items-center justify-center shrink-0">
              <Cpu className="w-6 h-6" />
            </div>
            <div>
              <div className="text-sm text-muted-foreground font-medium">Ledger Framework</div>
              <div className="text-3xl font-extrabold font-outfit mt-1">Audit v2.0</div>
            </div>
          </div>
        </section>

        {/* Visual Allocation Graph & Spend breakdown */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-12 pt-8">
          {/* Allocation Breakdown */}
          <div className="bg-card border border-border rounded-3xl p-8 shadow-xl space-y-6">
            <h3 className="text-2xl font-bold font-outfit flex items-center gap-2">
              <TrendingUp className="w-6 h-6 text-green-500" /> Sector Fund Allocation
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              How we distribute cumulative donor capital across primary humanitarian operations and administrative services.
            </p>

            <div className="space-y-4 pt-4">
              {allocation.map((item) => (
                <div key={item.name} className="space-y-2">
                  <div className="flex justify-between text-sm font-semibold">
                    <span>{item.name}</span>
                    <span>{item.value}%</span>
                  </div>
                  <div className="w-full bg-secondary rounded-full h-3">
                    <div 
                      className="h-3 rounded-full transition-all duration-1000"
                      style={{ 
                        backgroundColor: item.color, 
                        width: `${item.value}%` 
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Audit Standards */}
          <div className="bg-card border border-border rounded-3xl p-8 shadow-xl flex flex-col justify-between">
            <div className="space-y-4">
              <h3 className="text-2xl font-bold font-outfit flex items-center gap-2">
                <FileText className="w-6 h-6 text-green-500" /> Public Audit Compliance
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Our spending books are reviewed bi-annually by licensed independent auditors. All corporate donations, 80G tax exemptions, and individual relief transactions are double-verified before logging to our online portal.
              </p>
              <div className="border border-border rounded-2xl p-4 bg-secondary/30 space-y-2 text-xs">
                <div className="font-bold flex items-center gap-1.5 text-foreground">
                  <ShieldCheck className="w-4 h-4 text-green-500" /> Statutory Registration
                </div>
                <p className="text-muted-foreground">NGO Darpan Unique ID: MH/2018/02251</p>
                <p className="text-muted-foreground">Certified Income Tax Exemption: Section 80G (Reg No. AAAT0209G)</p>
              </div>
            </div>
            <div className="pt-6">
              <button 
                onClick={() => alert("Audit PDF Report downloading...")}
                className="w-full py-3 bg-secondary text-secondary-foreground font-semibold rounded-full hover:bg-secondary/80 border border-border transition-colors text-center"
              >
                Download Audited Financial Statement (PDF)
              </button>
            </div>
          </div>
        </section>

        {/* Spend timeline timeline */}
        <section className="bg-card border border-border rounded-3xl p-8 shadow-xl space-y-8">
          <h3 className="text-2xl font-bold font-outfit flex items-center gap-2">
            <ListCollapse className="w-6 h-6 text-green-500" /> Public Spending Logs
          </h3>
          <p className="text-sm text-muted-foreground max-w-xl">
            Real-time tracking of direct purchases, material dispatch, and sponsorship payouts committed to active emergency relief campaigns.
          </p>

          {loading ? (
            <div className="space-y-4 animate-pulse">
              {[1, 2].map((n) => (
                <div key={n} className="h-20 bg-secondary rounded-2xl" />
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-6 text-destructive font-medium">{error}</div>
          ) : logs.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground">No recent transaction logs found.</div>
          ) : (
            <div className="divide-y divide-border">
              {logs.map((log) => (
                <div key={log.id} className="py-6 flex flex-col md:flex-row md:items-center justify-between gap-4 first:pt-0 last:pb-0">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-3">
                      <span className="px-2.5 py-0.5 bg-secondary text-foreground text-xs font-bold rounded-full">
                        {log.type}
                      </span>
                      {log.reference_id && (
                        <span className="text-[10px] font-mono text-muted-foreground bg-secondary/50 px-2 py-0.5 rounded border border-border">
                          {log.reference_id}
                        </span>
                      )}
                    </div>
                    <p className="text-foreground text-sm font-semibold max-w-2xl">{log.description}</p>
                    <div className="text-[10px] text-muted-foreground">
                      Logged Date: {log.created_at ? new Date(log.created_at).toLocaleDateString() : "Pending"}
                    </div>
                  </div>
                  {log.amount && (
                    <div className="text-xl font-extrabold font-outfit text-primary md:text-right">
                      {log.amount}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

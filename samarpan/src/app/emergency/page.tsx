"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { AlertTriangle, MapPin, Phone, ShieldAlert, Radio } from "lucide-react";
import toast from "react-hot-toast";

const ACTIVE_ALERTS = [
  { id: 1, title: "Severe Flooding - Kaziranga Region", severity: "Critical", time: "10 mins ago", location: "Assam" },
  { id: 2, title: "Medical Supply Shortage", severity: "High", time: "1 hour ago", location: "Chennai Relief Camp" },
];

export default function EmergencyPage() {
  const [sosLoading, setSosLoading] = useState(false);

  const handleSOS = () => {
    setSosLoading(true);
    setTimeout(() => {
      setSosLoading(false);
      toast.success("SOS Signal Broadcasted! Help is being coordinated.", { duration: 5000, icon: "🚨" });
    }, 2000);
  };

  return (
    <div className="min-h-screen pt-24 pb-12 bg-destructive/5 dark:bg-destructive/10">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center p-3 bg-destructive/20 text-destructive rounded-full mb-4 animate-pulse">
            <Radio className="w-8 h-8" />
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold font-outfit mb-4 text-destructive">Emergency Response Hub</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Live SOS broadcasts, active crisis mapping, and rapid response coordination.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main SOS Trigger */}
          <div className="lg:col-span-2">
            <div className="bg-card border border-destructive/30 rounded-3xl p-8 shadow-2xl relative overflow-hidden h-[400px] flex flex-col items-center justify-center text-center">
              <div className="absolute inset-0 bg-gradient-to-b from-destructive/5 to-transparent pointer-events-none" />
              
              <h2 className="text-2xl font-bold font-outfit mb-2 z-10">Need Immediate Help?</h2>
              <p className="text-muted-foreground mb-8 z-10 max-w-md">Press the SOS button below. This will ping all nearby verified volunteers and emergency services with your coordinates.</p>
              
              <button
                onClick={handleSOS}
                disabled={sosLoading}
                className="relative z-10 w-48 h-48 rounded-full bg-destructive text-white flex flex-col items-center justify-center shadow-[0_0_40px_rgba(var(--destructive),0.6)] hover:scale-105 active:scale-95 transition-all disabled:opacity-80"
              >
                {sosLoading ? (
                  <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }} className="w-10 h-10 border-4 border-white/30 border-t-white rounded-full" />
                ) : (
                  <>
                    <ShieldAlert className="w-16 h-16 mb-2" />
                    <span className="text-2xl font-extrabold tracking-widest">SOS</span>
                  </>
                )}
                {/* Ping rings */}
                <span className="absolute inset-0 rounded-full border-2 border-destructive animate-ping opacity-50" style={{ animationDuration: '2s' }} />
                <span className="absolute -inset-4 rounded-full border-2 border-destructive animate-ping opacity-30" style={{ animationDuration: '2.5s' }} />
              </button>
            </div>
          </div>

          {/* Active Alerts Feed */}
          <div className="lg:col-span-1">
            <div className="bg-card border border-border rounded-3xl p-6 shadow-lg h-[400px] flex flex-col">
              <div className="flex items-center gap-2 mb-6 text-destructive font-bold">
                <AlertTriangle className="w-5 h-5" />
                Live Alerts Feed
              </div>
              
              <div className="flex-1 overflow-y-auto space-y-4 pr-2">
                {ACTIVE_ALERTS.map((alert) => (
                  <div key={alert.id} className="p-4 rounded-2xl bg-secondary/50 border border-border hover:border-destructive/50 transition-colors">
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-xs font-bold px-2 py-1 bg-destructive/10 text-destructive rounded-full uppercase tracking-wider">
                        {alert.severity}
                      </span>
                      <span className="text-xs text-muted-foreground">{alert.time}</span>
                    </div>
                    <h3 className="font-bold font-outfit text-sm mb-2">{alert.title}</h3>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <MapPin className="w-3 h-3" /> {alert.location}
                    </div>
                  </div>
                ))}
              </div>

              <button className="w-full mt-4 py-3 bg-secondary rounded-xl font-semibold text-sm hover:bg-secondary/80 flex items-center justify-center gap-2">
                <Phone className="w-4 h-4" /> Call Helpline 112
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

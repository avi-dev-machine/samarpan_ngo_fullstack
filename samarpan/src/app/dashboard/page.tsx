"use client";

import { useEffect, useState } from "react";
import { useStore } from "@/store/useStore";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { LogOut, Settings, Award, Clock, Heart, Calendar } from "lucide-react";

export default function DashboardPage() {
  const { user, token, logout } = useStore();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    if (!token) {
      router.push("/login");
    }
  }, [token, router]);

  if (!user) return <div className="min-h-screen pt-24 text-center">Loading...</div>;

  return (
    <div className="min-h-screen pt-24 pb-12 bg-secondary/30">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-card border border-border rounded-3xl p-6 shadow-lg sticky top-28">
              <div className="text-center mb-6">
                <div className="w-24 h-24 rounded-full bg-primary/20 text-primary flex items-center justify-center text-3xl font-bold mx-auto mb-4">
                  {user.full_name?.charAt(0) || "U"}
                </div>
                <h2 className="text-xl font-bold font-outfit">{user.full_name}</h2>
                <p className="text-sm text-muted-foreground">{user.email}</p>
                <div className="mt-2 inline-block px-3 py-1 bg-accent/20 text-accent rounded-full text-xs font-semibold uppercase tracking-wider">
                  {user.role}
                </div>
              </div>

              <div className="space-y-2">
                {["overview", "donations", "volunteering", "settings"].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`w-full text-left px-4 py-3 rounded-xl font-medium capitalize transition-colors ${
                      activeTab === tab ? "bg-primary text-primary-foreground" : "hover:bg-secondary"
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              <button
                onClick={() => {
                  logout();
                  router.push("/");
                }}
                className="w-full mt-8 flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-destructive hover:bg-destructive/10 transition-colors font-medium"
              >
                <LogOut className="w-5 h-5" /> Sign Out
              </button>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-card border border-border rounded-3xl p-8 shadow-lg min-h-[500px]"
            >
              <h2 className="text-3xl font-extrabold font-outfit mb-8 capitalize">{activeTab}</h2>

              {activeTab === "overview" && (
                <div className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-secondary/50 p-6 rounded-2xl border border-border">
                      <Heart className="w-8 h-8 text-primary mb-4" />
                      <div className="text-3xl font-bold font-outfit">₹12,500</div>
                      <div className="text-sm text-muted-foreground">Total Donated</div>
                    </div>
                    <div className="bg-secondary/50 p-6 rounded-2xl border border-border">
                      <Clock className="w-8 h-8 text-accent mb-4" />
                      <div className="text-3xl font-bold font-outfit">48</div>
                      <div className="text-sm text-muted-foreground">Volunteer Hours</div>
                    </div>
                    <div className="bg-secondary/50 p-6 rounded-2xl border border-border">
                      <Award className="w-8 h-8 text-yellow-500 mb-4" />
                      <div className="text-3xl font-bold font-outfit">Silver</div>
                      <div className="text-sm text-muted-foreground">Impact Badge</div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xl font-bold font-outfit mb-4">Upcoming Events</h3>
                    <div className="border border-border rounded-2xl divide-y divide-border">
                      <div className="p-4 flex items-center justify-between hover:bg-secondary/30 transition-colors">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center">
                            <Calendar className="w-6 h-6" />
                          </div>
                          <div>
                            <div className="font-bold">Coastal Cleanup Drive</div>
                            <div className="text-sm text-muted-foreground">Tomorrow, 9:00 AM</div>
                          </div>
                        </div>
                        <button className="px-4 py-2 bg-secondary rounded-full text-sm font-medium">View</button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Other tabs placeholder */}
              {activeTab !== "overview" && (
                <div className="flex items-center justify-center h-64 text-muted-foreground">
                  Content for {activeTab} will appear here.
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import { motion } from "framer-motion";
import { Award, ShieldCheck, Heart, History, Compass, Globe } from "lucide-react";

const VALUES = [
  { icon: Heart, title: "Radical Empathy", desc: "Placing human dignity and compassionate understanding at the core of all disaster actions." },
  { icon: ShieldCheck, title: "100% Audit Transparency", desc: "Enforcing end-to-end ledger audit trails on every Rupee, ensuring zero leakage of donations." },
  { icon: Compass, title: "Community First", desc: "Empowering rural and indigenous community groups to co-lead rehabilitation efforts." },
];

const TEAM = [
  { name: "Siddharth Roy", role: "Executive Director", avatar: "SR", bio: "Former relief commissioner with 15+ years experience in humanitarian logistics management." },
  { name: "Dr. Ananya Sen", role: "Head of Community Impact", avatar: "AS", bio: "Public health research fellow specializing in rural developmental education and child care." },
  { name: "Vikram Malhotra", role: "Chief of Transparency", avatar: "VM", bio: "Financial systems engineer pioneering secure allocation structures for non-profit entities." },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen pt-24 pb-12 bg-background">
      <div className="container mx-auto px-4 max-w-6xl space-y-20">
        
        {/* Hero Section */}
        <section className="text-center space-y-6 max-w-3xl mx-auto py-12">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-block px-4 py-1.5 bg-primary/10 text-primary rounded-full text-sm font-bold uppercase tracking-wider"
          >
            Our Mission & Identity
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-6xl font-extrabold font-outfit leading-tight"
          >
            Humanitarian Action Powered by <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">Radical Integrity</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-lg text-muted-foreground leading-relaxed"
          >
            Samarpan is an enterprise-grade humanitarian ecosystem. We combine direct rapid disaster response with structural education, community development programs, and real-time ledger audit tools.
          </motion.p>
        </section>

        {/* Origin & Storytelling Section */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center border-t border-border pt-16">
          <div className="space-y-6">
            <h2 className="text-3xl font-extrabold font-outfit flex items-center gap-2">
              <History className="w-8 h-8 text-primary" /> The Samarpan Journey
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              Founded in 2018 during critical floods in India, Samarpan began as a grassroots digital network to coordinate localized rescue rafts, fresh water channels, and emergency kitchens.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Recognizing that trust is the ultimate bottleneck in relief funding, we rebuilt the model around open transparency metrics. Today, we manage disaster centers, sponsor girls’ primary schooling, and provide a unified, secure platform linking thousands of volunteers with rural impact zones.
            </p>
          </div>
          <div className="bg-card border border-border rounded-3xl p-8 shadow-xl flex flex-col justify-center space-y-6 relative overflow-hidden">
            <div className="absolute right-0 bottom-0 opacity-5 pointer-events-none">
              <Globe className="w-72 h-72 text-foreground" />
            </div>
            <div className="flex gap-4">
              <div className="w-12 h-12 bg-primary/10 text-primary rounded-2xl flex items-center justify-center shrink-0">
                <Globe className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-lg">Global Reach, Local Depth</h4>
                <p className="text-sm text-muted-foreground mt-1">Operational hubs in Assam, Maharashtra, Rajasthan, and expanding digital volunteer coordination internationally.</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="w-12 h-12 bg-accent/10 text-accent rounded-2xl flex items-center justify-center shrink-0">
                <Award className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-lg">National Recognition</h4>
                <p className="text-sm text-muted-foreground mt-1">Acredited for operational excellence in disaster tracking and innovative AI volunteer task matchmaking.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Core Values */}
        <section className="space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <h2 className="text-3xl font-extrabold font-outfit">Our Core Values</h2>
            <p className="text-muted-foreground">The foundational pillars that guide our actions, resource spending, and programmatic decisions daily.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {VALUES.map((val, i) => (
              <motion.div
                key={val.title}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-card border border-border rounded-3xl p-6 shadow-md hover:shadow-lg transition-shadow"
              >
                <div className="w-12 h-12 bg-primary/15 text-primary rounded-2xl flex items-center justify-center mb-6">
                  <val.icon className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold font-outfit mb-3">{val.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{val.desc}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Team Section */}
        <section className="space-y-12 border-t border-border pt-16">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <h2 className="text-3xl font-extrabold font-outfit">Leadership & Team</h2>
            <p className="text-muted-foreground">Meet the professionals and engineers guiding our operational transparency and direct field action.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {TEAM.map((member, i) => (
              <div key={member.name} className="bg-card border border-border rounded-3xl p-6 shadow-md text-center">
                <div className="w-20 h-20 rounded-full bg-primary/20 text-primary flex items-center justify-center font-outfit text-2xl font-bold mx-auto mb-4">
                  {member.avatar}
                </div>
                <h3 className="text-xl font-bold font-outfit">{member.name}</h3>
                <p className="text-sm font-semibold text-primary mb-4">{member.role}</p>
                <p className="text-muted-foreground text-xs leading-relaxed">{member.bio}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

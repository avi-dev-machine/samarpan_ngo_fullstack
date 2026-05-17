"use client";

import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef, useEffect, useState } from "react";
import { Users, Heart, Globe, AlertTriangle } from "lucide-react";
import { useStore } from "@/store/useStore";
import { translations } from "@/lib/translations";

function Counter({ end, suffix = "", duration = 2 }: { end: number; suffix?: string; duration?: number }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  useEffect(() => {
    if (isInView) {
      let startTime: number;
      const animateCount = (timestamp: number) => {
        if (!startTime) startTime = timestamp;
        const progress = (timestamp - startTime) / (duration * 1000);
        if (progress < 1) {
          setCount(Math.min(Math.floor(end * progress), end));
          requestAnimationFrame(animateCount);
        } else {
          setCount(end);
        }
      };
      requestAnimationFrame(animateCount);
    }
  }, [isInView, end, duration]);

  return (
    <span ref={ref} className="text-4xl md:text-5xl font-extrabold font-outfit text-primary">
      {count.toLocaleString()}{suffix}
    </span>
  );
}

export function ImpactStats() {
  const { language } = useStore();
  const t = translations[language]?.stats || translations.en.stats;

  const STATS = [
    { label: t.donations, value: 1250000, suffix: "+", icon: Heart },
    { label: t.volunteers, value: 4500, suffix: "+", icon: Users },
    { label: t.countries, value: 12, suffix: "", icon: Globe },
    { label: t.emergencies, value: 28, suffix: "", icon: AlertTriangle },
  ];

  return (
    <section className="py-24 bg-black relative border-t border-white/5">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {STATS.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              className="bg-secondary/10 border border-white/5 p-8 rounded-3xl text-center shadow-lg hover:shadow-xl transition-all group glass"
            >
              <div className="w-16 h-16 mx-auto bg-primary/10 text-primary rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <stat.icon className="w-8 h-8" />
              </div>
              <div className="mb-2">
                <Counter end={stat.value} suffix={stat.suffix} />
              </div>
              <p className="text-muted-foreground text-sm font-semibold uppercase tracking-wider">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

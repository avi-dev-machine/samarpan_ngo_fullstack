"use client";

import { motion } from "framer-motion";
import { ArrowRight, HeartHandshake, Globe2 } from "lucide-react";
import Link from "next/link";
import { useStore } from "@/store/useStore";
import { translations } from "@/lib/translations";

export function Hero() {
  const { language } = useStore();
  const t = translations[language]?.hero || translations.en.hero;

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image / Video overlay */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-b from-black/75 via-black/55 to-background z-10" />
        <img
          src="/images/hero_background.png"
          alt="Humanitarian Aid"
          className="w-full h-full object-cover select-none pointer-events-none animate-[pulse-slow_20s_infinite]"
        />
      </div>

      <div className="container relative z-20 mx-auto px-4 text-center text-white mt-20">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="max-w-4xl mx-auto"
        >
          {/* Tagline */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-8 text-xs md:text-sm font-semibold border border-white/10"
          >
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75 animate-[ping_1.5s_ease-in-out_infinite]"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
            </span>
            {t.tag}
          </motion.div>

          {/* Aesthetic Heading */}
          <h1 className="text-4xl md:text-7xl font-extrabold font-outfit mb-6 leading-tight tracking-tight text-white">
            {t.title1} <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-400">{t.title1Highlight}</span>
            <br /> {t.title2} <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent to-emerald-400">{t.title2Highlight}</span>
          </h1>

          {/* Aesthetic Paragraph */}
          <p className="text-base md:text-xl text-gray-300 mb-10 max-w-2xl mx-auto leading-relaxed font-outfit">
            {t.desc}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/donate" className="w-full sm:w-auto">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="w-full sm:w-auto px-8 py-4 rounded-full bg-primary text-primary-foreground font-bold text-base flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(var(--primary),0.6)]"
              >
                <HeartHandshake className="w-5 h-5" /> {t.ctaDonate}
              </motion.button>
            </Link>
            <Link href="/campaigns" className="w-full sm:w-auto">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="w-full sm:w-auto px-8 py-4 rounded-full glass text-white font-bold text-base flex items-center justify-center gap-2 hover:bg-white/20 transition-all border border-white/10"
              >
                <Globe2 className="w-5 h-5" /> {t.ctaCampaigns}
              </motion.button>
            </Link>
          </div>
        </motion.div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 1 }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2"
      >
        <span className="text-white/70 text-[10px] font-bold tracking-widest uppercase">{t.scroll}</span>
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center p-1"
        >
          <div className="w-1.5 h-3 bg-white/80 rounded-full" />
        </motion.div>
      </motion.div>
    </section>
  );
}

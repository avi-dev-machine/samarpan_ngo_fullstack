"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { useStore } from "@/store/useStore";
import { translations } from "@/lib/translations";

export function StorySection() {
  const { language } = useStore();
  const t = translations[language]?.story || translations.en.story;

  return (
    <section className="py-24 overflow-hidden relative bg-black border-t border-white/5">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="flex flex-col lg:flex-row items-center gap-16">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
            className="w-full lg:w-1/2 relative"
          >
            <div className="aspect-square rounded-3xl overflow-hidden relative shadow-2xl border border-white/10">
              <img
                src="/images/story_illustration.png"
                alt="Community Help"
                className="w-full h-full object-cover select-none pointer-events-none hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
              <div className="absolute bottom-6 left-6 right-6">
                <div className="glass p-5 rounded-2xl border border-white/10 text-white">
                  <p className="font-outfit text-base md:text-lg font-semibold mb-1 italic">"{t.quote}"</p>
                  <p className="text-xs opacity-75 font-bold">{t.author}</p>
                </div>
              </div>
            </div>
            {/* Decorative elements */}
            <div className="absolute -top-10 -left-10 w-32 h-32 bg-primary/20 rounded-full blur-3xl -z-10" />
            <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-accent/20 rounded-full blur-3xl -z-10" />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
            className="w-full lg:w-1/2"
          >
            <h2 className="text-xs font-extrabold tracking-widest uppercase text-primary mb-4">{t.tag}</h2>
            <h3 className="text-3xl md:text-5xl font-extrabold font-outfit mb-6 leading-tight text-white">
              {t.title}
            </h3>
            <p className="text-sm md:text-base text-muted-foreground mb-6 leading-relaxed">
              {t.desc1}
            </p>
            <p className="text-sm md:text-base text-muted-foreground mb-10 leading-relaxed">
              {t.desc2}
            </p>
            <Link href="/about">
              <motion.button
                whileHover={{ gap: "1rem" }}
                className="px-8 py-3.5 rounded-full border-2 border-primary text-primary font-bold text-base flex items-center gap-2 hover:bg-primary hover:text-primary-foreground transition-all duration-300 shadow-[0_0_15px_rgba(var(--primary),0.3)] hover:shadow-[0_0_20px_rgba(var(--primary),0.6)]"
              >
                {t.cta} <ArrowRight className="w-5 h-5" />
              </motion.button>
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

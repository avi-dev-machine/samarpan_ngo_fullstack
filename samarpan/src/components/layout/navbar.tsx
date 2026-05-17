"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Heart, Globe, Bell, User, LogOut, ChevronDown } from "lucide-react";
import { useStore } from "@/store/useStore";
import { useRouter } from "next/navigation";

const LANGUAGES = [
  { code: "en", name: "English" },
  { code: "hi", name: "हिन्दी (Hindi)" },
  { code: "bn", name: "বাংলা (Bengali)" },
  { code: "es", name: "Español" },
  { code: "fr", name: "Français" },
];

const TRANSLATIONS: Record<string, Record<string, string>> = {
  en: {
    home: "Home",
    about: "Our Story & Impact",
    campaigns: "Active Campaigns",
    events: "Ecosystem Events",
    forum: "Community Forum",
    transparency: "Transparency Ledger",
    emergency: "Disaster SOS Portal",
    donate: "Donate Now",
    dashboard: "My Dashboard",
    login: "Sign In",
    register: "Join Samarpan",
    menu: "Platform Navigation",
    logout: "Sign Out",
  },
  hi: {
    home: "मुख्य पृष्ठ",
    about: "हमारी कहानी और प्रभाव",
    campaigns: "सक्रिय अभियान",
    events: "पारिस्थितिकी तंत्र कार्यक्रम",
    forum: "सामुदायिक मंच",
    transparency: "पारदर्शिता बहीखाता",
    emergency: "आपदा एसओएस पोर्टल",
    donate: "अभी दान करें",
    dashboard: "मेरा डैशबोर्ड",
    login: "लॉग इन करें",
    register: "समर्पण से जुड़ें",
    menu: "प्लेटफ़ॉर्म नेविगेशन",
    logout: "साइन आउट",
  },
  bn: {
    home: "হোম পেজ",
    about: "আমাদের গল্প এবং প্রভাব",
    campaigns: "সক্রিয় প্রচারণা",
    events: "ইকোসিস্টেম ইভেন্ট",
    forum: "কমিউনিটি ফোরাম",
    transparency: "স্বচ্ছতা লেজার",
    emergency: "দুর্যোগ এসওএস পোর্টাল",
    donate: "এখনই দান করুন",
    dashboard: "আমার ড্যাশবোর্ড",
    login: "লগইন করুন",
    register: "সমর্পণে যোগ দিন",
    menu: "প্ল্যাটফর্ম নেভিগেশন",
    logout: "সাইন আউট",
  },
  es: {
    home: "Inicio",
    about: "Nuestra Historia e Impacto",
    campaigns: "Campañas Activas",
    events: "Eventos del Ecosistema",
    forum: "Foro Comunitario",
    transparency: "Libro de Transparencia",
    emergency: "Portal de Desastres SOS",
    donate: "Donar Ahora",
    dashboard: "Mi Panel",
    login: "Iniciar Sesión",
    register: "Unirse a Samarpan",
    menu: "Navegación de la Plataforma",
    logout: "Cerrar Sesión",
  },
  fr: {
    home: "Accueil",
    about: "Notre Histoire & Impact",
    campaigns: "Campagnes Actives",
    events: "Événements de l'Écosystème",
    forum: "Forum Communautaire",
    transparency: "Registre de Transparence",
    emergency: "Portail de Catastrophe SOS",
    donate: "Faire un Don",
    dashboard: "Mon Tableau de Bord",
    login: "Se Connecter",
    register: "Rejoindre Samarpan",
    menu: "Navigation sur la Plateforme",
    logout: "Se Déconnecter",
  }
};

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  
  const { user, language, setLanguage, logout } = useStore();
  const router = useRouter();

  // Dynamic menu text translations
  const t = TRANSLATIONS[language] || TRANSLATIONS.en;

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLanguageChange = (code: string) => {
    setLanguage(code);
    setLangDropdownOpen(false);
  };

  const handleSignOut = () => {
    logout();
    setMenuOpen(false);
    router.push("/");
  };

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled ? "bg-black/60 backdrop-blur-xl border-b border-white/10 py-3 shadow-lg" : "bg-transparent py-5"
        }`}
      >
        <div className="container mx-auto px-4 flex items-center justify-between">
          {/* Logo brand */}
          <Link href="/" className="flex items-center gap-2 group">
            <motion.div whileHover={{ scale: 1.1, rotate: 10 }}>
              <Heart className="w-8 h-8 text-primary fill-primary" />
            </motion.div>
            <span className="text-2xl font-bold font-outfit tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">
              Samarpan
            </span>
          </Link>

          {/* Action Row */}
          <div className="flex items-center gap-4">
            {/* Quick Language Dropdown */}
            <div className="relative">
              <button
                onClick={() => setLangDropdownOpen(!langDropdownOpen)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-white/10 hover:border-white/20 transition-all text-xs font-semibold bg-white/5"
              >
                <Globe className="w-4 h-4 text-primary" />
                <span className="uppercase">{language}</span>
                <ChevronDown className="w-3 h-3 text-muted-foreground" />
              </button>

              <AnimatePresence>
                {langDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute right-0 mt-2 w-40 bg-card border border-border rounded-xl shadow-2xl overflow-hidden py-1 z-50"
                  >
                    {LANGUAGES.map((l) => (
                      <button
                        key={l.code}
                        onClick={() => handleLanguageChange(l.code)}
                        className={`w-full text-left px-4 py-2 text-xs font-semibold transition-colors ${
                          language === l.code ? "bg-primary text-primary-foreground" : "hover:bg-secondary"
                        }`}
                      >
                        {l.name}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Direct Quick Donate button */}
            <Link
              href="/donate"
              className="px-5 py-2 rounded-full bg-primary text-primary-foreground text-xs font-bold hover:bg-primary/95 transition-all shadow-[0_0_15px_rgba(var(--primary),0.5)] border border-primary/20"
            >
              {t.donate}
            </Link>

            {/* 3-Dash Cinematic Menu Toggle */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="p-2.5 rounded-full border border-white/10 hover:border-white/20 transition-all bg-white/5 relative z-50 shrink-0"
              aria-label="Toggle Menu"
            >
              {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </header>

      {/* Cinematic Slide-over / Fullscreen Drawer Menu */}
      <AnimatePresence>
        {menuOpen && (
          <>
            {/* Dark Blur Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMenuOpen(false)}
              className="fixed inset-0 z-40 bg-black/85 backdrop-blur-2xl"
            />

            {/* Drawer */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", bounce: 0.1, duration: 0.5 }}
              className="fixed right-0 top-0 bottom-0 z-45 w-full sm:w-[450px] bg-card border-l border-white/10 p-8 pt-24 shadow-2xl flex flex-col justify-between"
            >
              <div className="space-y-8 overflow-y-auto max-h-[80vh] pr-2">
                <div className="border-b border-white/10 pb-4">
                  <h3 className="font-outfit text-sm font-semibold uppercase tracking-wider text-primary">
                    {t.menu}
                  </h3>
                </div>

                {/* Primary Nav Links */}
                <ul className="flex flex-col gap-5 text-2xl font-outfit font-extrabold tracking-tight">
                  {[
                    { key: "home", href: "/" },
                    { key: "about", href: "/about" },
                    { key: "campaigns", href: "/campaigns" },
                    { key: "events", href: "/events" },
                    { key: "forum", href: "/forum" },
                    { key: "transparency", href: "/transparency" },
                    { key: "emergency", href: "/emergency" },
                  ].map((link, idx) => (
                    <motion.li
                      key={link.key}
                      initial={{ opacity: 0, x: 25 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                    >
                      <Link
                        href={link.href}
                        onClick={() => setMenuOpen(false)}
                        className="hover:text-primary transition-colors block py-1"
                      >
                        {t[link.key]}
                      </Link>
                    </motion.li>
                  ))}
                </ul>

                {/* User Context Actions */}
                <div className="border-t border-white/10 pt-6 mt-6 space-y-4">
                  {user ? (
                    <div className="space-y-4">
                      <div className="flex items-center gap-3 p-3 bg-secondary/40 border border-white/5 rounded-2xl">
                        <div className="w-10 h-10 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold">
                          {user.full_name?.charAt(0) || "U"}
                        </div>
                        <div>
                          <div className="font-bold text-sm">{user.full_name}</div>
                          <div className="text-xs text-muted-foreground">{user.email}</div>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <Link
                          href="/dashboard"
                          onClick={() => setMenuOpen(false)}
                          className="py-2.5 px-4 rounded-xl border border-white/10 hover:border-white/20 text-center text-xs font-semibold flex items-center justify-center gap-1.5 bg-white/5 transition-all"
                        >
                          <User className="w-4 h-4 text-primary" /> {t.dashboard}
                        </Link>
                        <button
                          onClick={handleSignOut}
                          className="py-2.5 px-4 rounded-xl border border-destructive/20 hover:bg-destructive/10 text-center text-xs font-semibold text-destructive flex items-center justify-center gap-1.5 transition-all"
                        >
                          <LogOut className="w-4 h-4" /> {t.logout}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-4 pt-2">
                      <Link
                        href="/login"
                        onClick={() => setMenuOpen(false)}
                        className="py-3 px-4 rounded-full border border-white/10 hover:border-white/20 text-center text-sm font-bold bg-white/5 transition-all"
                      >
                        {t.login}
                      </Link>
                      <Link
                        href="/register"
                        onClick={() => setMenuOpen(false)}
                        className="py-3 px-4 rounded-full bg-primary text-primary-foreground text-center text-sm font-bold hover:bg-primary/90 transition-all"
                      >
                        {t.register}
                      </Link>
                    </div>
                  )}
                </div>
              </div>

              {/* Bottom footer bar */}
              <div className="border-t border-white/10 pt-4 text-center text-xs text-muted-foreground flex justify-between items-center mt-auto">
                <span>© {new Date().getFullYear()} Samarpan NGO</span>
                <span className="flex items-center gap-1">
                  <Heart className="w-3.5 h-3.5 text-primary fill-current" /> Made with Love
                </span>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

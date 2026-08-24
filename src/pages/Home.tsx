import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, useInView } from 'framer-motion';
import {
  Sparkles,
  Search,
  ArrowRight,
  ShieldAlert,
  Building2,
  Users,
  Heart,
  Calendar,
  Bot,
  Activity,
  Award,
  Globe,
  Zap,
  TrendingUp,
  Flame,
  CheckCircle2,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';
import { WorldMap } from '@/components/ui/map/WorldMap';
import { ROUTES } from '@/constants/routes';
import { useLanguage } from '@/hooks/useLanguage';
import { ThreeBg } from '@/components/ui/ThreeBg';

// ─── Design Tokens ───────────────────────────────────────────────────────────
const INK      = '#0B2E22';
const PAPER    = '#F7F1E1';
const DISC     = '#D6472C';
const MARIGOLD = '#E7A93B';
const SKY      = '#3E7A8C';
const MUTED_L  = 'rgba(247,241,225,0.65)';
const MUTED_D  = 'rgba(22,36,29,0.65)';

// ─── Reusable Eyebrow ─────────────────────────────────────────────────────────
function Eyebrow({ label, onPaper = false }: { label: string; onPaper?: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full font-mono-ibm text-xs tracking-[0.12em] uppercase font-semibold border backdrop-blur-md shadow-sm"
      style={{
        color: onPaper ? INK : MARIGOLD,
        background: onPaper ? 'rgba(11,46,34,0.06)' : 'rgba(231,169,59,0.08)',
        borderColor: onPaper ? 'rgba(11,46,34,0.15)' : 'rgba(231,169,59,0.25)',
      }}
    >
      <motion.span
        className="inline-block w-2 h-2 rounded-full"
        style={{ background: onPaper ? DISC : MARIGOLD }}
        animate={{ scale: [1, 1.35, 1], opacity: [1, 0.5, 1] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
      />
      {label}
    </motion.div>
  );
}

// ─── Animated Stat Counter ───────────────────────────────────────────────────
const STAT_ACCENTS = ['#E7A93B', '#4DFFB0', '#3E7A8C', '#D6472C'];
const STAT_ICONS   = [Building2, Users, Globe, TrendingUp];

function StatCounter({ num, label, index }: { num: string; label: string; index: number }) {
  const ref    = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });
  const accent = STAT_ACCENTS[index % STAT_ACCENTS.length];
  const Icon   = STAT_ICONS[index % STAT_ICONS.length];

  return (
    <div
      ref={ref}
      className="group relative flex flex-col justify-center items-center text-center p-8 md:p-10 cursor-default overflow-hidden transition-all duration-500 hover:bg-white/[0.04]"
      style={{
        borderRight: index < 3 ? '1px solid rgba(255,255,255,0.08)' : 'none',
      }}
    >
      {/* Glowing radial spotlight on hover */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"
        style={{
          background: `radial-gradient(circle at 50% 40%, ${accent}22 0%, transparent 70%)`,
        }}
      />

      {/* Top animated accent bar */}
      <motion.div
        initial={{ scaleX: 0 }}
        animate={inView ? { scaleX: 1 } : {}}
        transition={{ duration: 0.6, delay: index * 0.12, ease: [0.4, 0, 0.2, 1] }}
        className="absolute top-0 left-0 right-0 h-[2px] origin-left"
        style={{ background: `linear-gradient(to right, ${accent}, transparent)` }}
      />

      {/* Icon with glowing pill backdrop */}
      <motion.div
        initial={{ opacity: 0, scale: 0.5 }}
        animate={inView ? { opacity: 1, scale: 1 } : {}}
        transition={{ duration: 0.4, delay: index * 0.12 }}
        className="mb-4 p-3 rounded-xl transition-all duration-300 group-hover:scale-110"
        style={{
          background: `${accent}15`,
          border: `1px solid ${accent}30`,
          color: accent,
        }}
      >
        <Icon className="w-6 h-6" />
      </motion.div>

      {/* Counter Number */}
      <motion.span
        initial={{ opacity: 0, y: 22 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6, delay: 0.08 + index * 0.12, ease: [0.4, 0, 0.2, 1] }}
        className="block font-mono-ibm font-black mb-2 leading-none"
        style={{
          fontSize: 'clamp(32px, 3.6vw, 52px)',
          color: PAPER,
          letterSpacing: '-0.02em',
          textShadow: `0 0 35px ${accent}44`,
        }}
      >
        {num}
      </motion.span>

      {/* Label */}
      <motion.span
        initial={{ opacity: 0 }}
        animate={inView ? { opacity: 1 } : {}}
        transition={{ duration: 0.5, delay: 0.2 + index * 0.12 }}
        className="font-mono-ibm text-xs uppercase tracking-[0.16em] font-semibold"
        style={{ color: `${accent}dd` }}
      >
        {label}
      </motion.span>

      {/* Bottom subtle indicator line */}
      <motion.div
        initial={{ opacity: 0, scale: 0 }}
        animate={inView ? { opacity: 1, scale: 1 } : {}}
        transition={{ duration: 0.5, delay: 0.3 + index * 0.12 }}
        className="absolute bottom-3 left-1/2 -translate-x-1/2 h-[2px] w-8 rounded-full opacity-40 group-hover:w-12 group-hover:opacity-90 transition-all duration-300"
        style={{ background: accent }}
      />
    </div>
  );
}

// ─── Reveal On Scroll ─────────────────────────────────────────────────────────
function Reveal({ children, className = '', style, delay = 0 }: { children: React.ReactNode; className?: string; style?: React.CSSProperties; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { el.style.opacity = '1'; el.style.transform = 'translateY(0)'; io.unobserve(el); } },
      { threshold: 0.10 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <div
      ref={ref}
      className={className}
      style={{ opacity: 0, transform: 'translateY(28px)', transition: `opacity 0.75s cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms, transform 0.75s cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms`, ...style }}
    >
      {children}
    </div>
  );
}

// ─── Feature Configurations ───────────────────────────────────────────────────
const FEATURE_HREFS = [
  ROUTES.ORGANIZATIONS,
  ROUTES.VOLUNTEERS,
  ROUTES.EMERGENCY,
  ROUTES.BLOOD_DONATION,
  ROUTES.EVENTS,
  ROUTES.AI_SMART_SEARCH,
];

const FEATURE_ICONS = [Building2, Users, ShieldAlert, Heart, Calendar, Bot];
const FEATURE_COLORS = [
  { text: '#4DFFB0', border: 'rgba(77,255,176,0.3)', bg: 'rgba(77,255,176,0.08)' },
  { text: '#3E7A8C', border: 'rgba(62,122,140,0.35)', bg: 'rgba(62,122,140,0.08)' },
  { text: '#FF5C5C', border: 'rgba(255,92,92,0.35)', bg: 'rgba(255,92,92,0.08)' },
  { text: '#D6472C', border: 'rgba(214,71,44,0.35)', bg: 'rgba(214,71,44,0.08)' },
  { text: '#E7A93B', border: 'rgba(231,169,59,0.35)', bg: 'rgba(231,169,59,0.08)' },
  { text: '#A855F7', border: 'rgba(168,85,247,0.35)', bg: 'rgba(168,85,247,0.08)' },
];

// ─── AI Tool Links Mapping ────────────────────────────────────────────────────
const AI_HREFS = [
  ROUTES.AI_VOLUNTEER_RECOMMENDATION,
  ROUTES.AI_NGO_DETECTION,
  ROUTES.AI_ANALYTICS,
  ROUTES.DISASTER_INTELLIGENCE,
  ROUTES.AI_DONATION_ADVISOR,
  ROUTES.AI_ORG_TRUST_SCORE,
];

// ─── Component ────────────────────────────────────────────────────────────────
export default function Home() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  const features = t.features.items.map((item, i) => ({
    ...item,
    Icon: FEATURE_ICONS[i],
    color: FEATURE_COLORS[i],
    href: FEATURE_HREFS[i],
  }));

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`${ROUTES.AI_SMART_SEARCH}?q=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate(ROUTES.AI_SMART_SEARCH);
    }
  };

  const handleQuickLinkClick = (text: string) => {
    setSearchQuery(text);
    navigate(`${ROUTES.AI_SMART_SEARCH}?q=${encodeURIComponent(text)}`);
  };

  return (
    <div style={{ background: INK, color: PAPER, overflowX: 'hidden' }}>

      {/* ════════════════════════════════════════════════════════════════════
          HERO SECTION — High Impact 3D Glassmorphism
      ════════════════════════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden flex flex-col justify-center min-h-[95vh] pt-32 pb-24">
        {/* Background Image with Zoom & Dark Gradient Backdrop */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-transform duration-10000 ease-out scale-105 opacity-25"
          style={{
            backgroundImage: 'url(/hero-bg.png)',
            backgroundPosition: 'center 30%',
          }}
        />

        {/* Ambient Dark Emerald + Radial Orbs */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#061B14]/90 via-[#0B2E22]/95 to-[#061912]" />
        <div className="absolute top-1/3 left-1/4 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-[450px] h-[450px] bg-amber-500/10 rounded-full blur-[140px] pointer-events-none" />

        {/* Interactive 3D Three.js Particle Background */}
        <ThreeBg />

        {/* Content Box */}
        <div className="relative z-10 mx-auto w-full px-6 md:px-8 max-w-[1280px]">
          <div className="flex flex-col items-start max-w-3xl">

            {/* Live Platform Badge */}
            <motion.div
              initial={{ opacity: 0, y: -16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-white/[0.07] border border-white/15 backdrop-blur-xl mb-6 text-xs font-mono-ibm font-medium text-amber-300 shadow-xl"
            >
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-400" />
              </span>
              <span>{t.hero.badge || 'AI-Powered Civic Ecosystem'}</span>
              <span className="text-white/30">•</span>
              <span className="text-emerald-300 font-semibold">64 Districts Connected</span>
            </motion.div>

            {/* Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="font-fraunces mb-6 text-4xl sm:text-6xl lg:text-7xl leading-[1.06] tracking-tight font-bold text-white drop-shadow-2xl"
            >
              {t.hero.headline1}<br />
              {t.hero.headline2}<br />
              {t.hero.headline3}{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-amber-100 to-white italic font-semibold drop-shadow-[0_2px_12px_rgba(251,191,36,0.35)]">
                {t.hero.headlineEnd}
              </span>
            </motion.h1>

            {/* Sub-text */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.22 }}
              className="mb-8 text-base sm:text-lg leading-relaxed text-emerald-100/75 max-w-2xl drop-shadow"
            >
              {t.hero.sub}
            </motion.p>

            {/* ─── Interactive AI Quick Search Module ─────────────────────── */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.32 }}
              className="w-full mb-8"
            >
              <form
                onSubmit={handleSearchSubmit}
                className="relative flex items-center w-full max-w-2xl rounded-2xl bg-white/[0.08] backdrop-blur-2xl border border-white/20 p-2 shadow-2xl transition-all duration-300 focus-within:border-amber-400/60 focus-within:bg-white/[0.12] focus-within:ring-4 focus-within:ring-amber-400/10 group"
              >
                <div className="pl-3.5 pr-2 text-amber-300 flex items-center">
                  <Sparkles className="w-5 h-5 animate-pulse" />
                </div>

                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t.hero.searchPlaceholder || 'Describe what you need in Bangla or English...'}
                  className="w-full bg-transparent border-0 outline-none px-2 py-3 text-sm sm:text-base text-white placeholder:text-white/45 font-sans"
                />

                <button
                  type="submit"
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-emerald-950 font-semibold text-sm transition-all duration-300 shadow-lg hover:shadow-amber-500/25 shrink-0 group-hover:scale-[1.02]"
                >
                  <Search className="w-4 h-4" />
                  <span>{t.hero.askAI || 'Ask AI'}</span>
                </button>
              </form>

              {/* Quick Suggestion Pills */}
              {t.hero.quickLinks && t.hero.quickLinks.length > 0 && (
                <div className="flex flex-wrap items-center gap-2 mt-3.5 text-xs text-white/60">
                  <span className="font-mono-ibm text-[11px] uppercase tracking-wider text-amber-400/80 mr-1 flex items-center gap-1">
                    <Zap className="w-3 h-3" /> Quick:
                  </span>
                  {t.hero.quickLinks.map((linkText: string, idx: number) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleQuickLinkClick(linkText)}
                      className="px-3 py-1 rounded-full bg-white/[0.06] hover:bg-white/[0.14] border border-white/10 hover:border-amber-400/40 text-emerald-100/80 hover:text-white transition-all duration-200 text-left"
                    >
                      {linkText}
                    </button>
                  ))}
                </div>
              )}
            </motion.div>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.42 }}
              className="flex flex-wrap items-center gap-4"
            >
              <Link
                to={ROUTES.EMERGENCY}
                className="inline-flex items-center gap-2.5 px-8 py-4 text-sm font-semibold rounded-xl transition-all duration-300 hover:-translate-y-0.5 bg-gradient-to-r from-red-600 to-red-700 text-white shadow-xl shadow-red-600/30 hover:shadow-red-600/50 hover:ring-2 hover:ring-red-400/30"
              >
                <ShieldAlert className="w-4 h-4 animate-bounce" />
                {t.hero.ctaEmergency}
              </Link>
              <Link
                to={ROUTES.ORGANIZATIONS}
                className="inline-flex items-center gap-2.5 px-8 py-4 text-sm font-semibold rounded-xl transition-all duration-300 hover:-translate-y-0.5 bg-white/10 hover:bg-white/20 text-white border border-white/20 hover:border-white/40 backdrop-blur-md shadow-lg"
              >
                <Building2 className="w-4 h-4" />
                {t.hero.ctaBrowse}
              </Link>
            </motion.div>

          </div>
        </div>
      </section>

      {/* pulse keyframe */}
      <style>{`@keyframes sheba-pulse{0%,100%{opacity:1}50%{opacity:.35}}`}</style>

      {/* ════════════════════════════════════════════════════════════════════
          LIVE NEWS & DISASTER TICKER
      ════════════════════════════════════════════════════════════════════ */}
      <div
        className="relative overflow-hidden flex items-center h-12 z-20"
        style={{
          background: 'linear-gradient(90deg, #B93821 0%, #D6472C 50%, #B93821 100%)',
          borderTop: '1px solid rgba(255,255,255,0.18)',
          borderBottom: '1px solid rgba(0,0,0,0.3)',
          boxShadow: '0 8px 24px rgba(0,0,0,0.35)',
        }}
      >
        {/* LIVE Badge */}
        <div className="shrink-0 flex items-center gap-2 px-5 bg-black/35 h-full z-10 border-r border-white/20 backdrop-blur-md">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-80" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-white" />
          </span>
          <span className="font-mono-ibm text-xs font-bold tracking-widest text-white uppercase">
            LIVE GRID
          </span>
        </div>

        {/* Scrolling Ticker */}
        <div className="flex-1 overflow-hidden relative">
          <style>{`
            @keyframes shebaTickerScroll {
              0%   { transform: translateX(0); }
              100% { transform: translateX(-50%); }
            }
            .sheba-ticker-inner {
              display: flex;
              align-items: center;
              white-space: nowrap;
              animation: shebaTickerScroll 38s linear infinite;
              will-change: transform;
            }
            .sheba-ticker-inner:hover { animation-play-state: paused; }
            .sheba-ticker-sep {
              display: inline-block;
              margin: 0 20px;
              color: rgba(255,255,255,0.45);
              font-size: 12px;
            }
          `}</style>

          <div className="sheba-ticker-inner">
            {[1, 2].map(copy => (
              <span key={copy} className="inline-flex items-center">
                {[
                  { emoji: '🩸', text: 'URGENT: O- blood needed at Dhaka Medical College Hospital — contact +880 1711-000005' },
                  { emoji: '🌊', text: 'Flood relief operations active in Sylhet — 47 volunteers deployed, 500 families reached' },
                  { emoji: '🌳', text: 'Green Bangladesh milestone: 1 million trees planted across Sundarbans buffer zone' },
                  { emoji: '🏥', text: 'Free health camp this weekend in Rajshahi — volunteer doctors and nurses needed' },
                  { emoji: '📢', text: 'ShebaBD now covers 64 districts — register your NGO for free AI-powered visibility' },
                  { emoji: '💉', text: 'Blood donation camp at Chittagong University — all blood groups welcome' },
                  { emoji: '⚠️', text: 'Cyclone alert: coastal NGOs activate emergency protocols — real-time map active' },
                  { emoji: '🤝', text: '18,000+ volunteers and counting — join Bangladesh\'s largest social impact platform' },
                ].map(({ emoji, text }, i) => (
                  <span key={i} className="inline-flex items-center">
                    <span className="text-white text-xs sm:text-sm font-medium tracking-wide px-1">
                      <span className="mr-2">{emoji}</span>
                      {text}
                    </span>
                    <span className="sheba-ticker-sep">◆</span>
                  </span>
                ))}
              </span>
            ))}
          </div>
        </div>

        {/* Right Fade Gradient */}
        <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-[#D6472C] to-transparent pointer-events-none z-10" />
      </div>

      {/* ════════════════════════════════════════════════════════════════════
          LEDGER STATS — Modern Metallic Glass Panel
      ════════════════════════════════════════════════════════════════════ */}
      <section className="px-6 md:px-8 py-24 md:py-28 relative">
        <Reveal>
          <div
            className="mx-auto rounded-2xl overflow-hidden shadow-2xl border border-white/10 backdrop-blur-2xl"
            style={{
              maxWidth: 1180,
              background: 'linear-gradient(135deg, rgba(247,241,225,0.96) 0%, rgba(235,227,205,0.92) 100%)',
              color: INK,
            }}
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-black/10">
              {t.stats.map(({ num, label }, i) => (
                <StatCounter key={label} num={num} label={label} index={i} />
              ))}
            </div>
          </div>
        </Reveal>
      </section>

      {/* ════════════════════════════════════════════════════════════════════
          CORE FEATURES — 3D Interactive Cards
      ════════════════════════════════════════════════════════════════════ */}
      <section className="px-6 md:px-8 pb-28 md:pb-32">
        <div className="mx-auto" style={{ maxWidth: 1180 }}>
          <Reveal>
            <div className="text-center mb-16 max-w-2xl mx-auto">
              <Eyebrow label={t.features.eyebrow} />
              <h2 className="font-fraunces mt-5 mb-4 text-3xl sm:text-4xl lg:text-5xl leading-tight font-semibold text-white">
                {t.features.heading}
              </h2>
              <p className="text-emerald-100/70 text-base md:text-lg leading-relaxed">{t.features.sub}</p>
            </div>
          </Reveal>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map(({ Icon, title, desc, color, href }, i) => (
              <Reveal key={title} delay={i * 65}>
                <Link
                  to={href}
                  className="group relative flex flex-col p-8 h-full rounded-2xl border transition-all duration-500 overflow-hidden"
                  style={{
                    background: 'rgba(11,46,34,0.65)',
                    backdropFilter: 'blur(16px)',
                    borderColor: 'rgba(255,255,255,0.1)',
                  }}
                  onMouseEnter={e => {
                    const el = e.currentTarget as HTMLElement;
                    el.style.background = 'rgba(15,58,43,0.85)';
                    el.style.borderColor = color.border;
                    el.style.transform = 'translateY(-6px)';
                    el.style.boxShadow = `0 20px 40px rgba(0,0,0,0.4), 0 0 20px ${color.bg}`;
                  }}
                  onMouseLeave={e => {
                    const el = e.currentTarget as HTMLElement;
                    el.style.background = 'rgba(11,46,34,0.65)';
                    el.style.borderColor = 'rgba(255,255,255,0.1)';
                    el.style.transform = 'translateY(0)';
                    el.style.boxShadow = 'none';
                  }}
                >
                  {/* Top glowing line sweep on hover */}
                  <div
                    className="absolute top-0 left-0 right-0 h-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                    style={{ background: `linear-gradient(90deg, transparent, ${color.text}, transparent)` }}
                  />

                  {/* Icon Box */}
                  <div className="relative mb-6">
                    <div
                      className="w-14 h-14 rounded-2xl flex items-center justify-center border transition-all duration-500 group-hover:scale-110"
                      style={{
                        background: color.bg,
                        borderColor: color.border,
                        color: color.text,
                      }}
                    >
                      <Icon className="w-7 h-7" />
                    </div>
                  </div>

                  <h3 className="font-fraunces mb-3 text-xl font-semibold text-white leading-snug group-hover:text-amber-300 transition-colors duration-300">
                    {title}
                  </h3>
                  <p className="text-sm leading-relaxed text-emerald-100/65 group-hover:text-emerald-100/85 transition-colors duration-300 flex-1">
                    {desc}
                  </p>

                  {/* Action Link Footer */}
                  <div className="mt-6 flex items-center gap-2 font-mono-ibm text-xs tracking-wider text-amber-300/80 group-hover:text-amber-300 transition-all duration-300">
                    <span>Explore Feature</span>
                    <ArrowRight className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-1.5" />
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════════════
          AI SECTION — High-Tech Intelligence Grid
      ════════════════════════════════════════════════════════════════════ */}
      <section
        className="relative px-6 md:px-8 py-28 md:py-36 overflow-hidden border-y border-emerald-900/30"
        style={{ background: 'linear-gradient(160deg, #072018 0%, #0A2B20 50%, #061912 100%)' }}
      >
        {/* Glowing Orbs Background */}
        <div className="absolute top-1/4 -left-40 w-96 h-96 rounded-full pointer-events-none bg-emerald-500/10 blur-[130px]" />
        <div className="absolute bottom-1/4 -right-40 w-96 h-96 rounded-full pointer-events-none bg-amber-500/10 blur-[130px]" />

        <div className="mx-auto relative z-10" style={{ maxWidth: 1180 }}>
          <Reveal>
            <div className="text-center mb-16 max-w-2xl mx-auto">
              <motion.span
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4 }}
                className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full font-mono-ibm text-xs uppercase tracking-widest font-semibold border border-amber-400/30 bg-amber-400/10 text-amber-300 shadow-lg"
              >
                <Bot className="w-4 h-4 animate-spin-slow" />
                {t.aiSection.eyebrow}
              </motion.span>

              <h2 className="font-fraunces mt-6 mb-4 text-3xl sm:text-4xl lg:text-5xl leading-tight font-semibold text-white">
                {t.aiSection.heading}
              </h2>
              <p className="text-emerald-100/70 text-base md:text-lg leading-relaxed">{t.aiSection.sub}</p>
            </div>
          </Reveal>

          {/* AI Tool Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {t.aiSection.items.map(({ num, title, desc }, i) => {
              const aiHref = AI_HREFS[i] || ROUTES.AI_SMART_SEARCH;
              return (
                <Reveal key={num} delay={i * 65}>
                  <Link
                    to={aiHref}
                    className="group relative p-7 rounded-2xl border transition-all duration-400 flex flex-col justify-between h-full overflow-hidden"
                    style={{
                      background: 'rgba(11,46,34,0.55)',
                      backdropFilter: 'blur(12px)',
                      borderColor: 'rgba(231,169,59,0.15)',
                    }}
                    onMouseEnter={e => {
                      const el = e.currentTarget as HTMLElement;
                      el.style.borderColor = 'rgba(231,169,59,0.45)';
                      el.style.background = 'rgba(15,58,43,0.85)';
                      el.style.transform = 'translateY(-4px)';
                      el.style.boxShadow = '0 16px 40px rgba(0,0,0,0.35), 0 0 15px rgba(231,169,59,0.15)';
                    }}
                    onMouseLeave={e => {
                      const el = e.currentTarget as HTMLElement;
                      el.style.borderColor = 'rgba(231,169,59,0.15)';
                      el.style.background = 'rgba(11,46,34,0.55)';
                      el.style.transform = 'translateY(0)';
                      el.style.boxShadow = 'none';
                    }}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <span className="font-mono-ibm text-xs font-bold px-3 py-1 rounded-full bg-amber-400/10 border border-amber-400/30 text-amber-300 tracking-wider">
                          AI MODULE {num}
                        </span>
                        <Sparkles className="w-4 h-4 text-amber-300/60 group-hover:text-amber-300 transition-colors" />
                      </div>

                      <h3 className="font-fraunces mb-2.5 text-lg font-semibold text-white leading-snug group-hover:text-amber-200 transition-colors">
                        {title}
                      </h3>
                      <p className="text-xs sm:text-sm text-emerald-100/65 leading-relaxed group-hover:text-emerald-100/85 transition-colors">
                        {desc}
                      </p>
                    </div>

                    <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between font-mono-ibm text-xs text-amber-300/90 font-medium">
                      <span>Launch AI Tool</span>
                      <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                    </div>
                  </Link>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════════════
          GLOBAL NETWORK & MAP — Tactical HUD Container
      ════════════════════════════════════════════════════════════════════ */}
      <section className="px-6 md:px-8 py-28 md:py-32">
        <div className="mx-auto" style={{ maxWidth: 1180 }}>
          <Reveal>
            <div className="text-center mb-16 max-w-2xl mx-auto">
              <Eyebrow label={t.map.eyebrow} />
              <h2 className="font-fraunces mt-5 mb-4 text-3xl sm:text-4xl lg:text-5xl leading-tight font-semibold text-white">
                {t.map.heading}
              </h2>
              <p className="text-emerald-100/70 text-base md:text-lg leading-relaxed">{t.map.sub}</p>
            </div>
          </Reveal>

          <Reveal delay={100}>
            <div
              className="relative rounded-2xl overflow-hidden border border-emerald-500/25 shadow-2xl backdrop-blur-2xl"
              style={{ background: 'rgba(7,25,18,0.85)', boxShadow: '0 30px 70px rgba(0,0,0,0.5)' }}
            >
              {/* Tactical Corner Accents */}
              <div className="absolute top-0 left-0 w-12 h-12 border-t-2 border-l-2 border-amber-400/50 rounded-tl-2xl pointer-events-none z-10" />
              <div className="absolute top-0 right-0 w-12 h-12 border-t-2 border-r-2 border-amber-400/50 rounded-tr-2xl pointer-events-none z-10" />
              <div className="absolute bottom-0 left-0 w-12 h-12 border-b-2 border-l-2 border-amber-400/30 rounded-bl-2xl pointer-events-none z-10" />
              <div className="absolute bottom-0 right-0 w-12 h-12 border-b-2 border-r-2 border-amber-400/30 rounded-br-2xl pointer-events-none z-10" />

              {/* Status Header Bar */}
              <div className="flex items-center justify-between px-6 py-3.5 border-b border-emerald-900/40 bg-emerald-950/50">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400/80" />
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400/80" />
                </div>
                <div className="font-mono-ibm text-xs tracking-widest uppercase text-emerald-100/50 flex items-center gap-2">
                  <Globe className="w-3.5 h-3.5 text-amber-400" />
                  <span>ShebaBD Global Relief Grid</span>
                </div>
                <div className="flex items-center gap-2 font-mono-ibm text-xs text-emerald-400 font-medium">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>ACTIVE</span>
                </div>
              </div>

              {/* Interactive World Map */}
              <div className="p-4 md:p-8">
                <WorldMap
                  lineColor={DISC}
                  dots={[
                    { start: { lat: 23.8103, lng: 90.4125, label: 'Dhaka' },      end: { lat: 51.5074, lng: -0.1278,  label: 'London' } },
                    { start: { lat: 22.3569, lng: 91.7832, label: 'Chittagong' }, end: { lat: 40.7128, lng: -74.006,  label: 'New York' } },
                    { start: { lat: 24.8949, lng: 91.8687, label: 'Sylhet' },     end: { lat: 25.2854, lng: 51.531,   label: 'Doha' } },
                    { start: { lat: 23.8103, lng: 90.4125, label: 'Dhaka' },      end: { lat: 46.2044, lng: 6.1432,   label: 'Geneva' } },
                    { start: { lat: 22.3569, lng: 91.7832, label: 'Chittagong' }, end: { lat: 3.139,   lng: 101.6869, label: 'KL' } },
                    { start: { lat: 24.3745, lng: 88.6042, label: 'Rajshahi' },   end: { lat: -1.2921, lng: 36.8219,  label: 'Nairobi' } },
                  ]}
                />
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════════════
          TESTIMONIALS — Warm Paper Elegance
      ════════════════════════════════════════════════════════════════════ */}
      <section className="px-6 md:px-8 py-28 md:py-32" style={{ background: PAPER, color: INK }}>
        <div className="mx-auto" style={{ maxWidth: 1180 }}>
          <Reveal>
            <div className="text-center mb-16 max-w-2xl mx-auto">
              <Eyebrow label={t.testimonials.eyebrow} onPaper />
              <h2 className="font-fraunces mt-5 text-3xl sm:text-4xl lg:text-5xl font-semibold text-emerald-950">
                {t.testimonials.heading}
              </h2>
            </div>
          </Reveal>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {t.testimonials.items.map(({ avatar, name, role, quote }, i) => (
              <Reveal key={name} delay={i * 80}>
                <div
                  className="group flex flex-col justify-between p-8 rounded-2xl h-full relative overflow-hidden border border-emerald-950/10 transition-all duration-400 shadow-md"
                  style={{ background: 'rgba(255,255,255,0.7)', backdropFilter: 'blur(10px)' }}
                  onMouseEnter={e => {
                    const el = e.currentTarget as HTMLElement;
                    el.style.background = '#FFFFFF';
                    el.style.transform = 'translateY(-6px)';
                    el.style.boxShadow = '0 20px 40px rgba(11,46,34,0.12)';
                  }}
                  onMouseLeave={e => {
                    const el = e.currentTarget as HTMLElement;
                    el.style.background = 'rgba(255,255,255,0.7)';
                    el.style.transform = 'translateY(0)';
                    el.style.boxShadow = '0 4px 16px rgba(11,46,34,0.06)';
                  }}
                >
                  <div className="relative z-10">
                    {/* Star Rating */}
                    <div className="flex gap-1 mb-4 text-amber-500">
                      {[...Array(5)].map((_, s) => (
                        <span key={s} className="text-sm">★</span>
                      ))}
                    </div>

                    <p className="font-fraunces text-base leading-relaxed italic text-emerald-950 mb-6">
                      "{quote}"
                    </p>
                  </div>

                  <div className="flex items-center gap-3.5 pt-4 border-t border-emerald-950/10 relative z-10">
                    <div
                      className="w-11 h-11 rounded-full flex items-center justify-center font-mono-ibm text-xs font-bold text-white shrink-0 shadow"
                      style={{ background: 'linear-gradient(135deg, #0B2E22, #1A5C42)' }}
                    >
                      {avatar}
                    </div>
                    <div>
                      <div className="text-sm font-bold text-emerald-950 flex items-center gap-1.5">
                        <span>{name}</span>
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 inline-block" />
                      </div>
                      <div className="text-xs font-medium" style={{ color: MUTED_D }}>{role}</div>
                    </div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════════════
          CTA BAND — Modern High Impact Banner
      ════════════════════════════════════════════════════════════════════ */}
      <section
        className="relative text-center overflow-hidden px-6 md:px-8 py-28 md:py-36 border-t border-emerald-900/40"
        style={{ background: 'linear-gradient(160deg, #072018 0%, #051610 60%, #030D09 100%)' }}
      >
        {/* Glow Effects */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full pointer-events-none bg-red-600/10 blur-[160px]" />
        <div className="absolute right-0 top-0 w-96 h-96 rounded-full pointer-events-none bg-amber-500/10 blur-[150px]" />

        <Reveal className="relative z-10 mx-auto max-w-3xl">
          <motion.h2
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.65 }}
            className="font-fraunces mb-6 text-3xl sm:text-5xl lg:text-6xl font-semibold leading-tight text-white"
          >
            {t.cta.heading}
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.55, delay: 0.12 }}
            className="mb-10 text-emerald-100/70 text-base sm:text-lg leading-relaxed max-w-xl mx-auto"
          >
            {t.cta.sub}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.22 }}
            className="flex flex-wrap justify-center items-center gap-4"
          >
            <Link
              to={ROUTES.VOLUNTEERS}
              className="inline-flex items-center gap-2.5 px-9 py-4 text-sm font-semibold rounded-xl transition-all duration-300 hover:-translate-y-0.5 shadow-2xl bg-gradient-to-r from-amber-300 via-amber-200 to-amber-400 text-emerald-950 hover:shadow-amber-300/30"
            >
              <span>{t.cta.getStarted}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              to={ROUTES.DONATE}
              className="inline-flex items-center gap-2.5 px-9 py-4 text-sm font-semibold rounded-xl transition-all duration-300 hover:-translate-y-0.5 bg-red-600/20 border border-red-500/40 text-red-200 hover:bg-red-600/30 hover:border-red-500/60 shadow-lg"
            >
              <Heart className="w-4 h-4 text-red-400 fill-current" />
              <span>{t.cta.donate}</span>
            </Link>
          </motion.div>

          {/* Platform Security Badge */}
          <div className="mt-12 inline-flex items-center gap-6 font-mono-ibm text-xs text-emerald-100/50">
            <span className="flex items-center gap-1.5"><ShieldCheck className="w-4 h-4 text-emerald-400" /> 100% Transparent</span>
            <span>•</span>
            <span className="flex items-center gap-1.5"><Award className="w-4 h-4 text-amber-400" /> Verified NGOs</span>
            <span>•</span>
            <span className="flex items-center gap-1.5"><Flame className="w-4 h-4 text-red-400" /> Instant Response Grid</span>
          </div>
        </Reveal>
      </section>

    </div>
  );
}



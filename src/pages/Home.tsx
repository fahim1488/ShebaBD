import { useEffect, useRef, useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence, useInView } from 'framer-motion';
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
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Pause,
  Play,
  Eye,
  Camera,
  Layers,
} from 'lucide-react';
import { WorldMap } from '@/components/ui/map/WorldMap';
import { ROUTES } from '@/constants/routes';
import { useLanguage } from '@/hooks/useLanguage';

// ─── Design Tokens ───────────────────────────────────────────────────────────
const INK      = '#0B2E22';
const PAPER    = '#F7F1E1';
const DISC     = '#D6472C';
const MARIGOLD = '#E7A93B';
const SKY      = '#3E7A8C';
const MUTED_L  = 'rgba(247,241,225,0.75)';
const MUTED_D  = 'rgba(22,36,29,0.75)';

// ─── Hero Slide Data ─────────────────────────────────────────────────────────
const HERO_SLIDES = [
  {
    id: 1,
    image: '/hero-slide1.jpg',
    tag: 'Disaster Relief & Emergency Response',
    title: 'Emergency Flood Relief Across 64 Districts',
    subtitle: 'Deploying immediate rescue boats, dry food packs, and clean drinking water to flood-affected communities with live GPS tracking.',
    primaryCta: { label: 'Support Emergency Relief', href: ROUTES.DONATE },
    secondaryCta: { label: 'View Emergency Grid', href: ROUTES.EMERGENCY },
  },
  {
    id: 2,
    image: '/hero-slide2.jpg',
    tag: 'Community Volunteering & Aid',
    title: 'Mobilizing 18,000+ Verified Youth Volunteers',
    subtitle: 'Connecting passionate individuals with registered NGOs and charity initiatives for community feeding, relief packing, and social action.',
    primaryCta: { label: 'Join as Volunteer', href: ROUTES.VOLUNTEERS },
    secondaryCta: { label: 'Find Opportunities', href: ROUTES.ORGANIZATIONS },
  },
  {
    id: 3,
    image: '/hero-slide3.jpg',
    tag: 'Medical Camps & Blood Drives',
    title: 'Instant AI-Powered Blood Donor Matching',
    subtitle: 'Connecting critical hospital patients with compatible nearby blood donors in minutes. Free medical checkups and emergency dispatch.',
    primaryCta: { label: 'Find Blood Donor', href: ROUTES.BLOOD_DONATION },
    secondaryCta: { label: 'Register as Donor', href: ROUTES.BLOOD_DONATION },
  },
  {
    id: 4,
    image: '/hero-slide4.jpg',
    tag: 'Education & Child Empowerment',
    title: 'Empowering the Next Generation of Bangladesh',
    subtitle: 'Supporting underprivileged children with educational kits, digital learning classrooms, and nutrition programs across rural schools.',
    primaryCta: { label: 'Sponsor a Child', href: ROUTES.DONATE },
    secondaryCta: { label: 'Explore Campaigns', href: ROUTES.EVENTS },
  },
  {
    id: 5,
    image: '/hero-slide5.jpg',
    tag: 'Emergency Rescue & Healthcare',
    title: 'Transparent Civic Ecosystem Powered by AI',
    subtitle: 'Real-time donation tracking, verified NGO trust ratings, and 24/7 automated emergency alerts across all 8 divisions.',
    primaryCta: { label: 'Explore Directory', href: ROUTES.ORGANIZATIONS },
    secondaryCta: { label: 'AI Smart Search', href: ROUTES.AI_SMART_SEARCH },
  },
];

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
        background: onPaper ? 'rgba(11,46,34,0.06)' : 'rgba(231,169,59,0.14)',
        borderColor: onPaper ? 'rgba(11,46,34,0.15)' : 'rgba(231,169,59,0.35)',
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
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"
        style={{
          background: `radial-gradient(circle at 50% 40%, ${accent}22 0%, transparent 70%)`,
        }}
      />
      <motion.div
        initial={{ scaleX: 0 }}
        animate={inView ? { scaleX: 1 } : {}}
        transition={{ duration: 0.6, delay: index * 0.12, ease: [0.4, 0, 0.2, 1] }}
        className="absolute top-0 left-0 right-0 h-[2px] origin-left"
        style={{ background: `linear-gradient(to right, ${accent}, transparent)` }}
      />
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
      <motion.span
        initial={{ opacity: 0 }}
        animate={inView ? { opacity: 1 } : {}}
        transition={{ duration: 0.5, delay: 0.2 + index * 0.12 }}
        className="font-mono-ibm text-xs uppercase tracking-[0.16em] font-semibold"
        style={{ color: `${accent}dd` }}
      >
        {label}
      </motion.span>
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

const FEATURE_TAGS = ['Discovery', 'Volunteering', 'Emergency', 'Healthcare', 'Events', 'Artificial Intelligence'];

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

export default function Home() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  
  // ─── Hero Picture Slide Bar State ──────────────────────────────────────────
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlay, setIsAutoPlay] = useState(true);

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length);
  }, []);

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + HERO_SLIDES.length) % HERO_SLIDES.length);
  }, []);

  useEffect(() => {
    if (!isAutoPlay) return;
    const timer = setInterval(() => {
      nextSlide();
    }, 5000);
    return () => clearInterval(timer);
  }, [isAutoPlay, nextSlide]);

  const features = t.features.items.map((item, i) => ({
    ...item,
    tag: FEATURE_TAGS[i] || 'Service',
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

  const slide = HERO_SLIDES[currentSlide];

  return (
    <div style={{ background: INK, color: PAPER, overflowX: 'hidden' }}>

      {/* ════════════════════════════════════════════════════════════════════
          HERO PICTURE SLIDE BAR / CAROUSEL — CRYSTAL CLEAR VISUALS
      ════════════════════════════════════════════════════════════════════ */}
      <section 
        className="relative overflow-hidden min-h-[92vh] flex items-center pt-20 pb-16"
        onMouseEnter={() => setIsAutoPlay(false)}
        onMouseLeave={() => setIsAutoPlay(true)}
      >
        {/* Full-bleed Crystal Clear Photography Background with smooth animation */}
        <AnimatePresence mode="wait">
          <motion.div
            key={slide.id}
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: `url(${slide.image})`,
              backgroundPosition: 'center 40%',
            }}
          />
        </AnimatePresence>

        {/* Crisp & clean bottom vignette: leaves 80%+ of the photo bright & unobstructed */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0B2E22] via-black/35 to-black/20" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-transparent to-black/40" />

        {/* Slide Content Box */}
        <div className="relative z-10 mx-auto w-full px-6 md:px-8 max-w-[1280px]">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Left High-Legibility Glassmorphic Information Card */}
            <div className="lg:col-span-7">
              <div className="p-7 sm:p-9 rounded-3xl bg-[#061C14]/80 backdrop-blur-2xl border border-white/20 shadow-[0_20px_60px_rgba(0,0,0,0.6)]">
                
                {/* Badge */}
                <AnimatePresence mode="wait">
                  <motion.div
                    key={`badge-${slide.id}`}
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 8 }}
                    transition={{ duration: 0.3 }}
                    className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-400/20 border border-amber-400/40 text-amber-300 text-xs font-mono-ibm font-semibold mb-4"
                  >
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
                    </span>
                    <span>{slide.tag}</span>
                  </motion.div>
                </AnimatePresence>

                {/* Title */}
                <AnimatePresence mode="wait">
                  <motion.h1
                    key={`title-${slide.id}`}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -12 }}
                    transition={{ duration: 0.45, delay: 0.05 }}
                    className="font-fraunces mb-4 text-3xl sm:text-4xl lg:text-5xl leading-[1.12] tracking-tight font-bold text-white drop-shadow"
                  >
                    {slide.title}
                  </motion.h1>
                </AnimatePresence>

                {/* Subtitle */}
                <AnimatePresence mode="wait">
                  <motion.p
                    key={`subtitle-${slide.id}`}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.4, delay: 0.1 }}
                    className="mb-6 text-sm sm:text-base leading-relaxed text-emerald-100/90"
                  >
                    {slide.subtitle}
                  </motion.p>
                </AnimatePresence>

                {/* Action Buttons */}
                <AnimatePresence mode="wait">
                  <motion.div
                    key={`actions-${slide.id}`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.35, delay: 0.15 }}
                    className="flex flex-wrap items-center gap-3.5 mb-6"
                  >
                    <Link
                      to={slide.primaryCta.href}
                      className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm transition-all duration-300 bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 text-emerald-950 shadow-xl hover:shadow-amber-400/30 hover:-translate-y-0.5"
                    >
                      <span>{slide.primaryCta.label}</span>
                      <ArrowRight className="w-4 h-4" />
                    </Link>

                    <Link
                      to={slide.secondaryCta.href}
                      className="inline-flex items-center gap-2 px-5 py-3 rounded-xl font-semibold text-sm transition-all duration-300 bg-white/10 hover:bg-white/20 border border-white/25 text-white backdrop-blur-md hover:-translate-y-0.5"
                    >
                      <span>{slide.secondaryCta.label}</span>
                    </Link>
                  </motion.div>
                </AnimatePresence>

                {/* AI Search Bar */}
                <form
                  onSubmit={handleSearchSubmit}
                  className="relative flex items-center w-full rounded-xl bg-black/40 border border-white/25 p-1.5 transition-all duration-300 focus-within:border-amber-400/80 focus-within:bg-black/60 focus-within:ring-2 focus-within:ring-amber-400/20"
                >
                  <div className="pl-3 pr-2 text-amber-300 flex items-center">
                    <Sparkles className="w-4 h-4 animate-pulse" />
                  </div>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={t.hero.searchPlaceholder || "Search blood donors, volunteers, emergency, NGOs..."}
                    className="w-full bg-transparent border-0 outline-none px-2 py-2 text-xs sm:text-sm text-white placeholder:text-white/50 font-sans"
                  />
                  <button
                    type="submit"
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-amber-400 hover:bg-amber-300 text-emerald-950 font-semibold text-xs sm:text-sm transition-all duration-200 shrink-0"
                  >
                    <Search className="w-3.5 h-3.5" />
                    <span>{t.hero.askAI || 'Search'}</span>
                  </button>
                </form>

                {/* Quick links */}
                {t.hero.quickLinks && t.hero.quickLinks.length > 0 && (
                  <div className="flex flex-wrap items-center gap-1.5 mt-3 text-[11px] text-white/70">
                    <span className="font-mono-ibm uppercase tracking-wider text-amber-300 flex items-center gap-1">
                      <Zap className="w-3 h-3" /> Quick:
                    </span>
                    {t.hero.quickLinks.map((linkText: string, idx: number) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleQuickLinkClick(linkText)}
                        className="px-2 py-0.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/15 text-emerald-100 transition-all duration-150"
                      >
                        {linkText}
                      </button>
                    ))}
                  </div>
                )}

              </div>
            </div>

            {/* Right Interactive Photo Navigation Panel */}
            <div className="lg:col-span-5 hidden lg:flex flex-col gap-3">
              <div className="p-4 rounded-3xl bg-black/60 border border-white/20 backdrop-blur-2xl shadow-2xl">
                <div className="flex items-center justify-between mb-3 text-xs font-mono-ibm text-emerald-100/90 px-1">
                  <span className="flex items-center gap-1.5">
                    <Camera className="w-4 h-4 text-amber-300" />
                    Photo Slides ({currentSlide + 1} of {HERO_SLIDES.length})
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsAutoPlay(!isAutoPlay)}
                    className="flex items-center gap-1 px-2 py-1 rounded bg-white/10 hover:bg-white/20 text-white text-[11px] transition-colors"
                  >
                    {isAutoPlay ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                    <span>{isAutoPlay ? 'Pause' : 'Auto-Play'}</span>
                  </button>
                </div>

                <div className="flex flex-col gap-2.5">
                  {HERO_SLIDES.map((s, idx) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => setCurrentSlide(idx)}
                      className={`group flex items-center gap-3.5 p-2 rounded-2xl text-left transition-all duration-300 border ${
                        idx === currentSlide
                          ? 'bg-amber-400/20 border-amber-400 shadow-lg translate-x-1.5'
                          : 'bg-white/[0.04] border-white/10 hover:bg-white/[0.12] hover:border-white/25'
                      }`}
                    >
                      <div className="relative w-16 h-12 rounded-xl overflow-hidden shrink-0 border border-white/30 shadow">
                        <img
                          src={s.image}
                          alt={s.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                        {idx === currentSlide && (
                          <div className="absolute inset-0 bg-amber-400/20 border-2 border-amber-400 rounded-xl" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className={`text-xs font-semibold truncate ${idx === currentSlide ? 'text-amber-300' : 'text-white'}`}>
                          {s.tag}
                        </div>
                        <div className="text-[11px] text-white/65 truncate">
                          {s.title}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

          </div>

          {/* Carousel Slide Bar Controls */}
          <div className="flex items-center justify-between mt-8 pt-5 border-t border-white/15">
            {/* Slide Indicator Bar */}
            <div className="flex items-center gap-2.5">
              {HERO_SLIDES.map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setCurrentSlide(idx)}
                  className={`h-2.5 rounded-full transition-all duration-300 ${
                    idx === currentSlide
                      ? 'w-10 bg-amber-400 shadow-[0_0_15px_rgba(251,191,36,0.9)]'
                      : 'w-2.5 bg-white/35 hover:bg-white/70'
                  }`}
                  aria-label={`Go to slide ${idx + 1}`}
                />
              ))}
            </div>

            {/* Navigation Arrows */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={prevSlide}
                className="p-3 rounded-xl bg-black/40 hover:bg-black/70 border border-white/20 text-white transition-all duration-200 active:scale-95 shadow-lg backdrop-blur-md"
                aria-label="Previous Slide"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                type="button"
                onClick={nextSlide}
                className="p-3 rounded-xl bg-black/40 hover:bg-black/70 border border-white/20 text-white transition-all duration-200 active:scale-95 shadow-lg backdrop-blur-md"
                aria-label="Next Slide"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>

        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════════════
          LIVE IMPACT METRICS BAR
      ════════════════════════════════════════════════════════════════════ */}
      <section className="relative z-10 -mt-2 px-6 md:px-8">
        <div
          className="mx-auto rounded-2xl overflow-hidden border backdrop-blur-2xl shadow-2xl"
          style={{
            maxWidth: 1280,
            background: 'rgba(7, 32, 24, 0.88)',
            borderColor: 'rgba(247,241,225,0.14)',
          }}
        >
          <div className="grid grid-cols-2 md:grid-cols-4">
            {t.stats.map((stat: { num: string; label: string }, i: number) => (
              <StatCounter
                key={stat.label}
                num={stat.num}
                label={stat.label}
                index={i}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════════════
          PHOTO SLIDE STRIP — DEDICATED VISUAL GALLERY BAR
      ════════════════════════════════════════════════════════════════════ */}
      <section className="px-6 md:px-8 pt-20 pb-10" style={{ background: INK }}>
        <div className="mx-auto" style={{ maxWidth: 1280 }}>
          <Reveal>
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
              <div>
                <Eyebrow label="On-Ground Photography" />
                <h2 className="font-fraunces mt-3 text-2xl sm:text-3xl font-semibold text-white">
                  Live Action from Across Bangladesh
                </h2>
              </div>
              <p className="text-xs sm:text-sm text-[rgba(247,241,225,0.7)] max-w-md">
                Real photos from active volunteer deployments, blood drives, medical missions, and flood relief operations.
              </p>
            </div>
          </Reveal>

          {/* Horizontal Photo Slider Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {HERO_SLIDES.map((s, idx) => (
              <motion.div
                key={s.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.08 }}
                onClick={() => {
                  setCurrentSlide(idx);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="group relative rounded-2xl overflow-hidden border border-white/15 cursor-pointer shadow-lg hover:border-amber-400 hover:shadow-2xl transition-all duration-300"
              >
                <div className="aspect-[4/3] w-full overflow-hidden">
                  <img
                    src={s.image}
                    alt={s.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent p-3 flex flex-col justify-end">
                  <span className="text-[10px] font-mono-ibm font-semibold text-amber-300 uppercase tracking-wider">
                    {s.tag}
                  </span>
                  <p className="text-xs font-semibold text-white truncate">
                    {s.title}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════════════
          CORE PLATFORM SERVICES
      ════════════════════════════════════════════════════════════════════ */}
      <section className="px-6 md:px-8 py-24 md:py-28" style={{ background: INK }}>
        <div className="mx-auto" style={{ maxWidth: 1280 }}>
          <Reveal>
            <div className="text-center mb-16 max-w-2xl mx-auto">
              <Eyebrow label={t.features.eyebrow} />
              <h2 className="font-fraunces mt-5 text-3xl sm:text-4xl lg:text-5xl font-semibold text-white">
                {t.features.heading}
              </h2>
            </div>
          </Reveal>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map(({ Icon, title, desc, tag, color, href }, i) => (
              <Reveal key={title} delay={i * 60}>
                <Link
                  to={href}
                  className="group relative block p-8 rounded-2xl h-full border transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl overflow-hidden"
                  style={{
                    background: 'rgba(255,255,255,0.03)',
                    borderColor: 'rgba(255,255,255,0.08)',
                  }}
                  onMouseEnter={e => {
                    const el = e.currentTarget as HTMLElement;
                    el.style.background = 'rgba(255,255,255,0.06)';
                    el.style.borderColor = color.border;
                  }}
                  onMouseLeave={e => {
                    const el = e.currentTarget as HTMLElement;
                    el.style.background = 'rgba(255,255,255,0.03)';
                    el.style.borderColor = 'rgba(255,255,255,0.08)';
                  }}
                >
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center mb-6 transition-transform duration-300 group-hover:scale-110"
                    style={{ background: color.bg, color: color.text }}
                  >
                    <Icon className="w-6 h-6" />
                  </div>

                  <span
                    className="inline-block px-2.5 py-0.5 rounded-full font-mono-ibm text-[11px] font-semibold mb-3"
                    style={{ background: color.bg, color: color.text }}
                  >
                    {tag}
                  </span>

                  <h3 className="font-fraunces text-xl font-semibold text-white mb-3">
                    {title}
                  </h3>

                  <p className="text-sm leading-relaxed mb-6" style={{ color: MUTED_L }}>
                    {desc}
                  </p>

                  <div
                    className="flex items-center gap-1.5 text-xs font-semibold mt-auto"
                    style={{ color: color.text }}
                  >
                    <span>Explore</span>
                    <ArrowRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-1" />
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════════════
          AI SUITE SECTION
      ════════════════════════════════════════════════════════════════════ */}
      <section
        className="px-6 md:px-8 py-28 md:py-32 border-t border-b border-emerald-900/30"
        style={{ background: 'linear-gradient(180deg, #072018 0%, #0B2E22 100%)' }}
      >
        <div className="mx-auto" style={{ maxWidth: 1280 }}>
          <Reveal>
            <div className="text-center mb-16 max-w-2xl mx-auto">
              <Eyebrow label={t.aiSection.eyebrow} />
              <h2 className="font-fraunces mt-5 text-3xl sm:text-4xl lg:text-5xl font-semibold text-white">
                {t.aiSection.heading}
              </h2>
            </div>
          </Reveal>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {t.aiSection.items.map(({ num, title, desc }: { num: string; title: string; desc: string }, i: number) => (
              <Reveal key={num} delay={i * 60}>
                <Link
                  to={AI_HREFS[i]}
                  className="group block p-8 rounded-2xl h-full border border-white/10 transition-all duration-300 hover:-translate-y-1 hover:border-amber-400/40 hover:bg-white/[0.06] bg-white/[0.02]"
                >
                  <span className="block font-mono-ibm text-2xl font-bold mb-4 text-amber-400">
                    {num}
                  </span>
                  <h3 className="font-fraunces text-lg font-semibold text-white mb-2 group-hover:text-amber-300 transition-colors">
                    {title}
                  </h3>
                  <p className="text-sm leading-relaxed" style={{ color: MUTED_L }}>
                    {desc}
                  </p>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════════════
          GLOBAL NETWORK MAP
      ════════════════════════════════════════════════════════════════════ */}
      <section className="px-6 md:px-8 py-28 md:py-32">
        <div className="mx-auto" style={{ maxWidth: 1280 }}>
          <Reveal>
            <div className="text-center mb-16 max-w-2xl mx-auto">
              <Eyebrow label={t.map.eyebrow} />
              <h2 className="font-fraunces mt-5 text-3xl sm:text-4xl lg:text-5xl font-semibold text-white">
                {t.map.heading}
              </h2>
              <p className="mt-4 text-base" style={{ color: MUTED_L }}>
                {t.map.sub}
              </p>
            </div>
          </Reveal>

          <Reveal>
            <div
              className="rounded-3xl p-6 md:p-8 overflow-hidden relative border shadow-2xl"
              style={{
                background: 'rgba(7,32,24,0.75)',
                borderColor: 'rgba(247,241,225,0.12)',
              }}
            >
              <div className="h-[420px] sm:h-[500px] w-full">
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
        <div className="mx-auto" style={{ maxWidth: 1280 }}>
          <Reveal>
            <div className="text-center mb-16 max-w-2xl mx-auto">
              <Eyebrow label={t.testimonials.eyebrow} onPaper />
              <h2 className="font-fraunces mt-5 text-3xl sm:text-4xl lg:text-5xl font-semibold text-emerald-950">
                {t.testimonials.heading}
              </h2>
            </div>
          </Reveal>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {t.testimonials.items.map(({ avatar, name, role, quote }: { avatar: string; name: string; role: string; quote: string }, i: number) => (
              <Reveal key={name} delay={i * 80}>
                <div
                  className="group flex flex-col justify-between p-8 rounded-2xl h-full relative overflow-hidden border border-emerald-950/10 transition-all duration-300 shadow-md bg-white/70 hover:bg-white hover:-translate-y-1.5 hover:shadow-xl"
                >
                  <div>
                    <div className="flex gap-1 mb-4 text-amber-500">
                      {[...Array(5)].map((_, s) => (
                        <span key={s} className="text-sm">★</span>
                      ))}
                    </div>

                    <p className="font-fraunces text-base leading-relaxed italic text-emerald-950 mb-6">
                      "{quote}"
                    </p>
                  </div>

                  <div className="flex items-center gap-3.5 pt-4 border-t border-emerald-950/10">
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

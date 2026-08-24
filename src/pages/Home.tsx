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
const MUTED_L  = 'rgba(247,241,225,0.70)';
const MUTED_D  = 'rgba(22,36,29,0.70)';

// ─── Hero Slide Data ─────────────────────────────────────────────────────────
const HERO_SLIDES = [
  {
    id: 1,
    image: '/hero-slide1.jpg',
    tag: 'Disaster Relief & Response',
    title: 'Emergency Flood Relief Across 64 Districts',
    subtitle: 'Deploying immediate rescue units, food packs, and clean drinking water to flood-affected communities with live GPS tracking.',
    primaryCta: { label: 'Support Emergency Relief', href: ROUTES.DONATE },
    secondaryCta: { label: 'View Emergency Grid', href: ROUTES.EMERGENCY },
  },
  {
    id: 2,
    image: '/hero-slide2.jpg',
    tag: 'Community Empowerment',
    title: 'Mobilizing 18,000+ Verified Youth Volunteers',
    subtitle: 'Connecting passionate individuals with registered NGOs and charity initiatives for community development and social change.',
    primaryCta: { label: 'Join as Volunteer', href: ROUTES.VOLUNTEERS },
    secondaryCta: { label: 'Find Opportunities', href: ROUTES.ORGANIZATIONS },
  },
  {
    id: 3,
    image: '/hero-slide3.jpg',
    tag: 'Healthcare & Life Saving',
    title: 'Instant AI-Powered Blood Donor Matching',
    subtitle: 'Connecting critical patients with compatible nearby blood donors in minutes. Every drop counts, every second matters.',
    primaryCta: { label: 'Find Blood Donor', href: ROUTES.BLOOD_DONATION },
    secondaryCta: { label: 'Register as Donor', href: ROUTES.BLOOD_DONATION },
  },
  {
    id: 4,
    image: '/hero-slide4.jpg',
    tag: 'Education & Child Welfare',
    title: 'Empowering the Next Generation of Bangladesh',
    subtitle: 'Supporting underprivileged children with educational kits, digital learning resources, and nutritional support programs.',
    primaryCta: { label: 'Sponsor a Child', href: ROUTES.DONATE },
    secondaryCta: { label: 'Partner Campaigns', href: ROUTES.EVENTS },
  },
  {
    id: 5,
    image: '/hero-slide5.jpg',
    tag: 'Civic Innovation',
    title: 'Transparent Civic Ecosystem Powered by AI',
    subtitle: 'Real-time donation tracking, verified NGO trust scores, and automated disaster alerts across Bangladesh.',
    primaryCta: { label: 'Explore Platform', href: ROUTES.ORGANIZATIONS },
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
        background: onPaper ? 'rgba(11,46,34,0.06)' : 'rgba(231,169,59,0.12)',
        borderColor: onPaper ? 'rgba(11,46,34,0.15)' : 'rgba(231,169,59,0.30)',
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
          HERO PICTURE SLIDE BAR / CAROUSEL
      ════════════════════════════════════════════════════════════════════ */}
      <section 
        className="relative overflow-hidden min-h-[92vh] flex items-center pt-24 pb-16"
        onMouseEnter={() => setIsAutoPlay(false)}
        onMouseLeave={() => setIsAutoPlay(true)}
      >
        {/* Background Image Carousel with Smooth Fade Transitions */}
        <AnimatePresence mode="wait">
          <motion.div
            key={slide.id}
            initial={{ opacity: 0, scale: 1.04 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: `url(${slide.image})`,
              backgroundPosition: 'center 35%',
            }}
          />
        </AnimatePresence>

        {/* Multi-layer Dark Gradient Overlays for Enhanced Text Contrast */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#061C14]/95 via-[#0B2E22]/85 to-[#061C14]/75" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0B2E22] via-transparent to-[#0B2E22]/60" />
        <div className="absolute top-1/4 left-10 w-96 h-96 bg-amber-500/10 rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-emerald-500/10 rounded-full blur-[140px] pointer-events-none" />

        {/* Slide Content */}
        <div className="relative z-10 mx-auto w-full px-6 md:px-8 max-w-[1280px]">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Left Content Column */}
            <div className="lg:col-span-8 flex flex-col items-start">
              
              {/* Badge */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={`badge-${slide.id}`}
                  initial={{ opacity: 0, y: -12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 8 }}
                  transition={{ duration: 0.4 }}
                  className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-white/[0.12] border border-white/20 backdrop-blur-xl mb-5 text-xs font-mono-ibm font-medium text-amber-300 shadow-xl"
                >
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
                  </span>
                  <span>{slide.tag}</span>
                  <span className="text-white/30">•</span>
                  <span className="text-emerald-300 font-semibold">ShebaBD Live Grid</span>
                </motion.div>
              </AnimatePresence>

              {/* Title */}
              <AnimatePresence mode="wait">
                <motion.h1
                  key={`title-${slide.id}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -16 }}
                  transition={{ duration: 0.55, delay: 0.05 }}
                  className="font-fraunces mb-5 text-3.5xl sm:text-5xl lg:text-6xl leading-[1.1] tracking-tight font-bold text-white drop-shadow-2xl max-w-2xl"
                >
                  {slide.title}
                </motion.h1>
              </AnimatePresence>

              {/* Subtitle */}
              <AnimatePresence mode="wait">
                <motion.p
                  key={`subtitle-${slide.id}`}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.5, delay: 0.12 }}
                  className="mb-8 text-base sm:text-lg leading-relaxed text-emerald-100/90 max-w-xl drop-shadow"
                >
                  {slide.subtitle}
                </motion.p>
              </AnimatePresence>

              {/* Action Buttons */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={`actions-${slide.id}`}
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.45, delay: 0.18 }}
                  className="flex flex-wrap items-center gap-4 mb-8"
                >
                  <Link
                    to={slide.primaryCta.href}
                    className="inline-flex items-center gap-2.5 px-7 py-3.5 rounded-xl font-semibold text-sm transition-all duration-300 bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 text-emerald-950 shadow-xl hover:shadow-amber-400/30 hover:-translate-y-0.5"
                  >
                    <span>{slide.primaryCta.label}</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>

                  <Link
                    to={slide.secondaryCta.href}
                    className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl font-semibold text-sm transition-all duration-300 bg-white/10 hover:bg-white/15 border border-white/20 text-white backdrop-blur-md hover:-translate-y-0.5"
                  >
                    <span>{slide.secondaryCta.label}</span>
                  </Link>
                </motion.div>
              </AnimatePresence>

              {/* AI Search Bar */}
              <div className="w-full max-w-xl">
                <form
                  onSubmit={handleSearchSubmit}
                  className="relative flex items-center w-full rounded-2xl bg-white/[0.10] backdrop-blur-2xl border border-white/20 p-2 shadow-2xl transition-all duration-300 focus-within:border-amber-400/70 focus-within:bg-white/[0.14] focus-within:ring-4 focus-within:ring-amber-400/10 group"
                >
                  <div className="pl-3.5 pr-2 text-amber-300 flex items-center">
                    <Sparkles className="w-5 h-5 animate-pulse" />
                  </div>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={t.hero.searchPlaceholder || "Search blood, volunteers, emergency, NGOs..."}
                    className="w-full bg-transparent border-0 outline-none px-2 py-2.5 text-sm sm:text-base text-white placeholder:text-white/50 font-sans"
                  />
                  <button
                    type="submit"
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-emerald-950 font-semibold text-xs sm:text-sm transition-all duration-200 shrink-0"
                  >
                    <Search className="w-3.5 h-3.5" />
                    <span>{t.hero.askAI || 'Search'}</span>
                  </button>
                </form>

                {/* Quick links */}
                {t.hero.quickLinks && t.hero.quickLinks.length > 0 && (
                  <div className="flex flex-wrap items-center gap-2 mt-3 text-xs text-white/70">
                    <span className="font-mono-ibm text-[11px] uppercase tracking-wider text-amber-300 flex items-center gap-1">
                      <Zap className="w-3 h-3" /> Quick:
                    </span>
                    {t.hero.quickLinks.map((linkText: string, idx: number) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleQuickLinkClick(linkText)}
                        className="px-2.5 py-1 rounded-full bg-white/[0.08] hover:bg-white/[0.16] border border-white/10 hover:border-amber-400/40 text-emerald-100 text-[11px] transition-all duration-200"
                      >
                        {linkText}
                      </button>
                    ))}
                  </div>
                )}
              </div>

            </div>

            {/* Right Slide Carousel Navigation Preview */}
            <div className="lg:col-span-4 hidden lg:flex flex-col gap-3">
              <div className="p-4 rounded-2xl bg-white/[0.06] border border-white/15 backdrop-blur-xl shadow-2xl">
                <div className="flex items-center justify-between mb-3 text-xs font-mono-ibm text-emerald-100/70">
                  <span className="flex items-center gap-1.5">
                    <Award className="w-3.5 h-3.5 text-amber-300" />
                    Featured Spotlights ({currentSlide + 1}/{HERO_SLIDES.length})
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsAutoPlay(!isAutoPlay)}
                    className="p-1 rounded hover:bg-white/10 text-white/70 hover:text-white transition-colors"
                    title={isAutoPlay ? 'Pause Carousel' : 'Play Carousel'}
                  >
                    {isAutoPlay ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                  </button>
                </div>

                <div className="flex flex-col gap-2.5">
                  {HERO_SLIDES.map((s, idx) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => setCurrentSlide(idx)}
                      className={`flex items-center gap-3 p-2 rounded-xl text-left transition-all duration-300 border ${
                        idx === currentSlide
                          ? 'bg-amber-400/15 border-amber-400/50 shadow-md translate-x-1'
                          : 'bg-white/[0.03] border-white/5 hover:bg-white/[0.08] hover:border-white/15'
                      }`}
                    >
                      <img
                        src={s.image}
                        alt={s.title}
                        className="w-12 h-10 object-cover rounded-lg shrink-0 border border-white/20"
                      />
                      <div className="min-w-0">
                        <div className={`text-xs font-semibold truncate ${idx === currentSlide ? 'text-amber-300' : 'text-white/90'}`}>
                          {s.tag}
                        </div>
                        <div className="text-[11px] text-white/50 truncate">
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
          <div className="flex items-center justify-between mt-12 pt-6 border-t border-white/10">
            {/* Dots */}
            <div className="flex items-center gap-2">
              {HERO_SLIDES.map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setCurrentSlide(idx)}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    idx === currentSlide
                      ? 'w-8 bg-amber-400 shadow-[0_0_12px_rgba(251,191,36,0.8)]'
                      : 'w-2 bg-white/30 hover:bg-white/60'
                  }`}
                  aria-label={`Go to slide ${idx + 1}`}
                />
              ))}
            </div>

            {/* Arrows */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={prevSlide}
                className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-white transition-all duration-200 active:scale-95 shadow-md"
                aria-label="Previous Slide"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                type="button"
                onClick={nextSlide}
                className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-white transition-all duration-200 active:scale-95 shadow-md"
                aria-label="Next Slide"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>

        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════════════
          LIVE IMPACT METRICS
      ════════════════════════════════════════════════════════════════════ */}
      <section className="relative z-10 -mt-2 px-6 md:px-8">
        <div
          className="mx-auto rounded-2xl overflow-hidden border backdrop-blur-2xl shadow-2xl"
          style={{
            maxWidth: 1280,
            background: 'rgba(7, 32, 24, 0.85)',
            borderColor: 'rgba(247,241,225,0.12)',
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
          CORE PLATFORM SERVICES
      ════════════════════════════════════════════════════════════════════ */}
      <section className="px-6 md:px-8 py-28 md:py-32" style={{ background: INK }}>
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

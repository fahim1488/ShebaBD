import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Search, Sparkles, MapPin, Phone, Clock, Heart,
  Users, Building2, Zap, AlertTriangle, CheckCircle2,
  ChevronRight, ArrowRight, RotateCcw, X,
  Droplets, CalendarDays, ShieldCheck, Mic,
} from 'lucide-react';
import { ROUTES } from '@/constants/routes';

// ─── Design tokens ────────────────────────────────────────────────────────────
const INK      = '#0B2E22';
const INK2     = '#0F3A2B';
const INK3     = '#123F30';
const PAPER    = '#F7F1E1';
const DISC     = '#D6472C';
const DISC_DIM = '#B93B23';
const MARIGOLD = '#E7A93B';
const SKY      = '#3E7A8C';
const LEAF     = '#4C8C6B';
const MUTED_L  = 'rgba(247,241,225,0.62)';
const LINE_L   = 'rgba(247,241,225,0.16)';
const SAFE     = '#22C55E';
const WARN     = '#F59E0B';

// ─── Types ────────────────────────────────────────────────────────────────────
type ResultCategory = 'blood' | 'ngo' | 'volunteer' | 'event' | 'emergency';

interface ParsedIntent {
  category: ResultCategory;
  district: string | null;
  bloodGroup: string | null;
  urgency: 'urgent' | 'normal';
  keywords: string[];
  summary: string;
}

interface SearchResult {
  id: number;
  category: ResultCategory;
  title: string;
  subtitle: string;
  district: string;
  meta: string;
  tag: string;
  tagColor: string;
  phone?: string;
  available?: boolean;
  verified?: boolean;
  relevance: number;
}

const CATEGORY_META: Record<ResultCategory, { label: string; icon: React.ReactNode; color: string }> = {
  blood:     { label: 'Blood Donor',    icon: <Droplets size={14} />,   color: DISC     },
  ngo:       { label: 'Organisation',   icon: <Building2 size={14} />,  color: SKY      },
  volunteer: { label: 'Volunteer',      icon: <Users size={14} />,      color: LEAF     },
  event:     { label: 'Event',          icon: <CalendarDays size={14}/>, color: MARIGOLD },
  emergency: { label: 'Emergency',      icon: <AlertTriangle size={14}/>,color: WARN     },
};

// ─── NL intent parser ────────────────────────────────────────────────────────
const DISTRICTS = ['dhaka','chittagong','sylhet','rajshahi','khulna','barisal','mymensingh','rangpur','comilla','narayanganj'];
const BLOOD_GROUPS = ['o+','o-','a+','a-','b+','b-','ab+','ab-'];
const URGENCY_WORDS = ['urgent','emergency','immediately','asap','critical','now','right now','desperately'];
const BLOOD_WORDS = ['blood','donor','donate blood','blood group','blood bank'];
const NGO_WORDS = ['ngo','organisation','organization','charity','foundation','trust','aid','relief','welfare'];
const VOLUNTEER_WORDS = ['volunteer','volunteering','join','help','contribute','skill','teacher','doctor','nurse','engineer'];
const EVENT_WORDS = ['event','campaign','drive','awareness','program','programme','workshop','seminar','rally'];
const EMERGENCY_WORDS = ['emergency','disaster','flood','cyclone','accident','fire','rescue','trapped','help needed'];

function parseIntent(query: string): ParsedIntent {
  const q = query.toLowerCase();

  const district = DISTRICTS.find(d => q.includes(d)) ?? null;
  const bloodGroup = BLOOD_GROUPS.find(g => q.includes(g)) ?? null;
  const urgency = URGENCY_WORDS.some(w => q.includes(w)) ? 'urgent' : 'normal';

  let category: ResultCategory = 'ngo';
  if (BLOOD_WORDS.some(w => q.includes(w)) || bloodGroup) category = 'blood';
  else if (EMERGENCY_WORDS.some(w => q.includes(w))) category = 'emergency';
  else if (VOLUNTEER_WORDS.some(w => q.includes(w))) category = 'volunteer';
  else if (EVENT_WORDS.some(w => q.includes(w))) category = 'event';
  else if (NGO_WORDS.some(w => q.includes(w))) category = 'ngo';

  const keywords = q.split(/\s+/).filter(w => w.length > 2);

  let summary = '';
  if (category === 'blood') {
    summary = `Looking for ${bloodGroup ? bloodGroup.toUpperCase() : 'blood'} donors${district ? ` in ${district.charAt(0).toUpperCase() + district.slice(1)}` : ''}${urgency === 'urgent' ? ' — marked urgent' : ''}`;
  } else if (category === 'emergency') {
    summary = `Emergency assistance needed${district ? ` in ${district.charAt(0).toUpperCase() + district.slice(1)}` : ''}`;
  } else if (category === 'volunteer') {
    summary = `Finding volunteers${district ? ` in ${district.charAt(0).toUpperCase() + district.slice(1)}` : ''}`;
  } else if (category === 'event') {
    summary = `Searching for events${district ? ` in ${district.charAt(0).toUpperCase() + district.slice(1)}` : ''}`;
  } else {
    summary = `Finding organisations${district ? ` in ${district.charAt(0).toUpperCase() + district.slice(1)}` : ''}`;
  }

  return { category, district, bloodGroup, urgency, keywords, summary };
}

// ─── Result database ──────────────────────────────────────────────────────────
const ALL_RESULTS: SearchResult[] = [
  // Blood donors
  { id:1,  category:'blood',     title:'Md. Karim Uddin',          subtitle:'O+ · Available now · Donated 8 times', district:'Dhaka',       meta:'Last donated 3 months ago', tag:'Available',  tagColor:SAFE,    phone:'+880 1711-000001', available:true,  verified:true,  relevance:0 },
  { id:2,  category:'blood',     title:'Sharmin Akter',            subtitle:'A+ · Available now · Donated 5 times', district:'Chittagong',  meta:'Last donated 2 months ago', tag:'Available',  tagColor:SAFE,    phone:'+880 1811-000002', available:true,  verified:true,  relevance:0 },
  { id:3,  category:'blood',     title:'Tariq Islam',              subtitle:'O- · Available now · Donated 15 times',district:'Khulna',      meta:'Last donated 6 months ago', tag:'Available',  tagColor:SAFE,    phone:'+880 1711-000005', available:true,  verified:true,  relevance:0 },
  { id:4,  category:'blood',     title:'Rupa Begum',               subtitle:'AB+ · Unavailable',                    district:'Sylhet',      meta:'Last donated 1 month ago',  tag:'Unavailable',tagColor:MUTED_L, phone:'+880 1611-000004', available:false, verified:true,  relevance:0 },
  { id:5,  category:'blood',     title:'Nasreen Khanam',           subtitle:'A- · Available now · Donated 7 times', district:'Rajshahi',    meta:'Last donated 4 months ago', tag:'Available',  tagColor:SAFE,    phone:'+880 1811-000006', available:true,  verified:true,  relevance:0 },
  { id:6,  category:'blood',     title:'Jamal Hossain',            subtitle:'B+ · Available now · Donated 12 times',district:'Dhaka',       meta:'Last donated 5 months ago', tag:'Available',  tagColor:SAFE,    phone:'+880 1911-000003', available:true,  verified:true,  relevance:0 },
  { id:7,  category:'blood',     title:'Rafiq Uddin',              subtitle:'B- · Available now · Donated 4 times', district:'Dhaka',       meta:'Last donated 2 months ago', tag:'Available',  tagColor:SAFE,    phone:'+880 1611-000007', available:true,  verified:true,  relevance:0 },
  { id:8,  category:'blood',     title:'Sylhet Blood Bank',        subtitle:'24/7 emergency blood supply',          district:'Sylhet',      meta:'1,200+ volunteer donors',   tag:'Verified',   tagColor:SKY,     phone:'+880 821-713456',  available:true,  verified:true,  relevance:0 },
  // NGOs
  { id:9,  category:'ngo',       title:'BRAC Bangladesh',          subtitle:'Education · Poverty · Healthcare',     district:'Dhaka',       meta:'3,200 volunteers · Rating 4.9', tag:'Verified',tagColor:SKY,  verified:true,  relevance:0 },
  { id:10, category:'ngo',       title:'Bangladesh Red Crescent',  subtitle:'Disaster Relief · Blood Services',     district:'Dhaka',       meta:'5,000 volunteers · Rating 4.8', tag:'Verified',tagColor:SKY,  verified:true,  relevance:0 },
  { id:11, category:'ngo',       title:'Grameen Bank',             subtitle:'Poverty Alleviation · Microfinance',  district:'Dhaka',       meta:'1,500 volunteers · Rating 4.8', tag:'Verified',tagColor:SKY,  verified:true,  relevance:0 },
  { id:12, category:'ngo',       title:'CRP Bangladesh',           subtitle:'Healthcare · Rehabilitation',          district:'Dhaka',       meta:'450 volunteers · Rating 4.9',   tag:'Verified',tagColor:SKY,  verified:true,  relevance:0 },
  { id:13, category:'ngo',       title:'Chittagong Green Force',   subtitle:'Environment · Climate',                district:'Chittagong',  meta:'780 volunteers · Rating 4.5',   tag:'Verified',tagColor:SKY,  verified:true,  relevance:0 },
  { id:14, category:'ngo',       title:'Rajshahi Education Trust', subtitle:'Education · Skills Training',          district:'Rajshahi',    meta:'320 volunteers · Rating 4.6',   tag:'Verified',tagColor:SKY,  verified:true,  relevance:0 },
  { id:15, category:'ngo',       title:'Khulna Disaster Response', subtitle:'Disaster Relief · Flood Aid',          district:'Khulna',      meta:'650 volunteers · Rating 4.4',   tag:'Verified',tagColor:SKY,  verified:true,  relevance:0 },
  { id:16, category:'ngo',       title:'Dhaka Ahsania Mission',    subtitle:'Education · Health · Social Dev',      district:'Dhaka',       meta:'900 volunteers · Rating 4.7',   tag:'Verified',tagColor:SKY,  verified:true,  relevance:0 },
  // Volunteers
  { id:17, category:'volunteer', title:'Dr. Fatema Akter',         subtitle:'MBBS · General Physician',             district:'Dhaka',       meta:'Available weekends · 3 yrs exp', tag:'Active',  tagColor:LEAF, verified:true,  relevance:0 },
  { id:18, category:'volunteer', title:'Rahim Uddin',              subtitle:'Civil Engineer',                       district:'Chittagong',  meta:'Available part-time · 5 yrs exp', tag:'Active', tagColor:LEAF, verified:true,  relevance:0 },
  { id:19, category:'volunteer', title:'Nasrin Begum',             subtitle:'Primary School Teacher',              district:'Sylhet',      meta:'Available weekdays · 8 yrs exp',  tag:'Active', tagColor:LEAF, verified:true,  relevance:0 },
  { id:20, category:'volunteer', title:'Kamal Hossain',            subtitle:'Software Developer · IT Trainer',      district:'Dhaka',       meta:'Available remotely · 4 yrs exp',  tag:'Active', tagColor:LEAF, verified:true,  relevance:0 },
  { id:21, category:'volunteer', title:'Sumaiya Islam',            subtitle:'Social Worker · Community Organiser',  district:'Rajshahi',    meta:'Available full-time · 6 yrs exp',  tag:'Active', tagColor:LEAF, verified:true,  relevance:0 },
  // Events
  { id:22, category:'event',     title:'National Blood Donation Drive',    subtitle:'BRAC Bangladesh',              district:'Dhaka',       meta:'15 Feb 2025 · 9am–5pm',          tag:'Upcoming',tagColor:MARIGOLD,relevance:0 },
  { id:23, category:'event',     title:'Climate Awareness March',          subtitle:'Chittagong Green Force',       district:'Chittagong',  meta:'22 Feb 2025 · 8am',              tag:'Upcoming',tagColor:MARIGOLD,relevance:0 },
  { id:24, category:'event',     title:'Free Medical Camp — Char Islands', subtitle:'CRP Bangladesh',               district:'Barisal',     meta:'28 Feb 2025 · All day',          tag:'Upcoming',tagColor:MARIGOLD,relevance:0 },
  { id:25, category:'event',     title:'Volunteer Skills Workshop',        subtitle:'Dhaka Ahsania Mission',        district:'Dhaka',       meta:'5 Mar 2025 · 10am–4pm',          tag:'Upcoming',tagColor:MARIGOLD,relevance:0 },
  // Emergency
  { id:26, category:'emergency', title:'Flood Relief — Sylhet Division',   subtitle:'Active emergency response',    district:'Sylhet',      meta:'Response time: 2 hrs',           tag:'Active',  tagColor:DISC,    phone:'+880 821-000001',  relevance:0 },
  { id:27, category:'emergency', title:'Emergency Medical Response',       subtitle:'Dhaka DNCC Rapid Team',        district:'Dhaka',       meta:'Response time: 45 min',          tag:'Active',  tagColor:DISC,    phone:'+880 2-9000000',   relevance:0 },
  { id:28, category:'emergency', title:'Cyclone Preparedness Unit',        subtitle:'Khulna Disaster Response',     district:'Khulna',      meta:'Shelter: 12 centres active',     tag:'Active',  tagColor:DISC,    phone:'+880 41-723589',   relevance:0 },
];

// ─── Scoring engine ───────────────────────────────────────────────────────────
function scoreResults(intent: ParsedIntent, results: SearchResult[]): SearchResult[] {
  return results
    .map(r => {
      let score = 0;
      // category match = strong signal
      if (r.category === intent.category) score += 60;
      // district match
      if (intent.district && r.district.toLowerCase() === intent.district) score += 25;
      // blood group match
      if (intent.bloodGroup && r.subtitle.toLowerCase().includes(intent.bloodGroup)) score += 30;
      // availability bonus for blood/emergency
      if ((intent.category === 'blood' || intent.category === 'emergency') && r.available !== false) score += 10;
      // urgency pushes available blood donors and emergency higher
      if (intent.urgency === 'urgent' && (r.category === 'blood' || r.category === 'emergency')) score += 15;
      // keyword hits in title/subtitle/district
      intent.keywords.forEach(kw => {
        if (r.title.toLowerCase().includes(kw)) score += 5;
        if (r.subtitle.toLowerCase().includes(kw)) score += 3;
        if (r.district.toLowerCase().includes(kw)) score += 4;
      });
      // verified bonus
      if (r.verified) score += 5;
      return { ...r, relevance: score };
    })
    .filter(r => r.relevance > 0)
    .sort((a, b) => b.relevance - a.relevance)
    .slice(0, 12);
}

// ─── Example queries ──────────────────────────────────────────────────────────
const EXAMPLE_QUERIES = [
  { text: 'I need O+ blood in Dhaka urgently',        icon: <Droplets size={14}/>,    color: DISC     },
  { text: 'Find flood relief NGOs in Sylhet',         icon: <Building2 size={14}/>,   color: SKY      },
  { text: 'Medical volunteers available in Dhaka',    icon: <Users size={14}/>,       color: LEAF     },
  { text: 'Upcoming blood donation events near me',   icon: <CalendarDays size={14}/>,color: MARIGOLD },
  { text: 'Emergency response teams in Khulna',       icon: <AlertTriangle size={14}/>,color:WARN     },
  { text: 'Education NGOs for rural children',        icon: <Building2 size={14}/>,   color: SKY      },
  { text: 'B- blood donor in Chittagong',             icon: <Droplets size={14}/>,    color: DISC     },
  { text: 'Volunteer teachers needed in Rajshahi',    icon: <Users size={14}/>,       color: LEAF     },
];

// ─── Reusable components ──────────────────────────────────────────────────────
function Reveal({ children, delay = 0, className = '', style = {} }: {
  children: React.ReactNode; delay?: number; className?: string; style?: React.CSSProperties;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const io = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setTimeout(() => { el.style.opacity = '1'; el.style.transform = 'translateY(0)'; }, delay);
        io.unobserve(el);
      }
    }, { threshold: 0.06 });
    io.observe(el);
    return () => io.disconnect();
  }, [delay]);
  return (
    <div ref={ref} className={className}
      style={{ opacity: 0, transform: 'translateY(20px)', transition: 'opacity 0.6s ease, transform 0.6s ease', ...style }}>
      {children}
    </div>
  );
}

function Eyebrow({ label, color = MARIGOLD }: { label: string; color?: string }) {
  return (
    <div className="inline-flex items-center gap-[9px] font-mono-ibm text-[12px] tracking-[0.11em] uppercase"
      style={{ color: MUTED_L }}>
      <span className="inline-block w-[6px] h-[6px] rounded-full" style={{ background: color }} />
      {label}
    </div>
  );
}

// ─── Animated search brain orb ────────────────────────────────────────────────
function SearchOrb() {
  return (
    <div className="relative flex items-center justify-center" style={{ width: 200, height: 200 }}>
      {[0, 1, 2].map(i => (
        <motion.div key={i} className="absolute rounded-full"
          style={{ width: 70 + i * 44, height: 70 + i * 44, border: `1px solid ${SKY}${['44','28','14'][i]}` }}
          animate={{ rotate: i % 2 === 0 ? 360 : -360 }}
          transition={{ duration: 16 + i * 7, repeat: Infinity, ease: 'linear' }} />
      ))}
      <div className="absolute rounded-full"
        style={{ width: 84, height: 84, background: `radial-gradient(circle, ${SKY}22, transparent 70%)` }} />
      <div className="relative z-10 flex items-center justify-center rounded-full"
        style={{ width: 68, height: 68, background: `${SKY}18`, border: `2px solid ${SKY}55` }}>
        <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}>
          <Search size={28} style={{ color: SKY }} />
        </motion.div>
      </div>
      {[0, 1, 2, 3].map(i => (
        <motion.div key={i} className="absolute rounded-full"
          style={{ width: 5, height: 5, background: SKY }}
          animate={{
            x: [0, (i % 2 === 0 ? 1 : -1) * (24 + i * 9), 0],
            y: [0, (i < 2 ? -1 : 1) * (18 + i * 7), 0],
            opacity: [0, 1, 0],
          }}
          transition={{ duration: 2.4, repeat: Infinity, delay: i * 0.55, ease: 'easeInOut' }} />
      ))}
    </div>
  );
}

// ─── Result card ──────────────────────────────────────────────────────────────
function ResultCard({ result, rank, urgency }: { result: SearchResult; rank: number; urgency: 'urgent' | 'normal' }) {
  const cm = CATEGORY_META[result.category];
  const isUrgentBlood = urgency === 'urgent' && result.category === 'blood' && result.available !== false;
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.38, delay: rank * 0.055, ease: [0.4, 0, 0.2, 1] }}
      style={{
        background: INK2,
        border: `1px solid ${isUrgentBlood ? DISC + '55' : LINE_L}`,
        borderRadius: 3,
        padding: '20px 22px',
        position: 'relative',
        overflow: 'hidden',
        transition: 'border-color 0.2s, background 0.2s',
      }}
      whileHover={{ borderColor: cm.color + '66' }}
    >
      {/* urgency pulse strip */}
      {isUrgentBlood && (
        <div className="absolute top-0 left-0 w-full h-[2px]"
          style={{ background: `linear-gradient(90deg, ${DISC}, transparent)` }} />
      )}

      {/* rank badge */}
      <span className="absolute top-3 right-3 font-mono-ibm text-[10px]"
        style={{ color: MUTED_L }}>#{rank + 1}</span>

      <div className="flex items-start gap-3">
        {/* icon */}
        <div className="flex items-center justify-center rounded-full flex-shrink-0 mt-[2px]"
          style={{ width: 36, height: 36, background: `${cm.color}18`, border: `1.5px solid ${cm.color}44`, color: cm.color }}>
          {cm.icon}
        </div>

        <div className="flex-1 min-w-0">
          {/* title row */}
          <div className="flex items-start justify-between gap-2 flex-wrap mb-[3px]">
            <p className="font-fraunces font-semibold text-[15px]" style={{ color: PAPER, lineHeight: 1.25 }}>
              {result.title}
            </p>
            <span className="inline-flex items-center gap-[5px] font-mono-ibm text-[10.5px] px-[8px] py-[3px] rounded-full flex-shrink-0"
              style={{ color: result.tagColor, background: `${result.tagColor}18`, border: `1px solid ${result.tagColor}33` }}>
              {result.tag}
            </span>
          </div>

          {/* subtitle */}
          <p className="text-[13px] mb-[8px]" style={{ color: MUTED_L }}>{result.subtitle}</p>

          {/* meta row */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
            <span className="inline-flex items-center gap-[5px] font-mono-ibm text-[11.5px]"
              style={{ color: MUTED_L }}>
              <MapPin size={11} /> {result.district}
            </span>
            <span className="inline-flex items-center gap-[5px] font-mono-ibm text-[11.5px]"
              style={{ color: MUTED_L }}>
              <Clock size={11} /> {result.meta}
            </span>
            {result.verified && (
              <span className="inline-flex items-center gap-[4px] font-mono-ibm text-[11px]"
                style={{ color: SAFE }}>
                <ShieldCheck size={11} /> Verified
              </span>
            )}
          </div>

          {/* phone CTA for blood/emergency */}
          {result.phone && result.available !== false && (
            <div className="mt-3">
              <a href={`tel:${result.phone}`}
                className="inline-flex items-center gap-2 px-[14px] py-[7px] font-mono-ibm text-[12px] font-semibold rounded-[2px]"
                style={{ background: cm.color, color: result.category === 'emergency' ? PAPER : (cm.color === SAFE ? INK : PAPER), transition: 'opacity 0.15s' }}
                onMouseEnter={e => { e.currentTarget.style.opacity = '0.85'; }}
                onMouseLeave={e => { e.currentTarget.style.opacity = '1'; }}>
                <Phone size={12} /> Call Now — {result.phone}
              </a>
            </div>
          )}
        </div>
      </div>

      {/* relevance bar */}
      <div className="mt-3 pt-3" style={{ borderTop: `1px solid ${LINE_L}` }}>
        <div className="flex items-center justify-between mb-1">
          <span className="font-mono-ibm text-[10.5px]" style={{ color: MUTED_L }}>AI Relevance</span>
          <span className="font-mono-ibm text-[10.5px]" style={{ color: cm.color }}>
            {Math.min(Math.round((result.relevance / 120) * 100), 100)}%
          </span>
        </div>
        <div className="h-[3px] rounded-full overflow-hidden" style={{ background: `${cm.color}22` }}>
          <motion.div className="h-full rounded-full" style={{ background: cm.color }}
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(Math.round((result.relevance / 120) * 100), 100)}%` }}
            transition={{ duration: 0.9, delay: rank * 0.05, ease: [0.4, 0, 0.2, 1] }} />
        </div>
      </div>
    </motion.div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function AiSmartSearch() {
  const [query, setQuery]           = useState('');
  const [searching, setSearching]   = useState(false);
  const [results, setResults]       = useState<SearchResult[]>([]);
  const [intent, setIntent]         = useState<ParsedIntent | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const inputRef  = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  const handleSearch = useCallback((q: string) => {
    const trimmed = q.trim();
    if (!trimmed) return;
    setQuery(trimmed);
    setSearching(true);
    setResults([]);
    setHasSearched(false);

    // simulate AI processing
    setTimeout(() => {
      const parsed = parseIntent(trimmed);
      const scored = scoreResults(parsed, ALL_RESULTS);
      setIntent(parsed);
      setResults(scored);
      setSearching(false);
      setHasSearched(true);
      setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
    }, 1600 + Math.random() * 600);
  }, []);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    handleSearch(query);
  }

  function handleExample(text: string) {
    setQuery(text);
    handleSearch(text);
  }

  function handleClear() {
    setQuery('');
    setResults([]);
    setIntent(null);
    setHasSearched(false);
    inputRef.current?.focus();
  }

  // category breakdown for results
  const breakdown = results.reduce<Record<string, number>>((acc, r) => {
    acc[r.category] = (acc[r.category] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <div style={{ background: INK, color: PAPER, minHeight: '100vh', overflowX: 'hidden' }}>

      {/* ══ HERO ═══════════════════════════════════════════════════════════ */}
      <section className="relative" style={{ padding: '80px 32px 60px', overflow: 'hidden' }}>
        <div className="pointer-events-none absolute rounded-full"
          style={{ top: -160, right: -180, width: 520, height: 520,
            background: 'radial-gradient(circle, rgba(62,122,140,0.12), transparent 70%)' }} />
        <div className="pointer-events-none absolute rounded-full"
          style={{ bottom: -100, left: -140, width: 380, height: 380,
            background: 'radial-gradient(circle, rgba(231,169,59,0.07), transparent 70%)' }} />

        <div className="mx-auto" style={{ maxWidth: 1180 }}>
          <div className="flex items-center justify-between gap-10 flex-wrap">
            <div style={{ maxWidth: 600 }}>
              <Reveal>
                <div className="mb-5"><Eyebrow label="AI · Natural Language Search · v1.0" color={SKY} /></div>
              </Reveal>
              <Reveal delay={70}>
                <h1 className="font-fraunces mb-5"
                  style={{ fontSize: 'clamp(36px,4.8vw,60px)', lineHeight: 1.04, fontWeight: 600 }}>
                  Ask anything.<br />
                  <span style={{ color: SKY }}>Get smart results.</span>
                </h1>
              </Reveal>
              <Reveal delay={140}>
                <p style={{ color: MUTED_L, fontSize: 16.5, lineHeight: 1.72, maxWidth: 500 }}>
                  Search ShebaBD the way you think — in plain language. The AI understands
                  your need, location, and urgency, then surfaces the most relevant
                  donors, NGOs, volunteers, events, and emergency services instantly.
                </p>
              </Reveal>
              <Reveal delay={220}>
                <div className="flex flex-wrap gap-4 mt-8">
                  {[
                    { icon: <Droplets size={13}/>, label: 'Blood donors', color: DISC },
                    { icon: <Building2 size={13}/>, label: 'NGOs', color: SKY },
                    { icon: <Users size={13}/>, label: 'Volunteers', color: LEAF },
                    { icon: <CalendarDays size={13}/>, label: 'Events', color: MARIGOLD },
                    { icon: <AlertTriangle size={13}/>, label: 'Emergency', color: WARN },
                  ].map(({ icon, label, color }) => (
                    <span key={label} className="inline-flex items-center gap-[6px] font-mono-ibm text-[12px]"
                      style={{ color, opacity: 0.8 }}>
                      {icon} {label}
                    </span>
                  ))}
                </div>
              </Reveal>
            </div>
            <Reveal className="hidden lg:flex">
              <SearchOrb />
            </Reveal>
          </div>
        </div>
      </section>

      {/* ══ SEARCH BAR ═════════════════════════════════════════════════════ */}
      <section className="px-8 pb-[60px]">
        <div className="mx-auto" style={{ maxWidth: 860 }}>
          <Reveal>
            <form onSubmit={handleSubmit}>
              <div className="flex items-center gap-3"
                style={{
                  background: INK2, border: `1.5px solid ${SKY}55`,
                  borderRadius: 4, padding: '6px 6px 6px 20px',
                  boxShadow: `0 0 40px ${SKY}18`,
                  transition: 'border-color 0.2s, box-shadow 0.2s',
                }}
                onFocus={() => {}}
              >
                <Search size={20} style={{ color: SKY, flexShrink: 0 }} />
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  placeholder='Try: "I need O+ blood in Dhaka urgently"'
                  autoFocus
                  className="flex-1 bg-transparent border-none outline-none placeholder-[rgba(247,241,225,0.3)]"
                  style={{ color: PAPER, fontSize: 16, fontFamily: 'Inter, sans-serif', lineHeight: 1.5 }}
                />
                {query && (
                  <button type="button" onClick={handleClear}
                    style={{ color: MUTED_L, background: 'none', border: 'none', cursor: 'pointer', padding: '4px', flexShrink: 0 }}>
                    <X size={16} />
                  </button>
                )}
                <button type="submit" disabled={!query.trim() || searching}
                  className="inline-flex items-center gap-2 font-semibold text-[13.5px] rounded-[2px] disabled:opacity-40 flex-shrink-0"
                  style={{ background: SKY, color: PAPER, border: 'none', cursor: 'pointer',
                    padding: '11px 22px', transition: 'all 0.18s', whiteSpace: 'nowrap' }}
                  onMouseEnter={e => { if (!searching) e.currentTarget.style.opacity = '0.88'; }}
                  onMouseLeave={e => { e.currentTarget.style.opacity = '1'; }}>
                  {searching
                    ? <><motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.9, ease: 'linear' }}><RotateCcw size={15} /></motion.div> Searching…</>
                    : <><Sparkles size={15} /> Search</>
                  }
                </button>
              </div>
            </form>
          </Reveal>

          {/* processing animation */}
          <AnimatePresence>
            {searching && (
              <motion.div key="processing" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }} className="mt-5 flex items-center gap-4"
                style={{ background: INK2, border: `1px solid ${LINE_L}`, borderRadius: 3, padding: '14px 20px' }}>
                <div className="flex gap-[5px]">
                  {[0,1,2,3,4].map(i => (
                    <motion.span key={i} className="block rounded-full" style={{ width: 5, height: 5, background: SKY }}
                      animate={{ scale: [1, 1.7, 1], opacity: [0.4, 1, 0.4] }}
                      transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.12 }} />
                  ))}
                </div>
                <div>
                  <p className="font-mono-ibm text-[12.5px]" style={{ color: PAPER }}>
                    Parsing intent · Matching district · Scoring relevance…
                  </p>
                  <p className="font-mono-ibm text-[11px] mt-[2px]" style={{ color: MUTED_L }}>
                    Searching across NGOs, blood donors, volunteers, events, and emergency services
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* intent parsed chip row */}
          <AnimatePresence>
            {intent && hasSearched && !searching && (
              <motion.div key="intent" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }} className="mt-4 flex flex-wrap items-center gap-2">
                <span className="font-mono-ibm text-[11.5px]" style={{ color: MUTED_L }}>AI understood:</span>
                <span className="inline-flex items-center gap-[6px] font-mono-ibm text-[11.5px] px-[10px] py-[4px] rounded-full"
                  style={{ background: `${CATEGORY_META[intent.category].color}18`, color: CATEGORY_META[intent.category].color, border: `1px solid ${CATEGORY_META[intent.category].color}33` }}>
                  {CATEGORY_META[intent.category].icon}
                  {CATEGORY_META[intent.category].label}
                </span>
                {intent.district && (
                  <span className="inline-flex items-center gap-[5px] font-mono-ibm text-[11.5px] px-[10px] py-[4px] rounded-full"
                    style={{ background: `${SKY}18`, color: SKY, border: `1px solid ${SKY}33` }}>
                    <MapPin size={11} /> {intent.district.charAt(0).toUpperCase() + intent.district.slice(1)}
                  </span>
                )}
                {intent.bloodGroup && (
                  <span className="inline-flex items-center gap-[5px] font-mono-ibm text-[11.5px] px-[10px] py-[4px] rounded-full"
                    style={{ background: `${DISC}18`, color: DISC, border: `1px solid ${DISC}33` }}>
                    <Droplets size={11} /> {intent.bloodGroup.toUpperCase()}
                  </span>
                )}
                {intent.urgency === 'urgent' && (
                  <span className="inline-flex items-center gap-[5px] font-mono-ibm text-[11.5px] px-[10px] py-[4px] rounded-full"
                    style={{ background: `${DISC}18`, color: DISC, border: `1px solid ${DISC}33` }}>
                    <Zap size={11} /> Urgent
                  </span>
                )}
                <span className="font-mono-ibm text-[11.5px]" style={{ color: MUTED_L }}>
                  · {results.length} results
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* ══ RESULTS ════════════════════════════════════════════════════════ */}
      <div ref={resultsRef}>
        <AnimatePresence mode="wait">
          {hasSearched && !searching && (
            <motion.section key="results" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="px-8 pb-[100px]">
              <div className="mx-auto" style={{ maxWidth: 1180 }}>

                {results.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-24 text-center">
                    <Search size={48} style={{ color: MUTED_L, opacity: 0.25, marginBottom: 16 }} />
                    <p className="font-fraunces text-[20px] mb-2" style={{ color: MUTED_L }}>No results found</p>
                    <p className="font-mono-ibm text-[13px]" style={{ color: MUTED_L }}>
                      Try rephrasing — e.g. "O+ blood donor in Dhaka" or "flood relief NGO Sylhet"
                    </p>
                  </div>
                ) : (
                  <>
                    {/* summary header */}
                    <div className="flex flex-wrap items-center justify-between gap-4 mb-8"
                      style={{ borderBottom: `1px solid ${LINE_L}`, paddingBottom: 20 }}>
                      <div>
                        <p className="font-fraunces text-[22px] font-semibold" style={{ color: PAPER }}>
                          {results.length} results for
                          <span style={{ color: SKY }}> "{query}"</span>
                        </p>
                        <p className="font-mono-ibm text-[12px] mt-1" style={{ color: MUTED_L }}>
                          {intent?.summary}
                        </p>
                      </div>
                      {/* breakdown chips */}
                      <div className="flex flex-wrap gap-2">
                        {Object.entries(breakdown).map(([cat, count]) => {
                          const cm = CATEGORY_META[cat as ResultCategory];
                          return (
                            <span key={cat} className="inline-flex items-center gap-[6px] font-mono-ibm text-[11px] px-[10px] py-[4px] rounded-full"
                              style={{ color: cm.color, background: `${cm.color}14`, border: `1px solid ${cm.color}28` }}>
                              {cm.icon} {cm.label} ({count})
                            </span>
                          );
                        })}
                      </div>
                    </div>

                    {/* urgent alert banner */}
                    {intent?.urgency === 'urgent' && intent.category === 'blood' && (
                      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
                        className="mb-6 flex items-center gap-3 px-5 py-4 rounded-[3px]"
                        style={{ background: `${DISC}14`, border: `1px solid ${DISC}44` }}>
                        <Zap size={18} style={{ color: DISC, flexShrink: 0 }} />
                        <div>
                          <p className="font-semibold text-[14px]" style={{ color: PAPER }}>Urgent blood request detected</p>
                          <p className="text-[13px]" style={{ color: MUTED_L }}>
                            Available donors are shown first. Call directly using the button on each card.
                          </p>
                        </div>
                      </motion.div>
                    )}

                    {/* result grid */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px,1fr))', gap: 12 }}>
                      {results.map((r, i) => (
                        <ResultCard key={r.id} result={r} rank={i} urgency={intent?.urgency ?? 'normal'} />
                      ))}
                    </div>

                    {/* refine tip */}
                    <div className="mt-10 flex items-center gap-3 px-5 py-4 rounded-[3px]"
                      style={{ background: INK2, border: `1px solid ${LINE_L}` }}>
                      <Sparkles size={16} style={{ color: MARIGOLD, flexShrink: 0 }} />
                      <p className="text-[13px]" style={{ color: MUTED_L }}>
                        <strong style={{ color: PAPER }}>Tip:</strong> Add more detail to refine results —
                        e.g. include a district, blood group, or urgency like "urgently" or "ASAP".
                      </p>
                    </div>
                  </>
                )}
              </div>
            </motion.section>
          )}
        </AnimatePresence>
      </div>

      {/* ══ EXAMPLE QUERIES (shown before first search) ═════════════════════ */}
      {!hasSearched && !searching && (
        <section className="px-8 pb-[80px]">
          <div className="mx-auto" style={{ maxWidth: 1180 }}>
            <Reveal>
              <p className="font-mono-ibm text-[12px] tracking-[0.09em] uppercase mb-5"
                style={{ color: MUTED_L }}>
                Try asking…
              </p>
            </Reveal>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 8 }}>
              {EXAMPLE_QUERIES.map((eq, i) => (
                <Reveal key={eq.text} delay={i * 45}>
                  <button onClick={() => handleExample(eq.text)}
                    className="w-full text-left flex items-start gap-3"
                    style={{
                      background: INK2, border: `1px solid ${LINE_L}`,
                      borderRadius: 3, padding: '14px 16px',
                      cursor: 'pointer', transition: 'all 0.18s ease',
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.borderColor = eq.color + '66';
                      e.currentTarget.style.background = INK3;
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.borderColor = LINE_L;
                      e.currentTarget.style.background = INK2;
                    }}>
                    <span className="mt-[2px] flex-shrink-0" style={{ color: eq.color }}>{eq.icon}</span>
                    <span className="text-[13.5px]" style={{ color: MUTED_L, lineHeight: 1.5 }}>
                      "{eq.text}"
                    </span>
                    <ArrowRight size={13} style={{ color: MUTED_L, marginLeft: 'auto', flexShrink: 0, marginTop: 3 }} />
                  </button>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ══ HOW IT WORKS ════════════════════════════════════════════════════ */}
      {!hasSearched && (
        <section className="px-8 py-[90px]"
          style={{ background: INK2, borderTop: `1px solid ${LINE_L}`, borderBottom: `1px solid ${LINE_L}` }}>
          <div className="mx-auto" style={{ maxWidth: 1180 }}>
            <Reveal>
              <div className="text-center mb-12">
                <Eyebrow label="Intelligence Pipeline" color={SKY} />
                <h2 className="font-fraunces mt-5 mb-3"
                  style={{ fontSize: 'clamp(26px,3vw,38px)', fontWeight: 600, lineHeight: 1.1 }}>
                  How the AI understands you
                </h2>
                <p style={{ color: MUTED_L, fontSize: 15, maxWidth: 500, margin: '0 auto' }}>
                  Three layers of processing turn a natural sentence into ranked, actionable results.
                </p>
              </div>
            </Reveal>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 1, background: LINE_L, border: `1px solid ${LINE_L}` }}>
              {[
                { step: '01', title: 'Intent Extraction',   color: SKY,    icon: <Sparkles size={20}/>,
                  desc: 'The AI identifies what you need — blood, NGO, volunteer, event, or emergency — from the natural phrasing of your query.' },
                { step: '02', title: 'Context Parsing',      color: MARIGOLD,icon: <MapPin size={20}/>,
                  desc: 'District, blood group, urgency level, and key requirements are extracted and used to filter the entire ShebaBD database.' },
                { step: '03', title: 'Relevance Scoring',    color: LEAF,   icon: <Zap size={20}/>,
                  desc: 'Each result is scored across category match, location, availability, urgency, and verification status — then ranked for you.' },
              ].map(({ step, title, color, icon, desc }, i) => (
                <Reveal key={step} delay={i * 70}
                  style={{ background: INK2, padding: '36px 30px', transition: 'background 0.22s ease' }}>
                  <div
                    onMouseEnter={e => { const p = e.currentTarget.parentElement; if (p) p.style.background = INK3; }}
                    onMouseLeave={e => { const p = e.currentTarget.parentElement; if (p) p.style.background = INK2; }}>
                    <span className="font-mono-ibm text-[11px] tracking-[0.1em] block mb-4" style={{ color: MUTED_L }}>{step}</span>
                    <div className="flex items-center justify-center mb-5 rounded-full"
                      style={{ width: 46, height: 46, background: `${color}18`, border: `1.5px solid ${color}44`, color }}>
                      {icon}
                    </div>
                    <h3 className="font-fraunces font-semibold mb-3" style={{ fontSize: 17, color: PAPER }}>{title}</h3>
                    <p style={{ fontSize: 13.5, lineHeight: 1.68, color: MUTED_L }}>{desc}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ══ CTA ════════════════════════════════════════════════════════════ */}
      <section className="px-8 py-[80px]">
        <div className="mx-auto text-center" style={{ maxWidth: 620 }}>
          <Reveal>
            <h2 className="font-fraunces mb-4"
              style={{ fontSize: 'clamp(24px,2.8vw,36px)', fontWeight: 600 }}>
              Every second counts
            </h2>
            <p style={{ color: MUTED_L, fontSize: 15, lineHeight: 1.7, marginBottom: 28 }}>
              Whether it's an urgent blood need, a disaster, or finding the right NGO —
              ShebaBD Smart Search gets you there faster.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link to={ROUTES.ORGANIZATIONS}
                className="inline-flex items-center gap-2 px-[24px] py-[13px] font-semibold text-[14px] rounded-[2px]"
                style={{ background: SKY, color: PAPER, transition: 'all 0.2s' }}
                onMouseEnter={e => { e.currentTarget.style.opacity = '0.88'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                onMouseLeave={e => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.transform = 'translateY(0)'; }}>
                Browse Verified NGOs <ChevronRight size={15}/>
              </Link>
              <Link to={ROUTES.BLOOD_DONATION}
                className="inline-flex items-center gap-2 px-[24px] py-[13px] font-semibold text-[14px] rounded-[2px]"
                style={{ border: `1px solid ${LINE_L}`, color: PAPER, transition: 'border-color 0.2s' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = MUTED_L; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = LINE_L; }}>
                Blood Donation <Droplets size={14}/>
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

    </div>
  );
}

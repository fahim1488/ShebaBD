import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  HeartHandshake, Sparkles, ArrowRight, RefreshCw,
  Utensils, GraduationCap, Heart, Droplets, Home,
  TreePine, ChevronRight, TrendingUp, Users, Star,
  BadgeCheck, CircleDollarSign, Zap, RotateCcw,
} from 'lucide-react';
import { ROUTES } from '@/constants/routes';

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
type CauseId = 'food' | 'education' | 'healthcare' | 'blood' | 'shelter' | 'environment';

interface Cause {
  id: CauseId;
  label: string;
  icon: React.ReactNode;
  color: string;
  unit: string;
  unitLabel: string;
  perTaka: number; // how much 1 BDT provides
  description: string;
  org: string;
}

interface ImpactResult {
  cause: Cause;
  amount: number;
  units: number;
  breakdown: { label: string; value: string; color: string }[];
  quote: string;
}

// ─── Cause definitions ────────────────────────────────────────────────────────
const CAUSES: Cause[] = [
  {
    id: 'food', label: 'Food & Nutrition', icon: <Utensils size={20}/>,
    color: DISC, unit: 'meals', unitLabel: 'Nutritious Meals',
    perTaka: 0.05, // ৳20 per meal
    description: 'Provides emergency food packets, school meals, and nutrition supplements to underprivileged families across Bangladesh.',
    org: 'Bangladesh Food Bank Network',
  },
  {
    id: 'education', label: 'Education', icon: <GraduationCap size={20}/>,
    color: SKY, unit: 'school days', unitLabel: 'School Days Funded',
    perTaka: 0.02, // ৳50 per school day
    description: 'Covers tuition, books, uniforms, and school supplies for underprivileged children in rural and urban Bangladesh.',
    org: 'Rajshahi Education Trust',
  },
  {
    id: 'healthcare', label: 'Healthcare', icon: <Heart size={20}/>,
    color: MARIGOLD, unit: 'consultations', unitLabel: 'Medical Consultations',
    perTaka: 0.0067, // ৳150 per consultation
    description: 'Funds free medical consultations, medicines, and diagnostic tests at rural health camps in underserved districts.',
    org: 'CRP Bangladesh',
  },
  {
    id: 'blood', label: 'Blood Services', icon: <Droplets size={20}/>,
    color: DISC, unit: 'units', unitLabel: 'Blood Units Processed',
    perTaka: 0.001, // ৳1000 per unit (processing/storage)
    description: 'Covers blood screening, processing, storage, and delivery to patients in emergency need across 64 districts.',
    org: 'Sylhet Blood Bank',
  },
  {
    id: 'shelter', label: 'Disaster Shelter', icon: <Home size={20}/>,
    color: LEAF, unit: 'nights', unitLabel: 'Emergency Shelter Nights',
    perTaka: 0.033, // ৳30 per night
    description: 'Provides emergency shelter, blankets, and sanitation kits to flood and cyclone-affected families in coastal regions.',
    org: 'Khulna Disaster Response',
  },
  {
    id: 'environment', label: 'Environment', icon: <TreePine size={20}/>,
    color: LEAF, unit: 'trees', unitLabel: 'Trees Planted',
    perTaka: 0.1, // ৳10 per tree
    description: 'Plants mangrove and native trees in the Sundarbans buffer zone, restoring biodiversity and protecting coastal communities.',
    org: 'Chittagong Green Force',
  },
];

const PRESET_AMOUNTS = [100, 500, 1000, 2500, 5000, 10000];

// ─── Impact computation ───────────────────────────────────────────────────────
function computeImpact(cause: Cause, amount: number): ImpactResult {
  const units = Math.floor(amount * cause.perTaka);
  const quotes: Record<CauseId, string> = {
    food:        `${units} meals mean ${units} children go to bed with full stomachs tonight.`,
    education:   `${units} school days open the door to a lifetime of opportunity for a child in rural Bangladesh.`,
    healthcare:  `${units} consultations could detect and treat illness before it becomes life-threatening.`,
    blood:       `${units} blood unit${units !== 1 ? 's' : ''} could save up to ${units * 3} lives in emergencies across Bangladesh.`,
    shelter:     `${units} shelter nights give ${Math.ceil(units / 3)} families a safe place to sleep during disaster.`,
    environment: `${units} trees will absorb ${(units * 21.7).toFixed(0)} kg of CO₂ and protect the Sundarbans coastline.`,
  };

  const breakdownMap: Record<CauseId, { label: string; value: string; color: string }[]> = {
    food: [
      { label: 'Food packets',      value: `${Math.floor(units * 0.6)}`,       color: DISC    },
      { label: 'School meals',      value: `${Math.floor(units * 0.3)}`,       color: MARIGOLD},
      { label: 'Nutrition supplements', value: `${Math.floor(units * 0.1)}`,   color: LEAF    },
    ],
    education: [
      { label: 'Books & supplies',  value: `৳${Math.round(amount * 0.4).toLocaleString()}`, color: SKY     },
      { label: 'Tuition covered',   value: `৳${Math.round(amount * 0.4).toLocaleString()}`, color: MARIGOLD},
      { label: 'Uniforms',          value: `৳${Math.round(amount * 0.2).toLocaleString()}`, color: LEAF    },
    ],
    healthcare: [
      { label: 'Consultations',     value: `${units}`,                          color: MARIGOLD},
      { label: 'Medicine cost',     value: `৳${Math.round(amount * 0.35).toLocaleString()}`, color: SKY  },
      { label: 'Diagnostics',       value: `৳${Math.round(amount * 0.25).toLocaleString()}`, color: DISC },
    ],
    blood: [
      { label: 'Units processed',   value: `${units}`,                          color: DISC    },
      { label: 'Lives potentially saved', value: `up to ${units * 3}`,           color: SAFE    },
      { label: 'Storage cost',      value: `৳${Math.round(amount * 0.3).toLocaleString()}`, color: MARIGOLD},
    ],
    shelter: [
      { label: 'Shelter nights',    value: `${units}`,                          color: LEAF    },
      { label: 'Families helped',   value: `~${Math.ceil(units / 3)}`,          color: SAFE    },
      { label: 'Sanitation kits',   value: `${Math.floor(units / 7)}`,          color: SKY     },
    ],
    environment: [
      { label: 'Trees planted',     value: `${units}`,                          color: LEAF    },
      { label: 'CO₂ absorbed/yr',   value: `${(units * 21.7).toFixed(0)} kg`,  color: SAFE    },
      { label: 'Hectares restored', value: `${(units * 0.005).toFixed(2)}`,    color: MARIGOLD},
    ],
  };

  return { cause, amount, units, breakdown: breakdownMap[cause.id], quote: quotes[cause.id] };
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function Reveal({ children, delay = 0, className = '', style = {}, onClick }: {
  children: React.ReactNode; delay?: number;
  className?: string; style?: React.CSSProperties; onClick?: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) {
        setTimeout(() => { el.style.opacity='1'; el.style.transform='translateY(0)'; }, delay);
        io.unobserve(el);
      }
    }, { threshold: 0.06 });
    io.observe(el);
    return () => io.disconnect();
  }, [delay]);
  return (
    <div ref={ref} className={className}
      style={{ opacity:0, transform:'translateY(20px)', transition:'opacity 0.6s ease, transform 0.6s ease', ...style }}>
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

// ─── Animated coin orb ────────────────────────────────────────────────────────
function CoinOrb() {
  return (
    <div className="relative flex items-center justify-center" style={{ width:200, height:200 }}>
      {[0,1,2].map(i => (
        <motion.div key={i} className="absolute rounded-full"
          style={{ width:70+i*44, height:70+i*44, border:`1px solid ${LEAF}${['44','28','14'][i]}` }}
          animate={{ rotate: i%2===0 ? 360 : -360 }}
          transition={{ duration:18+i*8, repeat:Infinity, ease:'linear' }} />
      ))}
      <div className="absolute rounded-full"
        style={{ width:84, height:84, background:`radial-gradient(circle, ${LEAF}22, transparent 70%)` }} />
      <div className="relative z-10 flex items-center justify-center rounded-full"
        style={{ width:68, height:68, background:`${LEAF}18`, border:`2px solid ${LEAF}55` }}>
        <motion.div animate={{ scale:[1,1.1,1] }} transition={{ duration:2.2, repeat:Infinity, ease:'easeInOut' }}>
          <HeartHandshake size={28} style={{ color:LEAF }} />
        </motion.div>
      </div>
      {[0,1,2,3].map(i => (
        <motion.div key={i} className="absolute rounded-full"
          style={{ width:5, height:5, background:LEAF }}
          animate={{
            x:[0,(i%2===0?1:-1)*(24+i*9),0], y:[0,(i<2?-1:1)*(18+i*7),0], opacity:[0,1,0],
          }}
          transition={{ duration:2.4, repeat:Infinity, delay:i*0.55, ease:'easeInOut' }} />
      ))}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function AiDonationAdvisor() {
  const [activeCause, setActiveCause] = useState<CauseId>('food');
  const [amount, setAmount]           = useState(1000);
  const [customInput, setCustomInput] = useState('1000');
  const [result, setResult]           = useState<ImpactResult | null>(null);
  const [computing, setComputing]     = useState(false);
  const resultRef = useRef<HTMLDivElement>(null);

  const cause = CAUSES.find(c => c.id === activeCause)!;

  const handleCompute = useCallback(() => {
    const amt = Math.max(1, parseInt(customInput.replace(/[^\d]/g, '')) || amount);
    setAmount(amt);
    setComputing(true);
    setResult(null);
    setTimeout(() => {
      setResult(computeImpact(cause, amt));
      setComputing(false);
      setTimeout(() => resultRef.current?.scrollIntoView({ behavior:'smooth', block:'start' }), 100);
    }, 1400);
  }, [cause, amount, customInput]);

  function handlePreset(val: number) {
    setAmount(val);
    setCustomInput(val.toString());
  }

  function handleCustomChange(e: React.ChangeEvent<HTMLInputElement>) {
    const raw = e.target.value.replace(/[^\d]/g, '');
    setCustomInput(raw);
    if (raw) setAmount(parseInt(raw));
  }

  return (
    <div style={{ background:INK, color:PAPER, minHeight:'100vh', overflowX:'hidden' }}>

      {/* ══ HERO ═══════════════════════════════════════════════════════════ */}
      <section className="relative" style={{ padding:'80px 32px 64px', overflow:'hidden' }}>
        <div className="pointer-events-none absolute rounded-full"
          style={{ top:-160, right:-180, width:520, height:520,
            background:'radial-gradient(circle, rgba(76,140,107,0.12), transparent 70%)' }} />
        <div className="pointer-events-none absolute rounded-full"
          style={{ bottom:-100, left:-140, width:380, height:380,
            background:'radial-gradient(circle, rgba(231,169,59,0.07), transparent 70%)' }} />
        <div className="mx-auto" style={{ maxWidth:1180 }}>
          <div className="flex items-center justify-between gap-10 flex-wrap">
            <div style={{ maxWidth:600 }}>
              <Reveal><div className="mb-5"><Eyebrow label="AI · Donation Advisor · Impact Calculator" color={LEAF} /></div></Reveal>
              <Reveal delay={70}>
                <h1 className="font-fraunces mb-5"
                  style={{ fontSize:'clamp(36px,4.8vw,60px)', lineHeight:1.04, fontWeight:600 }}>
                  See the real<br /><span style={{ color:LEAF }}>impact of your gift</span>
                </h1>
              </Reveal>
              <Reveal delay={140}>
                <p style={{ color:MUTED_L, fontSize:16.5, lineHeight:1.72, maxWidth:520 }}>
                  Enter any donation amount and choose a cause. The AI Advisor breaks down exactly
                  how many meals, school days, medical consultations, or trees your donation delivers
                  on the ground in Bangladesh.
                </p>
              </Reveal>
              <Reveal delay={220}>
                <div className="flex flex-wrap gap-5 mt-8">
                  {CAUSES.map(c => (
                    <span key={c.id} className="inline-flex items-center gap-[6px] font-mono-ibm text-[12px]"
                      style={{ color:c.color, opacity:0.8 }}>
                      {c.icon} {c.label}
                    </span>
                  ))}
                </div>
              </Reveal>
            </div>
            <Reveal className="hidden lg:flex"><CoinOrb /></Reveal>
          </div>
        </div>
      </section>

      {/* ══ STATS BAR ══════════════════════════════════════════════════════ */}
      <section style={{ borderTop:`1px solid ${LINE_L}`, borderBottom:`1px solid ${LINE_L}`, background:INK2 }}>
        <div className="mx-auto" style={{ maxWidth:1180 }}>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)' }}>
            {[
              { num:'৳4.2Cr+', label:'Donations Tracked',   sub:'across verified NGOs'       },
              { num:'18,400+', label:'Lives Impacted',       sub:'through platform donations'  },
              { num:'2,400+',  label:'Verified NGOs',        sub:'transparent fund usage'      },
              { num:'98%',     label:'Fund Utilisation',     sub:'confirmed by AI audits'      },
            ].map(({ num, label, sub }, i) => (
              <Reveal key={label} delay={i*70}
                style={{ padding:'28px 24px', borderRight:i<3?`1px solid ${LINE_L}`:'none', textAlign:'center' }}>
                <span className="block font-mono-ibm font-bold mb-[4px]"
                  style={{ fontSize:'clamp(20px,2.2vw,30px)', color:PAPER }}>{num}</span>
                <span className="block text-[13px] font-medium mb-[2px]" style={{ color:PAPER }}>{label}</span>
                <span className="block font-mono-ibm text-[11px]" style={{ color:MUTED_L }}>{sub}</span>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ══ ADVISOR WORKSPACE ══════════════════════════════════════════════ */}
      <section className="px-8 py-[80px]">
        <div className="mx-auto" style={{ maxWidth:1180 }}>
          <Reveal>
            <div className="text-center mb-14">
              <Eyebrow label="Impact Calculator" color={LEAF} />
              <h2 className="font-fraunces mt-5 mb-3"
                style={{ fontSize:'clamp(28px,3.4vw,42px)', fontWeight:600, lineHeight:1.1 }}>
                Choose your cause &amp; amount
              </h2>
              <p style={{ color:MUTED_L, fontSize:15.5, maxWidth:500, margin:'0 auto' }}>
                Real breakdown based on verified partner NGO cost-per-unit data.
              </p>
            </div>
          </Reveal>

          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:2, alignItems:'start' }}>

            {/* ── LEFT: controls ── */}
            <Reveal delay={60}>
              <div style={{ background:INK2, border:`1px solid ${LINE_L}`, borderRadius:3 }}>

                {/* Step 1 — cause */}
                <div style={{ padding:'28px 28px 24px', borderBottom:`1px solid ${LINE_L}` }}>
                  <p className="font-mono-ibm text-[11.5px] tracking-[0.09em] uppercase mb-4" style={{ color:MUTED_L }}>
                    01 — Choose a Cause
                  </p>
                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
                    {CAUSES.map(c => {
                      const active = activeCause === c.id;
                      return (
                        <button key={c.id} onClick={() => { setActiveCause(c.id); setResult(null); }}
                          style={{
                            display:'flex', alignItems:'flex-start', gap:10, padding:'14px',
                            borderRadius:3, border:`1.5px solid ${active ? c.color : LINE_L}`,
                            background: active ? `${c.color}14` : 'transparent',
                            cursor:'pointer', transition:'all 0.18s ease', textAlign:'left',
                          }}
                          onMouseEnter={e => { if(!active) e.currentTarget.style.borderColor = c.color+'66'; }}
                          onMouseLeave={e => { if(!active) e.currentTarget.style.borderColor = LINE_L; }}>
                          <span style={{ color:c.color, marginTop:2, flexShrink:0 }}>{c.icon}</span>
                          <div>
                            <p className="font-semibold text-[13px]"
                              style={{ color:active ? c.color : PAPER, lineHeight:1.3 }}>{c.label}</p>
                            <p className="text-[11px] mt-[2px]" style={{ color:MUTED_L, lineHeight:1.4 }}>
                              {c.org}
                            </p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Step 2 — amount */}
                <div style={{ padding:'24px 28px', borderBottom:`1px solid ${LINE_L}` }}>
                  <p className="font-mono-ibm text-[11.5px] tracking-[0.09em] uppercase mb-4" style={{ color:MUTED_L }}>
                    02 — Donation Amount (৳ BDT)
                  </p>
                  {/* preset grid */}
                  <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:8, marginBottom:14 }}>
                    {PRESET_AMOUNTS.map(val => {
                      const active = amount === val && customInput === val.toString();
                      return (
                        <button key={val} onClick={() => handlePreset(val)}
                          style={{
                            padding:'10px 6px', borderRadius:2, textAlign:'center',
                            border:`1px solid ${active ? LEAF : LINE_L}`,
                            background: active ? `${LEAF}18` : 'transparent',
                            color: active ? LEAF : MUTED_L,
                            fontFamily:"'IBM Plex Mono', monospace", fontSize:13,
                            fontWeight:600, cursor:'pointer', transition:'all 0.15s ease',
                          }}
                          onMouseEnter={e => { if(!active){ e.currentTarget.style.borderColor=LEAF+'66'; e.currentTarget.style.color=PAPER; }}}
                          onMouseLeave={e => { if(!active){ e.currentTarget.style.borderColor=LINE_L; e.currentTarget.style.color=MUTED_L; }}}>
                          ৳{val.toLocaleString()}
                        </button>
                      );
                    })}
                  </div>
                  {/* custom input */}
                  <div className="flex items-center gap-3"
                    style={{ background:INK3, border:`1px solid ${LINE_L}`, borderRadius:2, padding:'12px 16px' }}>
                    <span className="font-mono-ibm text-[16px] font-bold" style={{ color:LEAF }}>৳</span>
                    <input type="text" value={customInput} onChange={handleCustomChange}
                      placeholder="Enter custom amount…"
                      className="flex-1 bg-transparent border-none outline-none placeholder-[rgba(247,241,225,0.3)]"
                      style={{ color:PAPER, fontSize:15, fontFamily:'Inter, sans-serif' }} />
                  </div>
                  <p className="font-mono-ibm text-[11px] mt-2" style={{ color:MUTED_L }}>
                    Minimum ৳10 · No maximum
                  </p>
                </div>

                {/* Cause description */}
                <div style={{ padding:'20px 28px', borderBottom:`1px solid ${LINE_L}` }}>
                  <p className="font-mono-ibm text-[11.5px] tracking-[0.09em] uppercase mb-2" style={{ color:MUTED_L }}>
                    About This Cause
                  </p>
                  <p className="text-[13.5px]" style={{ color:MUTED_L, lineHeight:1.65 }}>
                    {cause.description}
                  </p>
                </div>

                {/* Calculate button */}
                <div style={{ padding:'22px 28px' }}>
                  <button onClick={handleCompute}
                    disabled={computing || !customInput || parseInt(customInput) < 1}
                    style={{
                      width:'100%', padding:'15px 24px',
                      background: computing ? `${LEAF}88` : LEAF,
                      color: INK, fontWeight:700, fontSize:14.5,
                      borderRadius:2, border:'none',
                      cursor: computing ? 'not-allowed' : 'pointer',
                      transition:'all 0.2s ease', display:'flex',
                      alignItems:'center', justifyContent:'center', gap:10,
                    }}
                    onMouseEnter={e => { if(!computing) e.currentTarget.style.transform='translateY(-1px)'; }}
                    onMouseLeave={e => { e.currentTarget.style.transform='translateY(0)'; }}>
                    {computing
                      ? <><motion.div animate={{ rotate:360 }} transition={{ repeat:Infinity, duration:0.9, ease:'linear' }}><RefreshCw size={17}/></motion.div> Calculating impact…</>
                      : <><Sparkles size={17}/> Calculate My Impact <ArrowRight size={17}/></>
                    }
                  </button>
                  {computing && (
                    <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }}
                      className="flex items-center justify-center gap-3 mt-4">
                      {[0,1,2,3,4].map(i => (
                        <motion.span key={i} className="block rounded-full"
                          style={{ width:6, height:6, background:LEAF }}
                          animate={{ scale:[1,1.6,1], opacity:[0.4,1,0.4] }}
                          transition={{ duration:0.9, repeat:Infinity, delay:i*0.15 }} />
                      ))}
                    </motion.div>
                  )}
                </div>
              </div>
            </Reveal>

            {/* ── RIGHT: result ── */}
            <Reveal delay={120}>
              <div ref={resultRef}
                style={{ background:INK2, border:`1px solid ${LINE_L}`, borderRadius:3, minHeight:400 }}>
                {/* header */}
                <div className="flex items-center gap-3"
                  style={{ padding:'20px 24px', borderBottom:`1px solid ${LINE_L}` }}>
                  <div className="flex items-center justify-center rounded-full"
                    style={{ width:34, height:34, background:`${cause.color}18`, border:`1.5px solid ${cause.color}44`, color:cause.color }}>
                    {cause.icon}
                  </div>
                  <div>
                    <p className="font-semibold text-[14px]" style={{ color:PAPER }}>Impact Estimate</p>
                    <p className="font-mono-ibm text-[11px]" style={{ color:MUTED_L }}>{cause.label} · {cause.org}</p>
                  </div>
                </div>

                {/* body */}
                <div style={{ padding:'26px 26px 28px', minHeight:340 }}>
                  <AnimatePresence mode="wait">
                    {!result && !computing && (
                      <motion.div key="empty" initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
                        className="flex flex-col items-center justify-center py-20 text-center">
                        <div style={{ opacity:0.15, marginBottom:16 }}>
                          <HeartHandshake size={52} style={{ color:LEAF }} />
                        </div>
                        <p className="font-fraunces text-[18px] mb-2" style={{ color:MUTED_L }}>Your impact will appear here</p>
                        <p className="font-mono-ibm text-[12.5px]" style={{ color:MUTED_L }}>Choose a cause and amount, then calculate</p>
                      </motion.div>
                    )}
                    {computing && (
                      <motion.div key="computing" initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
                        className="flex flex-col items-center justify-center py-20 text-center">
                        <motion.div className="mb-5"
                          animate={{ rotate:[0,15,-15,0], scale:[1,1.1,1] }}
                          transition={{ duration:1.4, repeat:Infinity }}>
                          <Sparkles size={38} style={{ color:LEAF }} />
                        </motion.div>
                        <p className="font-fraunces text-[18px] mb-2" style={{ color:PAPER }}>Computing your impact…</p>
                        <p className="font-mono-ibm text-[12px]" style={{ color:MUTED_L }}>Calculating cost-per-unit · Verifying NGO data…</p>
                      </motion.div>
                    )}
                    {result && !computing && (
                      <motion.div key="result" initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }}
                        transition={{ duration:0.4 }}>
                        {/* big number */}
                        <div className="text-center mb-8">
                          <motion.span className="block font-mono-ibm font-bold"
                            style={{ fontSize:'clamp(42px,6vw,72px)', color:result.cause.color, lineHeight:1 }}
                            initial={{ scale:0.7, opacity:0 }} animate={{ scale:1, opacity:1 }}
                            transition={{ duration:0.5, ease:[0.4,0,0.2,1] }}>
                            {result.units.toLocaleString()}
                          </motion.span>
                          <span className="font-fraunces text-[20px] mt-2 block" style={{ color:PAPER }}>
                            {result.cause.unitLabel}
                          </span>
                          <span className="font-mono-ibm text-[13px] mt-1 block" style={{ color:MUTED_L }}>
                            for ৳{result.amount.toLocaleString()} donated to {result.cause.org}
                          </span>
                        </div>

                        {/* quote */}
                        <div className="mb-6 px-4 py-4 rounded-[3px]"
                          style={{ background:`${result.cause.color}10`, border:`1px solid ${result.cause.color}33` }}>
                          <p className="text-[14px]" style={{ color:MUTED_L, lineHeight:1.68, fontStyle:'italic' }}>
                            "{result.quote}"
                          </p>
                        </div>

                        {/* breakdown bars */}
                        <div className="space-y-4 mb-6">
                          {result.breakdown.map(({ label, value, color }) => (
                            <div key={label}>
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-[13px]" style={{ color:MUTED_L }}>{label}</span>
                                <span className="font-mono-ibm text-[13px] font-semibold" style={{ color }}>{value}</span>
                              </div>
                              <div className="h-[4px] rounded-full overflow-hidden" style={{ background:`${color}22` }}>
                                <motion.div className="h-full rounded-full" style={{ background:color }}
                                  initial={{ width:0 }} animate={{ width:'100%' }}
                                  transition={{ duration:1.0, ease:[0.4,0,0.2,1] }} />
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* CTA */}
                        <Link to={ROUTES.DONATE}
                          className="inline-flex items-center gap-2 w-full justify-center px-[22px] py-[13px] font-semibold text-[14px] rounded-[2px]"
                          style={{ background:result.cause.color, color:INK, transition:'all 0.2s' }}
                          onMouseEnter={e => { e.currentTarget.style.opacity='0.88'; e.currentTarget.style.transform='translateY(-1px)'; }}
                          onMouseLeave={e => { e.currentTarget.style.opacity='1'; e.currentTarget.style.transform='translateY(0)'; }}>
                          <HeartHandshake size={16}/> Donate ৳{result.amount.toLocaleString()} Now <ChevronRight size={15}/>
                        </Link>

                        <p className="font-mono-ibm text-[11px] text-center mt-3" style={{ color:MUTED_L }}>
                          Estimates based on verified NGO cost-per-unit data · Updated quarterly
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ══ CAUSE CARDS OVERVIEW ═══════════════════════════════════════════ */}
      <section className="px-8 pb-[90px]"
        style={{ borderTop:`1px solid ${LINE_L}` }}>
        <div className="mx-auto pt-[80px]" style={{ maxWidth:1180 }}>
          <Reveal>
            <div className="text-center mb-12">
              <Eyebrow label="All Causes" color={LEAF} />
              <h2 className="font-fraunces mt-5 mb-3"
                style={{ fontSize:'clamp(26px,3vw,38px)', fontWeight:600, lineHeight:1.1 }}>
                Where your money goes
              </h2>
              <p style={{ color:MUTED_L, fontSize:15, maxWidth:480, margin:'0 auto' }}>
                Every taka tracked transparently through ShebaBD's verified NGO network.
              </p>
            </div>
          </Reveal>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:1, background:LINE_L, border:`1px solid ${LINE_L}` }}>
            {CAUSES.map(({ id, label, icon, color, unit, perTaka, description, org }, i) => (
              <Reveal key={id} delay={i*60}
                style={{ background:INK, padding:'32px 28px', transition:'background 0.22s ease', cursor:'pointer' }}
                onClick={() => { setActiveCause(id); setResult(null); window.scrollTo({ top:0, behavior:'smooth' }); }}>
                <div
                  onMouseEnter={e => { const p = e.currentTarget.parentElement; if(p) p.style.background=INK2; }}
                  onMouseLeave={e => { const p = e.currentTarget.parentElement; if(p) p.style.background=INK; }}>
                  <div className="flex items-center justify-center mb-4 rounded-full"
                    style={{ width:44, height:44, background:`${color}18`, border:`1.5px solid ${color}44`, color }}>
                    {icon}
                  </div>
                  <h3 className="font-fraunces font-semibold mb-1" style={{ fontSize:17, color:PAPER }}>{label}</h3>
                  <p className="font-mono-ibm text-[11px] mb-3" style={{ color }}>
                    ৳{Math.round(1/perTaka)} per {unit.replace('s','')}
                  </p>
                  <p style={{ fontSize:13, lineHeight:1.65, color:MUTED_L }}>{description}</p>
                  <p className="font-mono-ibm text-[11px] mt-3" style={{ color:MUTED_L }}>Partner: {org}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ══ CTA ════════════════════════════════════════════════════════════ */}
      <section className="px-8 py-[80px]"
        style={{ background:INK2, borderTop:`1px solid ${LINE_L}` }}>
        <div className="mx-auto text-center" style={{ maxWidth:660 }}>
          <Reveal>
            <h2 className="font-fraunces mb-4"
              style={{ fontSize:'clamp(26px,3vw,38px)', fontWeight:600 }}>
              Every taka counts
            </h2>
            <p style={{ color:MUTED_L, fontSize:15.5, lineHeight:1.7, marginBottom:32 }}>
              Even ৳100 provides 5 nutritious meals or 10 trees planted. ShebaBD ensures
              100% of your donation reaches the verified partner organisation.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link to={ROUTES.DONATE}
                className="inline-flex items-center gap-2 px-[26px] py-[14px] font-semibold text-[14px] rounded-[2px]"
                style={{ background:LEAF, color:INK, transition:'all 0.2s' }}
                onMouseEnter={e => { e.currentTarget.style.opacity='0.88'; e.currentTarget.style.transform='translateY(-2px)'; }}
                onMouseLeave={e => { e.currentTarget.style.opacity='1'; e.currentTarget.style.transform='translateY(0)'; }}>
                <HeartHandshake size={16}/> Donate Now
              </Link>
              <Link to={ROUTES.ORGANIZATIONS}
                className="inline-flex items-center gap-2 px-[26px] py-[14px] font-semibold text-[14px] rounded-[2px]"
                style={{ border:`1px solid ${LINE_L}`, color:PAPER, transition:'border-color 0.2s' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor=MUTED_L; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor=LINE_L; }}>
                Browse NGOs <ChevronRight size={15}/>
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

    </div>
  );
}

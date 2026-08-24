import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  ShieldCheck, Star, Users, Heart, CheckCircle2,
  XCircle, AlertTriangle, TrendingUp, Search,
  ChevronRight, BarChart2, FileText, MapPin,
  Sparkles, Clock, BadgeCheck, Eye, RefreshCw,
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
const DANGER   = '#EF4444';

// ─── Types & Data ─────────────────────────────────────────────────────────────
interface TrustSignal {
  label: string; score: number; max: number;
  color: string; icon: React.ReactNode; desc: string;
}

interface OrgTrust {
  id: number; name: string; initial: string;
  district: string; category: string;
  trustScore: number; tier: 'PLATINUM' | 'GOLD' | 'SILVER' | 'BRONZE' | 'UNVERIFIED';
  signals: TrustSignal[];
  registered: string; lastAudit: string;
  donations: string; volunteers: number;
  reviews: number; rating: number;
  transparencyUrl: string;
  summary: string;
}

const TIER_META: Record<OrgTrust['tier'], { color: string; bg: string; label: string; icon: React.ReactNode }> = {
  PLATINUM:   { color: SKY,    bg:`rgba(62,122,140,0.15)`,  label:'Platinum Trust', icon:<ShieldCheck size={14}/> },
  GOLD:       { color: MARIGOLD,bg:`rgba(231,169,59,0.14)`, label:'Gold Trust',     icon:<BadgeCheck size={14}/> },
  SILVER:     { color: MUTED_L, bg:`rgba(247,241,225,0.10)`,label:'Silver Trust',   icon:<CheckCircle2 size={14}/> },
  BRONZE:     { color: WARN,   bg:`rgba(245,158,11,0.12)`,  label:'Bronze Trust',   icon:<AlertTriangle size={14}/> },
  UNVERIFIED: { color: DANGER, bg:`rgba(239,68,68,0.12)`,   label:'Unverified',     icon:<XCircle size={14}/> },
};

function buildSignals(o: Partial<OrgTrust> & { base: number }): TrustSignal[] {
  return [
    { label:'Government Registration',  score: o.base>=90?20:o.base>=70?15:8,  max:20, color:SAFE,    icon:<FileText size={14}/>,    desc:'Verified government NGO registration certificate on file.' },
    { label:'Financial Transparency',   score: o.base>=90?20:o.base>=70?14:6,  max:20, color:SKY,     icon:<BarChart2 size={14}/>,   desc:'Annual financial disclosures published and cross-checked against TIN records.' },
    { label:'Community Reviews',        score: o.base>=90?18:o.base>=70?14:7,  max:20, color:MARIGOLD,icon:<Star size={14}/>,        desc:'Composite score from verified donor and beneficiary reviews.' },
    { label:'Volunteer Feedback',       score: o.base>=90?15:o.base>=70?11:5,  max:15, color:LEAF,    icon:<Users size={14}/>,       desc:'Anonymous volunteer satisfaction surveys collected post-campaign.' },
    { label:'AI Fraud Check',           score: o.base>=90?15:o.base>=70?12:4,  max:15, color:DISC,    icon:<Eye size={14}/>,         desc:'24-signal behavioural analysis — no anomalies detected.' },
    { label:'Donation Impact Proof',    score: o.base>=90?10:o.base>=70?7:2,   max:10, color:MARIGOLD,icon:<Heart size={14}/>,       desc:'Impact evidence submitted and verified by ShebaBD audit team.' },
  ];
}

const ORGS: OrgTrust[] = [
  { id:1, name:'BRAC Bangladesh', initial:'B', district:'Dhaka', category:'Education / Poverty',
    trustScore:98, tier:'PLATINUM', registered:'1972', lastAudit:'Jun 2026',
    donations:'৳142Cr', volunteers:3200, reviews:1240, rating:4.9,
    transparencyUrl:'brac.net/transparency',
    summary:'BRAC consistently scores near-perfect across all 6 trust dimensions. Full government registration, published financials, and 50+ years of verified impact make it the most trusted NGO on ShebaBD.',
    signals: buildSignals({ base:98 }) },
  { id:2, name:'Bangladesh Red Crescent', initial:'B', district:'Dhaka', category:'Disaster Relief',
    trustScore:97, tier:'PLATINUM', registered:'1973', lastAudit:'May 2026',
    donations:'৳89Cr', volunteers:5000, reviews:1100, rating:4.8,
    transparencyUrl:'bdrcs.org/reports',
    summary:'International affiliation, rigorous audit trails, and the highest volunteer satisfaction score on the platform place Red Crescent in Platinum tier with confidence.',
    signals: buildSignals({ base:97 }) },
  { id:3, name:'Grameen Bank', initial:'G', district:'Dhaka', category:'Poverty / Women',
    trustScore:99, tier:'PLATINUM', registered:'1983', lastAudit:'Jul 2026',
    donations:'৳210Cr', volunteers:1500, reviews:980, rating:4.8,
    transparencyUrl:'grameen.com/annual',
    summary:'Nobel Peace Prize laureate with the highest financial transparency score on ShebaBD. Every disbursement is publicly documented and AI-verified.',
    signals: buildSignals({ base:99 }) },
  { id:4, name:'CRP Bangladesh', initial:'C', district:'Dhaka', category:'Healthcare',
    trustScore:96, tier:'PLATINUM', registered:'1979', lastAudit:'Apr 2026',
    donations:'৳34Cr', volunteers:450, reviews:634, rating:4.9,
    transparencyUrl:'crp-bangladesh.org/reports',
    summary:'Specialised healthcare NGO with near-perfect volunteer feedback and fully verified patient impact data. Platinum tier awarded for the 6th consecutive year.',
    signals: buildSignals({ base:96 }) },
  { id:5, name:'Rajshahi Education Trust', initial:'R', district:'Rajshahi', category:'Education',
    trustScore:82, tier:'GOLD', registered:'2010', lastAudit:'Mar 2026',
    donations:'৳9Cr', volunteers:320, reviews:445, rating:4.6,
    transparencyUrl:'ret.org.bd/transparency',
    summary:'Strong community reviews and solid financial disclosures push RET into Gold tier. Minor documentation gaps in impact proof prevent Platinum.',
    signals: buildSignals({ base:82 }) },
  { id:6, name:'Khulna Disaster Response', initial:'K', district:'Khulna', category:'Disaster Relief',
    trustScore:74, tier:'SILVER', registered:'2015', lastAudit:'Jan 2026',
    donations:'৳7Cr', volunteers:650, reviews:267, rating:4.4,
    transparencyUrl:'kdr.bd/reports',
    summary:'Legitimate organisation with good field presence but incomplete financial disclosure for FY2025 and below-average review count keeps it in Silver.',
    signals: buildSignals({ base:74 }) },
];

const HOW_SIGNALS = [
  { icon:<FileText size={20}/>,    color:SAFE,    title:'Government Registration',  desc:'We cross-reference NGO Bureau, Joint Stock Companies, and Social Welfare department databases to confirm legal status.' },
  { icon:<BarChart2 size={20}/>,   color:SKY,     title:'Financial Transparency',   desc:'Annual financial reports are parsed and cross-checked against TIN records, NGO Bureau filings, and INGO monitoring data.' },
  { icon:<Star size={20}/>,        color:MARIGOLD,title:'Community Reviews',         desc:'Verified donor and beneficiary reviews are aggregated using a weighted scoring model — fake reviews are filtered before inclusion.' },
  { icon:<Users size={20}/>,       color:LEAF,    title:'Volunteer Feedback',        desc:'Anonymous post-campaign surveys from registered volunteers provide a ground-level view of organisational quality.' },
  { icon:<Eye size={20}/>,         color:DISC,    title:'AI Fraud Detection',        desc:'24-signal behavioural analysis including domain age, content fingerprinting, and financial flow anomaly detection.' },
  { icon:<Heart size={20}/>,       color:MARIGOLD,title:'Donation Impact Proof',     desc:'NGOs must submit verifiable beneficiary data, site photos, and field reports. AI validates consistency with claimed outcomes.' },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
function Reveal({ children, delay=0, className='', style={} }: {
  children: React.ReactNode; delay?: number; className?: string; style?: React.CSSProperties;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) {
        setTimeout(() => { el.style.opacity='1'; el.style.transform='translateY(0)'; }, delay);
        io.unobserve(el);
      }
    }, { threshold:0.06 });
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

function Eyebrow({ label, color=MARIGOLD }: { label:string; color?:string }) {
  return (
    <div className="inline-flex items-center gap-[9px] font-mono-ibm text-[12px] tracking-[0.11em] uppercase" style={{ color:MUTED_L }}>
      <span className="inline-block w-[6px] h-[6px] rounded-full" style={{ background:color }} />
      {label}
    </div>
  );
}

// ─── Big trust score ring ──────────────────────────────────────────────────────
function TrustRing({ score, color, size=130 }: { score:number; color:string; size?:number }) {
  const r=(size-14)/2; const circ=2*Math.PI*r;
  return (
    <div className="relative flex items-center justify-center flex-shrink-0" style={{ width:size, height:size }}>
      <svg width={size} height={size} style={{ transform:'rotate(-90deg)' }}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={LINE_L} strokeWidth={12}/>
        <motion.circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={12}
          strokeLinecap="round"
          initial={{ strokeDasharray:`0 ${circ}` }}
          animate={{ strokeDasharray:`${circ*(score/100)} ${circ}` }}
          transition={{ duration:1.2, ease:[0.4,0,0.2,1] }}/>
      </svg>
      <div className="absolute flex flex-col items-center">
        <motion.span className="font-mono-ibm font-bold" style={{ fontSize:size*0.22, color, lineHeight:1 }}
          initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.5 }}>
          {score}
        </motion.span>
        <span className="font-mono-ibm text-[10px]" style={{ color:MUTED_L }}>/ 100</span>
      </div>
    </div>
  );
}

// ─── Signal bar row ───────────────────────────────────────────────────────────
function SignalRow({ signal, delay=0 }: { signal:TrustSignal; delay?:number }) {
  const pct = (signal.score / signal.max) * 100;
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2">
          <span style={{ color:signal.color }}>{signal.icon}</span>
          <span className="text-[13px]" style={{ color:PAPER }}>{signal.label}</span>
        </div>
        <span className="font-mono-ibm text-[12px] font-semibold" style={{ color:signal.color }}>
          {signal.score}/{signal.max}
        </span>
      </div>
      <div className="h-[4px] rounded-full overflow-hidden mb-1" style={{ background:`${signal.color}22` }}>
        <motion.div className="h-full rounded-full" style={{ background:signal.color }}
          initial={{ width:0 }} animate={{ width:`${pct}%` }}
          transition={{ duration:0.9, delay, ease:[0.4,0,0.2,1] }}/>
      </div>
      <p className="text-[11.5px]" style={{ color:MUTED_L, lineHeight:1.5 }}>{signal.desc}</p>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function AiOrgTrustScore() {
  const [search, setSearch]       = useState('');
  const [selected, setSelected]   = useState<OrgTrust>(ORGS[0]);
  const [filterTier, setFilterTier] = useState<OrgTrust['tier']|'ALL'>('ALL');
  const detailRef = useRef<HTMLDivElement>(null);

  const filtered = ORGS.filter(o => {
    const ms = o.name.toLowerCase().includes(search.toLowerCase()) ||
               o.district.toLowerCase().includes(search.toLowerCase()) ||
               o.category.toLowerCase().includes(search.toLowerCase());
    const mt = filterTier === 'ALL' || o.tier === filterTier;
    return ms && mt;
  });

  function selectOrg(org: OrgTrust) {
    setSelected(org);
    setTimeout(() => detailRef.current?.scrollIntoView({ behavior:'smooth', block:'start' }), 100);
  }

  const tier = TIER_META[selected.tier];

  return (
    <div style={{ background:INK, color:PAPER, minHeight:'100vh', overflowX:'hidden' }}>

      {/* ══ HERO ══════════════════════════════════════════════════════════ */}
      <section className="relative" style={{ padding:'80px 32px 64px', overflow:'hidden' }}>
        <div className="pointer-events-none absolute rounded-full"
          style={{ top:-160, right:-180, width:500, height:500, background:'radial-gradient(circle,rgba(231,169,59,0.11),transparent 70%)' }}/>
        <div className="pointer-events-none absolute rounded-full"
          style={{ bottom:-80, left:-120, width:360, height:360, background:'radial-gradient(circle,rgba(34,197,94,0.07),transparent 70%)' }}/>
        <div className="mx-auto" style={{ maxWidth:1180 }}>
          <Reveal><div className="mb-5"><Eyebrow label="AI · Organisation Trust Score · Composite Evaluation" color={MARIGOLD}/></div></Reveal>
          <Reveal delay={70}>
            <h1 className="font-fraunces mb-5" style={{ fontSize:'clamp(36px,4.8vw,58px)', lineHeight:1.04, fontWeight:600 }}>
              Organisation<br/><span style={{ color:MARIGOLD }}>Trust Score</span>
            </h1>
          </Reveal>
          <Reveal delay={140}>
            <p style={{ color:MUTED_L, fontSize:16, lineHeight:1.72, maxWidth:560 }}>
              Every NGO on ShebaBD earns a composite Trust Score from 0–100, built from
              6 independent signals — government registration, financial transparency,
              community reviews, volunteer feedback, AI fraud detection, and impact proof.
            </p>
          </Reveal>
          <Reveal delay={210}>
            <div className="flex flex-wrap gap-6 mt-8">
              {[
                { label:'Platinum', color:SKY,    count:'4' },
                { label:'Gold',     color:MARIGOLD,count:'312' },
                { label:'Silver',   color:MUTED_L, count:'891' },
                { label:'Bronze',   color:WARN,    count:'1,203' },
              ].map(({ label, color, count }) => (
                <div key={label} className="flex items-center gap-2">
                  <span className="w-[8px] h-[8px] rounded-full inline-block" style={{ background:color }}/>
                  <span className="font-mono-ibm text-[12px]" style={{ color:MUTED_L }}>
                    {count} {label}
                  </span>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ══ STATS BAR ═════════════════════════════════════════════════════ */}
      <section style={{ borderTop:`1px solid ${LINE_L}`, borderBottom:`1px solid ${LINE_L}`, background:INK2 }}>
        <div className="mx-auto" style={{ maxWidth:1180 }}>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)' }}>
            {[
              { num:'2,410',  label:'NGOs Scored',         sub:'updated every 6 hours'       },
              { num:'6',      label:'Trust Signals',        sub:'per organisation'            },
              { num:'99.1%',  label:'Verification Accuracy',sub:'confirmed by human auditors' },
              { num:'247',    label:'Flagged This Month',   sub:'under review or suspended'   },
            ].map(({ num, label, sub }, i) => (
              <Reveal key={label} delay={i*60}
                style={{ padding:'26px 24px', borderRight:i<3?`1px solid ${LINE_L}`:'none', textAlign:'center' }}>
                <span className="block font-mono-ibm font-bold mb-[4px]"
                  style={{ fontSize:'clamp(20px,2.2vw,30px)', color:PAPER }}>{num}</span>
                <span className="block text-[13px] font-medium mb-[2px]" style={{ color:PAPER }}>{label}</span>
                <span className="block font-mono-ibm text-[11px]" style={{ color:MUTED_L }}>{sub}</span>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ══ ORG LIST + DETAIL ═════════════════════════════════════════════ */}
      <section className="px-8 py-[70px]">
        <div className="mx-auto" style={{ maxWidth:1180 }}>
          <Reveal>
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
              <div>
                <Eyebrow label="Trust Leaderboard" color={MARIGOLD}/>
                <h2 className="font-fraunces mt-3" style={{ fontSize:'clamp(22px,2.6vw,32px)', fontWeight:600 }}>
                  Browse trust scores
                </h2>
              </div>
              {/* search + filter */}
              <div className="flex items-center gap-3 flex-wrap">
                <div className="flex items-center gap-2"
                  style={{ background:INK2, border:`1px solid ${LINE_L}`, borderRadius:2, padding:'10px 14px', minWidth:220 }}>
                  <Search size={14} style={{ color:MUTED_L }}/>
                  <input type="text" value={search} onChange={e => setSearch(e.target.value)}
                    placeholder="Search organisations…"
                    className="bg-transparent border-none outline-none placeholder-[rgba(247,241,225,0.35)] text-[13.5px] w-full"
                    style={{ color:PAPER, fontFamily:'Inter, sans-serif' }}/>
                </div>
                <div className="flex gap-1">
                  {(['ALL','PLATINUM','GOLD','SILVER','BRONZE'] as const).map(t => {
                    const active = filterTier === t;
                    const col = t==='ALL' ? MUTED_L : TIER_META[t].color;
                    return (
                      <button key={t} onClick={() => setFilterTier(t)}
                        style={{
                          padding:'7px 12px', borderRadius:100, fontSize:11.5,
                          border:`1px solid ${active ? col : LINE_L}`,
                          background: active ? `${col}22` : 'transparent',
                          color: active ? col : MUTED_L,
                          fontFamily:"'IBM Plex Mono',monospace", fontWeight:600,
                          cursor:'pointer', transition:'all 0.15s',
                        }}
                        onMouseEnter={e => { if(!active){ e.currentTarget.style.borderColor=col; e.currentTarget.style.color=col; }}}
                        onMouseLeave={e => { if(!active){ e.currentTarget.style.borderColor=LINE_L; e.currentTarget.style.color=MUTED_L; }}}>
                        {t==='ALL'?'All':TIER_META[t].label.split(' ')[0]}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </Reveal>

          <div style={{ display:'grid', gridTemplateColumns:'1fr 1.3fr', gap:8, alignItems:'start' }}>
            {/* org list */}
            <Reveal delay={60}>
              <div style={{ background:INK2, border:`1px solid ${LINE_L}`, borderRadius:3 }}>
                {filtered.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16" style={{ color:MUTED_L }}>
                    <ShieldCheck size={40} style={{ opacity:0.2, marginBottom:12 }}/>
                    <p className="font-fraunces text-[16px]">No organisations found</p>
                  </div>
                ) : filtered.map((org, i) => {
                  const t = TIER_META[org.tier];
                  const isActive = selected.id === org.id;
                  return (
                    <motion.div key={org.id}
                      initial={{ opacity:0, x:-12 }} animate={{ opacity:1, x:0 }}
                      transition={{ duration:0.3, delay:i*0.05 }}
                      className="flex items-center gap-3 cursor-pointer"
                      style={{
                        padding:'16px 18px',
                        borderBottom: i < filtered.length-1 ? `1px solid ${LINE_L}` : 'none',
                        background: isActive ? `${t.color}12` : 'transparent',
                        borderLeft: isActive ? `3px solid ${t.color}` : '3px solid transparent',
                        transition:'all 0.18s ease',
                      }}
                      onClick={() => selectOrg(org)}
                      onMouseEnter={e => { if(!isActive) e.currentTarget.style.background=INK3; }}
                      onMouseLeave={e => { if(!isActive) e.currentTarget.style.background='transparent'; }}>
                      {/* rank */}
                      <span className="font-mono-ibm text-[11px] w-5 flex-shrink-0" style={{ color:MUTED_L }}>
                        {String(i+1).padStart(2,'0')}
                      </span>
                      {/* initial */}
                      <div className="flex items-center justify-center rounded-full font-fraunces font-bold text-[15px] flex-shrink-0"
                        style={{ width:36, height:36, background:`${t.color}18`, color:t.color, border:`1.5px solid ${t.color}44` }}>
                        {org.initial}
                      </div>
                      {/* info */}
                      <div className="flex-1 min-w-0">
                        <p className="font-fraunces font-semibold text-[14px] truncate" style={{ color:PAPER }}>{org.name}</p>
                        <div className="flex items-center gap-2 mt-[2px]">
                          <span className="font-mono-ibm text-[10.5px]" style={{ color:MUTED_L }}>{org.district}</span>
                          <span className="inline-flex items-center gap-[4px] font-mono-ibm text-[10.5px] px-[7px] py-[2px] rounded-full"
                            style={{ color:t.color, background:t.bg, border:`1px solid ${t.color}33` }}>
                            {t.icon} {t.label}
                          </span>
                        </div>
                      </div>
                      {/* score */}
                      <span className="font-mono-ibm font-bold text-[18px] flex-shrink-0" style={{ color:t.color }}>
                        {org.trustScore}
                      </span>
                    </motion.div>
                  );
                })}
              </div>
            </Reveal>

            {/* detail panel */}
            <Reveal delay={120}>
              <div ref={detailRef}
                style={{ background:INK2, border:`1px solid ${tier.color}44`, borderRadius:3, overflow:'hidden' }}>
                {/* header */}
                <div style={{ padding:'22px 22px', background:tier.bg, borderBottom:`1px solid ${LINE_L}` }}>
                  <div className="flex items-start justify-between gap-4 flex-wrap mb-4">
                    <div>
                      <span className="inline-flex items-center gap-[6px] font-mono-ibm text-[11px] font-semibold px-[10px] py-[4px] rounded-full mb-2"
                        style={{ color:tier.color, background:`${tier.color}18`, border:`1px solid ${tier.color}33` }}>
                        {tier.icon} {tier.label}
                      </span>
                      <p className="font-fraunces font-semibold text-[20px]" style={{ color:PAPER, lineHeight:1.2 }}>{selected.name}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <MapPin size={11} style={{ color:MUTED_L }}/>
                        <span className="font-mono-ibm text-[11.5px]" style={{ color:MUTED_L }}>{selected.district} · {selected.category}</span>
                      </div>
                    </div>
                    <TrustRing score={selected.trustScore} color={tier.color} size={110}/>
                  </div>
                  {/* quick stats */}
                  <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:1, background:LINE_L }}>
                    {[
                      { label:'Registered', value:selected.registered, color:MUTED_L },
                      { label:'Last Audit',  value:selected.lastAudit,  color:SAFE    },
                      { label:'Total Raised',value:selected.donations,  color:DISC    },
                    ].map(({ label, value, color }) => (
                      <div key={label} style={{ background:tier.bg, padding:'10px 12px' }}>
                        <p className="font-mono-ibm text-[10.5px] mb-[2px]" style={{ color:MUTED_L }}>{label}</p>
                        <p className="font-semibold text-[13.5px]" style={{ color }}>{value}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* AI summary */}
                <div style={{ padding:'18px 22px', borderBottom:`1px solid ${LINE_L}` }}>
                  <p className="font-mono-ibm text-[11px] uppercase tracking-[0.08em] mb-2" style={{ color:MUTED_L }}>AI TRUST ANALYSIS</p>
                  <p className="text-[13.5px]" style={{ color:MUTED_L, lineHeight:1.68 }}>{selected.summary}</p>
                </div>

                {/* trust signals */}
                <div style={{ padding:'18px 22px' }}>
                  <p className="font-mono-ibm text-[11px] uppercase tracking-[0.08em] mb-4" style={{ color:MUTED_L }}>SIGNAL BREAKDOWN</p>
                  <div className="space-y-5">
                    {selected.signals.map((sig, i) => (
                      <SignalRow key={sig.label} signal={sig} delay={i*0.08}/>
                    ))}
                  </div>
                  <div className="mt-5 pt-4 flex items-center justify-between" style={{ borderTop:`1px solid ${LINE_L}` }}>
                    <div className="flex items-center gap-2">
                      <Clock size={12} style={{ color:MUTED_L }}/>
                      <span className="font-mono-ibm text-[11px]" style={{ color:MUTED_L }}>Updated every 6 hours</span>
                    </div>
                    <Link to={ROUTES.ORGANIZATIONS}
                      className="inline-flex items-center gap-1 font-mono-ibm text-[12px] px-3 py-[7px] rounded-[2px]"
                      style={{ border:`1px solid ${tier.color}44`, color:tier.color, transition:'all 0.15s' }}
                      onMouseEnter={e => { e.currentTarget.style.background=`${tier.color}18`; }}
                      onMouseLeave={e => { e.currentTarget.style.background='transparent'; }}>
                      View Profile <ChevronRight size={12}/>
                    </Link>
                  </div>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ══ HOW IT WORKS ══════════════════════════════════════════════════ */}
      <section className="px-8 py-[90px]" style={{ background:INK2, borderTop:`1px solid ${LINE_L}`, borderBottom:`1px solid ${LINE_L}` }}>
        <div className="mx-auto" style={{ maxWidth:1180 }}>
          <Reveal>
            <div className="text-center mb-12">
              <Eyebrow label="Trust Architecture" color={SKY}/>
              <h2 className="font-fraunces mt-4 mb-3" style={{ fontSize:'clamp(26px,3vw,38px)', fontWeight:600 }}>
                How Trust Scores are built
              </h2>
              <p style={{ color:MUTED_L, fontSize:15, maxWidth:500, margin:'0 auto' }}>
                6 independent signals, each verified by AI and human auditors, updated every 6 hours.
              </p>
            </div>
          </Reveal>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:1, background:LINE_L, border:`1px solid ${LINE_L}` }}>
            {HOW_SIGNALS.map(({ icon, color, title, desc }, i) => (
              <Reveal key={title} delay={i*60}
                style={{ background:INK2, padding:'32px 28px', transition:'background 0.22s ease' }}>
                <div
                  onMouseEnter={e => { const p=e.currentTarget.parentElement; if(p) p.style.background=INK3; }}
                  onMouseLeave={e => { const p=e.currentTarget.parentElement; if(p) p.style.background=INK2; }}>
                  <div className="flex items-center justify-center mb-4 rounded-full"
                    style={{ width:44, height:44, background:`${color}18`, border:`1.5px solid ${color}44`, color }}>
                    {icon}
                  </div>
                  <h3 className="font-fraunces font-semibold mb-2" style={{ fontSize:16, color:PAPER }}>{title}</h3>
                  <p style={{ fontSize:13, lineHeight:1.65, color:MUTED_L }}>{desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ══ TIER EXPLAINER ════════════════════════════════════════════════ */}
      <section className="px-8 py-[80px]">
        <div className="mx-auto" style={{ maxWidth:1180 }}>
          <Reveal>
            <div className="text-center mb-10">
              <Eyebrow label="Trust Tiers" color={MARIGOLD}/>
              <h2 className="font-fraunces mt-4" style={{ fontSize:'clamp(24px,2.8vw,36px)', fontWeight:600 }}>
                What each tier means
              </h2>
            </div>
          </Reveal>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:1, background:LINE_L, border:`1px solid ${LINE_L}` }}>
            {([
              { tier:'PLATINUM' as const, range:'90–100', desc:'Full verification on all 6 signals. Gold standard for donors and volunteers.' },
              { tier:'GOLD'     as const, range:'75–89',  desc:'Strong verification with minor documentation gaps. Highly recommended.' },
              { tier:'SILVER'   as const, range:'55–74',  desc:'Registered and operational but incomplete transparency or impact proof.' },
              { tier:'BRONZE'   as const, range:'35–54',  desc:'Basic registration only. Use caution — limited verifiable information.' },
            ] as const).map(({ tier, range, desc }, i) => {
              const t = TIER_META[tier];
              return (
                <Reveal key={tier} delay={i*60}
                  style={{ background:INK, padding:'28px 24px', transition:'background 0.22s ease' }}>
                  <div
                    onMouseEnter={e => { const p=e.currentTarget.parentElement; if(p) p.style.background=INK2; }}
                    onMouseLeave={e => { const p=e.currentTarget.parentElement; if(p) p.style.background=INK; }}>
                    <span className="inline-flex items-center gap-[6px] font-mono-ibm text-[11px] font-semibold px-[9px] py-[4px] rounded-full mb-3"
                      style={{ color:t.color, background:t.bg, border:`1px solid ${t.color}33` }}>
                      {t.icon} {t.label}
                    </span>
                    <p className="font-mono-ibm font-bold text-[22px] mb-1" style={{ color:t.color }}>{range}</p>
                    <p className="font-mono-ibm text-[10.5px] mb-3" style={{ color:MUTED_L }}>Trust Score</p>
                    <p style={{ fontSize:13, lineHeight:1.65, color:MUTED_L }}>{desc}</p>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* ══ CTA ════════════════════════════════════════════════════════════ */}
      <section className="px-8 py-[80px]" style={{ background:INK2, borderTop:`1px solid ${LINE_L}` }}>
        <div className="mx-auto text-center" style={{ maxWidth:620 }}>
          <Reveal>
            <h2 className="font-fraunces mb-4" style={{ fontSize:'clamp(26px,3vw,38px)', fontWeight:600 }}>
              Trust is earned, not given
            </h2>
            <p style={{ color:MUTED_L, fontSize:15.5, lineHeight:1.7, marginBottom:32 }}>
              Every score on ShebaBD is independently verified. Donate and volunteer with confidence — you know exactly who you're supporting.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link to={ROUTES.ORGANIZATIONS}
                className="inline-flex items-center gap-2 px-[26px] py-[14px] font-semibold text-[14px] rounded-[2px]"
                style={{ background:MARIGOLD, color:INK, transition:'all 0.2s' }}
                onMouseEnter={e => { e.currentTarget.style.opacity='0.88'; e.currentTarget.style.transform='translateY(-2px)'; }}
                onMouseLeave={e => { e.currentTarget.style.opacity='1'; e.currentTarget.style.transform='translateY(0)'; }}>
                <ShieldCheck size={15}/> Browse Verified NGOs
              </Link>
              <Link to={ROUTES.AI_NGO_DETECTION}
                className="inline-flex items-center gap-2 px-[26px] py-[14px] font-semibold text-[14px] rounded-[2px]"
                style={{ border:`1px solid ${LINE_L}`, color:PAPER, transition:'border-color 0.2s' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor=MUTED_L; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor=LINE_L; }}>
                NGO Fraud Detection <ChevronRight size={15}/>
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

    </div>
  );
}

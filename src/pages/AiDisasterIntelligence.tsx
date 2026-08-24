import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Satellite, AlertTriangle, MapPin, Clock, Users,
  Building2, Zap, TrendingUp, Radio, ShieldCheck,
  CloudRain, Wind, Waves, Flame, ChevronRight,
  Activity, Phone, CheckCircle2, XCircle, Eye,
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
type Severity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'MONITORING';
type DisasterType = 'flood' | 'cyclone' | 'fire' | 'drought';

interface DisasterEvent {
  id: number;
  type: DisasterType;
  title: string;
  district: string;
  division: string;
  severity: Severity;
  affectedPeople: string;
  status: 'active' | 'contained' | 'monitoring';
  updated: string;
  lat: number; lng: number;    // % positions on the map grid
  orgs: number;
  volunteers: number;
  description: string;
}

const SEV_META: Record<Severity, { color: string; bg: string; label: string }> = {
  CRITICAL:   { color: DANGER,   bg: 'rgba(239,68,68,0.14)',  label: 'Critical'   },
  HIGH:       { color: DISC,     bg: 'rgba(214,71,44,0.14)',  label: 'High'       },
  MEDIUM:     { color: WARN,     bg: 'rgba(245,158,11,0.12)', label: 'Medium'     },
  MONITORING: { color: MARIGOLD, bg: 'rgba(231,169,59,0.10)', label: 'Monitoring' },
};

const TYPE_META: Record<DisasterType, { icon: React.ReactNode; color: string; label: string }> = {
  flood:   { icon: <Waves size={16}/>,     color: SKY,    label: 'Flood'   },
  cyclone: { icon: <Wind size={16}/>,      color: MARIGOLD,label: 'Cyclone'},
  fire:    { icon: <Flame size={16}/>,     color: DISC,   label: 'Fire'    },
  drought: { icon: <CloudRain size={16}/>, color: WARN,   label: 'Drought' },
};

const EVENTS: DisasterEvent[] = [
  { id:1, type:'flood',   title:'Flash Flood — Haor Basin',       district:'Sunamganj',  division:'Sylhet',      severity:'CRITICAL',   affectedPeople:'142,000', status:'active',     updated:'2h ago',  lat:28, lng:72, orgs:14, volunteers:820,  description:'Unprecedented monsoon flooding across Haor wetlands displacing 142,000 people. Water level 2.8m above danger mark.' },
  { id:2, type:'cyclone', title:'Cyclone Alert — Bay of Bengal',   district:'Cox\'s Bazar',division:'Chittagong',  severity:'HIGH',       affectedPeople:'86,000',  status:'active',     updated:'45m ago', lat:68, lng:78, orgs:11, volunteers:540,  description:'Category 3 cyclone tracking northeast. Landfall expected within 36 hours. Coastal evacuation in progress.' },
  { id:3, type:'flood',   title:'River Erosion — Jamuna',         district:'Sirajganj',  division:'Rajshahi',    severity:'HIGH',       affectedPeople:'54,000',  status:'active',     updated:'4h ago',  lat:38, lng:42, orgs:8,  volunteers:310,  description:'Severe bank erosion from Jamuna river. 54,000 residents at risk. Emergency embankment work underway.' },
  { id:4, type:'fire',    title:'Industrial Fire',                 district:'Narayanganj',division:'Dhaka',       severity:'MEDIUM',     affectedPeople:'3,200',   status:'contained',  updated:'6h ago',  lat:45, lng:50, orgs:5,  volunteers:180,  description:'Factory fire now 80% contained. 3,200 workers displaced temporarily. Air quality monitoring active.' },
  { id:5, type:'flood',   title:'Urban Waterlogging',              district:'Dhaka',      division:'Dhaka',       severity:'MEDIUM',     affectedPeople:'210,000', status:'monitoring', updated:'1h ago',  lat:44, lng:48, orgs:7,  volunteers:250,  description:'Severe waterlogging in low-lying areas after 180mm rainfall in 6 hours. Pump stations at capacity.' },
  { id:6, type:'drought', title:'Crop Drought Warning',            district:'Rajshahi',   division:'Rajshahi',    severity:'MONITORING', affectedPeople:'28,000',  status:'monitoring', updated:'12h ago', lat:32, lng:35, orgs:4,  volunteers:90,   description:'Soil moisture deficit 40% below seasonal average. Rice crop yield at risk for 28,000 farming households.' },
];

const RECOMMENDED_ORGS = [
  { name:'Bangladesh Red Crescent', district:'Dhaka',       speciality:'Flood Relief',    volunteers:5000, verified:true,  phone:'+880 2-9330188' },
  { name:'Khulna Disaster Response',district:'Khulna',      speciality:'Cyclone Prep',    volunteers:650,  verified:true,  phone:'+880 41-723589' },
  { name:'CRP Bangladesh',          district:'Dhaka',       speciality:'Medical Response',volunteers:450,  verified:true,  phone:'+880 2-7791814' },
  { name:'Sylhet Blood Bank',       district:'Sylhet',      speciality:'Emergency Blood', volunteers:1200, verified:true,  phone:'+880 821-713456'},
  { name:'BRAC Bangladesh',         district:'Nationwide',  speciality:'Displacement Aid',volunteers:3200, verified:true,  phone:'+880 2-9881265' },
];

const RESPONSE_STATS = [
  { label:'Active Disasters',      value:'6',        color:DANGER   },
  { label:'Orgs Deployed',         value:'49',       color:DISC     },
  { label:'Volunteers Mobilised',  value:'2,190',    color:LEAF     },
  { label:'People Reached',        value:'523,200',  color:SKY      },
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

function Eyebrow({ label, color=DANGER }: { label:string; color?:string }) {
  return (
    <div className="inline-flex items-center gap-[9px] font-mono-ibm text-[12px] tracking-[0.11em] uppercase"
      style={{ color:MUTED_L }}>
      <span className="inline-block w-[6px] h-[6px] rounded-full" style={{ background:color }} />
      {label}
    </div>
  );
}

function SevBadge({ severity }: { severity: Severity }) {
  const m = SEV_META[severity];
  return (
    <span className="inline-flex items-center gap-[5px] font-mono-ibm text-[10.5px] font-semibold px-[9px] py-[3px] rounded-full"
      style={{ color:m.color, background:m.bg, border:`1px solid ${m.color}33` }}>
      {m.label}
    </span>
  );
}

// ─── Bangladesh map grid ──────────────────────────────────────────────────────
function DisasterMap({ events, selected, onSelect }: {
  events: DisasterEvent[]; selected: number|null; onSelect:(id:number)=>void;
}) {
  return (
    <div className="relative rounded-[3px] overflow-hidden"
      style={{ background:'#060F0A', border:`1px solid ${LINE_L}`, aspectRatio:'4/3', minHeight:320 }}>
      {/* grid lines */}
      {[...Array(8)].map((_,i) => (
        <div key={`h${i}`} className="absolute w-full" style={{ top:`${i*14.3}%`, borderTop:`1px solid ${LINE_L}`, opacity:0.4 }} />
      ))}
      {[...Array(8)].map((_,i) => (
        <div key={`v${i}`} className="absolute h-full" style={{ left:`${i*14.3}%`, borderLeft:`1px solid ${LINE_L}`, opacity:0.4 }} />
      ))}

      {/* Bangladesh outline text */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <span className="font-mono-ibm text-[11px] tracking-[0.12em] uppercase" style={{ color:LINE_L }}>
          Bangladesh · 64 Districts
        </span>
      </div>

      {/* Division labels */}
      {[
        { label:'DHAKA',      x:'42%', y:'47%' },
        { label:'CHITTAGONG', x:'66%', y:'70%' },
        { label:'SYLHET',     x:'70%', y:'25%' },
        { label:'RAJSHAHI',   x:'28%', y:'36%' },
        { label:'KHULNA',     x:'24%', y:'62%' },
        { label:'BARISAL',    x:'42%', y:'68%' },
        { label:'MYMENSINGH', x:'48%', y:'28%' },
      ].map(({ label, x, y }) => (
        <span key={label} className="absolute font-mono-ibm text-[9px] tracking-[0.08em] pointer-events-none"
          style={{ left:x, top:y, color:MUTED_L, opacity:0.5, transform:'translate(-50%,-50%)' }}>
          {label}
        </span>
      ))}

      {/* Event pins */}
      {events.map(ev => {
        const m = SEV_META[ev.severity];
        const t = TYPE_META[ev.type];
        const isSelected = selected === ev.id;
        return (
          <button key={ev.id} onClick={() => onSelect(ev.id)}
            className="absolute flex items-center justify-center rounded-full cursor-pointer"
            style={{
              left:`${ev.lng}%`, top:`${ev.lat}%`,
              transform:'translate(-50%,-50%)',
              width: isSelected ? 36 : 28,
              height: isSelected ? 36 : 28,
              background: m.bg,
              border: `2px solid ${m.color}`,
              color: m.color,
              transition:'all 0.2s ease',
              boxShadow: isSelected ? `0 0 20px ${m.color}66` : 'none',
              zIndex: isSelected ? 10 : 1,
            }}>
            {/* pulse ring */}
            {ev.status === 'active' && (
              <motion.div className="absolute rounded-full"
                style={{ width:'100%', height:'100%', border:`2px solid ${m.color}`, borderRadius:'50%' }}
                animate={{ scale:[1,1.8,1], opacity:[0.7,0,0.7] }}
                transition={{ duration:2, repeat:Infinity, ease:'easeInOut' }} />
            )}
            <span style={{ fontSize:13 }}>{t.icon}</span>
          </button>
        );
      })}

      {/* live badge */}
      <div className="absolute top-3 left-3 inline-flex items-center gap-2 font-mono-ibm text-[10.5px] px-3 py-1.5 rounded-full"
        style={{ background:INK2, border:`1px solid ${DANGER}44`, color:DANGER }}>
        <motion.span className="w-[6px] h-[6px] rounded-full inline-block" style={{ background:DANGER }}
          animate={{ opacity:[1,0.2,1] }} transition={{ duration:1.2, repeat:Infinity }} />
        LIVE
      </div>

      {/* legend */}
      <div className="absolute bottom-3 right-3 flex flex-col gap-1"
        style={{ background:'rgba(6,15,10,0.85)', border:`1px solid ${LINE_L}`, borderRadius:3, padding:'8px 10px' }}>
        {Object.entries(TYPE_META).map(([key, { icon, label, color }]) => (
          <div key={key} className="flex items-center gap-2">
            <span style={{ color, fontSize:11 }}>{icon}</span>
            <span className="font-mono-ibm text-[10px]" style={{ color:MUTED_L }}>{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function AiDisasterIntelligence() {
  const [selected, setSelected]   = useState<number>(1);
  const [filterSev, setFilterSev] = useState<Severity|'ALL'>('ALL');
  const [ticker, setTicker]       = useState(0);

  // rotating alert ticker
  useEffect(() => {
    const t = setInterval(() => setTicker(p => (p+1) % EVENTS.filter(e=>e.status==='active').length), 4000);
    return () => clearInterval(t);
  }, []);

  const filtered = EVENTS.filter(e => filterSev==='ALL' || e.severity===filterSev);
  const activeEvent = EVENTS.find(e => e.id===selected) ?? EVENTS[0];
  const activeOrgs  = EVENTS.filter(e=>e.status==='active');

  return (
    <div style={{ background:INK, color:PAPER, minHeight:'100vh', overflowX:'hidden' }}>

      {/* ══ HERO ═══════════════════════════════════════════════════════════ */}
      <section className="relative" style={{ padding:'80px 32px 56px', overflow:'hidden' }}>
        <div className="pointer-events-none absolute rounded-full"
          style={{ top:-160, right:-180, width:520, height:520, background:'radial-gradient(circle, rgba(239,68,68,0.10), transparent 70%)' }} />
        <div className="pointer-events-none absolute rounded-full"
          style={{ bottom:-80, left:-120, width:380, height:380, background:'radial-gradient(circle, rgba(231,169,59,0.07), transparent 70%)' }} />
        <div className="mx-auto" style={{ maxWidth:1180 }}>
          <Reveal><div className="mb-5"><Eyebrow label="AI · Disaster Intelligence · Live Feed" color={DANGER} /></div></Reveal>
          <Reveal delay={70}>
            <div className="flex items-start justify-between gap-6 flex-wrap">
              <div>
                <h1 className="font-fraunces mb-4"
                  style={{ fontSize:'clamp(36px,4.8vw,58px)', lineHeight:1.04, fontWeight:600 }}>
                  Disaster Intelligence<br /><span style={{ color:DANGER }}>Dashboard</span>
                </h1>
                <p style={{ color:MUTED_L, fontSize:16, lineHeight:1.7, maxWidth:540 }}>
                  Real-time monitoring of natural disasters, affected-area visualization, and AI-powered
                  emergency organisation recommendations across all 64 districts of Bangladesh.
                </p>
              </div>
              {/* live alert ticker */}
              <div style={{ background:INK2, border:`1px solid ${DANGER}44`, borderRadius:3, padding:'16px 20px', minWidth:280 }}>
                <div className="flex items-center gap-2 mb-2">
                  <motion.span className="w-[7px] h-[7px] rounded-full" style={{ background:DANGER, display:'inline-block' }}
                    animate={{ opacity:[1,0.2,1] }} transition={{ duration:1, repeat:Infinity }} />
                  <span className="font-mono-ibm text-[11px] tracking-[0.08em]" style={{ color:DANGER }}>LIVE ALERT</span>
                </div>
                <AnimatePresence mode="wait">
                  <motion.p key={ticker} initial={{ opacity:0, y:6 }} animate={{ opacity:1, y:0 }}
                    exit={{ opacity:0, y:-6 }} transition={{ duration:0.3 }}
                    className="font-fraunces text-[15px] font-semibold" style={{ color:PAPER }}>
                    {activeOrgs[ticker % activeOrgs.length]?.title}
                  </motion.p>
                </AnimatePresence>
                <p className="font-mono-ibm text-[11.5px] mt-1" style={{ color:MUTED_L }}>
                  {activeOrgs[ticker % activeOrgs.length]?.district} ·{' '}
                  {activeOrgs[ticker % activeOrgs.length]?.affectedPeople} affected
                </p>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ══ RESPONSE STATS ═════════════════════════════════════════════════ */}
      <section style={{ borderTop:`1px solid ${LINE_L}`, borderBottom:`1px solid ${LINE_L}`, background:INK2 }}>
        <div className="mx-auto" style={{ maxWidth:1180 }}>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)' }}>
            {RESPONSE_STATS.map(({ label, value, color }, i) => (
              <Reveal key={label} delay={i*70}
                style={{ padding:'26px 24px', borderRight:i<3?`1px solid ${LINE_L}`:'none', textAlign:'center' }}>
                <span className="block font-mono-ibm font-bold mb-[4px]"
                  style={{ fontSize:'clamp(20px,2.2vw,30px)', color:PAPER }}>{value}</span>
                <span className="block text-[13px] font-medium" style={{ color }}>{label}</span>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ══ MAP + SELECTED EVENT ═══════════════════════════════════════════ */}
      <section className="px-8 py-[70px]">
        <div className="mx-auto" style={{ maxWidth:1180 }}>
          <Reveal>
            <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
              <div>
                <Eyebrow label="Affected Area Visualisation" color={DANGER} />
                <h2 className="font-fraunces mt-3"
                  style={{ fontSize:'clamp(22px,2.6vw,32px)', fontWeight:600 }}>
                  Live disaster map
                </h2>
              </div>
              <div className="flex flex-wrap gap-2">
                {(['ALL','CRITICAL','HIGH','MEDIUM','MONITORING'] as const).map(s => {
                  const active = filterSev === s;
                  const col = s==='ALL' ? MUTED_L : SEV_META[s].color;
                  return (
                    <button key={s} onClick={() => setFilterSev(s)}
                      style={{
                        padding:'7px 14px', borderRadius:100, border:`1px solid ${active ? col : LINE_L}`,
                        background: active ? `${col}22` : 'transparent', color: active ? col : MUTED_L,
                        fontFamily:"'IBM Plex Mono', monospace", fontSize:11.5, fontWeight:600,
                        cursor:'pointer', transition:'all 0.16s',
                      }}
                      onMouseEnter={e => { if(!active){ e.currentTarget.style.borderColor=col; e.currentTarget.style.color=col; }}}
                      onMouseLeave={e => { if(!active){ e.currentTarget.style.borderColor=LINE_L; e.currentTarget.style.color=MUTED_L; }}}>
                      {s==='ALL' ? 'All' : SEV_META[s].label}
                    </button>
                  );
                })}
              </div>
            </div>
          </Reveal>

          <div style={{ display:'grid', gridTemplateColumns:'1.4fr 1fr', gap:8, alignItems:'start' }}>
            {/* Map */}
            <Reveal delay={60}>
              <DisasterMap events={filtered} selected={selected} onSelect={setSelected} />
            </Reveal>

            {/* Selected event detail */}
            <Reveal delay={120}>
              <div style={{ background:INK2, border:`1px solid ${SEV_META[activeEvent.severity].color}44`, borderRadius:3 }}>
                {/* header */}
                <div style={{ padding:'18px 20px', background:SEV_META[activeEvent.severity].bg, borderBottom:`1px solid ${LINE_L}` }}>
                  <div className="flex items-center justify-between gap-3 mb-2">
                    <span style={{ color:TYPE_META[activeEvent.type].color }}>
                      {TYPE_META[activeEvent.type].icon}
                    </span>
                    <SevBadge severity={activeEvent.severity} />
                  </div>
                  <p className="font-fraunces font-semibold text-[17px]" style={{ color:PAPER, lineHeight:1.25 }}>
                    {activeEvent.title}
                  </p>
                  <p className="font-mono-ibm text-[11.5px] mt-1" style={{ color:MUTED_L }}>
                    {activeEvent.district} · {activeEvent.division} Division
                  </p>
                </div>

                {/* stats grid */}
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:1, background:LINE_L,
                  margin:'0', borderBottom:`1px solid ${LINE_L}` }}>
                  {[
                    { label:'Affected People',  value:activeEvent.affectedPeople, color:DANGER },
                    { label:'Response Status',  value:activeEvent.status.charAt(0).toUpperCase()+activeEvent.status.slice(1), color:activeEvent.status==='active'?DISC:activeEvent.status==='contained'?SAFE:MARIGOLD },
                    { label:'Orgs Deployed',    value:`${activeEvent.orgs} NGOs`,  color:SKY   },
                    { label:'Volunteers',       value:activeEvent.volunteers.toLocaleString(), color:LEAF },
                  ].map(({ label, value, color }) => (
                    <div key={label} style={{ background:INK2, padding:'14px 16px' }}>
                      <p className="font-mono-ibm text-[10.5px] mb-1" style={{ color:MUTED_L }}>{label}</p>
                      <p className="font-semibold text-[15px]" style={{ color }}>{value}</p>
                    </div>
                  ))}
                </div>

                {/* description */}
                <div style={{ padding:'16px 20px', borderBottom:`1px solid ${LINE_L}` }}>
                  <p className="font-mono-ibm text-[11px] mb-1" style={{ color:MUTED_L }}>AI SITUATION ANALYSIS</p>
                  <p className="text-[13.5px]" style={{ color:MUTED_L, lineHeight:1.65 }}>{activeEvent.description}</p>
                  <p className="font-mono-ibm text-[11px] mt-2" style={{ color:MUTED_L }}>Updated {activeEvent.updated}</p>
                </div>

                {/* actions */}
                <div style={{ padding:'16px 20px' }}>
                  <Link to={ROUTES.EMERGENCY}
                    className="inline-flex items-center gap-2 w-full justify-center px-5 py-[11px] font-semibold text-[13.5px] rounded-[2px]"
                    style={{ background:DISC, color:PAPER, transition:'all 0.2s' }}
                    onMouseEnter={e => { e.currentTarget.style.background=DISC_DIM; }}
                    onMouseLeave={e => { e.currentTarget.style.background=DISC; }}>
                    <AlertTriangle size={15}/> Submit Emergency Request
                  </Link>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ══ EVENT LIST ═════════════════════════════════════════════════════ */}
      <section className="px-8 pb-[80px]" style={{ borderTop:`1px solid ${LINE_L}` }}>
        <div className="mx-auto pt-[60px]" style={{ maxWidth:1180 }}>
          <Reveal>
            <div className="mb-6">
              <Eyebrow label="All Active Events" color={DISC} />
              <h2 className="font-fraunces mt-3"
                style={{ fontSize:'clamp(22px,2.6vw,32px)', fontWeight:600 }}>
                Current disaster log
              </h2>
            </div>
          </Reveal>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(340px,1fr))', gap:1,
            background:LINE_L, border:`1px solid ${LINE_L}` }}>
            {filtered.map((ev, i) => {
              const sm = SEV_META[ev.severity];
              const tm = TYPE_META[ev.type];
              const isSelected = selected === ev.id;
              return (
                <Reveal key={ev.id} delay={i*50} style={{ background:isSelected ? INK3 : INK }}>
                  <div style={{ padding:'22px 22px', height:'100%', cursor:'pointer', transition:'background 0.2s' }}
                    onClick={() => setSelected(ev.id)}
                    onMouseEnter={e => e.currentTarget.style.background = INK2}
                    onMouseLeave={e => e.currentTarget.style.background = isSelected ? INK3 : INK}>
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex items-center gap-2">
                        <span style={{ color:tm.color }}>{tm.icon}</span>
                        <div>
                          <p className="font-fraunces font-semibold text-[14.5px]" style={{ color:PAPER, lineHeight:1.2 }}>
                            {ev.title}
                          </p>
                          <p className="font-mono-ibm text-[11px] mt-[2px]" style={{ color:MUTED_L }}>
                            {ev.district} · Updated {ev.updated}
                          </p>
                        </div>
                      </div>
                      <SevBadge severity={ev.severity} />
                    </div>
                    <div className="flex flex-wrap gap-x-5 gap-y-1">
                      <span className="font-mono-ibm text-[11.5px] flex items-center gap-1" style={{ color:MUTED_L }}>
                        <Users size={11}/> {ev.affectedPeople}
                      </span>
                      <span className="font-mono-ibm text-[11.5px] flex items-center gap-1" style={{ color:MUTED_L }}>
                        <Building2 size={11}/> {ev.orgs} orgs
                      </span>
                      <span className={`font-mono-ibm text-[11.5px] flex items-center gap-1`}
                        style={{ color: ev.status==='active'?DISC : ev.status==='contained'?SAFE : MARIGOLD }}>
                        {ev.status==='active' ? <Activity size={11}/> : ev.status==='contained' ? <CheckCircle2 size={11}/> : <Eye size={11}/>}
                        {ev.status.charAt(0).toUpperCase()+ev.status.slice(1)}
                      </span>
                    </div>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* ══ RECOMMENDED ORGS ═══════════════════════════════════════════════ */}
      <section className="px-8 py-[80px]"
        style={{ background:INK2, borderTop:`1px solid ${LINE_L}`, borderBottom:`1px solid ${LINE_L}` }}>
        <div className="mx-auto" style={{ maxWidth:1180 }}>
          <Reveal>
            <div className="text-center mb-10">
              <Eyebrow label="AI Recommendations" color={SKY} />
              <h2 className="font-fraunces mt-4 mb-3"
                style={{ fontSize:'clamp(26px,3vw,38px)', fontWeight:600, lineHeight:1.1 }}>
                Recommended response organisations
              </h2>
              <p style={{ color:MUTED_L, fontSize:15, maxWidth:480, margin:'0 auto' }}>
                AI-matched organisations based on current disaster types and locations.
              </p>
            </div>
          </Reveal>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(300px,1fr))', gap:8 }}>
            {RECOMMENDED_ORGS.map(({ name, district, speciality, volunteers, verified, phone }, i) => (
              <Reveal key={name} delay={i*55}>
                <div style={{ background:INK, border:`1px solid ${LINE_L}`, borderRadius:3, padding:'20px 20px',
                  transition:'border-color 0.2s', cursor:'default' }}
                  onMouseEnter={e => e.currentTarget.style.borderColor=SKY+'55'}
                  onMouseLeave={e => e.currentTarget.style.borderColor=LINE_L}>
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div>
                      <p className="font-fraunces font-semibold text-[15px]" style={{ color:PAPER }}>{name}</p>
                      <p className="font-mono-ibm text-[11px] mt-[2px]" style={{ color:MUTED_L }}>{district}</p>
                    </div>
                    {verified && (
                      <span className="inline-flex items-center gap-1 font-mono-ibm text-[10px] px-2 py-1 rounded-full flex-shrink-0"
                        style={{ color:SAFE, background:`${SAFE}14`, border:`1px solid ${SAFE}33` }}>
                        <ShieldCheck size={10}/> Verified
                      </span>
                    )}
                  </div>
                  <p className="text-[12.5px] mb-3" style={{ color:MUTED_L }}>
                    Speciality: <span style={{ color:SKY }}>{speciality}</span>
                  </p>
                  <p className="font-mono-ibm text-[11.5px] mb-4" style={{ color:MUTED_L }}>
                    {volunteers.toLocaleString()} active volunteers
                  </p>
                  <a href={`tel:${phone}`}
                    className="inline-flex items-center gap-2 w-full justify-center px-4 py-[9px] font-mono-ibm text-[12px] font-semibold rounded-[2px]"
                    style={{ background:`${SKY}18`, border:`1px solid ${SKY}44`, color:SKY, transition:'all 0.18s' }}
                    onMouseEnter={e => { e.currentTarget.style.background=SKY; e.currentTarget.style.color=PAPER; }}
                    onMouseLeave={e => { e.currentTarget.style.background=`${SKY}18`; e.currentTarget.style.color=SKY; }}>
                    <Phone size={12}/> {phone}
                  </a>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ══ CTA ════════════════════════════════════════════════════════════ */}
      <section className="px-8 py-[80px]">
        <div className="mx-auto text-center" style={{ maxWidth:620 }}>
          <Reveal>
            <h2 className="font-fraunces mb-4"
              style={{ fontSize:'clamp(26px,3vw,38px)', fontWeight:600 }}>
              Respond faster. Save more lives.
            </h2>
            <p style={{ color:MUTED_L, fontSize:15.5, lineHeight:1.7, marginBottom:32 }}>
              ShebaBD's AI connects affected communities with the right organisations in minutes —
              not hours.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link to={ROUTES.EMERGENCY}
                className="inline-flex items-center gap-2 px-[26px] py-[14px] font-semibold text-[14px] rounded-[2px]"
                style={{ background:DISC, color:PAPER, transition:'all 0.2s' }}
                onMouseEnter={e => { e.currentTarget.style.background=DISC_DIM; e.currentTarget.style.transform='translateY(-2px)'; }}
                onMouseLeave={e => { e.currentTarget.style.background=DISC; e.currentTarget.style.transform='translateY(0)'; }}>
                <AlertTriangle size={15}/> Report Emergency
              </Link>
              <Link to={ROUTES.ORGANIZATIONS}
                className="inline-flex items-center gap-2 px-[26px] py-[14px] font-semibold text-[14px] rounded-[2px]"
                style={{ border:`1px solid ${LINE_L}`, color:PAPER, transition:'border-color 0.2s' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor=MUTED_L; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor=LINE_L; }}>
                Browse Response NGOs <ChevronRight size={15}/>
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

    </div>
  );
}

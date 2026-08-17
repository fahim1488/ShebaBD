import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Users, MapPin, Clock, Star, Sparkles, ChevronRight,
  CheckCircle2, RefreshCw, Zap, Heart, GraduationCap,
  Stethoscope, TreePine, Megaphone, Wrench, BookOpen,
  ArrowRight, ShieldCheck, BadgeCheck, TrendingUp,
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

// ─── Types & Data ─────────────────────────────────────────────────────────────
type SkillId = 'medical' | 'education' | 'environment' | 'tech' | 'logistics' | 'community' | 'media' | 'legal';
type Availability = 'weekends' | 'weekdays' | 'fulltime' | 'remote';
type District = 'Dhaka' | 'Chittagong' | 'Sylhet' | 'Rajshahi' | 'Khulna' | 'Barisal' | 'Mymensingh' | 'Rangpur';

interface Opportunity {
  id: number; title: string; org: string; district: District;
  skills: SkillId[]; availability: Availability[]; urgency: 'high' | 'medium' | 'low';
  commitment: string; volunteers: number; needed: number;
  description: string; color: string; icon: React.ReactNode;
  matchScore: number;
}

const SKILL_META: Record<SkillId, { label: string; icon: React.ReactNode; color: string }> = {
  medical:     { label: 'Medical / Healthcare', icon: <Stethoscope size={16}/>, color: DISC    },
  education:   { label: 'Teaching / Education', icon: <GraduationCap size={16}/>, color: SKY   },
  environment: { label: 'Environment',           icon: <TreePine size={16}/>,    color: LEAF   },
  tech:        { label: 'Technology / IT',       icon: <Wrench size={16}/>,      color: MARIGOLD},
  logistics:   { label: 'Logistics',             icon: <Zap size={16}/>,         color: WARN   },
  community:   { label: 'Community Organising',  icon: <Users size={16}/>,       color: SKY    },
  media:       { label: 'Media / Communications',icon: <Megaphone size={16}/>,   color: MARIGOLD},
  legal:       { label: 'Legal / Advocacy',      icon: <BookOpen size={16}/>,    color: LEAF   },
};

const DISTRICTS: District[] = ['Dhaka','Chittagong','Sylhet','Rajshahi','Khulna','Barisal','Mymensingh','Rangpur'];

const ALL_OPPORTUNITIES: Opportunity[] = [
  { id:1, title:'Field Medical Volunteer', org:'CRP Bangladesh', district:'Dhaka',
    skills:['medical'], availability:['weekends','fulltime'], urgency:'high',
    commitment:'8 hrs/week', volunteers:12, needed:8,
    description:'Provide medical consultations at rural health camps. MBBS or final-year medical students preferred.',
    color:DISC, icon:<Stethoscope size={20}/>, matchScore:0 },
  { id:2, title:'Primary School Teacher Volunteer', org:'Rajshahi Education Trust', district:'Rajshahi',
    skills:['education'], availability:['weekdays','fulltime'], urgency:'high',
    commitment:'10 hrs/week', volunteers:8, needed:12,
    description:'Teach primary school children in underserved rural areas. Experience with children aged 6–12 preferred.',
    color:SKY, icon:<GraduationCap size={20}/>, matchScore:0 },
  { id:3, title:'Tree Plantation Drive Coordinator', org:'Chittagong Green Force', district:'Chittagong',
    skills:['environment','logistics'], availability:['weekends'], urgency:'medium',
    commitment:'4 hrs/week', volunteers:45, needed:20,
    description:'Coordinate Sundarbans buffer zone tree planting teams. Logistics and outdoor experience helpful.',
    color:LEAF, icon:<TreePine size={20}/>, matchScore:0 },
  { id:4, title:'IT & Data Entry Volunteer', org:'BRAC Bangladesh', district:'Dhaka',
    skills:['tech'], availability:['remote','weekdays'], urgency:'medium',
    commitment:'6 hrs/week', volunteers:18, needed:10,
    description:'Help digitise beneficiary records and maintain databases. Excel and basic data skills required.',
    color:MARIGOLD, icon:<Wrench size={20}/>, matchScore:0 },
  { id:5, title:'Disaster Response Logistics', org:'Khulna Disaster Response', district:'Khulna',
    skills:['logistics','community'], availability:['fulltime','weekends'], urgency:'high',
    commitment:'12 hrs/week', volunteers:22, needed:15,
    description:'Coordinate relief distribution during cyclone season. Prior emergency response experience valued.',
    color:WARN, icon:<Zap size={20}/>, matchScore:0 },
  { id:6, title:'Community Health Educator', org:'Dhaka Ahsania Mission', district:'Sylhet',
    skills:['medical','community'], availability:['weekdays','weekends'], urgency:'medium',
    commitment:'6 hrs/week', volunteers:14, needed:8,
    description:'Run health awareness sessions in villages on nutrition, hygiene, and maternal health.',
    color:MARIGOLD, icon:<Heart size={20}/>, matchScore:0 },
  { id:7, title:'Social Media & Content Creator', org:'Bangladesh Red Crescent', district:'Dhaka',
    skills:['media','tech'], availability:['remote','weekends'], urgency:'low',
    commitment:'5 hrs/week', volunteers:6, needed:4,
    description:'Create awareness content for flood relief and blood donation campaigns. Graphic design skills a plus.',
    color:SKY, icon:<Megaphone size={20}/>, matchScore:0 },
  { id:8, title:'Legal Aid Volunteer', org:'Grameen Bank', district:'Mymensingh',
    skills:['legal','community'], availability:['weekdays'], urgency:'low',
    commitment:'4 hrs/week', volunteers:5, needed:6,
    description:'Provide basic legal guidance to microfinance borrowers on rights and dispute resolution.',
    color:LEAF, icon:<BookOpen size={20}/>, matchScore:0 },
];

const URGENCY_META = {
  high:   { color: DISC,    label: 'Urgent Need'  },
  medium: { color: MARIGOLD,label: 'Moderate'     },
  low:    { color: LEAF,    label: 'Flexible'      },
};

// ─── Scoring engine ────────────────────────────────────────────────────────────
function scoreOpportunities(
  skills: SkillId[], district: District | 'Any', availability: Availability[],
  opps: Opportunity[]
): Opportunity[] {
  return opps.map(o => {
    let score = 0;
    skills.forEach(s => { if (o.skills.includes(s)) score += 40; });
    if (district !== 'Any' && o.district === district) score += 25;
    availability.forEach(a => { if (o.availability.includes(a)) score += 15; });
    if (o.urgency === 'high') score += 10;
    const fillRate = o.volunteers / (o.volunteers + o.needed);
    if (fillRate < 0.5) score += 8; // needs more volunteers
    return { ...o, matchScore: Math.min(score, 100) };
  }).sort((a, b) => b.matchScore - a.matchScore);
}

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

function Eyebrow({ label, color=LEAF }: { label:string; color?:string }) {
  return (
    <div className="inline-flex items-center gap-[9px] font-mono-ibm text-[12px] tracking-[0.11em] uppercase" style={{ color:MUTED_L }}>
      <span className="inline-block w-[6px] h-[6px] rounded-full" style={{ background:color }} />
      {label}
    </div>
  );
}

// ─── Match score ring ──────────────────────────────────────────────────────────
function MatchRing({ score, color }: { score:number; color:string }) {
  const size=60; const r=(size-8)/2; const circ=2*Math.PI*r;
  return (
    <div className="relative flex items-center justify-center flex-shrink-0" style={{ width:size, height:size }}>
      <svg width={size} height={size} style={{ transform:'rotate(-90deg)' }}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={LINE_L} strokeWidth={6}/>
        <motion.circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={6}
          strokeLinecap="round"
          initial={{ strokeDasharray:`0 ${circ}` }}
          animate={{ strokeDasharray:`${circ*(score/100)} ${circ}` }}
          transition={{ duration:1, ease:[0.4,0,0.2,1] }}/>
      </svg>
      <span className="absolute font-mono-ibm font-bold text-[12px]" style={{ color }}>{score}%</span>
    </div>
  );
}

// ─── Main component ────────────────────────────────────────────────────────────
export default function AiVolunteerRecommendation() {
  const [selectedSkills, setSkills]   = useState<SkillId[]>([]);
  const [district, setDistrict]       = useState<District|'Any'>('Any');
  const [availability, setAvail]      = useState<Availability[]>([]);
  const [matching, setMatching]       = useState(false);
  const [results, setResults]         = useState<Opportunity[]>([]);
  const [matched, setMatched]         = useState(false);
  const resultsRef = useRef<HTMLDivElement>(null);

  function toggleSkill(s: SkillId) {
    setSkills(prev => prev.includes(s) ? prev.filter(x=>x!==s) : [...prev, s]);
  }
  function toggleAvail(a: Availability) {
    setAvail(prev => prev.includes(a) ? prev.filter(x=>x!==a) : [...prev, a]);
  }

  function handleMatch() {
    if (selectedSkills.length === 0) return;
    setMatching(true); setMatched(false); setResults([]);
    setTimeout(() => {
      const scored = scoreOpportunities(selectedSkills, district, availability, ALL_OPPORTUNITIES);
      setResults(scored.filter(o => o.matchScore > 0));
      setMatching(false); setMatched(true);
      setTimeout(() => resultsRef.current?.scrollIntoView({ behavior:'smooth', block:'start' }), 150);
    }, 1800);
  }

  return (
    <div style={{ background:INK, color:PAPER, minHeight:'100vh', overflowX:'hidden' }}>

      {/* ══ HERO ══════════════════════════════════════════════════════════ */}
      <section className="relative" style={{ padding:'80px 32px 64px', overflow:'hidden' }}>
        <div className="pointer-events-none absolute rounded-full"
          style={{ top:-160, right:-180, width:500, height:500, background:'radial-gradient(circle,rgba(76,140,107,0.12),transparent 70%)' }}/>
        <div className="pointer-events-none absolute rounded-full"
          style={{ bottom:-80, left:-120, width:360, height:360, background:'radial-gradient(circle,rgba(62,122,140,0.08),transparent 70%)' }}/>
        <div className="mx-auto" style={{ maxWidth:1180 }}>
          <div className="flex items-center justify-between gap-10 flex-wrap">
            <div style={{ maxWidth:600 }}>
              <Reveal><div className="mb-5"><Eyebrow label="AI · Volunteer Recommendation Engine · v1.0" color={LEAF}/></div></Reveal>
              <Reveal delay={70}>
                <h1 className="font-fraunces mb-5" style={{ fontSize:'clamp(36px,4.8vw,58px)', lineHeight:1.04, fontWeight:600 }}>
                  Find your perfect<br/><span style={{ color:LEAF }}>volunteer match</span>
                </h1>
              </Reveal>
              <Reveal delay={140}>
                <p style={{ color:MUTED_L, fontSize:16, lineHeight:1.72, maxWidth:520 }}>
                  Tell us your skills, location, and availability. Our AI analyses
                  every active opportunity and ranks the best matches for you — so
                  you can start making an impact today.
                </p>
              </Reveal>
              <Reveal delay={210}>
                <div className="flex flex-wrap gap-4 mt-8">
                  {[
                    { num:'18,000+', label:'Active Volunteers', color:LEAF    },
                    { num:'2,400+',  label:'Verified NGOs',     color:SKY     },
                    { num:'64',      label:'Districts',         color:MARIGOLD},
                  ].map(({ num, label, color }) => (
                    <div key={label} className="text-center">
                      <p className="font-mono-ibm font-bold text-[18px]" style={{ color }}>{num}</p>
                      <p className="font-mono-ibm text-[11px]" style={{ color:MUTED_L }}>{label}</p>
                    </div>
                  ))}
                </div>
              </Reveal>
            </div>
            {/* orb */}
            <Reveal className="hidden lg:flex">
              <div className="relative flex items-center justify-center" style={{ width:200, height:200 }}>
                {[0,1,2].map(i => (
                  <motion.div key={i} className="absolute rounded-full"
                    style={{ width:70+i*44, height:70+i*44, border:`1px solid ${LEAF}${['44','28','14'][i]}` }}
                    animate={{ rotate:i%2===0?360:-360 }}
                    transition={{ duration:18+i*8, repeat:Infinity, ease:'linear' }}/>
                ))}
                <div className="relative z-10 flex items-center justify-center rounded-full"
                  style={{ width:68, height:68, background:`${LEAF}18`, border:`2px solid ${LEAF}55` }}>
                  <motion.div animate={{ scale:[1,1.1,1] }} transition={{ duration:2.2, repeat:Infinity, ease:'easeInOut' }}>
                    <Users size={28} style={{ color:LEAF }}/>
                  </motion.div>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ══ MATCHER FORM ══════════════════════════════════════════════════ */}
      <section className="px-8 pb-[80px]" style={{ borderTop:`1px solid ${LINE_L}` }}>
        <div className="mx-auto pt-[60px]" style={{ maxWidth:900 }}>
          <Reveal>
            <div className="text-center mb-10">
              <Eyebrow label="Build Your Profile" color={LEAF}/>
              <h2 className="font-fraunces mt-4 mb-2" style={{ fontSize:'clamp(26px,3vw,38px)', fontWeight:600 }}>
                Tell us about yourself
              </h2>
              <p style={{ color:MUTED_L, fontSize:15, maxWidth:460, margin:'0 auto' }}>
                The more you tell us, the better your matches.
              </p>
            </div>
          </Reveal>

          <div style={{ background:INK2, border:`1px solid ${LINE_L}`, borderRadius:3 }}>
            {/* Step 1 — Skills */}
            <div style={{ padding:'26px 28px', borderBottom:`1px solid ${LINE_L}` }}>
              <p className="font-mono-ibm text-[11.5px] tracking-[0.09em] uppercase mb-4" style={{ color:MUTED_L }}>
                01 — Your Skills <span style={{ color:DISC }}>*</span>
              </p>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(200px,1fr))', gap:8 }}>
                {(Object.entries(SKILL_META) as [SkillId, typeof SKILL_META[SkillId]][]).map(([id, meta]) => {
                  const active = selectedSkills.includes(id);
                  return (
                    <button key={id} onClick={() => toggleSkill(id)}
                      style={{
                        display:'flex', alignItems:'center', gap:10, padding:'12px 14px',
                        borderRadius:3, border:`1.5px solid ${active ? meta.color : LINE_L}`,
                        background: active ? `${meta.color}14` : 'transparent',
                        cursor:'pointer', transition:'all 0.18s ease', textAlign:'left',
                      }}
                      onMouseEnter={e => { if(!active) e.currentTarget.style.borderColor=meta.color+'66'; }}
                      onMouseLeave={e => { if(!active) e.currentTarget.style.borderColor=LINE_L; }}>
                      <span style={{ color:meta.color, flexShrink:0 }}>{meta.icon}</span>
                      <span className="text-[13px] font-medium" style={{ color:active?meta.color:PAPER }}>
                        {meta.label}
                      </span>
                      {active && <CheckCircle2 size={14} style={{ color:meta.color, marginLeft:'auto', flexShrink:0 }}/>}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Step 2 — District */}
            <div style={{ padding:'24px 28px', borderBottom:`1px solid ${LINE_L}` }}>
              <p className="font-mono-ibm text-[11.5px] tracking-[0.09em] uppercase mb-4" style={{ color:MUTED_L }}>
                02 — Your District
              </p>
              <div className="flex flex-wrap gap-2">
                {(['Any', ...DISTRICTS] as const).map(d => {
                  const active = district === d;
                  return (
                    <button key={d} onClick={() => setDistrict(d as District|'Any')}
                      style={{
                        padding:'8px 16px', borderRadius:100,
                        border:`1px solid ${active ? SKY : LINE_L}`,
                        background: active ? `${SKY}18` : 'transparent',
                        color: active ? SKY : MUTED_L, fontSize:13,
                        fontFamily:"'IBM Plex Mono',monospace", fontWeight:600,
                        cursor:'pointer', transition:'all 0.16s ease',
                      }}
                      onMouseEnter={e => { if(!active){ e.currentTarget.style.borderColor=SKY+'66'; e.currentTarget.style.color=PAPER; }}}
                      onMouseLeave={e => { if(!active){ e.currentTarget.style.borderColor=LINE_L; e.currentTarget.style.color=MUTED_L; }}}>
                      {d}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Step 3 — Availability */}
            <div style={{ padding:'24px 28px', borderBottom:`1px solid ${LINE_L}` }}>
              <p className="font-mono-ibm text-[11.5px] tracking-[0.09em] uppercase mb-4" style={{ color:MUTED_L }}>
                03 — Availability
              </p>
              <div className="flex flex-wrap gap-2">
                {([
                  { id:'weekends' as Availability,  label:'Weekends'    },
                  { id:'weekdays' as Availability,  label:'Weekdays'    },
                  { id:'fulltime' as Availability,  label:'Full-time'   },
                  { id:'remote'   as Availability,  label:'Remote Only' },
                ]).map(({ id, label }) => {
                  const active = availability.includes(id);
                  return (
                    <button key={id} onClick={() => toggleAvail(id)}
                      style={{
                        padding:'8px 16px', borderRadius:100,
                        border:`1px solid ${active ? MARIGOLD : LINE_L}`,
                        background: active ? `${MARIGOLD}18` : 'transparent',
                        color: active ? MARIGOLD : MUTED_L, fontSize:13,
                        fontFamily:"'IBM Plex Mono',monospace", fontWeight:600,
                        cursor:'pointer', transition:'all 0.16s ease',
                        display:'flex', alignItems:'center', gap:6,
                      }}
                      onMouseEnter={e => { if(!active){ e.currentTarget.style.borderColor=MARIGOLD+'66'; e.currentTarget.style.color=PAPER; }}}
                      onMouseLeave={e => { if(!active){ e.currentTarget.style.borderColor=LINE_L; e.currentTarget.style.color=MUTED_L; }}}>
                      {active && <CheckCircle2 size={13}/>}
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Match button */}
            <div style={{ padding:'22px 28px' }}>
              <button onClick={handleMatch}
                disabled={selectedSkills.length===0 || matching}
                style={{
                  width:'100%', padding:'15px 24px',
                  background: matching ? `${LEAF}88` : selectedSkills.length>0 ? LEAF : LINE_L,
                  color: INK, fontWeight:700, fontSize:14.5,
                  borderRadius:2, border:'none',
                  cursor: selectedSkills.length>0&&!matching ? 'pointer' : 'not-allowed',
                  transition:'all 0.2s', display:'flex', alignItems:'center', justifyContent:'center', gap:10,
                }}
                onMouseEnter={e => { if(selectedSkills.length>0&&!matching) e.currentTarget.style.transform='translateY(-1px)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform='translateY(0)'; }}>
                {matching
                  ? <><motion.div animate={{ rotate:360 }} transition={{ repeat:Infinity, duration:0.9, ease:'linear' }}><RefreshCw size={17}/></motion.div> AI is matching…</>
                  : <><Sparkles size={17}/> Find My Volunteer Matches <ArrowRight size={17}/></>
                }
              </button>
              {selectedSkills.length===0 && (
                <p className="font-mono-ibm text-[11.5px] text-center mt-2" style={{ color:DISC }}>
                  Please select at least one skill to continue
                </p>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ══ RESULTS ════════════════════════════════════════════════════════ */}
      <div ref={resultsRef}>
        <AnimatePresence>
          {matched && !matching && (
            <motion.section key="results" initial={{ opacity:0 }} animate={{ opacity:1 }}
              className="px-8 pb-[100px]" style={{ borderTop:`1px solid ${LINE_L}` }}>
              <div className="mx-auto pt-[60px]" style={{ maxWidth:1180 }}>
                <Reveal>
                  <div className="flex items-end justify-between flex-wrap gap-4 mb-8">
                    <div>
                      <Eyebrow label="AI Matched Opportunities" color={LEAF}/>
                      <h2 className="font-fraunces mt-3" style={{ fontSize:'clamp(24px,2.8vw,36px)', fontWeight:600 }}>
                        {results.length} opportunities matched
                      </h2>
                      <p className="font-mono-ibm text-[12.5px] mt-1" style={{ color:MUTED_L }}>
                        Ranked by AI match score · Skills · Location · Availability
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {selectedSkills.map(s => (
                        <span key={s} className="inline-flex items-center gap-1 font-mono-ibm text-[11px] px-[10px] py-[4px] rounded-full"
                          style={{ color:SKILL_META[s].color, background:`${SKILL_META[s].color}14`, border:`1px solid ${SKILL_META[s].color}33` }}>
                          {SKILL_META[s].label}
                        </span>
                      ))}
                    </div>
                  </div>
                </Reveal>

                {results.length === 0 ? (
                  <Reveal>
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                      <Users size={48} style={{ color:MUTED_L, opacity:0.25, marginBottom:14 }}/>
                      <p className="font-fraunces text-[18px]" style={{ color:MUTED_L }}>No exact matches found</p>
                      <p className="font-mono-ibm text-[13px] mt-2" style={{ color:MUTED_L }}>
                        Try selecting different skills or choosing "Any" district
                      </p>
                    </div>
                  </Reveal>
                ) : (
                  <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(340px,1fr))', gap:8 }}>
                    {results.map((opp, i) => {
                      const urg = URGENCY_META[opp.urgency];
                      const fillPct = Math.round((opp.volunteers/(opp.volunteers+opp.needed))*100);
                      return (
                        <motion.div key={opp.id}
                          initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }}
                          transition={{ duration:0.35, delay:i*0.06 }}
                          style={{ background:INK2, border:`1px solid ${LINE_L}`, borderRadius:3,
                            transition:'border-color 0.2s', cursor:'default' }}
                          onMouseEnter={e => e.currentTarget.style.borderColor=opp.color+'55'}
                          onMouseLeave={e => e.currentTarget.style.borderColor=LINE_L}>

                          {/* top strip */}
                          <div style={{ height:3, background:`linear-gradient(90deg,${opp.color},transparent)`, borderRadius:'3px 3px 0 0' }}/>

                          <div style={{ padding:'20px 20px' }}>
                            {/* header */}
                            <div className="flex items-start justify-between gap-3 mb-3">
                              <div className="flex items-center gap-3">
                                <div className="flex items-center justify-center rounded-full flex-shrink-0"
                                  style={{ width:40, height:40, background:`${opp.color}18`, border:`1.5px solid ${opp.color}44`, color:opp.color }}>
                                  {opp.icon}
                                </div>
                                <div>
                                  <p className="font-fraunces font-semibold text-[15px]" style={{ color:PAPER, lineHeight:1.25 }}>{opp.title}</p>
                                  <p className="font-mono-ibm text-[11px] mt-[2px]" style={{ color:MUTED_L }}>{opp.org}</p>
                                </div>
                              </div>
                              <MatchRing score={opp.matchScore} color={opp.color}/>
                            </div>

                            {/* meta row */}
                            <div className="flex flex-wrap gap-x-4 gap-y-1 mb-3">
                              <span className="inline-flex items-center gap-1 font-mono-ibm text-[11.5px]" style={{ color:MUTED_L }}>
                                <MapPin size={11}/> {opp.district}
                              </span>
                              <span className="inline-flex items-center gap-1 font-mono-ibm text-[11.5px]" style={{ color:MUTED_L }}>
                                <Clock size={11}/> {opp.commitment}
                              </span>
                              <span className="inline-flex items-center gap-1 font-mono-ibm text-[11px] px-[8px] py-[2px] rounded-full"
                                style={{ color:urg.color, background:`${urg.color}14`, border:`1px solid ${urg.color}33` }}>
                                {urg.label}
                              </span>
                            </div>

                            {/* description */}
                            <p className="text-[13px] mb-4 line-clamp-2" style={{ color:MUTED_L, lineHeight:1.6 }}>
                              {opp.description}
                            </p>

                            {/* volunteer fill bar */}
                            <div className="mb-4">
                              <div className="flex justify-between mb-1">
                                <span className="font-mono-ibm text-[11px]" style={{ color:MUTED_L }}>
                                  {opp.volunteers} of {opp.volunteers+opp.needed} volunteers filled
                                </span>
                                <span className="font-mono-ibm text-[11px]" style={{ color:opp.color }}>{fillPct}%</span>
                              </div>
                              <div className="h-[4px] rounded-full overflow-hidden" style={{ background:`${opp.color}22` }}>
                                <motion.div className="h-full rounded-full" style={{ background:opp.color }}
                                  initial={{ width:0 }} animate={{ width:`${fillPct}%` }}
                                  transition={{ duration:0.9, ease:[0.4,0,0.2,1] }}/>
                              </div>
                            </div>

                            {/* skills required */}
                            <div className="flex flex-wrap gap-1 mb-4">
                              {opp.skills.map(s => (
                                <span key={s} className="font-mono-ibm text-[10.5px] px-2 py-[3px] rounded-full"
                                  style={{ color:SKILL_META[s].color, background:`${SKILL_META[s].color}14`, border:`1px solid ${SKILL_META[s].color}33` }}>
                                  {SKILL_META[s].label}
                                </span>
                              ))}
                            </div>

                            {/* CTA */}
                            <Link to={ROUTES.VOLUNTEERS}
                              className="inline-flex items-center gap-2 w-full justify-center px-4 py-[10px] font-semibold text-[13px] rounded-[2px]"
                              style={{ background:`${opp.color}18`, border:`1px solid ${opp.color}44`, color:opp.color, transition:'all 0.18s' }}
                              onMouseEnter={e => { e.currentTarget.style.background=opp.color; e.currentTarget.style.color=INK; }}
                              onMouseLeave={e => { e.currentTarget.style.background=`${opp.color}18`; e.currentTarget.style.color=opp.color; }}>
                              <BadgeCheck size={15}/> Apply to Volunteer
                            </Link>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                )}
              </div>
            </motion.section>
          )}
        </AnimatePresence>
      </div>

      {/* ══ HOW IT WORKS ══════════════════════════════════════════════════ */}
      <section className="px-8 py-[90px]" style={{ background:INK2, borderTop:`1px solid ${LINE_L}` }}>
        <div className="mx-auto" style={{ maxWidth:1180 }}>
          <Reveal>
            <div className="text-center mb-12">
              <Eyebrow label="AI Matching Engine" color={SKY}/>
              <h2 className="font-fraunces mt-4 mb-3" style={{ fontSize:'clamp(26px,3vw,38px)', fontWeight:600 }}>
                How the matching works
              </h2>
            </div>
          </Reveal>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:1, background:LINE_L, border:`1px solid ${LINE_L}` }}>
            {[
              { step:'01', icon:<Users size={20}/>,      color:LEAF,    title:'Skill Matching',
                desc:'Your skills are matched against every active opportunity. Direct matches score highest, adjacent skills receive partial credit.' },
              { step:'02', icon:<MapPin size={20}/>,     color:SKY,     title:'Location Scoring',
                desc:'Opportunities in your district score 25 bonus points. Remote opportunities match regardless of location.' },
              { step:'03', icon:<TrendingUp size={20}/>, color:MARIGOLD, title:'Impact Ranking',
                desc:'Urgent needs and organisations with the biggest volunteer gap are boosted — so your effort goes where it matters most.' },
            ].map(({ step, icon, color, title, desc }, i) => (
              <Reveal key={step} delay={i*70}
                style={{ background:INK2, padding:'36px 30px', transition:'background 0.22s ease' }}>
                <div
                  onMouseEnter={e => { const p = e.currentTarget.parentElement; if(p) p.style.background=INK3; }}
                  onMouseLeave={e => { const p = e.currentTarget.parentElement; if(p) p.style.background=INK2; }}>
                  <span className="font-mono-ibm text-[11px] tracking-[0.1em] block mb-4" style={{ color:MUTED_L }}>{step}</span>
                  <div className="flex items-center justify-center mb-5 rounded-full"
                    style={{ width:46, height:46, background:`${color}18`, border:`1.5px solid ${color}44`, color }}>
                    {icon}
                  </div>
                  <h3 className="font-fraunces font-semibold mb-3" style={{ fontSize:17, color:PAPER }}>{title}</h3>
                  <p style={{ fontSize:13.5, lineHeight:1.68, color:MUTED_L }}>{desc}</p>
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
            <h2 className="font-fraunces mb-4" style={{ fontSize:'clamp(26px,3vw,38px)', fontWeight:600 }}>
              Ready to make an impact?
            </h2>
            <p style={{ color:MUTED_L, fontSize:15.5, lineHeight:1.7, marginBottom:32 }}>
              Bangladesh needs your skills. ShebaBD connects you to the right cause in minutes.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link to={ROUTES.VOLUNTEERS}
                className="inline-flex items-center gap-2 px-[26px] py-[14px] font-semibold text-[14px] rounded-[2px]"
                style={{ background:LEAF, color:INK, transition:'all 0.2s' }}
                onMouseEnter={e => { e.currentTarget.style.opacity='0.88'; e.currentTarget.style.transform='translateY(-2px)'; }}
                onMouseLeave={e => { e.currentTarget.style.opacity='1'; e.currentTarget.style.transform='translateY(0)'; }}>
                <Users size={15}/> Browse All Volunteers
              </Link>
              <Link to={ROUTES.ORGANIZATIONS}
                className="inline-flex items-center gap-2 px-[26px] py-[14px] font-semibold text-[14px] rounded-[2px]"
                style={{ border:`1px solid ${LINE_L}`, color:PAPER, transition:'border-color 0.2s' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor=MUTED_L; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor=LINE_L; }}>
                Find NGOs <ChevronRight size={15}/>
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

    </div>
  );
}

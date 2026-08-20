import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Building2, MapPin, Star, Sparkles, ChevronRight,
  Heart, Users, Droplets, TreePine, GraduationCap,
  Stethoscope, RefreshCw, ArrowRight, ShieldCheck,
  BadgeCheck, TrendingUp, Phone, Globe,
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

type InterestId = 'healthcare' | 'education' | 'disaster' | 'blood' | 'environment' | 'poverty' | 'children' | 'women';
type GoalId = 'donate' | 'volunteer' | 'partner' | 'learn';
type DistrictId = 'Dhaka' | 'Chittagong' | 'Sylhet' | 'Rajshahi' | 'Khulna' | 'Barisal' | 'Mymensingh' | 'Rangpur' | 'Any';

interface OrgCard {
  id: number; name: string; initial: string;
  categories: InterestId[]; district: DistrictId;
  goals: GoalId[]; rating: number; reviews: number;
  volunteers: number; verified: boolean;
  desc: string; phone: string; website: string;
  trustScore: number; matchScore: number;
  color: string; icon: React.ReactNode;
}

const INTEREST_META: Record<InterestId, { label: string; icon: React.ReactNode; color: string }> = {
  healthcare:  { label: 'Healthcare',     icon: <Stethoscope size={16}/>, color: MARIGOLD },
  education:   { label: 'Education',      icon: <GraduationCap size={16}/>, color: SKY    },
  disaster:    { label: 'Disaster Relief',icon: <Building2 size={16}/>,   color: DISC     },
  blood:       { label: 'Blood Donation', icon: <Droplets size={16}/>,    color: DISC     },
  environment: { label: 'Environment',    icon: <TreePine size={16}/>,    color: LEAF     },
  poverty:     { label: 'Poverty',        icon: <Heart size={16}/>,       color: WARN     },
  children:    { label: 'Children',       icon: <Users size={16}/>,       color: SKY      },
  women:       { label: 'Women Rights',   icon: <Star size={16}/>,        color: MARIGOLD },
};

const GOAL_META: Record<GoalId, { label: string; desc: string }> = {
  donate:    { label: 'Donate',           desc: 'I want to contribute financially'      },
  volunteer: { label: 'Volunteer',        desc: 'I want to give my time and skills'     },
  partner:   { label: 'Partner / Collaborate', desc: 'I represent an organisation'     },
  learn:     { label: 'Learn & Explore',  desc: 'I want to understand the social sector'},
};

const DISTRICTS: DistrictId[] = ['Any','Dhaka','Chittagong','Sylhet','Rajshahi','Khulna','Barisal','Mymensingh','Rangpur'];

const ALL_ORGS: OrgCard[] = [
  { id:1, name:'BRAC Bangladesh', initial:'B', categories:['education','poverty','healthcare'], district:'Dhaka',
    goals:['donate','volunteer','partner'], rating:4.9, reviews:1240, volunteers:3200, verified:true,
    desc:'One of the world\'s largest development NGOs — education, microfinance, healthcare, and poverty alleviation across Bangladesh.',
    phone:'+880 2-9881265', website:'brac.net', trustScore:98, matchScore:0, color:SKY, icon:<GraduationCap size={20}/> },
  { id:2, name:'Bangladesh Red Crescent', initial:'B', categories:['disaster','blood','healthcare'], district:'Dhaka',
    goals:['donate','volunteer'], rating:4.8, reviews:1100, volunteers:5000, verified:true,
    desc:'Emergency relief, blood services, and disaster preparedness across all 64 districts of Bangladesh.',
    phone:'+880 2-9330188', website:'bdrcs.org', trustScore:97, matchScore:0, color:DISC, icon:<Droplets size={20}/> },
  { id:3, name:'CRP Bangladesh', initial:'C', categories:['healthcare'], district:'Dhaka',
    goals:['donate','volunteer','partner'], rating:4.9, reviews:634, volunteers:450, verified:true,
    desc:'Centre for the Rehabilitation of the Paralysed — world-class rehabilitation, physiotherapy, and healthcare services.',
    phone:'+880 2-7791814', website:'crp-bangladesh.org', trustScore:96, matchScore:0, color:MARIGOLD, icon:<Stethoscope size={20}/> },
  { id:4, name:'Grameen Bank', initial:'G', categories:['poverty','women'], district:'Dhaka',
    goals:['donate','partner','learn'], rating:4.8, reviews:980, volunteers:1500, verified:true,
    desc:'Microfinance pioneer — empowering rural women through small loans, enabling financial independence and poverty reduction.',
    phone:'+880 2-9005257', website:'grameen.com', trustScore:99, matchScore:0, color:WARN, icon:<TrendingUp size={20}/> },
  { id:5, name:'Dhaka Ahsania Mission', initial:'D', categories:['education','healthcare'], district:'Dhaka',
    goals:['donate','volunteer'], rating:4.7, reviews:756, volunteers:900, verified:true,
    desc:'Promotes education, health, and social development through grassroots programmes across Bangladesh.',
    phone:'+880 2-8116149', website:'ahsaniamission.org', trustScore:94, matchScore:0, color:SKY, icon:<GraduationCap size={20}/> },
  { id:6, name:'Sylhet Blood Bank', initial:'S', categories:['blood'], district:'Sylhet',
    goals:['donate','volunteer'], rating:4.7, reviews:892, volunteers:1200, verified:true,
    desc:'Largest voluntary blood donation network in the Sylhet division — 24/7 emergency blood supply.',
    phone:'+880 821-713456', website:'sylhetblood.org', trustScore:95, matchScore:0, color:DISC, icon:<Droplets size={20}/> },
  { id:7, name:'Chittagong Green Force', initial:'C', categories:['environment'], district:'Chittagong',
    goals:['volunteer','partner','learn'], rating:4.5, reviews:320, volunteers:780, verified:true,
    desc:'Environmental organisation focused on coastal protection, Sundarbans conservation, and climate awareness.',
    phone:'+880 31-614732', website:'greenforce.bd', trustScore:91, matchScore:0, color:LEAF, icon:<TreePine size={20}/> },
  { id:8, name:'Rajshahi Education Trust', initial:'R', categories:['education','children'], district:'Rajshahi',
    goals:['donate','volunteer'], rating:4.6, reviews:445, volunteers:320, verified:true,
    desc:'Free primary education and skill development training for underprivileged children in rural Rajshahi.',
    phone:'+880 721-775432', website:'ret.org.bd', trustScore:92, matchScore:0, color:SKY, icon:<GraduationCap size={20}/> },
  { id:9, name:'Khulna Disaster Response', initial:'K', categories:['disaster'], district:'Khulna',
    goals:['donate','volunteer'], rating:4.4, reviews:267, volunteers:650, verified:true,
    desc:'Specialised in cyclone preparedness, flood relief, and Sundarbans conservation in the south-west.',
    phone:'+880 41-723589', website:'kdr.bd', trustScore:89, matchScore:0, color:DISC, icon:<Building2 size={20}/> },
];

function scoreOrgs(interests: InterestId[], goal: GoalId | null, district: DistrictId, orgs: OrgCard[]): OrgCard[] {
  return orgs.map(o => {
    let score = 0;
    interests.forEach(i => { if (o.categories.includes(i)) score += 35; });
    if (goal && o.goals.includes(goal)) score += 25;
    if (district !== 'Any' && o.district === district) score += 20;
    if (o.verified) score += 10;
    score += Math.floor(o.trustScore / 20); // up to 5 pts from trust
    return { ...o, matchScore: Math.min(score, 100) };
  }).sort((a, b) => b.matchScore - a.matchScore);
}

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

function Eyebrow({ label, color=SKY }: { label:string; color?:string }) {
  return (
    <div className="inline-flex items-center gap-[9px] font-mono-ibm text-[12px] tracking-[0.11em] uppercase" style={{ color:MUTED_L }}>
      <span className="inline-block w-[6px] h-[6px] rounded-full" style={{ background:color }} />
      {label}
    </div>
  );
}

function MatchRing({ score, color }: { score:number; color:string }) {
  const size=58; const r=(size-8)/2; const circ=2*Math.PI*r;
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

export default function AiOrgRecommendation() {
  const [interests, setInterests]   = useState<InterestId[]>([]);
  const [goal, setGoal]             = useState<GoalId|null>(null);
  const [district, setDistrict]     = useState<DistrictId>('Any');
  const [matching, setMatching]     = useState(false);
  const [results, setResults]       = useState<OrgCard[]>([]);
  const [matched, setMatched]       = useState(false);
  const resultsRef = useRef<HTMLDivElement>(null);

  function toggleInterest(i: InterestId) {
    setInterests(prev => prev.includes(i) ? prev.filter(x=>x!==i) : [...prev, i]);
  }

  function handleMatch() {
    if (interests.length === 0) return;
    setMatching(true); setMatched(false); setResults([]);
    setTimeout(() => {
      const scored = scoreOrgs(interests, goal, district, ALL_ORGS);
      setResults(scored.filter(o => o.matchScore > 0));
      setMatching(false); setMatched(true);
      setTimeout(() => resultsRef.current?.scrollIntoView({ behavior:'smooth', block:'start' }), 150);
    }, 1600);
  }

  return (
    <div style={{ background:INK, color:PAPER, minHeight:'100vh', overflowX:'hidden' }}>

      {/* ══ HERO ══════════════════════════════════════════════════════════ */}
      <section className="relative" style={{ padding:'80px 32px 64px', overflow:'hidden' }}>
        <div className="pointer-events-none absolute rounded-full"
          style={{ top:-160, right:-180, width:500, height:500, background:'radial-gradient(circle,rgba(62,122,140,0.12),transparent 70%)' }}/>
        <div className="pointer-events-none absolute rounded-full"
          style={{ bottom:-80, left:-120, width:360, height:360, background:'radial-gradient(circle,rgba(231,169,59,0.07),transparent 70%)' }}/>
        <div className="mx-auto" style={{ maxWidth:1180 }}>
          <div className="flex items-center justify-between gap-10 flex-wrap">
            <div style={{ maxWidth:580 }}>
              <Reveal><div className="mb-5"><Eyebrow label="AI · Organisation Recommendation · v1.0" color={SKY}/></div></Reveal>
              <Reveal delay={70}>
                <h1 className="font-fraunces mb-5" style={{ fontSize:'clamp(36px,4.8vw,58px)', lineHeight:1.04, fontWeight:600 }}>
                  Find organisations<br/><span style={{ color:SKY }}>made for you</span>
                </h1>
              </Reveal>
              <Reveal delay={140}>
                <p style={{ color:MUTED_L, fontSize:16, lineHeight:1.72, maxWidth:520 }}>
                  Tell us your interests, what you want to do, and where you are. Our AI
                  analyses all 2,400+ verified NGOs on ShebaBD and surfaces the ones
                  that align perfectly with your values and goals.
                </p>
              </Reveal>
            </div>
            {/* orb */}
            <Reveal className="hidden lg:flex">
              <div className="relative flex items-center justify-center" style={{ width:200, height:200 }}>
                {[0,1,2].map(i => (
                  <motion.div key={i} className="absolute rounded-full"
                    style={{ width:70+i*44, height:70+i*44, border:`1px solid ${SKY}${['44','28','14'][i]}` }}
                    animate={{ rotate:i%2===0?360:-360 }}
                    transition={{ duration:18+i*8, repeat:Infinity, ease:'linear' }}/>
                ))}
                <div className="relative z-10 flex items-center justify-center rounded-full"
                  style={{ width:68, height:68, background:`${SKY}18`, border:`2px solid ${SKY}55` }}>
                  <motion.div animate={{ scale:[1,1.1,1] }} transition={{ duration:2.2, repeat:Infinity, ease:'easeInOut' }}>
                    <Building2 size={28} style={{ color:SKY }}/>
                  </motion.div>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ══ RECOMMENDER FORM ══════════════════════════════════════════════ */}
      <section className="px-8 pb-[80px]" style={{ borderTop:`1px solid ${LINE_L}` }}>
        <div className="mx-auto pt-[60px]" style={{ maxWidth:860 }}>
          <div style={{ background:INK2, border:`1px solid ${LINE_L}`, borderRadius:3 }}>

            {/* Step 1 — Interests */}
            <div style={{ padding:'26px 28px', borderBottom:`1px solid ${LINE_L}` }}>
              <p className="font-mono-ibm text-[11.5px] tracking-[0.09em] uppercase mb-4" style={{ color:MUTED_L }}>
                01 — Causes You Care About <span style={{ color:DISC }}>*</span>
              </p>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(180px,1fr))', gap:8 }}>
                {(Object.entries(INTEREST_META) as [InterestId, typeof INTEREST_META[InterestId]][]).map(([id, meta]) => {
                  const active = interests.includes(id);
                  return (
                    <button key={id} onClick={() => toggleInterest(id)}
                      style={{
                        display:'flex', alignItems:'center', gap:10, padding:'11px 14px',
                        borderRadius:3, border:`1.5px solid ${active ? meta.color : LINE_L}`,
                        background: active ? `${meta.color}14` : 'transparent',
                        cursor:'pointer', transition:'all 0.18s ease', textAlign:'left',
                      }}
                      onMouseEnter={e => { if(!active) e.currentTarget.style.borderColor=meta.color+'66'; }}
                      onMouseLeave={e => { if(!active) e.currentTarget.style.borderColor=LINE_L; }}>
                      <span style={{ color:meta.color, flexShrink:0 }}>{meta.icon}</span>
                      <span className="text-[13px] font-medium" style={{ color:active?meta.color:PAPER }}>{meta.label}</span>
                      {active && <BadgeCheck size={13} style={{ color:meta.color, marginLeft:'auto', flexShrink:0 }}/>}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Step 2 — Goal */}
            <div style={{ padding:'24px 28px', borderBottom:`1px solid ${LINE_L}` }}>
              <p className="font-mono-ibm text-[11.5px] tracking-[0.09em] uppercase mb-4" style={{ color:MUTED_L }}>
                02 — What Do You Want to Do?
              </p>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(2,1fr)', gap:8 }}>
                {(Object.entries(GOAL_META) as [GoalId, typeof GOAL_META[GoalId]][]).map(([id, meta]) => {
                  const active = goal === id;
                  return (
                    <button key={id} onClick={() => setGoal(active ? null : id)}
                      style={{
                        padding:'12px 16px', borderRadius:3, textAlign:'left',
                        border:`1.5px solid ${active ? MARIGOLD : LINE_L}`,
                        background: active ? `${MARIGOLD}14` : 'transparent',
                        cursor:'pointer', transition:'all 0.18s ease',
                      }}
                      onMouseEnter={e => { if(!active) e.currentTarget.style.borderColor=MARIGOLD+'55'; }}
                      onMouseLeave={e => { if(!active) e.currentTarget.style.borderColor=LINE_L; }}>
                      <p className="font-semibold text-[13.5px]" style={{ color:active?MARIGOLD:PAPER }}>{meta.label}</p>
                      <p className="text-[12px] mt-[2px]" style={{ color:MUTED_L }}>{meta.desc}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Step 3 — District */}
            <div style={{ padding:'24px 28px', borderBottom:`1px solid ${LINE_L}` }}>
              <p className="font-mono-ibm text-[11.5px] tracking-[0.09em] uppercase mb-4" style={{ color:MUTED_L }}>
                03 — Your District
              </p>
              <div className="flex flex-wrap gap-2">
                {DISTRICTS.map(d => {
                  const active = district === d;
                  return (
                    <button key={d} onClick={() => setDistrict(d)}
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

            {/* Match button */}
            <div style={{ padding:'22px 28px' }}>
              <button onClick={handleMatch}
                disabled={interests.length===0 || matching}
                style={{
                  width:'100%', padding:'15px 24px',
                  background: matching ? `${SKY}88` : interests.length>0 ? SKY : LINE_L,
                  color: PAPER, fontWeight:700, fontSize:14.5,
                  borderRadius:2, border:'none',
                  cursor: interests.length>0&&!matching ? 'pointer' : 'not-allowed',
                  transition:'all 0.2s', display:'flex', alignItems:'center', justifyContent:'center', gap:10,
                }}
                onMouseEnter={e => { if(interests.length>0&&!matching) e.currentTarget.style.transform='translateY(-1px)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform='translateY(0)'; }}>
                {matching
                  ? <><motion.div animate={{ rotate:360 }} transition={{ repeat:Infinity, duration:0.9, ease:'linear' }}><RefreshCw size={17}/></motion.div> Finding your matches…</>
                  : <><Sparkles size={17}/> Recommend Organisations <ArrowRight size={17}/></>
                }
              </button>
              {interests.length===0 && (
                <p className="font-mono-ibm text-[11.5px] text-center mt-2" style={{ color:DISC }}>
                  Select at least one cause to continue
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
                      <Eyebrow label="AI Recommended Organisations" color={SKY}/>
                      <h2 className="font-fraunces mt-3" style={{ fontSize:'clamp(24px,2.8vw,36px)', fontWeight:600 }}>
                        {results.length} organisations matched
                      </h2>
                      <p className="font-mono-ibm text-[12.5px] mt-1" style={{ color:MUTED_L }}>
                        Ranked by AI match score · Interest alignment · Goal fit · Location
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {interests.map(i => (
                        <span key={i} className="inline-flex items-center gap-1 font-mono-ibm text-[11px] px-[10px] py-[4px] rounded-full"
                          style={{ color:INTEREST_META[i].color, background:`${INTEREST_META[i].color}14`, border:`1px solid ${INTEREST_META[i].color}33` }}>
                          {INTEREST_META[i].label}
                        </span>
                      ))}
                    </div>
                  </div>
                </Reveal>

                {results.length === 0 ? (
                  <Reveal>
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                      <Building2 size={48} style={{ color:MUTED_L, opacity:0.25, marginBottom:14 }}/>
                      <p className="font-fraunces text-[18px]" style={{ color:MUTED_L }}>No matches found</p>
                      <p className="font-mono-ibm text-[13px] mt-2" style={{ color:MUTED_L }}>
                        Try selecting different interests or choose "Any" district
                      </p>
                    </div>
                  </Reveal>
                ) : (
                  <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(340px,1fr))', gap:8 }}>
                    {results.map((org, i) => (
                      <motion.div key={org.id}
                        initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }}
                        transition={{ duration:0.35, delay:i*0.06 }}
                        style={{ background:INK2, border:`1px solid ${LINE_L}`, borderRadius:3, overflow:'hidden', transition:'border-color 0.2s' }}
                        onMouseEnter={e => e.currentTarget.style.borderColor=org.color+'55'}
                        onMouseLeave={e => e.currentTarget.style.borderColor=LINE_L}>

                        <div style={{ height:3, background:`linear-gradient(90deg,${org.color},transparent)` }}/>
                        <div style={{ padding:'20px 20px' }}>
                          {/* header */}
                          <div className="flex items-start justify-between gap-3 mb-3">
                            <div className="flex items-center gap-3">
                              <div className="flex items-center justify-center rounded-full font-fraunces font-bold text-[17px] flex-shrink-0"
                                style={{ width:42, height:42, background:`${org.color}22`, color:org.color, border:`1.5px solid ${org.color}55` }}>
                                {org.initial}
                              </div>
                              <div>
                                <p className="font-fraunces font-semibold text-[15px]" style={{ color:PAPER, lineHeight:1.25 }}>{org.name}</p>
                                <div className="flex items-center gap-2 mt-[2px]">
                                  <MapPin size={10} style={{ color:MUTED_L }}/>
                                  <span className="font-mono-ibm text-[11px]" style={{ color:MUTED_L }}>{org.district}</span>
                                  {org.verified && <ShieldCheck size={11} style={{ color:SAFE }}/>}
                                </div>
                              </div>
                            </div>
                            <MatchRing score={org.matchScore} color={org.color}/>
                          </div>

                          {/* rating */}
                          <div className="flex items-center gap-3 mb-3">
                            <div className="flex items-center gap-1">
                              {[1,2,3,4,5].map(s => (
                                <Star key={s} size={12} fill={s<=Math.round(org.rating)?MARIGOLD:'transparent'} style={{ color:MARIGOLD }}/>
                              ))}
                            </div>
                            <span className="font-mono-ibm text-[11.5px]" style={{ color:MUTED_L }}>
                              {org.rating} · {org.reviews.toLocaleString()} reviews
                            </span>
                          </div>

                          <p className="text-[13px] mb-4 line-clamp-2" style={{ color:MUTED_L, lineHeight:1.6 }}>{org.desc}</p>

                          {/* trust score bar */}
                          <div className="mb-4">
                            <div className="flex justify-between mb-1">
                              <span className="font-mono-ibm text-[11px]" style={{ color:MUTED_L }}>AI Trust Score</span>
                              <span className="font-mono-ibm text-[11px] font-semibold" style={{ color:SAFE }}>{org.trustScore}/100</span>
                            </div>
                            <div className="h-[3px] rounded-full overflow-hidden" style={{ background:`${SAFE}22` }}>
                              <motion.div className="h-full rounded-full" style={{ background:SAFE }}
                                initial={{ width:0 }} animate={{ width:`${org.trustScore}%` }}
                                transition={{ duration:0.9, ease:[0.4,0,0.2,1] }}/>
                            </div>
                          </div>

                          {/* categories */}
                          <div className="flex flex-wrap gap-1 mb-4">
                            {org.categories.map(c => (
                              <span key={c} className="font-mono-ibm text-[10.5px] px-2 py-[3px] rounded-full"
                                style={{ color:INTEREST_META[c].color, background:`${INTEREST_META[c].color}14`, border:`1px solid ${INTEREST_META[c].color}33` }}>
                                {INTEREST_META[c].label}
                              </span>
                            ))}
                          </div>

                          {/* stats + CTA */}
                          <div className="flex items-center justify-between mb-3">
                            <span className="font-mono-ibm text-[11.5px] flex items-center gap-1" style={{ color:MUTED_L }}>
                              <Users size={11}/> {org.volunteers.toLocaleString()} volunteers
                            </span>
                            <a href={`tel:${org.phone}`}
                              className="font-mono-ibm text-[11.5px] flex items-center gap-1"
                              style={{ color:SKY }}>
                              <Phone size={11}/> {org.phone}
                            </a>
                          </div>

                          <Link to={ROUTES.ORGANIZATIONS}
                            className="inline-flex items-center gap-2 w-full justify-center px-4 py-[10px] font-semibold text-[13px] rounded-[2px]"
                            style={{ background:`${org.color}18`, border:`1px solid ${org.color}44`, color:org.color, transition:'all 0.18s' }}
                            onMouseEnter={e => { e.currentTarget.style.background=org.color; e.currentTarget.style.color=INK; }}
                            onMouseLeave={e => { e.currentTarget.style.background=`${org.color}18`; e.currentTarget.style.color=org.color; }}>
                            <Building2 size={14}/> View Organisation <ChevronRight size={14}/>
                          </Link>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </motion.section>
          )}
        </AnimatePresence>
      </div>

      {/* ══ CTA ════════════════════════════════════════════════════════════ */}
      <section className="px-8 py-[80px]" style={{ background:INK2, borderTop:`1px solid ${LINE_L}` }}>
        <div className="mx-auto text-center" style={{ maxWidth:620 }}>
          <Reveal>
            <h2 className="font-fraunces mb-4" style={{ fontSize:'clamp(26px,3vw,38px)', fontWeight:600 }}>
              The right NGO changes everything
            </h2>
            <p style={{ color:MUTED_L, fontSize:15.5, lineHeight:1.7, marginBottom:32 }}>
              ShebaBD's AI ensures your energy, money, and time goes to organisations that truly align with what you believe in.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link to={ROUTES.ORGANIZATIONS}
                className="inline-flex items-center gap-2 px-[26px] py-[14px] font-semibold text-[14px] rounded-[2px]"
                style={{ background:SKY, color:PAPER, transition:'all 0.2s' }}
                onMouseEnter={e => { e.currentTarget.style.opacity='0.88'; e.currentTarget.style.transform='translateY(-2px)'; }}
                onMouseLeave={e => { e.currentTarget.style.opacity='1'; e.currentTarget.style.transform='translateY(0)'; }}>
                <Building2 size={15}/> Browse All NGOs
              </Link>
              <Link to={ROUTES.DONATE}
                className="inline-flex items-center gap-2 px-[26px] py-[14px] font-semibold text-[14px] rounded-[2px]"
                style={{ border:`1px solid ${LINE_L}`, color:PAPER, transition:'border-color 0.2s' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor=MUTED_L; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor=LINE_L; }}>
                Donate Now <ChevronRight size={15}/>
              </Link>
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
// Murad: NGO trust rating card

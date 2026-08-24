import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Brain, Search, CheckCircle2, XCircle,
  Eye, Copy, Bot, ChevronRight,
  Fingerprint, Filter, ShieldCheck,
  Star, Clock, Flag, TrendingDown, Activity,
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
const DANGER   = '#EF4444';
const WARN     = '#F59E0B';
const SAFE     = '#22C55E';

type Verdict = 'SPAM' | 'DUPLICATE' | 'AI_GENERATED' | 'MANIPULATED' | 'AUTHENTIC';

const VERDICT_META: Record<Verdict, { color: string; bg: string; icon: React.ReactNode; label: string }> = {
  SPAM:         { color: DANGER,   bg: 'rgba(239,68,68,0.11)',  icon: <XCircle size={13}/>,           label: 'Spam'         },
  DUPLICATE:    { color: DISC,     bg: 'rgba(214,71,44,0.11)',  icon: <Copy size={13}/>,               label: 'Duplicate'    },
  AI_GENERATED: { color: WARN,     bg: 'rgba(245,158,11,0.11)', icon: <Bot size={13}/>,                label: 'AI-Generated' },
  MANIPULATED:  { color: MARIGOLD, bg: 'rgba(231,169,59,0.10)', icon: <Flag size={13}/>,               label: 'Manipulated'  },
  AUTHENTIC:    { color: SAFE,     bg: 'rgba(34,197,94,0.11)',  icon: <CheckCircle2 size={13}/>,       label: 'Authentic'    },
};

const FLAGGED_REVIEWS = [
  { id:1, org:'Green Hope BD',          author:'user_28xk',          verdict:'AI_GENERATED' as Verdict, confidence:94, stars:5, date:'2024-11-14',
    text:'This organisation is absolutely incredible and amazing. They have transformed our community in ways that are truly inspirational and outstanding beyond all expectations.',
    signals:['Perplexity score 0.03 (GPT-4 pattern)','Posted 4:11 AM — bot window','Account age 2 days','Identical phrasing found in 11 other reviews'],
    cluster:'Cluster #A4 — 14 coordinated accounts' },
  { id:2, org:'Shishu Alo Foundation',  author:'rahimbd99',          verdict:'SPAM' as Verdict,         confidence:88, stars:5, date:'2024-10-30',
    text:'Best NGO ever. Donate now. Best NGO ever. Donate now. Best NGO ever.',
    signals:['Repetitive trigram fingerprint','Same IP as 6 other reviews','No prior account activity'],
    cluster:'Cluster #B2 — 6 coordinated accounts' },
  { id:3, org:'Bangladesh Flood Shield',author:'fatimaakter91',      verdict:'DUPLICATE' as Verdict,    confidence:99, stars:5, date:'2024-09-05',
    text:'I donated and they responded very quickly and helped my family. Highly recommend to everyone who wants to help flood victims.',
    signals:['100% text match with review #1,082','Submitted from different account 18 hrs later','Flagged by semantic dedup engine'],
    cluster:'Cluster #C1 — 3 near-identical copies' },
  { id:4, org:'Rural Health Initiative',author:'md_karim_volunteer', verdict:'MANIPULATED' as Verdict,  confidence:71, stars:1, date:'2024-12-01',
    text:'Terrible experience. They took money and did nothing. Avoid at all costs.',
    signals:['Account created same day as competitor campaign','Reviewer has 0 prior verified activity','Negative review spike within 48h window'],
    cluster:'Competitor Suppression Pattern' },
  { id:5, org:'Dhaka Child Welfare',    author:'nusrat_sheba',       verdict:'AUTHENTIC' as Verdict,    confidence:97, stars:5, date:'2024-11-20',
    text:'Volunteered with them for 3 months distributing school supplies in Mirpur. The team is dedicated and the impact is real.',
    signals:[], cluster:'None' },
  { id:6, org:'Sylhet Blood Bank',      author:'tariq.islam.sylhet', verdict:'AUTHENTIC' as Verdict,    confidence:95, stars:5, date:'2024-10-12',
    text:'Called at 2 AM for O- blood for my father. They found a donor within 40 minutes. Truly lifesaving work.',
    signals:[], cluster:'None' },
];

const DETECTION_METHODS = [
  { icon:<Bot size={20}/>,         title:'LLM Perplexity Analysis',       color:WARN,    desc:'Measures linguistic perplexity and burstiness scores to detect GPT/Claude generated text patterns with >93% accuracy.' },
  { icon:<Copy size={20}/>,        title:'Semantic Deduplication',         color:SKY,     desc:'SBERT embeddings compare new reviews against the full corpus in real time. Near-duplicate content is quarantined automatically.' },
  { icon:<Fingerprint size={20}/>, title:'Behavioural Fingerprinting',     color:DISC,    desc:'Accounts are fingerprinted by posting time, session duration, device entropy, and IP clustering to expose coordinated rings.' },
  { icon:<Filter size={20}/>,      title:'Coordinated Campaign Detection', color:MARIGOLD,desc:'Graph analysis identifies account clusters posting similar content within time-compressed windows — a hallmark of review manipulation.' },
  { icon:<TrendingDown size={20}/>,title:'Sentiment Spike Analysis',       color:LEAF,    desc:'Abnormal review velocity — sudden 5-star floods or targeted 1-star bombs — triggers automatic investigation workflows.' },
  { icon:<Eye size={20}/>,         title:'Cross-Platform Correlation',     color:SKY,     desc:'Review signals are cross-referenced against Facebook, Google, and Trust Pilot to identify accounts operating across platforms.' },
];

const STATS = [
  { num:'128K+', label:'Reviews Analysed',    sub:'across all organisations'  },
  { num:'4,391', label:'Fake Reviews Blocked',sub:'before publication'        },
  { num:'99.1%', label:'Dedup Accuracy',      sub:'confirmed by human review' },
  { num:'< 2s',  label:'Detection Latency',   sub:'real-time at submission'   },
];

const TERMINAL_LINES = [
  { text:'> Initialising review corpus scan…',       color:MUTED_L,  delay:0    },
  { text:'> Loading LLM perplexity model v3.1…',     color:MUTED_L,  delay:600  },
  { text:'> Embedding 128,441 reviews…',             color:MUTED_L,  delay:1200 },
  { text:'⚠  Cluster #A4 detected — 14 bot accounts',color:WARN,     delay:1900 },
  { text:'✗  AI-generated text confirmed (p=0.03)',  color:DANGER,   delay:2500 },
  { text:'✗  Duplicate fingerprint match ×11',       color:DISC,     delay:3100 },
  { text:'✓  4 authentic reviews cleared',           color:SAFE,     delay:3700 },
  { text:'> Report generated. Quarantine applied.',  color:MARIGOLD, delay:4300 },
];

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
    }, { threshold: 0.08 });
    io.observe(el);
    return () => io.disconnect();
  }, [delay]);
  return (
    <div ref={ref} className={className}
      style={{ opacity:0, transform:'translateY(22px)', transition:'opacity 0.65s ease, transform 0.65s ease', ...style }}>
      {children}
    </div>
  );
}

function Eyebrow({ label, color = DISC }: { label: string; color?: string }) {
  return (
    <div className="inline-flex items-center gap-[9px] font-mono-ibm text-[12px] tracking-[0.11em] uppercase" style={{ color: MUTED_L }}>
      <span className="inline-block w-[6px] h-[6px] rounded-full" style={{ background: color }} />
      {label}
    </div>
  );
}

function VerdictBadge({ verdict }: { verdict: Verdict }) {
  const m = VERDICT_META[verdict];
  return (
    <span className="inline-flex items-center gap-[6px] px-[10px] py-[4px] rounded-full font-mono-ibm text-[11px] font-semibold tracking-[0.05em]"
      style={{ color: m.color, background: m.bg, border: `1px solid ${m.color}33` }}>
      {m.icon}{m.label}
    </span>
  );
}

function Stars({ count }: { count: number }) {
  return (
    <div className="flex items-center gap-[2px]">
      {[1,2,3,4,5].map(i => (
        <Star key={i} size={12} fill={i <= count ? MARIGOLD : 'transparent'} style={{ color: MARIGOLD }} />
      ))}
    </div>
  );
}

function ConfidenceBar({ pct, color }: { pct: number; color: string }) {
  return (
    <div className="relative h-[6px] rounded-full overflow-hidden" style={{ background: `${color}22`, width: '100%' }}>
      <motion.div className="absolute left-0 top-0 h-full rounded-full" style={{ background: color }}
        initial={{ width: 0 }} animate={{ width: `${pct}%` }}
        transition={{ duration: 1.1, ease: [0.4,0,0.2,1] }} />
    </div>
  );
}

function Terminal() {
  const [visible, setVisible] = useState(0);
  useEffect(() => {
    if (visible >= TERMINAL_LINES.length) return;
    const t = setTimeout(() => setVisible(v => v + 1), TERMINAL_LINES[visible]?.delay ?? 500);
    return () => clearTimeout(t);
  }, [visible]);
  return (
    <div style={{ background:'#060F0A', border:`1px solid ${LINE_L}`, borderRadius:4, width:400, padding:'20px 22px', fontFamily:"'IBM Plex Mono', monospace" }}>
      <div className="flex items-center gap-[6px] mb-4">
        {['#EF4444','#F59E0B','#22C55E'].map(c => (
          <span key={c} style={{ width:11, height:11, borderRadius:'50%', background:c, display:'inline-block' }} />
        ))}
        <span className="ml-2 text-[11px]" style={{ color: MUTED_L }}>review-scanner — ShebaBD AI</span>
      </div>
      {TERMINAL_LINES.slice(0, visible).map((line, i) => (
        <motion.p key={i} initial={{ opacity:0, x:-8 }} animate={{ opacity:1, x:0 }}
          transition={{ duration:0.25 }} className="text-[12.5px] leading-[1.9]" style={{ color: line.color }}>
          {line.text}
        </motion.p>
      ))}
      {visible < TERMINAL_LINES.length && (
        <motion.span animate={{ opacity:[1,0] }} transition={{ repeat:Infinity, duration:0.8 }}
          className="inline-block w-[7px] h-[14px] ml-[2px]" style={{ background:SAFE, verticalAlign:'middle' }} />
      )}
    </div>
  );
}

export default function AiFakeReviewDetection() {
  const [search, setSearch]         = useState('');
  const [activeVerdict, setVerdict] = useState<Verdict | 'ALL'>('ALL');
  const [expanded, setExpanded]     = useState<number | null>(null);
  const [testText, setTestText]     = useState('');
  const [testing, setTesting]       = useState(false);
  const [testResult, setTestResult] = useState<null | { verdict: Verdict; confidence: number; signals: string[] }>(null);

  const VERDICT_FILTERS: (Verdict | 'ALL')[] = ['ALL','AI_GENERATED','SPAM','DUPLICATE','MANIPULATED','AUTHENTIC'];

  const filtered = FLAGGED_REVIEWS.filter(r => {
    const ms = r.org.toLowerCase().includes(search.toLowerCase()) ||
               r.author.toLowerCase().includes(search.toLowerCase()) ||
               r.text.toLowerCase().includes(search.toLowerCase());
    const mv = activeVerdict === 'ALL' || r.verdict === activeVerdict;
    return ms && mv;
  });

  function handleTest(e: React.FormEvent) {
    e.preventDefault();
    if (!testText.trim()) return;
    setTesting(true); setTestResult(null);
    setTimeout(() => {
      const n = Math.random();
      if      (n < 0.28) setTestResult({ verdict:'AI_GENERATED', confidence:91, signals:['Low perplexity score (0.04)','Uniform sentence rhythm detected','No first-person specificity'] });
      else if (n < 0.48) setTestResult({ verdict:'SPAM',         confidence:85, signals:['Repetitive keyword density > 40%','No actionable content','Account pattern matches known spammer'] });
      else if (n < 0.62) setTestResult({ verdict:'DUPLICATE',    confidence:97, signals:['98.3% semantic similarity to existing review','Same IP subnet detected'] });
      else if (n < 0.74) setTestResult({ verdict:'MANIPULATED',  confidence:68, signals:['Sentiment inconsistent with reviewer history','Posted during coordinated campaign window'] });
      else               setTestResult({ verdict:'AUTHENTIC',    confidence:96, signals:[] });
      setTesting(false);
    }, 2400);
  }

  return (
    <div style={{ background:INK, color:PAPER, minHeight:'100vh', overflowX:'hidden' }}>

      {/* ══ HERO ════════════════════════════════════════════════════════════ */}
      <section className="relative" style={{ padding:'80px 32px 68px', overflow:'hidden' }}>
        <div className="pointer-events-none absolute rounded-full"
          style={{ top:-140, right:-180, width:500, height:500, background:'radial-gradient(circle, rgba(245,158,11,0.10), transparent 70%)' }} />
        <div className="pointer-events-none absolute rounded-full"
          style={{ bottom:-80, left:-120, width:360, height:360, background:'radial-gradient(circle, rgba(214,71,44,0.08), transparent 70%)' }} />
        <div className="mx-auto" style={{ maxWidth:1180 }}>
          <div className="flex items-center justify-between gap-10 flex-wrap">
            <div style={{ maxWidth:580 }}>
              <Reveal><div className="mb-5"><Eyebrow label="AI · Review Intelligence · v3.1" color={WARN} /></div></Reveal>
              <Reveal delay={80}>
                <h1 className="font-fraunces mb-5" style={{ fontSize:'clamp(36px,4.8vw,60px)', lineHeight:1.04, fontWeight:600 }}>
                  Fake Review<br /><span style={{ color:WARN }}>Shield</span>
                </h1>
              </Reveal>
              <Reveal delay={160}>
                <p style={{ color:MUTED_L, fontSize:16.5, lineHeight:1.7, maxWidth:520 }}>
                  ShebaBD's AI engine analyses every submitted review for spam, duplication,
                  AI generation, and coordinated manipulation — before it ever reaches the public.
                </p>
              </Reveal>
              <Reveal delay={240}>
                <div className="flex flex-wrap gap-4 mt-9">
                  <a href="#test"
                    className="inline-flex items-center gap-2 px-[24px] py-[13px] font-semibold text-[14px] rounded-[2px]"
                    style={{ background:WARN, color:INK, transition:'all 0.2s ease' }}
                    onMouseEnter={e => { e.currentTarget.style.opacity='0.88'; e.currentTarget.style.transform='translateY(-2px)'; }}
                    onMouseLeave={e => { e.currentTarget.style.opacity='1';    e.currentTarget.style.transform='translateY(0)'; }}>
                    Test a Review <Brain size={15}/>
                  </a>
                  <Link to={ROUTES.ORGANIZATIONS}
                    className="inline-flex items-center gap-2 px-[24px] py-[13px] font-semibold text-[14px] rounded-[2px]"
                    style={{ border:`1px solid ${LINE_L}`, color:PAPER, transition:'border-color 0.2s' }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = MUTED_L; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = LINE_L; }}>
                    View Verified NGOs <ChevronRight size={15}/>
                  </Link>
                </div>
              </Reveal>
            </div>
            <Reveal className="hidden lg:flex">
              <Terminal />
            </Reveal>
          </div>
        </div>
      </section>

      {/* ══ STATS ═══════════════════════════════════════════════════════════ */}
      <section style={{ borderTop:`1px solid ${LINE_L}`, borderBottom:`1px solid ${LINE_L}`, background:INK2 }}>
        <div className="mx-auto" style={{ maxWidth:1180 }}>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)' }}>
            {STATS.map(({ num, label, sub }, i) => (
              <Reveal key={label} delay={i * 70}
                style={{ padding:'30px 24px', borderRight: i < 3 ? `1px solid ${LINE_L}` : 'none', textAlign:'center' }}>
                <span className="block font-mono-ibm font-bold mb-[4px]"
                  style={{ fontSize:'clamp(22px,2.4vw,32px)', color:PAPER }}>{num}</span>
                <span className="block text-[13px] font-medium mb-[2px]" style={{ color:PAPER }}>{label}</span>
                <span className="block font-mono-ibm text-[11px]" style={{ color:MUTED_L }}>{sub}</span>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ══ REVIEW TESTER ═══════════════════════════════════════════════════ */}
      <section id="test" className="px-8 py-[90px]">
        <div className="mx-auto" style={{ maxWidth:800 }}>
          <Reveal>
            <div className="text-center mb-10">
              <Eyebrow label="Instant Review Test" color={WARN} />
              <h2 className="font-fraunces mt-5 mb-3"
                style={{ fontSize:'clamp(28px,3.4vw,40px)', lineHeight:1.1, fontWeight:600 }}>
                Paste any review text
              </h2>
              <p style={{ color:MUTED_L, fontSize:15 }}>
                The AI will classify it in under 3 seconds across 6 detection signals.
              </p>
            </div>
          </Reveal>
          <Reveal delay={100}>
            <form onSubmit={handleTest}
              style={{ background:INK2, border:`1px solid ${LINE_L}`, borderRadius:3, padding:'24px 26px' }}>
              <textarea value={testText} onChange={e => setTestText(e.target.value)}
                placeholder="Paste a review here to analyse it…"
                rows={4}
                className="placeholder-[rgba(247,241,225,0.35)] bg-transparent border-none outline-none w-full resize-none"
                style={{ color:PAPER, fontSize:14.5, fontFamily:'Inter, sans-serif', lineHeight:1.65,
                  borderBottom:`1px solid ${LINE_L}`, paddingBottom:16, marginBottom:16 }} />
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <span className="font-mono-ibm text-[11.5px]" style={{ color:MUTED_L }}>
                  {testText.length} characters
                </span>
                <button type="submit" disabled={testing || !testText.trim()}
                  className="inline-flex items-center gap-2 px-[22px] py-[12px] font-semibold text-[14px] rounded-[2px] disabled:opacity-40 disabled:cursor-not-allowed"
                  style={{ background:WARN, color:INK, transition:'all 0.2s', border:'none', cursor:'pointer' }}
                  onMouseEnter={e => { if(!testing) e.currentTarget.style.opacity='0.88'; }}
                  onMouseLeave={e => { e.currentTarget.style.opacity='1'; }}>
                  {testing
                    ? <><motion.div animate={{ rotate:360 }} transition={{ repeat:Infinity, duration:0.9, ease:'linear' }}><Activity size={15}/></motion.div> Analysing…</>
                    : <><Brain size={15}/> Analyse Review</>}
                </button>
              </div>
            </form>
          </Reveal>

          <AnimatePresence>
            {testing && (
              <motion.div key="testing" initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
                className="mt-5 flex flex-col items-center gap-3 py-10"
                style={{ border:`1px solid ${LINE_L}`, borderRadius:3, background:INK2 }}>
                <div className="flex gap-2">
                  {[0,1,2].map(i => (
                    <motion.span key={i} className="block w-[7px] h-[7px] rounded-full" style={{ background:WARN }}
                      animate={{ scale:[1,1.5,1], opacity:[1,0.4,1] }}
                      transition={{ repeat:Infinity, duration:0.9, delay:i*0.2 }} />
                  ))}
                </div>
                <p className="font-mono-ibm text-[13px]" style={{ color:MUTED_L }}>Running 6-signal analysis…</p>
              </motion.div>
            )}
            {testResult && !testing && (
              <motion.div key="result" initial={{ opacity:0, y:14 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0 }}
                transition={{ duration:0.4 }} className="mt-5"
                style={{ border:`1px solid ${VERDICT_META[testResult.verdict].color}44`, borderRadius:3, background:INK2, overflow:'hidden' }}>
                <div className="flex items-center justify-between flex-wrap gap-4 p-5"
                  style={{ background:VERDICT_META[testResult.verdict].bg, borderBottom:`1px solid ${LINE_L}` }}>
                  <div>
                    <p className="font-mono-ibm text-[12px] mb-1" style={{ color:MUTED_L }}>Classification result</p>
                    <VerdictBadge verdict={testResult.verdict} />
                  </div>
                  <div style={{ minWidth:160 }}>
                    <p className="font-mono-ibm text-[11.5px] mb-2" style={{ color:MUTED_L }}>
                      Confidence: <strong style={{ color:PAPER }}>{testResult.confidence}%</strong>
                    </p>
                    <ConfidenceBar pct={testResult.confidence} color={VERDICT_META[testResult.verdict].color} />
                  </div>
                </div>
                <div className="p-5">
                  {testResult.signals.length > 0 ? (
                    <>
                      <p className="font-mono-ibm text-[11.5px] mb-3" style={{ color:MUTED_L }}>DETECTED SIGNALS</p>
                      <ul className="space-y-2">
                        {testResult.signals.map(s => (
                          <li key={s} className="flex items-start gap-2 text-[13.5px]" style={{ color:MUTED_L }}>
                            <XCircle size={14} style={{ color:DISC, marginTop:2, flexShrink:0 }} /> {s}
                          </li>
                        ))}
                      </ul>
                    </>
                  ) : (
                    <div className="flex items-center gap-2" style={{ color:SAFE }}>
                      <CheckCircle2 size={17} />
                      <span className="text-[14px] font-medium">Review appears genuine — no adverse signals detected.</span>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* ══ FLAGGED REVIEWS GRID ════════════════════════════════════════════ */}
      <section className="px-8 pb-[100px]" style={{ borderTop:`1px solid ${LINE_L}` }}>
        <div className="mx-auto pt-[80px]" style={{ maxWidth:1180 }}>
          <Reveal>
            <div className="flex flex-wrap items-end justify-between gap-5 mb-8">
              <div>
                <Eyebrow label="Flagged Review Log" color={DISC} />
                <h2 className="font-fraunces mt-4"
                  style={{ fontSize:'clamp(26px,3vw,36px)', fontWeight:600, lineHeight:1.1 }}>
                  Quarantined reviews
                </h2>
              </div>
              <div className="flex items-center gap-3 flex-1"
                style={{ maxWidth:340, background:INK2, border:`1px solid ${LINE_L}`, borderRadius:2, padding:'11px 16px' }}>
                <Search size={15} style={{ color:MUTED_L }} />
                <input type="text" value={search} onChange={e => setSearch(e.target.value)}
                  placeholder="Search by org, author, or text…"
                  className="placeholder-[rgba(247,241,225,0.4)] bg-transparent border-none outline-none w-full"
                  style={{ color:PAPER, fontSize:13.5, fontFamily:'Inter, sans-serif' }} />
              </div>
            </div>
          </Reveal>

          <Reveal delay={60}>
            <div className="flex flex-wrap gap-[9px] mb-7">
              {VERDICT_FILTERS.map(v => {
                const active = activeVerdict === v;
                const isAll = v === 'ALL';
                const col = isAll ? MUTED_L : VERDICT_META[v].color;
                return (
                  <button key={v} onClick={() => setVerdict(v)}
                    style={{
                      display:'inline-flex', alignItems:'center', gap:6, padding:'8px 15px', borderRadius:100,
                      border:`1px solid ${active ? col : LINE_L}`, background: active ? `${col}22` : 'transparent',
                      color: active ? col : MUTED_L, fontSize:12.5, fontWeight:600, cursor:'pointer',
                      fontFamily:"'IBM Plex Mono', monospace", letterSpacing:'0.04em', transition:'all 0.18s ease',
                    }}
                    onMouseEnter={e => { if(!active){ e.currentTarget.style.borderColor=col; e.currentTarget.style.color=col; }}}
                    onMouseLeave={e => { if(!active){ e.currentTarget.style.borderColor=LINE_L; e.currentTarget.style.color=MUTED_L; }}}>
                    {!isAll && <span style={{ width:7, height:7, borderRadius:'50%', background:col, display:'inline-block', flexShrink:0 }} />}
                    {isAll ? 'All' : VERDICT_META[v].label}
                  </button>
                );
              })}
            </div>
          </Reveal>

          <Reveal delay={100}>
            <p className="font-mono-ibm text-[12.5px] mb-5" style={{ color:MUTED_L }}>
              Showing <strong style={{ color:PAPER }}>{filtered.length}</strong> of <strong style={{ color:PAPER }}>{FLAGGED_REVIEWS.length}</strong> flagged reviews
            </p>
          </Reveal>

          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(340px, 1fr))', gap:1, background:LINE_L, border:`1px solid ${LINE_L}` }}>
            {filtered.map((r, i) => {
              const m = VERDICT_META[r.verdict];
              const isOpen = expanded === r.id;
              return (
                <Reveal key={r.id} delay={i * 50} style={{ background:INK }}>
                  <div style={{ background:INK, padding:'26px 24px', transition:'background 0.22s ease', height:'100%' }}
                    onMouseEnter={e => e.currentTarget.style.background = INK2}
                    onMouseLeave={e => e.currentTarget.style.background = INK}>
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div>
                        <p className="font-fraunces font-semibold text-[15px]" style={{ color:PAPER }}>{r.org}</p>
                        <p className="font-mono-ibm text-[11.5px] mt-[3px]" style={{ color:MUTED_L }}>
                          @{r.author} · {r.date}
                        </p>
                      </div>
                      <VerdictBadge verdict={r.verdict} />
                    </div>

                    <div className="flex items-center gap-3 mb-3">
                      <Stars count={r.stars} />
                      <span className="font-mono-ibm text-[11px]" style={{ color:MUTED_L }}>{r.stars}/5 stars</span>
                    </div>

                    <p className="text-[13px] mb-4 line-clamp-2" style={{ color:MUTED_L, lineHeight:1.6, fontStyle:'italic' }}>
                      "{r.text}"
                    </p>

                    <div className="mb-3">
                      <p className="font-mono-ibm text-[11px] mb-2" style={{ color:MUTED_L }}>
                        Confidence: <strong style={{ color:m.color }}>{r.confidence}%</strong>
                      </p>
                      <ConfidenceBar pct={r.confidence} color={m.color} />
                    </div>

                    {r.signals.length > 0 && !isOpen && (
                      <div className="mb-3">
                        {r.signals.slice(0,2).map(s => (
                          <div key={s} className="flex items-start gap-2 mb-[4px] text-[12px]" style={{ color:MUTED_L }}>
                            <XCircle size={11} style={{ color:DISC, marginTop:2, flexShrink:0 }} /> {s}
                          </div>
                        ))}
                        {r.signals.length > 2 && (
                          <span className="font-mono-ibm text-[11px]" style={{ color:MUTED_L }}>+{r.signals.length-2} more signals</span>
                        )}
                      </div>
                    )}
                    {r.signals.length === 0 && (
                      <div className="flex items-center gap-2 mb-3 text-[12px]" style={{ color:SAFE }}>
                        <CheckCircle2 size={12} /> No adverse signals
                      </div>
                    )}

                    <div className="flex items-center justify-between">
                      <button onClick={() => setExpanded(isOpen ? null : r.id)}
                        className="font-mono-ibm text-[12px] inline-flex items-center gap-1"
                        style={{ color:MUTED_L, background:'none', border:'none', cursor:'pointer', padding:0, transition:'color 0.18s' }}
                        onMouseEnter={e => e.currentTarget.style.color = PAPER}
                        onMouseLeave={e => e.currentTarget.style.color = MUTED_L}>
                        {isOpen ? 'Collapse' : 'Full report'} <ChevronRight size={12} style={{ transform: isOpen ? 'rotate(90deg)' : 'none', transition:'transform 0.2s' }} />
                      </button>
                      {r.cluster !== 'None' && (
                        <span className="font-mono-ibm text-[10.5px] px-[8px] py-[3px] rounded-full"
                          style={{ color:m.color, background:`${m.color}14`, border:`1px solid ${m.color}33` }}>
                          {r.cluster}
                        </span>
                      )}
                    </div>

                    <AnimatePresence>
                      {isOpen && (
                        <motion.div key="detail" initial={{ opacity:0, height:0 }} animate={{ opacity:1, height:'auto' }}
                          exit={{ opacity:0, height:0 }} transition={{ duration:0.28 }} style={{ overflow:'hidden' }}>
                          <div className="mt-4 pt-4" style={{ borderTop:`1px solid ${LINE_L}` }}>
                            <p className="font-mono-ibm text-[11px] uppercase tracking-[0.08em] mb-2" style={{ color:MUTED_L }}>Full Review</p>
                            <p className="text-[13px] mb-4" style={{ color:MUTED_L, lineHeight:1.65, fontStyle:'italic' }}>"{r.text}"</p>
                            <p className="font-mono-ibm text-[11px] uppercase tracking-[0.08em] mb-2" style={{ color:MUTED_L }}>All Signals</p>
                            {r.signals.map(s => (
                              <div key={s} className="flex items-start gap-2 mb-[4px] text-[12px]" style={{ color:MUTED_L }}>
                                <XCircle size={11} style={{ color:DISC, marginTop:2, flexShrink:0 }} /> {s}
                              </div>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </Reveal>
              );
            })}
          </div>

          {filtered.length === 0 && (
            <Reveal>
              <div className="flex flex-col items-center justify-center py-20" style={{ color:MUTED_L }}>
                <ShieldCheck size={48} style={{ opacity:0.25, marginBottom:14 }} />
                <p className="font-fraunces text-[18px]">No matching reviews found</p>
              </div>
            </Reveal>
          )}
        </div>
      </section>

      {/* ══ HOW IT WORKS ════════════════════════════════════════════════════ */}
      <section className="px-8 py-[100px]"
        style={{ background:INK2, borderTop:`1px solid ${LINE_L}`, borderBottom:`1px solid ${LINE_L}` }}>
        <div className="mx-auto" style={{ maxWidth:1180 }}>
          <Reveal>
            <div className="text-center mb-14">
              <Eyebrow label="Detection Architecture" color={SKY} />
              <h2 className="font-fraunces mt-5 mb-3"
                style={{ fontSize:'clamp(28px,3.4vw,42px)', fontWeight:600, lineHeight:1.1 }}>
                How the shield works
              </h2>
              <p style={{ color:MUTED_L, fontSize:15.5, maxWidth:520, margin:'0 auto' }}>
                6 independent detection pipelines run simultaneously on every submitted review.
              </p>
            </div>
          </Reveal>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:1, background:LINE_L, border:`1px solid ${LINE_L}` }}>
            {DETECTION_METHODS.map(({ icon, title, color, desc }, i) => (
              <Reveal key={title} delay={i * 60}
                style={{ background:INK2, padding:'36px 30px', transition:'background 0.22s ease' }}>
                <div
                  onMouseEnter={e => { const p = e.currentTarget.parentElement; if(p) p.style.background = INK3; }}
                  onMouseLeave={e => { const p = e.currentTarget.parentElement; if(p) p.style.background = INK2; }}>
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

      {/* ══ CTA ═════════════════════════════════════════════════════════════ */}
      <section className="px-8 py-[80px]">
        <div className="mx-auto text-center" style={{ maxWidth:660 }}>
          <Reveal>
            <h2 className="font-fraunces mb-4"
              style={{ fontSize:'clamp(26px,3vw,38px)', fontWeight:600 }}>
              Every authentic review matters
            </h2>
            <p style={{ color:MUTED_L, fontSize:15.5, marginBottom:32 }}>
              ShebaBD's review shield runs 24/7 so donors and volunteers can always trust
              the ratings they see. Real feedback builds a stronger social sector.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link to={ROUTES.ORGANIZATIONS}
                className="inline-flex items-center gap-2 px-[26px] py-[14px] font-semibold text-[14px] rounded-[2px]"
                style={{ background:WARN, color:INK, transition:'all 0.2s' }}
                onMouseEnter={e => { e.currentTarget.style.opacity='0.88'; e.currentTarget.style.transform='translateY(-2px)'; }}
                onMouseLeave={e => { e.currentTarget.style.opacity='1';    e.currentTarget.style.transform='translateY(0)'; }}>
                Browse Verified NGOs <ChevronRight size={16}/>
              </Link>
              <Link to={ROUTES.AI_NGO_DETECTION}
                className="inline-flex items-center gap-2 px-[26px] py-[14px] font-semibold text-[14px] rounded-[2px]"
                style={{ border:`1px solid ${LINE_L}`, color:PAPER, transition:'border-color 0.2s' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = MUTED_L; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = LINE_L; }}>
                NGO Detection <ShieldCheck size={15}/>
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

    </div>
  );
}

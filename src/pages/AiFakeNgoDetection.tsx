import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  ShieldAlert, ShieldCheck, ShieldX, Brain, Search,
  AlertTriangle, CheckCircle2, XCircle, Activity,
  Eye, FileWarning, TrendingUp, Zap, Globe, Lock,
  ChevronRight, BarChart3, Clock, Star,
} from 'lucide-react';
import { ROUTES } from '@/constants/routes';

// ─── Design tokens ─────────────────────────────────────────────────────────
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
const MUTED_D  = 'rgba(22,36,29,0.6)';
const LINE_L   = 'rgba(247,241,225,0.16)';
const LINE_D   = 'rgba(22,36,29,0.13)';
const DANGER   = '#EF4444';
const WARN     = '#F59E0B';
const SAFE     = '#22C55E';

// ─── Reveal helper ─────────────────────────────────────────────────────────
function Reveal({ children, delay = 0, className = '', style = {} }: {
  children: React.ReactNode; delay?: number;
  className?: string; style?: React.CSSProperties;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const io = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setTimeout(() => {
          el.style.opacity = '1'; el.style.transform = 'translateY(0)';
        }, delay);
        io.unobserve(el);
      }
    }, { threshold: 0.08 });
    io.observe(el);
    return () => io.disconnect();
  }, [delay]);
  return (
    <div ref={ref} className={className}
      style={{ opacity: 0, transform: 'translateY(22px)', transition: 'opacity 0.65s ease, transform 0.65s ease', ...style }}>
      {children}
    </div>
  );
}

// ─── Eyebrow ────────────────────────────────────────────────────────────────
function Eyebrow({ label, color = DISC }: { label: string; color?: string }) {
  return (
    <div className="inline-flex items-center gap-[9px] font-mono-ibm text-[12px] tracking-[0.11em] uppercase" style={{ color: MUTED_L }}>
      <span className="inline-block w-[6px] h-[6px] rounded-full" style={{ background: color }} />
      {label}
    </div>
  );
}

// ─── Risk badge ─────────────────────────────────────────────────────────────
type Risk = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'VERIFIED';
const RISK_META: Record<Risk, { color: string; bg: string; icon: React.ReactNode; label: string }> = {
  CRITICAL: { color: DANGER,   bg: 'rgba(239,68,68,0.12)',  icon: <ShieldX size={13}/>,    label: 'Critical Risk'  },
  HIGH:     { color: DISC,     bg: 'rgba(214,71,44,0.12)',  icon: <ShieldAlert size={13}/>, label: 'High Risk'      },
  MEDIUM:   { color: WARN,     bg: 'rgba(245,158,11,0.12)', icon: <AlertTriangle size={13}/>,label: 'Medium Risk'   },
  LOW:      { color: MARIGOLD, bg: 'rgba(231,169,59,0.10)', icon: <Eye size={13}/>,         label: 'Low Risk'       },
  VERIFIED: { color: SAFE,     bg: 'rgba(34,197,94,0.11)',  icon: <ShieldCheck size={13}/>, label: 'Verified'       },
};
function RiskBadge({ risk }: { risk: Risk }) {
  const m = RISK_META[risk];
  return (
    <span className="inline-flex items-center gap-[6px] px-[10px] py-[4px] rounded-full font-mono-ibm text-[11px] font-semibold tracking-[0.06em]"
      style={{ color: m.color, background: m.bg, border: `1px solid ${m.color}33` }}>
      {m.icon}{m.label}
    </span>
  );
}

// ─── Animated score ring ────────────────────────────────────────────────────
function ScoreRing({ score, color, size = 110 }: { score: number; color: string; size?: number }) {
  const r = (size - 16) / 2;
  const circ = 2 * Math.PI * r;
  const dash = circ * (score / 100);
  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={LINE_L} strokeWidth={8} />
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={8}
          strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
          style={{ transition: 'stroke-dasharray 1.2s cubic-bezier(0.4,0,0.2,1)' }} />
      </svg>
      <span className="absolute font-mono-ibm font-bold" style={{ fontSize: size * 0.22, color }}>
        {score}
      </span>
    </div>
  );
}

// ─── Flagged-org data ───────────────────────────────────────────────────────
const FLAGGED_ORGS = [
  {
    id: 1, name: 'Green Hope BD', initial: 'G', risk: 'CRITICAL' as Risk,
    score: 91, district: 'Dhaka', category: 'Environment',
    registered: '2023-11-02', reports: 47,
    signals: ['No physical address', 'Cloned website content', 'Donation links unverified', 'Zero govt. registration'],
    donations_claimed: '৳38L', donors_at_risk: 412,
    analysis: 'Entity reuses INGO branding assets verbatim. Bank routing leads to unregistered shell entity.',
  },
  {
    id: 2, name: 'Shishu Alo Foundation', initial: 'S', risk: 'HIGH' as Risk,
    score: 76, district: 'Chittagong', category: 'Education',
    registered: '2022-08-14', reports: 29,
    signals: ['Mismatched TIN records', 'Dormant for 14 months then sudden activity', 'Volunteer testimonials fabricated'],
    donations_claimed: '৳21L', donors_at_risk: 284,
    analysis: 'Sudden fundraising spike post-disaster with no operational history. TIN cross-check failed.',
  },
  {
    id: 3, name: 'Bangladesh Flood Shield', initial: 'B', risk: 'HIGH' as Risk,
    score: 68, district: 'Sylhet', category: 'Disaster Relief',
    registered: '2024-03-30', reports: 18,
    signals: ['Created 3 days after flood announcement', 'No physical presence', 'Social media age < 30 days'],
    donations_claimed: '৳14L', donors_at_risk: 156,
    analysis: 'Opportunistic entity spawned during disaster window. Temporal and geospatial patterns match known fraud clusters.',
  },
  {
    id: 4, name: 'Rural Health Initiative', initial: 'R', risk: 'MEDIUM' as Risk,
    score: 44, district: 'Rajshahi', category: 'Healthcare',
    registered: '2021-05-19', reports: 8,
    signals: ['Annual report discrepancy ৳3.2L', 'Board members unverifiable'],
    donations_claimed: '৳9L', donors_at_risk: 93,
    analysis: 'Moderate anomalies in financial disclosures. Under active audit monitoring.',
  },
  {
    id: 5, name: 'CleanRiver Khulna', initial: 'C', risk: 'LOW' as Risk,
    score: 22, district: 'Khulna', category: 'Environment',
    registered: '2020-02-08', reports: 3,
    signals: ['Minor address inconsistency'],
    donations_claimed: '৳4L', donors_at_risk: 31,
    analysis: 'Minor address discrepancy noted. Organisation otherwise appears legitimate. Monitoring continues.',
  },
  {
    id: 6, name: 'Dhaka Child Welfare', initial: 'D', risk: 'VERIFIED' as Risk,
    score: 4, district: 'Dhaka', category: 'Education',
    registered: '2015-07-11', reports: 0,
    signals: [],
    donations_claimed: '৳72L', donors_at_risk: 0,
    analysis: 'Full government registration, consistent financials, physical audits passed. Cleared.',
  },
];

// ─── Detection signal definitions ──────────────────────────────────────────
const DETECTION_SIGNALS = [
  { icon: <Globe size={20}/>,       title: 'Digital Footprint Analysis',  color: SKY,     desc: 'Cross-references domain age, website content fingerprinting, and social media account creation dates against known fraud patterns.' },
  { icon: <FileWarning size={20}/>, title: 'Document Verification',       color: MARIGOLD,desc: 'Validates TIN, NGO registration certificates, and annual financial disclosures against government databases in real time.' },
  { icon: <Activity size={20}/>,    title: 'Behavioural Pattern Engine',  color: DISC,    desc: 'Detects sudden activity spikes post-disaster, cloned fundraising content, and dormant-to-active account anomalies.' },
  { icon: <TrendingUp size={20}/>,  title: 'Financial Flow Tracing',      color: LEAF,    desc: 'Maps donation bank routing to registered beneficiaries. Flags unregistered shell accounts and inconsistent fund dispersal.' },
  { icon: <Brain size={20}/>,       title: 'AI Similarity Scoring',       color: MARIGOLD,desc: 'NLP model computes semantic similarity between organisation descriptions and known legitimate NGOs to detect plagiarism.' },
  { icon: <Lock size={20}/>,        title: 'Trust Score Composite',       color: SKY,     desc: 'Combines 24 weighted signals into a single 0–100 Risk Score updated every 6 hours from live data pipelines.' },
];

// ─── Stats ──────────────────────────────────────────────────────────────────
const STATS = [
  { num: '3,841',  label: 'NGOs Scanned',        sub: 'in the last 30 days'  },
  { num: '247',    label: 'Suspicious Flagged',   sub: 'awaiting review'      },
  { num: '৳2.3Cr', label: 'Donations Protected',  sub: 'from fraudulent NGOs' },
  { num: '98.4%',  label: 'Detection Accuracy',   sub: 'confirmed by audits'  },
];

// ─── Live scan animation component ──────────────────────────────────────────
function ScanPulse() {
  return (
    <div className="relative flex items-center justify-center" style={{ width: 220, height: 220 }}>
      {[0,1,2].map(i => (
        <motion.div key={i} className="absolute rounded-full border"
          style={{ width: 80 + i*44, height: 80 + i*44, borderColor: `${DISC}${['55','33','18'][i]}` }}
          animate={{ scale: [1, 1.06, 1], opacity: [0.7, 0.3, 0.7] }}
          transition={{ duration: 2.4, repeat: Infinity, delay: i * 0.5, ease: 'easeInOut' }} />
      ))}
      <div className="relative z-10 flex items-center justify-center rounded-full"
        style={{ width: 76, height: 76, background: `${DISC}22`, border: `2px solid ${DISC}66` }}>
        <ShieldAlert size={32} style={{ color: DISC }} />
      </div>
    </div>
  );
}

// ─── Main component ─────────────────────────────────────────────────────────
export default function AiFakeNgoDetection() {
  const [search, setSearch]           = useState('');
  const [activeRisk, setActiveRisk]   = useState<Risk | 'ALL'>('ALL');
  const [expanded, setExpanded]       = useState<number | null>(null);
  const [scanInput, setScanInput]     = useState('');
  const [scanning, setScanning]       = useState(false);
  const [scanResult, setScanResult]   = useState<null | { name: string; score: number; risk: Risk; signals: string[] }>(null);

  const RISK_FILTERS: (Risk | 'ALL')[] = ['ALL','CRITICAL','HIGH','MEDIUM','LOW','VERIFIED'];

  const filtered = FLAGGED_ORGS.filter(o => {
    const matchSearch = o.name.toLowerCase().includes(search.toLowerCase()) ||
                        o.district.toLowerCase().includes(search.toLowerCase()) ||
                        o.category.toLowerCase().includes(search.toLowerCase());
    const matchRisk = activeRisk === 'ALL' || o.risk === activeRisk;
    return matchSearch && matchRisk;
  });

  function handleScan(e: React.FormEvent) {
    e.preventDefault();
    if (!scanInput.trim()) return;
    setScanning(true);
    setScanResult(null);
    setTimeout(() => {
      const n = Math.random();
      if (n < 0.3)      setScanResult({ name: scanInput, score: 82, risk: 'HIGH',     signals: ['Website domain registered < 60 days ago', 'No physical address found', 'Financial disclosures missing'] });
      else if (n < 0.55) setScanResult({ name: scanInput, score: 51, risk: 'MEDIUM',  signals: ['Board member records incomplete', 'Annual report discrepancy detected'] });
      else if (n < 0.75) setScanResult({ name: scanInput, score: 18, risk: 'LOW',     signals: ['Minor metadata inconsistency'] });
      else               setScanResult({ name: scanInput, score: 3,  risk: 'VERIFIED', signals: [] });
      setScanning(false);
    }, 2600);
  }

  return (
    <div style={{ background: INK, color: PAPER, minHeight: '100vh', overflowX: 'hidden' }}>

      {/* ══ HERO ══════════════════════════════════════════════════════════ */}
      <section className="relative px-8 overflow-hidden" style={{ padding: '80px 32px 72px' }}>
        {/* glows */}
        <div className="pointer-events-none absolute rounded-full" style={{ top: -140, right: -180, width: 500, height: 500, background: 'radial-gradient(circle, rgba(214,71,44,0.13), transparent 70%)' }} />
        <div className="pointer-events-none absolute rounded-full" style={{ bottom: -80, left: -120, width: 360, height: 360, background: 'radial-gradient(circle, rgba(231,169,59,0.08), transparent 70%)' }} />

        <div className="mx-auto" style={{ maxWidth: 1180 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', alignItems: 'center', gap: 40 }}>
            <div>
              <Reveal>
                <div className="mb-5"><Eyebrow label="AI · Fraud Intelligence · v2.4" color={DISC} /></div>
              </Reveal>
              <Reveal delay={80}>
                <h1 className="font-fraunces mb-5" style={{ fontSize: 'clamp(36px,4.8vw,60px)', lineHeight: 1.04, fontWeight: 600 }}>
                  Fake NGO<br />
                  <span style={{ color: DISC }}>Detection</span> Engine
                </h1>
              </Reveal>
              <Reveal delay={160}>
                <p style={{ color: MUTED_L, fontSize: 16.5, lineHeight: 1.7, maxWidth: 560 }}>
                  ShebaBD's AI engine continuously scans, scores, and flags suspicious organisations
                  using 24 behavioural signals — protecting donors and the public from fraud.
                </p>
              </Reveal>
              <Reveal delay={240}>
                <div className="flex flex-wrap gap-4 mt-9">
                  <Link to={ROUTES.ORGANIZATIONS}
                    className="inline-flex items-center gap-2 px-[24px] py-[13px] font-semibold text-[14px] rounded-[2px]"
                    style={{ background: DISC, color: PAPER, transition: 'all 0.2s ease' }}
                    onMouseEnter={e => { e.currentTarget.style.background = DISC_DIM; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = DISC; e.currentTarget.style.transform = 'translateY(0)'; }}>
                    View Verified NGOs <ChevronRight size={16} />
                  </Link>
                  <a href="#scan"
                    className="inline-flex items-center gap-2 px-[24px] py-[13px] font-semibold text-[14px] rounded-[2px]"
                    style={{ border: `1px solid ${LINE_L}`, color: PAPER, transition: 'border-color 0.2s ease' }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = MUTED_L; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = LINE_L; }}>
                    Run Instant Scan <Zap size={15} />
                  </a>
                </div>
              </Reveal>
            </div>
            <Reveal className="hidden lg:flex justify-end">
              <ScanPulse />
            </Reveal>
          </div>
        </div>
      </section>

      {/* ══ STATS BAR ═════════════════════════════════════════════════════ */}
      <section style={{ borderTop: `1px solid ${LINE_L}`, borderBottom: `1px solid ${LINE_L}`, background: INK2 }}>
        <div className="mx-auto" style={{ maxWidth: 1180 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)' }}>
            {STATS.map(({ num, label, sub }, i) => (
              <Reveal key={label} delay={i * 80}
                style={{ padding: '32px 28px', borderRight: i < 3 ? `1px solid ${LINE_L}` : 'none', textAlign: 'center' }}>
                <span className="block font-mono-ibm font-bold mb-[5px]" style={{ fontSize: 'clamp(24px,2.6vw,34px)', color: PAPER }}>{num}</span>
                <span className="block text-[13px] font-medium mb-[3px]" style={{ color: PAPER }}>{label}</span>
                <span className="block font-mono-ibm text-[11.5px]" style={{ color: MUTED_L }}>{sub}</span>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ══ INSTANT SCAN ══════════════════════════════════════════════════ */}
      <section id="scan" className="px-8 py-[90px]">
        <div className="mx-auto" style={{ maxWidth: 780 }}>
          <Reveal>
            <div className="text-center mb-10">
              <Eyebrow label="Instant Lookup" color={MARIGOLD} />
              <h2 className="font-fraunces mt-5 mb-3" style={{ fontSize: 'clamp(28px,3.4vw,40px)', lineHeight: 1.1, fontWeight: 600 }}>
                Scan any organisation now
              </h2>
              <p style={{ color: MUTED_L, fontSize: 15 }}>Enter an organisation name to run a live AI risk assessment in seconds.</p>
            </div>
          </Reveal>

          <Reveal delay={100}>
            <form onSubmit={handleScan}
              style={{ background: INK2, border: `1px solid ${LINE_L}`, borderRadius: 3, padding: '28px 28px 24px' }}>
              <div className="flex gap-3 items-center flex-wrap">
                <div className="flex flex-1 items-center gap-3 min-w-[220px]"
                  style={{ background: INK3, border: `1px solid ${LINE_L}`, borderRadius: 2, padding: '13px 18px' }}>
                  <Search size={17} style={{ color: MUTED_L, flexShrink: 0 }} />
                  <input type="text" value={scanInput} onChange={e => setScanInput(e.target.value)}
                    placeholder="e.g. Green Hope Bangladesh…"
                    className="placeholder-[rgba(247,241,225,0.4)] bg-transparent border-none outline-none w-full"
                    style={{ color: PAPER, fontSize: 14.5, fontFamily: 'Inter, sans-serif' }} />
                  {scanInput && (
                    <button type="button" onClick={() => { setScanInput(''); setScanResult(null); }}
                      style={{ color: MUTED_L, background: 'none', border: 'none', cursor: 'pointer', fontSize: 17, lineHeight: 1 }}>×</button>
                  )}
                </div>
                <button type="submit" disabled={scanning || !scanInput.trim()}
                  className="inline-flex items-center gap-2 px-[22px] py-[13px] font-semibold text-[14px] rounded-[2px] disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ background: DISC, color: PAPER, transition: 'all 0.2s', flexShrink: 0 }}
                  onMouseEnter={e => { if (!scanning) e.currentTarget.style.background = DISC_DIM; }}
                  onMouseLeave={e => { e.currentTarget.style.background = DISC; }}>
                  {scanning ? <><motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.9, ease: 'linear' }}><Activity size={15}/></motion.div> Scanning…</> : <><Brain size={15}/>Analyse</>}
                </button>
              </div>
            </form>
          </Reveal>

          {/* scan result */}
          <AnimatePresence>
            {scanning && (
              <motion.div key="scanning" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="mt-6 flex flex-col items-center gap-3 py-10"
                style={{ border: `1px solid ${LINE_L}`, borderRadius: 3, background: INK2 }}>
                <div className="flex gap-2 items-center" style={{ color: MUTED_L }}>
                  {[0,1,2].map(i => (
                    <motion.span key={i} className="block w-[7px] h-[7px] rounded-full" style={{ background: DISC }}
                      animate={{ scale: [1,1.5,1], opacity: [1,0.4,1] }}
                      transition={{ repeat: Infinity, duration: 0.9, delay: i * 0.2 }} />
                  ))}
                </div>
                <p className="font-mono-ibm text-[13px]" style={{ color: MUTED_L }}>Running 24-signal AI analysis…</p>
              </motion.div>
            )}
            {scanResult && !scanning && (
              <motion.div key="result" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                transition={{ duration: 0.45 }}
                className="mt-6" style={{ border: `1px solid ${RISK_META[scanResult.risk].color}44`, borderRadius: 3, background: INK2, overflow: 'hidden' }}>
                <div className="flex items-center justify-between flex-wrap gap-4 p-6"
                  style={{ borderBottom: `1px solid ${LINE_L}`, background: `${RISK_META[scanResult.risk].bg}` }}>
                  <div>
                    <p className="font-mono-ibm text-[12px] mb-1" style={{ color: MUTED_L }}>Analysis complete for</p>
                    <p className="font-fraunces text-[20px] font-semibold" style={{ color: PAPER }}>{scanResult.name}</p>
                  </div>
                  <div className="flex items-center gap-5">
                    <ScoreRing score={scanResult.score} color={RISK_META[scanResult.risk].color} size={88} />
                    <RiskBadge risk={scanResult.risk} />
                  </div>
                </div>
                <div className="p-6">
                  {scanResult.signals.length > 0 ? (
                    <>
                      <p className="font-mono-ibm text-[12px] mb-3" style={{ color: MUTED_L }}>DETECTED SIGNALS</p>
                      <ul className="space-y-2">
                        {scanResult.signals.map(s => (
                          <li key={s} className="flex items-start gap-2 text-[14px]" style={{ color: MUTED_L }}>
                            <XCircle size={14} style={{ color: DISC, marginTop: 2, flexShrink: 0 }} /> {s}
                          </li>
                        ))}
                      </ul>
                    </>
                  ) : (
                    <div className="flex items-center gap-2" style={{ color: SAFE }}>
                      <CheckCircle2 size={18} />
                      <span className="text-[14px] font-medium">No suspicious signals detected. Organisation appears legitimate.</span>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* ══ FLAGGED ORG TABLE ═════════════════════════════════════════════ */}
      <section className="px-8 pb-[100px]" style={{ borderTop: `1px solid ${LINE_L}` }}>
        <div className="mx-auto pt-[80px]" style={{ maxWidth: 1180 }}>
          <Reveal>
            <div className="flex flex-wrap items-end justify-between gap-5 mb-8">
              <div>
                <Eyebrow label="Live Watchlist" color={DISC} />
                <h2 className="font-fraunces mt-4" style={{ fontSize: 'clamp(26px,3vw,36px)', fontWeight: 600, lineHeight: 1.1 }}>
                  Flagged organisations
                </h2>
              </div>
              {/* search */}
              <div className="flex items-center gap-3 flex-1" style={{ maxWidth: 340, background: INK2, border: `1px solid ${LINE_L}`, borderRadius: 2, padding: '11px 16px' }}>
                <Search size={15} style={{ color: MUTED_L }} />
                <input type="text" value={search} onChange={e => setSearch(e.target.value)}
                  placeholder="Filter by name, district, category…"
                  className="placeholder-[rgba(247,241,225,0.4)] bg-transparent border-none outline-none w-full"
                  style={{ color: PAPER, fontSize: 13.5, fontFamily: 'Inter, sans-serif' }} />
              </div>
            </div>
          </Reveal>

          {/* risk filter chips */}
          <Reveal delay={60}>
            <div className="flex flex-wrap gap-[9px] mb-7">
              {RISK_FILTERS.map(r => {
                const isAll = r === 'ALL';
                const active = activeRisk === r;
                const meta = isAll ? null : RISK_META[r];
                const col = meta ? meta.color : MUTED_L;
                return (
                  <button key={r} onClick={() => setActiveRisk(r)}
                    style={{
                      display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 15px',
                      borderRadius: 100, border: `1px solid ${active ? col : LINE_L}`,
                      background: active ? `${col}22` : 'transparent',
                      color: active ? col : MUTED_L, fontSize: 12.5, fontWeight: 600,
                      cursor: 'pointer', fontFamily: "'IBM Plex Mono', monospace",
                      letterSpacing: '0.04em', transition: 'all 0.18s ease',
                    }}
                    onMouseEnter={e => { if (!active) { e.currentTarget.style.borderColor = col; e.currentTarget.style.color = col; } }}
                    onMouseLeave={e => { if (!active) { e.currentTarget.style.borderColor = LINE_L; e.currentTarget.style.color = MUTED_L; } }}>
                    {!isAll && <span style={{ width: 7, height: 7, borderRadius: '50%', background: col, display: 'inline-block', flexShrink: 0 }} />}
                    {r === 'ALL' ? 'All' : RISK_META[r].label}
                  </button>
                );
              })}
            </div>
          </Reveal>

          <Reveal delay={100}>
            <p className="font-mono-ibm text-[12.5px] mb-5" style={{ color: MUTED_L }}>
              Showing <strong style={{ color: PAPER }}>{filtered.length}</strong> of <strong style={{ color: PAPER }}>{FLAGGED_ORGS.length}</strong> flagged entities
            </p>
          </Reveal>

          {/* cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 1, background: LINE_L, border: `1px solid ${LINE_L}` }}>
            {filtered.map((org, i) => {
              const meta = RISK_META[org.risk];
              const isOpen = expanded === org.id;
              return (
                <Reveal key={org.id} delay={i * 55} style={{ background: INK }}>
                  <div style={{ background: INK, padding: '28px 26px', transition: 'background 0.22s ease', height: '100%' }}
                    onMouseEnter={e => (e.currentTarget.style.background = INK2)}
                    onMouseLeave={e => (e.currentTarget.style.background = INK)}>
                    {/* header row */}
                    <div className="flex items-start justify-between gap-3 mb-4">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center rounded-full font-fraunces font-bold text-[17px] shrink-0"
                          style={{ width: 44, height: 44, background: `${meta.color}22`, color: meta.color, border: `1.5px solid ${meta.color}55` }}>
                          {org.initial}
                        </div>
                        <div>
                          <p className="font-fraunces font-semibold text-[16px]" style={{ color: PAPER, lineHeight: 1.25 }}>{org.name}</p>
                          <p className="font-mono-ibm text-[11.5px] mt-[3px]" style={{ color: MUTED_L }}>{org.district} · {org.category}</p>
                        </div>
                      </div>
                      <RiskBadge risk={org.risk} />
                    </div>

                    {/* score + quick stats */}
                    <div className="flex items-center gap-5 mb-4">
                      <ScoreRing score={org.score} color={meta.color} size={72} />
                      <div className="space-y-[6px]">
                        <div className="flex items-center gap-2 text-[12.5px]" style={{ color: MUTED_L }}>
                          <BarChart3 size={12} /> <span>{org.reports} community reports</span>
                        </div>
                        <div className="flex items-center gap-2 text-[12.5px]" style={{ color: MUTED_L }}>
                          <Clock size={12} /> <span>Registered {org.registered}</span>
                        </div>
                        <div className="flex items-center gap-2 text-[12.5px]" style={{ color: meta.color }}>
                          <AlertTriangle size={12} /> <span>{org.donors_at_risk} donors at risk</span>
                        </div>
                      </div>
                    </div>

                    {/* signals preview */}
                    {org.signals.length > 0 && (
                      <div className="mb-4">
                        {org.signals.slice(0, 2).map(s => (
                          <div key={s} className="flex items-start gap-2 mb-[5px] text-[12.5px]" style={{ color: MUTED_L }}>
                            <XCircle size={12} style={{ color: DISC, marginTop: 2, flexShrink: 0 }} /> {s}
                          </div>
                        ))}
                        {org.signals.length > 2 && !isOpen && (
                          <span className="text-[12px] font-mono-ibm" style={{ color: MUTED_L }}>+{org.signals.length - 2} more signals</span>
                        )}
                      </div>
                    )}
                    {org.signals.length === 0 && (
                      <div className="flex items-center gap-2 mb-4 text-[12.5px]" style={{ color: SAFE }}>
                        <CheckCircle2 size={13} /> No adverse signals detected
                      </div>
                    )}

                    {/* expand toggle */}
                    <button onClick={() => setExpanded(isOpen ? null : org.id)}
                      className="font-mono-ibm text-[12px] inline-flex items-center gap-1"
                      style={{ color: MUTED_L, background: 'none', border: 'none', cursor: 'pointer', padding: 0, transition: 'color 0.18s' }}
                      onMouseEnter={e => e.currentTarget.style.color = PAPER}
                      onMouseLeave={e => e.currentTarget.style.color = MUTED_L}>
                      {isOpen ? 'Collapse' : 'Full analysis'} <ChevronRight size={12} style={{ transform: isOpen ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s' }} />
                    </button>

                    {/* expanded detail */}
                    <AnimatePresence>
                      {isOpen && (
                        <motion.div key="detail" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.28 }} style={{ overflow: 'hidden' }}>
                          <div className="mt-4 pt-4" style={{ borderTop: `1px solid ${LINE_L}` }}>
                            <p className="font-mono-ibm text-[11px] uppercase tracking-[0.08em] mb-2" style={{ color: MUTED_L }}>AI Analysis</p>
                            <p className="text-[13.5px] mb-4" style={{ color: MUTED_L, lineHeight: 1.65 }}>{org.analysis}</p>
                            {org.signals.slice(2).map(s => (
                              <div key={s} className="flex items-start gap-2 mb-[5px] text-[12.5px]" style={{ color: MUTED_L }}>
                                <XCircle size={12} style={{ color: DISC, marginTop: 2, flexShrink: 0 }} /> {s}
                              </div>
                            ))}
                            <div className="mt-3 flex items-center gap-2 text-[12.5px]" style={{ color: MARIGOLD }}>
                              <Star size={12} /> Claimed donations: {org.donations_claimed}
                            </div>
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
              <div className="flex flex-col items-center justify-center py-20" style={{ color: MUTED_L }}>
                <ShieldCheck size={48} style={{ opacity: 0.25, marginBottom: 14 }} />
                <p className="font-fraunces text-[18px]">No matching entries found</p>
              </div>
            </Reveal>
          )}
        </div>
      </section>

      {/* ══ HOW IT WORKS ══════════════════════════════════════════════════ */}
      <section className="px-8 py-[100px]" style={{ background: INK2, borderTop: `1px solid ${LINE_L}`, borderBottom: `1px solid ${LINE_L}` }}>
        <div className="mx-auto" style={{ maxWidth: 1180 }}>
          <Reveal>
            <div className="text-center mb-14">
              <Eyebrow label="Detection Architecture" color={SKY} />
              <h2 className="font-fraunces mt-5 mb-3" style={{ fontSize: 'clamp(28px,3.4vw,42px)', fontWeight: 600, lineHeight: 1.1 }}>
                How the engine works
              </h2>
              <p style={{ color: MUTED_L, fontSize: 15.5, maxWidth: 560, margin: '0 auto' }}>
                24 independent signals feed into a composite risk model updated every 6 hours.
              </p>
            </div>
          </Reveal>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 1, background: LINE_L, border: `1px solid ${LINE_L}` }}>
            {DETECTION_SIGNALS.map(({ icon, title, color, desc }, i) => (
              <Reveal key={title} delay={i * 60}
                style={{ background: INK2, padding: '36px 30px', transition: 'background 0.22s ease' }}
                className="group">
                <div style={{ display: 'contents' }}
                  onMouseEnter={e => { const p = (e.currentTarget as HTMLElement).closest('[style]') as HTMLElement | null; if (p) p.style.background = INK3; }}
                  onMouseLeave={e => { const p = (e.currentTarget as HTMLElement).closest('[style]') as HTMLElement | null; if (p) p.style.background = INK2; }}>
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

      {/* ══ CTA BAND ══════════════════════════════════════════════════════ */}
      <section className="px-8 py-[80px]">
        <div className="mx-auto text-center" style={{ maxWidth: 660 }}>
          <Reveal>
            <h2 className="font-fraunces mb-4" style={{ fontSize: 'clamp(26px,3vw,38px)', fontWeight: 600 }}>
              Help us protect Bangladesh's donors
            </h2>
            <p style={{ color: MUTED_L, fontSize: 15.5, marginBottom: 32 }}>
              Spotted a suspicious organisation? Submit a report and our AI engine will prioritise the investigation within 24 hours.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link to={ROUTES.ORGANIZATIONS}
                className="inline-flex items-center gap-2 px-[26px] py-[14px] font-semibold text-[14px] rounded-[2px]"
                style={{ background: DISC, color: PAPER, transition: 'all 0.2s' }}
                onMouseEnter={e => { e.currentTarget.style.background = DISC_DIM; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = DISC; e.currentTarget.style.transform = 'translateY(0)'; }}>
                Browse Verified NGOs <ChevronRight size={16}/>
              </Link>
              <Link to={ROUTES.AI_REVIEW_DETECTION}
                className="inline-flex items-center gap-2 px-[26px] py-[14px] font-semibold text-[14px] rounded-[2px]"
                style={{ border: `1px solid ${LINE_L}`, color: PAPER, transition: 'border-color 0.2s' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = MUTED_L; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = LINE_L; }}>
                Review Shield <ShieldCheck size={15}/>
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

    </div>
  );
}

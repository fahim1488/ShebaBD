import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  BarChart2, TrendingUp, Users, Building2, Heart,
  Droplets, CalendarDays, AlertTriangle, Download,
  RefreshCw, Sparkles, ChevronRight, ArrowUp, ArrowDown,
  FileText, Globe, Zap, ShieldCheck, PieChart,
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

// ─── Types ────────────────────────────────────────────────────────────────────
type ReportType = 'monthly' | 'volunteer' | 'campaign' | 'donation' | 'emergency';
type TabId = 'overview' | 'volunteers' | 'donations' | 'emergency' | 'ngo';

// ─── Data ─────────────────────────────────────────────────────────────────────
const MONTHLY_DONATIONS = [
  { month:'Aug', amount:3.2 }, { month:'Sep', amount:4.1 }, { month:'Oct', amount:3.8 },
  { month:'Nov', amount:5.6 }, { month:'Dec', amount:7.2 }, { month:'Jan', amount:6.1 },
  { month:'Feb', amount:5.4 }, { month:'Mar', amount:8.3 }, { month:'Apr', amount:7.9 },
  { month:'May', amount:9.1 }, { month:'Jun', amount:8.6 }, { month:'Jul', amount:11.2 },
];

const VOLUNTEER_GROWTH = [
  { month:'Aug', count:9200  }, { month:'Sep', count:10100 }, { month:'Oct', count:10800 },
  { month:'Nov', count:11400 }, { month:'Dec', count:12200 }, { month:'Jan', count:13100 },
  { month:'Feb', count:13900 }, { month:'Mar', count:14800 }, { month:'Apr', count:15600 },
  { month:'May', count:16200 }, { month:'Jun', count:17100 }, { month:'Jul', count:18000 },
];

const DISTRICT_COVERAGE = [
  { district:'Dhaka',       ngos:342, volunteers:5200, donations:28.4 },
  { district:'Chittagong',  ngos:218, volunteers:3100, donations:15.2 },
  { district:'Sylhet',      ngos:142, volunteers:2200, donations:10.1 },
  { district:'Rajshahi',    ngos:128, volunteers:1900, donations: 8.4 },
  { district:'Khulna',      ngos:116, volunteers:1700, donations: 7.2 },
  { district:'Barisal',     ngos:98,  volunteers:1400, donations: 5.8 },
  { district:'Mymensingh',  ngos:87,  volunteers:1200, donations: 4.9 },
  { district:'Rangpur',     ngos:76,  volunteers:1100, donations: 4.1 },
];

const CATEGORY_BREAKDOWN = [
  { label:'Education',      pct:28, color:SKY    },
  { label:'Healthcare',     pct:22, color:MARIGOLD},
  { label:'Disaster Relief',pct:18, color:DISC   },
  { label:'Blood Donation', pct:14, color:DANGER  },
  { label:'Environment',    pct:10, color:LEAF    },
  { label:'Poverty',        pct:8,  color:WARN    },
];

const EMERGENCY_STATS = [
  { label:'Critical',  count:47,  color:DANGER  },
  { label:'High',      count:128, color:DISC    },
  { label:'Medium',    count:284, color:WARN    },
  { label:'Low',       count:312, color:MARIGOLD},
  { label:'Resolved',  count:891, color:SAFE    },
];

const REPORT_TEMPLATES: { id: ReportType; label: string; desc: string; icon: React.ReactNode; color: string }[] = [
  { id:'monthly',    label:'Monthly Impact Report',    icon:<FileText size={18}/>,  color:MARIGOLD,
    desc:'Full platform summary — NGOs, volunteers, donations, events, and emergency response for the month.' },
  { id:'volunteer',  label:'Volunteer Statistics',     icon:<Users size={18}/>,     color:LEAF,
    desc:'Volunteer growth, skill distribution, hours logged, district coverage, and achievement analytics.' },
  { id:'campaign',   label:'Campaign Performance',     icon:<Zap size={18}/>,       color:SKY,
    desc:'Event registrations, attendance rates, social media reach, and campaign ROI across all organisations.' },
  { id:'donation',   label:'Donation Analytics',       icon:<Heart size={18}/>,     color:DISC,
    desc:'Donation trends, top causes, donor retention, average gift size, and fund utilisation breakdown.' },
  { id:'emergency',  label:'Emergency Response Report',icon:<AlertTriangle size={18}/>,color:WARN,
    desc:'Emergency requests by priority, response times, district breakdown, and resource deployment analysis.' },
];

// ─── Report text generator ─────────────────────────────────────────────────
function generateReportText(type: ReportType, date: string, title: string): string {
  const separator = '─'.repeat(60);
  const header = `SHEBABD AI REPORT\n${title}\nGenerated: ${date}\n${separator}\n`;

  const bodies: Record<ReportType, string> = {
    monthly: `EXECUTIVE SUMMARY\n\nShebaBD achieved record platform activity in ${date}.\n\nKEY METRICS\n  Registered NGOs         : 2,400+\n  Active Volunteers        : 18,000+\n  Total Donations Tracked  : ৳4.2 Crore\n  Events Held              : 1,840\n  Emergency Requests       : 1,662\n  Districts Covered        : 64/64\n\n${separator}\nNGO ACTIVITY\n  New registrations this month  : +47\n  AI fraud checks passed        : 2,191\n  Suspended (fraud detected)    : 6\n  Average trust score           : 87.4 / 100\n\n${separator}\nVOLUNTEER ACTIVITY\n  New registrations             : +892\n  Hours logged this month       : 48,340\n  Certificates issued           : 312\n  Top district                  : Dhaka (5,200 active)\n\n${separator}\nDONATION SUMMARY\n  Total raised this month       : ৳11.2 Lakh\n  Average gift size             : ৳2,840\n  Top cause                     : Education (28%)\n  Donor retention rate          : 68%\n\n${separator}\nEMERGENCY RESPONSE\n  Total requests                : 187\n  Critical (< 2hr response)     : 14\n  Resolution rate               : 92.4%\n  Orgs deployed                 : 49\n\n${separator}\nAI INSIGHTS\n  → Volunteer growth up 8% MoM — highest in Sylhet division\n  → Donation spike correlates with monsoon season flood coverage\n  → 6 suspicious NGOs flagged and removed from directory\n  → Smart Search query volume up 34% — top query: "blood donor Dhaka"`,

    volunteer: `VOLUNTEER STATISTICS REPORT — ${date}\n\n${separator}\nGROWTH OVERVIEW\n  Total active volunteers       : 18,000+\n  Growth vs last month          : +8.2%\n  Growth vs last year           : +96.4%\n  New registrations this month  : +892\n\n${separator}\nSKILL DISTRIBUTION\n  Medical / Healthcare          : 24%  (4,320 volunteers)\n  Teaching / Education          : 21%  (3,780 volunteers)\n  Engineering / IT              : 18%  (3,240 volunteers)\n  Community Organising          : 16%  (2,880 volunteers)\n  Logistics & Supply Chain      : 12%  (2,160 volunteers)\n  Other                         :  9%  (1,620 volunteers)\n\n${separator}\nDISTRICT COVERAGE\n  Dhaka                         : 5,200 volunteers\n  Chittagong                    : 3,100 volunteers\n  Sylhet                        : 2,200 volunteers\n  Rajshahi                      : 1,900 volunteers\n  Khulna                        : 1,700 volunteers\n  Others (59 districts)         : 3,900 volunteers\n\n${separator}\nACHIEVEMENT & IMPACT\n  Total hours logged            : 48,340 hours\n  Certificates issued           : 312\n  Achievement badges awarded    : 1,204\n  Average satisfaction score    : 4.7 / 5\n\n${separator}\nAI RECOMMENDATION\n  → Fast-track onboarding for medical volunteers in Sylhet\n  → Shortage of logistics volunteers in Barisal — recruitment needed\n  → Top performer: Dr. Fatema Akter (Dhaka) — 140 hrs this month`,

    campaign: `CAMPAIGN PERFORMANCE REPORT — ${date}\n\n${separator}\nOVERALL PERFORMANCE\n  Total campaigns active        : 284\n  New campaigns launched        : 38\n  Campaigns completed           : 51\n  Success rate (target met)     : 76%\n\n${separator}\nEVENT METRICS\n  Events held this month        : 147\n  Total registrations           : 12,840\n  Actual attendance             : 9,620  (74.9% rate)\n  Online participants           : 3,210\n  Certificates generated        : 892\n\n${separator}\nTOP CAMPAIGNS BY REACH\n  1. National Blood Donation Drive    — 4,200 participants\n  2. Climate Awareness March          — 2,800 participants\n  3. Free Medical Camp (Barisal)      — 1,900 participants\n  4. Volunteer Skills Workshop        — 1,400 participants\n  5. School Supply Distribution       — 1,100 participants\n\n${separator}\nSOCIAL MEDIA IMPACT\n  Total impressions             : 2.4 million\n  Shares generated              : 48,200\n  Volunteer signups via social  : 312\n  Donation referrals via social : 184\n\n${separator}\nAI INSIGHTS\n  → Campaigns with video content see 2.4× higher registration\n  → Weekend events outperform weekday by 38%\n  → Flood relief campaigns driving highest volunteer engagement`,

    donation: `DONATION ANALYTICS REPORT — ${date}\n\n${separator}\nDONATION OVERVIEW\n  Total raised this month       : ৳11.2 Lakh\n  Total raised YTD              : ৳4.2 Crore\n  Number of donations           : 3,942\n  Average gift size             : ৳2,840\n  Largest single donation       : ৳2,50,000\n\n${separator}\nCAUSE BREAKDOWN\n  Education                     : 28%  (৳3.14L)\n  Healthcare                    : 22%  (৳2.46L)\n  Disaster Relief               : 18%  (৳2.02L)\n  Blood Donation Services       : 14%  (৳1.57L)\n  Environment                   : 10%  (৳1.12L)\n  Poverty Alleviation           :  8%  (৳0.90L)\n\n${separator}\nDONOR BEHAVIOUR\n  Returning donors              : 68%\n  First-time donors             : 32%\n  Avg donations per donor/yr    : 3.2\n  Mobile donations              : 71%\n  Peak donation day             : Friday\n  Peak donation time            : 8–10 PM\n\n${separator}\nFUND UTILISATION\n  Direct programme delivery     : 70%\n  Field staff & logistics       : 20%\n  Monitoring & reporting        : 10%\n  Platform fee                  : 0%  (fully subsidised)\n\n${separator}\nAI INSIGHTS\n  → Matching gift campaigns yield 2.8× higher average donation\n  → Donors who view impact calculator give 45% more on average\n  → Recommend targeted outreach to lapsed donors in Chittagong`,

    emergency: `EMERGENCY RESPONSE REPORT — ${date}\n\n${separator}\nREQUEST OVERVIEW\n  Total requests this month     : 187\n  Critical priority             : 14   (< 2hr response)\n  High priority                 : 48   (< 6hr response)\n  Medium priority               : 72   (< 24hr response)\n  Low priority                  : 53   (< 72hr response)\n  Resolution rate               : 92.4%\n\n${separator}\nRESPONSE PERFORMANCE\n  Avg response time (Critical)  : 1.4 hours\n  Avg response time (High)      : 4.8 hours\n  Avg response time (Medium)    : 18.2 hours\n  Orgs deployed                 : 49\n  Volunteers mobilised          : 2,190\n\n${separator}\nTYPE BREAKDOWN\n  Flood / waterlogging          : 42%\n  Medical emergency             : 28%\n  Fire / accident               : 14%\n  Cyclone / storm               : 10%\n  Other                         :  6%\n\n${separator}\nDISTRICT HOTSPOTS\n  1. Sunamganj (Sylhet)         — 34 requests (flash flooding)\n  2. Cox's Bazar (Chittagong)   — 28 requests (cyclone alert)\n  3. Sirajganj (Rajshahi)       — 21 requests (river erosion)\n  4. Dhaka                      — 19 requests (waterlogging)\n  5. Khulna                     — 16 requests (coastal hazard)\n\n${separator}\nAI INSIGHTS\n  → Flood response improved 18% vs last monsoon season\n  → Recommend pre-positioning relief materials in Sylhet\n  → AI priority engine correctly classified 97.8% of critical cases`,
  };

  return header + '\n' + bodies[type] + '\n\n' + separator + '\n© ShebaBD AI Analytics · Confidential Platform Report';
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function Reveal({ children, delay = 0, className = '', style = {} }: {
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

function Eyebrow({ label, color = MARIGOLD }: { label: string; color?: string }) {
  return (
    <div className="inline-flex items-center gap-[9px] font-mono-ibm text-[12px] tracking-[0.11em] uppercase"
      style={{ color:MUTED_L }}>
      <span className="inline-block w-[6px] h-[6px] rounded-full" style={{ background:color }} />
      {label}
    </div>
  );
}

// ─── Sparkline bar chart ──────────────────────────────────────────────────────
function BarSparkline({ data, color, valueKey }: {
  data: Record<string,unknown>[]; color: string; valueKey: string;
}) {
  const values = data.map(d => Number(d[valueKey]));
  const max = Math.max(...values);
  return (
    <div className="flex items-end gap-[3px]" style={{ height:60 }}>
      {data.map((d, i) => {
        const h = (Number(d[valueKey]) / max) * 100;
        return (
          <motion.div key={i} title={`${d['month']}: ${d[valueKey]}`}
            className="flex-1 rounded-t-[2px]"
            style={{ background:`${color}`, minWidth:4 }}
            initial={{ height:0 }} animate={{ height:`${h}%` }}
            transition={{ duration:0.6, delay:i*0.04, ease:[0.4,0,0.2,1] }} />
        );
      })}
    </div>
  );
}

// ─── Donut segment ────────────────────────────────────────────────────────────
function DonutChart({ data }: { data: { label: string; pct: number; color: string }[] }) {
  const size = 140; const stroke = 18; const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  let offset = 0;
  return (
    <div className="relative flex items-center justify-center" style={{ width:size, height:size }}>
      <svg width={size} height={size} style={{ transform:'rotate(-90deg)' }}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={LINE_L} strokeWidth={stroke} />
        {data.map(({ pct, color }, i) => {
          const dash = circ * (pct / 100);
          const gap  = circ - dash;
          const seg = (
            <motion.circle key={i} cx={size/2} cy={size/2} r={r}
              fill="none" stroke={color} strokeWidth={stroke}
              strokeDasharray={`${dash} ${gap}`}
              strokeDashoffset={-offset}
              initial={{ strokeDasharray:`0 ${circ}` }}
              animate={{ strokeDasharray:`${dash} ${gap}` }}
              transition={{ duration:1, delay:i*0.12, ease:[0.4,0,0.2,1] }} />
          );
          offset += dash;
          return seg;
        })}
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="font-mono-ibm font-bold text-[13px]" style={{ color:PAPER }}>By</span>
        <span className="font-mono-ibm font-bold text-[13px]" style={{ color:PAPER }}>Cause</span>
      </div>
    </div>
  );
}

// ─── Stat card ────────────────────────────────────────────────────────────────
function StatCard({ icon, label, value, sub, color, trend, trendVal }: {
  icon: React.ReactNode; label: string; value: string; sub: string;
  color: string; trend?: 'up'|'down'; trendVal?: string;
}) {
  return (
    <div style={{ background:INK2, border:`1px solid ${LINE_L}`, borderRadius:3, padding:'24px 22px' }}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center justify-center rounded-full"
          style={{ width:38, height:38, background:`${color}18`, border:`1.5px solid ${color}44`, color }}>
          {icon}
        </div>
        {trend && trendVal && (
          <span className="inline-flex items-center gap-[4px] font-mono-ibm text-[11px] font-semibold px-[8px] py-[3px] rounded-full"
            style={{ color: trend==='up' ? SAFE : DANGER, background: trend==='up' ? `${SAFE}14` : `${DANGER}14` }}>
            {trend==='up' ? <ArrowUp size={11}/> : <ArrowDown size={11}/>} {trendVal}
          </span>
        )}
      </div>
      <p className="font-mono-ibm font-bold mb-[4px]"
        style={{ fontSize:'clamp(22px,2.4vw,32px)', color:PAPER, lineHeight:1 }}>{value}</p>
      <p className="text-[13.5px] font-medium mb-[2px]" style={{ color:PAPER }}>{label}</p>
      <p className="font-mono-ibm text-[11px]" style={{ color:MUTED_L }}>{sub}</p>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function AiAnalytics() {
  const [activeTab, setActiveTab]         = useState<TabId>('overview');
  const [reportType, setReportType]       = useState<ReportType>('monthly');
  const [generating, setGenerating]       = useState(false);
  const [generatedReport, setGeneratedReport] = useState<string | null>(null);
  const [reportDownloaded, setReportDownloaded] = useState(false);
  const reportRef = useRef<HTMLDivElement>(null);

  const TABS: { id: TabId; label: string; icon: React.ReactNode }[] = [
    { id:'overview',   label:'Overview',    icon:<BarChart2 size={14}/>     },
    { id:'volunteers', label:'Volunteers',  icon:<Users size={14}/>          },
    { id:'donations',  label:'Donations',   icon:<Heart size={14}/>          },
    { id:'emergency',  label:'Emergency',   icon:<AlertTriangle size={14}/> },
    { id:'ngo',        label:'NGOs',        icon:<Building2 size={14}/>     },
  ];

  const handleGenerateReport = useCallback(() => {
    setGenerating(true);
    setGeneratedReport(null);
    setReportDownloaded(false);
    setTimeout(() => {
      const tmpl = REPORT_TEMPLATES.find(r => r.id === reportType)!;
      const date = new Date().toLocaleDateString('en-BD', { month:'long', year:'numeric' });
      const report = generateReportText(reportType, date, tmpl.label);
      setGeneratedReport(report);
      setGenerating(false);
      setTimeout(() => reportRef.current?.scrollIntoView({ behavior:'smooth', block:'start' }), 100);
    }, 2000);
  }, [reportType]);

  function handleDownload() {
    if (!generatedReport) return;
    const tmpl = REPORT_TEMPLATES.find(r => r.id === reportType)!;
    const blob = new Blob([generatedReport], { type:'text/plain' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href = url;
    a.download = `shebabd-${reportType}-report-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    setReportDownloaded(true);
  }

  return (
    <div style={{ background:INK, color:PAPER, minHeight:'100vh', overflowX:'hidden' }}>

      {/* ══ HERO ═══════════════════════════════════════════════════════════ */}
      <section className="relative" style={{ padding:'80px 32px 64px', overflow:'hidden' }}>
        <div className="pointer-events-none absolute rounded-full"
          style={{ top:-160, right:-180, width:520, height:520,
            background:'radial-gradient(circle, rgba(231,169,59,0.11), transparent 70%)' }} />
        <div className="pointer-events-none absolute rounded-full"
          style={{ bottom:-100, left:-140, width:380, height:380,
            background:'radial-gradient(circle, rgba(62,122,140,0.08), transparent 70%)' }} />
        <div className="mx-auto" style={{ maxWidth:1180 }}>
          <Reveal><div className="mb-5"><Eyebrow label="AI · Analytics & Report Generator · Live Data" color={MARIGOLD} /></div></Reveal>
          <Reveal delay={70}>
            <h1 className="font-fraunces mb-5"
              style={{ fontSize:'clamp(36px,4.8vw,58px)', lineHeight:1.04, fontWeight:600 }}>
              Platform Analytics &amp;<br /><span style={{ color:MARIGOLD }}>AI Report Generator</span>
            </h1>
          </Reveal>
          <Reveal delay={140}>
            <p style={{ color:MUTED_L, fontSize:16, lineHeight:1.7, maxWidth:560 }}>
              Live dashboards showing NGO registrations, volunteer growth, donation trends,
              campaign performance, and emergency response — plus AI-generated monthly reports
              in one click.
            </p>
          </Reveal>
        </div>
      </section>

      {/* ══ KPI STATS ══════════════════════════════════════════════════════ */}
      <section className="px-8 pb-[60px]">
        <div className="mx-auto" style={{ maxWidth:1180 }}>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:8 }}>
            {[
              { icon:<Building2 size={18}/>,    label:'Registered NGOs',     value:'2,400+', sub:'across 64 districts',        color:SKY,    trend:'up' as const,   trendVal:'+12% MoM' },
              { icon:<Users size={18}/>,         label:'Active Volunteers',   value:'18,000+',sub:'verified profiles',           color:LEAF,   trend:'up' as const,   trendVal:'+8% MoM'  },
              { icon:<Heart size={18}/>,         label:'Donations Tracked',   value:'৳4.2Cr', sub:'transparent fund usage',      color:DISC,   trend:'up' as const,   trendVal:'+23% MoM' },
              { icon:<CalendarDays size={18}/>,  label:'Events Held',         value:'1,840',  sub:'this year across Bangladesh', color:MARIGOLD,trend:'up' as const,  trendVal:'+15% YoY' },
            ].map((s, i) => (
              <Reveal key={s.label} delay={i*60}>
                <StatCard {...s} />
              </Reveal>
            ))}
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:8, marginTop:8 }}>
            {[
              { icon:<Droplets size={18}/>,      label:'Blood Requests',      value:'12,340', sub:'matched with donors',         color:DISC,   trend:'up' as const,   trendVal:'+5% MoM'  },
              { icon:<AlertTriangle size={18}/>, label:'Emergency Requests',  value:'1,662',  sub:'resolved within 24h',         color:WARN,   trend:'down' as const, trendVal:'-3% MoM'  },
              { icon:<ShieldCheck size={18}/>,   label:'Verified NGOs',       value:'2,191',  sub:'passed AI fraud check',       color:SAFE,   trend:'up' as const,   trendVal:'+6% MoM'  },
              { icon:<Globe size={18}/>,         label:'Districts Covered',   value:'64/64',  sub:'nationwide presence',         color:SKY,    trend:'up' as const,   trendVal:'100%'     },
            ].map((s, i) => (
              <Reveal key={s.label} delay={i*60+240}>
                <StatCard {...s} />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ══ TABBED CHARTS ══════════════════════════════════════════════════ */}
      <section className="px-8 pb-[80px]"
        style={{ borderTop:`1px solid ${LINE_L}` }}>
        <div className="mx-auto pt-[60px]" style={{ maxWidth:1180 }}>
          <Reveal>
            <div className="flex items-center justify-between flex-wrap gap-4 mb-8">
              <div>
                <Eyebrow label="Live Dashboards" color={MARIGOLD} />
                <h2 className="font-fraunces mt-3"
                  style={{ fontSize:'clamp(22px,2.6vw,32px)', fontWeight:600 }}>
                  Platform performance at a glance
                </h2>
              </div>
              {/* Tab bar */}
              <div className="flex gap-1 flex-wrap"
                style={{ background:INK2, border:`1px solid ${LINE_L}`, borderRadius:3, padding:4 }}>
                {TABS.map(({ id, label, icon }) => (
                  <button key={id} onClick={() => setActiveTab(id)}
                    className="inline-flex items-center gap-2 px-4 py-2 text-[13px] font-medium rounded-[2px]"
                    style={{
                      background: activeTab===id ? MARIGOLD : 'transparent',
                      color: activeTab===id ? INK : MUTED_L,
                      border:'none', cursor:'pointer', transition:'all 0.15s ease',
                    }}
                    onMouseEnter={e => { if(activeTab!==id) e.currentTarget.style.color=PAPER; }}
                    onMouseLeave={e => { if(activeTab!==id) e.currentTarget.style.color=MUTED_L; }}>
                    {icon} {label}
                  </button>
                ))}
              </div>
            </div>
          </Reveal>

          <AnimatePresence mode="wait">
            {activeTab === 'overview' && (
              <motion.div key="overview" initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }}
                exit={{ opacity:0 }} transition={{ duration:0.3 }}>
                <div style={{ display:'grid', gridTemplateColumns:'2fr 1fr', gap:8 }}>
                  {/* donation bar chart */}
                  <div style={{ background:INK2, border:`1px solid ${LINE_L}`, borderRadius:3, padding:'24px 24px 20px' }}>
                    <p className="font-mono-ibm text-[11.5px] tracking-[0.09em] uppercase mb-1" style={{ color:MUTED_L }}>
                      Monthly Donations (৳ Lakh)
                    </p>
                    <p className="font-fraunces text-[22px] font-semibold mb-4" style={{ color:PAPER }}>
                      ৳{MONTHLY_DONATIONS[MONTHLY_DONATIONS.length-1].amount}L <span className="text-[14px] font-normal font-sans" style={{ color:SAFE }}>↑ +30% YoY</span>
                    </p>
                    <BarSparkline data={MONTHLY_DONATIONS} color={DISC} valueKey="amount" />
                    <div className="flex justify-between mt-2">
                      {MONTHLY_DONATIONS.map(d => (
                        <span key={d.month} className="font-mono-ibm text-[9px]" style={{ color:MUTED_L }}>{d.month}</span>
                      ))}
                    </div>
                  </div>
                  {/* donut + legend */}
                  <div style={{ background:INK2, border:`1px solid ${LINE_L}`, borderRadius:3, padding:'24px' }}>
                    <p className="font-mono-ibm text-[11.5px] tracking-[0.09em] uppercase mb-4" style={{ color:MUTED_L }}>
                      NGOs by Category
                    </p>
                    <div className="flex items-center gap-5">
                      <DonutChart data={CATEGORY_BREAKDOWN} />
                      <div className="space-y-[8px]">
                        {CATEGORY_BREAKDOWN.map(({ label, pct, color }) => (
                          <div key={label} className="flex items-center gap-2">
                            <span className="w-[8px] h-[8px] rounded-full flex-shrink-0" style={{ background:color }} />
                            <span className="text-[12px]" style={{ color:MUTED_L }}>{label}</span>
                            <span className="font-mono-ibm text-[11px] ml-auto" style={{ color }}>{pct}%</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'volunteers' && (
              <motion.div key="volunteers" initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }}
                exit={{ opacity:0 }} transition={{ duration:0.3 }}>
                <div style={{ display:'grid', gridTemplateColumns:'2fr 1fr', gap:8 }}>
                  <div style={{ background:INK2, border:`1px solid ${LINE_L}`, borderRadius:3, padding:'24px 24px 20px' }}>
                    <p className="font-mono-ibm text-[11.5px] tracking-[0.09em] uppercase mb-1" style={{ color:MUTED_L }}>
                      Volunteer Growth (12 months)
                    </p>
                    <p className="font-fraunces text-[22px] font-semibold mb-4" style={{ color:PAPER }}>
                      18,000+ <span className="text-[14px] font-normal font-sans" style={{ color:SAFE }}>↑ +96% YoY</span>
                    </p>
                    <BarSparkline data={VOLUNTEER_GROWTH} color={LEAF} valueKey="count" />
                    <div className="flex justify-between mt-2">
                      {VOLUNTEER_GROWTH.map(d => (
                        <span key={d.month} className="font-mono-ibm text-[9px]" style={{ color:MUTED_L }}>{d.month}</span>
                      ))}
                    </div>
                  </div>
                  <div style={{ background:INK2, border:`1px solid ${LINE_L}`, borderRadius:3, padding:'24px' }}>
                    <p className="font-mono-ibm text-[11.5px] tracking-[0.09em] uppercase mb-4" style={{ color:MUTED_L }}>
                      Top Skills
                    </p>
                    {[
                      { skill:'Medical / Healthcare', pct:24, color:MARIGOLD },
                      { skill:'Teaching / Education', pct:21, color:SKY      },
                      { skill:'Engineering / IT',     pct:18, color:LEAF     },
                      { skill:'Community Organising', pct:16, color:DISC     },
                      { skill:'Logistics',            pct:12, color:WARN     },
                      { skill:'Other',                pct:9,  color:MUTED_L  },
                    ].map(({ skill, pct, color }) => (
                      <div key={skill} className="mb-3">
                        <div className="flex justify-between mb-1">
                          <span className="text-[12.5px]" style={{ color:MUTED_L }}>{skill}</span>
                          <span className="font-mono-ibm text-[11px]" style={{ color }}>{pct}%</span>
                        </div>
                        <div className="h-[3px] rounded-full overflow-hidden" style={{ background:`${color}22` }}>
                          <motion.div className="h-full rounded-full" style={{ background:color }}
                            initial={{ width:0 }} animate={{ width:`${pct}%` }}
                            transition={{ duration:0.9, ease:[0.4,0,0.2,1] }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'donations' && (
              <motion.div key="donations" initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }}
                exit={{ opacity:0 }} transition={{ duration:0.3 }}>
                <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:8, marginBottom:8 }}>
                  {[
                    { label:'Total Raised',     value:'৳4.2Cr',   sub:'all time',           color:DISC   },
                    { label:'Avg Gift Size',     value:'৳2,840',   sub:'per donation',       color:MARIGOLD},
                    { label:'Donor Retention',   value:'68%',      sub:'returned donors',    color:SAFE   },
                  ].map(({ label, value, sub, color }) => (
                    <div key={label} style={{ background:INK2, border:`1px solid ${LINE_L}`, borderRadius:3, padding:'22px 22px' }}>
                      <p className="font-mono-ibm font-bold mb-[3px]"
                        style={{ fontSize:'clamp(22px,2.4vw,30px)', color:PAPER }}>{value}</p>
                      <p className="text-[13px] font-medium mb-[2px]" style={{ color:PAPER }}>{label}</p>
                      <p className="font-mono-ibm text-[11px]" style={{ color:MUTED_L }}>{sub}</p>
                    </div>
                  ))}
                </div>
                <div style={{ background:INK2, border:`1px solid ${LINE_L}`, borderRadius:3, padding:'24px 24px 20px' }}>
                  <p className="font-mono-ibm text-[11.5px] tracking-[0.09em] uppercase mb-1" style={{ color:MUTED_L }}>
                    Donation Trend (৳ Lakh/month)
                  </p>
                  <BarSparkline data={MONTHLY_DONATIONS} color={DISC} valueKey="amount" />
                  <div className="flex justify-between mt-2">
                    {MONTHLY_DONATIONS.map(d => (
                      <span key={d.month} className="font-mono-ibm text-[9px]" style={{ color:MUTED_L }}>{d.month}</span>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'emergency' && (
              <motion.div key="emergency" initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }}
                exit={{ opacity:0 }} transition={{ duration:0.3 }}>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
                  <div style={{ background:INK2, border:`1px solid ${LINE_L}`, borderRadius:3, padding:'24px' }}>
                    <p className="font-mono-ibm text-[11.5px] tracking-[0.09em] uppercase mb-5" style={{ color:MUTED_L }}>
                      Requests by Priority (this month)
                    </p>
                    {EMERGENCY_STATS.map(({ label, count, color }) => {
                      const max = Math.max(...EMERGENCY_STATS.map(e => e.count));
                      return (
                        <div key={label} className="mb-4">
                          <div className="flex justify-between mb-1">
                            <span className="text-[13px]" style={{ color:MUTED_L }}>{label}</span>
                            <span className="font-mono-ibm text-[12px] font-semibold" style={{ color }}>{count}</span>
                          </div>
                          <div className="h-[5px] rounded-full overflow-hidden" style={{ background:`${color}22` }}>
                            <motion.div className="h-full rounded-full" style={{ background:color }}
                              initial={{ width:0 }} animate={{ width:`${(count/max)*100}%` }}
                              transition={{ duration:1, ease:[0.4,0,0.2,1] }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <div style={{ background:INK2, border:`1px solid ${LINE_L}`, borderRadius:3, padding:'24px' }}>
                    <p className="font-mono-ibm text-[11.5px] tracking-[0.09em] uppercase mb-5" style={{ color:MUTED_L }}>
                      Response Performance
                    </p>
                    {[
                      { label:'Avg Response Time (Critical)', value:'< 2 hrs',  color:DANGER  },
                      { label:'Avg Response Time (High)',     value:'< 6 hrs',  color:DISC    },
                      { label:'Avg Response Time (Medium)',   value:'< 24 hrs', color:WARN    },
                      { label:'Resolution Rate',              value:'92.4%',    color:SAFE    },
                      { label:'Orgs Deployed',                value:'847',      color:SKY     },
                    ].map(({ label, value, color }) => (
                      <div key={label} className="flex items-center justify-between py-3"
                        style={{ borderBottom:`1px solid ${LINE_L}` }}>
                        <span className="text-[13px]" style={{ color:MUTED_L }}>{label}</span>
                        <span className="font-mono-ibm text-[13px] font-semibold" style={{ color }}>{value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'ngo' && (
              <motion.div key="ngo" initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }}
                exit={{ opacity:0 }} transition={{ duration:0.3 }}>
                <div style={{ background:INK2, border:`1px solid ${LINE_L}`, borderRadius:3 }}>
                  <div className="flex items-center gap-3 px-5 py-4" style={{ borderBottom:`1px solid ${LINE_L}` }}>
                    <Globe size={15} style={{ color:SKY }} />
                    <span className="font-mono-ibm text-[12px]" style={{ color:MUTED_L }}>
                      TOP 8 DISTRICTS BY NGO PRESENCE
                    </span>
                  </div>
                  <div>
                    {DISTRICT_COVERAGE.map(({ district, ngos, volunteers, donations }, i) => {
                      const maxNgos = Math.max(...DISTRICT_COVERAGE.map(d => d.ngos));
                      return (
                        <motion.div key={district}
                          initial={{ opacity:0, x:-16 }} animate={{ opacity:1, x:0 }}
                          transition={{ duration:0.35, delay:i*0.06 }}
                          className="flex items-center gap-4 px-5 py-4"
                          style={{ borderBottom: i < DISTRICT_COVERAGE.length-1 ? `1px solid ${LINE_L}` : 'none' }}>
                          <span className="font-mono-ibm text-[11px] w-5 flex-shrink-0" style={{ color:MUTED_L }}>
                            {String(i+1).padStart(2,'0')}
                          </span>
                          <span className="font-fraunces font-semibold text-[15px] w-28 flex-shrink-0"
                            style={{ color:PAPER }}>{district}</span>
                          <div className="flex-1 h-[4px] rounded-full overflow-hidden" style={{ background:LINE_L }}>
                            <motion.div className="h-full rounded-full" style={{ background:SKY }}
                              initial={{ width:0 }} animate={{ width:`${(ngos/maxNgos)*100}%` }}
                              transition={{ duration:0.8, delay:i*0.06 }} />
                          </div>
                          <span className="font-mono-ibm text-[12px] w-12 text-right flex-shrink-0"
                            style={{ color:SKY }}>{ngos}</span>
                          <span className="font-mono-ibm text-[11px] w-20 flex-shrink-0"
                            style={{ color:MUTED_L }}>{volunteers.toLocaleString()} vol.</span>
                          <span className="font-mono-ibm text-[11px] w-16 text-right flex-shrink-0"
                            style={{ color:DISC }}>৳{donations}L</span>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* ══ AI REPORT GENERATOR ════════════════════════════════════════════ */}
      <section className="px-8 py-[90px]"
        style={{ background:INK2, borderTop:`1px solid ${LINE_L}`, borderBottom:`1px solid ${LINE_L}` }}>
        <div className="mx-auto" style={{ maxWidth:1180 }}>
          <Reveal>
            <div className="text-center mb-12">
              <Eyebrow label="AI Report Generator" color={MARIGOLD} />
              <h2 className="font-fraunces mt-5 mb-3"
                style={{ fontSize:'clamp(28px,3.4vw,42px)', fontWeight:600, lineHeight:1.1 }}>
                Generate reports in one click
              </h2>
              <p style={{ color:MUTED_L, fontSize:15.5, maxWidth:500, margin:'0 auto' }}>
                Select a report type and the AI assembles a full impact summary using live platform data.
              </p>
            </div>
          </Reveal>

          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:2, alignItems:'start' }}>
            {/* report type selector */}
            <Reveal delay={60}>
              <div style={{ background:INK, border:`1px solid ${LINE_L}`, borderRadius:3 }}>
                <div style={{ padding:'22px 24px', borderBottom:`1px solid ${LINE_L}` }}>
                  <p className="font-mono-ibm text-[11.5px] tracking-[0.09em] uppercase mb-4" style={{ color:MUTED_L }}>
                    Select Report Type
                  </p>
                  <div className="space-y-2">
                    {REPORT_TEMPLATES.map(({ id, label, desc, icon, color }) => {
                      const active = reportType === id;
                      return (
                        <button key={id} onClick={() => { setReportType(id); setGeneratedReport(null); }}
                          className="w-full flex items-start gap-3 text-left"
                          style={{
                            padding:'14px 16px', borderRadius:3,
                            border:`1.5px solid ${active ? color : LINE_L}`,
                            background: active ? `${color}12` : 'transparent',
                            cursor:'pointer', transition:'all 0.18s ease',
                          }}
                          onMouseEnter={e => { if(!active) e.currentTarget.style.borderColor=color+'55'; }}
                          onMouseLeave={e => { if(!active) e.currentTarget.style.borderColor=LINE_L; }}>
                          <span style={{ color, marginTop:2, flexShrink:0 }}>{icon}</span>
                          <div>
                            <p className="font-semibold text-[13.5px]"
                              style={{ color: active ? color : PAPER, lineHeight:1.3 }}>{label}</p>
                            <p className="text-[12px] mt-[3px]" style={{ color:MUTED_L, lineHeight:1.4 }}>{desc}</p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
                <div style={{ padding:'20px 24px' }}>
                  <button onClick={handleGenerateReport} disabled={generating}
                    style={{
                      width:'100%', padding:'14px 22px',
                      background: generating ? `${MARIGOLD}88` : MARIGOLD,
                      color:INK, fontWeight:700, fontSize:14.5, borderRadius:2,
                      border:'none', cursor: generating ? 'not-allowed' : 'pointer',
                      transition:'all 0.2s', display:'flex', alignItems:'center',
                      justifyContent:'center', gap:10,
                    }}
                    onMouseEnter={e => { if(!generating) e.currentTarget.style.transform='translateY(-1px)'; }}
                    onMouseLeave={e => { e.currentTarget.style.transform='translateY(0)'; }}>
                    {generating
                      ? <><motion.div animate={{ rotate:360 }} transition={{ repeat:Infinity, duration:0.9, ease:'linear' }}><RefreshCw size={17}/></motion.div> Generating report…</>
                      : <><Sparkles size={17}/> Generate Report</>
                    }
                  </button>
                </div>
              </div>
            </Reveal>

            {/* report output */}
            <Reveal delay={120}>
              <div ref={reportRef}
                style={{ background:INK, border:`1px solid ${LINE_L}`, borderRadius:3, minHeight:360 }}>
                <div className="flex items-center justify-between gap-3 px-5 py-4"
                  style={{ borderBottom:`1px solid ${LINE_L}` }}>
                  <div className="flex items-center gap-2">
                    <FileText size={15} style={{ color:MARIGOLD }} />
                    <span className="font-semibold text-[14px]" style={{ color:PAPER }}>
                      {REPORT_TEMPLATES.find(r=>r.id===reportType)?.label}
                    </span>
                  </div>
                  {generatedReport && (
                    <button onClick={handleDownload}
                      className="inline-flex items-center gap-2 font-mono-ibm text-[12px] px-3 py-[7px] rounded-[2px]"
                      style={{
                        border:`1px solid ${reportDownloaded ? SAFE : LINE_L}`,
                        color: reportDownloaded ? SAFE : MUTED_L,
                        background:'transparent', cursor:'pointer', transition:'all 0.16s',
                      }}
                      onMouseEnter={e => { if(!reportDownloaded) e.currentTarget.style.borderColor=MARIGOLD; }}
                      onMouseLeave={e => { if(!reportDownloaded) e.currentTarget.style.borderColor=LINE_L; }}>
                      <Download size={13}/> {reportDownloaded ? 'Downloaded!' : 'Download .txt'}
                    </button>
                  )}
                </div>
                <div style={{ padding:'22px 24px', minHeight:300 }}>
                  <AnimatePresence mode="wait">
                    {!generatedReport && !generating && (
                      <motion.div key="empty" initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
                        className="flex flex-col items-center justify-center py-16 text-center">
                        <div style={{ opacity:0.15, marginBottom:14 }}>
                          <BarChart2 size={48} style={{ color:MARIGOLD }} />
                        </div>
                        <p className="font-fraunces text-[18px] mb-2" style={{ color:MUTED_L }}>Report will appear here</p>
                        <p className="font-mono-ibm text-[12px]" style={{ color:MUTED_L }}>Select a type and click Generate</p>
                      </motion.div>
                    )}
                    {generating && (
                      <motion.div key="generating" initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
                        className="flex flex-col items-center justify-center py-16 text-center">
                        <motion.div className="mb-5"
                          animate={{ rotate:[0,15,-15,0], scale:[1,1.1,1] }}
                          transition={{ duration:1.4, repeat:Infinity }}>
                          <Sparkles size={36} style={{ color:MARIGOLD }} />
                        </motion.div>
                        <p className="font-fraunces text-[17px] mb-2" style={{ color:PAPER }}>AI is compiling your report…</p>
                        <p className="font-mono-ibm text-[12px]" style={{ color:MUTED_L }}>
                          Aggregating live data · Calculating metrics · Drafting insights…
                        </p>
                      </motion.div>
                    )}
                    {generatedReport && !generating && (
                      <motion.div key="report" initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }}
                        transition={{ duration:0.4 }}>
                        <pre className="whitespace-pre-wrap font-mono-ibm text-[12.5px] leading-[1.85]"
                          style={{ color:MUTED_L }}>
                          {generatedReport}
                        </pre>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ══ CTA ════════════════════════════════════════════════════════════ */}
      <section className="px-8 py-[80px]">
        <div className="mx-auto text-center" style={{ maxWidth:640 }}>
          <Reveal>
            <h2 className="font-fraunces mb-4"
              style={{ fontSize:'clamp(26px,3vw,38px)', fontWeight:600 }}>
              Data-driven social impact
            </h2>
            <p style={{ color:MUTED_L, fontSize:15.5, lineHeight:1.7, marginBottom:32 }}>
              ShebaBD's AI analytics ensures every organisation, donor, and volunteer can see
              real measurable impact — building trust and driving better decisions.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link to={ROUTES.DONATE}
                className="inline-flex items-center gap-2 px-[26px] py-[14px] font-semibold text-[14px] rounded-[2px]"
                style={{ background:DISC, color:PAPER, transition:'all 0.2s' }}
                onMouseEnter={e => { e.currentTarget.style.background=DISC_DIM; e.currentTarget.style.transform='translateY(-2px)'; }}
                onMouseLeave={e => { e.currentTarget.style.background=DISC; e.currentTarget.style.transform='translateY(0)'; }}>
                <Heart size={15}/> Donate Now
              </Link>
              <Link to={ROUTES.AI_DONATION_ADVISOR}
                className="inline-flex items-center gap-2 px-[26px] py-[14px] font-semibold text-[14px] rounded-[2px]"
                style={{ border:`1px solid ${LINE_L}`, color:PAPER, transition:'border-color 0.2s' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor=MUTED_L; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor=LINE_L; }}>
                Donation Advisor <ChevronRight size={15}/>
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

    </div>
  );
}

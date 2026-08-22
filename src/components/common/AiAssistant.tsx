/**
 * AiAssistant.tsx — Sheba AI Floating Chat Widget
 * Features: SSE streaming, blood district cards, rich markdown, smart chips
 */
import { useRef, useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageCircle, X, Send, Bot, User,
  RefreshCw, Globe, Wrench, Droplets,
  MapPin, Users, AlertTriangle, Phone,
  ChevronRight, TrendingUp,
} from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';
import { checkHealth, streamChat } from '@/services/chatApi';

// ─── Design tokens ────────────────────────────────────────────────────────────
const INK   = '#0B2E22';
const INK2  = '#0F3A2B';
const INK3  = '#123F30';
const PAPER = '#F7F1E1';
const DISC  = '#D6472C';
const MARIG = '#E7A93B';
const SKY   = '#3E7A8C';
const MUTED = 'rgba(247,241,225,0.62)';
const LINE  = 'rgba(247,241,225,0.16)';
const GREEN = '#22C55E';
const AMBER = '#F59E0B';
const RED   = '#EF4444';

// ─── Types ────────────────────────────────────────────────────────────────────
interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  toolCalling?: string | null;
  bloodCard?: BloodCardData | null;
}

interface BloodCardData {
  district: string;
  blood_group: string;
  availability_status: 'good' | 'moderate' | 'low' | 'critical';
  status_message: string;
  available_donors: number;
  unavailable_donors: number;
  active_requests: number;
  urgent_requests: number;
  donors_by_group: Record<string, number>;
  top_donors: Array<{
    name: string;
    blood_group: string;
    district: string;
    area: string;
    total_donations: number;
    phone_masked: string;
    is_verified: boolean;
  }>;
  active_request_summary: Array<{
    patient_name: string;
    blood_group: string;
    hospital: string;
    district: string;
    urgency: string;
    units_needed: number;
    contact_phone: string;
  }>;
  global_stats?: {
    total_donors: number;
    available_donors: number;
    active_requests: number;
  };
}

// ─── Quick-reply chips ────────────────────────────────────────────────────────
const QUICK_EN = [
  '🩸 O+ blood in Dhaka',
  '🩸 A- donors in Sylhet',
  '🩸 B+ in Chittagong',
  '🤝 Volunteer events',
  '🚨 Emergency contacts',
  '🌐 Search live web',
];
const QUICK_BN = [
  '🩸 ঢাকায় O+ রক্ত',
  '🩸 সিলেটে A- দাতা',
  '🩸 চট্টগ্রামে B+ রক্ত',
  '🤝 স্বেচ্ছাসেবক ইভেন্ট',
  '🚨 জরুরি যোগাযোগ',
  '🌐 ইন্টারনেট সার্চ',
];

// ─── Status config ────────────────────────────────────────────────────────────
const STATUS_CONFIG = {
  good:     { label: 'Good Supply',    color: GREEN, bg: 'rgba(34,197,94,0.12)',  icon: '🟢' },
  moderate: { label: 'Moderate',       color: AMBER, bg: 'rgba(245,158,11,0.12)', icon: '🟡' },
  low:      { label: 'Low Supply',     color: '#F97316', bg: 'rgba(249,115,22,0.12)', icon: '🟠' },
  critical: { label: 'Critical',       color: RED,   bg: 'rgba(239,68,68,0.12)',  icon: '🔴' },
};

const URGENCY_COLOR = {
  normal:   GREEN,
  urgent:   AMBER,
  critical: RED,
};

// ─── Blood Availability Card ──────────────────────────────────────────────────
function BloodAvailabilityCard({ data }: { data: BloodCardData }) {
  const status = STATUS_CONFIG[data.availability_status] ?? STATUS_CONFIG.moderate;
  const [expanded, setExpanded] = useState(false);

  return (
    <div style={{
      background: INK2,
      border: `1px solid ${LINE}`,
      borderRadius: 10,
      overflow: 'hidden',
      marginTop: 6,
      fontSize: 12,
    }}>
      {/* Header */}
      <div style={{
        background: `${DISC}18`,
        borderBottom: `1px solid ${LINE}`,
        padding: '10px 12px',
        display: 'flex',
        alignItems: 'center',
        gap: 8,
      }}>
        <Droplets size={14} style={{ color: DISC, flexShrink: 0 }} />
        <div style={{ flex: 1 }}>
          <div style={{ color: PAPER, fontWeight: 700, fontSize: 13 }}>
            Blood Availability
          </div>
          <div style={{ color: MUTED, fontSize: 11, marginTop: 1 }}>
            <span style={{
              background: `${DISC}25`,
              border: `1px solid ${DISC}50`,
              borderRadius: 4,
              padding: '1px 6px',
              color: DISC,
              fontWeight: 700,
              marginRight: 6,
            }}>
              {data.blood_group}
            </span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3 }}>
              <MapPin size={10} />
              {data.district}
            </span>
          </div>
        </div>
        {/* Status badge */}
        <div style={{
          background: status.bg,
          border: `1px solid ${status.color}55`,
          borderRadius: 20,
          padding: '3px 9px',
          color: status.color,
          fontWeight: 700,
          fontSize: 11,
          flexShrink: 0,
        }}>
          {status.icon} {status.label}
        </div>
      </div>

      {/* Stats row */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        borderBottom: `1px solid ${LINE}`,
      }}>
        {[
          { label: 'Available', value: data.available_donors, color: GREEN, icon: <Users size={11} /> },
          { label: 'Requests',  value: data.active_requests,  color: MARIG, icon: <TrendingUp size={11} /> },
          { label: 'Urgent',    value: data.urgent_requests,  color: RED,   icon: <AlertTriangle size={11} /> },
        ].map(({ label, value, color, icon }) => (
          <div key={label} style={{
            padding: '8px 10px',
            textAlign: 'center',
            borderRight: `1px solid ${LINE}`,
          }}>
            <div style={{ color, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 3, marginBottom: 2 }}>
              {icon}
              <span style={{ fontWeight: 800, fontSize: 16 }}>{value}</span>
            </div>
            <div style={{ color: MUTED, fontSize: 10 }}>{label}</div>
          </div>
        ))}
      </div>

      {/* Group breakdown */}
      {Object.keys(data.donors_by_group).length > 0 && (
        <div style={{ padding: '8px 12px', borderBottom: `1px solid ${LINE}` }}>
          <div style={{ color: MUTED, fontSize: 10, marginBottom: 5, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            By Blood Group
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
            {Object.entries(data.donors_by_group).sort((a, b) => b[1] - a[1]).map(([grp, cnt]) => (
              <span key={grp} style={{
                background: `${DISC}20`,
                border: `1px solid ${DISC}45`,
                borderRadius: 4,
                padding: '2px 7px',
                color: PAPER,
                fontSize: 11,
                fontWeight: 700,
              }}>
                {grp} <span style={{ color: GREEN }}>×{cnt}</span>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Top donors */}
      {data.top_donors.length > 0 && (
        <div style={{ padding: '8px 12px', borderBottom: `1px solid ${LINE}` }}>
          <div style={{ color: MUTED, fontSize: 10, marginBottom: 5, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Available Donors
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
            {(expanded ? data.top_donors : data.top_donors.slice(0, 3)).map((d, i) => (
              <div key={i} style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '5px 8px',
                background: `${PAPER}06`,
                borderRadius: 6,
                border: `1px solid ${LINE}`,
              }}>
                <div style={{
                  width: 28, height: 28, borderRadius: '50%',
                  background: `${DISC}20`, border: `1.5px solid ${DISC}50`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: DISC, fontWeight: 800, fontSize: 10, flexShrink: 0,
                }}>
                  {d.blood_group}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ color: PAPER, fontWeight: 600, fontSize: 12, display: 'flex', alignItems: 'center', gap: 4 }}>
                    {d.name}
                    {d.is_verified && (
                      <span style={{ background: 'rgba(59,130,246,0.2)', color: '#60A5FA', borderRadius: 3, padding: '0 4px', fontSize: 9 }}>✓</span>
                    )}
                  </div>
                  <div style={{ color: MUTED, fontSize: 10 }}>
                    {d.area ? `${d.area}, ` : ''}{d.district} · {d.total_donations} donations
                  </div>
                </div>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 3,
                  color: GREEN, fontSize: 10, fontFamily: 'monospace',
                  background: 'rgba(34,197,94,0.08)',
                  border: '1px solid rgba(34,197,94,0.25)',
                  borderRadius: 4, padding: '2px 5px',
                }}>
                  <Phone size={9} /> {d.phone_masked}
                </div>
              </div>
            ))}
          </div>
          {data.top_donors.length > 3 && (
            <button
              onClick={() => setExpanded(e => !e)}
              style={{
                marginTop: 5, color: MARIG, background: 'none', border: 'none',
                cursor: 'pointer', fontSize: 11, display: 'flex', alignItems: 'center', gap: 3,
              }}
            >
              <ChevronRight size={11} style={{ transform: expanded ? 'rotate(90deg)' : 'none', transition: '0.2s' }} />
              {expanded ? 'Show less' : `Show ${data.top_donors.length - 3} more donors`}
            </button>
          )}
        </div>
      )}

      {/* Active requests */}
      {data.active_request_summary.length > 0 && (
        <div style={{ padding: '8px 12px', borderBottom: `1px solid ${LINE}` }}>
          <div style={{ color: MUTED, fontSize: 10, marginBottom: 5, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Active Blood Requests
          </div>
          {data.active_request_summary.map((r, i) => {
            const urg = r.urgency as keyof typeof URGENCY_COLOR;
            return (
              <div key={i} style={{
                padding: '5px 8px', background: `${PAPER}06`,
                borderRadius: 6, border: `1px solid ${LINE}`, marginBottom: i < data.active_request_summary.length - 1 ? 4 : 0,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ color: PAPER, fontWeight: 600, fontSize: 12 }}>{r.patient_name}</span>
                  <span style={{
                    color: URGENCY_COLOR[urg] ?? AMBER,
                    background: `${URGENCY_COLOR[urg] ?? AMBER}18`,
                    border: `1px solid ${URGENCY_COLOR[urg] ?? AMBER}40`,
                    borderRadius: 4, padding: '1px 6px', fontSize: 10, fontWeight: 700,
                    textTransform: 'capitalize',
                  }}>
                    {r.urgency}
                  </span>
                </div>
                <div style={{ color: MUTED, fontSize: 10, marginTop: 2 }}>
                  <span style={{ color: DISC, fontWeight: 700 }}>{r.blood_group}</span>
                  {' · '}{r.units_needed} unit{r.units_needed > 1 ? 's' : ''}
                  {' · '}{r.hospital}
                </div>
                {r.contact_phone && (
                  <div style={{ color: SKY, fontSize: 10, marginTop: 1, display: 'flex', alignItems: 'center', gap: 3 }}>
                    <Phone size={9} /> {r.contact_phone}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Footer: global stats + status message */}
      <div style={{ padding: '7px 12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
        <span style={{ color: MUTED, fontSize: 10, flex: 1, lineHeight: 1.4 }}>
          {data.status_message}
        </span>
        {data.global_stats && (
          <span style={{ color: MUTED, fontSize: 10, flexShrink: 0, textAlign: 'right' }}>
            🌐 {data.global_stats.available_donors} donors nationwide
          </span>
        )}
      </div>
    </div>
  );
}

// ─── Markdown renderer ────────────────────────────────────────────────────────
function renderMarkdown(text: string | undefined | null) {
  if (!text) return null;

  const lines = text.split('\n');
  const elements: React.ReactNode[] = [];
  let tableRows: string[][] = [];
  let inTable = false;

  const flushTable = (key: string) => {
    if (tableRows.length < 2) return;
    const headers = tableRows[0];
    const rows = tableRows.slice(2); // skip separator
    elements.push(
      <div key={`tbl-${key}`} style={{ overflowX: 'auto', margin: '6px 0' }}>
        <table style={{ borderCollapse: 'collapse', width: '100%', fontSize: 11 }}>
          <thead>
            <tr>
              {headers.map((h, i) => (
                <th key={i} style={{
                  padding: '4px 8px', textAlign: 'left',
                  background: `${DISC}18`, color: PAPER, fontWeight: 700,
                  borderBottom: `1px solid ${LINE}`, whiteSpace: 'nowrap',
                }}>{h.trim()}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r, ri) => (
              <tr key={ri} style={{ background: ri % 2 === 0 ? 'transparent' : `${PAPER}04` }}>
                {r.map((cell, ci) => (
                  <td key={ci} style={{
                    padding: '4px 8px', color: PAPER, fontSize: 11,
                    borderBottom: `1px solid ${LINE}55`,
                  }}>{renderInline(cell.trim())}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
    tableRows = [];
  };

  lines.forEach((line, li) => {
    // Table row
    if (line.trim().startsWith('|')) {
      if (!inTable) inTable = true;
      tableRows.push(line.split('|').slice(1, -1));
      return;
    } else if (inTable) {
      flushTable(String(li));
      inTable = false;
    }

    // Headings
    if (line.startsWith('### ')) {
      elements.push(<div key={li} style={{ color: MARIG, fontWeight: 700, fontSize: 13, marginTop: 8, marginBottom: 3 }}>{line.slice(4)}</div>);
    } else if (line.startsWith('## ')) {
      elements.push(<div key={li} style={{ color: PAPER, fontWeight: 800, fontSize: 14, marginTop: 10, marginBottom: 4, borderBottom: `1px solid ${LINE}`, paddingBottom: 3 }}>{line.slice(3)}</div>);
    } else if (line.startsWith('# ')) {
      elements.push(<div key={li} style={{ color: PAPER, fontWeight: 800, fontSize: 15, marginTop: 8, marginBottom: 4 }}>{line.slice(2)}</div>);
    }
    // Horizontal rule
    else if (line.trim() === '---') {
      elements.push(<hr key={li} style={{ border: 'none', borderTop: `1px solid ${LINE}`, margin: '8px 0' }} />);
    }
    // Bullet
    else if (line.startsWith('- ') || line.startsWith('• ')) {
      elements.push(
        <div key={li} style={{ display: 'flex', gap: 6, marginBottom: 2, paddingLeft: 2 }}>
          <span style={{ color: DISC, flexShrink: 0, marginTop: 1 }}>•</span>
          <span style={{ color: PAPER, lineHeight: 1.55 }}>{renderInline(line.slice(2))}</span>
        </div>
      );
    }
    // Blockquote
    else if (line.startsWith('> ')) {
      elements.push(
        <div key={li} style={{
          borderLeft: `3px solid ${MARIG}60`, paddingLeft: 10, margin: '4px 0',
          color: MUTED, fontStyle: 'italic', fontSize: 12,
        }}>
          {renderInline(line.slice(2))}
        </div>
      );
    }
    // Empty line → spacer
    else if (line.trim() === '') {
      elements.push(<div key={li} style={{ height: 4 }} />);
    }
    // Normal paragraph
    else {
      elements.push(
        <div key={li} style={{ color: PAPER, lineHeight: 1.6, marginBottom: 1 }}>
          {renderInline(line)}
        </div>
      );
    }
  });

  // Flush any trailing table
  if (inTable) flushTable('end');

  return <>{elements}</>;
}

function renderInline(text: string): React.ReactNode {
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`|\*[^*]+\*)/g);
  return (
    <>
      {parts.map((part, i) => {
        if (part.startsWith('**') && part.endsWith('**'))
          return <strong key={i} style={{ color: PAPER, fontWeight: 700 }}>{part.slice(2, -2)}</strong>;
        if (part.startsWith('`') && part.endsWith('`'))
          return <code key={i} style={{ background: `${DISC}22`, border: `1px solid ${DISC}40`, padding: '1px 5px', borderRadius: 4, fontFamily: 'monospace', fontSize: '0.88em', color: DISC }}>{part.slice(1, -1)}</code>;
        if (part.startsWith('*') && part.endsWith('*'))
          return <em key={i} style={{ color: MUTED }}>{part.slice(1, -1)}</em>;
        return <span key={i}>{part}</span>;
      })}
    </>
  );
}

// ─── Parse blood card from tool result in text ────────────────────────────────
// If the AI response mentions blood availability data from getBloodAvailability,
// the backend will stream it as a token. We detect structured JSON blocks.
function extractBloodCard(content: string): BloodCardData | null {
  // look for JSON block markers the AI might emit
  try {
    const match = content.match(/```json\s*(\{[\s\S]*?"availability_status"[\s\S]*?\})\s*```/);
    if (match) return JSON.parse(match[1]) as BloodCardData;
  } catch {}
  return null;
}

let msgCounter = 0;
const newId = () => `msg-${++msgCounter}-${Date.now()}`;

// ─── Main component ───────────────────────────────────────────────────────────
export function AiAssistant() {
  const { lang, toggleLang } = useLanguage();
  const [open,      setOpen]      = useState(false);
  const [unread,    setUnread]    = useState(1);
  const [online,    setOnline]    = useState<boolean | null>(null);
  const [input,     setInput]     = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error,     setError]     = useState<string | null>(null);
  const [messages,  setMessages]  = useState<ChatMessage[]>([]);

  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef  = useRef<HTMLInputElement>(null);
  const abortRef  = useRef<AbortController | null>(null);
  const convIdRef = useRef<string | null>(null);

  // ── Welcome message ───────────────────────────────────────────────────────
  const welcomeMsg = useCallback((): ChatMessage => ({
    id: 'welcome',
    role: 'assistant',
    content: lang === 'en'
      ? "Hi! I'm **Sheba AI** 🩸 — Ask me about **blood availability in any district**, volunteer events, NGOs, or anything else!\n\n**Try:** *\"O+ blood in Dhaka\"* or *\"How many A- donors in Sylhet?\"*"
      : 'হ্যালো! আমি **শেবা AI** 🩸 — যেকোনো জেলায় **রক্তের প্রাপ্যতা**, স্বেচ্ছাসেবক ইভেন্ট বা যেকোনো প্রশ্ন করুন!\n\n**চেষ্টা করুন:** *"ঢাকায় O+ রক্ত"* বা *"সিলেটে A- দাতা কতজন?"*',
  }), [lang]);

  useEffect(() => { setMessages([welcomeMsg()]); }, []); // eslint-disable-line
  useEffect(() => { checkHealth().then(ok => setOnline(ok)); }, []);
  useEffect(() => {
    setMessages([welcomeMsg()]);
    convIdRef.current = null;
  }, [lang, welcomeMsg]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  useEffect(() => {
    if (open) { setUnread(0); setTimeout(() => inputRef.current?.focus(), 200); }
  }, [open]);

  // ── Send message ─────────────────────────────────────────────────────────
  const sendMessage = useCallback((text: string) => {
    const trimmed = text.trim();
    if (!trimmed || isLoading) return;

    setError(null);
    setInput('');

    const userMsg: ChatMessage = { id: newId(), role: 'user', content: trimmed };
    const botMsgId = newId();
    const botMsg: ChatMessage  = { id: botMsgId, role: 'assistant', content: '' };

    setMessages(prev => [...prev, userMsg, botMsg]);
    setIsLoading(true);

    const token = localStorage.getItem('shebabd_token');

    abortRef.current = streamChat(
      trimmed,
      convIdRef.current,
      {
        onMeta: (conversationId) => { convIdRef.current = conversationId; },
        onToken: (chunk) => {
          setMessages(prev =>
            prev.map(m => m.id === botMsgId
              ? { ...m, content: m.content + chunk }
              : m
            )
          );
        },
        onTool: (name, status) => {
          setMessages(prev =>
            prev.map(m => m.id === botMsgId
              ? { ...m, toolCalling: status === 'calling' ? name : null }
              : m
            )
          );
        },
        onDone: () => {
          setIsLoading(false);
          // After streaming finishes, try to extract blood card data
          setMessages(prev =>
            prev.map(m => {
              if (m.id !== botMsgId) return m;
              const card = extractBloodCard(m.content);
              return { ...m, toolCalling: null, bloodCard: card };
            })
          );
        },
        onError: (msg) => {
          setIsLoading(false);
          setError(msg);
          setMessages(prev => prev.filter(m => m.id !== botMsgId));
        },
      },
      token,
    );
  }, [isLoading]);

  const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); sendMessage(input); };

  const resetChat = () => {
    abortRef.current?.abort();
    setIsLoading(false);
    convIdRef.current = null;
    setError(null);
    setMessages([welcomeMsg()]);
  };

  const statusLabel = isLoading ? 'typing…'
    : online === null ? 'connecting…'
    : online ? 'Online · Blood & District AI'
    : 'Offline mode';
  const statusColor = online === false ? DISC : GREEN;

  const nowTs = () => new Date().toLocaleTimeString('en-BD', { hour: '2-digit', minute: '2-digit' });

  // ── Tool display name ──────────────────────────────────────────────────────
  const toolLabel = (name: string) => {
    const map: Record<string, string> = {
      getBloodAvailability: '🩸 checking blood availability…',
      findBloodRequests:    '🩸 finding blood requests…',
      findVolunteerEvents:  '🤝 searching events…',
      getEmergencyContacts: '🚨 loading contacts…',
      getOrganization:      '🏢 looking up organization…',
      searchFAQ:            '📖 searching FAQ…',
      webSearch:            '🌐 searching the web…',
    };
    return map[name] ?? `⚙️ calling ${name}…`;
  };

  return (
    <>
      {/* ── Floating button ─────────────────────────────────────────────── */}
      <div className="fixed bottom-6 right-6 z-[9999] flex flex-col items-end gap-3">
        <AnimatePresence>
          {!open && (
            <motion.div
              initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }}
              transition={{ duration: 0.2 }}
              className="font-mono-ibm text-[11.5px] px-3.5 py-1.5 rounded-full pointer-events-none flex items-center gap-1.5 shadow-lg"
              style={{ background: INK2, border: `1px solid ${MARIG}55`, color: PAPER }}
            >
              <Bot size={14} className="text-[#E7A93B]" /> AI Assistant · Sheba
            </motion.div>
          )}
        </AnimatePresence>

        <button
          onClick={() => setOpen(o => !o)}
          aria-label="Open AI Assistant"
          className="relative flex items-center justify-center rounded-full shadow-2xl transition-all duration-200"
          style={{ 
            width: 58, 
            height: 58, 
            background: open ? INK3 : 'linear-gradient(135deg, #D6472C 0%, #E7A93B 100%)', 
            border: `2px solid ${open ? LINE : MARIG}`,
            boxShadow: '0 0 22px rgba(231, 169, 59, 0.45)'
          }}
          onMouseEnter={e => { if (!open) e.currentTarget.style.transform = 'scale(1.08)'; }}
          onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; }}
        >
          <AnimatePresence mode="wait">
            {open
              ? <motion.div key="x" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.18 }}><X size={24} color={PAPER} /></motion.div>
              : <motion.div key="chat" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.18 }}><Bot size={26} color={PAPER} /></motion.div>
            }
          </AnimatePresence>
          {!open && unread > 0 && (
            <span className="absolute -top-1 -right-1 flex items-center justify-center rounded-full font-mono-ibm text-[10px] font-bold shadow-md"
              style={{ width: 20, height: 20, background: MARIG, color: INK }}>
              {unread}
            </span>
          )}
          {!open && (
            <motion.span className="absolute inset-0 rounded-full" style={{ border: `2px solid ${MARIG}` }}
              animate={{ scale: [1, 1.5], opacity: [0.6, 0] }}
              transition={{ duration: 1.8, repeat: Infinity, ease: 'easeOut' }}
            />
          )}
        </button>
      </div>

      {/* ── Chat panel ──────────────────────────────────────────────────── */}
      <AnimatePresence>
        {open && (
          <motion.div
            key="chat-panel"
            initial={{ opacity: 0, y: 24, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.95 }}
            transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
            className="fixed z-[9998] flex flex-col"
            style={{
              bottom: 80, right: 24,
              width: 'min(420px, calc(100vw - 32px))',
              height: 'min(620px, calc(100vh - 110px))',
              background: INK,
              border: `1px solid ${LINE}`,
              borderRadius: 12,
              boxShadow: '0 32px 64px rgba(0,0,0,0.6)',
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 flex-shrink-0"
              style={{ borderBottom: `1px solid ${LINE}`, background: INK2, borderRadius: '12px 12px 0 0' }}>
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center rounded-full"
                  style={{ width: 38, height: 38, background: `${MARIG}22`, border: `2px solid ${MARIG}66` }}>
                  <Bot size={20} style={{ color: MARIG }} />
                </div>
                <div>
                  <p className="font-fraunces font-semibold text-[14.5px] flex items-center gap-1.5" style={{ color: PAPER }}>
                    Sheba AI Assistant
                  </p>
                  <div className="flex items-center gap-1">
                    <span className="w-[6px] h-[6px] rounded-full inline-block" style={{ background: statusColor }} />
                    <span className="font-mono-ibm text-[10.5px]" style={{ color: MUTED }}>{statusLabel}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={toggleLang}
                  className="inline-flex items-center gap-1 font-mono-ibm text-[11px] px-2 py-1 rounded-full"
                  style={{ border: `1px solid ${LINE}`, color: MUTED, background: 'transparent', cursor: 'pointer' }}>
                  <Globe size={11} />{lang === 'en' ? 'EN' : 'BN'}
                </button>
                <button onClick={resetChat}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: MUTED, padding: 4 }} title="Clear chat">
                  <RefreshCw size={14} />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3"
              style={{ scrollbarWidth: 'thin', scrollbarColor: `${LINE} transparent` }}>

              {error && (
                <div className="rounded-lg px-3 py-2 text-xs"
                  style={{ background: 'rgba(214,71,44,0.15)', border: `1px solid rgba(214,71,44,0.3)`, color: '#f87171' }}>
                  ⚠️ {error}
                </div>
              )}

              {messages.map(msg => {
                const isBot = msg.role === 'assistant';
                return (
                  <div key={msg.id} className={`flex gap-2 ${isBot ? 'flex-row' : 'flex-row-reverse'}`}>
                    {/* Avatar */}
                    <div className="flex items-end justify-center rounded-full flex-shrink-0"
                      style={{ width: 28, height: 28, background: isBot ? `${DISC}22` : `${SKY}22`, border: `1.5px solid ${isBot ? DISC + '55' : SKY + '55'}` }}>
                      {isBot
                        ? <Droplets size={13} style={{ color: DISC }} />
                        : <User size={13} style={{ color: SKY }} />
                      }
                    </div>

                    {/* Bubble */}
                    <div style={{ maxWidth: '85%' }}>
                      {/* Tool calling badge */}
                      {msg.toolCalling && (
                        <div className="flex items-center gap-1.5 mb-1.5 px-2 py-1 rounded-full text-[10.5px] font-mono-ibm"
                          style={{ background: `${MARIG}18`, border: `1px solid ${MARIG}33`, color: MARIG, width: 'fit-content' }}>
                          <motion.span animate={{ rotate: 360 }} transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }}>
                            <Wrench size={10} />
                          </motion.span>
                          {toolLabel(msg.toolCalling)}
                        </div>
                      )}

                      {/* Message content */}
                      <div className="px-3 py-2 text-[13px] leading-[1.65]"
                        style={{
                          background: isBot ? INK2 : `${SKY}18`,
                          border: `1px solid ${isBot ? LINE : SKY + '33'}`,
                          color: PAPER,
                          borderRadius: isBot ? '4px 12px 12px 12px' : '12px 4px 12px 12px',
                        }}>
                        {msg.content
                          ? renderMarkdown(msg.content)
                          : isBot && isLoading
                          ? (
                            <div className="flex items-center gap-[4px] py-1">
                              {[0, 1, 2].map(i => (
                                <motion.span key={i} className="block rounded-full"
                                  style={{ width: 6, height: 6, background: DISC }}
                                  animate={{ scale: [1, 1.5, 1], opacity: [0.4, 1, 0.4] }}
                                  transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.2 }}
                                />
                              ))}
                            </div>
                          )
                          : null
                        }

                        {/* Blood availability card — rendered after message content */}
                        {msg.bloodCard && (
                          <BloodAvailabilityCard data={msg.bloodCard} />
                        )}
                      </div>

                      <p className="font-mono-ibm text-[10px] mt-1 px-1"
                        style={{ color: MUTED, textAlign: isBot ? 'left' : 'right' }}>
                        {nowTs()}
                      </p>
                    </div>
                  </div>
                );
              })}

              {/* Typing dots */}
              {isLoading && messages[messages.length - 1]?.role === 'user' && (
                <div className="flex gap-2 flex-row">
                  <div className="flex items-end justify-center rounded-full flex-shrink-0"
                    style={{ width: 28, height: 28, background: `${DISC}22`, border: `1.5px solid ${DISC}55` }}>
                    <Droplets size={13} style={{ color: DISC }} />
                  </div>
                  <div className="px-3 py-2"
                    style={{ background: INK2, border: `1px solid ${LINE}`, borderRadius: '4px 12px 12px 12px' }}>
                    <div className="flex items-center gap-[4px] py-1">
                      {[0, 1, 2].map(i => (
                        <motion.span key={i} className="block rounded-full"
                          style={{ width: 6, height: 6, background: DISC }}
                          animate={{ scale: [1, 1.5, 1], opacity: [0.4, 1, 0.4] }}
                          transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.2 }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              )}

              <div ref={bottomRef} />
            </div>

            {/* Quick reply chips */}
            <div className="px-3 py-2 flex-shrink-0" style={{ borderTop: `1px solid ${LINE}` }}>
              <div className="flex gap-[6px] overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
                {(lang === 'en' ? QUICK_EN : QUICK_BN).map(q => (
                  <button
                    key={q}
                    onClick={() => sendMessage(q)}
                    disabled={isLoading}
                    className="flex-shrink-0 font-mono-ibm text-[10.5px] px-3 py-1.5 rounded-full whitespace-nowrap"
                    style={{
                      background: q.startsWith('🩸') ? `${DISC}14` : `${MARIG}14`,
                      border: `1px solid ${q.startsWith('🩸') ? DISC + '44' : MARIG + '44'}`,
                      color: isLoading ? MUTED : q.startsWith('🩸') ? DISC : MARIG,
                      cursor: isLoading ? 'not-allowed' : 'pointer',
                      transition: 'all 0.15s',
                    }}
                    onMouseEnter={e => {
                      if (!isLoading) {
                        const c = q.startsWith('🩸') ? DISC : MARIG;
                        e.currentTarget.style.background = c;
                        e.currentTarget.style.color = INK;
                      }
                    }}
                    onMouseLeave={e => {
                      const c = q.startsWith('🩸') ? DISC : MARIG;
                      e.currentTarget.style.background = q.startsWith('🩸') ? `${DISC}14` : `${MARIG}14`;
                      e.currentTarget.style.color = isLoading ? MUTED : c;
                    }}
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>

            {/* Input */}
            <form onSubmit={handleSubmit} className="px-3 pb-3 pt-1 flex-shrink-0">
              <div className="flex items-center gap-2"
                style={{ background: INK2, border: `1px solid ${LINE}`, borderRadius: 8, padding: '8px 12px' }}>
                <input
                  ref={inputRef}
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  placeholder={lang === 'en'
                    ? 'e.g. "O+ blood in Dhaka" or ask anything…'
                    : '"ঢাকায় O+ রক্ত" বা যেকোনো প্রশ্ন…'}
                  className="flex-1 bg-transparent border-none outline-none text-[13px]"
                  style={{ color: PAPER, fontFamily: 'Inter, sans-serif' }}
                  disabled={isLoading}
                />
                <button
                  type="submit"
                  disabled={!input.trim() || isLoading}
                  className="flex items-center justify-center rounded-full flex-shrink-0 transition-all duration-150"
                  style={{
                    width: 32, height: 32,
                    background: input.trim() && !isLoading ? DISC : LINE,
                    border: 'none',
                    cursor: input.trim() && !isLoading ? 'pointer' : 'not-allowed',
                  }}
                >
                  <Send size={14} style={{ color: input.trim() && !isLoading ? PAPER : MUTED }} />
                </button>
              </div>
              <p className="font-mono-ibm text-[10px] text-center mt-1.5" style={{ color: MUTED }}>
                🩸 District-aware · GPT-4o · {lang === 'en' ? 'English & Bangla' : 'বাংলা ও ইংরেজি'}
              </p>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

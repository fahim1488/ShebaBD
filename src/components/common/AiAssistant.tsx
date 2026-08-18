/**
 * AiAssistant.tsx
 *
 * Floating chat widget powered by:
 *  - streamChat from chatApi.ts (custom SSE transport → FastAPI backend)
 *  - Framer Motion (animations)
 */
import { useRef, useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageCircle, X, Send, Bot, User,
  RefreshCw, Globe, Wrench,
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

// ─── Message type ─────────────────────────────────────────────────────────────
interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  toolCalling?: string | null;
}

// ─── Quick-reply chips ────────────────────────────────────────────────────────
const QUICK_EN = ['🌐 Search live web', 'Find an NGO near me', 'I need blood urgently', 'Latest news & alerts', 'How do I volunteer?'];
const QUICK_BN = ['🌐 ইন্টারনেট সার্চ করুন', 'আমার কাছে NGO খুঁজুন', 'জরুরি রক্ত দরকার', 'সর্বশেষ সংবাদ ও সতর্কতা', 'স্বেচ্ছাসেবক হব কীভাবে?'];

// ─── Markdown-lite renderer ───────────────────────────────────────────────────
function renderMarkdown(text: string | undefined | null) {
  if (!text) return null;
  return text.split('\n').map((line, li, arr) => (
    <span key={li}>
      {line.split(/(\*\*[^*]+\*\*|`[^`]+`)/g).map((part, pi) => {
        if (part.startsWith('**') && part.endsWith('**')) return <strong key={pi}>{part.slice(2, -2)}</strong>;
        if (part.startsWith('`')  && part.endsWith('`'))  return <code key={pi} style={{ background: 'rgba(247,241,225,0.1)', padding: '0 4px', borderRadius: 3, fontFamily: 'monospace', fontSize: '0.9em' }}>{part.slice(1, -1)}</code>;
        return <span key={pi}>{part}</span>;
      })}
      {li < arr.length - 1 && <br />}
    </span>
  ));
}

let msgCounter = 0;
const newId = () => `msg-${++msgCounter}-${Date.now()}`;

// ─── Main component ───────────────────────────────────────────────────────────
export function AiAssistant() {
  const { lang, toggleLang } = useLanguage();
  const [open,       setOpen]       = useState(false);
  const [unread,     setUnread]     = useState(1);
  const [online,     setOnline]     = useState<boolean | null>(null);
  const [input,      setInput]      = useState('');
  const [isLoading,  setIsLoading]  = useState(false);
  const [error,      setError]      = useState<string | null>(null);
  const [messages,   setMessages]   = useState<ChatMessage[]>([]);

  const bottomRef    = useRef<HTMLDivElement>(null);
  const inputRef     = useRef<HTMLInputElement>(null);
  const abortRef     = useRef<AbortController | null>(null);
  const convIdRef    = useRef<string | null>(null);

  // ── Welcome message (updates on lang change) ──────────────────────────────
  const welcomeMsg = useCallback((): ChatMessage => ({
    id: 'welcome',
    role: 'assistant',
    content: lang === 'en'
      ? "Hi! I'm **Sheba AI** 🌐 — your all-in-one assistant with **real-time internet search**. Ask me anything about general knowledge, news, coding, weather, or ShebaBD services!"
      : 'হ্যালো! আমি **শেবা AI** 🌐 — আপনার সর্বজ্ঞান সহকারী, সাথে **লাইভ ইন্টারনেট সার্চ**। সাধারণ জ্ঞান, খবর, কোডিং, আবহাওয়া বা ShebaBD সেবা সম্পর্কিত যেকোনো প্রশ্ন জিজ্ঞেস করুন!',
  }), [lang]);

  // Init messages
  useEffect(() => {
    setMessages([welcomeMsg()]);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Health check ─────────────────────────────────────────────────────────
  useEffect(() => { checkHealth().then(ok => setOnline(ok)); }, []);

  // ── Reset on language change ──────────────────────────────────────────────
  useEffect(() => {
    setMessages([welcomeMsg()]);
    convIdRef.current = null;
  }, [lang, welcomeMsg]);

  // ── Scroll to bottom ──────────────────────────────────────────────────────
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // ── Focus input when opened ───────────────────────────────────────────────
  useEffect(() => {
    if (open) { setUnread(0); setTimeout(() => inputRef.current?.focus(), 200); }
  }, [open]);

  // ── Send message ──────────────────────────────────────────────────────────
  const sendMessage = useCallback((text: string) => {
    const trimmed = text.trim();
    if (!trimmed || isLoading) return;

    setError(null);
    setInput('');

    // Add user message
    const userMsg: ChatMessage = { id: newId(), role: 'user', content: trimmed };
    const botMsgId = newId();
    const botMsg: ChatMessage = { id: botMsgId, role: 'assistant', content: '' };

    setMessages(prev => [...prev, userMsg, botMsg]);
    setIsLoading(true);

    const token = localStorage.getItem('shebabd_token');

    abortRef.current = streamChat(
      trimmed,
      convIdRef.current,
      {
        onMeta: (conversationId) => {
          convIdRef.current = conversationId;
        },
        onToken: (chunk) => {
          setMessages(prev =>
            prev.map(m =>
              m.id === botMsgId ? { ...m, content: m.content + chunk } : m
            )
          );
        },
        onTool: (name, status) => {
          setMessages(prev =>
            prev.map(m =>
              m.id === botMsgId
                ? { ...m, toolCalling: status === 'calling' ? name : null }
                : m
            )
          );
        },
        onDone: () => {
          setIsLoading(false);
          setMessages(prev =>
            prev.map(m =>
              m.id === botMsgId ? { ...m, toolCalling: null } : m
            )
          );
        },
        onError: (msg) => {
          setIsLoading(false);
          setError(msg);
          // Remove the empty bot message on error
          setMessages(prev => prev.filter(m => m.id !== botMsgId));
        },
      },
      token,
    );
  }, [isLoading]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  const resetChat = () => {
    abortRef.current?.abort();
    setIsLoading(false);
    convIdRef.current = null;
    setError(null);
    setMessages([{
      id: 'welcome',
      role: 'assistant',
      content: lang === 'en' ? "Hi! I'm Sheba 🤝 — How can I help?" : 'হ্যালো! কীভাবে সাহায্য করতে পারি?',
    }]);
  };

  // ── Status label ──────────────────────────────────────────────────────────
  const statusLabel = isLoading ? 'typing…' : online === null ? 'connecting…' : online ? 'Online · Bilingual' : 'Offline';
  const statusColor = online === false ? DISC : '#22C55E';

  const nowTs = () => new Date().toLocaleTimeString('en-BD', { hour: '2-digit', minute: '2-digit' });

  return (
    <>
      {/* ── Floating button ───────────────────────────────────────────────── */}
      <div className="fixed bottom-6 right-6 z-[9999] flex flex-col items-end gap-3">
        <AnimatePresence>
          {!open && (
            <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} transition={{ duration: 0.2 }}
              className="font-mono-ibm text-[11.5px] px-3 py-1.5 rounded-full pointer-events-none"
              style={{ background: INK2, border: `1px solid ${LINE}`, color: PAPER }}>
              AI Assistant · Sheba
            </motion.div>
          )}
        </AnimatePresence>

        <button onClick={() => setOpen(o => !o)} aria-label="Open AI Assistant"
          className="relative flex items-center justify-center rounded-full shadow-2xl transition-all duration-200"
          style={{ width: 56, height: 56, background: open ? INK3 : DISC, border: `2px solid ${open ? LINE : DISC}` }}
          onMouseEnter={e => { if (!open) e.currentTarget.style.transform = 'scale(1.08)'; }}
          onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; }}>
          <AnimatePresence mode="wait">
            {open
              ? <motion.div key="x" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.18 }}><X size={22} color={PAPER} /></motion.div>
              : <motion.div key="chat" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.18 }}><MessageCircle size={22} color={PAPER} /></motion.div>
            }
          </AnimatePresence>
          {!open && unread > 0 && (
            <span className="absolute -top-1 -right-1 flex items-center justify-center rounded-full font-mono-ibm text-[10px] font-bold"
              style={{ width: 18, height: 18, background: MARIG, color: INK }}>{unread}</span>
          )}
          {!open && (
            <motion.span className="absolute inset-0 rounded-full" style={{ border: `2px solid ${DISC}` }}
              animate={{ scale: [1, 1.5], opacity: [0.6, 0] }} transition={{ duration: 1.8, repeat: Infinity, ease: 'easeOut' }} />
          )}
        </button>
      </div>

      {/* ── Chat panel ────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {open && (
          <motion.div key="chat-panel"
            initial={{ opacity: 0, y: 24, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.95 }} transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
            className="fixed z-[9998] flex flex-col"
            style={{ bottom: 80, right: 24, width: 'min(380px, calc(100vw - 32px))', height: 'min(560px, calc(100vh - 120px))', background: INK, border: `1px solid ${LINE}`, borderRadius: 8, boxShadow: '0 32px 64px rgba(0,0,0,0.55)' }}>

            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 flex-shrink-0"
              style={{ borderBottom: `1px solid ${LINE}`, background: INK2, borderRadius: '8px 8px 0 0' }}>
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center rounded-full"
                  style={{ width: 34, height: 34, background: `${DISC}22`, border: `2px solid ${DISC}66` }}>
                  <Bot size={17} style={{ color: DISC }} />
                </div>
                <div>
                  <p className="font-fraunces font-semibold text-[14px]" style={{ color: PAPER }}>Sheba AI</p>
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

              {/* Error banner */}
              {error && (
                <div className="rounded-lg px-3 py-2 text-xs" style={{ background: 'rgba(214,71,44,0.15)', border: `1px solid rgba(214,71,44,0.3)`, color: '#f87171' }}>
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
                      {isBot ? <Bot size={13} style={{ color: DISC }} /> : <User size={13} style={{ color: SKY }} />}
                    </div>

                    {/* Bubble */}
                    <div style={{ maxWidth: '80%' }}>
                      {msg.toolCalling && (
                        <div className="flex items-center gap-1.5 mb-1.5 px-2 py-1 rounded-full text-[10.5px] font-mono-ibm"
                          style={{ background: `${MARIG}18`, border: `1px solid ${MARIG}33`, color: MARIG, width: 'fit-content' }}>
                          <motion.span animate={{ rotate: 360 }} transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }}>
                            <Wrench size={10} />
                          </motion.span>
                          calling {msg.toolCalling}…
                        </div>
                      )}

                      <div className="px-3 py-2 text-[13.5px] leading-[1.65]"
                        style={{ background: isBot ? INK2 : `${SKY}18`, border: `1px solid ${isBot ? LINE : SKY + '33'}`, color: PAPER, borderRadius: isBot ? '4px 12px 12px 4px' : '12px 4px 12px 12px' }}>
                        {msg.content ? renderMarkdown(msg.content)
                          : isBot && isLoading ? (
                            <div className="flex items-center gap-[4px] py-1">
                              {[0, 1, 2].map(i => (
                                <motion.span key={i} className="block rounded-full" style={{ width: 6, height: 6, background: DISC }}
                                  animate={{ scale: [1, 1.5, 1], opacity: [0.4, 1, 0.4] }} transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.2 }} />
                              ))}
                            </div>
                          ) : null
                        }
                      </div>

                      <p className="font-mono-ibm text-[10px] mt-1 px-1" style={{ color: MUTED, textAlign: isBot ? 'left' : 'right' }}>
                        {nowTs()}
                      </p>
                    </div>
                  </div>
                );
              })}

              {/* Typing indicator — shows while loading with no streaming content yet */}
              {isLoading && messages[messages.length - 1]?.role === 'user' && (
                <div className="flex gap-2 flex-row">
                  <div className="flex items-end justify-center rounded-full flex-shrink-0"
                    style={{ width: 28, height: 28, background: `${DISC}22`, border: `1.5px solid ${DISC}55` }}>
                    <Bot size={13} style={{ color: DISC }} />
                  </div>
                  <div className="px-3 py-2 rounded-[4px_12px_12px_4px]" style={{ background: INK2, border: `1px solid ${LINE}` }}>
                    <div className="flex items-center gap-[4px] py-1">
                      {[0, 1, 2].map(i => (
                        <motion.span key={i} className="block rounded-full" style={{ width: 6, height: 6, background: DISC }}
                          animate={{ scale: [1, 1.5, 1], opacity: [0.4, 1, 0.4] }} transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.2 }} />
                      ))}
                    </div>
                  </div>
                </div>
              )}

              <div ref={bottomRef} />
            </div>

            {/* Quick replies */}
            <div className="px-3 py-2 flex-shrink-0" style={{ borderTop: `1px solid ${LINE}` }}>
              <div className="flex gap-[6px] overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
                {(lang === 'en' ? QUICK_EN : QUICK_BN).map(q => (
                  <button key={q} onClick={() => sendMessage(q)} disabled={isLoading}
                    className="flex-shrink-0 font-mono-ibm text-[10.5px] px-3 py-1.5 rounded-full whitespace-nowrap"
                    style={{ background: `${MARIG}14`, border: `1px solid ${MARIG}44`, color: isLoading ? MUTED : MARIG, cursor: isLoading ? 'not-allowed' : 'pointer', transition: 'all 0.15s' }}
                    onMouseEnter={e => { if (!isLoading) { e.currentTarget.style.background = MARIG; e.currentTarget.style.color = INK; } }}
                    onMouseLeave={e => { e.currentTarget.style.background = `${MARIG}14`; e.currentTarget.style.color = isLoading ? MUTED : MARIG; }}>
                    {q}
                  </button>
                ))}
              </div>
            </div>

            {/* Input */}
            <form onSubmit={handleSubmit} className="px-3 pb-3 pt-1 flex-shrink-0">
              <div className="flex items-center gap-2"
                style={{ background: INK2, border: `1px solid ${LINE}`, borderRadius: 6, padding: '8px 12px' }}>
                <input
                  ref={inputRef}
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  placeholder={lang === 'en' ? 'Ask Sheba anything…' : 'শেবাকে যেকোনো প্রশ্ন করুন…'}
                  className="flex-1 bg-transparent border-none outline-none text-[13.5px]"
                  style={{ color: PAPER, fontFamily: 'Inter, sans-serif' }}
                  disabled={isLoading}
                />
                <button type="submit" disabled={!input.trim() || isLoading}
                  className="flex items-center justify-center rounded-full flex-shrink-0 transition-all duration-150"
                  style={{ width: 32, height: 32, background: input.trim() && !isLoading ? DISC : LINE, border: 'none', cursor: input.trim() && !isLoading ? 'pointer' : 'not-allowed' }}>
                  <Send size={14} style={{ color: input.trim() && !isLoading ? PAPER : MUTED }} />
                </button>
              </div>
              <p className="font-mono-ibm text-[10px] text-center mt-1" style={{ color: MUTED }}>
                Powered by GPT-4o · {lang === 'en' ? 'Type in English or Bangla' : 'বাংলা বা ইংরেজিতে টাইপ করুন'}
              </p>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
/* Fahim: AI chatbot enhancements */ 

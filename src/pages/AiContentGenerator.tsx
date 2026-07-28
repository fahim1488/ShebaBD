import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Sparkles, FileText, Megaphone, Users, Share2,
  Copy, Check, Download, RefreshCw, ChevronRight,
  Wand2, Clock, Trash2, ChevronDown, Globe,
  Heart, Zap, BookOpen, Instagram, Twitter, Facebook,
  AlignLeft, Hash, RotateCcw, ArrowRight, PenLine,
} from 'lucide-react';
import { ROUTES } from '@/constants/routes';

// ─── Design tokens ───────────────────────────────────────────────────────────
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
const LINE_L2  = 'rgba(247,241,225,0.08)';
const WARN     = '#F59E0B';
const SAFE     = '#22C55E';

// ─── Content type definitions ────────────────────────────────────────────────
type ContentTypeId = 'blog' | 'campaign' | 'volunteer' | 'social';
type SocialPlatform = 'facebook' | 'twitter' | 'instagram';
type ToneId = 'professional' | 'emotional' | 'urgent' | 'inspiring';
type LengthId = 'short' | 'medium' | 'long';

interface ContentType {
  id: ContentTypeId;
  label: string;
  icon: React.ReactNode;
  color: string;
  desc: string;
  placeholder: string;
  outputLabel: string;
}

interface HistoryEntry {
  id: number;
  type: ContentTypeId;
  topic: string;
  output: string;
  timestamp: string;
  tone: ToneId;
  wordCount: number;
}

const CONTENT_TYPES: ContentType[] = [
  {
    id: 'blog',
    label: 'Awareness Blog',
    icon: <BookOpen size={20} />,
    color: SKY,
    desc: 'Long-form blog posts raising awareness about social causes, NGO work, and community impact.',
    placeholder: 'e.g. Flood relief efforts in Sylhet, Child malnutrition in rural Bangladesh…',
    outputLabel: 'Blog Article',
  },
  {
    id: 'campaign',
    label: 'Campaign Description',
    icon: <Megaphone size={20} />,
    color: DISC,
    desc: 'Compelling fundraising and campaign copy that drives donations and mobilises communities.',
    placeholder: 'e.g. Emergency flood relief fund, Clean water for Char islands…',
    outputLabel: 'Campaign Copy',
  },
  {
    id: 'volunteer',
    label: 'Volunteer Recruitment',
    icon: <Users size={20} />,
    color: LEAF,
    desc: 'Motivational recruitment posts that attract skilled volunteers to causes that need them.',
    placeholder: 'e.g. Medical volunteers for Rohingya camps, Teachers for rural schools…',
    outputLabel: 'Recruitment Post',
  },
  {
    id: 'social',
    label: 'Social Media Post',
    icon: <Share2 size={20} />,
    color: MARIGOLD,
    desc: 'Platform-optimised posts for Facebook, Twitter/X, and Instagram with hashtags and CTAs.',
    placeholder: 'e.g. World Water Day awareness, Volunteer day highlight, Donation milestone…',
    outputLabel: 'Social Post',
  },
];

const TONES: { id: ToneId; label: string; desc: string }[] = [
  { id: 'professional', label: 'Professional',  desc: 'Clear, authoritative, trust-building'  },
  { id: 'emotional',    label: 'Emotional',      desc: 'Heartfelt, personal, story-driven'     },
  { id: 'urgent',       label: 'Urgent',         desc: 'Immediate, action-oriented, direct'    },
  { id: 'inspiring',    label: 'Inspiring',      desc: 'Uplifting, motivational, hopeful'      },
];

const LENGTHS: { id: LengthId; label: string; words: string }[] = [
  { id: 'short',  label: 'Short',  words: '~80 words'   },
  { id: 'medium', label: 'Medium', words: '~200 words'  },
  { id: 'long',   label: 'Long',   words: '~400 words'  },
];

const SOCIAL_PLATFORMS: { id: SocialPlatform; label: string; icon: React.ReactNode; color: string }[] = [
  { id: 'facebook',  label: 'Facebook',  icon: <Facebook size={14} />,  color: '#1877F2' },
  { id: 'twitter',   label: 'Twitter/X', icon: <Twitter size={14} />,   color: '#1DA1F2' },
  { id: 'instagram', label: 'Instagram', icon: <Instagram size={14} />, color: '#E1306C' },
];

// ─── Sample generated content per type ───────────────────────────────────────
function generateContent(
  type: ContentTypeId,
  topic: string,
  tone: ToneId,
  length: LengthId,
  platform?: SocialPlatform,
): string {
  const t = topic || 'community development';

  const blogs: Record<ToneId, string> = {
    professional:
      `**Understanding the Crisis: ${t}**\n\nBangladesh continues to face critical challenges in ${t.toLowerCase()}. According to recent UNICEF and government data, millions of citizens remain affected each year — particularly in rural and coastal districts.\n\nNGOs and civil society organisations have stepped in to fill the gap where government resources fall short. Programmes focused on awareness, direct aid, and long-term capacity building are proving effective.\n\nShebaBD's platform connects over 2,400 verified organisations working on these issues. By centralising discovery, donation tracking, and volunteer matching, we ensure every contribution reaches the right people.\n\n**How You Can Help**\nThe most impactful actions are: donating to verified organisations, volunteering your skills, and spreading awareness. Every action counts toward a more resilient Bangladesh.`,
    emotional:
      `**A Child's Story — Why ${t} Can't Wait**\n\nIn a small village outside Mymensingh, 8-year-old Riya walks 4 kilometres each morning — not to school, but to find clean water. Her story is not unique. It is the story of thousands.\n\nWhen we talk about ${t.toLowerCase()}, we are not talking about statistics. We are talking about Riya. About her mother. About communities that have been waiting for change for generations.\n\nThat change is possible. And it starts with people like you choosing to act.\n\nShebaBD connects your compassion directly to verified organisations on the ground. Because Riya's story deserves a different ending — and you have the power to write it.`,
    urgent:
      `**URGENT: The ${t} Crisis Needs Immediate Action**\n\nTime is running out. Right now, communities across Bangladesh are facing the devastating impact of ${t.toLowerCase()}. Every day without action means more lives disrupted, more futures at risk.\n\nVerified NGOs on ShebaBD are on the ground now — but they need resources immediately. Donations made today will be deployed within 48 hours through our tracked disbursement system.\n\nDo not wait. The window for high-impact intervention is now.\n\n→ Find verified organisations at ShebaBD\n→ Donate directly and track your impact\n→ Volunteer your skills starting this week`,
    inspiring:
      `**Together We Can Transform ${t}**\n\nImagine a Bangladesh where no community is left behind. Where every child has access to education, every family to clean water, and every citizen to the support they need in times of crisis.\n\nThat Bangladesh is not a dream — it is being built right now, by thousands of volunteers, NGOs, and donors across 64 districts.\n\n${t} is one of the most important frontiers in this work. And the progress being made is remarkable. Communities are rising. Local leaders are emerging. Change is taking root.\n\nYou are invited to be part of this story. Join ShebaBD, find your cause, and add your voice to the movement building the Bangladesh of tomorrow.`,
  };

  const campaigns: Record<ToneId, string> = {
    professional:
      `**Campaign: ${t}**\n\n*Objective:* Raise funds to support verified organisations responding to ${t.toLowerCase()} across Bangladesh.\n\n*Why This Matters:*\nOver 3.2 million people are directly affected each year. Verified NGOs on ShebaBD have demonstrated impact — but operational gaps remain. Your donation fills those gaps.\n\n*How Funds Are Used:*\n• 70% — Direct programme delivery\n• 20% — Field staff and logistics\n• 10% — Monitoring and reporting\n\n*Goal:* ৳50,00,000 | *Timeline:* 60 days\n\nAll donations tracked transparently on ShebaBD's impact dashboard.`,
    emotional:
      `**Help Us Reach Them: ${t} Emergency Campaign**\n\nBehind every number is a person. Behind every statistic is a family.\n\nWhen the flood waters rose in Sylhet last monsoon, families lost everything in hours. But they did not lose hope — because organisations like those on ShebaBD were there.\n\nThis campaign is for them. For every family waiting for help. For every community that refuses to give up.\n\nYour donation — whatever you can give — will be matched with purpose and accountability. We will show you exactly where it goes and the lives it changes.\n\nGive today. Because they cannot wait.`,
    urgent:
      `**72-HOUR EMERGENCY CAMPAIGN: ${t}**\n\n⚠ CRITICAL NEED — RESPOND NOW\n\nDisaster has struck. Organisations on the ground need immediate funding to continue operations. Without it, critical services will be suspended within 72 hours.\n\n100% of donations go directly to verified field operations. Zero platform fees during emergency campaigns.\n\n*Current Gap:* ৳12,00,000\n*Deadline:* 72 hours\n*Organisations Supported:* 8 verified NGOs\n\nEvery minute matters. Donate now.`,
    inspiring:
      `**Building a Better Bangladesh — ${t} Campaign**\n\nThis is not just a fundraising campaign. It is an invitation to be part of something historic.\n\nFor the first time, Bangladeshis everywhere — at home and abroad — can come together on a single platform, pool their resources, and direct them to the exact causes they believe in.\n\n${t} is our focus. The organisations are verified. The impact is real. The time is now.\n\nJoin thousands of donors already transforming communities. Add your contribution to the tide of change.\n\nTogether, we build the Bangladesh we deserve.`,
  };

  const volunteer: Record<ToneId, string> = {
    professional:
      `**Volunteer Opportunity: ${t}**\n\n*Organisation Type:* Verified NGO | *Location:* Multiple districts | *Commitment:* Flexible\n\n*About the Role:*\nWe are seeking qualified volunteers to support our work in ${t.toLowerCase()}. This is an opportunity to apply your professional skills to meaningful social impact.\n\n*Requirements:*\n• Relevant qualification or experience in the field\n• Minimum 4 hours per week availability\n• Willingness to work in field and urban settings\n\n*Benefits:*\n• Verified volunteer hours recorded on ShebaBD profile\n• Achievement badges and professional references\n• Access to ShebaBD's volunteer network of 18,000+ members\n\nApply through ShebaBD to be matched with the right organisation.`,
    emotional:
      `**Your Skills Can Change a Life — Join Us for ${t}**\n\nYou have something rare: the ability to make a real difference.\n\nThere are children who need teachers. Families who need medical advice. Communities who need engineers and planners and storytellers.\n\nThe work happening in ${t.toLowerCase()} across Bangladesh is extraordinary — but it needs more hands. Your hands.\n\nThis is not just volunteering. It is the most meaningful thing you might do this year. And ShebaBD makes it easy — matching your skills, your schedule, and your heart to the people who need you most.\n\nJoin us. Show up. Change a life — including your own.`,
    urgent:
      `**URGENT VOLUNTEER CALL — ${t}**\n\n🚨 We need volunteers NOW.\n\nFollowing recent crises, organisations working on ${t.toLowerCase()} are critically understaffed. Operations are at risk. Communities are waiting.\n\n*Needed immediately:*\n• Medical professionals\n• Logistics coordinators\n• Community liaison officers\n• Social media and communications volunteers\n\nNo lengthy application. Register on ShebaBD, verify your skills, and be deployed within 24 hours.\n\nThis is urgent. Please share this post. Every share could reach the volunteer we need.`,
    inspiring:
      `**Be the Change — Volunteer for ${t}**\n\nSomewhere in Bangladesh right now, someone is waiting for the skills you have.\n\nVolunteering is one of the most powerful acts a person can take. It says: I see you. I have something to offer. I choose to show up.\n\nOur work in ${t.toLowerCase()} is transforming communities — but it is the volunteers who make it real. Every hour given multiplies into days of impact.\n\nJoin ShebaBD's volunteer network. Set your skills, your availability, your passion. We will find you the perfect match.\n\nThe Bangladesh you believe in is built by people like you.`,
  };

  const social: Record<SocialPlatform, Record<ToneId, string>> = {
    facebook: {
      professional: `📢 ShebaBD Update | ${t}\n\nWe are proud to share the latest impact data from our verified organisations working on ${t.toLowerCase()} across Bangladesh.\n\n✅ Over 200,000 people reached this quarter\n✅ 47 verified NGOs actively deployed\n✅ 100% donation tracking via our platform\n\nExplore organisations, track impact, and donate with confidence at ShebaBD.\n\n#ShebaBD #Bangladesh #SocialImpact #NGO`,
      emotional:   `💙 A message from the field…\n\nLast week, our volunteers reached a community that had been waiting for help for months. The relief on their faces — that's why we do this.\n\n${t} is a cause that touches every corner of Bangladesh. Today, we're asking you to be part of the solution.\n\nShare this post. Donate. Volunteer. Every action creates a ripple.\n\n❤️ ShebaBD — connecting compassion to impact.\n\n#ShebaBD #TogetherWeCan #Bangladesh`,
      urgent:      `🚨 URGENT | ${t}\n\nFamilies need help RIGHT NOW. Our partner NGOs are on the ground but resources are critically low.\n\n⏰ Donate in the next 24 hours and your contribution is prioritised for immediate field deployment.\n\nClick the link to donate via ShebaBD — fully verified, fully tracked.\n\n👇 Share this post. Every share saves lives.\n\n#Urgent #Bangladesh #ShebaBD #HelpNow`,
      inspiring:   `✨ Every day, something beautiful is happening in Bangladesh.\n\nVolunteers showing up. Donors giving. NGOs delivering. Communities rising.\n\n${t} is one of the causes at the heart of ShebaBD's mission — and thanks to YOU, progress is real.\n\nCelebrate what we've built together 💚 and keep the momentum going.\n\n#ShebaBD #Bangladesh #Inspiration #CommunityFirst`,
    },
    twitter: {
      professional: `ShebaBD Impact Update 📊\n\n→ ${t}\n→ 200K+ people reached\n→ 47 verified NGOs active\n→ Full donation transparency\n\nSupport verified causes at ShebaBD 🇧🇩\n\n#ShebaBD #Bangladesh #NGO`,
      emotional:    `Sometimes the most powerful thing you can do is show up.\n\nFor ${t.toLowerCase()}. For Bangladesh. For the people waiting.\n\n💙 ShebaBD connects you directly.\n\n#Bangladesh #ShebaBD #TogetherWeRise`,
      urgent:       `🚨 URGENT: ${t}\n\nNGOs need support NOW. Donate via ShebaBD — 100% tracked.\n\n⏰ 24hr window for priority deployment.\n\nRT to spread the word. Every share matters.\n\n#Urgent #ShebaBD #Bangladesh`,
      inspiring:    `You have the power to change a life today.\n\n✨ ${t}\n🇧🇩 Bangladesh is rising — join the movement.\n\nVolunteer | Donate | Share via ShebaBD\n\n#ShebaBD #Inspire #Bangladesh`,
    },
    instagram: {
      professional: `📌 ${t} | ShebaBD Impact Report\n\nOur platform connects verified NGOs with donors and volunteers across all 64 districts of Bangladesh.\n\n✅ Transparent donation tracking\n✅ AI-verified organisations\n✅ 18,000+ active volunteers\n\nLink in bio to explore and give.\n\n.\n.\n.\n#ShebaBD #Bangladesh #NGO #SocialGood #Nonprofit #Impact #Dhaka #CommunityDevelopment #Volunteer`,
      emotional:    `Some stories can't be told in numbers 💙\n\n${t.toLowerCase()} isn't just a cause — it's the daily reality of millions of Bangladeshis. Behind every statistic is a name, a face, a family.\n\nSwipe to see the faces behind the numbers ➡️\n\nDonate | Volunteer | Share — link in bio.\n\n.\n.\n.\n#Bangladesh #ShebaBD #HumanStories #NGO #HeartFirst #Community`,
      urgent:       `⚠️ They need you. Right now.\n\n${t} — urgent call for support.\n\n🔴 Donate via ShebaBD (link in bio)\n🔴 Share this post\n🔴 Tag someone who can help\n\nEvery second counts. Don't scroll past.\n\n.\n.\n.\n#Urgent #Bangladesh #ShebaBD #ActNow #Crisis #HelpBangladesh`,
      inspiring:    `The Bangladesh of tomorrow is being built today 🌿\n\nBy volunteers. By donors. By dreamers who refuse to look away.\n\n${t} is our shared mission. And look how far we've come 💚\n\nCelebrate with us — and keep going. Link in bio.\n\n.\n.\n.\n#Bangladesh #ShebaBD #Inspire #Change #Volunteer #CommunityLove`,
    },
  };

  // trim to approximate length
  let result: string;
  if (type === 'social') {
    result = social[platform ?? 'facebook'][tone];
  } else if (type === 'blog') {
    result = blogs[tone];
  } else if (type === 'campaign') {
    result = campaigns[tone];
  } else {
    result = volunteer[tone];
  }

  if (length === 'short') {
    // keep roughly first 80 words
    const words = result.split(' ');
    result = words.slice(0, 90).join(' ') + (words.length > 90 ? '…' : '');
  } else if (length === 'medium') {
    const words = result.split(' ');
    result = words.slice(0, 220).join(' ') + (words.length > 220 ? '…' : '');
  }

  return result;
}

// ─── Scroll reveal ────────────────────────────────────────────────────────────
function Reveal({ children, delay = 0, className = '', style = {} }: {
  children: React.ReactNode; delay?: number;
  className?: string; style?: React.CSSProperties;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const io = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setTimeout(() => { el.style.opacity = '1'; el.style.transform = 'translateY(0)'; }, delay);
        io.unobserve(el);
      }
    }, { threshold: 0.06 });
    io.observe(el);
    return () => io.disconnect();
  }, [delay]);
  return (
    <div ref={ref} className={className}
      style={{ opacity: 0, transform: 'translateY(20px)', transition: 'opacity 0.6s ease, transform 0.6s ease', ...style }}>
      {children}
    </div>
  );
}

// ─── Eyebrow ──────────────────────────────────────────────────────────────────
function Eyebrow({ label, color = MARIGOLD }: { label: string; color?: string }) {
  return (
    <div className="inline-flex items-center gap-[9px] font-mono-ibm text-[12px] tracking-[0.11em] uppercase" style={{ color: MUTED_L }}>
      <span className="inline-block w-[6px] h-[6px] rounded-full" style={{ background: color }} />
      {label}
    </div>
  );
}

// ─── Typewriter hook ──────────────────────────────────────────────────────────
function useTypewriter(text: string, active: boolean, speed = 10) {
  const [displayed, setDisplayed] = useState('');
  const [done, setDone] = useState(false);
  const idx = useRef(0);

  useEffect(() => {
    if (!active || !text) return;
    setDisplayed('');
    setDone(false);
    idx.current = 0;
    const interval = setInterval(() => {
      idx.current += 3; // reveal 3 chars per tick for snappy feel
      if (idx.current >= text.length) {
        setDisplayed(text);
        setDone(true);
        clearInterval(interval);
      } else {
        setDisplayed(text.slice(0, idx.current));
      }
    }, speed);
    return () => clearInterval(interval);
  }, [text, active, speed]);

  return { displayed, done };
}

// ─── Hero animated orb ────────────────────────────────────────────────────────
function WriterOrb() {
  return (
    <div className="relative flex items-center justify-center" style={{ width: 240, height: 240 }}>
      {/* outer rings */}
      {[0, 1, 2].map(i => (
        <motion.div key={i} className="absolute rounded-full"
          style={{
            width: 90 + i * 50, height: 90 + i * 50,
            border: `1px solid ${MARIGOLD}${['44', '28', '14'][i]}`,
          }}
          animate={{ rotate: i % 2 === 0 ? 360 : -360 }}
          transition={{ duration: 18 + i * 8, repeat: Infinity, ease: 'linear' }}
        />
      ))}
      {/* glow */}
      <div className="absolute rounded-full" style={{
        width: 100, height: 100,
        background: `radial-gradient(circle, ${MARIGOLD}33, transparent 70%)`,
      }} />
      {/* centre */}
      <div className="relative z-10 flex items-center justify-center rounded-full"
        style={{ width: 80, height: 80, background: `${MARIGOLD}18`, border: `2px solid ${MARIGOLD}55` }}>
        <motion.div
          animate={{ scale: [1, 1.12, 1] }}
          transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}>
          <Wand2 size={34} style={{ color: MARIGOLD }} />
        </motion.div>
      </div>
      {/* floating sparks */}
      {[0, 1, 2, 3].map(i => (
        <motion.div key={i} className="absolute rounded-full"
          style={{ width: 6, height: 6, background: MARIGOLD, borderRadius: '50%' }}
          animate={{
            x: [0, (i % 2 === 0 ? 1 : -1) * (28 + i * 10), 0],
            y: [0, (i < 2 ? -1 : 1) * (22 + i * 8), 0],
            opacity: [0, 1, 0],
          }}
          transition={{ duration: 2.4, repeat: Infinity, delay: i * 0.6, ease: 'easeInOut' }}
        />
      ))}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function AiContentGenerator() {
  const [activeType, setActiveType]       = useState<ContentTypeId>('blog');
  const [topic, setTopic]                 = useState('');
  const [tone, setTone]                   = useState<ToneId>('inspiring');
  const [length, setLength]               = useState<LengthId>('medium');
  const [platform, setPlatform]           = useState<SocialPlatform>('facebook');
  const [generating, setGenerating]       = useState(false);
  const [generatedText, setGeneratedText] = useState('');
  const [showOutput, setShowOutput]       = useState(false);
  const [copied, setCopied]               = useState(false);
  const [history, setHistory]             = useState<HistoryEntry[]>([]);
  const [historyOpen, setHistoryOpen]     = useState(false);
  const [historySelected, setHistorySelected] = useState<HistoryEntry | null>(null);
  const outputRef = useRef<HTMLDivElement>(null);

  const currentType = CONTENT_TYPES.find(t => t.id === activeType)!;
  const { displayed, done } = useTypewriter(generatedText, showOutput);

  const handleGenerate = useCallback(() => {
    if (!topic.trim() || generating) return;
    setGenerating(true);
    setShowOutput(false);
    setGeneratedText('');
    setHistorySelected(null);
    setCopied(false);

    // simulate AI processing delay
    setTimeout(() => {
      const output = generateContent(activeType, topic, tone, length, platform);
      setGeneratedText(output);
      setGenerating(false);
      setShowOutput(true);
      // save to history
      setHistory(prev => [{
        id: Date.now(),
        type: activeType,
        topic,
        output,
        timestamp: new Date().toLocaleTimeString('en-BD', { hour: '2-digit', minute: '2-digit' }),
        tone,
        wordCount: output.split(' ').length,
      }, ...prev.slice(0, 9)]);
      setTimeout(() => outputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 150);
    }, 2200);
  }, [activeType, topic, tone, length, platform, generating]);

  function handleCopy(text: string) {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  function handleDownload(text: string, label: string) {
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `shebabd-${label.toLowerCase().replace(/\s/g, '-')}-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const displayText = historySelected ? historySelected.output : displayed;
  const displayDone = historySelected ? true : done;

  return (
    <div style={{ background: INK, color: PAPER, minHeight: '100vh', overflowX: 'hidden' }}>

      {/* ══ HERO ════════════════════════════════════════════════════════════ */}
      <section className="relative" style={{ padding: '80px 32px 68px', overflow: 'hidden' }}>
        <div className="pointer-events-none absolute rounded-full"
          style={{ top: -160, right: -200, width: 560, height: 560, background: 'radial-gradient(circle, rgba(231,169,59,0.11), transparent 70%)' }} />
        <div className="pointer-events-none absolute rounded-full"
          style={{ bottom: -100, left: -140, width: 400, height: 400, background: 'radial-gradient(circle, rgba(62,122,140,0.09), transparent 70%)' }} />

        <div className="mx-auto" style={{ maxWidth: 1180 }}>
          <div className="flex items-center justify-between gap-10 flex-wrap">
            <div style={{ maxWidth: 620 }}>
              <Reveal>
                <div className="mb-5"><Eyebrow label="AI · Content Studio · GPT-powered" color={MARIGOLD} /></div>
              </Reveal>
              <Reveal delay={70}>
                <h1 className="font-fraunces mb-5"
                  style={{ fontSize: 'clamp(36px,4.8vw,60px)', lineHeight: 1.04, fontWeight: 600 }}>
                  AI Content<br />
                  <span style={{ color: MARIGOLD }}>Generator</span>
                </h1>
              </Reveal>
              <Reveal delay={140}>
                <p style={{ color: MUTED_L, fontSize: 16.5, lineHeight: 1.72, maxWidth: 520 }}>
                  Instantly generate awareness blogs, fundraising campaign copy, volunteer
                  recruitment posts, and platform-optimised social media content — powered
                  by AI trained on Bangladesh's social sector.
                </p>
              </Reveal>
              <Reveal delay={220}>
                <div className="flex flex-wrap gap-5 mt-9">
                  {CONTENT_TYPES.map(ct => (
                    <div key={ct.id} className="flex items-center gap-2"
                      style={{ color: ct.color, fontSize: 13.5, fontFamily: "'IBM Plex Mono', monospace" }}>
                      <span style={{ opacity: 0.8 }}>{ct.icon}</span>
                      <span style={{ opacity: 0.75 }}>{ct.label}</span>
                    </div>
                  ))}
                </div>
              </Reveal>
            </div>
            <Reveal className="hidden lg:flex">
              <WriterOrb />
            </Reveal>
          </div>
        </div>
      </section>

      {/* ══ STATS ════════════════════════════════════════════════════════════ */}
      <section style={{ borderTop: `1px solid ${LINE_L}`, borderBottom: `1px solid ${LINE_L}`, background: INK2 }}>
        <div className="mx-auto" style={{ maxWidth: 1180 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)' }}>
            {[
              { num: '12,400+', label: 'Posts Generated',    sub: 'across all content types'      },
              { num: '4 types', label: 'Content Formats',    sub: 'blog, campaign, recruit, social'},
              { num: '4 tones', label: 'Voice Modes',        sub: 'pro, emotional, urgent, inspire'},
              { num: '< 3s',    label: 'Generation Speed',   sub: 'per content piece'              },
            ].map(({ num, label, sub }, i) => (
              <Reveal key={label} delay={i * 70}
                style={{ padding: '30px 24px', borderRight: i < 3 ? `1px solid ${LINE_L}` : 'none', textAlign: 'center' }}>
                <span className="block font-mono-ibm font-bold mb-[4px]"
                  style={{ fontSize: 'clamp(22px,2.4vw,32px)', color: PAPER }}>{num}</span>
                <span className="block text-[13px] font-medium mb-[2px]" style={{ color: PAPER }}>{label}</span>
                <span className="block font-mono-ibm text-[11px]" style={{ color: MUTED_L }}>{sub}</span>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ══ GENERATOR WORKSPACE ══════════════════════════════════════════════ */}
      <section className="px-8 py-[80px]">
        <div className="mx-auto" style={{ maxWidth: 1180 }}>
          <Reveal>
            <div className="text-center mb-14">
              <Eyebrow label="Generate Content" color={MARIGOLD} />
              <h2 className="font-fraunces mt-5 mb-3"
                style={{ fontSize: 'clamp(28px,3.4vw,42px)', fontWeight: 600, lineHeight: 1.1 }}>
                Create in seconds
              </h2>
              <p style={{ color: MUTED_L, fontSize: 15.5, maxWidth: 520, margin: '0 auto' }}>
                Select your content type, describe your topic, choose tone and length — and let the AI do the rest.
              </p>
            </div>
          </Reveal>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, alignItems: 'start' }}
            className="xl:grid-cols-2 flex-col lg:flex-row">

            {/* ── LEFT: Controls ── */}
            <Reveal delay={60}>
              <div style={{ background: INK2, border: `1px solid ${LINE_L}`, borderRadius: 3 }}>

                {/* Step 1 — Type */}
                <div style={{ padding: '28px 28px 24px', borderBottom: `1px solid ${LINE_L}` }}>
                  <p className="font-mono-ibm text-[11.5px] tracking-[0.09em] uppercase mb-4"
                    style={{ color: MUTED_L }}>
                    01 — Content Type
                  </p>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                    {CONTENT_TYPES.map(ct => {
                      const active = activeType === ct.id;
                      return (
                        <button key={ct.id} onClick={() => setActiveType(ct.id)}
                          style={{
                            display: 'flex', alignItems: 'flex-start', gap: 10, padding: '14px 14px',
                            borderRadius: 3, border: `1.5px solid ${active ? ct.color : LINE_L}`,
                            background: active ? `${ct.color}14` : 'transparent',
                            cursor: 'pointer', transition: 'all 0.18s ease', textAlign: 'left',
                          }}
                          onMouseEnter={e => { if (!active) e.currentTarget.style.borderColor = ct.color + '66'; }}
                          onMouseLeave={e => { if (!active) e.currentTarget.style.borderColor = LINE_L; }}>
                          <span style={{ color: ct.color, marginTop: 2, flexShrink: 0 }}>{ct.icon}</span>
                          <div>
                            <p className="font-semibold text-[13.5px]"
                              style={{ color: active ? ct.color : PAPER, lineHeight: 1.3 }}>{ct.label}</p>
                            <p className="text-[11.5px] mt-[3px]" style={{ color: MUTED_L, lineHeight: 1.4 }}>{ct.desc}</p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Step 2 — Topic */}
                <div style={{ padding: '24px 28px', borderBottom: `1px solid ${LINE_L}` }}>
                  <p className="font-mono-ibm text-[11.5px] tracking-[0.09em] uppercase mb-4"
                    style={{ color: MUTED_L }}>02 — Topic / Brief</p>
                  <div style={{ background: INK3, border: `1px solid ${LINE_L}`, borderRadius: 2, padding: '1px' }}>
                    <div className="flex items-start gap-3" style={{ padding: '13px 16px' }}>
                      <PenLine size={16} style={{ color: MUTED_L, marginTop: 2, flexShrink: 0 }} />
                      <textarea
                        value={topic}
                        onChange={e => setTopic(e.target.value)}
                        placeholder={currentType.placeholder}
                        rows={3}
                        className="placeholder-[rgba(247,241,225,0.35)] bg-transparent border-none outline-none w-full resize-none"
                        style={{ color: PAPER, fontSize: 14.5, fontFamily: 'Inter, sans-serif', lineHeight: 1.6 }}
                      />
                    </div>
                  </div>
                  <p className="font-mono-ibm text-[11px] mt-2" style={{ color: MUTED_L }}>
                    {topic.length}/300 characters
                  </p>
                </div>

                {/* Step 3 — Tone */}
                <div style={{ padding: '24px 28px', borderBottom: `1px solid ${LINE_L}` }}>
                  <p className="font-mono-ibm text-[11.5px] tracking-[0.09em] uppercase mb-4"
                    style={{ color: MUTED_L }}>03 — Tone of Voice</p>
                  <div className="flex flex-wrap gap-2">
                    {TONES.map(t => {
                      const active = tone === t.id;
                      return (
                        <button key={t.id} onClick={() => setTone(t.id)}
                          title={t.desc}
                          style={{
                            padding: '9px 16px', borderRadius: 100,
                            border: `1px solid ${active ? MARIGOLD : LINE_L}`,
                            background: active ? `${MARIGOLD}18` : 'transparent',
                            color: active ? MARIGOLD : MUTED_L,
                            fontSize: 12.5, fontWeight: 600,
                            fontFamily: "'IBM Plex Mono', monospace",
                            cursor: 'pointer', transition: 'all 0.16s ease',
                          }}
                          onMouseEnter={e => { if (!active) { e.currentTarget.style.borderColor = MARIGOLD + '66'; e.currentTarget.style.color = PAPER; } }}
                          onMouseLeave={e => { if (!active) { e.currentTarget.style.borderColor = LINE_L; e.currentTarget.style.color = MUTED_L; } }}>
                          {t.label}
                        </button>
                      );
                    })}
                  </div>
                  <p className="text-[12px] mt-2" style={{ color: MUTED_L }}>
                    {TONES.find(t => t.id === tone)?.desc}
                  </p>
                </div>

                {/* Step 4 — Length + Social platform */}
                <div style={{ padding: '24px 28px', borderBottom: `1px solid ${LINE_L}` }}>
                  <div className="flex gap-6 flex-wrap">
                    <div className="flex-1">
                      <p className="font-mono-ibm text-[11.5px] tracking-[0.09em] uppercase mb-3"
                        style={{ color: MUTED_L }}>04 — Length</p>
                      <div className="flex gap-2">
                        {LENGTHS.map(l => {
                          const active = length === l.id;
                          return (
                            <button key={l.id} onClick={() => setLength(l.id)}
                              style={{
                                flex: 1, padding: '10px 8px', borderRadius: 2, textAlign: 'center',
                                border: `1px solid ${active ? SKY : LINE_L}`,
                                background: active ? `${SKY}18` : 'transparent',
                                cursor: 'pointer', transition: 'all 0.16s ease',
                              }}>
                              <p className="text-[12.5px] font-semibold" style={{ color: active ? SKY : PAPER }}>{l.label}</p>
                              <p className="font-mono-ibm text-[10.5px] mt-[2px]" style={{ color: MUTED_L }}>{l.words}</p>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {activeType === 'social' && (
                      <div className="flex-1">
                        <p className="font-mono-ibm text-[11.5px] tracking-[0.09em] uppercase mb-3"
                          style={{ color: MUTED_L }}>Platform</p>
                        <div className="flex gap-2">
                          {SOCIAL_PLATFORMS.map(p => {
                            const active = platform === p.id;
                            return (
                              <button key={p.id} onClick={() => setPlatform(p.id)}
                                title={p.label}
                                style={{
                                  flex: 1, padding: '10px 8px', borderRadius: 2, textAlign: 'center',
                                  border: `1px solid ${active ? p.color : LINE_L}`,
                                  background: active ? `${p.color}18` : 'transparent',
                                  cursor: 'pointer', transition: 'all 0.16s ease',
                                  color: active ? p.color : MUTED_L,
                                }}>
                                <span className="flex justify-center mb-[3px]">{p.icon}</span>
                                <p className="font-mono-ibm text-[10px]">{p.label.split('/')[0]}</p>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Generate button */}
                <div style={{ padding: '22px 28px' }}>
                  <button onClick={handleGenerate}
                    disabled={!topic.trim() || generating}
                    style={{
                      width: '100%', padding: '15px 24px',
                      background: generating ? `${MARIGOLD}88` : MARIGOLD,
                      color: INK, fontWeight: 700, fontSize: 14.5,
                      borderRadius: 2, border: 'none', cursor: topic.trim() && !generating ? 'pointer' : 'not-allowed',
                      transition: 'all 0.2s ease', display: 'flex', alignItems: 'center',
                      justifyContent: 'center', gap: 10,
                    }}
                    onMouseEnter={e => { if (topic.trim() && !generating) e.currentTarget.style.transform = 'translateY(-1px)'; }}
                    onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; }}>
                    {generating ? (
                      <>
                        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.9, ease: 'linear' }}>
                          <RefreshCw size={17} />
                        </motion.div>
                        AI is writing…
                      </>
                    ) : (
                      <>
                        <Sparkles size={17} />
                        Generate Content
                        <ArrowRight size={17} />
                      </>
                    )}
                  </button>

                  {generating && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                      className="flex items-center justify-center gap-3 mt-4">
                      {[0, 1, 2, 3, 4].map(i => (
                        <motion.span key={i}
                          className="block rounded-full" style={{ width: 6, height: 6, background: MARIGOLD }}
                          animate={{ scale: [1, 1.6, 1], opacity: [0.4, 1, 0.4] }}
                          transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.15 }} />
                      ))}
                    </motion.div>
                  )}
                </div>
              </div>
            </Reveal>

            {/* ── RIGHT: Output ── */}
            <Reveal delay={120}>
              <div ref={outputRef} style={{ background: INK2, border: `1px solid ${LINE_L}`, borderRadius: 3, minHeight: 400 }}>
                {/* output header */}
                <div className="flex items-center justify-between flex-wrap gap-3"
                  style={{ padding: '20px 24px', borderBottom: `1px solid ${LINE_L}` }}>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center rounded-full"
                      style={{ width: 34, height: 34, background: `${currentType.color}18`, border: `1.5px solid ${currentType.color}44`, color: currentType.color }}>
                      {currentType.icon}
                    </div>
                    <div>
                      <p className="font-semibold text-[14px]" style={{ color: PAPER }}>{currentType.outputLabel}</p>
                      <p className="font-mono-ibm text-[11px]" style={{ color: MUTED_L }}>
                        {historySelected ? historySelected.topic : (topic || 'Awaiting topic…')}
                      </p>
                    </div>
                  </div>

                  {/* action bar */}
                  {(showOutput || historySelected) && displayDone && (
                    <div className="flex items-center gap-2">
                      <button onClick={() => handleCopy(displayText)}
                        className="inline-flex items-center gap-[6px] font-mono-ibm text-[12px] px-3 py-[7px] rounded-[2px]"
                        style={{ border: `1px solid ${LINE_L}`, color: copied ? LEAF : MUTED_L, background: 'transparent', cursor: 'pointer', transition: 'all 0.16s' }}
                        onMouseEnter={e => e.currentTarget.style.borderColor = PAPER}
                        onMouseLeave={e => e.currentTarget.style.borderColor = LINE_L}>
                        {copied ? <Check size={13} /> : <Copy size={13} />}
                        {copied ? 'Copied!' : 'Copy'}
                      </button>
                      <button onClick={() => handleDownload(displayText, currentType.outputLabel)}
                        className="inline-flex items-center gap-[6px] font-mono-ibm text-[12px] px-3 py-[7px] rounded-[2px]"
                        style={{ border: `1px solid ${LINE_L}`, color: MUTED_L, background: 'transparent', cursor: 'pointer', transition: 'all 0.16s' }}
                        onMouseEnter={e => e.currentTarget.style.borderColor = PAPER}
                        onMouseLeave={e => e.currentTarget.style.borderColor = LINE_L}>
                        <Download size={13} /> Save
                      </button>
                      {!historySelected && (
                        <button onClick={handleGenerate}
                          className="inline-flex items-center gap-[6px] font-mono-ibm text-[12px] px-3 py-[7px] rounded-[2px]"
                          style={{ border: `1px solid ${LINE_L}`, color: MUTED_L, background: 'transparent', cursor: 'pointer', transition: 'all 0.16s' }}
                          onMouseEnter={e => e.currentTarget.style.borderColor = MARIGOLD}
                          onMouseLeave={e => e.currentTarget.style.borderColor = LINE_L}>
                          <RotateCcw size={13} /> Regenerate
                        </button>
                      )}
                    </div>
                  )}
                </div>

                {/* output body */}
                <div style={{ padding: '26px 26px 28px', minHeight: 340 }}>
                  <AnimatePresence mode="wait">
                    {!showOutput && !historySelected && !generating && (
                      <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="flex flex-col items-center justify-center py-20 text-center">
                        <div className="mb-4" style={{ opacity: 0.18 }}>
                          <AlignLeft size={48} style={{ color: MARIGOLD }} />
                        </div>
                        <p className="font-fraunces text-[18px] mb-2" style={{ color: MUTED_L }}>Your content will appear here</p>
                        <p className="font-mono-ibm text-[12.5px]" style={{ color: MUTED_L }}>
                          Fill in the form and click Generate
                        </p>
                      </motion.div>
                    )}

                    {generating && (
                      <motion.div key="generating" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="flex flex-col items-center justify-center py-20 text-center">
                        <motion.div className="mb-5"
                          animate={{ rotate: [0, 15, -15, 0], scale: [1, 1.1, 1] }}
                          transition={{ duration: 1.4, repeat: Infinity }}>
                          <Sparkles size={38} style={{ color: MARIGOLD }} />
                        </motion.div>
                        <p className="font-fraunces text-[18px] mb-2" style={{ color: PAPER }}>AI is writing your content</p>
                        <p className="font-mono-ibm text-[12px]" style={{ color: MUTED_L }}>
                          Analysing topic · Selecting tone · Crafting narrative…
                        </p>
                      </motion.div>
                    )}

                    {(showOutput || historySelected) && (
                      <motion.div key="output" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4 }}>
                        {/* metadata chips */}
                        <div className="flex flex-wrap items-center gap-2 mb-5">
                          {[
                            { icon: <Hash size={11} />, label: TONES.find(t => t.id === (historySelected?.tone ?? tone))?.label },
                            { icon: <AlignLeft size={11} />, label: LENGTHS.find(l => l.id === length)?.label + ' · ' + LENGTHS.find(l => l.id === length)?.words },
                            { icon: <Clock size={11} />, label: historySelected?.timestamp ?? 'Just now' },
                          ].map(({ icon, label }) => (
                            <span key={label} className="inline-flex items-center gap-[5px] font-mono-ibm text-[11px] px-[9px] py-[4px] rounded-full"
                              style={{ border: `1px solid ${LINE_L}`, color: MUTED_L }}>
                              {icon}{label}
                            </span>
                          ))}
                        </div>

                        {/* rendered content — parse bold **text** */}
                        <div style={{ fontSize: 14.5, lineHeight: 1.78, color: MUTED_L, fontFamily: 'Inter, sans-serif', whiteSpace: 'pre-wrap' }}>
                          {(displayText).split('\n').map((line, i) => {
                            const parts = line.split(/\*\*(.*?)\*\*/g);
                            return (
                              <p key={i} style={{ marginBottom: line === '' ? 10 : 4 }}>
                                {parts.map((part, j) =>
                                  j % 2 === 1
                                    ? <strong key={j} style={{ color: PAPER, fontWeight: 600 }}>{part}</strong>
                                    : <span key={j}>{part}</span>
                                )}
                                {!displayDone && i === displayText.split('\n').length - 1 && (
                                  <motion.span className="inline-block w-[2px] h-[16px] ml-[1px]"
                                    style={{ background: MARIGOLD, verticalAlign: 'middle' }}
                                    animate={{ opacity: [1, 0] }}
                                    transition={{ repeat: Infinity, duration: 0.7 }} />
                                )}
                              </p>
                            );
                          })}
                        </div>

                        {/* word count */}
                        {displayDone && (
                          <p className="font-mono-ibm text-[11.5px] mt-5"
                            style={{ color: MUTED_L, borderTop: `1px solid ${LINE_L}`, paddingTop: 14 }}>
                            {displayText.split(' ').filter(Boolean).length} words · ShebaBD AI Content Studio
                          </p>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ══ GENERATION HISTORY ═══════════════════════════════════════════════ */}
      {history.length > 0 && (
        <section className="px-8 pb-[80px]">
          <div className="mx-auto" style={{ maxWidth: 1180 }}>
            <Reveal>
              <div style={{ borderTop: `1px solid ${LINE_L}`, paddingTop: 60 }}>
                {/* header */}
                <button
                  onClick={() => setHistoryOpen(h => !h)}
                  className="flex items-center justify-between w-full mb-6"
                  style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                >
                  <div className="flex items-center gap-3">
                    <Clock size={16} style={{ color: MUTED_L }} />
                    <span className="font-mono-ibm text-[13px]" style={{ color: MUTED_L }}>
                      Generation History
                    </span>
                    <span className="font-mono-ibm text-[11px] px-[8px] py-[3px] rounded-full"
                      style={{ background: `${MARIGOLD}18`, color: MARIGOLD, border: `1px solid ${MARIGOLD}33` }}>
                      {history.length}
                    </span>
                  </div>
                  <ChevronDown size={16} style={{ color: MUTED_L, transform: historyOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
                </button>

                <AnimatePresence>
                  {historyOpen && (
                    <motion.div key="history"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.28 }}
                      style={{ overflow: 'hidden' }}>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 8 }}>
                        {history.map((entry) => {
                          const ct = CONTENT_TYPES.find(t => t.id === entry.type)!;
                          const isSelected = historySelected?.id === entry.id;
                          return (
                            <button
                              key={entry.id}
                              onClick={() => {
                                setHistorySelected(isSelected ? null : entry);
                                setShowOutput(false);
                              }}
                              style={{
                                display: 'flex', flexDirection: 'column', alignItems: 'flex-start',
                                gap: 8, padding: '16px 18px', borderRadius: 3, textAlign: 'left',
                                border: `1px solid ${isSelected ? ct.color : LINE_L}`,
                                background: isSelected ? `${ct.color}10` : INK2,
                                cursor: 'pointer', transition: 'all 0.16s ease',
                              }}
                              onMouseEnter={e => { if (!isSelected) e.currentTarget.style.borderColor = ct.color + '55'; }}
                              onMouseLeave={e => { if (!isSelected) e.currentTarget.style.borderColor = LINE_L; }}
                            >
                              <div className="flex items-center justify-between w-full gap-2">
                                <span className="flex items-center gap-2 font-mono-ibm text-[11.5px]"
                                  style={{ color: ct.color }}>
                                  {ct.icon} {ct.label}
                                </span>
                                <span className="font-mono-ibm text-[11px]" style={{ color: MUTED_L }}>
                                  {entry.timestamp}
                                </span>
                              </div>
                              <p className="text-[13px] font-medium line-clamp-1" style={{ color: PAPER }}>
                                {entry.topic}
                              </p>
                              <div className="flex items-center gap-3">
                                <span className="font-mono-ibm text-[11px]" style={{ color: MUTED_L }}>
                                  {entry.wordCount} words
                                </span>
                                <span className="font-mono-ibm text-[11px]" style={{ color: MUTED_L }}>
                                  · {TONES.find(t => t.id === entry.tone)?.label}
                                </span>
                              </div>
                            </button>
                          );
                        })}
                      </div>

                      <button
                        onClick={() => { setHistory([]); setHistoryOpen(false); setHistorySelected(null); }}
                        className="mt-5 inline-flex items-center gap-2 font-mono-ibm text-[12px]"
                        style={{ color: MUTED_L, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                        onMouseEnter={e => e.currentTarget.style.color = DISC}
                        onMouseLeave={e => e.currentTarget.style.color = MUTED_L}
                      >
                        <Trash2 size={13} /> Clear history
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </Reveal>
          </div>
        </section>
      )}

      {/* ══ HOW IT WORKS ═════════════════════════════════════════════════════ */}
      <section className="px-8 py-[100px]"
        style={{ background: INK2, borderTop: `1px solid ${LINE_L}`, borderBottom: `1px solid ${LINE_L}` }}>
        <div className="mx-auto" style={{ maxWidth: 1180 }}>
          <Reveal>
            <div className="text-center mb-14">
              <Eyebrow label="Under the Hood" color={SKY} />
              <h2 className="font-fraunces mt-5 mb-3"
                style={{ fontSize: 'clamp(28px,3.4vw,42px)', fontWeight: 600, lineHeight: 1.1 }}>
                How the AI writes for you
              </h2>
              <p style={{ color: MUTED_L, fontSize: 15.5, maxWidth: 520, margin: '0 auto' }}>
                Four specialised pipelines, each tuned to a different format and audience.
              </p>
            </div>
          </Reveal>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 1, background: LINE_L, border: `1px solid ${LINE_L}` }}>
            {[
              {
                icon: <BookOpen size={22} />, color: SKY,
                title: 'Awareness Blog Engine',
                desc: 'Generates long-form, SEO-ready articles structured with intro, body paragraphs, and calls to action. Trained on Bangladesh social sector writing.',
              },
              {
                icon: <Megaphone size={22} />, color: DISC,
                title: 'Campaign Copywriter',
                desc: 'Crafts persuasive fundraising copy with clear goals, fund usage breakdowns, and urgency triggers designed to convert readers into donors.',
              },
              {
                icon: <Users size={22} />, color: LEAF,
                title: 'Volunteer Recruitment Writer',
                desc: 'Creates motivational recruitment posts that match role requirements to volunteer motivations — backed by behavioural psychology principles.',
              },
              {
                icon: <Share2 size={22} />, color: MARIGOLD,
                title: 'Social Media Optimiser',
                desc: 'Platform-aware formatting for Facebook, Twitter/X, and Instagram — correct character limits, hashtag density, emoji use, and CTA placement.',
              },
            ].map(({ icon, color, title, desc }, i) => (
              <Reveal key={title} delay={i * 70}
                style={{ background: INK2, padding: '38px 34px', transition: 'background 0.22s ease' }}>
                <div
                  onMouseEnter={e => { const p = e.currentTarget.parentElement; if (p) p.style.background = INK3; }}
                  onMouseLeave={e => { const p = e.currentTarget.parentElement; if (p) p.style.background = INK2; }}>
                  <div className="flex items-center justify-center mb-5 rounded-full"
                    style={{ width: 50, height: 50, background: `${color}18`, border: `1.5px solid ${color}44`, color }}>
                    {icon}
                  </div>
                  <h3 className="font-fraunces font-semibold mb-3" style={{ fontSize: 18, color: PAPER }}>{title}</h3>
                  <p style={{ fontSize: 13.5, lineHeight: 1.7, color: MUTED_L }}>{desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ══ TONE SHOWCASE ════════════════════════════════════════════════════ */}
      <section className="px-8 py-[90px]">
        <div className="mx-auto" style={{ maxWidth: 1180 }}>
          <Reveal>
            <div className="text-center mb-12">
              <Eyebrow label="Voice Modes" color={MARIGOLD} />
              <h2 className="font-fraunces mt-5 mb-3"
                style={{ fontSize: 'clamp(26px,3vw,38px)', fontWeight: 600, lineHeight: 1.1 }}>
                Four tones, one mission
              </h2>
            </div>
          </Reveal>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 1, background: LINE_L, border: `1px solid ${LINE_L}` }}>
            {TONES.map(({ id, label, desc }, i) => {
              const colors = [PAPER, DISC, WARN, MARIGOLD];
              const col = colors[i];
              return (
                <Reveal key={id} delay={i * 60}
                  style={{ background: INK, padding: '32px 26px', transition: 'background 0.22s ease' }}>
                  <div
                    onMouseEnter={e => { const p = e.currentTarget.parentElement; if (p) p.style.background = INK2; }}
                    onMouseLeave={e => { const p = e.currentTarget.parentElement; if (p) p.style.background = INK; }}>
                    <span className="font-mono-ibm text-[11px] tracking-[0.1em] uppercase mb-3 block"
                      style={{ color: MUTED_L }}>
                      0{i + 1}
                    </span>
                    <h3 className="font-fraunces font-semibold mb-2" style={{ fontSize: 18, color: col }}>{label}</h3>
                    <p style={{ fontSize: 13, lineHeight: 1.65, color: MUTED_L }}>{desc}</p>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* ══ CTA BAND ═════════════════════════════════════════════════════════ */}
      <section className="px-8 py-[90px]"
        style={{ background: INK2, borderTop: `1px solid ${LINE_L}` }}>
        <div className="mx-auto text-center" style={{ maxWidth: 680 }}>
          <Reveal>
            <Eyebrow label="Get Started" color={MARIGOLD} />
            <h2 className="font-fraunces mt-6 mb-4"
              style={{ fontSize: 'clamp(28px,3.4vw,42px)', fontWeight: 600, lineHeight: 1.1 }}>
              Your cause deserves<br />great content
            </h2>
            <p style={{ color: MUTED_L, fontSize: 15.5, lineHeight: 1.7, marginBottom: 36 }}>
              NGOs, volunteers, and donors on ShebaBD are already using AI-generated content
              to reach more people, raise more funds, and inspire more action.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <a href="#top"
                className="inline-flex items-center gap-2 px-[28px] py-[15px] font-semibold text-[14px] rounded-[2px]"
                style={{ background: MARIGOLD, color: INK, transition: 'all 0.2s' }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.opacity = '0.9'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.opacity = '1'; }}>
                <Sparkles size={16} /> Start Generating
              </a>
              <Link to={ROUTES.ORGANIZATIONS}
                className="inline-flex items-center gap-2 px-[28px] py-[15px] font-semibold text-[14px] rounded-[2px]"
                style={{ border: `1px solid ${LINE_L}`, color: PAPER, transition: 'border-color 0.2s' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = MUTED_L; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = LINE_L; }}>
                Browse NGOs <ChevronRight size={15} />
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

    </div>
  );
}

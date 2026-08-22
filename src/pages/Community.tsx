import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import {
  BookOpen, MessageSquare, Heart, Users, Megaphone,
  ChevronRight, Clock, Tag, ThumbsUp, Pin, Sparkles,
  ArrowRight, Send, Star, Loader2, AlertCircle, Plus, X,
  RefreshCw, Search, Share2, Check, Filter, Calendar, User, PenTool,
  Trash2, Trophy, Wrench, Droplets, Building2, Globe, Award, Shield,
} from 'lucide-react';
import { ROUTES } from '@/constants/routes';
import { useAuth } from '@/hooks/useAuth';
import communityApi, {
  type BlogPost, type VolunteerStory, type ForumThread,
  type Announcement, type CommunityStats,
} from '@/services/communityApi';

/* ── Design tokens ────────────────────────────────────────────────────────── */
const INK   = '#0B2E22';
const INK2  = '#0F3A2B';
const INK3  = '#123F30';
const PAPER = '#F7F1E1';
const DISC  = '#D6472C';
const MARIGOLD = '#E7A93B';
const SKY   = '#3E7A8C';
const LEAF  = '#4C8C6B';
const MUTED = 'rgba(247,241,225,0.62)';
const LINE  = 'rgba(247,241,225,0.16)';

type TabId = 'blogs' | 'stories' | 'forum' | 'announcements';

/* ── Tiny helpers ─────────────────────────────────────────────────────────── */
function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d}d ago`;
  return new Date(iso).toLocaleDateString();
}

function Reveal({ children, delay = 0, className = '', style = {} }: {
  children: React.ReactNode; delay?: number; className?: string; style?: React.CSSProperties;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) {
        setTimeout(() => { el.style.opacity = '1'; el.style.transform = 'translateY(0)'; }, delay);
        io.unobserve(el);
      }
    }, { threshold: 0.06 });
    io.observe(el);
    return () => io.disconnect();
  }, [delay]);
  return (
    <div ref={ref} className={className}
      style={{ opacity: 0, transform: 'translateY(18px)', transition: 'opacity 0.5s ease, transform 0.5s ease', ...style }}>
      {children}
    </div>
  );
}

function Eyebrow({ label, color = MARIGOLD }: { label: string; color?: string }) {
  return (
    <div className="inline-flex items-center gap-2 font-mono text-[11px] tracking-[0.12em] uppercase" style={{ color: MUTED }}>
      <span className="inline-block w-[6px] h-[6px] rounded-full" style={{ background: color }} />
      {label}
    </div>
  );
}

function Spinner() {
  return (
    <div className="flex items-center justify-center py-16">
      <Loader2 className="h-8 w-8 animate-spin" style={{ color: SKY }} />
    </div>
  );
}

function ErrorBanner({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="flex items-center gap-3 rounded p-4 my-4"
      style={{ background: `${DISC}14`, border: `1px solid ${DISC}44` }}>
      <AlertCircle size={16} style={{ color: DISC, flexShrink: 0 }} />
      <p className="text-sm flex-1" style={{ color: PAPER }}>{message}</p>
      <button onClick={onRetry} className="flex items-center gap-1 text-xs px-3 py-1 rounded"
        style={{ border: `1px solid ${LINE}`, color: MUTED }}>
        <RefreshCw size={11} /> Retry
      </button>
    </div>
  );
}

/* ── Modal: Blog Detail (Full Reader) ──────────────────────────────────────── */
function BlogDetailModal({ blog, onClose, onLike, isLiked, onShare, onDelete }: {
  blog: BlogPost;
  onClose: () => void;
  onLike: (id: number) => void;
  isLiked: boolean;
  onShare: (title: string, url: string) => void;
  onDelete: (id: number, title: string) => void;
}) {
  const { user } = useAuth();
  
  const paragraphs = useMemo(() => {
    if (!blog.content) return [blog.excerpt];
    return blog.content.split('\n\n').filter(p => p.trim().length > 0);
  }, [blog]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto"
      style={{ background: 'rgba(0,0,0,0.80)', backdropFilter: 'blur(6px)' }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <motion.div initial={{ opacity: 0, scale: 0.96, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.96 }}
        className="w-full max-w-2xl rounded-lg overflow-hidden my-8 shadow-2xl" style={{ background: INK2, border: `1px solid ${LINE}` }}>
        
        {/* Banner Header */}
        <div className="relative flex flex-col justify-end p-6"
          style={{ background: `linear-gradient(135deg, ${blog.color_hex}33 0%, ${INK3} 100%)`, borderBottom: `1px solid ${LINE}`, minHeight: 160 }}>
          <button onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full transition-colors hover:bg-white/10"
            style={{ background: 'rgba(0,0,0,0.3)', color: PAPER }}>
            <X size={18} />
          </button>
          
          <div className="flex items-center gap-2 mb-3">
            <span className="font-mono text-xs px-2.5 py-1 rounded-full font-medium"
              style={{ color: blog.color_hex, background: `${blog.color_hex}22`, border: `1px solid ${blog.color_hex}44` }}>
              {blog.category}
            </span>
            <span className="font-mono text-xs flex items-center gap-1" style={{ color: MUTED }}>
              <Clock size={12} /> {blog.read_time}
            </span>
          </div>

          <h2 className="font-fraunces text-2xl md:text-3xl font-semibold leading-tight mb-2" style={{ color: PAPER }}>
            {blog.title}
          </h2>
        </div>

        {/* Author info & metadata */}
        <div className="flex items-center justify-between px-6 py-4 flex-wrap gap-3" style={{ borderBottom: `1px solid ${LINE}`, background: INK3 }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm"
              style={{ background: `${blog.color_hex}25`, color: blog.color_hex, border: `1px solid ${blog.color_hex}44` }}>
              {blog.image_initials}
            </div>
            <div>
              <p className="text-sm font-semibold" style={{ color: PAPER }}>{blog.author_name}</p>
              <p className="font-mono text-xs" style={{ color: MUTED }}>{blog.author_role} • {timeAgo(blog.created_at)}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button onClick={() => onDelete(blog.id, blog.title)}
              className="p-2 rounded-md transition-colors flex items-center gap-1.5 text-xs font-mono"
              title="Delete Article"
              style={{ border: `1px solid ${DISC}44`, color: DISC, background: `${DISC}10` }}>
              <Trash2 size={14} /> Delete
            </button>

            <button onClick={() => onShare(blog.title, window.location.href)}
              className="p-2 rounded-md transition-colors flex items-center gap-1.5 text-xs font-mono"
              style={{ border: `1px solid ${LINE}`, color: MUTED }}>
              <Share2 size={14} /> Share
            </button>
            <button onClick={() => onLike(blog.id)}
              className="px-3 py-2 rounded-md transition-all flex items-center gap-1.5 text-xs font-mono font-medium"
              style={{
                border: `1px solid ${isLiked ? DISC : LINE}`,
                color: isLiked ? DISC : PAPER,
                background: isLiked ? `${DISC}15` : 'transparent',
              }}>
              <Heart size={14} fill={isLiked ? DISC : 'none'} />
              {blog.likes_count}
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 md:p-8 space-y-4 max-h-[55vh] overflow-y-auto" style={{ color: PAPER }}>
          <p className="text-base font-medium leading-relaxed italic p-4 rounded-md"
            style={{ background: INK3, borderLeft: `3px solid ${blog.color_hex}`, color: PAPER }}>
            {blog.excerpt}
          </p>

          {paragraphs.map((p, idx) => (
            <p key={idx} className="text-sm leading-relaxed" style={{ color: 'rgba(247,241,225,0.88)', fontSize: '0.95rem', lineHeight: 1.8 }}>
              {p}
            </p>
          ))}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 flex items-center justify-between" style={{ borderTop: `1px solid ${LINE}`, background: INK2 }}>
          <span className="text-xs font-mono" style={{ color: MUTED }}>ShebaBD Community Publications</span>
          <button onClick={onClose} className="px-4 py-1.5 rounded text-xs font-semibold" style={{ background: SKY, color: PAPER }}>
            Close Article
          </button>
        </div>
      </motion.div>
    </div>
  );
}

/* ── Modal: Create Blog Post ────────────────────────────────────────────────── */
function CreateBlogModal({ onClose, onSubmit }: {
  onClose: () => void;
  onSubmit: (data: { title: string; excerpt: string; content: string; category: string; read_time: string }) => Promise<void>;
}) {
  const [form, setForm] = useState({
    title: '',
    excerpt: '',
    content: '',
    category: 'Awareness',
    read_time: '5 min read',
  });
  const [submitting, setSubmitting] = useState(false);

  const categories = ['Awareness', 'Health', 'Environment', 'Education', 'Emergency', 'Community'];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.excerpt.trim() || !form.content.trim()) return;
    setSubmitting(true);
    try {
      await onSubmit(form);
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.75)' }} onClick={e => e.target === e.currentTarget && onClose()}>
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-xl rounded-lg p-6 max-h-[90vh] overflow-y-auto" style={{ background: INK2, border: `1px solid ${LINE}` }}>
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <PenTool size={18} style={{ color: MARIGOLD }} />
            <h3 className="font-semibold text-lg" style={{ color: PAPER }}>Publish Awareness Blog Article</h3>
          </div>
          <button onClick={onClose}><X size={18} style={{ color: MUTED }} /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-mono block mb-1" style={{ color: MUTED }}>Article Title *</label>
            <input required value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              placeholder="e.g. Empowering Rural Healthcare Volunteers in Sylhet"
              className="w-full px-3 py-2 rounded text-sm bg-transparent outline-none"
              style={{ border: `1px solid ${LINE}`, color: PAPER }} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-mono block mb-1" style={{ color: MUTED }}>Category *</label>
              <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                className="w-full px-3 py-2 rounded text-sm outline-none"
                style={{ border: `1px solid ${LINE}`, color: PAPER, background: INK3 }}>
                {categories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-mono block mb-1" style={{ color: MUTED }}>Estimated Read Time</label>
              <input value={form.read_time} onChange={e => setForm(f => ({ ...f, read_time: e.target.value }))}
                placeholder="5 min read" className="w-full px-3 py-2 rounded text-sm bg-transparent outline-none"
                style={{ border: `1px solid ${LINE}`, color: PAPER }} />
            </div>
          </div>

          <div>
            <label className="text-xs font-mono block mb-1" style={{ color: MUTED }}>Short Excerpt (1-2 sentences) *</label>
            <textarea required value={form.excerpt} onChange={e => setForm(f => ({ ...f, excerpt: e.target.value }))}
              placeholder="A brief summary to display on the blog listing card..." rows={2}
              className="w-full px-3 py-2 rounded text-sm bg-transparent outline-none resize-none"
              style={{ border: `1px solid ${LINE}`, color: PAPER }} />
          </div>

          <div>
            <label className="text-xs font-mono block mb-1" style={{ color: MUTED }}>Full Article Content *</label>
            <textarea required value={form.content} onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
              placeholder="Write full article body paragraphs here..." rows={6}
              className="w-full px-3 py-2 rounded text-sm bg-transparent outline-none resize-none"
              style={{ border: `1px solid ${LINE}`, color: PAPER }} />
          </div>

          <button type="submit" disabled={submitting}
            className="w-full py-3 rounded text-sm font-semibold flex items-center justify-center gap-2 mt-2"
            style={{ background: MARIGOLD, color: INK, opacity: submitting ? 0.7 : 1 }}>
            {submitting ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
            {submitting ? 'Publishing...' : 'Publish Blog Article'}
          </button>
        </form>
      </motion.div>
    </div>
  );
}

/* ── Modal: Submit Story ──────────────────────────────────────────────────── */
function StoryModal({ onClose, onSubmit }: {
  onClose: () => void;
  onSubmit: (data: { name: string; role: string; story: string; cause: string; blood_donations: number; volunteer_hours: number }) => Promise<void>;
}) {
  const { user } = useAuth();
  const [form, setForm] = useState({ name: user?.name || '', role: '', story: '', cause: 'Volunteering', blood_donations: 0, volunteer_hours: 0 });
  const [submitting, setSubmitting] = useState(false);

  const causes = ['Blood Donation', 'Disaster Relief', 'Education', 'Environment', 'Healthcare', 'Poverty Relief', 'Volunteering'];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.role.trim() || !form.story.trim()) return;
    setSubmitting(true);
    try { await onSubmit(form); onClose(); } finally { setSubmitting(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.7)' }} onClick={e => e.target === e.currentTarget && onClose()}>
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-lg rounded-lg p-6" style={{ background: INK2, border: `1px solid ${LINE}` }}>
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-semibold text-lg" style={{ color: PAPER }}>Share Your Story</h3>
          <button onClick={onClose}><X size={18} style={{ color: MUTED }} /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-3">
          <input required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
            placeholder="Your full name *" className="w-full px-3 py-2 rounded text-sm bg-transparent outline-none"
            style={{ border: `1px solid ${LINE}`, color: PAPER }} />
          <input required value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))}
            placeholder="Your role e.g. 'Blood Donor, Dhaka' *" className="w-full px-3 py-2 rounded text-sm bg-transparent outline-none"
            style={{ border: `1px solid ${LINE}`, color: PAPER }} />
          <select value={form.cause} onChange={e => setForm(f => ({ ...f, cause: e.target.value }))}
            className="w-full px-3 py-2 rounded text-sm outline-none"
            style={{ border: `1px solid ${LINE}`, color: PAPER, background: INK3 }}>
            {causes.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <textarea required value={form.story} onChange={e => setForm(f => ({ ...f, story: e.target.value }))}
            placeholder="Tell your story (minimum 20 characters) *" rows={4}
            className="w-full px-3 py-2 rounded text-sm bg-transparent outline-none resize-none"
            style={{ border: `1px solid ${LINE}`, color: PAPER }} />
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs mb-1 block font-mono" style={{ color: MUTED }}>Blood donations</label>
              <input type="number" min={0} value={form.blood_donations}
                onChange={e => setForm(f => ({ ...f, blood_donations: +e.target.value }))}
                className="w-full px-3 py-2 rounded text-sm bg-transparent outline-none"
                style={{ border: `1px solid ${LINE}`, color: PAPER }} />
            </div>
            <div>
              <label className="text-xs mb-1 block font-mono" style={{ color: MUTED }}>Volunteer hours</label>
              <input type="number" min={0} value={form.volunteer_hours}
                onChange={e => setForm(f => ({ ...f, volunteer_hours: +e.target.value }))}
                className="w-full px-3 py-2 rounded text-sm bg-transparent outline-none"
                style={{ border: `1px solid ${LINE}`, color: PAPER }} />
            </div>
          </div>
          <button type="submit" disabled={submitting}
            className="w-full py-3 rounded text-sm font-semibold flex items-center justify-center gap-2"
            style={{ background: MARIGOLD, color: INK, opacity: submitting ? 0.7 : 1 }}>
            {submitting ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
            {submitting ? 'Submitting...' : 'Submit My Story'}
          </button>
        </form>
      </motion.div>
    </div>
  );
}

/* ── Modal: New Thread ────────────────────────────────────────────────────── */
function ThreadModal({ onClose, onSubmit }: {
  onClose: () => void;
  onSubmit: (data: { title: string; body: string; category: string }) => Promise<void>;
}) {
  const categories = ['NGOs', 'Emergency', 'Volunteers', 'Technology', 'Donations', 'Stories', 'General'];
  const [form, setForm] = useState({ title: '', body: '', category: 'General' });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.body.trim()) return;
    setSubmitting(true);
    try { await onSubmit(form); onClose(); } finally { setSubmitting(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.7)' }} onClick={e => e.target === e.currentTarget && onClose()}>
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-lg rounded-lg p-6" style={{ background: INK2, border: `1px solid ${LINE}` }}>
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-semibold text-lg" style={{ color: PAPER }}>Start a Discussion</h3>
          <button onClick={onClose}><X size={18} style={{ color: MUTED }} /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-3">
          <input required value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
            placeholder="Discussion title *" className="w-full px-3 py-2 rounded text-sm bg-transparent outline-none"
            style={{ border: `1px solid ${LINE}`, color: PAPER }} />
          <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
            className="w-full px-3 py-2 rounded text-sm outline-none"
            style={{ border: `1px solid ${LINE}`, color: PAPER, background: INK3 }}>
            {categories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <textarea required value={form.body} onChange={e => setForm(f => ({ ...f, body: e.target.value }))}
            placeholder="What would you like to discuss? *" rows={4}
            className="w-full px-3 py-2 rounded text-sm bg-transparent outline-none resize-none"
            style={{ border: `1px solid ${LINE}`, color: PAPER }} />
          <button type="submit" disabled={submitting}
            className="w-full py-3 rounded text-sm font-semibold flex items-center justify-center gap-2"
            style={{ background: SKY, color: PAPER, opacity: submitting ? 0.7 : 1 }}>
            {submitting ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
            {submitting ? 'Posting...' : 'Post Discussion'}
          </button>
        </form>
      </motion.div>
    </div>
  );
}

/* ── Thread Detail Panel ─────────────────────────────────────────────────── */
function ThreadDetail({ thread, onClose, onReply, onShare, onDelete }: {
  thread: ForumThread;
  onClose: () => void;
  onReply: (threadId: number, body: string) => Promise<void>;
  onShare: (title: string, url: string) => void;
  onDelete: (id: number, title: string) => void;
}) {
  const { user } = useAuth();
  const [replyText, setReplyText] = useState('');
  const [sending, setSending] = useState(false);

  const handleReply = async () => {
    if (!replyText.trim() || !user) return;
    setSending(true);
    try {
      await onReply(thread.id, replyText.trim());
      setReplyText('');
    } finally {
      setSending(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
      className="fixed inset-0 z-40 flex justify-end" style={{ background: 'rgba(0,0,0,0.5)' }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="w-full max-w-lg h-full overflow-y-auto flex flex-col"
        style={{ background: INK2, borderLeft: `1px solid ${LINE}` }}>
        {/* Header */}
        <div className="sticky top-0 flex items-start gap-3 p-5 z-10" style={{ background: INK2, borderBottom: `1px solid ${LINE}` }}>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span className="text-xs px-2 py-0.5 rounded-full font-mono inline-block"
                style={{ color: thread.color_hex, background: `${thread.color_hex}18`, border: `1px solid ${thread.color_hex}33` }}>
                {thread.category}
              </span>
              <button onClick={() => onShare(thread.title, window.location.href)}
                className="text-xs px-2 py-0.5 rounded font-mono inline-flex items-center gap-1"
                style={{ border: `1px solid ${LINE}`, color: MUTED }}>
                <Share2 size={10} /> Share
              </button>
              <button onClick={() => onDelete(thread.id, thread.title)}
                className="text-xs px-2 py-0.5 rounded font-mono inline-flex items-center gap-1"
                style={{ border: `1px solid ${DISC}44`, color: DISC, background: `${DISC}10` }}>
                <Trash2 size={10} /> Delete
              </button>
            </div>
            <h3 className="font-semibold text-base" style={{ color: PAPER }}>{thread.title}</h3>
            <p className="text-xs mt-1" style={{ color: MUTED }}>@{thread.author_name} · {timeAgo(thread.created_at)}</p>
          </div>
          <button onClick={onClose} className="shrink-0 mt-1"><X size={18} style={{ color: MUTED }} /></button>
        </div>

        {/* Body */}
        <div className="p-5" style={{ borderBottom: `1px solid ${LINE}` }}>
          <p className="text-sm leading-relaxed" style={{ color: PAPER }}>{thread.body}</p>
        </div>

        {/* Replies */}
        <div className="flex-1 p-5 space-y-4">
          <p className="text-xs font-mono uppercase tracking-wider" style={{ color: MUTED }}>
            {(thread.replies || []).length} {(thread.replies || []).length === 1 ? 'reply' : 'replies'}
          </p>
          {(thread.replies || []).map(reply => (
            <div key={reply.id} className="rounded p-3" style={{ background: INK3, border: `1px solid ${LINE}` }}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium" style={{ color: PAPER }}>@{reply.author_name}</span>
                <span className="text-xs" style={{ color: MUTED }}>{timeAgo(reply.created_at)}</span>
              </div>
              <p className="text-sm leading-relaxed" style={{ color: MUTED }}>{reply.body}</p>
            </div>
          ))}
          {(thread.replies || []).length === 0 && (
            <p className="text-sm text-center py-6" style={{ color: MUTED }}>
              No replies yet. Be the first to contribute.
            </p>
          )}
        </div>

        {/* Reply input */}
        <div className="sticky bottom-0 p-4" style={{ background: INK2, borderTop: `1px solid ${LINE}` }}>
          {user ? (
            <div className="flex gap-2">
              <textarea value={replyText} onChange={e => setReplyText(e.target.value)}
                placeholder="Write a reply…" rows={2}
                className="flex-1 px-3 py-2 rounded text-sm bg-transparent outline-none resize-none"
                style={{ border: `1px solid ${LINE}`, color: PAPER }} />
              <button onClick={handleReply} disabled={!replyText.trim() || sending}
                className="px-3 rounded flex items-center justify-center"
                style={{ background: replyText.trim() ? SKY : LINE, color: PAPER, minWidth: 44 }}>
                {sending ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
              </button>
            </div>
          ) : (
            <p className="text-xs text-center" style={{ color: MUTED }}>
              <Link to={ROUTES.SIGN_IN} style={{ color: SKY }}>Sign in</Link> to reply
            </p>
          )}
        </div>
      </div>
    </motion.div>
  );
}

/* ── Modal: Announcement Detail ───────────────────────────────────────────── */
function AnnouncementDetailModal({ ann, onClose, onShare }: {
  ann: Announcement;
  onClose: () => void;
  onShare: (title: string, url: string) => void;
}) {
  const renderTypeIcon = (type: string) => {
    switch (type.toUpperCase()) {
      case 'URGENT':
        return <AlertCircle size={13} style={{ color: DISC }} />;
      case 'PLATFORM':
        return <Wrench size={13} style={{ color: SKY }} />;
      case 'MILESTONE':
        return <Trophy size={13} style={{ color: LEAF }} />;
      default:
        return <Megaphone size={13} style={{ color: MARIGOLD }} />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.75)' }} onClick={e => e.target === e.currentTarget && onClose()}>
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-lg rounded-lg overflow-hidden shadow-2xl" style={{ background: INK2, border: `1px solid ${ann.color_hex}44` }}>
        
        <div className="p-5 flex items-center justify-between" style={{ background: `${ann.color_hex}15`, borderBottom: `1px solid ${LINE}` }}>
          <span className="font-mono text-xs font-semibold px-2.5 py-1 rounded-full inline-flex items-center gap-1.5"
            style={{ color: ann.color_hex, background: `${ann.color_hex}22`, border: `1px solid ${ann.color_hex}44` }}>
            {renderTypeIcon(ann.type)}
            {ann.type.toUpperCase()} ANNOUNCEMENT
          </span>
          <button onClick={onClose}><X size={18} style={{ color: MUTED }} /></button>
        </div>

        <div className="p-6 space-y-4">
          <h3 className="font-fraunces text-xl font-semibold leading-tight" style={{ color: PAPER }}>
            {ann.title}
          </h3>
          <p className="text-xs font-mono flex items-center gap-1" style={{ color: MUTED }}>
            <Clock size={11} /> Posted {timeAgo(ann.created_at)}
          </p>
          <div className="p-4 rounded text-sm leading-relaxed" style={{ background: INK3, color: PAPER, border: `1px solid ${LINE}` }}>
            {ann.body}
          </div>
        </div>

        <div className="px-6 py-4 flex items-center justify-between" style={{ borderTop: `1px solid ${LINE}`, background: INK2 }}>
          <button onClick={() => onShare(ann.title, window.location.href)}
            className="text-xs px-3 py-1.5 rounded font-mono inline-flex items-center gap-1.5"
            style={{ border: `1px solid ${LINE}`, color: MUTED }}>
            <Share2 size={12} /> Share Broadcast
          </button>
          <button onClick={onClose} className="px-4 py-1.5 rounded text-xs font-semibold" style={{ background: SKY, color: PAPER }}>
            Got It
          </button>
        </div>
      </motion.div>
    </div>
  );
}

/* ── Main Community component ─────────────────────────────────────────────── */
export default function Community() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabId>('blogs');

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [blogCategory, setBlogCategory] = useState<string>('All');
  const [storyCause, setStoryCause] = useState<string>('All');
  const [forumCategory, setForumCategory] = useState<string>('All');
  const [announcementType, setAnnouncementType] = useState<string>('All');

  // Data state
  const [stats, setStats] = useState<CommunityStats | null>(null);
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [stories, setStories] = useState<VolunteerStory[]>([]);
  const [threads, setThreads] = useState<ForumThread[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);

  // Loading / error
  const [loading, setLoading] = useState<Record<TabId | 'stats', boolean>>({
    blogs: false, stories: false, forum: false, announcements: false, stats: false,
  });
  const [errors, setErrors] = useState<Record<TabId | 'stats', string | null>>({
    blogs: null, stories: null, forum: null, announcements: null, stats: null,
  });

  // Liked IDs (optimistic)
  const [likedBlogs, setLikedBlogs] = useState<Set<number>>(new Set());
  const [likedStories, setLikedStories] = useState<Set<number>>(new Set());
  const [likedThreads, setLikedThreads] = useState<Set<number>>(new Set());

  // Modals & Panels
  const [selectedBlog, setSelectedBlog] = useState<BlogPost | null>(null);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<Announcement | null>(null);
  const [showCreateBlogModal, setShowCreateBlogModal] = useState(false);
  const [showStoryModal, setShowStoryModal] = useState(false);
  const [showThreadModal, setShowThreadModal] = useState(false);
  const [openThread, setOpenThread] = useState<ForumThread | null>(null);

  // Toast feedback state
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleShare = (title: string, url: string) => {
    if (navigator.share && /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
      // Use native sharing on mobile devices
      navigator.share({
        title: `ShebaBD Community: ${title}`,
        text: `Check out this post on ShebaBD Community`,
        url: url,
      }).catch(() => {
        // Fallback to clipboard if native sharing fails
        if (navigator.clipboard) {
          navigator.clipboard.writeText(url);
          triggerToast(`Link copied for "${title.slice(0, 24)}..."!`);
        } else {
          triggerToast('Sharing link prepared.');
        }
      });
    } else if (navigator.clipboard) {
      // Use clipboard API for desktop
      navigator.clipboard.writeText(url);
      triggerToast(`Link copied for "${title.slice(0, 24)}..."!`);
    } else {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = url;
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand('copy');
        triggerToast(`Link copied for "${title.slice(0, 24)}..."!`);
      } catch (err) {
        triggerToast('Unable to copy link.');
      }
      document.body.removeChild(textArea);
    }
  };

  const setLoad = (key: TabId | 'stats', val: boolean) =>
    setLoading(p => ({ ...p, [key]: val }));
  const setErr = (key: TabId | 'stats', val: string | null) =>
    setErrors(p => ({ ...p, [key]: val }));

  // Load stats once
  useEffect(() => {
    setLoad('stats', true);
    communityApi.getStats()
      .then(setStats)
      .catch(() => setErr('stats', 'Could not load stats'))
      .finally(() => setLoad('stats', false));
  }, []);

  // Load tab data on switch
  const loadTab = useCallback(async (tab: TabId) => {
    if (tab === 'blogs' && blogs.length === 0) {
      setLoad('blogs', true); setErr('blogs', null);
      try { setBlogs(await communityApi.getBlogs({ limit: 50 })); }
      catch { setErr('blogs', 'Could not load blogs'); }
      finally { setLoad('blogs', false); }
    }
    if (tab === 'stories' && stories.length === 0) {
      setLoad('stories', true); setErr('stories', null);
      try { setStories(await communityApi.getStories({ limit: 50 })); }
      catch { setErr('stories', 'Could not load stories'); }
      finally { setLoad('stories', false); }
    }
    if (tab === 'forum' && threads.length === 0) {
      setLoad('forum', true); setErr('forum', null);
      try { setThreads(await communityApi.getThreads({ limit: 50 })); }
      catch { setErr('forum', 'Could not load forum threads'); }
      finally { setLoad('forum', false); }
    }
    if (tab === 'announcements' && announcements.length === 0) {
      setLoad('announcements', true); setErr('announcements', null);
      try { setAnnouncements(await communityApi.getAnnouncements()); }
      catch { setErr('announcements', 'Could not load announcements'); }
      finally { setLoad('announcements', false); }
    }
  }, [blogs.length, stories.length, threads.length, announcements.length]);

  useEffect(() => { loadTab(activeTab); }, [activeTab, loadTab]);

  // Like Handlers
  const handleLikeBlog = async (id: number) => {
    if (!user) {
      triggerToast('Please sign in to like blog posts');
      return;
    }
    const wasLiked = likedBlogs.has(id);
    setLikedBlogs(p => { const n = new Set(p); wasLiked ? n.delete(id) : n.add(id); return n; });
    setBlogs(p => p.map(b => b.id === id ? { ...b, likes_count: b.likes_count + (wasLiked ? -1 : 1) } : b));
    if (selectedBlog?.id === id) {
      setSelectedBlog(prev => prev ? { ...prev, likes_count: prev.likes_count + (wasLiked ? -1 : 1) } : prev);
    }
    try { await communityApi.likeBlog(id); }
    catch {
      setLikedBlogs(p => { const n = new Set(p); wasLiked ? n.add(id) : n.delete(id); return n; });
      setBlogs(p => p.map(b => b.id === id ? { ...b, likes_count: b.likes_count + (wasLiked ? 1 : -1) } : b));
    }
  };

  const handleLikeStory = async (id: number) => {
    if (!user) {
      triggerToast('Please sign in to like stories');
      return;
    }
    const wasLiked = likedStories.has(id);
    setLikedStories(p => { const n = new Set(p); wasLiked ? n.delete(id) : n.add(id); return n; });
    setStories(p => p.map(s => s.id === id ? { ...s, likes_count: s.likes_count + (wasLiked ? -1 : 1) } : s));
    try { await communityApi.likeStory(id); }
    catch {
      setLikedStories(p => { const n = new Set(p); wasLiked ? n.add(id) : n.delete(id); return n; });
      setStories(p => p.map(s => s.id === id ? { ...s, likes_count: s.likes_count + (wasLiked ? 1 : -1) } : s));
    }
  };

  const handleLikeThread = async (id: number) => {
    if (!user) {
      triggerToast('Please sign in to like forum threads');
      return;
    }
    const wasLiked = likedThreads.has(id);
    setLikedThreads(p => { const n = new Set(p); wasLiked ? n.delete(id) : n.add(id); return n; });
    setThreads(p => p.map(t => t.id === id ? { ...t, likes_count: t.likes_count + (wasLiked ? -1 : 1) } : t));
    try { await communityApi.likeThread(id); }
    catch {
      setLikedThreads(p => { const n = new Set(p); wasLiked ? n.add(id) : n.delete(id); return n; });
      setThreads(p => p.map(t => t.id === id ? { ...t, likes_count: t.likes_count + (wasLiked ? 1 : -1) } : t));
    }
  };

  // Submit Handlers
  const handleCreateBlog = async (data: Parameters<typeof communityApi.createBlog>[0]) => {
    try {
      const blog = await communityApi.createBlog(data);
      setBlogs(p => [blog, ...p.filter(b => b.id !== blog.id)]);
      triggerToast('Blog article published successfully!');
    } catch (error) {
      triggerToast('Failed to publish blog article. Please try again.');
      console.error('Create blog error:', error);
      throw error; // Re-throw to let the modal handle it
    }
  };

  const handleSubmitStory = async (data: Parameters<typeof communityApi.createStory>[0]) => {
    try {
      const story = await communityApi.createStory(data);
      setStories(p => [story, ...p.filter(s => s.id !== story.id)]);
      triggerToast('Thank you! Your story has been shared.');
    } catch (error) {
      triggerToast('Failed to submit story. Please try again.');
      console.error('Submit story error:', error);
      throw error;
    }
  };

  const handleCreateThread = async (data: Parameters<typeof communityApi.createThread>[0]) => {
    try {
      const thread = await communityApi.createThread(data);
      setThreads(p => [thread, ...p.filter(t => t.id !== thread.id)]);
      triggerToast('Discussion topic created!');
    } catch (error) {
      triggerToast('Failed to create discussion. Please try again.');
      console.error('Create thread error:', error);
      throw error;
    }
  };

  // Delete Handlers
  const handleDeleteBlog = async (id: number, title: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (!window.confirm(`Are you sure you want to delete the blog article "${title}"?`)) return;
    try {
      await communityApi.deleteBlog(id);
      setBlogs(p => p.filter(b => b.id !== id));
      if (selectedBlog?.id === id) setSelectedBlog(null);
      triggerToast('Blog article deleted.');
    } catch (error) {
      triggerToast('Failed to delete blog article. Please try again.');
      console.error('Delete blog error:', error);
    }
  };

  const handleDeleteStory = async (id: number, name: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (!window.confirm(`Are you sure you want to delete ${name}'s volunteer story?`)) return;
    try {
      await communityApi.deleteStory(id);
      setStories(p => p.filter(s => s.id !== id));
      triggerToast('Volunteer story deleted.');
    } catch (error) {
      triggerToast('Failed to delete story. Please try again.');
      console.error('Delete story error:', error);
    }
  };

  const handleDeleteThread = async (id: number, title: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (!window.confirm(`Are you sure you want to delete the discussion topic "${title}"?`)) return;
    try {
      await communityApi.deleteThread(id);
      setThreads(p => p.filter(t => t.id !== id));
      if (openThread?.id === id) setOpenThread(null);
      triggerToast('Discussion thread deleted.');
    } catch (error) {
      triggerToast('Failed to delete thread. Please try again.');
      console.error('Delete thread error:', error);
    }
  };

  const handleOpenThread = async (thread: ForumThread) => {
    try {
      const full = await communityApi.getThread(thread.id);
      setOpenThread(full);
    } catch {
      setOpenThread(thread);
    }
  };

  const handleReply = async (threadId: number, body: string) => {
    try {
      const reply = await communityApi.replyToThread(threadId, { body });
      setOpenThread(prev => prev ? { ...prev, replies: [...(prev.replies || []), reply], replies_count: (prev.replies_count || 0) + 1 } : prev);
      setThreads(p => p.map(t => t.id === threadId ? { ...t, replies_count: t.replies_count + 1 } : t));
      triggerToast('Reply posted!');
    } catch (error) {
      triggerToast('Failed to post reply. Please try again.');
      console.error('Reply error:', error);
    }
  };

  // Filtering Logic
  const filteredBlogs = useMemo(() => {
    return blogs.filter(b => {
      const matchesCat = blogCategory === 'All' || b.category.toLowerCase() === blogCategory.toLowerCase();
      const matchesSearch = !searchQuery.trim() ||
        b.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.author_name.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCat && matchesSearch;
    });
  }, [blogs, blogCategory, searchQuery]);

  const filteredStories = useMemo(() => {
    return stories.filter(s => {
      const matchesCause = storyCause === 'All' || s.cause.toLowerCase() === storyCause.toLowerCase();
      const matchesSearch = !searchQuery.trim() ||
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.story.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.role.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCause && matchesSearch;
    });
  }, [stories, storyCause, searchQuery]);

  const filteredThreads = useMemo(() => {
    return threads.filter(t => {
      const matchesCat = forumCategory === 'All' || t.category.toLowerCase() === forumCategory.toLowerCase();
      const matchesSearch = !searchQuery.trim() ||
        t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.body.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.author_name.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCat && matchesSearch;
    });
  }, [threads, forumCategory, searchQuery]);

  const filteredAnnouncements = useMemo(() => {
    return announcements.filter(a => {
      const matchesType = announcementType === 'All' || a.type.toUpperCase() === announcementType.toUpperCase();
      const matchesSearch = !searchQuery.trim() ||
        a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.body.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesType && matchesSearch;
    });
  }, [announcements, announcementType, searchQuery]);

  const TABS: { id: TabId; label: string; icon: React.ReactNode; color: string }[] = [
    { id: 'blogs',         label: 'Awareness Blogs',   icon: <BookOpen size={13} />,      color: SKY },
    { id: 'stories',       label: 'Volunteer Stories', icon: <Heart size={13} />,          color: DISC },
    { id: 'forum',         label: 'Discussion Forum',  icon: <MessageSquare size={13} />,  color: MARIGOLD },
    { id: 'announcements', label: 'Announcements',     icon: <Megaphone size={13} />,      color: LEAF },
  ];

  return (
    <div style={{ background: INK, color: PAPER, minHeight: '100vh', overflowX: 'hidden' }}>

      {/* ══ TOAST FEEDBACK ════════════════════════════════════════════════ */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div initial={{ opacity: 0, y: 50, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-6 right-6 z-50 px-4 py-3 rounded-lg shadow-xl flex items-center gap-2 font-mono text-xs"
            style={{ background: INK3, border: `1px solid ${MARIGOLD}`, color: PAPER }}>
            <Check size={14} style={{ color: MARIGOLD }} />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ══ HERO ═══════════════════════════════════════════════════════════ */}
      <section className="relative" style={{ padding: '80px 32px 64px', overflow: 'hidden' }}>
        <div className="pointer-events-none absolute rounded-full"
          style={{ top: -160, right: -180, width: 520, height: 520, background: 'radial-gradient(circle, rgba(62,122,140,0.12), transparent 70%)' }} />
        <div className="mx-auto" style={{ maxWidth: 1180 }}>
          <Reveal><div className="mb-4"><Eyebrow label="Community · Blogs · Stories · Forum" color={SKY} /></div></Reveal>
          <Reveal delay={70}>
            <h1 className="font-fraunces mb-4" style={{ fontSize: 'clamp(34px,4.5vw,56px)', lineHeight: 1.05, fontWeight: 600 }}>
              The ShebaBD<br /><span style={{ color: SKY }}>Community</span>
            </h1>
          </Reveal>
          <Reveal delay={140}>
            <p style={{ color: MUTED, fontSize: 15, lineHeight: 1.75, maxWidth: 540 }}>
              Awareness blogs, volunteer stories, community discussions, and platform announcements —
              the living pulse of Bangladesh's social impact ecosystem.
            </p>
          </Reveal>
        </div>
      </section>

      {/* ══ ULTRA-PROFESSIONAL STATS ════════════════════════════════════════ */}
      <section style={{ borderTop: `1px solid ${LINE}`, borderBottom: `1px solid ${LINE}`, background: INK2 }}>
        <div className="mx-auto" style={{ maxWidth: 1180 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)' }}>
            {[
              { key: 'blog_count',       label: 'Blog Articles',     sub: 'published publications', icon: BookOpen,      color: SKY },
              { key: 'story_count',      label: 'Volunteer Stories', sub: 'shared by community',    icon: Heart,         color: DISC },
              { key: 'forum_post_count', label: 'Forum Posts',       sub: 'active discussions',     icon: MessageSquare, color: MARIGOLD },
              { key: 'member_count',     label: 'Community Members', sub: 'across Bangladesh',      icon: Users,         color: LEAF },
            ].map(({ key, label, sub, icon: Icon, color }, i) => (
              <Reveal key={key} delay={i * 60}
                style={{ padding: '28px 20px', borderRight: i < 3 ? `1px solid ${LINE}` : 'none', textAlign: 'center' }}>
                <div className="w-10 h-10 rounded-full mx-auto flex items-center justify-center mb-3 shadow-inner"
                  style={{ background: `${color}18`, border: `1px solid ${color}33` }}>
                  <Icon size={18} style={{ color }} />
                </div>
                <span className="block font-mono font-bold mb-1" style={{ fontSize: 'clamp(20px,2.2vw,30px)', color: PAPER }}>
                  {loading.stats ? '…' : stats ? (stats as any)[key]?.toLocaleString() ?? '—' : '—'}
                </span>
                <span className="block text-[13px] font-semibold mb-[2px]" style={{ color: PAPER }}>{label}</span>
                <span className="block font-mono text-[11px]" style={{ color: MUTED }}>{sub}</span>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ══ MAIN COMMUNITY PORTAL ══════════════════════════════════════════ */}
      <section className="px-6 pt-10 pb-20">
        <div className="mx-auto" style={{ maxWidth: 1180 }}>
          
          {/* TAB & SEARCH CONTROLS HEADER */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            {/* Tab navigation */}
            <Reveal>
              <div className="flex flex-wrap gap-1"
                style={{ background: INK2, border: `1px solid ${LINE}`, borderRadius: 6, padding: 4, width: 'fit-content' }}>
                {TABS.map(({ id, label, icon, color }) => {
                  const active = activeTab === id;
                  return (
                    <button key={id} onClick={() => { setActiveTab(id); setSearchQuery(''); }}
                      className="inline-flex items-center gap-2 px-4 py-2 text-[13px] font-medium rounded-sm"
                      style={{
                        background: active ? color : 'transparent',
                        color: active ? (color === MARIGOLD ? INK : PAPER) : MUTED,
                        border: 'none', cursor: 'pointer', transition: 'all 0.15s',
                      }}>
                      {icon} {label}
                    </button>
                  );
                })}
              </div>
            </Reveal>

            {/* Search Input Box */}
            <Reveal delay={50}>
              <div className="relative flex items-center min-w-[260px]">
                <Search size={14} className="absolute left-3" style={{ color: MUTED }} />
                <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                  placeholder={`Search ${activeTab}...`}
                  className="w-full pl-9 pr-8 py-2 rounded text-xs bg-transparent outline-none transition-all"
                  style={{ background: INK2, border: `1px solid ${LINE}`, color: PAPER }} />
                {searchQuery && (
                  <button onClick={() => setSearchQuery('')} className="absolute right-2.5">
                    <X size={12} style={{ color: MUTED }} />
                  </button>
                )}
              </div>
            </Reveal>
          </div>

          <AnimatePresence mode="wait">

            {/* ── BLOGS ──────────────────────────────────────────────────── */}
            {activeTab === 'blogs' && (
              <motion.div key="blogs" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
                
                {/* Category Pills & Admin Create CTA */}
                <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-xs font-mono mr-1" style={{ color: MUTED }}>Category:</span>
                    {['All', 'Awareness', 'Health', 'Environment', 'Education', 'Emergency'].map(cat => (
                      <button key={cat} onClick={() => setBlogCategory(cat)}
                        className="px-3 py-1 rounded-full text-xs font-mono transition-all"
                        style={{
                          background: blogCategory === cat ? SKY : INK2,
                          color: blogCategory === cat ? PAPER : MUTED,
                          border: `1px solid ${blogCategory === cat ? SKY : LINE}`,
                        }}>
                        {cat}
                      </button>
                    ))}
                  </div>

                  {user && (
                    <button onClick={() => setShowCreateBlogModal(true)}
                      className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded text-xs font-medium"
                      style={{ background: MARIGOLD, color: INK }}>
                      <PenTool size={13} /> Write Blog Article
                    </button>
                  )}
                </div>

                {loading.blogs && <Spinner />}
                {errors.blogs && <ErrorBanner message={errors.blogs} onRetry={() => { setBlogs([]); loadTab('blogs'); }} />}
                
                {!loading.blogs && !errors.blogs && (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(320px,1fr))', gap: 12 }}>
                    {filteredBlogs.map((blog, i) => (
                      <Reveal key={blog.id} delay={i * 40}>
                        <div
                          className="cursor-pointer group relative"
                          onClick={() => setSelectedBlog(blog)}
                          style={{ background: INK2, border: `1px solid ${LINE}`, borderRadius: 6, overflow: 'hidden', transition: 'all 0.2s' }}>
                          <div className="flex items-center justify-center relative overflow-hidden"
                            style={{ height: 120, background: `linear-gradient(135deg, ${blog.color_hex}18 0%, ${INK3} 100%)`, borderBottom: `1px solid ${LINE}` }}>
                            <span className="font-bold text-4xl tracking-widest transition-transform group-hover:scale-110"
                              style={{ color: `${blog.color_hex}55` }}>
                              {blog.image_initials}
                            </span>
                            <span className="absolute bottom-2 right-2 text-[10px] font-mono px-2 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                              style={{ background: 'rgba(0,0,0,0.6)', color: PAPER }}>
                              Click to read article →
                            </span>
                          </div>
                          <div style={{ padding: '18px 18px' }}>
                            <div className="flex items-center justify-between mb-3">
                              <span className="inline-flex items-center gap-1 font-mono text-[10px] px-2 py-[3px] rounded-full"
                                style={{ color: blog.color_hex, background: `${blog.color_hex}14`, border: `1px solid ${blog.color_hex}33` }}>
                                <Tag size={8} /> {blog.category}
                              </span>
                              <span className="font-mono text-[11px] flex items-center gap-1" style={{ color: MUTED }}>
                                <Clock size={9} /> {blog.read_time}
                              </span>
                            </div>
                            <h3 className="font-semibold mb-2 group-hover:text-amber-300 transition-colors"
                              style={{ fontSize: 15, color: PAPER, lineHeight: 1.35 }}>
                              {blog.title}
                            </h3>
                            <p className="text-[13px] mb-4 line-clamp-2" style={{ color: MUTED, lineHeight: 1.6 }}>
                              {blog.excerpt}
                            </p>
                            <div className="flex items-center justify-between pt-2" style={{ borderTop: `1px solid ${LINE}` }}>
                              <div>
                                <p className="text-[12px] font-medium" style={{ color: PAPER }}>{blog.author_name}</p>
                                <p className="font-mono text-[10px]" style={{ color: MUTED }}>{blog.author_role} · {timeAgo(blog.created_at)}</p>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <button
                                  onClick={(e) => handleDeleteBlog(blog.id, blog.title, e)}
                                  title="Delete blog post"
                                  className="p-1.5 rounded transition-colors hover:bg-red-500/20"
                                  style={{ color: DISC }}>
                                  <Trash2 size={12} />
                                </button>
                                <button
                                  onClick={(e) => { e.stopPropagation(); handleLikeBlog(blog.id); }}
                                  title={user ? 'Like article' : 'Sign in to like'}
                                  className="inline-flex items-center gap-1 font-mono text-[12px] px-2.5 py-[5px] rounded-sm transition-all"
                                  style={{
                                    border: `1px solid ${likedBlogs.has(blog.id) ? DISC : LINE}`,
                                    color: likedBlogs.has(blog.id) ? DISC : MUTED,
                                    background: 'transparent', cursor: user ? 'pointer' : 'default',
                                  }}>
                                  <Heart size={11} fill={likedBlogs.has(blog.id) ? DISC : 'none'} />
                                  {blog.likes_count}
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </Reveal>
                    ))}
                    {filteredBlogs.length === 0 && (
                      <p className="col-span-full text-center py-12 text-sm" style={{ color: MUTED }}>
                        No blog posts match your category or search filter.
                      </p>
                    )}
                  </div>
                )}
              </motion.div>
            )}

            {/* ── VOLUNTEER STORIES ──────────────────────────────────────── */}
            {activeTab === 'stories' && (
              <motion.div key="stories" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
                
                {/* Cause Filters & Share CTA */}
                <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-xs font-mono mr-1" style={{ color: MUTED }}>Cause:</span>
                    {['All', 'Blood Donation', 'Disaster Relief', 'Education', 'Environment', 'Healthcare', 'Volunteering'].map(cause => (
                      <button key={cause} onClick={() => setStoryCause(cause)}
                        className="px-3 py-1 rounded-full text-xs font-mono transition-all"
                        style={{
                          background: storyCause === cause ? DISC : INK2,
                          color: storyCause === cause ? PAPER : MUTED,
                          border: `1px solid ${storyCause === cause ? DISC : LINE}`,
                        }}>
                        {cause}
                      </button>
                    ))}
                  </div>

                  {user && (
                    <button onClick={() => setShowStoryModal(true)}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-sm text-sm font-medium"
                      style={{ background: MARIGOLD, color: INK }}>
                      <Plus size={14} /> Share Your Story
                    </button>
                  )}
                </div>

                {loading.stories && <Spinner />}
                {errors.stories && <ErrorBanner message={errors.stories} onRetry={() => { setStories([]); loadTab('stories'); }} />}
                
                {!loading.stories && !errors.stories && (
                  <>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(320px,1fr))', gap: 12 }}>
                      {filteredStories.map((s, i) => (
                        <Reveal key={s.id} delay={i * 50}>
                          <div style={{ background: INK2, border: `1px solid ${LINE}`, borderRadius: 6, padding: '22px 20px', transition: 'border-color 0.2s' }}
                            onMouseEnter={e => (e.currentTarget.style.borderColor = s.color_hex + '55')}
                            onMouseLeave={e => (e.currentTarget.style.borderColor = LINE)}>
                            <div className="flex items-center justify-between mb-4">
                              <div className="flex items-center gap-3">
                                <div className="flex items-center justify-center rounded-full font-bold text-base shrink-0"
                                  style={{ width: 44, height: 44, background: `${s.color_hex}18`, border: `2px solid ${s.color_hex}55`, color: s.color_hex }}>
                                  {s.avatar_initials}
                                </div>
                                <div>
                                  <p className="font-semibold text-[14px]" style={{ color: PAPER }}>{s.name}</p>
                                  <p className="font-mono text-[11px]" style={{ color: MUTED }}>{s.role}</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-1">
                                <button onClick={(e) => handleDeleteStory(s.id, s.name, e)}
                                  className="p-1.5 rounded transition-colors hover:bg-red-500/20" title="Delete story" style={{ color: DISC }}>
                                  <Trash2 size={13} />
                                </button>
                                <button onClick={() => handleShare(s.name + "'s Story", window.location.href)}
                                  className="p-1.5 rounded transition-colors" title="Share story" style={{ color: MUTED }}>
                                  <Share2 size={13} />
                                </button>
                              </div>
                            </div>
                            <blockquote className="text-[13px] mb-4"
                              style={{ color: MUTED, lineHeight: 1.7, fontStyle: 'italic', borderLeft: `3px solid ${s.color_hex}`, paddingLeft: 12 }}>
                              "{s.story}"
                            </blockquote>
                            <div className="flex items-center gap-3 pt-3 flex-wrap" style={{ borderTop: `1px solid ${LINE}` }}>
                              <span className="font-mono text-[11px] px-2 py-[3px] rounded-full"
                                style={{ color: s.color_hex, background: `${s.color_hex}14`, border: `1px solid ${s.color_hex}33` }}>
                                {s.cause}
                              </span>
                              {s.blood_donations > 0 && (
                                <span className="font-mono text-[11px] inline-flex items-center gap-1" style={{ color: MUTED }}>
                                  <Droplets size={11} style={{ color: DISC }} /> {s.blood_donations} donations
                                </span>
                              )}
                              {s.volunteer_hours > 0 && (
                                <span className="font-mono text-[11px] inline-flex items-center gap-1" style={{ color: MUTED }}>
                                  <Clock size={11} style={{ color: MARIGOLD }} /> {s.volunteer_hours} hrs
                                </span>
                              )}
                              <button onClick={() => handleLikeStory(s.id)}
                                title={user ? 'Like' : 'Sign in to like'}
                                className="ml-auto inline-flex items-center gap-1 font-mono text-[12px] px-2.5 py-[4px] rounded-sm transition-all"
                                style={{
                                  border: `1px solid ${likedStories.has(s.id) ? DISC : LINE}`,
                                  color: likedStories.has(s.id) ? DISC : MUTED,
                                  background: 'transparent', cursor: user ? 'pointer' : 'default',
                                }}>
                                <Heart size={11} fill={likedStories.has(s.id) ? DISC : 'none'} />
                                {s.likes_count}
                              </button>
                            </div>
                          </div>
                        </Reveal>
                      ))}
                    </div>
                    {filteredStories.length === 0 && (
                      <div className="flex flex-col items-center py-16 rounded text-center"
                        style={{ background: INK2, border: `1px dashed ${LINE}` }}>
                        <Star size={30} style={{ color: MARIGOLD, opacity: 0.35, marginBottom: 12 }} />
                        <p className="font-semibold text-lg mb-2" style={{ color: PAPER }}>No stories found</p>
                        <p className="text-sm mb-6" style={{ color: MUTED }}>Be the first to share your volunteer experience for this cause.</p>
                        {user ? (
                          <button onClick={() => setShowStoryModal(true)}
                            className="inline-flex items-center gap-2 px-5 py-3 rounded-sm font-semibold text-sm"
                            style={{ background: MARIGOLD, color: INK }}>
                            <Sparkles size={14} /> Share My Story <ArrowRight size={13} />
                          </button>
                        ) : (
                          <Link to={ROUTES.SIGN_IN}
                            className="inline-flex items-center gap-2 px-5 py-3 rounded-sm font-semibold text-sm"
                            style={{ background: MARIGOLD, color: INK }}>
                            Sign In to Share <ArrowRight size={13} />
                          </Link>
                        )}
                      </div>
                    )}
                  </>
                )}
              </motion.div>
            )}

            {/* ── FORUM ──────────────────────────────────────────────────── */}
            {activeTab === 'forum' && (
              <motion.div key="forum" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
                
                {/* Category & Action row */}
                <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-xs font-mono mr-1" style={{ color: MUTED }}>Category:</span>
                    {['All', 'NGOs', 'Emergency', 'Volunteers', 'Technology', 'Donations', 'Stories', 'General'].map(cat => (
                      <button key={cat} onClick={() => setForumCategory(cat)}
                        className="px-3 py-1 rounded-full text-xs font-mono transition-all"
                        style={{
                          background: forumCategory === cat ? MARIGOLD : INK2,
                          color: forumCategory === cat ? INK : MUTED,
                          border: `1px solid ${forumCategory === cat ? MARIGOLD : LINE}`,
                        }}>
                        {cat}
                      </button>
                    ))}
                  </div>

                  {user ? (
                    <button onClick={() => setShowThreadModal(true)}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-sm text-sm font-medium"
                      style={{ background: SKY, color: PAPER }}>
                      <Plus size={14} /> New Discussion
                    </button>
                  ) : (
                    <Link to={ROUTES.SIGN_IN}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-sm text-sm font-medium"
                      style={{ border: `1px solid ${LINE}`, color: MUTED }}>
                      Sign in to post
                    </Link>
                  )}
                </div>

                {loading.forum && <Spinner />}
                {errors.forum && <ErrorBanner message={errors.forum} onRetry={() => { setThreads([]); loadTab('forum'); }} />}
                
                {!loading.forum && !errors.forum && (
                  <div style={{ background: INK2, border: `1px solid ${LINE}`, borderRadius: 6 }}>
                    {filteredThreads.map((thread, i) => (
                      <motion.div key={thread.id}
                        initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.25, delay: i * 0.05 }}
                        className="flex items-start gap-4 px-5 py-4 cursor-pointer"
                        style={{ borderBottom: i < filteredThreads.length - 1 ? `1px solid ${LINE}` : 'none', transition: 'background 0.15s' }}
                        onClick={() => handleOpenThread(thread)}
                        onMouseEnter={e => (e.currentTarget.style.background = INK3)}
                        onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                        {thread.is_pinned
                          ? <Pin size={13} style={{ color: MARIGOLD, marginTop: 3, flexShrink: 0 }} />
                          : <MessageSquare size={13} style={{ color: MUTED, marginTop: 3, flexShrink: 0 }} />}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-3 mb-1">
                            <p className="font-semibold text-[14px]" style={{ color: PAPER, lineHeight: 1.3 }}>{thread.title}</p>
                            <span className="font-mono text-[10px] px-2 py-[2px] rounded-full shrink-0"
                              style={{ color: thread.color_hex, background: `${thread.color_hex}14`, border: `1px solid ${thread.color_hex}33` }}>
                              {thread.category}
                            </span>
                          </div>
                          <div className="flex items-center gap-4 flex-wrap">
                            <span className="font-mono text-[11px]" style={{ color: MUTED }}>@{thread.author_name}</span>
                            <span className="font-mono text-[11px] flex items-center gap-1" style={{ color: MUTED }}>
                              <Clock size={9} /> {timeAgo(thread.created_at)}
                            </span>
                            <span className="font-mono text-[11px] flex items-center gap-1" style={{ color: MUTED }}>
                              <MessageSquare size={9} /> {thread.replies_count}
                            </span>
                            <button
                              onClick={e => { e.stopPropagation(); handleLikeThread(thread.id); }}
                              className="font-mono text-[11px] flex items-center gap-1 transition-colors"
                              style={{ color: likedThreads.has(thread.id) ? DISC : MUTED, background: 'none', border: 'none', cursor: user ? 'pointer' : 'default' }}>
                              <ThumbsUp size={9} /> {thread.likes_count}
                            </button>
                            <button
                              onClick={e => handleDeleteThread(thread.id, thread.title, e)}
                              className="font-mono text-[11px] flex items-center gap-1 transition-colors hover:text-red-400 ml-auto"
                              style={{ color: DISC, background: 'none', border: 'none' }}>
                              <Trash2 size={10} /> Delete
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                    {filteredThreads.length === 0 && (
                      <p className="text-center py-12 text-sm" style={{ color: MUTED }}>No discussions match your filter. Start one!</p>
                    )}
                  </div>
                )}
              </motion.div>
            )}

            {/* ── ANNOUNCEMENTS ──────────────────────────────────────────── */}
            {activeTab === 'announcements' && (
              <motion.div key="announcements" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
                
                {/* Announcement Type Filters */}
                <div className="flex items-center gap-1.5 flex-wrap mb-6">
                  <span className="text-xs font-mono mr-1" style={{ color: MUTED }}>Type:</span>
                  {['All', 'URGENT', 'PLATFORM', 'MILESTONE', 'CAMPAIGN'].map(type => (
                    <button key={type} onClick={() => setAnnouncementType(type)}
                      className="px-3 py-1 rounded-full text-xs font-mono transition-all"
                      style={{
                        background: announcementType === type ? LEAF : INK2,
                        color: announcementType === type ? PAPER : MUTED,
                        border: `1px solid ${announcementType === type ? LEAF : LINE}`,
                      }}>
                      {type}
                    </button>
                  ))}
                </div>

                {loading.announcements && <Spinner />}
                {errors.announcements && <ErrorBanner message={errors.announcements} onRetry={() => { setAnnouncements([]); loadTab('announcements'); }} />}
                
                {!loading.announcements && !errors.announcements && (
                  <div className="space-y-4">
                    {filteredAnnouncements.map((ann, i) => {
                      const renderIcon = (t: string) => {
                        switch (t.toUpperCase()) {
                          case 'URGENT': return <AlertCircle size={11} style={{ color: DISC }} />;
                          case 'PLATFORM': return <Wrench size={11} style={{ color: SKY }} />;
                          case 'MILESTONE': return <Trophy size={11} style={{ color: LEAF }} />;
                          default: return <Megaphone size={11} style={{ color: MARIGOLD }} />;
                        }
                      };

                      return (
                        <Reveal key={ann.id} delay={i * 50}>
                          <div
                            className="cursor-pointer group"
                            onClick={() => setSelectedAnnouncement(ann)}
                            style={{ background: INK2, border: `1px solid ${ann.color_hex}44`, borderRadius: 6, borderLeft: `4px solid ${ann.color_hex}` }}>
                            <div style={{ padding: '16px 20px', borderBottom: `1px solid ${LINE}`, background: `${ann.color_hex}08` }}>
                              <div className="flex items-center justify-between gap-3 flex-wrap mb-2">
                                <span className="font-mono text-[10px] font-semibold px-2.5 py-[3px] rounded-full inline-flex items-center gap-1.5"
                                  style={{ color: ann.color_hex, background: `${ann.color_hex}18`, border: `1px solid ${ann.color_hex}33` }}>
                                  {renderIcon(ann.type)}
                                  {ann.type.toUpperCase()}
                                </span>
                                <span className="font-mono text-[11px] flex items-center gap-1" style={{ color: MUTED }}>
                                  <Clock size={9} /> {timeAgo(ann.created_at)}
                                </span>
                              </div>
                              <h3 className="font-semibold text-[16px] group-hover:text-amber-300 transition-colors" style={{ color: PAPER, lineHeight: 1.3 }}>
                                {ann.title}
                              </h3>
                            </div>
                            <div style={{ padding: '14px 20px' }}>
                              <p className="text-[14px] line-clamp-3" style={{ color: MUTED, lineHeight: 1.7 }}>{ann.body}</p>
                              <span className="inline-block mt-3 text-xs font-mono" style={{ color: SKY }}>
                                Click to view full broadcast →
                              </span>
                            </div>
                          </div>
                        </Reveal>
                      );
                    })}
                    {filteredAnnouncements.length === 0 && (
                      <p className="text-center py-12 text-sm" style={{ color: MUTED }}>No announcements match your search.</p>
                    )}
                  </div>
                )}
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </section>

      {/* ══ CTA ════════════════════════════════════════════════════════════ */}
      <section className="px-6 py-20" style={{ background: INK2, borderTop: `1px solid ${LINE}` }}>
        <div className="mx-auto text-center" style={{ maxWidth: 580 }}>
          <Reveal>
            <h2 className="font-fraunces mb-4" style={{ fontSize: 'clamp(24px,3vw,36px)', fontWeight: 600 }}>
              Be part of the movement
            </h2>
            <p style={{ color: MUTED, fontSize: 15, lineHeight: 1.7, marginBottom: 28 }}>
              ShebaBD's community grows every day — volunteers, donors, NGOs, and citizens
              working together to build a better Bangladesh.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link to={ROUTES.VOLUNTEERS}
                className="inline-flex items-center gap-2 px-6 py-3 font-semibold text-sm rounded-sm"
                style={{ background: SKY, color: PAPER }}>
                <Users size={14} /> Join as Volunteer
              </Link>
              <Link to={ROUTES.ORGANIZATIONS}
                className="inline-flex items-center gap-2 px-6 py-3 font-semibold text-sm rounded-sm"
                style={{ border: `1px solid ${LINE}`, color: PAPER }}>
                Browse NGOs <ChevronRight size={14} />
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ══ MODALS ═════════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {selectedBlog && (
          <BlogDetailModal
            blog={selectedBlog}
            onClose={() => setSelectedBlog(null)}
            onLike={handleLikeBlog}
            isLiked={likedBlogs.has(selectedBlog.id)}
            onShare={handleShare}
            onDelete={handleDeleteBlog}
          />
        )}
        {showCreateBlogModal && (
          <CreateBlogModal
            onClose={() => setShowCreateBlogModal(false)}
            onSubmit={handleCreateBlog}
          />
        )}
        {showStoryModal && (
          <StoryModal onClose={() => setShowStoryModal(false)} onSubmit={handleSubmitStory} />
        )}
        {showThreadModal && (
          <ThreadModal onClose={() => setShowThreadModal(false)} onSubmit={handleCreateThread} />
        )}
        {openThread && (
          <ThreadDetail
            thread={openThread}
            onClose={() => setOpenThread(null)}
            onReply={handleReply}
            onShare={handleShare}
            onDelete={handleDeleteThread}
          />
        )}
        {selectedAnnouncement && (
          <AnnouncementDetailModal
            ann={selectedAnnouncement}
            onClose={() => setSelectedAnnouncement(null)}
            onShare={handleShare}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
/* Murad: Community features */ 
// Murad: Thread modal

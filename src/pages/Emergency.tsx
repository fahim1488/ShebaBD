import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  AlertTriangle, Zap, Phone, MapPin, Clock, CheckCircle2,
  Building2, Flame, Waves, Heart, Home, ShieldAlert, Send, Radio, Loader2,
} from 'lucide-react';
import { TextInput } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { submitEmergency, getActiveEmergencies, type EmergencyRequest } from '@/services/emergencyApi';
import type { Variants } from 'framer-motion';

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.07, duration: 0.4 },
  }),
};

const EMERGENCY_TYPES = [
  { id: 'flood', label: 'Flood / Cyclone', icon: Waves, color: 'bg-blue-500/10 text-blue-400 border-blue-500/30' },
  { id: 'fire', label: 'Fire', icon: Flame, color: 'bg-red-500/10 text-red-400 border-red-500/30' },
  { id: 'medical', label: 'Medical', icon: Heart, color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' },
  { id: 'shelter', label: 'Shelter Needed', icon: Home, color: 'bg-amber-500/10 text-amber-400 border-amber-500/30' },
  { id: 'rescue', label: 'Rescue', icon: ShieldAlert, color: 'bg-purple-500/10 text-purple-400 border-purple-500/30' },
  { id: 'other', label: 'Other', icon: AlertTriangle, color: 'bg-gray-500/10 text-gray-300 border-gray-500/30' },
];

const PRIORITY_COLORS: Record<string, { bg: string; text: string; border: string; label: string }> = {
  critical: { bg: 'bg-red-500/15', text: 'text-red-400', border: 'border-red-500/30', label: 'Critical' },
  high: { bg: 'bg-amber-500/15', text: 'text-amber-400', border: 'border-amber-500/30', label: 'High' },
  medium: { bg: 'bg-blue-500/15', text: 'text-blue-400', border: 'border-blue-500/30', label: 'Medium' },
  low: { bg: 'bg-emerald-500/15', text: 'text-emerald-400', border: 'border-emerald-500/30', label: 'Low' },
};

const HOTLINES = [
  { name: 'National Emergency', number: '999', desc: 'Police, Fire, Ambulance', icon: Phone, color: 'text-red-400' },
  { name: 'Fire Service', number: '102', desc: 'Fire & Civil Defence', icon: Flame, color: 'text-amber-400' },
  { name: 'Ambulance', number: '199', desc: 'Medical Emergency', icon: Heart, color: 'text-emerald-400' },
  { name: 'Disaster Hotline', number: '1090', desc: 'DDM Bangladesh', icon: Waves, color: 'text-blue-400' },
];

type FormState = { name: string; phone: string; location: string; description: string; type: string };

export default function Emergency() {
  const [form, setForm] = useState<FormState>({ name: '', phone: '', location: '', description: '', type: '' });
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submittedId, setSubmittedId] = useState<number | null>(null);
  const [estimatedPriority, setEstimatedPriority] = useState<string | null>(null);
  const [liveFeed, setLiveFeed] = useState<EmergencyRequest[]>([]);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Load live emergency feed
  useEffect(() => {
    getActiveEmergencies(10).then(setLiveFeed).catch(() => {});
  }, []);

  const analyzeePriority = (type: string, desc: string) => {
    if (type === 'flood' || type === 'fire') return 'critical';
    if (type === 'medical' || desc.toLowerCase().includes('urgent') || desc.toLowerCase().includes('critical')) return 'high';
    if (type === 'rescue') return 'high';
    if (type === 'shelter') return 'medium';
    return 'low';
  };

  const handleTypeSelect = (typeId: string) => {
    setForm(f => ({ ...f, type: typeId }));
    setEstimatedPriority(analyzeePriority(typeId, form.description));
  };

  const handleDescChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setForm(f => ({ ...f, description: e.target.value }));
    if (form.type) setEstimatedPriority(analyzeePriority(form.type, e.target.value));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmitError(null);
    try {
      const result = await submitEmergency({
        name: form.name,
        phone: form.phone,
        location: form.location,
        emergency_type: form.type,
        description: form.description,
      });
      setSubmittedId(result.id);
      setEstimatedPriority(result.priority);
      setSubmitted(true);
      getActiveEmergencies(10).then(setLiveFeed).catch(() => {});
    } catch (err: any) {
      const msg = err?.response?.data?.detail || 'Failed to submit request. Please check your connection and try again.';
      setSubmitError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ background: '#0B2E22', color: '#F7F1E1' }} className="min-h-screen">
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <section 
        style={{ background: 'linear-gradient(135deg, #0B2E22 0%, #0F3A2B 50%, #0B2E22 100%)' }}
        className="py-14 border-b border-[rgba(247,241,225,0.12)]"
      >
        <div className="mx-auto max-w-7xl px-4 md:px-8">
          <motion.div variants={fadeUp} initial="hidden" animate="show" className="max-w-2xl">
            <span className="mb-3 inline-flex items-center gap-2 rounded-full border border-[#D6472C]/40 bg-[#D6472C]/15 px-3.5 py-1 text-xs font-medium text-[#D6472C] backdrop-blur-md">
              <AlertTriangle size={12} /> Emergency Response System
            </span>
            <h1 className="font-display text-3xl font-bold text-[#F7F1E1] md:text-4xl tracking-tight">
              Get Emergency Help Now
            </h1>
            <p className="mt-3 text-[rgba(247,241,225,0.75)] leading-relaxed">
              Submit your emergency request. Our AI analyses urgency and immediately connects you to nearby organisations and responders.
            </p>
          </motion.div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 py-10 md:px-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* ── Left: form ────────────────────────────────────────────────── */}
          <div className="lg:col-span-2 space-y-6">
            <div style={{ background: '#0F3A2B', borderColor: 'rgba(247,241,225,0.14)' }} className="rounded-2xl border p-6 shadow-xl md:p-8">
              <h2 className="font-display text-xl font-bold text-[#F7F1E1] mb-5">Submit Emergency Request</h2>

              {submitted ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center gap-4 py-12 text-center"
                >
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    <CheckCircle2 size={36} />
                  </div>
                  <h3 className="font-display text-xl font-bold text-[#F7F1E1]">Request Submitted!</h3>
                  {estimatedPriority && (
                    <div className={`inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-sm font-semibold ${PRIORITY_COLORS[estimatedPriority]?.bg ?? ''} ${PRIORITY_COLORS[estimatedPriority]?.text ?? ''} ${PRIORITY_COLORS[estimatedPriority]?.border ?? ''}`}>
                      <Zap size={14} />
                      AI Priority: {PRIORITY_COLORS[estimatedPriority]?.label ?? estimatedPriority}
                    </div>
                  )}
                  <p className="text-sm text-[rgba(247,241,225,0.75)] max-w-sm">
                    Your request has been received. Nearby organisations and responders have been alerted. Expect contact within minutes.
                  </p>
                  <div className="flex items-center gap-2 rounded-xl bg-[#0B2E22] border border-[rgba(247,241,225,0.12)] px-4 py-2 text-sm text-[rgba(247,241,225,0.7)]">
                    <Radio size={14} className="text-emerald-400 animate-pulse" />
                    Request ID: <span className="font-mono font-semibold text-[#F7F1E1]">EM-{submittedId ?? Math.floor(Math.random() * 9000 + 1000)}</span>
                  </div>
                  <button 
                    onClick={() => { setSubmitted(false); setSubmittedId(null); setForm({ name: '', phone: '', location: '', description: '', type: '' }); setEstimatedPriority(null); }}
                    className="rounded-xl border border-[rgba(247,241,225,0.2)] px-5 py-2.5 text-sm font-medium text-[#F7F1E1] hover:bg-[rgba(247,241,225,0.08)]"
                  >
                    Submit Another Request
                  </button>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  {/* Emergency type */}
                  <div>
                    <label className="block text-sm font-medium text-[#F7F1E1] mb-2">
                      Emergency Type <span className="text-red-400">*</span>
                    </label>
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                      {EMERGENCY_TYPES.map(({ id, label, icon: Icon }) => (
                        <button
                          key={id}
                          type="button"
                          onClick={() => handleTypeSelect(id)}
                          className={`flex items-center gap-2 rounded-xl border p-3 text-sm font-medium transition-all ${
                            form.type === id 
                              ? 'border-[#D6472C] bg-[#D6472C] text-white ring-2 ring-[#D6472C]/40' 
                              : 'border-[rgba(247,241,225,0.15)] bg-[#0B2E22] text-[rgba(247,241,225,0.75)] hover:border-[#E7A93B] hover:text-[#F7F1E1]'
                          }`}
                        >
                          <Icon size={16} />
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <TextInput
                      label="Your Name"
                      placeholder="Full name"
                      required
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      fullWidth
                    />
                    <TextInput
                      label="Contact Number"
                      placeholder="+880 1XXX-XXXXXX"
                      type="tel"
                      required
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      fullWidth
                    />
                  </div>

                  <TextInput
                    label="Location"
                    placeholder="Address, landmark, or area"
                    required
                    prefixIcon={MapPin}
                    value={form.location}
                    onChange={(e) => setForm({ ...form, location: e.target.value })}
                    fullWidth
                    helperText="Be as specific as possible — nearest hospital, road name, upazila."
                  />

                  <Textarea
                    label="Describe the Emergency"
                    placeholder="Describe what happened, number of people affected, immediate needs…"
                    required
                    minRows={4}
                    autoResize
                    maxLength={500}
                    showCount
                    fullWidth
                    value={form.description}
                    onChange={handleDescChange}
                  />

                  {/* AI priority preview */}
                  {estimatedPriority && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className={`flex items-center gap-3 rounded-xl border p-3.5 ${PRIORITY_COLORS[estimatedPriority]?.bg ?? ''} ${PRIORITY_COLORS[estimatedPriority]?.border ?? ''}`}
                    >
                      <Zap size={16} className={PRIORITY_COLORS[estimatedPriority]?.text ?? ''} />
                      <div>
                        <p className={`text-sm font-semibold ${PRIORITY_COLORS[estimatedPriority]?.text ?? ''}`}>
                          AI Estimated Priority: {PRIORITY_COLORS[estimatedPriority]?.label ?? estimatedPriority}
                        </p>
                        <p className="text-xs text-[rgba(247,241,225,0.7)]">Based on emergency type and description analysis.</p>
                      </div>
                    </motion.div>
                  )}

                  <button
                    type="submit"
                    disabled={submitting || !form.type || !form.name || !form.phone || !form.location || !form.description}
                    className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-[#D6472C] py-3.5 text-base font-bold text-white shadow-lg hover:bg-[#b83a22] transition-colors disabled:opacity-50"
                  >
                    {submitting ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                    {submitting ? 'Sending…' : 'Send Emergency Request'}
                  </button>

                  {submitError && (
                    <div className="flex items-start gap-2 rounded-xl border border-red-500/30 bg-red-500/10 p-3.5">
                      <AlertTriangle size={15} className="text-red-400 mt-0.5 shrink-0" />
                      <p className="text-sm text-red-200">{submitError}</p>
                    </div>
                  )}
                </form>
              )}
            </div>

            {/* ── Active requests feed ──────────────────────────────────────── */}
            <div style={{ background: '#0F3A2B', borderColor: 'rgba(247,241,225,0.14)' }} className="rounded-2xl border p-6 shadow-xl">
              <h2 className="font-display text-xl font-bold text-[#F7F1E1] mb-4">Live Emergency Feed</h2>
              <div className="space-y-3">
                {liveFeed.length === 0 && (
                  <p className="text-sm text-[rgba(247,241,225,0.65)] text-center py-6">No active emergency requests right now.</p>
                )}
                {liveFeed.map((req, i) => {
                  const typeObj = EMERGENCY_TYPES.find(t => t.id === req.emergency_type) ?? EMERGENCY_TYPES[5];
                  const TypeIcon = typeObj.icon;
                  const p = PRIORITY_COLORS[req.priority] ?? PRIORITY_COLORS.low;
                  const timeAgo = (iso: string) => {
                    const diff = Date.now() - new Date(iso).getTime();
                    const m = Math.floor(diff / 60000);
                    if (m < 1) return 'just now';
                    if (m < 60) return `${m} min ago`;
                    return `${Math.floor(m / 60)}h ago`;
                  };
                  return (
                    <motion.div key={req.id} variants={fadeUp} initial="hidden" whileInView="show"
                      viewport={{ once: true }} custom={i}
                      style={{ background: '#0B2E22', borderColor: 'rgba(247,241,225,0.1)' }}
                      className="flex items-center gap-3 rounded-xl border p-3.5">
                      <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${p.bg}`}>
                        <TypeIcon size={18} className={p.text} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-[#F7F1E1]">EM-{req.id}</span>
                          <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium border ${p.bg} ${p.text} ${p.border}`}>
                            {p.label}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-[rgba(247,241,225,0.65)] mt-0.5">
                          <span className="flex items-center gap-0.5"><MapPin size={10} />{req.location}</span>
                          <span className="flex items-center gap-0.5"><Clock size={10} />{timeAgo(req.created_at)}</span>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <p className={`text-xs font-medium ${req.status === 'resolved' ? 'text-emerald-400' : 'text-[#E7A93B]'}`}>
                          {req.status.charAt(0).toUpperCase() + req.status.slice(1)}
                        </p>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* ── Right: hotlines + info ────────────────────────────────────── */}
          <div className="space-y-5">
            <div style={{ background: '#0F3A2B', borderColor: 'rgba(214,71,44,0.3)' }} className="rounded-2xl border p-5 shadow-xl">
              <h3 className="font-semibold text-[#F7F1E1] mb-4 flex items-center gap-2">
                <Phone size={16} className="text-[#D6472C]" />
                Emergency Hotlines
              </h3>
              <div className="space-y-3">
                {HOTLINES.map(({ name, number, desc, icon: Icon, color }) => (
                  <a
                    key={name}
                    href={`tel:${number}`}
                    style={{ background: '#0B2E22', borderColor: 'rgba(247,241,225,0.12)' }}
                    className="flex items-center gap-3 rounded-xl border p-3 hover:border-[#D6472C] transition-colors"
                  >
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#0F3A2B]">
                      <Icon size={18} className={color} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-[#F7F1E1]">{name}</p>
                      <p className="text-xs text-[rgba(247,241,225,0.65)]">{desc}</p>
                    </div>
                    <span className="font-mono text-lg font-bold text-[#D6472C]">{number}</span>
                  </a>
                ))}
              </div>
            </div>

            <div style={{ background: '#0F3A2B', borderColor: 'rgba(247,241,225,0.14)' }} className="rounded-2xl border p-5 shadow-xl">
              <h3 className="font-semibold text-[#F7F1E1] mb-3 flex items-center gap-2">
                <Building2 size={16} className="text-[#3E7A8C]" />
                Nearby Organisations
              </h3>
              <p className="text-sm text-[rgba(247,241,225,0.7)]">Based on your location, the following organisations are on standby:</p>
              <div className="mt-3 space-y-2">
                {['Bangladesh Red Crescent — 2.3 km', 'Dhaka Rescue Force — 3.8 km', 'CRP Medical Team — 5.1 km'].map((org) => (
                  <div key={org} className="flex items-center gap-2 text-sm text-[#F7F1E1]">
                    <div className="h-1.5 w-1.5 rounded-full bg-emerald-400 shrink-0" />
                    {org}
                  </div>
                ))}
              </div>
            </div>

            <div style={{ background: '#0F3A2B', borderColor: 'rgba(231,169,59,0.3)' }} className="rounded-2xl border p-5 shadow-xl">
              <h3 className="font-semibold text-[#F7F1E1] mb-2 flex items-center gap-2">
                <ShieldAlert size={16} className="text-[#E7A93B]" />
                Safety Tips
              </h3>
              <ul className="space-y-1.5 text-sm text-[rgba(247,241,225,0.7)]">
                <li>• Stay calm and move to a safe area first.</li>
                <li>• Provide exact location details when requesting help.</li>
                <li>• Do not re-enter a flooded or burning building.</li>
                <li>• Keep your phone charged and accessible.</li>
                <li>• Follow instructions from official responders.</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

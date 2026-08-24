import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Users, Star, MapPin, Award, Clock, Zap, ShieldCheck, Download,
  Search, UserPlus, BadgeCheck, Heart, BookOpen, Stethoscope, Code2, Megaphone, Truck, Loader2, AlertCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TextInput, PasswordInput } from '@/components/ui/input';
import { SearchInput } from '@/components/ui/input';
import { authApi } from '@/services/authApi';
import { ROUTES } from '@/constants/routes';
import type { Variants } from 'framer-motion';

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.07, duration: 0.4 },
  }),
};

const SKILLS = [
  { id: 'medical', label: 'Medical', icon: Stethoscope, color: 'bg-ds-success/10 text-ds-success' },
  { id: 'teaching', label: 'Teaching', icon: BookOpen, color: 'bg-ds-secondary/10 text-ds-secondary' },
  { id: 'tech', label: 'Tech & IT', icon: Code2, color: 'bg-purple-500/10 text-purple-500' },
  { id: 'rescue', label: 'Rescue & Relief', icon: Truck, color: 'bg-ds-warning/10 text-ds-warning' },
  { id: 'awareness', label: 'Awareness', icon: Megaphone, color: 'bg-ds-accent/10 text-ds-accent' },
  { id: 'donation', label: 'Blood Donation', icon: Heart, color: 'bg-red-500/10 text-red-500' },
];

const VOLUNTEERS = [
  { id: 1, name: 'Arif Hossain', skill: 'medical', district: 'Dhaka', hours: 320, badges: 8, rating: 4.9, available: true, joined: 'Jan 2023' },
  { id: 2, name: 'Sumaiya Islam', skill: 'teaching', district: 'Chittagong', hours: 210, badges: 5, rating: 4.8, available: true, joined: 'Mar 2023' },
  { id: 3, name: 'Raihan Ahmed', skill: 'tech', district: 'Sylhet', hours: 145, badges: 4, rating: 4.7, available: false, joined: 'Jun 2023' },
  { id: 4, name: 'Nasrin Begum', skill: 'rescue', district: 'Khulna', hours: 480, badges: 12, rating: 5.0, available: true, joined: 'Dec 2022' },
  { id: 5, name: 'Kabir Uddin', skill: 'awareness', district: 'Rajshahi', hours: 95, badges: 3, rating: 4.5, available: true, joined: 'Sep 2023' },
  { id: 6, name: 'Tamanna Khanam', skill: 'donation', district: 'Dhaka', hours: 60, badges: 2, rating: 4.6, available: false, joined: 'Nov 2023' },
];

const HOW_IT_WORKS = [
  { step: '01', title: 'Create Profile', desc: 'Sign up and build your volunteer profile with skills, interests, and availability.' },
  { step: '02', title: 'Get Matched', desc: 'Our AI matches you with the best opportunities based on your skills and location.' },
  { step: '03', title: 'Volunteer & Track', desc: 'Join events, track your hours, and collect digital certificates automatically.' },
  { step: '04', title: 'Earn Badges', desc: 'Level up with achievement badges and build your verified volunteer portfolio.' },
];

type RegistrationForm = {
  name: string;
  email: string;
  phone: string;
  district: string;
  password: string;
};

export default function Volunteers() {
  const navigate = useNavigate();
  const [activeSkill, setActiveSkill] = useState('all');
  const [selectedSkill, setSelectedSkill] = useState('');  // separate state for form
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<RegistrationForm>({ name: '', email: '', phone: '', district: '', password: '' });
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const filtered = VOLUNTEERS.filter((v) => {
    const matchSkill = activeSkill === 'all' || v.skill === activeSkill;
    const matchSearch = v.name.toLowerCase().includes(search.toLowerCase()) || v.district.toLowerCase().includes(search.toLowerCase());
    return matchSkill && matchSearch;
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setFormError(null);
    try {
      await authApi.register({
        name: form.name,
        email: form.email,
        password: form.password,
        role: 'volunteer',
      });
      setSubmitted(true);
    } catch (err: any) {
      const status = err?.response?.status;
      if (status === 409) {
        setFormError('An account with this email already exists. Try signing in.');
      } else {
        setFormError(err?.response?.data?.detail || 'Registration failed. Please try again.');
      }
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
            <span className="mb-3 inline-flex items-center gap-2 rounded-full border border-[#E7A93B]/30 bg-[#E7A93B]/10 px-3.5 py-1 text-xs font-medium text-[#E7A93B] backdrop-blur-md">
              <Users size={12} /> Volunteer Network
            </span>
            <h1 className="font-display text-3xl font-bold text-[#F7F1E1] md:text-4xl tracking-tight">
              Become a Change-Maker
            </h1>
            <p className="mt-3 text-[rgba(247,241,225,0.75)] leading-relaxed">
              Join 18,000+ volunteers making a real difference across Bangladesh.
              Register, get AI-matched, and start your journey today.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <button 
                onClick={() => setShowForm(true)}
                className="inline-flex items-center gap-2 rounded-xl bg-[#D6472C] px-5 py-2.5 text-sm font-semibold text-white shadow-lg hover:bg-[#b83a22] transition-colors"
              >
                <UserPlus size={16} /> Register as Volunteer
              </button>
              <button 
                onClick={() => setShowForm(false)}
                className="inline-flex items-center gap-2 rounded-xl border border-[rgba(247,241,225,0.2)] bg-transparent px-5 py-2.5 text-sm font-semibold text-[#F7F1E1] hover:bg-[rgba(247,241,225,0.08)] transition-colors"
              >
                <Search size={16} /> Browse Volunteers
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 py-10 md:px-8 space-y-14">
        {/* ── How it works ──────────────────────────────────────────────────── */}
        <section>
          <h2 className="font-display text-2xl font-bold text-[#F7F1E1] mb-6 tracking-tight">How It Works</h2>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {HOW_IT_WORKS.map(({ step, title, desc }, i) => (
              <motion.div
                key={step}
                variants={fadeUp}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true }}
                custom={i}
                style={{ background: '#0F3A2B', borderColor: 'rgba(247,241,225,0.14)' }}
                className="relative rounded-2xl border p-5 shadow-lg"
              >
                <span className="font-display text-4xl font-bold text-[#E7A93B]/25">{step}</span>
                <h3 className="mt-2 font-semibold text-[#F7F1E1]">{title}</h3>
                <p className="mt-1 text-sm text-[rgba(247,241,225,0.7)] leading-relaxed">{desc}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ── Registration form ─────────────────────────────────────────────── */}
        {showForm && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ background: '#0F3A2B', borderColor: 'rgba(247,241,225,0.14)' }}
            className="rounded-2xl border p-6 shadow-xl md:p-8"
          >
            <h2 className="font-display text-2xl font-bold text-[#F7F1E1] mb-1">Volunteer Registration</h2>
            <p className="text-sm text-[rgba(247,241,225,0.7)] mb-6">Fill in your details to join the ShebaBD volunteer network.</p>

            {submitted ? (
              <div className="flex flex-col items-center gap-3 py-12 text-center">
                <BadgeCheck size={56} className="text-emerald-400" />
                <h3 className="font-display text-xl font-bold text-[#F7F1E1]">Registration Successful!</h3>
                <p className="text-sm text-[rgba(247,241,225,0.7)] max-w-sm">
                  Welcome to ShebaBD! Our AI will match you with the best volunteer opportunities. Check your email to verify your account.
                </p>
                <button 
                  onClick={() => navigate(ROUTES.PROFILE)}
                  className="rounded-xl bg-[#D6472C] px-5 py-2.5 text-sm font-semibold text-white shadow hover:bg-[#b83a22]"
                >
                  Go to Profile
                </button>
              </div>
            ) : (
              <>
                {formError && (
                  <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-3.5 flex items-start gap-2 mb-4">
                    <AlertCircle size={16} className="text-red-400 mt-0.5 shrink-0" />
                    <p className="text-sm text-red-200 flex-1">{formError}</p>
                  </div>
                )}
                <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <TextInput
                  label="Full Name"
                  placeholder="Your full name"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  fullWidth
                />
                <TextInput
                  label="Email Address"
                  placeholder="you@example.com"
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  fullWidth
                />
                <TextInput
                  label="Phone Number"
                  placeholder="+880 1XXX-XXXXXX"
                  type="tel"
                  required
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  fullWidth
                />
                <div className="flex flex-col gap-1">
                  <label className="block text-sm font-medium text-[#F7F1E1] leading-none mb-1.5">
                    District <span className="text-red-400 ml-0.5">*</span>
                  </label>
                  <select
                    required
                    value={form.district}
                    onChange={(e) => setForm({ ...form, district: e.target.value })}
                    className="h-10 rounded-xl border border-[rgba(247,241,225,0.2)] bg-[#0B2E22] px-3 text-sm text-[#F7F1E1] focus:outline-none focus:ring-2 focus:ring-[#E7A93B]"
                  >
                    <option value="" className="bg-[#0B2E22]">Select district</option>
                    {['Dhaka', 'Chittagong', 'Sylhet', 'Rajshahi', 'Khulna', 'Barisal', 'Mymensingh', 'Rangpur'].map((d) => (
                      <option key={d} className="bg-[#0B2E22]">{d}</option>
                    ))}
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-[#F7F1E1] leading-none mb-2">
                    Skills & Interests
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {SKILLS.map(({ id, label, icon: Icon }) => (
                      <button
                        key={id}
                        type="button"
                        className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                          selectedSkill === id
                            ? 'border-[#D6472C] bg-[#D6472C] text-white'
                            : 'border-[rgba(247,241,225,0.18)] bg-[#0B2E22] text-[rgba(247,241,225,0.7)] hover:border-[#E7A93B] hover:text-[#E7A93B]'
                        }`}
                        onClick={() => setSelectedSkill(id)}
                      >
                        <Icon size={12} />
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="sm:col-span-2">
                  <PasswordInput
                    label="Password"
                    placeholder="Create a strong password"
                    required
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    helperText="At least 8 characters."
                    fullWidth
                  />
                </div>
                <div className="sm:col-span-2 flex gap-3">
                  <button 
                    type="submit" 
                    disabled={submitting}
                    className="inline-flex items-center gap-2 rounded-xl bg-[#D6472C] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#b83a22] disabled:opacity-50"
                  >
                    {submitting ? <Loader2 size={16} className="animate-spin" /> : <UserPlus size={16} />}
                    {submitting ? 'Creating Account…' : 'Complete Registration'}
                  </button>
                  <button 
                    type="button" 
                    onClick={() => { setShowForm(false); setFormError(null); }} 
                    disabled={submitting}
                    className="rounded-xl border border-[rgba(247,241,225,0.2)] px-5 py-2.5 text-sm font-medium text-[rgba(247,241,225,0.7)] hover:bg-[rgba(247,241,225,0.08)]"
                  >
                    Cancel
                  </button>
                </div>
              </form>
              </>
            )}
          </motion.section>
        )}

        {/* ── Volunteer directory ───────────────────────────────────────────── */}
        <section>
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="font-display text-2xl font-bold text-[#F7F1E1] tracking-tight">Volunteer Directory</h2>
            <SearchInput
              placeholder="Search volunteers…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onClear={() => setSearch('')}
            />
          </div>

          {/* Skill filter */}
          <div className="mb-5 flex flex-wrap gap-2">
            <button
              onClick={() => setActiveSkill('all')}
              className={`rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors ${
                activeSkill === 'all' 
                  ? 'border-[#D6472C] bg-[#D6472C] text-white' 
                  : 'border-[rgba(247,241,225,0.18)] bg-[#0F3A2B] text-[rgba(247,241,225,0.7)] hover:border-[#E7A93B] hover:text-[#E7A93B]'
              }`}
            >
              All Skills
            </button>
            {SKILLS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveSkill(id)}
                className={`inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors ${
                  activeSkill === id 
                    ? 'border-[#D6472C] bg-[#D6472C] text-white' 
                    : 'border-[rgba(247,241,225,0.18)] bg-[#0F3A2B] text-[rgba(247,241,225,0.7)] hover:border-[#E7A93B] hover:text-[#E7A93B]'
                }`}
              >
                <Icon size={13} />
                {label}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((v, i) => (
              <motion.div
                key={v.id}
                variants={fadeUp}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true }}
                custom={i}
                style={{ background: '#0F3A2B', borderColor: 'rgba(247,241,225,0.14)' }}
                className="flex flex-col gap-4 rounded-2xl border p-5 shadow-lg hover:border-[rgba(231,169,59,0.3)] transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#E7A93B]/15 border border-[#E7A93B]/30 text-sm font-bold text-[#E7A93B]">
                    {v.name.split(' ').map((n) => n[0]).join('')}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="font-semibold text-[#F7F1E1] truncate">{v.name}</span>
                      <ShieldCheck size={14} className="shrink-0 text-[#E7A93B]" />
                    </div>
                    <div className="flex items-center gap-1 text-xs text-[rgba(247,241,225,0.65)]">
                      <MapPin size={11} />
                      {v.district}
                    </div>
                  </div>
                  <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium border ${v.available ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-white/5 text-white/50 border-white/10'}`}>
                    {v.available ? 'Available' : 'Busy'}
                  </span>
                </div>

                <div style={{ background: 'rgba(11,46,34,0.6)', borderColor: 'rgba(247,241,225,0.1)' }} className="grid grid-cols-3 gap-2 rounded-xl border p-3 text-center text-xs">
                  <div>
                    <p className="font-bold text-[#F7F1E1] text-base">{v.hours}</p>
                    <p className="text-[rgba(247,241,225,0.6)] flex items-center justify-center gap-0.5"><Clock size={10} />hrs</p>
                  </div>
                  <div>
                    <p className="font-bold text-[#F7F1E1] text-base">{v.badges}</p>
                    <p className="text-[rgba(247,241,225,0.6)] flex items-center justify-center gap-0.5"><Award size={10} />badges</p>
                  </div>
                  <div>
                    <p className="font-bold text-[#F7F1E1] text-base">{v.rating}</p>
                    <p className="text-[rgba(247,241,225,0.6)] flex items-center justify-center gap-0.5"><Star size={10} />rating</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1 rounded-full border border-[#3E7A8C]/30 bg-[#3E7A8C]/15 px-2.5 py-1 text-xs font-medium text-[#3E7A8C]">
                    {(() => {
                      const sk = SKILLS.find((s) => s.id === v.skill);
                      const Icon = sk?.icon;
                      return Icon ? <Icon size={11} /> : null;
                    })()}
                    {SKILLS.find((s) => s.id === v.skill)?.label}
                  </span>
                  <span className="ml-auto text-xs text-[rgba(247,241,225,0.6)] flex items-center gap-1">
                    <Zap size={11} className="text-[#E7A93B]" />
                    Since {v.joined}
                  </span>
                </div>

                <button className="w-full inline-flex items-center justify-center gap-2 rounded-xl border border-[rgba(247,241,225,0.18)] bg-transparent py-2 text-xs font-semibold text-[#F7F1E1] hover:bg-[rgba(247,241,225,0.08)] transition-colors">
                  <Download size={13} /> View Portfolio
                </button>
              </motion.div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
/* Fahim: Auth improvements */ 

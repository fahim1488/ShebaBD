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
    <div className="min-h-screen bg-ds-background">
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <section className="bg-gradient-to-br from-ds-secondary/5 via-ds-background to-ds-primary/5 py-14">
        <div className="mx-auto max-w-7xl px-4 md:px-8">
          <motion.div variants={fadeUp} initial="hidden" animate="show" className="max-w-2xl">
            <span className="mb-3 inline-flex items-center gap-2 rounded-ds-full border border-ds-secondary/20 bg-ds-secondary/10 px-3 py-1 text-xs font-medium text-ds-secondary">
              <Users size={12} /> Volunteer Network
            </span>
            <h1 className="font-display text-3xl font-bold text-ds-foreground md:text-4xl">
              Become a Change-Maker
            </h1>
            <p className="mt-3 text-ds-muted">
              Join 18,000+ volunteers making a real difference across Bangladesh.
              Register, get AI-matched, and start your journey today.
            </p>
            <div className="mt-5 flex gap-3">
              <Button leftIcon={UserPlus} onClick={() => setShowForm(true)}>
                Register as Volunteer
              </Button>
              <Button variant="outline" leftIcon={Search} onClick={() => setShowForm(false)}>
                Browse Volunteers
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 py-10 md:px-8 space-y-14">
        {/* ── How it works ──────────────────────────────────────────────────── */}
        <section>
          <h2 className="font-display text-2xl font-bold text-ds-foreground mb-6">How It Works</h2>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {HOW_IT_WORKS.map(({ step, title, desc }, i) => (
              <motion.div
                key={step}
                variants={fadeUp}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true }}
                custom={i}
                className="relative rounded-ds-xl border border-ds-muted/10 bg-ds-surface p-5 shadow-ds-sm"
              >
                <span className="font-display text-4xl font-bold text-ds-primary/15">{step}</span>
                <h3 className="mt-2 font-semibold text-ds-foreground">{title}</h3>
                <p className="mt-1 text-sm text-ds-muted leading-relaxed">{desc}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ── Registration form ─────────────────────────────────────────────── */}
        {showForm && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-ds-xl border border-ds-muted/10 bg-ds-surface p-6 shadow-ds-sm md:p-8"
          >
            <h2 className="font-display text-2xl font-bold text-ds-foreground mb-1">Volunteer Registration</h2>
            <p className="text-sm text-ds-muted mb-6">Fill in your details to join the ShebaBD volunteer network.</p>

            {submitted ? (
              <div className="flex flex-col items-center gap-3 py-12 text-center">
                <BadgeCheck size={56} className="text-ds-success" />
                <h3 className="font-display text-xl font-bold text-ds-foreground">Registration Successful!</h3>
                <p className="text-sm text-ds-muted max-w-sm">
                  Welcome to ShebaBD! Our AI will match you with the best volunteer opportunities. Check your email to verify your account.
                </p>
                <Button onClick={() => navigate(ROUTES.PROFILE)}>Go to Profile</Button>
              </div>
            ) : (
              <>
                {formError && (
                  <div className="rounded-ds-lg border border-ds-danger/30 bg-ds-danger/5 p-3 flex items-start gap-2 mb-4">
                    <AlertCircle size={16} className="text-ds-danger mt-0.5 shrink-0" />
                    <p className="text-sm text-ds-danger flex-1">{formError}</p>
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
                  <label className="block text-sm font-medium text-ds-foreground leading-none mb-1.5">
                    District <span className="text-ds-danger ml-0.5">*</span>
                  </label>
                  <select
                    required
                    value={form.district}
                    onChange={(e) => setForm({ ...form, district: e.target.value })}
                    className="h-10 rounded-ds-md border border-ds-muted/30 bg-ds-surface px-3 text-sm text-ds-foreground focus:outline-none focus:ring-2 focus:ring-ds-primary"
                  >
                    <option value="">Select district</option>
                    {['Dhaka', 'Chittagong', 'Sylhet', 'Rajshahi', 'Khulna', 'Barisal', 'Mymensingh', 'Rangpur'].map((d) => (
                      <option key={d}>{d}</option>
                    ))}
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-ds-foreground leading-none mb-2">
                    Skills & Interests
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {SKILLS.map(({ id, label, icon: Icon }) => (
                      <button
                        key={id}
                        type="button"
                        className={`inline-flex items-center gap-1.5 rounded-ds-full border px-3 py-1.5 text-xs font-medium transition-colors duration-ds-fast ${
                          activeSkill === id
                            ? 'border-ds-primary bg-ds-primary text-white'
                            : 'border-ds-muted/20 bg-ds-background text-ds-muted hover:border-ds-primary/40 hover:text-ds-primary'
                        }`}
                        onClick={() => setActiveSkill(id)}
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
                  <Button type="submit" leftIcon={submitting ? Loader2 : UserPlus} disabled={submitting}>
                    {submitting ? 'Creating Account…' : 'Complete Registration'}
                  </Button>
                  <Button type="button" variant="ghost" onClick={() => { setShowForm(false); setFormError(null); }} disabled={submitting}>
                    Cancel
                  </Button>
                </div>
              </form>
                </>
              
                </>
              
            )}
          </motion.section>
        )}

        {/* ── Volunteer directory ───────────────────────────────────────────── */}
        <section>
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="font-display text-2xl font-bold text-ds-foreground">Volunteer Directory</h2>
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
              className={`rounded-ds-full border px-3 py-1.5 text-sm font-medium transition-colors duration-ds-fast ${activeSkill === 'all' ? 'border-ds-primary bg-ds-primary text-white' : 'border-ds-muted/20 bg-ds-surface text-ds-muted hover:border-ds-primary/40 hover:text-ds-primary'}`}
            >
              All Skills
            </button>
            {SKILLS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveSkill(id)}
                className={`inline-flex items-center gap-1.5 rounded-ds-full border px-3 py-1.5 text-sm font-medium transition-colors duration-ds-fast ${activeSkill === id ? 'border-ds-primary bg-ds-primary text-white' : 'border-ds-muted/20 bg-ds-surface text-ds-muted hover:border-ds-primary/40 hover:text-ds-primary'}`}
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
                className="flex flex-col gap-4 rounded-ds-xl border border-ds-muted/10 bg-ds-surface p-5 shadow-ds-sm hover:shadow-ds-md transition-all duration-ds-normal"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-ds-full bg-ds-primary/10 text-sm font-bold text-ds-primary">
                    {v.name.split(' ').map((n) => n[0]).join('')}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="font-semibold text-ds-foreground truncate">{v.name}</span>
                      <ShieldCheck size={14} className="shrink-0 text-ds-primary" />
                    </div>
                    <div className="flex items-center gap-1 text-xs text-ds-muted">
                      <MapPin size={11} />
                      {v.district}
                    </div>
                  </div>
                  <span className={`shrink-0 rounded-ds-full px-2 py-0.5 text-xs font-medium ${v.available ? 'bg-ds-success/10 text-ds-success' : 'bg-ds-muted/10 text-ds-muted'}`}>
                    {v.available ? 'Available' : 'Busy'}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 rounded-ds-lg bg-ds-background p-3 text-center text-xs">
                  <div>
                    <p className="font-bold text-ds-foreground text-base">{v.hours}</p>
                    <p className="text-ds-muted flex items-center justify-center gap-0.5"><Clock size={10} />hrs</p>
                  </div>
                  <div>
                    <p className="font-bold text-ds-foreground text-base">{v.badges}</p>
                    <p className="text-ds-muted flex items-center justify-center gap-0.5"><Award size={10} />badges</p>
                  </div>
                  <div>
                    <p className="font-bold text-ds-foreground text-base">{v.rating}</p>
                    <p className="text-ds-muted flex items-center justify-center gap-0.5"><Star size={10} />rating</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`inline-flex items-center gap-1 rounded-ds-full px-2.5 py-1 text-xs font-medium ${SKILLS.find((s) => s.id === v.skill)?.color ?? 'bg-ds-muted/10 text-ds-muted'}`}>
                    {(() => {
                      const sk = SKILLS.find((s) => s.id === v.skill);
                      const Icon = sk?.icon;
                      return Icon ? <Icon size={11} /> : null;
                    })()}
                    {SKILLS.find((s) => s.id === v.skill)?.label}
                  </span>
                  <span className="ml-auto text-xs text-ds-muted flex items-center gap-1">
                    <Zap size={11} className="text-ds-warning" />
                    Since {v.joined}
                  </span>
                </div>

                <Button variant="outline" size="sm" fullWidth leftIcon={Download}>
                  View Portfolio
                </Button>
              </motion.div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
/* Fahim: Auth improvements */ 

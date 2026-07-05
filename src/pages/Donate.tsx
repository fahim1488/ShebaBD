import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  HandHeart,
  Heart,
  Users,
  BookOpen,
  Stethoscope,
  Home,
  Leaf,
  CheckCircle2,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TextInput } from '@/components/ui/input';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.07, duration: 0.4, ease: [0.4, 0, 0.2, 1] },
  }),
};

const CAUSES = [
  { id: 'education', label: 'Education', icon: BookOpen, color: 'bg-ds-secondary/10 text-ds-secondary border-ds-secondary/20', raised: 1240000, goal: 2000000 },
  { id: 'healthcare', label: 'Healthcare', icon: Stethoscope, color: 'bg-ds-success/10 text-ds-success border-ds-success/20', raised: 890000, goal: 1500000 },
  { id: 'disaster', label: 'Disaster Relief', icon: Home, color: 'bg-ds-warning/10 text-ds-warning border-ds-warning/20', raised: 3200000, goal: 5000000 },
  { id: 'environment', label: 'Environment', icon: Leaf, color: 'bg-green-600/10 text-green-600 border-green-600/20', raised: 450000, goal: 1000000 },
  { id: 'poverty', label: 'Poverty Relief', icon: Users, color: 'bg-ds-primary/10 text-ds-primary border-ds-primary/20', raised: 2100000, goal: 4000000 },
];

const PRESET_AMOUNTS = [100, 250, 500, 1000, 2500, 5000];

const IMPACT_MAP: Record<number, string> = {
  100: 'Provides 3 meals for a flood-affected family.',
  250: 'Buys school supplies for one child for a month.',
  500: 'Covers basic healthcare for a rural family.',
  1000: 'Funds one week of disaster relief operations.',
  2500: 'Provides vocational training for one person.',
  5000: 'Sponsors a month of free education for 10 children.',
};

type DonateForm = { name: string; email: string; phone: string; amount: string; cause: string; message: string };

export default function Donate() {
  const [form, setForm] = useState<DonateForm>({ name: '', email: '', phone: '', amount: '', cause: '', message: '' });
  const [customAmount, setCustomAmount] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const selectedAmount = parseInt(form.amount) || 0;
  const impact = IMPACT_MAP[selectedAmount] ?? (selectedAmount > 0 ? `Your ৳${selectedAmount} donation will make a meaningful impact.` : null);

  const handleAmountSelect = (amt: number) => {
    setForm((f) => ({ ...f, amount: String(amt) }));
    setCustomAmount(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  const totalRaised = CAUSES.reduce((s, c) => s + c.raised, 0);

  return (
    <div className="min-h-screen bg-ds-background">
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <section className="bg-gradient-to-br from-ds-primary/5 via-ds-background to-ds-warning/5 py-14">
        <div className="mx-auto max-w-7xl px-4 md:px-8">
          <motion.div variants={fadeUp} initial="hidden" animate="show" className="max-w-2xl">
            <span className="mb-3 inline-flex items-center gap-2 rounded-ds-full border border-ds-primary/20 bg-ds-primary/10 px-3 py-1 text-xs font-medium text-ds-primary">
              <HandHeart size={12} /> Donation Platform
            </span>
            <h1 className="font-display text-3xl font-bold text-ds-foreground md:text-4xl">
              Give the Gift of Change
            </h1>
            <p className="mt-3 text-ds-muted">
              100% of your donation reaches verified organisations. Full transparency, AI-powered impact tracking.
            </p>
            <div className="mt-5 flex items-center gap-3 text-sm text-ds-muted">
              <span className="flex items-center gap-1.5"><ShieldCheck size={14} className="text-ds-primary" />Secure Payment</span>
              <span className="flex items-center gap-1.5"><Zap size={14} className="text-ds-warning" />AI Impact Tracking</span>
              <span className="flex items-center gap-1.5"><Heart size={14} className="text-ds-danger" />Verified Orgs Only</span>
            </div>
          </motion.div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 py-10 md:px-8">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-3">
          {/* ── Causes ───────────────────────────────────────────────────────── */}
          <div className="lg:col-span-1 space-y-5">
            <div className="rounded-ds-xl border border-ds-muted/10 bg-ds-surface p-5 shadow-ds-sm">
              <h2 className="font-display text-lg font-bold text-ds-foreground mb-1">Total Raised</h2>
              <p className="font-display text-3xl font-bold text-ds-primary">৳{(totalRaised / 100000).toFixed(1)}L</p>
              <p className="text-xs text-ds-muted mt-1">Across all active causes</p>
            </div>

            <div className="rounded-ds-xl border border-ds-muted/10 bg-ds-surface p-5 shadow-ds-sm space-y-4">
              <h2 className="font-display text-lg font-bold text-ds-foreground">Active Causes</h2>
              {CAUSES.map(({ id, label, icon: Icon, color, raised, goal }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, cause: id }))}
                  className={`w-full rounded-ds-lg border p-3 text-left transition-all duration-ds-fast ${form.cause === id ? color + ' ring-2 ring-current ring-offset-1' : 'border-ds-muted/10 bg-ds-background hover:border-ds-muted/30'}`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Icon size={15} />
                    <span className="text-sm font-medium">{label}</span>
                    <span className="ml-auto text-xs opacity-70">{Math.round((raised / goal) * 100)}%</span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-ds-muted/20 overflow-hidden">
                    <div className="h-full rounded-full bg-current" style={{ width: `${(raised / goal) * 100}%` }} />
                  </div>
                  <p className="mt-1.5 text-xs opacity-60">৳{(raised / 1000).toFixed(0)}k of ৳{(goal / 1000).toFixed(0)}k goal</p>
                </button>
              ))}
            </div>
          </div>

          {/* ── Donation form ─────────────────────────────────────────────── */}
          <div className="lg:col-span-2">
            <div className="rounded-ds-xl border border-ds-muted/10 bg-ds-surface p-6 shadow-ds-sm md:p-8">
              <h2 className="font-display text-2xl font-bold text-ds-foreground mb-5">Make a Donation</h2>

              {submitted ? (
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center gap-4 py-12 text-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-ds-full bg-ds-success/10 text-ds-success">
                    <CheckCircle2 size={36} />
                  </div>
                  <h3 className="font-display text-xl font-bold text-ds-foreground">Thank You!</h3>
                  <p className="font-display text-2xl font-bold text-ds-primary">৳{form.amount} Donated</p>
                  {impact && <p className="text-sm text-ds-muted max-w-sm">{impact}</p>}
                  <p className="text-xs text-ds-muted">A receipt has been sent to {form.email}</p>
                  <Button variant="outline" onClick={() => { setSubmitted(false); setForm({ name: '', email: '', phone: '', amount: '', cause: '', message: '' }); }}>
                    Donate Again
                  </Button>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Amount selection */}
                  <div>
                    <label className="block text-sm font-medium text-ds-foreground mb-2">Donation Amount (৳) <span className="text-ds-danger">*</span></label>
                    <div className="grid grid-cols-3 gap-2 mb-3">
                      {PRESET_AMOUNTS.map((amt) => (
                        <button
                          key={amt}
                          type="button"
                          onClick={() => handleAmountSelect(amt)}
                          className={`rounded-ds-md border py-2.5 text-sm font-semibold transition-colors duration-ds-fast ${form.amount === String(amt) && !customAmount ? 'border-ds-primary bg-ds-primary text-white' : 'border-ds-muted/20 bg-ds-background text-ds-foreground hover:border-ds-primary/40'}`}
                        >
                          ৳{amt}
                        </button>
                      ))}
                    </div>
                    <button
                      type="button"
                      onClick={() => { setCustomAmount(true); setForm((f) => ({ ...f, amount: '' })); }}
                      className={`w-full rounded-ds-md border py-2 text-sm font-medium transition-colors duration-ds-fast ${customAmount ? 'border-ds-primary text-ds-primary' : 'border-ds-muted/20 text-ds-muted hover:border-ds-primary/40'}`}
                    >
                      Enter custom amount
                    </button>
                    {customAmount && (
                      <TextInput
                        className="mt-2"
                        placeholder="Enter amount in ৳"
                        type="number"
                        required
                        fullWidth
                        value={form.amount}
                        onChange={(e) => setForm({ ...form, amount: e.target.value })}
                      />
                    )}
                  </div>

                  {/* AI impact preview */}
                  {impact && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="flex items-start gap-3 rounded-ds-lg bg-ds-primary/5 border border-ds-primary/20 p-3">
                      <Zap size={16} className="text-ds-primary mt-0.5 shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-ds-primary">AI Impact Estimate</p>
                        <p className="text-xs text-ds-muted mt-0.5">{impact}</p>
                      </div>
                    </motion.div>
                  )}

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <TextInput label="Full Name" placeholder="Your full name" required fullWidth value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                    <TextInput label="Email Address" placeholder="you@example.com" type="email" required fullWidth value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                  </div>
                  <TextInput label="Phone (optional)" placeholder="+880 1XXX-XXXXXX" type="tel" fullWidth value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />

                  <Button
                    type="submit"
                    size="lg"
                    fullWidth
                    leftIcon={HandHeart}
                    disabled={!form.name || !form.email || !form.amount || !form.cause}
                  >
                    Donate ৳{form.amount || '0'} Now
                  </Button>

                  <p className="text-xs text-center text-ds-muted">
                    <ShieldCheck size={11} className="inline mr-1 text-ds-primary" />
                    Your donation is secure and 100% reaches verified organisations.
                  </p>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

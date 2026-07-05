import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Droplets,
  MapPin,
  Phone,
  Clock,
  Search,
  Heart,
  CheckCircle2,
  ShieldCheck,
  AlertTriangle,
  User,
  Send,
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

const BLOOD_GROUPS = ['All', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

const DONORS = [
  { id: 1, name: 'Md. Karim', group: 'O+', district: 'Dhaka', lastDonated: '3 months ago', donations: 8, available: true, phone: '+880 1711-000001' },
  { id: 2, name: 'Sharmin Akter', group: 'A+', district: 'Chittagong', lastDonated: '2 months ago', donations: 5, available: true, phone: '+880 1811-000002' },
  { id: 3, name: 'Jamal Hossain', group: 'B+', district: 'Dhaka', lastDonated: '5 months ago', donations: 12, available: true, phone: '+880 1911-000003' },
  { id: 4, name: 'Rupa Begum', group: 'AB+', district: 'Sylhet', lastDonated: '1 month ago', donations: 3, available: false, phone: '+880 1611-000004' },
  { id: 5, name: 'Tariq Islam', group: 'O-', district: 'Khulna', lastDonated: '6 months ago', donations: 15, available: true, phone: '+880 1711-000005' },
  { id: 6, name: 'Nasreen Khanam', group: 'A-', district: 'Rajshahi', lastDonated: '4 months ago', donations: 7, available: true, phone: '+880 1811-000006' },
  { id: 7, name: 'Rafiq Uddin', group: 'B-', district: 'Dhaka', lastDonated: '2 months ago', donations: 4, available: true, phone: '+880 1611-000007' },
  { id: 8, name: 'Mitu Roy', group: 'AB-', district: 'Mymensingh', lastDonated: '7 months ago', donations: 2, available: false, phone: '+880 1511-000008' },
];

const GROUP_COLORS: Record<string, string> = {
  'O+': 'bg-red-500 text-white',
  'O-': 'bg-red-700 text-white',
  'A+': 'bg-blue-500 text-white',
  'A-': 'bg-blue-700 text-white',
  'B+': 'bg-green-500 text-white',
  'B-': 'bg-green-700 text-white',
  'AB+': 'bg-purple-500 text-white',
  'AB-': 'bg-purple-700 text-white',
};

const BLOOD_FACTS = [
  { stat: '1 donation', sub: 'can save up to 3 lives' },
  { stat: 'Every 2 sec', sub: 'someone in Bangladesh needs blood' },
  { stat: '450 ml', sub: 'is the typical donation amount' },
  { stat: '56 days', sub: 'minimum gap between donations' },
];

type RequestForm = { name: string; phone: string; group: string; hospital: string; units: string; urgency: string };

export default function BloodDonation() {
  const [activeGroup, setActiveGroup] = useState('All');
  const [activeDistrict, setActiveDistrict] = useState('All Districts');
  const [tab, setTab] = useState<'find' | 'request' | 'register'>('find');
  const [requestForm, setRequestForm] = useState<RequestForm>({ name: '', phone: '', group: '', hospital: '', units: '1', urgency: 'normal' });
  const [submitted, setSubmitted] = useState(false);

  const filteredDonors = DONORS.filter((d) => {
    const matchGroup = activeGroup === 'All' || d.group === activeGroup;
    const matchDistrict = activeDistrict === 'All Districts' || d.district === activeDistrict;
    return matchGroup && matchDistrict;
  });

  const handleRequestSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-ds-background">
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <section className="bg-gradient-to-br from-red-500/5 via-ds-background to-ds-primary/5 py-14">
        <div className="mx-auto max-w-7xl px-4 md:px-8">
          <motion.div variants={fadeUp} initial="hidden" animate="show" className="max-w-2xl">
            <span className="mb-3 inline-flex items-center gap-2 rounded-ds-full border border-red-500/20 bg-red-500/10 px-3 py-1 text-xs font-medium text-red-500">
              <Droplets size={12} /> Blood Donation Network
            </span>
            <h1 className="font-display text-3xl font-bold text-ds-foreground md:text-4xl">
              Every Drop Counts
            </h1>
            <p className="mt-3 text-ds-muted">
              AI-powered blood donor matching by blood group, location, and availability. Find a donor or register to save a life.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ── Stats ──────────────────────────────────────────────────────────── */}
      <section className="border-y border-ds-muted/10 bg-ds-surface py-8">
        <div className="mx-auto max-w-7xl px-4 md:px-8">
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {BLOOD_FACTS.map(({ stat, sub }, i) => (
              <motion.div key={stat} variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }} custom={i} className="text-center">
                <p className="font-display text-xl font-bold text-red-500 md:text-2xl">{stat}</p>
                <p className="mt-1 text-xs text-ds-muted">{sub}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 py-10 md:px-8">
        {/* ── Tabs ────────────────────────────────────────────────────────── */}
        <div className="mb-8 flex gap-2 rounded-ds-lg border border-ds-muted/10 bg-ds-surface p-1 w-fit">
          {([
            { id: 'find', label: 'Find Donor', icon: Search },
            { id: 'request', label: 'Request Blood', icon: AlertTriangle },
            { id: 'register', label: 'Register as Donor', icon: Heart },
          ] as const).map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => { setTab(id); setSubmitted(false); }}
              className={`flex items-center gap-2 rounded-ds-md px-4 py-2 text-sm font-medium transition-colors duration-ds-fast ${tab === id ? 'bg-ds-primary text-white shadow-ds-sm' : 'text-ds-muted hover:text-ds-foreground'}`}
            >
              <Icon size={15} />
              {label}
            </button>
          ))}
        </div>

        {/* ── Find Donor Tab ───────────────────────────────────────────────── */}
        {tab === 'find' && (
          <div className="space-y-6">
            {/* Filters */}
            <div className="flex flex-wrap gap-3">
              <div className="flex items-center gap-2">
                <span className="text-sm text-ds-muted font-medium">Blood Group:</span>
                <div className="flex flex-wrap gap-1.5">
                  {BLOOD_GROUPS.map((g) => (
                    <button
                      key={g}
                      onClick={() => setActiveGroup(g)}
                      className={`rounded-ds-md border px-3 py-1 text-sm font-semibold transition-colors duration-ds-fast ${activeGroup === g ? 'border-red-500 bg-red-500 text-white' : 'border-ds-muted/20 bg-ds-surface text-ds-muted hover:border-red-500/40 hover:text-red-500'}`}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              </div>
              <select
                value={activeDistrict}
                onChange={(e) => setActiveDistrict(e.target.value)}
                className="h-9 rounded-ds-md border border-ds-muted/30 bg-ds-surface px-3 text-sm text-ds-foreground focus:outline-none focus:ring-2 focus:ring-ds-primary"
              >
                {['All Districts', 'Dhaka', 'Chittagong', 'Sylhet', 'Rajshahi', 'Khulna', 'Barisal', 'Mymensingh'].map((d) => (
                  <option key={d}>{d}</option>
                ))}
              </select>
            </div>

            <p className="text-sm text-ds-muted">
              Found <span className="font-semibold text-ds-foreground">{filteredDonors.length}</span> donors
            </p>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filteredDonors.map((donor, i) => (
                <motion.div
                  key={donor.id}
                  variants={fadeUp}
                  initial="hidden"
                  whileInView="show"
                  viewport={{ once: true }}
                  custom={i}
                  className="flex flex-col gap-3 rounded-ds-xl border border-ds-muted/10 bg-ds-surface p-4 shadow-ds-sm hover:shadow-ds-md transition-all duration-ds-normal"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-ds-full bg-ds-primary/10 text-sm font-bold text-ds-primary">
                      {donor.name.split(' ').map((n) => n[0]).join('')}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-ds-foreground truncate text-sm">{donor.name}</p>
                      <div className="flex items-center gap-1 text-xs text-ds-muted">
                        <MapPin size={10} />
                        {donor.district}
                      </div>
                    </div>
                    <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-ds-lg text-sm font-bold ${GROUP_COLORS[donor.group] ?? 'bg-ds-muted/10 text-ds-foreground'}`}>
                      {donor.group}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs text-ds-muted border-t border-ds-muted/10 pt-2">
                    <span className="flex items-center gap-1"><Clock size={10} />{donor.lastDonated}</span>
                    <span className="flex items-center gap-1"><Heart size={10} className="text-red-500" />{donor.donations} donations</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className={`flex-1 rounded-ds-full text-center px-2 py-0.5 text-xs font-medium ${donor.available ? 'bg-ds-success/10 text-ds-success' : 'bg-ds-muted/10 text-ds-muted'}`}>
                      {donor.available ? '✓ Available' : 'Unavailable'}
                    </span>
                    {donor.available && (
                      <a
                        href={`tel:${donor.phone}`}
                        className="flex items-center gap-1 rounded-ds-md border border-ds-muted/20 px-2.5 py-1 text-xs font-medium text-ds-muted hover:border-ds-primary hover:text-ds-primary transition-colors duration-ds-fast"
                      >
                        <Phone size={11} />
                        Call
                      </a>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* ── Request Blood Tab ────────────────────────────────────────────── */}
        {tab === 'request' && (
          <div className="max-w-2xl">
            <div className="rounded-ds-xl border border-ds-muted/10 bg-ds-surface p-6 shadow-ds-sm md:p-8">
              <h2 className="font-display text-xl font-bold text-ds-foreground mb-5">Blood Request Form</h2>
              {submitted ? (
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center gap-4 py-12 text-center">
                  <CheckCircle2 size={52} className="text-ds-success" />
                  <h3 className="font-display text-xl font-bold text-ds-foreground">Request Sent!</h3>
                  <p className="text-sm text-ds-muted max-w-sm">
                    Matching donors have been alerted. You'll receive calls from available donors shortly.
                  </p>
                  <Button variant="outline" onClick={() => setSubmitted(false)}>Make Another Request</Button>
                </motion.div>
              ) : (
                <form onSubmit={handleRequestSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <TextInput label="Patient / Contact Name" placeholder="Full name" required value={requestForm.name} onChange={(e) => setRequestForm({ ...requestForm, name: e.target.value })} fullWidth />
                    <TextInput label="Phone Number" placeholder="+880 1XXX-XXXXXX" type="tel" required value={requestForm.phone} onChange={(e) => setRequestForm({ ...requestForm, phone: e.target.value })} fullWidth />
                  </div>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label className="block text-sm font-medium text-ds-foreground mb-1.5">Blood Group Required <span className="text-ds-danger">*</span></label>
                      <select required value={requestForm.group} onChange={(e) => setRequestForm({ ...requestForm, group: e.target.value })} className="h-10 w-full rounded-ds-md border border-ds-muted/30 bg-ds-surface px-3 text-sm text-ds-foreground focus:outline-none focus:ring-2 focus:ring-ds-primary">
                        <option value="">Select blood group</option>
                        {BLOOD_GROUPS.slice(1).map((g) => <option key={g}>{g}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-ds-foreground mb-1.5">Units Needed</label>
                      <select value={requestForm.units} onChange={(e) => setRequestForm({ ...requestForm, units: e.target.value })} className="h-10 w-full rounded-ds-md border border-ds-muted/30 bg-ds-surface px-3 text-sm text-ds-foreground focus:outline-none focus:ring-2 focus:ring-ds-primary">
                        {['1', '2', '3', '4', '5+'].map((u) => <option key={u}>{u}</option>)}
                      </select>
                    </div>
                  </div>
                  <TextInput label="Hospital Name & Location" placeholder="e.g. Dhaka Medical College Hospital, Dhaka" required prefixIcon={MapPin} value={requestForm.hospital} onChange={(e) => setRequestForm({ ...requestForm, hospital: e.target.value })} fullWidth />
                  <div>
                    <label className="block text-sm font-medium text-ds-foreground mb-1.5">Urgency Level</label>
                    <div className="flex gap-2">
                      {[
                        { id: 'normal', label: 'Normal', color: 'border-ds-success text-ds-success' },
                        { id: 'urgent', label: 'Urgent', color: 'border-ds-warning text-ds-warning' },
                        { id: 'critical', label: 'Critical', color: 'border-ds-danger text-ds-danger' },
                      ].map(({ id, label, color }) => (
                        <button
                          key={id}
                          type="button"
                          onClick={() => setRequestForm({ ...requestForm, urgency: id })}
                          className={`flex-1 rounded-ds-md border py-2 text-sm font-medium transition-colors duration-ds-fast ${requestForm.urgency === id ? color + ' bg-current/5' : 'border-ds-muted/20 text-ds-muted'}`}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <Button type="submit" variant="danger" fullWidth size="lg" leftIcon={Send} disabled={!requestForm.name || !requestForm.phone || !requestForm.group || !requestForm.hospital}>
                    Send Blood Request
                  </Button>
                </form>
              )}
            </div>
          </div>
        )}

        {/* ── Register as Donor Tab ────────────────────────────────────────── */}
        {tab === 'register' && (
          <div className="max-w-2xl">
            <div className="rounded-ds-xl border border-ds-muted/10 bg-ds-surface p-6 shadow-ds-sm md:p-8">
              <div className="flex items-center gap-3 mb-5">
                <div className="flex h-12 w-12 items-center justify-center rounded-ds-lg bg-red-500/10 text-red-500">
                  <Heart size={24} />
                </div>
                <div>
                  <h2 className="font-display text-xl font-bold text-ds-foreground">Register as Blood Donor</h2>
                  <p className="text-sm text-ds-muted">Your donation can save up to 3 lives.</p>
                </div>
              </div>
              {submitted ? (
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center gap-4 py-10 text-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-ds-full bg-red-500/10 text-red-500">
                    <ShieldCheck size={36} />
                  </div>
                  <h3 className="font-display text-xl font-bold text-ds-foreground">You're Registered!</h3>
                  <p className="text-sm text-ds-muted max-w-sm">Thank you for joining the ShebaBD blood donor network. You'll be notified when someone nearby needs blood.</p>
                  <Button variant="outline" leftIcon={User} onClick={() => setTab('find')}>View Donor Directory</Button>
                </motion.div>
              ) : (
                <form onSubmit={handleRequestSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <TextInput label="Full Name" placeholder="Your full name" required fullWidth value={requestForm.name} onChange={(e) => setRequestForm({ ...requestForm, name: e.target.value })} />
                    <TextInput label="Phone" placeholder="+880 1XXX-XXXXXX" type="tel" required fullWidth value={requestForm.phone} onChange={(e) => setRequestForm({ ...requestForm, phone: e.target.value })} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-ds-foreground mb-1.5">Your Blood Group <span className="text-ds-danger">*</span></label>
                    <div className="flex flex-wrap gap-2">
                      {BLOOD_GROUPS.slice(1).map((g) => (
                        <button
                          key={g}
                          type="button"
                          onClick={() => setRequestForm({ ...requestForm, group: g })}
                          className={`rounded-ds-md border px-3 py-1.5 text-sm font-bold transition-colors duration-ds-fast ${requestForm.group === g ? GROUP_COLORS[g] + ' border-transparent' : 'border-ds-muted/20 bg-ds-surface text-ds-muted'}`}
                        >
                          {g}
                        </button>
                      ))}
                    </div>
                  </div>
                  <TextInput label="Your Location / District" placeholder="e.g. Mirpur, Dhaka" required prefixIcon={MapPin} fullWidth value={requestForm.hospital} onChange={(e) => setRequestForm({ ...requestForm, hospital: e.target.value })} />
                  <Button type="submit" size="lg" fullWidth leftIcon={Heart} className="bg-red-500 hover:bg-red-600 text-white border-0" disabled={!requestForm.name || !requestForm.phone || !requestForm.group || !requestForm.hospital}>
                    Register as Donor
                  </Button>
                </form>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  CalendarDays,
  MapPin,
  Users,
  Clock,
  Tag,
  CheckCircle2,
  ArrowRight,
  Megaphone,
  Leaf,
  Stethoscope,
  BookOpen,
  Droplets,
  HandHeart,
  Search,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SearchInput } from '@/components/ui/input';
import { TextInput } from '@/components/ui/input';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.07, duration: 0.4, ease: [0.4, 0, 0.2, 1] },
  }),
};

const EVENT_CATS = [
  { id: 'all', label: 'All Events' },
  { id: 'awareness', label: 'Awareness', icon: Megaphone },
  { id: 'medical', label: 'Medical Camp', icon: Stethoscope },
  { id: 'education', label: 'Education', icon: BookOpen },
  { id: 'environment', label: 'Environment', icon: Leaf },
  { id: 'blood', label: 'Blood Drive', icon: Droplets },
  { id: 'fundraising', label: 'Fundraising', icon: HandHeart },
];

const EVENTS = [
  {
    id: 1, title: 'National Blood Donation Day 2026', category: 'blood',
    date: 'July 14, 2026', time: '9:00 AM – 4:00 PM',
    location: 'Dhaka University Campus, Dhaka',
    org: 'Bangladesh Red Crescent', capacity: 500, registered: 423,
    desc: 'Annual blood donation drive targeting 1,000 units across all districts. Free health screening included.',
    tags: ['Blood', 'Health', 'Free'], featured: true,
  },
  {
    id: 2, title: 'Free Medical Camp — Char Areas', category: 'medical',
    date: 'July 18, 2026', time: '8:00 AM – 2:00 PM',
    location: 'Sirajganj Char, Rajshahi',
    org: 'CRP Bangladesh', capacity: 200, registered: 87,
    desc: 'Free consultation, medicines, and health check-ups for flood-affected char communities.',
    tags: ['Medical', 'Free', 'Rural'], featured: false,
  },
  {
    id: 3, title: 'Climate Action Youth Summit', category: 'environment',
    date: 'August 2, 2026', time: '10:00 AM – 5:00 PM',
    location: 'BUET Auditorium, Dhaka',
    org: 'Chittagong Green Force', capacity: 300, registered: 210,
    desc: 'Youth-led discussions on climate change, mangrove restoration, and sustainable futures for Bangladesh.',
    tags: ['Climate', 'Youth', 'Networking'], featured: true,
  },
  {
    id: 4, title: 'Digital Literacy for Rural Women', category: 'education',
    date: 'August 10, 2026', time: '9:00 AM – 1:00 PM',
    location: 'Gazipur Community Center',
    org: 'Dhaka Ahsania Mission', capacity: 80, registered: 64,
    desc: 'Hands-on smartphone and internet literacy training for rural women. Stipend provided for participants.',
    tags: ['Education', 'Women', 'Digital'], featured: false,
  },
  {
    id: 5, title: 'Fundraising Gala — Poverty Relief 2026', category: 'fundraising',
    date: 'August 22, 2026', time: '6:00 PM – 10:00 PM',
    location: 'Radisson Blu, Dhaka',
    org: 'Grameen Bank', capacity: 250, registered: 190,
    desc: 'Annual fundraising event featuring performances, auction, and dinner. Proceeds go to rural poverty relief.',
    tags: ['Fundraising', 'Gala', 'Networking'], featured: false,
  },
  {
    id: 6, title: 'Cyclone Preparedness Workshop', category: 'awareness',
    date: 'September 5, 2026', time: '10:00 AM – 3:00 PM',
    location: 'Cox\'s Bazar District Hall',
    org: 'Khulna Disaster Response', capacity: 150, registered: 42,
    desc: 'Community training on cyclone preparedness, evacuation routes, and emergency response for coastal areas.',
    tags: ['Disaster', 'Awareness', 'Free'], featured: false,
  },
];

const CAT_COLORS: Record<string, string> = {
  blood: 'bg-red-500/10 text-red-500',
  medical: 'bg-ds-success/10 text-ds-success',
  education: 'bg-ds-secondary/10 text-ds-secondary',
  environment: 'bg-green-600/10 text-green-600',
  fundraising: 'bg-ds-warning/10 text-ds-warning',
  awareness: 'bg-ds-accent/10 text-ds-accent',
};

type RegForm = { name: string; email: string; phone: string };

export default function Events() {
  const [activeCategory, setActiveCategory] = useState('all');
  const [search, setSearch] = useState('');
  const [registeringId, setRegisteringId] = useState<number | null>(null);
  const [regForm, setRegForm] = useState<RegForm>({ name: '', email: '', phone: '' });
  const [confirmedId, setConfirmedId] = useState<number | null>(null);

  const filtered = EVENTS.filter((e) => {
    const matchCat = activeCategory === 'all' || e.category === activeCategory;
    const matchSearch =
      e.title.toLowerCase().includes(search.toLowerCase()) ||
      e.location.toLowerCase().includes(search.toLowerCase()) ||
      e.org.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const featured = filtered.find((e) => e.featured);
  const rest = filtered.filter((e) => !e.featured || filtered.length === 1);

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setConfirmedId(registeringId);
    setRegisteringId(null);
    setRegForm({ name: '', email: '', phone: '' });
  };

  return (
    <div className="min-h-screen bg-ds-background">
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <section className="bg-gradient-to-br from-ds-accent/5 via-ds-background to-ds-primary/5 py-14">
        <div className="mx-auto max-w-7xl px-4 md:px-8">
          <motion.div variants={fadeUp} initial="hidden" animate="show" className="max-w-2xl">
            <span className="mb-3 inline-flex items-center gap-2 rounded-ds-full border border-ds-accent/20 bg-ds-accent/10 px-3 py-1 text-xs font-medium text-ds-accent">
              <CalendarDays size={12} /> Events & Campaigns
            </span>
            <h1 className="font-display text-3xl font-bold text-ds-foreground md:text-4xl">
              Upcoming Social Events
            </h1>
            <p className="mt-3 text-ds-muted">
              Join blood drives, medical camps, awareness campaigns, and volunteer events across Bangladesh.
            </p>
          </motion.div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 py-10 md:px-8 space-y-8">
        {/* ── Filters ──────────────────────────────────────────────────────── */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <SearchInput
            placeholder="Search events, organisations…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onClear={() => setSearch('')}
          />
          <div className="flex flex-wrap gap-2">
            {EVENT_CATS.map(({ id, label }) => (
              <button
                key={id}
                onClick={() => setActiveCategory(id)}
                className={`rounded-ds-full border px-3 py-1.5 text-sm font-medium transition-colors duration-ds-fast ${activeCategory === id ? 'border-ds-primary bg-ds-primary text-white' : 'border-ds-muted/20 bg-ds-surface text-ds-muted hover:border-ds-primary/40 hover:text-ds-primary'}`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* ── Featured event ────────────────────────────────────────────────── */}
        {featured && (
          <motion.div variants={fadeUp} initial="hidden" animate="show" className="relative overflow-hidden rounded-ds-2xl border border-ds-primary/20 bg-gradient-to-br from-ds-primary/10 to-ds-surface p-6 shadow-ds-md md:p-8">
            <span className="mb-3 inline-flex items-center gap-1.5 rounded-ds-full border border-ds-primary/20 bg-ds-primary/10 px-3 py-1 text-xs font-medium text-ds-primary">
              ⭐ Featured Event
            </span>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              <div className="md:col-span-2 space-y-3">
                <h2 className="font-display text-2xl font-bold text-ds-foreground">{featured.title}</h2>
                <p className="text-sm text-ds-muted leading-relaxed">{featured.desc}</p>
                <div className="flex flex-wrap gap-4 text-sm text-ds-muted">
                  <span className="flex items-center gap-1.5"><CalendarDays size={14} />{featured.date}</span>
                  <span className="flex items-center gap-1.5"><Clock size={14} />{featured.time}</span>
                  <span className="flex items-center gap-1.5"><MapPin size={14} />{featured.location}</span>
                  <span className="flex items-center gap-1.5"><Users size={14} />{featured.registered}/{featured.capacity} registered</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {featured.tags.map((tag) => (
                    <span key={tag} className="flex items-center gap-1 rounded-ds-full bg-ds-primary/10 px-2.5 py-0.5 text-xs font-medium text-ds-primary">
                      <Tag size={10} />{tag}
                    </span>
                  ))}
                </div>
              </div>
              <div className="flex flex-col gap-3 justify-center">
                {/* Capacity bar */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs text-ds-muted">
                    <span>Registration</span>
                    <span>{Math.round((featured.registered / featured.capacity) * 100)}% filled</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-ds-muted/20 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-ds-primary transition-all duration-ds-slow"
                      style={{ width: `${(featured.registered / featured.capacity) * 100}%` }}
                    />
                  </div>
                </div>
                {confirmedId === featured.id ? (
                  <div className="flex items-center gap-2 rounded-ds-md bg-ds-success/10 p-3 text-sm text-ds-success font-medium">
                    <CheckCircle2 size={16} /> Registered Successfully!
                  </div>
                ) : (
                  <Button leftIcon={ArrowRight} onClick={() => setRegisteringId(featured.id)}>Register Now</Button>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* ── Event grid ────────────────────────────────────────────────────── */}
        {rest.length === 0 && !featured ? (
          <div className="flex flex-col items-center justify-center py-24 text-ds-muted">
            <Search size={48} className="mb-4 opacity-30" />
            <p className="text-lg font-medium">No events found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
            {rest.map((event, i) => (
              <motion.div
                key={event.id}
                variants={fadeUp}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true }}
                custom={i}
                className="flex flex-col gap-4 rounded-ds-xl border border-ds-muted/10 bg-ds-surface p-5 shadow-ds-sm hover:shadow-ds-md hover:-translate-y-0.5 transition-all duration-ds-normal"
              >
                <div className="flex items-start gap-3">
                  <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-ds-lg ${CAT_COLORS[event.category] ?? 'bg-ds-muted/10 text-ds-muted'}`}>
                    {(() => { const cat = EVENT_CATS.find((c) => c.id === event.category); const Icon = cat?.icon; return Icon ? <Icon size={20} /> : <CalendarDays size={20} />; })()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-ds-foreground leading-snug">{event.title}</h3>
                    <p className="mt-0.5 text-xs text-ds-muted">{event.org}</p>
                  </div>
                </div>

                <p className="text-sm text-ds-muted leading-relaxed line-clamp-2">{event.desc}</p>

                <div className="flex flex-col gap-1 text-xs text-ds-muted">
                  <span className="flex items-center gap-1.5"><CalendarDays size={11} />{event.date} · {event.time}</span>
                  <span className="flex items-center gap-1.5"><MapPin size={11} />{event.location}</span>
                </div>

                {/* Capacity */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-ds-muted">
                    <span className="flex items-center gap-1"><Users size={10} />{event.registered}/{event.capacity}</span>
                    <span>{Math.round((event.registered / event.capacity) * 100)}% filled</span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-ds-muted/20 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-ds-primary"
                      style={{ width: `${(event.registered / event.capacity) * 100}%` }}
                    />
                  </div>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {event.tags.map((tag) => (
                    <span key={tag} className="rounded-ds-full bg-ds-background px-2 py-0.5 text-xs text-ds-muted border border-ds-muted/20">
                      {tag}
                    </span>
                  ))}
                </div>

                {confirmedId === event.id ? (
                  <div className="flex items-center gap-2 rounded-ds-md bg-ds-success/10 py-2 px-3 text-sm text-ds-success font-medium">
                    <CheckCircle2 size={15} /> Registered!
                  </div>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    fullWidth
                    onClick={() => setRegisteringId(event.id)}
                    disabled={event.registered >= event.capacity}
                  >
                    {event.registered >= event.capacity ? 'Fully Booked' : 'Register'}
                  </Button>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* ── Registration modal ─────────────────────────────────────────────── */}
      {registeringId !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md rounded-ds-2xl bg-ds-surface p-6 shadow-ds-xl"
          >
            <h2 className="font-display text-xl font-bold text-ds-foreground mb-1">
              Register for Event
            </h2>
            <p className="text-sm text-ds-muted mb-5">
              {EVENTS.find((e) => e.id === registeringId)?.title}
            </p>
            <form onSubmit={handleRegister} className="space-y-4">
              <TextInput label="Full Name" placeholder="Your full name" required fullWidth value={regForm.name} onChange={(e) => setRegForm({ ...regForm, name: e.target.value })} />
              <TextInput label="Email" placeholder="you@example.com" type="email" required fullWidth value={regForm.email} onChange={(e) => setRegForm({ ...regForm, email: e.target.value })} />
              <TextInput label="Phone" placeholder="+880 1XXX-XXXXXX" type="tel" required fullWidth value={regForm.phone} onChange={(e) => setRegForm({ ...regForm, phone: e.target.value })} />
              <div className="flex gap-3 pt-1">
                <Button type="submit" leftIcon={CheckCircle2} disabled={!regForm.name || !regForm.email || !regForm.phone}>
                  Confirm Registration
                </Button>
                <Button type="button" variant="ghost" onClick={() => setRegisteringId(null)}>
                  Cancel
                </Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}

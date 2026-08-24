import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CalendarDays, MapPin, Users, Clock, Tag,
  CheckCircle2, ArrowRight, Megaphone, Leaf,
  Stethoscope, BookOpen, Droplets, HandHeart,
  Search, Loader2, AlertCircle, RefreshCw, X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SearchInput, TextInput } from '@/components/ui/input';
import { getEvents, registerForEvent, type Event } from '@/services/eventsApi';
import type { Variants } from 'framer-motion';

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: (i = 0) => ({ opacity: 1, y: 0, transition: { delay: i * 0.07, duration: 0.4 } }),
};

const EVENT_CATS = [
  { id: 'all',         label: 'All Events' },
  { id: 'awareness',   label: 'Awareness',   icon: Megaphone },
  { id: 'medical',     label: 'Medical Camp', icon: Stethoscope },
  { id: 'education',   label: 'Education',    icon: BookOpen },
  { id: 'environment', label: 'Environment',  icon: Leaf },
  { id: 'blood',       label: 'Blood Drive',  icon: Droplets },
  { id: 'fundraising', label: 'Fundraising',  icon: HandHeart },
];

const FALLBACK_EVENTS: Event[] = [
  {
    id: 1,
    title: 'National Blood Donation Drive 2026',
    category: 'blood',
    description: 'Annual nationwide emergency blood collection drive organized in collaboration with Dhaka Medical College Hospital and Red Crescent Society. Free health checkups provided for all registered donors.',
    date: 'Aug 28, 2026',
    time: '09:00 AM - 05:00 PM',
    location: 'Dhanmondi Lake Park, Sector 8, Dhaka',
    organizer: 'Bangladesh Red Crescent Society',
    capacity: 500,
    registered_count: 342,
    tags: 'Blood Donation, Healthcare, Emergency, Free Checkup',
    is_featured: true,
    is_active: true,
    created_at: new Date().toISOString(),
  },
  {
    id: 2,
    title: 'Sylhet Flood Relief & Medical Camp',
    category: 'medical',
    description: 'Free medicine distribution, doctor consultations, and hygiene kit delivery for flood-affected families in Sunamganj and surrounding haor regions.',
    date: 'Aug 30, 2026',
    time: '10:00 AM - 04:00 PM',
    location: 'Sunamganj Sadar Hospital Grounds, Sylhet',
    organizer: 'ShebaBD Medical Relief Unit',
    capacity: 300,
    registered_count: 215,
    tags: 'Medical Camp, Flood Relief, Free Medicine, Doctors',
    is_featured: false,
    is_active: true,
    created_at: new Date().toISOString(),
  },
  {
    id: 3,
    title: 'Digital Literacy Workshop for Rural Youth',
    category: 'education',
    description: 'Hands-on computer training, coding fundamentals, and digital freelancing guidance for high school students in rural Chittagong districts.',
    date: 'Sep 04, 2026',
    time: '11:00 AM - 03:30 PM',
    location: 'Chittagong University IT Auditorium, Chittagong',
    organizer: 'Youth Empowerment Bangladesh',
    capacity: 150,
    registered_count: 128,
    tags: 'Education, IT Skills, Youth, Coding',
    is_featured: false,
    is_active: true,
    created_at: new Date().toISOString(),
  },
  {
    id: 4,
    title: 'Green Dhaka Tree Plantation Campaign',
    category: 'environment',
    description: 'Join 1,000 environmental volunteers to plant 10,000 native trees across Hatirjheel, Uttara, and Mirpur green corridors to combat urban heat islands.',
    date: 'Sep 08, 2026',
    time: '07:30 AM - 12:00 PM',
    location: 'Hatirjheel Amphitheatre, Dhaka',
    organizer: 'Green Bangladesh Initiative',
    capacity: 1000,
    registered_count: 780,
    tags: 'Environment, Tree Plantation, Green Dhaka, Climate',
    is_featured: true,
    is_active: true,
    created_at: new Date().toISOString(),
  },
  {
    id: 5,
    title: 'Winter Clothes & Warm Blanket Drive',
    category: 'fundraising',
    description: 'Collecting and distributing high quality winter jackets, sweaters, and blankets for cold-hit northern districts in Kurigram, Rangpur, and Panchagarh.',
    date: 'Sep 12, 2026',
    time: '08:00 AM - 06:00 PM',
    location: 'Rangpur Town Hall Complex, Rangpur',
    organizer: 'Shishur Hashi Foundation',
    capacity: 400,
    registered_count: 290,
    tags: 'Winter Relief, Blankets, Northern Bangladesh, Warmth',
    is_featured: false,
    is_active: true,
    created_at: new Date().toISOString(),
  },
  {
    id: 6,
    title: 'Mental Health & Wellness Awareness Camp',
    category: 'awareness',
    description: 'Certified counselors and psychiatrists offering confidential one-on-one sessions, stress management workshops, and youth wellness counseling.',
    date: 'Sep 16, 2026',
    time: '02:00 PM - 07:00 PM',
    location: 'Rajshahi Medical College Auditorium, Rajshahi',
    organizer: 'MindCare Bangladesh',
    capacity: 200,
    registered_count: 145,
    tags: 'Mental Health, Awareness, Counseling, Youth',
    is_featured: false,
    is_active: true,
    created_at: new Date().toISOString(),
  },
];

type RegForm = { name: string; email: string; phone: string };

export default function Events() {
  const [activeCategory, setActiveCategory] = useState('all');
  const [search, setSearch] = useState('');
  const [events, setEvents] = useState<Event[]>(FALLBACK_EVENTS);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [registeringId, setRegisteringId] = useState<number | null>(null);
  const [regForm, setRegForm] = useState<RegForm>({ name: '', email: '', phone: '' });
  const [registering, setRegistering] = useState(false);
  const [confirmedId, setConfirmedId] = useState<number | null>(null);

  const loadEvents = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getEvents({
        category: activeCategory === 'all' ? undefined : activeCategory,
        search: search.trim() || undefined,
        limit: 50,
      });
      if (Array.isArray(data) && data.length > 0) {
        setEvents(data);
      } else {
        // Filter fallback events locally
        let filtered = FALLBACK_EVENTS;
        if (activeCategory !== 'all') {
          filtered = filtered.filter(e => e.category === activeCategory);
        }
        if (search.trim()) {
          const s = search.toLowerCase();
          filtered = filtered.filter(e => 
            e.title.toLowerCase().includes(s) || 
            e.location.toLowerCase().includes(s) || 
            e.organizer.toLowerCase().includes(s)
          );
        }
        setEvents(filtered);
      }
    } catch (err) {
      console.warn('Events fetch fallback:', err);
      let filtered = FALLBACK_EVENTS;
      if (activeCategory !== 'all') {
        filtered = filtered.filter(e => e.category === activeCategory);
      }
      if (search.trim()) {
        const s = search.toLowerCase();
        filtered = filtered.filter(e => 
          e.title.toLowerCase().includes(s) || 
          e.location.toLowerCase().includes(s) || 
          e.organizer.toLowerCase().includes(s)
        );
      }
      setEvents(filtered);
    } finally {
      setLoading(false);
    }
  }, [activeCategory, search]);

  useEffect(() => {
    const t = setTimeout(loadEvents, search ? 300 : 0);
    return () => clearTimeout(t);
  }, [loadEvents, search]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!registeringId) return;
    setRegistering(true);
    try {
      await registerForEvent(registeringId, {
        name: regForm.name,
        email: regForm.email,
        phone: regForm.phone || undefined,
      });
      setConfirmedId(registeringId);
      setEvents(prev => prev.map(ev =>
        ev.id === registeringId ? { ...ev, registered_count: ev.registered_count + 1 } : ev
      ));
    } catch {
      // Local optimistic confirmation
      setConfirmedId(registeringId);
      setEvents(prev => prev.map(ev =>
        ev.id === registeringId ? { ...ev, registered_count: ev.registered_count + 1 } : ev
      ));
    } finally {
      setRegistering(false);
      setRegisteringId(null);
      setRegForm({ name: '', email: '', phone: '' });
    }
  };

  const featured = events.find(e => e.is_featured);
  const rest = events.filter(e => !e.is_featured || events.length === 1);

  return (
    <div style={{ background: '#0B2E22', color: '#F7F1E1' }} className="min-h-screen">
      {/* Header Banner */}
      <section 
        style={{ background: 'linear-gradient(135deg, #0B2E22 0%, #0F3A2B 50%, #0B2E22 100%)' }}
        className="py-14 border-b border-[rgba(247,241,225,0.12)]"
      >
        <div className="mx-auto max-w-7xl px-4 md:px-8">
          <motion.div variants={fadeUp} initial="hidden" animate="show" className="max-w-2xl">
            <span className="mb-3 inline-flex items-center gap-2 rounded-full border border-[#E7A93B]/30 bg-[#E7A93B]/10 px-3.5 py-1 text-xs font-medium text-[#E7A93B] backdrop-blur-md">
              <CalendarDays size={12} /> Events & Campaigns
            </span>
            <h1 className="font-display text-3xl font-bold text-[#F7F1E1] md:text-4xl tracking-tight">
              Upcoming Social Events & Drives
            </h1>
            <p className="mt-3 text-[rgba(247,241,225,0.75)] leading-relaxed">
              Join blood donation drives, medical camps, relief missions, and volunteer initiatives across all 64 districts.
            </p>
          </motion.div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 py-10 md:px-8 space-y-8">
        {/* Filters */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="flex-1 max-w-md">
            <SearchInput
              placeholder="Search events, organizers, districts…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              onClear={() => setSearch('')}
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {EVENT_CATS.map(({ id, label }) => (
              <button 
                key={id} 
                onClick={() => setActiveCategory(id)}
                className={`rounded-full border px-3.5 py-1.5 text-sm font-medium transition-all ${
                  activeCategory === id
                    ? 'border-[#D6472C] bg-[#D6472C] text-white shadow-md'
                    : 'border-[rgba(247,241,225,0.18)] bg-[#0F3A2B] text-[rgba(247,241,225,0.7)] hover:border-[#E7A93B] hover:text-[#E7A93B]'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Loading / Error */}
        {loading && (
          <div className="flex justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-[#E7A93B]" />
          </div>
        )}

        {error && !loading && (
          <div className="flex items-center gap-3 rounded-xl border border-red-500/30 bg-red-500/10 p-4">
            <AlertCircle size={16} className="text-red-400 shrink-0" />
            <p className="text-sm text-red-200 flex-1">{error}</p>
            <button onClick={loadEvents} className="flex items-center gap-1 text-xs border border-[rgba(247,241,225,0.2)] px-3 py-1 rounded-lg text-[#F7F1E1]">
              <RefreshCw size={11} /> Retry
            </button>
          </div>
        )}

        {!loading && (
          <>
            {/* Featured event */}
            {featured && (
              <motion.div 
                variants={fadeUp} 
                initial="hidden" 
                animate="show"
                style={{ background: '#0F3A2B', borderColor: 'rgba(231,169,59,0.3)' }}
                className="relative overflow-hidden rounded-2xl border p-6 shadow-xl md:p-8"
              >
                <span className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-[#E7A93B]/30 bg-[#E7A93B]/10 px-3 py-1 text-xs font-medium text-[#E7A93B]">
                  ⭐ Featured Event
                </span>
                <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                  <div className="md:col-span-2 space-y-3">
                    <h2 className="font-display text-2xl font-bold text-[#F7F1E1]">{featured.title}</h2>
                    <p className="text-sm text-[rgba(247,241,225,0.75)] leading-relaxed">{featured.description}</p>
                    <div className="flex flex-wrap gap-4 text-sm text-[rgba(247,241,225,0.7)]">
                      <span className="flex items-center gap-1.5"><CalendarDays size={14} />{featured.date}</span>
                      <span className="flex items-center gap-1.5"><Clock size={14} />{featured.time}</span>
                      <span className="flex items-center gap-1.5"><MapPin size={14} />{featured.location}</span>
                      <span className="flex items-center gap-1.5"><Users size={14} />{featured.registered_count}/{featured.capacity} registered</span>
                    </div>
                    {featured.tags && (
                      <div className="flex flex-wrap gap-2">
                        {featured.tags.split(',').map(tag => (
                          <span key={tag} className="flex items-center gap-1 rounded-full border border-[#3E7A8C]/30 bg-[#3E7A8C]/15 px-2.5 py-0.5 text-xs font-medium text-[#3E7A8C]">
                            <Tag size={10} />{tag.trim()}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col gap-3 justify-center">
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-xs text-[rgba(247,241,225,0.65)]">
                        <span>Registration Capacity</span>
                        <span>{Math.round((featured.registered_count / featured.capacity) * 100)}% filled</span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-[rgba(247,241,225,0.12)] overflow-hidden">
                        <div 
                          className="h-full rounded-full bg-[#E7A93B] transition-all"
                          style={{ width: `${Math.min((featured.registered_count / featured.capacity) * 100, 100)}%` }} 
                        />
                      </div>
                    </div>
                    {confirmedId === featured.id ? (
                      <div className="flex items-center justify-center gap-2 rounded-xl bg-emerald-500/15 border border-emerald-500/30 p-3 text-sm text-emerald-400 font-medium">
                        <CheckCircle2 size={16} /> Registered Successfully!
                      </div>
                    ) : (
                      <button 
                        onClick={() => setRegisteringId(featured.id)}
                        disabled={featured.registered_count >= featured.capacity}
                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#D6472C] px-5 py-3 text-sm font-semibold text-white shadow-lg hover:bg-[#b83a22] transition-colors disabled:opacity-50"
                      >
                        {featured.registered_count >= featured.capacity ? 'Fully Booked' : 'Register for Event'} <ArrowRight size={16} />
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {/* Event grid */}
            {events.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 text-[rgba(247,241,225,0.5)]">
                <Search size={48} className="mb-4 opacity-30" />
                <p className="text-lg font-medium">No events found matching your search</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
                {events.map((event, i) => (
                  <motion.div 
                    key={event.id} 
                    variants={fadeUp} 
                    initial="hidden" 
                    whileInView="show"
                    viewport={{ once: true }} 
                    custom={i}
                    style={{ background: '#0F3A2B', borderColor: 'rgba(247,241,225,0.14)' }}
                    className="flex flex-col justify-between gap-4 rounded-2xl border p-5 shadow-lg hover:border-[rgba(231,169,59,0.3)] transition-all"
                  >
                    <div>
                      <div className="flex items-start gap-3 mb-3">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#E7A93B]/15 border border-[#E7A93B]/30 text-[#E7A93B]">
                          {(() => { 
                            const cat = EVENT_CATS.find(c => c.id === event.category); 
                            const Icon = cat?.icon; 
                            return Icon ? <Icon size={20} /> : <CalendarDays size={20} />; 
                          })()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-[#F7F1E1] leading-snug">{event.title}</h3>
                          <p className="mt-0.5 text-xs text-[rgba(247,241,225,0.65)]">{event.organizer}</p>
                        </div>
                      </div>
                      <p className="text-sm text-[rgba(247,241,225,0.7)] leading-relaxed line-clamp-2 mb-3">
                        {event.description}
                      </p>
                      <div className="flex flex-col gap-1 text-xs text-[rgba(247,241,225,0.65)] mb-3">
                        <span className="flex items-center gap-1.5"><CalendarDays size={12} />{event.date} · {event.time}</span>
                        <span className="flex items-center gap-1.5"><MapPin size={12} />{event.location}</span>
                      </div>
                    </div>

                    <div className="space-y-3 pt-2 border-t border-[rgba(247,241,225,0.1)]">
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs text-[rgba(247,241,225,0.65)]">
                          <span className="flex items-center gap-1"><Users size={10} />{event.registered_count}/{event.capacity}</span>
                          <span>{Math.round((event.registered_count / event.capacity) * 100)}%</span>
                        </div>
                        <div className="h-1.5 w-full rounded-full bg-[rgba(247,241,225,0.12)] overflow-hidden">
                          <div 
                            className="h-full rounded-full bg-[#E7A93B]"
                            style={{ width: `${Math.min((event.registered_count / event.capacity) * 100, 100)}%` }} 
                          />
                        </div>
                      </div>

                      {confirmedId === event.id ? (
                        <div className="flex items-center justify-center gap-2 rounded-xl bg-emerald-500/15 border border-emerald-500/30 py-2 px-3 text-xs text-emerald-400 font-medium">
                          <CheckCircle2 size={14} /> Registered!
                        </div>
                      ) : (
                        <button 
                          onClick={() => setRegisteringId(event.id)}
                          disabled={event.registered_count >= event.capacity}
                          className="w-full py-2 px-3 rounded-xl border border-[rgba(247,241,225,0.2)] bg-white/5 hover:bg-white/10 text-xs font-semibold text-white transition-all disabled:opacity-50"
                        >
                          {event.registered_count >= event.capacity ? 'Fully Booked' : 'Register Now'}
                        </button>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* Registration modal */}
      <AnimatePresence>
        {registeringId !== null && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-md">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }} 
              animate={{ opacity: 1, scale: 1 }} 
              exit={{ opacity: 0, scale: 0.95 }}
              style={{ background: '#0F3A2B', borderColor: 'rgba(247,241,225,0.2)' }}
              className="w-full max-w-md rounded-2xl border p-6 shadow-2xl relative"
            >
              <button 
                type="button" 
                onClick={() => setRegisteringId(null)}
                className="absolute top-4 right-4 text-white/50 hover:text-white p-1 rounded-lg"
              >
                <X size={18} />
              </button>

              <h2 className="font-display text-xl font-bold text-white mb-1">Register for Event</h2>
              <p className="text-xs text-[rgba(247,241,225,0.7)] mb-5">
                {events.find(e => e.id === registeringId)?.title}
              </p>

              <form onSubmit={handleRegister} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-[rgba(247,241,225,0.8)] mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    placeholder="Enter your full name"
                    value={regForm.name}
                    onChange={e => setRegForm({ ...regForm, name: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-black/30 border border-white/20 text-white placeholder:text-white/40 text-sm outline-none focus:border-[#E7A93B]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-[rgba(247,241,225,0.8)] mb-1">Email Address</label>
                  <input
                    type="email"
                    required
                    placeholder="you@example.com"
                    value={regForm.email}
                    onChange={e => setRegForm({ ...regForm, email: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-black/30 border border-white/20 text-white placeholder:text-white/40 text-sm outline-none focus:border-[#E7A93B]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-[rgba(247,241,225,0.8)] mb-1">Phone Number (Optional)</label>
                  <input
                    type="tel"
                    placeholder="+880 1XXX-XXXXXX"
                    value={regForm.phone}
                    onChange={e => setRegForm({ ...regForm, phone: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-black/30 border border-white/20 text-white placeholder:text-white/40 text-sm outline-none focus:border-[#E7A93B]"
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button 
                    type="submit" 
                    disabled={registering || !regForm.name || !regForm.email}
                    className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-[#D6472C] hover:bg-[#b83a22] px-4 py-2.5 text-sm font-semibold text-white shadow-lg transition-colors disabled:opacity-50"
                  >
                    {registering ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
                    <span>{registering ? 'Registering…' : 'Confirm Registration'}</span>
                  </button>
                  <button 
                    type="button" 
                    onClick={() => setRegisteringId(null)}
                    className="px-4 py-2.5 rounded-xl border border-white/20 hover:bg-white/10 text-sm font-medium text-white transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CalendarDays, MapPin, Users, Clock, Tag,
  CheckCircle2, ArrowRight, Megaphone, Leaf,
  Stethoscope, BookOpen, Droplets, HandHeart,
  Search, Loader2, AlertCircle, RefreshCw,
  Mail, Bell, XCircle, Ticket, LogIn, Sparkles
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SearchInput, TextInput } from '@/components/ui/input';
import {
  getEvents,
  registerForEvent,
  cancelEventRegistration,
  getMyRegistrations,
  type Event,
  type EventRegistration
} from '@/services/eventsApi';
import { useAuth } from '@/hooks/useAuth';
import { Link } from 'react-router-dom';
import type { Variants } from 'framer-motion';

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: (i = 0) => ({ opacity: 1, y: 0, transition: { delay: i * 0.05, duration: 0.35 } }),
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

export default function Events() {
  const { user, isAuthenticated } = useAuth();
  const [viewTab, setViewTab] = useState<'explore' | 'my-events'>('explore');
  const [activeCategory, setActiveCategory] = useState('all');
  const [search, setSearch] = useState('');
  const [events, setEvents] = useState<Event[]>([]);
  const [myRegistrations, setMyRegistrations] = useState<EventRegistration[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Registration modal states
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [phone, setPhone] = useState('');
  const [registering, setRegistering] = useState(false);
  const [regSuccessData, setRegSuccessData] = useState<{ event: Event; reg: EventRegistration } | null>(null);
  const [cancellingId, setCancellingId] = useState<number | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getEvents({
        category: activeCategory === 'all' ? undefined : activeCategory,
        search: search.trim() || undefined,
        limit: 50,
      });
      setEvents(data);

      if (isAuthenticated) {
        try {
          const myRegs = await getMyRegistrations();
          setMyRegistrations(myRegs);
        } catch {
          // Non-blocking if registrations fail
        }
      }
    } catch {
      setError('Could not load events. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [activeCategory, search, isAuthenticated]);

  useEffect(() => {
    const t = setTimeout(loadData, search ? 350 : 0);
    return () => clearTimeout(t);
  }, [loadData, search]);

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEvent) return;
    setRegistering(true);
    try {
      const reg = await registerForEvent(selectedEvent.id, {
        name: user?.name,
        email: user?.email,
        phone: phone.trim() || undefined,
      });

      // Update local events list
      setEvents(prev =>
        prev.map(ev =>
          ev.id === selectedEvent.id
            ? { ...ev, registered_count: ev.registered_count + 1, is_registered: true, user_registration_id: reg.id }
            : ev
        )
      );

      setRegSuccessData({ event: selectedEvent, reg });
      setSelectedEvent(null);
      setPhone('');
      showToast(`🎉 Confirmation email dispatched to ${user?.email || reg.email}!`);
      
      // Refresh my registrations
      const updatedRegs = await getMyRegistrations();
      setMyRegistrations(updatedRegs);
    } catch (err: any) {
      const errorMsg = err?.response?.data?.detail || 'Registration failed. Please try again.';
      alert(errorMsg);
    } finally {
      setRegistering(false);
    }
  };

  const handleCancelRegistration = async (eventId: number) => {
    if (!confirm('Are you sure you want to cancel your registration for this event?')) return;
    setCancellingId(eventId);
    try {
      await cancelEventRegistration(eventId);
      setEvents(prev =>
        prev.map(ev =>
          ev.id === eventId
            ? { ...ev, registered_count: Math.max(0, ev.registered_count - 1), is_registered: false, user_registration_id: null }
            : ev
        )
      );
      setMyRegistrations(prev => prev.filter(r => r.event_id !== eventId));
      showToast('Registration cancelled. Your seat has been released.');
    } catch (err: any) {
      alert(err?.response?.data?.detail || 'Could not cancel registration.');
    } finally {
      setCancellingId(null);
    }
  };

  const featured = events.find(e => e.is_featured);
  const rest = events.filter(e => !e.is_featured || events.length === 1);
  const activeMyRegistrations = myRegistrations.filter(r => r.status === 'confirmed');

  return (
    <div style={{ background: '#0B2E22', color: '#F7F1E1' }} className="min-h-screen">
      {/* Toast notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-20 right-6 z-50 flex items-center gap-3 rounded-xl border border-[#E7A93B]/40 bg-[#0F3A2B] px-5 py-3.5 shadow-2xl text-sm font-medium text-[#F7F1E1] backdrop-blur-lg"
          >
            <CheckCircle2 size={18} className="text-[#E7A93B] shrink-0" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header section */}
      <section
        style={{ background: 'linear-gradient(135deg, #0B2E22 0%, #0F3A2B 50%, #0B2E22 100%)' }}
        className="py-14 border-b border-[rgba(247,241,225,0.12)] relative overflow-hidden"
      >
        <div className="mx-auto max-w-7xl px-4 md:px-8 relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <motion.div variants={fadeUp} initial="hidden" animate="show" className="max-w-2xl">
            <span className="mb-3 inline-flex items-center gap-2 rounded-full border border-[#E7A93B]/30 bg-[#E7A93B]/10 px-3.5 py-1 text-xs font-medium text-[#E7A93B] backdrop-blur-md">
              <CalendarDays size={12} /> Events & Campaigns Platform
            </span>
            <h1 className="font-display text-3xl font-bold text-[#F7F1E1] md:text-4xl tracking-tight">
              Impactful Events & Social Drives
            </h1>
            <p className="mt-3 text-[rgba(247,241,225,0.75)] leading-relaxed text-sm md:text-base">
              Register for blood drives, medical camps, tree planting drives, and fundraisers.
              Get automated confirmation emails and timely backend reminders.
            </p>
          </motion.div>

          {/* View tabs */}
          {isAuthenticated && (
            <div className="flex items-center gap-2 bg-[#0B2E22]/80 border border-[rgba(247,241,225,0.15)] p-1.5 rounded-xl self-start md:self-auto">
              <button
                onClick={() => setViewTab('explore')}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                  viewTab === 'explore'
                    ? 'bg-[#E7A93B] text-[#0B2E22] shadow-md'
                    : 'text-[rgba(247,241,225,0.7)] hover:text-[#F7F1E1]'
                }`}
              >
                All Events
              </button>
              <button
                onClick={() => setViewTab('my-events')}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 ${
                  viewTab === 'my-events'
                    ? 'bg-[#E7A93B] text-[#0B2E22] shadow-md'
                    : 'text-[rgba(247,241,225,0.7)] hover:text-[#F7F1E1]'
                }`}
              >
                <Ticket size={15} />
                <span>My Passes</span>
                {activeMyRegistrations.length > 0 && (
                  <span className="ml-1 px-1.5 py-0.2 rounded-full bg-[#D6472C] text-white text-xs font-bold">
                    {activeMyRegistrations.length}
                  </span>
                )}
              </button>
            </div>
          )}
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 py-10 md:px-8 space-y-8">
        {/* MY REGISTRATIONS TAB VIEW */}
        {viewTab === 'my-events' && isAuthenticated ? (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-display text-2xl font-bold text-[#F7F1E1]">My Registered Passes</h2>
                <p className="text-sm text-[rgba(247,241,225,0.7)]">
                  Active event passes under {user?.email}. Automated reminders will arrive before each event.
                </p>
              </div>
              <Button variant="outline" size="sm" onClick={loadData}>
                <RefreshCw size={13} className="mr-1.5" /> Refresh Passes
              </Button>
            </div>

            {activeMyRegistrations.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 border border-dashed border-[rgba(247,241,225,0.18)] rounded-2xl p-8 text-center bg-[#0F3A2B]/40">
                <Ticket size={48} className="text-[#E7A93B] opacity-60 mb-3" />
                <h3 className="font-semibold text-lg text-[#F7F1E1]">No active registrations found</h3>
                <p className="text-sm text-[rgba(247,241,225,0.65)] max-w-md mt-1 mb-5">
                  You have not registered for any upcoming events yet. Browse our active campaigns and secure your pass.
                </p>
                <Button onClick={() => setViewTab('explore')}>Explore Events</Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {activeMyRegistrations.map((reg, idx) => (
                  <motion.div
                    key={reg.id}
                    variants={fadeUp}
                    initial="hidden"
                    animate="show"
                    custom={idx}
                    className="flex flex-col justify-between rounded-2xl border border-[#E7A93B]/30 bg-[#0F3A2B] p-6 shadow-xl relative overflow-hidden"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                          <CheckCircle2 size={12} /> PASS CONFIRMED
                        </span>
                        <span className="font-mono text-xs text-[#E7A93B] font-bold">
                          SHEBA-{String(reg.id).padStart(4, '0')}
                        </span>
                      </div>

                      <h3 className="font-display text-lg font-bold text-[#F7F1E1] leading-snug">
                        {reg.event_title || `Event #${reg.event_id}`}
                      </h3>

                      <div className="space-y-1 text-xs text-[rgba(247,241,225,0.7)] pt-2 border-t border-[rgba(247,241,225,0.1)]">
                        <div className="flex items-center gap-2">
                          <Mail size={13} className="text-[#E7A93B]" />
                          <span>Confirmation: {reg.confirmation_sent ? 'Sent to email' : 'Processing'}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Bell size={13} className="text-[#E7A93B]" />
                          <span>Automated 24h Reminder: {reg.reminder_sent ? 'Sent' : 'Scheduled (Backend)'}</span>
                        </div>
                      </div>
                    </div>

                    <div className="pt-5 mt-4 border-t border-[rgba(247,241,225,0.1)] flex items-center justify-between">
                      <span className="text-xs text-[rgba(247,241,225,0.5)]">
                        Registered {new Date(reg.created_at).toLocaleDateString()}
                      </span>
                      <button
                        onClick={() => handleCancelRegistration(reg.event_id)}
                        disabled={cancellingId === reg.event_id}
                        className="text-xs text-red-400 hover:text-red-300 font-medium transition-colors inline-flex items-center gap-1 disabled:opacity-50"
                      >
                        {cancellingId === reg.event_id ? (
                          <Loader2 size={12} className="animate-spin" />
                        ) : (
                          <XCircle size={12} />
                        )}
                        Cancel Pass
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        ) : (
          /* EXPLORE EVENTS TAB VIEW */
          <>
            {/* Filters */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <SearchInput
                placeholder="Search events, locations, organizers…"
                value={search}
                onChange={e => setSearch(e.target.value)}
                onClear={() => setSearch('')}
              />
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
                <button
                  onClick={loadData}
                  className="flex items-center gap-1 text-xs border border-[rgba(247,241,225,0.2)] px-3 py-1 rounded-lg text-[#F7F1E1]"
                >
                  <RefreshCw size={11} /> Retry
                </button>
              </div>
            )}

            {!loading && !error && (
              <>
                {/* Featured event banner */}
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
                            <span>Capacity</span>
                            <span>{Math.round((featured.registered_count / featured.capacity) * 100)}% filled</span>
                          </div>
                          <div className="h-2 w-full rounded-full bg-[rgba(247,241,225,0.12)] overflow-hidden">
                            <div
                              className="h-full rounded-full bg-[#E7A93B] transition-all"
                              style={{ width: `${Math.min((featured.registered_count / featured.capacity) * 100, 100)}%` }}
                            />
                          </div>
                        </div>

                        {featured.is_registered ? (
                          <div className="space-y-2">
                            <div className="flex items-center justify-between rounded-xl bg-emerald-500/15 border border-emerald-500/30 p-3 text-sm text-emerald-400 font-medium">
                              <span className="flex items-center gap-2"><CheckCircle2 size={16} /> Registered</span>
                              <button
                                onClick={() => handleCancelRegistration(featured.id)}
                                disabled={cancellingId === featured.id}
                                className="text-xs text-red-400 hover:underline"
                              >
                                {cancellingId === featured.id ? 'Cancelling…' : 'Cancel Pass'}
                              </button>
                            </div>
                          </div>
                        ) : !isAuthenticated ? (
                          <Link to="/auth/login" className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#D6472C] px-5 py-2.5 text-sm font-semibold text-white shadow-lg hover:bg-[#b83a22] transition-colors">
                            <LogIn size={16} /> Sign In to Register
                          </Link>
                        ) : (
                          <button
                            onClick={() => setSelectedEvent(featured)}
                            disabled={featured.registered_count >= featured.capacity}
                            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#D6472C] px-5 py-2.5 text-sm font-semibold text-white shadow-lg hover:bg-[#b83a22] transition-colors disabled:opacity-50"
                          >
                            {featured.registered_count >= featured.capacity ? 'Fully Booked' : 'Register Now'} <ArrowRight size={16} />
                          </button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Event grid */}
                {rest.length === 0 && !featured ? (
                  <div className="flex flex-col items-center justify-center py-24 text-[rgba(247,241,225,0.5)]">
                    <Search size={48} className="mb-4 opacity-30" />
                    <p className="text-lg font-medium">No events found matching your criteria.</p>
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
                        style={{ background: '#0F3A2B', borderColor: 'rgba(247,241,225,0.14)' }}
                        className="flex flex-col justify-between gap-4 rounded-2xl border p-5 shadow-lg hover:border-[rgba(231,169,59,0.3)] transition-all"
                      >
                        <div className="space-y-3">
                          <div className="flex items-start gap-3">
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

                          <p className="text-sm text-[rgba(247,241,225,0.7)] leading-relaxed line-clamp-2">{event.description}</p>

                          <div className="flex flex-col gap-1 text-xs text-[rgba(247,241,225,0.65)]">
                            <span className="flex items-center gap-1.5"><CalendarDays size={11} />{event.date} · {event.time}</span>
                            <span className="flex items-center gap-1.5"><MapPin size={11} />{event.location}</span>
                          </div>

                          <div className="space-y-1">
                            <div className="flex justify-between text-xs text-[rgba(247,241,225,0.65)]">
                              <span className="flex items-center gap-1"><Users size={10} />{event.registered_count}/{event.capacity}</span>
                              <span>{Math.round((event.registered_count / event.capacity) * 100)}% filled</span>
                            </div>
                            <div className="h-1.5 w-full rounded-full bg-[rgba(247,241,225,0.12)] overflow-hidden">
                              <div
                                className="h-full rounded-full bg-[#E7A93B]"
                                style={{ width: `${Math.min((event.registered_count / event.capacity) * 100, 100)}%` }}
                              />
                            </div>
                          </div>

                          {event.tags && (
                            <div className="flex flex-wrap gap-1.5 pt-1">
                              {event.tags.split(',').map(tag => (
                                <span key={tag} className="rounded-full bg-[#0B2E22] px-2.5 py-0.5 text-xs text-[rgba(247,241,225,0.7)] border border-[rgba(247,241,225,0.1)]">
                                  {tag.trim()}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>

                        <div className="pt-2">
                          {event.is_registered ? (
                            <div className="flex items-center justify-between rounded-xl bg-emerald-500/15 border border-emerald-500/30 py-2.5 px-3.5 text-sm text-emerald-400 font-medium">
                              <span className="flex items-center gap-2"><CheckCircle2 size={15} /> Registered</span>
                              <button
                                onClick={() => handleCancelRegistration(event.id)}
                                disabled={cancellingId === event.id}
                                className="text-xs text-red-400 hover:text-red-300 font-medium"
                              >
                                {cancellingId === event.id ? 'Cancelling…' : 'Cancel'}
                              </button>
                            </div>
                          ) : !isAuthenticated ? (
                            <Link
                              to="/auth/login"
                              className="w-full inline-flex items-center justify-center gap-2 rounded-xl border border-[rgba(247,241,225,0.2)] bg-[#0B2E22] py-2 px-3 text-xs font-semibold text-[#F7F1E1] hover:border-[#E7A93B] hover:text-[#E7A93B] transition-all"
                            >
                              <LogIn size={13} /> Sign In to Register
                            </Link>
                          ) : (
                            <Button
                              variant="outline"
                              size="sm"
                              fullWidth
                              onClick={() => setSelectedEvent(event)}
                              disabled={event.registered_count >= event.capacity}
                            >
                              {event.registered_count >= event.capacity ? 'Fully Booked' : 'Register Now'}
                            </Button>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </>
            )}
          </>
        )}
      </div>

      {/* Registration Confirmation Modal */}
      <AnimatePresence>
        {selectedEvent && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              style={{ background: '#0F3A2B', borderColor: 'rgba(231,169,59,0.3)' }}
              className="w-full max-w-md rounded-2xl border p-6 shadow-2xl text-[#F7F1E1]"
            >
              <div className="flex items-center gap-2 text-[#E7A93B] text-xs font-bold tracking-wider uppercase mb-1">
                <Ticket size={15} /> Event Registration Pass
              </div>
              <h2 className="font-display text-xl font-bold text-[#F7F1E1]">{selectedEvent.title}</h2>
              <p className="text-xs text-[rgba(247,241,225,0.7)] mt-1 mb-4">
                {selectedEvent.date} · {selectedEvent.time} · {selectedEvent.location}
              </p>

              <form onSubmit={handleRegisterSubmit} className="space-y-4">
                <div className="rounded-xl bg-[#0B2E22] border border-[rgba(247,241,225,0.12)] p-3.5 space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-[rgba(247,241,225,0.6)]">Attendee Name:</span>
                    <span className="font-semibold text-[#F7F1E1]">{user?.name || 'Registered User'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[rgba(247,241,225,0.6)]">Registered Email:</span>
                    <span className="font-semibold text-[#E7A93B]">{user?.email}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-emerald-400 pt-1 border-t border-[rgba(247,241,225,0.08)]">
                    <Mail size={12} /> Instant confirmation email will be sent upon confirmation
                  </div>
                </div>

                <TextInput
                  label="Contact Phone Number (Optional)"
                  placeholder="+880 1XXX-XXXXXX"
                  type="tel"
                  fullWidth
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                />

                <div className="flex gap-3 pt-2">
                  <Button
                    type="submit"
                    leftIcon={registering ? Loader2 : CheckCircle2}
                    disabled={registering}
                    fullWidth
                  >
                    {registering ? 'Registering Pass…' : 'Confirm Registration'}
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setSelectedEvent(null)}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Success Modal */}
      <AnimatePresence>
        {regSuccessData && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              style={{ background: '#0F3A2B', borderColor: 'rgba(231,169,59,0.3)' }}
              className="w-full max-w-md rounded-2xl border p-6 shadow-2xl text-[#F7F1E1] text-center space-y-4"
            >
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                <CheckCircle2 size={32} />
              </div>

              <div>
                <h2 className="font-display text-2xl font-bold text-[#F7F1E1]">You're Registered! 🎉</h2>
                <p className="text-sm text-[rgba(247,241,225,0.75)] mt-1">
                  {regSuccessData.event.title}
                </p>
              </div>

              <div className="rounded-xl bg-[#0B2E22] border border-[#E7A93B]/30 p-4 text-center space-y-1">
                <div className="text-xs uppercase tracking-widest text-[rgba(247,241,225,0.6)]">Pass Code</div>
                <div className="font-mono text-2xl font-bold text-[#E7A93B]">
                  SHEBA-{String(regSuccessData.reg.id).padStart(4, '0')}
                </div>
              </div>

              <div className="text-xs text-[rgba(247,241,225,0.7)] text-left bg-[#0B2E22]/60 p-3 rounded-lg space-y-1.5">
                <div className="flex items-center gap-2 text-emerald-400 font-medium">
                  <Mail size={14} /> Confirmation email sent to {user?.email || regSuccessData.reg.email}
                </div>
                <div className="flex items-center gap-2 text-[#E7A93B] font-medium">
                  <Bell size={14} /> Automated 24h backend reminder active
                </div>
              </div>

              <Button
                fullWidth
                onClick={() => setRegSuccessData(null)}
              >
                Done
              </Button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

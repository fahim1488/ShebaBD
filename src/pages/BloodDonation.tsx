import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Droplets, MapPin, Phone, Clock, Search, Heart,
  CheckCircle2, ShieldCheck, AlertTriangle, User,
  Send, Loader2, RefreshCw, AlertCircle, Plus,
  Thermometer, Activity,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { TextInput } from '@/components/ui/input';
import { useAuth } from '@/hooks/useAuth';
import {
  getBloodStats,
  searchDonors,
  createBloodRequest,
  registerDonor,
  getMyDonorProfile,
  updateMyAvailability,
  getBloodRequests,
  fulfillBloodRequest,
  BLOOD_GROUPS as API_BLOOD_GROUPS,
  type BloodDonor, type BloodRequest, type BloodStats,
} from '@/services/bloodApi';
import { ROUTES } from '@/constants/routes';

const BLOOD_GROUPS = ['All', ...API_BLOOD_GROUPS];
const DISTRICTS = ['All Districts','Dhaka','Chittagong','Sylhet','Rajshahi','Khulna','Barisal','Mymensingh','Rangpur','Comilla','Narayanganj','Gazipur'];

const GROUP_COLORS: Record<string, string> = {
  'O+': 'bg-red-500 text-white', 'O-': 'bg-red-700 text-white',
  'A+': 'bg-blue-500 text-white', 'A-': 'bg-blue-700 text-white',
  'B+': 'bg-green-500 text-white', 'B-': 'bg-green-700 text-white',
  'AB+': 'bg-purple-500 text-white', 'AB-': 'bg-purple-700 text-white',
};

const URGENCY_CONFIG = {
  normal:   { label: 'Normal',   cls: 'border-green-500/40 text-green-500',  badge: 'bg-green-500/10 text-green-500' },
  urgent:   { label: 'Urgent',   cls: 'border-yellow-500/40 text-yellow-500',badge: 'bg-yellow-500/10 text-yellow-500' },
  critical: { label: 'Critical', cls: 'border-red-500/40 text-red-500',      badge: 'bg-red-500/10 text-red-500 animate-pulse' },
};

function timeAgo(iso: string | null): string {
  if (!iso) return 'Never donated';
  const diff = Date.now() - new Date(iso).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return 'Today';
  if (days < 7) return `${days} day${days > 1 ? 's' : ''} ago`;
  if (days < 30) return `${Math.floor(days / 7)} week${Math.floor(days/7) > 1 ? 's' : ''} ago`;
  if (days < 365) return `${Math.floor(days / 30)} month${Math.floor(days/30) > 1 ? 's' : ''} ago`;
  return `${Math.floor(days / 365)} year${Math.floor(days/365) > 1 ? 's' : ''} ago`;
}

function ErrorBanner({ msg, onRetry }: { msg: string; onRetry: () => void }) {
  return (
    <div className="flex items-center gap-3 rounded-ds-lg border border-red-500/20 bg-red-500/5 p-4 my-4">
      <AlertCircle size={16} className="text-red-500 shrink-0" />
      <p className="text-sm text-ds-foreground flex-1">{msg}</p>
      <button onClick={onRetry} className="flex items-center gap-1 text-xs border border-ds-muted/20 px-3 py-1 rounded-ds-md text-ds-muted hover:text-ds-foreground">
        <RefreshCw size={11} /> Retry
      </button>
    </div>
  );
}

export default function BloodDonation() {
  const { user } = useAuth();
  const [tab, setTab] = useState<'find' | 'request' | 'register' | 'requests'>('find');

  // Stats
  const [stats, setStats] = useState<BloodStats | null>(null);

  // Find donors
  const [donors, setDonors] = useState<BloodDonor[]>([]);
  const [donorsLoading, setDonorsLoading] = useState(false);
  const [donorsError, setDonorsError] = useState<string | null>(null);
  const [activeGroup, setActiveGroup] = useState('All');
  const [activeDistrict, setActiveDistrict] = useState('All Districts');
  const [showUnavailable, setShowUnavailable] = useState(false);

  // Blood requests list
  const [requests, setRequests] = useState<BloodRequest[]>([]);
  const [requestsLoading, setRequestsLoading] = useState(false);
  const [requestsError, setRequestsError] = useState<string | null>(null);

  // My donor profile
  const [myProfile, setMyProfile] = useState<BloodDonor | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);

  // Forms
  const [registerForm, setRegisterForm] = useState({
    name: user?.name || '', phone: '', blood_group: '', district: '', area: '', age: '', weight_kg: '',
  });
  const [requestForm, setRequestForm] = useState({
    patient_name: '', contact_name: user?.name || '', contact_phone: '',
    blood_group: '', units_needed: 1, hospital_name: '', hospital_district: 'Dhaka',
    hospital_address: '', urgency: 'normal', notes: '',
  });
  const [formLoading, setFormLoading] = useState(false);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  // Load stats once
  useEffect(() => {
    getBloodStats().then(setStats).catch(() => {});
  }, []);

  // Load my profile if logged in
  useEffect(() => {
    if (!user) return;
    setProfileLoading(true);
    getMyDonorProfile()
      .then(setMyProfile)
      .catch(() => setMyProfile(null))
      .finally(() => setProfileLoading(false));
  }, [user]);

  const loadDonors = useCallback(async () => {
    setDonorsLoading(true);
    setDonorsError(null);
    try {
      const data = await searchDonors({
        blood_group: activeGroup === 'All' ? undefined : activeGroup,
        district: activeDistrict === 'All Districts' ? undefined : activeDistrict,
        available_only: !showUnavailable,
        limit: 50,
      });
      setDonors(data);
    } catch {
      setDonorsError('Could not load donors. Please try again.');
    } finally {
      setDonorsLoading(false);
    }
  }, [activeGroup, activeDistrict, showUnavailable]);

  const loadRequests = useCallback(async () => {
    setRequestsLoading(true);
    setRequestsError(null);
    try {
      setRequests(await getBloodRequests(50, 0));
    } catch {
      setRequestsError('Could not load blood requests.');
    } finally {
      setRequestsLoading(false);
    }
  }, []);

  useEffect(() => { loadDonors(); }, [loadDonors]);
  useEffect(() => { if (tab === 'requests') loadRequests(); }, [tab, loadRequests]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setFormLoading(true); setFormError(null);
    try {
      const donor = await registerDonor({
        name: registerForm.name,
        phone: registerForm.phone,
        blood_group: registerForm.blood_group,
        district: registerForm.district,
        area: registerForm.area || '',
        age: registerForm.age ? parseInt(registerForm.age) : 25,
        weight_kg: registerForm.weight_kg ? parseInt(registerForm.weight_kg) : 60,
      });
      setMyProfile(donor);
      setFormSuccess('registered');
      getBloodStats().then(setStats).catch(() => {});
    } catch (err: any) {
      setFormError(err?.message || 'Registration failed. Please try again.');
    } finally {
      setFormLoading(false);
    }
  };

  const handleRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true); setFormError(null);
    try {
      await createBloodRequest({
        patient_name: requestForm.patient_name,
        contact_name: requestForm.contact_name,
        contact_phone: requestForm.contact_phone,
        blood_group: requestForm.blood_group,
        units_needed: requestForm.units_needed,
        hospital_name: requestForm.hospital_name,
        hospital_district: requestForm.hospital_district,
        hospital_address: requestForm.hospital_address || undefined,
        urgency: requestForm.urgency,
        notes: requestForm.notes || undefined,
      });
      setFormSuccess('requested');
      getBloodStats().then(setStats).catch(() => {});
    } catch (err: any) {
      setFormError(err?.message || 'Failed to submit request. Please try again.');
    } finally {
      setFormLoading(false);
    }
  };

  const handleToggleAvailability = async () => {
    if (!myProfile) return;
    try {
      const updated = await updateMyAvailability(!myProfile.is_available);
      setMyProfile(updated);
      getBloodStats().then(setStats).catch(() => {});
    } catch { /* silent */ }
  };

  const handleFulfill = async (id: number) => {
    try {
      await fulfillBloodRequest(id);
      setRequests(p => p.filter(r => r.id !== id));
      getBloodStats().then(setStats).catch(() => {});
    } catch { /* silent */ }
  };

  return (
    <div className="min-h-screen bg-ds-background">
      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <section className="bg-gradient-to-br from-red-500/5 via-ds-background to-ds-primary/5 py-14">
        <div className="mx-auto max-w-7xl px-4 md:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl">
            <span className="mb-3 inline-flex items-center gap-2 rounded-ds-full border border-red-500/20 bg-red-500/10 px-3 py-1 text-xs font-medium text-red-500">
              <Droplets size={12} /> Blood Donation Network
            </span>
            <h1 className="font-display text-3xl font-bold text-ds-foreground md:text-4xl">Every Drop Counts</h1>
            <p className="mt-3 text-ds-muted">
              AI-powered blood donor matching by blood group, location, and availability. Find a donor or register to save a life.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ── Stats ─────────────────────────────────────────────────────────── */}
      <section className="border-y border-ds-muted/10 bg-ds-surface py-8">
        <div className="mx-auto max-w-7xl px-4 md:px-8">
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {[
              { val: stats?.total_donors?.toLocaleString() ?? '…', label: 'Registered Donors' },
              { val: stats?.available_donors?.toLocaleString() ?? '…', label: 'Available Now' },
              { val: stats?.active_requests?.toLocaleString() ?? '…', label: 'Active Requests' },
              { val: '56 days', label: 'Min. donation gap' },
            ].map(({ val, label }, i) => (
              <motion.div key={label} initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.07 }} viewport={{ once: true }} className="text-center">
                <p className="font-display text-xl font-bold text-red-500 md:text-2xl">{val}</p>
                <p className="mt-1 text-xs text-ds-muted">{label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 py-10 md:px-8">
        {/* ── Tabs ──────────────────────────────────────────────────────────── */}
        <div className="mb-8 flex flex-wrap gap-2 rounded-ds-lg border border-ds-muted/10 bg-ds-surface p-1 w-fit">
          {([
            { id: 'find',     label: 'Find Donor',       icon: Search },
            { id: 'requests', label: 'Blood Requests',   icon: Activity },
            { id: 'request',  label: 'Request Blood',    icon: AlertTriangle },
            { id: 'register', label: 'Register as Donor',icon: Heart },
          ] as const).map(({ id, label, icon: Icon }) => (
            <button key={id} onClick={() => { setTab(id); setFormSuccess(null); setFormError(null); }}
              className={`flex items-center gap-2 rounded-ds-md px-4 py-2 text-sm font-medium transition-colors ${
                tab === id ? 'bg-red-500 text-white shadow-ds-sm' : 'text-ds-muted hover:text-ds-foreground'
              }`}>
              <Icon size={14} />{label}
            </button>
          ))}
        </div>

        {/* ── FIND DONOR ────────────────────────────────────────────────────── */}
        {tab === 'find' && (
          <div className="space-y-5">
            {/* Filters */}
            <div className="flex flex-wrap items-center gap-4 rounded-ds-lg border border-ds-muted/10 bg-ds-surface p-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm font-medium text-ds-muted shrink-0">Blood Group:</span>
                <div className="flex flex-wrap gap-1.5">
                  {BLOOD_GROUPS.map(g => (
                    <button key={g} onClick={() => setActiveGroup(g)}
                      className={`rounded-ds-md border px-3 py-1 text-sm font-semibold transition-colors ${
                        activeGroup === g ? 'border-red-500 bg-red-500 text-white' : 'border-ds-muted/20 bg-ds-background text-ds-muted hover:border-red-500/40'
                      }`}>{g}</button>
                  ))}
                </div>
              </div>
              <select value={activeDistrict} onChange={e => setActiveDistrict(e.target.value)}
                className="h-9 rounded-ds-md border border-ds-muted/30 bg-ds-surface px-3 text-sm text-ds-foreground focus:outline-none focus:ring-2 focus:ring-red-500/30">
                {DISTRICTS.map(d => <option key={d}>{d}</option>)}
              </select>
              <label className="flex items-center gap-2 text-sm text-ds-muted cursor-pointer">
                <input type="checkbox" checked={showUnavailable} onChange={e => setShowUnavailable(e.target.checked)}
                  className="rounded border-ds-muted/30 text-red-500 focus:ring-red-500/20" />
                Show unavailable
              </label>
            </div>

            {donorsLoading && (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="h-8 w-8 animate-spin text-red-500" />
              </div>
            )}
            {donorsError && <ErrorBanner msg={donorsError} onRetry={loadDonors} />}

            {!donorsLoading && !donorsError && (
              <>
                <p className="text-sm text-ds-muted">
                  Found <span className="font-semibold text-ds-foreground">{donors.length}</span> donors
                  {activeGroup !== 'All' && <span className="text-red-500 font-semibold"> ({activeGroup})</span>}
                  {activeDistrict !== 'All Districts' && <span> in {activeDistrict}</span>}
                </p>

                {/* Group availability chips */}
                {stats?.donors_by_group && Object.keys(stats.donors_by_group).length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(stats.donors_by_group).sort((a, b) => b[1] - a[1]).map(([grp, cnt]) => (
                      <button key={grp} onClick={() => setActiveGroup(grp)}
                        className={`inline-flex items-center gap-1.5 rounded-ds-full border px-3 py-1 text-xs font-semibold transition-all ${
                          activeGroup === grp ? `${GROUP_COLORS[grp]} border-transparent` : 'border-ds-muted/20 text-ds-muted'
                        }`}>
                        <span className={`h-2 w-2 rounded-full ${GROUP_COLORS[grp]?.split(' ')[0] ?? 'bg-ds-muted'}`} />
                        {grp} · {cnt} available
                      </button>
                    ))}
                  </div>
                )}

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {donors.map((donor, i) => (
                    <motion.div key={donor.id}
                      initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.04 }} viewport={{ once: true }}
                      className="flex flex-col gap-3 rounded-ds-xl border border-ds-muted/10 bg-ds-surface p-4 shadow-ds-sm hover:shadow-ds-md transition-all">
                      <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-ds-full bg-red-500/10 text-sm font-bold text-red-500">
                          {donor.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1">
                            <p className="font-semibold text-ds-foreground truncate text-sm">{donor.name}</p>
                            {donor.is_verified && <ShieldCheck size={12} className="text-blue-500 shrink-0" />}
                          </div>
                          <div className="flex items-center gap-1 text-xs text-ds-muted">
                            <MapPin size={10} /> {donor.area ? `${donor.area}, ` : ''}{donor.district}
                          </div>
                        </div>
                        <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-ds-lg text-sm font-bold ${GROUP_COLORS[donor.blood_group] ?? 'bg-ds-muted/10'}`}>
                          {donor.blood_group}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-xs text-ds-muted border-t border-ds-muted/10 pt-2">
                        <span className="flex items-center gap-1"><Clock size={10} />{timeAgo(donor.last_donated_at)}</span>
                        <span className="flex items-center gap-1"><Heart size={10} className="text-red-500" />{donor.total_donations} donations</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className={`flex-1 rounded-ds-full text-center px-2 py-0.5 text-xs font-medium ${
                          donor.is_available ? 'bg-green-500/10 text-green-500' : 'bg-ds-muted/10 text-ds-muted'
                        }`}>
                          {donor.is_available ? '✓ Available' : '✗ Unavailable'}
                        </span>
                        {donor.is_available && (
                          <a href={`tel:${donor.phone}`}
                            className="flex items-center gap-1 rounded-ds-md border border-ds-muted/20 px-2.5 py-1 text-xs font-medium text-ds-muted hover:border-red-500 hover:text-red-500 transition-colors">
                            <Phone size={11} /> Call
                          </a>
                        )}
                      </div>
                    </motion.div>
                  ))}

                  {donors.length === 0 && (
                    <div className="col-span-full flex flex-col items-center gap-3 py-16 text-center">
                      <Droplets size={40} className="text-ds-muted/30" />
                      <p className="font-semibold text-ds-foreground">No donors found</p>
                      <p className="text-sm text-ds-muted">Try changing blood group or district filters.</p>
                      <Button variant="outline" onClick={() => { setActiveGroup('All'); setActiveDistrict('All Districts'); }}>
                        Clear Filters
                      </Button>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        )}

        {/* ── BLOOD REQUESTS LIST ────────────────────────────────────────────── */}
        {tab === 'requests' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-ds-muted">
                <span className="font-semibold text-ds-foreground">{requests.length}</span> active blood requests
              </p>
              <button onClick={loadRequests} className="flex items-center gap-1 text-xs text-ds-muted border border-ds-muted/20 px-3 py-1.5 rounded-ds-md hover:text-ds-foreground">
                <RefreshCw size={11} /> Refresh
              </button>
            </div>

            {requestsLoading && <div className="flex justify-center py-12"><Loader2 className="h-7 w-7 animate-spin text-red-500" /></div>}
            {requestsError && <ErrorBanner msg={requestsError} onRetry={loadRequests} />}

            {!requestsLoading && !requestsError && (
              <>
                {requests.map((req, i) => {
                  const urg = URGENCY_CONFIG[req.urgency as keyof typeof URGENCY_CONFIG] ?? URGENCY_CONFIG.normal;
                  return (
                    <motion.div key={req.id} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="rounded-ds-xl border border-ds-muted/10 bg-ds-surface p-5 shadow-ds-sm">
                      <div className="flex items-start justify-between gap-4 flex-wrap">
                        <div className="flex items-start gap-4">
                          <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-ds-lg text-sm font-bold ${GROUP_COLORS[req.blood_group] ?? 'bg-ds-muted/10'}`}>
                            {req.blood_group}
                          </span>
                          <div>
                            <div className="flex items-center gap-2 flex-wrap mb-1">
                              <p className="font-semibold text-ds-foreground">{req.patient_name}</p>
                              <span className={`text-xs px-2 py-0.5 rounded-ds-full font-medium ${urg.badge}`}>
                                {urg.label}
                              </span>
                              <span className="text-xs text-ds-muted">{req.units_needed} unit{req.units_needed > 1 ? 's' : ''} needed</span>
                            </div>
                            <p className="text-sm text-ds-muted flex items-center gap-1">
                              <MapPin size={11} /> {req.hospital_name}, {req.hospital_district}
                            </p>
                            {req.notes && <p className="text-xs text-ds-muted mt-1 italic">"{req.notes}"</p>}
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <a href={`tel:${req.contact_phone}`}
                            className="flex items-center gap-1.5 rounded-ds-md border border-red-500/30 bg-red-500/5 px-3 py-1.5 text-sm font-medium text-red-500 hover:bg-red-500/10 transition-colors">
                            <Phone size={13} /> {req.contact_phone}
                          </a>
                          {user && (
                            <button onClick={() => handleFulfill(req.id)}
                              className="flex items-center gap-1 text-xs text-ds-muted border border-ds-muted/20 px-2.5 py-1 rounded-ds-md hover:text-ds-success hover:border-ds-success/40">
                              <CheckCircle2 size={11} /> Mark Fulfilled
                            </button>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
                {requests.length === 0 && (
                  <div className="flex flex-col items-center gap-3 py-16 text-center">
                    <CheckCircle2 size={40} className="text-green-500/40" />
                    <p className="font-semibold text-ds-foreground">No active blood requests</p>
                    <p className="text-sm text-ds-muted">All current needs have been fulfilled.</p>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* ── REQUEST BLOOD ──────────────────────────────────────────────────── */}
        {tab === 'request' && (
          <div className="max-w-2xl">
            <div className="rounded-ds-xl border border-ds-muted/10 bg-ds-surface p-6 md:p-8 shadow-ds-sm">
              <h2 className="font-display text-xl font-bold text-ds-foreground mb-5">Blood Request Form</h2>

              <AnimatePresence mode="wait">
                {formSuccess === 'requested' ? (
                  <motion.div key="ok" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col items-center gap-4 py-12 text-center">
                    <CheckCircle2 size={52} className="text-green-500" />
                    <h3 className="font-display text-xl font-bold text-ds-foreground">Request Submitted!</h3>
                    <p className="text-sm text-ds-muted max-w-sm">
                      Your blood request is live. Matching donors in the area have been notified. You'll receive calls shortly.
                    </p>
                    <div className="flex gap-3">
                      <Button variant="outline" onClick={() => { setFormSuccess(null); setRequestForm({ patient_name: '', contact_name: user?.name || '', contact_phone: '', blood_group: '', units_needed: 1, hospital_name: '', hospital_district: 'Dhaka', hospital_address: '', urgency: 'normal', notes: '' }); }}>
                        New Request
                      </Button>
                      <Button variant="outline" onClick={() => setTab('requests')}>View All Requests</Button>
                    </div>
                  </motion.div>
                ) : (
                  <motion.form key="form" onSubmit={handleRequest} className="space-y-4">
                    {formError && (
                      <div className="flex items-center gap-2 rounded-ds-lg bg-red-500/10 border border-red-500/20 p-3">
                        <AlertCircle size={15} className="text-red-500" />
                        <p className="text-sm text-red-500">{formError}</p>
                      </div>
                    )}
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <TextInput label="Patient Name" placeholder="Patient's full name" required fullWidth
                        value={requestForm.patient_name} onChange={e => setRequestForm(f => ({ ...f, patient_name: e.target.value }))} />
                      <TextInput label="Contact Name" placeholder="Your name" required fullWidth
                        value={requestForm.contact_name} onChange={e => setRequestForm(f => ({ ...f, contact_name: e.target.value }))} />
                    </div>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <TextInput label="Contact Phone" placeholder="+880 1XXX-XXXXXX" type="tel" required fullWidth
                        value={requestForm.contact_phone} onChange={e => setRequestForm(f => ({ ...f, contact_phone: e.target.value }))} />
                      <div>
                        <label className="block text-sm font-medium text-ds-foreground mb-1.5">Blood Group Required <span className="text-red-500">*</span></label>
                        <div className="flex flex-wrap gap-1.5">
                          {BLOOD_GROUPS.slice(1).map(g => (
                            <button key={g} type="button" onClick={() => setRequestForm(f => ({ ...f, blood_group: g }))}
                              className={`rounded-ds-md border px-2.5 py-1 text-xs font-bold transition-colors ${
                                requestForm.blood_group === g ? `${GROUP_COLORS[g]} border-transparent` : 'border-ds-muted/20 text-ds-muted'
                              }`}>{g}</button>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <TextInput label="Hospital Name" placeholder="Hospital name" required fullWidth prefixIcon={MapPin}
                        value={requestForm.hospital_name} onChange={e => setRequestForm(f => ({ ...f, hospital_name: e.target.value }))} />
                      <div>
                        <label className="block text-sm font-medium text-ds-foreground mb-1.5">Hospital District <span className="text-red-500">*</span></label>
                        <select required value={requestForm.hospital_district} onChange={e => setRequestForm(f => ({ ...f, hospital_district: e.target.value }))}
                          className="h-10 w-full rounded-ds-md border border-ds-muted/30 bg-ds-surface px-3 text-sm text-ds-foreground focus:outline-none focus:ring-2 focus:ring-red-500/30">
                          {DISTRICTS.slice(1).map(d => <option key={d}>{d}</option>)}
                        </select>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div>
                        <label className="block text-sm font-medium text-ds-foreground mb-1.5">Units Needed</label>
                        <select value={requestForm.units_needed} onChange={e => setRequestForm(f => ({ ...f, units_needed: parseInt(e.target.value) }))}
                          className="h-10 w-full rounded-ds-md border border-ds-muted/30 bg-ds-surface px-3 text-sm text-ds-foreground focus:outline-none focus:ring-2 focus:ring-red-500/30">
                          {[1,2,3,4,5].map(u => <option key={u} value={u}>{u} unit{u > 1 ? 's' : ''}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-ds-foreground mb-1.5">Urgency Level</label>
                        <div className="flex gap-2">
                          {(['normal','urgent','critical'] as const).map(u => (
                            <button key={u} type="button" onClick={() => setRequestForm(f => ({ ...f, urgency: u }))}
                              className={`flex-1 rounded-ds-md border py-2 text-xs font-medium transition-colors capitalize ${
                                requestForm.urgency === u ? URGENCY_CONFIG[u].cls + ' bg-current/5' : 'border-ds-muted/20 text-ds-muted'
                              }`}>{u}</button>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-ds-foreground mb-1.5">Additional Notes (optional)</label>
                      <textarea rows={2} placeholder="Any additional info for donors..."
                        className="w-full rounded-ds-md border border-ds-muted/20 bg-ds-background px-3 py-2 text-sm focus:border-red-500/50 focus:outline-none focus:ring-2 focus:ring-red-500/20"
                        value={requestForm.notes} onChange={e => setRequestForm(f => ({ ...f, notes: e.target.value }))} />
                    </div>
                    <Button type="submit" variant="danger" fullWidth size="lg" leftIcon={formLoading ? Loader2 : Send}
                      disabled={formLoading || !requestForm.patient_name || !requestForm.contact_phone || !requestForm.blood_group || !requestForm.hospital_name}>
                      {formLoading ? 'Submitting…' : 'Send Blood Request'}
                    </Button>
                  </motion.form>
                )}
              </AnimatePresence>
            </div>
          </div>
        )}

        {/* ── REGISTER AS DONOR ─────────────────────────────────────────────── */}
        {tab === 'register' && (
          <div className="max-w-2xl">
            <div className="rounded-ds-xl border border-ds-muted/10 bg-ds-surface p-6 md:p-8 shadow-ds-sm">
              <div className="flex items-center gap-3 mb-5">
                <div className="flex h-12 w-12 items-center justify-center rounded-ds-lg bg-red-500/10 text-red-500">
                  <Heart size={24} />
                </div>
                <div>
                  <h2 className="font-display text-xl font-bold text-ds-foreground">Register as Blood Donor</h2>
                  <p className="text-sm text-ds-muted">Your donation can save up to 3 lives.</p>
                </div>
              </div>

              {/* My profile panel — if already registered */}
              {myProfile && formSuccess !== 'registered' && (
                <div className="mb-6 rounded-ds-lg border border-green-500/20 bg-green-500/5 p-4">
                  <div className="flex items-center justify-between flex-wrap gap-3">
                    <div>
                      <p className="font-semibold text-ds-foreground flex items-center gap-2">
                        <ShieldCheck size={15} className="text-green-500" />
                        You're registered as a donor
                      </p>
                      <p className="text-sm text-ds-muted mt-1">
                        {myProfile.blood_group} · {myProfile.district}
                        {myProfile.area && ` · ${myProfile.area}`}
                        · {myProfile.total_donations} donation{myProfile.total_donations !== 1 ? 's' : ''}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={handleToggleAvailability}
                        className={`rounded-ds-md border px-3 py-1.5 text-xs font-medium transition-colors ${
                          myProfile.is_available
                            ? 'border-green-500/30 bg-green-500/10 text-green-500 hover:bg-red-500/10 hover:text-red-500 hover:border-red-500/30'
                            : 'border-ds-muted/20 text-ds-muted hover:border-green-500/30 hover:text-green-500'
                        }`}>
                        {myProfile.is_available ? '✓ Available — click to pause' : '✗ Unavailable — click to activate'}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {!user ? (
                <div className="flex flex-col items-center gap-4 py-10 text-center">
                  <User size={40} className="text-ds-muted/30" />
                  <p className="font-semibold text-ds-foreground">Sign in to register as a donor</p>
                  <p className="text-sm text-ds-muted">Create an account to join Bangladesh's blood donor network.</p>
                  <Link to={ROUTES.SIGN_IN}>
                    <Button leftIcon={User}>Sign In</Button>
                  </Link>
                </div>
              ) : (
                <AnimatePresence mode="wait">
                  {formSuccess === 'registered' ? (
                    <motion.div key="ok" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                      className="flex flex-col items-center gap-4 py-10 text-center">
                      <div className="flex h-16 w-16 items-center justify-center rounded-ds-full bg-red-500/10 text-red-500">
                        <ShieldCheck size={36} />
                      </div>
                      <h3 className="font-display text-xl font-bold text-ds-foreground">You're Registered!</h3>
                      <p className="text-sm text-ds-muted max-w-sm">
                        Welcome to ShebaBD's blood donor network. You'll be notified when someone nearby needs blood.
                      </p>
                      <Button variant="outline" leftIcon={Search} onClick={() => setTab('find')}>View Donor Directory</Button>
                    </motion.div>
                  ) : (
                    <motion.form key="form" onSubmit={handleRegister} className="space-y-4">
                      {formError && (
                        <div className="flex items-center gap-2 rounded-ds-lg bg-red-500/10 border border-red-500/20 p-3">
                          <AlertCircle size={15} className="text-red-500" />
                          <p className="text-sm text-red-500">{formError}</p>
                        </div>
                      )}
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <TextInput label="Full Name" placeholder="Your full name" required fullWidth
                          value={registerForm.name} onChange={e => setRegisterForm(f => ({ ...f, name: e.target.value }))} />
                        <TextInput label="Phone" placeholder="+880 1XXX-XXXXXX" type="tel" required fullWidth
                          value={registerForm.phone} onChange={e => setRegisterForm(f => ({ ...f, phone: e.target.value }))} />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-ds-foreground mb-1.5">
                          Blood Group <span className="text-red-500">*</span>
                        </label>
                        <div className="flex flex-wrap gap-2">
                          {BLOOD_GROUPS.slice(1).map(g => (
                            <button key={g} type="button" onClick={() => setRegisterForm(f => ({ ...f, blood_group: g }))}
                              className={`rounded-ds-md border px-3 py-1.5 text-sm font-bold transition-colors ${
                                registerForm.blood_group === g ? `${GROUP_COLORS[g]} border-transparent` : 'border-ds-muted/20 text-ds-muted'
                              }`}>{g}</button>
                          ))}
                        </div>
                      </div>
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div>
                          <label className="block text-sm font-medium text-ds-foreground mb-1.5">District <span className="text-red-500">*</span></label>
                          <select required value={registerForm.district} onChange={e => setRegisterForm(f => ({ ...f, district: e.target.value }))}
                            className="h-10 w-full rounded-ds-md border border-ds-muted/30 bg-ds-surface px-3 text-sm text-ds-foreground focus:outline-none focus:ring-2 focus:ring-red-500/30">
                            <option value="">Select district</option>
                            {DISTRICTS.slice(1).map(d => <option key={d}>{d}</option>)}
                          </select>
                        </div>
                        <TextInput label="Area / Thana (optional)" placeholder="e.g. Mirpur, Dhanmondi" fullWidth
                          value={registerForm.area} onChange={e => setRegisterForm(f => ({ ...f, area: e.target.value }))} />
                      </div>
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <TextInput label="Age" placeholder="Must be 18–65" type="number" fullWidth
                          value={registerForm.age} onChange={e => setRegisterForm(f => ({ ...f, age: e.target.value }))} />
                        <TextInput label="Weight (kg)" placeholder="Must be ≥50 kg" type="number" fullWidth
                          value={registerForm.weight_kg} onChange={e => setRegisterForm(f => ({ ...f, weight_kg: e.target.value }))} />
                      </div>
                      <div className="rounded-ds-lg bg-blue-500/5 border border-blue-500/20 p-3 text-xs text-ds-muted space-y-1">
                        <p className="font-medium text-ds-foreground flex items-center gap-1.5"><Thermometer size={12} className="text-blue-500" /> Eligibility Requirements</p>
                        <p>• Age 18–65 · Weight ≥50 kg · In good health</p>
                        <p>• No donation in the last 56 days</p>
                        <p>• No recent illness, surgery, or travel to high-risk areas</p>
                      </div>
                      <Button type="submit" size="lg" fullWidth leftIcon={formLoading ? Loader2 : Heart}
                        className="bg-red-500 hover:bg-red-600 text-white border-0"
                        disabled={formLoading || !registerForm.name || !registerForm.phone || !registerForm.blood_group || !registerForm.district}>
                        {formLoading ? 'Registering…' : myProfile ? 'Update Registration' : 'Register as Donor'}
                      </Button>
                    </motion.form>
                  )}
                </AnimatePresence>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
/* Fahim: Blood donation page */ 

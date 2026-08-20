import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, Mail, Shield, Camera, Eye, EyeOff, Save, AlertCircle, CheckCircle2,
  Award, Heart, Activity, Calendar, MapPin, Phone, BadgeCheck, Zap, Sparkles,
  ChevronRight, Bell, Copy, Flame, Clock, Layers
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/hooks/useLanguage';
import type { UpdateProfilePayload, ChangePasswordPayload } from '@/context/AuthContext';

// Design tokens matching Home Page Forest Ink Theme
const INK = '#0B2E22';
const INK2 = '#0F3A2B';
const PAPER = '#F7F1E1';
const DISC = '#D6472C';
const MARIG = '#E7A93B';
const SKY = '#3E7A8C';
const MUTED = 'rgba(247,241,225,0.7)';
const LINE = 'rgba(247,241,225,0.14)';

type ProfileFormValues = {
  name: string;
  avatar: string;
  phone?: string;
  location?: string;
  bio?: string;
};

type PasswordFormValues = {
  current_password: string;
  new_password: string;
  confirm_password: string;
};

const ACHIEVEMENTS = [
  { id: '1', title: 'Life Saver', desc: 'Completed 3+ blood donations', icon: Heart, color: '#D6472C', unlocked: true, date: 'Aug 2026' },
  { id: '2', title: 'Fast Responder', desc: 'Responded to emergency alert in <10m', icon: Zap, color: '#E7A93B', unlocked: true, date: 'Jul 2026' },
  { id: '3', title: 'Community Pillar', desc: 'Top contributor in relief drives', icon: Award, color: '#3E7A8C', unlocked: true, date: 'Jun 2026' },
  { id: '4', title: 'Super Supporter', desc: 'Donated over ৳10,000 to verified NGOs', icon: Sparkles, color: '#10B981', unlocked: false, date: 'Locked' },
];

const RECENT_ACTIVITIES = [
  { id: 'a1', title: 'Donated ৳2,500 for Flood Relief', category: 'Donation', time: '2 days ago', status: 'Verified', icon: Heart, color: '#D6472C' },
  { id: 'a2', title: 'Registered for Dhaka Medical Camp Event', category: 'Event', time: '5 days ago', status: 'Confirmed', icon: Calendar, color: '#E7A93B' },
  { id: 'a3', title: 'Responded to Emergency Flood Request EM-8491', category: 'Emergency', time: '1 week ago', status: 'Resolved', icon: Zap, color: '#3E7A8C' },
  { id: 'a4', title: 'Updated Donor Blood Group & Availability', category: 'Profile', time: '2 weeks ago', status: 'Active', icon: Activity, color: '#10B981' },
];

export default function Profile() {
  const { user, updateProfile, changePassword } = useAuth();
  const { t } = useLanguage();
  
  const [activeTab, setActiveTab] = useState<'overview' | 'profile' | 'password' | 'badges'>('overview');
  const [isUpdating, setIsUpdating] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [copiedId, setCopiedId] = useState(false);

  // Extra profile attributes for realistic demo
  const [phone, setPhone] = useState('+880 1712-345678');
  const [location, setLocation] = useState('Dhaka, Bangladesh');
  const [bio, setBio] = useState('Passionate about community welfare, emergency response & blood donation.');

  // Forms
  const profileForm = useForm<ProfileFormValues>({
    defaultValues: {
      name: user?.name || '',
      avatar: user?.avatar || '',
    },
  });

  const passwordForm = useForm<PasswordFormValues>({
    defaultValues: {
      current_password: '',
      new_password: '',
      confirm_password: '',
    },
  });

  const onUpdateProfile = async (values: ProfileFormValues) => {
    setIsUpdating(true);
    setErrorMsg('');
    setSuccessMsg('');
    
    try {
      const payload: UpdateProfilePayload = {
        name: values.name.trim(),
        avatar: values.avatar.trim() || undefined,
      };
      
      await updateProfile(payload);
      setSuccessMsg('Profile updated successfully! 🎉');
      setTimeout(() => setSuccessMsg(''), 3500);
    } catch (error: any) {
      setErrorMsg(error?.response?.data?.detail || 'Failed to update profile');
    } finally {
      setIsUpdating(false);
    }
  };

  const onChangePassword = async (values: PasswordFormValues) => {
    if (values.new_password !== values.confirm_password) {
      setErrorMsg('New passwords do not match');
      return;
    }

    setIsChangingPassword(true);
    setErrorMsg('');
    setSuccessMsg('');
    
    try {
      const payload: ChangePasswordPayload = {
        current_password: values.current_password,
        new_password: values.new_password,
      };
      
      const result = await changePassword(payload);
      if (result.ok) {
        setSuccessMsg('Password changed successfully! 🔒');
        passwordForm.reset();
        setTimeout(() => setSuccessMsg(''), 3500);
      }
    } catch (error: any) {
      const status = error?.response?.status;
      const detail = error?.response?.data?.detail;
      
      if (status === 400 && detail?.includes('Current password')) {
        setErrorMsg('Current password is incorrect');
      } else {
        setErrorMsg(detail || 'Failed to change password');
      }
    } finally {
      setIsChangingPassword(false);
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin': return DISC;
      case 'ngo': return MARIG;
      case 'volunteer': return SKY;
      default: return '#10B981';
    }
  };

  const handleCopyId = () => {
    if (user) {
      navigator.clipboard.writeText(`SHEBA-USR-${user.id}`);
      setCopiedId(true);
      setTimeout(() => setCopiedId(false), 2000);
    }
  };

  if (!user) return null;

  return (
    <div style={{ background: INK, color: PAPER }} className="min-h-screen pb-16">
      
      {/* ── Top Cover & Hero Banner ────────────────────────────────────────────── */}
      <div className="relative h-64 w-full overflow-hidden border-b border-[rgba(247,241,225,0.12)]"
        style={{ background: 'linear-gradient(135deg, #0B2E22 0%, #0F3A2B 50%, #174E3B 100%)' }}>
        
        {/* Glow circles */}
        <div className="absolute -top-24 -left-24 h-96 w-96 rounded-full bg-[#E7A93B]/10 blur-3xl" />
        <div className="absolute top-10 right-10 h-80 w-80 rounded-full bg-[#D6472C]/10 blur-3xl" />
        
        <div className="mx-auto max-w-6xl px-4 pt-10 md:px-8">
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-2 rounded-full border border-[#E7A93B]/30 bg-[#E7A93B]/10 px-3.5 py-1 text-xs font-semibold text-[#E7A93B] backdrop-blur-md">
              <Sparkles size={13} /> Verified Member Profile
            </span>
            <button 
              onClick={handleCopyId}
              className="inline-flex items-center gap-1.5 rounded-full border border-[rgba(247,241,225,0.18)] bg-[#0F3A2B]/80 px-3 py-1 text-xs font-mono text-[rgba(247,241,225,0.8)] backdrop-blur-md hover:border-[#E7A93B] hover:text-[#F7F1E1] transition-colors"
            >
              <Copy size={12} />
              {copiedId ? 'Copied ID!' : `ID: SHEBA-USR-${user.id}`}
            </button>
          </div>
        </div>
      </div>

      {/* ── Main Profile Header Card ────────────────────────────────────────── */}
      <div className="mx-auto max-w-6xl px-4 md:px-8 -mt-24 relative z-10">
        <div style={{ background: INK2, borderColor: LINE }} className="rounded-3xl border p-6 shadow-2xl md:p-8 backdrop-blur-xl">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
            
            {/* Avatar with Glow Ring */}
            <div className="relative shrink-0">
              <div 
                className="h-28 w-28 md:h-32 md:w-32 rounded-full flex items-center justify-center border-4 shadow-2xl overflow-hidden"
                style={{ 
                  background: user.avatar ? `url(${user.avatar}) center/cover` : `linear-gradient(135deg, #0F3A2B 0%, #3E7A8C 100%)`,
                  borderColor: getRoleBadgeColor(user.role),
                  boxShadow: `0 0 25px ${getRoleBadgeColor(user.role)}44`
                }}
              >
                {!user.avatar && <User size={48} className="text-[#F7F1E1]" />}
              </div>
              <div 
                className="absolute -bottom-1 -right-1 flex items-center gap-1 rounded-full px-3 py-0.5 text-xs font-bold shadow-lg"
                style={{ background: getRoleBadgeColor(user.role), color: PAPER }}
              >
                <BadgeCheck size={13} />
                {user.role.toUpperCase()}
              </div>
            </div>

            {/* Name & Bio */}
            <div className="flex-1 text-center md:text-left space-y-2">
              <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-3">
                <h1 className="font-display text-2xl md:text-3xl font-bold text-[#F7F1E1] tracking-tight flex items-center justify-center md:justify-start gap-2">
                  {user.name}
                  <BadgeCheck size={22} className="text-[#E7A93B]" />
                </h1>
              </div>

              <p className="text-sm text-[rgba(247,241,225,0.75)] flex items-center justify-center md:justify-start gap-2">
                <Mail size={14} className="text-[#3E7A8C]" /> {user.email}
              </p>

              <p className="text-sm text-[rgba(247,241,225,0.7)] max-w-xl leading-relaxed">
                {bio}
              </p>

              <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 pt-1 text-xs text-[rgba(247,241,225,0.65)]">
                <span className="flex items-center gap-1"><MapPin size={12} className="text-[#D6472C]" /> {location}</span>
                <span className="flex items-center gap-1"><Phone size={12} className="text-[#E7A93B]" /> {phone}</span>
                <span className="flex items-center gap-1"><Calendar size={12} className="text-[#3E7A8C]" /> Member since Aug 2026</span>
              </div>
            </div>

            {/* Quick Action Button */}
            <div className="shrink-0 flex gap-2">
              <button
                onClick={() => setActiveTab('profile')}
                className="inline-flex items-center gap-2 rounded-xl bg-[#D6472C] px-5 py-2.5 text-sm font-semibold text-white shadow-lg hover:bg-[#b83a22] transition-colors"
              >
                <User size={16} /> Edit Profile
              </button>
            </div>
          </div>

          {/* ── Key Metrics Overview Strip ─────────────────────────────────────── */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 mt-8 pt-6 border-t border-[rgba(247,241,225,0.12)]">
            <div style={{ background: INK, borderColor: LINE }} className="rounded-2xl border p-4 text-center">
              <div className="flex justify-center mb-1"><Heart size={18} className="text-[#D6472C]" /></div>
              <p className="font-display text-xl font-bold text-[#F7F1E1]">৳12,500</p>
              <p className="text-xs text-[rgba(247,241,225,0.65)]">Donations Given</p>
            </div>

            <div style={{ background: INK, borderColor: LINE }} className="rounded-2xl border p-4 text-center">
              <div className="flex justify-center mb-1"><Activity size={18} className="text-[#E7A93B]" /></div>
              <p className="font-display text-xl font-bold text-[#F7F1E1]">34 Hours</p>
              <p className="text-xs text-[rgba(247,241,225,0.65)]">Volunteer Service</p>
            </div>

            <div style={{ background: INK, borderColor: LINE }} className="rounded-2xl border p-4 text-center">
              <div className="flex justify-center mb-1"><Zap size={18} className="text-[#3E7A8C]" /></div>
              <p className="font-display text-xl font-bold text-[#F7F1E1]">5 Emergencies</p>
              <p className="text-xs text-[rgba(247,241,225,0.65)]">Alerts Responded</p>
            </div>

            <div style={{ background: INK, borderColor: LINE }} className="rounded-2xl border p-4 text-center">
              <div className="flex justify-center mb-1"><Award size={18} className="text-emerald-400" /></div>
              <p className="font-display text-xl font-bold text-[#F7F1E1]">98% Score</p>
              <p className="text-xs text-[rgba(247,241,225,0.65)]">Trust Reputation</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Main Content Body ────────────────────────────────────────────────── */}
      <div className="mx-auto max-w-6xl px-4 md:px-8 mt-8">
        
        {/* Success / Error Toast Alerts */}
        <AnimatePresence>
          {successMsg && (
            <motion.div
              initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
              className="mb-6 flex items-center gap-3 rounded-2xl p-4 border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-sm font-medium">
              <CheckCircle2 size={18} />
              <span>{successMsg}</span>
            </motion.div>
          )}
          
          {errorMsg && (
            <motion.div
              initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
              className="mb-6 flex items-center gap-3 rounded-2xl p-4 border border-red-500/30 bg-red-500/10 text-red-300 text-sm font-medium">
              <AlertCircle size={18} />
              <span>{errorMsg}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Navigation Tabs Bar */}
        <div style={{ background: INK2, borderColor: LINE }} className="rounded-2xl border p-1.5 mb-8 flex flex-wrap gap-1 shadow-lg">
          {[
            { key: 'overview', label: 'Overview & Impact', icon: Activity },
            { key: 'profile', label: 'Edit Profile', icon: User },
            { key: 'badges', label: 'Achievements & Badges', icon: Award },
            { key: 'password', label: 'Security & Password', icon: Shield },
          ].map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key as any)}
              className={`flex-1 min-w-[140px] flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-semibold transition-all duration-200 ${
                activeTab === key 
                  ? 'bg-[#D6472C] text-white shadow-md' 
                  : 'text-[rgba(247,241,225,0.7)] hover:text-[#F7F1E1] hover:bg-[rgba(247,241,225,0.06)]'
              }`}
            >
              <Icon size={16} />
              {label}
            </button>
          ))}
        </div>

        {/* ── TAB 1: OVERVIEW & IMPACT TIMELINE ──────────────────────────────── */}
        {activeTab === 'overview' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
              
              {/* Left Column: Recent Activity Feed */}
              <div className="lg:col-span-2 space-y-6">
                <div style={{ background: INK2, borderColor: LINE }} className="rounded-3xl border p-6 shadow-xl">
                  <h3 className="font-display text-lg font-bold text-[#F7F1E1] mb-5 flex items-center gap-2">
                    <Clock size={18} className="text-[#E7A93B]" />
                    Recent Impact Timeline
                  </h3>
                  
                  <div className="space-y-4">
                    {RECENT_ACTIVITIES.map((act) => {
                      const Icon = act.icon;
                      return (
                        <div key={act.id} style={{ background: INK, borderColor: LINE }} className="flex items-center gap-4 rounded-2xl border p-4">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl" style={{ background: `${act.color}15`, color: act.color }}>
                            <Icon size={20} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-[#F7F1E1] truncate">{act.title}</p>
                            <div className="flex items-center gap-3 text-xs text-[rgba(247,241,225,0.65)] mt-0.5">
                              <span>{act.category}</span>
                              <span>•</span>
                              <span>{act.time}</span>
                            </div>
                          </div>
                          <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-xs font-semibold text-emerald-400">
                            {act.status}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Right Column: Verified Donor Card & Quick Actions */}
              <div className="space-y-6">
                <div style={{ background: INK2, borderColor: 'rgba(231,169,59,0.3)' }} className="rounded-3xl border p-6 shadow-xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-4 text-[#E7A93B]/20"><Award size={80} /></div>
                  <h3 className="font-display text-lg font-bold text-[#F7F1E1] mb-3 flex items-center gap-2">
                    <BadgeCheck size={20} className="text-[#E7A93B]" />
                    Verified Donor Status
                  </h3>
                  <p className="text-sm text-[rgba(247,241,225,0.75)] mb-4">
                    Your profile is active and verified for blood donation emergency dispatches in Dhaka division.
                  </p>
                  
                  <div className="space-y-2 text-sm text-[rgba(247,241,225,0.8)] border-t border-[rgba(247,241,225,0.12)] pt-3">
                    <div className="flex justify-between"><span>Blood Group:</span> <span className="font-bold text-[#D6472C]">O+ (Positive)</span></div>
                    <div className="flex justify-between"><span>Availability:</span> <span className="font-bold text-emerald-400">Ready to Donate</span></div>
                    <div className="flex justify-between"><span>Last Donated:</span> <span>June 15, 2026</span></div>
                  </div>
                </div>

                <div style={{ background: INK2, borderColor: LINE }} className="rounded-3xl border p-6 shadow-xl space-y-3">
                  <h3 className="font-semibold text-[#F7F1E1] mb-2">Quick Navigation</h3>
                  <a href="/donations/history" className="flex items-center justify-between rounded-xl border border-[rgba(247,241,225,0.12)] bg-[#0B2E22] p-3 text-sm font-medium text-[#F7F1E1] hover:border-[#E7A93B]">
                    <span className="flex items-center gap-2"><Heart size={15} className="text-[#D6472C]" /> Donation History</span>
                    <ChevronRight size={16} />
                  </a>
                  <a href="/blood-donation" className="flex items-center justify-between rounded-xl border border-[rgba(247,241,225,0.12)] bg-[#0B2E22] p-3 text-sm font-medium text-[#F7F1E1] hover:border-[#E7A93B]">
                    <span className="flex items-center gap-2"><Activity size={15} className="text-[#E7A93B]" /> Blood Donor Portal</span>
                    <ChevronRight size={16} />
                  </a>
                </div>
              </div>

            </div>
          </motion.div>
        )}

        {/* ── TAB 2: EDIT PROFILE ─────────────────────────────────────────────── */}
        {activeTab === 'profile' && (
          <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
            style={{ background: INK2, borderColor: LINE }} className="rounded-3xl border p-6 md:p-8 shadow-2xl">
            
            <h2 className="font-display text-xl font-bold text-[#F7F1E1] mb-6 flex items-center gap-2">
              <User size={20} className="text-[#D6472C]" /> Update Profile Information
            </h2>

            <form onSubmit={profileForm.handleSubmit(onUpdateProfile)} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-[#F7F1E1] mb-2">Full Name</label>
                <input
                  {...profileForm.register('name', { required: 'Name is required' })}
                  type="text"
                  style={{ background: INK, borderColor: LINE, color: PAPER }}
                  className="w-full rounded-xl border px-4 py-3 text-sm outline-none focus:border-[#E7A93B] transition-colors"
                  placeholder="Enter full name"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#F7F1E1] mb-2">Avatar Image URL</label>
                <div className="relative">
                  <input
                    {...profileForm.register('avatar')}
                    type="url"
                    style={{ background: INK, borderColor: LINE, color: PAPER }}
                    className="w-full rounded-xl border px-4 py-3 text-sm outline-none focus:border-[#E7A93B] transition-colors pl-10"
                    placeholder="https://images.unsplash.com/photo-..."
                  />
                  <Camera size={16} className="absolute left-3.5 top-3.5 text-[rgba(247,241,225,0.5)]" />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-semibold text-[#F7F1E1] mb-2">Phone Number</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    style={{ background: INK, borderColor: LINE, color: PAPER }}
                    className="w-full rounded-xl border px-4 py-3 text-sm outline-none focus:border-[#E7A93B] transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[#F7F1E1] mb-2">Location / District</label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    style={{ background: INK, borderColor: LINE, color: PAPER }}
                    className="w-full rounded-xl border px-4 py-3 text-sm outline-none focus:border-[#E7A93B] transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#F7F1E1] mb-2">Bio / Mission Statement</label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  rows={3}
                  style={{ background: INK, borderColor: LINE, color: PAPER }}
                  className="w-full rounded-xl border px-4 py-3 text-sm outline-none focus:border-[#E7A93B] transition-colors resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={isUpdating}
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-[#D6472C] py-3.5 text-base font-bold text-white shadow-lg hover:bg-[#b83a22] transition-colors disabled:opacity-50"
              >
                <Save size={18} />
                {isUpdating ? 'Saving Changes…' : 'Save Profile Changes'}
              </button>
            </form>
          </motion.div>
        )}

        {/* ── TAB 3: ACHIEVEMENTS & BADGES ───────────────────────────────────── */}
        {activeTab === 'badges' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            style={{ background: INK2, borderColor: LINE }} className="rounded-3xl border p-6 md:p-8 shadow-2xl">
            
            <h2 className="font-display text-xl font-bold text-[#F7F1E1] mb-2 flex items-center gap-2">
              <Award size={20} className="text-[#E7A93B]" /> Earned Badges & Recognition
            </h2>
            <p className="text-sm text-[rgba(247,241,225,0.7)] mb-6">
              Track your contribution milestones across emergency rescue, blood donation, and relief funding.
            </p>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {ACHIEVEMENTS.map((ach) => {
                const Icon = ach.icon;
                return (
                  <div
                    key={ach.id}
                    style={{ background: INK, borderColor: ach.unlocked ? `${ach.color}44` : LINE }}
                    className={`rounded-2xl border p-5 flex items-start gap-4 transition-all ${
                      ach.unlocked ? 'shadow-lg' : 'opacity-60'
                    }`}
                  >
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl" style={{ background: `${ach.color}20`, color: ach.color }}>
                      <Icon size={24} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className="font-bold text-[#F7F1E1] text-sm">{ach.title}</h4>
                        <span className="text-xs font-mono text-[rgba(247,241,225,0.6)]">{ach.date}</span>
                      </div>
                      <p className="text-xs text-[rgba(247,241,225,0.7)] mt-1">{ach.desc}</p>
                      <div className="mt-3 flex items-center gap-2">
                        <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                          ach.unlocked ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-gray-500/20 text-gray-400'
                        }`}>
                          {ach.unlocked ? 'Unlocked' : 'In Progress'}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* ── TAB 4: SECURITY & PASSWORD ──────────────────────────────────────── */}
        {activeTab === 'password' && (
          <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }}
            style={{ background: INK2, borderColor: LINE }} className="rounded-3xl border p-6 md:p-8 shadow-2xl">
            
            <h2 className="font-display text-xl font-bold text-[#F7F1E1] mb-6 flex items-center gap-2">
              <Shield size={20} className="text-[#3E7A8C]" /> Change Account Password
            </h2>

            <form onSubmit={passwordForm.handleSubmit(onChangePassword)} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-[#F7F1E1] mb-2">Current Password</label>
                <div className="relative">
                  <input
                    {...passwordForm.register('current_password', { required: 'Current password is required' })}
                    type={showCurrentPass ? 'text' : 'password'}
                    style={{ background: INK, borderColor: LINE, color: PAPER }}
                    className="w-full rounded-xl border px-4 py-3 text-sm outline-none focus:border-[#E7A93B] transition-colors pr-10"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPass(!showCurrentPass)}
                    className="absolute right-3.5 top-3.5 text-[rgba(247,241,225,0.5)] hover:text-[#F7F1E1]"
                  >
                    {showCurrentPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#F7F1E1] mb-2">New Password</label>
                <div className="relative">
                  <input
                    {...passwordForm.register('new_password', { required: 'New password is required', minLength: { value: 6, message: 'Minimum 6 characters' } })}
                    type={showNewPass ? 'text' : 'password'}
                    style={{ background: INK, borderColor: LINE, color: PAPER }}
                    className="w-full rounded-xl border px-4 py-3 text-sm outline-none focus:border-[#E7A93B] transition-colors pr-10"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPass(!showNewPass)}
                    className="absolute right-3.5 top-3.5 text-[rgba(247,241,225,0.5)] hover:text-[#F7F1E1]"
                  >
                    {showNewPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#F7F1E1] mb-2">Confirm New Password</label>
                <div className="relative">
                  <input
                    {...passwordForm.register('confirm_password', { required: 'Please confirm new password' })}
                    type={showConfirmPass ? 'text' : 'password'}
                    style={{ background: INK, borderColor: LINE, color: PAPER }}
                    className="w-full rounded-xl border px-4 py-3 text-sm outline-none focus:border-[#E7A93B] transition-colors pr-10"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPass(!showConfirmPass)}
                    className="absolute right-3.5 top-3.5 text-[rgba(247,241,225,0.5)] hover:text-[#F7F1E1]"
                  >
                    {showConfirmPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isChangingPassword}
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-[#3E7A8C] py-3.5 text-base font-bold text-white shadow-lg hover:bg-[#326372] transition-colors disabled:opacity-50"
              >
                <Shield size={18} />
                {isChangingPassword ? 'Updating Password…' : 'Update Password Security'}
              </button>
            </form>
          </motion.div>
        )}

      </div>
    </div>
  );
}
// Murad: Member badges

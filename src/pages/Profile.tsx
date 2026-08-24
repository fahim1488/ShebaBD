import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Mail, Settings, Shield, Camera, Eye, EyeOff, Save, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/hooks/useLanguage';
import { Button } from '@/components/ui/button/Button';
import type { UpdateProfilePayload, ChangePasswordPayload } from '@/context/AuthContext';

// Design tokens
const INK = '#0B2E22';
const INK2 = '#0F3A2B';
const PAPER = '#F7F1E1';
const DISC = '#D6472C';
const MARIG = '#E7A93B';
const SKY = '#3E7A8C';
const MUTED = 'rgba(247,241,225,0.65)';
const LINE = 'rgba(247,241,225,0.16)';

type ProfileFormValues = {
  name: string;
  avatar: string;
};

type PasswordFormValues = {
  current_password: string;
  new_password: string;
  confirm_password: string;
};

export default function Profile() {
  const { user, updateProfile, changePassword } = useAuth();
  const { t } = useLanguage();
  
  const [activeTab, setActiveTab] = useState<'profile' | 'password'>('profile');
  const [isUpdating, setIsUpdating] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Profile form
  const profileForm = useForm<ProfileFormValues>({
    defaultValues: {
      name: user?.name || '',
      avatar: user?.avatar || '',
    },
  });

  // Password form
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
      setTimeout(() => setSuccessMsg(''), 3000);
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
        setTimeout(() => setSuccessMsg(''), 3000);
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
      default: return '#4C8C6B';
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen" style={{ background: `linear-gradient(135deg, ${INK} 0%, ${INK2} 100%)` }}>
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="flex items-center justify-center mb-4">
            <div className="relative">
              <div className="w-24 h-24 rounded-full flex items-center justify-center border-4"
                style={{ 
                  background: user.avatar ? `url(${user.avatar}) center/cover` : `${SKY}22`,
                  borderColor: getRoleBadgeColor(user.role) + '66'
                }}>
                {!user.avatar && <User size={36} style={{ color: SKY }} />}
              </div>
              <div className="absolute -bottom-1 -right-1 px-2 py-0.5 rounded-full text-xs font-bold"
                style={{ background: getRoleBadgeColor(user.role), color: PAPER }}>
                {user.role.toUpperCase()}
              </div>
            </div>
          </div>
          
          <h1 className="text-3xl font-bold mb-2" style={{ color: PAPER }}>
            {user.name}
          </h1>
          <p className="text-lg" style={{ color: MUTED }}>
            {user.email}
          </p>
        </div>

        {/* Alerts */}
        <AnimatePresence>
          {successMsg && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-6 flex items-center gap-3 rounded-lg px-4 py-3"
              style={{ background: 'rgba(74,222,128,0.15)', border: '1px solid rgba(74,222,128,0.35)' }}>
              <CheckCircle2 size={18} color="#4ade80" />
              <span style={{ color: '#4ade80' }}>{successMsg}</span>
            </motion.div>
          )}
          
          {errorMsg && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-6 flex items-center gap-3 rounded-lg px-4 py-3"
              style={{ background: 'rgba(214,71,44,0.15)', border: '1px solid rgba(214,71,44,0.35)' }}>
              <AlertCircle size={18} color="#f87171" />
              <span style={{ color: '#f87171' }}>{errorMsg}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Tabs */}
        <div className="mb-8">
          <div className="flex rounded-lg p-1" style={{ background: INK2, border: `1px solid ${LINE}` }}>
            {[
              { key: 'profile', label: 'Profile Settings', icon: User },
              { key: 'password', label: 'Change Password', icon: Shield },
            ].map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setActiveTab(key as any)}
                className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-md text-sm font-medium transition-all duration-200 ${
                  activeTab === key ? '' : 'hover:bg-opacity-50'
                }`}
                style={{
                  background: activeTab === key ? DISC : 'transparent',
                  color: activeTab === key ? PAPER : MUTED,
                }}>
                <Icon size={16} />
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="rounded-lg p-6" style={{ background: INK2, border: `1px solid ${LINE}` }}>
          
          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}>
              
              <form onSubmit={profileForm.handleSubmit(onUpdateProfile)} className="space-y-6">
                
                {/* Name */}
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: PAPER }}>
                    Full Name
                  </label>
                  <div className="relative">
                    <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: MUTED }} />
                    <input
                      {...profileForm.register('name', { required: 'Name is required', minLength: { value: 2, message: 'Name must be at least 2 characters' } })}
                      className="w-full pl-10 pr-4 py-3 rounded-lg border-0 outline-none text-sm"
                      style={{
                        background: 'rgba(247,241,225,0.08)',
                        border: `1px solid ${LINE}`,
                        color: PAPER,
                      }}
                      placeholder="Enter your full name"
                    />
                  </div>
                  {profileForm.formState.errors.name && (
                    <p className="mt-1 text-xs" style={{ color: '#f87171' }}>
                      {profileForm.formState.errors.name.message}
                    </p>
                  )}
                </div>

                {/* Avatar URL */}
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: PAPER }}>
                    Avatar URL <span className="text-xs" style={{ color: MUTED }}>(optional)</span>
                  </label>
                  <div className="relative">
                    <Camera size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: MUTED }} />
                    <input
                      {...profileForm.register('avatar')}
                      className="w-full pl-10 pr-4 py-3 rounded-lg border-0 outline-none text-sm"
                      style={{
                        background: 'rgba(247,241,225,0.08)',
                        border: `1px solid ${LINE}`,
                        color: PAPER,
                      }}
                      placeholder="https://example.com/avatar.jpg"
                    />
                  </div>
                </div>

                {/* Email (readonly) */}
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: PAPER }}>
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: MUTED }} />
                    <input
                      value={user.email}
                      readOnly
                      className="w-full pl-10 pr-4 py-3 rounded-lg border-0 outline-none text-sm cursor-not-allowed opacity-60"
                      style={{
                        background: 'rgba(247,241,225,0.04)',
                        border: `1px solid ${LINE}`,
                        color: MUTED,
                      }}
                    />
                  </div>
                  <p className="mt-1 text-xs" style={{ color: MUTED }}>
                    Email cannot be changed. Contact support if needed.
                  </p>
                </div>

                {/* Submit */}
                <Button
                  type="submit"
                  disabled={isUpdating}
                  className="w-full py-3 font-semibold rounded-lg transition-all duration-200 flex items-center justify-center gap-2"
                  style={{ 
                    background: DISC, 
                    color: PAPER,
                    opacity: isUpdating ? 0.7 : 1,
                  }}>
                  {isUpdating ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Updating...
                    </>
                  ) : (
                    <>
                      <Save size={16} />
                      Update Profile
                    </>
                  )}
                </Button>
              </form>
            </motion.div>
          )}

          {/* Password Tab */}
          {activeTab === 'password' && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}>
              
              <form onSubmit={passwordForm.handleSubmit(onChangePassword)} className="space-y-6">
                
                {/* Current Password */}
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: PAPER }}>
                    Current Password
                  </label>
                  <div className="relative">
                    <Shield size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: MUTED }} />
                    <input
                      {...passwordForm.register('current_password', { required: 'Current password is required' })}
                      type={showCurrentPass ? 'text' : 'password'}
                      className="w-full pl-10 pr-12 py-3 rounded-lg border-0 outline-none text-sm"
                      style={{
                        background: 'rgba(247,241,225,0.08)',
                        border: `1px solid ${LINE}`,
                        color: PAPER,
                      }}
                      placeholder="Enter current password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPass(!showCurrentPass)}
                      className="absolute right-3 top-1/2 -translate-y-1/2"
                      style={{ color: MUTED }}>
                      {showCurrentPass ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  {passwordForm.formState.errors.current_password && (
                    <p className="mt-1 text-xs" style={{ color: '#f87171' }}>
                      {passwordForm.formState.errors.current_password.message}
                    </p>
                  )}
                </div>

                {/* New Password */}
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: PAPER }}>
                    New Password
                  </label>
                  <div className="relative">
                    <Shield size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: MUTED }} />
                    <input
                      {...passwordForm.register('new_password', { 
                        required: 'New password is required',
                        minLength: { value: 6, message: 'Password must be at least 6 characters' }
                      })}
                      type={showNewPass ? 'text' : 'password'}
                      className="w-full pl-10 pr-12 py-3 rounded-lg border-0 outline-none text-sm"
                      style={{
                        background: 'rgba(247,241,225,0.08)',
                        border: `1px solid ${LINE}`,
                        color: PAPER,
                      }}
                      placeholder="Enter new password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPass(!showNewPass)}
                      className="absolute right-3 top-1/2 -translate-y-1/2"
                      style={{ color: MUTED }}>
                      {showNewPass ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  {passwordForm.formState.errors.new_password && (
                    <p className="mt-1 text-xs" style={{ color: '#f87171' }}>
                      {passwordForm.formState.errors.new_password.message}
                    </p>
                  )}
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: PAPER }}>
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <Shield size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: MUTED }} />
                    <input
                      {...passwordForm.register('confirm_password', { required: 'Please confirm your new password' })}
                      type={showConfirmPass ? 'text' : 'password'}
                      className="w-full pl-10 pr-12 py-3 rounded-lg border-0 outline-none text-sm"
                      style={{
                        background: 'rgba(247,241,225,0.08)',
                        border: `1px solid ${LINE}`,
                        color: PAPER,
                      }}
                      placeholder="Confirm new password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPass(!showConfirmPass)}
                      className="absolute right-3 top-1/2 -translate-y-1/2"
                      style={{ color: MUTED }}>
                      {showConfirmPass ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  {passwordForm.formState.errors.confirm_password && (
                    <p className="mt-1 text-xs" style={{ color: '#f87171' }}>
                      {passwordForm.formState.errors.confirm_password.message}
                    </p>
                  )}
                </div>

                {/* Submit */}
                <Button
                  type="submit"
                  disabled={isChangingPassword}
                  className="w-full py-3 font-semibold rounded-lg transition-all duration-200 flex items-center justify-center gap-2"
                  style={{ 
                    background: DISC, 
                    color: PAPER,
                    opacity: isChangingPassword ? 0.7 : 1,
                  }}>
                  {isChangingPassword ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Changing...
                    </>
                  ) : (
                    <>
                      <Shield size={16} />
                      Change Password
                    </>
                  )}
                </Button>
              </form>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
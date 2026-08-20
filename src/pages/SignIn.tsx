import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import {
  Mail, Lock, AlertCircle, CheckCircle2, X, Eye, EyeOff,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/hooks/useLanguage';
import { ROUTES } from '@/constants/routes';
import { Button } from '@/components/ui/button/Button';
import { authApi } from '@/services/authApi';

type FormValues = {
  email: string;
  password: string;
};

const LABEL      = 'rgba(247,241,225,0.75)';
const INPUT_CLS  = 'w-full rounded-md py-2.5 px-3 text-[13.5px] outline-none transition-all duration-150 focus:ring-2 focus:ring-[#D6472C]';
const INPUT_STYLE = {
  background : 'rgba(247,241,225,0.06)',
  border     : '1px solid rgba(247,241,225,0.14)',
  color      : '#F7F1E1',
};
const ERR_BORDER = 'rgba(214,71,44,0.6)';

export default function SignIn() {
  const { login } = useAuth();
  const { t }     = useLanguage();
  const navigate  = useNavigate();
  const location  = useLocation();
  const s         = t.auth.signIn;
  const from      = (location.state as { from?: string })?.from ?? ROUTES.HOME;

  const [serverError,  setServerError]  = useState('');
  const [successMsg,   setSuccessMsg]   = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPass,     setShowPass]     = useState(false);

  // Forgot-password modal
  const [showForgot, setShowForgot] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSent,  setForgotSent]  = useState(false);
  const [forgotError, setForgotError] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);

  const { register, handleSubmit, setValue, formState: { errors } } =
    useForm<FormValues>({ defaultValues: { email: '', password: '' } });

  // ── Real sign-in ──────────────────────────────────────────────────────────
  const onSubmit = async ({ email, password }: FormValues) => {
    setServerError('');
    setSuccessMsg('');
    setIsSubmitting(true);
    try {
      await login(email.trim().toLowerCase(), password);
      setSuccessMsg('Signed in! Redirecting…');
      setTimeout(() => navigate(from, { replace: true }), 600);
    } catch (err: unknown) {
      const status = (err as { response?: { status?: number } })?.response?.status;
      setServerError(
        status === 401 || status === 400
          ? (s.errorInvalid  || 'Invalid email or password.')
          : (s.errorGeneric  || 'Something went wrong. Please try again.'),
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Fill form with a test account (still needs real submit) ──────────────
  const fillDemo = (email: string) => {
    setValue('email',    email,       { shouldValidate: false });
    setValue('password', 'password123', { shouldValidate: false });
  };

  // ── Forgot password ───────────────────────────────────────────────────────
  const handleForgot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail.includes('@')) { setForgotError('Enter a valid email.'); return; }
    setForgotError('');
    setForgotLoading(true);
    try {
      await authApi.forgotPassword(forgotEmail.trim().toLowerCase());
      setForgotSent(true);
    } catch {
      setForgotError('Failed to send reset link. Please try again.');
    } finally {
      setForgotLoading(false);
    }
  };

  return (
    <>
      {/* ── Heading ─────────────────────────────────────────────────────── */}
      <div className="mb-6 text-center">
        <h1 className="text-2xl font-bold tracking-tight" style={{ color: '#F7F1E1' }}>
          {s.title}
        </h1>
        <p className="mt-1.5 text-sm" style={{ color: 'rgba(247,241,225,0.55)' }}>
          {s.subtitle}
        </p>
      </div>

      {/* ── Alerts ──────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {serverError && (
          <motion.div key="err"
            initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="mb-4 flex items-center gap-2 rounded-lg px-4 py-3 text-sm"
            style={{ background: 'rgba(214,71,44,0.15)', border: '1px solid rgba(214,71,44,0.35)', color: '#f87171' }}>
            <AlertCircle size={14} className="shrink-0" /> {serverError}
          </motion.div>
        )}
        {successMsg && (
          <motion.div key="ok"
            initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="mb-4 flex items-center gap-2 rounded-lg px-4 py-3 text-sm"
            style={{ background: 'rgba(74,222,128,0.15)', border: '1px solid rgba(74,222,128,0.35)', color: '#4ade80' }}>
            <CheckCircle2 size={14} className="shrink-0" /> {successMsg}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Main form ───────────────────────────────────────────────────── */}
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-5">

        {/* Email */}
        <div>
          <label className="mb-1.5 block text-sm font-medium" style={{ color: LABEL }}>
            {s.emailLabel}
          </label>
          <div className="relative">
            <Mail size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2"
              style={{ color: 'rgba(247,241,225,0.35)' }} />
            <input
              type="email"
              autoComplete="email"
              placeholder={s.emailPlaceholder}
              className={INPUT_CLS + ' pl-9'}
              style={{ ...INPUT_STYLE, borderColor: errors.email ? ERR_BORDER : INPUT_STYLE.border }}
              {...register('email', {
                required : 'Email is required',
                pattern  : { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Enter a valid email address' },
              })}
            />
          </div>
          {errors.email && (
            <p className="mt-1 flex items-center gap-1 text-xs text-[#f87171]">
              <AlertCircle size={11} /> {errors.email.message}
            </p>
          )}
        </div>

        {/* Password */}
        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <label className="text-sm font-medium" style={{ color: LABEL }}>
              {s.passwordLabel}
            </label>
            <button
              type="button"
              onClick={() => { setShowForgot(true); setForgotSent(false); setForgotError(''); setForgotEmail(''); }}
              className="bg-transparent border-none cursor-pointer text-xs font-medium transition-colors duration-150"
              style={{ color: '#E7A93B' }}
              onMouseEnter={e => ((e.target as HTMLElement).style.color = '#f59e0b')}
              onMouseLeave={e => ((e.target as HTMLElement).style.color = '#E7A93B')}
            >
              {s.forgotPassword}
            </button>
          </div>
          <div className="relative">
            <Lock size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2"
              style={{ color: 'rgba(247,241,225,0.35)' }} />
            <input
              type={showPass ? 'text' : 'password'}
              autoComplete="current-password"
              placeholder={s.passwordPlaceholder}
              className={INPUT_CLS + ' pl-9 pr-10'}
              style={{ ...INPUT_STYLE, borderColor: errors.password ? ERR_BORDER : INPUT_STYLE.border }}
              {...register('password', {
                required  : 'Password is required',
                minLength : { value: 6, message: 'At least 6 characters' },
              })}
            />
            <button
              type="button"
              aria-label={showPass ? 'Hide password' : 'Show password'}
              onClick={() => setShowPass(p => !p)}
              className="absolute right-3 top-1/2 -translate-y-1/2 bg-transparent border-none cursor-pointer"
              style={{ color: 'rgba(247,241,225,0.4)' }}
            >
              {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>
          {errors.password && (
            <p className="mt-1 flex items-center gap-1 text-xs text-[#f87171]">
              <AlertCircle size={11} /> {errors.password.message}
            </p>
          )}
        </div>

        {/* Submit */}
        <Button
          type="submit"
          variant="primary"
          size="lg"
          fullWidth
          loading={isSubmitting}
          className="!rounded-lg !bg-[#D6472C] hover:!bg-[#c03e27] !text-white font-semibold"
        >
          {s.submitBtn}
        </Button>
      </form>

      {/* ── Sign-up link ─────────────────────────────────────────────────── */}
      <p className="mt-6 text-center text-sm" style={{ color: 'rgba(247,241,225,0.5)' }}>
        {s.noAccount}{' '}
        <Link
          to={ROUTES.SIGN_UP}
          className="font-semibold transition-colors duration-150"
          style={{ color: '#E7A93B' }}
          onMouseEnter={e => ((e.target as HTMLElement).style.color = '#f59e0b')}
          onMouseLeave={e => ((e.target as HTMLElement).style.color = '#E7A93B')}
        >
          {s.signUpLink}
        </Link>
      </p>

      {/* ── Divider ──────────────────────────────────────────────────────── */}
      <div className="my-5 flex items-center gap-3">
        <div className="h-px flex-1" style={{ background: 'rgba(247,241,225,0.12)' }} />
        <span className="text-xs" style={{ color: 'rgba(247,241,225,0.35)' }}>
          {s.orContinueWith}
        </span>
        <div className="h-px flex-1" style={{ background: 'rgba(247,241,225,0.12)' }} />
      </div>

      {/* ── Social login ─────────────────────────────────────────────────── */}
      <SocialButtonRow from={from} />

      {/* ── Test accounts hint ───────────────────────────────────────────── */}
      <details className="mt-5 rounded-lg" style={{ border: '1px dashed rgba(247,241,225,0.12)' }}>
        <summary
          className="cursor-pointer select-none px-3 py-2 text-[11px] font-semibold uppercase tracking-wider"
          style={{ color: 'rgba(247,241,225,0.35)' }}
        >
          Test accounts (dev only)
        </summary>
        <div className="px-3 pb-3 pt-1 grid grid-cols-3 gap-2">
          {[
            { label: 'User',      email: 'user@shebabd.org' },
            { label: 'Volunteer', email: 'volunteer@shebabd.org' },
            { label: 'NGO',       email: 'ngo@shebabd.org' },
          ].map(({ label, email }) => (
            <button
              key={label}
              type="button"
              onClick={() => fillDemo(email)}
              className="rounded py-1.5 text-[11px] font-medium transition-colors duration-150"
              style={{
                background : 'rgba(247,241,225,0.05)',
                border     : '1px solid rgba(247,241,225,0.1)',
                color      : 'rgba(247,241,225,0.65)',
                cursor     : 'pointer',
              }}
              onMouseEnter={e => (e.currentTarget.style.borderColor = 'rgba(231,169,59,0.4)')}
              onMouseLeave={e => (e.currentTarget.style.borderColor = 'rgba(247,241,225,0.1)')}
            >
              {label}
            </button>
          ))}
        </div>
      </details>

      {/* ── Forgot Password Modal ─────────────────────────────────────────── */}
      <AnimatePresence>
        {showForgot && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/70 backdrop-blur-sm"
              onClick={() => setShowForgot(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative w-full max-w-md rounded-xl p-6 shadow-2xl"
              style={{ background: 'linear-gradient(135deg,#0B2E22,#081F18)', border: '1px solid rgba(247,241,225,0.18)' }}
            >
              <button
                type="button"
                aria-label="Close"
                onClick={() => setShowForgot(false)}
                className="absolute right-4 top-4 rounded p-1 transition-colors bg-transparent border-none cursor-pointer"
                style={{ color: 'rgba(247,241,225,0.5)' }}
              >
                <X size={18} />
              </button>

              <h2 className="text-xl font-bold" style={{ color: '#F7F1E1' }}>Reset Password</h2>
              <p className="mt-1 text-xs" style={{ color: 'rgba(247,241,225,0.55)' }}>
                Enter your email and we'll send reset instructions.
              </p>

              {forgotSent ? (
                <div className="mt-6 rounded-lg p-4 text-center"
                  style={{ background: 'rgba(74,222,128,0.12)', border: '1px solid rgba(74,222,128,0.3)' }}>
                  <CheckCircle2 size={32} className="mx-auto mb-2" style={{ color: '#4ade80' }} />
                  <p className="text-sm font-semibold" style={{ color: '#4ade80' }}>Reset link sent!</p>
                  <p className="mt-1 text-xs" style={{ color: 'rgba(247,241,225,0.7)' }}>
                    Check <strong style={{ color: '#F7F1E1' }}>{forgotEmail}</strong> for instructions.
                  </p>
                  <Button
                    type="button" variant="primary" size="sm"
                    onClick={() => setShowForgot(false)}
                    className="mt-4 !bg-[#D6472C]"
                  >
                    Done
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleForgot} className="mt-5 flex flex-col gap-4">
                  {forgotError && (
                    <p className="flex items-center gap-1 text-xs" style={{ color: '#f87171' }}>
                      <AlertCircle size={13} /> {forgotError}
                    </p>
                  )}
                  <div>
                    <label className="mb-1 block text-xs font-medium" style={{ color: LABEL }}>
                      Email Address
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="you@example.com"
                      value={forgotEmail}
                      onChange={e => setForgotEmail(e.target.value)}
                      className="w-full rounded-md py-2 px-3 text-sm outline-none focus:ring-2 focus:ring-[#D6472C]"
                      style={INPUT_STYLE}
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button
                      type="button" variant="outline" size="sm"
                      onClick={() => setShowForgot(false)}
                      className="!border-[rgba(247,241,225,0.2)] !text-[rgba(247,241,225,0.8)]"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit" variant="primary" size="sm"
                      loading={forgotLoading}
                      className="!bg-[#D6472C]"
                    >
                      Send Link
                    </Button>
                  </div>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}

// ─── Social buttons row (Google + Facebook) ─────────────────────────────────
function SocialButtonRow({ from }: { from: string }) {
  const [loading,  setLoading]  = useState<'google' | 'facebook' | null>(null);
  const [error,    setError]    = useState('');
  const { login }               = useAuth();
  const navigate                = useNavigate();

  const handleClick = async (provider: 'google' | 'facebook') => {
    setLoading(provider);
    setError('');
    try {
      // Call backend stub social auth — creates/finds account automatically
      const { data } = await (await import('@/services/api')).api.post('/auth/social', { provider });
      const token = data.token || data.data?.token || '';
      const user  = data.user  || data.data?.user  || data;
      // Store token directly — skip re-authenticating with password
      localStorage.setItem('shebabd_token', token);
      localStorage.setItem('shebabd_user', JSON.stringify(user));
      // Trigger auth context refresh by calling login with stored token
      window.dispatchEvent(new Event('shebabd-auth-updated'));
      navigate(from, { replace: true });
    } catch (err: any) {
      const detail = err?.response?.data?.detail;
      const errors = err?.response?.data?.errors;
      const msg = Array.isArray(errors)
        ? errors.map((e: any) => e.message).join(', ')
        : detail || 'Social sign-in unavailable. Please use email & password.';
      setError(msg);
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="grid grid-cols-2 gap-3">
        {(['google', 'facebook'] as const).map(provider => (
          <button
            key={provider}
            type="button"
            disabled={loading !== null}
            onClick={() => handleClick(provider)}
            className="flex items-center justify-center gap-2.5 rounded-lg py-2.5 text-sm font-medium transition-all duration-200 disabled:opacity-60"
            style={{
              background: 'rgba(247,241,225,0.05)',
              border:     '1px solid rgba(247,241,225,0.12)',
              color:      'rgba(247,241,225,0.7)',
              cursor:     loading !== null ? 'not-allowed' : 'pointer',
            }}
            onMouseEnter={e => {
              if (loading) return;
              e.currentTarget.style.background  = 'rgba(247,241,225,0.09)';
              e.currentTarget.style.borderColor = 'rgba(247,241,225,0.22)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background  = 'rgba(247,241,225,0.05)';
              e.currentTarget.style.borderColor = 'rgba(247,241,225,0.12)';
            }}
          >
            {loading === provider
              ? <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              : provider === 'google'
                ? (
                  <svg width="17" height="17" viewBox="0 0 48 48">
                    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                  </svg>
                ) : (
                  <svg width="17" height="17" viewBox="0 0 48 48">
                    <path fill="#1877F2" d="M48 24C48 10.745 37.255 0 24 0S0 10.745 0 24c0 11.979 8.776 21.908 20.25 23.708V30.937h-6.094V24h6.094v-5.288c0-6.014 3.583-9.337 9.065-9.337 2.625 0 5.372.469 5.372.469v5.906h-3.026c-2.981 0-3.911 1.85-3.911 3.75V24h6.656l-1.063 6.937H27.75v16.771C39.224 45.908 48 35.979 48 24z"/>
                    <path fill="#fff" d="M33.343 30.937 34.406 24H27.75v-4.5c0-1.9.93-3.75 3.911-3.75h3.026v-5.906s-2.747-.469-5.372-.469c-5.482 0-9.065 3.323-9.065 9.337V24h-6.094v6.937h6.094v16.771a24.16 24.16 0 0 0 7.5 0V30.937h5.593z"/>
                  </svg>
                )
            }
            {provider === 'google' ? 'Google' : 'Facebook'}
          </button>
        ))}
      </div>
      {/* Error shown below both buttons — doesn't break the grid */}
      {error && (
        <p className="text-center text-xs" style={{ color: '#f87171' }}>{error}</p>
      )}
    </div>
  );
}

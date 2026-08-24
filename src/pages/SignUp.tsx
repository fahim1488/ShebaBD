import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import {
  User, Mail, Lock, AlertCircle, CheckCircle2,
  ChevronDown, Eye, EyeOff,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/hooks/useLanguage';
import { ROUTES } from '@/constants/routes';
import { Button } from '@/components/ui/button/Button';
import type { RegisterPayload } from '@/context/AuthContext';

type FormValues = {
  name: string;
  email: string;
  role: 'user' | 'volunteer' | 'ngo';
  password: string;
  confirmPassword: string;
  terms: boolean;
};

const LABEL       = 'rgba(247,241,225,0.75)';
const INPUT_CLS   = 'w-full rounded-md py-2.5 text-[13.5px] outline-none transition-all duration-150 focus:ring-2 focus:ring-[#D6472C]';
const INPUT_STYLE = {
  background : 'rgba(247,241,225,0.06)',
  border     : '1px solid rgba(247,241,225,0.14)',
  color      : '#F7F1E1',
};
const ERR_BORDER = 'rgba(214,71,44,0.6)';

export default function SignUp() {
  const { register: registerUser } = useAuth();
  const { t }      = useLanguage();
  const navigate   = useNavigate();
  const s          = t.auth.signUp;

  const [serverError,  setServerError]  = useState('');
  const [successMsg,   setSuccessMsg]   = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPass,     setShowPass]     = useState(false);
  const [showConfirm,  setShowConfirm]  = useState(false);

  const { register, handleSubmit, watch, formState: { errors } } = useForm<FormValues>({
    defaultValues: { name: '', email: '', role: 'user', password: '', confirmPassword: '', terms: false },
  });

  const passwordValue = watch('password');

  // ── Real registration ─────────────────────────────────────────────────────
  const onSubmit = async (values: FormValues) => {
    setServerError('');
    setSuccessMsg('');
    setIsSubmitting(true);
    try {
      const payload: RegisterPayload = {
        name     : values.name.trim(),
        email    : values.email.trim().toLowerCase(),
        password : values.password,
        role     : values.role,
      };
      await registerUser(payload);
      setSuccessMsg('Account created! Welcome to ShebaBD 🎉');
      // Redirect to profile so user sees their new account
      setTimeout(() => navigate(ROUTES.PROFILE, { replace: true }), 800);
    } catch (err: unknown) {
      const status = (err as { response?: { status?: number } })?.response?.status;
      if (status === 409) {
        setServerError(s.errorEmailTaken || 'An account with this email already exists.');
      } else if (status === 422) {
        setServerError('Please check your details and try again.');
      } else {
        setServerError(s.errorGeneric || 'Registration failed. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {/* ── Heading ──────────────────────────────────────────────────────── */}
      <div className="mb-6 text-center">
        <h1 className="text-2xl font-bold tracking-tight" style={{ color: '#F7F1E1' }}>
          {s.title}
        </h1>
        <p className="mt-1.5 text-sm" style={{ color: 'rgba(247,241,225,0.55)' }}>
          {s.subtitle}
        </p>
      </div>

      {/* ── Alerts ───────────────────────────────────────────────────────── */}
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

      {/* ── Form ─────────────────────────────────────────────────────────── */}
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">

        {/* Full name */}
        <div>
          <label className="mb-1.5 block text-sm font-medium" style={{ color: LABEL }}>
            {s.nameLabel}
          </label>
          <div className="relative">
            <User size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2"
              style={{ color: 'rgba(247,241,225,0.35)' }} />
            <input
              type="text"
              autoComplete="name"
              placeholder={s.namePlaceholder}
              className={INPUT_CLS + ' pl-9 pr-3'}
              style={{ ...INPUT_STYLE, borderColor: errors.name ? ERR_BORDER : INPUT_STYLE.border }}
              {...register('name', {
                required  : 'Full name is required',
                minLength : { value: 2, message: 'At least 2 characters' },
                maxLength : { value: 100, message: 'Max 100 characters' },
              })}
            />
          </div>
          {errors.name && (
            <p className="mt-1 flex items-center gap-1 text-xs text-[#f87171]">
              <AlertCircle size={11} /> {errors.name.message}
            </p>
          )}
        </div>

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
              className={INPUT_CLS + ' pl-9 pr-3'}
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

        {/* Role */}
        <div>
          <label className="mb-1.5 block text-sm font-medium" style={{ color: LABEL }}>
            {s.roleLabel}
          </label>
          <div className="relative">
            <select
              className={INPUT_CLS + ' pl-3 pr-9 appearance-none'}
              style={{ ...INPUT_STYLE }}
              {...register('role')}
            >
              <option value="user"      style={{ background: '#0B2E22' }}>{s.roleUser}</option>
              <option value="volunteer" style={{ background: '#0B2E22' }}>{s.roleVolunteer}</option>
              <option value="ngo"       style={{ background: '#0B2E22' }}>{s.roleNgo}</option>
            </select>
            <ChevronDown size={14} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2"
              style={{ color: 'rgba(247,241,225,0.45)' }} />
          </div>
        </div>

        {/* Password */}
        <div>
          <label className="mb-1.5 block text-sm font-medium" style={{ color: LABEL }}>
            {s.passwordLabel}
          </label>
          <div className="relative">
            <Lock size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2"
              style={{ color: 'rgba(247,241,225,0.35)' }} />
            <input
              type={showPass ? 'text' : 'password'}
              autoComplete="new-password"
              placeholder={s.passwordPlaceholder}
              className={INPUT_CLS + ' pl-9 pr-10'}
              style={{ ...INPUT_STYLE, borderColor: errors.password ? ERR_BORDER : INPUT_STYLE.border }}
              {...register('password', {
                required  : 'Password is required',
                minLength : { value: 6,   message: 'At least 6 characters' },
                maxLength : { value: 128, message: 'Max 128 characters' },
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

        {/* Confirm password */}
        <div>
          <label className="mb-1.5 block text-sm font-medium" style={{ color: LABEL }}>
            {s.confirmPasswordLabel}
          </label>
          <div className="relative">
            <Lock size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2"
              style={{ color: 'rgba(247,241,225,0.35)' }} />
            <input
              type={showConfirm ? 'text' : 'password'}
              autoComplete="new-password"
              placeholder={s.confirmPasswordPlaceholder}
              className={INPUT_CLS + ' pl-9 pr-10'}
              style={{ ...INPUT_STYLE, borderColor: errors.confirmPassword ? ERR_BORDER : INPUT_STYLE.border }}
              {...register('confirmPassword', {
                required : 'Please confirm your password',
                validate : val => val === passwordValue || 'Passwords do not match',
              })}
            />
            <button
              type="button"
              aria-label={showConfirm ? 'Hide password' : 'Show password'}
              onClick={() => setShowConfirm(p => !p)}
              className="absolute right-3 top-1/2 -translate-y-1/2 bg-transparent border-none cursor-pointer"
              style={{ color: 'rgba(247,241,225,0.4)' }}
            >
              {showConfirm ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>
          {errors.confirmPassword && (
            <p className="mt-1 flex items-center gap-1 text-xs text-[#f87171]">
              <AlertCircle size={11} /> {errors.confirmPassword.message}
            </p>
          )}
        </div>

        {/* Terms */}
        <label className="flex cursor-pointer items-start gap-2.5 select-none">
          <input
            type="checkbox"
            className="mt-0.5 h-4 w-4 shrink-0 rounded accent-[#D6472C]"
            {...register('terms', { required: 'You must accept the terms to continue' })}
          />
          <span className="text-sm leading-snug" style={{ color: 'rgba(247,241,225,0.65)' }}>
            {s.termsText}{' '}
            <a href="#" className="font-medium hover:underline" style={{ color: '#E7A93B' }}>
              {s.termsLink}
            </a>
            {' '}{s.andText}{' '}
            <a href="#" className="font-medium hover:underline" style={{ color: '#E7A93B' }}>
              {s.privacyLink}
            </a>
          </span>
        </label>
        {errors.terms && (
          <p className="flex items-center gap-1 text-xs text-[#f87171]">
            <AlertCircle size={11} /> {errors.terms.message}
          </p>
        )}

        {/* Submit */}
        <Button
          type="submit"
          variant="primary"
          size="lg"
          fullWidth
          loading={isSubmitting}
          className="mt-1 !rounded-lg !bg-[#D6472C] hover:!bg-[#c03e27] !text-white font-semibold tracking-wide"
        >
          {s.submitBtn}
        </Button>
      </form>

      {/* ── Sign-in link ──────────────────────────────────────────────────── */}
      <p className="mt-6 text-center text-sm" style={{ color: 'rgba(247,241,225,0.5)' }}>
        {s.hasAccount}{' '}
        <Link
          to={ROUTES.SIGN_IN}
          className="font-semibold transition-colors duration-150"
          style={{ color: '#E7A93B' }}
          onMouseEnter={e => ((e.target as HTMLElement).style.color = '#f59e0b')}
          onMouseLeave={e => ((e.target as HTMLElement).style.color = '#E7A93B')}
        >
          {s.signInLink}
        </Link>
      </p>
    </>
  );
}

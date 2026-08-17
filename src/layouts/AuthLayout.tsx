import { Outlet, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShebaBDLogo } from '@/components/common/ShebaBDLogo';
import { ROUTES } from '@/constants/routes';

/**
 * AuthLayout — full-screen centered layout for sign-in / sign-up pages.
 * No navbar or footer. Matches the dark-green brand background.
 */
export default function AuthLayout() {
  return (
    <div
      className="relative flex min-h-screen flex-col items-center justify-center px-4 py-12 overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #081F18 0%, #0B2E22 60%, #0d3828 100%)' }}
    >
      {/* Decorative background orbs */}
      <div
        className="pointer-events-none absolute -top-32 -left-32 w-[500px] h-[500px] rounded-full opacity-20"
        style={{ background: 'radial-gradient(circle, #D6472C 0%, transparent 70%)' }}
      />
      <div
        className="pointer-events-none absolute -bottom-32 -right-32 w-[400px] h-[400px] rounded-full opacity-15"
        style={{ background: 'radial-gradient(circle, #E7A93B 0%, transparent 70%)' }}
      />

      {/* Logo — links back to home */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mb-8"
      >
        <Link to={ROUTES.HOME} aria-label="ShebaBD Home">
          <ShebaBDLogo size={36} textSize={22} variant="dark" showText />
        </Link>
      </motion.div>

      {/* Page card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.08 }}
        className="w-full max-w-[440px]"
      >
        <div
          className="rounded-xl px-8 py-10"
          style={{
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(247,241,225,0.12)',
            backdropFilter: 'blur(16px)',
            boxShadow: '0 24px 64px rgba(0,0,0,0.4)',
          }}
        >
          <Outlet />
        </div>
      </motion.div>

      {/* Footer note */}
      <p className="mt-8 text-[12px]" style={{ color: 'rgba(247,241,225,0.35)' }}>
        © {new Date().getFullYear()} ShebaBD · Department of CSE, Northern University Bangladesh
      </p>
    </div>
  );
}

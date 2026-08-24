import { useState, useRef, useEffect, useCallback } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion, useScroll, useTransform } from 'framer-motion';
import {
  X, ChevronDown, ShieldAlert, Flag, Wand2, Search,
  HeartHandshake, BarChart2, Satellite, Users,
  Building2, ShieldCheck, Globe, Sparkles,
  LogIn, UserPlus, LogOut, UserCircle2, Heart, BarChart3,
} from 'lucide-react';
import { ShebaBDLogo } from '@/components/common/ShebaBDLogo';
import { ROUTES } from '@/constants/routes';
import { useLanguage } from '@/hooks/useLanguage';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/utils/cn';

// ─── AI links meta (color + icon only — labels come from t.ai) ───────────────
const AI_LINK_META = [
  { key: 'ngoDetection'    as const, href: ROUTES.AI_NGO_DETECTION,           icon: <ShieldAlert size={16}/>, color: '#D6472C' },
  { key: 'reviewShield'    as const, href: ROUTES.AI_REVIEW_DETECTION,        icon: <Flag size={16}/>,        color: '#F59E0B' },
  { key: 'aiWriter'        as const, href: ROUTES.AI_CONTENT_GENERATOR,       icon: <Wand2 size={16}/>,       color: '#E7A93B' },
  { key: 'smartSearch'     as const, href: ROUTES.AI_SMART_SEARCH,            icon: <Search size={16}/>,      color: '#3E7A8C' },
  { key: 'donationAdvisor' as const, href: ROUTES.AI_DONATION_ADVISOR,        icon: <HeartHandshake size={16}/>, color: '#4C8C6B' },
  { key: 'analytics'       as const, href: ROUTES.AI_ANALYTICS,               icon: <BarChart2 size={16}/>,   color: '#E7A93B' },
  { key: 'disaster'        as const, href: ROUTES.DISASTER_INTELLIGENCE,      icon: <Satellite size={16}/>,   color: '#EF4444' },
  { key: 'volunteerMatch'  as const, href: ROUTES.AI_VOLUNTEER_RECOMMENDATION,icon: <Users size={16}/>,       color: '#4C8C6B' },
  { key: 'orgRec'          as const, href: ROUTES.AI_ORG_RECOMMENDATION,      icon: <Building2 size={16}/>,   color: '#3E7A8C' },
  { key: 'trustScore'      as const, href: ROUTES.AI_ORG_TRUST_SCORE,         icon: <ShieldCheck size={16}/>, color: '#E7A93B' },
];

// ─── Nav link keys (map to t.nav) ─────────────────────────────────────────────
const NAV_LINK_META = [
  { key: 'home'          as const, href: ROUTES.HOME          },
  { key: 'organizations' as const, href: ROUTES.ORGANIZATIONS },
  { key: 'volunteers'    as const, href: ROUTES.VOLUNTEERS     },
  { key: 'emergency'     as const, href: ROUTES.EMERGENCY      },
  { key: 'bloodDonation' as const, href: ROUTES.BLOOD_DONATION },
  { key: 'events'        as const, href: ROUTES.EVENTS         },
  { key: 'community'     as const, href: ROUTES.COMMUNITY      },
  { key: 'about'         as const, href: ROUTES.ABOUT          },
];

// ─── AI Dropdown ──────────────────────────────────────────────────────────────
function AiDropdown({ pathname }: { pathname: string }) {
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const isAiActive = AI_LINK_META.some(l => pathname === l.href);

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        className={cn(
          'flex items-center gap-[5px] text-[13.5px] font-medium transition-colors duration-200 bg-transparent border-none cursor-pointer',
          isAiActive ? 'text-[#F7F1E1]' : 'text-[rgba(247,241,225,0.62)] hover:text-[#F7F1E1]',
        )}
      >
        {t.nav.aiTools}
        <motion.span animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown size={13} />
        </motion.span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            key="ai-dropdown"
            initial={{ opacity: 0, y: 6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.98 }}
            transition={{ duration: 0.15, ease: [0.4, 0, 0.2, 1] }}
            className="absolute top-[calc(100%+12px)] right-0 z-50 w-[480px] overflow-hidden"
            style={{
              background: 'rgba(11,46,34,0.98)',
              border: '1px solid rgba(247,241,225,0.14)',
              borderRadius: 6,
              boxShadow: '0 16px 36px rgba(0,0,0,0.42)',
            }}
          >
            {/* header */}
            <div className="px-4 pt-2.5 pb-2 flex items-center justify-between"
              style={{ borderBottom: '1px solid rgba(247,241,225,0.09)' }}>
              <p className="font-mono-ibm text-[9.5px] tracking-[0.12em] uppercase"
                style={{ color: 'rgba(247,241,225,0.35)' }}>
                {t.ai.header}
              </p>
              <span className="inline-flex items-center gap-1 font-mono-ibm text-[9px] tracking-[0.06em]"
                style={{ color: '#E7A93B' }}>
                <span className="w-[4px] h-[4px] rounded-full inline-block" style={{ background: '#E7A93B' }} />
                v2.4
              </span>
            </div>

            {/* 2-column grid */}
            <div className="grid grid-cols-2 p-2 gap-0.5">
              {AI_LINK_META.map(({ key, href, icon, color }) => {
                const active = pathname === href;
                const item = t.ai[key];
                return (
                  <Link
                    key={href}
                    to={href}
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 rounded transition-colors duration-150"
                    style={{
                      background: active ? 'rgba(247,241,225,0.07)' : 'transparent',
                      borderLeft: active ? `2px solid ${color}` : '2px solid transparent',
                    }}
                    onMouseEnter={e => { if (!active) e.currentTarget.style.background = 'rgba(247,241,225,0.05)'; }}
                    onMouseLeave={e => { if (!active) e.currentTarget.style.background = active ? 'rgba(247,241,225,0.07)' : 'transparent'; }}
                  >
                    <span className="flex-shrink-0" style={{ color }}>{icon}</span>
                    <div className="min-w-0">
                      <p className="text-[12.5px] font-medium leading-none truncate"
                        style={{ color: active ? '#F7F1E1' : 'rgba(247,241,225,0.82)' }}>
                        {item.label}
                      </p>
                      <p className="text-[10.5px] mt-[3px] leading-none truncate"
                        style={{ color: 'rgba(247,241,225,0.36)' }}>
                        {item.sub}
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── User Menu (authenticated) ────────────────────────────────────────────────
function UserMenu() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const initials = user?.name
    ?.split(' ')
    .slice(0, 2)
    .map(n => n[0])
    .join('')
    .toUpperCase() ?? '?';

  const handleLogout = () => {
    logout();
    setOpen(false);
    navigate(ROUTES.HOME);
  };

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-2 rounded-full transition-all duration-200"
        style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}
        aria-label="User menu"
        aria-expanded={open}
      >
        <span
          className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold"
          style={{ background: 'linear-gradient(135deg, #D6472C, #E7A93B)', color: '#fff' }}
        >
          {initials}
        </span>
        <motion.span animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown size={13} style={{ color: 'rgba(247,241,225,0.62)' }} />
        </motion.span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            key="user-dropdown"
            initial={{ opacity: 0, y: 6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-[calc(100%+10px)] z-50 w-52 overflow-hidden rounded-lg"
            style={{
              background: 'rgba(11,46,34,0.98)',
              border: '1px solid rgba(247,241,225,0.14)',
              boxShadow: '0 16px 36px rgba(0,0,0,0.42)',
            }}
          >
            {/* User info */}
            <div className="px-4 py-3" style={{ borderBottom: '1px solid rgba(247,241,225,0.09)' }}>
              <p className="text-sm font-semibold truncate" style={{ color: '#F7F1E1' }}>{user?.name}</p>
              <p className="text-xs truncate mt-0.5" style={{ color: 'rgba(247,241,225,0.45)' }}>{user?.email}</p>
            </div>
            {/* Menu items */}
            <div className="py-1.5">
              <button
                onClick={() => { setOpen(false); navigate(ROUTES.PROFILE); }}
                className="flex w-full items-center gap-2.5 px-4 py-2 text-sm transition-colors duration-150"
                style={{ color: 'rgba(247,241,225,0.75)', background: 'transparent', border: 'none', cursor: 'pointer' }}
                onMouseEnter={e => (e.currentTarget.style.background = 'rgba(247,241,225,0.06)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
              >
                <UserCircle2 size={15} />
                My Profile
              </button>
              <button
                onClick={() => { setOpen(false); navigate(ROUTES.DONATION_HISTORY); }}
                className="flex w-full items-center gap-2.5 px-4 py-2 text-sm transition-colors duration-150"
                style={{ color: 'rgba(247,241,225,0.75)', background: 'transparent', border: 'none', cursor: 'pointer' }}
                onMouseEnter={e => (e.currentTarget.style.background = 'rgba(247,241,225,0.06)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
              >
                <Heart size={15} />
                My Donations
              </button>
              {user?.role === 'admin' && (
                <button
                  onClick={() => { setOpen(false); navigate(ROUTES.DONATION_ANALYTICS); }}
                  className="flex w-full items-center gap-2.5 px-4 py-2 text-sm transition-colors duration-150"
                  style={{ color: 'rgba(231,169,59,0.9)', background: 'transparent', border: 'none', cursor: 'pointer' }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'rgba(231,169,59,0.07)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                >
                  <BarChart3 size={15} />
                  Donation Analytics
                </button>
              )}
              <button
                onClick={handleLogout}
                className="flex w-full items-center gap-2.5 px-4 py-2 text-sm transition-colors duration-150"
                style={{ color: '#f87171', background: 'transparent', border: 'none', cursor: 'pointer' }}
                onMouseEnter={e => (e.currentTarget.style.background = 'rgba(248,113,113,0.08)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
              >
                <LogOut size={15} />
                Sign Out
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Navbar ───────────────────────────────────────────────────────────────────
export function Navbar() {
  const { t, toggleLang } = useLanguage();
  const { isAuthenticated } = useAuth();
  const [mobileOpen, setMobileOpen]   = useState(false);
  const [aiMobileOpen, setAiMobileOpen] = useState(false);
  const [scrolled, setScrolled]       = useState(false);
  const { pathname } = useLocation();

  // Track scroll for navbar glass intensity
  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  return (
    <motion.header
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0,   opacity: 1 }}
      transition={{ duration: 0.55, ease: [0.4, 0, 0.2, 1] }}
      className="sticky top-0 z-50 w-full transition-all duration-500"
      style={{
        background: scrolled
          ? 'rgba(8, 36, 26, 0.97)'
          : 'rgba(11, 46, 34, 0.82)',
        backdropFilter: scrolled ? 'blur(24px) saturate(180%)' : 'blur(12px) saturate(140%)',
        WebkitBackdropFilter: scrolled ? 'blur(24px) saturate(180%)' : 'blur(12px) saturate(140%)',
        borderBottom: scrolled
          ? '1px solid rgba(247,241,225,0.12)'
          : '1px solid rgba(247,241,225,0.08)',
        boxShadow: scrolled ? '0 8px 32px rgba(0,0,0,0.35)' : 'none',
      }}
    >
      <nav className="mx-auto flex max-w-[1280px] items-center gap-4 px-5 py-[13px]">

        {/* ── Logo ─────────────────────────────────────────────────────────── */}
        <Link to={ROUTES.HOME} aria-label="ShebaBD Home" className="flex-shrink-0 mr-2">
          <ShebaBDLogo size={26} textSize={16} variant="dark" />
        </Link>

        {/* ── Desktop nav links (scrollable if viewport narrow) ─────────────── */}
        <div className="hidden items-center gap-[18px] lg:flex flex-1 min-w-0">
          {NAV_LINK_META.map(({ key, href }, i) => {
            const active = pathname === href;
            return (
              <motion.div
                key={href}
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: 0.04 + i * 0.03 }}
                className="relative flex-shrink-0"
              >
                <Link
                  to={href}
                  aria-current={active ? 'page' : undefined}
                  className={cn(
                    'text-[13px] font-medium transition-colors duration-200 whitespace-nowrap pb-[2px] relative',
                    active ? 'text-[#F7F1E1]' : 'text-[rgba(247,241,225,0.58)] hover:text-[#F7F1E1]',
                  )}
                >
                  {t.nav[key]}
                  {active && (
                    <motion.span
                      layoutId="nav-underline"
                      className="absolute -bottom-[2px] left-0 right-0 h-[2px] rounded-full"
                      style={{ background: 'linear-gradient(90deg, #D6472C, #E7A93B)' }}
                      transition={{ type: 'spring', stiffness: 380, damping: 34 }}
                    />
                  )}
                </Link>
              </motion.div>
            );
          })}
          <div className="flex-shrink-0">
            <AiDropdown pathname={pathname} />
          </div>
        </div>

        {/* ── Right side ───────────────────────────────────────────────────── */}
        <div className="flex items-center gap-2 flex-shrink-0 ml-auto">

          {/* Lang toggle */}
          <button
            onClick={toggleLang}
            title="Switch language"
            className="hidden md:inline-flex items-center gap-[4px] font-mono-ibm text-[11px] font-semibold px-2.5 py-[6px] rounded transition-all duration-200 flex-shrink-0"
            style={{
              border: '1px solid rgba(247,241,225,0.16)',
              color: 'rgba(247,241,225,0.6)',
              background: 'transparent',
              cursor: 'pointer',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = 'rgba(231,169,59,0.45)';
              e.currentTarget.style.color = '#E7A93B';
              e.currentTarget.style.background = 'rgba(231,169,59,0.06)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = 'rgba(247,241,225,0.16)';
              e.currentTarget.style.color = 'rgba(247,241,225,0.6)';
              e.currentTarget.style.background = 'transparent';
            }}
          >
            <Globe size={11} />
            {t.nav.langToggle}
          </button>

          {isAuthenticated ? (
            <>
              {/* Donate button */}
              <Link
                to={ROUTES.DONATE}
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-[7px] text-[12.5px] font-semibold rounded whitespace-nowrap transition-all duration-300 hover:-translate-y-0.5 flex-shrink-0"
                style={{
                  background: 'linear-gradient(135deg, #D6472C 0%, #B93B23 100%)',
                  color: '#F7F1E1',
                  boxShadow: '0 3px 12px rgba(214,71,44,0.28)',
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.boxShadow = '0 6px 20px rgba(214,71,44,0.45)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.boxShadow = '0 3px 12px rgba(214,71,44,0.28)'; }}
              >
                <Sparkles size={12} />
                {t.nav.donate}
              </Link>
              {/* Avatar menu */}
              <UserMenu />
            </>
          ) : (
            <>
              <Link
                to={ROUTES.SIGN_IN}
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-[7px] text-[12.5px] font-semibold rounded whitespace-nowrap transition-all duration-200 flex-shrink-0"
                style={{
                  border: '1px solid rgba(247,241,225,0.18)',
                  color: 'rgba(247,241,225,0.8)',
                  background: 'transparent',
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLElement).style.borderColor = 'rgba(247,241,225,0.36)';
                  (e.currentTarget as HTMLElement).style.color = '#F7F1E1';
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.borderColor = 'rgba(247,241,225,0.18)';
                  (e.currentTarget as HTMLElement).style.color = 'rgba(247,241,225,0.8)';
                }}
              >
                <LogIn size={12} />
                Sign In
              </Link>
              <Link
                to={ROUTES.SIGN_UP}
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-[7px] text-[12.5px] font-semibold rounded whitespace-nowrap transition-all duration-300 hover:-translate-y-0.5 flex-shrink-0"
                style={{
                  background: 'linear-gradient(135deg, #D6472C 0%, #B93B23 100%)',
                  color: '#F7F1E1',
                  boxShadow: '0 3px 12px rgba(214,71,44,0.28)',
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.boxShadow = '0 6px 20px rgba(214,71,44,0.45)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.boxShadow = '0 3px 12px rgba(214,71,44,0.28)'; }}
              >
                <UserPlus size={12} />
                Sign Up
              </Link>
            </>
          )}

          {/* Mobile burger */}
          <button
            type="button"
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen(p => !p)}
            className="flex flex-col gap-[5px] bg-transparent border-none cursor-pointer lg:hidden ml-1"
          >
            {mobileOpen
              ? <X size={20} className="text-[#F7F1E1]" />
              : <>
                  <span className="block w-[20px] h-[1.5px] bg-[#F7F1E1]" />
                  <span className="block w-[20px] h-[1.5px] bg-[#F7F1E1]" />
                  <span className="block w-[20px] h-[1.5px] bg-[#F7F1E1]" />
                </>
            }
          </button>
        </div>
      </nav>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            key="mobile-drawer"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
            className="overflow-hidden lg:hidden"
            style={{ borderTop: '1px solid rgba(247,241,225,0.16)' }}
          >
            <div className="flex flex-col gap-1 px-6 py-4">
              {NAV_LINK_META.map(({ key, href }) => {
                const active = pathname === href;
                return (
                  <Link
                    key={href}
                    to={href}
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      'px-3 py-2.5 text-sm font-medium rounded transition-colors duration-150',
                      active ? 'text-[#F7F1E1] bg-white/10' : 'text-[rgba(247,241,225,0.62)] hover:text-[#F7F1E1] hover:bg-white/5',
                    )}
                  >
                    {t.nav[key]}
                  </Link>
                );
              })}

              {/* AI Tools mobile */}
              <button
                onClick={() => setAiMobileOpen(o => !o)}
                className="flex items-center justify-between px-3 py-2.5 text-sm font-medium rounded text-[rgba(247,241,225,0.62)] hover:text-[#F7F1E1] hover:bg-white/5 transition-colors duration-150 w-full bg-transparent border-none cursor-pointer"
              >
                <span>{t.nav.aiTools}</span>
                <motion.span animate={{ rotate: aiMobileOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
                  <ChevronDown size={14} />
                </motion.span>
              </button>

              <AnimatePresence>
                {aiMobileOpen && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.18 }}
                    className="overflow-hidden pl-3"
                    style={{ borderLeft: '1px solid rgba(247,241,225,0.12)' }}
                  >
                    {AI_LINK_META.map(({ key, href, icon, color }) => {
                      const active = pathname === href;
                      return (
                        <Link
                          key={href}
                          to={href}
                          onClick={() => { setMobileOpen(false); setAiMobileOpen(false); }}
                          className="flex items-center gap-2 px-3 py-2.5 text-sm font-medium rounded transition-colors duration-150"
                          style={{ color: active ? '#F7F1E1' : 'rgba(247,241,225,0.62)' }}
                        >
                          <span style={{ color }}>{icon}</span>
                          {t.ai[key].label}
                        </Link>
                      );
                    })}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Lang toggle mobile */}
              <button
                onClick={() => { toggleLang(); setMobileOpen(false); }}
                className="flex items-center gap-2 px-3 py-2.5 text-sm font-medium rounded text-[rgba(247,241,225,0.62)] hover:text-[#F7F1E1] hover:bg-white/5 transition-colors duration-150 w-full bg-transparent border-none cursor-pointer"
              >
                <Globe size={14} />
                {t.nav.langToggle}
              </button>

              <Link
                to={ROUTES.DONATE}
                onClick={() => setMobileOpen(false)}
                className="mt-2 flex items-center justify-center rounded-[2px] bg-[#D6472C] px-5 py-3 text-sm font-semibold text-[#F7F1E1]"
              >
                {t.nav.donateNow}
              </Link>

              {/* Mobile auth links */}
              {!isAuthenticated && (
                <div className="mt-2 grid grid-cols-2 gap-2">
                  <Link
                    to={ROUTES.SIGN_IN}
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center justify-center gap-1.5 rounded-[2px] px-3 py-2.5 text-sm font-semibold transition-colors duration-150"
                    style={{ border: '1px solid rgba(247,241,225,0.2)', color: 'rgba(247,241,225,0.8)' }}
                  >
                    <LogIn size={14} /> Sign In
                  </Link>
                  <Link
                    to={ROUTES.SIGN_UP}
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center justify-center gap-1.5 rounded-[2px] bg-[#D6472C] px-3 py-2.5 text-sm font-semibold text-[#F7F1E1]"
                  >
                    <UserPlus size={14} /> Sign Up
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
     
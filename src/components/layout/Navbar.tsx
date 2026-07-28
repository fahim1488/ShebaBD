import { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { X, ChevronDown, ShieldAlert, MessageSquareX, Wand2, Search } from 'lucide-react';
import { ShebaBDLogo } from '@/components/common/ShebaBDLogo';
import { ROUTES } from '@/constants/routes';
import { cn } from '@/utils/cn';

// ─── Main nav links (no AI tools — those live in the dropdown) ───────────────
const NAV_LINKS = [
  { label: 'Home',          href: ROUTES.HOME },
  { label: 'Organizations', href: ROUTES.ORGANIZATIONS },
  { label: 'Volunteers',    href: ROUTES.VOLUNTEERS },
  { label: 'Emergency',     href: ROUTES.EMERGENCY },
  { label: 'Blood Donation',href: ROUTES.BLOOD_DONATION },
  { label: 'Events',        href: ROUTES.EVENTS },
  { label: 'About',         href: ROUTES.ABOUT },
];

// ─── AI Tools dropdown items ─────────────────────────────────────────────────
const AI_LINKS = [
  {
    label: 'NGO Detection',
    sub: 'Detect suspicious organisations',
    href: ROUTES.AI_NGO_DETECTION,
    icon: <ShieldAlert size={16} />,
    color: '#D6472C',
  },
  {
    label: 'Review Shield',
    sub: 'Identify fake & AI-generated reviews',
    href: ROUTES.AI_REVIEW_DETECTION,
    icon: <MessageSquareX size={16} />,
    color: '#F59E0B',
  },
  {
    label: 'AI Writer',
    sub: 'Generate awareness & campaign content',
    href: ROUTES.AI_CONTENT_GENERATOR,
    icon: <Wand2 size={16} />,
    color: '#E7A93B',
  },
  {
    label: 'Smart Search',
    sub: 'Natural language search across ShebaBD',
    href: ROUTES.AI_SMART_SEARCH,
    icon: <Search size={16} />,
    color: '#3E7A8C',
  },
];

// ─── Dropdown component ───────────────────────────────────────────────────────
function AiDropdown({ pathname }: { pathname: string }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const isAiActive = AI_LINKS.some(l => pathname === l.href);

  // close on outside click
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
        AI Tools
        <motion.span animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown size={13} />
        </motion.span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            key="ai-dropdown"
            initial={{ opacity: 0, y: 8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.97 }}
            transition={{ duration: 0.18, ease: [0.4, 0, 0.2, 1] }}
            className="absolute top-[calc(100%+14px)] right-0 z-50 min-w-[260px] overflow-hidden"
            style={{
              background: 'rgba(11,46,34,0.98)',
              border: '1px solid rgba(247,241,225,0.16)',
              borderRadius: 4,
              boxShadow: '0 20px 40px rgba(0,0,0,0.45)',
            }}
          >
            {/* header */}
            <div className="px-4 pt-3 pb-2"
              style={{ borderBottom: '1px solid rgba(247,241,225,0.1)' }}>
              <p className="font-mono-ibm text-[10.5px] tracking-[0.1em] uppercase"
                style={{ color: 'rgba(247,241,225,0.4)' }}>
                AI-Powered Features
              </p>
            </div>

            {/* items */}
            {AI_LINKS.map(({ label, sub, href, icon, color }) => {
              const active = pathname === href;
              return (
                <Link
                  key={href}
                  to={href}
                  onClick={() => setOpen(false)}
                  className="flex items-start gap-3 px-4 py-3 transition-colors duration-150"
                  style={{
                    background: active ? 'rgba(247,241,225,0.06)' : 'transparent',
                    borderLeft: active ? `2px solid ${color}` : '2px solid transparent',
                  }}
                  onMouseEnter={e => { if (!active) e.currentTarget.style.background = 'rgba(247,241,225,0.05)'; }}
                  onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent'; }}
                >
                  <span className="mt-[2px] flex-shrink-0" style={{ color }}>{icon}</span>
                  <div>
                    <p className="text-[13.5px] font-medium"
                      style={{ color: active ? '#F7F1E1' : 'rgba(247,241,225,0.85)' }}>
                      {label}
                    </p>
                    <p className="text-[11.5px] mt-[2px]"
                      style={{ color: 'rgba(247,241,225,0.42)' }}>
                      {sub}
                    </p>
                  </div>
                </Link>
              );
            })}

            {/* footer badge */}
            <div className="px-4 py-2" style={{ borderTop: '1px solid rgba(247,241,225,0.1)' }}>
              <span className="inline-flex items-center gap-1 font-mono-ibm text-[10px] tracking-[0.06em]"
                style={{ color: '#E7A93B' }}>
                <span className="w-[5px] h-[5px] rounded-full inline-block" style={{ background: '#E7A93B' }} />
                ShebaBD AI · v2.4
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Navbar ───────────────────────────────────────────────────────────────────
export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [aiMobileOpen, setAiMobileOpen] = useState(false);
  const { pathname } = useLocation();

  return (
    <header
      className="sticky top-0 z-50 w-full"
      style={{
        background: 'rgba(11,46,34,0.92)',
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid rgba(247,241,225,0.16)',
      }}
    >
      <nav className="mx-auto flex max-w-[1280px] items-center justify-between px-6 py-[16px]">
        {/* Logo */}
        <Link to={ROUTES.HOME} aria-label="ShebaBD Home" className="flex-shrink-0">
          <ShebaBDLogo size={28} textSize="text-[18px]" variant="dark" />
        </Link>

        {/* Desktop links */}
        <div className="hidden items-center gap-[22px] lg:flex">
          {NAV_LINKS.map(({ label, href }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                to={href}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'text-[13.5px] font-medium transition-colors duration-200 whitespace-nowrap',
                  active
                    ? 'text-[#F7F1E1]'
                    : 'text-[rgba(247,241,225,0.62)] hover:text-[#F7F1E1]',
                )}
              >
                {label}
              </Link>
            );
          })}

          {/* AI Tools dropdown */}
          <AiDropdown pathname={pathname} />
        </div>

        {/* Right — donate + burger */}
        <div className="flex items-center gap-4 flex-shrink-0">
          <Link
            to={ROUTES.DONATE}
            className="hidden sm:inline-flex items-center gap-2 px-[18px] py-[9px] text-[13px] font-semibold rounded-[2px] bg-[#D6472C] text-[#F7F1E1] transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#B93B23] hover:shadow-[0_8px_20px_rgba(214,71,44,0.35)] whitespace-nowrap"
          >
            Donate
          </Link>
          <button
            type="button"
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen(p => !p)}
            className="flex flex-col gap-[5px] bg-transparent border-none cursor-pointer lg:hidden"
          >
            {mobileOpen
              ? <X size={22} className="text-[#F7F1E1]" />
              : <>
                  <span className="block w-[22px] h-[2px] bg-[#F7F1E1]" />
                  <span className="block w-[22px] h-[2px] bg-[#F7F1E1]" />
                  <span className="block w-[22px] h-[2px] bg-[#F7F1E1]" />
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
              {NAV_LINKS.map(({ label, href }) => {
                const active = pathname === href;
                return (
                  <Link
                    key={href}
                    to={href}
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      'px-3 py-2.5 text-sm font-medium rounded transition-colors duration-150',
                      active
                        ? 'text-[#F7F1E1] bg-white/10'
                        : 'text-[rgba(247,241,225,0.62)] hover:text-[#F7F1E1] hover:bg-white/5',
                    )}
                  >
                    {label}
                  </Link>
                );
              })}

              {/* AI Tools section in mobile */}
              <button
                onClick={() => setAiMobileOpen(o => !o)}
                className="flex items-center justify-between px-3 py-2.5 text-sm font-medium rounded text-[rgba(247,241,225,0.62)] hover:text-[#F7F1E1] hover:bg-white/5 transition-colors duration-150 w-full bg-transparent border-none cursor-pointer"
              >
                <span>AI Tools</span>
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
                    {AI_LINKS.map(({ label, href, icon, color }) => {
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
                          {label}
                        </Link>
                      );
                    })}
                  </motion.div>
                )}
              </AnimatePresence>

              <Link
                to={ROUTES.DONATE}
                onClick={() => setMobileOpen(false)}
                className="mt-2 flex items-center justify-center rounded-[2px] bg-[#D6472C] px-5 py-3 text-sm font-semibold text-[#F7F1E1]"
              >
                Donate Now
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

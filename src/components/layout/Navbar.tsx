import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import { ShebaBDLogo } from '@/components/common/ShebaBDLogo';
import { ROUTES } from '@/constants/routes';
import { cn } from '@/utils/cn';

const NAV_LINKS = [
  { label: 'Home',          href: ROUTES.HOME },
  { label: 'Organizations', href: ROUTES.ORGANIZATIONS },
  { label: 'Volunteers',    href: ROUTES.VOLUNTEERS },
  { label: 'Emergency',     href: ROUTES.EMERGENCY },
  { label: 'Blood Donation',href: ROUTES.BLOOD_DONATION },
  { label: 'Events',        href: ROUTES.EVENTS },
  { label: 'About',         href: ROUTES.ABOUT },
];

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
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
      <nav className="mx-auto flex max-w-[1180px] items-center justify-between px-8 py-[18px]">
        {/* Logo */}
        <Link to={ROUTES.HOME} aria-label="ShebaBD Home">
          <ShebaBDLogo size={30} textSize="text-[19px]" variant="dark" />
        </Link>

        {/* Desktop links */}
        <div className="hidden items-center gap-[34px] lg:flex">
          {NAV_LINKS.map(({ label, href }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                to={href}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'text-[14.5px] font-medium transition-colors duration-200',
                  active
                    ? 'text-[#F7F1E1]'
                    : 'text-[rgba(247,241,225,0.62)] hover:text-[#F7F1E1]',
                )}
              >
                {label}
              </Link>
            );
          })}
        </div>

        {/* Right — donate + burger */}
        <div className="flex items-center gap-5">
          <Link
            to={ROUTES.DONATE}
            className="hidden sm:inline-flex items-center gap-2 px-[22px] py-[11px] text-[14px] font-semibold rounded-[2px] bg-[#D6472C] text-[#F7F1E1] transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#B93B23] hover:shadow-[0_8px_20px_rgba(214,71,44,0.35)]"
          >
            Donate
          </Link>
          <button
            type="button"
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen((p) => !p)}
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

import { Link } from 'react-router-dom';
import { Heart } from 'lucide-react';
import { ShebaBDLogo } from '@/components/common/ShebaBDLogo';
import { ROUTES } from '@/constants/routes';

const FOOTER_LINKS = {
  Platform: [
    { label: 'Organizations', href: ROUTES.ORGANIZATIONS },
    { label: 'Volunteers',    href: ROUTES.VOLUNTEERS },
    { label: 'Events',        href: ROUTES.EVENTS },
    { label: 'Blood Donation',href: ROUTES.BLOOD_DONATION },
  ],
  Emergency: [
    { label: 'Emergency Help',    href: ROUTES.EMERGENCY },
    { label: 'Blood Request',     href: ROUTES.BLOOD_DONATION },
    { label: 'Disaster Response', href: ROUTES.EMERGENCY },
    { label: 'Shelter Finder',    href: ROUTES.EMERGENCY },
  ],
  Company: [
    { label: 'About Us',          href: ROUTES.ABOUT },
    { label: 'Donate',            href: ROUTES.DONATE },
    { label: 'Join as Volunteer', href: ROUTES.VOLUNTEERS },
    { label: 'Register NGO',      href: ROUTES.ORGANIZATIONS },
  ],
};

const LINE = 'rgba(247,241,225,0.16)';
const MUTED = 'rgba(247,241,225,0.62)';

export function Footer() {
  return (
    <footer
      style={{ background: '#0F3A2B', borderTop: `1px solid ${LINE}` }}
      className="pt-[70px] pb-[30px] px-8"
    >
      <div className="mx-auto max-w-[1180px]">
        {/* Grid */}
        <div
          className="grid gap-10 pb-[50px]"
          style={{
            gridTemplateColumns: '1.6fr 1fr 1fr 1fr',
            borderBottom: `1px solid ${LINE}`,
          }}
        >
          {/* Brand */}
          <div>
            <ShebaBDLogo size={30} textSize="text-[19px]" variant="dark" />
            <p
              className="mt-4 mb-5 text-[14px] leading-[1.7] max-w-[280px]"
              style={{ color: MUTED }}
            >
              An AI-powered civic technology platform connecting citizens,
              volunteers, NGOs, and emergency services across Bangladesh.
            </p>
            <div className="flex flex-col gap-[9px] mb-5 text-[14px]" style={{ color: MUTED }}>
              <span>contact@shebabd.org</span>
              <span>+880 1700-000000</span>
              <span>Dhaka, Bangladesh</span>
            </div>
            {/* Social */}
            <div className="flex gap-[10px]">
              {['f', '𝕏', 'in', '◎'].map((icon) => (
                <a
                  key={icon}
                  href="#"
                  className="w-[34px] h-[34px] rounded-full flex items-center justify-center text-[13px] text-[#F7F1E1] transition-colors duration-200 hover:border-[#F7F1E1]"
                  style={{ border: `1px solid ${LINE}` }}
                >
                  {icon}
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(FOOTER_LINKS).map(([heading, links]) => (
            <div key={heading}>
              <h4
                className="text-[13px] uppercase tracking-[0.06em] font-semibold mb-[18px]"
                style={{ color: MUTED }}
              >
                {heading}
              </h4>
              <ul className="space-y-[11px]">
                {links.map(({ label, href }) => (
                  <li key={label}>
                    <Link
                      to={href}
                      className="text-[14.5px] text-[#F7F1E1] opacity-85 hover:opacity-100 transition-opacity duration-200"
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div
          className="mt-6 flex flex-wrap items-center justify-between gap-3 text-[12.5px]"
          style={{ color: MUTED }}
        >
          <span>
            © {new Date().getFullYear()} ShebaBD. All rights reserved. Built with{' '}
            <Heart size={11} className="inline text-[#D6472C]" fill="#D6472C" /> by{' '}
            <span className="text-[#F7F1E1]">The Study Ninjas</span>
          </span>
          <span>Department of CSE · Northern University Bangladesh</span>
        </div>
      </div>
    </footer>
  );
}

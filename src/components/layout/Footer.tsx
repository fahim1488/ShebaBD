import { Link } from 'react-router-dom';
import { Heart } from 'lucide-react';
import { ShebaBDLogo } from '@/components/common/ShebaBDLogo';
import { ROUTES } from '@/constants/routes';
import { useLanguage } from '@/hooks/useLanguage';

const LINE = 'rgba(247,241,225,0.16)';
const MUTED = 'rgba(247,241,225,0.62)';

export function Footer() {
  const { t } = useLanguage();
  const l = t.footer.links;

  const columns = [
    {
      heading: t.footer.platform,
      links: [
        { label: l.organizations, href: ROUTES.ORGANIZATIONS },
        { label: l.volunteers, href: ROUTES.VOLUNTEERS },
        { label: l.events, href: ROUTES.EVENTS },
        { label: l.bloodDonation, href: ROUTES.BLOOD_DONATION },
      ],
    },
    {
      heading: t.footer.emergency,
      links: [
        { label: l.emergencyHelp, href: ROUTES.EMERGENCY },
        { label: l.bloodRequest, href: ROUTES.BLOOD_DONATION },
        { label: l.disasterResponse, href: ROUTES.EMERGENCY },
        { label: l.shelterFinder, href: ROUTES.EMERGENCY },
      ],
    },
    {
      heading: t.footer.company,
      links: [
        { label: l.aboutUs, href: ROUTES.ABOUT },
        { label: l.donate, href: ROUTES.DONATE },
        { label: l.joinVolunteer, href: ROUTES.VOLUNTEERS },
        { label: l.registerNgo, href: ROUTES.ORGANIZATIONS },
      ],
    },
  ];

  return (
    <footer
      className="relative overflow-hidden pt-[70px] pb-[30px] px-8"
      style={{
        background: 'linear-gradient(180deg, #0A2920 0%, #081F18 100%)',
        borderTop: '1px solid rgba(247,241,225,0.10)',
      }}
    >
      {/* Top gradient accent line */}
      <div className="absolute top-0 left-0 right-0 h-[2px]"
        style={{ background: 'linear-gradient(90deg, transparent 0%, rgba(231,169,59,0.5) 35%, rgba(214,71,44,0.5) 65%, transparent 100%)' }} />
      {/* Subtle background orb */}
      <div className="absolute bottom-0 right-0 w-96 h-96 rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(76,140,107,0.05) 0%, transparent 70%)' }} />
      <div className="mx-auto max-w-[1180px]">
        <div
          className="grid gap-10 pb-[50px]"
          style={{
            gridTemplateColumns: '1.6fr 1fr 1fr 1fr',
            borderBottom: `1px solid ${LINE}`,
          }}
        >
          <div>
            <ShebaBDLogo size={30} textSize={19} variant="dark" />
            <p
              className="mt-4 mb-5 text-[14px] leading-[1.7] max-w-[280px]"
              style={{ color: MUTED }}
            >
              {t.footer.tagline}
            </p>
            <div className="flex flex-col gap-[9px] mb-5 text-[14px]" style={{ color: MUTED }}>
              <span>contact@shebabd.org</span>
              <span>+880 1700-000000</span>
              <span>Dhaka, Bangladesh</span>
            </div>
            <div className="flex gap-[10px]">
              {[
                { icon: 'f', label: 'Facebook', color: '#1877F2' },
                { icon: '𝕏', label: 'Twitter',  color: '#E7A93B' },
                { icon: 'in',label: 'LinkedIn', color: '#0A66C2' },
                { icon: '◎', label: 'Instagram',color: '#E1306C' },
              ].map(({ icon, label, color }) => (
                <a
                  key={label}
                  href="#"
                  aria-label={label}
                  className="w-[34px] h-[34px] rounded-full flex items-center justify-center text-[13px] transition-all duration-250 hover:-translate-y-0.5"
                  style={{ border: `1px solid ${LINE}`, color: MUTED }}
                  onMouseEnter={e => {
                    const el = e.currentTarget as HTMLElement;
                    el.style.borderColor = color;
                    el.style.color = color;
                    el.style.boxShadow = `0 0 14px ${color}44`;
                    el.style.background = `${color}12`;
                  }}
                  onMouseLeave={e => {
                    const el = e.currentTarget as HTMLElement;
                    el.style.borderColor = LINE;
                    el.style.color = MUTED;
                    el.style.boxShadow = 'none';
                    el.style.background = 'transparent';
                  }}
                >
                  {icon}
                </a>
              ))}
            </div>
          </div>

          {columns.map(({ heading, links }) => (
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
                      className="text-[14px] transition-all duration-200 hover:translate-x-1 inline-block"
                      style={{ color: 'rgba(247,241,225,0.72)' }}
                      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#E7A93B'; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'rgba(247,241,225,0.72)'; }}
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div
          className="mt-6 flex flex-wrap items-center justify-between gap-3 text-[12.5px]"
          style={{ color: MUTED }}
        >
          <span>
            © {new Date().getFullYear()} ShebaBD. {t.footer.copyright}{' '}
            <Heart size={11} className="inline text-[#D6472C]" fill="#D6472C" /> {t.footer.builtBy}
          </span>
          <span>{t.footer.university}</span>
        </div>
      </div>
    </footer>
  );
}
 
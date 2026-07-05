import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { WorldMap } from '@/components/ui/map/WorldMap';
import { ROUTES } from '@/constants/routes';

// ─── Design tokens (matches reference HTML exactly) ───────────────────────────
const INK      = '#0B2E22';
const INK2     = '#0F3A2B';
const PAPER    = '#F7F1E1';
const DISC     = '#D6472C';
const DISC_DIM = '#B93B23';
const MARIGOLD = '#E7A93B';
const SKY      = '#3E7A8C';
const MUTED_L  = 'rgba(247,241,225,0.62)';
const MUTED_D  = 'rgba(22,36,29,0.62)';
const LINE_L   = 'rgba(247,241,225,0.16)';
const LINE_D   = 'rgba(22,36,29,0.14)';

// ─── Reusable Eyebrow ─────────────────────────────────────────────────────────
function Eyebrow({ label, onPaper = false }: { label: string; onPaper?: boolean }) {
  return (
    <div
      className="inline-flex items-center gap-[9px] font-mono-ibm text-[12px] tracking-[0.11em] uppercase"
      style={{ color: onPaper ? MUTED_D : MUTED_L }}
    >
      <span
        className="inline-block w-[6px] h-[6px] rounded-full"
        style={{ background: DISC }}
      />
      {label}
    </div>
  );
}

// ─── Reveal on scroll ─────────────────────────────────────────────────────────
function Reveal({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { el.style.opacity = '1'; el.style.transform = 'translateY(0)'; io.unobserve(el); } },
      { threshold: 0.12 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <div
      ref={ref}
      className={className}
      style={{ opacity: 0, transform: 'translateY(24px)', transition: 'opacity 0.7s ease, transform 0.7s ease' }}
    >
      {children}
    </div>
  );
}

// ─── Data ─────────────────────────────────────────────────────────────────────
const FEATURES = [
  { icon: '🏛', title: 'Organization Discovery', desc: 'Find verified NGOs, charities, and social groups by district, category, or GPS location on an interactive map.', iconClass: 'border-[#F7F1E1] text-[#F7F1E1]', href: ROUTES.ORGANIZATIONS },
  { icon: '👥', title: 'Volunteer Management',   desc: 'Register skills, join campaigns, track hours, earn achievement badges, and build a digital volunteer portfolio.', iconClass: `border-[${SKY}] text-[${SKY}]`, href: ROUTES.VOLUNTEERS },
  { icon: '▲',  title: 'Emergency Response',     desc: 'Submit emergency requests with AI priority analysis. Get connected to nearby organisations instantly.', iconClass: `border-[${DISC}] text-[${DISC}]`, href: ROUTES.EMERGENCY },
  { icon: '♥',  title: 'Blood Donation',         desc: 'AI-powered donor matching by blood group, location, and availability. Save lives in minutes.', iconClass: `border-[${DISC}] text-[${DISC}]`, href: ROUTES.BLOOD_DONATION },
  { icon: '▦',  title: 'Event Management',       desc: 'Discover, register for, and attend social campaigns, awareness drives, and volunteer events near you.', iconClass: `border-[${MARIGOLD}] text-[${MARIGOLD}]`, href: ROUTES.EVENTS },
  { icon: '✦',  title: 'AI Assistant',           desc: 'Bilingual (Bangla & English) AI assistant guiding users through organisations, donations, and emergency services.', iconClass: `border-[${MARIGOLD}] text-[${MARIGOLD}]`, href: ROUTES.HOME },
];

const AI_ITEMS = [
  { num: '01', title: 'Smart Volunteer Matching', desc: 'Matches skills, location & availability to the right opportunity.' },
  { num: '02', title: 'Fake NGO Detection',       desc: 'Behavioural AI flags suspicious organisations before they reach users.' },
  { num: '03', title: 'Impact Analytics',         desc: 'Live dashboards showing donations, volunteer hours, and district coverage.' },
  { num: '04', title: 'Disaster Intelligence',    desc: 'Real-time affected-area visualisation and emergency org recommendations.' },
  { num: '05', title: 'Donation Advisor',         desc: 'Estimates how your donation translates to meals, healthcare, or education.' },
  { num: '06', title: 'Trust Score',              desc: 'Composite score built from verification status, reviews, and transparency.' },
];

const TESTIMONIALS = [
  { avatar: 'FA', name: 'Fatema Akter',  role: 'Volunteer, Dhaka',          quote: 'ShebaBD helped me find the perfect volunteer opportunity matching my skills in just minutes. The platform is incredibly easy to use.' },
  { avatar: 'RU', name: 'Rahim Uddin',   role: 'NGO Director, Chittagong',  quote: 'We increased our volunteer recruitment by 300% after listing on ShebaBD. The AI-powered matching is a game changer.' },
  { avatar: 'NB', name: 'Nasrin Begum',  role: 'Blood Donor, Sylhet',       quote: 'Within 20 minutes of the request, ShebaBD found me a matching donor for my mother. This platform saves lives.' },
];

// ─── Component ────────────────────────────────────────────────────────────────
export default function Home() {
  return (
    <div style={{ background: INK, color: PAPER, overflowX: 'hidden' }}>

      {/* ════════════════════════════════════════════════════════════════════
          HERO
      ════════════════════════════════════════════════════════════════════ */}
      <section
        className="relative px-8 text-center"
        style={{ padding: '96px 32px 80px' }}
      >
        {/* Red radial glow top-right */}
        <div
          className="pointer-events-none absolute rounded-full"
          style={{
            top: -120, right: -160, width: 480, height: 480,
            background: 'radial-gradient(circle, rgba(214,71,44,0.16), transparent 70%)',
          }}
        />

        <Reveal>
          <div className="mb-7">
            <Eyebrow label="AI-Powered Civic Technology Platform" />
          </div>
        </Reveal>

        <Reveal>
          <h1
            className="font-fraunces mx-auto mb-6"
            style={{
              fontSize: 'clamp(42px, 6.4vw, 84px)',
              lineHeight: 1.03,
              letterSpacing: '-0.02em',
              maxWidth: 900,
              fontWeight: 600,
            }}
          >
            Connect. Serve.{' '}
            <span style={{ color: MARIGOLD, fontStyle: 'italic', fontWeight: 500 }}>
              Impact
            </span>
            <span
              className="inline-block rounded-full align-middle"
              style={{ width: '0.5em', height: '0.5em', background: DISC, marginLeft: 4 }}
            />
          </h1>
        </Reveal>

        <Reveal>
          <p
            className="mx-auto mb-10"
            style={{ maxWidth: 560, color: MUTED_L, fontSize: 17, lineHeight: 1.65 }}
          >
            ShebaBD unites citizens, volunteers, NGOs, and emergency responders
            across Bangladesh — powered by artificial intelligence for smarter,
            faster social service delivery.
          </p>
        </Reveal>

        <Reveal>
          <div className="flex flex-wrap justify-center gap-[14px] mb-11">
            {/* Paper btn */}
            <Link
              to={ROUTES.VOLUNTEERS}
              className="inline-flex items-center gap-2 px-[22px] py-[11px] text-[14px] font-semibold rounded-[2px] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_8px_20px_rgba(247,241,225,0.2)]"
              style={{ background: PAPER, color: INK }}
            >
              Join as Volunteer
            </Link>
            {/* Line btn */}
            <Link
              to={ROUTES.ORGANIZATIONS}
              className="inline-flex items-center gap-2 px-[22px] py-[11px] text-[14px] font-semibold rounded-[2px] transition-all duration-200 hover:-translate-y-0.5"
              style={{ border: `1px solid ${LINE_L}`, color: PAPER }}
              onMouseEnter={e => (e.currentTarget.style.borderColor = PAPER)}
              onMouseLeave={e => (e.currentTarget.style.borderColor = LINE_L)}
            >
              Explore Organizations →
            </Link>
            {/* Disc btn */}
            <Link
              to={ROUTES.EMERGENCY}
              className="inline-flex items-center gap-2 px-[22px] py-[11px] text-[14px] font-semibold rounded-[2px] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_8px_20px_rgba(214,71,44,0.35)]"
              style={{ background: DISC, color: PAPER }}
              onMouseEnter={e => (e.currentTarget.style.background = DISC_DIM)}
              onMouseLeave={e => (e.currentTarget.style.background = DISC)}
            >
              {/* Pulse dot */}
              <span
                className="inline-block rounded-full"
                style={{ width: 8, height: 8, background: PAPER, animation: 'sheba-pulse 1.8s infinite' }}
              />
              Emergency Help
            </Link>
          </div>
        </Reveal>

        <Reveal>
          <div
            className="flex flex-wrap justify-center gap-7 font-mono-ibm text-[12px]"
            style={{ color: MUTED_L }}
          >
            {['Verified NGO Directory', 'AI-Powered Matching', 'Real-time Emergency Response', '64 Districts'].map(t => (
              <span key={t} className="flex items-center gap-[7px]">
                <span className="inline-block w-[5px] h-[5px] rounded-full" style={{ background: DISC }} />
                {t}
              </span>
            ))}
          </div>
        </Reveal>

        {/* pulse keyframe */}
        <style>{`@keyframes sheba-pulse{0%,100%{opacity:1}50%{opacity:.35}}`}</style>
      </section>

      {/* ════════════════════════════════════════════════════════════════════
          LEDGER STATS
      ════════════════════════════════════════════════════════════════════ */}
      <section className="px-8 pb-[100px]">
        <Reveal>
          <div
            className="mx-auto rounded-[3px] overflow-hidden"
            style={{
              maxWidth: 1180,
              background: PAPER,
              color: INK,
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              boxShadow: '0 30px 60px -20px rgba(0,0,0,0.5)',
            }}
          >
            {[
              { num: '2,400+', label: 'Registered NGOs' },
              { num: '18,000+', label: 'Active Volunteers' },
              { num: '64', label: 'Districts Covered' },
              { num: '৳4.2Cr', label: 'Donations Tracked' },
            ].map(({ num, label }, i) => (
              <div
                key={label}
                className="text-center py-[38px] px-5"
                style={{ borderRight: i < 3 ? `1px solid ${LINE_D}` : 'none' }}
              >
                <span
                  className="block font-mono-ibm font-medium mb-[6px]"
                  style={{ fontSize: 'clamp(26px,3vw,38px)', color: INK }}
                >
                  {num}
                </span>
                <span
                  className="text-[12.5px] uppercase tracking-[0.06em]"
                  style={{ color: MUTED_D }}
                >
                  {label}
                </span>
              </div>
            ))}
          </div>
        </Reveal>
      </section>

      {/* ════════════════════════════════════════════════════════════════════
          CORE FEATURES
      ════════════════════════════════════════════════════════════════════ */}
      <section className="px-8 pb-[110px]">
        <div className="mx-auto" style={{ maxWidth: 1180 }}>
          <Reveal>
            <div className="text-center mb-16">
              <Eyebrow label="What's Inside" />
              <h2
                className="font-fraunces mt-5 mb-4"
                style={{ fontSize: 'clamp(32px,4vw,48px)', lineHeight: 1.1, fontWeight: 600 }}
              >
                Everything you need,<br />in one place
              </h2>
              <p style={{ color: MUTED_L, fontSize: 16, lineHeight: 1.6 }}>
                A unified platform that digitises social service management across Bangladesh.
              </p>
            </div>
          </Reveal>

          <Reveal>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3,1fr)',
                gap: 1,
                background: LINE_L,
                border: `1px solid ${LINE_L}`,
              }}
            >
              {FEATURES.map(({ icon, title, desc, iconClass, href }) => (
                <Link
                  key={title}
                  to={href}
                  className="group block"
                  style={{ background: INK, padding: '40px 34px', transition: 'background 0.25s ease' }}
                  onMouseEnter={e => (e.currentTarget.style.background = '#123F30')}
                  onMouseLeave={e => (e.currentTarget.style.background = INK)}
                >
                  <div
                    className={`w-11 h-11 rounded-full flex items-center justify-center mb-[22px] text-[19px] border-[1.5px] ${iconClass}`}
                  >
                    {icon}
                  </div>
                  <h3
                    className="font-fraunces mb-[10px]"
                    style={{ fontSize: 19, fontWeight: 600, color: PAPER }}
                  >
                    {title}
                  </h3>
                  <p style={{ fontSize: 14.5, lineHeight: 1.65, color: MUTED_L }}>{desc}</p>
                </Link>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════════════
          AI SECTION
      ════════════════════════════════════════════════════════════════════ */}
      <section
        className="px-8 py-[110px]"
        style={{ background: INK2, borderTop: `1px solid ${LINE_L}`, borderBottom: `1px solid ${LINE_L}` }}
      >
        <div className="mx-auto" style={{ maxWidth: 1180 }}>
          <Reveal>
            <div className="text-center mb-16">
              <span
                className="inline-flex items-center gap-2 px-[14px] py-[6px] rounded-full font-mono-ibm text-[11.5px] uppercase tracking-[0.08em]"
                style={{ border: `1px solid ${MARIGOLD}`, color: MARIGOLD }}
              >
                <span className="w-[6px] h-[6px] rounded-full inline-block" style={{ background: MARIGOLD }} />
                Artificial Intelligence
              </span>
              <h2
                className="font-fraunces mt-[22px] mb-4"
                style={{ fontSize: 'clamp(32px,4vw,48px)', lineHeight: 1.1, fontWeight: 600 }}
              >
                AI at the core
              </h2>
              <p style={{ color: MUTED_L, fontSize: 16, lineHeight: 1.6 }}>
                ShebaBD integrates AI as its core innovation — from volunteer matching to fraud detection.
              </p>
            </div>
          </Reveal>

          <Reveal>
            <div
              style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 2 }}
            >
              {AI_ITEMS.map(({ num, title, desc }) => (
                <div key={num} style={{ padding: '30px 8px 30px 0' }}>
                  <span
                    className="block font-mono-ibm text-[12px] mb-[14px]"
                    style={{ color: MARIGOLD }}
                  >
                    {num}
                  </span>
                  <h3
                    className="font-fraunces mb-2"
                    style={{ fontSize: 17, fontWeight: 600 }}
                  >
                    {title}
                  </h3>
                  <p style={{ fontSize: 14, color: MUTED_L, lineHeight: 1.6 }}>{desc}</p>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════════════
          GLOBAL NETWORK MAP
      ════════════════════════════════════════════════════════════════════ */}
      <section className="px-8 py-[110px]">
        <div className="mx-auto" style={{ maxWidth: 1180 }}>
          <Reveal>
            <div className="text-center mb-14">
              <Eyebrow label="Global Network" />
              <h2
                className="font-fraunces mt-5 mb-4"
                style={{ fontSize: 'clamp(32px,4vw,48px)', lineHeight: 1.1, fontWeight: 600 }}
              >
                Bangladesh connects<br />to the world
              </h2>
              <p style={{ color: MUTED_L, fontSize: 16, lineHeight: 1.6, maxWidth: 560, margin: '0 auto' }}>
                ShebaBD links Dhaka, Chittagong, and Sylhet to international humanitarian
                partners — enabling cross-border collaboration, aid, and disaster response.
              </p>
            </div>
          </Reveal>

          <Reveal>
            <div
              className="rounded-[4px] p-5 overflow-hidden relative"
              style={{ background: INK2, border: `1px solid ${LINE_L}` }}
            >
              <WorldMap
                lineColor={DISC}
                dots={[
                  { start: { lat: 23.8103, lng: 90.4125, label: 'Dhaka' },      end: { lat: 51.5074, lng: -0.1278,   label: 'London' } },
                  { start: { lat: 22.3569, lng: 91.7832, label: 'Chittagong' }, end: { lat: 40.7128, lng: -74.0060,  label: 'New York' } },
                  { start: { lat: 24.8949, lng: 91.8687, label: 'Sylhet' },     end: { lat: 25.2854, lng: 51.5310,   label: 'Doha' } },
                  { start: { lat: 23.8103, lng: 90.4125, label: 'Dhaka' },      end: { lat: 46.2044, lng: 6.1432,    label: 'Geneva' } },
                  { start: { lat: 22.3569, lng: 91.7832, label: 'Chittagong' }, end: { lat: 3.1390,  lng: 101.6869,  label: 'Kuala Lumpur' } },
                  { start: { lat: 24.3745, lng: 88.6042, label: 'Rajshahi' },   end: { lat: -1.2921, lng: 36.8219,   label: 'Nairobi' } },
                ]}
              />
            </div>
          </Reveal>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════════════
          TESTIMONIALS  (on paper bg)
      ════════════════════════════════════════════════════════════════════ */}
      <section
        className="px-8 py-[110px]"
        style={{ background: PAPER, color: INK }}
      >
        <div className="mx-auto" style={{ maxWidth: 1180 }}>
          <Reveal>
            <div className="text-center mb-16">
              <Eyebrow label="Real Stories" onPaper />
              <h2
                className="font-fraunces mt-5"
                style={{ fontSize: 'clamp(32px,4vw,48px)', lineHeight: 1.1, fontWeight: 600, color: INK }}
              >
                Real stories. Real impact.
              </h2>
            </div>
          </Reveal>

          <Reveal>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 24 }}>
              {TESTIMONIALS.map(({ avatar, name, role, quote }) => (
                <div
                  key={name}
                  className="flex flex-col gap-[18px] rounded-[3px] p-[34px]"
                  style={{ background: PAPER, border: `1px solid ${LINE_D}` }}
                >
                  <div style={{ color: MARIGOLD, fontSize: 14, letterSpacing: 2 }}>★★★★★</div>
                  <p
                    className="font-fraunces flex-1"
                    style={{ fontSize: 15, lineHeight: 1.65, fontStyle: 'italic', fontWeight: 400, color: INK }}
                  >
                    "{quote}"
                  </p>
                  <div className="flex items-center gap-3 mt-auto">
                    <div
                      className="w-[38px] h-[38px] rounded-full flex items-center justify-center font-mono-ibm text-[13px] font-semibold shrink-0"
                      style={{ background: INK, color: PAPER }}
                    >
                      {avatar}
                    </div>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: INK }}>{name}</div>
                      <div style={{ fontSize: 12.5, color: MUTED_D }}>{role}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════════════
          CTA BAND
      ════════════════════════════════════════════════════════════════════ */}
      <section
        className="relative text-center overflow-hidden px-8"
        style={{
          background: INK,
          padding: '120px 32px',
          borderTop: `1px solid ${LINE_L}`,
        }}
      >
        {/* Big decorative disc */}
        <div
          className="absolute rounded-full pointer-events-none"
          style={{
            width: 640, height: 640,
            right: -220, top: '50%', transform: 'translateY(-50%)',
            background: `radial-gradient(circle at 30% 30%, ${DISC}, ${DISC_DIM} 70%)`,
            opacity: 0.9,
          }}
        />
        <Reveal className="relative z-10 mx-auto" style={{ maxWidth: 560 }}>
          <h2
            className="font-fraunces mb-[18px]"
            style={{ fontSize: 'clamp(30px,4vw,46px)', fontWeight: 600 }}
          >
            Ready to make<br />a difference?
          </h2>
          <p className="mb-9" style={{ color: MUTED_L, fontSize: 16 }}>
            Join thousands of volunteers and organisations already transforming lives across Bangladesh.
          </p>
          <div className="flex flex-wrap justify-center gap-[14px]">
            <Link
              to={ROUTES.VOLUNTEERS}
              className="inline-flex items-center gap-2 px-[22px] py-[11px] text-[14px] font-semibold rounded-[2px] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_8px_20px_rgba(247,241,225,0.2)]"
              style={{ background: PAPER, color: INK }}
            >
              Get Started Free
            </Link>
            <Link
              to={ROUTES.DONATE}
              className="inline-flex items-center gap-2 px-[22px] py-[11px] text-[14px] font-semibold rounded-[2px] transition-all duration-200 hover:-translate-y-0.5"
              style={{ border: `1px solid ${LINE_L}`, color: PAPER }}
              onMouseEnter={e => (e.currentTarget.style.borderColor = PAPER)}
              onMouseLeave={e => (e.currentTarget.style.borderColor = LINE_L)}
            >
              Donate Now
            </Link>
          </div>
        </Reveal>
      </section>
    </div>
  );
}

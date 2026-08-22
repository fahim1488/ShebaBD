import { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { ROUTES } from '@/constants/routes';
import { Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import { getOrganizations, getOrgCount, type Organization } from '@/services/organizationsApi';

// ─── Design tokens (matches reference exactly) ─────────────────────────────
const INK     = '#0B2E22';
const INK2    = '#0F3A2B';
const PAPER   = '#F7F1E1';
const DISC    = '#D6472C';
const DISC_DIM= '#B93B23';
const MARIGOLD= '#E7A93B';
const SKY     = '#3E7A8C';
const LEAF    = '#4C8C6B';
const CLAY    = '#A9673A';
const MUTED_L = 'rgba(247,241,225,0.62)';
const LINE_L  = 'rgba(247,241,225,0.16)';

// ─── Category config ───────────────────────────────────────────────────────
const CATEGORIES = [
  { id: 'all',         label: 'All',           color: DISC   },
  { id: 'healthcare',  label: 'Healthcare',    color: SKY    },
  { id: 'education',   label: 'Education',     color: MARIGOLD },
  { id: 'disaster',    label: 'Disaster Relief',color: DISC_DIM },
  { id: 'environment', label: 'Environment',   color: LEAF   },
  { id: 'blood',       label: 'Blood Donation',color: DISC   },
  { id: 'poverty',     label: 'Poverty',       color: CLAY   },
];

const DISTRICTS = [
  'All Districts','Dhaka','Chittagong','Sylhet','Rajshahi','Khulna','Barisal','Mymensingh','Rangpur',
];

// ─── Reveal on scroll ──────────────────────────────────────────────────────
function Reveal({ children, className = '', style = {} }: { children: React.ReactNode; className?: string; style?: React.CSSProperties }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.style.opacity = '1';
          el.style.transform = 'translateY(0)';
          io.unobserve(el);
        }
      },
      { threshold: 0.08 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <div
      ref={ref}
      className={className}
      style={{ opacity: 0, transform: 'translateY(20px)', transition: 'opacity 0.6s ease, transform 0.6s ease', ...style }}
    >
      {children}
    </div>
  );
}

// ─── Component ─────────────────────────────────────────────────────────────
export default function Organizations() {
  const [search, setSearch]           = useState('');
  const [activeCategory, setCategory] = useState('all');
  const [activeDistrict, setDistrict] = useState('All Districts');
  const [orgs, setOrgs]               = useState<Organization[]>([]);
  const [totalCount, setTotalCount]   = useState<number>(0);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState<string | null>(null);

  const loadOrgs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [data, count] = await Promise.all([
        getOrganizations({
          category: activeCategory === 'all' ? undefined : activeCategory,
          district: activeDistrict === 'All Districts' ? undefined : activeDistrict,
          search: search.trim() || undefined,
          limit: 100,
        }),
        getOrgCount().catch(() => 0),
      ]);
      setOrgs(data);
      setTotalCount(count);
    } catch {
      setError('Could not load organizations. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [activeCategory, activeDistrict, search]);

  useEffect(() => {
    const t = setTimeout(loadOrgs, search ? 400 : 0);
    return () => clearTimeout(t);
  }, [loadOrgs, search]);

  return (
    <div style={{ background: INK, color: PAPER, minHeight: '100vh' }}>

      {/* ════════════════════════════════════════════════════════════════════
          PAGE HERO
      ════════════════════════════════════════════════════════════════════ */}
      <section
        className="relative px-8"
        style={{ padding: '72px 32px 40px', maxWidth: 1240, margin: '0 auto' }}
      >
        {/* Marigold glow top-left */}
        <div
          className="pointer-events-none absolute rounded-full"
          style={{
            top: -140, left: -160, width: 460, height: 460,
            background: 'radial-gradient(circle, rgba(231,169,59,0.13), transparent 70%)',
          }}
        />

        <Reveal>
          <div
            className="inline-flex items-center gap-[9px] font-mono-ibm text-[12px] tracking-[0.11em] uppercase mb-5"
            style={{ color: MUTED_L }}
          >
            <span className="inline-block w-[6px] h-[6px] rounded-full" style={{ background: DISC }} />
            Organization Directory
          </div>
        </Reveal>

        <Reveal>
          <h1
            className="font-fraunces mb-[14px]"
            style={{ fontSize: 'clamp(34px,4.6vw,56px)', lineHeight: 1.05, fontWeight: 600 }}
          >
            Discover verified<br />organizations
          </h1>
        </Reveal>

        <Reveal>
          <p style={{ color: MUTED_L, fontSize: 16, maxWidth: 560 }}>
            Browse {totalCount > 0 ? `${totalCount}+` : '2,400+'} verified NGOs, charities, and social groups across 64 districts of Bangladesh.
          </p>
        </Reveal>

        {/* ── Search + District ─────────────────────────────────────────── */}
        <Reveal>
          <div className="flex flex-wrap gap-[14px] mt-10 mb-[22px]">
            {/* Search box */}
            <div
              className="flex flex-1 items-center gap-3"
              style={{
                minWidth: 260,
                background: INK2,
                border: `1px solid ${LINE_L}`,
                borderRadius: 2,
                padding: '14px 18px',
              }}
            >
              <span style={{ color: MUTED_L, fontSize: 18 }}>⌕</span>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search organizations by name, cause, or district…"
                style={{
                  background: 'none', border: 'none', outline: 'none',
                  color: PAPER, fontSize: 14.5, width: '100%', fontFamily: 'Inter, sans-serif',
                }}
                // placeholder color via class
                className="placeholder-[rgba(247,241,225,0.62)]"
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  style={{ color: MUTED_L, background: 'none', border: 'none', cursor: 'pointer', fontSize: 16 }}
                >
                  ×
                </button>
              )}
            </div>
            {/* District select */}
            <select
              value={activeDistrict}
              onChange={(e) => setDistrict(e.target.value)}
              style={{
                background: INK2, border: `1px solid ${LINE_L}`, color: PAPER,
                padding: '14px 18px', fontSize: 14, fontFamily: "'IBM Plex Mono', monospace",
                borderRadius: 2, cursor: 'pointer', outline: 'none',
              }}
            >
              {DISTRICTS.map((d) => <option key={d} style={{ background: INK2 }}>{d}</option>)}
            </select>
          </div>
        </Reveal>

        {/* ── Category chips ─────────────────────────────────────────────── */}
        <Reveal>
          <div className="flex flex-wrap gap-[10px] mb-[30px]">
            {CATEGORIES.map(({ id, label, color }) => {
              const isActive = activeCategory === id;
              return (
                <button
                  key={id}
                  onClick={() => setCategory(id)}
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: 7,
                    padding: '9px 17px', borderRadius: 100,
                    border: `1px solid ${isActive ? DISC : LINE_L}`,
                    background: isActive ? DISC : 'transparent',
                    color: isActive ? PAPER : color,
                    fontSize: 13.5, fontWeight: 500, cursor: 'pointer',
                    transition: 'all 0.18s ease',
                  }}
                  onMouseEnter={e => { if (!isActive) { e.currentTarget.style.borderColor = PAPER; e.currentTarget.style.color = PAPER; } }}
                  onMouseLeave={e => { if (!isActive) { e.currentTarget.style.borderColor = LINE_L; e.currentTarget.style.color = color; } }}
                >
                  <span
                    style={{
                      width: 7, height: 7, borderRadius: '50%',
                      background: isActive ? PAPER : color,
                      display: 'inline-block', flexShrink: 0,
                    }}
                  />
                  {label}
                </button>
              );
            })}
          </div>
        </Reveal>

        {/* ── Result count ───────────────────────────────────────────────── */}
        <Reveal>
          <p
            className="font-mono-ibm text-[13px] mb-[26px]"
            style={{ color: MUTED_L }}
          >
            Showing <strong style={{ color: PAPER }}>{orgs.length}</strong> of{' '}
            <strong style={{ color: PAPER }}>{totalCount > 0 ? `${totalCount}+` : '2,400+'}</strong> organizations
          </p>
        </Reveal>
      </section>

      <div style={{ maxWidth: 1240, margin: '0 auto', padding: '0 32px' }}>
        {loading && (
          <div className="flex justify-center py-24">
            <Loader2 size={36} style={{ color: SKY, animation: 'spin 1s linear infinite' }} />
          </div>
        )}

        {error && !loading && (
          <div className="flex items-center gap-3 rounded p-4 my-8"
            style={{ background: `${DISC}12`, border: `1px solid ${DISC}44` }}>
            <AlertCircle size={16} style={{ color: DISC, flexShrink: 0 }} />
            <p className="text-sm flex-1" style={{ color: PAPER }}>{error}</p>
            <button onClick={loadOrgs} className="flex items-center gap-1 text-xs px-3 py-1 rounded"
              style={{ border: `1px solid ${LINE_L}`, color: MUTED_L }}>
              <RefreshCw size={11} /> Retry
            </button>
          </div>
        )}
        {/* ════════════════════════════════════════════════════════════════════
            ORG GRID
        ════════════════════════════════════════════════════════════════════ */}
        {!loading && !error && (
          orgs.length === 0 ? (
            <Reveal>
            <div
              className="flex flex-col items-center justify-center py-24 font-fraunces"
              style={{ color: MUTED_L, fontSize: 20 }}
            >
              <span style={{ fontSize: 48, marginBottom: 16, opacity: 0.3 }}>🏛</span>
              <p>No organizations found</p>
              <p style={{ fontSize: 14, marginTop: 8 }}>Try adjusting your search or filters.</p>
            </div>
          </Reveal>
          ) : (
          <Reveal>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: 22,
                marginBottom: 20,
              }}
              className="org-grid-responsive"
            >
              {orgs.map((org) => (
                <OrgCard key={org.id} org={org} />
              ))}
            </div>
          </Reveal>
          )
        )}

        {/* ════════════════════════════════════════════════════════════════
            REGISTER PANEL
        ════════════════════════════════════════════════════════════════ */}
        <Reveal>
          <div
            className="relative text-center overflow-hidden"
            style={{
              margin: '60px 0 100px',
              padding: '64px 32px',
              border: `1px solid ${LINE_L}`,
              borderRadius: 4,
            }}
          >
            {/* Big disc orb */}
            <div
              className="absolute pointer-events-none rounded-full"
              style={{
                width: 520, height: 520,
                right: -200, top: '50%', transform: 'translateY(-50%)',
                background: `radial-gradient(circle at 30% 30%, ${DISC}, ${DISC_DIM} 75%)`,
                opacity: 0.85,
              }}
            />
            {/* Content */}
            <div className="relative" style={{ zIndex: 1 }}>
              <div
                className="flex items-center justify-center rounded-full mx-auto mb-[22px]"
                style={{ width: 56, height: 56, background: PAPER, color: INK, fontSize: 22 }}
              >
                🏛
              </div>
              <h2
                className="font-fraunces mb-3"
                style={{ fontSize: 'clamp(26px,3vw,36px)', fontWeight: 600 }}
              >
                Register your organization
              </h2>
              <p
                className="mx-auto mb-8"
                style={{ color: MUTED_L, maxWidth: 460, fontSize: 15 }}
              >
                List your NGO, charity, or social group to reach thousands of volunteers and donors across Bangladesh.
              </p>
              <Link
                to={ROUTES.ABOUT}
                className="inline-flex items-center gap-2 font-semibold rounded-[2px] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_8px_20px_rgba(214,71,44,0.35)]"
                style={{
                  background: DISC, color: PAPER,
                  padding: '11px 22px', fontSize: 14,
                }}
                onMouseEnter={e => (e.currentTarget.style.background = DISC_DIM)}
                onMouseLeave={e => (e.currentTarget.style.background = DISC)}
              >
                Register Now — It's Free →
              </Link>
            </div>
          </div>
        </Reveal>
      </div>

      {/* Responsive grid style */}
      <style>{`
        @media (max-width: 960px) { .org-grid-responsive { grid-template-columns: 1fr !important; } }
        @media (min-width: 640px) and (max-width: 959px) { .org-grid-responsive { grid-template-columns: repeat(2,1fr) !important; } }
        .placeholder-muted::placeholder { color: rgba(247,241,225,0.62); }
      `}</style>
    </div>
  );
}

// ─── OrgCard ───────────────────────────────────────────────────────────────
function OrgCard({ org }: { org: Organization }) {
  const catLabel = org.category.charAt(0).toUpperCase() + org.category.slice(1).replace('_', ' ');
  const catColor = CATEGORIES.find(c => c.id === org.category)?.color ?? DISC;

  return (
    <div
      style={{
        background: '#F7F1E1',
        color: '#16241D',
        borderRadius: 3,
        padding: '28px 26px',
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
        boxShadow: '0 20px 40px -24px rgba(0,0,0,0.5)',
        borderTop: `3px solid ${catColor}`,
        transition: 'transform 0.22s ease, box-shadow 0.22s ease',
        cursor: 'default',
      }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-5px)';
        (e.currentTarget as HTMLDivElement).style.boxShadow = '0 28px 50px -20px rgba(0,0,0,0.55)';
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)';
        (e.currentTarget as HTMLDivElement).style.boxShadow = '0 20px 40px -24px rgba(0,0,0,0.5)';
      }}
    >
      {/* Top: avatar + name */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
        <div
          style={{
            width: 44, height: 44, borderRadius: '50%', flexShrink: 0,
            background: catColor, color: '#F7F1E1',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: "'IBM Plex Mono', monospace", fontWeight: 600, fontSize: 15,
          }}
        >
          {org.initial}
        </div>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7, flexWrap: 'wrap' }}>
            <h3 className="font-fraunces" style={{ fontSize: 18, fontWeight: 600, color: '#16241D' }}>
              {org.name}
            </h3>
            {org.is_verified && <span style={{ color: '#4C8C6B', fontSize: 13 }}>✓</span>}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4, fontSize: 12.5, color: 'rgba(22,36,29,0.6)' }}>
            <span>📍 {org.district}</span>
            <span className="font-mono-ibm" style={{ fontSize: 11, letterSpacing: '0.03em', color: catColor, textTransform: 'uppercase' }}>
              {catLabel}
            </span>
          </div>
        </div>
      </div>

      <p style={{ fontSize: 14, lineHeight: 1.6, color: 'rgba(22,36,29,0.6)', flexGrow: 1 }}>
        {org.description}
      </p>

      <div style={{ borderTop: '1px solid rgba(22,36,29,0.13)', paddingTop: 14, display: 'flex', justifyContent: 'space-between', fontSize: 13, color: 'rgba(22,36,29,0.6)' }}>
        <span style={{ fontWeight: 600, color: '#16241D' }}>
          <span style={{ color: '#E7A93B', marginRight: 5 }}>★</span>
          {Number(org.rating).toFixed(1)} ({org.review_count.toLocaleString()})
        </span>
        <span>👥 {org.volunteer_count.toLocaleString()} volunteers</span>
      </div>

      <div style={{ display: 'flex', gap: 10 }}>
        {org.phone && (
          <a href={`tel:${org.phone}`}
            style={{ flex: 1, display: 'inline-flex', justifyContent: 'center', alignItems: 'center', padding: '10px 14px', fontSize: 13, fontWeight: 600, borderRadius: 2, border: '1px solid rgba(22,36,29,0.13)', color: '#16241D', textDecoration: 'none', transition: 'all 0.18s ease' }}
            onMouseEnter={e => (e.currentTarget.style.borderColor = '#16241D')}
            onMouseLeave={e => (e.currentTarget.style.borderColor = 'rgba(22,36,29,0.13)')}>
            Call
          </a>
        )}
        {org.website && (
          <a href={`https://${org.website}`} target="_blank" rel="noopener noreferrer"
            style={{ flex: 1, display: 'inline-flex', justifyContent: 'center', alignItems: 'center', padding: '10px 14px', fontSize: 13, fontWeight: 600, borderRadius: 2, border: 'none', background: '#0B2E22', color: '#F7F1E1', textDecoration: 'none', transition: 'background 0.18s ease' }}
            onMouseEnter={e => (e.currentTarget.style.background = '#123F30')}
            onMouseLeave={e => (e.currentTarget.style.background = '#0B2E22')}>
            Website
          </a>
        )}
      </div>
    </div>
  );
}
/* Alif: Organizations page */ 

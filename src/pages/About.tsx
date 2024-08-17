import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Heart,
  Brain,
  Users,
  Building2,
  Target,
  Globe,
  Linkedin,
  Github,
  Mail,
  ArrowRight,
  ShieldCheck,
  Zap,
  TrendingUp,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ROUTES } from '@/constants/routes';

import type { Variants } from 'framer-motion';

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.07, duration: 0.4 },
  }),
};

const TEAM = [
  { name: 'MD. Fahim Muntasir', id: '41230301488', role: 'Full-Stack Developer & Team Lead', initials: 'FM', color: 'bg-ds-primary/10 text-ds-primary' },
  { name: 'MD. Murad Hossain', id: '41230301489', role: 'Frontend Developer & UI/UX Designer', initials: 'MH', color: 'bg-ds-secondary/10 text-ds-secondary' },
  { name: 'MD. Alif', id: '41230301492', role: 'Backend Developer & AI Integration', initials: 'MA', color: 'bg-purple-500/10 text-purple-500' },
];

const VALUES = [
  { icon: ShieldCheck, title: 'Transparency', desc: 'Every organisation is verified. Donation flows are publicly tracked. Trust is built through data.', color: 'bg-ds-primary/10 text-ds-primary' },
  { icon: Zap, title: 'Efficiency', desc: 'AI-powered automation reduces manual workload and connects people to resources in minutes, not days.', color: 'bg-ds-warning/10 text-ds-warning' },
  { icon: Users, title: 'Inclusivity', desc: 'Bilingual support (Bangla & English), mobile-first design, and district-wide coverage ensure no one is left out.', color: 'bg-ds-secondary/10 text-ds-secondary' },
  { icon: TrendingUp, title: 'Impact', desc: 'Every feature is designed with measurable social impact in mind — from volunteer hours to lives saved.', color: 'bg-ds-success/10 text-ds-success' },
];

const TECH_STACK = {
  Frontend: ['React.js', 'Vite', 'TypeScript', 'Tailwind CSS', 'DaisyUI', 'Framer Motion', 'React Router', 'TanStack Query'],
  Backend: ['Node.js', 'Express.js', 'MongoDB Atlas', 'Mongoose', 'JWT', 'Firebase Auth', 'Cloudinary'],
  'AI & Intelligence': ['Claude API', 'Natural Language Processing', 'Recommendation Engine', 'Fraud Detection', 'Smart Analytics'],
  Deployment: ['Vercel', 'Render', 'MongoDB Atlas', 'GitHub'],
};

const MILESTONES = [
  { year: '2025', title: 'Project Inception', desc: 'ShebaBD conceptualised as a final-year capstone project at Northern University Bangladesh.' },
  { year: '2026 Q1', title: 'Design System Built', desc: 'Complete React design system with tokens, components, and accessibility standards.' },
  { year: '2026 Q2', title: 'Core Platform', desc: 'Organization discovery, volunteer management, emergency response, and blood donation modules launched.' },
  { year: '2026 Q3', title: 'AI Integration', desc: 'Claude API integration for smart recommendations, fraud detection, and emergency prioritisation.' },
  { year: '2026 Q4', title: 'National Launch', desc: 'Public beta targeting all 64 districts with 1,000+ NGO onboarding campaign.' },
];

export default function About() {
  return (
    <div className="min-h-screen bg-ds-background">
      {/* ── Hero ───────────────────────────────────────────────────────────── */}
      <section className="bg-gradient-to-br from-ds-primary/5 via-ds-background to-purple-500/5 py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 md:px-8">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 items-center">
            <motion.div variants={fadeUp} initial="hidden" animate="show">
              <span className="mb-4 inline-flex items-center gap-2 rounded-ds-full border border-ds-primary/20 bg-ds-primary/10 px-3 py-1 text-xs font-medium text-ds-primary">
                <Heart size={12} /> About ShebaBD
              </span>
              <h1 className="font-display text-4xl font-bold text-ds-foreground md:text-5xl">
                Technology for <span className="text-ds-primary">Social Good</span>
              </h1>
              <p className="mt-5 text-ds-muted text-lg leading-relaxed">
                ShebaBD is an AI-powered civic technology platform built to solve a critical problem in Bangladesh — the fragmentation of social services, NGOs, volunteers, and emergency responders across thousands of isolated systems.
              </p>
              <p className="mt-3 text-ds-muted leading-relaxed">
                We believe technology should serve humanity. ShebaBD brings together citizens, volunteers, organisations, and emergency responders into one intelligent, transparent, and accessible ecosystem.
              </p>
              <div className="mt-7 flex gap-3">
                <Link to={ROUTES.VOLUNTEERS}>
                  <Button leftIcon={Users}>Join the Platform</Button>
                </Link>
                <Link to={ROUTES.ORGANIZATIONS}>
                  <Button variant="outline" leftIcon={Building2}>For Organisations</Button>
                </Link>
              </div>
            </motion.div>
            <motion.div variants={fadeUp} initial="hidden" animate="show" custom={1} className="grid grid-cols-2 gap-4">
              {[
                { value: '2,400+', label: 'NGOs Listed', icon: Building2, color: 'text-ds-primary' },
                { value: '18,000+', label: 'Volunteers', icon: Users, color: 'text-ds-secondary' },
                { value: '64', label: 'Districts', icon: Globe, color: 'text-ds-accent' },
                { value: '12', label: 'AI Features', icon: Brain, color: 'text-purple-500' },
              ].map(({ value, label, icon: Icon, color }, i) => (
                <div key={label} className={`rounded-ds-xl border border-ds-muted/10 bg-ds-surface p-5 shadow-ds-sm text-center ${i === 3 ? 'col-span-2 sm:col-span-1' : ''}`}>
                  <Icon size={28} className={`mx-auto mb-2 ${color}`} />
                  <p className={`font-display text-2xl font-bold ${color}`}>{value}</p>
                  <p className="text-sm text-ds-muted">{label}</p>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 py-14 md:px-8 space-y-20">
        {/* ── Mission ───────────────────────────────────────────────────────── */}
        <section>
          <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }} className="flex flex-col items-center text-center gap-4 max-w-3xl mx-auto">
            <div className="flex h-12 w-12 items-center justify-center rounded-ds-xl bg-ds-primary/10 text-ds-primary">
              <Target size={24} />
            </div>
            <h2 className="font-display text-3xl font-bold text-ds-foreground">Our Mission</h2>
            <p className="text-ds-muted text-lg leading-relaxed">
              To digitise and intelligentise social service management across Bangladesh — making it easier for every citizen to find help, every volunteer to contribute meaningfully, and every organisation to operate with transparency and efficiency.
            </p>
          </motion.div>
        </section>

        {/* ── Values ────────────────────────────────────────────────────────── */}
        <section>
          <motion.h2 variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }} className="font-display text-2xl font-bold text-ds-foreground mb-8 text-center">
            Core Values
          </motion.h2>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            {VALUES.map(({ icon: Icon, title, desc, color }, i) => (
              <motion.div key={title} variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }} custom={i} className="flex gap-4 rounded-ds-xl border border-ds-muted/10 bg-ds-surface p-5 shadow-ds-sm">
                <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-ds-lg ${color}`}>
                  <Icon size={22} />
                </div>
                <div>
                  <h3 className="font-semibold text-ds-foreground">{title}</h3>
                  <p className="mt-1 text-sm text-ds-muted leading-relaxed">{desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ── Team ──────────────────────────────────────────────────────────── */}
        <section>
          <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }} className="mb-10 text-center">
            <h2 className="font-display text-3xl font-bold text-ds-foreground">The Study Ninjas</h2>
            <p className="mt-2 text-ds-muted">Department of Computer Science & Engineering · Northern University Bangladesh</p>
          </motion.div>
          <div className="flex flex-wrap justify-center gap-6">
            {TEAM.map(({ name, id, role, initials, color }, i) => (
              <motion.div
                key={id}
                variants={fadeUp}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true }}
                custom={i}
                className="flex flex-col items-center gap-4 rounded-ds-2xl border border-ds-muted/10 bg-ds-surface p-6 shadow-ds-sm w-full max-w-xs text-center"
              >
                <div className={`flex h-20 w-20 items-center justify-center rounded-ds-full text-2xl font-bold ${color}`}>
                  {initials}
                </div>
                <div>
                  <h3 className="font-display text-lg font-bold text-ds-foreground">{name}</h3>
                  <p className="text-xs text-ds-muted mt-0.5">ID: {id}</p>
                  <p className="mt-2 text-sm text-ds-muted">{role}</p>
                </div>
                <div className="flex gap-3">
                  <a href="#" aria-label="LinkedIn" className="flex h-8 w-8 items-center justify-center rounded-ds-md border border-ds-muted/20 text-ds-muted hover:text-ds-primary hover:border-ds-primary transition-colors duration-ds-fast">
                    <Linkedin size={15} />
                  </a>
                  <a href="#" aria-label="GitHub" className="flex h-8 w-8 items-center justify-center rounded-ds-md border border-ds-muted/20 text-ds-muted hover:text-ds-foreground hover:border-ds-foreground transition-colors duration-ds-fast">
                    <Github size={15} />
                  </a>
                  <a href="#" aria-label="Email" className="flex h-8 w-8 items-center justify-center rounded-ds-md border border-ds-muted/20 text-ds-muted hover:text-ds-secondary hover:border-ds-secondary transition-colors duration-ds-fast">
                    <Mail size={15} />
                  </a>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ── Roadmap ────────────────────────────────────────────────────────── */}
        <section>
          <motion.h2 variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }} className="font-display text-2xl font-bold text-ds-foreground mb-8">
            Roadmap
          </motion.h2>
          <div className="relative pl-8 border-l-2 border-ds-primary/20 space-y-8">
            {MILESTONES.map(({ year, title, desc }, i) => (
              <motion.div key={year} variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }} custom={i} className="relative">
                <div className="absolute -left-[2.35rem] flex h-6 w-6 items-center justify-center rounded-full border-2 border-ds-primary bg-ds-surface">
                  <div className="h-2 w-2 rounded-full bg-ds-primary" />
                </div>
                <span className="text-xs font-semibold text-ds-primary mb-1 block">{year}</span>
                <h3 className="font-semibold text-ds-foreground">{title}</h3>
                <p className="mt-0.5 text-sm text-ds-muted">{desc}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ── Tech stack ────────────────────────────────────────────────────── */}
        <section>
          <motion.h2 variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }} className="font-display text-2xl font-bold text-ds-foreground mb-8">
            Technology Stack
          </motion.h2>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {Object.entries(TECH_STACK).map(([category, items], i) => (
              <motion.div key={category} variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }} custom={i} className="rounded-ds-xl border border-ds-muted/10 bg-ds-surface p-5 shadow-ds-sm">
                <h3 className="font-semibold text-ds-foreground mb-3 text-sm">{category}</h3>
                <div className="flex flex-wrap gap-1.5">
                  {items.map((item) => (
                    <span key={item} className="rounded-ds-full bg-ds-background border border-ds-muted/20 px-2 py-0.5 text-xs text-ds-muted">
                      {item}
                    </span>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ── CTA ───────────────────────────────────────────────────────────── */}
        <section className="rounded-ds-2xl bg-ds-primary p-8 text-center md:p-12">
          <h2 className="font-display text-2xl font-bold text-white md:text-3xl">
            Ready to Make Bangladesh Better?
          </h2>
          <p className="mt-3 text-white/80 max-w-xl mx-auto">
            Whether you're a citizen looking for help, a volunteer wanting to contribute, or an NGO seeking visibility — ShebaBD is your platform.
          </p>
          <div className="mt-7 flex flex-wrap justify-center gap-4">
            <Link to={ROUTES.VOLUNTEERS}>
              <Button className="bg-white text-ds-primary hover:bg-white/90 border-0" leftIcon={Users}>
                Join as Volunteer
              </Button>
            </Link>
            <Link to={ROUTES.ORGANIZATIONS}>
              <Button variant="outline" className="border-white text-white hover:bg-white/10" rightIcon={ArrowRight}>
                Register Your NGO
              </Button>
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
/* Fahim: Enhanced about page */ 
 
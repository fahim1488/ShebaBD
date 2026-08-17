// ─── English translations ─────────────────────────────────────────────────────
export const en = {
  lang: 'en' as const,

  // ── Navbar ──────────────────────────────────────────────────────────────────
  nav: {
    home:         'Home',
    organizations:'Organizations',
    volunteers:   'Volunteers',
    emergency:    'Emergency',
    bloodDonation:'Blood Donation',
    events:       'Events',
    community:    'Community',
    about:        'About',
    aiTools:      'AI Tools',
    donate:       'Donate',
    donateNow:    'Donate Now',
    langToggle:   'বাংলা',
  },

  // ── AI Tools dropdown ────────────────────────────────────────────────────────
  ai: {
    header:         'AI-Powered Features',
    ngoDetection:   { label: 'NGO Detection',        sub: 'Detect suspicious organisations' },
    reviewShield:   { label: 'Review Shield',         sub: 'Identify fake & AI-generated reviews' },
    aiWriter:       { label: 'AI Writer',             sub: 'Generate awareness & campaign content' },
    smartSearch:    { label: 'Smart Search',          sub: 'Natural language search across ShebaBD' },
    donationAdvisor:{ label: 'Donation Advisor',      sub: 'See the real impact of your donation' },
    analytics:      { label: 'Analytics',             sub: 'Platform reports & impact insights' },
    disaster:       { label: 'Disaster Intelligence', sub: 'Live disaster monitoring & response map' },
    volunteerMatch: { label: 'Volunteer Match',       sub: 'AI-matched volunteer opportunities' },
    orgRec:         { label: 'Org Recommendation',   sub: 'Find NGOs that match your values' },
    trustScore:     { label: 'Trust Score',           sub: 'Organisation credibility ratings' },
  },

  // ── Hero ─────────────────────────────────────────────────────────────────────
  hero: {
    badge:       'AI-powered civic platform',
    headline1:   'Every helper, every',
    headline2:   'organisation, every',
    headline3:   'emergency',
    headlineEnd: '— in one place.',
    sub:         'ShebaBD connects citizens, volunteers, NGOs and emergency responders across Bangladesh, with artificial intelligence doing the matching, prioritising and reporting.',
    ctaEmergency:'Request emergency help',
    ctaBrowse:   'Browse organizations',
    searchPlaceholder: 'Describe what you need — in Bangla or English',
    askAI:       'Ask AI',
    quickLinks:  [
      'O+ blood needed in Dhaka today',
      'Flood relief organisations in Sylhet',
      'Weekend teaching volunteer opportunities',
    ],
  },

  // ── Stats ────────────────────────────────────────────────────────────────────
  stats: [
    { num: '2,400+',  label: 'Registered NGOs' },
    { num: '18,000+', label: 'Active Volunteers' },
    { num: '64',      label: 'Districts Covered' },
    { num: '৳4.2Cr',  label: 'Donations Tracked' },
  ],

  // ── Features ─────────────────────────────────────────────────────────────────
  features: {
    eyebrow: "What's Inside",
    heading: 'Everything you need,\nin one place',
    sub:     'A unified platform that digitises social service management across Bangladesh.',
    items: [
      { title: 'Organization Discovery', desc: 'Find verified NGOs, charities, and social groups by district, category, or GPS location on an interactive map.' },
      { title: 'Volunteer Management',   desc: 'Register skills, join campaigns, track hours, earn achievement badges, and build a digital volunteer portfolio.' },
      { title: 'Emergency Response',     desc: 'Submit emergency requests with AI priority analysis. Get connected to nearby organisations instantly.' },
      { title: 'Blood Donation',         desc: 'AI-powered donor matching by blood group, location, and availability. Save lives in minutes.' },
      { title: 'Event Management',       desc: 'Discover, register for, and attend social campaigns, awareness drives, and volunteer events near you.' },
      { title: 'AI Assistant',           desc: 'Bilingual (Bangla & English) AI assistant guiding users through organisations, donations, and emergency services.' },
    ],
  },

  // ── AI Section ───────────────────────────────────────────────────────────────
  aiSection: {
    eyebrow: 'Artificial Intelligence',
    heading: 'AI at the core',
    sub:     'ShebaBD integrates AI as its core innovation — from volunteer matching to fraud detection.',
    items: [
      { num: '01', title: 'Smart Volunteer Matching', desc: 'Matches skills, location & availability to the right opportunity.' },
      { num: '02', title: 'Fake NGO Detection',       desc: 'Behavioural AI flags suspicious organisations before they reach users.' },
      { num: '03', title: 'Impact Analytics',         desc: 'Live dashboards showing donations, volunteer hours, and district coverage.' },
      { num: '04', title: 'Disaster Intelligence',    desc: 'Real-time affected-area visualisation and emergency org recommendations.' },
      { num: '05', title: 'Donation Advisor',         desc: 'Estimates how your donation translates to meals, healthcare, or education.' },
      { num: '06', title: 'Trust Score',              desc: 'Composite score built from verification status, reviews, and transparency.' },
    ],
  },

  // ── Map ──────────────────────────────────────────────────────────────────────
  map: {
    eyebrow: 'Global Network',
    heading: 'Bangladesh connects\nto the world',
    sub:     'ShebaBD links Dhaka, Chittagong, and Sylhet to international humanitarian partners — enabling cross-border collaboration, aid, and disaster response.',
  },

  // ── Testimonials ─────────────────────────────────────────────────────────────
  testimonials: {
    eyebrow: 'Real Stories',
    heading: 'Real stories. Real impact.',
    items: [
      { avatar: 'FA', name: 'Fatema Akter',  role: 'Volunteer, Dhaka',         quote: 'ShebaBD helped me find the perfect volunteer opportunity matching my skills in just minutes. The platform is incredibly easy to use.' },
      { avatar: 'RU', name: 'Rahim Uddin',   role: 'NGO Director, Chittagong', quote: 'We increased our volunteer recruitment by 300% after listing on ShebaBD. The AI-powered matching is a game changer.' },
      { avatar: 'NB', name: 'Nasrin Begum',  role: 'Blood Donor, Sylhet',      quote: 'Within 20 minutes of the request, ShebaBD found me a matching donor for my mother. This platform saves lives.' },
    ],
  },

  // ── CTA Band ─────────────────────────────────────────────────────────────────
  cta: {
    heading: 'Ready to make\na difference?',
    sub:     'Join thousands of volunteers and organisations already transforming lives across Bangladesh.',
    getStarted: 'Get Started Free',
    donate:     'Donate Now',
  },

  // ── Trust bar ────────────────────────────────────────────────────────────────
  trustBar: ['Verified NGO Directory', 'AI-Powered Matching', 'Real-time Emergency Response', '64 Districts'],

  // ── Auth ─────────────────────────────────────────────────────────────────────
  auth: {
    signIn: {
      title:           'Welcome back',
      subtitle:        'Sign in to your ShebaBD account',
      emailLabel:      'Email address',
      emailPlaceholder:'you@example.com',
      passwordLabel:   'Password',
      passwordPlaceholder: 'Enter your password',
      rememberMe:      'Remember me',
      forgotPassword:  'Forgot password?',
      submitBtn:       'Sign In',
      noAccount:       "Don't have an account?",
      signUpLink:      'Sign up',
      orContinueWith:  'or continue with',
      errorInvalid:    'Invalid email or password. Please try again.',
      errorGeneric:    'Something went wrong. Please try again.',
    },
    signUp: {
      title:            'Create your account',
      subtitle:         'Join thousands helping Bangladesh',
      nameLabel:        'Full name',
      namePlaceholder:  'Your full name',
      emailLabel:       'Email address',
      emailPlaceholder: 'you@example.com',
      passwordLabel:    'Password',
      passwordPlaceholder: 'At least 8 characters',
      confirmPasswordLabel: 'Confirm password',
      confirmPasswordPlaceholder: 'Repeat your password',
      roleLabel:        'I want to join as',
      roleUser:         'General User',
      roleVolunteer:    'Volunteer',
      roleNgo:          'NGO / Organisation',
      termsText:        'I agree to the',
      termsLink:        'Terms of Service',
      andText:          'and',
      privacyLink:      'Privacy Policy',
      submitBtn:        'Create Account',
      hasAccount:       'Already have an account?',
      signInLink:       'Sign in',
      errorEmailTaken:  'This email is already registered.',
      errorPassMismatch:'Passwords do not match.',
      errorGeneric:     'Something went wrong. Please try again.',
    },
  },

  // ── Footer ───────────────────────────────────────────────────────────────────
  footer: {
    tagline: 'An AI-powered civic technology platform connecting citizens, volunteers, NGOs, and emergency services across Bangladesh.',
    platform:  'Platform',
    emergency: 'Emergency',
    company:   'Company',
    links: {
      organizations:  'Organizations',
      volunteers:     'Volunteers',
      events:         'Events',
      bloodDonation:  'Blood Donation',
      emergencyHelp:  'Emergency Help',
      bloodRequest:   'Blood Request',
      disasterResponse: 'Disaster Response',
      shelterFinder:  'Shelter Finder',
      aboutUs:        'About Us',
      donate:         'Donate',
      joinVolunteer:  'Join as Volunteer',
      registerNgo:    'Register NGO',
    },
    copyright:  'All rights reserved. Built with',
    builtBy:    'The Study Ninjas',
    university: 'Department of CSE · Northern University Bangladesh',
  },
} as const;

/** Recursively widen literal string types to `string` so bn can use different text. */
type DeepStringify<T> =
  T extends readonly (infer U)[]
    ? readonly DeepStringify<U>[]
    : T extends object
      ? { [K in keyof T]: DeepStringify<T[K]> }
      : string;

export type TranslationSchema = typeof en;
export type Translations = DeepStringify<TranslationSchema>;

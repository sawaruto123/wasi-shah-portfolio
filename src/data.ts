import { Room, Project, CommercialEngagement, FilmRecord, StillCapture, SiteSettings } from './types';

export const ROOMS: Room[] = [
  { id: 'room-nexus', number: '01', name: '01 · WORLD', zCoord: '+8.00m', label: 'World' },
  { id: 'room-studio', number: '02', name: '02 · LAB', zCoord: '-14.00m', label: 'Lab' },
  { id: 'room-gallery', number: '03', name: '03 · ARCHIVE', zCoord: '-28.00m', label: 'Archive' },
  { id: 'room-cinema', number: '04', name: '04 · FILMS', zCoord: '-42.00m', label: 'Films' },
  { id: 'room-dispatch', number: '05', name: '05 · CONNECT', zCoord: '-56.00m', label: 'Connect' },
];

export const PROJECTS: Project[] = [
  {
    id: 'face-overlay-tool',
    expNumber: '01',
    title: 'Face Overlay Tool',
    category: 'ai',
    categoryBadge: 'AI / Computer Vision',
    tag: 'AI · COMPUTER VISION',
    extraBadge: 'Live Pipeline',
    image: '/images/work-01.jpg',
    colSpan: '8',
    description: 'Real-time biometric alignment and generative facial synthesis tool. Employs lightweight Python OpenCV routines and neural landmark meshes to composite dynamic identity disguises.',
    detailedDescription: 'Engineered for sub-15ms inference latencies on consumer-grade hardware. Utilizes 468-point 3D face mesh tracking, optical flow stabilization, and custom latent texture warping shaders for live theatrical video performances.',
    tech: ['Python', 'OpenCV', 'MediaPipe', 'PyTorch']
  },
  {
    id: 'ai-financial-advisor',
    expNumber: '02',
    title: 'AI Financial Advisor',
    category: 'ai',
    categoryBadge: 'Agentic FinTech',
    tag: 'AI · AGENTIC',
    image: '/images/work-02.jpg',
    colSpan: '4',
    description: 'Multi-agent autonomous wealth planning framework built on CrewAI. Orchestrates macroeconomic sentiment crawlers with personal portfolio stress tests.',
    detailedDescription: 'Decoupled into autonomous analyst, auditor, and portfolio rebalancing roles. Employs tool-augmented LLMs with vector memory backends to simulate macroeconomic downturns and optimize capital allocation.',
    tech: ['CrewAI', 'LLM Tooling', 'FastAPI']
  },
  {
    id: '3d-business-card',
    expNumber: '03',
    title: '3D Business Card',
    category: 'code',
    categoryBadge: 'WebGL / Three.js',
    tag: 'WEBGL · 3D',
    image: '/images/work-03.jpg',
    colSpan: '4',
    description: 'Interactive kinetic digital identity card with realistic accelerometer tilt physics, dynamic roughness map shaders, and bilingual typography.',
    detailedDescription: 'Rendered with custom PBR surface shaders, dynamic iridescence calculations, and real-time device orientation handling to create a tactile holographic calling card.',
    tech: ['Three.js', 'GLSL', 'Kinetic Type']
  },
  {
    id: 'gold-finder',
    expNumber: '04',
    title: 'Gold Finder',
    category: 'fintech',
    categoryBadge: 'Trading Analytics',
    tag: 'FINANCE · DATA',
    image: '/images/work-04.jpg',
    colSpan: '4',
    description: 'Algorithmic precious metals tracker scanning market spreads, spot rates, and momentum deviations with automated trade trigger notifications.',
    detailedDescription: 'Aggregates multi-exchange WebSocket feeds, calculating Bollinger band squeezes and liquidity depth differentials with zero downtime failover routing.',
    tech: ['Python', 'Pandas', 'WebSockets']
  },
  {
    id: 'debit-note-log',
    expNumber: '05',
    title: 'Debit Note & Log',
    category: 'fintech',
    categoryBadge: 'FinTech Engine',
    tag: 'FINANCE · TOOL',
    image: '/images/work-05.jpg',
    colSpan: '4',
    description: 'Automated PDF ledger generator and transaction tracker designed for precise corporate transaction audits and invoice dispersal.',
    detailedDescription: 'Generates pixel-perfect vectorized debit memos and tax compliance receipts with digital signatures, cryptographic hashes, and automatic ERP integration.',
    tech: ['FastAPI', 'PostgreSQL', 'ReportLab']
  },
  {
    id: 'vibe-code',
    expNumber: '06',
    title: 'Vibe Code',
    category: 'code',
    categoryBadge: 'Audio Visualizer',
    tag: 'AUDIO · WEBGL',
    image: '/images/work-06.jpg',
    colSpan: '4',
    description: 'Real-time WebGL shader tool synthesizing FFT audio frequencies into fluid geometry and particle turbulence synchronized to sound waves.',
    detailedDescription: 'Direct Web Audio frequency analysis mapped to simplex noise deformation, generating synchronized fluid particle fields and reactive audio bloom.',
    tech: ['Web Audio API', 'Canvas', 'GLSL']
  },
  {
    id: 'cash-app',
    expNumber: '07',
    title: 'Cash',
    category: 'fintech',
    categoryBadge: 'Personal Finance',
    tag: 'FINANCE · APP',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDbEZ1ccKVNIbJ6ke2hHTyoV9bridXZDcVkJcP8m4Otubt6OFutXSZuiiztskuW7zmXUw3Hl3mrKvaS_2BwWb4Rr2-Cp_Dn4MVjCZFRfrva9b6QBJbWvgkPd-kLUTkUnG90vQOO6JawFEWaW0yLI5NaDzbNZoe36ip-sltjOTFsRioUUaKz3jIDiIP21icidyW-wXFozh3gklam0eCAW1N4CdVOxPrY2ceBILUKXjVTt4nfq2rGXIT-',
    colSpan: '4',
    description: 'A full-stack personal finance tracker with a daily auto-spend model, exception logging, recurring bills, debt tracking, and usage analytics.',
    detailedDescription: 'Built with React, TypeScript and a Supabase backend (Postgres + Auth + Row-Level Security), with a bilingual UI, onboarding wizard, and an admin console.',
    tech: ['React', 'TypeScript', 'Supabase', 'Tailwind']
  },
  {
    id: 'obsidian-tasks',
    expNumber: '08',
    title: 'Obsidian Tasks',
    category: 'code',
    categoryBadge: 'Productivity',
    tag: 'TOOL · PRODUCTIVITY',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDVY23BAzs5U_yGQywZBBnzWUUMNv4K___c3tsnYASeh8xVhBVpUyfuSvDEUuyjUAsGlshQUflxnQKz9C-mN8JsD6KwD9aGf-6d9BBstIhcYPZJqt3qIaxCj370fBBKdZtN3B5EssjrdxTVlYfXA_XaHr-qzMVdbEIQ4vpdCju3Zo9ebhQMnRKLllKmIx7f7mptnSA5kNmJ213grafphNQVe5hUM1IPEsVSV8rk_wj1bUB5OmzZ1qip',
    colSpan: '4',
    description: 'An always-on-top task widget for Obsidian that surfaces task notes and open checkboxes, grouped by area and company.',
    detailedDescription: 'Built with Windows PowerShell and WPF, featuring a single-instance mutex, live polling, and settings-driven filter and sort controls.',
    tech: ['PowerShell', 'WPF', 'Obsidian']
  }
];

export const COMMERCIAL_ENGAGEMENTS: CommercialEngagement[] = [
  {
    id: 'tribeonone',
    category: 'Decentralized Web3',
    client: 'TribeOnOne',
    description: 'Brand system re-architecture and motion launch collateral for crypto protocols.'
  },
  {
    id: 'pixelcap',
    category: 'Venture Capital',
    client: 'PixelCap',
    description: 'Complete corporate identity, keynote pitch design, and media portal.'
  },
  {
    id: 'viral-reels',
    category: 'High-Velocity Motion',
    client: 'Viral Reels (40M+ Imp)',
    description: 'Kinetic video reels and retention editing frameworks across YouTube and TikTok.'
  }
];

export const FILM_RECORDS: FilmRecord[] = [
  {
    id: 'after-work',
    title: 'After Work',
    releaseYear: '2024 RELEASE',
    duration: 'Short Film · 8m 42s',
    badge: 'Official Selection',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDkPnpq73OJLtIHzD29OYi1i8vdR28vA8roPIaQTs23nRrgbPyXqf8XuHd4_eMP3Vc6WLhORG26jQawhKNwpIYhJbcVfeMNKKYrDuBFEv7e7lptL1GzM97Ju-n5EKwWDnx-GEI2_FsPt68Kw9xK44t-EDGMD764ygpEla0yK8o4KNfvoZA807H3oFHb42kJOxKPcBTcfrqLxSI7nRAwC4vpRbkHz5XK0tn12X0zRifOJ7LsSUgUaS_g',
    description: 'A neon-drenched Hong Kong night thriller exploring corporate exhaustion and nocturnal rebirth beneath the overpasses of Kowloon.',
    creditsRole: 'Directed & Graded by Wasi Shah',
    format: 'Blackmagic RAW'
  },
  {
    id: 'locked-in',
    title: 'Locked In',
    releaseYear: '2023 RELEASE',
    duration: 'Short Film · 12m 15s',
    badge: 'Festival Premiere',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCnAfVFmNLZl4aAtvMgM6qaELSL3prBpCpqenCafeM_uQ_XksqfXutHlyKdhmh_I3f2UPrErZhTVkRpI8_idPyIl9Moo8Nyl1Z1nj4SuUh-BiT2kL9SIZ0TvUj4nw4hjUQvB7M4JFFZrt3pdvdDSimLedI1Egzqj8QBazC3_ors5NAG6stWDX_Cxa7-WxmacRQnNsxhn0lHoKb0o054WuPlUT4Tj3uKXndu7hC_Zl7LPKQ__81gDK-8',
    description: 'High-tension psychological narrative on creative isolation, obsessive flow state, and the breakdown between sensory reality and synthetic memory.',
    creditsRole: 'Cinematography & VFX by Wasi Shah',
    format: 'Spatial Audio'
  }
];

export const STILL_CAPTURES: StillCapture[] = [
  { id: 'merc-studio', title: 'Mercedes-Benz Studio', focalLength: '16mm', image: '/images/photo-01.jpg', accentColor: '#0047ff' },
  { id: 'city-plaza', title: 'City Plaza — Woman in Grid', focalLength: '35mm', image: '/images/photo-02.jpg' },
  { id: 'macao-granny', title: 'Macao Granny', focalLength: '50mm', image: '/images/photo-03.jpg', accentColor: '#ff6b35' },
  { id: 'ocean-park', title: 'Ocean Park Streetsnap', focalLength: '35mm', image: '/images/photo-04.jpg' },
  { id: 'central-granny', title: 'Central Granny', focalLength: '50mm', image: '/images/photo-05.jpg', accentColor: '#ff6b35' },
  { id: 'dingding', title: 'DingDing Handle', focalLength: '24mm', image: '/images/photo-06.jpg' },
  { id: 'classroom', title: 'Classroom', focalLength: '35mm', image: '/images/photo-07.jpg' },
  { id: 'building-hole', title: 'Building with a Hole', focalLength: '24mm', image: '/images/photo-08.jpg', accentColor: '#ffb800' },
  { id: 'worker', title: 'Worker', focalLength: '85mm', image: '/images/photo-09.jpg', accentColor: '#ffb800' },
  { id: 'dancing-light', title: 'Dancing with Light', focalLength: '35mm', image: '/images/photo-10.jpg' },
  { id: 'vibe-bw', title: 'Vibe', focalLength: '50mm', image: '/images/photo-11.jpg' },
  { id: 'composition-bw', title: 'Composition', focalLength: '35mm', image: '/images/photo-12.jpg', accentColor: '#0047ff' },
];

// 預設網站內容（Supabase 未連線或無資料時的 fallback）
export const DEFAULT_SETTINGS: SiteSettings = {
  profile: {
    name: 'Syed Wasi Shah',
    name_cn: '峻山',
    tagline: 'Creating stories for the digital world.',
    location: 'Hong Kong SAR',
    portrait:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuAU6O-XRWGTRWSCSR30EeBHCrgFk7TCES4izCwW6dMZcopNnylUJjPV1fAYX1-ZyTiqku_Q_pNMXFDnxspeBzBRQ_BGDm4LH4JtVT-GOtJUFvhnLh--MhZPxhCSfdx0iZ10Q_XmPEfXj2FnuuXAdsB8reWU0hV0xuPq2Lrsu01Zx-lKF3yhh08aYtNJRlxCNJmJQC3sYamlo0nvsXoGCHT85yc5a_ms-hmVxW9sktJp-fw3MlUyADhw',
    role_line: 'HKMU BSc CS · ADOBE AMBASSADOR · CREATIVE DEVELOPER',
    logo_text: 'WS',
  },
  contact: {
    headline: "Let's build something unforgettable.",
    subtext: 'Accepting select commissions in Hong Kong and worldwide.',
    email: 'syedwasi983@gmail.com',
    phone: '+852 9899 2944',
    whatsapp: '85298992944',
    location: 'Hong Kong SAR · HKT (UTC+8)',
    socials: [
      { name: 'GitHub', url: 'https://github.com' },
      { name: 'LinkedIn', url: 'https://linkedin.com' },
      { name: 'Vimeo', url: 'https://vimeo.com' },
      { name: 'Instagram', url: 'https://instagram.com' },
    ],
  },
  hero: {
    title: 'WASI SHAH',
    chinese: '峻山',
    subtitle: 'Creating stories for the digital world.',
  },
  about: {
    headline: 'Motion, design & code.',
    bio_1: "I'm a video editor, motion designer and graphic designer based in Hong Kong — also studying Computer Science at Hong Kong Metropolitan University (HKMU). I cut films, design brand systems, and build interactive tools.",
    bio_2: 'Daily tools: Premiere Pro, After Effects, Photoshop and Illustrator for film & brand work — plus Python, Blender and AI workflows (ComfyUI, CrewAI) for interactive projects.',
    tools: 'Premiere Pro · After Effects · Photoshop · Illustrator · Python · Blender · ComfyUI · CrewAI',
  },
  stats: { projects: '50+', films: '20+', tools: '30+', location: 'HK' },
  experience: [
    { role: 'Adobe Ambassador', company: 'Behance Co', date: '2025 – Now', desc: 'Representation, workshops, events & content creation.' },
    { role: 'Marketing & Teacher', company: 'Virtual Academy International', date: '2024 – Now', desc: 'Campaigns, social media & online lessons.' },
    { role: 'Creative Intern (APAC)', company: 'moji Corporation', date: '2024 – 2025', desc: 'Design concepts, video & photo editing for campaigns.' },
    { role: 'Graphic Trainee', company: 'Seaman Paper Asia', date: '2024', desc: 'Day-to-day graphic design & marketing support.' },
  ],
  skills: ['Premiere', 'After Effects', 'Photoshop', 'Illustrator', 'Python', 'Blender', 'ComfyUI', 'CrewAI'],
  languages: [
    { name: 'Cantonese (粵語)', level: 'Native', pct: 100 },
    { name: 'English', level: 'Native / Fluent', pct: 96 },
    { name: 'Mandarin (普通話)', level: 'Fluent', pct: 85 },
  ],
};

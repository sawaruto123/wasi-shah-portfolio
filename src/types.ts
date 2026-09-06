export interface Room {
  id: string;
  number: string;
  name: string;
  zCoord: string;
  label: string;
}

export interface Project {
  id: string;
  expNumber: string;
  title: string;
  category: 'ai' | 'code' | 'fintech';
  categoryBadge: string;
  tag: string;
  extraBadge?: string;
  image: string;
  colSpan: '8' | '4';
  description: string;
  detailedDescription?: string;
  tech: string[];
}

export interface CommercialEngagement {
  id: string;
  category: string;
  client: string;
  description: string;
}

export interface FilmRecord {
  id: string;
  title: string;
  releaseYear: string;
  duration: string;
  badge: string;
  image: string;
  description: string;
  creditsRole: string;
  format: string;
}

export interface StillCapture {
  id: string;
  title: string;
  focalLength: string;
  image: string;
  accentColor?: string;
}

export interface SocialLink {
  name: string;
  url: string;
}

export interface ExperienceItem {
  role: string;
  company: string;
  date: string;
  desc: string;
}

export interface LanguageItem {
  name: string;
  level: string;
  pct: number;
}

export interface ProfileInfo {
  name: string;
  name_cn: string;
  tagline: string;
  location: string;
  portrait: string;
  role_line: string;
  logo_text: string;
}

export interface ContactInfo {
  headline: string;
  subtext: string;
  email: string;
  phone: string;
  whatsapp: string;
  location: string;
  socials: SocialLink[];
}

export interface HeroInfo {
  title: string;
  chinese: string;
  subtitle: string;
}

export interface AboutInfo {
  headline: string;
  bio_1: string;
  bio_2: string;
  tools: string;
}

export interface StatsInfo {
  projects: string;
  films: string;
  tools: string;
  location: string;
}

export interface SiteSettings {
  profile: ProfileInfo;
  contact: ContactInfo;
  hero: HeroInfo;
  about: AboutInfo;
  stats: StatsInfo;
  experience: ExperienceItem[];
  skills: string[];
  languages: LanguageItem[];
}

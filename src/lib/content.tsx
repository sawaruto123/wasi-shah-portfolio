import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { supabase, isSupabaseConfigured } from './supabase';
import {
  PROJECTS,
  FILM_RECORDS,
  STILL_CAPTURES,
  COMMERCIAL_ENGAGEMENTS,
  DEFAULT_SETTINGS,
} from '../data';
import type {
  Project,
  FilmRecord,
  StillCapture,
  CommercialEngagement,
  SiteSettings,
  PhotoEvent,
} from '../types';

export interface ContentValue {
  projects: Project[];
  films: FilmRecord[];
  stills: StillCapture[];
  engagements: CommercialEngagement[];
  photoEvents: PhotoEvent[];
  settings: SiteSettings;
  loading: boolean;
  source: 'supabase' | 'fallback';
  refresh: () => Promise<void>;
}

const ContentContext = createContext<ContentValue>({
  projects: PROJECTS,
  films: FILM_RECORDS,
  stills: STILL_CAPTURES,
  engagements: COMMERCIAL_ENGAGEMENTS,
  photoEvents: [],
  settings: DEFAULT_SETTINGS,
  loading: false,
  source: 'fallback',
  refresh: async () => {},
});

// --- Row mappers (snake_case DB → camelCase types) -------------------------
const mapProject = (r: any): Project => ({
  id: r.id,
  expNumber: r.exp_number,
  title: r.title,
  category: r.category,
  categoryBadge: r.category_badge,
  tag: r.tag,
  extraBadge: r.extra_badge ?? undefined,
  image: r.image,
  images: Array.isArray(r.images) && r.images.length ? r.images : (r.image ? [r.image] : []),
  imageRatios: Array.isArray(r.image_ratios) ? r.image_ratios : [],
  githubUrl: r.github_url ?? undefined,
  websiteUrl: r.website_url ?? undefined,
  colSpan: r.col_span,
  description: r.description,
  detailedDescription: r.detailed_description ?? undefined,
  tech: Array.isArray(r.tech) ? r.tech : [],
});

const mapFilm = (r: any): FilmRecord => ({
  id: r.id,
  title: r.title,
  releaseYear: r.release_year,
  duration: r.duration,
  badge: r.badge,
  image: r.image,
  description: r.description,
  creditsRole: r.credits_role,
  format: r.format,
});

const mapStill = (r: any): StillCapture => ({
  id: r.id,
  title: r.title,
  focalLength: r.focal_length,
  image: r.image,
  beforeImage: r.before_image ?? undefined,
  category: r.category === 'event' ? 'event' : 'daily',
  eventId: r.event_id ?? undefined,
  accentColor: r.accent_color ?? undefined,
});

const mapEvent = (r: any): PhotoEvent => ({
  id: r.id,
  title: r.title,
  description: r.description,
  sortOrder: r.sort_order,
});

const mapEngagement = (r: any): CommercialEngagement => ({
  id: r.id,
  category: r.category,
  client: r.client,
  description: r.description,
});

export function buildSettings(rows: Array<{ key: string; value: any }>): SiteSettings {
  const get = (key: string) => rows.find((r) => r.key === key)?.value;
  return {
    profile: { ...DEFAULT_SETTINGS.profile, ...(get('profile') ?? {}) },
    contact: { ...DEFAULT_SETTINGS.contact, ...(get('contact') ?? {}) },
    hero: { ...DEFAULT_SETTINGS.hero, ...(get('hero') ?? {}) },
    about: { ...DEFAULT_SETTINGS.about, ...(get('about') ?? {}) },
    stats: { ...DEFAULT_SETTINGS.stats, ...(get('stats') ?? {}) },
    experience: get('experience') ?? DEFAULT_SETTINGS.experience,
    skills: get('skills') ?? DEFAULT_SETTINGS.skills,
    languages: get('languages') ?? DEFAULT_SETTINGS.languages,
  };
}

export const ContentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [projects, setProjects] = useState<Project[]>(PROJECTS);
  const [films, setFilms] = useState<FilmRecord[]>(FILM_RECORDS);
  const [stills, setStills] = useState<StillCapture[]>(STILL_CAPTURES);
  const [engagements, setEngagements] = useState<CommercialEngagement[]>(COMMERCIAL_ENGAGEMENTS);
  const [photoEvents, setPhotoEvents] = useState<PhotoEvent[]>([]);
  const [settings, setSettings] = useState<SiteSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState<boolean>(isSupabaseConfigured);
  const [source, setSource] = useState<'supabase' | 'fallback'>(isSupabaseConfigured ? 'supabase' : 'fallback');

  const refresh = useCallback(async () => {
    if (!supabase) {
      setSource('fallback');
      setLoading(false);
      return;
    }
    try {
      const [p, f, s, e, st, pe] = await Promise.all([
        supabase.from('projects').select('*').eq('published', true).order('sort_order'),
        supabase.from('films').select('*').eq('published', true).order('sort_order'),
        supabase.from('stills').select('*').eq('published', true).order('sort_order'),
        supabase.from('engagements').select('*').order('sort_order'),
        supabase.from('site_settings').select('*'),
        supabase.from('photo_events').select('*').order('sort_order'),
      ]);

      let anyLive = false;

      if (!p.error && p.data && p.data.length > 0) {
        setProjects(p.data.map(mapProject));
        anyLive = true;
      }
      if (!f.error && f.data && f.data.length > 0) {
        setFilms(f.data.map(mapFilm));
        anyLive = true;
      }
      if (!s.error && s.data && s.data.length > 0) {
        setStills(s.data.map(mapStill));
        anyLive = true;
      }
      if (!e.error && e.data && e.data.length > 0) {
        setEngagements(e.data.map(mapEngagement));
        anyLive = true;
      }
      if (!st.error && st.data && st.data.length > 0) {
        setSettings(buildSettings(st.data));
        anyLive = true;
      }
      if (!pe.error && pe.data) {
        setPhotoEvents(pe.data.map(mapEvent));
      }

      setSource(anyLive ? 'supabase' : 'fallback');
    } catch {
      setSource('fallback');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  // 回到此分頁時自動重新拉取（例如在 CMS 更新後切回來）
  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState === 'visible') refresh();
    };
    document.addEventListener('visibilitychange', onVisible);
    return () => document.removeEventListener('visibilitychange', onVisible);
  }, [refresh]);

  // 動態更新瀏覽器分頁 favicon（由 CMS 設定）
  useEffect(() => {
    const favicon = settings.profile.favicon;
    if (!favicon) return;
    let link = document.querySelector<HTMLLinkElement>('link[rel="icon"]');
    if (!link) {
      link = document.createElement('link');
      link.rel = 'icon';
      document.head.appendChild(link);
    }
    link.href = favicon;
  }, [settings.profile.favicon]);

  const value = useMemo<ContentValue>(
    () => ({ projects, films, stills, engagements, photoEvents, settings, loading, source, refresh }),
    [projects, films, stills, engagements, photoEvents, settings, loading, source, refresh]
  );

  return <ContentContext.Provider value={value}>{children}</ContentContext.Provider>;
};

export function useContent(): ContentValue {
  return useContext(ContentContext);
}

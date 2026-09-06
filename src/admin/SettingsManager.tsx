import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { DEFAULT_SETTINGS } from '../data';
import { buildSettings } from '../lib/content';
import type { SiteSettings, SocialLink, ExperienceItem, LanguageItem } from '../types';
import { Field, TextInput, TextArea, Button } from './fields';

export const SettingsManager: React.FC = () => {
  const [settings, setSettings] = useState<SiteSettings>(DEFAULT_SETTINGS);
  const [skillsText, setSkillsText] = useState(DEFAULT_SETTINGS.skills.join(', '));
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }
    supabase
      .from('site_settings')
      .select('*')
      .then(({ data }) => {
        if (data && data.length) {
          const built = buildSettings(data);
          setSettings(built);
          setSkillsText(built.skills.join(', '));
        }
        setLoading(false);
      });
  }, []);

  const setField = <K extends keyof SiteSettings>(key: K, value: SiteSettings[K]) =>
    setSettings((s) => ({ ...s, [key]: value }));

  const patchNested = <K extends keyof SiteSettings>(key: K, nested: Partial<SiteSettings[K]>) => {
    setSettings((s) => {
      const current = s[key] as Record<string, unknown>;
      return { ...s, [key]: { ...current, ...nested } } as SiteSettings;
    });
  };

  const save = async () => {
    if (!supabase) return;
    setSaving(true);
    const skills = skillsText.split(',').map((s) => s.trim()).filter(Boolean);
    const entries: Array<[string, unknown]> = [
      ['profile', settings.profile],
      ['contact', settings.contact],
      ['hero', settings.hero],
      ['about', settings.about],
      ['stats', settings.stats],
      ['experience', settings.experience],
      ['skills', skills],
      ['languages', settings.languages],
    ];
    for (const [key, value] of entries) {
      const { error } = await supabase.from('site_settings').upsert({ key, value });
      if (error) alert(`Error saving "${key}": ${error.message}`);
    }
    setSaving(false);
    alert('Settings saved.');
  };

  if (loading) return <p className="text-ink-muted text-sm">Loading…</p>;

  const setSocial = (i: number, val: Partial<SocialLink>) =>
    patchNested('contact', {
      socials: settings.contact.socials.map((s, idx) => (idx === i ? { ...s, ...val } : s)),
    } as Partial<SiteSettings['contact']>);

  const setExp = (i: number, val: Partial<ExperienceItem>) =>
    setField('experience', settings.experience.map((e, idx) => (idx === i ? { ...e, ...val } : e)));

  const setLang = (i: number, val: Partial<LanguageItem>) =>
    setField('languages', settings.languages.map((l, idx) => (idx === i ? { ...l, ...val } : l)));

  return (
    <div className="space-y-6">
      <Section title="Profile">
        <div className="grid grid-cols-2 gap-4">
          <Field label="Name">
            <TextInput value={settings.profile.name} onChange={(e) => patchNested('profile', { name: e.target.value })} />
          </Field>
          <Field label="Chinese name">
            <TextInput value={settings.profile.name_cn} onChange={(e) => patchNested('profile', { name_cn: e.target.value })} />
          </Field>
          <Field label="Location">
            <TextInput value={settings.profile.location} onChange={(e) => patchNested('profile', { location: e.target.value })} />
          </Field>
          <Field label="Tagline">
            <TextInput value={settings.profile.tagline} onChange={(e) => patchNested('profile', { tagline: e.target.value })} />
          </Field>
        </div>
      </Section>

      <Section title="Hero">
        <div className="grid grid-cols-2 gap-4">
          <Field label="Title">
            <TextInput value={settings.hero.title} onChange={(e) => patchNested('hero', { title: e.target.value })} />
          </Field>
          <Field label="Chinese title">
            <TextInput value={settings.hero.chinese} onChange={(e) => patchNested('hero', { chinese: e.target.value })} />
          </Field>
        </div>
        <Field label="Subtitle" className="mt-4">
          <TextInput value={settings.hero.subtitle} onChange={(e) => patchNested('hero', { subtitle: e.target.value })} />
        </Field>
      </Section>

      <Section title="About">
        <Field label="Headline">
          <TextInput value={settings.about.headline} onChange={(e) => patchNested('about', { headline: e.target.value })} />
        </Field>
        <Field label="Bio (paragraph 1)" className="mt-4">
          <TextArea rows={3} value={settings.about.bio_1} onChange={(e) => patchNested('about', { bio_1: e.target.value })} />
        </Field>
        <Field label="Bio (paragraph 2)" className="mt-4">
          <TextArea rows={3} value={settings.about.bio_2} onChange={(e) => patchNested('about', { bio_2: e.target.value })} />
        </Field>
      </Section>

      <Section title="World stats (hero data)">
        <div className="grid grid-cols-4 gap-4">
          <Field label="Projects">
            <TextInput value={settings.stats.projects} onChange={(e) => patchNested('stats', { projects: e.target.value })} />
          </Field>
          <Field label="Films">
            <TextInput value={settings.stats.films} onChange={(e) => patchNested('stats', { films: e.target.value })} />
          </Field>
          <Field label="Tools">
            <TextInput value={settings.stats.tools} onChange={(e) => patchNested('stats', { tools: e.target.value })} />
          </Field>
          <Field label="Location">
            <TextInput value={settings.stats.location} onChange={(e) => patchNested('stats', { location: e.target.value })} />
          </Field>
        </div>
      </Section>

      <Section title="Contact">
        <Field label="Headline">
          <TextInput value={settings.contact.headline} onChange={(e) => patchNested('contact', { headline: e.target.value })} />
        </Field>
        <Field label="Subtext" className="mt-4">
          <TextInput value={settings.contact.subtext} onChange={(e) => patchNested('contact', { subtext: e.target.value })} />
        </Field>
        <div className="grid grid-cols-2 gap-4 mt-4">
          <Field label="Email">
            <TextInput value={settings.contact.email} onChange={(e) => patchNested('contact', { email: e.target.value })} />
          </Field>
          <Field label="Phone">
            <TextInput value={settings.contact.phone} onChange={(e) => patchNested('contact', { phone: e.target.value })} />
          </Field>
          <Field label="WhatsApp (digits only)">
            <TextInput value={settings.contact.whatsapp} onChange={(e) => patchNested('contact', { whatsapp: e.target.value })} />
          </Field>
          <Field label="Location line">
            <TextInput value={settings.contact.location} onChange={(e) => patchNested('contact', { location: e.target.value })} />
          </Field>
        </div>

        <div className="mt-4">
          <span className="block text-[11px] font-bold uppercase tracking-wider text-ink-muted mb-2">
            Social links
          </span>
          {settings.contact.socials.map((s, i) => (
            <div key={i} className="flex gap-2 mb-2">
              <TextInput value={s.name} onChange={(e) => setSocial(i, { name: e.target.value })} placeholder="Name" className="w-1/3" />
              <TextInput value={s.url} onChange={(e) => setSocial(i, { url: e.target.value })} placeholder="https://…" />
              <Button variant="danger" onClick={() => patchNested('contact', { socials: settings.contact.socials.filter((_, idx) => idx !== i) } as Partial<SiteSettings['contact']>)}>
                ✕
              </Button>
            </div>
          ))}
          <Button variant="ghost" onClick={() => patchNested('contact', { socials: [...settings.contact.socials, { name: '', url: '' }] } as Partial<SiteSettings['contact']>)}>
            + Add link
          </Button>
        </div>
      </Section>

      <Section title="Experience">
        {settings.experience.map((e, i) => (
          <div key={i} className="border border-border-crisp rounded-xl p-3 mb-3">
            <div className="grid grid-cols-2 gap-3">
              <Field label="Role">
                <TextInput value={e.role} onChange={(ev) => setExp(i, { role: ev.target.value })} />
              </Field>
              <Field label="Company">
                <TextInput value={e.company} onChange={(ev) => setExp(i, { company: ev.target.value })} />
              </Field>
              <Field label="Date">
                <TextInput value={e.date} onChange={(ev) => setExp(i, { date: ev.target.value })} />
              </Field>
              <Field label="Description">
                <TextInput value={e.desc} onChange={(ev) => setExp(i, { desc: ev.target.value })} />
              </Field>
            </div>
            <div className="mt-2">
              <Button variant="danger" onClick={() => setField('experience', settings.experience.filter((_, idx) => idx !== i))}>
                Remove
              </Button>
            </div>
          </div>
        ))}
        <Button
          variant="ghost"
          onClick={() => setField('experience', [...settings.experience, { role: '', company: '', date: '', desc: '' }])}
        >
          + Add experience
        </Button>
      </Section>

      <Section title="Skills">
        <Field label="Skills (comma separated)">
          <TextInput value={skillsText} onChange={(e) => setSkillsText(e.target.value)} />
        </Field>
      </Section>

      <Section title="Languages">
        {settings.languages.map((l, i) => (
          <div key={i} className="flex gap-2 mb-2">
            <TextInput value={l.name} onChange={(e) => setLang(i, { name: e.target.value })} placeholder="Name" className="w-2/5" />
            <TextInput value={l.level} onChange={(e) => setLang(i, { level: e.target.value })} placeholder="Level" className="w-1/4" />
            <TextInput
              type="number"
              value={l.pct}
              onChange={(e) => setLang(i, { pct: Number(e.target.value) })}
              placeholder="%"
              className="w-24"
            />
            <Button variant="danger" onClick={() => setField('languages', settings.languages.filter((_, idx) => idx !== i))}>
              ✕
            </Button>
          </div>
        ))}
        <Button variant="ghost" onClick={() => setField('languages', [...settings.languages, { name: '', level: '', pct: 80 }])}>
          + Add language
        </Button>
      </Section>

      <div className="flex justify-end sticky bottom-4">
        <Button onClick={save} disabled={saving} className="px-8 py-3">
          {saving ? 'Saving…' : 'Save all settings'}
        </Button>
      </div>
    </div>
  );
};

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <section className="bg-white rounded-2xl border border-border-crisp p-5">
    <h3 className="font-display text-sm font-black uppercase text-ink mb-4">{title}</h3>
    {children}
  </section>
);

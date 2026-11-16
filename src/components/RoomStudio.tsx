import React from 'react';
import { useContent } from '../lib/content';
import { thumbUrl } from '../lib/image';
import { AsciiPortrait } from './AsciiPortrait';

/**
 * Adobe Certified Professional credentials (issued to Syed Shah via Credly).
 * Rendered as static badge images linked to the Credly verification page —
 * the official embed uses third-party <script> + <iframe>, which the site's
 * Content-Security-Policy blocks, and would add ~4 script downloads.
 */
const CERTIFICATIONS = [
  {
    tool: 'Adobe Photoshop',
    name: 'Adobe Certified Professional in Visual Design Using Adobe Photoshop',
    image: 'https://images.credly.com/images/162c92e8-c60c-4c89-87c7-2a5fd9ed318a/linkedin_thumb_Adobe_Certified_Professional_Adobe_Photoshop_digital_badge.png',
    url: 'https://www.credly.com/badges/de2bd27f-fb7e-424e-844a-b1261543d224',
  },
  {
    tool: 'Adobe Express',
    name: 'Adobe Certified Professional in Content Creation and Marketing Using Adobe Express',
    image: 'https://images.credly.com/images/46939579-e0ba-47ec-ba66-11e6a5103f70/linkedin_thumb_image.png',
    url: 'https://www.credly.com/badges/0ba6a6d5-5142-4af2-aee0-8988e095a4a8',
  },
  {
    tool: 'Adobe Acrobat Pro',
    name: 'Adobe Certified Professional in Document Creation and Management Using Adobe Acrobat Pro',
    image: 'https://images.credly.com/images/84996984-f87f-4229-8d3c-dd29b4716231/linkedin_thumb_image.png',
    url: 'https://www.credly.com/badges/f2f2d28b-f242-4d62-8a56-6684ad767408',
  },
  {
    tool: 'Marketing Design',
    name: 'Adobe Certified Professional in Marketing Design',
    image: 'https://images.credly.com/images/54d59f4a-0bad-4fcd-b68b-556ef2ef3011/linkedin_thumb_blob',
    url: 'https://www.credly.com/badges/e315ce93-5ddf-403d-bb67-cb3c2fc3e986',
  },
];

export const RoomStudio: React.FC = () => {
  const { settings } = useContent();
  const { profile, about, experience, skills, languages } = settings;

  return (
    <section
      id="room-studio"
      className="room-anchor min-h-[120vh] flex flex-col justify-start px-5 sm:px-8 lg:px-12 max-w-[1720px] mx-auto pt-24 pb-28 md:pb-20"
    >
      <div className="flex items-center gap-3 mb-10">
        <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/70 border border-border-crisp font-mono text-[11px] font-bold text-ink">
          <span className="w-2 h-2 rounded-full bg-accent-lime" />
          02 · LAB
        </span>
        <div className="h-px flex-1 bg-border-crisp" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        {/* 左：肖像（無框） + 語言 */}
        <div className="lg:col-span-5">
          <div className="relative rounded-3xl overflow-hidden float-slow">
            <AsciiPortrait src={thumbUrl(profile.portrait, 900)} className="w-full h-[440px]" />
            <div className="absolute bottom-0 inset-x-0 p-6 bg-gradient-to-t from-[#11263F]/85 to-transparent text-white">
              <div className="flex items-center justify-between">
                <span className="font-display text-2xl font-bold">{profile.name}</span>
                <span className="font-chinese text-2xl font-bold text-[#FFB15E]">{profile.name_cn}</span>
              </div>
              <p className="font-mono text-xs text-white/70 uppercase tracking-widest mt-1">
                {profile.location} · Multidisciplinary
              </p>
            </div>
          </div>

          {/* 語言（無框） */}
          <div className="mt-8">
            <span className="font-mono text-xs uppercase tracking-widest text-primary font-bold">
              Languages
            </span>
            <div className="mt-4 space-y-4">
              {languages.map((lang, i) => (
                <div key={lang.name}>
                  <div className="flex justify-between font-body text-xs mb-1.5">
                    <span className="text-ink font-bold">{lang.name}</span>
                    <span className="font-mono text-[10px] text-ink-muted">{lang.level} · {lang.pct}%</span>
                  </div>
                  <div className="w-full h-2 bg-[#3A5678] rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full language-bar"
                      style={{ width: `${lang.pct}%`, animationDelay: `${i * 0.18}s` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 認證：Adobe Certified Professional（點擊至 Credly 驗證） */}
          <div className="mt-8">
            <span className="font-mono text-xs uppercase tracking-widest text-primary font-bold">
              Certifications
            </span>
            <div className="mt-4 grid grid-cols-2 gap-3">
              {CERTIFICATIONS.map((cert) => (
                <a
                  key={cert.url}
                  href={cert.url}
                  target="_blank"
                  rel="noreferrer"
                  title={`Verify: ${cert.name}`}
                  aria-label={`Verify ${cert.name} on Credly (opens in a new tab)`}
                  className="group block rounded-2xl overflow-hidden bg-white/60 border border-border-crisp p-3 hover:border-primary/60 hover:-translate-y-0.5 transition-all no-underline"
                >
                  <img
                    src={cert.image}
                    alt={cert.name}
                    loading="lazy"
                    decoding="async"
                    referrerPolicy="no-referrer"
                    className="w-full h-auto block"
                  />
                  <span className="block mt-2.5 text-center font-mono text-[10px] font-bold uppercase tracking-wide text-ink group-hover:text-primary transition-colors">
                    {cert.tool}
                  </span>
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* 右：敘述 + 經歷 + 技能（無框） */}
        <div className="lg:col-span-7">
          <h2 className="font-display text-3xl sm:text-5xl font-bold text-ink tracking-tight leading-[1.05] mb-5">
            {about.headline}
          </h2>
          <p className="font-body text-base text-ink font-medium leading-relaxed mb-4">
            {about.bio_1}
          </p>
          <p className="font-body text-sm text-ink-muted leading-relaxed mb-10">
            {about.bio_2}
          </p>

          {/* 經歷列表 */}
          <span className="font-mono text-xs uppercase tracking-widest text-primary font-bold">
            Experience
          </span>
          <div className="flex flex-col mt-3 mb-10">
            {experience.map((exp) => (
              <div
                key={`${exp.role}-${exp.company}`}
                className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-5 py-3 border-b border-border-crisp"
              >
                <span className="font-display text-lg font-bold text-ink">{exp.role}</span>
                <span className="font-mono text-[10px] uppercase tracking-wider text-ink-muted">
                  {exp.company} · {exp.date}
                </span>
                <span className="text-xs text-ink-muted sm:ml-auto sm:text-right">{exp.desc}</span>
              </div>
            ))}
          </div>

          {/* 技能 chips */}
          <span className="font-mono text-xs uppercase tracking-widest text-primary font-bold">
            Skills
          </span>
          <div className="flex flex-wrap gap-2 mt-3">
            {skills.map((skill, i) => (
              <span
                key={skill}
                className="float-chip px-3.5 py-1.5 rounded-full bg-white/60 border border-border-crisp font-mono text-xs font-bold text-ink"
                style={{ animationDelay: `${(i % 4) * 0.2}s` }}
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

import React from 'react';
import { ArrowUpRight, BadgeCheck } from 'lucide-react';
import { useContent } from '../lib/content';
import { thumbUrl } from '../lib/image';
import { AsciiPortrait } from './AsciiPortrait';

/**
 * Adobe Certified Professional credentials (issued to Syed Shah via Credly).
 * Rendered as static badge images (self-hosted) linked to the Credly
 * verification page — the official embed uses third-party <script> + <iframe>
 * (blocked by our CSP), and the "linkedin_thumb" assets are padded 672×352
 * crops that look tiny; we ship the square badge instead.
 */
const CERTIFICATIONS = [
  {
    tool: 'Adobe Photoshop',
    name: 'Adobe Certified Professional in Visual Design Using Adobe Photoshop',
    image: '/images/badges/acp-photoshop.png',
    url: 'https://www.credly.com/badges/de2bd27f-fb7e-424e-844a-b1261543d224',
  },
  {
    tool: 'Adobe Express',
    name: 'Adobe Certified Professional in Content Creation and Marketing Using Adobe Express',
    image: '/images/badges/acp-express.png',
    url: 'https://www.credly.com/badges/0ba6a6d5-5142-4af2-aee0-8988e095a4a8',
  },
  {
    tool: 'Adobe Acrobat Pro',
    name: 'Adobe Certified Professional in Document Creation and Management Using Adobe Acrobat Pro',
    image: '/images/badges/acp-acrobat.png',
    url: 'https://www.credly.com/badges/f2f2d28b-f242-4d62-8a56-6684ad767408',
  },
  {
    tool: 'Marketing Design',
    name: 'Adobe Certified Professional in Marketing Design',
    image: '/images/badges/acp-marketing-design.png',
    url: 'https://www.credly.com/badges/e315ce93-5ddf-403d-bb67-cb3c2fc3e986',
  },
];

export const RoomStudio: React.FC = () => {
  const { settings } = useContent();
  const { profile, about, experience, skills, languages } = settings;

  return (
    <section
      id="room-studio"
      className="room-anchor min-h-screen flex flex-col justify-start px-5 sm:px-8 lg:px-12 max-w-[1440px] mx-auto pt-24 pb-28 md:pb-20"
    >
      <div className="flex items-center gap-3 mb-10">
        <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/70 border border-border-crisp font-mono text-[11px] font-bold text-ink">
          <span className="w-2 h-2 rounded-full bg-accent-lime" />
          02 · LAB
        </span>
        <div className="h-px flex-1 bg-border-crisp" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
        {/* 左：肖像（無框） + 語言 */}
        <div className="lg:col-span-4 min-w-0">
          <div className="relative rounded-3xl overflow-hidden border border-border-crisp bg-surface-pure">
            <AsciiPortrait src={thumbUrl(profile.portrait, 900)} className="w-full h-[360px] sm:h-[440px] lg:h-[380px]" />
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


        </div>

        {/* 右：敘述 + 經歷 + 技能（無框） */}
        <div className="lg:col-span-8 min-w-0">
          <h2 className="font-display text-3xl sm:text-4xl xl:text-5xl font-bold text-ink tracking-tight leading-[1.05] mb-5">
            {about.headline}
          </h2>
          <p className="font-body text-base text-ink font-medium leading-relaxed max-w-[65ch] mb-4">
            {about.bio_1}
          </p>
          <p className="font-body text-sm text-ink-muted leading-relaxed max-w-[70ch] mb-9">
            {about.bio_2}
          </p>

          {/* 經歷列表 */}
          <h3 className="font-mono text-xs uppercase tracking-widest text-primary font-bold">
            Experience
          </h3>
          <div className="flex flex-col mt-3 mb-10">
            {experience.map((exp) => (
              <div
                key={`${exp.role}-${exp.company}`}
                className="grid grid-cols-1 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] gap-2 sm:gap-x-6 py-5 border-b border-border-crisp"
              >
                <div>
                  <h4 className="font-display text-lg font-bold text-ink leading-snug">{exp.role}</h4>
                  <p className="font-mono text-[11px] text-primary mt-1">{exp.company}</p>
                </div>
                <div className="sm:text-right">
                  <p className="font-mono text-[10px] uppercase tracking-wider text-ink-muted">{exp.date}</p>
                  <p className="text-xs leading-relaxed text-ink-muted mt-1.5">{exp.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* 技能 chips */}
          <h3 className="font-mono text-xs uppercase tracking-widest text-primary font-bold">
            Skills
          </h3>
          <div className="flex flex-wrap gap-2 mt-3">
            {skills.map((skill) => (
              <span
                key={skill}
                className="px-3.5 py-2 rounded-lg bg-surface-warm/80 border border-border-crisp font-mono text-xs font-bold text-ink"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* 認證獨立成列；保留官方圖像，深色卡片融入太空主題。 */}
      <div className="mt-12 pt-8 border-t border-border-crisp">
        <div className="flex flex-wrap items-end justify-between gap-3 mb-5">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-primary mb-2">Credentials</p>
            <h3 className="font-display text-2xl font-bold text-ink">Adobe Certified Professional</h3>
          </div>
          <span className="inline-flex items-center gap-1.5 font-mono text-[10px] text-ink-muted">
            <BadgeCheck size={14} className="text-primary" aria-hidden="true" />
            Verify on Credly
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
          {CERTIFICATIONS.map((cert) => (
            <a
              key={cert.url}
              href={cert.url}
              target="_blank"
              rel="noreferrer"
              title={cert.name}
              aria-label={`Verify ${cert.name} on Credly (opens in a new tab)`}
              className="certification-card group flex items-center gap-4 rounded-2xl border border-border-crisp bg-surface-pure/90 p-4 no-underline transition-colors hover:border-primary/60 hover:bg-surface-warm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
            >
              <img
                src={thumbUrl(cert.image, 160)}
                alt={cert.name}
                width={80}
                height={80}
                loading="lazy"
                decoding="async"
                className="certification-badge w-20 h-20 shrink-0 object-contain"
              />
              <div className="min-w-0 flex-1">
                <p className="font-display text-sm font-bold text-ink leading-snug">{cert.tool}</p>
                <span className="inline-flex items-center gap-1 mt-2 font-mono text-[10px] text-ink-muted group-hover:text-primary transition-colors">
                  View credential <ArrowUpRight size={12} aria-hidden="true" />
                </span>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
};

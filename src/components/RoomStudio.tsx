import { RoomHeading } from './RoomHeading';
import React from 'react';
import { ArrowUpRight } from 'lucide-react';
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

  // CMS 中的技能保留原文；依用途分組，避免整面 chips 難以閱讀。
  const skillCategories = [
    { name: 'Creative', match: /photoshop|illustrator|after effects|premiere|davinci|blender|remotion|suno|higgsfield|pixellab|godot/i },
    { name: 'AI & workflows', match: /langchain|llamaindex|crewai|rag|vector|prompt|tool calling|llm|ollama|comfyui|claude|chatgpt|codex|pi agent/i },
    { name: 'Development', match: /python|flask|fastapi|postgresql|redis|docker|nginx|git|react|typescript|linux|fish|powershell|workflow|obsidian/i },
    { name: 'Hardware & vision', match: /arduino|raspberry|esp-idf|opencv|tensorflow/i },
  ];
  const skillGroups = skillCategories.map((category, index) => ({
    name: category.name,
    items: skills.filter((skill) => skillCategories.findIndex((group) => group.match.test(skill)) === index),
  }));
  const otherSkills = skills.filter((skill) => !skillCategories.some((group) => group.match.test(skill)));
  if (otherSkills.length) skillGroups.push({ name: 'Other tools', items: otherSkills });

  return (
    <section
      id="room-studio"
      className="room-anchor"
    >
      <RoomHeading number="02" label="Lab" />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
        {/* 左：肖像 + 語言 */}
        <div className="lg:col-span-4 min-w-0">
          <div className="relative rounded-3xl overflow-hidden border border-border-crisp bg-surface-pure">
            <AsciiPortrait src={thumbUrl(profile.portrait, 900)} className="w-full h-[360px] sm:h-[440px] lg:h-[380px]" />
            <div className="absolute bottom-0 inset-x-0 p-6 bg-gradient-to-t from-[#11263F]/85 to-transparent text-white">
              <div className="flex items-center justify-between">
                <span className="font-display text-lg sm:text-2xl font-bold">{profile.name}</span>
                <span className="font-chinese text-xl sm:text-2xl font-bold text-[#FFB15E]">{profile.name_cn}</span>
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
          <div className="flex flex-col mt-3">
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

        </div>
      </div>

      {/* 下半部共用基線：認證與技能並排，避免左側留白。 */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 mt-10 pt-8 border-t border-border-crisp">
        <div className="lg:col-span-4 min-w-0">
          <h3 className="font-mono text-xs uppercase tracking-widest text-primary font-bold">Certifications</h3>
          <p className="text-sm text-ink-muted mt-2 mb-5">Adobe Certified Professional</p>
          <div className="grid grid-cols-2 gap-3">
            {CERTIFICATIONS.map((cert) => (
              <a
                key={cert.url}
                href={cert.url}
                target="_blank"
                rel="noreferrer"
                title={cert.name}
                aria-label={`Verify ${cert.name} on Credly (opens in a new tab)`}
                className="certification-card group flex flex-col items-center text-center gap-3 rounded-xl border border-border-crisp bg-surface-pure/90 px-3 py-5 no-underline transition-colors hover:border-primary/60 hover:bg-surface-warm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
              >
                <img
                  src={thumbUrl(cert.image, 160)}
                  alt={cert.name}
                  width={72}
                  height={72}
                  loading="lazy"
                  decoding="async"
                  className="certification-badge w-[72px] h-[72px] object-contain"
                />
                <span className="font-display text-xs font-bold text-ink leading-snug">{cert.tool}</span>
                <span className="inline-flex items-center gap-1 font-mono text-[9px] text-ink-muted group-hover:text-primary transition-colors">
                  Credly <ArrowUpRight size={11} aria-hidden="true" />
                </span>
              </a>
            ))}
          </div>
        </div>

        <div className="lg:col-span-8 min-w-0">
          <h3 className="font-mono text-xs uppercase tracking-widest text-primary font-bold">Skills & tools</h3>
          <div className="mt-5 divide-y divide-border-crisp">
            {skillGroups.filter((group) => group.items.length).map((group) => (
              <div key={group.name} className="py-4 first:pt-0 grid grid-cols-1 sm:grid-cols-[120px_minmax(0,1fr)] gap-3 sm:gap-5">
                <h4 className="font-display text-sm font-semibold text-ink sm:pt-1">{group.name}</h4>
                <ul className="flex flex-wrap gap-x-2 gap-y-2">
                  {group.items.map((skill) => (
                    <li key={skill} className="px-2.5 py-1 rounded-md bg-surface-warm/70 font-body text-xs leading-relaxed text-ink-muted">{skill}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

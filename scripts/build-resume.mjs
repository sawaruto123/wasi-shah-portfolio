// Resume builder — follows the resume-builder skill methodology.
// Generates a DOCX (using the `docx` package) + a self-contained HTML version.
import { Document, Packer, Paragraph, TextRun, AlignmentType, LevelFormat, TabStopType, TabStopPosition, BorderStyle, convertMillimetersToTwip } from 'docx';
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';

const OUT_DIR = '<repo root>';
const em = '\u2014';
const en = '\u2013';

// ============ CONTENT ============
const name = 'SYED WASI SHAH';
const head = {
  name,
  cn: '\u5CFB\u5C71',
  line: 'Hong Kong SAR  |  +852 9899 2944  |  syedwasi983@gmail.com  |  wasi-shah-portfolio.vercel.app',
  summary: 'Creative Developer and Motion Designer building stories for the digital world \u2014 cutting films, designing brand systems, and shipping interactive products.',
  role: 'CREATIVE DEVELOPER  |  MOTION DESIGNER  |  FILMMAKER',
  langs: 'Cantonese (Native)  \u00B7  English (Native)  \u00B7  Mandarin (Fluent)',
};

const skills = [
  { group: 'Design & Motion', items: ['Adobe Premiere Pro \u00b7 advanced', 'Adobe After Effects \u00b7 advanced', 'Photoshop \u00b7 Illustrator', 'Blender \u00b7 3D'] },
  { group: 'Development', items: ['JavaScript / TypeScript', 'React \u00b7 Three.js \u00b7 Tailwind', 'Supabase / Postgres / REST', 'PowerShell \u00b7 WPF \u00b7 Godot'] },
  { group: 'AI & Automation', items: ['ComfyUI \u00b7 Midjourney \u00b7 CrewAI'] },
];

const experience = [
  {
    company: 'Behance Co Limited', role: 'Adobe Ambassador', date: 'May 2025 \u2013 Present',
    bullets: [
      ['Brand Representation', 'Liaise between vendor and prospective students and parents; drive outreach via social media and events.'],
      ['Content Creation', 'Produce blogs, videos, workshop and instructional materials; deliver workshops and presentations.'],
      ['Event Coordination', 'Plan and run online and offline events; build relationships with industry professionals.'],
    ],
  },
  {
    company: 'Virtual Academy International', role: 'Marketing & Teacher', date: 'Jun 2024 \u2013 Present',
    bullets: [
      ['Campaign Execution', 'Research markets and plan and execute marketing campaigns; manage social media.'],
      ['Teaching', 'Deliver engaging online lessons, adapting content to diverse learning needs.'],
    ],
  },
  {
    company: 'moji Corporation Limited', role: 'Creative Intern (APAC)', date: 'Sep 2024 \u2013 Jul 2025',
    bullets: [
      ['Design Execution', 'Collaborate on design concepts and visual content for digital campaigns.'],
      ['Production Support', 'Edit and retouch photos; support video production; contribute to brainstorming.'],
    ],
  },
  {
    company: 'Seaman Paper Asia', role: 'Graphic Trainee', date: 'Jun 2024 \u2013 Aug 2024',
    bullets: [
      ['Graphic Design', 'Handle day-to-day design and coordinate with departments for marketing materials.'],
      ['Research & Support', 'Assist marketing research and assess product ink coverage; support ad hoc projects.'],
    ],
  },
];

const projects = [
  ['Real-time Avatar Overlay', 'Electron + MediaPipe app that tracks facial landmarks in real time to drive an avatar, captured in OBS.'],
  ['Cash Finance System', 'React + Supabase user app and admin console; RLS, edge functions, HK MPF, bilingual UI.'],
  ['Gold Finder', 'Godot 2D platformer, published on itch.io and exported to HTML5.'],
  ['Obsidian Automation', 'PowerShell / WPF task widget and markdown-based expense tracker.'],
];

const education = [
  { school: 'Hong Kong Metropolitan University', detail: 'BSc Computer Science', date: 'Sep 2024 \u2013 Present', note: 'Java OOP, Discrete Mathematics, Computer Architecture, Linear Algebra' },
  { school: 'Carmel Bunnan Tong Memorial Secondary School', detail: 'Secondary Education', date: 'Sep 2018 \u2013 May 2024', note: 'ICT, Geography' },
];

// ============ DOCX ============
const blue = '003366';
const bodyFont = 'Arial';

function bulletParagraph(boldText, text) {
  return new Paragraph({
    style: 'bullet',
    children: [
      new TextRun({ text: boldText + ': ', bold: true, font: bodyFont, size: 21, color: '333333' }),
      new TextRun({ text, font: bodyFont, size: 21, color: '333333' }),
    ],
  });
}

function sectionTitle(t) {
  return new Paragraph({
    spacing: { before: 220, after: 80 },
    children: [new TextRun({ text: t.toUpperCase(), bold: true, font: bodyFont, size: 24, color: blue })],
    border: { bottom: { color: blue, size: 6, style: BorderStyle.SINGLE } },
  });
}

function entryHead(company, role, date) {
  return [
    new Paragraph({
      tabStops: [{ type: TabStopType.RIGHT, position: TabStopPosition.MAX }],
      spacing: { before: 120, after: 20 },
      children: [
        new TextRun({ text: company, bold: true, font: bodyFont, size: 21, color: '333333' }),
        new TextRun({ text: '\t' + date, font: bodyFont, size: 20, color: '666666' }),
      ],
    }),
    new Paragraph({
      spacing: { after: 40 },
      children: [new TextRun({ text: role, italics: true, font: bodyFont, size: 21, color: '333333' })],
    }),
  ];
}

async function buildDocx() {
  const doc = new Document({
    numbering: {
      config: [{ reference: 'bullets', levels: [{ level: 0, format: LevelFormat.BULLET, text: '\u2022', alignment: AlignmentType.LEFT }] }],
    },
    styles: {
      paragraphStyles: [
        { id: 'bullet', name: 'Bullet', basedOn: 'Normal', next: 'Normal', run: { font: bodyFont, size: 21, color: '333333' }, paragraph: { indent: { left: 360, hanging: 180 } } },
      ],
      default: { document: { run: { font: bodyFont, size: 21, color: '333333' } } },
    },
    sections: [{
      properties: { page: { size: { width: 11906, height: 16838 }, margin: { top: 900, bottom: 900, left: 1000, right: 1000 } } },
      children: [
        // HEADER
        new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: head.name, bold: true, font: bodyFont, size: 40, color: '333333' })] }),
        new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 60 }, children: [new TextRun({ text: '(' + head.cn + ')  ' + head.role, font: bodyFont, size: 22, color: blue })] }),
        new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 60 }, children: [new TextRun({ text: head.line, font: bodyFont, size: 19, color: '666666' })] }),
        new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 120 }, children: [new TextRun({ text: head.langs, font: bodyFont, size: 19, color: '666666' })] }),
        new Paragraph({ spacing: { after: 40 }, children: [new TextRun({ text: head.summary, font: bodyFont, size: 21, color: '333333' })] }),

        sectionTitle('Professional Skills'),
        ...skills.flatMap((g) => [
          new Paragraph({ spacing: { before: 60, after: 20 }, children: [new TextRun({ text: g.group, bold: true, font: bodyFont, size: 21, color: blue })] }),
          new Paragraph({ spacing: { after: 60 }, children: [new TextRun({ text: g.items.join('  \u00B7  '), font: bodyFont, size: 21, color: '333333' })] }),
        ]),

        sectionTitle('Work Experience'),
        ...experience.flatMap((e) => [
          ...entryHead(e.company, e.role, e.date),
          ...e.bullets.map(([b, t]) => bulletParagraph(b, t)),
        ]),

        sectionTitle('Selected Projects'),
        ...projects.flatMap(([p, d]) => [
          new Paragraph({ spacing: { before: 80, after: 20 }, children: [new TextRun({ text: p, bold: true, font: bodyFont, size: 21, color: '333333' })] }),
          new Paragraph({ style: 'bullet', children: [new TextRun({ text: d, font: bodyFont, size: 21, color: '333333' })] }),
        ]),

        sectionTitle('Education'),
        ...education.flatMap((e) => [
          ...entryHead(e.school, e.detail, e.date),
          new Paragraph({ style: 'bullet', spacing: { after: 40 }, children: [new TextRun({ text: e.note, font: bodyFont, size: 21, color: '333333' })] }),
        ]),
      ],
    }],
  });

  const buf = await Packer.toBuffer(doc);
  writeFileSync(join(OUT_DIR, 'SYED-WASI-SHAH_Resume_2026.docx'), buf);
  console.log('DOCX written');
}

buildDocx().catch((e) => { console.error(e); process.exit(1); });

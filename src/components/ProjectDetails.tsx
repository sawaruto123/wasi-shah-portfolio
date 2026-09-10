import React from 'react';

type Block =
  | { type: 'heading'; content: string }
  | { type: 'pre'; content: string }
  | { type: 'bullets'; items: string[] };

// Lines containing box-drawing characters (or heavy indentation) are treated
// as a structure diagram and rendered verbatim in a monospace <pre>.
const DIAGRAM = /[│─┌┐└┘├┤┬┴┼▼▲◀▶→←↓↑╭╮╯╰═║]/;

function parse(text: string): Block[] {
  const blocks: Block[] = [];
  let pre: string[] = [];
  let bullets: string[] = [];
  const flushPre = () => {
    if (pre.length) {
      blocks.push({ type: 'pre', content: pre.join('\n') });
      pre = [];
    }
  };
  const flushBullets = () => {
    if (bullets.length) {
      blocks.push({ type: 'bullets', items: bullets });
      bullets = [];
    }
  };
  const flush = () => {
    flushPre();
    flushBullets();
  };

  for (const raw of text.split('\n')) {
    const line = raw.replace(/\s+$/, '');
    if (!line.trim()) {
      flush();
      continue;
    }
    if (DIAGRAM.test(line) || /^\s{2,}\S/.test(raw)) {
      flushBullets();
      pre.push(raw);
      continue;
    }
    flushPre();
    if (/^[-•*]\s+/.test(line)) bullets.push(line.replace(/^[-•*]\s+/, ''));
    else {
      flushBullets();
      blocks.push({ type: 'heading', content: line });
    }
  }
  flush();
  return blocks;
}

const Bullet: React.FC<{ text: string }> = ({ text }) => {
  const i = text.indexOf(':');
  const head = i > 0 && i < 44 ? text.slice(0, i) : null;
  const rest = head ? text.slice(i + 1) : text;
  return (
    <li className="flex gap-2.5">
      <span className="text-primary shrink-0 mt-[3px] text-[10px]">◆</span>
      <span className="font-body text-sm text-ink-muted leading-relaxed">
        {head && <strong className="text-ink font-semibold">{head}:</strong>}
        {rest}
      </span>
    </li>
  );
};

/** Renders a project's `detailed_description` as structured, terminal-style detail. */
export const ProjectDetails: React.FC<{ text: string }> = ({ text }) => {
  const blocks = parse(text);
  return (
    <div className="p-6 rounded-2xl bg-surface-warm border border-border-crisp mb-8">
      <span className="font-mono text-xs uppercase tracking-widest text-primary font-bold block mb-4">
        Details
      </span>
      <div className="space-y-4">
        {blocks.map((b, i) => {
          if (b.type === 'heading')
            return (
              <div
                key={i}
                className="font-mono text-[11px] uppercase tracking-widest text-ink font-bold pt-1 border-b border-border-crisp pb-1"
              >
                {b.content}
              </div>
            );
          if (b.type === 'pre')
            return (
              <pre
                key={i}
                className="font-mono text-[11px] sm:text-xs leading-snug text-primary/90 bg-surface-pure/70 border border-border-crisp rounded-xl p-4 overflow-x-auto whitespace-pre"
              >
                {b.content}
              </pre>
            );
          return (
            <ul key={i} className="space-y-2">
              {b.items.map((it, j) => (
                <Bullet key={j} text={it} />
              ))}
            </ul>
          );
        })}
      </div>
    </div>
  );
};

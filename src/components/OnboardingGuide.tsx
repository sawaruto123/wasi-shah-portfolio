import React, { useEffect, useRef, useState } from 'react';
import {
  Compass, ArrowUpDown, SlidersHorizontal, Moon, Images, Sun, Eye,
  ChevronLeft, ChevronRight, X, MousePointer2, Layers,
} from 'lucide-react';

const STORAGE_KEY = 'ws-onboarded';

interface Step {
  /** CSS selector of the real element to spotlight. Omit for a centred card. */
  target?: string;
  /** Fly to this room before showing the step (0=World 1=Lab 2=Archive 3=Films 4=Connect). */
  room?: number;
  place?: 'top' | 'bottom' | 'left' | 'right';
  icon: React.ReactNode;
  title: string;
  desc: string;
}

const PC_STEPS: Step[] = [
  {
    icon: <Compass className="w-5 h-5" />,
    title: 'Welcome to the world',
    desc: "This isn't a normal page — it's a 3D space you travel through. Give me 20 seconds and I'll show you every control.",
  },
  {
    target: '[data-tour="hud-nav"]',
    room: 0,
    place: 'bottom',
    icon: <Compass className="w-5 h-5" />,
    title: 'The five rooms',
    desc: 'World · Lab · Archive · Films · Connect. Each one is a stop in the world — click any of them to fly straight there.',
  },
  {
    target: '[data-tour="arrow-next"]',
    room: 1,
    place: 'left',
    icon: <ArrowUpDown className="w-5 h-5" />,
    title: 'Travel forward',
    desc: 'These arrows step to the next / previous room. Scrolling does exactly the same thing — and the camera genuinely flies through space.',
  },
  {
    target: '[data-tour="bg"]',
    room: 1,
    place: 'bottom',
    icon: <SlidersHorizontal className="w-5 h-5" />,
    title: 'Dim the background',
    desc: 'Drag this to fade the 3D world back (default 75%) whenever the text behind it feels busy.',
  },
  {
    target: '[data-tour="theme"]',
    room: 1,
    place: 'bottom',
    icon: <Moon className="w-5 h-5" />,
    title: 'Night mode',
    desc: 'Switch between the space world and a deeper night palette. It only changes when you ask — it never follows your OS.',
  },
  {
    target: '[data-tour="dial"]',
    room: 2,
    place: 'right',
    icon: <Sun className="w-5 h-5" />,
    title: 'Aim the light',
    desc: 'Drag this dial around to move the ambient light through the scene — the cards catch it as it turns.',
  },
  {
    target: '[data-tour="card"]',
    room: 2,
    place: 'bottom',
    icon: <Images className="w-5 h-5" />,
    title: 'Open the work',
    desc: 'Click any card to open it. Inside, use the ← → arrows or your keyboard to flip through, and click an image to zoom it full-screen.',
  },
  {
    target: '[data-tour="world"]',
    room: 3,
    place: 'top',
    icon: <Eye className="w-5 h-5" />,
    title: 'World only',
    desc: 'Hide the whole site and just watch the 3D world go by. Click again to come back.',
  },
  {
    target: '[data-tour="connect"]',
    room: 4,
    place: 'bottom',
    icon: <MousePointer2 className="w-5 h-5" />,
    title: 'Say hello',
    desc: 'The Connect button takes you to the contact room — or you can click anywhere in the world to send a ripple through space.',
  },
  {
    icon: <Layers className="w-5 h-5" />,
    title: "You're all set",
    desc: 'That’s the full tour. Everything else is self-explanatory — go explore, and try clicking the stars.',
  },
];

const MOBILE_STEPS: Step[] = [
  {
    icon: <Compass className="w-5 h-5" />,
    title: 'Welcome to the world',
    desc: "This isn't a normal page — it's a 3D space you travel through. Quick tour:",
  },
  {
    target: '[data-tour="bottom-nav"]',
    room: 0,
    place: 'top',
    icon: <Compass className="w-5 h-5" />,
    title: 'Switch sections',
    desc: 'Tap any section down here to jump straight to it: World, Work, Shots, Films, Connect.',
  },
  {
    target: '[data-tour="bg"]',
    room: 1,
    place: 'bottom',
    icon: <SlidersHorizontal className="w-5 h-5" />,
    title: 'Dim the background',
    desc: 'Drag this to fade the 3D world back (default 75%) when the text feels busy.',
  },
  {
    target: '[data-tour="theme"]',
    room: 1,
    place: 'bottom',
    icon: <Moon className="w-5 h-5" />,
    title: 'Night mode',
    desc: 'Switch between the space world and a deeper night palette.',
  },
  {
    target: '[data-tour="card"]',
    room: 2,
    place: 'bottom',
    icon: <Images className="w-5 h-5" />,
    title: 'Open the work',
    desc: 'Tap a card to open it, then swipe left / right to flip through the images.',
  },
  {
    icon: <Layers className="w-5 h-5" />,
    title: "You're all set",
    desc: 'That’s the tour. Swipe up and down to travel, and tap the world to make ripples.',
  },
];

interface OnboardingGuideProps {
  onTravel?: (roomIndex: number) => void;
}

export const OnboardingGuide: React.FC<OnboardingGuideProps> = ({ onTravel }) => {
  const [visible, setVisible] = useState(false);
  const [step, setStep] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [rect, setRect] = useState<DOMRect | null>(null);
  const rectKeyRef = useRef('');

  useEffect(() => {
    try {
      if (localStorage.getItem(STORAGE_KEY)) return;
    } catch { /* ignore */ }
    setIsMobile(window.matchMedia('(pointer: coarse)').matches || window.innerWidth < 768);
    setVisible(true);
  }, []);

  const steps = isMobile ? MOBILE_STEPS : PC_STEPS;
  const current = steps[Math.min(step, steps.length - 1)];

  const finish = () => {
    try { localStorage.setItem(STORAGE_KEY, '1'); } catch { /* ignore */ }
    setVisible(false);
  };
  const next = () => (step >= steps.length - 1 ? finish() : setStep(step + 1));
  const prev = () => setStep((s) => Math.max(0, s - 1));

  // 每一步可以先飛到對應房間，讓使用者真的看到那個畫面
  useEffect(() => {
    if (!visible) return;
    const r = steps[step]?.room;
    if (typeof r === 'number') onTravel?.(r);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible, step, isMobile]);

  // 追蹤目標元素的位置（房間轉場時也會跟著移動）
  useEffect(() => {
    if (!visible) return;
    let raf = 0;
    const tick = () => {
      const sel = steps[step]?.target;
      const el = sel ? (document.querySelector(sel) as HTMLElement | null) : null;
      let r: DOMRect | null = null;
      if (el) {
        const b = el.getBoundingClientRect();
        if (b.width > 4 && b.height > 4) r = b; // display:none 會是全 0，忽略
      }
      const key = r
        ? `${Math.round(r.left)}|${Math.round(r.top)}|${Math.round(r.width)}|${Math.round(r.height)}`
        : '';
      if (key !== rectKeyRef.current) {
        rectKeyRef.current = key;
        setRect(r);
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible, step, isMobile]);

  // 鍵盤操作
  useEffect(() => {
    if (!visible) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'Enter') {
        e.preventDefault();
        setStep((s) => (s >= steps.length - 1 ? (finish(), s) : s + 1));
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        setStep((s) => Math.max(0, s - 1));
      } else if (e.key === 'Escape') {
        finish();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible, isMobile, step]);

  if (!visible) return null;

  // ── 提示卡位置：盡量貼近被標記的元素，避開螢幕邊緣 ──
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const TW = Math.min(340, vw - 24);
  let tipStyle: React.CSSProperties = { left: '50%', top: '50%', transform: 'translate(-50%,-50%)' };
  if (rect) {
    const place = current.place || 'bottom';
    const cx = Math.max(12, Math.min(vw - TW - 12, rect.left + rect.width / 2 - TW / 2));
    if (place === 'top') {
      tipStyle = { left: cx, top: Math.max(12, rect.top - 16), transform: 'translateY(-100%)' };
    } else if (place === 'left') {
      tipStyle = { left: Math.max(12, rect.left - 16), top: rect.top + rect.height / 2, transform: 'translate(-100%,-50%)' };
    } else if (place === 'right') {
      tipStyle = { left: Math.min(vw - TW - 12, rect.right + 16), top: rect.top + rect.height / 2, transform: 'translateY(-50%)' };
    } else {
      tipStyle = { left: cx, top: Math.min(vh - 210, rect.bottom + 16) };
    }
  }

  return (
    <>
      {/* 點畫面任一處 → 下一步 */}
      <div className="fixed inset-0 z-[94] cursor-pointer" onClick={next} aria-hidden="true" />

      {/* 聚光燈：用超大 box-shadow 把週圍壓暗，只留目標元素 */}
      {rect ? (
        <div
          className="fixed z-[95] pointer-events-none rounded-2xl ring-2 ring-[#6CC8FF]/70 transition-all duration-300 ease-out"
          style={{
            left: rect.left - 8,
            top: rect.top - 8,
            width: rect.width + 16,
            height: rect.height + 16,
            boxShadow: '0 0 0 9999px rgba(3,8,18,0.78), 0 0 34px rgba(108,200,255,0.45)',
          }}
          aria-hidden="true"
        />
      ) : (
        <div className="fixed inset-0 z-[95] pointer-events-none bg-[rgba(3,8,18,0.78)]" aria-hidden="true" />
      )}

      {/* 說明卡 */}
      <div className="fixed z-[96]" style={tipStyle}>
        <div
          className="glass-card rounded-2xl border border-border-crisp shadow-2xl p-5 modal-enter"
          style={{ width: TW }}
        >
          <div className="flex items-start justify-between gap-3 mb-3">
            <span className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-primary/15 text-primary font-mono text-[10px] font-bold uppercase tracking-widest">
              <span className="w-1.5 h-1.5 rounded-full bg-primary" />
              {step + 1} / {steps.length}
            </span>
            <button
              onClick={finish}
              aria-label="Skip the tour"
              className="w-7 h-7 rounded-full bg-surface-warm hover:bg-surface-container text-ink-muted flex items-center justify-center cursor-pointer border-none shrink-0"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex items-start gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-primary/15 text-primary flex items-center justify-center shrink-0">
              {current.icon}
            </div>
            <div className="min-w-0">
              <h3 className="font-display text-base font-black uppercase text-ink leading-tight mb-1">
                {current.title}
              </h3>
              <p className="font-body text-[13px] text-ink-muted leading-relaxed">{current.desc}</p>
            </div>
          </div>

          <div className="flex items-center justify-between gap-3 pt-1">
            <button
              onClick={finish}
              className="px-2 py-2 rounded-lg bg-transparent text-ink-muted font-mono text-[11px] font-bold uppercase tracking-wider hover:text-ink cursor-pointer border-none"
            >
              Skip
            </button>

            <div className="flex items-center gap-1.5">
              {steps.map((_, i) => (
                <span
                  key={i}
                  className={`h-1.5 rounded-full transition-all ${
                    i === step ? 'w-4 bg-primary' : 'w-1.5 bg-surface-container-high'
                  }`}
                />
              ))}
            </div>

            <div className="flex items-center gap-1.5">
              {step > 0 && (
                <button
                  onClick={prev}
                  aria-label="Back"
                  className="w-9 h-9 rounded-xl bg-surface-warm hover:bg-surface-container text-ink flex items-center justify-center cursor-pointer border-none"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
              )}
              <button
                onClick={next}
                className="inline-flex items-center gap-1 px-4 py-2 rounded-xl bg-primary text-white font-mono text-[11px] font-bold uppercase tracking-wider hover:bg-ink transition-colors cursor-pointer border-none whitespace-nowrap"
              >
                {step >= steps.length - 1 ? 'Start exploring' : 'Next'}
                {step < steps.length - 1 && <ChevronRight className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

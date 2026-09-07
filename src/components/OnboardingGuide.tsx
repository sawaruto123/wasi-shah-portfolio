import React, { useEffect, useState } from 'react';
import { MousePointer2, ArrowUpDown, SlidersHorizontal, Moon, Images, X } from 'lucide-react';

const STORAGE_KEY = 'ws-onboarded';

interface Step {
  icon: React.ReactNode;
  title: string;
  desc: string;
}

const PC_STEPS: Step[] = [
  {
    icon: <ArrowUpDown className="w-5 h-5" />,
    title: 'Scroll to travel',
    desc: 'Scroll (or use the arrow buttons) to fly through the rooms and get closer to the black hole.',
  },
  {
    icon: <MousePointer2 className="w-5 h-5" />,
    title: 'Move your mouse',
    desc: 'Hover the 3D objects to make them grow. Click anywhere to send a ripple through space.',
  },
  {
    icon: <Images className="w-5 h-5" />,
    title: 'Browse the details',
    desc: 'Click a project or photo to open it, then use the ← → arrows (or keyboard) to flip through.',
  },
  {
    icon: <SlidersHorizontal className="w-5 h-5" />,
    title: 'Adjust background',
    desc: 'Use the sliders icon in the top bar to dim the background (default 75%) if text feels busy.',
  },
  {
    icon: <Moon className="w-5 h-5" />,
    title: 'Night mode',
    desc: 'Tap the moon/sun to switch between the space world and a deeper night mode.',
  },
];

const MOBILE_STEPS: Step[] = [
  {
    icon: <ArrowUpDown className="w-5 h-5" />,
    title: 'Swipe to travel',
    desc: 'Swipe up/down to fly between rooms, or tap a section in the bottom bar.',
  },
  {
    icon: <MousePointer2 className="w-5 h-5" />,
    title: 'Tap the world',
    desc: 'Tap anywhere to create a ripple. Tilt your phone to move the camera.',
  },
  {
    icon: <Images className="w-5 h-5" />,
    title: 'Swipe the details',
    desc: 'Tap a project or photo to open it, then swipe left/right to flip through.',
  },
  {
    icon: <SlidersHorizontal className="w-5 h-5" />,
    title: 'Adjust background',
    desc: 'Tap the sliders icon in the top bar to dim the background (default 75%).',
  },
  {
    icon: <Moon className="w-5 h-5" />,
    title: 'Night mode',
    desc: 'Tap the moon/sun to switch between the space world and a deeper night mode.',
  },
];

export const OnboardingGuide: React.FC = () => {
  const [visible, setVisible] = useState(false);
  const [step, setStep] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    try {
      if (localStorage.getItem(STORAGE_KEY)) return;
    } catch { /* ignore */ }
    setIsMobile(window.matchMedia('(pointer: coarse)').matches || window.innerWidth < 768);
    setVisible(true);
  }, []);

  const finish = () => {
    try {
      localStorage.setItem(STORAGE_KEY, '1');
    } catch { /* ignore */ }
    setVisible(false);
  };

  if (!visible) return null;

  const steps = isMobile ? MOBILE_STEPS : PC_STEPS;
  const s = steps[step];

  return (
    <div className="fixed inset-0 z-[90] flex items-end sm:items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-md rounded-3xl border border-border-crisp glass-card shadow-2xl p-6 modal-enter">
        <div className="flex items-center justify-between mb-5">
          <span className="font-mono text-[11px] font-bold uppercase tracking-widest text-primary">
            {step + 1} / {steps.length} · How to use
          </span>
          <button
            onClick={finish}
            aria-label="Skip"
            className="w-8 h-8 rounded-full bg-surface-warm hover:bg-surface-container text-ink-muted flex items-center justify-center cursor-pointer border-none"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div key={step} className="flex flex-col items-center text-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-primary/15 text-primary flex items-center justify-center mb-4">
            {s.icon}
          </div>
          <h3 className="font-display text-xl font-black uppercase text-ink mb-2">{s.title}</h3>
          <p className="font-body text-sm text-ink-muted leading-relaxed">{s.desc}</p>
        </div>

        <div className="flex items-center justify-between">
          <button
            onClick={finish}
            className="px-4 py-2.5 rounded-xl bg-transparent text-ink-muted font-mono text-xs font-bold uppercase tracking-wider hover:text-ink cursor-pointer border-none"
          >
            Skip
          </button>
          <div className="flex gap-1.5">
            {steps.map((_, i) => (
              <span
                key={i}
                className={`w-2 h-2 rounded-full transition-colors ${i === step ? 'bg-primary' : 'bg-surface-container-high'}`}
              />
            ))}
          </div>
          <button
            onClick={() => (step >= steps.length - 1 ? finish() : setStep(step + 1))}
            className="px-5 py-2.5 rounded-xl bg-primary text-white font-mono text-xs font-bold uppercase tracking-wider hover:bg-ink transition-colors cursor-pointer border-none"
          >
            {step >= steps.length - 1 ? 'Start' : 'Next'}
          </button>
        </div>
      </div>
    </div>
  );
};

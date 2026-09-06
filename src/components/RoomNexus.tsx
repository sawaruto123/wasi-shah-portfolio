import React from 'react';
import { Box, ArrowUpRight } from 'lucide-react';
import { useContent } from '../lib/content';

interface RoomNexusProps {
  onNavigate: (roomId: string) => void;
}

export const RoomNexus: React.FC<RoomNexusProps> = ({ onNavigate }) => {
  const { settings } = useContent();
  const { hero, stats } = settings;
  return (
    <section
      id="room-nexus"
      className="room-anchor min-h-full flex flex-col justify-center px-5 sm:px-8 lg:px-12 max-w-[1720px] mx-auto pt-24 pb-24 md:pb-16 relative"
    >
      {/* 漂浮幾何生物 */}
      <span className="float-shape text-5xl" style={{ left: '10%', top: '20%', animationDelay: '0s' }}>◇</span>
      <span className="float-shape text-4xl" style={{ right: '14%', top: '28%', animationDelay: '1.3s' }}>○</span>
      <span className="float-shape text-3xl" style={{ left: '20%', bottom: '22%', animationDelay: '2.2s' }}>△</span>
      <span className="float-shape text-4xl" style={{ right: '22%', bottom: '26%', animationDelay: '0.6s' }}>✦</span>
      <span className="float-shape text-3xl" style={{ left: '46%', top: '12%', animationDelay: '1.8s' }}>⬡</span>

      {/* 日光大氣光暈 */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(circle at 50% 38%, rgba(108, 200, 255, 0.30) 0%, rgba(108, 200, 255, 0) 55%)' }}
      />

      {/* 主內容（無大卡片，漂浮在世界裡） */}
      <div className="relative z-10 flex flex-col items-center text-center">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/70 border border-border-crisp font-mono text-[11px] font-bold text-ink mb-8">
          <span className="w-2 h-2 rounded-full bg-accent-orange" />
          01 · WORLD
        </div>

        <h1 className="font-display text-5xl sm:text-8xl xl:text-[7.5rem] font-bold uppercase tracking-tight leading-[1.02] mb-5 text-ink">
          {hero.title}
        </h1>
        <p className="font-chinese text-3xl sm:text-5xl text-primary font-bold mb-6">{hero.chinese}</p>

        <p className="font-body text-lg sm:text-2xl text-ink-muted font-medium mb-8 max-w-xl leading-snug">
          {hero.subtitle}
        </p>

        {/* 漂浮技能 chips */}
        <div className="flex flex-wrap justify-center gap-3 mb-10">
          {['Film', 'Motion', 'Design', '3D', 'AI'].map((chip, i) => (
            <button
              key={chip}
              onClick={() => onNavigate(chip === 'Film' ? 'room-cinema' : 'room-gallery')}
              className="float-chip px-4 py-2 rounded-full bg-white/80 border border-border-crisp font-mono text-xs font-bold text-ink shadow-sm hover:border-primary hover:text-primary hover:shadow-[0_0_18px_rgba(108,200,255,0.45)] transition-all cursor-pointer"
              style={{ animationDelay: `${i * 0.3}s` }}
            >
              {chip}
            </button>
          ))}
        </div>

        <button
          onClick={() => onNavigate('room-studio')}
          className="group inline-flex items-center gap-2 px-8 py-4 rounded-full bg-ink text-white font-mono text-sm font-bold uppercase tracking-widest shadow-[0_10px_34px_rgba(17,38,63,0.35)] hover:bg-primary transition-colors cursor-pointer border-none"
        >
          <Box className="w-4 h-4" />
          <span>Enter World</span>
          <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </button>
      </div>

      {/* 漂浮 World Data（無卡片） */}
      <div className="hidden lg:block absolute right-10 top-1/2 -translate-y-1/2 z-10 font-mono text-right float-slow">
        <div className="flex items-center justify-end gap-2 mb-3">
          <span className="w-2 h-2 rounded-full bg-accent-orange animate-pulse" />
          <span className="text-[10px] uppercase tracking-widest text-ink-muted font-bold">World Data</span>
        </div>
        <div className="space-y-2 text-xs">
          <div className="flex justify-end gap-5"><span className="text-ink-muted">Projects</span><span className="text-ink font-bold">{stats.projects}</span></div>
          <div className="flex justify-end gap-5"><span className="text-ink-muted">Films</span><span className="text-ink font-bold">{stats.films}</span></div>
          <div className="flex justify-end gap-5"><span className="text-ink-muted">Tools</span><span className="text-ink font-bold">{stats.tools}</span></div>
          <div className="flex justify-end gap-5"><span className="text-ink-muted">Location</span><span className="text-ink font-bold">{stats.location}</span></div>
        </div>
      </div>
    </section>
  );
};

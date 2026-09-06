import React from 'react';
import { ArrowRight } from 'lucide-react';
import { useContent } from '../lib/content';
import { Room } from '../types';

interface NavigationHUDProps {
  currentRoom: Room;
  zCoord: string;
  onNavigate: (roomId: string) => void;
}

export const NavigationHUD: React.FC<NavigationHUDProps> = ({
  currentRoom,
  zCoord,
  onNavigate,
}) => {
  const { settings } = useContent();
  return (
    <header className="fixed top-3 inset-x-0 z-50 px-3 sm:px-6 lg:px-10 max-w-[1780px] mx-auto">
      <div className="h-16 rounded-2xl glass-card border border-black/10 shadow-[0_4px_30px_rgba(0,0,0,0.05)] px-4 sm:px-6 flex items-center justify-between gap-4">
        {/* Brand Wordmark & Monogram */}
        <button
          onClick={() => onNavigate('room-nexus')}
          className="flex items-center gap-3 shrink-0 group text-left cursor-pointer bg-transparent border-none p-0"
        >
          <div className="w-9 h-9 rounded-xl bg-ink text-white flex items-center justify-center font-mono font-bold text-xs tracking-wider group-hover:bg-primary transition-colors">
            WS
          </div>
          <div className="flex items-baseline gap-1.5 font-display text-sm md:text-base font-black tracking-tight text-ink">
            <span className="group-hover:text-primary transition-colors">{settings.profile.name}</span>
            <span className="text-ink-muted font-mono text-xs">/</span>
            <span className="font-chinese text-ink font-bold text-xs tracking-widest">{settings.profile.name_cn}</span>
          </div>
        </button>

        {/* 當前房間指示 */}
        <div className="hidden lg:flex items-center gap-3 px-4 py-1.5 rounded-full bg-surface-warm/80 border border-black/5 font-mono text-[11px]">
          <span className="w-2 h-2 rounded-full bg-accent-lime" />
          <span className="text-ink-muted">ROOM:</span>
          <span className="text-primary font-bold tracking-wider">{currentRoom.name}</span>
          <span className="text-black/20">|</span>
          <span className="text-ink font-semibold">{zCoord}</span>
        </div>

        {/* Quick Navigation Links */}
        <nav className="hidden md:flex items-center gap-1 font-mono text-xs font-semibold uppercase text-ink-muted">
          <button
            onClick={() => onNavigate('room-nexus')}
            className={`px-3 py-1.5 rounded-xl transition-colors cursor-pointer ${
              currentRoom.id === 'room-nexus'
                ? 'text-primary bg-primary/10 font-bold'
                : 'hover:text-ink hover:bg-black/5'
            }`}
          >
            World
          </button>
          <button
            onClick={() => onNavigate('room-studio')}
            className={`px-3 py-1.5 rounded-xl transition-colors cursor-pointer ${
              currentRoom.id === 'room-studio'
                ? 'text-primary bg-primary/10 font-bold'
                : 'hover:text-ink hover:bg-black/5'
            }`}
          >
            Lab
          </button>
          <button
            onClick={() => onNavigate('room-gallery')}
            className={`px-3 py-1.5 rounded-xl transition-colors cursor-pointer ${
              currentRoom.id === 'room-gallery'
                ? 'text-primary bg-primary/10 font-bold'
                : 'hover:text-ink hover:bg-black/5'
            }`}
          >
            Archive
          </button>
          <button
            onClick={() => onNavigate('room-cinema')}
            className={`px-3 py-1.5 rounded-xl transition-colors cursor-pointer ${
              currentRoom.id === 'room-cinema'
                ? 'text-primary bg-primary/10 font-bold'
                : 'hover:text-ink hover:bg-black/5'
            }`}
          >
            Films
          </button>
          <button
            onClick={() => onNavigate('room-dispatch')}
            className={`px-3 py-1.5 rounded-xl transition-colors cursor-pointer ${
              currentRoom.id === 'room-dispatch'
                ? 'text-primary bg-primary/10 font-bold'
                : 'hover:text-ink hover:bg-black/5'
            }`}
          >
            Connect
          </button>
        </nav>

        {/* Action Button */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => onNavigate('room-dispatch')}
            className="group inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-white font-mono text-xs font-bold uppercase tracking-wider shadow-[0_4px_16px_rgba(0,71,255,0.3)] hover:bg-ink hover:shadow-none hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer border-none"
          >
            <span>Connect</span>
            <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
          </button>
        </div>
      </div>
    </header>
  );
};

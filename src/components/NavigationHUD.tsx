import React from 'react';
import { ArrowUpRight } from 'lucide-react';
import { useContent } from '../lib/content';
import { ThemeToggle } from '../lib/theme';
import { BgOpacityControl } from '../lib/bgOpacity';
import { thumbUrl } from '../lib/image';
import { SmartImage } from './SmartImage';
import { ROOMS } from '../data';
import { Room } from '../types';

interface NavigationHUDProps {
  currentRoom: Room;
  zRef: React.RefObject<HTMLSpanElement | null>;
  onNavigate: (roomId: string) => void;
}

export const NavigationHUD: React.FC<NavigationHUDProps> = ({ currentRoom, zRef, onNavigate }) => {
  const { settings } = useContent();
  return (
    <header className="site-header">
      <div className="site-header-inner">
        <button onClick={() => onNavigate('room-nexus')} data-tour="brand" className="site-brand" aria-label="Go to World">
          <span className="relative w-9 h-9 rounded-lg overflow-hidden bg-ink text-surface-pure flex items-center justify-center font-mono font-bold text-xs shrink-0">
            {settings.profile.logo_image ? <SmartImage src={thumbUrl(settings.profile.logo_image, 72)} alt="" className="relative w-full h-full" /> : settings.profile.logo_text}
          </span>
          <span className="hidden lg:inline font-display font-semibold text-sm tracking-tight">{settings.profile.name}</span>
          <span className="font-chinese text-sm text-ink-muted">{settings.profile.name_cn}</span>
        </button>
        <nav data-tour="hud-nav" aria-label="Main navigation" className="desktop-nav">
          {ROOMS.map((room) => (
            <button key={room.id} onClick={() => onNavigate(room.id)} aria-current={currentRoom.id === room.id ? 'page' : undefined}>
              {room.label}
            </button>
          ))}
        </nav>
        <div className="flex items-center gap-2 shrink-0">
          <span ref={zRef} className="hidden 2xl:inline font-mono text-[10px] text-ink-muted mr-3" aria-hidden="true">Z: +8.00m</span>
          <div data-tour="bg" className="flex"><BgOpacityControl /></div>
          <div data-tour="theme" className="flex"><ThemeToggle /></div>
          <button onClick={() => onNavigate('room-dispatch')} data-tour="connect" className="header-connect">
            Connect <ArrowUpRight size={14} aria-hidden="true" />
          </button>
        </div>
      </div>
    </header>
  );
};

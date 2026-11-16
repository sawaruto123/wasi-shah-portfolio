import React from 'react';
import { ArrowUpRight, ArrowRight } from 'lucide-react';
import { useContent } from '../lib/content';
import { RoomHeading } from './RoomHeading';

interface RoomNexusProps {
  onNavigate: (roomId: string) => void;
}

export const RoomNexus: React.FC<RoomNexusProps> = ({ onNavigate }) => {
  const { settings } = useContent();
  const { hero, stats } = settings;
  return (
    <section id="room-nexus" className="room-anchor hero-room">
      <div className="hero-copy">
        <RoomHeading number="01" label="World / Portfolio" />
        <div className="flex items-center gap-4 mb-5">
          <span className="h-px w-8 bg-primary" aria-hidden="true" />
          <p className="font-chinese text-xl sm:text-3xl text-primary font-medium">{hero.chinese}</p>
        </div>
        <h1 className="hero-title">{hero.title}</h1>
        <p className="hero-subtitle">{hero.subtitle}</p>
        <div className="hero-disciplines" aria-label="Explore disciplines">
          {['Film', 'Motion', 'Design', '3D', 'AI'].map((chip) => (
            <button key={chip} onClick={() => onNavigate(chip === 'Film' ? 'room-cinema' : 'room-gallery')}>
              {chip}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-3 mt-8 sm:mt-10">
          <button onClick={() => onNavigate('room-gallery')} className="button-primary">
            Explore the work <ArrowUpRight size={16} aria-hidden="true" />
          </button>
          <button onClick={() => onNavigate('room-studio')} className="button-secondary">
            About me <ArrowRight size={16} aria-hidden="true" />
          </button>
        </div>
      </div>
      <dl className="hero-stats">
        {[
          ['Projects', stats.projects], ['Films', stats.films],
          ['Tools', stats.tools], ['Based in', stats.location],
        ].map(([label, value]) => (
          <div key={label}>
            <dt>{label}</dt>
            <dd>{value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
};

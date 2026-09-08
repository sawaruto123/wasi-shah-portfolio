import React from 'react';
import { Play } from 'lucide-react';
import { useContent } from '../lib/content';
import { thumbUrl } from '../lib/image';
import { FilmRecord, StillCapture } from '../types';

interface RoomCinemaProps {
  onSelectFilm: (film: FilmRecord) => void;
  onSelectStill: (still: StillCapture) => void;
}

export const RoomCinema: React.FC<RoomCinemaProps> = ({ onSelectFilm, onSelectStill }) => {
  const { films, stills, engagements } = useContent();
  const dailyStills = stills.filter((s) => s.category !== 'event');
  const eventStills = stills.filter((s) => s.category === 'event');

  const renderStill = (still: StillCapture) => (
    <button
      key={still.id}
      onClick={() => onSelectStill(still)}
      className="group relative aspect-square rounded-2xl overflow-hidden cursor-pointer border-none p-0"
    >
      <img
        src={thumbUrl(still.image, 500, 500)}
        alt={still.title}
        referrerPolicy="no-referrer"
        loading="lazy"
        decoding="async"
        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      {still.beforeImage && (
        <span className="absolute top-2 right-2 px-2 py-1 rounded-full bg-primary text-white font-mono text-[9px] font-bold uppercase pointer-events-none">
          B/A
        </span>
      )}
      <span className="absolute bottom-2 inset-x-2 text-white font-mono text-[10px] opacity-0 group-hover:opacity-100 transition-opacity">
        {still.title}
      </span>
    </button>
  );

  return (
    <section
      id="room-cinema"
      className="room-anchor min-h-[120vh] flex flex-col justify-start px-5 sm:px-8 lg:px-12 max-w-[1720px] mx-auto pt-24 pb-28 md:pb-20"
    >
      <div className="flex items-center gap-3 mb-8">
        <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/70 border border-border-crisp font-mono text-[11px] font-bold text-ink">
          <span className="w-2 h-2 rounded-full bg-accent-pink" />
          04 · FILMS
        </span>
        <div className="h-px flex-1 bg-border-crisp" />
      </div>

      <h2 className="font-display text-4xl sm:text-6xl font-black uppercase text-ink tracking-tight mb-10">
        Films
      </h2>

      {/* 短片（大卡） */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-12">
        {films.map((film) => (
          <div
            key={film.id}
            onClick={() => onSelectFilm(film)}
            className="group relative rounded-3xl overflow-hidden spatial-card cursor-pointer"
          >
            <div className="relative w-full aspect-[16/9] overflow-hidden">
              <img
                src={thumbUrl(film.image, 900, 506)}
                alt={film.title}
                referrerPolicy="no-referrer"
                loading="lazy"
                decoding="async"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#11263F]/80 via-transparent to-transparent" />
              <div className="absolute top-4 left-4">
                <span className="px-3 py-1 rounded-full bg-white/90 text-ink font-mono text-xs font-bold uppercase">
                  {film.duration}
                </span>
              </div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-14 h-14 rounded-full bg-white/90 text-primary flex items-center justify-center shadow-xl group-hover:scale-110 group-hover:bg-primary group-hover:text-white transition-all">
                  <Play className="w-7 h-7 fill-current ml-0.5" />
                </div>
              </div>
              <div className="absolute bottom-4 inset-x-4 flex items-end justify-between gap-3">
                <h3 className="font-display text-2xl font-black uppercase text-white">{film.title}</h3>
                <span className="font-mono text-xs text-white/80">{film.releaseYear}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 商業合作（簡潔列表，無卡片） */}
      <div className="mb-12">
        <h3 className="font-display text-xl font-bold uppercase text-ink mb-4">Commercial</h3>
        <div className="flex flex-col font-mono">
          {engagements.map((comm) => (
            <div
              key={comm.id}
              className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-6 py-3 border-b border-border-crisp"
            >
              <span className="text-[10px] uppercase tracking-wider text-ink-muted w-48 shrink-0">
                {comm.category}
              </span>
              <span className="font-display text-lg font-bold text-ink">{comm.client}</span>
              <span className="text-xs text-ink-muted sm:ml-auto sm:text-right">{comm.description}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 日常隨拍（Daily） */}
      <div className="mb-12">
        <h3 className="font-display text-xl font-bold uppercase text-ink mb-1">Daily</h3>
        <p className="font-mono text-[11px] text-ink-muted mb-4">Random shots from everyday life.</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {dailyStills.map(renderStill)}
        </div>
        {dailyStills.length === 0 && (
          <p className="font-mono text-xs text-ink-muted">No daily photos yet.</p>
        )}
      </div>

      {/* 活動攝影（Event） */}
      <div>
        <h3 className="font-display text-xl font-bold uppercase text-ink mb-1">Event</h3>
        <p className="font-mono text-[11px] text-ink-muted mb-4">Event photography work.</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {eventStills.map(renderStill)}
        </div>
        {eventStills.length === 0 && (
          <p className="font-mono text-xs text-ink-muted">No event photos yet.</p>
        )}
      </div>
    </section>
  );
};

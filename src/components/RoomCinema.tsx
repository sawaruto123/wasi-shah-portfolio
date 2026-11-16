import { RoomHeading } from './RoomHeading';
import React from 'react';
import { Play } from 'lucide-react';
import { useContent } from '../lib/content';
import { thumbUrl } from '../lib/image';
import { SmartImage } from './SmartImage';
import { FilmRecord, StillCapture } from '../types';

interface RoomCinemaProps {
  onSelectFilm: (film: FilmRecord) => void;
  onSelectStill: (still: StillCapture) => void;
}

export const RoomCinema: React.FC<RoomCinemaProps> = ({ onSelectFilm, onSelectStill }) => {
  const { films, stills, engagements, photoEvents } = useContent();
  const dailyStills = stills.filter((s) => s.category !== 'event');
  const eventStills = stills.filter((s) => s.category === 'event');
  const unassignedEventStills = eventStills.filter((s) => !s.eventId);

  const renderStill = (still: StillCapture) => (
    <button
      key={still.id}
      onClick={() => onSelectStill(still)}
      aria-label={still.title || "View photograph"}
      className="photo-card group relative aspect-square rounded-2xl overflow-hidden cursor-pointer border-none p-0 cv-auto"
    >
      <SmartImage
        src={thumbUrl(still.image, 480, 480)}
        alt={still.title || 'Photo'}
        className="absolute inset-0"
        imgClassName="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-300" />
      {still.beforeImage && (
        <span className="absolute top-2 right-2 px-2 py-1 rounded-full bg-primary text-white font-mono text-[9px] font-bold uppercase pointer-events-none">
          B/A
        </span>
      )}
      {still.title && (
        <span className="absolute bottom-2 inset-x-2 text-white font-body text-xs opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
          {still.title}
        </span>
      )}
    </button>
  );

  return (
    <section
      id="room-cinema"
      className="room-anchor"
    >
      <RoomHeading number="04" label="Films" title="Film & photography." description="Stories in motion, commercial work and moments in between." />

      {/* 短片（大卡） */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-16">
        {films.map((film) => (
          <button
            type="button"
            aria-label={`Watch ${film.title}`}
            key={film.id}
            onClick={() => onSelectFilm(film)}
            className="media-card group"
          >
            <div className="relative w-full aspect-[16/9] overflow-hidden cv-auto">
              <SmartImage
                src={thumbUrl(film.image, 720, 405)}
                alt={film.title}
                className="absolute inset-0"
                imgClassName="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#11263F]/80 via-transparent to-transparent" />
              <div className="absolute top-4 left-4">
                <span className="media-label">
                  {film.duration}
                </span>
              </div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="film-play">
                  <Play className="w-7 h-7 fill-current ml-0.5" />
                </div>
              </div>
            </div>
            <div className="card-caption">
              <h3>{film.title}</h3>
              <span className="font-mono text-xs text-ink-muted shrink-0">{film.releaseYear}</span>
            </div>
          </button>
        ))}
      </div>

      {/* 商業合作（簡潔列表，無卡片） */}
      <div className="cinema-section mb-16">
        <h3 className="font-display text-2xl font-semibold tracking-tight text-ink mb-4">Commercial</h3>
        <div className="flex flex-col font-mono">
          {engagements.map((comm) => (
            <div
              key={comm.id}
              className="grid grid-cols-1 md:grid-cols-[160px_1fr_1.2fr] gap-2 md:gap-6 py-5 border-b border-border-crisp"
            >
              <span className="text-[10px] uppercase tracking-wider text-ink-muted">
                {comm.category}
              </span>
              <span className="font-display text-lg font-bold text-ink">{comm.client}</span>
              <span className="text-sm font-body leading-relaxed text-ink-muted md:text-right">{comm.description}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 日常隨拍（Daily） */}
      <div className="cinema-section mb-16">
        <h3 className="font-display text-2xl font-semibold tracking-tight text-ink mb-1">Daily</h3>
        <p className="font-mono text-[11px] text-ink-muted mb-4">Random shots from everyday life.</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-6 gap-3 sm:gap-4">
          {dailyStills.map(renderStill)}
        </div>
        {dailyStills.length === 0 && (
          <p className="font-mono text-xs text-ink-muted">No daily photos yet.</p>
        )}
      </div>

      {/* 活動攝影（Event）— 依活動分組 */}
      <div>
        <h3 className="font-display text-2xl font-semibold tracking-tight text-ink mb-1">Event</h3>
        <p className="font-mono text-[11px] text-ink-muted mb-6">Event photography work.</p>

        {photoEvents.map((ev) => {
          const images = eventStills.filter((s) => s.eventId === ev.id);
          if (images.length === 0) return null;
          return (
            <div key={ev.id} className="mb-10">
              <div className="flex items-baseline gap-3 mb-1">
                <h4 className="font-display text-lg font-semibold text-ink">{ev.title}</h4>
                <span className="font-mono text-[10px] text-ink-muted">{images.length} photo{images.length === 1 ? '' : 's'}</span>
              </div>
              {ev.description && (
                <p className="font-body text-sm text-ink-muted mb-4">{ev.description}</p>
              )}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-6 gap-3 sm:gap-4">
                {images.map(renderStill)}
              </div>
            </div>
          );
        })}

        {unassignedEventStills.length > 0 && (
          <div className="mb-10">
            <h4 className="font-display text-lg font-semibold text-ink mb-4">Other</h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-6 gap-3 sm:gap-4">
              {unassignedEventStills.map(renderStill)}
            </div>
          </div>
        )}

        {eventStills.length === 0 && (
          <p className="font-mono text-xs text-ink-muted">No event photos yet.</p>
        )}
      </div>
    </section>
  );
};

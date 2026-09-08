import React, { useEffect, useRef, useState } from 'react';
import { X, Play, ChevronLeft, ChevronRight } from 'lucide-react';
import { Project, FilmRecord, StillCapture } from '../types';
import { BeforeAfter } from './BeforeAfter';
import { thumbUrl } from '../lib/image';

interface ModalsProps {
  activeProject: Project | null;
  activeFilm: FilmRecord | null;
  activeStill: StillCapture | null;
  projects: Project[];
  films: FilmRecord[];
  stills: StillCapture[];
  onSelectProject: (p: Project) => void;
  onSelectFilm: (f: FilmRecord) => void;
  onSelectStill: (s: StillCapture) => void;
  onClose: () => void;
  onShowToast: (msg: string) => void;
}

export const Modals: React.FC<ModalsProps> = ({
  activeProject,
  activeFilm,
  activeStill,
  projects,
  films,
  stills,
  onSelectProject,
  onSelectFilm,
  onSelectStill,
  onClose,
  onShowToast,
}) => {
  const [dir, setDir] = useState(0);
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);

  // 目前開啟的列表與索引（關閉時為空，安全）
  const list = activeProject ? projects : activeFilm ? films : activeStill ? stills : [];
  const currentId = activeProject?.id ?? activeFilm?.id ?? activeStill?.id;
  const idx = list.findIndex((item) => item.id === currentId);
  const hasPrev = idx > 0;
  const hasNext = idx >= 0 && idx < list.length - 1;
  const slideClass = dir === 1 ? 'modal-slide-right' : dir === -1 ? 'modal-slide-left' : '';

  const goPrev = () => {
    if (!hasPrev) return;
    setDir(-1);
    if (activeProject) onSelectProject(projects[idx - 1]);
    else if (activeFilm) onSelectFilm(films[idx - 1]);
    else if (activeStill) onSelectStill(stills[idx - 1]);
  };
  const goNext = () => {
    if (!hasNext) return;
    setDir(1);
    if (activeProject) onSelectProject(projects[idx + 1]);
    else if (activeFilm) onSelectFilm(films[idx + 1]);
    else if (activeStill) onSelectStill(stills[idx + 1]);
  };

  // 手機左右滑動切換
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) touchStartRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  };
  const handleTouchEnd = (e: React.TouchEvent) => {
    const start = touchStartRef.current;
    touchStartRef.current = null;
    if (!start) return;
    const dx = e.changedTouches[0].clientX - start.x;
    const dy = e.changedTouches[0].clientY - start.y;
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) {
      if (dx < 0) goNext();
      else goPrev();
    }
  };

  // 鍵盤左右切換、Esc 關閉（hook 必須在任何條件回傳之前）
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') goPrev();
      else if (e.key === 'ArrowRight') goNext();
      else if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  if (!activeProject && !activeFilm && !activeStill) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fade-in"
      onClick={onClose}
    >
      <div
        className="modal-enter relative w-full max-w-4xl bg-surface-pure rounded-3xl border border-border-crisp overflow-hidden spatial-card max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 w-10 h-10 rounded-full bg-black/60 text-white hover:bg-ink flex items-center justify-center transition-colors cursor-pointer border-none shadow-md"
          title="Close Modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Prev / Next 切換 */}
        {hasPrev && (
          <button
            onClick={goPrev}
            aria-label="Previous"
            className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-black/60 text-white hover:bg-primary flex items-center justify-center cursor-pointer border-none shadow-md transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
        )}
        {hasNext && (
          <button
            onClick={goNext}
            aria-label="Next"
            className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-black/60 text-white hover:bg-primary flex items-center justify-center cursor-pointer border-none shadow-md transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        )}
        {idx >= 0 && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 px-3 py-1 rounded-full bg-black/60 text-white font-mono text-[11px] font-bold pointer-events-none">
            {idx + 1} / {list.length}
          </div>
        )}

        {/* Project Inspection Modal */}
        {activeProject && (
          <div key={currentId} className={`overflow-y-auto ${slideClass}`}>
            <div className="relative w-full h-80 sm:h-96 bg-black">
              <img
                src={thumbUrl(activeProject.image, 1600, 1000)}
                alt={activeProject.title}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
              <div className="absolute top-4 left-4 flex gap-2">
                <span className="px-3 py-1 rounded-full bg-white/95 backdrop-blur-md text-primary font-mono text-xs font-bold uppercase border border-black/10">
                  {activeProject.categoryBadge}
                </span>
                {activeProject.extraBadge && (
                  <span className="px-3 py-1 rounded-full bg-accent-lime text-ink font-mono text-xs font-bold uppercase">
                    {activeProject.extraBadge}
                  </span>
                )}
              </div>
            </div>

            <div className="p-8">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-display text-3xl font-black uppercase text-ink">
                  {activeProject.title}
                </h3>
                <span className="font-mono text-xs text-primary font-bold px-3 py-1 bg-primary/10 rounded-full">
                  #{activeProject.expNumber}
                </span>
              </div>

              <p className="font-body text-base text-ink leading-relaxed mb-4">
                {activeProject.description}
              </p>

              {activeProject.detailedDescription && (
                <div className="p-5 rounded-2xl bg-surface-warm border border-black/5 mb-6">
                  <span className="font-mono text-xs uppercase text-primary font-bold block mb-2">
                    Details
                  </span>
                  <p className="font-body text-sm text-ink-muted leading-relaxed">
                    {activeProject.detailedDescription}
                  </p>
                </div>
              )}

              <div className="flex flex-wrap items-center gap-2 font-mono text-xs pt-4 border-t border-border-crisp">
                {activeProject.tech.map((t) => (
                  <span key={t} className="bg-surface-container text-ink px-3 py-1 rounded-lg">
                    {t}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Film Player Modal */}
        {activeFilm && (
          <div key={currentId} className={`overflow-y-auto ${slideClass}`}>
            <div className="relative w-full aspect-[16/9] bg-black flex items-center justify-center">
              <img
                src={thumbUrl(activeFilm.image, 1600, 900)}
                alt={activeFilm.title}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover opacity-85"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40" />

              <div className="absolute top-4 left-4 flex gap-2">
                <span className="px-3 py-1 rounded-full bg-white/90 backdrop-blur-md text-ink font-mono text-xs font-bold uppercase">
                  {activeFilm.duration}
                </span>
                <span className="px-3 py-1 rounded-full bg-primary text-white font-mono text-xs font-bold uppercase">
                  {activeFilm.badge}
                </span>
              </div>

              {/* Play Icon */}
              <div className="absolute flex items-center justify-center">
                <div className="w-16 h-16 rounded-full bg-primary text-white flex items-center justify-center shadow-2xl">
                  <Play className="w-8 h-8 fill-current ml-1" />
                </div>
              </div>
            </div>

            <div className="p-8">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-display text-3xl font-black uppercase text-ink">
                  {activeFilm.title}
                </h3>
                <span className="font-mono text-xs bg-accent-lime text-ink font-bold px-3 py-1 rounded-full">
                  {activeFilm.releaseYear}
                </span>
              </div>
              <p className="font-body text-base text-ink-muted leading-relaxed mb-6">
                {activeFilm.description}
              </p>

              <div className="flex items-center justify-between gap-4 pt-4 border-t border-border-crisp font-mono text-xs">
                <span className="text-ink font-bold">{activeFilm.creditsRole}</span>
                <span className="text-ink-muted">{activeFilm.format}</span>
              </div>
            </div>
          </div>
        )}

        {/* Still Photo Lightbox */}
        {activeStill && (
          <div key={currentId} className={`overflow-y-auto ${slideClass}`}>
            <div className="relative w-full max-h-[65vh] bg-black flex items-center justify-center">
              {activeStill.beforeImage ? (
                <BeforeAfter
                  before={thumbUrl(activeStill.beforeImage, 1400, 1050)}
                  after={thumbUrl(activeStill.image, 1400, 1050)}
                  alt={activeStill.title}
                  className="w-full max-h-[65vh] aspect-[4/3]"
                />
              ) : (
                <img
                  src={thumbUrl(activeStill.image, 1600)}
                  alt={activeStill.title}
                  referrerPolicy="no-referrer"
                  className="max-h-[65vh] w-auto object-contain"
                />
              )}
            </div>
            <div className="p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h3 className="font-display text-2xl font-bold uppercase text-ink mb-1">
                  {activeStill.title || 'Photography'}
                </h3>
                <p className="font-mono text-xs text-ink-muted">
                  {activeStill.beforeImage ? 'Drag to compare before / after · ' : ''}Location: Hong Kong SAR
                </p>
              </div>
              <span className="font-mono text-xs bg-accent-lime text-ink font-bold px-3 py-1.5 rounded-xl">
                {activeStill.focalLength}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

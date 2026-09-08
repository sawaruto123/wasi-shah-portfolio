import React, { useEffect, useRef, useState } from 'react';
import { X, Play, ChevronLeft, ChevronRight, Github, ExternalLink } from 'lucide-react';
import { Project, FilmRecord, StillCapture } from '../types';
import { BeforeAfter } from './BeforeAfter';
import { thumbUrl } from '../lib/image';
import { SmartImage } from './SmartImage';

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
  const [imgIdx, setImgIdx] = useState(0);
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);

  // 目前開啟的列表與索引（關閉時為空，安全）
  const list = activeProject ? projects : activeFilm ? films : activeStill ? stills : [];
  const currentId = activeProject?.id ?? activeFilm?.id ?? activeStill?.id;
  const idx = list.findIndex((item) => item.id === currentId);
  const hasPrev = idx > 0;
  const hasNext = idx >= 0 && idx < list.length - 1;
  const slideClass = dir === 1 ? 'modal-slide-right' : dir === -1 ? 'modal-slide-left' : '';
  const projImages = activeProject
    ? activeProject.images && activeProject.images.length
      ? activeProject.images
      : [activeProject.image]
    : [];

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

  // 切換專案/照片時重設圖片索引
  useEffect(() => {
    setImgIdx(0);
  }, [currentId]);

  // modal 開啟時鎖定背景捲動，避免背後的網站被捲走
  useEffect(() => {
    if (activeProject || activeFilm || activeStill) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = prev;
      };
    }
  }, [activeProject, activeFilm, activeStill]);

  if (!activeProject && !activeFilm && !activeStill) return null;

  // 專案：全螢幕檢視（所有圖片 + 資訊一次顯示）
  if (activeProject) {
    return (
      <div className="fixed inset-0 z-50 overflow-y-auto overscroll-contain bg-surface-pure animate-fade-in">
        <div
          key={currentId}
          className="min-h-full flex flex-col animate-fade-in"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          {/* 頂部列 */}
          <div className="sticky top-0 z-20 flex items-center justify-between gap-3 px-4 sm:px-8 py-3 bg-surface-pure/85 backdrop-blur-xl border-b border-white/10">
            <div className="flex items-center gap-3 min-w-0">
              <span className="font-mono text-xs text-primary font-bold px-3 py-1 bg-primary/10 rounded-full shrink-0">
                #{activeProject.expNumber}
              </span>
              <h3 className="font-display text-xl sm:text-2xl font-black uppercase text-ink truncate">
                {activeProject.title}
              </h3>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {hasPrev && (
                <button
                  onClick={goPrev}
                  aria-label="Previous project"
                  className="w-10 h-10 rounded-full bg-white/10 text-ink hover:bg-primary hover:text-white flex items-center justify-center cursor-pointer border-none transition-colors"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
              )}
              {hasNext && (
                <button
                  onClick={goNext}
                  aria-label="Next project"
                  className="w-10 h-10 rounded-full bg-white/10 text-ink hover:bg-primary hover:text-white flex items-center justify-center cursor-pointer border-none transition-colors"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              )}
              <button
                onClick={onClose}
                aria-label="Close"
                className="w-10 h-10 rounded-full bg-white/10 text-ink hover:bg-primary hover:text-white flex items-center justify-center cursor-pointer border-none transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* 內容 */}
          <div className="flex-1 px-4 sm:px-8 lg:px-12 py-8 max-w-[1720px] w-full mx-auto">
            <div className="flex flex-wrap items-center gap-2 mb-6">
              <span className="px-3 py-1 rounded-full bg-white/70 border border-border-crisp font-mono text-xs font-bold uppercase text-primary">
                {activeProject.categoryBadge}
              </span>
              {activeProject.extraBadge && (
                <span className="px-3 py-1 rounded-full bg-accent-lime text-ink font-mono text-xs font-bold uppercase">
                  {activeProject.extraBadge}
                </span>
              )}
              {activeProject.tag && (
                <span className="font-mono text-xs text-ink-muted">{activeProject.tag}</span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-start">
              {projImages.map((img, i) => (
                <SmartImage
                  key={i}
                  src={thumbUrl(img, 1200)}
                  alt={activeProject.title}
                  ratio={activeProject.imageRatios?.[i] ?? 'auto'}
                  position={activeProject.imagePositions?.[i] ?? 'center'}
                  className={`relative w-full rounded-2xl border border-border-crisp shadow-lg ${projImages.length === 1 ? 'sm:col-span-2 sm:max-w-4xl' : ''}`}
                />
              ))}
            </div>

            <div className="mt-10 max-w-4xl pb-24">
              <h3 className="font-display text-3xl sm:text-4xl font-black uppercase text-ink mb-4">
                {activeProject.title}
              </h3>
              <p className="font-body text-base sm:text-lg text-ink-muted leading-relaxed mb-8 whitespace-pre-line">
                {activeProject.description}
              </p>

              {activeProject.detailedDescription && (
                <div className="p-6 rounded-2xl bg-surface-warm border border-border-crisp mb-8">
                  <span className="font-mono text-xs uppercase tracking-widest text-primary font-bold block mb-2">Details</span>
                  <p className="font-body text-sm text-ink-muted leading-relaxed whitespace-pre-line">{activeProject.detailedDescription}</p>
                </div>
              )}

              {activeProject.tech.length > 0 && (
                <div className="mb-8">
                  <span className="font-mono text-xs uppercase tracking-widest text-primary font-bold block mb-3">Tech stack</span>
                  <div className="flex flex-wrap gap-2">
                    {activeProject.tech.map((t) => (
                      <span key={t} className="bg-surface-container text-ink px-3.5 py-1.5 rounded-lg font-mono text-xs">{t}</span>
                    ))}
                  </div>
                </div>
              )}

              {(activeProject.githubUrl || activeProject.websiteUrl) && (
                <div className="flex flex-wrap gap-3 pt-6 border-t border-border-crisp">
                  {activeProject.websiteUrl && (
                    <a
                      href={activeProject.websiteUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-primary text-white font-mono text-xs font-bold uppercase tracking-wider hover:opacity-90 transition-opacity no-underline"
                    >
                      <ExternalLink className="w-4 h-4" /> Visit site
                    </a>
                  )}
                  {activeProject.githubUrl && (
                    <a
                      href={activeProject.githubUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-surface-container text-ink font-mono text-xs font-bold uppercase tracking-wider hover:bg-surface-container-high transition-colors no-underline"
                    >
                      <Github className="w-4 h-4" /> GitHub
                    </a>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

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
                src={thumbUrl(projImages[imgIdx] ?? activeProject.image, 1600, 1000)}
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
              {projImages.length > 1 && (
                <>
                  <button
                    onClick={() => setImgIdx((i) => (i - 1 + projImages.length) % projImages.length)}
                    aria-label="Previous image"
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/50 text-white flex items-center justify-center cursor-pointer border-none hover:bg-black/70 transition-colors"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setImgIdx((i) => (i + 1) % projImages.length)}
                    aria-label="Next image"
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/50 text-white flex items-center justify-center cursor-pointer border-none hover:bg-black/70 transition-colors"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                  <div className="absolute bottom-3 inset-x-0 flex justify-center gap-1.5">
                    {projImages.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setImgIdx(i)}
                        aria-label={`Image ${i + 1}`}
                        className={`w-2 h-2 rounded-full cursor-pointer border-none transition-colors ${i === imgIdx ? 'bg-white' : 'bg-white/40'}`}
                      />
                    ))}
                  </div>
                </>
              )}
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

              {(activeProject.githubUrl || activeProject.websiteUrl) && (
                <div className="flex flex-wrap gap-3 pt-4">
                  {activeProject.websiteUrl && (
                    <a
                      href={activeProject.websiteUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-white font-mono text-xs font-bold uppercase tracking-wider hover:opacity-90 transition-opacity no-underline"
                    >
                      Visit site <ChevronRight className="w-3.5 h-3.5" />
                    </a>
                  )}
                  {activeProject.githubUrl && (
                    <a
                      href={activeProject.githubUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-surface-container text-ink font-mono text-xs font-bold uppercase tracking-wider hover:bg-surface-container-high transition-colors no-underline"
                    >
                      GitHub <ChevronRight className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>
              )}
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

import React from 'react';
import { X, Play } from 'lucide-react';
import { Project, FilmRecord, StillCapture } from '../types';

interface ModalsProps {
  activeProject: Project | null;
  activeFilm: FilmRecord | null;
  activeStill: StillCapture | null;
  onClose: () => void;
  onShowToast: (msg: string) => void;
}

export const Modals: React.FC<ModalsProps> = ({
  activeProject,
  activeFilm,
  activeStill,
  onClose,
  onShowToast,
}) => {
  if (!activeProject && !activeFilm && !activeStill) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fade-in"
      onClick={onClose}
    >
      <div
        className="modal-enter relative w-full max-w-4xl bg-surface-pure rounded-3xl border border-border-crisp overflow-hidden spatial-card max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 w-10 h-10 rounded-full bg-black/60 text-white hover:bg-ink flex items-center justify-center transition-colors cursor-pointer border-none shadow-md"
          title="Close Modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Project Inspection Modal */}
        {activeProject && (
          <div className="overflow-y-auto">
            <div className="relative w-full h-80 sm:h-96 bg-black">
              <img
                src={activeProject.image}
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
          <div className="overflow-y-auto">
            <div className="relative w-full aspect-[16/9] bg-black flex items-center justify-center">
              <img
                src={activeFilm.image}
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
          <div className="overflow-y-auto">
            <div className="relative w-full max-h-[65vh] bg-black flex items-center justify-center">
              <img
                src={activeStill.image}
                alt={activeStill.title}
                referrerPolicy="no-referrer"
                className="max-h-[65vh] w-auto object-contain"
              />
            </div>
            <div className="p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h3 className="font-display text-2xl font-bold uppercase text-ink mb-1">
                  {activeStill.title}
                </h3>
                <p className="font-mono text-xs text-ink-muted">
                  Location: Hong Kong SAR
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

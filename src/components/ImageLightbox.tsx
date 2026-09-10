import React, { useEffect } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { thumbUrl } from '../lib/image';

interface ImageLightboxProps {
  images: string[];
  captions?: string[];
  index: number;
  onIndex: (i: number) => void;
  onClose: () => void;
  alt?: string;
}

/** Full-screen image viewer: near-full-bleed image, arrows, keyboard + overlaid caption. */
export const ImageLightbox: React.FC<ImageLightboxProps> = ({
  images,
  captions,
  index,
  onIndex,
  onClose,
  alt = '',
}) => {
  const n = images.length;
  const prev = () => onIndex((index - 1 + n) % n);
  const next = () => onIndex((index + 1) % n);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      else if (e.key === 'ArrowLeft') prev();
      else if (e.key === 'ArrowRight') next();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  return (
    <div
      className="fixed inset-0 z-[120] backdrop-blur-xl animate-fade-in"
      style={{
        background:
          'radial-gradient(ellipse 120% 80% at 50% -10%, rgba(19,42,71,0.94) 0%, rgba(13,27,46,0.95) 55%, rgba(5,10,20,0.97) 100%)',
      }}
      onClick={onClose}
    >
      {/* image fills the whole screen (tiny padding only) */}
      <div className="absolute inset-0 flex items-center justify-center p-1.5 sm:p-3">
        <img
          key={index}
          src={thumbUrl(images[index], 2400)}
          alt={alt}
          referrerPolicy="no-referrer"
          className="max-h-full max-w-full object-contain rounded-lg shadow-[0_20px_60px_rgba(0,0,0,0.6)]"
        />
      </div>

      <button
        onClick={onClose}
        aria-label="Close"
        className="absolute top-3 right-3 z-20 w-10 h-10 rounded-full bg-black/60 text-white hover:bg-white/25 flex items-center justify-center cursor-pointer border-none transition-colors"
      >
        <X className="w-5 h-5" />
      </button>

      {n > 1 && (
        <>
          <button
            onClick={(e) => {
              e.stopPropagation();
              prev();
            }}
            aria-label="Previous image"
            className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-black/60 text-white hover:bg-white/25 flex items-center justify-center cursor-pointer border-none transition-colors"
          >
            <ChevronLeft className="w-7 h-7" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              next();
            }}
            aria-label="Next image"
            className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-black/60 text-white hover:bg-white/25 flex items-center justify-center cursor-pointer border-none transition-colors"
          >
            <ChevronRight className="w-7 h-7" />
          </button>
        </>
      )}

      {/* overlaid caption so it never steals image space */}
      <div
        className="absolute bottom-3 inset-x-0 z-20 flex flex-col items-center gap-1.5 px-4 pointer-events-none"
        onClick={(e) => e.stopPropagation()}
      >
        {captions?.[index] && (
          <span className="px-3.5 py-1.5 rounded-full bg-black/70 backdrop-blur-sm font-mono text-xs text-white/90 text-center max-w-[92vw]">
            {captions[index]}
          </span>
        )}
        <span className="font-mono text-[10px] text-white/50">
          {index + 1} / {n}
        </span>
      </div>
    </div>
  );
};

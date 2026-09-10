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

/** Full-screen image viewer with prev/next, keyboard + caption. */
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
      className="fixed inset-0 z-[120] bg-black/95 backdrop-blur-sm flex flex-col animate-fade-in"
      onClick={onClose}
    >
      <button
        onClick={onClose}
        aria-label="Close"
        className="absolute top-4 right-4 z-20 w-10 h-10 rounded-full bg-white/10 text-white hover:bg-white/25 flex items-center justify-center cursor-pointer border-none transition-colors"
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
            className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-white/10 text-white hover:bg-white/25 flex items-center justify-center cursor-pointer border-none transition-colors"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              next();
            }}
            aria-label="Next image"
            className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-white/10 text-white hover:bg-white/25 flex items-center justify-center cursor-pointer border-none transition-colors"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </>
      )}

      <div
        className="flex-1 min-h-0 flex items-center justify-center p-4 sm:p-12"
        onClick={(e) => e.stopPropagation()}
      >
        <img
          key={index}
          src={thumbUrl(images[index], 1800)}
          alt={alt}
          referrerPolicy="no-referrer"
          className="max-h-full max-w-full object-contain rounded-xl animate-fade-in"
        />
      </div>

      <div className="shrink-0 px-6 pb-6 text-center" onClick={(e) => e.stopPropagation()}>
        {captions?.[index] && (
          <p className="font-mono text-xs text-white/85">{captions[index]}</p>
        )}
        <p className="font-mono text-[10px] text-white/40 mt-1">
          {index + 1} / {n}
        </p>
      </div>
    </div>
  );
};

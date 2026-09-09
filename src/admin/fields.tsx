import React, { useRef, useState } from 'react';
import { uploadImage, uploadVideo } from './helpers';
import { RATIO_CLASS, POS_CLASS } from '../lib/aspect';
import { getVideoEmbed } from '../lib/video';

export const inputCls =
  'w-full px-3 py-2 rounded-lg border border-border-crisp bg-white text-sm text-ink focus:outline-none focus:ring-2 focus:ring-primary/40';

export const Field: React.FC<{ label: string; children: React.ReactNode; className?: string }> = ({
  label,
  children,
  className,
}) => (
  <label className={`block ${className ?? ''}`}>
    <span className="block text-[11px] font-bold uppercase tracking-wider text-ink-muted mb-1.5">
      {label}
    </span>
    {children}
  </label>
);

export const TextInput = (props: React.InputHTMLAttributes<HTMLInputElement>) => (
  <input {...props} className={`${inputCls} ${props.className ?? ''}`} />
);

export const TextArea = (props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) => (
  <textarea {...props} className={`${inputCls} resize-none ${props.className ?? ''}`} />
);

export const Toggle: React.FC<{ checked: boolean; onChange: (v: boolean) => void }> = ({
  checked,
  onChange,
}) => (
  <button
    type="button"
    onClick={() => onChange(!checked)}
    className={`w-11 h-6 rounded-full transition-colors relative ${
      checked ? 'bg-primary' : 'bg-surface-container-high'
    }`}
    title={checked ? 'Published' : 'Draft'}
  >
    <span
      className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all ${
        checked ? 'left-[22px]' : 'left-0.5'
      }`}
    />
  </button>
);

export const ImageField: React.FC<{ value: string; onChange: (url: string) => void }> = ({
  value,
  onChange,
}) => {
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError(null);
    try {
      const url = await uploadImage(file);
      onChange(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <div className="flex gap-2">
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="/images/… or https://…"
          className={inputCls}
        />
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="px-3 py-2 rounded-lg border border-border-crisp bg-surface-warm text-xs font-bold uppercase whitespace-nowrap text-ink hover:bg-surface-container"
        >
          {uploading ? 'Uploading…' : 'Upload'}
        </button>
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
      </div>
      {value && (
        <img
          src={value}
          alt="preview"
          referrerPolicy="no-referrer"
          className="mt-2 h-20 w-32 object-cover rounded-lg border border-border-crisp"
        />
      )}
      {error && <p className="text-red-600 text-xs mt-1">{error}</p>}
    </div>
  );
};

export interface ManagedImage {
  url: string;
  ratio: string;
  pos: string;
}

const IMAGE_RATIOS = [
  { value: 'auto', label: 'Auto' },
  { value: '16:9', label: '16:9' },
  { value: '4:3', label: '4:3' },
  { value: '1:1', label: '1:1' },
  { value: '3:4', label: '3:4' },
  { value: '9:16', label: '9:16' },
];

const POSITIONS = [
  { value: 'top-left', label: 'Top left' },
  { value: 'top', label: 'Top' },
  { value: 'top-right', label: 'Top right' },
  { value: 'left', label: 'Left' },
  { value: 'center', label: 'Center' },
  { value: 'right', label: 'Right' },
  { value: 'bottom-left', label: 'Bottom left' },
  { value: 'bottom', label: 'Bottom' },
  { value: 'bottom-right', label: 'Bottom right' },
];

export const MultiImageField: React.FC<{ value: ManagedImage[]; onChange: (v: ManagedImage[]) => void }> = ({
  value,
  onChange,
}) => {
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFiles = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    setUploading(true);
    setError(null);
    try {
      const added: ManagedImage[] = [];
      for (const file of files) {
        const url = await uploadImage(file);
        added.push({ url, ratio: 'auto', pos: 'center' });
      }
      onChange([...value, ...added]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const remove = (index: number) => {
    onChange(value.filter((_, i) => i !== index));
  };

  const setRatio = (index: number, ratio: string) => {
    onChange(value.map((img, i) => (i === index ? { ...img, ratio } : img)));
  };

  const setPos = (index: number, pos: string) => {
    onChange(value.map((img, i) => (i === index ? { ...img, pos } : img)));
  };

  return (
    <div>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {value.map((img, i) => (
          <div
            key={`${img.url}-${i}`}
            className="rounded-lg border border-border-crisp overflow-hidden bg-white"
          >
            <div className={`relative ${RATIO_CLASS[img.ratio] ?? 'aspect-video'}`}>
              <img
                src={img.url}
                alt=""
                referrerPolicy="no-referrer"
                className={`w-full h-full object-cover ${POS_CLASS[img.pos] ?? 'object-center'}`}
              />
              {/* 3×3 裁切焦點選擇 */}
              <div className="absolute inset-0 grid grid-cols-3 grid-rows-3">
                {POSITIONS.map((p) => (
                  <button
                    key={p.value}
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setPos(i, p.value);
                    }}
                    title={p.label}
                    className="flex items-center justify-center cursor-pointer border-none bg-transparent p-0"
                  >
                    <span
                      className={`w-2.5 h-2.5 rounded-full border transition-all ${
                        img.pos === p.value
                          ? 'bg-primary border-primary scale-125'
                          : 'bg-white/70 border-white/40'
                      }`}
                    />
                  </button>
                ))}
              </div>
              <button
                type="button"
                onClick={() => remove(i)}
                title="Remove"
                className="absolute top-1 right-1 z-10 w-5 h-5 rounded-full bg-black/70 text-white text-xs leading-none flex items-center justify-center cursor-pointer border-none"
              >
                ✕
              </button>
            </div>
            <div className="p-2">
              <select
                value={img.ratio}
                onChange={(e) => setRatio(i, e.target.value)}
                className="w-full px-2 py-1 rounded-md border border-border-crisp bg-white text-xs text-ink"
              >
                {IMAGE_RATIOS.map((r) => (
                  <option key={r.value} value={r.value}>
                    {r.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        ))}
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="aspect-video rounded-lg border-2 border-dashed border-border-crisp flex flex-col items-center justify-center gap-1 text-ink-muted hover:bg-surface-warm transition-colors cursor-pointer bg-transparent"
        >
          <span className="text-xl leading-none">+</span>
          <span className="text-[9px] font-bold uppercase">
            {uploading ? 'Uploading…' : 'Upload'}
          </span>
        </button>
      </div>
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={handleFiles}
      />
      {error && <p className="text-red-600 text-xs mt-1">{error}</p>}
    </div>
  );
};

export const VideoField: React.FC<{ value: string; onChange: (url: string) => void }> = ({
  value,
  onChange,
}) => {
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError(null);
    try {
      const url = await uploadVideo(file);
      onChange(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  return (
    <div>
      <div className="flex gap-2">
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="https://… or upload a video"
          className={inputCls}
        />
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="px-3 py-2 rounded-lg border border-border-crisp bg-surface-warm text-xs font-bold uppercase whitespace-nowrap text-ink hover:bg-surface-container"
        >
          {uploading ? 'Uploading…' : 'Upload'}
        </button>
        <input ref={fileRef} type="file" accept="video/*" className="hidden" onChange={handleFile} />
      </div>
      {value && (() => {
        const embed = getVideoEmbed(value);
        if (!embed) return null;
        return (
          <div className="mt-2 max-w-md">
            {embed.type === 'youtube' || embed.type === 'vimeo' ? (
              <iframe
                src={embed.src}
                className="w-full aspect-video rounded-lg border border-border-crisp"
                allow="autoplay; fullscreen"
                allowFullScreen
                title="video preview"
              />
            ) : (
              <video src={embed.src} controls preload="metadata" className="w-full rounded-lg border border-border-crisp" />
            )}
          </div>
        );
      })()}
      {error && <p className="text-red-600 text-xs mt-1">{error}</p>}
    </div>
  );
};

export const Modal: React.FC<{ title: string; onClose: () => void; children: React.ReactNode }> = ({
  title,
  onClose,
  children,
}) => (
  <div
    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
    onClick={onClose}
  >
    <div
      className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white rounded-2xl shadow-xl"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="sticky top-0 z-10 bg-white border-b border-border-crisp px-6 py-4 flex items-center justify-between">
        <h3 className="font-display text-lg font-black uppercase text-ink">{title}</h3>
        <button
          onClick={onClose}
          className="w-8 h-8 rounded-full bg-surface-warm hover:bg-surface-container text-ink text-sm font-bold"
        >
          ✕
        </button>
      </div>
      <div className="p-6">{children}</div>
    </div>
  </div>
);

export const Button: React.FC<
  React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'ghost' | 'danger' }
> = ({ variant = 'primary', className = '', ...props }) => {
  const styles =
    variant === 'primary'
      ? 'bg-ink text-white hover:bg-primary'
      : variant === 'danger'
        ? 'bg-red-50 text-red-600 border border-red-200 hover:bg-red-100'
        : 'bg-surface-warm text-ink border border-border-crisp hover:bg-surface-container';
  return (
    <button
      {...props}
      className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider disabled:opacity-40 disabled:cursor-not-allowed ${styles} ${className}`}
    />
  );
};

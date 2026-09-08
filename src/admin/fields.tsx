import React, { useRef, useState } from 'react';
import { uploadImage } from './helpers';

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

export const MultiImageField: React.FC<{ value: string[]; onChange: (urls: string[]) => void }> = ({
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
      const urls: string[] = [];
      for (const file of files) {
        const url = await uploadImage(file);
        urls.push(url);
      }
      onChange([...value, ...urls]);
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

  return (
    <div>
      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
        {value.map((url, i) => (
          <div
            key={`${url}-${i}`}
            className="relative rounded-lg overflow-hidden border border-border-crisp aspect-square"
          >
            <img
              src={url}
              alt=""
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />
            <button
              type="button"
              onClick={() => remove(i)}
              title="Remove"
              className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/70 text-white text-xs leading-none flex items-center justify-center cursor-pointer border-none"
            >
              ✕
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="aspect-square rounded-lg border-2 border-dashed border-border-crisp flex flex-col items-center justify-center gap-1 text-ink-muted hover:bg-surface-warm transition-colors cursor-pointer bg-transparent"
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

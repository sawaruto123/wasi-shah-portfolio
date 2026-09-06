import React, { useCallback, useEffect, useRef, useState } from 'react';
import { uploadBlob } from './helpers';
import { inputCls, Button, Modal } from './fields';

interface CropImageFieldProps {
  value: string;
  onChange: (url: string) => void;
  outputSize?: number;
}

/** Image input with upload + manual square crop. */
export const CropImageField: React.FC<CropImageFieldProps> = ({ value, onChange, outputSize = 512 }) => {
  const fileRef = useRef<HTMLInputElement>(null);
  const [src, setSrc] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setSrc(reader.result as string);
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleComplete = useCallback(
    async (blob: Blob) => {
      setUploading(true);
      setError(null);
      try {
        const url = await uploadBlob(blob, 'png');
        onChange(url);
        setSrc(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Upload failed');
      } finally {
        setUploading(false);
      }
    },
    [onChange]
  );

  return (
    <div>
      <div className="flex gap-2">
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Image URL or upload"
          className={inputCls}
        />
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="px-3 py-2 rounded-lg border border-border-crisp bg-surface-warm text-xs font-bold uppercase whitespace-nowrap text-ink hover:bg-surface-container"
        >
          {uploading ? 'Uploading…' : 'Upload & crop'}
        </button>
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
      </div>
      {value && (
        <img
          src={value}
          alt="preview"
          referrerPolicy="no-referrer"
          className="mt-2 h-12 w-12 object-cover rounded-lg border border-border-crisp bg-surface-container"
        />
      )}
      {error && <p className="text-red-600 text-xs mt-1">{error}</p>}
      {src && (
        <CropperModal
          src={src}
          outputSize={outputSize}
          onCancel={() => setSrc(null)}
          onComplete={handleComplete}
        />
      )}
    </div>
  );
};

function CropperModal({
  src,
  outputSize,
  onCancel,
  onComplete,
}: {
  src: string;
  outputSize: number;
  onCancel: () => void;
  onComplete: (blob: Blob) => void;
}) {
  const imgRef = useRef<HTMLImageElement>(null);
  const [natural, setNatural] = useState<{ w: number; h: number } | null>(null);
  const [disp, setDisp] = useState<{ w: number; h: number }>({ w: 0, h: 0 });
  const [sizeFrac, setSizeFrac] = useState(0.7);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const dragRef = useRef<{ sx: number; sy: number; px: number; py: number } | null>(null);
  const [busy, setBusy] = useState(false);

  const cropPx = Math.floor(Math.min(disp.w, disp.h) * sizeFrac);

  const measure = useCallback(() => {
    const img = imgRef.current;
    if (!img) return;
    setDisp({ w: img.clientWidth, h: img.clientHeight });
  }, []);

  const onLoad = () => {
    const img = imgRef.current;
    if (img) setNatural({ w: img.naturalWidth, h: img.naturalHeight });
    requestAnimationFrame(measure);
  };

  useEffect(() => {
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, [measure]);

  // Clamp position whenever crop size or display size changes
  useEffect(() => {
    if (!disp.w || !disp.h) return;
    const maxX = disp.w - cropPx;
    const maxY = disp.h - cropPx;
    setPos((p) => ({
      x: Math.max(0, Math.min(maxX, p.x)),
      y: Math.max(0, Math.min(maxY, p.y)),
    }));
  }, [cropPx, disp.w, disp.h]);

  const startDrag = (e: React.PointerEvent) => {
    dragRef.current = { sx: e.clientX, sy: e.clientY, px: pos.x, py: pos.y };
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };
  const onDrag = (e: React.PointerEvent) => {
    const d = dragRef.current;
    if (!d) return;
    const maxX = disp.w - cropPx;
    const maxY = disp.h - cropPx;
    setPos({
      x: Math.max(0, Math.min(maxX, d.px + (e.clientX - d.sx))),
      y: Math.max(0, Math.min(maxY, d.py + (e.clientY - d.sy))),
    });
  };
  const endDrag = () => {
    dragRef.current = null;
  };

  const apply = async () => {
    const img = imgRef.current;
    if (!img || !natural || !disp.w) return;
    setBusy(true);
    try {
      const scale = natural.w / disp.w;
      const canvas = document.createElement('canvas');
      canvas.width = outputSize;
      canvas.height = outputSize;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      ctx.drawImage(
        img,
        pos.x * scale,
        pos.y * scale,
        cropPx * scale,
        cropPx * scale,
        0,
        0,
        outputSize,
        outputSize
      );
      const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/png'));
      if (blob) onComplete(blob);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal title="Crop image (drag the box, zoom to resize)" onClose={onCancel}>
      <div className="flex flex-col items-center gap-4">
        <div className="relative inline-block align-top leading-[0]" style={{ maxWidth: '100%' }}>
          <img
            ref={imgRef}
            src={src}
            onLoad={onLoad}
            alt="crop preview"
            className="block max-w-[78vw] max-h-[50vh] select-none"
            draggable={false}
          />
          {disp.w > 0 && (
            <div
              className="absolute border-2 border-white cursor-move touch-none"
              style={{
                left: pos.x,
                top: pos.y,
                width: cropPx,
                height: cropPx,
                boxShadow: '0 0 0 9999px rgba(0,0,0,0.55)',
              }}
              onPointerDown={startDrag}
              onPointerMove={onDrag}
              onPointerUp={endDrag}
            />
          )}
        </div>

        <div className="w-full max-w-sm flex items-center gap-3">
          <span className="font-mono text-[10px] uppercase text-ink-muted whitespace-nowrap">Zoom</span>
          <input
            type="range"
            min={0.2}
            max={1}
            step={0.01}
            value={sizeFrac}
            onChange={(e) => setSizeFrac(Number(e.target.value))}
            className="flex-1"
          />
          <span className="font-mono text-[10px] text-ink-muted whitespace-nowrap">
            {Math.round(sizeFrac * 100)}%
          </span>
        </div>

        <div className="flex gap-2 w-full justify-end">
          <Button variant="ghost" onClick={onCancel}>
            Cancel
          </Button>
          <Button onClick={apply} disabled={busy}>
            {busy ? 'Saving…' : 'Crop & save'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

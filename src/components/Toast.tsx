import React from 'react';
import { CheckCircle, X } from 'lucide-react';

interface ToastProps {
  message: string | null;
  onClose: () => void;
}

export const Toast: React.FC<ToastProps> = ({ message, onClose }) => {
  if (!message) return null;

  return (
    <div className="fixed bottom-14 right-6 z-50 flex items-center gap-3 px-5 py-3 rounded-2xl bg-ink text-white font-mono text-xs shadow-2xl border border-white/10 animate-slide-up">
      <CheckCircle className="w-4 h-4 text-accent-lime shrink-0" />
      <span className="font-medium">{message}</span>
      <button
        onClick={onClose}
        className="ml-2 text-white/50 hover:text-white cursor-pointer bg-transparent border-none p-0"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};

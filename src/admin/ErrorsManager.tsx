import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useCollection } from './useCollection';
import { Button } from './fields';

export const ErrorsManager: React.FC = () => {
  const { rows, reload, loading, error } = useCollection<any>('client_errors', 'created_at');
  const [open, setOpen] = useState<number | null>(null);

  const clearAll = async () => {
    if (!supabase || !confirm('Delete all logged errors?')) return;
    await supabase.from('client_errors').delete().neq('id', 0);
    reload();
  };
  const remove = async (id: number) => {
    if (!supabase) return;
    await supabase.from('client_errors').delete().eq('id', id);
    reload();
  };

  const list = [...rows].reverse(); // newest first

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <p className="font-mono text-xs text-ink-muted">
          {rows.length} logged error{rows.length === 1 ? '' : 's'}
        </p>
        {rows.length > 0 && (
          <Button variant="danger" onClick={clearAll}>
            Clear all
          </Button>
        )}
      </div>

      {error && <p className="text-red-600 text-sm mb-3">{error}</p>}
      {loading && <p className="text-ink-muted text-sm">Loading…</p>}

      <div className="space-y-2">
        {list.map((row) => (
          <div key={row.id} className="bg-white rounded-xl border border-border-crisp p-3">
            <div className="flex items-start gap-3">
              <div className="flex-1 min-w-0">
                <div className="font-mono text-xs text-ink break-words">{row.message}</div>
                <div className="font-mono text-[10px] text-ink-muted truncate mt-1">
                  {row.created_at ? new Date(row.created_at).toLocaleString() : ''} · {row.url}
                </div>
              </div>
              <button
                onClick={() => setOpen(open === row.id ? null : row.id)}
                className="font-mono text-[10px] uppercase text-primary hover:underline cursor-pointer border-none bg-transparent shrink-0"
              >
                {open === row.id ? 'Hide' : 'Stack'}
              </button>
              <Button variant="danger" onClick={() => remove(row.id)}>
                Del
              </Button>
            </div>
            {open === row.id && (
              <pre className="mt-2 p-2 rounded-lg bg-surface-warm text-[10px] text-ink-muted overflow-auto max-h-64 whitespace-pre-wrap">
                {row.stack || '(no stack)'}
                {'\n\nUA: '}
                {row.user_agent}
              </pre>
            )}
          </div>
        ))}
        {rows.length === 0 && !loading && (
          <div className="p-8 text-center text-ink-muted text-sm border border-dashed border-border-crisp rounded-xl">
            No errors logged. 🎉
          </div>
        )}
      </div>
    </div>
  );
};

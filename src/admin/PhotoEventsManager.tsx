import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useCollection } from './useCollection';
import { Field, TextInput, TextArea, Modal, Button } from './fields';

const newId = () => `evt-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;

const empty = { id: '', title: '', description: '', sort_order: 0 };

export const PhotoEventsManager: React.FC = () => {
  const { rows, reload, loading, error } = useCollection<any>('photo_events');
  const [editing, setEditing] = useState<any | null>(null);
  const [saving, setSaving] = useState(false);

  const openNew = () => setEditing({ ...empty, sort_order: rows.length });
  const openEdit = (row: any) => setEditing({ ...row });

  const save = async () => {
    if (!editing || !supabase) return;
    setSaving(true);
    const row = { ...editing, id: editing.id || newId(), description: editing.description || '' };
    const { error: err } = await supabase.from('photo_events').upsert(row);
    if (err) alert(err.message);
    else {
      setEditing(null);
      reload();
    }
    setSaving(false);
  };

  const remove = async (id: string) => {
    if (!supabase) return;
    if (!confirm('Delete this event? Photos under it will become unassigned (they stay in the gallery).')) return;
    await supabase.from('photo_events').delete().eq('id', id);
    reload();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <p className="font-mono text-xs text-ink-muted">
          {rows.length} event{rows.length === 1 ? '' : 's'}
        </p>
        <Button onClick={openNew}>+ New event</Button>
      </div>

      {error && <p className="text-red-600 text-sm mb-3">{error}</p>}
      {loading && <p className="text-ink-muted text-sm">Loading…</p>}

      <div className="space-y-2">
        {rows.map((row) => (
          <div
            key={row.id}
            className="flex items-center gap-3 bg-white rounded-xl border border-border-crisp p-3"
          >
            <div className="flex-1 min-w-0">
              <div className="font-bold text-sm text-ink">{row.title}</div>
              <div className="font-mono text-[11px] text-ink-muted truncate">{row.description}</div>
            </div>
            <Button variant="ghost" onClick={() => openEdit(row)}>
              Edit
            </Button>
            <Button variant="danger" onClick={() => remove(row.id)}>
              Del
            </Button>
          </div>
        ))}
        {rows.length === 0 && !loading && (
          <div className="p-8 text-center text-ink-muted text-sm border border-dashed border-border-crisp rounded-xl">
            No events yet. Create one, then assign photos to it from the Stills tab.
          </div>
        )}
      </div>

      {editing && (
        <Modal title={editing.id ? 'Edit event' : 'New event'} onClose={() => setEditing(null)}>
          <div className="space-y-4">
            <Field label="Event title">
              <TextInput
                value={editing.title}
                onChange={(e) => setEditing({ ...editing, title: e.target.value })}
                placeholder="e.g. HKMU Orientation 2025"
              />
            </Field>
            <Field label="Short description">
              <TextArea
                value={editing.description}
                onChange={(e) => setEditing({ ...editing, description: e.target.value })}
                rows={3}
                placeholder="One or two sentences about the event."
              />
            </Field>
            <Field label="Sort order">
              <TextInput
                type="number"
                value={editing.sort_order}
                onChange={(e) => setEditing({ ...editing, sort_order: Number(e.target.value) })}
                className="w-24"
              />
            </Field>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="ghost" onClick={() => setEditing(null)}>
                Cancel
              </Button>
              <Button onClick={save} disabled={saving}>
                {saving ? 'Saving…' : 'Save'}
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

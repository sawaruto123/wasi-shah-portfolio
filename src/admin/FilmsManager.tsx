import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useCollection } from './useCollection';
import { Field, TextInput, TextArea, Toggle, ImageField, Modal, Button } from './fields';
import { slugify } from './helpers';

const empty = {
  id: '',
  title: '',
  release_year: '',
  duration: '',
  badge: '',
  image: '',
  description: '',
  credits_role: '',
  format: '',
  published: true,
  sort_order: 0,
};

export const FilmsManager: React.FC = () => {
  const { rows, reload, loading, error } = useCollection<any>('films');
  const [editing, setEditing] = useState<any | null>(null);
  const [saving, setSaving] = useState(false);

  const openNew = () => setEditing({ ...empty, sort_order: rows.length });
  const openEdit = (row: any) => setEditing({ ...row });

  const save = async () => {
    if (!editing || !supabase) return;
    setSaving(true);
    const row = { ...editing, id: editing.id || slugify(editing.title || 'film') };
    const { error: err } = await supabase.from('films').upsert(row);
    if (err) alert(err.message);
    else {
      setEditing(null);
      reload();
    }
    setSaving(false);
  };

  const remove = async (id: string) => {
    if (!supabase || !confirm('Delete this film?')) return;
    await supabase.from('films').delete().eq('id', id);
    reload();
  };

  const togglePublish = async (row: any) => {
    if (!supabase) return;
    await supabase.from('films').update({ published: !row.published }).eq('id', row.id);
    reload();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <p className="font-mono text-xs text-ink-muted">
          {rows.length} film{rows.length === 1 ? '' : 's'}
        </p>
        <Button onClick={openNew}>+ New film</Button>
      </div>

      {error && <p className="text-red-600 text-sm mb-3">{error}</p>}
      {loading && <p className="text-ink-muted text-sm">Loading…</p>}

      <div className="bg-white rounded-2xl border border-border-crisp overflow-hidden">
        {rows.map((row) => (
          <div key={row.id} className="flex items-center gap-3 px-4 py-3 border-b border-border-crisp last:border-0">
            <img
              src={row.image}
              alt={row.title}
              referrerPolicy="no-referrer"
              className="w-16 h-10 object-cover rounded-lg bg-surface-container"
            />
            <div className="flex-1 min-w-0">
              <div className="font-bold text-sm text-ink truncate">{row.title}</div>
              <div className="font-mono text-[10px] uppercase tracking-wider text-ink-muted truncate">
                {row.duration} · {row.release_year}
              </div>
            </div>
            <Toggle checked={row.published} onChange={() => togglePublish(row)} />
            <Button variant="ghost" onClick={() => openEdit(row)}>
              Edit
            </Button>
            <Button variant="danger" onClick={() => remove(row.id)}>
              Del
            </Button>
          </div>
        ))}
        {rows.length === 0 && !loading && (
          <div className="p-8 text-center text-ink-muted text-sm">No films yet.</div>
        )}
      </div>

      {editing && (
        <Modal title={editing.id ? 'Edit film' : 'New film'} onClose={() => setEditing(null)}>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Field label="Title">
                <TextInput
                  value={editing.title}
                  onChange={(e) => setEditing({ ...editing, title: e.target.value })}
                />
              </Field>
              <Field label="Release year">
                <TextInput
                  value={editing.release_year}
                  onChange={(e) => setEditing({ ...editing, release_year: e.target.value })}
                />
              </Field>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Duration">
                <TextInput
                  value={editing.duration}
                  onChange={(e) => setEditing({ ...editing, duration: e.target.value })}
                />
              </Field>
              <Field label="Badge">
                <TextInput
                  value={editing.badge}
                  onChange={(e) => setEditing({ ...editing, badge: e.target.value })}
                />
              </Field>
            </div>
            <Field label="Image">
              <ImageField value={editing.image} onChange={(url) => setEditing({ ...editing, image: url })} />
            </Field>
            <Field label="Description">
              <TextArea
                rows={3}
                value={editing.description}
                onChange={(e) => setEditing({ ...editing, description: e.target.value })}
              />
            </Field>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Credits role">
                <TextInput
                  value={editing.credits_role}
                  onChange={(e) => setEditing({ ...editing, credits_role: e.target.value })}
                />
              </Field>
              <Field label="Format">
                <TextInput
                  value={editing.format}
                  onChange={(e) => setEditing({ ...editing, format: e.target.value })}
                />
              </Field>
            </div>
            <div className="flex items-center justify-between gap-4">
              <Field label="Sort order">
                <TextInput
                  type="number"
                  value={editing.sort_order}
                  onChange={(e) => setEditing({ ...editing, sort_order: Number(e.target.value) })}
                  className="w-24"
                />
              </Field>
              <div className="flex items-center gap-2 pt-4">
                <span className="text-xs text-ink-muted font-bold uppercase">Published</span>
                <Toggle checked={editing.published} onChange={(v) => setEditing({ ...editing, published: v })} />
              </div>
            </div>
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

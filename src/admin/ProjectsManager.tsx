import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useCollection } from './useCollection';
import { Field, TextInput, TextArea, Toggle, ImageField, Modal, Button } from './fields';
import { slugify } from './helpers';

const CATEGORIES = ['ai', 'code', 'fintech'];

const empty = {
  id: '',
  exp_number: '',
  title: '',
  category: 'code',
  category_badge: '',
  tag: '',
  extra_badge: '',
  image: '',
  images: [] as string[],
  github_url: '',
  website_url: '',
  col_span: '4',
  description: '',
  detailed_description: '',
  tech: [] as string[],
  published: true,
  sort_order: 0,
};

export const ProjectsManager: React.FC = () => {
  const { rows, reload, loading, error } = useCollection<any>('projects');
  const [editing, setEditing] = useState<any | null>(null);
  const [techText, setTechText] = useState('');
  const [imagesText, setImagesText] = useState('');
  const [saving, setSaving] = useState(false);

  const openNew = () => {
    setEditing({ ...empty, sort_order: rows.length });
    setTechText('');
    setImagesText('');
  };
  const openEdit = (row: any) => {
    setEditing({ ...row });
    setTechText((row.tech ?? []).join(', '));
    setImagesText((row.images ?? []).filter((u: string) => u && u !== row.image).join('\n'));
  };

  const save = async () => {
    if (!editing || !supabase) return;
    setSaving(true);
    const tech = techText.split(',').map((s) => s.trim()).filter(Boolean);
    const additionalImages = imagesText.split('\n').map((s) => s.trim()).filter(Boolean);
    const row = {
      ...editing,
      id: editing.id || slugify(editing.title || 'project'),
      exp_number: editing.exp_number || String(rows.length + 1).padStart(2, '0'),
      tech,
      images: [editing.image, ...additionalImages].filter(Boolean),
      github_url: editing.github_url || null,
      website_url: editing.website_url || null,
    };
    const { error: err } = await supabase.from('projects').upsert(row);
    if (err) {
      alert(err.message);
    } else {
      setEditing(null);
      reload();
    }
    setSaving(false);
  };

  const remove = async (id: string) => {
    if (!supabase || !confirm('Delete this project?')) return;
    await supabase.from('projects').delete().eq('id', id);
    reload();
  };

  const togglePublish = async (row: any) => {
    if (!supabase) return;
    await supabase.from('projects').update({ published: !row.published }).eq('id', row.id);
    reload();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <p className="font-mono text-xs text-ink-muted">
          {rows.length} project{rows.length === 1 ? '' : 's'}
        </p>
        <Button onClick={openNew}>+ New project</Button>
      </div>

      {error && <p className="text-red-600 text-sm mb-3">{error}</p>}
      {loading && <p className="text-ink-muted text-sm">Loading…</p>}

      <div className="bg-white rounded-2xl border border-border-crisp overflow-hidden">
        {rows.map((row) => (
          <div key={row.id} className="flex items-center gap-3 px-4 py-3 border-b border-border-crisp last:border-0">
            <span className="font-mono text-xs text-ink-muted w-7">#{row.exp_number}</span>
            <img
              src={row.image}
              alt={row.title}
              referrerPolicy="no-referrer"
              className="w-11 h-11 object-cover rounded-lg bg-surface-container"
            />
            <div className="flex-1 min-w-0">
              <div className="font-bold text-sm text-ink truncate">{row.title}</div>
              <div className="font-mono text-[10px] uppercase tracking-wider text-ink-muted truncate">
                {row.tag} · {row.col_span === '8' ? 'Wide' : 'Standard'}
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
          <div className="p-8 text-center text-ink-muted text-sm">No projects yet.</div>
        )}
      </div>

      {editing && (
        <Modal
          title={editing.id ? 'Edit project' : 'New project'}
          onClose={() => setEditing(null)}
        >
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Field label="Title">
                <TextInput
                  value={editing.title}
                  onChange={(e) => setEditing({ ...editing, title: e.target.value })}
                />
              </Field>
              <Field label="Number (#)">
                <TextInput
                  value={editing.exp_number}
                  onChange={(e) => setEditing({ ...editing, exp_number: e.target.value })}
                  placeholder="01"
                />
              </Field>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Field label="Category">
                <select
                  value={editing.category}
                  onChange={(e) => setEditing({ ...editing, category: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-border-crisp bg-white text-sm text-ink"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Width">
                <select
                  value={editing.col_span}
                  onChange={(e) => setEditing({ ...editing, col_span: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-border-crisp bg-white text-sm text-ink"
                >
                  <option value="4">Standard (4 col)</option>
                  <option value="8">Wide (8 col)</option>
                </select>
              </Field>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Field label="Category badge">
                <TextInput
                  value={editing.category_badge}
                  onChange={(e) => setEditing({ ...editing, category_badge: e.target.value })}
                />
              </Field>
              <Field label="Extra badge (optional)">
                <TextInput
                  value={editing.extra_badge ?? ''}
                  onChange={(e) => setEditing({ ...editing, extra_badge: e.target.value })}
                />
              </Field>
            </div>

            <Field label="Tag line">
              <TextInput
                value={editing.tag}
                onChange={(e) => setEditing({ ...editing, tag: e.target.value })}
              />
            </Field>

            <Field label="Image">
              <ImageField value={editing.image} onChange={(url) => setEditing({ ...editing, image: url })} />
            </Field>

            <Field label="More images (one URL per line, optional)">
              <TextArea
                rows={3}
                value={imagesText}
                onChange={(e) => setImagesText(e.target.value)}
                placeholder={'https://…/image-2.jpg\nhttps://…/image-3.jpg'}
              />
            </Field>

            <div className="grid grid-cols-2 gap-4">
              <Field label="GitHub URL (optional)">
                <TextInput
                  value={editing.github_url ?? ''}
                  onChange={(e) => setEditing({ ...editing, github_url: e.target.value })}
                  placeholder="https://github.com/…"
                />
              </Field>
              <Field label="Website URL (optional)">
                <TextInput
                  value={editing.website_url ?? ''}
                  onChange={(e) => setEditing({ ...editing, website_url: e.target.value })}
                  placeholder="https://…"
                />
              </Field>
            </div>

            <Field label="Short description">
              <TextArea
                rows={2}
                value={editing.description}
                onChange={(e) => setEditing({ ...editing, description: e.target.value })}
              />
            </Field>

            <Field label="Detailed description (optional)">
              <TextArea
                rows={3}
                value={editing.detailed_description ?? ''}
                onChange={(e) => setEditing({ ...editing, detailed_description: e.target.value })}
              />
            </Field>

            <Field label="Tech stack (comma separated)">
              <TextInput value={techText} onChange={(e) => setTechText(e.target.value)} />
            </Field>

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

import { useEffect, useState } from 'react';
import type { Announcement } from '@lignezero/types';
import { db } from '@/lib/supabase';
import { useAuth } from '@/auth/AuthProvider';
import { Button, Modal, Panel, Spinner } from '@/components/ui';

export function AnnouncementsPage() {
  const { isManager } = useAuth();
  const [items, setItems] = useState<Announcement[] | null>(null);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function refresh() {
    try {
      setItems(await db.listAnnouncements());
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erreur');
    }
  }
  useEffect(() => {
    refresh();
  }, []);

  async function remove(a: Announcement) {
    if (!confirm(`Supprimer « ${a.title} » ?`)) return;
    await db.removeAnnouncement(a.id);
    refresh();
  }

  if (!items) return <Spinner label="Chargement…" />;

  return (
    <div>
      <header className="mb-6 flex items-end justify-between">
        <div>
          <p className="hud-label text-[11px]">ANN // Annonces</p>
          <h1 className="font-display text-3xl font-bold uppercase tracking-hud">Annonces</h1>
        </div>
        {isManager && <Button onClick={() => setCreating(true)}>+ Publier</Button>}
      </header>

      {error && <p className="mb-4 border border-[color:var(--accent)] px-3 py-2 font-mono text-xs text-accent">{error}</p>}

      {items.length === 0 ? (
        <Panel><p className="font-mono text-sm text-[color:var(--text-mute)]">Aucune annonce.</p></Panel>
      ) : (
        <div className="space-y-3">
          {items.map((a) => (
            <div key={a.id} className="panel p-4">
              <div className="flex items-center justify-between gap-3">
                <p className="font-display text-lg font-bold uppercase">{a.title}</p>
                <div className="flex items-center gap-3">
                  <span className="font-mono text-[10px] text-[color:var(--text-mute)]">{new Date(a.createdAt).toLocaleDateString('fr-FR')}</span>
                  {isManager && <button onClick={() => remove(a)} className="font-mono text-xs text-[color:var(--text-mute)] hover:text-accent">suppr.</button>}
                </div>
              </div>
              <p className="mt-2 whitespace-pre-wrap font-mono text-sm text-[color:var(--text-dim)]">{a.body}</p>
            </div>
          ))}
        </div>
      )}

      {creating && <AnnouncementForm onClose={() => setCreating(false)} onSaved={() => { setCreating(false); refresh(); }} />}
    </div>
  );
}

function AnnouncementForm({ onClose, onSaved }: { onClose: () => void; onSaved: () => void }) {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function save() {
    if (!title.trim() || !body.trim()) { setError('Titre et message requis.'); return; }
    setBusy(true);
    try {
      await db.upsertAnnouncement({ title, body });
      onSaved();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erreur');
      setBusy(false);
    }
  }

  return (
    <Modal open onClose={onClose} title="Publier une annonce">
      <div className="space-y-4">
        <div><label className="label">Titre</label><input className="field" value={title} onChange={(e) => setTitle(e.target.value)} /></div>
        <div><label className="label">Message</label><textarea className="field h-40" value={body} onChange={(e) => setBody(e.target.value)} /></div>
      </div>
      {error && <p className="mt-4 border border-[color:var(--accent)] px-3 py-2 font-mono text-xs text-accent">{error}</p>}
      <div className="mt-6 flex justify-end gap-3">
        <Button variant="ghost" onClick={onClose}>Annuler</Button>
        <Button onClick={save} disabled={busy}>{busy ? '…' : 'Publier'}</Button>
      </div>
    </Modal>
  );
}

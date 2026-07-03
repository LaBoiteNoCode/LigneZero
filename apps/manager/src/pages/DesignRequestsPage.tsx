import { useEffect, useState } from 'react';
import type { DesignKind, DesignRequest, DesignStatus } from '@lignezero/types';
import { db } from '@/lib/supabase';
import { useAuth } from '@/auth/AuthProvider';
import { Badge, Button, Modal, Panel, Spinner } from '@/components/ui';

/**
 * File des demandes graphiques. Tout membre connecté peut DEMANDER un visuel ;
 * l'équipe design (graphiste/content/manager/admin) fait avancer le statut,
 * attache le livrable et supprime. Workflow : à faire → en cours → relecture → livré.
 */

const KINDS: { id: DesignKind; label: string }[] = [
  { id: 'reseaux', label: 'Réseaux' },
  { id: 'maillot', label: 'Maillot' },
  { id: 'overlay', label: 'Overlay stream' },
  { id: 'print', label: 'Print' },
  { id: 'logo', label: 'Logo' },
  { id: 'autre', label: 'Autre' },
];
const FLOW: DesignStatus[] = ['todo', 'doing', 'review', 'done'];
const STATUS_LABEL: Record<DesignStatus, string> = {
  todo: 'À faire',
  doing: 'En cours',
  review: 'Relecture',
  done: 'Livré',
};
const STATUS_TONE: Record<DesignStatus, 'mute' | 'warn' | 'ok' | 'live'> = {
  todo: 'mute',
  doing: 'warn',
  review: 'live',
  done: 'ok',
};

export function DesignRequestsPage() {
  const { isDesign } = useAuth();
  const [items, setItems] = useState<DesignRequest[] | null>(null);
  const [editing, setEditing] = useState<Partial<DesignRequest> | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function refresh() {
    try {
      setItems(await db.listDesignRequests());
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erreur');
    }
  }
  useEffect(() => {
    refresh();
  }, []);

  async function advance(d: DesignRequest) {
    if (!isDesign) return;
    const next = FLOW[(FLOW.indexOf(d.status) + 1) % FLOW.length];
    await db.setDesignStatus(d.id, next);
    refresh();
  }
  async function remove(d: DesignRequest) {
    if (!confirm(`Supprimer « ${d.title} » ?`)) return;
    await db.removeDesignRequest(d.id);
    refresh();
  }

  if (!items) return <Spinner label="Chargement des demandes…" />;

  const late = (d: DesignRequest) => d.due && d.status !== 'done' && new Date(d.due).getTime() < Date.now();

  return (
    <div>
      <header className="mb-6 flex items-end justify-between">
        <div>
          <p className="hud-label text-[11px]">GFX // Studio graphique</p>
          <h1 className="font-display text-3xl font-bold uppercase tracking-hud">Studio graphique</h1>
          <p className="mt-1 font-mono text-xs text-[color:var(--text-dim)]">
            &gt; Demande un visuel ; les graphistes traitent la file.
          </p>
        </div>
        <Button onClick={() => setEditing({ kind: 'reseaux', status: 'todo' })}>+ Nouvelle demande</Button>
      </header>

      {error && <p className="mb-4 border border-[color:var(--accent)] px-3 py-2 font-mono text-xs text-accent">{error}</p>}

      {/* compteurs de file */}
      <div className="mb-6 grid grid-cols-4 gap-3">
        {FLOW.map((st) => (
          <div key={st} className="panel p-3 text-center">
            <p className="font-display text-3xl font-bold text-[color:var(--text)]">
              {items.filter((d) => d.status === st).length}
            </p>
            <p className="hud-label mt-0.5 text-[9px]">{STATUS_LABEL[st]}</p>
          </div>
        ))}
      </div>

      {items.length === 0 ? (
        <Panel><p className="font-mono text-sm text-[color:var(--text-mute)]">Aucune demande. Crée la première.</p></Panel>
      ) : (
        <div className="space-y-3">
          {items.map((d) => (
            <div key={d.id} className="panel flex items-center justify-between gap-4 p-4">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge>{KINDS.find((k) => k.id === d.kind)?.label ?? d.kind}</Badge>
                  {d.due && (
                    <span className={`font-mono text-[10px] uppercase tracking-hud ${late(d) ? 'text-accent' : 'text-[color:var(--text-mute)]'}`}>
                      pour le {new Date(d.due).toLocaleDateString('fr-FR')}
                      {late(d) && ' · EN RETARD'}
                    </span>
                  )}
                </div>
                <p className="mt-1 font-display text-lg font-bold uppercase">{d.title}</p>
                {d.brief && <p className="font-mono text-xs text-[color:var(--text-dim)]">{d.brief}</p>}
                {d.assetUrl && (
                  <a href={d.assetUrl} target="_blank" rel="noopener noreferrer" className="mt-1 inline-block font-mono text-xs text-accent hover:underline">
                    ⤓ livrable ↗
                  </a>
                )}
              </div>
              <div className="flex shrink-0 items-center gap-3">
                <button
                  onClick={() => advance(d)}
                  disabled={!isDesign}
                  className={isDesign ? 'cursor-pointer' : 'cursor-default'}
                  title={isDesign ? 'Faire avancer le statut' : ''}
                >
                  <Badge tone={STATUS_TONE[d.status]}>{STATUS_LABEL[d.status]}</Badge>
                </button>
                {isDesign && (
                  <>
                    <button onClick={() => setEditing(d)} className="font-mono text-xs text-[color:var(--text-dim)] hover:text-accent">éditer</button>
                    <button onClick={() => remove(d)} className="font-mono text-xs text-[color:var(--text-mute)] hover:text-accent">suppr.</button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {editing && (
        <RequestForm
          draft={editing}
          isDesign={isDesign}
          onClose={() => setEditing(null)}
          onSaved={() => { setEditing(null); refresh(); }}
        />
      )}
    </div>
  );
}

function RequestForm({ draft, isDesign, onClose, onSaved }: { draft: Partial<DesignRequest>; isDesign: boolean; onClose: () => void; onSaved: () => void }) {
  const [d, setD] = useState<Partial<DesignRequest>>(draft);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const set = <K extends keyof DesignRequest>(k: K, v: DesignRequest[K]) => setD((x) => ({ ...x, [k]: v }));

  async function save() {
    if (!d.title?.trim()) { setError('Titre requis.'); return; }
    setBusy(true);
    try {
      await db.upsertDesignRequest(d);
      onSaved();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erreur');
      setBusy(false);
    }
  }

  return (
    <Modal open onClose={onClose} title={d.id ? 'Éditer la demande' : 'Nouvelle demande'}>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="label">Type</label>
          <select className="field" value={d.kind ?? 'reseaux'} onChange={(e) => set('kind', e.target.value as DesignKind)}>
            {KINDS.map((k) => <option key={k.id} value={k.id}>{k.label}</option>)}
          </select>
        </div>
        <div><label className="label">Échéance</label><input type="date" className="field" value={d.due ?? ''} onChange={(e) => set('due', e.target.value || undefined)} /></div>
        <div className="col-span-2"><label className="label">Titre</label><input className="field" value={d.title ?? ''} onChange={(e) => set('title', e.target.value)} placeholder="ex. Visuel annonce vs NEMESIS" /></div>
        <div className="col-span-2"><label className="label">Brief</label><textarea className="field h-28" value={d.brief ?? ''} onChange={(e) => set('brief', e.target.value || undefined)} placeholder="Format, textes, références, deadline de diffusion…" /></div>
        {isDesign && (
          <>
            <div>
              <label className="label">Statut</label>
              <select className="field" value={d.status ?? 'todo'} onChange={(e) => set('status', e.target.value as DesignStatus)}>
                {FLOW.map((st) => <option key={st} value={st}>{STATUS_LABEL[st]}</option>)}
              </select>
            </div>
            <div><label className="label">Livrable (URL)</label><input className="field" value={d.assetUrl ?? ''} onChange={(e) => set('assetUrl', e.target.value || undefined)} placeholder="Drive / Figma / export…" /></div>
          </>
        )}
      </div>
      {error && <p className="mt-4 border border-[color:var(--accent)] px-3 py-2 font-mono text-xs text-accent">{error}</p>}
      <div className="mt-6 flex justify-end gap-3">
        <Button variant="ghost" onClick={onClose}>Annuler</Button>
        <Button onClick={save} disabled={busy}>{busy ? '…' : 'Enregistrer'}</Button>
      </div>
    </Modal>
  );
}

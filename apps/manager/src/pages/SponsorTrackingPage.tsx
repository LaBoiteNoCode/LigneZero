import { useEffect, useState } from 'react';
import type { Sponsor, SponsorStatus, SponsorTracking } from '@lignezero/types';
import { db } from '@/lib/supabase';
import { Badge, Button, Modal, Panel, Spinner } from '@/components/ui';

/**
 * Suivi des partenariats : pipeline d'état (prospect → actif → terminé) +
 * données business PRIVÉES (contrat, valeur, contact) stockées dans
 * sponsor_tracking (RLS manager-only — jamais exposées au public).
 * Seuls les sponsors 'actif' apparaissent sur la vitrine.
 */

const STATUSES: { id: SponsorStatus; label: string; tone: 'mute' | 'warn' | 'ok' | 'live' }[] = [
  { id: 'prospect', label: 'Prospect', tone: 'mute' },
  { id: 'contact', label: 'Contacté', tone: 'mute' },
  { id: 'negociation', label: 'Négociation', tone: 'warn' },
  { id: 'actif', label: 'Actif', tone: 'ok' },
  { id: 'pause', label: 'En pause', tone: 'warn' },
  { id: 'termine', label: 'Terminé', tone: 'live' },
];

const eur = new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 });

/** Contrat proche de l'échéance (< 60 jours) ou expiré. */
function contractAlert(t?: SponsorTracking): 'expired' | 'soon' | null {
  if (!t?.contractEnd) return null;
  const days = (new Date(t.contractEnd).getTime() - Date.now()) / 86400000;
  if (days < 0) return 'expired';
  if (days < 60) return 'soon';
  return null;
}

export function SponsorTrackingPage() {
  const [sponsors, setSponsors] = useState<Sponsor[] | null>(null);
  const [tracking, setTracking] = useState<SponsorTracking[]>([]);
  const [editing, setEditing] = useState<{ sponsor: Sponsor; t: SponsorTracking } | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function refresh() {
    try {
      const [ss, ts] = await Promise.all([db.listSponsors(), db.listSponsorTracking()]);
      setSponsors(ss);
      setTracking(ts);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erreur');
    }
  }
  useEffect(() => {
    refresh();
  }, []);

  if (!sponsors) return <Spinner label="Chargement du suivi…" />;

  const trackOf = (id: string): SponsorTracking => tracking.find((t) => t.sponsorId === id) ?? { sponsorId: id };
  const countBy = (st: SponsorStatus) => sponsors.filter((s) => s.status === st).length;
  const activeValue = sponsors
    .filter((s) => s.status === 'actif')
    .reduce((sum, s) => sum + (trackOf(s.id).valueAnnual ?? 0), 0);

  async function setStatus(id: string, status: SponsorStatus) {
    setError(null);
    try {
      await db.setSponsorStatus(id, status);
      refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erreur');
    }
  }

  return (
    <div>
      <header className="mb-6">
        <p className="hud-label text-[11px]">TRK // Suivi sponsors</p>
        <h1 className="font-display text-3xl font-bold uppercase tracking-hud">Suivi sponsors</h1>
        <p className="mt-1 font-mono text-xs text-[color:var(--text-dim)]">
          &gt; Pipeline de partenariat. Seuls les sponsors « actif » sont visibles sur la vitrine.
        </p>
      </header>

      {error && <p className="mb-4 border border-[color:var(--accent)] px-3 py-2 font-mono text-xs text-accent">{error}</p>}

      {/* ── Pipeline (compteurs) + valeur du portefeuille actif ── */}
      <div className="mb-6 grid grid-cols-3 gap-3 lg:grid-cols-7">
        {STATUSES.map((st) => (
          <div key={st.id} className="panel p-3 text-center">
            <p className="font-display text-3xl font-bold text-[color:var(--text)]">{countBy(st.id)}</p>
            <p className="hud-label mt-0.5 text-[9px]">{st.label}</p>
          </div>
        ))}
        <div className="panel border-[color:var(--accent)] p-3 text-center">
          <p className="font-display text-2xl font-bold text-accent">{eur.format(activeValue)}</p>
          <p className="hud-label mt-0.5 text-[9px]">Portefeuille actif / an</p>
        </div>
      </div>

      {/* ── Table de suivi ── */}
      <div className="panel overflow-x-auto">
        <table className="w-full text-left">
          <thead className="border-b border-line-strong bg-base-700">
            <tr className="hud-label text-[10px]">
              <th className="px-4 py-2">Sponsor</th>
              <th className="px-4 py-2">État</th>
              <th className="px-4 py-2">Contrat</th>
              <th className="px-4 py-2">Valeur / an</th>
              <th className="px-4 py-2">Contact</th>
              <th className="px-4 py-2 text-right">Suivi</th>
            </tr>
          </thead>
          <tbody className="font-mono text-sm">
            {sponsors.map((s) => {
              const t = trackOf(s.id);
              const alert = contractAlert(t);
              return (
                <tr key={s.id} className="border-b border-line last:border-0 hover:bg-base-700/50">
                  <td className="px-4 py-2.5">
                    <span className="font-semibold text-[color:var(--text)]">{s.name}</span>
                    <span className="ml-2"><Badge>{s.tier}</Badge></span>
                  </td>
                  <td className="px-4 py-2.5">
                    <select
                      className="field w-36 py-1"
                      value={s.status}
                      onChange={(e) => setStatus(s.id, e.target.value as SponsorStatus)}
                    >
                      {STATUSES.map((st) => <option key={st.id} value={st.id}>{st.label}</option>)}
                    </select>
                  </td>
                  <td className="px-4 py-2.5 text-[color:var(--text-dim)]">
                    {t.contractStart || t.contractEnd ? (
                      <>
                        {t.contractStart ?? '…'} → {t.contractEnd ?? '…'}
                        {alert === 'expired' && <span className="ml-2"><Badge tone="live">expiré</Badge></span>}
                        {alert === 'soon' && <span className="ml-2"><Badge tone="warn">échéance proche</Badge></span>}
                      </>
                    ) : '—'}
                  </td>
                  <td className="px-4 py-2.5 text-[color:var(--text)]">{t.valueAnnual != null ? eur.format(t.valueAnnual) : '—'}</td>
                  <td className="px-4 py-2.5 text-[color:var(--text-dim)]">
                    {t.contactName ?? '—'}
                    {t.contactEmail && <div className="text-[10px] text-[color:var(--text-mute)]">{t.contactEmail}</div>}
                  </td>
                  <td className="px-4 py-2.5 text-right">
                    <button onClick={() => setEditing({ sponsor: s, t })} className="text-[color:var(--text-dim)] hover:text-accent">
                      éditer
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {sponsors.length === 0 && (
        <Panel><p className="font-mono text-sm text-[color:var(--text-mute)]">Aucun sponsor. Crée-les dans « Sponsors ».</p></Panel>
      )}

      {editing && (
        <TrackingForm
          sponsor={editing.sponsor}
          draft={editing.t}
          onClose={() => setEditing(null)}
          onSaved={() => { setEditing(null); refresh(); }}
        />
      )}
    </div>
  );
}

function TrackingForm({ sponsor, draft, onClose, onSaved }: { sponsor: Sponsor; draft: SponsorTracking; onClose: () => void; onSaved: () => void }) {
  const [t, setT] = useState<SponsorTracking>(draft);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const set = <K extends keyof SponsorTracking>(k: K, v: SponsorTracking[K]) => setT((x) => ({ ...x, [k]: v }));

  async function save() {
    setBusy(true);
    setError(null);
    try {
      await db.upsertSponsorTracking(t);
      onSaved();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erreur');
      setBusy(false);
    }
  }

  return (
    <Modal open onClose={onClose} title={`Suivi · ${sponsor.name}`}>
      <div className="grid grid-cols-2 gap-4">
        <div><label className="label">Début de contrat</label><input type="date" className="field" value={t.contractStart ?? ''} onChange={(e) => set('contractStart', e.target.value || undefined)} /></div>
        <div><label className="label">Fin de contrat</label><input type="date" className="field" value={t.contractEnd ?? ''} onChange={(e) => set('contractEnd', e.target.value || undefined)} /></div>
        <div><label className="label">Valeur annuelle (€)</label><input type="number" className="field" value={t.valueAnnual ?? ''} onChange={(e) => set('valueAnnual', e.target.value ? Number(e.target.value) : undefined)} /></div>
        <div><label className="label">Contact</label><input className="field" value={t.contactName ?? ''} onChange={(e) => set('contactName', e.target.value || undefined)} /></div>
        <div className="col-span-2"><label className="label">Email contact</label><input type="email" className="field" value={t.contactEmail ?? ''} onChange={(e) => set('contactEmail', e.target.value || undefined)} /></div>
        <div className="col-span-2"><label className="label">Notes de suivi</label><textarea className="field h-24" value={t.notes ?? ''} onChange={(e) => set('notes', e.target.value || undefined)} /></div>
      </div>
      {error && <p className="mt-4 border border-[color:var(--accent)] px-3 py-2 font-mono text-xs text-accent">{error}</p>}
      <div className="mt-6 flex justify-end gap-3">
        <Button variant="ghost" onClick={onClose}>Annuler</Button>
        <Button onClick={save} disabled={busy}>{busy ? '…' : 'Enregistrer'}</Button>
      </div>
    </Modal>
  );
}

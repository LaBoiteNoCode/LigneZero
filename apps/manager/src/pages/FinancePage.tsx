import { useEffect, useMemo, useState } from 'react';
import type { Sponsor, Transaction, TransactionKind } from '@lignezero/types';
import { db } from '@/lib/supabase';
import { Badge, Button, Modal, Panel, Spinner } from '@/components/ui';

/**
 * Finance — accès CEO (admin) UNIQUEMENT : la RLS refuse lecture/écriture à
 * tout autre rôle, la route est en plus gardée côté app. Dépenses, revenus,
 * solde, détail par transaction (liable à un sponsor).
 */

const eur = new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 });

const CATEGORIES = ['Sponsoring', 'Cashprize', 'Merch', 'Salaires', 'Déplacements', 'Matériel', 'Structures & loyers', 'Marketing', 'Autre'];

export function FinancePage() {
  const [items, setItems] = useState<Transaction[] | null>(null);
  const [sponsors, setSponsors] = useState<Sponsor[]>([]);
  const [editing, setEditing] = useState<Partial<Transaction> | null>(null);
  const [year, setYear] = useState(new Date().getFullYear());
  const [error, setError] = useState<string | null>(null);

  async function refresh() {
    try {
      const [ts, ss] = await Promise.all([db.listTransactions(), db.listSponsors()]);
      setItems(ts);
      setSponsors(ss);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erreur');
    }
  }
  useEffect(() => {
    refresh();
  }, []);

  const list = useMemo(
    () => (items ?? []).filter((t) => new Date(t.date).getFullYear() === year),
    [items, year],
  );
  const totals = useMemo(() => {
    const revenus = list.filter((t) => t.kind === 'revenu').reduce((s, t) => s + t.amount, 0);
    const depenses = list.filter((t) => t.kind === 'depense').reduce((s, t) => s + t.amount, 0);
    return { revenus, depenses, solde: revenus - depenses };
  }, [list]);

  const years = useMemo(() => {
    const ys = new Set((items ?? []).map((t) => new Date(t.date).getFullYear()));
    ys.add(new Date().getFullYear());
    return [...ys].sort((a, b) => b - a);
  }, [items]);

  const sponsorName = (id?: string) => sponsors.find((s) => s.id === id)?.name;

  async function remove(t: Transaction) {
    if (!confirm(`Supprimer « ${t.label} » ?`)) return;
    await db.removeTransaction(t.id);
    refresh();
  }

  if (!items) return <Spinner label="Lecture des comptes…" />;

  return (
    <div>
      <header className="mb-6 flex items-end justify-between">
        <div>
          <p className="hud-label text-[11px]">FIN // Finance · accès CEO</p>
          <h1 className="font-display text-3xl font-bold uppercase tracking-hud">Finance</h1>
        </div>
        <div className="flex items-center gap-3">
          <select className="field w-28" value={year} onChange={(e) => setYear(Number(e.target.value))}>
            {years.map((y) => <option key={y} value={y}>{y}</option>)}
          </select>
          <Button onClick={() => setEditing({ kind: 'depense', date: new Date().toISOString().slice(0, 10) })}>
            + Transaction
          </Button>
        </div>
      </header>

      {error && <p className="mb-4 border border-[color:var(--accent)] px-3 py-2 font-mono text-xs text-accent">{error}</p>}

      {/* ── Totaux de l'année ── */}
      <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="panel p-5 text-center">
          <p className="font-display text-3xl font-bold text-[color:var(--signal-ok)]">{eur.format(totals.revenus)}</p>
          <p className="hud-label mt-1 text-[9px]">Revenus {year}</p>
        </div>
        <div className="panel p-5 text-center">
          <p className="font-display text-3xl font-bold text-accent">{eur.format(totals.depenses)}</p>
          <p className="hud-label mt-1 text-[9px]">Dépenses {year}</p>
        </div>
        <div className="panel p-5 text-center" style={{ borderColor: totals.solde >= 0 ? 'var(--signal-ok)' : 'var(--accent)' }}>
          <p className="font-display text-3xl font-bold" style={{ color: totals.solde >= 0 ? 'var(--signal-ok)' : 'var(--accent)' }}>
            {totals.solde >= 0 ? '+' : ''}{eur.format(totals.solde)}
          </p>
          <p className="hud-label mt-1 text-[9px]">Solde {year}</p>
        </div>
      </div>

      {/* ── Transactions ── */}
      {list.length === 0 ? (
        <Panel><p className="font-mono text-sm text-[color:var(--text-mute)]">Aucune transaction en {year}.</p></Panel>
      ) : (
        <div className="panel overflow-x-auto">
          <table className="w-full text-left">
            <thead className="border-b border-line-strong bg-base-700">
              <tr className="hud-label text-[10px]">
                <th className="px-4 py-2">Date</th>
                <th className="px-4 py-2">Libellé</th>
                <th className="px-4 py-2">Catégorie</th>
                <th className="px-4 py-2">Sponsor</th>
                <th className="px-4 py-2 text-right">Montant</th>
                <th className="px-4 py-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="font-mono text-sm">
              {list.map((t) => (
                <tr key={t.id} className="border-b border-line last:border-0 hover:bg-base-700/50">
                  <td className="px-4 py-2.5 text-[color:var(--text-mute)]">{new Date(t.date).toLocaleDateString('fr-FR')}</td>
                  <td className="px-4 py-2.5 text-[color:var(--text)]">
                    {t.label}
                    {t.notes && <div className="text-[10px] text-[color:var(--text-mute)]">{t.notes}</div>}
                  </td>
                  <td className="px-4 py-2.5"><Badge>{t.category}</Badge></td>
                  <td className="px-4 py-2.5 text-[color:var(--text-dim)]">{sponsorName(t.sponsorId) ?? '—'}</td>
                  <td className="px-4 py-2.5 text-right font-semibold" style={{ color: t.kind === 'revenu' ? 'var(--signal-ok)' : 'var(--accent)' }}>
                    {t.kind === 'revenu' ? '+' : '−'}{eur.format(t.amount)}
                  </td>
                  <td className="px-4 py-2.5 text-right">
                    <button onClick={() => setEditing(t)} className="mr-3 text-[color:var(--text-dim)] hover:text-accent">éditer</button>
                    <button onClick={() => remove(t)} className="text-[color:var(--text-mute)] hover:text-accent">suppr.</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {editing && (
        <TransactionForm
          draft={editing}
          sponsors={sponsors}
          onClose={() => setEditing(null)}
          onSaved={() => { setEditing(null); refresh(); }}
        />
      )}
    </div>
  );
}

function TransactionForm({ draft, sponsors, onClose, onSaved }: { draft: Partial<Transaction>; sponsors: Sponsor[]; onClose: () => void; onSaved: () => void }) {
  const [t, setT] = useState<Partial<Transaction>>(draft);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const set = <K extends keyof Transaction>(k: K, v: Transaction[K]) => setT((x) => ({ ...x, [k]: v }));

  async function save() {
    if (!t.label?.trim() || !t.category?.trim() || !t.amount || t.amount <= 0) {
      setError('Libellé, catégorie et montant (> 0) requis.');
      return;
    }
    setBusy(true);
    try {
      await db.upsertTransaction(t);
      onSaved();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erreur');
      setBusy(false);
    }
  }

  return (
    <Modal open onClose={onClose} title={t.id ? 'Éditer la transaction' : 'Nouvelle transaction'}>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="label">Type</label>
          <select className="field" value={t.kind ?? 'depense'} onChange={(e) => set('kind', e.target.value as TransactionKind)}>
            <option value="depense">Dépense</option>
            <option value="revenu">Revenu</option>
          </select>
        </div>
        <div><label className="label">Date</label><input type="date" className="field" value={t.date ?? ''} onChange={(e) => set('date', e.target.value)} /></div>
        <div className="col-span-2"><label className="label">Libellé</label><input className="field" value={t.label ?? ''} onChange={(e) => set('label', e.target.value)} placeholder="ex. Contrat HYPERVOLT T3" /></div>
        <div>
          <label className="label">Catégorie</label>
          <input className="field" list="fin-cats" value={t.category ?? ''} onChange={(e) => set('category', e.target.value)} />
          <datalist id="fin-cats">
            {CATEGORIES.map((c) => <option key={c} value={c} />)}
          </datalist>
        </div>
        <div><label className="label">Montant (€)</label><input type="number" min="0" step="0.01" className="field" value={t.amount ?? ''} onChange={(e) => set('amount', e.target.value ? Number(e.target.value) : 0)} /></div>
        <div>
          <label className="label">Sponsor lié (optionnel)</label>
          <select className="field" value={t.sponsorId ?? ''} onChange={(e) => set('sponsorId', e.target.value || undefined)}>
            <option value="">—</option>
            {sponsors.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>
        <div><label className="label">Notes</label><input className="field" value={t.notes ?? ''} onChange={(e) => set('notes', e.target.value || undefined)} /></div>
      </div>
      {error && <p className="mt-4 border border-[color:var(--accent)] px-3 py-2 font-mono text-xs text-accent">{error}</p>}
      <div className="mt-6 flex justify-end gap-3">
        <Button variant="ghost" onClick={onClose}>Annuler</Button>
        <Button onClick={save} disabled={busy}>{busy ? '…' : 'Enregistrer'}</Button>
      </div>
    </Modal>
  );
}

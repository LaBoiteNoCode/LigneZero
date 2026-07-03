import { useEffect, useState } from 'react';
import type { Player, Profile, UserRole } from '@lignezero/types';
import { db } from '@/lib/supabase';
import { Badge, Panel, Spinner } from '@/components/ui';

const ROLES: UserRole[] = ['member', 'joueur', 'coach', 'staff', 'content', 'graphiste', 'manager', 'admin'];

export function AccountsPage() {
  const [profiles, setProfiles] = useState<Profile[] | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [error, setError] = useState<string | null>(null);

  async function refresh() {
    try {
      const [ps, pl] = await Promise.all([db.listProfiles(), db.listPlayers()]);
      setProfiles(ps);
      setPlayers(pl);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erreur');
    }
  }
  useEffect(() => {
    refresh();
  }, []);

  async function changeRole(id: string, role: UserRole) {
    try {
      await db.setRole(id, role);
      refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erreur');
    }
  }
  async function linkPlayer(id: string, playerId: string) {
    try {
      await db.linkPlayer(id, playerId || null);
      refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erreur');
    }
  }

  if (!profiles) return <Spinner label="Chargement…" />;

  const pending = profiles.filter((p) => p.role === 'member');

  return (
    <div>
      <header className="mb-6">
        <p className="hud-label text-[11px]">ACL // Comptes &amp; rôles</p>
        <h1 className="font-display text-3xl font-bold uppercase tracking-hud">Comptes &amp; rôles</h1>
        <p className="mt-1 font-mono text-xs text-[color:var(--text-dim)]">
          &gt; {pending.length} compte(s) en attente de validation.
        </p>
      </header>

      {error && <p className="mb-4 border border-[color:var(--accent)] px-3 py-2 font-mono text-xs text-accent">{error}</p>}

      <Panel>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="border-b border-line-strong bg-base-700">
              <tr className="hud-label text-[10px]">
                <th className="px-4 py-2">Compte</th>
                <th className="px-4 py-2">Rôle</th>
                <th className="px-4 py-2">Fiche joueur liée</th>
              </tr>
            </thead>
            <tbody className="font-mono text-sm">
              {profiles.map((p) => (
                <tr key={p.id} className="border-b border-line last:border-0">
                  <td className="px-4 py-2.5">
                    <span className="text-[color:var(--text)]">{p.displayName || '(sans nom)'}</span>
                    {p.role === 'member' && <span className="ml-2 align-middle"><Badge tone="warn">en attente</Badge></span>}
                    <div className="font-mono text-[10px] text-[color:var(--text-mute)]">{p.id.slice(0, 8)}…</div>
                  </td>
                  <td className="px-4 py-2.5">
                    <select className="field w-36" value={p.role} onChange={(e) => changeRole(p.id, e.target.value as UserRole)}>
                      {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
                    </select>
                  </td>
                  <td className="px-4 py-2.5">
                    <select className="field w-44" value={p.playerId ?? ''} onChange={(e) => linkPlayer(p.id, e.target.value)}>
                      <option value="">— aucune —</option>
                      {players.map((pl) => <option key={pl.id} value={pl.id}>{pl.pseudo}</option>)}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </div>
  );
}

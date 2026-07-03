import { useEffect, useState } from 'react';
import type { Game, Player, PlayerStat, SocialLink } from '@lignezero/types';
import { db } from '@/lib/supabase';
import { Button, Badge, Modal, Panel, Spinner } from '@/components/ui';
import { ImageField } from '@/components/ImageField';

// ── Encodage listes ⇄ textarea (édition simple, une entrée par ligne) ──
const linesToArr = (s: string) => s.split('\n').map((l) => l.trim()).filter(Boolean);
const pairsToSocials = (s: string): SocialLink[] =>
  linesToArr(s).map((l) => {
    const [label, url] = l.split('|').map((x) => x.trim());
    return { label: label ?? '', url: url ?? '' };
  });
const pairsToStats = (s: string): PlayerStat[] =>
  linesToArr(s).map((l) => {
    const [label, value] = l.split('|').map((x) => x.trim());
    return { label: label ?? '', value: value ?? '' };
  });
const socialsToText = (a: SocialLink[]) => a.map((s) => `${s.label} | ${s.url}`).join('\n');
const statsToText = (a: PlayerStat[]) => a.map((s) => `${s.label} | ${s.value}`).join('\n');

const EMPTY: Player = {
  id: '',
  pseudo: '',
  role: '',
  gameId: '',
  socials: [],
  stats: [],
  palmares: [],
  setup: [],
};

export function PlayersPage() {
  const [players, setPlayers] = useState<Player[] | null>(null);
  const [games, setGames] = useState<Game[]>([]);
  const [editing, setEditing] = useState<Player | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function refresh() {
    setError(null);
    try {
      const [p, g] = await Promise.all([db.listPlayers(), db.listGames()]);
      setPlayers(p);
      setGames(g);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erreur');
    }
  }
  useEffect(() => {
    refresh();
  }, []);

  const gameName = (id: string) => games.find((g) => g.id === id)?.name ?? id;

  async function remove(p: Player) {
    if (!confirm(`Supprimer ${p.pseudo} ?`)) return;
    try {
      await db.removePlayer(p.id);
      refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erreur');
    }
  }

  return (
    <div>
      <header className="mb-6 flex items-end justify-between">
        <div>
          <p className="hud-label text-[11px]">PLR // Effectifs</p>
          <h1 className="font-display text-3xl font-bold uppercase tracking-hud">Joueurs</h1>
        </div>
        <Button onClick={() => setEditing({ ...EMPTY })}>+ Nouveau</Button>
      </header>

      {error && (
        <p className="mb-4 border border-[color:var(--accent)] px-3 py-2 font-mono text-xs text-accent">
          {error}
        </p>
      )}

      {!players ? (
        <Spinner label="Lecture des joueurs…" />
      ) : players.length === 0 ? (
        <Panel>
          <p className="font-mono text-sm text-[color:var(--text-dim)]">
            Aucun joueur. Crée le premier avec « + Nouveau ».
          </p>
        </Panel>
      ) : (
        <div className="panel overflow-hidden">
          <table className="w-full text-left">
            <thead className="border-b border-line-strong bg-base-700">
              <tr className="hud-label text-[10px]">
                <th className="px-4 py-2">Pseudo</th>
                <th className="px-4 py-2">Rôle</th>
                <th className="px-4 py-2">Jeu</th>
                <th className="px-4 py-2">Depuis</th>
                <th className="px-4 py-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="font-mono text-sm">
              {players.map((p) => (
                <tr key={p.id} className="border-b border-line last:border-0 hover:bg-base-700/50">
                  <td className="px-4 py-2.5 font-semibold text-[color:var(--text)]">{p.pseudo}</td>
                  <td className="px-4 py-2.5 text-[color:var(--text-dim)]">{p.role}</td>
                  <td className="px-4 py-2.5">
                    <Badge>{gameName(p.gameId)}</Badge>
                  </td>
                  <td className="px-4 py-2.5 text-[color:var(--text-mute)]">{p.joinedYear ?? '—'}</td>
                  <td className="px-4 py-2.5 text-right">
                    <button
                      onClick={() => setEditing(p)}
                      className="mr-3 text-[color:var(--text-dim)] hover:text-accent"
                    >
                      éditer
                    </button>
                    <button onClick={() => remove(p)} className="text-[color:var(--text-mute)] hover:text-accent">
                      suppr.
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {editing && (
        <PlayerForm
          player={editing}
          games={games}
          onClose={() => setEditing(null)}
          onSaved={() => {
            setEditing(null);
            refresh();
          }}
        />
      )}
    </div>
  );
}

function PlayerForm({
  player,
  games,
  onClose,
  onSaved,
}: {
  player: Player;
  games: Game[];
  onClose: () => void;
  onSaved: () => void;
}) {
  const isNew = !player.id;
  const [form, setForm] = useState<Player>(player);
  const [socialsText, setSocialsText] = useState(socialsToText(player.socials));
  const [statsText, setStatsText] = useState(statsToText(player.stats));
  const [palmaresText, setPalmaresText] = useState(player.palmares.join('\n'));
  const [setupText, setSetupText] = useState(statsToText(player.setup));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const set = <K extends keyof Player>(k: K, v: Player[K]) => setForm((f) => ({ ...f, [k]: v }));

  async function save() {
    setError(null);
    if (!form.id || !form.pseudo || !form.gameId) {
      setError('id, pseudo et jeu sont obligatoires.');
      return;
    }
    setBusy(true);
    try {
      await db.upsertPlayer({
        ...form,
        socials: pairsToSocials(socialsText),
        stats: pairsToStats(statsText),
        palmares: linesToArr(palmaresText),
        setup: pairsToStats(setupText),
      });
      onSaved();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erreur');
      setBusy(false);
    }
  }

  return (
    <Modal open onClose={onClose} title={isNew ? 'Nouveau joueur' : `Éditer ${player.pseudo}`}>
      <div className="grid grid-cols-2 gap-4">
        <Field label="ID (slug unique)" >
          <input
            className="field"
            value={form.id}
            disabled={!isNew}
            onChange={(e) => set('id', e.target.value)}
            placeholder="ex. p-neo"
          />
        </Field>
        <Field label="Pseudo">
          <input className="field" value={form.pseudo} onChange={(e) => set('pseudo', e.target.value)} />
        </Field>
        <Field label="Prénom">
          <input className="field" value={form.firstName ?? ''} onChange={(e) => set('firstName', e.target.value)} />
        </Field>
        <Field label="Nom">
          <input className="field" value={form.lastName ?? ''} onChange={(e) => set('lastName', e.target.value)} />
        </Field>
        <Field label="Rôle">
          <input className="field" value={form.role} onChange={(e) => set('role', e.target.value)} placeholder="ex. Duelliste" />
        </Field>
        <Field label="Jeu">
          <select className="field" value={form.gameId} onChange={(e) => set('gameId', e.target.value)}>
            <option value="">— choisir —</option>
            {games.map((g) => (
              <option key={g.id} value={g.id}>
                {g.name}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Pays (ISO)">
          <input className="field" value={form.country ?? ''} onChange={(e) => set('country', e.target.value)} placeholder="FR" />
        </Field>
        <Field label="Couleur (hex)">
          <input className="field" value={form.color ?? ''} onChange={(e) => set('color', e.target.value)} placeholder="#f23127" />
        </Field>
        <Field label="Photo">
          <ImageField value={form.photo ?? ''} onChange={(url) => set('photo', url)} folder="players" />
        </Field>
        <Field label="Année d'arrivée">
          <input
            className="field"
            type="number"
            value={form.joinedYear ?? ''}
            onChange={(e) => set('joinedYear', e.target.value ? Number(e.target.value) : undefined)}
          />
        </Field>
        <Field label="Réseaux (label | url, un par ligne)" full>
          <textarea className="field h-20" value={socialsText} onChange={(e) => setSocialsText(e.target.value)} />
        </Field>
        <Field label="Stats (label | valeur, un par ligne)" full>
          <textarea className="field h-20" value={statsText} onChange={(e) => setStatsText(e.target.value)} />
        </Field>
        <Field label="Setup (ex. Souris | Logitech G Pro X Superlight 2, un par ligne)" full>
          <textarea className="field h-20" value={setupText} onChange={(e) => setSetupText(e.target.value)} />
        </Field>
        <Field label="Palmarès (un par ligne)" full>
          <textarea className="field h-20" value={palmaresText} onChange={(e) => setPalmaresText(e.target.value)} />
        </Field>
      </div>

      {error && (
        <p className="mt-4 border border-[color:var(--accent)] px-3 py-2 font-mono text-xs text-accent">{error}</p>
      )}

      <div className="mt-6 flex justify-end gap-3">
        <Button variant="ghost" onClick={onClose}>Annuler</Button>
        <Button onClick={save} disabled={busy}>{busy ? 'Enregistrement…' : 'Enregistrer'}</Button>
      </div>
    </Modal>
  );
}

function Field({ label, children, full }: { label: string; children: React.ReactNode; full?: boolean }) {
  return (
    <div className={full ? 'col-span-2' : ''}>
      <span className="label">{label}</span>
      {children}
    </div>
  );
}

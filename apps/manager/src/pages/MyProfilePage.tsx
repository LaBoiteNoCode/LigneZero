import { useEffect, useState } from 'react';
import type { Player, PlayerStat, SocialLink } from '@lignezero/types';
import { db } from '@/lib/supabase';
import { useAuth } from '@/auth/AuthProvider';
import { Button, Panel, Spinner } from '@/components/ui';
import { ImageField } from '@/components/ImageField';

const toText = (a: SocialLink[]) => a.map((s) => `${s.label} | ${s.url}`).join('\n');
const fromText = (s: string): SocialLink[] =>
  s.split('\n').map((l) => l.trim()).filter(Boolean).map((l) => {
    const [label, url] = l.split('|').map((x) => x.trim());
    return { label: label ?? '', url: url ?? '' };
  });
const statsToText = (a: PlayerStat[]) => a.map((s) => `${s.label} | ${s.value}`).join('\n');
const textToStats = (s: string): PlayerStat[] =>
  s.split('\n').map((l) => l.trim()).filter(Boolean).map((l) => {
    const [label, value] = l.split('|').map((x) => x.trim());
    return { label: label ?? '', value: value ?? '' };
  });

export function MyProfilePage() {
  const { playerId } = useAuth();
  const [player, setPlayer] = useState<Player | null>(null);
  const [socialsText, setSocialsText] = useState('');
  const [setupText, setSetupText] = useState('');
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    (async () => {
      if (!playerId) {
        setNotFound(true);
        return;
      }
      const p = (await db.listPlayers()).find((x) => x.id === playerId) ?? null;
      if (!p) setNotFound(true);
      else {
        setPlayer(p);
        setSocialsText(toText(p.socials));
        setSetupText(statsToText(p.setup));
      }
    })();
  }, [playerId]);

  if (notFound) {
    return (
      <Panel title="Mon profil">
        <p className="font-mono text-sm text-[color:var(--signal-warn)]">
          &gt; Compte non lié à une fiche joueur. Contacte un admin.
        </p>
      </Panel>
    );
  }
  if (!player) return <Spinner label="Chargement…" />;

  const set = <K extends keyof Player>(k: K, v: Player[K]) => setPlayer((p) => (p ? { ...p, [k]: v } : p));

  async function save() {
    if (!player) return;
    setBusy(true);
    setError(null);
    setMsg(null);
    try {
      await db.updatePlayerProfile(player.id, {
        pseudo: player.pseudo,
        firstName: player.firstName,
        lastName: player.lastName,
        country: player.country,
        color: player.color,
        photo: player.photo,
        socials: fromText(socialsText),
        setup: textToStats(setupText),
      });
      setMsg('Profil mis à jour ✓ (visible sur la vitrine)');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erreur');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <header className="mb-6">
        <p className="hud-label text-[11px]">PROF // Mon profil</p>
        <h1 className="font-display text-3xl font-bold uppercase tracking-hud">Mon profil</h1>
      </header>

      <Panel title="Fiche joueur (alimente la vitrine)">
        <div className="grid grid-cols-2 gap-4">
          <div><label className="label">Pseudo</label><input className="field" value={player.pseudo} onChange={(e) => set('pseudo', e.target.value)} /></div>
          <div><label className="label">Rôle (géré par le staff)</label><input className="field opacity-60" value={player.role} disabled /></div>
          <div><label className="label">Prénom</label><input className="field" value={player.firstName ?? ''} onChange={(e) => set('firstName', e.target.value)} /></div>
          <div><label className="label">Nom</label><input className="field" value={player.lastName ?? ''} onChange={(e) => set('lastName', e.target.value)} /></div>
          <div><label className="label">Pays (ISO)</label><input className="field" value={player.country ?? ''} onChange={(e) => set('country', e.target.value)} /></div>
          <div><label className="label">Couleur (hex)</label><input className="field" value={player.color ?? ''} onChange={(e) => set('color', e.target.value)} /></div>
          <div className="col-span-2"><label className="label">Photo</label><ImageField value={player.photo ?? ''} onChange={(url) => set('photo', url)} folder="players" /></div>
          <div className="col-span-2"><label className="label">Réseaux (label | url, un par ligne)</label><textarea className="field h-24" value={socialsText} onChange={(e) => setSocialsText(e.target.value)} /></div>
          <div className="col-span-2">
            <label className="label">Setup gaming (ex. Souris | Logitech G Pro X Superlight 2, un par ligne)</label>
            <textarea className="field h-24" value={setupText} onChange={(e) => setSetupText(e.target.value)} />
          </div>
        </div>

        {error && <p className="mt-4 border border-[color:var(--accent)] px-3 py-2 font-mono text-xs text-accent">{error}</p>}
        {msg && <p className="mt-4 border border-line-strong px-3 py-2 font-mono text-xs text-[color:var(--signal-ok)]">{msg}</p>}

        <div className="mt-5 flex justify-end">
          <Button onClick={save} disabled={busy}>{busy ? 'Enregistrement…' : 'Enregistrer'}</Button>
        </div>
      </Panel>
    </div>
  );
}

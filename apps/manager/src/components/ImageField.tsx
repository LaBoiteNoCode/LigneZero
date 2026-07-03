import { useRef, useState } from 'react';
import { uploadImage } from '@/lib/storage';

/** Widget d'upload d'image (Supabase Storage) : aperçu + bouton fichier, stocke une URL publique. */
export function ImageField({
  value,
  onChange,
  folder,
}: {
  value: string;
  onChange: (url: string) => void;
  folder: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy(true);
    setError(null);
    try {
      onChange(await uploadImage(file, folder));
    } catch (ex) {
      setError(ex instanceof Error ? ex.message : 'Erreur upload');
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  }

  return (
    <div>
      <div className="flex items-center gap-3">
        {value ? (
          <img src={value} alt="" className="h-14 w-14 border border-line-strong object-cover" />
        ) : (
          <div className="flex h-14 w-14 items-center justify-center border border-line-strong font-mono text-[9px] text-[color:var(--text-mute)]">
            vide
          </div>
        )}
        <div className="flex flex-col items-start gap-1">
          <label className="cursor-pointer border border-line-strong px-3 py-1.5 font-mono text-[11px] uppercase tracking-hud text-[color:var(--text-dim)] transition-colors hover:border-line-bright">
            {busy ? 'Envoi…' : 'Choisir un fichier'}
            <input ref={inputRef} type="file" accept="image/*" className="hidden" disabled={busy} onChange={onFile} />
          </label>
          {value && (
            <button
              type="button"
              onClick={() => onChange('')}
              className="font-mono text-[10px] text-[color:var(--text-mute)] hover:text-accent"
            >
              retirer
            </button>
          )}
        </div>
      </div>
      {error && <p className="mt-1 font-mono text-[10px] text-accent">{error}</p>}
    </div>
  );
}

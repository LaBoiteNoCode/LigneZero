import { useEffect, useState, type ReactNode } from 'react';
import { Button, Badge, Modal, Panel, Spinner } from '@/components/ui';

// ── Encodage listes/paires ⇄ textarea (une entrée par ligne) ──────────
export const linesToArr = (s: string) =>
  s.split('\n').map((l) => l.trim()).filter(Boolean);
export const arrToLines = (a: string[] | undefined) => (a ?? []).join('\n');
export const pairsToObjs = <A extends string, B extends string>(
  s: string,
  ka: A,
  kb: B,
): Record<A | B, string>[] =>
  linesToArr(s).map((l) => {
    const [a, b] = l.split('|').map((x) => x.trim());
    return { [ka]: a ?? '', [kb]: b ?? '' } as Record<A | B, string>;
  });
export const objsToPairs = <T,>(
  a: T[] | undefined,
  ka: keyof T,
  kb: keyof T,
) => (a ?? []).map((o) => `${String(o[ka] ?? '')} | ${String(o[kb] ?? '')}`).join('\n');

// ── Schéma de champ ───────────────────────────────────────────────────
export type FieldType =
  | 'text'
  | 'number'
  | 'select'
  | 'checkbox'
  | 'lines'
  | 'pairs'
  | 'textarea'
  | 'datetime';

export interface FieldDef {
  key: string;
  label: string;
  type?: FieldType;
  full?: boolean;
  required?: boolean;
  placeholder?: string;
  /** Désactivé en édition (identifiant immuable). */
  idField?: boolean;
  options?: { value: string; label: string }[];
}

export type Draft = Record<string, string>;

// ── Config de ressource ───────────────────────────────────────────────
export interface Column<T> {
  header: string;
  cell: (item: T, ctx: ResourceContext) => ReactNode;
}
export type ResourceContext = Record<string, unknown>;

export interface ResourceConfig<T> {
  code: string;
  title: string;
  rowKey: (item: T) => string;
  rowTitle: (item: T) => string;
  columns: Column<T>[];
  fields: (ctx: ResourceContext) => FieldDef[];
  emptyDraft: Draft;
  toDraft: (item: T) => Draft;
  fromDraft: (draft: Draft) => T;
  load: () => Promise<T[]>;
  save: (item: T) => Promise<void>;
  remove: (id: string) => Promise<void>;
  /** Contexte annexe (ex. liste des jeux pour un select). */
  loadContext?: () => Promise<ResourceContext>;
}

// ── Page ressource générique ──────────────────────────────────────────
export function ResourcePage<T>({ config }: { config: ResourceConfig<T> }) {
  const [items, setItems] = useState<T[] | null>(null);
  const [ctx, setCtx] = useState<ResourceContext>({});
  const [editing, setEditing] = useState<Draft | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function refresh() {
    setError(null);
    try {
      const [list, context] = await Promise.all([
        config.load(),
        config.loadContext ? config.loadContext() : Promise.resolve({}),
      ]);
      setItems(list);
      setCtx(context);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erreur');
    }
  }
  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config.code]);

  async function remove(item: T) {
    if (!confirm(`Supprimer « ${config.rowTitle(item)} » ?`)) return;
    try {
      await config.remove(config.rowKey(item));
      refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erreur');
    }
  }

  return (
    <div>
      <header className="mb-6 flex items-end justify-between">
        <div>
          <p className="hud-label text-[11px]">{config.code}</p>
          <h1 className="font-display text-3xl font-bold uppercase tracking-hud">{config.title}</h1>
        </div>
        <Button
          onClick={() => {
            setIsNew(true);
            setEditing({ ...config.emptyDraft });
          }}
        >
          + Nouveau
        </Button>
      </header>

      {error && (
        <p className="mb-4 border border-[color:var(--accent)] px-3 py-2 font-mono text-xs text-accent">
          {error}
        </p>
      )}

      {!items ? (
        <Spinner label="Lecture…" />
      ) : items.length === 0 ? (
        <Panel>
          <p className="font-mono text-sm text-[color:var(--text-dim)]">
            Aucune entrée. Crée la première avec « + Nouveau ».
          </p>
        </Panel>
      ) : (
        <div className="panel overflow-x-auto">
          <table className="w-full text-left">
            <thead className="border-b border-line-strong bg-base-700">
              <tr className="hud-label text-[10px]">
                {config.columns.map((c) => (
                  <th key={c.header} className="px-4 py-2">
                    {c.header}
                  </th>
                ))}
                <th className="px-4 py-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="font-mono text-sm">
              {items.map((item) => (
                <tr
                  key={config.rowKey(item)}
                  className="border-b border-line last:border-0 hover:bg-base-700/50"
                >
                  {config.columns.map((c) => (
                    <td key={c.header} className="px-4 py-2.5 text-[color:var(--text-dim)]">
                      {c.cell(item, ctx)}
                    </td>
                  ))}
                  <td className="px-4 py-2.5 text-right">
                    <button
                      onClick={() => {
                        setIsNew(false);
                        setEditing(config.toDraft(item));
                      }}
                      className="mr-3 text-[color:var(--text-dim)] hover:text-accent"
                    >
                      éditer
                    </button>
                    <button
                      onClick={() => remove(item)}
                      className="text-[color:var(--text-mute)] hover:text-accent"
                    >
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
        <ResourceForm
          config={config}
          ctx={ctx}
          draft={editing}
          isNew={isNew}
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

// ── Formulaire générique piloté par le schéma ─────────────────────────
function ResourceForm<T>({
  config,
  ctx,
  draft,
  isNew,
  onClose,
  onSaved,
}: {
  config: ResourceConfig<T>;
  ctx: ResourceContext;
  draft: Draft;
  isNew: boolean;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [form, setForm] = useState<Draft>(draft);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fields = config.fields(ctx);
  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  async function save() {
    setError(null);
    for (const f of fields) {
      if (f.required && !form[f.key]?.trim()) {
        setError(`Champ requis : ${f.label}`);
        return;
      }
    }
    setBusy(true);
    try {
      await config.save(config.fromDraft(form));
      onSaved();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erreur');
      setBusy(false);
    }
  }

  return (
    <Modal
      open
      onClose={onClose}
      title={isNew ? `Nouveau · ${config.title}` : `Éditer · ${form.id ?? ''}`}
    >
      <div className="grid grid-cols-2 gap-4">
        {fields.map((f) => (
          <div key={f.key} className={f.full || f.type === 'lines' || f.type === 'pairs' || f.type === 'textarea' ? 'col-span-2' : ''}>
            <span className="label">
              {f.label}
              {f.required && <span className="text-accent"> *</span>}
            </span>
            {f.type === 'select' ? (
              <select className="field" value={form[f.key] ?? ''} onChange={(e) => set(f.key, e.target.value)}>
                <option value="">— choisir —</option>
                {f.options?.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            ) : f.type === 'checkbox' ? (
              <label className="flex items-center gap-2 py-2 font-mono text-sm text-[color:var(--text-dim)]">
                <input
                  type="checkbox"
                  checked={form[f.key] === 'true'}
                  onChange={(e) => set(f.key, e.target.checked ? 'true' : '')}
                />
                {f.placeholder ?? 'Activé'}
              </label>
            ) : f.type === 'lines' || f.type === 'pairs' || f.type === 'textarea' ? (
              <textarea
                className="field h-20"
                value={form[f.key] ?? ''}
                onChange={(e) => set(f.key, e.target.value)}
                placeholder={f.placeholder}
              />
            ) : (
              <input
                className="field"
                type={f.type === 'number' ? 'number' : f.type === 'datetime' ? 'datetime-local' : 'text'}
                value={form[f.key] ?? ''}
                disabled={f.idField && !isNew}
                onChange={(e) => set(f.key, e.target.value)}
                placeholder={f.placeholder}
              />
            )}
          </div>
        ))}
      </div>

      {error && (
        <p className="mt-4 border border-[color:var(--accent)] px-3 py-2 font-mono text-xs text-accent">
          {error}
        </p>
      )}

      <div className="mt-6 flex justify-end gap-3">
        <Button variant="ghost" onClick={onClose}>
          Annuler
        </Button>
        <Button onClick={save} disabled={busy}>
          {busy ? 'Enregistrement…' : 'Enregistrer'}
        </Button>
      </div>
    </Modal>
  );
}

/** Réexport pour les colonnes des configs. */
export { Badge };

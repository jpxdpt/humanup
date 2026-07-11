"use client";

type Path = (string | number)[];

function humanize(key: string) {
  return key
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/^./, (c) => c.toUpperCase());
}

function isMultiline(value: string) {
  return value.length > 60 || value.includes("\n") || value.includes("<");
}

function emptyLike(value: unknown): unknown {
  if (typeof value === "string") return "";
  if (typeof value === "number") return 0;
  if (typeof value === "boolean") return false;
  if (Array.isArray(value)) return [];
  if (typeof value === "object" && value !== null) {
    const out: Record<string, unknown> = {};
    for (const k of Object.keys(value as Record<string, unknown>)) {
      out[k] = emptyLike((value as Record<string, unknown>)[k]);
    }
    return out;
  }
  return value;
}

export function ContentFieldEditor({
  value,
  path,
  label,
  onChange,
}: {
  value: unknown;
  path: Path;
  label?: string;
  onChange: (path: Path, value: unknown) => void;
}) {
  if (typeof value === "string") {
    return (
      <label className="block">
        {label && <span className="block font-body-sm text-body-sm font-medium text-secondary mb-1">{label}</span>}
        {isMultiline(value) ? (
          <textarea
            className="w-full px-3 py-2 rounded-lg border border-outline-variant font-body-sm text-body-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
            rows={3}
            value={value}
            onChange={(e) => onChange(path, e.target.value)}
          />
        ) : (
          <input
            type="text"
            className="w-full px-3 py-2 rounded-lg border border-outline-variant font-body-sm text-body-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
            value={value}
            onChange={(e) => onChange(path, e.target.value)}
          />
        )}
      </label>
    );
  }

  if (typeof value === "number") {
    return (
      <label className="block">
        {label && <span className="block font-body-sm text-body-sm font-medium text-secondary mb-1">{label}</span>}
        <input
          type="number"
          step="any"
          className="w-full px-3 py-2 rounded-lg border border-outline-variant font-body-sm text-body-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
          value={value}
          onChange={(e) => onChange(path, parseFloat(e.target.value) || 0)}
        />
      </label>
    );
  }

  if (typeof value === "boolean") {
    return (
      <label className="flex items-center gap-2 py-1">
        <input
          type="checkbox"
          checked={value}
          onChange={(e) => onChange(path, e.target.checked)}
        />
        {label && <span className="font-body-sm text-body-sm font-medium text-secondary">{label}</span>}
      </label>
    );
  }

  if (Array.isArray(value)) {
    return (
      <div>
        {label && <span className="block font-label-caps text-label-caps text-secondary uppercase tracking-wider mb-2">{label}</span>}
        <div className="space-y-3">
          {value.map((item, i) => (
            <div key={i} className="relative border border-outline-variant rounded-lg p-3 pr-10">
              <ContentFieldEditor value={item} path={[...path, i]} onChange={onChange} />
              <button
                type="button"
                onClick={() => {
                  const next = value.filter((_, idx) => idx !== i);
                  onChange(path, next);
                }}
                className="absolute top-2 right-2 text-secondary hover:text-error text-xs cursor-pointer"
                aria-label="Remover item"
              >
                <span className="material-symbols-outlined text-[18px]">delete</span>
              </button>
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={() => {
            const template = value.length > 0 ? emptyLike(value[0]) : "";
            onChange(path, [...value, template]);
          }}
          className="mt-2 text-primary font-body-sm text-body-sm font-medium hover:underline cursor-pointer"
        >
          + Adicionar item
        </button>
      </div>
    );
  }

  if (typeof value === "object" && value !== null) {
    return (
      <div className="space-y-3">
        {label && <span className="block font-label-caps text-label-caps text-secondary uppercase tracking-wider">{label}</span>}
        {Object.keys(value as Record<string, unknown>).map((key) => (
          <ContentFieldEditor
            key={key}
            value={(value as Record<string, unknown>)[key]}
            path={[...path, key]}
            label={humanize(key)}
            onChange={onChange}
          />
        ))}
      </div>
    );
  }

  return null;
}

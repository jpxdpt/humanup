"use client";

interface PaginationControlsProps {
  offset: number;
  limit: number;
  total: number;
  onChange: (offset: number) => void;
}

export function PaginationControls({ offset, limit, total, onChange }: PaginationControlsProps) {
  const currentPage = Math.floor(offset / limit) + 1;
  const totalPages = Math.max(Math.ceil(total / limit), 1);
  const hasPrev = offset > 0;
  const hasNext = offset + limit < total;

  if (total <= limit) return null;

  return (
    <div className="flex items-center justify-between px-1 py-3 border-t border-surface-variant mt-4">
      <span className="text-body-sm text-secondary">
        Página {currentPage} de {totalPages} ({total} total)
      </span>
      <div className="flex items-center gap-2">
        <button
          onClick={() => onChange(Math.max(offset - limit, 0))}
          disabled={!hasPrev}
          className="px-3 py-1.5 rounded-lg border border-outline-variant text-secondary hover:bg-surface-container disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer font-button text-button"
        >
          Anterior
        </button>
        <button
          onClick={() => onChange(offset + limit)}
          disabled={!hasNext}
          className="px-3 py-1.5 rounded-lg border border-outline-variant text-secondary hover:bg-surface-container disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer font-button text-button"
        >
          Próxima
        </button>
      </div>
    </div>
  );
}

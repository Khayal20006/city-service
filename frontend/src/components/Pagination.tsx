function ChevronLeft({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2.2">
      <path d="M15 6l-6 6 6 6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function ChevronRight({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2.2">
      <path d="M9 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export default function Pagination({
  page,
  totalPages,
  totalElements,
  onChange,
}: {
  page: number
  totalPages: number
  totalElements: number
  onChange: (page: number) => void
}) {
  if (totalPages <= 1) {
    return (
      <p className="px-1 py-3 text-xs text-slate-500">
        Cəmi <span className="font-semibold text-slate-700">{totalElements}</span> nəticə
      </p>
    )
  }

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 px-1 py-3">
      <p className="text-xs text-slate-500">
        Cəmi <span className="font-semibold text-slate-700">{totalElements}</span> nəticə · Səhifə{' '}
        <span className="font-semibold text-slate-700">{page + 1}</span> / {totalPages}
      </p>
      <div className="flex items-center gap-1.5">
        <button
          type="button"
          onClick={() => onChange(page - 1)}
          disabled={page <= 0}
          className="inline-flex size-8 items-center justify-center rounded-lg text-slate-600 ring-1 ring-slate-300 transition hover:bg-slate-50 disabled:opacity-40"
          aria-label="Əvvəlki səhifə"
        >
          <ChevronLeft className="size-4" />
        </button>
        {pageNumbers(page, totalPages).map((item, index) =>
          item === null ? (
            <span key={`gap-${index}`} className="px-1 text-xs text-slate-400">
              …
            </span>
          ) : (
            <button
              key={item}
              type="button"
              onClick={() => onChange(item)}
              className={`size-8 rounded-lg text-sm font-medium transition ${
                item === page
                  ? 'bg-brand-600 text-white shadow-sm'
                  : 'text-slate-600 ring-1 ring-slate-300 hover:bg-slate-50'
              }`}
            >
              {item + 1}
            </button>
          ),
        )}
        <button
          type="button"
          onClick={() => onChange(page + 1)}
          disabled={page >= totalPages - 1}
          className="inline-flex size-8 items-center justify-center rounded-lg text-slate-600 ring-1 ring-slate-300 transition hover:bg-slate-50 disabled:opacity-40"
          aria-label="Növbəti səhifə"
        >
          <ChevronRight className="size-4" />
        </button>
      </div>
    </div>
  )
}

/** Compact page list: 1 … 4 5 6 … 20 */
function pageNumbers(current: number, total: number): (number | null)[] {
  const pages = new Set<number>([0, total - 1, current])
  if (current > 1) pages.add(current - 1)
  if (current < total - 2) pages.add(current + 1)

  const sorted = [...pages].filter((value) => value >= 0 && value < total).sort((a, b) => a - b)
  const result: (number | null)[] = []
  let previous = -1

  for (const value of sorted) {
    if (previous !== -1 && value - previous > 1) {
      result.push(null)
    }
    result.push(value)
    previous = value
  }

  return result
}
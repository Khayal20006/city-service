import { api } from '../lib/api'
import { useFetch } from '../hooks/useFetch'
import { formatHours } from '../lib/format'
import type { Category } from '../lib/types'
import { Alert, Badge, Card, SectionTitle, SkeletonCard } from '../components/ui'

export default function CategoriesPage() {
  const { data, loading, error } = useFetch<Category[]>(
    () => api.get<Category[]>('/api/categories').then((response) => response.data),
    [],
  )

  return (
    <div className="animate-fade-in">
      <SectionTitle
        kicker="Xidmət sahələri"
        title="Şikayət kateqoriyaları"
        description="Hər kateqoriya müvafiq şöbəyə yönləndirilir və təxmini həll müddəti ilə bəyan olunur."
      />

      {loading && (
        <div className="grid gap-4 md:grid-cols-2" aria-hidden>
          {Array.from({ length: 6 }).map((_, index) => (
            <SkeletonCard key={index} />
          ))}
        </div>
      )}
      {error && <Alert tone="error">{error}</Alert>}

      {data && (
        <div className="grid gap-4 md:grid-cols-2">
          {data.map((category) => (
            <Card key={category.id} className="flex flex-col p-6 transition duration-300 hover:border-brand-300 hover:shadow-lift">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="display text-base text-ink">{category.name}</h3>
                  <p className="mt-0.5 text-xs font-medium text-ink/50">{category.departmentName}</p>
                </div>
                {!category.active && (
                  <Badge className="bg-ink/4 text-ink/45 ring-ink/12">Passiv</Badge>
                )}
              </div>

              <p className="mt-3 flex-1 text-sm leading-relaxed text-ink/60">{category.description}</p>

              <dl className="mt-5 grid grid-cols-2 gap-3 border-t border-ink/6 pt-4 text-xs">
                <div>
                  <dt className="text-ink/45">Təxmini həll</dt>
                  <dd className="display mt-0.5 text-sm text-ink">
                    {formatHours(category.estimatedResolutionHours)}
                  </dd>
                </div>
                <div>
                  <dt className="text-ink/45">Açıq şikayət</dt>
                  <dd className="display mt-0.5 text-sm text-ink tabular-nums">{category.openComplaints}</dd>
                </div>
              </dl>

              {category.contactEmail && (
                <a
                  href={`mailto:${category.contactEmail}`}
                  className="mt-4 text-xs font-semibold text-brand-700 hover:text-brand-800"
                >
                  {category.contactEmail}
                </a>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
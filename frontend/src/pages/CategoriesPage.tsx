import { api } from '../lib/api'
import { useFetch } from '../hooks/useFetch'
import { formatHours } from '../lib/format'
import type { Category } from '../lib/types'
import { Alert, Badge, Card, PageLoader, SectionTitle } from '../components/ui'

export default function CategoriesPage() {
  const { data, loading, error } = useFetch<Category[]>(
    () => api.get<Category[]>('/api/categories').then((response) => response.data),
    [],
  )

  return (
    <div>
      <SectionTitle
        title="Xidmət kateqoriyaları"
        description="Hər kateqoriya müvafiq şöbəyə yönləndirilir. Təxmini həll müddəti kateqoriyanın idarəsi tərəfindən verilir."
      />

      {loading && <PageLoader />}
      {error && <Alert tone="error">{error}</Alert>}

      {data && (
        <div className="grid gap-4 md:grid-cols-2">
          {data.map((category) => (
            <Card key={category.id} className="flex flex-col p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-base font-semibold text-slate-900">{category.name}</h3>
                  <p className="mt-0.5 text-xs text-slate-500">{category.departmentName}</p>
                </div>
                {!category.active && <Badge className="bg-slate-100 text-slate-500 ring-slate-200">Passiv</Badge>}
              </div>

              <p className="mt-3 flex-1 text-sm text-slate-600">{category.description}</p>

              <dl className="mt-4 grid grid-cols-2 gap-3 border-t border-slate-100 pt-3 text-xs">
                <div>
                  <dt className="text-slate-500">Təxmini həll</dt>
                  <dd className="mt-0.5 font-semibold text-slate-800">
                    {formatHours(category.estimatedResolutionHours)}
                  </dd>
                </div>
                <div>
                  <dt className="text-slate-500">Açıq şikayət</dt>
                  <dd className="mt-0.5 font-semibold text-slate-800">{category.openComplaints}</dd>
                </div>
              </dl>

              {category.contactEmail && (
                <a
                  href={`mailto:${category.contactEmail}`}
                  className="mt-3 text-xs font-medium text-brand-700 hover:underline"
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
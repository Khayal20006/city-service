import { api } from '../lib/api'
import { useFetch } from '../hooks/useFetch'
import type { ComplaintMarker } from '../lib/types'
import { MarkerMap } from '../components/map'
import { Alert, Card, EmptyState, PageLoader, SectionTitle } from '../components/ui'

export default function MyMapPage() {
  // The map endpoint is staff-only, so the citizen view works off their own complaints.
  const { data, loading, error } = useFetch<ComplaintMarker[]>(
    () =>
      api
        .get<{ content: ComplaintMarker[] }>('/api/complaints/mine', { params: { size: 100 } })
        .then((response) => response.data.content)
        .then((complaints) =>
          complaints.map((complaint) => ({
            id: complaint.id,
            referenceCode: complaint.referenceCode,
            title: complaint.title,
            status: complaint.status,
            priority: complaint.priority,
            latitude: complaint.latitude,
            longitude: complaint.longitude,
            district: complaint.district,
            categoryName: complaint.categoryName,
            createdAt: complaint.createdAt,
          })),
        ),
    [],
  )

  const markers = data ?? []

  return (
    <div>
      <SectionTitle
        title="Şikayətlərim — xəritə"
        description="Yalnız öz şikayətlərinizin yerləri göstərilir. Rənglər vaciblik dərəcəsini bildirir."
      />

      {loading && <PageLoader />}
      {error && <Alert tone="error">{error}</Alert>}

      {!loading && markers.length === 0 && (
        <Card>
          <EmptyState
            title="Xəritədə göstəriləcək şikayət yoxdur"
            description="Yer seçib şikayət verdikdən sonra marker burada görünəcək."
          />
        </Card>
      )}

      {markers.length > 0 && (
        <>
          <MarkerMap markers={markers} className="h-[520px]" />
          <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-slate-500">
            <span className="font-semibold text-slate-600">Vaciblik:</span>
            <Legend color="#64748b" label="Aşağı" />
            <Legend color="#0ea5e9" label="Normal" />
            <Legend color="#f97316" label="Yüksək" />
            <Legend color="#e11d48" label="Təcili" />
            <span className="ml-auto">{markers.length} marker</span>
          </div>
        </>
      )}
    </div>
  )
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className="size-3 rounded-full border-2 border-white shadow" style={{ backgroundColor: color }} />
      {label}
    </span>
  )
}
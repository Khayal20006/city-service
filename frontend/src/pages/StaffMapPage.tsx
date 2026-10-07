import { useState } from 'react'
import { api } from '../lib/api'
import { useFetch } from '../hooks/useFetch'
import { BAKU_DISTRICTS, STATUS_LABELS, STATUS_ORDER } from '../lib/format'
import type { Category, ComplaintMarker, ComplaintStatus } from '../lib/types'
import { MarkerMap } from '../components/map'
import { Alert, Button, Card, Field, PageLoader, SectionTitle, StatCard } from '../components/ui'

export default function StaffMapPage() {
  const [status, setStatus] = useState<ComplaintStatus | ''>('')
  const [categoryId, setCategoryId] = useState('')
  const [district, setDistrict] = useState('')

  const { data: categories } = useFetch<Category[]>(
    () => api.get<Category[]>('/api/categories').then((response) => response.data),
    [],
  )

  const { data, loading, error } = useFetch<ComplaintMarker[]>(
    () =>
      api
        .get<ComplaintMarker[]>('/api/complaints/map', {
          params: {
            status: status || undefined,
            categoryId: categoryId || undefined,
            district: district || undefined,
            limit: 500,
          },
        })
        .then((response) => response.data),
    [status, categoryId, district],
  )

  const markers = data ?? []
  const urgent = markers.filter((marker) => marker.priority === 'URGENT').length
  const open = markers.filter((marker) => marker.status !== 'RESOLVED').length

  function reset() {
    setStatus('')
    setCategoryId('')
    setDistrict('')
  }

  return (
    <div>
      <SectionTitle
        title="Şəhər xəritəsi"
        description="Bütün şikayət nöqtələri. Rəng vaciblik, marker içindəki halqa isə statusu göstərir."
      />

      <div className="mb-5 grid gap-4 sm:grid-cols-3">
        <StatCard label="Marker" value={markers.length} />
        <StatCard label="Həll olunmamış" value={open} tone="amber" />
        <StatCard label="Təcili" value={urgent} tone="rose" />
      </div>

      <Card className="mb-5 p-4">
        <div className="grid gap-4 sm:grid-cols-4">
          <Field label="Status">
            <select
              className="field-input"
              value={status}
              onChange={(event) => setStatus(event.target.value as ComplaintStatus | '')}
            >
              <option value="">Hamısı</option>
              {STATUS_ORDER.map((value) => (
                <option key={value} value={value}>
                  {STATUS_LABELS[value]}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Kateqoriya">
            <select
              className="field-input"
              value={categoryId}
              onChange={(event) => setCategoryId(event.target.value)}
            >
              <option value="">Hamısı</option>
              {(categories ?? []).map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Rayon">
            <select
              className="field-input"
              value={district}
              onChange={(event) => setDistrict(event.target.value)}
            >
              <option value="">Hamısı</option>
              {BAKU_DISTRICTS.map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
          </Field>

          <div className="flex items-end">
            <Button variant="secondary" fullWidth onClick={reset}>
              Filterləri təmizlə
            </Button>
          </div>
        </div>
      </Card>

      {loading && <PageLoader />}
      {error && <Alert tone="error">{error}</Alert>}

      {!loading && !error && (
        <>
          <MarkerMap markers={markers} className="h-[560px]" />
          {markers.length === 0 && (
            <p className="mt-4 text-center text-sm text-ink/50">
              Seçilmiş filtrlərə uyğun şikayət tapılmadı.
            </p>
          )}
        </>
      )}
    </div>
  )
}
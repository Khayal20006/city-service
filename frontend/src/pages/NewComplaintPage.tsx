import { useEffect, useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { api, ApiError } from '../lib/api'
import { useFetch } from '../hooks/useFetch'
import { BAKU_DISTRICTS, PRIORITY_LABELS, formatBytes } from '../lib/format'
import type { Category, Complaint, Priority } from '../lib/types'
import { LocationPicker } from '../components/map'
import { Alert, Button, Card, CardHeader, Field, SectionTitle } from '../components/ui'

const MAX_IMAGE_BYTES = 5 * 1024 * 1024

export default function NewComplaintPage() {
  const navigate = useNavigate()
  const { data: categories } = useFetch<Category[]>(
    () => api.get<Category[]>('/api/categories').then((response) => response.data),
    [],
  )

  const [form, setForm] = useState({
    title: '',
    description: '',
    categoryName: '',
    district: '',
    address: '',
    priority: 'NORMAL' as Priority,
  })
  const [position, setPosition] = useState<{ lat: number; lng: number } | null>(null)
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (categories && categories.length > 0 && !form.categoryName) {
      setForm((previous) => ({ ...previous, categoryName: categories[0].name }))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categories])

  function update(field: keyof typeof form, value: string) {
    setForm((previous) => ({ ...previous, [field]: value }))
  }

  async function handleUpload(file: File) {
    if (!file.type.startsWith('image/')) {
      setError('Yalnız şəkil faylı yükləyə bilərsiniz')
      return
    }
    if (file.size > MAX_IMAGE_BYTES) {
      setError(`Şəkil ${formatBytes(MAX_IMAGE_BYTES)}-dən kiçik olmalıdır`)
      return
    }

    setUploading(true)
    setError(null)
    try {
      const body = new FormData()
      body.append('file', file)
      const { data } = await api.post<{ url: string }>('/api/files/image', body, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      setImageUrl(data.url)
    } catch (cause) {
      setError(cause instanceof ApiError ? cause.message : 'Şəkil yüklənmədi')
    } finally {
      setUploading(false)
    }
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (!position) {
      setError('Problem yerini xəritədə seçin')
      return
    }
    setError(null)
    setSubmitting(true)
    try {
      const { data } = await api.post<Complaint>('/api/complaints', {
        title: form.title.trim(),
        description: form.description.trim(),
        categoryName: form.categoryName,
        latitude: position.lat,
        longitude: position.lng,
        district: form.district || undefined,
        address: form.address || undefined,
        imageUrl: imageUrl ?? undefined,
        priority: form.priority,
      })
      navigate(`/complaints/${data.id}`)
    } catch (cause) {
      setError(cause instanceof ApiError ? cause.message : 'Şikayət göndərilmədi')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="mx-auto max-w-4xl">
      <SectionTitle
        title="Yeni şikayət"
        description="Problem yerini xəritədə göstərin və məlumatları doldurun — şikayətiniz məsul idarəyə avtomatik yönləndiriləcək."
      />

      <form onSubmit={handleSubmit} className="space-y-5">
        {error && <Alert tone="error">{error}</Alert>}

        <Card>
          <CardHeader title="Problem yeri" subtitle="Xəritəyə klikləyin" />
          <div className="p-5">
            <LocationPicker
            value={position}
            onChange={(next) => setPosition({ lat: next[0], lng: next[1] })}
          />
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <Field label="Rayon">
                <select
                  className="field-input"
                  value={form.district}
                  onChange={(event) => update('district', event.target.value)}
                >
                  <option value="">Seçin (istəyə bağlı)</option>
                  {BAKU_DISTRICTS.map((district) => (
                    <option key={district} value={district}>
                      {district}
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="Ünvan və təfsilat">
                <input
                  className="field-input"
                  value={form.address}
                  onChange={(event) => update('address', event.target.value)}
                  placeholder="Məsələn, küçə 45, ev 12"
                  maxLength={300}
                />
              </Field>
            </div>

            {position && (
              <p className="mt-3 font-mono text-xs text-slate-500">
                {position.lat.toFixed(6)}, {position.lng.toFixed(6)}
              </p>
            )}
          </div>
        </Card>

        <Card>
          <CardHeader title="Şikayət məlumatları" />
          <div className="space-y-4 p-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Kateqoriya">
                <select
                  className="field-input"
                  value={form.categoryName}
                  onChange={(event) => update('categoryName', event.target.value)}
                  required
                >
                  {(categories ?? []).map((category) => (
                    <option key={category.id} value={category.name}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="Vaciblik dərəcəsi">
                <select
                  className="field-input"
                  value={form.priority}
                  onChange={(event) => update('priority', event.target.value)}
                >
                  {(Object.keys(PRIORITY_LABELS) as Priority[]).map((priority) => (
                    <option key={priority} value={priority}>
                      {PRIORITY_LABELS[priority]}
                    </option>
                  ))}
                </select>
              </Field>
            </div>

            <Field label="Başlıq">
              <input
                className="field-input"
                value={form.title}
                onChange={(event) => update('title', event.target.value)}
                required
                maxLength={120}
                placeholder="Nümunə: Küçə fənəri işləmir"
              />
            </Field>

            <Field label="Təfsilat" hint="10-4000 simvol arasında">
              <textarea
                className="field-input min-h-32 resize-y"
                value={form.description}
                onChange={(event) => update('description', event.target.value)}
                required
                minLength={10}
                maxLength={4000}
                placeholder="Problem nədir, nə qədər müddətdir davam edir, təhlükə varmı?"
              />
            </Field>

            <Field label="Şəkil" hint="JPG, PNG, WEBP və ya GIF · maksimum 5 MB">
              <div className="flex flex-wrap items-center gap-3">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(event) => {
                    const file = event.target.files?.[0]
                    if (file) void handleUpload(file)
                  }}
                  className="text-sm text-slate-600 file:mr-3 file:rounded-lg file:border-0
                    file:bg-brand-50 file:px-4 file:py-2 file:text-sm file:font-semibold
                    file:text-brand-700 hover:file:bg-brand-100"
                />
                {uploading && <span className="text-xs text-slate-500">Yüklənir…</span>}
              </div>
              {imageUrl && (
                <div className="mt-3 flex items-center gap-3">
                  <img
                    src={imageUrl}
                    alt="Yüklənmiş şəkil"
                    loading="lazy"
                    decoding="async"
                    className="size-20 rounded-xl object-cover ring-1 ring-slate-200"
                  />
                  <Button type="button" variant="ghost" size="sm" onClick={() => setImageUrl(null)}>
                    Sil
                  </Button>
                </div>
              )}
            </Field>
          </div>
        </Card>

        <div className="flex justify-end gap-3">
          <Button type="button" variant="secondary" onClick={() => navigate(-1)}>
            Ləğv et
          </Button>
          <Button type="submit" size="lg" loading={submitting}>
            Şikayəti göndər
          </Button>
        </div>
      </form>
    </div>
  )
}
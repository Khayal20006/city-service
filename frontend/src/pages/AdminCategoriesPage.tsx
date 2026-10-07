import { useState, type FormEvent } from 'react'
import { api, ApiError } from '../lib/api'
import { useFetch } from '../hooks/useFetch'
import { formatHours } from '../lib/format'
import type { Category, CategoryInput } from '../lib/types'
import { Alert, Badge, Button, Card, CardHeader, Field, PageLoader, SectionTitle } from '../components/ui'

const EMPTY_FORM: CategoryInput = {
  name: '',
  description: '',
  departmentName: '',
  contactEmail: '',
  estimatedResolutionHours: 72,
  active: true,
}

export default function AdminCategoriesPage() {
  const { data, loading, reload } = useFetch<Category[]>(
    () => api.get<Category[]>('/api/categories', { params: { onlyActive: false } }).then((r) => r.data),
    [],
  )

  const [editing, setEditing] = useState<Category | null>(null)
  const [form, setForm] = useState<CategoryInput>(EMPTY_FORM)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  function startCreate() {
    setEditing(null)
    setForm(EMPTY_FORM)
    setError(null)
    setSuccess(null)
  }

  function startEdit(category: Category) {
    setEditing(category)
    setForm({
      name: category.name,
      description: category.description ?? '',
      departmentName: category.departmentName,
      contactEmail: category.contactEmail ?? '',
      estimatedResolutionHours: category.estimatedResolutionHours,
      active: category.active,
    })
    setError(null)
    setSuccess(null)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setBusy(true)
    setError(null)
    setSuccess(null)
    try {
      const payload: CategoryInput = {
        ...form,
        description: form.description || undefined,
        contactEmail: form.contactEmail || undefined,
      }
      if (editing) {
        await api.put(`/api/categories/${editing.id}`, payload)
        setSuccess('Kateqoriya yeniləndi')
      } else {
        await api.post('/api/categories', payload)
        setSuccess('Kateqoriya yaradıldı')
      }
      startCreate()
      reload()
    } catch (cause) {
      setError(cause instanceof ApiError ? cause.message : 'Saxlanmadı')
    } finally {
      setBusy(false)
    }
  }

  async function deactivate(category: Category) {
    setBusy(true)
    setError(null)
    try {
      await api.delete(`/api/categories/${category.id}`)
      setSuccess(`"${category.name}" deaktiv edildi`)
      reload()
    } catch (cause) {
      setError(cause instanceof ApiError ? cause.message : 'Deaktiv edilmədi')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div>
      <SectionTitle
        title="Kateqoriya idarəsi"
        description="Xidmət sahələrini, məsul idarələri və təxmini həll müddətlərini idarə edin"
        action={<Button onClick={startCreate}>Yeni kateqoriya</Button>}
      />

      {error && (
        <div className="mb-4">
          <Alert tone="error">{error}</Alert>
        </div>
      )}
      {success && (
        <div className="mb-4">
          <Alert tone="success">{success}</Alert>
        </div>
      )}

      <Card className="mb-6">
        <CardHeader
          title={editing ? `Redaktə: ${editing.name}` : 'Yeni kateqoriya'}
          action={
            editing ? (
              <Button variant="ghost" size="sm" onClick={startCreate}>
                Ləğv et
              </Button>
            ) : undefined
          }
        />
        <form onSubmit={handleSubmit} className="space-y-4 p-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Ad">
              <input
                className="field-input"
                value={form.name}
                onChange={(event) => setForm({ ...form, name: event.target.value })}
                required
                maxLength={100}
              />
            </Field>
            <Field label="Məsul idarə">
              <input
                className="field-input"
                value={form.departmentName}
                onChange={(event) => setForm({ ...form, departmentName: event.target.value })}
                required
                maxLength={150}
                placeholder="Yol-Kanalizasiya İdarəsi"
              />
            </Field>
          </div>

          <Field label="Təsvir">
            <textarea
              className="field-input min-h-20 resize-y"
              value={form.description}
              onChange={(event) => setForm({ ...form, description: event.target.value })}
              maxLength={500}
            />
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Əlaqə email">
              <input
                type="email"
                className="field-input"
                value={form.contactEmail}
                onChange={(event) => setForm({ ...form, contactEmail: event.target.value })}
                maxLength={150}
                placeholder="yol@city.gov.az"
              />
            </Field>
            <Field label="Təxmini həll (saat)">
              <input
                type="number"
                min={1}
                className="field-input"
                value={form.estimatedResolutionHours ?? 72}
                onChange={(event) =>
                  setForm({ ...form, estimatedResolutionHours: Number(event.target.value) })
                }
              />
            </Field>
          </div>

          <label className="flex items-center gap-2 text-sm text-ink/60">
            <input
              type="checkbox"
              checked={form.active ?? true}
              onChange={(event) => setForm({ ...form, active: event.target.checked })}
              className="size-4 rounded border-ink/25 accent-brand-600"
            />
            Aktiv (vətəndaşlar şikayət verə bilər)
          </label>

          <Button type="submit" loading={busy}>
            {editing ? 'Yenilə' : 'Yarat'}
          </Button>
        </form>
      </Card>

      {loading && <PageLoader />}

      {data && (
        <div className="grid gap-4 md:grid-cols-2">
          {data.map((category) => (
            <Card key={category.id} className="flex flex-col p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="display text-base text-ink">{category.name}</h3>
                  <p className="mt-0.5 text-xs text-ink/45">{category.departmentName}</p>
                </div>
                <Badge
                  className={
                    category.active
                      ? 'bg-emerald-600/10 text-emerald-700 ring-emerald-600/25'
                      : 'bg-ink/4 text-ink/45 ring-ink/12'
                  }
                >
                  {category.active ? 'Aktiv' : 'Passiv'}
                </Badge>
              </div>

              <p className="mt-2 flex-1 text-sm text-ink/55">{category.description}</p>

              <div className="mt-3 flex items-center justify-between border-t border-ink/8 pt-3 text-xs text-ink/45">
                <span>Açıq: {category.openComplaints}</span>
                <span>~{formatHours(category.estimatedResolutionHours)}</span>
              </div>

              <div className="mt-3 flex gap-2">
                <Button variant="secondary" size="sm" onClick={() => startEdit(category)}>
                  Redaktə
                </Button>
                {category.active && (
                  <Button variant="ghost" size="sm" loading={busy} onClick={() => void deactivate(category)}>
                    Deaktiv et
                  </Button>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
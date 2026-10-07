import { useState, type FormEvent } from 'react'
import { api, ApiError } from '../lib/api'
import { useAuth } from '../context/AuthContext'
import { ROLE_LABELS, formatDate } from '../lib/format'
import type { User } from '../lib/types'
import { Alert, Badge, Button, Card, CardHeader, Field, SectionTitle } from '../components/ui'

export default function ProfilePage() {
  const { user, refresh } = useAuth()
  const [form, setForm] = useState({
    email: user?.email ?? '',
    fullName: user?.fullName ?? '',
    phoneNumber: user?.phoneNumber ?? '',
  })
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [saving, setSaving] = useState(false)

  if (!user) return null

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setError(null)
    setSuccess(false)
    setSaving(true)
    try {
      await api.put<User>(`/api/users/${user!.id}`, {
        email: form.email.trim() || undefined,
        fullName: form.fullName.trim() || undefined,
        phoneNumber: form.phoneNumber.trim() || undefined,
      })
      await refresh()
      setSuccess(true)
    } catch (cause) {
      setError(cause instanceof ApiError ? cause.message : 'Məlumatlar yenilənmədi')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="mx-auto max-w-3xl animate-fade-in">
      <SectionTitle title="Profil" description="Şəxsi məlumatlarınızı yeniləyin" />

      <div className="space-y-5">
        <Card>
          <div className="flex flex-wrap items-center gap-4 p-6">
            <span className="flex size-16 items-center justify-center rounded-2xl bg-ink text-xl font-semibold text-parchment">
              {(user.fullName || user.username).slice(0, 2).toUpperCase()}
            </span>
            <div>
              <p className="display text-xl text-ink">{user.fullName || user.username}</p>
              <p className="mt-0.5 text-sm text-ink/55">{user.email}</p>
              <div className="mt-2 flex flex-wrap gap-2">
                <Badge className="bg-brand-600/10 text-brand-700 ring-brand-600/25">
                  {ROLE_LABELS[user.role]}
                </Badge>
                <Badge
                  className={
                    user.active
                      ? 'bg-emerald-600/10 text-emerald-700 ring-emerald-600/25'
                      : 'bg-rose-600/10 text-rose-700 ring-rose-600/25'
                  }
                >
                  {user.active ? 'Aktiv' : 'Bloklanıb'}
                </Badge>
              </div>
            </div>
            <p className="ml-auto text-xs text-ink/45">Qeydiyyat: {formatDate(user.createdAt)}</p>
          </div>
        </Card>

        <Card>
          <CardHeader title="Məlumatları redaktə et" />
          <form onSubmit={handleSubmit} className="space-y-4 p-6">
            {error && <Alert tone="error">{error}</Alert>}
            {success && <Alert tone="success">Məlumatlar yeniləndi</Alert>}

            <Field label="Ad, soyad">
              <input
                className="field-input"
                value={form.fullName}
                onChange={(event) => setForm({ ...form, fullName: event.target.value })}
                maxLength={120}
              />
            </Field>

            <Field label="Email">
              <input
                type="email"
                className="field-input"
                value={form.email}
                onChange={(event) => setForm({ ...form, email: event.target.value })}
                maxLength={150}
              />
            </Field>

            <Field label="Telefon">
              <input
                className="field-input"
                value={form.phoneNumber}
                onChange={(event) => setForm({ ...form, phoneNumber: event.target.value })}
                maxLength={20}
                placeholder="+994 50 123 45 67"
              />
            </Field>

            <Button type="submit" loading={saving}>
              Yadda saxla
            </Button>
          </form>
        </Card>

        <Alert tone="info" title="Təhlükəsizlik">
          Parolu dəyişmək və ya ikiaddımlı doğrulama üçün{' '}
          <a href="mailto:destek@city.gov.az" className="font-semibold underline">
            destek@city.gov.az
          </a>{' '}
          ünvanına müraciət edin.
        </Alert>
      </div>
    </div>
  )
}
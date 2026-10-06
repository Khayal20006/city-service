import { useState, type FormEvent } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { ApiError } from '../lib/api'
import AuthShell from '../components/AuthShell'
import { Alert, Button, Field } from '../components/ui'

export default function RegisterPage() {
  const { register, user } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
    fullName: '',
    phoneNumber: '',
  })
  const [error, setError] = useState<string | null>(null)
  const [details, setDetails] = useState<string[]>([])
  const [submitting, setSubmitting] = useState(false)

  if (user) {
    return <Navigate to="/" replace />
  }

  function update(field: keyof typeof form, value: string) {
    setForm((previous) => ({ ...previous, [field]: value }))
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setError(null)
    setDetails([])
    setSubmitting(true)
    try {
      await register({
        username: form.username.trim(),
        email: form.email.trim(),
        password: form.password,
        fullName: form.fullName.trim() || undefined,
        phoneNumber: form.phoneNumber.trim() || undefined,
      })
      navigate('/complaints/new', { replace: true })
    } catch (cause) {
      if (cause instanceof ApiError) {
        setError(cause.message)
        setDetails(cause.details)
      } else {
        setError('Qeydiyyat mümkün olmadı')
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AuthShell
      kicker="Qeydiyyat"
      title="Pulsuz hesab yaradın"
      subtitle="Ad və telefon isteğe bağlıdır — istifadəçi adı və parolla başlayın."
      footer={
        <>
          Artıq hesabınız var?{' '}
          <Link to="/login" className="font-semibold text-brand-700 hover:text-brand-800">
            Daxil olun
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <Alert tone="error">
            <p>{error}</p>
            {details.length > 0 && (
              <ul className="mt-1.5 list-disc space-y-0.5 pl-4 text-xs">
                {details.map((detail) => (
                  <li key={detail}>{detail}</li>
                ))}
              </ul>
            )}
          </Alert>
        )}

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="İstifadəçi adı" hint="Hərf, rəqəm, . _ -">
            <input
              className="field-input"
              value={form.username}
              onChange={(event) => update('username', event.target.value)}
              autoComplete="username"
              required
              placeholder="aysel"
            />
          </Field>

          <Field label="Ad, soyad" hint="Ola şərti">
            <input
              className="field-input"
              value={form.fullName}
              onChange={(event) => update('fullName', event.target.value)}
              autoComplete="name"
              placeholder="Aysel Məmmədova"
            />
          </Field>
        </div>

        <Field label="Email">
          <input
            type="email"
            className="field-input"
            value={form.email}
            onChange={(event) => update('email', event.target.value)}
            autoComplete="email"
            required
            placeholder="aysel@example.az"
          />
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Parol" hint="Ən azı 8 simvol">
            <input
              type="password"
              className="field-input"
              value={form.password}
              onChange={(event) => update('password', event.target.value)}
              autoComplete="new-password"
              required
              minLength={8}
              placeholder="••••••••"
            />
          </Field>

          <Field label="Telefon" hint="İsteğe bağlı, max 20 simvol">
            <input
              className="field-input"
              value={form.phoneNumber}
              onChange={(event) => update('phoneNumber', event.target.value)}
              autoComplete="tel"
              placeholder="+994 50 123 45 67"
            />
          </Field>
        </div>

        <Button type="submit" size="lg" fullWidth loading={submitting}>
          Hesab yarat
          {!submitting && <span aria-hidden>→</span>}
        </Button>
      </form>
    </AuthShell>
  )
}
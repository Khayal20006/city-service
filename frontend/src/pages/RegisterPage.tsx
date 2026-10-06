import { useState, type FormEvent } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { ApiError } from '../lib/api'
import { Alert, Button, Card, Field } from '../components/ui'

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
    <div className="mx-auto max-w-md py-6">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Hesab yaradın</h1>
        <p className="mt-1.5 text-sm text-slate-500">
          Şikayət vermək və həllini izləmək üçün pulsuz hesab yaradın
        </p>
      </div>

      <Card className="p-6">
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

          <Field label="Ad, soyad" hint="Nəzərdə tutulmur, amma idarə ilə əlaqə üçün faydalıdır">
            <input
              className="field-input"
              value={form.fullName}
              onChange={(event) => update('fullName', event.target.value)}
              autoComplete="name"
              placeholder="Aysel Məmmədova"
            />
          </Field>

          <Field label="İstifadəçi adı" hint="3-50 simvol: hərf, rəqəm, . _ -">
            <input
              className="field-input"
              value={form.username}
              onChange={(event) => update('username', event.target.value)}
              autoComplete="username"
              required
              placeholder="aysel"
            />
          </Field>

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

          <Field label="Telefon" hint="İstəyə bağlı, maksimum 20 simvol">
            <input
              className="field-input"
              value={form.phoneNumber}
              onChange={(event) => update('phoneNumber', event.target.value)}
              autoComplete="tel"
              placeholder="+994 50 123 45 67"
            />
          </Field>

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

          <Button type="submit" size="lg" fullWidth loading={submitting}>
            Hesab yarat
          </Button>
        </form>

        <p className="mt-5 border-t border-slate-100 pt-5 text-center text-sm text-slate-500">
          Artıq hesabınız var?{' '}
          <Link to="/login" className="font-semibold text-brand-700 hover:underline">
            Daxil olun
          </Link>
        </p>
      </Card>
    </div>
  )
}
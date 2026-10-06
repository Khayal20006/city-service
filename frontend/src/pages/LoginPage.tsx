import { useState, type FormEvent } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { ApiError } from '../lib/api'
import { Alert, Button, Card, Field } from '../components/ui'

export default function LoginPage() {
  const { login, user } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const from = (location.state as { from?: string } | null)?.from

  if (user) {
    return <Navigate to={from ?? '/'} replace />
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      await login({ username: username.trim(), password })
      navigate(from ?? '/', { replace: true })
    } catch (cause) {
      setError(cause instanceof ApiError ? cause.message : 'Giriş alınmadı')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="mx-auto max-w-md py-6">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Portala daxil olun</h1>
        <p className="mt-1.5 text-sm text-slate-500">
          Şikayətlərinizi izləmək üçün hesabınıza girin
        </p>
      </div>

      <Card className="p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <Alert tone="error">{error}</Alert>}

          <Field label="İstifadəçi adı">
            <input
              className="field-input"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              autoComplete="username"
              autoFocus
              required
              placeholder="aysel"
            />
          </Field>

          <Field label="Parol">
            <input
              type="password"
              className="field-input"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="current-password"
              required
              placeholder="••••••••"
            />
          </Field>

          <Button type="submit" size="lg" fullWidth loading={submitting}>
            Daxil ol
          </Button>
        </form>

        <p className="mt-5 border-t border-slate-100 pt-5 text-center text-sm text-slate-500">
          Hesabınız yoxdur?{' '}
          <Link to="/register" className="font-semibold text-brand-700 hover:underline">
            Qeydiyyatdan keçin
          </Link>
        </p>
      </Card>

      <div className="mt-5 rounded-xl bg-slate-100 px-4 py-3 text-xs text-slate-500">
        <p className="font-semibold text-slate-600">Demo hesabları</p>
        <p className="mt-1">Administrator: <code className="font-mono">admin</code> / Admin123!</p>
      </div>
    </div>
  )
}
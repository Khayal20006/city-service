import { useState, type FormEvent } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { ApiError } from '../lib/api'
import AuthShell from '../components/AuthShell'
import { Alert, Button, Field } from '../components/ui'

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
    <AuthShell
      kicker="Giriş"
      title="Portala daxil olun"
      subtitle="Şikayətlərinizin və təyinatlarınızın izini brauzerdən izləyin."
      footer={
        <>
          Hesabınız yoxdur?{' '}
          <Link to="/register" className="font-semibold text-brand-700 hover:text-brand-800">
            Qeydiyyatdan keçin
          </Link>
        </>
      }
    >
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
          {!submitting && <span aria-hidden>→</span>}
        </Button>
      </form>

      <div className="mt-5 rounded-xl bg-ink/4 px-4 py-3 text-xs text-ink/55 ring-1 ring-ink/8">
        <p className="font-semibold text-ink/70">Demo hesabı</p>
        <p className="mt-1">
          Administrator: <code className="font-mono">admin</code> /{' '}
          <code className="font-mono">Admin123!</code>
        </p>
      </div>
    </AuthShell>
  )
}
import { useState } from 'react'
import { api, ApiError } from '../lib/api'
import { useFetch } from '../hooks/useFetch'
import { useDebouncedValue } from '../hooks/useDebouncedValue'
import { useAuth } from '../context/AuthContext'
import { ROLE_LABELS, formatDate } from '../lib/format'
import type { Page, Role, User } from '../lib/types'
import Pagination from '../components/Pagination'
import { Alert, Badge, Button, Card, Field, PageLoader, SectionTitle } from '../components/ui'

const ROLES: Role[] = ['CITIZEN', 'DEPARTMENT_MANAGER', 'FIELD_EMPLOYEE', 'ADMIN']

export default function AdminUsersPage() {
  const { user: current } = useAuth()
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebouncedValue(search, 400)
  const [page, setPage] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [busyId, setBusyId] = useState<number | null>(null)

  const { data, loading, reload } = useFetch<Page<User>>(
    () =>
      api
        .get<Page<User>>('/api/users', {
          params: { username: debouncedSearch || undefined, page, size: 15 },
        })
        .then((response) => response.data),
    [debouncedSearch, page],
  )

  async function changeRole(target: User, role: Role) {
    setBusyId(target.id)
    setError(null)
    setSuccess(null)
    try {
      await api.put(`/api/users/${target.id}`, { role })
      setSuccess(`${target.username} → ${ROLE_LABELS[role]}`)
      reload()
    } catch (cause) {
      setError(cause instanceof ApiError ? cause.message : 'Rol dəyişdirilmədi')
    } finally {
      setBusyId(null)
    }
  }

  async function toggleActive(target: User) {
    setBusyId(target.id)
    setError(null)
    setSuccess(null)
    try {
      await api.put(`/api/users/${target.id}`, { active: !target.active })
      setSuccess(`${target.username} ${target.active ? 'bloklandı' : 'aktivləşdirildi'}`)
      reload()
    } catch (cause) {
      setError(cause instanceof ApiError ? cause.message : 'Status dəyişdirilmədi')
    } finally {
      setBusyId(null)
    }
  }

  return (
    <div>
      <SectionTitle
        title="İstifadəçilər"
        description="Rol təyin edin, hesabları bloklayın və ya aktivləşdirin"
      />

      <Card className="mb-5 p-4">
        <form
          className="flex flex-wrap items-end gap-3"
          onSubmit={(event) => {
            event.preventDefault()
            setPage(0)
            reload()
          }}
        >
          <div className="min-w-60 flex-1">
            <Field label="İstifadəçi adında axtarış">
              <input
                className="field-input"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="aysel"
              />
            </Field>
          </div>
          <Button type="submit">Axtar</Button>
        </form>
      </Card>

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

      {loading && <PageLoader />}

      {data && data.content.length === 0 && (
        <Card className="px-5 py-14 text-center text-sm text-slate-500">İstifadəçi tapılmadı</Card>
      )}

      {data && data.content.length > 0 && (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-3xl text-left text-sm">
              <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-3 font-semibold">İstifadəçi</th>
                  <th className="px-4 py-3 font-semibold">Email</th>
                  <th className="px-4 py-3 font-semibold">Rol</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold">Qeydiyyat</th>
                  <th className="px-4 py-3 text-right font-semibold">Əməliyyat</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data.content.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3">
                      <p className="font-medium text-slate-900">{item.fullName || item.username}</p>
                      <p className="text-xs text-slate-500">@{item.username}</p>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{item.email}</td>
                    <td className="px-4 py-3">
                      <select
                        className="rounded-lg border border-slate-300 px-2 py-1 text-xs"
                        value={item.role}
                        disabled={busyId === item.id || item.id === current?.id}
                        onChange={(event) => void changeRole(item, event.target.value as Role)}
                      >
                        {ROLES.map((role) => (
                          <option key={role} value={role}>
                            {ROLE_LABELS[role]}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      <Badge
                        className={
                          item.active
                            ? 'bg-emerald-50 text-emerald-700 ring-emerald-200'
                            : 'bg-rose-50 text-rose-700 ring-rose-200'
                        }
                      >
                        {item.active ? 'Aktiv' : 'Bloklanıb'}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-500">{formatDate(item.createdAt)}</td>
                    <td className="px-4 py-3 text-right">
                      <Button
                        variant={item.active ? 'ghost' : 'secondary'}
                        size="sm"
                        loading={busyId === item.id}
                        disabled={item.id === current?.id}
                        onClick={() => void toggleActive(item)}
                      >
                        {item.active ? 'Blokla' : 'Aktivləşdir'}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {data && (
        <Pagination
          page={data.page}
          totalPages={data.totalPages}
          totalElements={data.totalElements}
          onChange={setPage}
        />
      )}
    </div>
  )
}
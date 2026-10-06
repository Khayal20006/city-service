import { useState, type FormEvent } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { api, ApiError } from '../lib/api'
import { useFetch } from '../hooks/useFetch'
import { useAuth } from '../context/AuthContext'
import {
  PRIORITY_LABELS,
  ROLE_LABELS,
  STATUS_LABELS,
  STATUS_ORDER,
  formatDateTime,
  formatRelative,
} from '../lib/format'
import type { Complaint, ComplaintStatus, User } from '../lib/types'
import { MarkerMap } from '../components/map'
import {
  Alert,
  Badge,
  Button,
  Card,
  CardHeader,
  Field,
  PageLoader,
  PriorityBadge,
  StatusBadge,
} from '../components/ui'

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <dt className="text-xs text-slate-500">{label}</dt>
      <dd className="mt-0.5 text-sm font-medium text-slate-800">{value ?? '—'}</dd>
    </div>
  )
}

export default function ComplaintDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user, isStaff, isAdmin } = useAuth()

  const { data: complaint, loading, error, setData } = useFetch<Complaint>(
    () => api.get<Complaint>(`/api/complaints/${id}`).then((response) => response.data),
    [id],
  )

  const { data: assignees } = useFetch<User[]>(
    () =>
      isStaff
        ? Promise.all(
            (['FIELD_EMPLOYEE', 'DEPARTMENT_MANAGER'] as const).map((role) =>
              api.get<User[]>(`/api/users/by-role/${role}`).then((response) => response.data),
            ),
          ).then((groups) => groups.flat())
        : Promise.resolve([]),
    [isStaff],
  )

  const [message, setMessage] = useState('')
  const [internal, setInternal] = useState(false)
  const [nextStatus, setNextStatus] = useState<ComplaintStatus | ''>('')
  const [note, setNote] = useState('')
  const [assigneeId, setAssigneeId] = useState<number | null>(null)
  const [busy, setBusy] = useState(false)
  const [actionError, setActionError] = useState<string | null>(null)
  const [actionOk, setActionOk] = useState<string | null>(null)

  async function run(action: () => Promise<Complaint>, successMessage: string) {
    setBusy(true)
    setActionError(null)
    setActionOk(null)
    try {
      const updated = await action()
      setData(updated)
      setActionOk(successMessage)
      setMessage('')
      setNote('')
      setNextStatus('')
    } catch (cause) {
      setActionError(cause instanceof ApiError ? cause.message : 'Əməliyyat alınmadı')
    } finally {
      setBusy(false)
    }
  }

  async function handleComment(event: FormEvent) {
    event.preventDefault()
    if (!message.trim()) return
    await run(
      () =>
        api
          .post<Complaint>(`/api/complaints/${id}/comments`, {
            message: message.trim(),
            internal: isStaff ? internal : false,
          })
          .then((response) => response.data),
      'Mesaj əlavə edildi',
    )
  }

  if (loading) return <PageLoader />
  if (error || !complaint) {
    return (
      <Alert tone="error">
        {error ?? 'Şikayət tapılmadı'}{' '}
        <Link to="/complaints/mine" className="font-semibold underline">
          Siyahıya qayıt
        </Link>
      </Alert>
    )
  }

  const comments = (complaint.comments ?? []).filter((comment) => isStaff || !comment.internal)
  const position: [number, number] = [complaint.latitude, complaint.longitude]
  const timelineIndex = STATUS_ORDER.indexOf(complaint.status)

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <Link to="/complaints/mine" className="text-sm text-slate-500 hover:text-brand-700">
            ← Siyahıya qayıt
          </Link>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">{complaint.title}</h1>
          <p className="mt-1 font-mono text-xs text-brand-700">{complaint.referenceCode}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <StatusBadge status={complaint.status} />
          <PriorityBadge priority={complaint.priority} />
        </div>
      </div>

      {actionError && <Alert tone="error">{actionError}</Alert>}
      {actionOk && <Alert tone="success">{actionOk}</Alert>}

      <div className="grid gap-5 lg:grid-cols-3">
        <div className="space-y-5 lg:col-span-2">
          <Card>
            <CardHeader title="Şikayət məlumatları" subtitle={formatDateTime(complaint.createdAt)} />
            <div className="space-y-5 p-5">
              <p className="whitespace-pre-line text-sm leading-relaxed text-slate-700">
                {complaint.description}
              </p>

              {complaint.imageUrl && (
                <img
                  src={complaint.imageUrl}
                  alt={complaint.title}
                  loading="lazy"
                  decoding="async"
                  className="max-h-80 w-full rounded-xl object-cover ring-1 ring-slate-200"
                />
              )}

              <dl className="grid grid-cols-2 gap-4 border-t border-slate-100 pt-4 sm:grid-cols-3">
                <DetailRow label="Kateqoriya" value={complaint.categoryName} />
                <DetailRow label="Məsul idarə" value={complaint.departmentName} />
                <DetailRow label="Vaciblik" value={PRIORITY_LABELS[complaint.priority]} />
                <DetailRow label="Rayon" value={complaint.district} />
                <DetailRow label="Ünvan" value={complaint.address} />
                <DetailRow label="Son dəyişiklik" value={formatRelative(complaint.updatedAt)} />
              </dl>

              {complaint.resolutionNote && (
                <div className="rounded-xl bg-emerald-50 px-4 py-3 ring-1 ring-emerald-200">
                  <p className="text-xs font-semibold text-emerald-800">Həll qeydi</p>
                  <p className="mt-1 text-sm text-emerald-900">{complaint.resolutionNote}</p>
                </div>
              )}
            </div>
          </Card>

          <Card>
            <CardHeader title="Xəritə" />
            <div className="p-5">
              <MarkerMap markers={[complaint]} focus={position} />
            </div>
          </Card>

          <Card>
            <CardHeader
              title="Məlumat və şərhlər"
              subtitle={`${comments.length} mesaj`}
            />
            <div className="space-y-4 p-5">
              {comments.length === 0 && (
                <p className="py-4 text-center text-sm text-slate-500">Hələ mesaj yoxdur.</p>
              )}

              {comments.map((comment) => (
                <div
                  key={comment.id}
                  className={`rounded-xl p-4 ${
                    comment.internal ? 'bg-amber-50 ring-1 ring-amber-200' : 'bg-slate-50'
                  }`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-sm font-semibold text-slate-800">
                      {comment.author.fullName || comment.author.username}
                      <span className="ml-2 text-xs font-normal text-slate-500">
                        {ROLE_LABELS[comment.author.role]}
                      </span>
                    </p>
                    <span className="text-xs text-slate-400">{formatRelative(comment.createdAt)}</span>
                  </div>

                  {comment.internal && (
                    <Badge className="mt-1.5 bg-amber-100 text-amber-800 ring-amber-200">
                      Daxili qeyd — vətəndaşa göstərilmir
                    </Badge>
                  )}

                  <p className="mt-2 whitespace-pre-line text-sm text-slate-700">{comment.message}</p>

                  {comment.newStatus && (
                    <p className="mt-2 text-xs text-slate-500">
                      Status: {comment.previousStatus ? `${STATUS_LABELS[comment.previousStatus]} → ` : ''}
                      {STATUS_LABELS[comment.newStatus]}
                    </p>
                  )}
                </div>
              ))}

              <form onSubmit={handleComment} className="space-y-3 border-t border-slate-100 pt-4">
                <Field label={isStaff ? 'Qeyd və ya mesaj' : 'Mesaj göndərin'}>
                  <textarea
                    className="field-input min-h-24 resize-y"
                    value={message}
                    onChange={(event) => setMessage(event.target.value)}
                    placeholder={
                      isStaff
                        ? 'Daxili qeyd yazın və ya vətəndaşaya cavab verin'
                        : 'İdarəyə sual və əlavə məlumat yazın'
                    }
                    maxLength={2000}
                  />
                </Field>

                {isStaff && (
                  <label className="flex items-center gap-2 text-sm text-slate-600">
                    <input
                      type="checkbox"
                      checked={internal}
                      onChange={(event) => setInternal(event.target.checked)}
                      className="size-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
                    />
                    Daxili qeyd kimi işlət (vətəndaş görməz)
                  </label>
                )}

                <Button type="submit" loading={busy} disabled={!message.trim()}>
                  Göndər
                </Button>
              </form>
            </div>
          </Card>
        </div>

        <div className="space-y-5">
          <Card>
            <CardHeader title="Vətəndaş" />
            <dl className="space-y-3 p-5 text-sm">
              <DetailRow label="Ad, soyad" value={complaint.userFullName} />
              <DetailRow label="İstifadəçi adı" value={complaint.userName} />
              <DetailRow
                label="Məsul işçi"
                value={complaint.assignedToName ?? 'Təyin edilməyib'}
              />
            </dl>
          </Card>

          <Card>
            <CardHeader title="Status tarixçəsi" />
            <ol className="space-y-3 p-5">
              {STATUS_ORDER.map((status, index) => {
                const passed = timelineIndex >= index && !(complaint.closed && index > timelineIndex)
                const current = complaint.status === status
                return (
                  <li key={status} className="flex items-center gap-3">
                    <span
                      className={`flex size-6 shrink-0 items-center justify-center rounded-full text-[11px] font-bold ${
                        current
                          ? 'bg-brand-600 text-white'
                          : passed
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-slate-100 text-slate-400'
                      }`}
                    >
                      {passed && !current ? '✓' : index + 1}
                    </span>
                    <span
                      className={`text-sm ${
                        current ? 'font-semibold text-slate-900' : 'text-slate-500'
                      }`}
                    >
                      {STATUS_LABELS[status]}
                    </span>
                  </li>
                )
              })}
            </ol>
          </Card>

          {isStaff && (
            <Card>
              <CardHeader title="İdarəetmə" subtitle="Yalnız personal üçün" />
              <div className="space-y-4 p-5">
                <form
                  className="space-y-3"
                  onSubmit={(event) => {
                    event.preventDefault()
                    if (!nextStatus) return
                    void run(
                      () =>
                        api
                          .patch<Complaint>(`/api/complaints/${id}/status`, {
                            status: nextStatus,
                            note: note.trim() || undefined,
                          })
                          .then((response) => response.data),
                      'Status dəyişdirildi',
                    )
                  }}
                >
                  <Field label="Yeni status">
                    <select
                      className="field-input"
                      value={nextStatus}
                      onChange={(event) => setNextStatus(event.target.value as ComplaintStatus)}
                    >
                      <option value="">Seçin</option>
                      {complaint.allowedTransitions.map((status) => (
                        <option key={status} value={status}>
                          {STATUS_LABELS[status]}
                        </option>
                      ))}
                    </select>
                  </Field>

                  <Field label="Qeyd" hint="Vətəndaş mesaj kimi görəcəyi əlavə izah">
                    <textarea
                      className="field-input min-h-20 resize-y"
                      value={note}
                      onChange={(event) => setNote(event.target.value)}
                      maxLength={1000}
                    />
                  </Field>

                  <Button type="submit" loading={busy} disabled={!nextStatus} fullWidth>
                    Statusu dəyiş
                  </Button>
                </form>

                <form
                  className="space-y-3 border-t border-slate-100 pt-4"
                  onSubmit={(event) => {
                    event.preventDefault()
                    if (!assigneeId) return
                    void run(
                      () =>
                        api
                          .patch<Complaint>(`/api/complaints/${id}/assign`, { assigneeId })
                          .then((response) => response.data),
                      'Məsul işçi təyin edildi',
                    )
                  }}
                >
                  <Field label="Məsul işçi təyin et">
                    <select
                      className="field-input"
                      value={assigneeId ?? ''}
                      onChange={(event) =>
                        setAssigneeId(event.target.value ? Number(event.target.value) : null)
                      }
                    >
                      <option value="">Seçin</option>
                      {(assignees ?? []).map((assignee) => (
                        <option key={assignee.id} value={assignee.id}>
                          {assignee.fullName || assignee.username} · {ROLE_LABELS[assignee.role]}
                        </option>
                      ))}
                    </select>
                  </Field>
                  <Button type="submit" variant="secondary" loading={busy} fullWidth disabled={!assigneeId}>
                    Təyin et
                  </Button>
                </form>

                {isAdmin && (
                  <Button
                    variant="danger"
                    fullWidth
                    loading={busy}
                    onClick={() => {
                      void run(
                        () => api.delete(`/api/complaints/${id}`).then(() => complaint),
                        'Şikayət silindi',
                      ).then(() => navigate('/work'))
                    }}
                  >
                    Şikayəti sil
                  </Button>
                )}
              </div>
            </Card>
          )}

          {user && user.role === 'CITIZEN' && (
            <Alert tone="info" title="Nəzarət üçün">
              Şikayətinizin statusu dəyişdikdə bildirim bu səhifədəki şərhlər vasitəsilə görünür.
              <span className="mt-1 block text-xs">
                Sorğunuz: <span className="font-mono">{complaint.referenceCode}</span>
              </span>
            </Alert>
          )}
        </div>
      </div>
    </div>
  )
}
import { useState, type FormEvent, type ReactNode } from 'react'
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

function DetailRow({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div>
      <dt className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ink/40">{label}</dt>
      <dd className="mt-1 text-sm font-medium text-ink">{value ?? '—'}</dd>
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
    <div className="space-y-5 animate-fade-in">
      <div className="relative flex flex-wrap items-start justify-between gap-3 border-b border-ink/10 pb-6">
        <div className="relative">
          <Link to="/complaints/mine" className="text-sm text-ink/50 transition hover:text-brand-700">
            ← Siyahıya qayıt
          </Link>
          <h1 className="display mt-2 text-4xl leading-tight text-ink sm:text-[44px]">
            {complaint.title}
          </h1>
          <p className="mt-2 font-mono text-xs font-semibold text-brand-700">
            {complaint.referenceCode}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2 pt-6">
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
            <div className="space-y-5 p-6">
              <p className="whitespace-pre-line text-sm leading-relaxed text-ink/65">
                {complaint.description}
              </p>

              {complaint.imageUrl && (
                <img
                  src={complaint.imageUrl}
                  alt={complaint.title}
                  loading="lazy"
                  decoding="async"
                  className="max-h-80 w-full rounded-xl object-cover ring-1 ring-ink/10"
                />
              )}

              <dl className="grid grid-cols-2 gap-4 border-t border-ink/8 pt-5 sm:grid-cols-3">
                <DetailRow label="Kateqoriya" value={complaint.categoryName} />
                <DetailRow label="Məsul idarə" value={complaint.departmentName} />
                <DetailRow label="Vaciblik" value={PRIORITY_LABELS[complaint.priority]} />
                <DetailRow label="Rayon" value={complaint.district} />
                <DetailRow label="Ünvan" value={complaint.address} />
                <DetailRow label="Son dəyişiklik" value={formatRelative(complaint.updatedAt)} />
              </dl>

              {complaint.resolutionNote && (
                <div className="rounded-xl bg-emerald-600/5 px-4 py-3.5 ring-1 ring-emerald-600/20">
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-emerald-800">
                    Həll qeydi
                  </p>
                  <p className="mt-1 text-sm text-emerald-950">{complaint.resolutionNote}</p>
                </div>
              )}
            </div>
          </Card>

          <Card>
            <CardHeader title="Xəritə" />
            <div className="p-6">
              <MarkerMap markers={[complaint]} focus={position} />
            </div>
          </Card>

          <Card>
            <CardHeader
              title="Məlumat və şərhlər"
              subtitle={`${comments.length} mesaj`}
            />
            <div className="space-y-4 p-6">
              {comments.length === 0 && (
                <p className="py-4 text-center text-sm text-ink/45">Hələ mesaj yoxdur.</p>
              )}

              {comments.map((comment) => (
                <div
                  key={comment.id}
                  className={`rounded-xl p-4 ${
                    comment.internal
                      ? 'bg-amber-600/5 ring-1 ring-amber-600/20'
                      : 'bg-ink/3 ring-1 ring-ink/8'
                  }`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-sm font-semibold text-ink">
                      {comment.author.fullName || comment.author.username}
                      <span className="ml-2 text-xs font-normal text-ink/45">
                        {ROLE_LABELS[comment.author.role]}
                      </span>
                    </p>
                    <span className="text-xs text-ink/40">{formatRelative(comment.createdAt)}</span>
                  </div>

                  {comment.internal && (
                    <Badge className="mt-1.5 bg-amber-600/10 text-amber-800 ring-amber-600/25">
                      Daxili qeyd — vətəndaşa göstərilmir
                    </Badge>
                  )}

                  <p className="mt-2 whitespace-pre-line text-sm text-ink/65">{comment.message}</p>

                  {comment.newStatus && (
                    <p className="mt-2 text-xs text-ink/45">
                      Status: {comment.previousStatus ? `${STATUS_LABELS[comment.previousStatus]} → ` : ''}
                      {STATUS_LABELS[comment.newStatus]}
                    </p>
                  )}
                </div>
              ))}

              <form onSubmit={handleComment} className="space-y-3 border-t border-ink/8 pt-5">
                <Field label={isStaff ? 'Qeyd və ya mesaj' : 'Mesaj göndərin'}>
                  <textarea
                    className="field-input min-h-24 resize-y"
                    value={message}
                    onChange={(event) => setMessage(event.target.value)}
                    placeholder={
                      isStaff
                        ? 'Daxili qeyd yazın və ya vətəndaşa cavab verin'
                        : 'İdarəyə sual və əlavə məlumat yazın'
                    }
                    maxLength={2000}
                  />
                </Field>

                {isStaff && (
                  <label className="flex items-center gap-2 text-sm text-ink/60">
                    <input
                      type="checkbox"
                      checked={internal}
                      onChange={(event) => setInternal(event.target.checked)}
                      className="size-4 rounded border-ink/25 accent-brand-600"
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
            <dl className="space-y-3.5 p-6 text-sm">
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
            <ol className="space-y-4 p-6">
              {STATUS_ORDER.map((status, index) => {
                const passed = timelineIndex >= index && !(complaint.closed && index > timelineIndex)
                const current = complaint.status === status
                return (
                  <li key={status} className="flex items-center gap-3">
                    <span
                      className={`flex size-6 shrink-0 items-center justify-center rounded-full text-[11px] font-bold ring-1 ${
                        current
                          ? 'bg-ink text-parchment ring-ink'
                          : passed
                            ? 'bg-brand-600/10 text-brand-700 ring-brand-600/25'
                            : 'bg-transparent text-ink/35 ring-ink/15'
                      }`}
                    >
                      {passed && !current ? '✓' : index + 1}
                    </span>
                    <span
                      className={`text-sm ${
                        current ? 'display font-semibold text-ink' : 'text-ink/50'
                      }`}
                    >
                      {STATUS_LABELS[status]}
                      {current && <span className="ml-2 text-xs font-normal text-brand-700">· hazırda</span>}
                    </span>
                  </li>
                )
              })}
            </ol>
          </Card>

          {isStaff && (
            <Card>
              <CardHeader title="İdarəetmə" subtitle="Yalnız personal üçün" />
              <div className="space-y-4 p-6">
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
                  className="space-y-3 border-t border-ink/8 pt-4"
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
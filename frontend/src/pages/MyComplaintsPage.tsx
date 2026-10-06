import { useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../lib/api'
import { useFetch } from '../hooks/useFetch'
import { STATUS_LABELS, STATUS_ORDER, formatRelative } from '../lib/format'
import type { Complaint, ComplaintStatus, Page } from '../lib/types'
import { useAuth } from '../context/AuthContext'
import ComplaintCard from '../components/ComplaintCard'
import Pagination from '../components/Pagination'
import { Alert, Card, EmptyState, PageLoader, SectionTitle, StatCard } from '../components/ui'

export default function MyComplaintsPage() {
  const { user } = useAuth()
  const [status, setStatus] = useState<ComplaintStatus | ''>('')
  const [page, setPage] = useState(0)

  const { data, loading, error } = useFetch<Page<Complaint>>(
    () =>
      api
        .get<Page<Complaint>>('/api/complaints/mine', {
          params: { page, size: 12, status: status || undefined },
        })
        .then((response) => response.data),
    [status, page],
  )

  const complaints = data?.content ?? []
  const openCount = complaints.filter((complaint) => !complaint.closed).length
  const resolvedCount = complaints.filter((complaint) => complaint.status === 'RESOLVED').length

  return (
    <div>
      <SectionTitle
        title="Şikayətlərim"
        description={
          user ? `${user.fullName || user.username} hesabı ilə verilmiş bütün şikayətlər` : undefined
        }
        action={
          <Link
            to="/complaints/new"
            className="rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-700"
          >
            Yeni şikayət
          </Link>
        }
      />

      <div className="mb-5 grid gap-4 sm:grid-cols-3">
        <StatCard label="Cəmi" value={data?.totalElements ?? 0} />
        <StatCard label="Açıq" value={openCount} tone="amber" hint="Bu səhifədəki açıq şikayətlər" />
        <StatCard label="Həll olunan" value={resolvedCount} tone="emerald" />
      </div>

      <Card className="mb-5 flex flex-wrap items-center gap-2 p-3">
        <button
          type="button"
          onClick={() => {
            setStatus('')
            setPage(0)
          }}
          className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
            status === '' ? 'bg-brand-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          Hamısı
        </button>
        {STATUS_ORDER.map((value) => (
          <button
            key={value}
            type="button"
            onClick={() => {
              setStatus(value)
              setPage(0)
            }}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
              status === value
                ? 'bg-brand-600 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {STATUS_LABELS[value]}
          </button>
        ))}
      </Card>

      {loading && <PageLoader />}
      {error && <Alert tone="error">{error}</Alert>}

      {data && complaints.length === 0 && (
        <Card>
          <EmptyState
            title="Hələ şikayət yoxdur"
            description="İlk şikayətinizi verin — problem yerini xəritədə göstərin, biz nəzarət edək."
            action={
              <Link
                to="/complaints/new"
                className="rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-700"
              >
                Şikayət ver
              </Link>
            }
          />
        </Card>
      )}

      {complaints.length > 0 && (
        <>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {complaints.map((complaint) => (
              <ComplaintCard key={complaint.id} complaint={complaint} />
            ))}
          </div>
          <Pagination
            page={data?.page ?? 0}
            totalPages={data?.totalPages ?? 0}
            totalElements={data?.totalElements ?? 0}
            onChange={setPage}
          />
          <p className="mt-2 text-center text-xs text-slate-400">
            Son yeniləmə: {formatRelative(complaints[0]?.updatedAt)}
          </p>
        </>
      )}
    </div>
  )
}
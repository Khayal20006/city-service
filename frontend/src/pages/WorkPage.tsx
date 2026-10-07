import { useState } from 'react'
import { api } from '../lib/api'
import { useFetch } from '../hooks/useFetch'
import { useAuth } from '../context/AuthContext'
import { STATUS_LABELS, STATUS_ORDER } from '../lib/format'
import type { Complaint, ComplaintStatus, Page } from '../lib/types'
import ComplaintCard from '../components/ComplaintCard'
import Pagination from '../components/Pagination'
import {
  Alert,
  Card,
  EmptyState,
  FilterPill,
  LinkButton,
  PageLoader,
  SectionTitle,
  StatCard,
} from '../components/ui'

export default function WorkPage() {
  const { user, isAdmin } = useAuth()
  const [status, setStatus] = useState<ComplaintStatus | ''>('')
  const [page, setPage] = useState(0)

  const { data, loading, error } = useFetch<Page<Complaint>>(
    () =>
      api
        .get<Page<Complaint>>('/api/complaints/assigned-to-me', {
          params: { page, size: 12, status: status || undefined },
        })
        .then((response) => response.data),
    [status, page],
  )

  const complaints = data?.content ?? []
  const pending = complaints.filter((complaint) => complaint.status === 'PENDING').length
  const inProgress = complaints.filter((complaint) => !complaint.closed).length

  function select(next: ComplaintStatus | '') {
    setStatus(next)
    setPage(0)
  }

  return (
    <div className="animate-fade-in">
      <SectionTitle
        title="Təyinatlarım"
        description={
          user
            ? `${user.fullName || user.username} üçün təyin edilmiş şikayətlər`
            : undefined
        }
        action={
          <LinkButton to="/work/map" variant="secondary">
            Xəritədə bax
          </LinkButton>
        }
      />

      <div className="mb-5 grid gap-4 sm:grid-cols-3">
        <StatCard label="Cəmi təyinat" value={data?.totalElements ?? 0} />
        <StatCard label="Yeni gözləyir" value={pending} tone="amber" />
        <StatCard label="Açıq" value={inProgress} hint="Yekun vəziyyət gözləyir" />
      </div>

      <Card className="mb-5 flex flex-wrap items-center gap-2 p-3">
        <FilterPill active={status === ''} onClick={() => select('')}>
          Hamısı
        </FilterPill>
        {STATUS_ORDER.map((value) => (
          <FilterPill key={value} active={status === value} onClick={() => select(value)}>
            {STATUS_LABELS[value]}
          </FilterPill>
        ))}
      </Card>

      {loading && <PageLoader />}
      {error && <Alert tone="error">{error}</Alert>}

      {data && complaints.length === 0 && (
        <Card>
          <EmptyState
            title="Təyin edilmiş şikayət yoxdur"
            description={
              isAdmin
                ? 'Administrator kimi bütün şikayətlərə statistika bölməsindən baxa bilərsiniz.'
                : 'Şöbə müdiriniz təyinat verəndə şikayət burada görünəcək.'
            }
            action={
              isAdmin ? (
                <LinkButton to="/statistics">
                  Statistika
                  <span aria-hidden>→</span>
                </LinkButton>
              ) : undefined
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
        </>
      )}
    </div>
  )
}
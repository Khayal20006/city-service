import { Link } from 'react-router-dom'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { api } from '../lib/api'
import { useFetch } from '../hooks/useFetch'
import { PRIORITY_LABELS, STATUS_LABELS, formatDateTime, formatHours } from '../lib/format'
import type { ComplaintStatus, Priority, Statistics } from '../lib/types'
import { Alert, Card, CardHeader, PageLoader, SectionTitle, StatCard } from '../components/ui'

const STATUS_COLORS: Record<ComplaintStatus, string> = {
  PENDING: '#f59e0b',
  UNDER_REVIEW: '#0ea5e9',
  IN_PROGRESS: '#2176ec',
  RESOLVED: '#10b981',
  REJECTED: '#f43f5e',
  CANCELLED: '#64748b',
}

const PRIORITY_COLORS: Record<Priority, string> = {
  LOW: '#94a3b8',
  NORMAL: '#0ea5e9',
  HIGH: '#f97316',
  URGENT: '#e11d48',
}

export default function StatisticsPage() {
  const { data, loading, error } = useFetch<Statistics>(
    () => api.get<Statistics>('/api/stats/summary').then((response) => response.data),
    [],
  )

  if (loading) return <PageLoader />
  if (error || !data) {
    return <Alert tone="error">{error ?? 'Statistika yüklənmədi'}</Alert>
  }

  const statusData = Object.entries(data.byStatus).map(([key, value]) => ({
    name: STATUS_LABELS[key as ComplaintStatus] ?? key,
    value,
    color: STATUS_COLORS[key as ComplaintStatus] ?? '#94a3b8',
  }))

  const priorityData = Object.entries(data.byPriority).map(([key, value]) => ({
    name: PRIORITY_LABELS[key as Priority] ?? key,
    value,
    color: PRIORITY_COLORS[key as Priority] ?? '#94a3b8',
  }))

  const categoryData = Object.entries(data.byCategory)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 10)

  const districtData = Object.entries(data.byDistrict)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 12)

  return (
    <div>
      <SectionTitle
        title="Statistika"
        description={`Şikayət axınının icmalı · ${formatDateTime(data.generatedAt)}`}
        action={
          <Link
            to="/work/map"
            className="rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 ring-1 ring-slate-300 transition hover:bg-slate-50"
          >
            Xəritədə bax
          </Link>
        }
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Cəmi şikayət" value={data.total} />
        <StatCard label="Açıq" value={data.open} tone="amber" />
        <StatCard label="Bağlanmış" value={data.closed} tone="emerald" />
        <StatCard
          label="Orta həll müddəti"
          value={formatHours(data.averageResolutionHours)}
          tone="rose"
          hint="Bağlanmış şikayətlər üzrə"
        />
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <Card>
          <CardHeader title="Status üzrə paylanma" />
          <div className="h-72 p-4">
            {statusData.length === 0 ? (
              <p className="pt-24 text-center text-sm text-slate-500">Məlumat yoxdur</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusData}
                    dataKey="value"
                    nameKey="name"
                    innerRadius="55%"
                    outerRadius="82%"
                    paddingAngle={2}
                    label={(entry) => `${entry.name}: ${entry.value}`}
                    labelLine={false}
                    fontSize={11}
                  >
                    {statusData.map((entry) => (
                      <Cell key={entry.name} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </Card>

        <Card>
          <CardHeader title="Vaciblik dərəcəsi" />
          <div className="h-72 p-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={priorityData} margin={{ top: 8, right: 8, bottom: 8, left: -18 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                <Tooltip cursor={{ fill: '#f1f5f9' }} />
                <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                  {priorityData.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <CardHeader title="Ən çox şikayət verilen kateqoriyalar" subtitle="İlk 10" />
          <div className="h-80 p-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={categoryData}
                layout="vertical"
                margin={{ top: 8, right: 24, bottom: 8, left: 8 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={false} />
                <XAxis type="number" allowDecimals={false} tick={{ fontSize: 12 }} />
                <YAxis type="category" dataKey="name" width={140} tick={{ fontSize: 11 }} />
                <Tooltip cursor={{ fill: '#f1f5f9' }} />
                <Bar dataKey="value" fill="#2176ec" radius={[0, 8, 8, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <CardHeader title="Rayonlar üzrə" subtitle="İlk 12" />
          <div className="h-80 p-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={districtData} margin={{ top: 8, right: 8, bottom: 8, left: -18 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis dataKey="name" interval={0} angle={-30} textAnchor="end" height={60} tick={{ fontSize: 10 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                <Tooltip cursor={{ fill: '#f1f5f9' }} />
                <Legend />
                <Bar dataKey="value" name="Şikayət" fill="#10b981" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </div>
  )
}
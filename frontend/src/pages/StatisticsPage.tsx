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
import { Alert, Card, CardHeader, LinkButton, PageLoader, SectionTitle, StatCard } from '../components/ui'

const STATUS_COLORS: Record<ComplaintStatus, string> = {
  PENDING: '#d97706',
  UNDER_REVIEW: '#0e93d1',
  IN_PROGRESS: '#bc5f32',
  RESOLVED: '#059669',
  REJECTED: '#e11d48',
  CANCELLED: '#8a8072',
}

const PRIORITY_COLORS: Record<Priority, string> = {
  LOW: '#a8a29e',
  NORMAL: '#0ea5e9',
  HIGH: '#ea580c',
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
    <div className="animate-fade-in">
      <SectionTitle
        title="Statistika"
        description={`Şikayət axınının icmalı · ${formatDateTime(data.generatedAt)}`}
        action={
          <LinkButton to="/work/map" variant="secondary">
            Xəritədə bax
          </LinkButton>
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
              <p className="pt-24 text-center text-sm text-ink/45">Məlumat yoxdur</p>
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
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(34,29,22,0.08)" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#4a4238' }} tickLine={false} axisLine={{ stroke: 'rgba(34,29,22,0.15)' }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: '#4a4238' }} tickLine={false} axisLine={false} />
                <Tooltip cursor={{ fill: 'rgba(34,29,22,0.05)' }} />
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
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(34,29,22,0.08)" horizontal={false} />
                <XAxis type="number" allowDecimals={false} tick={{ fontSize: 12, fill: '#4a4238' }} tickLine={false} axisLine={false} />
                <YAxis type="category" dataKey="name" width={140} tick={{ fontSize: 11, fill: '#4a4238' }} tickLine={false} axisLine={{ stroke: 'rgba(34,29,22,0.15)' }} />
                <Tooltip cursor={{ fill: 'rgba(34,29,22,0.05)' }} />
                <Bar dataKey="value" fill="#bc5f32" radius={[0, 8, 8, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <CardHeader title="Rayonlar üzrə" subtitle="İlk 12" />
          <div className="h-80 p-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={districtData} margin={{ top: 8, right: 8, bottom: 8, left: -18 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(34,29,22,0.08)" vertical={false} />
                <XAxis dataKey="name" interval={0} angle={-30} textAnchor="end" height={60} tick={{ fontSize: 10, fill: '#4a4238' }} tickLine={false} axisLine={{ stroke: 'rgba(34,29,22,0.15)' }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: '#4a4238' }} tickLine={false} axisLine={false} />
                <Tooltip cursor={{ fill: 'rgba(34,29,22,0.05)' }} />
                <Legend wrapperStyle={{ fontSize: 12, color: '#4a4238' }} />
                <Bar dataKey="value" name="Şikayət" fill="#059669" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </div>
  )
}
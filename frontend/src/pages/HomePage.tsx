import { Link } from 'react-router-dom'
import { api } from '../lib/api'
import { useFetch } from '../hooks/useFetch'
import { useAuth } from '../context/AuthContext'
import { formatHours } from '../lib/format'
import type { Category } from '../lib/types'
import { Card, LinkButton, PageLoader, Alert } from '../components/ui'

const STEPS = [
  {
    title: 'Xəritədən seçin',
    text: 'Problem yerini xəritədə göstərin, kateqoriya seçin və şəkil əlavə edin.',
  },
  {
    title: 'İzləyin',
    text: 'Hər status dəyişikliyində bildirim alın, şikayətinizin necə həll olunduğunu görün.',
  },
  {
    title: 'Şəhəri təmizləyin',
    text: 'Həll olunan hər şikayət şəhərin yaşıllıqlarını, havasını və həyat keyfiyyətini yaxşılaşdırır.',
  },
]

export default function HomePage() {
  const { user, isStaff } = useAuth()
  const { data, loading, error } = useFetch<Category[]>(
    () => api.get<Category[]>('/api/categories').then((response) => response.data),
    [],
  )

  return (
    <div className="space-y-14">
      <section className="overflow-hidden rounded-3xl bg-gradient-to-br from-brand-700 via-brand-600 to-brand-800 px-6 py-14 text-white shadow-lift sm:px-12 sm:py-20">
        <div className="max-w-2xl">
          <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-medium ring-1 ring-white/25">
            <span className="size-1.5 rounded-full bg-emerald-300" />
            Şikayətlər onlayn qəbul edilir
          </span>
          <h1 className="mt-5 text-3xl font-extrabold leading-tight tracking-tight sm:text-5xl">
            Şəhərinizə olan tələbini 10 dəqiqədə bildirin
          </h1>
          <p className="mt-4 max-w-xl text-base text-white/85 sm:text-lg">
            Yol, işıq, təmizlik, su və kanalizasiya problemlərini xəritədə göstərin — müvafiq
            idarəyə avtomatik yönləndiriləcək və həllini real vaxtda izləyə biləcəksiniz.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            {user ? (
              <>
                <LinkButton to={isStaff ? '/work' : '/complaints/new'} variant="secondary" size="lg">
                  {isStaff ? 'Təyinatlarım' : 'Şikayət ver'}
                </LinkButton>
                <LinkButton
                  to={isStaff ? '/statistics' : '/complaints/mine'}
                  variant="ghost"
                  size="lg"
                  className="text-white ring-1 ring-white/30 hover:bg-white/10 hover:text-white"
                >
                  {isStaff ? 'Statistika' : 'Şikayətlərim'}
                </LinkButton>
              </>
            ) : (
              <>
                <LinkButton to="/register" variant="secondary" size="lg">
                  Pulsuz hesab yarat
                </LinkButton>
                <LinkButton
                  to="/login"
                  variant="ghost"
                  size="lg"
                  className="text-white ring-1 ring-white/30 hover:bg-white/10 hover:text-white"
                >
                  Daxil ol
                </LinkButton>
              </>
            )}
          </div>
        </div>
      </section>

      <section className="grid gap-5 sm:grid-cols-3">
        {STEPS.map((step, index) => (
          <Card key={step.title} className="p-6">
            <span className="flex size-9 items-center justify-center rounded-xl bg-brand-50 text-sm font-bold text-brand-700">
              {index + 1}
            </span>
            <h3 className="mt-4 text-base font-semibold text-slate-900">{step.title}</h3>
            <p className="mt-1.5 text-sm text-slate-500">{step.text}</p>
          </Card>
        ))}
      </section>

      <section>
        <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Xidmət kateqoriyaları</h2>
            <p className="mt-1 text-sm text-slate-500">
              Şikayət verə biləcəyiniz xidmət sahələri və məsul idarələr
            </p>
          </div>
          <Link to="/categories" className="text-sm font-semibold text-brand-700 hover:text-brand-800">
            Hamısını gör →
          </Link>
        </div>

        {loading && <PageLoader />}
        {error && <Alert tone="error">{error}</Alert>}

        {data && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {data.slice(0, 9).map((category) => (
              <Card key={category.id} className="flex flex-col p-5">
                <h3 className="text-sm font-semibold text-slate-900">{category.name}</h3>
                <p className="mt-1.5 line-clamp-2 flex-1 text-sm text-slate-500">
                  {category.description}
                </p>
                <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 text-xs text-slate-500">
                  <span>{category.departmentName}</span>
                  <span className="font-medium text-slate-700">
                    ~{formatHours(category.estimatedResolutionHours)}
                  </span>
                </div>
              </Card>
            ))}
          </div>
        )}
      </section>

      {!user && (
        <section className="rounded-3xl border border-dashed border-brand-200 bg-brand-50/60 px-6 py-10 text-center sm:px-12">
          <h2 className="text-xl font-bold text-slate-900">İlk şikayətinizi indi verin</h2>
          <p className="mx-auto mt-2 max-w-lg text-sm text-slate-600">
            Hesab yaratmaq bir dəqiqədən az çəkir. Şikayətiniz qeydiyyatdan sonra avtomatik
            məsul idarəyə göndəriləcək.
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <LinkButton to="/register">Qeydiyyatdan keç</LinkButton>
            <LinkButton to="/login" variant="secondary">
              Artıq hesabım var
            </LinkButton>
          </div>
        </section>
      )}

      <p className="pb-2 text-center text-xs text-slate-400">
        Xidmət saatları: Bazar–Cümə 09:00–18:00 ·{' '}
        <a href="mailto:qeydiyyat@city.gov.az" className="text-brand-700 hover:underline">
          qeydiyyat@city.gov.az
        </a>
      </p>
    </div>
  )
}
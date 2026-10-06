import { Link } from 'react-router-dom'
import { api } from '../lib/api'
import { useFetch } from '../hooks/useFetch'
import { useAuth } from '../context/AuthContext'
import { BAKU_DISTRICTS, formatHours } from '../lib/format'
import type { Category } from '../lib/types'
import { Alert, Kicker, LinkButton, SkeletonCard } from '../components/ui'

const TRACK = [
  { index: '01', title: 'Qəbul edildi', text: 'Şikayət nömrə alır və məsul idarəyə ötürülür.', tone: 'done' },
  { index: '02', title: 'Nəzərdə', text: 'Mütəxəssis vəziyyəti yoxlayır, əhatəni müəyyənləşdirir.', tone: 'done' },
  { index: '03', title: 'İcra edilir', text: 'Briqada işə başlayıb — indi bu mərhələdədir.', tone: 'live' },
  { index: '04', title: 'Həll olundu', text: 'Nəticə yoxlanılır və şikayət bağlanır.', tone: 'next' },
] as const

export default function HomePage() {
  const { user, isStaff } = useAuth()
  const { data: categories, loading, error } = useFetch<Category[]>(
    () => api.get<Category[]>('/api/categories').then((response) => response.data),
    [],
  )

  return (
    <div className="animate-fade-in space-y-24">
      {/* ------------------------------------------------------------------ hero */}
      <section className="border-b border-ink/10 pb-14 pt-6 sm:pt-12">
        <Kicker>Şikayət portalı · Bakı</Kicker>

        <div className="mt-6 grid items-end gap-10 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <h1 className="display text-[44px] leading-[1.04] text-ink sm:text-6xl">
              Şəhərdə gördüyünüz hər məsələ —{' '}
              <em className="font-medium text-brand-600">bir şikayətdən</em> həllə.
            </h1>
            <p className="mt-6 max-w-xl text-base leading-relaxed text-ink/60 sm:text-lg">
              Yol, işıq, təmizlik, su və kanalizasiya problemlərini xəritədə
              qeyd edin — avtomatik məsul idarəyə yönləndirilir, həllini real vaxtda izləyirsiniz.
            </p>

            <div className="mt-9 flex flex-wrap items-center gap-4">
              {user ? (
                <>
                  <LinkButton to={isStaff ? '/work' : '/complaints/new'} size="lg">
                    {isStaff ? 'Təyinatlarımı gör' : 'Şikayət ver'}
                    <span aria-hidden>→</span>
                  </LinkButton>
                  <Link
                    to={isStaff ? '/work/map' : '/complaints/mine'}
                    className="group inline-flex items-center gap-1.5 text-sm font-semibold text-brand-700 transition hover:text-brand-800"
                  >
                    {isStaff ? 'Şəhər xəritəsi' : 'Şikayətlərim'}
                    <span className="transition group-hover:translate-x-0.5" aria-hidden>
                      →
                    </span>
                  </Link>
                </>
              ) : (
                <>
                  <LinkButton to="/register" size="lg">
                    Pulsuz hesab yarat
                    <span aria-hidden>→</span>
                  </LinkButton>
                  <Link
                    to="/login"
                    className="group inline-flex items-center gap-1.5 text-sm font-semibold text-ink/60 transition hover:text-ink"
                  >
                    Daxil ol
                    <span className="transition group-hover:translate-x-0.5" aria-hidden>
                      →
                    </span>
                  </Link>
                </>
              )}
            </div>
          </div>

          <div className="lg:col-span-5">
            <div className="card relative overflow-hidden p-7">
              <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-ink/0 via-brand-500/40 to-ink/0" />
              <div className="flex items-center justify-between">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-ink/45">
                  Portala bu gün
                </p>
                <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-emerald-700">
                  <span className="relative flex size-2">
                    <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-500 opacity-60" />
                    <span className="relative inline-flex size-2 rounded-full bg-emerald-600" />
                  </span>
                  Canlı
                </span>
              </div>

              <dl className="mt-6 space-y-5">
                <div className="flex items-baseline justify-between gap-4">
                  <dt className="text-xs font-medium uppercase tracking-[0.14em] text-ink/45">
                    Xidmət sahəsi
                  </dt>
                  <dd className="display text-3xl tabular-nums text-ink">
                    {categories ? categories.length : '—'}
                  </dd>
                </div>
                <div className="flex items-baseline justify-between border-t border-ink/8 pt-5">
                  <dt className="text-xs font-medium uppercase tracking-[0.14em] text-ink/45">
                    Əhatə olunan rayon
                  </dt>
                  <dd className="display text-3xl tabular-nums text-ink">{BAKU_DISTRICTS.length}</dd>
                </div>
                <div className="flex items-baseline justify-between border-t border-ink/8 pt-5">
                  <dt className="text-xs font-medium uppercase tracking-[0.14em] text-ink/45">
                    Qəbul rejimi
                  </dt>
                  <dd className="display text-3xl tabular-nums text-ink">24/7</dd>
                </div>
              </dl>
            </div>
          </div>
        </div>
      </section>

      {/* -------------------------------------------- status track ("şikayətin yolu") */}
      <section>
        <div className="grid items-end gap-6 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <Kicker>Vəziyyəti izləyin</Kicker>
            <h2 className="display mt-2 text-3xl text-ink sm:text-4xl">Bir şikayətin yolu</h2>
            <p className="mt-3 max-w-md text-sm leading-relaxed text-ink/55">
              Portalda hər şikayət bu xətt üzrə irəliləyir — hansı mərhələdədir, bir baxışda
              görünür.
            </p>
          </div>

          <div className="lg:col-span-7">
            <ol className="relative">
              <div className="absolute bottom-4 left-4 top-4 w-px bg-ink/10" aria-hidden />
              <div
                className="absolute bottom-[24%] left-4 w-px bg-brand-500"
                style={{ top: '24%' }}
                aria-hidden
              />
              <div className="space-y-0">
                {TRACK.map((stage) => (
                  <li key={stage.index} className="relative flex gap-6 py-4 pl-0">
                    <div className="relative z-10 flex w-8 shrink-0 flex-col items-center">
                      <span
                        className={`flex size-8 items-center justify-center rounded-full ring-1 ${
                          stage.tone === 'live'
                            ? 'bg-brand-600 text-parchment ring-brand-600'
                            : stage.tone === 'done'
                              ? 'bg-parchment text-ink ring-ink/20'
                              : 'bg-parchment text-ink/40 ring-ink/15'
                        }`}
                      >
                        {stage.tone === 'live' && (
                          <span className="absolute inline-flex size-2 animate-ping rounded-full bg-brand-500 opacity-70" />
                        )}
                        <span className="relative font-mono text-[11px] font-semibold">{stage.index}</span>
                      </span>
                    </div>
                    <div className="flex-1 border-b border-ink/8 pb-4">
                      <div className="flex items-center gap-2">
                        <h3 className="display text-lg text-ink">{stage.title}</h3>
                        {stage.tone === 'live' && (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-600/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.14em] text-brand-700 ring-1 ring-brand-600/20">
                            İndi
                          </span>
                        )}
                      </div>
                      <p className="mt-1 text-sm text-ink/55">{stage.text}</p>
                    </div>
                  </li>
                ))}
              </div>
            </ol>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------------ steps */}
      <section className="grid gap-px overflow-hidden rounded-xl border border-ink/10 bg-ink/10 md:grid-cols-3">
        {[
          {
            title: 'Xəritədən seçin',
            text: 'Problem yerini xəritədə göstərin, kateqoriyanı seçin, istəsəniz şəkil əlavə edin.',
          },
          {
            title: 'İdarəyə düşəcək',
            text: 'Şikayət məsul idarəyə yönləndirilir və hər status dəyişikliyi real vaxtda görünür.',
          },
          {
            title: 'Həllini görün',
            text: 'Başlayanda «İcra edilir», bitəndə «Həll olundu» — proses şəffaf saxlanılır.',
          },
        ].map((step, index) => (
          <div key={step.title} className="bg-parchment p-8 transition hover:bg-white">
            <p className="font-mono text-xs font-semibold tracking-[0.18em] text-brand-600">
              (0{index + 1})
            </p>
            <h3 className="display mt-4 text-xl text-ink">{step.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-ink/55">{step.text}</p>
          </div>
        ))}
      </section>

      {/* ------------------------------------------------------------------ categories */}
      <section>
        <div className="mb-8 flex flex-wrap items-end justify-between gap-3">
          <div>
            <Kicker>Xidmət sahələri</Kicker>
            <h2 className="display mt-2 text-3xl text-ink sm:text-4xl">
              Şikayət verəcəyiniz sahəni seçin
            </h2>
            <p className="mt-3 max-w-md text-sm leading-relaxed text-ink/55">
              Hər kateqoriya məsul idarəyə və təxmini həll müddətinə bağlıdır.
            </p>
          </div>
          <Link
            to="/categories"
            className="group inline-flex items-center gap-1.5 text-sm font-semibold text-brand-700 transition hover:text-brand-800"
          >
            Bütün kateqoriyalar
            <span className="transition group-hover:translate-x-0.5" aria-hidden>
              →
            </span>
          </Link>
        </div>

        {loading && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" aria-hidden>
            {Array.from({ length: 6 }).map((_, index) => (
              <SkeletonCard key={index} />
            ))}
          </div>
        )}
        {error && <Alert tone="error">{error}</Alert>}

        {categories && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {categories.slice(0, 9).map((category) => (
              <Link
                key={category.id}
                to={user && !isStaff ? '/complaints/new' : '/categories'}
                className="card group flex flex-col p-7 transition duration-300 hover:-translate-y-0.5 hover:border-brand-300 hover:shadow-lift"
              >
                <div className="flex items-center justify-between">
                  <p className="font-mono text-xs font-semibold tracking-[0.18em] text-ink/35">
                    {category.estimatedResolutionHours > 0
                      ? `≈ ${formatHours(category.estimatedResolutionHours)}`
                      : 'Müddət qeyd olunmur'}
                  </p>
                  <span
                    className="flex size-8 items-center justify-center rounded-full bg-ink/4 text-brand-600 ring-1 ring-ink/10 transition group-hover:bg-brand-600 group-hover:text-parchment"
                    aria-hidden
                  >
                    <svg viewBox="0 0 24 24" className="size-3.5" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                </div>
                <h3 className="display mt-5 text-lg text-ink">{category.name}</h3>
                <p className="mt-2 line-clamp-2 flex-1 text-sm leading-relaxed text-ink/55">
                  {category.description}
                </p>
                <p className="mt-5 border-t border-ink/8 pt-3 text-xs font-medium text-ink/45">
                  {category.departmentName}
                </p>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* ------------------------------------------------------------------ CTA */}
      {!user && (
        <section className="relative overflow-hidden rounded-2xl bg-ink px-8 py-14 text-white shadow-lift sm:px-14">
          <div className="dot-grid-light pointer-events-none absolute inset-0 opacity-25" />
          <div className="pointer-events-none absolute -right-24 -top-28 h-72 w-72 rounded-full bg-brand-600/30 blur-3xl" />
          <div className="relative flex flex-wrap items-end justify-between gap-8">
            <div className="max-w-xl">
              <Kicker className="text-brand-300">Başlamaq üçün</Kicker>
              <h2 className="display mt-3 text-3xl text-white sm:text-4xl">
                İlk şikayətinizi bu gün verin
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-slate-300">
                Hesab yaratmaq bir dəqiqədən az çəkir və pulsuzdur — qeydiyyatdan sonra dərhal
                başlaya bilərsiniz.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <LinkButton
                to="/register"
                size="lg"
                className="bg-parchment text-ink shadow-[0_16px_40px_-16px_rgb(0_0_0/0.5)] hover:bg-white"
              >
                Qeydiyyatdan keç
                <span aria-hidden>→</span>
              </LinkButton>
              <Link
                to="/login"
                className="inline-flex items-center gap-1.5 rounded-full px-6 py-3 text-sm font-semibold text-white ring-1 ring-white/25 transition hover:bg-white/10"
              >
                Daxil ol
              </Link>
            </div>
          </div>
        </section>
      )}

      <p className="pb-2 text-center text-xs text-ink/40">
        Xidmət saatları: Bazar–Cümə 09:00–18:00 · {BAKU_DISTRICTS.length} rayon əhatə olunur ·{' '}
        <a href="mailto:qeydiyyat@city.gov.az" className="font-medium text-brand-700 hover:underline">
          qeydiyyat@city.gov.az
        </a>
      </p>
    </div>
  )
}
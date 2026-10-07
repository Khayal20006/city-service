import { Link } from 'react-router-dom'
import { api } from '../lib/api'
import { useFetch } from '../hooks/useFetch'
import { useAuth } from '../context/AuthContext'
import { BAKU_DISTRICTS, formatHours } from '../lib/format'
import type { Category } from '../lib/types'
import {
  Alert,
  Kicker,
  LinkButton,
  Reveal,
  SkeletonCard,
} from '../components/ui'

const TRACK = [
  { title: 'Qəbul edildi', text: 'Şikayət nömrə alır və məsul idarəyə ötürülür.', tone: 'done' },
  { title: 'Nəzərdə', text: 'Mütəxəssis vəziyyəti yoxlayır, əhatəni müəyyənləşdirir.', tone: 'done' },
  { title: 'İcra edilir', text: 'Briqada işə başlayıb — indi bu mərhələdədir.', tone: 'live' },
  { title: 'Həll olundu', text: 'Nəticə yoxlanılır və şikayət bağlanır.', tone: 'next' },
] as const

const STRIP = [
  'Yol',
  'İşıqlandırma',
  'Təmizlik',
  'Su',
  'Kanalizasiya',
  'Yaşıllaşdırma',
  'Səkilər',
  'Məhəllə işıqları',
]

export default function HomePage() {
  const { user, isStaff } = useAuth()
  const { data: categories, loading, error } = useFetch<Category[]>(
    () => api.get<Category[]>('/api/categories').then((response) => response.data),
    [],
  )

  return (
    <div className="space-y-28">
      {/* ------------------------------------------------------------------ hero */}
      <section className="relative -mx-4 overflow-hidden border-b border-ink/10 sm:-mx-6">
        <img
          src="/hero-baku.jpg"
          alt=""
          aria-hidden
          loading="eager"
          fetchPriority="high"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div
          className="absolute inset-0 bg-gradient-to-r from-paper via-paper/80 to-paper/10"
          aria-hidden
        />
        <div
          className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-paper"
          aria-hidden
        />

        <div className="relative mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
          <div className="lg:grid lg:grid-cols-12 lg:items-center lg:gap-12">
            <div className="max-w-2xl lg:col-span-6">
              <Reveal>
                <Kicker>Şikayət portalı · Bakı</Kicker>
                <h1 className="display mt-4 text-[46px] leading-[1.02] text-ink sm:text-[72px]">
                  Şəhərdə gördüyünüz hər məsələ —{' '}
                  <em className="font-medium text-brand-600">bir şikayətdən</em> həllə.
                </h1>
                <p className="mt-7 max-w-xl text-lg leading-relaxed text-ink/75 sm:text-xl">
                  Yol, işıq, təmizlik, su və kanalizasiya problemlərini xəritədə qeyd edin —
                  avtomatik məsul idarəyə yönləndirilir, həllini real vaxtda izləyirsiniz.
                </p>
              </Reveal>

              <Reveal delay={120}>
                <div className="mt-9 flex flex-wrap items-center gap-4">
                  {user ? (
                    <>
                      <LinkButton to={isStaff ? '/work' : '/complaints/new'} size="lg">
                        {isStaff ? 'Təyinatlarımı gör' : 'Şikayət ver'}
                        <span aria-hidden>→</span>
                      </LinkButton>
                      <Link
                        to={isStaff ? '/work/map' : '/complaints/mine'}
                        className="link-underline text-sm font-semibold text-brand-800 transition hover:text-ink"
                      >
                        {isStaff ? 'Şəhər xəritəsi' : 'Şikayətlərim'}
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
                        className="link-underline text-sm font-semibold text-ink/75 transition hover:text-ink"
                      >
                        Daxil ol
                      </Link>
                    </>
                  )}
                </div>
              </Reveal>
            </div>

            <Reveal delay={200} className="lg:col-span-6">
              <div className="relative mx-auto mt-12 max-w-xl lg:mt-0 lg:pl-10">
                <div className="dot-grid pointer-events-none absolute -left-4 -top-10 hidden size-32 opacity-40 lg:block" />
                <span className="pointer-events-none absolute -right-2 -top-7 select-none font-mono text-[10rem] font-bold leading-none text-ink/[0.05] lg:text-[13rem]">
                  66
                </span>

                <figure className="relative overflow-hidden rounded-2xl shadow-card ring-1 ring-ink/15">
                  <img
                    src="/hero-baku.jpg"
                    alt="Bakı — Alov Qüllələri və şəhər panoraması"
                    loading="eager"
                    fetchPriority="high"
                    className="aspect-[4/3] w-full object-cover"
                  />
                </figure>

                <img
                  src="/hero-baku-2.jpg"
                  alt="Bakı gecəsi — işıqlar içində Alov Qüllələri"
                  loading="lazy"
                  className="float-soft absolute -bottom-8 -left-5 w-36 rounded-xl object-cover ring-2 ring-paper shadow-card sm:-left-10 sm:w-52"
                />

                <div className="absolute -top-5 right-3 inline-flex items-center gap-1.5 rounded-full bg-ink/90 px-3.5 py-2 text-[11px] font-semibold text-white shadow-card backdrop-blur sm:-right-4">
                  <span className="relative flex size-2">
                    <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-70" />
                    <span className="relative inline-flex size-2 rounded-full bg-emerald-400" />
                  </span>
                  Canlı · {categories ? `${categories.length} sahə` : '…'}
                </div>

                <div className="absolute -bottom-6 right-4 flex items-center gap-3 rounded-xl bg-paper/90 px-4 py-3 shadow-card ring-1 ring-ink/10 backdrop-blur sm:right-8">
                  <span className="display text-2xl font-semibold tabular-nums text-brand-700">
                    24
                    <span className="text-ink/40">/</span>7
                  </span>
                  <span className="text-[10px] font-semibold uppercase leading-tight tracking-[0.16em] text-ink/50">
                    qəbul zamanı
                  </span>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------------- marquee */}
      <Reveal>
        <div className="border-y border-ink/10 py-5">
          <div className="marquee" aria-hidden>
            <div className="marquee-track">
              {[...STRIP, ...STRIP].map((item, index) => (
                <span
                  key={index}
                  className="flex shrink-0 items-center gap-6 pr-6 text-sm font-medium uppercase tracking-[0.3em] text-ink/30"
                >
                  {item}
                  <span className="text-brand-600/50">·</span>
                </span>
              ))}
            </div>
          </div>
        </div>
      </Reveal>

      {/* -------------------------------------------- status track ("şikayətin yolu") */}
      <section className="grid items-start gap-12 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <Reveal>
            <Kicker>Vəziyyəti izləyin</Kicker>
            <h2 className="display mt-2 text-4xl text-ink sm:text-5xl">
              Bir şikayətin <em className="font-medium text-brand-600">yolu</em>
            </h2>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-ink/55">
              Portalda hər şikayət bu xətt üzrə irəliləyir — hansı mərhələdədir, bir baxışda
              görünür.
            </p>
          </Reveal>
        </div>

        <div className="lg:col-span-8">
          <ol className="border-t border-ink/10">
            {TRACK.map((stage, index) => (
              <Reveal key={stage.title} delay={index * 90}>
                <li className="relative flex gap-6 py-6 pl-0 sm:gap-10">
                  <div className="flex w-14 shrink-0 items-start justify-between">
                    <span
                      className={`mt-1 flex size-8 items-center justify-center rounded-full font-mono text-[11px] font-semibold ring-1 ${
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
                      S{index + 1}
                    </span>
                    <span className="hidden font-mono text-[11px] text-ink/25 sm:inline">
                      /0{index + 1}
                    </span>
                  </div>
                  <div className={`flex-1 ${index < TRACK.length - 1 ? 'border-b border-ink/10' : ''}`}>
                    <div className="flex items-center gap-3">
                      <h3 className="display text-2xl text-ink">{stage.title}</h3>
                      {stage.tone === 'live' && (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-600/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.14em] text-brand-700 ring-1 ring-brand-600/20">
                          İndi
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-sm text-ink/55">{stage.text}</p>
                  </div>
                </li>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>

      {/* ------------------------------------------------------------------ steps */}
      <Reveal>
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
            <div key={step.title} className="group bg-parchment p-9 transition hover:bg-white">
              <p className="font-mono text-xs font-semibold tracking-[0.18em] text-brand-600">
                (0{index + 1})
              </p>
              <h3 className="display mt-5 text-2xl text-ink">{step.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink/55">{step.text}</p>
            </div>
          ))}
        </section>
      </Reveal>

      {/* ------------------------------------------------------------------ categories */}
      <section>
        <Reveal>
          <div className="mb-9 flex flex-wrap items-end justify-between gap-3">
            <div>
              <Kicker>Xidmət sahələri</Kicker>
              <h2 className="display mt-2 text-4xl text-ink sm:text-5xl">
                Şikayət verəcəyiniz sahəni <em className="font-medium text-brand-600">seçin</em>
              </h2>
              <p className="mt-3 max-w-md text-sm leading-relaxed text-ink/55">
                Hər kateqoriya məsul idarəyə və təxmini həll müddətinə bağlıdır.
              </p>
            </div>
            <Link
              to="/categories"
              className="link-underline text-sm font-semibold text-brand-700 transition hover:text-brand-800"
            >
              Bütün kateqoriyalar
            </Link>
          </div>
        </Reveal>

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
            {categories.slice(0, 9).map((category, index) => (
              <Reveal key={category.id} delay={(index % 3) * 90}>
                <Link
                  to={user && !isStaff ? '/complaints/new' : '/categories'}
                  className="card-rule card group flex h-full flex-col p-7 transition duration-300 hover:-translate-y-1 hover:border-brand-300 hover:shadow-lift"
                >
                  <div className="flex items-center justify-between">
                    <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-ink/35">
                      Sahə {String(index + 1).padStart(2, '0')}
                    </p>
                    <span
                      className="flex size-8 items-center justify-center rounded-full bg-ink/4 text-brand-600 ring-1 ring-ink/10 transition duration-300 group-hover:bg-brand-600 group-hover:text-parchment group-hover:ring-brand-600"
                      aria-hidden
                    >
                      <svg viewBox="0 0 24 24" className="size-3.5" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </span>
                  </div>
                  <h3 className="display mt-5 text-2xl text-ink transition group-hover:text-brand-800">
                    {category.name}
                  </h3>
                  <p className="mt-2 line-clamp-2 flex-1 text-sm leading-relaxed text-ink/55">
                    {category.description}
                  </p>
                  <p className="mt-5 border-t border-ink/8 pt-3 font-mono text-[11px] uppercase tracking-[0.14em] text-ink/40">
                    {category.departmentName} ·{' '}
                    {category.estimatedResolutionHours > 0
                      ? `≈ ${formatHours(category.estimatedResolutionHours)}`
                      : 'müddət qeyd olunmur'}
                  </p>
                </Link>
              </Reveal>
            ))}
          </div>
        )}
      </section>

      {/* ------------------------------------------------------------------ CTA */}
      {!user && (
        <Reveal>
          <section className="relative overflow-hidden rounded-2xl bg-ink px-8 py-16 text-white shadow-lift sm:px-14">
            <div className="dot-grid-light pointer-events-none absolute inset-0 opacity-25" />
            <div className="pointer-events-none absolute -right-24 -top-28 h-72 w-72 rounded-full bg-brand-600/30 blur-3xl" />
            <p className="pointer-events-none absolute bottom-0 right-6 select-none font-display text-[10rem] font-semibold leading-none text-white/[0.04]">
              24
            </p>
            <div className="relative flex flex-wrap items-end justify-between gap-8">
              <div className="max-w-xl">
                <Kicker className="text-brand-300">Başlamaq üçün</Kicker>
                <h2 className="display mt-3 text-4xl text-white sm:text-5xl">
                  İlk şikayətinizi bu gün <em className="font-medium text-brand-300">verin</em>
                </h2>
                <p className="mt-3 text-sm leading-relaxed text-slate-300">
                  Hesab yaratmaq bir dəqiqədən az çəkir və pulsuzdur — qeydiyyatdan sonra dərhal
                  başlaya bilərsiniz.
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <Link
                  to="/register"
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-brand-600 px-8 py-3 text-sm font-semibold text-white shadow-[0_16px_40px_-16px_rgb(0_0_0/0.5)] transition hover:bg-brand-700"
                >
                  Qeydiyyatdan keç
                  <span aria-hidden>→</span>
                </Link>
                <Link
                  to="/login"
                  className="inline-flex items-center rounded-full px-6 py-3 text-sm font-semibold text-white ring-1 ring-white/30 transition hover:bg-white/10"
                >
                  Daxil ol
                </Link>
              </div>
            </div>
          </section>
        </Reveal>
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
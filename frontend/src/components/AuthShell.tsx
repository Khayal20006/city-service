import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { BrandMark, Kicker } from './ui'

const POINTS = [
  'Şikayəti xəritədə 10 dəqiqəyə verin',
  'Məsul idarəyə avtomatik yönləndirmə',
  'Həll prosesini real vaxtda izləyin',
]

/**
 * Split-panel shell shared by the login and register screens: a story side that
 * explains the product and a form side that holds the actual fields.
 */
export default function AuthShell({
  kicker,
  title,
  subtitle,
  children,
  footer,
}: {
  kicker: string
  title: string
  subtitle: string
  children: ReactNode
  footer: ReactNode
}) {
  return (
    <div className="mx-auto max-w-4xl animate-fade-up">
      <div className="card grid overflow-hidden md:grid-cols-2">
        <aside className="relative hidden flex-col justify-between overflow-hidden bg-ink p-10 text-white md:flex">
          <div className="dot-grid-light pointer-events-none absolute inset-0 opacity-25" />
          <div className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full bg-brand-600/40 blur-3xl" />

          <div className="relative">
            <div className="flex items-center gap-2.5">
              <BrandMark size="sm" />
              <span className="display block text-sm text-white">Şəhər Xidmətləri</span>
            </div>

            <h2 className="display mt-10 text-3xl leading-tight">
              Şəhərin yaxşılaşmasına
              <br />
              bir şikayətdən başlayın.
            </h2>

            <ul className="mt-8 space-y-3">
              {POINTS.map((point) => (
                <li key={point} className="flex items-start gap-2.5 text-sm text-slate-300">
                  <svg
                    viewBox="0 0 24 24"
                    className="mt-0.5 size-4 shrink-0 text-brand-300"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.4"
                  >
                    <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  {point}
                </li>
              ))}
            </ul>
          </div>

          <p className="relative mt-10 text-xs leading-relaxed text-slate-500">
            Portal Bakı şəhərinin infrastruktur xidmətlərini vahid rəqəmsal məkanda birləşdirir.
          </p>
        </aside>

        <div className="flex flex-col justify-center p-7 sm:p-10">
          <div className="md:hidden">
            <BrandMark />
          </div>

          <Kicker>{kicker}</Kicker>
          <h1 className="display mt-2 text-2xl text-ink sm:text-[28px]">{title}</h1>
          <p className="mt-2 text-sm text-ink/55">{subtitle}</p>

          <div className="mt-7">{children}</div>

          <p className="hairline mt-8 pt-5 text-center text-sm text-ink/55">{footer}</p>
        </div>
      </div>

      <p className="mt-5 text-center text-xs text-ink/45">
        <Link to="/" className="font-medium text-brand-700 hover:underline">
          ← Ana səhifəyə qayıt
        </Link>
      </p>
    </div>
  )
}
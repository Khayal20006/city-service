import { Link } from 'react-router-dom'
import { Kicker, LinkButton } from '../components/ui'

export default function NotFoundPage() {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center animate-fade-in">
      <Kicker>Xəta 404</Kicker>
      <p className="display mt-3 text-[clamp(4rem,14vw,8rem)] leading-none text-ink">
        4<em className="text-brand-600">0</em>4
      </p>
      <h1 className="display mt-4 text-2xl text-ink">Səhifə tapılmadı</h1>
      <p className="mt-2 max-w-sm text-sm text-ink/55">
        Axtardığınız səhifə köçürülüb və ya silinib — baş keçidi ilə davam edin.
      </p>
      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        <LinkButton to="/">Ana səhifə</LinkButton>
        <Link
          to="/categories"
          className="inline-flex items-center rounded-full px-5 py-2.5 text-sm font-semibold text-ink/55 ring-1 ring-ink/15 transition hover:bg-ink/5 hover:text-ink"
        >
          Kateqoriyalara bax
        </Link>
      </div>
    </div>
  )
}
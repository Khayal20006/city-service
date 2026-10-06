import { Link } from 'react-router-dom'
import { LinkButton } from '../components/ui'

export default function NotFoundPage() {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <p className="font-mono text-6xl font-bold text-brand-600">404</p>
      <h1 className="mt-4 text-xl font-bold text-slate-900">Səhifə tapılmadı</h1>
      <p className="mt-2 max-w-sm text-sm text-slate-500">
        Axtardığınız səhifə köçürülüb və ya silinib.
      </p>
      <div className="mt-6">
        <LinkButton to="/">Ana səhifə</LinkButton>
      </div>
      <p className="mt-6 text-xs text-slate-400">
        <Link to="/categories" className="text-brand-700 hover:underline">
          Kateqoriyalara bax
        </Link>
      </p>
    </div>
  )
}
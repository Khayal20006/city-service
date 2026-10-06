import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { Link } from 'react-router-dom'
import {
  PRIORITY_LABELS,
  PRIORITY_STYLES,
  STATUS_LABELS,
  STATUS_STYLES,
} from '../lib/format'
import type { ComplaintStatus, Priority } from '../lib/types'

/* ------------------------------------------------------------------ primitives */

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger'
type ButtonSize = 'sm' | 'md' | 'lg'

const BUTTON_VARIANTS: Record<ButtonVariant, string> = {
  primary:
    'bg-ink text-parchment hover:bg-brand-700 focus-visible:outline-brand-600 shadow-[0_10px_24px_-12px_rgb(34_29_22/0.5)]',
  secondary: 'bg-parchment text-ink ring-1 ring-ink/15 hover:ring-ink/30',
  ghost: 'text-ink/65 hover:bg-ink/5 hover:text-ink',
  danger: 'bg-rose-700 text-white hover:bg-rose-800 focus-visible:outline-rose-700',
}

const BUTTON_SIZES: Record<ButtonSize, string> = {
  sm: 'px-3.5 py-1.5 text-xs',
  md: 'px-5 py-2.5 text-sm',
  lg: 'px-7 py-3 text-[15px]',
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  loading?: boolean
  fullWidth?: boolean
}

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  fullWidth = false,
  className = '',
  children,
  disabled,
  ...rest
}: ButtonProps) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-full font-semibold tracking-tight transition
        focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-55
        active:translate-y-px ${BUTTON_VARIANTS[variant]} ${BUTTON_SIZES[size]}
        ${fullWidth ? 'w-full' : ''} ${className}`}
      disabled={disabled || loading}
      {...rest}
    >
      {loading && <Spinner className="size-4" />}
      {children}
    </button>
  )
}

export function Spinner({ className = 'size-5' }: { className?: string }) {
  return (
    <svg className={`animate-spin ${className}`} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path
        className="opacity-90"
        fill="currentColor"
        d="M4 12a8 8 0 0 1 8-8v4a4 4 0 0 0-4 4H4z"
      />
    </svg>
  )
}

/** Slim uppercase micro-label used above section titles. */
export function Kicker({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <p className={`kicker ${className}`}>{children}</p>
}

/** Brand monogram used by the header and the auth split-panel. */
export function BrandMark({ size = 'sm' }: { size?: 'sm' | 'lg' | 'xl' }) {
  const box = size === 'sm' ? 'size-9 rounded-lg' : size === 'lg' ? 'size-12 rounded-xl' : 'size-16 rounded-2xl'
  const icon = size === 'sm' ? 'size-5' : size === 'lg' ? 'size-7' : 'size-9'
  return (
    <span
      className={`inline-flex ${box} items-center justify-center bg-ink text-parchment ring-1 ring-white/15`}
    >
      <svg viewBox="0 0 24 24" className={`${icon}`} fill="none" stroke="currentColor" strokeWidth="1.7">
        <path d="M3 21h18M5 21V9l7-5 7 5v12M9 21v-5h6v5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </span>
  )
}

export function Card({
  className = '',
  children,
}: {
  className?: string
  children: ReactNode
}) {
  return <div className={`card ${className}`}>{children}</div>
}

export function CardHeader({
  title,
  subtitle,
  action,
}: {
  title: string
  subtitle?: string
  action?: ReactNode
}) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-3 border-b border-ink/8 px-5 py-4">
      <div>
        <h2 className="display text-lg text-ink">{title}</h2>
        {subtitle && <p className="mt-0.5 text-sm text-ink/55">{subtitle}</p>}
      </div>
      {action}
    </div>
  )
}

export function Field({
  label,
  hint,
  error,
  children,
}: {
  label: string
  hint?: string
  error?: string
  children: ReactNode
}) {
  return (
    <label className="block">
      <span className="field-label">{label}</span>
      {children}
      {hint && !error && <span className="field-hint block">{hint}</span>}
      {error && <span className="mt-1.5 block text-xs font-medium text-rose-700">{error}</span>}
    </label>
  )
}

export function Alert({
  tone = 'error',
  title,
  children,
}: {
  tone?: 'error' | 'success' | 'info'
  title?: string
  children: ReactNode
}) {
  const tones = {
    error: 'bg-rose-50 text-rose-800 ring-rose-200',
    success: 'bg-emerald-50 text-emerald-800 ring-emerald-200',
    info: 'bg-sky-50 text-sky-800 ring-sky-200',
  } as const

  return (
    <div className={`rounded-lg px-4 py-3 text-sm ring-1 ${tones[tone]}`} role="alert">
      {title && <p className="font-semibold">{title}</p>}
      <div className={title ? 'mt-0.5' : ''}>{children}</div>
    </div>
  )
}

export function Badge({ className = '', children }: { className?: string; children: ReactNode }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${className}`}
    >
      {children}
    </span>
  )
}

export function StatusBadge({ status }: { status: ComplaintStatus }) {
  return <Badge className={STATUS_STYLES[status]}>{STATUS_LABELS[status]}</Badge>
}

export function PriorityBadge({ priority }: { priority: Priority }) {
  return <Badge className={PRIORITY_STYLES[priority]}>{PRIORITY_LABELS[priority]}</Badge>
}

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string
  description?: string
  action?: ReactNode
}) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
      <div className="flex size-12 items-center justify-center rounded-xl bg-ink/4 text-ink/40 ring-1 ring-ink/10">
        <svg viewBox="0 0 24 24" className="size-6" fill="none" stroke="currentColor" strokeWidth="1.6">
          <path d="M9 12h6M9 16h4M7 3h10a2 2 0 0 1 2 2v14l-7-3-7 3V5a2 2 0 0 1 2-2z" />
        </svg>
      </div>
      <h3 className="mt-4 display text-base text-ink">{title}</h3>
      {description && <p className="mt-1 max-w-sm text-sm text-ink/55">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}

export function PageLoader({ label = 'Yüklənir…' }: { label?: string }) {
  return (
    <div className="flex items-center justify-center gap-3 py-20 text-sm text-ink/55">
      <Spinner className="size-5 text-brand-600" />
      {label}
    </div>
  )
}

/** Pulsing placeholder used while lists load — avoids the layout jump of a spinner. */
export function SkeletonCard() {
  return (
    <div className="card p-6">
      <div className="shimmer-bar h-3 w-16" />
      <div className="shimmer-bar mt-4 h-5 w-3/4" />
      <div className="shimmer-bar mt-2 h-3 w-full" />
      <div className="shimmer-bar mt-6 h-3 w-1/2" />
    </div>
  )
}

export function StatCard({
  label,
  value,
  hint,
  tone = 'brand',
  className = '',
}: {
  label: string
  value: string | number
  hint?: string
  tone?: 'brand' | 'emerald' | 'amber' | 'rose'
  className?: string
}) {
  const mark = {
    brand: 'bg-brand-600',
    emerald: 'bg-emerald-600',
    amber: 'bg-amber-600',
    rose: 'bg-rose-600',
  } as const

  return (
    <div className={`card relative overflow-hidden p-6 ${className}`}>
      <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-ink/0 via-ink/8 to-ink/0" />
      <div className="flex items-center justify-between gap-3">
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-ink/50">{label}</p>
        <span className={`size-2 rounded-full ${mark[tone]}`} />
      </div>
      <p className="display mt-4 text-4xl tabular-nums text-ink">{value}</p>
      {hint && <p className="mt-2 text-xs text-ink/50">{hint}</p>}
    </div>
  )
}

export function SectionTitle({
  title,
  description,
  kicker,
  action,
}: {
  title: string
  description?: string
  kicker?: string
  action?: ReactNode
}) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-3">
      <div>
        {kicker && <Kicker>{kicker}</Kicker>}
        <h1 className="display mt-1 text-3xl text-ink sm:text-4xl">{title}</h1>
        {description && <p className="mt-2 max-w-xl text-sm leading-relaxed text-ink/55">{description}</p>}
      </div>
      {action}
    </div>
  )
}

export function LinkButton({
  to,
  children,
  variant = 'primary',
  size = 'md',
  className = '',
}: {
  to: string
  children: ReactNode
  variant?: ButtonVariant
  size?: ButtonSize
  className?: string
}) {
  return (
    <Link
      to={to}
      className={`inline-flex items-center justify-center gap-2 rounded-full font-semibold tracking-tight transition
        focus-visible:outline-2 focus-visible:outline-offset-2 active:translate-y-px
        ${BUTTON_VARIANTS[variant]} ${BUTTON_SIZES[size]} ${className}`}
    >
      {children}
    </Link>
  )
}
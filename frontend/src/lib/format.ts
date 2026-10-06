import type { ComplaintStatus, Priority, Role } from './types'

export const STATUS_LABELS: Record<ComplaintStatus, string> = {
  PENDING: 'Gözləyir',
  UNDER_REVIEW: 'Nəzərdə',
  IN_PROGRESS: 'İcra edildi',
  RESOLVED: 'Həll edildi',
  REJECTED: 'Rədd edildi',
  CANCELLED: 'Ləğv edildi',
}

export const STATUS_STYLES: Record<ComplaintStatus, string> = {
  PENDING: 'bg-amber-50 text-amber-700 ring-amber-200',
  UNDER_REVIEW: 'bg-sky-50 text-sky-700 ring-sky-200',
  IN_PROGRESS: 'bg-brand-50 text-brand-700 ring-brand-200',
  RESOLVED: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  REJECTED: 'bg-rose-50 text-rose-700 ring-rose-200',
  CANCELLED: 'bg-slate-100 text-slate-600 ring-slate-300',
}

export const PRIORITY_LABELS: Record<Priority, string> = {
  LOW: 'Aşağı',
  NORMAL: 'Normal',
  HIGH: 'Yüksək',
  URGENT: 'Təcili',
}

export const PRIORITY_STYLES: Record<Priority, string> = {
  LOW: 'bg-slate-100 text-slate-600 ring-slate-300',
  NORMAL: 'bg-sky-50 text-sky-700 ring-sky-200',
  HIGH: 'bg-orange-50 text-orange-700 ring-orange-200',
  URGENT: 'bg-rose-50 text-rose-700 ring-rose-200',
}

export const ROLE_LABELS: Record<Role, string> = {
  CITIZEN: 'Vətəndaş',
  DEPARTMENT_MANAGER: 'Şöbə müdir',
  FIELD_EMPLOYEE: 'Sahə işçisi',
  ADMIN: 'Administrator',
}

export const STATUS_ORDER: ComplaintStatus[] = [
  'PENDING',
  'UNDER_REVIEW',
  'IN_PROGRESS',
  'RESOLVED',
  'REJECTED',
  'CANCELLED',
]

export const BAKU_DISTRICTS = [
  'Xəzər',
  'Sabunçu',
  'Nəsimi',
  'Yasamal',
  'Binəqədi',
  'Nizami',
  'Nərimanov',
  'Suraxanı',
  'Xətai',
  'Sabail',
  'Qaradağ',
  'Pirallahı',
]

export const BAKU_CENTER: [number, number] = [40.4093, 49.8671]

const dateFormatter = new Intl.DateTimeFormat('az-AZ', {
  day: '2-digit',
  month: 'long',
  year: 'numeric',
})

const dateTimeFormatter = new Intl.DateTimeFormat('az-AZ', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
})

export function formatDate(value: string | null | undefined): string {
  if (!value) return '—'
  return dateFormatter.format(new Date(value))
}

export function formatDateTime(value: string | null | undefined): string {
  if (!value) return '—'
  return dateTimeFormatter.format(new Date(value))
}

/** "3 dəqiqə əvvəl" — reads better on a dashboard than a raw timestamp. */
export function formatRelative(value: string | null | undefined): string {
  if (!value) return '—'
  const seconds = Math.round((Date.now() - new Date(value).getTime()) / 1000)
  if (seconds < 60) return 'indi'
  const minutes = Math.round(seconds / 60)
  if (minutes < 60) return `${minutes} dəqiqə əvvəl`
  const hours = Math.round(minutes / 60)
  if (hours < 24) return `${hours} saat əvvəl`
  const days = Math.round(hours / 24)
  if (days < 30) return `${days} gün əvvəl`
  const months = Math.round(days / 30)
  if (months < 12) return `${months} ay əvvəl`
  return `${Math.round(months / 12)} il əvvəl`
}

export function formatHours(hours: number): string {
  if (hours <= 0) return '—'
  if (hours < 24) return `${Math.round(hours)} saat`
  const days = hours / 24
  return `${days % 1 === 0 ? days : days.toFixed(1)} gün`
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`
}

export function initials(fullName: string | null, fallback: string): string {
  const source = fullName?.trim() || fallback
  return source.slice(0, 2).toUpperCase()
}
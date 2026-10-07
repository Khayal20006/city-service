import { memo } from 'react'
import { Link } from 'react-router-dom'
import { formatDate, formatRelative } from '../lib/format'
import type { Complaint } from '../lib/types'
import { Badge, PriorityBadge, StatusBadge } from './ui'

function ComplaintCard({ complaint }: { complaint: Complaint }) {
  return (
    <Link
      to={`/complaints/${complaint.id}`}
      className="group card flex flex-col p-5 transition duration-300 hover:-translate-y-0.5 hover:border-brand-300 hover:shadow-lift"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-mono text-[11px] font-semibold tracking-wide text-brand-700">
            {complaint.referenceCode}
          </p>
          <h3 className="display mt-0.5 truncate text-[15px] text-ink group-hover:text-brand-800">
            {complaint.title}
          </h3>
        </div>
        <StatusBadge status={complaint.status} />
      </div>

      <p className="mt-2 line-clamp-2 flex-1 text-sm leading-relaxed text-ink/55">
        {complaint.description}
      </p>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <Badge className="bg-ink/4 text-ink/60 ring-ink/10">{complaint.categoryName}</Badge>
        <PriorityBadge priority={complaint.priority} />
        {complaint.district && (
          <Badge className="bg-ink/4 text-ink/60 ring-ink/10">{complaint.district}</Badge>
        )}
        {complaint.imageUrl && (
          <Badge className="bg-ink/4 text-ink/60 ring-ink/10">Şəkil</Badge>
        )}
      </div>

      <div className="mt-3 flex items-center justify-between border-t border-ink/8 pt-3 text-xs text-ink/45">
        <span title={formatDate(complaint.createdAt)}>{formatRelative(complaint.createdAt)}</span>
        {complaint.assignedToName && <span className="truncate">Məsul: {complaint.assignedToName}</span>}
      </div>
    </Link>
  )
}

export default memo(ComplaintCard)
import { Calendar } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { STATUS_CONFIG, formatCurrency, formatDate, timeAgo } from '@/lib/utils'
import type { Invoice } from '@/types'

interface InvoiceCardProps {
  invoice: Invoice
  clientName?: string
  onClick?: () => void
}

export function InvoiceCard({ invoice, clientName, onClick }: InvoiceCardProps) {
  const statusCfg = STATUS_CONFIG[invoice.status]
  const displayClient = clientName ?? (invoice.clients as { name?: string } | null)?.name ?? 'Unknown Client'

  const inner = (
    <Card className="transition-shadow hover:shadow-md cursor-pointer group">
      <CardContent className="p-5">
        {/* Top row */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 mb-0.5">
              <span className="font-semibold text-sm">{invoice.invoice_number}</span>
              <div
                className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium ${statusCfg.bg} ${statusCfg.border} ${statusCfg.color}`}
              >
                <span className={`h-1.5 w-1.5 rounded-full ${statusCfg.dot}`} />
                {statusCfg.label}
              </div>
            </div>
            <p className="text-sm text-muted-foreground truncate">{displayClient}</p>
          </div>
          <div className="text-right shrink-0">
            <div className="text-lg font-bold text-foreground group-hover:text-purple-600 transition-colors">
              {formatCurrency(invoice.total, invoice.currency)}
            </div>
          </div>
        </div>

        {/* Date row */}
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            <span>Due {formatDate(invoice.due_at)}</span>
          </div>
          <span title={formatDate(invoice.created_at)}>{timeAgo(invoice.created_at)}</span>
        </div>
      </CardContent>
    </Card>
  )

  if (onClick) {
    return (
      <button type="button" onClick={onClick} className="w-full text-left">
        {inner}
      </button>
    )
  }

  return inner
}
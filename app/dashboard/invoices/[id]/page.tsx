import { notFound } from 'next/navigation'
import { createServerClient } from '@/lib/supabase/server'
import { Header } from '@/components/layout/header'
import { InvoicePreview } from '@/components/invoice/invoice-preview'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { STATUS_CONFIG, formatCurrency, timeAgo } from '@/lib/utils'
import Link from 'next/link'
import { Pencil, Send, Download, Trash2, ArrowLeft } from 'lucide-react'
import type { Invoice, Client, User } from '@/types'

export const dynamic = 'force-dynamic'

interface Props {
  params: { id: string }
}

export default async function InvoiceDetailPage({ params }: Props) {
  const supabase = createServerClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return null

  const { data: invoice } = await supabase
    .from('invoices')
    .select('*, clients(*)')
    .eq('id', params.id)
    .eq('user_id', session.user.id)
    .single()

  if (!invoice) notFound()

  const { data: userData } = await supabase
    .from('users')
    .select('*')
    .eq('id', session.user.id)
    .single()

  const cfg = STATUS_CONFIG[invoice.status as keyof typeof STATUS_CONFIG]

  return (
    <div>
      <Header
        title={invoice.invoice_number}
        subtitle={`Created ${timeAgo(invoice.created_at)}`}
      />
      <div className="p-6 space-y-6 max-w-6xl">
        {/* Back + Actions bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <Link
            href="/dashboard/invoices"
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to invoices
          </Link>
          <div className="flex items-center gap-2 flex-wrap">
            <Badge className={`${cfg.bg} ${cfg.text} border-0`}>
              <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot} mr-1.5 inline-block`} />
              {cfg.label}
            </Badge>
            <Link href={`/dashboard/invoices/${invoice.id}/edit`}>
              <Button variant="outline" size="sm">
                <Pencil className="h-4 w-4 mr-1.5" />
                Edit
              </Button>
            </Link>
            {invoice.status === 'draft' && (
              <SendButton invoiceId={invoice.id} />
            )}
          </div>
        </div>

        {/* Invoice Preview */}
        <InvoicePreview
          invoice={invoice as Invoice}
          client={invoice.clients as Client}
          user={userData as User}
        />
      </div>
    </div>
  )
}

// Small client component just for the Send button
function SendButton({ invoiceId }: { invoiceId: string }) {
  return (
    <form action={`/api/invoice/${invoiceId}/send`} method="POST">
      <Button size="sm" className="bg-purple-600 hover:bg-purple-700 text-white" type="submit">
        <Send className="h-4 w-4 mr-1.5" />
        Mark as Sent
      </Button>
    </form>
  )
}
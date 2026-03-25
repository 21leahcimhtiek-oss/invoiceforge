'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Search, Filter, Loader2 } from 'lucide-react'
import { Header } from '@/components/layout/header'
import { InvoiceCard } from '@/components/invoice/invoice-card'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import type { Invoice } from '@/types'

type InvoiceWithClient = Invoice & { clients: { name: string; company: string | null } | null }

export default function InvoicesPage() {
  const router = useRouter()
  const [invoices, setInvoices] = useState<InvoiceWithClient[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  useEffect(() => {
    fetch('/api/invoice')
      .then((r) => r.json())
      .then((data) => setInvoices(data.invoices ?? []))
      .finally(() => setLoading(false))
  }, [])

  const filtered = invoices.filter((inv) => {
    const clientName = inv.clients?.name?.toLowerCase() ?? ''
    const invoiceNum = inv.invoice_number.toLowerCase()
    const q = search.toLowerCase()
    const matchesSearch = !q || clientName.includes(q) || invoiceNum.includes(q)
    const matchesStatus = statusFilter === 'all' || inv.status === statusFilter
    return matchesSearch && matchesStatus
  })

  return (
    <div>
      <Header
        title="Invoices"
        subtitle={`${invoices.length} total invoice${invoices.length !== 1 ? 's' : ''}`}
        action={{ label: 'New Invoice', href: '/dashboard/invoices/new', icon: 'plus' }}
      />
      <div className="p-6 space-y-5">
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by client or invoice number…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-44">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="sent">Sent</SelectItem>
              <SelectItem value="paid">Paid</SelectItem>
              <SelectItem value="overdue">Overdue</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : filtered.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
              <p className="font-medium mb-1">
                {search || statusFilter !== 'all' ? 'No invoices match your filters' : 'No invoices yet'}
              </p>
              <p className="text-sm text-muted-foreground mb-4">
                {search || statusFilter !== 'all'
                  ? 'Try adjusting your search or filter'
                  : 'Create your first invoice to get started'}
              </p>
              {!search && statusFilter === 'all' && (
                <Button
                  onClick={() => router.push('/dashboard/invoices/new')}
                  className="bg-purple-600 hover:bg-purple-700 text-white"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  New Invoice
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((invoice) => (
              <InvoiceCard
                key={invoice.id}
                invoice={invoice}
                clientName={invoice.clients?.name ?? 'Unknown Client'}
                onClick={() => router.push(`/dashboard/invoices/${invoice.id}`)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
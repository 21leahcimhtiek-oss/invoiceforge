import { createServerClient } from '@/lib/supabase/server'
import { Header } from '@/components/layout/header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { InvoiceCard } from '@/components/invoice/invoice-card'
import { FileText, Users, DollarSign, TrendingUp, Plus } from 'lucide-react'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const supabase = createServerClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return null

  // Parallel data fetches
  const [invoicesRes, clientsRes, paidRes, draftRes] = await Promise.all([
    supabase
      .from('invoices')
      .select('*, clients(name, company)')
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false })
      .limit(6),
    supabase
      .from('clients')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', session.user.id),
    supabase
      .from('invoices')
      .select('total')
      .eq('user_id', session.user.id)
      .eq('status', 'paid'),
    supabase
      .from('invoices')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', session.user.id)
      .eq('status', 'draft'),
  ])

  const invoices = invoicesRes.data ?? []
  const clientCount = clientsRes.count ?? 0
  const totalPaid = (paidRes.data ?? []).reduce((sum, inv) => sum + (inv.total ?? 0), 0)
  const draftCount = draftRes.count ?? 0

  const stats = [
    {
      title: 'Total Invoices',
      value: invoices.length.toString(),
      icon: FileText,
      description: `${draftCount} drafts`,
      color: 'text-purple-600',
      bg: 'bg-purple-50 dark:bg-purple-950/30',
    },
    {
      title: 'Active Clients',
      value: clientCount.toString(),
      icon: Users,
      description: 'across all invoices',
      color: 'text-blue-600',
      bg: 'bg-blue-50 dark:bg-blue-950/30',
    },
    {
      title: 'Total Earned',
      value: `$${totalPaid.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      icon: DollarSign,
      description: 'from paid invoices',
      color: 'text-green-600',
      bg: 'bg-green-50 dark:bg-green-950/30',
    },
    {
      title: 'Outstanding',
      value: (() => {
        const outstanding = (invoicesRes.data ?? [])
          .filter((i) => i.status === 'sent' || i.status === 'overdue')
          .reduce((sum, i) => sum + (i.total ?? 0), 0)
        return `$${outstanding.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
      })(),
      icon: TrendingUp,
      description: 'awaiting payment',
      color: 'text-orange-600',
      bg: 'bg-orange-50 dark:bg-orange-950/30',
    },
  ]

  return (
    <div>
      <Header
        title="Dashboard"
        subtitle="Welcome back — here's your invoicing overview"
        action={{ label: 'New Invoice', href: '/dashboard/invoices/new', icon: 'plus' }}
      />
      <div className="p-6 space-y-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat) => (
            <Card key={stat.title}>
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.title}</p>
                    <p className={`text-2xl font-bold mt-1 ${stat.color}`}>{stat.value}</p>
                    <p className="text-xs text-muted-foreground mt-1">{stat.description}</p>
                  </div>
                  <div className={`p-2.5 rounded-lg ${stat.bg}`}>
                    <stat.icon className={`h-5 w-5 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Recent Invoices */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Recent Invoices</h2>
            <Link
              href="/dashboard/invoices"
              className="text-sm text-purple-600 hover:text-purple-700 font-medium"
            >
              View all →
            </Link>
          </div>

          {invoices.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                <div className="w-12 h-12 bg-purple-50 dark:bg-purple-950/30 rounded-full flex items-center justify-center mb-4">
                  <FileText className="h-6 w-6 text-purple-500" />
                </div>
                <h3 className="font-semibold mb-1">No invoices yet</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Create your first invoice and start getting paid
                </p>
                <Link
                  href="/dashboard/invoices/new"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white text-sm font-medium rounded-lg hover:bg-purple-700 transition-colors"
                >
                  <Plus className="h-4 w-4" />
                  Create Invoice
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {invoices.map((invoice) => (
                <InvoiceCard
                  key={invoice.id}
                  invoice={invoice}
                  clientName={(invoice.clients as { name: string; company: string | null } | null)?.name ?? 'Unknown Client'}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
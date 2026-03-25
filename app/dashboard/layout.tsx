import { redirect } from 'next/navigation'
import { createServerClient } from '@/lib/supabase/server'
import { Sidebar } from '@/components/layout/sidebar'

export const dynamic = 'force-dynamic'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = createServerClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) redirect('/login')

  const { data: user } = await supabase
    .from('users')
    .select('id, name, email, plan, business_name')
    .eq('id', session.user.id)
    .single()

  const { count: invoiceCount } = await supabase
    .from('invoices')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', session.user.id)

  const { count: clientCount } = await supabase
    .from('clients')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', session.user.id)

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar
        user={user ?? { id: session.user.id, name: session.user.email ?? '', email: session.user.email ?? '', plan: 'free', business_name: null }}
        invoiceCount={invoiceCount ?? 0}
        clientCount={clientCount ?? 0}
      />
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  )
}
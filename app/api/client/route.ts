import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const supabase = createServerClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: clients, error } = await supabase
    .from('clients')
    .select('*')
    .eq('user_id', session.user.id)
    .order('name', { ascending: true })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Enrich with invoice stats
  const clientsWithStats = await Promise.all(
    (clients ?? []).map(async (client) => {
      const { data: invoices } = await supabase
        .from('invoices')
        .select('total, status')
        .eq('client_id', client.id)
        .eq('user_id', session.user.id)

      const invoice_count = invoices?.length ?? 0
      const total_billed = (invoices ?? [])
        .filter((i) => i.status === 'paid')
        .reduce((sum, i) => sum + (i.total ?? 0), 0)

      return { ...client, invoice_count, total_billed }
    })
  )

  return NextResponse.json({ clients: clientsWithStats })
}

export async function POST(request: Request) {
  const supabase = createServerClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const { name, email, company, phone, website, address } = body

  if (!name) return NextResponse.json({ error: 'Name is required' }, { status: 400 })

  // Check plan limit
  const { data: user } = await supabase
    .from('users')
    .select('plan')
    .eq('id', session.user.id)
    .single()

  if (user?.plan === 'free') {
    const { count } = await supabase
      .from('clients')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', session.user.id)

    if ((count ?? 0) >= 3) {
      return NextResponse.json(
        { error: 'Free plan limit reached. Upgrade to Pro for unlimited clients.' },
        { status: 403 }
      )
    }
  }

  const { data: client, error } = await supabase
    .from('clients')
    .insert({ user_id: session.user.id, name, email, company, phone, website, address })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ client }, { status: 201 })
}
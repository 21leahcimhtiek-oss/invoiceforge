import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { calculateTotals } from '@/lib/utils'

interface Params { params: { id: string } }

export async function GET(_req: Request, { params }: Params) {
  const supabase = createServerClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: invoice, error } = await supabase
    .from('invoices')
    .select('*, clients(*)')
    .eq('id', params.id)
    .eq('user_id', session.user.id)
    .single()

  if (error || !invoice) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json({ invoice })
}

export async function PUT(request: Request, { params }: Params) {
  const supabase = createServerClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const {
    client_id,
    invoice_number,
    status,
    issued_at,
    due_at,
    currency,
    line_items = [],
    tax_rate = 0,
    discount_amount = 0,
    notes,
    terms,
  } = body

  const totals = calculateTotals(line_items, tax_rate, discount_amount)

  const { data: invoice, error } = await supabase
    .from('invoices')
    .update({
      client_id,
      invoice_number,
      status,
      issued_at,
      due_at,
      currency,
      line_items,
      tax_rate,
      discount_amount,
      subtotal: totals.subtotal,
      tax_amount: totals.tax_amount,
      total: totals.total,
      notes,
      terms,
    })
    .eq('id', params.id)
    .eq('user_id', session.user.id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ invoice })
}

export async function DELETE(_req: Request, { params }: Params) {
  const supabase = createServerClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { error } = await supabase
    .from('invoices')
    .delete()
    .eq('id', params.id)
    .eq('user_id', session.user.id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Decrement count
  const { data: user } = await supabase
    .from('users')
    .select('invoice_count')
    .eq('id', session.user.id)
    .single()

  await supabase
    .from('users')
    .update({ invoice_count: Math.max(0, (user?.invoice_count ?? 1) - 1) })
    .eq('id', session.user.id)

  return NextResponse.json({ success: true })
}
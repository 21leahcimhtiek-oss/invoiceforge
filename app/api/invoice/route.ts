import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { generateInvoiceNumber, calculateTotals } from '@/lib/utils'

export async function GET(request: Request) {
  const supabase = createServerClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const meta = searchParams.get('meta')

  // Return next invoice number metadata
  if (meta === 'true') {
    const { data: user } = await supabase
      .from('users')
      .select('next_invoice_number, invoice_prefix')
      .eq('id', session.user.id)
      .single()

    const nextNumber = generateInvoiceNumber(
      user?.invoice_prefix ?? 'INV',
      user?.next_invoice_number ?? 1
    )
    return NextResponse.json({ next_invoice_number: nextNumber })
  }

  // Return invoice list with client info
  const { data: invoices, error } = await supabase
    .from('invoices')
    .select('*, clients(name, company, email)')
    .eq('user_id', session.user.id)
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ invoices })
}

export async function POST(request: Request) {
  const supabase = createServerClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const {
    client_id,
    invoice_number,
    status = 'draft',
    issued_at,
    due_at,
    currency = 'USD',
    line_items = [],
    tax_rate = 0,
    discount_amount = 0,
    notes = '',
    terms = '',
  } = body

  if (!client_id || !invoice_number) {
    return NextResponse.json({ error: 'client_id and invoice_number are required' }, { status: 400 })
  }

  // Check plan limits
  const { data: user } = await supabase
    .from('users')
    .select('plan, invoice_count, next_invoice_number, invoice_prefix')
    .eq('id', session.user.id)
    .single()

  if (user?.plan === 'free' && (user.invoice_count ?? 0) >= 5) {
    return NextResponse.json(
      { error: 'Free plan limit reached. Upgrade to Pro for unlimited invoices.' },
      { status: 403 }
    )
  }

  const totals = calculateTotals(line_items, tax_rate, discount_amount)

  const { data: invoice, error } = await supabase
    .from('invoices')
    .insert({
      user_id: session.user.id,
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
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Increment invoice counter
  await supabase
    .from('users')
    .update({
      invoice_count: (user?.invoice_count ?? 0) + 1,
      next_invoice_number: (user?.next_invoice_number ?? 1) + 1,
    })
    .eq('id', session.user.id)

  return NextResponse.json({ invoice }, { status: 201 })
}
import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { generateInvoiceItems } from '@/lib/openrouter/client'

export async function POST(request: Request) {
  const supabase = createServerClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Only Pro+ plans get AI generation
  const { data: user } = await supabase
    .from('users')
    .select('plan')
    .eq('id', session.user.id)
    .single()

  if (user?.plan === 'free') {
    return NextResponse.json(
      { error: 'AI generation requires a Pro or Agency plan.' },
      { status: 403 }
    )
  }

  const body = await request.json()
  const { description, client_name, currency = 'USD' } = body

  if (!description) {
    return NextResponse.json({ error: 'description is required' }, { status: 400 })
  }

  try {
    const result = await generateInvoiceItems(description, client_name, currency)
    return NextResponse.json(result)
  } catch (err) {
    console.error('[AI Invoice]', err)
    return NextResponse.json({ error: 'AI generation failed' }, { status: 500 })
  }
}
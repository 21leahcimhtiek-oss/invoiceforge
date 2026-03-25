import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

export async function PUT(request: Request) {
  const supabase = createServerClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const {
    name,
    business_name,
    business_email,
    business_phone,
    business_address,
    business_website,
    invoice_prefix,
    tax_id,
  } = body

  const { data: user, error } = await supabase
    .from('users')
    .update({
      name,
      business_name,
      business_email,
      business_phone,
      business_address,
      business_website,
      invoice_prefix,
      tax_id,
    })
    .eq('id', session.user.id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ user })
}
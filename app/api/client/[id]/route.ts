import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

interface Params { params: { id: string } }

export async function GET(_req: Request, { params }: Params) {
  const supabase = createServerClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: client, error } = await supabase
    .from('clients')
    .select('*')
    .eq('id', params.id)
    .eq('user_id', session.user.id)
    .single()

  if (error || !client) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json({ client })
}

export async function PUT(request: Request, { params }: Params) {
  const supabase = createServerClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const { name, email, company, phone, website, address } = body

  const { data: client, error } = await supabase
    .from('clients')
    .update({ name, email, company, phone, website, address })
    .eq('id', params.id)
    .eq('user_id', session.user.id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ client })
}

export async function DELETE(_req: Request, { params }: Params) {
  const supabase = createServerClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { error } = await supabase
    .from('clients')
    .delete()
    .eq('id', params.id)
    .eq('user_id', session.user.id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
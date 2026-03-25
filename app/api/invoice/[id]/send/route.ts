import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

interface Params { params: { id: string } }

export async function POST(_req: Request, { params }: Params) {
  const supabase = createServerClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: invoice, error } = await supabase
    .from('invoices')
    .update({ status: 'sent', sent_at: new Date().toISOString() })
    .eq('id', params.id)
    .eq('user_id', session.user.id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Redirect back to invoice detail on success (for form-based submission)
  return NextResponse.redirect(
    new URL(`/dashboard/invoices/${params.id}`, _req.url)
  )
}
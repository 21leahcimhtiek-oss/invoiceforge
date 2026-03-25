import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  const supabase = createServerClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Delete user data (RLS cascades handle invoices/clients)
  await supabase.from('users').delete().eq('id', session.user.id)

  // Sign out
  await supabase.auth.signOut()

  return NextResponse.redirect(new URL('/', request.url))
}
import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/dashboard'

  if (code) {
    const supabase = createServerClient()
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error && data.session) {
      const user = data.session.user

      // Upsert user record
      await supabase.from('users').upsert(
        {
          id: user.id,
          email: user.email ?? '',
          name: user.user_metadata?.full_name ?? user.user_metadata?.name ?? user.email ?? '',
          plan: 'free',
          invoice_count: 0,
          next_invoice_number: 1,
          invoice_prefix: 'INV',
        },
        { onConflict: 'id', ignoreDuplicates: true }
      )

      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth_failed`)
}
import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

function getStripe() {
  const { default: Stripe } = require('stripe')
  return new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2026-02-25.clover' })
}

export async function POST(request: Request) {
  const supabase = createServerClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: user } = await supabase
    .from('users')
    .select('stripe_customer_id')
    .eq('id', session.user.id)
    .single()

  if (!user?.stripe_customer_id) {
    return NextResponse.json({ error: 'No billing account found' }, { status: 400 })
  }

  const stripe = getStripe()
  const portalSession = await stripe.billingPortal.sessions.create({
    customer: user.stripe_customer_id,
    return_url: `${process.env.NEXT_PUBLIC_URL}/dashboard/billing`,
  })

  return NextResponse.json({ url: portalSession.url })
}
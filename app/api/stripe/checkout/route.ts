import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { PLANS } from '@/lib/stripe/config'

function getStripe() {
  const { default: Stripe } = require('stripe')
  return new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2026-02-25.clover' })
}

export async function POST(request: Request) {
  const supabase = createServerClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { plan } = await request.json()
  const planConfig = PLANS[plan as keyof typeof PLANS]

  if (!planConfig || !planConfig.stripePriceId) {
    return NextResponse.json({ error: 'Invalid plan' }, { status: 400 })
  }

  const { data: user } = await supabase
    .from('users')
    .select('stripe_customer_id, email, name')
    .eq('id', session.user.id)
    .single()

  const stripe = getStripe()

  let customerId = user?.stripe_customer_id
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user?.email ?? session.user.email,
      name: user?.name ?? undefined,
      metadata: { supabase_user_id: session.user.id },
    })
    customerId = customer.id
    await supabase
      .from('users')
      .update({ stripe_customer_id: customerId })
      .eq('id', session.user.id)
  }

  const checkoutSession = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: [{ price: planConfig.stripePriceId, quantity: 1 }],
    success_url: `${process.env.NEXT_PUBLIC_URL}/dashboard/billing?success=true`,
    cancel_url: `${process.env.NEXT_PUBLIC_URL}/dashboard/billing?cancelled=true`,
    metadata: { supabase_user_id: session.user.id, plan },
  })

  return NextResponse.json({ url: checkoutSession.url })
}
import { NextResponse } from 'next/server'
import { headers } from 'next/headers'

function getSupabaseAdmin() {
  const { createClient } = require('@supabase/supabase-js')
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

function getStripe() {
  const { default: Stripe } = require('stripe')
  return new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2026-02-25.clover' })
}

const PLAN_PRICE_MAP: Record<string, string> = {
  [process.env.STRIPE_PRO_PRICE_ID ?? 'price_pro']: 'pro',
  [process.env.STRIPE_AGENCY_PRICE_ID ?? 'price_agency']: 'agency',
}

export async function POST(request: Request) {
  const body = await request.text()
  const signature = headers().get('stripe-signature')

  if (!signature) return NextResponse.json({ error: 'No signature' }, { status: 400 })

  const stripe = getStripe()
  let event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: `Webhook error: ${message}` }, { status: 400 })
  }

  const supabase = getSupabaseAdmin()

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as { metadata?: { supabase_user_id?: string; plan?: string } }
      const userId = session.metadata?.supabase_user_id
      const plan = session.metadata?.plan
      if (userId && plan) {
        await supabase.from('users').update({ plan }).eq('id', userId)
      }
      break
    }

    case 'customer.subscription.updated': {
      const sub = event.data.object as {
        customer: string
        status: string
        items: { data: Array<{ price: { id: string } }> }
      }
      const priceId = sub.items.data[0]?.price?.id
      const plan = PLAN_PRICE_MAP[priceId] ?? 'free'

      if (sub.status === 'active' || sub.status === 'trialing') {
        const { data: users } = await supabase
          .from('users')
          .select('id')
          .eq('stripe_customer_id', sub.customer)
        if (users?.[0]) {
          await supabase.from('users').update({ plan }).eq('id', users[0].id)
        }
      }
      break
    }

    case 'customer.subscription.deleted': {
      const sub = event.data.object as { customer: string }
      const { data: users } = await supabase
        .from('users')
        .select('id')
        .eq('stripe_customer_id', sub.customer)
      if (users?.[0]) {
        await supabase.from('users').update({ plan: 'free' }).eq('id', users[0].id)
      }
      break
    }

    default:
      break
  }

  return NextResponse.json({ received: true })
}
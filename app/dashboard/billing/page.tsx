import { createServerClient } from '@/lib/supabase/server'
import { Header } from '@/components/layout/header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { BillingActions } from '@/components/billing/billing-actions'
import { PLANS } from '@/lib/stripe/config'
import { Check, X } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function BillingPage() {
  const supabase = createServerClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return null

  const { data: user } = await supabase
    .from('users')
    .select('plan, stripe_customer_id, invoice_count')
    .eq('id', session.user.id)
    .single()

  const currentPlan = user?.plan ?? 'free'
  const hasStripeCustomer = !!user?.stripe_customer_id
  const currentPlanConfig = PLANS[currentPlan as keyof typeof PLANS] ?? PLANS.free

  const planOrder = ['free', 'pro', 'agency'] as const

  return (
    <div>
      <Header title="Billing" subtitle="Manage your subscription and plan" />
      <div className="p-6 space-y-8 max-w-4xl">
        {/* Current Plan */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Current Plan</CardTitle>
              <Badge
                className={
                  currentPlan === 'agency'
                    ? 'bg-purple-100 text-purple-700 border-0'
                    : currentPlan === 'pro'
                    ? 'bg-blue-100 text-blue-700 border-0'
                    : 'bg-muted text-muted-foreground border-0'
                }
              >
                {currentPlanConfig.name}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                {
                  label: 'Invoices',
                  value: currentPlanConfig.invoices === -1 ? 'Unlimited' : `${user?.invoice_count ?? 0} / ${currentPlanConfig.invoices}`,
                },
                {
                  label: 'Clients',
                  value: currentPlanConfig.clients === -1 ? 'Unlimited' : `Up to ${currentPlanConfig.clients}`,
                },
                { label: 'AI Generation', value: currentPlanConfig.aiGeneration ? 'Included' : 'Not included' },
                { label: 'PDF Export', value: currentPlanConfig.pdfExport ? 'Included' : 'Not included' },
              ].map(({ label, value }) => (
                <div key={label} className="space-y-1">
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">{label}</p>
                  <p className="font-medium text-sm">{value}</p>
                </div>
              ))}
            </div>
            <Separator />
            <BillingActions currentPlan={currentPlan} hasStripeCustomer={hasStripeCustomer} />
          </CardContent>
        </Card>

        {/* Plan Comparison */}
        <div>
          <h2 className="text-lg font-semibold mb-4">All Plans</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {planOrder.map((planId) => {
              const plan = PLANS[planId]
              const isCurrent = planId === currentPlan
              const isPopular = planId === 'pro'

              return (
                <Card
                  key={planId}
                  className={`relative ${isCurrent ? 'ring-2 ring-purple-500' : ''} ${isPopular ? 'shadow-lg' : ''}`}
                >
                  {isPopular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <Badge className="bg-purple-600 text-white border-0 shadow-sm">Most Popular</Badge>
                    </div>
                  )}
                  {isCurrent && (
                    <div className="absolute -top-3 right-4">
                      <Badge className="bg-green-600 text-white border-0 shadow-sm">Current</Badge>
                    </div>
                  )}
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">{plan.name}</CardTitle>
                    <p className="text-2xl font-bold">
                      {plan.price === 0 ? (
                        'Free'
                      ) : (
                        <>
                          ${plan.price}
                          <span className="text-sm font-normal text-muted-foreground">/mo</span>
                        </>
                      )}
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {[
                      { label: `${plan.invoices === -1 ? 'Unlimited' : plan.invoices} invoices`, included: true },
                      { label: `${plan.clients === -1 ? 'Unlimited' : plan.clients} clients`, included: true },
                      { label: 'AI line item generation', included: plan.aiGeneration },
                      { label: 'PDF export', included: plan.pdfExport },
                      { label: 'Custom branding', included: plan.customBranding },
                      { label: 'Team members', included: plan.teamMembers > 1, detail: plan.teamMembers > 1 ? `Up to ${plan.teamMembers}` : null },
                      { label: 'Priority support', included: plan.prioritySupport },
                    ].map(({ label, included, detail }) => (
                      <div key={label} className="flex items-center gap-2 text-sm">
                        {included ? (
                          <Check className="h-4 w-4 text-green-500 shrink-0" />
                        ) : (
                          <X className="h-4 w-4 text-muted-foreground/40 shrink-0" />
                        )}
                        <span className={included ? '' : 'text-muted-foreground'}>
                          {label}
                          {detail && <span className="text-muted-foreground ml-1">({detail})</span>}
                        </span>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
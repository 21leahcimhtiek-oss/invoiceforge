'use client'

import { useState } from 'react'
import { Loader2, CreditCard, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface BillingActionsProps {
  currentPlan: string
  hasStripeCustomer: boolean
}

export function BillingActions({ currentPlan, hasStripeCustomer }: BillingActionsProps) {
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null)
  const [portalLoading, setPortalLoading] = useState(false)

  const handleUpgrade = async (planId: string) => {
    setLoadingPlan(planId)
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: planId }),
      })
      const data = await res.json()
      if (data.url) window.location.href = data.url
    } catch {
      alert('Failed to start checkout. Please try again.')
    } finally {
      setLoadingPlan(null)
    }
  }

  const handleManageBilling = async () => {
    setPortalLoading(true)
    try {
      const res = await fetch('/api/stripe/portal', { method: 'POST' })
      const data = await res.json()
      if (data.url) window.location.href = data.url
    } catch {
      alert('Failed to open billing portal. Please try again.')
    } finally {
      setPortalLoading(false)
    }
  }

  return (
    <div className="flex flex-wrap gap-3">
      {currentPlan === 'free' && (
        <>
          <Button
            onClick={() => handleUpgrade('pro')}
            disabled={!!loadingPlan}
            className="bg-purple-600 hover:bg-purple-700 text-white"
          >
            {loadingPlan === 'pro' ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Redirecting…
              </>
            ) : (
              'Upgrade to Pro — $15/mo'
            )}
          </Button>
          <Button
            onClick={() => handleUpgrade('agency')}
            disabled={!!loadingPlan}
            variant="outline"
          >
            {loadingPlan === 'agency' ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Redirecting…
              </>
            ) : (
              'Upgrade to Agency — $49/mo'
            )}
          </Button>
        </>
      )}

      {currentPlan === 'pro' && (
        <>
          <Button
            onClick={() => handleUpgrade('agency')}
            disabled={!!loadingPlan}
            className="bg-purple-600 hover:bg-purple-700 text-white"
          >
            {loadingPlan === 'agency' ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Redirecting…
              </>
            ) : (
              'Upgrade to Agency — $49/mo'
            )}
          </Button>
        </>
      )}

      {hasStripeCustomer && (
        <Button variant="outline" onClick={handleManageBilling} disabled={portalLoading}>
          {portalLoading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Opening…
            </>
          ) : (
            <>
              <CreditCard className="h-4 w-4 mr-2" />
              Manage Billing
              <ExternalLink className="h-3.5 w-3.5 ml-1.5 opacity-60" />
            </>
          )}
        </Button>
      )}
    </div>
  )
}
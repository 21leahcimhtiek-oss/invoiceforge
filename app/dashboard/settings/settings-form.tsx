'use client'

import { useState } from 'react'
import { Loader2, Save } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import type { User } from '@/types'

interface SettingsFormProps {
  user: User
}

export function SettingsForm({ user }: SettingsFormProps) {
  const [form, setForm] = useState({
    name: user.name ?? '',
    business_name: user.business_name ?? '',
    business_email: user.business_email ?? '',
    business_phone: user.business_phone ?? '',
    business_address: user.business_address ?? '',
    business_website: user.business_website ?? '',
    invoice_prefix: user.invoice_prefix ?? 'INV',
    tax_id: user.tax_id ?? '',
  })
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((p) => ({ ...p, [field]: e.target.value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSaved(false)
    try {
      const res = await fetch('/api/user/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) throw new Error('Failed to save')
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch {
      setError('Failed to save settings. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
      <div>
        <h3 className="text-base font-semibold mb-4">Personal</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Display Name</label>
            <Input value={form.name} onChange={set('name')} placeholder="Your name" />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Account Email</label>
            <Input value={user.email} disabled className="opacity-60" />
            <p className="text-xs text-muted-foreground">Managed by your auth provider</p>
          </div>
        </div>
      </div>

      <Separator />

      <div>
        <h3 className="text-base font-semibold mb-4">Business Information</h3>
        <p className="text-sm text-muted-foreground mb-4">
          This information appears on your invoices as the &ldquo;From&rdquo; details.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5 sm:col-span-2">
            <label className="text-sm font-medium">Business Name</label>
            <Input value={form.business_name} onChange={set('business_name')} placeholder="Acme Freelance LLC" />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Business Email</label>
            <Input type="email" value={form.business_email} onChange={set('business_email')} placeholder="billing@yourbusiness.com" />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Business Phone</label>
            <Input value={form.business_phone} onChange={set('business_phone')} placeholder="+1 555 000 0000" />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Website</label>
            <Input value={form.business_website} onChange={set('business_website')} placeholder="yourbusiness.com" />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Tax ID / VAT Number</label>
            <Input value={form.tax_id} onChange={set('tax_id')} placeholder="US12-3456789" />
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <label className="text-sm font-medium">Business Address</label>
            <Textarea
              value={form.business_address}
              onChange={set('business_address')}
              placeholder={'123 Main St\nSuite 100\nSan Francisco, CA 94102'}
              rows={3}
            />
          </div>
        </div>
      </div>

      <Separator />

      <div>
        <h3 className="text-base font-semibold mb-4">Invoice Settings</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Invoice Number Prefix</label>
            <Input value={form.invoice_prefix} onChange={set('invoice_prefix')} placeholder="INV" maxLength={10} />
            <p className="text-xs text-muted-foreground">
              e.g. &ldquo;INV&rdquo; produces INV-001, INV-002, &hellip;
            </p>
          </div>
        </div>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <div className="flex items-center gap-3">
        <Button
          type="submit"
          disabled={loading}
          className="bg-purple-600 hover:bg-purple-700 text-white"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Saving…
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Save Settings
            </>
          )}
        </Button>
        {saved && <p className="text-sm text-green-600 font-medium">✓ Saved successfully</p>}
      </div>
    </form>
  )
}
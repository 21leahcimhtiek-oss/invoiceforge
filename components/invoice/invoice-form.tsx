'use client'

import { useState, useCallback } from 'react'
import { Plus, Trash2, Sparkles, Loader2, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { cn, formatCurrency, calculateLineItemAmount, calculateTotals, CURRENCIES } from '@/lib/utils'
import type { Client, InvoiceLineItem, Invoice } from '@/types'

interface InvoiceFormProps {
  clients: Client[]
  initialData?: Partial<Invoice>
  onSubmit: (data: InvoiceFormData) => Promise<void>
  onCancel?: () => void
  isLoading?: boolean
  mode: 'create' | 'edit'
}

export interface InvoiceFormData {
  client_id: string
  invoice_number: string
  status: Invoice['status']
  issued_at: string
  due_at: string
  currency: string
  line_items: InvoiceLineItem[]
  tax_rate: number
  discount_amount: number
  notes: string
  terms: string
}

const DEFAULT_LINE_ITEM: Omit<InvoiceLineItem, 'id'> = {
  description: '',
  quantity: 1,
  unit_price: 0,
  amount: 0,
}

function generateId(): string {
  return Math.random().toString(36).substring(2, 9)
}

function todayISO(): string {
  return new Date().toISOString().split('T')[0]
}

function futureISO(days: number): string {
  const d = new Date()
  d.setDate(d.getDate() + days)
  return d.toISOString().split('T')[0]
}

export function InvoiceForm({ clients, initialData, onSubmit, onCancel, isLoading, mode }: InvoiceFormProps) {
  const [clientId, setClientId] = useState(initialData?.client_id ?? '')
  const [invoiceNumber, setInvoiceNumber] = useState(initialData?.invoice_number ?? '')
  const [status, setStatus] = useState<Invoice['status']>(initialData?.status ?? 'draft')
  const [issuedAt, setIssuedAt] = useState(initialData?.issued_at?.split('T')[0] ?? todayISO())
  const [dueAt, setDueAt] = useState(initialData?.due_at?.split('T')[0] ?? futureISO(30))
  const [currency, setCurrency] = useState(initialData?.currency ?? 'USD')
  const [lineItems, setLineItems] = useState<InvoiceLineItem[]>(() => {
    const items = initialData?.line_items as InvoiceLineItem[] | undefined
    return items && items.length > 0 ? items : [{ ...DEFAULT_LINE_ITEM, id: generateId() }]
  })
  const [taxRate, setTaxRate] = useState(initialData?.tax_rate ?? 0)
  const [discountAmount, setDiscountAmount] = useState(initialData?.discount_amount ?? 0)
  const [notes, setNotes] = useState(initialData?.notes ?? '')
  const [terms, setTerms] = useState(initialData?.terms ?? 'Payment is due within 30 days of invoice date.')
  const [aiPrompt, setAiPrompt] = useState('')
  const [aiLoading, setAiLoading] = useState(false)
  const [aiError, setAiError] = useState('')
  const [showAiPanel, setShowAiPanel] = useState(false)

  const selectedClient = clients.find((c) => c.id === clientId)
  const totals = calculateTotals(lineItems, taxRate, discountAmount)

  // Line item operations
  const addLineItem = useCallback(() => {
    setLineItems((prev) => [...prev, { ...DEFAULT_LINE_ITEM, id: generateId() }])
  }, [])

  const removeLineItem = useCallback((id: string) => {
    setLineItems((prev) => prev.filter((item) => item.id !== id))
  }, [])

  const updateLineItem = useCallback((id: string, field: keyof InvoiceLineItem, value: string | number) => {
    setLineItems((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item
        const updated = { ...item, [field]: value }
        updated.amount = calculateLineItemAmount(
          field === 'quantity' ? Number(value) : updated.quantity,
          field === 'unit_price' ? Number(value) : updated.unit_price
        )
        return updated
      })
    )
  }, [])

  // AI generation
  const handleAiGenerate = async () => {
    if (!aiPrompt.trim()) return
    setAiLoading(true)
    setAiError('')
    try {
      const res = await fetch('/api/ai/invoice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          description: aiPrompt,
          client_name: selectedClient?.name ?? '',
          currency,
        }),
      })
      if (!res.ok) throw new Error('AI generation failed')
      const data = await res.json()
      const newItems: InvoiceLineItem[] = (data.line_items ?? []).map((item: Omit<InvoiceLineItem, 'id'>) => ({
        ...item,
        id: generateId(),
        amount: calculateLineItemAmount(item.quantity, item.unit_price),
      }))
      if (newItems.length > 0) {
        setLineItems(newItems)
        setShowAiPanel(false)
        setAiPrompt('')
      }
    } catch {
      setAiError('Failed to generate line items. Please try again.')
    } finally {
      setAiLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await onSubmit({
      client_id: clientId,
      invoice_number: invoiceNumber,
      status,
      issued_at: issuedAt,
      due_at: dueAt,
      currency,
      line_items: lineItems,
      tax_rate: taxRate,
      discount_amount: discountAmount,
      notes,
      terms,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Header Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left: Client + Invoice # */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
              Invoice Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Client *</label>
              <Select value={clientId} onValueChange={setClientId} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select a client…" />
                </SelectTrigger>
                <SelectContent>
                  {clients.length === 0 && (
                    <SelectItem value="__none" disabled>
                      No clients yet — add one first
                    </SelectItem>
                  )}
                  {clients.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                      {c.company && (
                        <span className="text-muted-foreground ml-1 text-xs">({c.company})</span>
                      )}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Invoice Number *</label>
              <Input
                value={invoiceNumber}
                onChange={(e) => setInvoiceNumber(e.target.value)}
                placeholder="INV-001"
                required
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Status</label>
              <Select value={status} onValueChange={(v) => setStatus(v as Invoice['status'])}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="sent">Sent</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="overdue">Overdue</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Currency</label>
              <Select value={currency} onValueChange={setCurrency}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(CURRENCIES).map(([code, { name, symbol }]) => (
                    <SelectItem key={code} value={code}>
                      {symbol} {code} — {name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Right: Dates */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
              Dates
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Issue Date *</label>
              <Input
                type="date"
                value={issuedAt}
                onChange={(e) => setIssuedAt(e.target.value)}
                required
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Due Date *</label>
              <Input
                type="date"
                value={dueAt}
                onChange={(e) => setDueAt(e.target.value)}
                required
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Quick Set Due Date</label>
              <div className="flex gap-2">
                {[7, 14, 30, 60].map((days) => (
                  <button
                    key={days}
                    type="button"
                    onClick={() => setDueAt(futureISO(days))}
                    className="text-xs px-2 py-1 rounded border border-border hover:bg-accent transition-colors"
                  >
                    Net {days}
                  </button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* AI Generation Panel */}
      <Card className="border-purple-200 dark:border-purple-800/50">
        <CardHeader className="pb-3">
          <button
            type="button"
            onClick={() => setShowAiPanel((p) => !p)}
            className="flex items-center justify-between w-full text-left"
          >
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-purple-500" />
              <CardTitle className="text-sm font-medium">AI Line Item Generator</CardTitle>
              <Badge variant="secondary" className="text-xs">Beta</Badge>
            </div>
            <ChevronDown
              className={cn('h-4 w-4 text-muted-foreground transition-transform', showAiPanel && 'rotate-180')}
            />
          </button>
        </CardHeader>
        {showAiPanel && (
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Describe the work you did and AI will generate structured line items for you.
            </p>
            <Textarea
              placeholder="e.g. Built a landing page with React, including design, development, and 2 rounds of revisions over 3 weeks…"
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
              rows={3}
            />
            {aiError && <p className="text-sm text-destructive">{aiError}</p>}
            <Button
              type="button"
              onClick={handleAiGenerate}
              disabled={aiLoading || !aiPrompt.trim()}
              className="bg-purple-600 hover:bg-purple-700 text-white"
            >
              {aiLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Generating…
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Generate Line Items
                </>
              )}
            </Button>
          </CardContent>
        )}
      </Card>

      {/* Line Items */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
              Line Items
            </CardTitle>
            <Button type="button" variant="outline" size="sm" onClick={addLineItem}>
              <Plus className="h-4 w-4 mr-1" />
              Add Item
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Header row */}
          <div className="hidden md:grid md:grid-cols-[1fr_80px_120px_100px_36px] gap-2 mb-2 px-1">
            <span className="text-xs font-medium text-muted-foreground uppercase">Description</span>
            <span className="text-xs font-medium text-muted-foreground uppercase text-center">Qty</span>
            <span className="text-xs font-medium text-muted-foreground uppercase text-right">Unit Price</span>
            <span className="text-xs font-medium text-muted-foreground uppercase text-right">Amount</span>
            <span />
          </div>
          <Separator className="hidden md:block mb-3" />

          <div className="space-y-2">
            {lineItems.map((item, idx) => (
              <div
                key={item.id}
                className="grid grid-cols-1 md:grid-cols-[1fr_80px_120px_100px_36px] gap-2 items-start"
              >
                <div className="space-y-1">
                  <label className="md:hidden text-xs text-muted-foreground">Description</label>
                  <Input
                    placeholder="Description of work or product…"
                    value={item.description}
                    onChange={(e) => updateLineItem(item.id, 'description', e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="md:hidden text-xs text-muted-foreground">Qty</label>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={item.quantity}
                    onChange={(e) => updateLineItem(item.id, 'quantity', parseFloat(e.target.value) || 0)}
                    className="text-center"
                  />
                </div>
                <div className="space-y-1">
                  <label className="md:hidden text-xs text-muted-foreground">Unit Price</label>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={item.unit_price}
                    onChange={(e) => updateLineItem(item.id, 'unit_price', parseFloat(e.target.value) || 0)}
                    className="text-right"
                  />
                </div>
                <div className="space-y-1">
                  <label className="md:hidden text-xs text-muted-foreground">Amount</label>
                  <div className="h-10 flex items-center justify-end px-3 rounded-md bg-muted text-sm font-medium">
                    {formatCurrency(item.amount, currency)}
                  </div>
                </div>
                <div className="flex items-start pt-1 md:pt-0 md:items-center justify-end md:justify-center">
                  <button
                    type="button"
                    onClick={() => removeLineItem(item.id)}
                    disabled={lineItems.length === 1}
                    className="p-1.5 rounded hover:bg-destructive/10 hover:text-destructive transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                    aria-label={`Remove item ${idx + 1}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <Separator className="my-4" />

          {/* Totals */}
          <div className="space-y-2 max-w-xs ml-auto">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span>{formatCurrency(totals.subtotal, currency)}</span>
            </div>
            <div className="flex items-center justify-between text-sm gap-4">
              <span className="text-muted-foreground shrink-0">Discount</span>
              <div className="flex items-center gap-1">
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={discountAmount}
                  onChange={(e) => setDiscountAmount(parseFloat(e.target.value) || 0)}
                  className="w-24 h-7 text-right text-sm"
                />
              </div>
            </div>
            <div className="flex items-center justify-between text-sm gap-4">
              <span className="text-muted-foreground shrink-0">Tax Rate (%)</span>
              <div className="flex items-center gap-1">
                <Input
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  value={taxRate}
                  onChange={(e) => setTaxRate(parseFloat(e.target.value) || 0)}
                  className="w-24 h-7 text-right text-sm"
                />
              </div>
            </div>
            {taxRate > 0 && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Tax ({taxRate}%)</span>
                <span>{formatCurrency(totals.tax_amount, currency)}</span>
              </div>
            )}
            <Separator />
            <div className="flex items-center justify-between font-semibold">
              <span>Total</span>
              <span className="text-purple-600">{formatCurrency(totals.total, currency)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notes & Terms */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
              Notes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="Any additional notes for the client…"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
            />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
              Terms & Conditions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="Payment terms, late fees, etc."
              value={terms}
              onChange={(e) => setTerms(e.target.value)}
              rows={4}
            />
          </CardContent>
        </Card>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between pt-2">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
            Cancel
          </Button>
        )}
        <div className="flex gap-3 ml-auto">
          <Button
            type="submit"
            disabled={isLoading || !clientId || !invoiceNumber}
            className="bg-purple-600 hover:bg-purple-700 text-white min-w-[120px]"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving…
              </>
            ) : mode === 'create' ? (
              'Create Invoice'
            ) : (
              'Save Changes'
            )}
          </Button>
        </div>
      </div>
    </form>
  )
}
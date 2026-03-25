'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { Header } from '@/components/layout/header'
import { InvoiceForm, type InvoiceFormData } from '@/components/invoice/invoice-form'
import type { Client, Invoice } from '@/types'

export default function EditInvoicePage() {
  const router = useRouter()
  const { id } = useParams<{ id: string }>()
  const [invoice, setInvoice] = useState<Invoice | null>(null)
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(false)
  const [fetchLoading, setFetchLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      fetch(`/api/invoice/${id}`).then((r) => r.json()),
      fetch('/api/client').then((r) => r.json()),
    ]).then(([invData, clientData]) => {
      setInvoice(invData.invoice ?? null)
      setClients(clientData.clients ?? [])
      setFetchLoading(false)
    })
  }, [id])

  const handleSubmit = async (data: InvoiceFormData) => {
    setLoading(true)
    try {
      const res = await fetch(`/api/invoice/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error('Failed to update invoice')
      router.push(`/dashboard/invoices/${id}`)
    } catch (err) {
      console.error(err)
      alert('Failed to save changes. Please try again.')
      setLoading(false)
    }
  }

  if (fetchLoading) {
    return (
      <div className="flex items-center justify-center h-full py-32">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!invoice) {
    return (
      <div className="p-6">
        <p className="text-muted-foreground">Invoice not found.</p>
      </div>
    )
  }

  return (
    <div>
      <Header title={`Edit ${invoice.invoice_number}`} subtitle="Update invoice details" />
      <div className="p-6 max-w-5xl">
        <InvoiceForm
          clients={clients}
          initialData={invoice}
          onSubmit={handleSubmit}
          onCancel={() => router.push(`/dashboard/invoices/${id}`)}
          isLoading={loading}
          mode="edit"
        />
      </div>
    </div>
  )
}
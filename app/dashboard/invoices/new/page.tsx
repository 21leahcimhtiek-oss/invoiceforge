'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Header } from '@/components/layout/header'
import { InvoiceForm, type InvoiceFormData } from '@/components/invoice/invoice-form'
import type { Client } from '@/types'

export default function NewInvoicePage() {
  const router = useRouter()
  const [clients, setClients] = useState<Client[]>([])
  const [nextNumber, setNextNumber] = useState('INV-001')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    Promise.all([
      fetch('/api/client').then((r) => r.json()),
      fetch('/api/invoice?meta=true').then((r) => r.json()),
    ]).then(([clientData, meta]) => {
      setClients(clientData.clients ?? [])
      if (meta.next_invoice_number) setNextNumber(meta.next_invoice_number)
    })
  }, [])

  const handleSubmit = async (data: InvoiceFormData) => {
    setLoading(true)
    try {
      const res = await fetch('/api/invoice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error('Failed to create invoice')
      const { invoice } = await res.json()
      router.push(`/dashboard/invoices/${invoice.id}`)
    } catch (err) {
      console.error(err)
      alert('Failed to create invoice. Please try again.')
      setLoading(false)
    }
  }

  return (
    <div>
      <Header title="New Invoice" subtitle="Create a new invoice for your client" />
      <div className="p-6 max-w-5xl">
        <InvoiceForm
          clients={clients}
          initialData={{ invoice_number: nextNumber }}
          onSubmit={handleSubmit}
          onCancel={() => router.push('/dashboard/invoices')}
          isLoading={loading}
          mode="create"
        />
      </div>
    </div>
  )
}
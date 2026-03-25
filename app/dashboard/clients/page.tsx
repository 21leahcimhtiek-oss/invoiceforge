'use client'

import { useEffect, useState } from 'react'
import { Plus, Search, Loader2, X } from 'lucide-react'
import { Header } from '@/components/layout/header'
import { ClientCard } from '@/components/client/client-card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Separator } from '@/components/ui/separator'
import type { Client } from '@/types'

interface ClientWithStats extends Client {
  invoice_count?: number
  total_billed?: number
}

function ClientForm({
  initial,
  onSave,
  onClose,
  loading,
}: {
  initial?: Partial<Client>
  onSave: (data: Partial<Client>) => void
  onClose: () => void
  loading: boolean
}) {
  const [form, setForm] = useState({
    name: initial?.name ?? '',
    email: initial?.email ?? '',
    company: initial?.company ?? '',
    phone: initial?.phone ?? '',
    website: initial?.website ?? '',
    address: initial?.address ?? '',
  })

  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((p) => ({ ...p, [field]: e.target.value }))

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        onSave(form)
      }}
      className="space-y-4"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-sm font-medium">Name *</label>
          <Input value={form.name} onChange={set('name')} placeholder="Jane Smith" required />
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium">Email</label>
          <Input type="email" value={form.email} onChange={set('email')} placeholder="jane@example.com" />
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium">Company</label>
          <Input value={form.company} onChange={set('company')} placeholder="Acme Corp" />
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium">Phone</label>
          <Input value={form.phone} onChange={set('phone')} placeholder="+1 555 000 0000" />
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium">Website</label>
          <Input value={form.website} onChange={set('website')} placeholder="acme.com" />
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium">Address</label>
          <Input value={form.address} onChange={set('address')} placeholder="123 Main St, City, State" />
        </div>
      </div>
      <Separator />
      <div className="flex justify-end gap-3">
        <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={loading || !form.name.trim()}
          className="bg-purple-600 hover:bg-purple-700 text-white"
        >
          {loading ? 'Saving…' : initial?.id ? 'Save Changes' : 'Add Client'}
        </Button>
      </div>
    </form>
  )
}

export default function ClientsPage() {
  const [clients, setClients] = useState<ClientWithStats[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showAdd, setShowAdd] = useState(false)
  const [editClient, setEditClient] = useState<Client | null>(null)
  const [saving, setSaving] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const fetchClients = () => {
    fetch('/api/client')
      .then((r) => r.json())
      .then((d) => setClients(d.clients ?? []))
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchClients() }, [])

  const handleAdd = async (data: Partial<Client>) => {
    setSaving(true)
    try {
      await fetch('/api/client', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      setShowAdd(false)
      fetchClients()
    } finally {
      setSaving(false)
    }
  }

  const handleEdit = async (data: Partial<Client>) => {
    if (!editClient) return
    setSaving(true)
    try {
      await fetch(`/api/client/${editClient.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      setEditClient(null)
      fetchClients()
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (client: Client) => {
    if (!confirm(`Delete ${client.name}? This will not delete their invoices.`)) return
    setDeleteId(client.id)
    await fetch(`/api/client/${client.id}`, { method: 'DELETE' })
    setDeleteId(null)
    fetchClients()
  }

  const filtered = clients.filter((c) => {
    const q = search.toLowerCase()
    return !q || c.name.toLowerCase().includes(q) || (c.company ?? '').toLowerCase().includes(q) || (c.email ?? '').toLowerCase().includes(q)
  })

  return (
    <div>
      <Header
        title="Clients"
        subtitle={`${clients.length} client${clients.length !== 1 ? 's' : ''}`}
        action={{ label: 'Add Client', onClick: () => setShowAdd(true), icon: 'plus' }}
      />
      <div className="p-6 space-y-5">
        {/* Search */}
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search clients…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : filtered.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
              <p className="font-medium mb-1">
                {search ? 'No clients match your search' : 'No clients yet'}
              </p>
              <p className="text-sm text-muted-foreground mb-4">
                {search ? 'Try a different search term' : 'Add your first client to get started'}
              </p>
              {!search && (
                <Button
                  onClick={() => setShowAdd(true)}
                  className="bg-purple-600 hover:bg-purple-700 text-white"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Client
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((client) => (
              <ClientCard
                key={client.id}
                client={client}
                invoiceCount={client.invoice_count ?? 0}
                totalBilled={client.total_billed ?? 0}
                onEdit={(c) => setEditClient(c)}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </div>

      {/* Add Client Dialog */}
      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Add New Client</DialogTitle>
          </DialogHeader>
          <ClientForm onSave={handleAdd} onClose={() => setShowAdd(false)} loading={saving} />
        </DialogContent>
      </Dialog>

      {/* Edit Client Dialog */}
      <Dialog open={!!editClient} onOpenChange={(o) => !o && setEditClient(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Client</DialogTitle>
          </DialogHeader>
          {editClient && (
            <ClientForm
              initial={editClient}
              onSave={handleEdit}
              onClose={() => setEditClient(null)}
              loading={saving}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
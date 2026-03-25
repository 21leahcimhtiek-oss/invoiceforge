'use client'

import { useState } from 'react'
import { MoreVertical, Mail, Phone, Globe, Building2, Trash2, Pencil, FileText } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { formatCurrency } from '@/lib/utils'
import type { Client } from '@/types'

interface ClientCardProps {
  client: Client
  invoiceCount?: number
  totalBilled?: number
  currency?: string
  onEdit?: (client: Client) => void
  onDelete?: (client: Client) => void
  onViewInvoices?: (client: Client) => void
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

const AVATAR_COLORS = [
  'bg-purple-100 text-purple-700',
  'bg-blue-100 text-blue-700',
  'bg-green-100 text-green-700',
  'bg-orange-100 text-orange-700',
  'bg-pink-100 text-pink-700',
  'bg-teal-100 text-teal-700',
]

function getAvatarColor(name: string): string {
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash)
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length]
}

export function ClientCard({
  client,
  invoiceCount = 0,
  totalBilled = 0,
  currency = 'USD',
  onEdit,
  onDelete,
  onViewInvoices,
}: ClientCardProps) {
  const [menuOpen, setMenuOpen] = useState(false)
  const initials = getInitials(client.name)
  const avatarColor = getAvatarColor(client.name)

  return (
    <Card className="hover:shadow-md transition-all group">
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-3">
          {/* Avatar + Name */}
          <div className="flex items-center gap-3 min-w-0">
            <Avatar className="h-10 w-10 shrink-0">
              <AvatarFallback className={avatarColor}>{initials}</AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="font-semibold truncate">{client.name}</p>
              {client.company && (
                <p className="text-sm text-muted-foreground truncate flex items-center gap-1">
                  <Building2 className="h-3 w-3 shrink-0" />
                  {client.company}
                </p>
              )}
            </div>
          </div>

          {/* Actions */}
          <DropdownMenu open={menuOpen} onOpenChange={setMenuOpen}>
            <DropdownMenuTrigger asChild>
              <button className="p-1.5 rounded-md hover:bg-accent transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100 shrink-0">
                <MoreVertical className="h-4 w-4" />
                <span className="sr-only">Actions</span>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44">
              {onViewInvoices && (
                <DropdownMenuItem onClick={() => { onViewInvoices(client); setMenuOpen(false) }}>
                  <FileText className="h-4 w-4 mr-2" />
                  View Invoices
                </DropdownMenuItem>
              )}
              {onEdit && (
                <DropdownMenuItem onClick={() => { onEdit(client); setMenuOpen(false) }}>
                  <Pencil className="h-4 w-4 mr-2" />
                  Edit Client
                </DropdownMenuItem>
              )}
              {(onViewInvoices || onEdit) && onDelete && <DropdownMenuSeparator />}
              {onDelete && (
                <DropdownMenuItem
                  onClick={() => { onDelete(client); setMenuOpen(false) }}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Contact Info */}
        <div className="mt-4 space-y-1.5">
          {client.email && (
            <a
              href={`mailto:${client.email}`}
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors truncate"
            >
              <Mail className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">{client.email}</span>
            </a>
          )}
          {client.phone && (
            <a
              href={`tel:${client.phone}`}
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <Phone className="h-3.5 w-3.5 shrink-0" />
              {client.phone}
            </a>
          )}
          {client.website && (
            <a
              href={client.website.startsWith('http') ? client.website : `https://${client.website}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors truncate"
            >
              <Globe className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">{client.website.replace(/^https?:\/\//, '')}</span>
            </a>
          )}
        </div>

        {/* Stats */}
        <div className="mt-4 pt-4 border-t border-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-xs">
              {invoiceCount} {invoiceCount === 1 ? 'invoice' : 'invoices'}
            </Badge>
          </div>
          {totalBilled > 0 && (
            <span className="text-sm font-medium text-purple-600">
              {formatCurrency(totalBilled, currency)} billed
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
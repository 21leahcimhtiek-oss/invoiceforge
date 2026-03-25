'use client'

import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

interface HeaderProps {
  title: string
  subtitle?: string
  action?: {
    label: string
    href?: string
    onClick?: () => void
    icon?: string
  }
}

export function Header({ title, subtitle, action }: HeaderProps) {
  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-border bg-background px-6">
      <div>
        <h1 className="text-lg font-semibold">{title}</h1>
        {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
      </div>

      {action && (
        <div className="flex items-center gap-3">
          {action.href ? (
            <Link href={action.href}>
              <Button size="sm" className="bg-purple-600 hover:bg-purple-700 text-white gap-1.5">
                <Plus className="h-4 w-4" />
                {action.label}
              </Button>
            </Link>
          ) : (
            <Button
              size="sm"
              className="bg-purple-600 hover:bg-purple-700 text-white gap-1.5"
              onClick={action.onClick}
            >
              <Plus className="h-4 w-4" />
              {action.label}
            </Button>
          )}
        </div>
      )}
    </header>
  )
}
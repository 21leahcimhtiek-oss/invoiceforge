'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard, FileText, Users, CreditCard, Settings,
  LogOut, FileText as InvoiceIcon, ChevronRight,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { createBrowserClient } from '@/lib/supabase/client'

const NAV_ITEMS = [
  { href: '/dashboard',          label: 'Overview',  icon: LayoutDashboard },
  { href: '/dashboard/invoices', label: 'Invoices',  icon: FileText },
  { href: '/dashboard/clients',  label: 'Clients',   icon: Users },
  { href: '/dashboard/billing',  label: 'Billing',   icon: CreditCard },
  { href: '/dashboard/settings', label: 'Settings',  icon: Settings },
]

interface SidebarProps {
  user: {
    id: string
    name: string | null
    email: string
    plan: 'free' | 'pro' | 'agency'
    business_name?: string | null
  }
  invoiceCount?: number
  clientCount?: number
}

export function Sidebar({ user, invoiceCount = 0, clientCount = 0 }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()

  async function handleSignOut() {
    const supabase = createBrowserClient()
    if (!supabase) return
    await supabase.auth.signOut()
    router.push('/login')
  }

  const displayName = user.business_name ?? user.name ?? user.email
  const initials = displayName.slice(0, 2).toUpperCase()

  const planColors = {
    free:   'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
    pro:    'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300',
    agency: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300',
  }

  return (
    <aside className="flex h-screen w-64 flex-col border-r border-border bg-card shrink-0">
      {/* Logo */}
      <div className="flex h-16 items-center gap-2 border-b border-border px-6">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-600">
          <InvoiceIcon className="h-4 w-4 text-white" />
        </div>
        <span className="text-lg font-bold tracking-tight">InvoiceForge</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || (href !== '/dashboard' && pathname.startsWith(href))
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                active
                  ? 'bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300'
                  : 'text-muted-foreground hover:bg-accent hover:text-foreground'
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {label}
              {active && <ChevronRight className="ml-auto h-3 w-3" />}
            </Link>
          )
        })}
      </nav>

      {/* Free plan usage meter */}
      {user.plan === 'free' && (
        <div className="mx-3 mb-2 rounded-lg bg-muted/60 p-3 text-xs text-muted-foreground space-y-1.5">
          <div className="flex justify-between">
            <span>Invoices</span>
            <span className="font-medium">{invoiceCount} / 5</span>
          </div>
          <div className="h-1.5 rounded-full bg-border overflow-hidden">
            <div
              className="h-full rounded-full bg-purple-500 transition-all"
              style={{ width: `${Math.min(100, (invoiceCount / 5) * 100)}%` }}
            />
          </div>
          <div className="flex justify-between">
            <span>Clients</span>
            <span className="font-medium">{clientCount} / 3</span>
          </div>
          <div className="h-1.5 rounded-full bg-border overflow-hidden">
            <div
              className="h-full rounded-full bg-purple-500 transition-all"
              style={{ width: `${Math.min(100, (clientCount / 3) * 100)}%` }}
            />
          </div>
          <Link
            href="/dashboard/billing"
            className="block text-center text-xs font-medium text-purple-600 hover:text-purple-700 mt-1"
          >
            Upgrade for unlimited →
          </Link>
        </div>
      )}

      {/* User */}
      <div className="border-t border-border p-3">
        <div className="flex items-center gap-3 rounded-lg px-2 py-2">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300 text-xs font-semibold">
            {initials}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{displayName}</p>
            <span className={cn('rounded-full px-1.5 py-0.5 text-xs font-medium capitalize', planColors[user.plan])}>
              {user.plan}
            </span>
          </div>
          <button
            onClick={handleSignOut}
            className="ml-auto rounded p-1 text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
            title="Sign out"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </aside>
  )
}
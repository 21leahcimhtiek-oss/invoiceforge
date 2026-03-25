import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { format, formatDistanceToNow, addDays } from 'date-fns'
import type { InvoiceStatus, InvoiceLineItem } from '@/types'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// ─── Currency ────────────────────────────────────────────────────────────────

export function formatCurrency(amount: number, currency = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(amount)
}

// Record form used in Select dropdowns: CURRENCIES['USD'] → { name, symbol }
export const CURRENCIES: Record<string, { name: string; symbol: string }> = {
  USD: { name: 'US Dollar', symbol: '$' },
  EUR: { name: 'Euro', symbol: '€' },
  GBP: { name: 'British Pound', symbol: '£' },
  CAD: { name: 'Canadian Dollar', symbol: 'CA$' },
  AUD: { name: 'Australian Dollar', symbol: 'A$' },
  JPY: { name: 'Japanese Yen', symbol: '¥' },
  CHF: { name: 'Swiss Franc', symbol: 'CHF' },
  SGD: { name: 'Singapore Dollar', symbol: 'S$' },
  MXN: { name: 'Mexican Peso', symbol: 'MX$' },
  BRL: { name: 'Brazilian Real', symbol: 'R$' },
}

// ─── Dates ───────────────────────────────────────────────────────────────────

export function formatDate(date: string | Date, fmt = 'MMM d, yyyy'): string {
  return format(new Date(date), fmt)
}

export function timeAgo(date: string | Date): string {
  return formatDistanceToNow(new Date(date), { addSuffix: true })
}

export function getDueDate(days = 30): Date {
  return addDays(new Date(), days)
}

export function isOverdue(dueDate: string, status: InvoiceStatus): boolean {
  return status !== 'paid' && status !== 'cancelled' && new Date(dueDate) < new Date()
}

// ─── Invoice Calculations ────────────────────────────────────────────────────

export function calculateLineItemAmount(qty: number, unitPrice: number): number {
  return Math.round(qty * unitPrice * 100) / 100
}

export function calculateTotals(
  lineItems: InvoiceLineItem[],
  taxRate: number,
  discountAmount = 0
): { subtotal: number; tax_amount: number; total: number } {
  const subtotal = lineItems.reduce((sum, item) => sum + item.amount, 0)
  const tax_amount = Math.round(subtotal * (taxRate / 100) * 100) / 100
  const total = Math.round((subtotal + tax_amount - discountAmount) * 100) / 100
  return { subtotal, tax_amount, total }
}

// Generate invoice number: INV-0001
export function generateInvoiceNumber(prefix: string, number: number): string {
  return `${prefix}-${String(number).padStart(4, '0')}`
}

// ─── Status Config ────────────────────────────────────────────────────────────

export const STATUS_CONFIG: Record<
  InvoiceStatus,
  { label: string; color: string; bg: string; text: string; border: string; dot: string }
> = {
  draft: {
    label: 'Draft',
    color: 'text-gray-600',
    text: 'text-gray-600',
    bg: 'bg-gray-100 dark:bg-gray-800',
    border: 'border-gray-200',
    dot: 'bg-gray-400',
  },
  sent: {
    label: 'Sent',
    color: 'text-blue-600',
    text: 'text-blue-600',
    bg: 'bg-blue-50 dark:bg-blue-950/30',
    border: 'border-blue-200',
    dot: 'bg-blue-500',
  },
  paid: {
    label: 'Paid',
    color: 'text-green-600',
    text: 'text-green-600',
    bg: 'bg-green-50 dark:bg-green-950/30',
    border: 'border-green-200',
    dot: 'bg-green-500',
  },
  overdue: {
    label: 'Overdue',
    color: 'text-red-600',
    text: 'text-red-600',
    bg: 'bg-red-50 dark:bg-red-950/30',
    border: 'border-red-200',
    dot: 'bg-red-500',
  },
  cancelled: {
    label: 'Cancelled',
    color: 'text-gray-500',
    text: 'text-gray-500',
    bg: 'bg-gray-100 dark:bg-gray-800',
    border: 'border-gray-200',
    dot: 'bg-gray-300',
  },
}

// ─── Misc ─────────────────────────────────────────────────────────────────────

export function getInitials(name: string): string {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('')
}

export function truncate(str: string, length = 80): string {
  return str.length <= length ? str : str.slice(0, length) + '…'
}

export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message
  if (typeof error === 'string') return error
  return 'An unexpected error occurred'
}
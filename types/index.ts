export type PlanId = 'free' | 'pro' | 'agency'
export type InvoiceStatus = 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled'

export interface User {
  id: string
  email: string
  name: string | null
  avatar_url: string | null
  plan: PlanId
  // Business info
  business_name: string | null
  business_email: string | null
  business_address: string | null
  business_phone: string | null
  business_website: string | null
  business_logo_url: string | null
  tax_id: string | null
  // Invoice settings
  invoice_prefix: string
  next_invoice_number: number
  invoice_count: number
  // Stripe
  stripe_customer_id: string | null
  stripe_subscription_id: string | null
  created_at: string
  updated_at: string
}

export interface Client {
  id: string
  user_id: string
  name: string
  email: string | null
  company: string | null
  address: string | null
  phone: string | null
  website: string | null
  notes: string | null
  created_at: string
  updated_at: string
}

export interface InvoiceLineItem {
  id: string
  description: string
  quantity: number
  unit_price: number
  amount: number
}

export interface Invoice {
  id: string
  user_id: string
  client_id: string
  invoice_number: string
  status: InvoiceStatus
  currency: string
  line_items: InvoiceLineItem[] | unknown
  subtotal: number
  tax_rate: number
  tax_amount: number
  discount_amount: number
  total: number
  notes: string | null
  terms: string | null
  issued_at: string
  due_at: string
  sent_at: string | null
  paid_at: string | null
  created_at: string
  updated_at: string
  // joins
  clients?: Client | null
}

export interface DashboardStats {
  totalRevenue: number
  pendingAmount: number
  overdueAmount: number
  totalInvoices: number
  paidInvoices: number
  pendingInvoices: number
  overdueInvoices: number
  clientCount: number
}
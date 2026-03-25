import Image from 'next/image'
import { formatCurrency, formatDate } from '@/lib/utils'
import type { Invoice, Client, User, InvoiceLineItem } from '@/types'

interface InvoicePreviewProps {
  invoice: Invoice
  client?: Client | null
  user?: Pick<User, 'business_name' | 'business_email' | 'business_address' | 'business_logo_url' | 'business_phone' | 'business_website' | 'tax_id'> | null
}

export function InvoicePreview({ invoice, client, user }: InvoicePreviewProps) {
  const currency = invoice.currency ?? 'USD'
  const lineItems = (invoice.line_items as InvoiceLineItem[]) ?? []
  const resolvedClient = client ?? (invoice.clients as Client | null)

  return (
    <>
      <style>{`
        @media print {
          body * { visibility: hidden; }
          .invoice-print, .invoice-print * { visibility: visible; }
          .invoice-print { position: fixed; top: 0; left: 0; width: 100%; }
        }
      `}</style>

      <div className="invoice-print bg-white text-gray-900 p-8 rounded-xl border border-gray-200 shadow-sm min-h-[600px] font-sans">
        {/* Header */}
        <div className="flex items-start justify-between mb-10">
          <div>
            {user?.business_logo_url ? (
              <Image src={user.business_logo_url} alt="Logo" width={120} height={48} className="h-12 mb-2 object-contain" />
            ) : (
              <div className="text-2xl font-extrabold text-purple-600 mb-1">
                {user?.business_name ?? 'Your Business'}
              </div>
            )}
            {user?.business_email && (
              <p className="text-sm text-gray-500">{user.business_email}</p>
            )}
            {user?.business_phone && (
              <p className="text-sm text-gray-500">{user.business_phone}</p>
            )}
            {user?.business_website && (
              <p className="text-sm text-gray-500">{user.business_website}</p>
            )}
            {user?.business_address && (
              <p className="text-xs text-gray-400 whitespace-pre-line mt-0.5">{user.business_address}</p>
            )}
            {user?.tax_id && (
              <p className="text-xs text-gray-400 mt-0.5">Tax ID: {user.tax_id}</p>
            )}
          </div>

          <div className="text-right">
            <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight mb-1">INVOICE</h1>
            <p className="text-lg font-semibold text-purple-600">{invoice.invoice_number ?? 'INV-0001'}</p>
            <div className="mt-2 space-y-0.5 text-sm text-gray-500">
              {invoice.issued_at && (
                <p>
                  Issued:{' '}
                  <span className="font-medium text-gray-700">{formatDate(invoice.issued_at)}</span>
                </p>
              )}
              {invoice.due_at && (
                <p>
                  Due:{' '}
                  <span className="font-medium text-red-600">{formatDate(invoice.due_at)}</span>
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Bill To */}
        {resolvedClient && (
          <div className="mb-8">
            <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-1">Bill To</p>
            <p className="font-semibold text-gray-900">{resolvedClient.name}</p>
            {resolvedClient.company && (
              <p className="text-sm text-gray-600">{resolvedClient.company}</p>
            )}
            {resolvedClient.email && (
              <p className="text-sm text-gray-500">{resolvedClient.email}</p>
            )}
            {resolvedClient.address && (
              <p className="text-xs text-gray-400 whitespace-pre-line mt-0.5">{resolvedClient.address}</p>
            )}
          </div>
        )}

        {/* Line Items */}
        <div className="mb-6">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b-2 border-gray-200">
                <th className="text-left py-2 font-semibold text-gray-600 text-xs uppercase tracking-wide">
                  Description
                </th>
                <th className="text-right py-2 font-semibold text-gray-600 text-xs uppercase tracking-wide w-16">
                  Qty
                </th>
                <th className="text-right py-2 font-semibold text-gray-600 text-xs uppercase tracking-wide w-28">
                  Unit Price
                </th>
                <th className="text-right py-2 font-semibold text-gray-600 text-xs uppercase tracking-wide w-28">
                  Amount
                </th>
              </tr>
            </thead>
            <tbody>
              {lineItems.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-6 text-center text-gray-400 text-sm">
                    No line items yet
                  </td>
                </tr>
              ) : (
                lineItems.map((item, i) => (
                  <tr key={item.id ?? i} className="border-b border-gray-100">
                    <td className="py-3 text-gray-800">{item.description}</td>
                    <td className="py-3 text-right text-gray-600">{item.quantity}</td>
                    <td className="py-3 text-right text-gray-600">
                      {formatCurrency(item.unit_price, currency)}
                    </td>
                    <td className="py-3 text-right font-medium text-gray-900">
                      {formatCurrency(item.amount, currency)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Totals */}
        <div className="flex justify-end mb-8">
          <div className="w-64 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Subtotal</span>
              <span>{formatCurrency(invoice.subtotal ?? 0, currency)}</span>
            </div>
            {(invoice.discount_amount ?? 0) > 0 && (
              <div className="flex justify-between text-sm text-green-600">
                <span>Discount</span>
                <span>-{formatCurrency(invoice.discount_amount ?? 0, currency)}</span>
              </div>
            )}
            {(invoice.tax_rate ?? 0) > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Tax ({invoice.tax_rate}%)</span>
                <span>{formatCurrency(invoice.tax_amount ?? 0, currency)}</span>
              </div>
            )}
            <div className="flex justify-between border-t-2 border-gray-200 pt-2">
              <span className="font-bold text-gray-900">Total</span>
              <span className="font-bold text-xl text-purple-600">
                {formatCurrency(invoice.total ?? 0, currency)}
              </span>
            </div>
          </div>
        </div>

        {/* Notes & Terms */}
        {(invoice.notes || invoice.terms) && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 border-t border-gray-100 pt-6">
            {invoice.notes && (
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-1">Notes</p>
                <p className="text-sm text-gray-600 whitespace-pre-line">{invoice.notes}</p>
              </div>
            )}
            {invoice.terms && (
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-1">Terms</p>
                <p className="text-sm text-gray-600 whitespace-pre-line">{invoice.terms}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  )
}
import type { Client, InvoiceLineItem } from '@/types'

const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions'
const MODEL = 'anthropic/claude-3.5-sonnet'

export interface AIInvoiceSuggestion {
  lineItems: InvoiceLineItem[]
  notes: string
  terms: string
}

export async function generateInvoiceItems(
  description: string,
  client: Pick<Client, 'name' | 'company'>,
  defaultCurrency: string
): Promise<AIInvoiceSuggestion> {
  const apiKey = process.env.OPENROUTER_API_KEY
  if (!apiKey) throw new Error('OPENROUTER_API_KEY not set')

  const prompt = `You are an expert freelancer creating an invoice for a client.

Client: ${client.name}${client.company ? ` (${client.company})` : ''}
Work Description: ${description}

Generate a professional invoice with line items. Return JSON only:
{
  "lineItems": [
    {
      "id": "1",
      "description": "Service description",
      "quantity": 1,
      "unit_price": 0,
      "amount": 0
    }
  ],
  "notes": "Thank you for your business. Payment is due within the agreed terms.",
  "terms": "Net 30. Late payments subject to 1.5% monthly interest."
}

Rules:
- Break work into logical line items (e.g., Design: 10hrs @ $150/hr, Development: 20hrs @ $200/hr)
- Use realistic market rates for the type of work described
- 1-5 line items max
- amounts = quantity * unit_price (pre-calculated)
- Only return valid JSON, no explanation`

  const response = await fetch(OPENROUTER_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
      'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL ?? 'https://invoiceforge.app',
      'X-Title': 'InvoiceForge',
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
      max_tokens: 800,
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`OpenRouter error: ${response.status} ${error}`)
  }

  const json = await response.json()
  const content = json.choices?.[0]?.message?.content ?? ''
  const jsonMatch = content.match(/\{[\s\S]*\}/)
  if (!jsonMatch) throw new Error('Failed to parse AI response')

  return JSON.parse(jsonMatch[0]) as AIInvoiceSuggestion
}
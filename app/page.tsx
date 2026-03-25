import Link from 'next/link'
import { FileText, Sparkles, Zap, Shield, BarChart3, Clock, Check, ArrowRight, Star } from 'lucide-react'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Nav */}
      <nav className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
              <FileText className="h-4 w-4 text-white" />
            </div>
            <span className="text-lg font-bold">InvoiceForge</span>
          </div>
          <div className="hidden md:flex items-center gap-6 text-sm text-muted-foreground">
            <a href="#features" className="hover:text-foreground transition-colors">Features</a>
            <a href="#pricing" className="hover:text-foreground transition-colors">Pricing</a>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Sign in
            </Link>
            <Link
              href="/login"
              className="text-sm px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
            >
              Get started free
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 pt-24 pb-20 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-purple-50 dark:bg-purple-950/30 text-purple-700 dark:text-purple-300 rounded-full text-sm font-medium mb-6 border border-purple-200 dark:border-purple-800/50">
          <Sparkles className="h-3.5 w-3.5" />
          AI-Powered Invoice Generation
        </div>
        <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight mb-6 leading-tight">
          Professional invoices{' '}
          <span className="text-purple-600">in seconds,</span>
          <br />not hours
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
          Describe the work you did in plain English. InvoiceForge&#39;s AI creates a perfect,
          structured invoice instantly. Get paid faster, spend less time on admin.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/login"
            className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-semibold text-lg shadow-lg shadow-purple-200 dark:shadow-purple-900/30"
          >
            Start for free
            <ArrowRight className="h-5 w-5" />
          </Link>
          <a
            href="#features"
            className="inline-flex items-center gap-2 px-6 py-3 border border-border rounded-lg hover:bg-accent transition-colors font-medium text-lg"
          >
            See how it works
          </a>
        </div>
        <p className="text-sm text-muted-foreground mt-4">
          No credit card required · Free plan includes 5 invoices
        </p>

        {/* Mock invoice preview */}
        <div className="mt-16 max-w-2xl mx-auto">
          <div className="bg-white dark:bg-card border border-border rounded-xl shadow-2xl p-6 text-left">
            <div className="flex justify-between items-start mb-6">
              <div>
                <div className="text-lg font-bold text-purple-600 mb-1">Acme Freelance LLC</div>
                <div className="text-xs text-gray-500">billing@acme.dev</div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-extrabold text-gray-900">INVOICE</div>
                <div className="text-sm font-semibold text-purple-600">INV-0042</div>
                <div className="text-xs text-gray-500 mt-1">Due Dec 15, 2024</div>
              </div>
            </div>
            <div className="mb-4 p-3 bg-gray-50 dark:bg-muted/50 rounded-lg">
              <div className="text-xs text-gray-500 mb-0.5">Bill To</div>
              <div className="font-semibold text-sm">Startup Corp</div>
              <div className="text-xs text-gray-500">jane@startupcorp.io</div>
            </div>
            <table className="w-full text-sm mb-4">
              <thead>
                <tr className="border-b border-gray-200 text-xs text-gray-500 uppercase">
                  <th className="text-left py-1.5">Description</th>
                  <th className="text-right py-1.5 w-10">Qty</th>
                  <th className="text-right py-1.5 w-24">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                <tr>
                  <td className="py-2 text-gray-800">Landing page design & development</td>
                  <td className="py-2 text-right text-gray-500">1</td>
                  <td className="py-2 text-right">$3,200.00</td>
                </tr>
                <tr>
                  <td className="py-2 text-gray-800">UI/UX Design revisions (2 rounds)</td>
                  <td className="py-2 text-right text-gray-500">2</td>
                  <td className="py-2 text-right">$400.00</td>
                </tr>
                <tr>
                  <td className="py-2 text-gray-800">SEO optimization & analytics setup</td>
                  <td className="py-2 text-right text-gray-500">1</td>
                  <td className="py-2 text-right">$650.00</td>
                </tr>
              </tbody>
            </table>
            <div className="flex justify-end">
              <div className="w-48 space-y-1 text-sm">
                <div className="flex justify-between text-gray-500">
                  <span>Subtotal</span><span>$4,250.00</span>
                </div>
                <div className="flex justify-between text-gray-500">
                  <span>Tax (10%)</span><span>$425.00</span>
                </div>
                <div className="flex justify-between font-bold border-t border-gray-200 pt-1.5">
                  <span>Total</span>
                  <span className="text-purple-600">$4,675.00</span>
                </div>
              </div>
            </div>
            {/* AI badge */}
            <div className="mt-4 flex items-center gap-1.5 text-xs text-purple-600 bg-purple-50 dark:bg-purple-950/30 rounded-lg px-3 py-2">
              <Sparkles className="h-3 w-3" />
              Generated by AI from: &ldquo;Built landing page with design, dev, 2 revision rounds, SEO setup&rdquo;
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="max-w-6xl mx-auto px-6 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Everything you need to get paid</h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            From AI-generated line items to automated payment reminders — InvoiceForge handles
            the billing so you can focus on the work.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            {
              icon: Sparkles,
              title: 'AI Line Item Generation',
              desc: 'Describe your work in plain English and watch AI create structured, professional line items in seconds.',
              color: 'text-purple-600',
              bg: 'bg-purple-50 dark:bg-purple-950/30',
            },
            {
              icon: Zap,
              title: 'Instant PDF Export',
              desc: 'Beautiful, print-ready PDF invoices with your branding. Share via link or download in one click.',
              color: 'text-blue-600',
              bg: 'bg-blue-50 dark:bg-blue-950/30',
            },
            {
              icon: Shield,
              title: 'Client Management',
              desc: 'Keep all your client details, billing history, and contact info organized in one place.',
              color: 'text-green-600',
              bg: 'bg-green-50 dark:bg-green-950/30',
            },
            {
              icon: BarChart3,
              title: 'Revenue Dashboard',
              desc: 'Track paid, outstanding, and overdue invoices at a glance. Know exactly where your money is.',
              color: 'text-orange-600',
              bg: 'bg-orange-50 dark:bg-orange-950/30',
            },
            {
              icon: Clock,
              title: 'Status Tracking',
              desc: 'Draft, sent, paid, overdue — track every invoice through its lifecycle automatically.',
              color: 'text-pink-600',
              bg: 'bg-pink-50 dark:bg-pink-950/30',
            },
            {
              icon: FileText,
              title: 'Custom Branding',
              desc: 'Add your logo, business name, and contact details. Every invoice looks like it came from a pro.',
              color: 'text-teal-600',
              bg: 'bg-teal-50 dark:bg-teal-950/30',
            },
          ].map(({ icon: Icon, title, desc, color, bg }) => (
            <div key={title} className="p-6 rounded-xl border border-border bg-card hover:shadow-md transition-shadow">
              <div className={`w-10 h-10 rounded-lg ${bg} flex items-center justify-center mb-4`}>
                <Icon className={`h-5 w-5 ${color}`} />
              </div>
              <h3 className="font-semibold mb-2">{title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="max-w-6xl mx-auto px-6 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Simple, transparent pricing</h2>
          <p className="text-muted-foreground">Start free. Upgrade when you&#39;re ready.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {[
            {
              name: 'Free',
              price: '$0',
              desc: 'Perfect for getting started',
              features: [
                '5 invoices',
                '3 clients',
                'PDF export',
                'Basic templates',
                'Manual tracking',
              ],
              cta: 'Get started',
              popular: false,
            },
            {
              name: 'Pro',
              price: '$15',
              desc: 'For active freelancers',
              features: [
                'Unlimited invoices',
                'Unlimited clients',
                'AI line item generation',
                'Custom branding',
                'Priority support',
              ],
              cta: 'Start free trial',
              popular: true,
            },
            {
              name: 'Agency',
              price: '$49',
              desc: 'For teams and agencies',
              features: [
                'Everything in Pro',
                'Up to 5 team members',
                'White-label PDF',
                'API access',
                'Dedicated support',
              ],
              cta: 'Contact sales',
              popular: false,
            },
          ].map(({ name, price, desc, features, cta, popular }) => (
            <div
              key={name}
              className={`relative p-6 rounded-xl border ${popular ? 'border-purple-500 shadow-lg shadow-purple-100 dark:shadow-purple-900/20' : 'border-border'} bg-card`}
            >
              {popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="bg-purple-600 text-white text-xs font-semibold px-3 py-1 rounded-full flex items-center gap-1">
                    <Star className="h-3 w-3" />
                    Most Popular
                  </span>
                </div>
              )}
              <h3 className="font-bold text-lg mb-1">{name}</h3>
              <p className="text-sm text-muted-foreground mb-3">{desc}</p>
              <div className="text-3xl font-extrabold mb-6">
                {price}
                {price !== '$0' && (
                  <span className="text-base font-normal text-muted-foreground">/mo</span>
                )}
              </div>
              <ul className="space-y-2.5 mb-6">
                {features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 text-green-500 shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                href="/login"
                className={`block text-center py-2.5 rounded-lg font-medium text-sm transition-colors ${
                  popular
                    ? 'bg-purple-600 text-white hover:bg-purple-700'
                    : 'border border-border hover:bg-accent'
                }`}
              >
                {cta}
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border mt-12">
        <div className="max-w-6xl mx-auto px-6 py-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-purple-600 rounded-md flex items-center justify-center">
              <FileText className="h-3 w-3 text-white" />
            </div>
            <span className="font-semibold">InvoiceForge</span>
          </div>
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Aurora Rayes LLC. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}
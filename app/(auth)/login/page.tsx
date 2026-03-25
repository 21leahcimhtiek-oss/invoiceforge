import { redirect } from 'next/navigation'
import { createServerClient } from '@/lib/supabase/server'
import { LoginButton } from './login-button'
import { FileText, Sparkles, Zap } from 'lucide-react'

export default async function LoginPage() {
  const supabase = createServerClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (session) redirect('/dashboard')

  return (
    <div className="min-h-screen flex">
      {/* Left panel — branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-purple-600 to-purple-900 flex-col justify-between p-12 text-white">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-white/20 rounded-lg flex items-center justify-center">
            <FileText className="h-5 w-5" />
          </div>
          <span className="text-xl font-bold">InvoiceForge</span>
        </div>

        <div className="space-y-8">
          <div>
            <h1 className="text-4xl font-bold leading-tight mb-4">
              Professional invoices in seconds, not hours.
            </h1>
            <p className="text-purple-200 text-lg">
              AI-powered invoice generation that learns your business and creates
              perfect, branded invoices automatically.
            </p>
          </div>

          <div className="space-y-4">
            {[
              { icon: Sparkles, text: 'AI generates line items from plain English descriptions' },
              { icon: Zap, text: 'Send invoices and get paid faster with automated reminders' },
              { icon: FileText, text: 'Beautiful PDF exports with your branding' },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-3">
                <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center shrink-0">
                  <Icon className="h-4 w-4" />
                </div>
                <p className="text-purple-100">{text}</p>
              </div>
            ))}
          </div>
        </div>

        <p className="text-purple-300 text-sm">
          Trusted by 1,200+ freelancers and agencies worldwide
        </p>
      </div>

      {/* Right panel — login form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-sm space-y-8">
          {/* Mobile logo */}
          <div className="flex items-center gap-2 lg:hidden">
            <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
              <FileText className="h-4 w-4 text-white" />
            </div>
            <span className="text-lg font-bold">InvoiceForge</span>
          </div>

          <div>
            <h2 className="text-2xl font-bold">Welcome back</h2>
            <p className="text-muted-foreground mt-1">Sign in to your InvoiceForge account</p>
          </div>

          <LoginButton />

          <p className="text-center text-xs text-muted-foreground">
            By continuing, you agree to our{' '}
            <a href="#" className="underline hover:text-foreground">Terms of Service</a>
            {' '}and{' '}
            <a href="#" className="underline hover:text-foreground">Privacy Policy</a>.
          </p>
        </div>
      </div>
    </div>
  )
}
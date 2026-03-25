import { createServerClient } from '@/lib/supabase/server'
import { Header } from '@/components/layout/header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { SettingsForm } from './settings-form'
import type { User } from '@/types'

export const dynamic = 'force-dynamic'

export default async function SettingsPage() {
  const supabase = createServerClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return null

  const { data: user } = await supabase
    .from('users')
    .select('*')
    .eq('id', session.user.id)
    .single()

  if (!user) return null

  return (
    <div>
      <Header title="Settings" subtitle="Manage your account and business profile" />
      <div className="p-6 space-y-8 max-w-3xl">
        <SettingsForm user={user as User} />

        <Separator />

        {/* Account Info */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Account Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Email</p>
                <p className="text-sm text-muted-foreground">{user.email}</p>
              </div>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Current Plan</p>
                <p className="text-sm text-muted-foreground capitalize">{user.plan}</p>
              </div>
              <Badge
                className={
                  user.plan === 'agency'
                    ? 'bg-purple-100 text-purple-700 border-0'
                    : user.plan === 'pro'
                    ? 'bg-blue-100 text-blue-700 border-0'
                    : 'bg-muted text-muted-foreground border-0'
                }
              >
                {user.plan}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Danger Zone */}
        <Card className="border-destructive/30">
          <CardHeader>
            <CardTitle className="text-base text-destructive">Danger Zone</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Deleting your account will permanently remove all your invoices, clients, and data.
              This action cannot be undone.
            </p>
            <DeleteAccountButton />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function DeleteAccountButton() {
  // Rendered as a client island inline — kept simple since it's just a confirmation
  return (
    <form
      action="/api/user/delete"
      method="POST"
      onSubmit={(e) => {
        if (!confirm('Are you sure? This will permanently delete your account and all data.')) {
          e.preventDefault()
        }
      }}
    >
      <button
        type="submit"
        className="text-sm text-destructive underline underline-offset-2 hover:text-destructive/80 transition-colors"
      >
        Delete my account
      </button>
    </form>
  )
}
import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'
import { useUiStore } from '@/store/uiStore'
import { getUserPreferences, updateUserPreferences } from '@/services/supabaseService'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { Skeleton } from '@/components/ui/Skeleton'
import type { UserPreferences } from '@/types'

function Toggle({
  checked,
  onChange,
  label,
  description,
}: {
  checked: boolean
  onChange: (v: boolean) => void
  label: string
  description?: string
}) {
  return (
    <label className="flex cursor-pointer items-start gap-4">
      <div className="relative mt-0.5 shrink-0">
        <input
          type="checkbox"
          className="sr-only"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
        />
        <div
          className={`h-5 w-9 rounded-full transition-colors ${checked ? 'bg-accent' : 'bg-surface-base border border-border'}`}
        />
        <div
          className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${checked ? 'translate-x-4' : 'translate-x-0.5'}`}
        />
      </div>
      <div>
        <p className="text-sm font-medium text-content-primary">{label}</p>
        {description && <p className="text-xs text-content-secondary">{description}</p>}
      </div>
    </label>
  )
}

export function SettingsPage() {
  const { user } = useAuth()
  const pushToast = useUiStore((s) => s.pushToast)
  const queryClient = useQueryClient()

  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [passwordForm, setPasswordForm] = useState({ current: '', next: '', confirm: '' })
  const [passwordError, setPasswordError] = useState<string | null>(null)
  const [passwordLoading, setPasswordLoading] = useState(false)

  const [form, setForm] = useState<Partial<UserPreferences>>({})
  const [formDirty, setFormDirty] = useState(false)

  const prefsKey = ['user-preferences', user?.id ?? '']

  const { data: prefs, isLoading } = useQuery({
    queryKey: prefsKey,
    queryFn: () => getUserPreferences(user!.id),
    enabled: !!user?.id,
  })

  useEffect(() => {
    if (prefs && !formDirty) setForm(prefs)
  }, [prefs, formDirty])

  const saveMutation = useMutation({
    mutationFn: () => updateUserPreferences(user!.id, form),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: prefsKey })
      setFormDirty(false)
      pushToast({ severity: 'info', message: 'Preferences saved' })
    },
    onError: (err: Error) => {
      pushToast({ severity: 'critical', message: err.message })
    },
  })

  function update<K extends keyof UserPreferences>(key: K, value: UserPreferences[K]) {
    setForm((f) => ({ ...f, [key]: value }))
    setFormDirty(true)
  }

  async function handleChangePassword() {
    setPasswordError(null)
    if (passwordForm.next !== passwordForm.confirm) {
      setPasswordError('New passwords do not match')
      return
    }
    if (passwordForm.next.length < 6) {
      setPasswordError('Password must be at least 6 characters')
      return
    }
    setPasswordLoading(true)
    const { error: authError } = await supabase.auth.signInWithPassword({
      email: user!.email!,
      password: passwordForm.current,
    })
    if (authError) {
      setPasswordLoading(false)
      setPasswordError('Current password is incorrect')
      return
    }
    const { error } = await supabase.auth.updateUser({ password: passwordForm.next })
    setPasswordLoading(false)
    if (error) {
      setPasswordError(error.message)
    } else {
      setPasswordForm({ current: '', next: '', confirm: '' })
      pushToast({ severity: 'info', message: 'Password updated' })
    }
  }

  async function handleDeleteAccount() {
    setDeleteModalOpen(false)
    pushToast({ severity: 'critical', message: 'Account deletion requires a support request.' })
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-48 w-full rounded-xl" />
        ))}
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold text-content-primary">Settings</h1>

      {/* Profile */}
      <Card title="Profile">
        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-content-primary">Email</label>
            <input
              type="email"
              value={user?.email ?? ''}
              disabled
              className="w-full rounded-lg border border-border bg-surface-base px-3 py-2 text-sm text-content-secondary opacity-70"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-content-primary">
              Display Name
            </label>
            <input
              type="text"
              value={form.username ?? ''}
              onChange={(e) => update('username', e.target.value)}
              placeholder="Your name"
              className="w-full rounded-lg border border-border bg-surface-raised px-3 py-2 text-sm text-content-primary focus:outline-none focus:ring-2 focus:ring-accent"
            />
          </div>
        </div>
      </Card>

      {/* Notifications */}
      <Card title="Notifications" description="Choose which threats trigger alerts.">
        <div className="space-y-5">
          <Toggle
            checked={form.notifyCritical ?? true}
            onChange={(v) => update('notifyCritical', v)}
            label="Critical threats"
            description="BruteForce attacks"
          />
          <Toggle
            checked={form.notifyHigh ?? true}
            onChange={(v) => update('notifyHigh', v)}
            label="High severity"
            description="Spoofing attempts"
          />
          <Toggle
            checked={form.notifyMedium ?? false}
            onChange={(v) => update('notifyMedium', v)}
            label="Medium severity"
            description="Reconnaissance activity"
          />
          <Toggle
            checked={form.emailAlerts ?? false}
            onChange={(v) => update('emailAlerts', v)}
            label="Email alerts"
            description="Send alerts to your email address"
          />
        </div>
      </Card>

      {/* Default scan mode */}
      <Card title="Default Scan Mode">
        <div className="flex gap-3">
          {(['pcap', 'realtime'] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => update('defaultScanMode', mode)}
              className={`flex-1 rounded-lg border px-4 py-3 text-sm font-medium transition-colors ${
                form.defaultScanMode === mode
                  ? 'border-accent bg-accent/10 text-accent'
                  : 'border-border text-content-secondary hover:bg-surface-base'
              }`}
            >
              {mode === 'pcap' ? 'PCAP Upload' : 'Real-time'}
            </button>
          ))}
        </div>
      </Card>

      <div className="flex justify-end">
        <Button
          onClick={() => saveMutation.mutate()}
          loading={saveMutation.isPending}
          disabled={!formDirty}
        >
          Save Changes
        </Button>
      </div>

      {/* Change password */}
      <Card title="Change Password">
        <div className="space-y-3">
          {(['current', 'next', 'confirm'] as const).map((field) => (
            <input
              key={field}
              type="password"
              placeholder={
                field === 'current'
                  ? 'Current password'
                  : field === 'next'
                    ? 'New password'
                    : 'Confirm new password'
              }
              value={passwordForm[field]}
              onChange={(e) => setPasswordForm((f) => ({ ...f, [field]: e.target.value }))}
              className="w-full rounded-lg border border-border bg-surface-raised px-3 py-2 text-sm text-content-primary focus:outline-none focus:ring-2 focus:ring-accent"
            />
          ))}
          {passwordError && <p className="text-sm text-severity-critical">{passwordError}</p>}
          <Button
            variant="outline"
            onClick={handleChangePassword}
            loading={passwordLoading}
            disabled={!passwordForm.next || !passwordForm.confirm}
          >
            Update Password
          </Button>
        </div>
      </Card>

      {/* Danger zone */}
      <Card className="border-severity-critical/40">
        <h3 className="mb-1 text-base font-semibold text-severity-critical">Danger Zone</h3>
        <p className="mb-4 text-sm text-content-secondary">
          Permanently delete your account and all scan data.
        </p>
        <Button variant="danger" onClick={() => setDeleteModalOpen(true)}>
          Delete Account
        </Button>
      </Card>

      <Modal open={deleteModalOpen} title="Delete Account" onClose={() => setDeleteModalOpen(false)}>
        <p className="mb-6 text-sm text-content-secondary">
          This will permanently delete your account and all associated scan data. This action cannot
          be undone.
        </p>
        <div className="flex justify-end gap-3">
          <Button variant="ghost" onClick={() => setDeleteModalOpen(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDeleteAccount}>
            Delete My Account
          </Button>
        </div>
      </Modal>
    </div>
  )
}

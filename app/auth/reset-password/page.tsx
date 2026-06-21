'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Zap, Lock, Loader } from 'lucide-react'

export default function ResetPasswordPage() {
  const router = useRouter()
  const supabase = createClient()

  const [checking, setChecking] = useState(true)
  const [validSession, setValidSession] = useState(false)
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const [done, setDone] = useState(false)

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setValidSession(!!user)
      setChecking(false)
    })
  }, [])

  async function handleSave() {
    if (password.length < 6) { setError('Password must be at least 6 characters'); return }
    if (password !== confirm) { setError('Passwords don\'t match'); return }

    setSaving(true)
    setError('')
    const { error } = await supabase.auth.updateUser({ password })
    if (error) {
      setError(error.message)
      setSaving(false)
      return
    }
    setDone(true)
    setSaving(false)
    setTimeout(() => router.push('/dashboard'), 1200)
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-brand">
          <div className="brand">
            <Zap size={18} className="brand-icon" />
            space.online
          </div>
        </div>

        {checking ? (
          <div className="auth-sent">
            <Loader size={24} className="spin" style={{ color: 'var(--teal)' }} />
          </div>
        ) : !validSession ? (
          <div className="auth-sent">
            <h2>Link expired</h2>
            <p>This password reset link is invalid or has expired. Request a new one from the sign-in screen.</p>
          </div>
        ) : done ? (
          <div className="auth-sent">
            <h2>Password updated</h2>
            <p>Taking you to your dashboard…</p>
          </div>
        ) : (
          <>
            <h2 className="auth-title">Set a new password</h2>
            <p className="auth-sub">Choose a password for your account</p>

            <div className="inp-group">
              <label className="inp-label">New password</label>
              <input
                className="inp"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                autoFocus
              />
            </div>

            <div className="inp-group">
              <label className="inp-label">Confirm password</label>
              <input
                className="inp"
                type="password"
                placeholder="••••••••"
                value={confirm}
                onChange={e => setConfirm(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSave()}
              />
            </div>

            {error && <p className="auth-error">{error}</p>}

            <button
              className="auth-btn auth-btn-primary"
              onClick={handleSave}
              disabled={saving || !password || !confirm}
            >
              <Lock size={15} />
              {saving ? 'Saving…' : 'Update password'}
            </button>
          </>
        )}
      </div>
    </div>
  )
}

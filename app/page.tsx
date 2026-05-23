'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Zap, Mail, Lock, ArrowRight, Globe, BarChart2, FolderOpen, BookOpen } from 'lucide-react'

export default function LandingPage() {
  const [mode, setMode] = useState<'landing' | 'signin' | 'signup'>('landing')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  const supabase = createClient()

  async function handleMagicLink() {
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${location.origin}/auth/callback` },
    })
    if (error) setError(error.message)
    else setSent(true)
    setLoading(false)
  }

  async function handlePassword(type: 'signin' | 'signup') {
    setLoading(true)
    setError('')
    let err
    if (type === 'signup') {
      const res = await supabase.auth.signUp({
        email, password,
        options: { emailRedirectTo: `${location.origin}/auth/callback` },
      })
      err = res.error
      if (!err) setSent(true)
    } else {
      const res = await supabase.auth.signInWithPassword({ email, password })
      err = res.error
      if (!err) window.location.href = '/dashboard'
    }
    if (err) setError(err.message)
    setLoading(false)
  }

  if (mode !== 'landing') {
    return (
      <div className="auth-page">
        <div className="auth-card">
          <div className="auth-brand">
            <div className="brand">
              <Zap size={18} className="brand-icon" />
              space.online
            </div>
          </div>

          {sent ? (
            <div className="auth-sent">
              <Mail size={32} style={{ color: 'var(--teal)', marginBottom: 12 }} />
              <h2>Check your email</h2>
              <p>We sent a magic link to <strong>{email}</strong>. Click it to sign in.</p>
            </div>
          ) : (
            <>
              <h2 className="auth-title">
                {mode === 'signin' ? 'Welcome back' : 'Create your space'}
              </h2>
              <p className="auth-sub">
                {mode === 'signin' ? 'Sign in to your workspace' : 'Get started — free forever'}
              </p>

              <div className="inp-group">
                <label className="inp-label">Email</label>
                <input
                  className="inp"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleMagicLink()}
                />
              </div>

              {error && <p className="auth-error">{error}</p>}

              <button
                className="auth-btn auth-btn-primary"
                onClick={handleMagicLink}
                disabled={loading || !email}
              >
                <Mail size={15} />
                {loading ? 'Sending…' : 'Send magic link'}
              </button>

              <div className="auth-divider">or use password</div>

              <div className="inp-group">
                <label className="inp-label">Password</label>
                <input
                  className="inp"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handlePassword(mode)}
                />
              </div>

              <button
                className="auth-btn auth-btn-secondary"
                onClick={() => handlePassword(mode)}
                disabled={loading || !email || !password}
              >
                <Lock size={15} />
                {mode === 'signin' ? 'Sign in' : 'Create account'}
              </button>

              <p className="auth-switch">
                {mode === 'signin'
                  ? <>No account? <button onClick={() => { setMode('signup'); setError('') }}>Sign up free</button></>
                  : <>Have an account? <button onClick={() => { setMode('signin'); setError('') }}>Sign in</button></>
                }
              </p>
            </>
          )}

          <button className="auth-back" onClick={() => { setMode('landing'); setSent(false); setError('') }}>
            ← Back to home
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="land-page">
      <nav className="land-nav">
        <div className="brand">
          <Zap size={16} className="brand-icon" />
          space.online
        </div>
        <div className="land-nav-actions">
          <button className="btn btn-ghost btn-sm land-nav-signin" onClick={() => setMode('signin')}>
            Sign in
          </button>
          <button className="btn btn-primary btn-sm" onClick={() => setMode('signup')}>
            Get started
          </button>
        </div>
      </nav>

      <section className="land-hero">
        <div className="land-hero-glow" />
        <div className="land-hero-badge">
          <Zap size={10} /> Now in beta
        </div>
        <h1 className="land-hero-title">
          Your profile.<br />Your CRM.<br />Your business.
        </h1>
        <p className="land-hero-sub">
          One link for everything — share your profile, manage contacts,
          organize projects, and stay on top of your business.
        </p>
        <div className="land-hero-ctas">
          <button className="land-cta-primary" onClick={() => setMode('signup')}>
            Get your space <ArrowRight size={16} />
          </button>
          <button className="land-cta-ghost" onClick={() => setMode('signin')}>
            Sign in
          </button>
        </div>
        <p className="land-hero-url">space.online/<b>yourname</b></p>
      </section>

      <section className="land-features">
        <div className="land-feat-card">
          <Globe size={22} className="land-feat-icon" />
          <h3>Public profile</h3>
          <p>A shareable page at space.online/you with your links, socials, and bio.</p>
        </div>
        <div className="land-feat-card">
          <BarChart2 size={22} className="land-feat-icon" />
          <h3>Built-in CRM</h3>
          <p>Track contacts and deals through a full pipeline — lead to closed.</p>
        </div>
        <div className="land-feat-card">
          <FolderOpen size={22} className="land-feat-icon" />
          <h3>Folders &amp; projects</h3>
          <p>Organize anything — clients, jobs, brand deals — into labeled folders.</p>
        </div>
        <div className="land-feat-card">
          <BookOpen size={22} className="land-feat-icon" />
          <h3>Notes &amp; diary</h3>
          <p>Capture ideas, log entries, and keep a private journal — all in one place.</p>
        </div>
      </section>

      <footer className="land-footer">
        <div className="brand" style={{ fontSize: 13 }}>
          <Zap size={13} className="brand-icon" />
          space.online
        </div>
        <span style={{ color: 'var(--tx3)', fontSize: 12 }}>© 2026 space.online</span>
      </footer>
    </div>
  )
}

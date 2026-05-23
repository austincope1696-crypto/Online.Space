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
      <div className="land-auth-wrap">
        <div className="land-auth-card">
          <div className="land-logo">
            <Zap size={20} className="land-logo-icon" />
            space.online
          </div>

          {sent ? (
            <div className="land-sent">
              <Mail size={32} style={{ color: 'var(--teal)', marginBottom: 12 }} />
              <h2>Check your email</h2>
              <p>We sent a link to <strong>{email}</strong>. Click it to continue.</p>
            </div>
          ) : (
            <>
              <h2 className="land-auth-title">
                {mode === 'signin' ? 'Welcome back' : 'Create your space'}
              </h2>

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

              {error && <p className="land-error">{error}</p>}

              <button
                className="btn btn-primary land-auth-btn"
                onClick={handleMagicLink}
                disabled={loading || !email}
              >
                <Mail size={15} />
                {loading ? 'Sending…' : 'Send magic link'}
              </button>

              <div className="land-divider"><span>or use password</span></div>

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
                className="btn btn-secondary land-auth-btn"
                onClick={() => handlePassword(mode)}
                disabled={loading || !email || !password}
              >
                <Lock size={15} />
                {mode === 'signin' ? 'Sign in' : 'Create account'}
              </button>

              <p className="land-switch">
                {mode === 'signin'
                  ? <>No account? <button onClick={() => { setMode('signup'); setError('') }}>Sign up</button></>
                  : <>Have an account? <button onClick={() => { setMode('signin'); setError('') }}>Sign in</button></>
                }
              </p>
            </>
          )}

          <button className="land-back" onClick={() => { setMode('landing'); setSent(false); setError('') }}>
            ← Back
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="land-wrap">
      <nav className="land-nav">
        <div className="land-logo">
          <Zap size={18} className="land-logo-icon" />
          space.online
        </div>
        <div className="land-nav-actions">
          <button className="btn btn-ghost btn-sm land-nav-signin" onClick={() => setMode('signin')}>Sign in</button>
          <button className="btn btn-primary btn-sm" onClick={() => setMode('signup')}>Get started</button>
        </div>
      </nav>

      <section className="land-hero">
        <div className="land-hero-badge">Now in beta</div>
        <h1 className="land-hero-title">Your profile.<br />Your CRM.<br />Your business.</h1>
        <p className="land-hero-sub">
          One link for everything — share your profile, manage contacts,
          organize projects, and stay on top of your business.
        </p>
        <div className="land-hero-actions">
          <button className="btn btn-primary land-cta" onClick={() => setMode('signup')}>
            Get your space <ArrowRight size={16} />
          </button>
          <button className="btn btn-ghost land-cta" onClick={() => setMode('signin')}>
            Sign in
          </button>
        </div>
        <p className="land-hero-url">space.online/<span className="land-hero-url-you">yourname</span></p>
      </section>

      <section className="land-features">
        <div className="land-feature-card">
          <Globe size={24} className="land-feature-icon" />
          <h3>Public profile</h3>
          <p>A shareable page at space.online/you with your links, socials, and bio.</p>
        </div>
        <div className="land-feature-card">
          <BarChart2 size={24} className="land-feature-icon" />
          <h3>Built-in CRM</h3>
          <p>Track contacts and deals through a full pipeline — lead to closed.</p>
        </div>
        <div className="land-feature-card">
          <FolderOpen size={24} className="land-feature-icon" />
          <h3>Folders &amp; projects</h3>
          <p>Organize anything — clients, jobs, brand deals — into labeled folders.</p>
        </div>
        <div className="land-feature-card">
          <BookOpen size={24} className="land-feature-icon" />
          <h3>Notes &amp; diary</h3>
          <p>Capture ideas, log entries, and keep a private journal — all in one place.</p>
        </div>
      </section>

      <footer className="land-footer">
        <span className="land-logo" style={{ fontSize: 13 }}>
          <Zap size={13} className="land-logo-icon" /> space.online
        </span>
        <span style={{ color: 'var(--tx3)', fontSize: 12 }}>© 2026</span>
      </footer>
    </div>
  )
}

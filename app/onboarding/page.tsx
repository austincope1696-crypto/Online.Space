'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { MODULE_OPTIONS, TEMPLATES } from '@/lib/constants'
import { Module } from '@/lib/types'
import { Zap, Check, ArrowRight, Loader } from 'lucide-react'

type Template = 'solar' | 'realestate' | 'content' | null

const TEMPLATE_OPTIONS = [
  { k: 'solar',      label: 'Solar sales',    desc: 'Leads, installs, jobs, subcontractors' },
  { k: 'realestate', label: 'Real estate',     desc: 'Listings, buyers, wholesale, closed' },
  { k: 'content',    label: 'Content creator', desc: 'Brand deals, calendar, scripts' },
]

export default function OnboardingPage() {
  const router = useRouter()
  const [step, setStep] = useState<'modules' | 'template' | 'profile'>('modules')
  const [selectedModules, setSelectedModules] = useState<Module[]>(['crm', 'folders'])
  const [template, setTemplate] = useState<Template>(null)
  const [displayName, setDisplayName] = useState('')
  const [username, setUsername] = useState('')
  const [bio, setBio] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const supabase = createClient()

  function toggleModule(k: Module) {
    setSelectedModules(prev =>
      prev.includes(k) ? prev.filter(m => m !== k) : [...prev, k]
    )
  }

  async function finish() {
    setSaving(true)
    setError('')

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/'); return }

    const slug = username.trim() || user.email?.split('@')[0] || user.id

    const { error: spaceErr } = await supabase.from('spaces').upsert({
      user_id: user.id,
      username: slug,
      display_name: displayName.trim() || slug,
      bio: bio.trim(),
      modules: selectedModules,
      socials: [],
      links: [],
      theme: 'dark',
    }, { onConflict: 'user_id' })

    if (spaceErr) { setError(spaceErr.message); setSaving(false); return }

    if (template && TEMPLATES[template]) {
      const tpl = TEMPLATES[template]
      if (selectedModules.includes('folders') && tpl.folders?.length) {
        await supabase.from('folders').insert(
          tpl.folders.map(f => ({ ...f, user_id: user.id }))
        )
      }
      if (selectedModules.includes('crm') && tpl.contacts?.length) {
        await supabase.from('contacts').insert(
          tpl.contacts.map(c => ({ ...c, user_id: user.id }))
        )
      }
    }

    router.push('/dashboard')
  }

  const STEPS = ['modules', 'template', 'profile'] as const

  return (
    <div className="ob-page">
      <div className="ob-card">
        <div className="ob-brand">
          <div className="brand">
            <Zap size={18} className="brand-icon" />
            space.online
          </div>
        </div>

        {/* ── Step 1: Modules ─────────────────────────────── */}
        {step === 'modules' && (
          <>
            <h2 className="ob-title">What do you need?</h2>
            <p className="ob-sub">Pick the tools for your workspace. You can change this anytime.</p>

            <div className="ob-list">
              {MODULE_OPTIONS.map(m => (
                <button
                  key={m.k}
                  className={`ob-item${selectedModules.includes(m.k) ? ' selected' : ''}`}
                  onClick={() => toggleModule(m.k)}
                >
                  <div className="ob-check">
                    {selectedModules.includes(m.k) && <Check size={12} />}
                  </div>
                  <div>
                    <div className="ob-item-label">{m.label}</div>
                    <div className="ob-item-desc">{m.desc}</div>
                  </div>
                </button>
              ))}
            </div>

            <div className="ob-actions">
              <button
                className="btn btn-primary ob-btn"
                disabled={selectedModules.length === 0}
                onClick={() => setStep('template')}
              >
                Continue <ArrowRight size={15} />
              </button>
            </div>
          </>
        )}

        {/* ── Step 2: Template ────────────────────────────── */}
        {step === 'template' && (
          <>
            <h2 className="ob-title">Start from a template?</h2>
            <p className="ob-sub">We'll seed your workspace with folders and sample contacts.</p>

            <div className="ob-list">
              {TEMPLATE_OPTIONS.map(t => (
                <button
                  key={t.k}
                  className={`ob-item${template === t.k ? ' selected' : ''}`}
                  onClick={() => setTemplate(prev => prev === t.k ? null : t.k as Template)}
                >
                  <div className="ob-check">
                    {template === t.k && <Check size={12} />}
                  </div>
                  <div>
                    <div className="ob-item-label">{t.label}</div>
                    <div className="ob-item-desc">{t.desc}</div>
                  </div>
                </button>
              ))}
              <button
                className={`ob-item${template === null ? ' selected' : ''}`}
                onClick={() => setTemplate(null)}
              >
                <div className="ob-check">
                  {template === null && <Check size={12} />}
                </div>
                <div>
                  <div className="ob-item-label">Start blank</div>
                  <div className="ob-item-desc">Empty workspace — build it your way</div>
                </div>
              </button>
            </div>

            <div className="ob-actions">
              <button className="btn btn-ghost ob-btn" onClick={() => setStep('modules')}>
                Back
              </button>
              <button className="btn btn-primary ob-btn" onClick={() => setStep('profile')}>
                Continue <ArrowRight size={15} />
              </button>
            </div>
          </>
        )}

        {/* ── Step 3: Profile ─────────────────────────────── */}
        {step === 'profile' && (
          <>
            <h2 className="ob-title">Set up your profile</h2>
            <p className="ob-sub">Your public page will live at space.online/username</p>

            <div className="ob-form">
              <div className="inp-group">
                <label className="inp-label">Display name</label>
                <input
                  className="inp"
                  placeholder="Jane Smith"
                  value={displayName}
                  onChange={e => setDisplayName(e.target.value)}
                />
              </div>
              <div className="inp-group">
                <label className="inp-label">Username</label>
                <div className="inp-prefix-wrap">
                  <span className="inp-prefix">space.online/</span>
                  <input
                    className="inp inp-prefixed"
                    placeholder="jane"
                    value={username}
                    onChange={e => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ''))}
                  />
                </div>
              </div>
              <div className="inp-group">
                <label className="inp-label">
                  Bio <span style={{ color: 'var(--tx3)', fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>(optional)</span>
                </label>
                <textarea
                  className="inp inp-ta"
                  placeholder="Tell the world what you do..."
                  rows={3}
                  value={bio}
                  onChange={e => setBio(e.target.value)}
                />
              </div>
            </div>

            {error && <p className="auth-error">{error}</p>}

            <div className="ob-actions">
              <button className="btn btn-ghost ob-btn" onClick={() => setStep('template')}>
                Back
              </button>
              <button
                className="btn btn-primary ob-btn"
                onClick={finish}
                disabled={saving}
              >
                {saving
                  ? <><Loader size={15} className="spin" /> Saving…</>
                  : <>Launch my space <Zap size={15} /></>
                }
              </button>
            </div>
          </>
        )}

        <div className="ob-dots">
          {STEPS.map(s => (
            <div key={s} className={`ob-dot${step === s ? ' active' : ''}`} />
          ))}
        </div>
      </div>
    </div>
  )
}

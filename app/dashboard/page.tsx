'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { DEFAULT_SOCIALS, STAGES, FOLDER_ICONS, FOLDER_COLORS, MODULE_OPTIONS, BLOCK_TYPES, newBlock } from '@/lib/constants'
import type { Space, Contact, Folder, Module, LayoutBlock, BlockType, StatusBlockConfig, MediaBlockConfig, FeaturedBlockConfig, AboutBlockConfig, GalleryBlockConfig } from '@/lib/types'
import {
  Zap, User, BarChart2, FolderOpen, StickyNote, Calendar, BookOpen,
  LogOut, Plus, Trash2, Save, X, Menu, Eye, ChevronUp, ChevronDown, Blocks,
} from 'lucide-react'

const MODULE_ICONS: Record<Module, React.ReactNode> = {
  crm:      <BarChart2 size={15} />,
  folders:  <FolderOpen size={15} />,
  notes:    <StickyNote size={15} />,
  calendar: <Calendar size={15} />,
  diary:    <BookOpen size={15} />,
}

const MODULE_LABELS: Record<Module, string> = {
  crm: 'CRM', folders: 'Folders', notes: 'Notes', calendar: 'Calendar', diary: 'Diary',
}

type Section = 'profile' | Module

export default function DashboardPage() {
  const router = useRouter()
  const supabase = createClient()

  const [space, setSpace] = useState<Space | null>(null)
  const [contacts, setContacts] = useState<Contact[]>([])
  const [folders, setFolders] = useState<Folder[]>([])
  const [notes, setNotes] = useState<{ id: string; title: string; body: string; updated_at: string }[]>([])
  const [diaryEntries, setDiaryEntries] = useState<{ id: string; date: string; body: string }[]>([])

  const [section, setSection] = useState<Section>('profile')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [profileDraft, setProfileDraft] = useState<Partial<Space>>({})

  // CRM state
  const [activeContact, setActiveContact] = useState<Contact | null>(null)
  const [contactDraft, setContactDraft] = useState<Partial<Contact>>({})
  const [showNewContact, setShowNewContact] = useState(false)

  // Folder state
  const [activeFolder, setActiveFolder] = useState<Folder | null>(null)
  const [showNewFolder, setShowNewFolder] = useState(false)
  const [folderDraft, setFolderDraft] = useState<Partial<Folder>>({})

  // Notes state
  const [activeNote, setActiveNote] = useState<{ id: string; title: string; body: string; updated_at: string } | null>(null)

  // Diary state
  const [activeDiary, setActiveDiary] = useState<{ id: string; date: string; body: string } | null>(null)

  useEffect(() => { load() }, [])

  async function load() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/'); return }

    const [{ data: sp }, { data: cts }, { data: fds }, { data: nts }, { data: drs }] = await Promise.all([
      supabase.from('spaces').select('*').eq('user_id', user.id).maybeSingle(),
      supabase.from('contacts').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
      supabase.from('folders').select('*').eq('user_id', user.id).order('created_at'),
      supabase.from('notes').select('*').eq('user_id', user.id).order('updated_at', { ascending: false }),
      supabase.from('diary_entries').select('*').eq('user_id', user.id).order('date', { ascending: false }),
    ])

    if (sp) {
      setSpace(sp)
      setProfileDraft(sp)
      if (!sp.modules?.length) { router.push('/onboarding'); return }
      setSection(sp.modules[0] as Module)
    }
    setContacts(cts ?? [])
    setFolders(fds ?? [])
    setNotes(nts ?? [])
    setDiaryEntries(drs ?? [])
    setLoading(false)
  }

  async function saveProfile() {
    if (!space) return
    setSaving(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    await supabase.from('spaces').upsert({ ...profileDraft, user_id: user.id }, { onConflict: 'user_id' })
    setSpace(prev => prev ? { ...prev, ...profileDraft } : prev)
    setSaving(false)
  }

  function addBlock(type: BlockType) {
    setProfileDraft(p => ({ ...p, layout: [...(p.layout ?? []), newBlock(type)] }))
  }

  function updateBlock(id: string, config: Partial<StatusBlockConfig & MediaBlockConfig & FeaturedBlockConfig & AboutBlockConfig & GalleryBlockConfig>) {
    setProfileDraft(p => ({
      ...p,
      layout: (p.layout ?? []).map(b => b.id === id ? { ...b, config: { ...b.config, ...config } } : b),
    }))
  }

  function removeBlock(id: string) {
    setProfileDraft(p => ({ ...p, layout: (p.layout ?? []).filter(b => b.id !== id) }))
  }

  function moveBlock(id: string, dir: -1 | 1) {
    setProfileDraft(p => {
      const list = [...(p.layout ?? [])]
      const i = list.findIndex(b => b.id === id)
      const j = i + dir
      if (i < 0 || j < 0 || j >= list.length) return p
      ;[list[i], list[j]] = [list[j], list[i]]
      return { ...p, layout: list }
    })
  }

  async function signOut() {
    await supabase.auth.signOut()
    router.push('/')
  }

  // ── CRM ──────────────────────────────────────────────────────────────
  async function createContact() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { data } = await supabase.from('contacts').insert({
      user_id: user.id,
      name: contactDraft.name || 'New contact',
      company: contactDraft.company || '',
      stage: contactDraft.stage || 'lead',
      source: contactDraft.source || '',
      value: contactDraft.value || 0,
      notes: contactDraft.notes || '',
      phone: contactDraft.phone || '',
      email: contactDraft.email || '',
    }).select().single()
    if (data) {
      setContacts(prev => [data, ...prev])
      setActiveContact(data)
      setContactDraft(data)
      setShowNewContact(false)
    }
  }

  async function saveContact() {
    if (!activeContact) return
    setSaving(true)
    await supabase.from('contacts').update(contactDraft).eq('id', activeContact.id)
    setContacts(prev => prev.map(c => c.id === activeContact.id ? { ...c, ...contactDraft } as Contact : c))
    setActiveContact(prev => prev ? { ...prev, ...contactDraft } as Contact : prev)
    setSaving(false)
  }

  async function deleteContact(id: string) {
    await supabase.from('contacts').delete().eq('id', id)
    setContacts(prev => prev.filter(c => c.id !== id))
    if (activeContact?.id === id) { setActiveContact(null); setContactDraft({}) }
  }

  // ── Folders ───────────────────────────────────────────────────────────
  async function createFolder() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { data } = await supabase.from('folders').insert({
      user_id: user.id,
      name: folderDraft.name || 'New folder',
      icon: folderDraft.icon || '📁',
      color: folderDraft.color || '#00ffd1',
      description: folderDraft.description || '',
    }).select().single()
    if (data) {
      setFolders(prev => [...prev, data])
      setActiveFolder(data)
      setFolderDraft(data)
      setShowNewFolder(false)
    }
  }

  async function saveFolder() {
    if (!activeFolder) return
    setSaving(true)
    await supabase.from('folders').update(folderDraft).eq('id', activeFolder.id)
    setFolders(prev => prev.map(f => f.id === activeFolder.id ? { ...f, ...folderDraft } as Folder : f))
    setActiveFolder(prev => prev ? { ...prev, ...folderDraft } as Folder : prev)
    setSaving(false)
  }

  async function deleteFolder(id: string) {
    await supabase.from('folders').delete().eq('id', id)
    setFolders(prev => prev.filter(f => f.id !== id))
    if (activeFolder?.id === id) { setActiveFolder(null); setFolderDraft({}) }
  }

  // ── Notes ─────────────────────────────────────────────────────────────
  async function createNote() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { data } = await supabase.from('notes').insert({
      user_id: user.id, title: 'Untitled', body: '',
    }).select().single()
    if (data) { setNotes(prev => [data, ...prev]); setActiveNote(data) }
  }

  async function saveNote() {
    if (!activeNote) return
    setSaving(true)
    const updated = { ...activeNote, updated_at: new Date().toISOString() }
    await supabase.from('notes').update({ title: updated.title, body: updated.body }).eq('id', updated.id)
    setNotes(prev => prev.map(n => n.id === updated.id ? updated : n))
    setSaving(false)
  }

  async function deleteNote(id: string) {
    await supabase.from('notes').delete().eq('id', id)
    setNotes(prev => prev.filter(n => n.id !== id))
    if (activeNote?.id === id) setActiveNote(null)
  }

  // ── Diary ─────────────────────────────────────────────────────────────
  async function createDiaryEntry() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const today = new Date().toISOString().slice(0, 10)
    const { data } = await supabase.from('diary_entries').insert({
      user_id: user.id, date: today, body: '',
    }).select().single()
    if (data) { setDiaryEntries(prev => [data, ...prev]); setActiveDiary(data) }
  }

  async function saveDiary() {
    if (!activeDiary) return
    setSaving(true)
    await supabase.from('diary_entries').update({ body: activeDiary.body }).eq('id', activeDiary.id)
    setDiaryEntries(prev => prev.map(d => d.id === activeDiary.id ? activeDiary : d))
    setSaving(false)
  }

  function nav(s: Section) {
    setSection(s)
    setSidebarOpen(false)
  }

  if (loading) return (
    <div className="dash-loading">
      <Zap size={28} style={{ color: 'var(--teal)' }} className="spin" />
    </div>
  )

  if (!space) return null

  const modules = (space.modules ?? []) as Module[]

  return (
    <div className="dash-layout">
      {/* ── Mobile header ───────────────────────────────────── */}
      <div className="dash-mobile-header">
        <div className="brand" style={{ fontSize: 14 }}>
          <Zap size={14} className="brand-icon" /> space.online
        </div>
        <button className="btn btn-ghost btn-icon" onClick={() => setSidebarOpen(o => !o)}>
          {sidebarOpen ? <X size={18} /> : <Menu size={18} />}
        </button>
      </div>

      {/* ── Sidebar ─────────────────────────────────────────── */}
      <aside className={`dash-sidebar${sidebarOpen ? ' open' : ''}`}>
        <div className="dash-sidebar-logo">
          <Zap size={15} className="brand-icon" />
          <span style={{ fontWeight: 800, fontSize: 14, letterSpacing: '-.03em' }}>space.online</span>
        </div>

        <nav className="dash-sidebar-nav">
          <div className="dash-nav-section">Workspace</div>
          <button
            className={`dash-nav-item${section === 'profile' ? ' active' : ''}`}
            onClick={() => nav('profile')}
          >
            <User size={15} /> Profile
          </button>

          {modules.map(m => (
            <button
              key={m}
              className={`dash-nav-item${section === m ? ' active' : ''}`}
              onClick={() => nav(m)}
            >
              {MODULE_ICONS[m]} {MODULE_LABELS[m]}
            </button>
          ))}
        </nav>

        <div className="dash-sidebar-footer">
          {space.username && (
            <a
              href={`/${space.username}`}
              target="_blank"
              rel="noopener noreferrer"
              className="dash-nav-item"
            >
              <Eye size={15} /> View profile
            </a>
          )}
          <button className="dash-nav-item" onClick={signOut}>
            <LogOut size={15} /> Sign out
          </button>
        </div>
      </aside>

      {/* ── Main ────────────────────────────────────────────── */}
      <main className="dash-main" onClick={() => sidebarOpen && setSidebarOpen(false)}>

        {/* ── Profile ───────────────────────────────────────── */}
        {section === 'profile' && (
          <>
            <div className="dash-topbar">
              <span className="dash-topbar-title">Profile</span>
              <div className="dash-topbar-actions">
                <button className="btn btn-primary btn-sm" onClick={saveProfile} disabled={saving}>
                  <Save size={13} /> {saving ? 'Saving…' : 'Save'}
                </button>
                {space.username && (
                  <a
                    href={`/${space.username}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-sm"
                  >
                    <Eye size={13} /> Preview
                  </a>
                )}
              </div>
            </div>
            <div className="dash-content">
              <div className="profile-grid">
                <div>
                  <div className="card">
                    <h3 className="card-title">Basic info</h3>
                    <div className="inp-group">
                      <label className="inp-label">Display name</label>
                      <input className="inp" value={profileDraft.display_name ?? ''} onChange={e => setProfileDraft(p => ({ ...p, display_name: e.target.value }))} />
                    </div>
                    <div className="inp-group">
                      <label className="inp-label">Username</label>
                      <div className="inp-prefix-wrap">
                        <span className="inp-prefix">space.online/</span>
                        <input className="inp inp-prefixed" value={profileDraft.username ?? ''} onChange={e => setProfileDraft(p => ({ ...p, username: e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, '') }))} />
                      </div>
                    </div>
                    <div className="inp-group">
                      <label className="inp-label">Bio</label>
                      <textarea className="inp inp-ta" rows={3} value={profileDraft.bio ?? ''} onChange={e => setProfileDraft(p => ({ ...p, bio: e.target.value }))} />
                    </div>
                    <div className="inp-group">
                      <label className="inp-label">Location</label>
                      <input className="inp" value={profileDraft.location ?? ''} onChange={e => setProfileDraft(p => ({ ...p, location: e.target.value }))} />
                    </div>
                    <div className="inp-group">
                      <label className="inp-label">Website</label>
                      <input className="inp" placeholder="https://" value={profileDraft.website ?? ''} onChange={e => setProfileDraft(p => ({ ...p, website: e.target.value }))} />
                    </div>
                  </div>

                  <div className="card">
                    <h3 className="card-title">Stage appearance</h3>
                    <div className="inp-group">
                      <label className="inp-label">Avatar image URL</label>
                      <input className="inp" placeholder="https://" value={profileDraft.avatar_url ?? ''} onChange={e => setProfileDraft(p => ({ ...p, avatar_url: e.target.value }))} />
                    </div>
                    <div className="inp-group">
                      <label className="inp-label">Cover image URL</label>
                      <input className="inp" placeholder="https://" value={profileDraft.cover_url ?? ''} onChange={e => setProfileDraft(p => ({ ...p, cover_url: e.target.value }))} />
                    </div>
                    <div className="inp-group">
                      <label className="inp-label">Accent color</label>
                      <div className="accent-picker">
                        <input
                          type="color"
                          className="accent-swatch"
                          value={profileDraft.accent_color ?? '#00ffd1'}
                          onChange={e => setProfileDraft(p => ({ ...p, accent_color: e.target.value }))}
                        />
                        <input
                          className="inp"
                          value={profileDraft.accent_color ?? '#00ffd1'}
                          onChange={e => setProfileDraft(p => ({ ...p, accent_color: e.target.value }))}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <div className="card">
                    <h3 className="card-title">Social links</h3>
                    {(profileDraft.socials ?? DEFAULT_SOCIALS).map((s, i) => (
                      <div key={s.k} className="inp-group">
                        <label className="inp-label">{s.p}</label>
                        <input
                          className="inp"
                          placeholder={`${s.k} URL`}
                          value={s.url}
                          onChange={e => {
                            const updated = [...(profileDraft.socials ?? DEFAULT_SOCIALS)]
                            updated[i] = { ...updated[i], url: e.target.value }
                            setProfileDraft(p => ({ ...p, socials: updated }))
                          }}
                        />
                      </div>
                    ))}
                  </div>

                  <div className="card">
                    <div className="card-title-row">
                      <h3 className="card-title">Links</h3>
                      <button
                        className="btn btn-ghost btn-sm"
                        onClick={() => setProfileDraft(p => ({
                          ...p, links: [...(p.links ?? []), { id: crypto.randomUUID(), label: '', url: '', icon: '' }]
                        }))}
                      >
                        <Plus size={13} /> Add
                      </button>
                    </div>
                    {(profileDraft.links ?? []).map((l, i) => (
                      <div key={l.id} className="link-row">
                        <input
                          className="inp"
                          placeholder="Label"
                          value={l.label}
                          onChange={e => {
                            const lnks = [...(profileDraft.links ?? [])]
                            lnks[i] = { ...lnks[i], label: e.target.value }
                            setProfileDraft(p => ({ ...p, links: lnks }))
                          }}
                        />
                        <input
                          className="inp"
                          placeholder="URL"
                          value={l.url}
                          onChange={e => {
                            const lnks = [...(profileDraft.links ?? [])]
                            lnks[i] = { ...lnks[i], url: e.target.value }
                            setProfileDraft(p => ({ ...p, links: lnks }))
                          }}
                        />
                        <button
                          className="btn btn-ghost btn-icon"
                          onClick={() => setProfileDraft(p => ({ ...p, links: (p.links ?? []).filter((_, j) => j !== i) }))}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))}
                    {(profileDraft.links ?? []).length === 0 && (
                      <p className="empty-state">No links yet. Add one above.</p>
                    )}
                  </div>

                  <div className="card">
                    <div className="card-title-row">
                      <h3 className="card-title"><Blocks size={14} /> Blocks</h3>
                      <div style={{ display: 'flex', gap: 6 }}>
                        {BLOCK_TYPES.map(bt => (
                          <button key={bt.k} className="btn btn-ghost btn-sm" title={bt.desc} onClick={() => addBlock(bt.k)}>
                            <Plus size={12} /> {bt.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {(profileDraft.layout ?? []).map((block, i) => (
                      <div key={block.id} className="block-item">
                        <div className="block-item-head">
                          <span className="block-item-type">{BLOCK_TYPES.find(t => t.k === block.type)?.label}</span>
                          <div className="block-item-actions">
                            <button className="btn btn-ghost btn-icon" disabled={i === 0} onClick={() => moveBlock(block.id, -1)}><ChevronUp size={13} /></button>
                            <button className="btn btn-ghost btn-icon" disabled={i === (profileDraft.layout?.length ?? 0) - 1} onClick={() => moveBlock(block.id, 1)}><ChevronDown size={13} /></button>
                            <button className="btn btn-ghost btn-icon" onClick={() => removeBlock(block.id)}><Trash2 size={13} /></button>
                          </div>
                        </div>

                        {block.type === 'status' && (
                          <>
                            <div className="inp-group">
                              <label className="inp-label">Status label</label>
                              <input
                                className="inp"
                                placeholder="Booking now"
                                value={(block.config as StatusBlockConfig).label}
                                onChange={e => updateBlock(block.id, { label: e.target.value })}
                              />
                            </div>
                            <div className="inp-group">
                              <label className="inp-label">Emoji</label>
                              <input
                                className="inp"
                                placeholder="🟢"
                                value={(block.config as StatusBlockConfig).emoji ?? ''}
                                onChange={e => updateBlock(block.id, { emoji: e.target.value })}
                              />
                            </div>
                          </>
                        )}

                        {block.type === 'about' && (
                          <>
                            <div className="inp-group">
                              <label className="inp-label">Work</label>
                              <input
                                className="inp"
                                placeholder="Solar consultant at SunPeak"
                                value={(block.config as AboutBlockConfig).work ?? ''}
                                onChange={e => updateBlock(block.id, { work: e.target.value })}
                              />
                            </div>
                            <div className="inp-group">
                              <label className="inp-label">Education</label>
                              <input
                                className="inp"
                                placeholder="Arizona State University"
                                value={(block.config as AboutBlockConfig).education ?? ''}
                                onChange={e => updateBlock(block.id, { education: e.target.value })}
                              />
                            </div>
                            <div className="inp-group">
                              <label className="inp-label">Interests</label>
                              <input
                                className="inp"
                                placeholder="Hiking, real estate, golf"
                                value={(block.config as AboutBlockConfig).interests ?? ''}
                                onChange={e => updateBlock(block.id, { interests: e.target.value })}
                              />
                            </div>
                          </>
                        )}

                        {block.type === 'gallery' && (
                          <>
                            <div className="inp-group">
                              <label className="inp-label">Section title</label>
                              <input
                                className="inp"
                                placeholder="Gallery"
                                value={(block.config as GalleryBlockConfig).title ?? ''}
                                onChange={e => updateBlock(block.id, { title: e.target.value })}
                              />
                            </div>
                            {((block.config as GalleryBlockConfig).images ?? []).map((img, j) => (
                              <div key={img.id} className="featured-item-row">
                                <input
                                  className="inp"
                                  placeholder="Image URL"
                                  value={img.url}
                                  onChange={e => {
                                    const images = [...(block.config as GalleryBlockConfig).images]
                                    images[j] = { ...images[j], url: e.target.value }
                                    updateBlock(block.id, { images })
                                  }}
                                />
                                <button
                                  className="btn btn-ghost btn-icon"
                                  onClick={() => {
                                    const images = (block.config as GalleryBlockConfig).images.filter((_, k) => k !== j)
                                    updateBlock(block.id, { images })
                                  }}
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            ))}
                            <button
                              className="btn btn-ghost btn-sm"
                              onClick={() => {
                                const images = [...(block.config as GalleryBlockConfig).images, { id: crypto.randomUUID(), url: '' }]
                                updateBlock(block.id, { images })
                              }}
                            >
                              <Plus size={13} /> Add image
                            </button>
                          </>
                        )}

                        {block.type === 'media' && (
                          <>
                            <div className="inp-group">
                              <label className="inp-label">YouTube / Spotify / SoundCloud URL</label>
                              <input
                                className="inp"
                                placeholder="https://"
                                value={(block.config as MediaBlockConfig).url}
                                onChange={e => updateBlock(block.id, { url: e.target.value })}
                              />
                            </div>
                            <div className="inp-group">
                              <label className="inp-label">Caption (optional)</label>
                              <input
                                className="inp"
                                value={(block.config as MediaBlockConfig).caption ?? ''}
                                onChange={e => updateBlock(block.id, { caption: e.target.value })}
                              />
                            </div>
                          </>
                        )}

                        {block.type === 'featured' && (
                          <>
                            <div className="inp-group">
                              <label className="inp-label">Section title</label>
                              <input
                                className="inp"
                                placeholder="Featured"
                                value={(block.config as FeaturedBlockConfig).title ?? ''}
                                onChange={e => updateBlock(block.id, { title: e.target.value })}
                              />
                            </div>
                            {((block.config as FeaturedBlockConfig).items ?? []).map((item, j) => (
                              <div key={item.id} className="featured-item-row">
                                <input
                                  className="inp"
                                  placeholder="Label"
                                  value={item.label}
                                  onChange={e => {
                                    const items = [...(block.config as FeaturedBlockConfig).items]
                                    items[j] = { ...items[j], label: e.target.value }
                                    updateBlock(block.id, { items })
                                  }}
                                />
                                <input
                                  className="inp"
                                  placeholder="URL"
                                  value={item.url ?? ''}
                                  onChange={e => {
                                    const items = [...(block.config as FeaturedBlockConfig).items]
                                    items[j] = { ...items[j], url: e.target.value }
                                    updateBlock(block.id, { items })
                                  }}
                                />
                                <button
                                  className="btn btn-ghost btn-icon"
                                  onClick={() => {
                                    const items = (block.config as FeaturedBlockConfig).items.filter((_, k) => k !== j)
                                    updateBlock(block.id, { items })
                                  }}
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            ))}
                            <button
                              className="btn btn-ghost btn-sm"
                              onClick={() => {
                                const items = [...(block.config as FeaturedBlockConfig).items, { id: crypto.randomUUID(), label: '', url: '' }]
                                updateBlock(block.id, { items })
                              }}
                            >
                              <Plus size={13} /> Add item
                            </button>
                          </>
                        )}
                      </div>
                    ))}
                    {(profileDraft.layout ?? []).length === 0 && (
                      <p className="empty-state">No blocks yet. Add a status, media, or featured block above.</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* ── CRM ───────────────────────────────────────────── */}
        {section === 'crm' && (
          <>
            <div className="dash-topbar">
              <span className="dash-topbar-title">CRM</span>
              <div className="dash-topbar-actions">
                <button
                  className="btn btn-primary btn-sm"
                  onClick={() => { setShowNewContact(true); setContactDraft({ stage: 'lead', value: 0 }) }}
                >
                  <Plus size={14} /> New contact
                </button>
              </div>
            </div>
            <div className="dash-content">
              <div className="pipeline">
                {STAGES.map(stage => {
                  const cols = contacts.filter(c => c.stage === stage.k)
                  const total = cols.reduce((s, c) => s + (c.value ?? 0), 0)
                  return (
                    <div key={stage.k} className="pcol">
                      <div className="pcol-header">
                        <span className="pcol-dot" style={{ background: stage.color }} />
                        <span className="pcol-label">{stage.l}</span>
                        <span className="pcol-count">{cols.length}</span>
                        {total > 0 && <span className="pcol-total">${total.toLocaleString()}</span>}
                      </div>
                      <div className="pcol-cards">
                        {cols.map(c => (
                          <div
                            key={c.id}
                            className={`pcard${activeContact?.id === c.id ? ' active' : ''}`}
                            onClick={() => { setActiveContact(c); setContactDraft(c); setShowNewContact(false) }}
                          >
                            <div className="pcard-name">{c.name}</div>
                            {c.company && <div className="pcard-company">{c.company}</div>}
                            {c.value ? <div className="pcard-value">${c.value.toLocaleString()}</div> : null}
                          </div>
                        ))}
                        {cols.length === 0 && <p className="empty-state">Empty</p>}
                      </div>
                    </div>
                  )
                })}
              </div>

              {(activeContact || showNewContact) && (
                <div className="panel">
                  <div className="panel-header">
                    <span className="panel-title">{showNewContact ? 'New contact' : activeContact?.name}</span>
                    <div className="panel-actions">
                      <button className="btn btn-primary btn-sm" onClick={showNewContact ? createContact : saveContact} disabled={saving}>
                        <Save size={13} /> {saving ? '…' : 'Save'}
                      </button>
                      {!showNewContact && activeContact && (
                        <button className="btn btn-danger btn-sm" onClick={() => deleteContact(activeContact.id)}>
                          <Trash2 size={13} />
                        </button>
                      )}
                      <button className="btn btn-ghost btn-icon" onClick={() => { setActiveContact(null); setShowNewContact(false) }}>
                        <X size={15} />
                      </button>
                    </div>
                  </div>
                  <div className="panel-body">
                    <div className="panel-row">
                      <div className="inp-group">
                        <label className="inp-label">Name</label>
                        <input className="inp" value={contactDraft.name ?? ''} onChange={e => setContactDraft(p => ({ ...p, name: e.target.value }))} />
                      </div>
                      <div className="inp-group">
                        <label className="inp-label">Company</label>
                        <input className="inp" value={contactDraft.company ?? ''} onChange={e => setContactDraft(p => ({ ...p, company: e.target.value }))} />
                      </div>
                    </div>
                    <div className="panel-row">
                      <div className="inp-group">
                        <label className="inp-label">Stage</label>
                        <select className="inp" value={contactDraft.stage ?? 'lead'} onChange={e => setContactDraft(p => ({ ...p, stage: e.target.value as Contact['stage'] }))}>
                          {STAGES.map(s => <option key={s.k} value={s.k}>{s.l}</option>)}
                        </select>
                      </div>
                      <div className="inp-group">
                        <label className="inp-label">Deal value ($)</label>
                        <input className="inp" type="number" value={contactDraft.value ?? 0} onChange={e => setContactDraft(p => ({ ...p, value: Number(e.target.value) }))} />
                      </div>
                    </div>
                    <div className="panel-row">
                      <div className="inp-group">
                        <label className="inp-label">Email</label>
                        <input className="inp" type="email" value={contactDraft.email ?? ''} onChange={e => setContactDraft(p => ({ ...p, email: e.target.value }))} />
                      </div>
                      <div className="inp-group">
                        <label className="inp-label">Phone</label>
                        <input className="inp" value={contactDraft.phone ?? ''} onChange={e => setContactDraft(p => ({ ...p, phone: e.target.value }))} />
                      </div>
                    </div>
                    <div className="inp-group">
                      <label className="inp-label">Source</label>
                      <input className="inp" placeholder="How'd you meet?" value={contactDraft.source ?? ''} onChange={e => setContactDraft(p => ({ ...p, source: e.target.value }))} />
                    </div>
                    <div className="inp-group">
                      <label className="inp-label">Notes</label>
                      <textarea className="inp inp-ta" rows={4} value={contactDraft.notes ?? ''} onChange={e => setContactDraft(p => ({ ...p, notes: e.target.value }))} />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </>
        )}

        {/* ── Folders ───────────────────────────────────────── */}
        {section === 'folders' && (
          <>
            <div className="dash-topbar">
              <span className="dash-topbar-title">Folders</span>
              <div className="dash-topbar-actions">
                <button
                  className="btn btn-primary btn-sm"
                  onClick={() => { setShowNewFolder(true); setFolderDraft({ icon: '📁', color: '#00ffd1' }) }}
                >
                  <Plus size={14} /> New folder
                </button>
              </div>
            </div>
            <div className="dash-content">
              <div className="folder-grid">
                {folders.map(f => (
                  <div
                    key={f.id}
                    className={`folder-card${activeFolder?.id === f.id ? ' active' : ''}`}
                    style={{ borderTopColor: f.color }}
                    onClick={() => { setActiveFolder(f); setFolderDraft(f); setShowNewFolder(false) }}
                  >
                    <span className="folder-icon">{f.icon}</span>
                    <div>
                      <div className="folder-name">{f.name}</div>
                      {f.description && <div className="folder-desc">{f.description}</div>}
                    </div>
                  </div>
                ))}
                {folders.length === 0 && (
                  <div style={{ gridColumn: '1/-1' }}>
                    <p className="empty-state">No folders yet. Create one above.</p>
                  </div>
                )}
              </div>

              {(activeFolder || showNewFolder) && (
                <div className="panel">
                  <div className="panel-header">
                    <span className="panel-title">{showNewFolder ? 'New folder' : activeFolder?.name}</span>
                    <div className="panel-actions">
                      <button className="btn btn-primary btn-sm" onClick={showNewFolder ? createFolder : saveFolder} disabled={saving}>
                        <Save size={13} /> {saving ? '…' : 'Save'}
                      </button>
                      {!showNewFolder && activeFolder && (
                        <button className="btn btn-danger btn-sm" onClick={() => deleteFolder(activeFolder.id)}>
                          <Trash2 size={13} />
                        </button>
                      )}
                      <button className="btn btn-ghost btn-icon" onClick={() => { setActiveFolder(null); setShowNewFolder(false) }}>
                        <X size={15} />
                      </button>
                    </div>
                  </div>
                  <div className="panel-body">
                    <div className="inp-group">
                      <label className="inp-label">Name</label>
                      <input className="inp" value={folderDraft.name ?? ''} onChange={e => setFolderDraft(p => ({ ...p, name: e.target.value }))} />
                    </div>
                    <div className="inp-group">
                      <label className="inp-label">Description</label>
                      <input className="inp" value={folderDraft.description ?? ''} onChange={e => setFolderDraft(p => ({ ...p, description: e.target.value }))} />
                    </div>
                    <div className="inp-group">
                      <label className="inp-label">Icon</label>
                      <div className="icon-picker">
                        {FOLDER_ICONS.map(ic => (
                          <button key={ic} className={`icon-opt${folderDraft.icon === ic ? ' active' : ''}`} onClick={() => setFolderDraft(p => ({ ...p, icon: ic }))}>{ic}</button>
                        ))}
                      </div>
                    </div>
                    <div className="inp-group">
                      <label className="inp-label">Color</label>
                      <div className="color-picker">
                        {FOLDER_COLORS.map(cl => (
                          <button key={cl} className={`color-opt${folderDraft.color === cl ? ' active' : ''}`} style={{ background: cl }} onClick={() => setFolderDraft(p => ({ ...p, color: cl }))} />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </>
        )}

        {/* ── Notes ─────────────────────────────────────────── */}
        {section === 'notes' && (
          <>
            <div className="dash-topbar">
              <span className="dash-topbar-title">Notes</span>
              <div className="dash-topbar-actions">
                <button className="btn btn-primary btn-sm" onClick={createNote}>
                  <Plus size={14} /> New note
                </button>
              </div>
            </div>
            <div className="dash-content">
              <div className="notes-layout">
                <div className="notes-list">
                  {notes.map(n => (
                    <div
                      key={n.id}
                      className={`note-item${activeNote?.id === n.id ? ' active' : ''}`}
                      onClick={() => setActiveNote(n)}
                    >
                      <div className="note-item-title">{n.title || 'Untitled'}</div>
                      <div className="note-item-preview">{n.body?.slice(0, 60) || 'Empty'}</div>
                      <button className="note-delete" onClick={e => { e.stopPropagation(); deleteNote(n.id) }}>
                        <Trash2 size={12} />
                      </button>
                    </div>
                  ))}
                  {notes.length === 0 && <p className="empty-state">No notes yet.</p>}
                </div>
                {activeNote ? (
                  <div className="note-editor">
                    <input
                      className="inp note-title-inp"
                      placeholder="Title"
                      value={activeNote.title}
                      onChange={e => setActiveNote(n => n ? { ...n, title: e.target.value } : n)}
                      onBlur={saveNote}
                    />
                    <textarea
                      className="inp note-body-inp"
                      placeholder="Start writing…"
                      value={activeNote.body}
                      onChange={e => setActiveNote(n => n ? { ...n, body: e.target.value } : n)}
                      onBlur={saveNote}
                    />
                  </div>
                ) : (
                  <div className="note-editor">
                    <div className="empty-state-block">
                      <StickyNote size={36} style={{ color: 'var(--tx4)' }} />
                      <p>Select a note or create one</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {/* ── Calendar ──────────────────────────────────────── */}
        {section === 'calendar' && (
          <>
            <div className="dash-topbar">
              <span className="dash-topbar-title">Calendar</span>
            </div>
            <div className="dash-content">
              <div className="empty-state-block">
                <Calendar size={40} style={{ color: 'var(--tx3)' }} />
                <p>Calendar coming soon.</p>
              </div>
            </div>
          </>
        )}

        {/* ── Diary ─────────────────────────────────────────── */}
        {section === 'diary' && (
          <>
            <div className="dash-topbar">
              <span className="dash-topbar-title">Diary</span>
              <div className="dash-topbar-actions">
                <button className="btn btn-primary btn-sm" onClick={createDiaryEntry}>
                  <Plus size={14} /> New entry
                </button>
              </div>
            </div>
            <div className="dash-content">
              <div className="notes-layout">
                <div className="notes-list">
                  {diaryEntries.map(d => (
                    <div
                      key={d.id}
                      className={`note-item${activeDiary?.id === d.id ? ' active' : ''}`}
                      onClick={() => setActiveDiary(d)}
                    >
                      <div className="note-item-title">{d.date}</div>
                      <div className="note-item-preview">{d.body?.slice(0, 60) || 'Empty'}</div>
                    </div>
                  ))}
                  {diaryEntries.length === 0 && <p className="empty-state">No entries yet.</p>}
                </div>
                {activeDiary ? (
                  <div className="note-editor">
                    <div className="diary-date">{activeDiary.date}</div>
                    <textarea
                      className="inp note-body-inp"
                      placeholder="Write about your day…"
                      value={activeDiary.body}
                      onChange={e => setActiveDiary(d => d ? { ...d, body: e.target.value } : d)}
                      onBlur={saveDiary}
                    />
                  </div>
                ) : (
                  <div className="note-editor">
                    <div className="empty-state-block">
                      <BookOpen size={36} style={{ color: 'var(--tx4)' }} />
                      <p>Select an entry or create one</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </>
        )}

      </main>
    </div>
  )
}

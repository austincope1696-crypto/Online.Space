import { Social, Module, BlockType, LayoutBlock, BlockConfig } from './types'

export const BLOCK_TYPES: { k: BlockType; label: string; desc: string }[] = [
  { k: 'status',   label: 'Status badge', desc: 'Broadcast what you\'re open to right now — booking, hiring, sold out' },
  { k: 'about',    label: 'About',        desc: 'Work, education, interests — the Facebook-style info card' },
  { k: 'gallery',  label: 'Gallery',      desc: 'A photo grid — your favorite shots, jobs, or moments' },
  { k: 'media',    label: 'Media embed',  desc: 'Embed a song, video, or playlist — YouTube, Spotify, SoundCloud' },
  { k: 'featured', label: 'Featured',     desc: 'Spotlight your best work, people, or links — the modern Top 8' },
]

export function defaultBlockConfig(type: BlockType): BlockConfig {
  switch (type) {
    case 'status':   return { label: 'Open for business', emoji: '🟢' }
    case 'about':     return { work: '', education: '', interests: '' }
    case 'gallery':   return { title: 'Gallery', images: [] }
    case 'media':     return { url: '', caption: '' }
    case 'featured':  return { title: 'Featured', items: [] }
  }
}

export function newBlock(type: BlockType): LayoutBlock {
  return { id: crypto.randomUUID(), type, config: defaultBlockConfig(type) }
}

export const DEFAULT_SOCIALS: Social[] = [
  { p: 'Instagram',   k: 'instagram', url: '', pub: true },
  { p: 'TikTok',      k: 'tiktok',    url: '', pub: true },
  { p: 'YouTube',     k: 'youtube',   url: '', pub: true },
  { p: 'X / Twitter', k: 'twitter',   url: '', pub: true },
  { p: 'LinkedIn',    k: 'linkedin',  url: '', pub: true },
  { p: 'Facebook',    k: 'facebook',  url: '', pub: false },
]

export const STAGES = [
  { k: 'lead',     l: 'Lead',       color: '#94a3b8' },
  { k: 'prospect', l: 'Prospect',   color: '#f59e0b' },
  { k: 'active',   l: 'Active',     color: '#00ffd1' },
  { k: 'closed',   l: 'Closed Won', color: '#22c55e' },
  { k: 'lost',     l: 'Lost',       color: '#ef4444' },
] as const

export const FOLDER_ICONS = ['📁','☀️','🏠','🎬','💼','📊','🎯','⚡','🔥','💡','🌱','🔑','📋','🏗️','💰']
export const FOLDER_COLORS = ['#00ffd1','#7c3aed','#f59e0b','#ef4444','#22c55e','#3b82f6','#ec4899','#f97316']

export const MODULE_OPTIONS: { k: Module; label: string; desc: string; soon?: boolean }[] = [
  { k: 'crm',      label: 'CRM',      desc: 'Track contacts, leads, and deals in a pipeline' },
  { k: 'folders',  label: 'Folders',  desc: 'Organize projects, jobs, and business lanes' },
  { k: 'notes',    label: 'Notes',    desc: 'Capture ideas and quick thoughts' },
  { k: 'calendar', label: 'Calendar', desc: 'Schedule events and follow-ups', soon: true },
  { k: 'diary',    label: 'Diary',    desc: 'Private daily journal and reflections' },
]

export const TEMPLATES = {
  solar: {
    folders: [
      { name: 'Pipeline',        icon: '📊', color: '#00ffd1', category: 'solar',      description: 'Active leads and prospects' },
      { name: 'Active Installs', icon: '☀️', color: '#f59e0b', category: 'solar',      description: 'Jobs currently in progress' },
      { name: 'Completed Jobs',  icon: '✅', color: '#22c55e', category: 'solar',      description: 'Installed and paid' },
      { name: 'Subcontractors',  icon: '🔧', color: '#7c3aed', category: 'solar',      description: 'Crew and partners' },
    ],
    contacts: [
      { name: 'Sample Lead',      company: 'Homeowner',      stage: 'lead',   source: 'Door knock',  value: 8500, notes: '3BR home, 8kW system interest' },
      { name: 'Referral Partner', company: 'Local HVAC Co.', stage: 'active', source: 'Networking',  value: 0,    notes: 'Sends referrals' },
    ],
  },
  realestate: {
    folders: [
      { name: 'Active Listings', icon: '🏠', color: '#00ffd1', category: 'realestate', description: 'Properties on market' },
      { name: 'Buyer Clients',   icon: '🔑', color: '#f59e0b', category: 'realestate', description: 'Active buyer clients' },
      { name: 'Wholesale Deals', icon: '💰', color: '#22c55e', category: 'realestate', description: 'Off-market opportunities' },
      { name: 'Closed Deals',    icon: '📋', color: '#7c3aed', category: 'realestate', description: 'Completed transactions' },
    ],
    contacts: [
      { name: 'Sample Buyer',    company: '', stage: 'prospect', source: 'Referral',   value: 350000, notes: 'Pre-approved, 3BR metro area' },
      { name: 'Motivated Seller',company: '', stage: 'lead',     source: 'Cold call',  value: 425000, notes: 'Inherited property' },
    ],
  },
  content: {
    folders: [
      { name: 'Brand Deals',      icon: '💼', color: '#f59e0b', category: 'content',    description: 'Sponsorships and partnerships' },
      { name: 'Content Calendar', icon: '📅', color: '#00ffd1', category: 'content',    description: 'Upcoming content schedule' },
      { name: 'Scripts & Ideas',  icon: '💡', color: '#7c3aed', category: 'content',    description: 'Content ideas and drafts' },
      { name: 'Analytics',        icon: '📈', color: '#22c55e', category: 'content',    description: 'Platform performance' },
    ],
    contacts: [
      { name: 'Brand Partner',  company: 'Tech Company',  stage: 'prospect', source: 'DM',    value: 2500, notes: '2 posts + story deal' },
      { name: 'Agency Contact', company: 'Talent Agency', stage: 'lead',     source: 'Email', value: 0,    notes: 'Inquired about management' },
    ],
  },
}

export type Module = 'crm' | 'folders' | 'notes' | 'calendar' | 'diary'

export interface Social {
  p: string
  k: string
  url: string
  pub: boolean
}

export interface Link {
  id: string
  label: string
  url: string
  icon?: string
}

export interface Contact {
  id: string
  user_id: string
  name: string
  company?: string
  email?: string
  phone?: string
  stage: 'lead' | 'prospect' | 'active' | 'closed' | 'lost'
  value?: number
  source?: string
  notes?: string
  tags?: string[]
  created_at: string
  updated_at?: string
}

export interface Folder {
  id: string
  user_id: string
  name: string
  icon?: string
  color?: string
  description?: string
  category?: string
  created_at: string
}

export type BlockType = 'status' | 'media' | 'featured'

export interface StatusBlockConfig {
  label: string
  emoji?: string
  color?: string
}

export interface MediaBlockConfig {
  url: string
  caption?: string
}

export interface FeaturedItem {
  id: string
  label: string
  subtitle?: string
  url?: string
  image?: string
}

export interface FeaturedBlockConfig {
  title?: string
  items: FeaturedItem[]
}

export type BlockConfig = StatusBlockConfig | MediaBlockConfig | FeaturedBlockConfig

export interface LayoutBlock {
  id: string
  type: BlockType
  config: BlockConfig
}

export interface Space {
  id: string
  user_id: string
  username: string
  display_name?: string
  bio?: string
  location?: string
  website?: string
  avatar_url?: string
  cover_url?: string
  accent_color?: string
  layout?: LayoutBlock[]
  socials?: Social[]
  links?: Link[]
  modules?: Module[]
  theme?: string
  created_at?: string
  updated_at?: string
}

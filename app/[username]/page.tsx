import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import type { Metadata } from 'next'
import { Globe, MapPin, ExternalLink, Zap } from 'lucide-react'
import ProfileBlocks from '@/components/ProfileBlocks'
import type { LayoutBlock } from '@/lib/types'

interface Props {
  params: Promise<{ username: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { username } = await params
  const supabase = await createClient()
  const { data } = await supabase
    .from('spaces')
    .select('display_name, bio')
    .eq('username', username)
    .maybeSingle()

  if (!data) return { title: 'Not found' }

  return {
    title: `${data.display_name ?? username} — space.online`,
    description: data.bio ?? `${username}'s space`,
  }
}

const SOCIAL_ICONS: Record<string, string> = {
  instagram: 'IG',
  tiktok:    'TK',
  youtube:   'YT',
  twitter:   'X',
  linkedin:  'LI',
  facebook:  'FB',
}

export default async function PublicProfilePage({ params }: Props) {
  const { username } = await params
  const supabase = await createClient()

  const { data: space } = await supabase
    .from('spaces')
    .select('display_name, bio, location, website, socials, links, theme, avatar_url, cover_url, accent_color, layout')
    .eq('username', username)
    .maybeSingle()

  if (!space) notFound()

  const socials = (space.socials ?? []).filter((s: { url: string; pub: boolean }) => s.url && s.pub !== false)
  const links   = (space.links   ?? []).filter((l: { url: string }) => l.url)
  const accent  = space.accent_color || '#00ffd1'

  return (
    <div className="pub-page" style={{ '--accent': accent } as React.CSSProperties}>
      {space.cover_url ? (
        <div className="pub-cover" style={{ backgroundImage: `url(${space.cover_url})` }} />
      ) : (
        <div className="pub-cover pub-cover-fallback" />
      )}

      <div className="pub-card">
        {space.avatar_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={space.avatar_url} alt={space.display_name ?? username} className="pub-avatar pub-avatar-img" />
        ) : (
          <div className="pub-avatar">
            {(space.display_name ?? username).charAt(0).toUpperCase()}
          </div>
        )}

        <h1 className="pub-name">{space.display_name ?? username}</h1>

        {space.bio && <p className="pub-bio">{space.bio}</p>}

        {(space.location || space.website) && (
          <div className="pub-meta">
            {space.location && (
              <span className="pub-meta-item">
                <MapPin size={13} /> {space.location}
              </span>
            )}
            {space.website && (
              <a
                href={space.website}
                target="_blank"
                rel="noopener noreferrer"
                className="pub-meta-item pub-meta-link"
              >
                <Globe size={13} /> {space.website.replace(/^https?:\/\//, '')}
              </a>
            )}
          </div>
        )}

        {socials.length > 0 && (
          <div className="pub-socials">
            {socials.map((s: { k: string; p: string; url: string }) => (
              <a
                key={s.k}
                href={s.url}
                target="_blank"
                rel="noopener noreferrer"
                className="pub-social-btn"
                title={s.p}
              >
                {SOCIAL_ICONS[s.k] ?? s.k.slice(0, 2).toUpperCase()}
              </a>
            ))}
          </div>
        )}

        <ProfileBlocks blocks={(space.layout ?? []) as LayoutBlock[]} />

        {links.length > 0 && (
          <div className="pub-links">
            {links.map((l: { id: string; label: string; url: string }) => (
              <a
                key={l.id}
                href={l.url}
                target="_blank"
                rel="noopener noreferrer"
                className="pub-link-btn"
              >
                {l.label || l.url}
                <ExternalLink size={13} />
              </a>
            ))}
          </div>
        )}

        <div className="pub-footer">
          <a href="/" className="pub-brand">
            <Zap size={11} /> space.online
          </a>
        </div>
      </div>
    </div>
  )
}

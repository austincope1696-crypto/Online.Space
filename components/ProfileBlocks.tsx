import { ExternalLink, Briefcase, GraduationCap, Sparkles } from 'lucide-react'
import type { LayoutBlock, StatusBlockConfig, MediaBlockConfig, FeaturedBlockConfig, AboutBlockConfig, GalleryBlockConfig } from '@/lib/types'

function embedUrl(url: string): { src: string; aspect: 'video' | 'audio' } | null {
  const yt = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]+)/)
  if (yt) return { src: `https://www.youtube.com/embed/${yt[1]}`, aspect: 'video' }

  const spotify = url.match(/open\.spotify\.com\/(track|album|playlist|episode|show)\/([\w]+)/)
  if (spotify) return { src: `https://open.spotify.com/embed/${spotify[1]}/${spotify[2]}`, aspect: 'audio' }

  const soundcloud = url.includes('soundcloud.com')
  if (soundcloud) return { src: `https://w.soundcloud.com/player/?url=${encodeURIComponent(url)}&color=%2300ffd1`, aspect: 'audio' }

  return null
}

export default function ProfileBlocks({ blocks }: { blocks: LayoutBlock[] }) {
  if (!blocks || blocks.length === 0) return null

  return (
    <div className="pub-blocks">
      {blocks.map(b => {
        if (b.type === 'status') {
          const cfg = b.config as StatusBlockConfig
          if (!cfg.label) return null
          return (
            <div key={b.id} className="pub-status-badge" style={{ borderColor: cfg.color || undefined }}>
              {cfg.emoji && <span>{cfg.emoji}</span>}
              {cfg.label}
            </div>
          )
        }

        if (b.type === 'about') {
          const cfg = b.config as AboutBlockConfig
          if (!cfg.work && !cfg.education && !cfg.interests) return null
          return (
            <div key={b.id} className="pub-about-block">
              <div className="pub-block-caption">About</div>
              {cfg.work && (
                <div className="pub-about-row"><Briefcase size={14} /> {cfg.work}</div>
              )}
              {cfg.education && (
                <div className="pub-about-row"><GraduationCap size={14} /> {cfg.education}</div>
              )}
              {cfg.interests && (
                <div className="pub-about-row"><Sparkles size={14} /> {cfg.interests}</div>
              )}
            </div>
          )
        }

        if (b.type === 'gallery') {
          const cfg = b.config as GalleryBlockConfig
          if (!cfg.images?.length) return null
          return (
            <div key={b.id} className="pub-gallery-block">
              {cfg.title && <div className="pub-block-caption">{cfg.title}</div>}
              <div className="pub-gallery-grid">
                {cfg.images.map(img => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img key={img.id} src={img.url} alt={img.caption || ''} className="pub-gallery-img" />
                ))}
              </div>
            </div>
          )
        }

        if (b.type === 'media') {
          const cfg = b.config as MediaBlockConfig
          if (!cfg.url) return null
          const embed = embedUrl(cfg.url)
          return (
            <div key={b.id} className="pub-media-block">
              {cfg.caption && <div className="pub-block-caption">{cfg.caption}</div>}
              {embed ? (
                <iframe
                  src={embed.src}
                  className={embed.aspect === 'video' ? 'pub-media-frame video' : 'pub-media-frame audio'}
                  allow="autoplay; encrypted-media"
                  loading="lazy"
                />
              ) : (
                <a href={cfg.url} target="_blank" rel="noopener noreferrer" className="pub-link-btn">
                  {cfg.caption || 'Listen / watch'} <ExternalLink size={13} />
                </a>
              )}
            </div>
          )
        }

        if (b.type === 'featured') {
          const cfg = b.config as FeaturedBlockConfig
          if (!cfg.items?.length) return null
          return (
            <div key={b.id} className="pub-featured-block">
              {cfg.title && <div className="pub-block-caption">{cfg.title}</div>}
              <div className="pub-featured-grid">
                {cfg.items.map(item => (
                  <a
                    key={item.id}
                    href={item.url || undefined}
                    target={item.url ? '_blank' : undefined}
                    rel="noopener noreferrer"
                    className="pub-featured-card"
                  >
                    {item.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={item.image} alt={item.label} className="pub-featured-img" />
                    ) : (
                      <div className="pub-featured-img pub-featured-img-fallback">{item.label.charAt(0).toUpperCase()}</div>
                    )}
                    <div className="pub-featured-label">{item.label}</div>
                    {item.subtitle && <div className="pub-featured-subtitle">{item.subtitle}</div>}
                  </a>
                ))}
              </div>
            </div>
          )
        }

        return null
      })}
    </div>
  )
}

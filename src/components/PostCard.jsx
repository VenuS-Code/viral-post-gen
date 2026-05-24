import { useState } from 'react'

const S = {
  card: {
    borderRadius: 20,
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    boxShadow: '0 8px 40px rgba(0,0,0,0.5)',
    transition: 'transform 0.25s ease, box-shadow 0.25s ease',
  },
  visual: (g1, g2) => ({
    background: `linear-gradient(145deg, ${g1} 0%, ${g2} 100%)`,
    padding: '28px 26px 24px',
    minHeight: 300,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    position: 'relative',
    overflow: 'hidden',
    cursor: 'default',
  }),
  blob1: {
    position: 'absolute', top: -50, right: -50,
    width: 200, height: 200, borderRadius: '50%',
    background: 'rgba(255,255,255,0.12)',
    pointerEvents: 'none',
  },
  blob2: {
    position: 'absolute', bottom: -40, left: -40,
    width: 160, height: 160, borderRadius: '50%',
    background: 'rgba(0,0,0,0.12)',
    pointerEvents: 'none',
  },
  badge: {
    display: 'inline-flex', alignItems: 'center', gap: 6,
    background: 'rgba(255,255,255,0.22)',
    backdropFilter: 'blur(8px)',
    borderRadius: 30, padding: '4px 14px',
    color: 'rgba(255,255,255,0.95)',
    fontSize: 11, fontWeight: 700, letterSpacing: 1.2,
    textTransform: 'uppercase', width: 'fit-content',
    marginBottom: 16, fontFamily: 'DM Sans, sans-serif',
  },
  headline: {
    color: '#fff',
    fontSize: '1.35rem',
    fontWeight: 800,
    lineHeight: 1.3,
    fontFamily: 'Syne, sans-serif',
    textShadow: '0 2px 12px rgba(0,0,0,0.25)',
    marginBottom: 14,
    zIndex: 1, position: 'relative',
  },
  bodyText: {
    color: 'rgba(255,255,255,0.88)',
    fontSize: '0.88rem',
    lineHeight: 1.75,
    fontFamily: 'DM Sans, sans-serif',
    fontWeight: 300,
    zIndex: 1, position: 'relative',
    overflow: 'hidden',
    display: '-webkit-box',
    WebkitBoxOrient: 'vertical',
  },
  nicheTag: {
    marginTop: 18,
    background: 'rgba(0,0,0,0.2)',
    borderRadius: 30, padding: '3px 12px',
    color: 'rgba(255,255,255,0.7)',
    fontSize: 10, width: 'fit-content',
    letterSpacing: 1.5, textTransform: 'uppercase',
    fontFamily: 'DM Sans, sans-serif',
    zIndex: 1, position: 'relative',
  },
  actions: {
    background: '#111827',
    display: 'flex',
    borderTop: '1px solid rgba(255,255,255,0.05)',
  },
  btn: (color, border) => ({
    flex: 1, padding: '11px 8px',
    background: 'transparent', border: 'none',
    color, cursor: 'pointer',
    fontSize: 12, fontWeight: 600,
    fontFamily: 'DM Sans, sans-serif',
    transition: 'background 0.15s',
    borderRight: border ? '1px solid rgba(255,255,255,0.06)' : 'none',
    letterSpacing: 0.3,
  }),
}

export default function PostCard({ post, index, g1, g2, niche }) {
  const [copied, setCopied] = useState(false)
  const [expanded, setExpanded] = useState(false)
  const [hovered, setHovered] = useState(false)

  const copy = () => {
    navigator.clipboard.writeText(post.body)
    setCopied(true)
    setTimeout(() => setCopied(false), 1800)
  }

  return (
    <div
      style={{
        ...S.card,
        transform: hovered ? 'translateY(-4px)' : 'none',
        boxShadow: hovered
          ? `0 20px 60px rgba(0,0,0,0.6), 0 0 0 1px ${g1}55`
          : '0 8px 40px rgba(0,0,0,0.5)',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Visual Card */}
      <div style={S.visual(g1, g2)}>
        <div style={S.blob1} />
        <div style={S.blob2} />

        <div>
          <div style={S.badge}>
            <span style={{ opacity: 0.7 }}>✦</span> Post {index + 1}
          </div>
          <h3 style={S.headline}>{post.headline}</h3>
          <p style={{ ...S.bodyText, WebkitLineClamp: expanded ? 99 : 4 }}>
            {post.body}
          </p>
        </div>

        <div style={{ display: 'flex', gap: 8, marginTop: 18, flexWrap: 'wrap', zIndex: 1, position: 'relative' }}>
          <div style={S.nicheTag}>#{niche.toLowerCase()}</div>
          <div style={{ ...S.nicheTag, background: 'rgba(16,185,129,0.25)', color: 'rgba(167,243,208,0.9)', letterSpacing: 1 }}>
            ✓ Monetization Safe
          </div>
        </div>
      </div>

      {/* Action bar */}
      <div style={S.actions}>
        <button style={S.btn('#a5b4fc', true)} onClick={copy}>
          {copied ? '✓ Copied!' : '📋 Copy Text'}
        </button>
        <button style={S.btn('#67e8f9', true)} onClick={() => setExpanded(e => !e)}>
          {expanded ? '△ Collapse' : '▽ Full Post'}
        </button>
        <button
          style={S.btn('#86efac', false)}
          onClick={() => {
            const blob = new Blob([post.body], { type: 'text/plain' })
            const a = document.createElement('a')
            a.href = URL.createObjectURL(blob)
            a.download = `post-${index + 1}-${niche}.txt`
            a.click()
          }}
        >
          ↓ Save
        </button>
      </div>
    </div>
  )
}

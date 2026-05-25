import { useState, useRef } from 'react'
import html2canvas from 'html2canvas'

// Font loaded in index.html — Bebas Neue for headline, Nunito for body
const FONT_URL = 'https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Nunito:wght@400;600;700;800&display=swap'

export default function PostCard({ post, index, g1, g2, niche, onCardRef }) {
  const [copied, setCopied]     = useState(false)
  const [expanded, setExpanded] = useState(false)
  const [hovered, setHovered]   = useState(false)
  const [downloading, setDownloading] = useState(false)
  const cardRef = useRef(null)

  const copy = () => {
    navigator.clipboard.writeText(post.body)
    setCopied(true)
    setTimeout(() => setCopied(false), 1800)
  }

  const downloadImage = async () => {
    if (!cardRef.current || downloading) return
    setDownloading(true)
    try {
      // Temporarily expand so full text is visible in the image
      cardRef.current.style.webkitLineClamp = 'unset'
      cardRef.current.style.overflow = 'visible'

      const canvas = await html2canvas(cardRef.current, {
        scale: 3,           // high-res export
        useCORS: true,
        allowTaint: true,
        backgroundColor: null,
        logging: false,
      })

      // Restore clamp
      cardRef.current.style.webkitLineClamp = ''
      cardRef.current.style.overflow = ''

      const link = document.createElement('a')
      link.download = `post-${index + 1}-${niche.replace(/\s+/g, '-')}.png`
      link.href = canvas.toDataURL('image/png')
      link.click()
    } catch (e) {
      console.error(e)
    }
    setDownloading(false)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>

      {/* ── Square Social-Media Card ── */}
      <div
        ref={el => { cardRef.current = el; onCardRef && onCardRef(el) }}
        style={{
          width: '100%',
          aspectRatio: '1 / 1',
          background: `linear-gradient(145deg, ${g1} 0%, ${g2} 100%)`,
          borderRadius: '18px 18px 0 0',
          position: 'relative',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '28px 26px 22px',
          boxSizing: 'border-box',
          cursor: 'default',
          transition: 'transform 0.25s, box-shadow 0.25s',
          transform: hovered ? 'translateY(-4px)' : 'none',
          boxShadow: hovered
            ? `0 24px 60px rgba(0,0,0,0.55), 0 0 0 1.5px ${g1}66`
            : '0 8px 32px rgba(0,0,0,0.45)',
        }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        {/* Background blobs */}
        <div style={{
          position: 'absolute', top: -60, right: -60,
          width: 240, height: 240, borderRadius: '50%',
          background: 'rgba(255,255,255,0.13)', pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute', bottom: -50, left: -50,
          width: 200, height: 200, borderRadius: '50%',
          background: 'rgba(0,0,0,0.13)', pointerEvents: 'none',
        }} />
        {/* Small decorative circle */}
        <div style={{
          position: 'absolute', top: '42%', right: -20,
          width: 100, height: 100, borderRadius: '50%',
          background: 'rgba(255,255,255,0.07)', pointerEvents: 'none',
        }} />

        {/* Top row: post badge + niche */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 1 }}>
          <div style={{
            background: 'rgba(255,255,255,0.22)',
            backdropFilter: 'blur(8px)',
            borderRadius: 30, padding: '4px 14px',
            color: 'rgba(255,255,255,0.95)',
            fontSize: 11, fontWeight: 700,
            letterSpacing: 1.4, textTransform: 'uppercase',
            fontFamily: 'Nunito, sans-serif',
          }}>
            ✦ POST {index + 1}
          </div>
          <div style={{
            background: 'rgba(0,0,0,0.18)',
            borderRadius: 30, padding: '4px 12px',
            color: 'rgba(255,255,255,0.75)',
            fontSize: 10, letterSpacing: 1.4,
            textTransform: 'uppercase',
            fontFamily: 'Nunito, sans-serif',
          }}>
            #{niche.toLowerCase()}
          </div>
        </div>

        {/* Headline — Bebas Neue large display font */}
        <div style={{ zIndex: 1, flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '14px 0 10px' }}>
          <h3 style={{
            fontFamily: '"Bebas Neue", cursive',
            fontSize: 'clamp(1.8rem, 6vw, 2.6rem)',
            fontWeight: 400,
            letterSpacing: 2,
            color: '#fff',
            textShadow: '0 3px 16px rgba(0,0,0,0.3)',
            margin: '0 0 14px',
            lineHeight: 1.1,
            textTransform: 'uppercase',
          }}>
            {post.headline}
          </h3>

          {/* Body text */}
          <p
            style={{
              fontFamily: 'Nunito, sans-serif',
              color: 'rgba(255,255,255,0.9)',
              fontSize: '0.82rem',
              lineHeight: 1.8,
              margin: 0,
              fontWeight: 600,
              whiteSpace: 'pre-line',
              display: '-webkit-box',
              WebkitBoxOrient: 'vertical',
              WebkitLineClamp: expanded ? 99 : 5,
              overflow: 'hidden',
            }}
          >
            {post.body}
          </p>
        </div>

        {/* Bottom: monetization badge */}
        <div style={{
          zIndex: 1,
          display: 'flex', alignItems: 'center', gap: 6,
        }}>
          <div style={{
            background: 'rgba(16,185,129,0.28)',
            borderRadius: 30, padding: '3px 11px',
            color: 'rgba(167,243,208,0.95)',
            fontSize: 10, letterSpacing: 1.2,
            textTransform: 'uppercase',
            fontFamily: 'Nunito, sans-serif',
            fontWeight: 700,
          }}>
            ✓ Monetization Safe
          </div>
        </div>
      </div>

      {/* ── Action Bar ── */}
      <div style={{
        background: '#0f1724',
        borderRadius: '0 0 18px 18px',
        border: '1px solid rgba(255,255,255,0.06)',
        borderTop: 'none',
        display: 'flex',
        overflow: 'hidden',
      }}>
        {[
          { label: copied ? '✓ Copied!' : '📋 Copy', color: '#a5b4fc', action: copy, border: true },
          { label: expanded ? '△ Less' : '▽ More',   color: '#67e8f9', action: () => setExpanded(e => !e), border: true },
          { label: downloading ? '⏳ Saving…' : '⬇ Download PNG', color: '#86efac', action: downloadImage, border: false },
        ].map(({ label, color, action, border }) => (
          <button
            key={label}
            onClick={action}
            style={{
              flex: 1, padding: '12px 6px',
              background: 'transparent', border: 'none',
              borderRight: border ? '1px solid rgba(255,255,255,0.06)' : 'none',
              color, cursor: 'pointer',
              fontSize: 12, fontWeight: 700,
              fontFamily: 'Nunito, sans-serif',
              letterSpacing: 0.3,
              transition: 'background 0.15s',
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.04)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  )
}

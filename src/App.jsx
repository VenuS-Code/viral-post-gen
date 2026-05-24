import { useState, useEffect } from 'react'
import PostCard from './components/PostCard.jsx'

// 10 distinct gradient pairs — one per card
const PALETTES = [
  ['#f953c6', '#b91d73'],
  ['#00c6ff', '#0072ff'],
  ['#f7971e', '#ffd200'],
  ['#56ab2f', '#a8e063'],
  ['#8e2de2', '#4a00e0'],
  ['#f64f59', '#c471ed'],
  ['#11998e', '#38ef7d'],
  ['#fc466b', '#3f5efb'],
  ['#e96c0c', '#ff6b6b'],
  ['#614385', '#516395'],
]

// ── Reddit public JSON (no API key needed) ──────────────────────────────────
async function fetchRedditPosts(niche) {
  const encoded = encodeURIComponent(niche)
  const url = `https://www.reddit.com/search.json?q=${encoded}&sort=top&t=month&limit=25&type=link`
  const res = await fetch(url, { headers: { 'Accept': 'application/json' } })
  if (!res.ok) throw new Error('Reddit fetch failed')
  const data = await res.json()
  return data.data.children
    .filter(p => p.data.score > 10)
    .slice(0, 15)
    .map(p => ({
      title: p.data.title,
      body: (p.data.selftext || '').slice(0, 400),
      score: p.data.score,
    }))
}

// ── Claude API (Anthropic) ──────────────────────────────────────────────────
async function generateWithClaude(niche, redditPosts, apiKey) {
  const postsContext = redditPosts
    .slice(0, 12)
    .map((p, i) => `${i + 1}. [Score: ${p.score}] "${p.title}"${p.body ? `\n   Details: "${p.body}"` : ''}`)
    .join('\n\n')

  const prompt = `You are a professional Facebook content creator and monetization expert specializing in the "${niche}" niche. Your posts must pass Facebook's Partner Monetization Policy and Content Monetization Policy.

TREND RESEARCH (use as topic inspiration ONLY — never copy or paraphrase):
${postsContext}

YOUR TASK: Write 10 ORIGINAL, monetization-safe Facebook posts on trending "${niche}" topics.

━━━ FACEBOOK MONETIZATION RULES — STRICTLY FOLLOW ━━━

✅ REQUIRED:
- 100% original writing (inspired by trends, never copied)
- Genuine value: teach something, share a real insight, tell a relatable story, or entertain
- Conversational, authentic tone — like a knowledgeable friend sharing advice
- Natural open-ended question at the end to invite comments (not bait)
- Emojis used sparingly and naturally (2–4 per post max)
- Line breaks for readability

❌ STRICTLY FORBIDDEN (will get page demonetized):
- Engagement bait: "Like if you agree", "Share this", "Tag someone who...", "Comment YES if..."
- Clickbait or exaggerated claims: "You won't believe...", "SHOCKING:", "This will change your life"
- Sensationalism or fear-mongering
- Misleading or unverifiable health/financial claims
- Recycled or copied content from other sources
- Overly promotional or salesy language
- Political or divisive content

━━━ POST VARIETY (make each one different) ━━━
Mix these formats across the 10 posts:
- Practical tip or how-to (2 posts)
- Personal story / relatable experience (2 posts)
- Surprising but verified fact or statistic (1 post)
- Common myth debunked with facts (1 post)
- Short list of genuine insights (2 posts)
- Motivational/mindset angle with real substance (1 post)
- Question-led discussion starter (1 post)

Respond ONLY with a valid JSON array — no explanation, no markdown, no preamble:
[
  {
    "headline": "Clear 5-8 word title that describes the post (no clickbait)",
    "body": "First line that earns attention naturally\\n\\nValue-packed body content\\n\\nEnds with a genuine open question?"
  }
]

Generate exactly 10 objects.`

  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      max_tokens: 4096,
      messages: [{ role: 'user', content: prompt }],
    }),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err?.error?.message || `API error ${res.status}`)
  }

  const data = await res.json()
  const text = data.choices?.[0]?.message?.content || ''
  const clean = text.replace(/^```json\s*/i, '').replace(/```\s*$/i, '').trim()
  return JSON.parse(clean)
}

// ── Styles ──────────────────────────────────────────────────────────────────
const css = {
  root: {
    minHeight: '100vh',
    background: '#060912',
    fontFamily: 'DM Sans, sans-serif',
    color: '#e2e8f0',
  },
  // Animated gradient header
  hero: {
    background: 'linear-gradient(135deg, #0d1117 0%, #161b2e 50%, #0d1117 100%)',
    borderBottom: '1px solid rgba(255,255,255,0.06)',
    padding: '48px 24px 40px',
    textAlign: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  heroGlow: {
    position: 'absolute',
    top: '50%', left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 600, height: 300,
    background: 'radial-gradient(ellipse, rgba(99,102,241,0.15) 0%, transparent 70%)',
    pointerEvents: 'none',
  },
  heroTitle: {
    fontFamily: 'Syne, sans-serif',
    fontSize: 'clamp(1.8rem, 5vw, 3rem)',
    fontWeight: 800,
    color: '#f1f5f9',
    letterSpacing: -1,
    position: 'relative',
    zIndex: 1,
  },
  heroAccent: {
    background: 'linear-gradient(90deg, #818cf8, #38bdf8)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  },
  heroSub: {
    marginTop: 10,
    color: '#64748b',
    fontSize: '1rem',
    fontWeight: 400,
    position: 'relative',
    zIndex: 1,
  },
  main: {
    maxWidth: 1240,
    margin: '0 auto',
    padding: '36px 20px 60px',
  },
  searchRow: {
    display: 'flex',
    gap: 10,
    marginBottom: 12,
    flexWrap: 'wrap',
  },
  input: {
    flex: 1,
    minWidth: 200,
    padding: '14px 20px',
    background: '#0d1117',
    border: '1.5px solid #1e293b',
    borderRadius: 12,
    color: '#f1f5f9',
    fontSize: '1rem',
    fontFamily: 'DM Sans, sans-serif',
    outline: 'none',
    transition: 'border-color 0.2s',
  },
  generateBtn: (loading) => ({
    padding: '14px 28px',
    background: loading
      ? '#1e293b'
      : 'linear-gradient(135deg, #6366f1 0%, #38bdf8 100%)',
    color: loading ? '#475569' : '#fff',
    border: 'none',
    borderRadius: 12,
    fontSize: '0.95rem',
    fontWeight: 700,
    fontFamily: 'Syne, sans-serif',
    cursor: loading ? 'not-allowed' : 'pointer',
    whiteSpace: 'nowrap',
    letterSpacing: 0.3,
    transition: 'opacity 0.2s',
  }),
  keyBtn: {
    padding: '14px 18px',
    background: '#0d1117',
    border: '1.5px solid #1e293b',
    borderRadius: 12,
    color: '#94a3b8',
    fontSize: '0.85rem',
    cursor: 'pointer',
    fontFamily: 'DM Sans, sans-serif',
    whiteSpace: 'nowrap',
  },
  statusBox: {
    textAlign: 'center',
    padding: '60px 20px',
  },
  spinner: {
    display: 'inline-block',
    width: 36, height: 36,
    border: '3px solid #1e293b',
    borderTop: '3px solid #6366f1',
    borderRadius: '50%',
    animation: 'spin 0.8s linear infinite',
    marginBottom: 16,
  },
  statusText: {
    color: '#6366f1',
    fontSize: '1.05rem',
    fontFamily: 'DM Sans, sans-serif',
  },
  errorBox: {
    background: '#1a0a0a',
    border: '1px solid #7f1d1d',
    borderRadius: 10,
    padding: '12px 18px',
    color: '#fca5a5',
    fontSize: '0.9rem',
    marginBottom: 20,
  },
  resultsHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 28,
    flexWrap: 'wrap',
    gap: 12,
  },
  resultsTitle: {
    fontFamily: 'Syne, sans-serif',
    fontSize: '1.25rem',
    fontWeight: 700,
    color: '#f1f5f9',
  },
  regenBtn: {
    padding: '9px 18px',
    background: 'transparent',
    border: '1.5px solid #1e293b',
    borderRadius: 10,
    color: '#818cf8',
    cursor: 'pointer',
    fontSize: '0.85rem',
    fontFamily: 'DM Sans, sans-serif',
    fontWeight: 600,
    transition: 'border-color 0.2s, color 0.2s',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(310px, 1fr))',
    gap: 22,
  },
  // API key modal
  overlay: {
    position: 'fixed', inset: 0,
    background: 'rgba(0,0,0,0.85)',
    backdropFilter: 'blur(6px)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    zIndex: 200,
  },
  modal: {
    background: '#0d1117',
    border: '1px solid #1e293b',
    borderRadius: 20,
    padding: '32px 28px',
    width: '90%', maxWidth: 440,
    boxShadow: '0 24px 80px rgba(0,0,0,0.7)',
  },
  modalTitle: {
    fontFamily: 'Syne, sans-serif',
    fontSize: '1.2rem', fontWeight: 700,
    color: '#f1f5f9', marginBottom: 8,
  },
  modalSub: {
    color: '#64748b', fontSize: '0.85rem',
    lineHeight: 1.6, marginBottom: 20,
  },
  modalInput: {
    width: '100%',
    padding: '12px 16px',
    background: '#060912',
    border: '1.5px solid #1e293b',
    borderRadius: 10,
    color: '#f1f5f9',
    fontSize: '0.95rem',
    fontFamily: 'DM Sans, sans-serif',
    outline: 'none',
    boxSizing: 'border-box',
  },
  modalSave: {
    marginTop: 14,
    width: '100%',
    padding: '12px',
    background: 'linear-gradient(135deg, #6366f1, #38bdf8)',
    border: 'none', borderRadius: 10,
    color: '#fff', fontSize: '0.95rem',
    fontWeight: 700, fontFamily: 'Syne, sans-serif',
    cursor: 'pointer',
    letterSpacing: 0.3,
  },
  modalCancel: {
    marginTop: 10,
    width: '100%',
    padding: '10px',
    background: 'transparent',
    border: '1px solid #1e293b',
    borderRadius: 10,
    color: '#64748b',
    fontSize: '0.85rem',
    cursor: 'pointer',
    fontFamily: 'DM Sans, sans-serif',
  },
  emptyState: {
    textAlign: 'center',
    padding: '80px 20px',
    color: '#1e293b',
  },
  emptyIcon: {
    fontSize: '4rem',
    marginBottom: 16,
    filter: 'grayscale(0.5)',
  },
  emptyText: {
    color: '#334155',
    fontSize: '1.05rem',
    fontFamily: 'DM Sans, sans-serif',
    lineHeight: 1.8,
  },
}

// ── App ──────────────────────────────────────────────────────────────────────
export default function App() {
  const [niche, setNiche] = useState('')
  const [apiKey, setApiKey] = useState('')
  const [tempKey, setTempKey] = useState('')
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState('')
  const [error, setError] = useState('')
  const [showModal, setShowModal] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem('vpg_api_key')
    if (saved) setApiKey(saved)
    else { setTempKey(''); setShowModal(true) }
  }, [])

  const saveKey = () => {
    if (!tempKey.trim()) return
    localStorage.setItem('vpg_api_key', tempKey.trim())
    setApiKey(tempKey.trim())
    setShowModal(false)
  }

  const generate = async () => {
    if (!niche.trim()) return setError('⚠ Enter a niche first (e.g. fitness, crypto, parenting)')
    if (!apiKey) { setTempKey(''); return setShowModal(true) }
    setLoading(true)
    setError('')
    setPosts([])

    try {
      setStatus('🔍 Scanning Reddit for top-performing posts...')
      const redditPosts = await fetchRedditPosts(niche).catch(() => [])

      setStatus('✨ AI generating 10 viral posts...')
      const generated = await generateWithClaude(niche, redditPosts, apiKey)

      if (!Array.isArray(generated) || generated.length === 0)
        throw new Error('No posts returned — try again')

      setPosts(generated.slice(0, 10))
      setStatus('')
    } catch (e) {
      console.error(e)
      if (e.message?.includes('401') || e.message?.includes('auth')) {
        setError('❌ Invalid API key. Click "API Key" to update it.')
      } else {
        setError(`❌ ${e.message || 'Something went wrong. Try again.'}`)
      }
      setStatus('')
    }
    setLoading(false)
  }

  return (
    <div style={css.root}>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        input:focus { border-color: #6366f1 !important; }
        button:hover:not(:disabled) { opacity: 0.88; }
      `}</style>

      {/* API Key Modal */}
      {showModal && (
        <div style={css.overlay}>
          <div style={css.modal}>
            <div style={css.modalTitle}>🔑 Add Your Groq API Key</div>
            <div style={css.modalSub}>
              Required to generate posts — Groq is 100% free.<br />
              Your key is stored only in your browser and sent
              directly to Groq — never to any third-party server.<br /><br />
              Get your free key at <strong style={{ color: '#818cf8' }}>console.groq.com → API Keys</strong>
            </div>
            <input
              type="password"
              value={tempKey}
              onChange={e => setTempKey(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && saveKey()}
              placeholder="gsk_..."
              style={css.modalInput}
              autoFocus
            />
            <button style={css.modalSave} onClick={saveKey}>
              Save & Continue →
            </button>
            {apiKey && (
              <button style={css.modalCancel} onClick={() => setShowModal(false)}>
                Cancel
              </button>
            )}
          </div>
        </div>
      )}

      {/* Hero */}
      <div style={css.hero}>
        <div style={css.heroGlow} />
        <h1 style={css.heroTitle}>
          <span style={css.heroAccent}>Viral Post</span> Generator
        </h1>
        <p style={css.heroSub}>
          Enter a niche → AI researches Reddit trends → Get 10 ready-to-post Facebook graphics
        </p>
      </div>

      {/* Main */}
      <div style={css.main}>
        {/* Search Bar */}
        <div style={css.searchRow}>
          <input
            value={niche}
            onChange={e => { setNiche(e.target.value); setError('') }}
            onKeyDown={e => e.key === 'Enter' && generate()}
            placeholder="Enter niche — fitness, crypto, motivation, parenting, business..."
            style={css.input}
          />
          <button
            onClick={generate}
            disabled={loading}
            style={css.generateBtn(loading)}
          >
            {loading ? '⏳ Generating…' : '⚡ Generate 10 Posts'}
          </button>
          <button
            style={css.keyBtn}
            onClick={() => { setTempKey(apiKey); setShowModal(true) }}
          >
            🔑 API Key
          </button>
        </div>

        {/* Hint */}
        {!posts.length && !loading && !error && (
          <p style={{ color: '#334155', fontSize: '0.82rem', marginBottom: 40 }}>
            Tip: Try niches like <em>mindfulness</em>, <em>dropshipping</em>, <em>Telugu culture</em>, <em>workout motivation</em>
          </p>
        )}

        {/* Error */}
        {error && <div style={css.errorBox}>{error}</div>}

        {/* Loading */}
        {loading && (
          <div style={css.statusBox}>
            <div style={css.spinner} />
            <div style={css.statusText}>{status}</div>
          </div>
        )}

        {/* Results */}
        {posts.length > 0 && !loading && (
          <>
            <div style={css.resultsHeader}>
              <div style={css.resultsTitle}>
                ✅ 10 Posts for{' '}
                <span style={{ color: '#818cf8' }}>"{niche}"</span>
              </div>
              <button style={css.regenBtn} onClick={generate}>
                🔄 Regenerate
              </button>
            </div>
            <div style={css.grid}>
              {posts.map((post, i) => (
                <PostCard
                  key={i}
                  post={post}
                  index={i}
                  g1={PALETTES[i][0]}
                  g2={PALETTES[i][1]}
                  niche={niche}
                />
              ))}
            </div>
          </>
        )}

        {/* Empty state */}
        {!posts.length && !loading && !error && (
          <div style={css.emptyState}>
            <div style={css.emptyIcon}>📱</div>
            <div style={css.emptyText}>
              Your 10 AI-generated Facebook posts will appear here.<br />
              Each card has a unique gradient design — ready to screenshot & post.
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

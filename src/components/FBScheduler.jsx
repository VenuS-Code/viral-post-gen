import { useState, useEffect, useRef } from 'react'
import html2canvas from 'html2canvas'

// Optimal IST posting times (in 24h)
const OPTIMAL_TIMES = [
  { label: '9:00 AM', hour: 9,  minute: 0  },
  { label: '1:00 PM', hour: 13, minute: 0  },
  { label: '7:00 PM', hour: 19, minute: 0  },
]

// Build a queue of {post, scheduledAt} spread across days, 3/day
function buildSchedule(posts) {
  const now = new Date()
  const slots = []
  let dayOffset = 0
  let slotIdx = 0

  for (let i = 0; i < posts.length; i++) {
    // Find next available slot from current time
    while (true) {
      const t = OPTIMAL_TIMES[slotIdx % 3]
      const candidate = new Date()
      candidate.setDate(now.getDate() + dayOffset)
      candidate.setHours(t.hour, t.minute, 0, 0)
      if (candidate > now) {
        slots.push({ scheduledAt: candidate, timeLabel: t.label, day: dayOffset })
        slotIdx++
        if (slotIdx % 3 === 0) dayOffset++
        break
      }
      slotIdx++
      if (slotIdx % 3 === 0) dayOffset++
    }
  }
  return slots
}

async function enrichPostsWithGroq(posts, niche, groqKey) {
  const prompt = `You are a Facebook SEO expert. For each post in the "${niche}" niche, generate:
1. A compelling Facebook post title (max 10 words, no clickbait, SEO-optimized)
2. 5-8 relevant hashtags (no spaces, lowercase)

Posts:
${posts.map((p, i) => `${i + 1}. "${p.headline}" — ${p.body.slice(0, 100)}`).join('\n')}

Respond ONLY with a JSON array, no markdown:
[{"title": "...", "hashtags": "#tag1 #tag2 #tag3 #tag4 #tag5"}]`

  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${groqKey}` },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      max_tokens: 1024,
      messages: [{ role: 'user', content: prompt }],
    }),
  })
  const data = await res.json()
  const text = data.choices?.[0]?.message?.content || '[]'
  return JSON.parse(text.replace(/```json|```/g, '').trim())
}

async function postToFacebook(cardElement, caption, pageId, pageToken) {
  const canvas = await html2canvas(cardElement, {
    scale: 2, useCORS: true, allowTaint: true,
    backgroundColor: null, logging: false,
  })
  const blob = await new Promise(res => canvas.toBlob(res, 'image/png'))
  const form = new FormData()
  form.append('source', blob, 'post.png')
  form.append('caption', caption)
  form.append('access_token', pageToken)

  const res = await fetch(`https://graph.facebook.com/v19.0/${pageId}/photos`, {
    method: 'POST', body: form,
  })
  const data = await res.json()
  if (data.error) throw new Error(data.error.message)
  return data
}

function useCountdown(targetTime) {
  const [remaining, setRemaining] = useState(0)
  useEffect(() => {
    if (!targetTime) return
    const tick = () => setRemaining(Math.max(0, targetTime - Date.now()))
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [targetTime])
  if (!targetTime || remaining <= 0) return null
  const h = Math.floor(remaining / 3600000)
  const m = String(Math.floor((remaining % 3600000) / 60000)).padStart(2, '0')
  const s = String(Math.floor((remaining % 60000) / 1000)).padStart(2, '0')
  return h > 0 ? `${h}h ${m}m ${s}s` : `${m}m ${s}s`
}

// Day label helper
function dayLabel(dayOffset) {
  if (dayOffset === 0) return 'Today'
  if (dayOffset === 1) return 'Tomorrow'
  const d = new Date()
  d.setDate(d.getDate() + dayOffset)
  return d.toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' })
}

const S = {
  wrap: {
    marginTop: 48,
    background: '#0d1117',
    border: '1px solid #1e293b',
    borderRadius: 20,
    padding: '28px 24px',
  },
  heading: {
    fontFamily: 'Syne, sans-serif',
    fontSize: '1.15rem', fontWeight: 700,
    color: '#f1f5f9', marginBottom: 6,
    display: 'flex', alignItems: 'center', gap: 10,
  },
  subhead: {
    color: '#334155', fontSize: '0.82rem',
    fontFamily: 'Nunito, sans-serif',
    marginBottom: 22, lineHeight: 1.6,
  },
  chip: (color) => ({
    display: 'inline-block',
    background: `${color}22`,
    color, border: `1px solid ${color}44`,
    borderRadius: 20, padding: '2px 10px',
    fontSize: 11, fontWeight: 700,
    fontFamily: 'Nunito, sans-serif',
    marginRight: 6,
  }),
  row: { display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 14 },
  input: {
    flex: 1, minWidth: 180,
    padding: '11px 16px',
    background: '#060912',
    border: '1.5px solid #1e293b',
    borderRadius: 10,
    color: '#f1f5f9', fontSize: '0.88rem',
    fontFamily: 'Nunito, sans-serif', outline: 'none',
  },
  btn: (active, color = '#1877F2') => ({
    padding: '11px 22px',
    background: active ? `linear-gradient(135deg, ${color}, ${color}aa)` : '#1e293b',
    color: active ? '#fff' : '#475569',
    border: 'none', borderRadius: 10,
    fontSize: '0.88rem', fontWeight: 700,
    fontFamily: 'Syne, sans-serif',
    cursor: active ? 'pointer' : 'not-allowed',
    whiteSpace: 'nowrap',
  }),
  dayGroup: {
    marginBottom: 20,
  },
  dayLabel: {
    fontFamily: 'Syne, sans-serif',
    fontSize: '0.78rem', fontWeight: 700,
    color: '#475569', letterSpacing: 1.5,
    textTransform: 'uppercase',
    marginBottom: 10,
    paddingBottom: 6,
    borderBottom: '1px solid #1e293b',
  },
  qGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
    gap: 10,
  },
  qItem: (status) => ({
    background: status === 'posted'    ? '#0c2a1a'
               : status === 'posting'  ? '#1a1400'
               : status === 'failed'   ? '#2a0c0c'
               : status === 'cancelled'? '#0d0d0d'
               : '#111827',
    border: `1px solid ${
      status === 'posted'   ? '#166534'
    : status === 'posting'  ? '#854d0e'
    : status === 'failed'   ? '#7f1d1d'
    : '#1e293b'}`,
    borderRadius: 10, padding: '12px 14px',
  }),
  qTime: {
    fontFamily: '"Bebas Neue", cursive',
    fontSize: '1.1rem', letterSpacing: 1.5,
    color: '#60a5fa', marginBottom: 4,
  },
  qTitle: {
    fontFamily: 'Nunito, sans-serif',
    fontSize: '0.8rem', fontWeight: 700,
    color: '#cbd5e1', marginBottom: 4,
    lineHeight: 1.35,
    display: '-webkit-box', WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical', overflow: 'hidden',
  },
  qTags: {
    color: '#3b82f6', fontSize: '0.7rem',
    fontFamily: 'Nunito, sans-serif',
    marginBottom: 8, lineHeight: 1.5,
    display: '-webkit-box', WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical', overflow: 'hidden',
  },
  qStatus: (status) => ({
    fontSize: 11, fontWeight: 700,
    fontFamily: 'Nunito, sans-serif',
    color: status === 'posted'   ? '#86efac'
         : status === 'posting'  ? '#fde68a'
         : status === 'failed'   ? '#fca5a5'
         : status === 'cancelled'? '#374151'
         : '#334155',
  }),
  nextBox: {
    background: '#060912',
    border: '1px solid #1e293b',
    borderRadius: 12, padding: '16px 20px',
    display: 'flex', alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24, flexWrap: 'wrap', gap: 12,
  },
  timer: {
    fontFamily: '"Bebas Neue", cursive',
    fontSize: '2.2rem', color: '#60a5fa', letterSpacing: 3,
  },
  help: {
    marginTop: 24,
    background: '#060912',
    border: '1px solid #1e293b',
    borderRadius: 12, padding: '16px 18px',
    color: '#334155', fontSize: '0.78rem',
    lineHeight: 1.9, fontFamily: 'Nunito, sans-serif',
  },
}

export default function FBScheduler({ posts, cardRefs, niche, groqKey }) {
  const [pageId,    setPageId]    = useState(() => localStorage.getItem('fb_page_id')    || '')
  const [pageToken, setPageToken] = useState(() => localStorage.getItem('fb_page_token') || '')
  const [queue,     setQueue]     = useState([])
  const [running,   setRunning]   = useState(false)
  const [enriching, setEnriching] = useState(false)
  const [error,     setError]     = useState('')
  const queueRef  = useRef([])
  const timersRef = useRef([])

  // Find next waiting item's scheduledAt
  const nextItem = queue.find(x => x.status === 'waiting')
  const countdown = useCountdown(nextItem?.scheduledAt?.getTime())

  const updateItem = (idx, patch) => {
    queueRef.current[idx] = { ...queueRef.current[idx], ...patch }
    setQueue([...queueRef.current])
  }

  const postItem = async (idx) => {
    updateItem(idx, { status: 'posting' })
    try {
      const cardEl = cardRefs.current?.[idx]
      if (!cardEl) throw new Error('Card element not found')
      const item = queueRef.current[idx]
      const caption = `${item.title}\n\n${item.body}\n\n${item.hashtags}`
      await postToFacebook(cardEl, caption, pageId, pageToken)
      updateItem(idx, { status: 'posted' })
    } catch (e) {
      updateItem(idx, { status: 'failed', error: e.message })
    }
  }

  const startSchedule = async () => {
    if (!pageId || !pageToken) return setError('Enter your Facebook Page ID and Page Access Token.')
    if (!groqKey) return setError('Groq API key missing.')
    setError('')
    setEnriching(true)
    localStorage.setItem('fb_page_id',    pageId)
    localStorage.setItem('fb_page_token', pageToken)

    // Enrich with Groq
    let meta = []
    try { meta = await enrichPostsWithGroq(posts, niche, groqKey) } catch {}

    // Build schedule slots
    const slots = buildSchedule(posts)

    const enriched = posts.map((p, i) => ({
      ...p,
      title:       meta[i]?.title    || p.headline,
      hashtags:    meta[i]?.hashtags || `#${niche}`,
      scheduledAt: slots[i].scheduledAt,
      timeLabel:   slots[i].timeLabel,
      day:         slots[i].day,
      status: 'waiting',
      error: null,
    }))

    queueRef.current = enriched
    setQueue([...enriched])
    setEnriching(false)
    setRunning(true)

    // Schedule each post
    enriched.forEach((item, idx) => {
      const delay = Math.max(0, item.scheduledAt.getTime() - Date.now())
      const t = setTimeout(() => postItem(idx), delay)
      timersRef.current.push(t)
    })
  }

  const stopSchedule = () => {
    timersRef.current.forEach(t => clearTimeout(t))
    timersRef.current = []
    setRunning(false)
    setQueue(q => q.map(x => x.status === 'waiting' ? { ...x, status: 'cancelled' } : x))
  }

  // Group queue by day
  const byDay = queue.reduce((acc, item) => {
    const key = item.day ?? 0
    if (!acc[key]) acc[key] = []
    acc[key].push(item)
    return acc
  }, {})

  const postedCount  = queue.filter(x => x.status === 'posted').length
  const totalCount   = queue.length
  const canStart     = posts.length > 0 && !running && !enriching

  return (
    <div style={S.wrap}>
      <div style={S.heading}>
        <span style={{ fontSize: '1.4rem' }}>📘</span>
        Auto-Post to Facebook
        {totalCount > 0 && (
          <span style={{ marginLeft: 'auto', fontSize: '0.82rem', color: '#64748b', fontFamily: 'Nunito, sans-serif', fontWeight: 600 }}>
            {postedCount}/{totalCount} posted
          </span>
        )}
      </div>
      <div style={S.subhead}>
        Posts scheduled at optimal times — <span style={{ color: '#60a5fa' }}>9:00 AM</span>, <span style={{ color: '#60a5fa' }}>1:00 PM</span>, <span style={{ color: '#60a5fa' }}>7:00 PM IST</span> — 3 per day.
        Titles &amp; hashtags are AI-generated by Groq. Mimics human behaviour — safer for monetization.
      </div>

      <div style={S.row}>
        <input
          value={pageId}
          onChange={e => setPageId(e.target.value)}
          placeholder="Facebook Page ID  (e.g. 123456789)"
          style={S.input}
        />
        <input
          type="password"
          value={pageToken}
          onChange={e => setPageToken(e.target.value)}
          placeholder="Page Access Token  (from Graph API Explorer)"
          style={S.input}
        />
      </div>
      <div style={{ ...S.row, marginBottom: 0 }}>
        {running
          ? <button style={S.btn(true, '#dc2626')} onClick={stopSchedule}>⏹ Stop Schedule</button>
          : <button style={S.btn(canStart)} onClick={startSchedule} disabled={!canStart}>
              {enriching ? '⏳ AI Generating Titles & Tags…' : '🚀 Schedule All 10 Posts'}
            </button>
        }
      </div>

      {error && (
        <div style={{ background: '#1a0a0a', border: '1px solid #7f1d1d', borderRadius: 8, padding: '10px 14px', color: '#fca5a5', fontSize: '0.82rem', marginTop: 14, fontFamily: 'Nunito, sans-serif' }}>
          {error}
        </div>
      )}

      {/* Countdown to next post */}
      {running && countdown && (
        <div style={{ ...S.nextBox, marginTop: 20 }}>
          <div>
            <div style={{ color: '#334155', fontSize: '0.72rem', fontFamily: 'Nunito, sans-serif', fontWeight: 700, letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: 2 }}>
              Next post in
            </div>
            <div style={S.timer}>{countdown}</div>
          </div>
          <div style={{ textAlign: 'right', fontFamily: 'Nunito, sans-serif' }}>
            <div style={{ color: '#475569', fontSize: '0.8rem' }}>{nextItem?.timeLabel} · {dayLabel(nextItem?.day)}</div>
            <div style={{ color: '#334155', fontSize: '0.75rem', marginTop: 4 }}>Keep this tab open</div>
          </div>
        </div>
      )}

      {/* Schedule grid grouped by day */}
      {queue.length > 0 && (
        <div style={{ marginTop: 24 }}>
          {Object.entries(byDay).map(([day, items]) => (
            <div key={day} style={S.dayGroup}>
              <div style={S.dayLabel}>{dayLabel(parseInt(day))}</div>
              <div style={S.qGrid}>
                {items.map((item, j) => {
                  const globalIdx = queue.indexOf(item)
                  return (
                    <div key={j} style={S.qItem(item.status)}>
                      <div style={S.qTime}>{item.timeLabel}</div>
                      <div style={S.qTitle}>{item.title}</div>
                      <div style={S.qTags}>{item.hashtags}</div>
                      <div style={S.qStatus(item.status)}>
                        {item.status === 'posted'    ? '✓ Posted to Facebook'
                       : item.status === 'posting'   ? '⏳ Posting now…'
                       : item.status === 'failed'    ? `✗ ${item.error}`
                       : item.status === 'cancelled' ? '— Cancelled'
                       : `🕐 Scheduled`}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Setup guide */}
      <div style={S.help}>
        <strong style={{ color: '#475569', fontWeight: 700 }}>How to get your Facebook Page Access Token (3 min):</strong><br />
        1. Go to <strong style={{ color: '#60a5fa' }}>developers.facebook.com</strong> → My Apps → Create App → type: <em>Business</em><br />
        2. Add <strong>Pages</strong> product to your app<br />
        3. Open <strong>Graph API Explorer</strong> → select your Page from dropdown → click <em>Generate Access Token</em><br />
        4. Grant permissions: <code style={{ color: '#a5b4fc' }}>pages_manage_posts</code>, <code style={{ color: '#a5b4fc' }}>pages_read_engagement</code><br />
        5. Your <strong>Page ID</strong>: go to your Facebook Page → About → scroll to bottom → copy the number<br /><br />
        <strong style={{ color: '#475569' }}>Note:</strong> Short-lived tokens expire in 1 hour. For long-lived tokens (60 days), use the Token Debugger tool on the same site.
      </div>
    </div>
  )
}

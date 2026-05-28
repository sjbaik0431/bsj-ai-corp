'use client'

import { useEffect, useState } from 'react'
import { Music, BookOpen, Play, Loader2, Sparkles, RefreshCw } from 'lucide-react'
import { Markdown } from './markdown'

type Brief = {
  date: string
  generatedAt: string
  briefMarkdown: string
  music: { title: string; artist: string; genre: string; mood: string }
  poem: { title: string; author: string; body: string; season?: string }
}

export function MorningRoutine() {
  const [brief, setBrief] = useState<Brief | null>(null)
  const [loading, setLoading] = useState(false)
  const [poemPlaying, setPoemPlaying] = useState(false)
  const [briefOpen, setBriefOpen] = useState(false)

  useEffect(() => {
    fetch('/api/morning').then((r) => r.json()).then((d) => setBrief(d.brief))
  }, [])

  async function ensureToday() {
    setLoading(true)
    try {
      const r = await fetch('/api/morning', { method: 'POST' })
      const d = await r.json()
      if (d.brief) setBrief(d.brief)
    } finally {
      setLoading(false)
    }
  }

  async function readPoem() {
    if (!brief?.poem) return
    setPoemPlaying(true)
    try {
      const r = await fetch('/api/voice/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: `${brief.poem.author}의 ${brief.poem.title}. ${brief.poem.body}`, agent: 'bonbujang' }),
      })
      if (r.ok) {
        const blob = await r.blob()
        const url = URL.createObjectURL(blob)
        const audio = new Audio(url)
        audio.onended = () => setPoemPlaying(false)
        audio.play().catch(() => setPoemPlaying(false))
      } else {
        setPoemPlaying(false)
      }
    } catch {
      setPoemPlaying(false)
    }
  }

  const today = new Date().toISOString().slice(0, 10)
  const isStale = !brief || brief.date !== today

  return (
    <>
      <div className="glass rounded-3xl p-5 shadow-sm">
        <div className="flex items-start gap-4">
          <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-sky-400 to-bsj-primary flex items-center justify-center text-white shadow">
            <Music className="h-6 w-6" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs uppercase tracking-wider text-slate-500">오늘의 음악</p>
            {brief?.music ? (
              <>
                <p className="mt-1 text-lg font-semibold text-bsj-ink truncate">{brief.music.title}</p>
                <p className="mt-0.5 text-sm text-slate-500">{brief.music.artist} · {brief.music.genre} · {brief.music.mood}</p>
              </>
            ) : (
              <p className="mt-1 text-sm text-slate-400">로딩 중...</p>
            )}
          </div>
        </div>
      </div>

      <button
        onClick={readPoem}
        disabled={!brief?.poem || poemPlaying}
        className="group glass rounded-3xl p-5 text-left shadow-sm hover:shadow-md transition-all disabled:cursor-not-allowed"
      >
        <div className="flex items-start gap-4">
          <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-amber-300 to-bsj-accent flex items-center justify-center text-white shadow">
            <BookOpen className="h-6 w-6" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs uppercase tracking-wider text-slate-500">오늘의 시 · 클릭하면 본부장 목소리로 낭송</p>
            {brief?.poem ? (
              <>
                <p className="mt-1 text-lg font-semibold text-bsj-ink truncate">{brief.poem.author} 「{brief.poem.title}」</p>
                <p className="mt-0.5 text-sm text-slate-500 line-clamp-2">{brief.poem.body.replace(/\n/g, ' ')}</p>
              </>
            ) : (
              <p className="mt-1 text-sm text-slate-400">로딩 중...</p>
            )}
          </div>
          {poemPlaying ? <Loader2 className="h-5 w-5 text-bsj-accent animate-spin" /> : <Play className="h-5 w-5 text-bsj-accent" />}
        </div>
      </button>

      {brief?.briefMarkdown && (
        <div className="lg:col-span-2 glass rounded-3xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-bsj-primary" />
              <p className="font-semibold text-bsj-ink">본부장 모닝 브리핑</p>
              <span className="text-[10px] text-slate-400">· {brief.date}</span>
            </div>
            <div className="flex items-center gap-2">
              {isStale && (
                <button
                  onClick={ensureToday}
                  disabled={loading}
                  className="text-xs rounded-full bg-bsj-primary text-white px-3 py-1 hover:shadow disabled:opacity-50 inline-flex items-center gap-1"
                >
                  {loading ? <Loader2 className="h-3 w-3 animate-spin" /> : <RefreshCw className="h-3 w-3" />}
                  오늘자 새로 생성
                </button>
              )}
              <button onClick={() => setBriefOpen((v) => !v)} className="text-xs text-slate-500 hover:text-bsj-primary">
                {briefOpen ? '접기' : '펼치기'}
              </button>
            </div>
          </div>
          {briefOpen && (
            <div className="rounded-xl bg-white/70 border border-slate-100 p-4">
              <Markdown source={brief.briefMarkdown} />
            </div>
          )}
        </div>
      )}

      {!brief && (
        <div className="lg:col-span-2">
          <button
            onClick={ensureToday}
            disabled={loading}
            className="w-full rounded-2xl bg-gradient-to-r from-bsj-primary to-sky-500 text-white px-4 py-2.5 text-sm font-medium hover:shadow-lg disabled:opacity-50 inline-flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            본부장 모닝 브리핑 생성하기 (오늘 첫 실행)
          </button>
        </div>
      )}
    </>
  )
}

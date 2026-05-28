'use client'

import { Music, BookOpen, Play } from 'lucide-react'
import { useState } from 'react'

export function MorningRoutine() {
  const [musicPlaying, setMusicPlaying] = useState(false)
  const [poemPlaying, setPoemPlaying] = useState(false)

  return (
    <>
      <button
        onClick={() => setMusicPlaying(!musicPlaying)}
        className="group glass rounded-3xl p-5 text-left shadow-sm hover:shadow-md transition-all"
      >
        <div className="flex items-start gap-4">
          <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-sky-400 to-bsj-primary flex items-center justify-center text-white shadow">
            <Music className="h-6 w-6" />
          </div>
          <div className="flex-1">
            <p className="text-xs uppercase tracking-wider text-slate-500">오늘의 음악</p>
            <p className="mt-1 text-lg font-semibold text-bsj-ink">오월의 아침 · Jazz</p>
            <p className="mt-0.5 text-sm text-slate-500">맑은 목요일에 어울리는 라운지 재즈</p>
          </div>
          <Play className={`h-5 w-5 text-bsj-primary ${musicPlaying ? 'animate-pulse-soft' : ''}`} />
        </div>
      </button>

      <button
        onClick={() => setPoemPlaying(!poemPlaying)}
        className="group glass rounded-3xl p-5 text-left shadow-sm hover:shadow-md transition-all"
      >
        <div className="flex items-start gap-4">
          <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-amber-300 to-bsj-accent flex items-center justify-center text-white shadow">
            <BookOpen className="h-6 w-6" />
          </div>
          <div className="flex-1">
            <p className="text-xs uppercase tracking-wider text-slate-500">오늘의 시</p>
            <p className="mt-1 text-lg font-semibold text-bsj-ink">김춘수 「꽃」</p>
            <p className="mt-0.5 text-sm text-slate-500">내가 그의 이름을 불러주었을 때... · 1분 28초</p>
          </div>
          <Play className={`h-5 w-5 text-bsj-accent ${poemPlaying ? 'animate-pulse-soft' : ''}`} />
        </div>
      </button>
    </>
  )
}

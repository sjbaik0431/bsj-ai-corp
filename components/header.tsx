'use client'

import { useEffect, useState } from 'react'
import { formatKoreanDate } from '@/lib/utils'

export function Header() {
  const [date, setDate] = useState(formatKoreanDate())

  useEffect(() => {
    setDate(formatKoreanDate())
  }, [])

  return (
    <header className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-bsj-primary to-bsj-accent flex items-center justify-center text-white font-bold shadow-md">
          B
        </div>
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-bsj-ink">BSJ AI 주식회사</h1>
          <p className="text-sm text-slate-500">5인 에이전트 통합 작업 공간</p>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-3 text-sm md:text-base">
        <span className="rounded-xl bg-white/70 px-3 py-1.5 shadow-sm border border-slate-100">
          📅 {date}
        </span>
      </div>
    </header>
  )
}

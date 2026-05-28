'use client'

import { useEffect, useState } from 'react'
import { Cloud, CloudRain, Sun, CloudSun, Snowflake } from 'lucide-react'
import { formatKoreanDate } from '@/lib/utils'

type Weather = { temp: number; condition: string; city: string } | null

const iconFor = (c: string) => {
  const x = c.toLowerCase()
  if (x.includes('rain') || x.includes('drizzle')) return <CloudRain className="h-6 w-6 text-sky-500" />
  if (x.includes('snow')) return <Snowflake className="h-6 w-6 text-sky-300" />
  if (x.includes('cloud') && x.includes('part')) return <CloudSun className="h-6 w-6 text-amber-400" />
  if (x.includes('cloud')) return <Cloud className="h-6 w-6 text-slate-400" />
  return <Sun className="h-6 w-6 text-amber-400" />
}

export function Header() {
  const [date, setDate] = useState(formatKoreanDate())
  const [weather, setWeather] = useState<Weather>(null)

  useEffect(() => {
    setDate(formatKoreanDate())
    fetch('/api/weather')
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => d && setWeather(d))
      .catch(() => {})
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
        {weather ? (
          <span className="rounded-xl bg-white/70 px-3 py-1.5 shadow-sm border border-slate-100 flex items-center gap-2">
            {iconFor(weather.condition)}
            <span>{weather.city} {weather.temp}°C</span>
            <span className="text-slate-500">{weather.condition}</span>
          </span>
        ) : (
          <span className="rounded-xl bg-white/70 px-3 py-1.5 shadow-sm border border-slate-100 text-slate-400">
            날씨 로딩...
          </span>
        )}
      </div>
    </header>
  )
}

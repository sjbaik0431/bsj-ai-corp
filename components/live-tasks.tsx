'use client'

import { motion } from 'framer-motion'
import { Clock, CheckCircle2 } from 'lucide-react'

type Task = {
  id: string
  title: string
  owner: string
  progress: number
  status: 'running' | 'review' | 'done'
}

const demoTasks: Task[] = [
  { id: '052', title: '조아호텔 5월 IR 자료', owner: '사업팀장', progress: 67, status: 'running' },
  { id: '053', title: 'MICE 입찰 5건 검증', owner: '감사팀장', progress: 100, status: 'review' },
  { id: '054', title: '진천메가폴리스 IR 정리', owner: '기획팀장', progress: 23, status: 'running' },
]

const statusBadge: Record<Task['status'], { label: string; bg: string; ico: React.ReactNode }> = {
  running: { label: '진행 중', bg: 'bg-emerald-100 text-emerald-700', ico: <Clock className="h-3.5 w-3.5" /> },
  review:  { label: '검수 대기', bg: 'bg-amber-100 text-amber-700', ico: <Clock className="h-3.5 w-3.5" /> },
  done:    { label: '완료',     bg: 'bg-sky-100 text-sky-700', ico: <CheckCircle2 className="h-3.5 w-3.5" /> },
}

export function LiveTasks() {
  return (
    <div>
      <div className="mb-3 flex items-baseline justify-between">
        <h2 className="text-lg font-bold text-bsj-ink">⚡ 진행 중 작업</h2>
        <p className="text-xs text-slate-500">새로고침해도 유지 · 실시간 동기화</p>
      </div>
      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        {demoTasks.map((t, i) => {
          const s = statusBadge[t.status]
          return (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              className="glass rounded-2xl p-4 shadow-sm"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-[11px] text-slate-400">#{t.id}</p>
                  <p className="font-semibold text-bsj-ink truncate">{t.title}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{t.owner}</p>
                </div>
                <span className={`inline-flex items-center gap-1 text-[11px] rounded-full px-2 py-0.5 ${s.bg}`}>
                  {s.ico}{s.label}
                </span>
              </div>
              <div className="mt-3 h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
                <div
                  className="h-1.5 rounded-full bg-gradient-to-r from-bsj-primary to-sky-400"
                  style={{ width: `${t.progress}%` }}
                />
              </div>
              <p className="mt-1.5 text-[11px] text-slate-500 text-right tabular-nums">{t.progress}%</p>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}

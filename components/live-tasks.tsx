'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Clock, CheckCircle2, Loader2, AlertCircle } from 'lucide-react'

type Task = {
  id: string
  title: string
  ownerLabel: string
  progress: number
  status: 'analyzing' | 'running' | 'review' | 'done' | 'failed'
  decisionSummary?: string
}

const statusBadge: Record<Task['status'], { label: string; bg: string; ico: React.ReactNode }> = {
  analyzing: { label: '분석 중',   bg: 'bg-sky-100 text-sky-700',         ico: <Loader2 className="h-3.5 w-3.5 animate-spin" /> },
  running:   { label: '진행 중',   bg: 'bg-emerald-100 text-emerald-700', ico: <Clock className="h-3.5 w-3.5" /> },
  review:    { label: '검수 대기', bg: 'bg-amber-100 text-amber-700',     ico: <Clock className="h-3.5 w-3.5" /> },
  done:      { label: '완료',      bg: 'bg-slate-100 text-slate-700',     ico: <CheckCircle2 className="h-3.5 w-3.5" /> },
  failed:    { label: '실패',      bg: 'bg-rose-100 text-rose-700',       ico: <AlertCircle className="h-3.5 w-3.5" /> },
}

export function LiveTasks() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    let alive = true

    async function fetchTasks() {
      try {
        const res = await fetch('/api/task')
        const data = await res.json()
        if (alive) {
          setTasks(data.tasks ?? [])
          setLoaded(true)
        }
      } catch {
        if (alive) setLoaded(true)
      }
    }

    fetchTasks()
    const id = setInterval(fetchTasks, 3000)

    const onCreated = () => fetchTasks()
    window.addEventListener('bsj:task-created', onCreated)

    return () => {
      alive = false
      clearInterval(id)
      window.removeEventListener('bsj:task-created', onCreated)
    }
  }, [])

  return (
    <div>
      <div className="mb-3 flex items-baseline justify-between">
        <h2 className="text-lg font-bold text-bsj-ink">⚡ 진행 중 작업</h2>
        <p className="text-xs text-slate-500">3초마다 자동 갱신 · 새로고침해도 유지</p>
      </div>

      {!loaded ? (
        <div className="glass rounded-2xl p-6 text-center text-sm text-slate-500">불러오는 중...</div>
      ) : tasks.length === 0 ? (
        <div className="glass rounded-2xl p-6 text-center text-sm text-slate-500">
          아직 진행 중인 작업이 없습니다. 위 입력창에서 본부장에게 첫 과제를 맡겨보세요.
        </div>
      ) : (
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence>
            {tasks.map((t, i) => {
              const s = statusBadge[t.status]
              return (
                <motion.div
                  key={t.id}
                  layout
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="glass rounded-2xl p-4 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-[11px] text-slate-400">#{t.id}</p>
                      <p className="font-semibold text-bsj-ink truncate">{t.title}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{t.ownerLabel}</p>
                    </div>
                    <span className={`inline-flex items-center gap-1 text-[11px] rounded-full px-2 py-0.5 ${s.bg}`}>
                      {s.ico}{s.label}
                    </span>
                  </div>
                  {t.decisionSummary && (
                    <p className="mt-2 text-xs text-slate-500 line-clamp-2">{t.decisionSummary}</p>
                  )}
                  <div className="mt-3 h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
                    <div className="h-1.5 rounded-full bg-gradient-to-r from-bsj-primary to-sky-400" style={{ width: `${t.progress}%` }} />
                  </div>
                  <p className="mt-1.5 text-[11px] text-slate-500 text-right tabular-nums">{t.progress}%</p>
                </motion.div>
              )
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  )
}

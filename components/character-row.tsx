'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Mic } from 'lucide-react'

type AgentId = 'bonbujang' | 'gihoek' | 'saeop' | 'gamsa' | 'minwon'
type TaskStatus = 'analyzing' | 'running' | 'review' | 'done' | 'failed'
type AgentState = 'idle' | 'working' | 'meeting' | 'waiting'

type Task = {
  id: string
  title: string
  owner: AgentId
  status: TaskStatus
  needsAudit?: boolean
}

type AgentMeta = {
  id: AgentId
  name: string
  role: string
  emoji: string
  color: string
  ring: string
}

const AGENTS: AgentMeta[] = [
  { id: 'bonbujang', name: '본부장',   role: 'CEO · 업무지휘',  emoji: '👨‍💼', color: 'from-sky-400 to-bsj-primary',     ring: 'ring-sky-300' },
  { id: 'gihoek',    name: '기획팀장', role: 'CSO · 조사·설계', emoji: '🧑‍🎓', color: 'from-emerald-400 to-emerald-600', ring: 'ring-emerald-300' },
  { id: 'saeop',     name: '사업팀장', role: 'COO · 구축·실행', emoji: '👨‍💻', color: 'from-rose-400 to-rose-600',       ring: 'ring-rose-300' },
  { id: 'gamsa',     name: '감사팀장', role: 'CIA · 팩트체크',  emoji: '👩‍💼', color: 'from-purple-400 to-purple-600',   ring: 'ring-purple-300' },
  { id: 'minwon',    name: '민원팀장', role: 'CCO · 외부 연결', emoji: '👩‍💻', color: 'from-pink-400 to-pink-600',       ring: 'ring-pink-300' },
]

const STATE_BADGE: Record<AgentState, { label: string; dot: string }> = {
  idle:    { label: '대기',      dot: 'bg-slate-300' },
  working: { label: '작업 중',   dot: 'bg-emerald-500 animate-pulse' },
  meeting: { label: '지휘 중',   dot: 'bg-sky-500 animate-pulse' },
  waiting: { label: '대기열',    dot: 'bg-amber-400 animate-pulse' },
}

function deriveAgentState(id: AgentId, tasks: Task[]): { state: AgentState; current: string; count: number } {
  let mine: Task[]
  if (id === 'bonbujang') {
    mine = tasks.filter((t) => t.status !== 'done' && t.status !== 'failed')
  } else if (id === 'gamsa') {
    mine = tasks.filter(
      (t) =>
        t.status === 'review' ||
        (t.needsAudit && t.status !== 'done' && t.status !== 'failed') ||
        (t.owner === 'gamsa' && t.status !== 'done' && t.status !== 'failed'),
    )
  } else {
    mine = tasks.filter((t) => t.owner === id && t.status !== 'done' && t.status !== 'failed')
  }

  const count = mine.length
  if (count === 0) return { state: 'idle', current: '대기 중', count: 0 }

  const latest = mine[0]

  let state: AgentState = 'working'
  if (id === 'bonbujang') {
    state = latest.status === 'analyzing' ? 'meeting' : 'meeting'
  } else if (id === 'gamsa') {
    state = latest.status === 'review' ? 'working' : (latest.status === 'analyzing' ? 'waiting' : 'working')
  } else {
    if (latest.status === 'analyzing') state = 'waiting'
    else if (latest.status === 'running') state = 'working'
    else if (latest.status === 'review') state = 'waiting'
  }

  const current = id === 'bonbujang' && count > 1
    ? `${count}건 지휘 중 · ${latest.title}`
    : latest.title

  return { state, current, count }
}

export function CharacterRow() {
  const [tasks, setTasks] = useState<Task[]>([])

  useEffect(() => {
    let alive = true
    async function fetchTasks() {
      try {
        const res = await fetch('/api/task', { cache: 'no-store' })
        const data = await res.json()
        if (alive) setTasks(data.tasks ?? [])
      } catch {}
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
        <h2 className="text-lg font-bold text-bsj-ink">직원 소개</h2>
        <p className="text-xs text-slate-500">클릭하면 음성 채팅 시작 (Phase C)</p>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4">
        {AGENTS.map((a, i) => {
          const { state, current, count } = deriveAgentState(a.id, tasks)
          const s = STATE_BADGE[state]
          return (
            <motion.button
              key={a.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              whileHover={{ y: -3 }}
              className="glass rounded-3xl p-4 text-left shadow-sm hover:shadow-lg transition-all group"
            >
              <div className="flex items-center gap-3">
                <motion.div
                  className={`relative h-14 w-14 rounded-2xl bg-gradient-to-br ${a.color} flex items-center justify-center text-3xl shadow-md ring-2 ${a.ring} ring-offset-2 ring-offset-white/80`}
                  animate={{ scale: [1, 1.02, 1] }}
                  transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                >
                  <span aria-hidden>{a.emoji}</span>
                  <span className={`absolute -bottom-1 -right-1 h-3.5 w-3.5 rounded-full border-2 border-white ${s.dot}`} />
                </motion.div>
                <div className="min-w-0">
                  <p className="font-bold text-bsj-ink truncate">{a.name}</p>
                  <p className="text-[11px] text-slate-500 truncate">{a.role}</p>
                </div>
              </div>
              <div className="mt-3 rounded-xl bg-white/60 px-3 py-2 text-xs text-slate-700">
                <p className="font-medium truncate" title={current}>{current}</p>
                <div className="mt-1 flex items-center justify-between text-[11px] text-slate-500">
                  <span>{s.label}</span>
                  <span>{count}건</span>
                </div>
              </div>
              <div className="mt-2 flex items-center justify-center gap-1 text-[11px] text-bsj-primary opacity-0 group-hover:opacity-100 transition-opacity">
                <Mic className="h-3 w-3" />
                <span>음성 채팅</span>
              </div>
            </motion.button>
          )
        })}
      </div>
    </div>
  )
}

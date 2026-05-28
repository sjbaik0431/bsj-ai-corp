'use client'

import { motion } from 'framer-motion'
import { Mic } from 'lucide-react'

type Agent = {
  id: string
  name: string
  role: string
  emoji: string
  color: string
  ring: string
  state: 'idle' | 'working' | 'meeting' | 'waiting'
  current: string
  taskCount: number
}

const agents: Agent[] = [
  { id: 'bonbujang', name: '본부장', role: 'CEO · 업무지휘', emoji: '👨‍💼', color: 'from-sky-400 to-bsj-primary', ring: 'ring-sky-300', state: 'meeting', current: '오늘 일정 분배', taskCount: 3 },
  { id: 'gihoek', name: '기획팀장', role: 'CSO · 조사·설계', emoji: '🧑‍🎓', color: 'from-emerald-400 to-emerald-600', ring: 'ring-emerald-300', state: 'working', current: 'MICE 신규 공고 5건 조사', taskCount: 1 },
  { id: 'saeop', name: '사업팀장', role: 'COO · 구축·실행', emoji: '👨‍💻', color: 'from-rose-400 to-rose-600', ring: 'ring-rose-300', state: 'working', current: '조아호텔 5월 IR 작성', taskCount: 2 },
  { id: 'gamsa', name: '감사팀장', role: 'CIA · 팩트체크', emoji: '👩‍💼', color: 'from-purple-400 to-purple-600', ring: 'ring-purple-300', state: 'waiting', current: '검증 대기 (BSJ 결재)', taskCount: 1 },
  { id: 'minwon', name: '민원팀장', role: 'CCO · 외부 연결', emoji: '👩‍💻', color: 'from-pink-400 to-pink-600', ring: 'ring-pink-300', state: 'idle', current: '대기 중', taskCount: 0 },
]

const stateLabel: Record<Agent['state'], { label: string; dot: string }> = {
  idle:    { label: '대기',     dot: 'bg-slate-300' },
  working: { label: '작업 중',  dot: 'bg-emerald-500 animate-pulse' },
  meeting: { label: '회의 중',  dot: 'bg-sky-500 animate-pulse' },
  waiting: { label: '승인 대기', dot: 'bg-amber-400 animate-pulse' },
}

export function CharacterRow() {
  return (
    <div>
      <div className="mb-3 flex items-baseline justify-between">
        <h2 className="text-lg font-bold text-bsj-ink">우리 AI 가족</h2>
        <p className="text-xs text-slate-500">클릭하면 음성 채팅 시작</p>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4">
        {agents.map((a, i) => {
          const s = stateLabel[a.state]
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
                <p className="font-medium truncate">{a.current}</p>
                <div className="mt-1 flex items-center justify-between text-[11px] text-slate-500">
                  <span>{s.label}</span>
                  <span>{a.taskCount}개 작업</span>
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

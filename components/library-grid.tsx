'use client'

import { motion } from 'framer-motion'
import { Building2, Hotel, Factory, PartyPopper, Heart, LayoutDashboard, Bot, Archive } from 'lucide-react'

const items = [
  { href: '/library/hadminsa',       label: '행정사',        sub: '사건·문서·법령', icon: Building2,     gradient: 'from-blue-400 to-blue-600' },
  { href: '/library/hotel',          label: '호텔',          sub: '조아호텔 운영·매각', icon: Hotel,         gradient: 'from-amber-400 to-amber-600' },
  { href: '/library/industrial',     label: '산업단지',      sub: '진천메가폴리스 IR', icon: Factory,       gradient: 'from-slate-500 to-slate-700' },
  { href: '/library/mice',           label: 'MICE',         sub: 'EZPMP · 입찰·박람회', icon: PartyPopper,   gradient: 'from-pink-400 to-rose-500' },
  { href: '/library/life',           label: '라이프',        sub: '가족·인맥·건강', icon: Heart,         gradient: 'from-rose-300 to-fuchsia-500' },
  { href: '/library/legacy/dashboard', label: '통합대시보드 (이관)', sub: '기존 BSJ 통합 자료', icon: LayoutDashboard, gradient: 'from-cyan-400 to-sky-600' },
  { href: '/library/legacy/ai-hub',    label: 'AI HUB V2.0 (이관)', sub: '기존 AI 작업 자료', icon: Bot,            gradient: 'from-purple-400 to-purple-600' },
  { href: '/library/archive',          label: '보관함',       sub: '90일 지난 자료', icon: Archive,       gradient: 'from-slate-300 to-slate-500' },
]

export function LibraryGrid() {
  return (
    <div>
      <div className="mb-3 flex items-baseline justify-between">
        <h2 className="text-lg font-bold text-bsj-ink">📚 자료실</h2>
        <p className="text-xs text-slate-500">기존 대시보드 통합 · 도메인별 보고서</p>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {items.map((it, i) => {
          const Icon = it.icon
          return (
            <motion.a
              key={it.href}
              href={it.href}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              whileHover={{ y: -3 }}
              className="glass rounded-2xl p-4 shadow-sm hover:shadow-lg transition-all group"
            >
              <div className={`h-11 w-11 rounded-xl bg-gradient-to-br ${it.gradient} flex items-center justify-center text-white shadow`}>
                <Icon className="h-5 w-5" />
              </div>
              <p className="mt-3 font-semibold text-bsj-ink">{it.label}</p>
              <p className="text-xs text-slate-500 mt-0.5 truncate">{it.sub}</p>
            </motion.a>
          )
        })}
      </div>
    </div>
  )
}

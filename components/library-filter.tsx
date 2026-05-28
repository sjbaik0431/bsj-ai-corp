'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { Search, ShieldCheck, ShieldAlert, ShieldX, FileText } from 'lucide-react'

type Entry = {
  id: string
  title: string
  ownerLabel: string
  domain: string
  domainLabel: string
  createdAt: string
  auditVerdict?: 'pass' | 'flag' | 'fail'
  fileName: string
}

const verdictMap = {
  pass: { label: '감사 통과', bg: 'bg-emerald-50 text-emerald-700 border-emerald-200', ico: <ShieldCheck className="h-3.5 w-3.5" /> },
  flag: { label: '검토 권고', bg: 'bg-amber-50 text-amber-700 border-amber-200', ico: <ShieldAlert className="h-3.5 w-3.5" /> },
  fail: { label: '재작성 필요', bg: 'bg-rose-50 text-rose-700 border-rose-200', ico: <ShieldX className="h-3.5 w-3.5" /> },
}

type VerdictFilter = 'all' | 'pass' | 'flag' | 'fail' | 'none'

export function LibraryFilter({ entries, domain }: { entries: Entry[]; domain: string }) {
  const [query, setQuery] = useState('')
  const [verdict, setVerdict] = useState<VerdictFilter>('all')

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return entries.filter((e) => {
      if (verdict !== 'all') {
        if (verdict === 'none') {
          if (e.auditVerdict) return false
        } else if (e.auditVerdict !== verdict) return false
      }
      if (!q) return true
      return e.title.toLowerCase().includes(q) || e.ownerLabel.toLowerCase().includes(q) || e.id.includes(q)
    })
  }, [entries, query, verdict])

  const verdictCount = useMemo(() => ({
    all: entries.length,
    pass: entries.filter((e) => e.auditVerdict === 'pass').length,
    flag: entries.filter((e) => e.auditVerdict === 'flag').length,
    fail: entries.filter((e) => e.auditVerdict === 'fail').length,
    none: entries.filter((e) => !e.auditVerdict).length,
  }), [entries])

  return (
    <div>
      <div className="flex flex-col md:flex-row gap-3 mb-5">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="제목·담당·번호로 검색"
            className="w-full rounded-2xl border border-slate-200 bg-white/80 pl-10 pr-4 py-2.5 text-sm outline-none focus:border-bsj-primary focus:ring-2 focus:ring-bsj-primary/20"
          />
        </div>
        <div className="flex flex-wrap gap-1.5">
          {(['all', 'pass', 'flag', 'fail', 'none'] as VerdictFilter[]).map((v) => (
            <button
              key={v}
              onClick={() => setVerdict(v)}
              className={`text-xs rounded-full px-3 py-1.5 border transition ${
                verdict === v
                  ? 'bg-bsj-primary text-white border-bsj-primary'
                  : 'bg-white/70 border-slate-200 text-slate-600 hover:border-bsj-primary'
              }`}
            >
              {v === 'all' ? '전체' : v === 'none' ? '감사 무관' : verdictMap[v].label} ({verdictCount[v]})
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="glass rounded-2xl p-10 text-center text-sm text-slate-500">
          {entries.length === 0
            ? '이 도메인에 게시된 자료가 아직 없습니다. 본부장이 이 영역의 과제를 완료하면 여기에 자동 게시됩니다.'
            : '검색 조건에 맞는 자료가 없습니다.'}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((e) => {
            const v = e.auditVerdict ? verdictMap[e.auditVerdict] : null
            const created = new Date(e.createdAt)
            const dateStr = `${created.getFullYear()}-${String(created.getMonth() + 1).padStart(2, '0')}-${String(created.getDate()).padStart(2, '0')}`
            return (
              <Link
                key={e.fileName}
                href={`/library/${domain}/${encodeURIComponent(e.fileName)}`}
                className="glass rounded-2xl p-5 shadow-sm hover:shadow-lg transition-all group"
              >
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-slate-500 to-slate-700 flex items-center justify-center text-white shadow shrink-0">
                    <FileText className="h-5 w-5" />
                  </div>
                  {v && (
                    <span className={`inline-flex items-center gap-1 text-[11px] rounded-full px-2 py-0.5 border ${v.bg}`}>
                      {v.ico}{v.label}
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-400">#{e.id} · {dateStr}</p>
                <h3 className="font-semibold text-bsj-ink mt-1 line-clamp-2 group-hover:text-bsj-primary transition">{e.title}</h3>
                <p className="mt-2 text-xs text-slate-500">{e.ownerLabel}</p>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}

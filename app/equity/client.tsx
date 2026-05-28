'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Gift, Loader2 } from 'lucide-react'

type ShareKey = 'bsj' | 'bonbujang' | 'gihoek' | 'saeop' | 'gamsa' | 'minwon'

type EquityState = {
  holdings: Record<ShareKey, number>
  history: Array<{ date: string; fromKey: ShareKey; toKey: ShareKey; pct: number; reason: string }>
}

const SHARE_META: { key: ShareKey; label: string; role: string; color: string }[] = [
  { key: 'bsj',       label: 'BSJ (백상진)', role: '대주주 · 이사회 의장',  color: 'bg-amber-400' },
  { key: 'bonbujang', label: '본부장',         role: 'CEO · 업무 분장',     color: 'bg-sky-500' },
  { key: 'gihoek',    label: '기획팀장',       role: 'CSO · 조사·설계',      color: 'bg-emerald-500' },
  { key: 'saeop',     label: '사업팀장',       role: 'COO · 구축·실행',      color: 'bg-rose-500' },
  { key: 'gamsa',     label: '마누라',         role: 'CIA · 팩트체크',       color: 'bg-purple-500' },
  { key: 'minwon',    label: '민원팀장',       role: 'CCO · 외부 연결',      color: 'bg-pink-500' },
]

const KEY_LABEL: Record<ShareKey, string> = Object.fromEntries(SHARE_META.map((s) => [s.key, s.label])) as Record<ShareKey, string>

const ELIGIBLE: { key: 'bonbujang' | 'gihoek' | 'saeop' | 'gamsa' | 'minwon'; label: string }[] = [
  { key: 'bonbujang', label: '본부장' },
  { key: 'gihoek', label: '기획팀장' },
  { key: 'saeop', label: '사업팀장' },
  { key: 'gamsa', label: '마누라' },
  { key: 'minwon', label: '민원팀장' },
]

export function EquityClient({ initialState }: { initialState: EquityState }) {
  const [state, setState] = useState<EquityState>(initialState)
  const [pending, setPending] = useState<string | null>(null)
  const [reasonFor, setReasonFor] = useState<string | null>(null)
  const [reason, setReason] = useState('')

  async function transfer(to: string) {
    setPending(to)
    try {
      const r = await fetch('/api/equity', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to, pct: 1, reason: reason || '월간 성과 평가' }),
      })
      const d = await r.json()
      if (d.ok) {
        setState(d.state)
        setReasonFor(null)
        setReason('')
      } else {
        alert(d.error)
      }
    } finally {
      setPending(null)
    }
  }

  return (
    <main className="mx-auto max-w-4xl px-4 py-10 md:px-8">
      <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-bsj-primary transition mb-6">
        <ArrowLeft className="h-4 w-4" />
        메인으로
      </Link>

      <h1 className="text-3xl md:text-4xl font-bold text-bsj-ink">주주총회 · 크레딧</h1>
      <p className="mt-2 text-slate-600">월간 성과 평가 후 BSJ 지분 1%를 우수 팀장에게 크레딧으로 양도</p>

      <section className="mt-8">
        <h2 className="text-xl font-semibold">Cap Table (현재)</h2>
        <div className="mt-4 space-y-3">
          {SHARE_META.map((row) => {
            const share = state.holdings[row.key] ?? 0
            return (
              <div key={row.key} className="rounded-2xl bg-white p-4 shadow-sm border border-slate-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold">{row.label}</p>
                    <p className="text-sm text-slate-500">{row.role}</p>
                  </div>
                  <p className="text-2xl font-bold tabular-nums">{share.toFixed(0)}%</p>
                </div>
                <div className="mt-3 h-2 w-full rounded-full bg-slate-100">
                  <div className={`${row.color} h-2 rounded-full transition-all duration-500`} style={{ width: `${share}%` }} />
                </div>
              </div>
            )
          })}
        </div>
      </section>

      <section className="mt-10">
        <h2 className="text-xl font-semibold">월간 평가 · 크레딧 양도</h2>
        <p className="mt-2 text-sm text-slate-500">BSJ 지분에서 1%씩 우수 팀장에게 양도. 일단 평가 사유 메모를 남기고 양도 버튼을 누르세요.</p>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {ELIGIBLE.map((m) => (
            <div key={m.key} className="rounded-2xl bg-white p-4 border border-slate-100 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold">{m.label}</p>
                  <p className="text-xs text-slate-500 mt-0.5">현재 {(state.holdings[m.key] ?? 0).toFixed(0)}% · BSJ 잔여 {state.holdings.bsj.toFixed(0)}%</p>
                </div>
                <button
                  onClick={() => setReasonFor(m.key)}
                  disabled={pending !== null || state.holdings.bsj < 1}
                  className="rounded-xl bg-bsj-primary text-white px-3 py-1.5 text-xs font-medium hover:shadow disabled:opacity-50 inline-flex items-center gap-1.5"
                >
                  <Gift className="h-3.5 w-3.5" />
                  1% 양도
                </button>
              </div>
              {reasonFor === m.key && (
                <div className="mt-3 space-y-2">
                  <textarea
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    rows={2}
                    placeholder="평가 사유 (예: 이달 IR 산출 품질 최고)"
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-bsj-primary"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => transfer(m.key)}
                      disabled={pending !== null || !reason.trim()}
                      className="flex-1 rounded-xl bg-emerald-500 text-white py-1.5 text-sm font-medium hover:shadow disabled:opacity-50 inline-flex items-center justify-center gap-1.5"
                    >
                      {pending === m.key ? <Loader2 className="h-4 w-4 animate-spin" /> : '확정 양도'}
                    </button>
                    <button
                      onClick={() => { setReasonFor(null); setReason('') }}
                      className="rounded-xl border border-slate-200 px-3 text-sm text-slate-600 hover:bg-slate-50"
                    >
                      취소
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      <section className="mt-10">
        <h2 className="text-xl font-semibold">양도 히스토리</h2>
        {state.history.length === 0 ? (
          <p className="mt-3 text-sm text-slate-400">아직 양도 기록이 없습니다.</p>
        ) : (
          <ul className="mt-4 space-y-2">
            {state.history.map((h, i) => (
              <li key={i} className="rounded-2xl bg-white p-3 border border-slate-100 shadow-sm text-sm flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-medium text-bsj-ink">
                    {KEY_LABEL[h.fromKey]} → {KEY_LABEL[h.toKey]} · {h.pct}%
                  </p>
                  <p className="text-xs text-slate-500 truncate mt-0.5">{h.reason}</p>
                </div>
                <span className="text-[11px] text-slate-400 shrink-0">{new Date(h.date).toLocaleDateString('ko-KR')}</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  )
}

'use client'

import { useEffect, useState } from 'react'
import { Sparkles, Loader2, ExternalLink, CheckCircle2, AlertCircle, Eye } from 'lucide-react'

type State =
  | { kind: 'idle' }
  | { kind: 'pending'; phase: 'building' | 'publishing' }
  | { kind: 'built'; previewUrl: string; bytes: number; at: string }
  | { kind: 'published'; liveUrl: string; previewUrl: string; bytes: number; at: string; message: string }
  | { kind: 'error'; error: string }

export function DashboardPublishBar() {
  const [state, setState] = useState<State>({ kind: 'idle' })

  useEffect(() => {
    fetch('/api/dashboard')
      .then((r) => r.json())
      .then((d) => {
        if (d.exists) {
          setState({ kind: 'built', previewUrl: d.previewUrl, bytes: 0, at: d.generatedAt })
        }
      })
      .catch(() => {})
  }, [])

  async function build() {
    setState({ kind: 'pending', phase: 'building' })
    try {
      const r = await fetch('/api/dashboard?mode=build', { method: 'POST' })
      const d = await r.json()
      if (!r.ok || !d.ok) {
        setState({ kind: 'error', error: d.error ?? '빌드 실패' })
        return
      }
      setState({ kind: 'built', previewUrl: d.previewUrl, bytes: d.bytes, at: new Date().toISOString() })
    } catch (e) {
      setState({ kind: 'error', error: e instanceof Error ? e.message : String(e) })
    }
  }

  async function publish() {
    setState({ kind: 'pending', phase: 'publishing' })
    try {
      const r = await fetch('/api/dashboard?mode=publish', { method: 'POST' })
      const d = await r.json()
      if (!r.ok || !d.ok) {
        setState({ kind: 'error', error: d.error ?? d.message ?? '게시 실패' })
        return
      }
      setState({
        kind: 'published',
        liveUrl: d.liveUrl,
        previewUrl: '/_dashboard_preview/index.html',
        bytes: d.bytes,
        at: new Date().toISOString(),
        message: d.message ?? '게시 완료',
      })
    } catch (e) {
      setState({ kind: 'error', error: e instanceof Error ? e.message : String(e) })
    }
  }

  return (
    <div className="glass rounded-2xl p-3 shadow-sm flex flex-wrap items-center gap-3">
      <div className="flex-1 min-w-[200px]">
        <p className="text-sm font-semibold text-bsj-ink">📡 통합 터미널 (Bloomberg 스타일)</p>
        <p className="text-[11px] text-slate-500 mt-0.5">
          {state.kind === 'pending' && state.phase === 'building' && '대시보드 HTML 생성 중...'}
          {state.kind === 'pending' && state.phase === 'publishing' && 'GitHub claude 레포에 push 중...'}
          {state.kind === 'idle' && '아직 빌드 안 됨 — "지금 빌드" 클릭'}
          {state.kind === 'built' && `로컬 미리보기 준비됨 (${(state.bytes / 1024).toFixed(1)}KB)`}
          {state.kind === 'published' && `✓ ${state.message} — 라이브 반영 완료`}
          {state.kind === 'error' && <span className="text-rose-600">⚠ {state.error}</span>}
        </p>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={build}
          disabled={state.kind === 'pending'}
          className="rounded-xl bg-white border border-slate-200 px-3 py-1.5 text-xs font-medium hover:border-bsj-primary hover:text-bsj-primary transition inline-flex items-center gap-1.5 disabled:opacity-50"
        >
          {state.kind === 'pending' && state.phase === 'building' ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Sparkles className="h-3.5 w-3.5" />
          )}
          지금 빌드
        </button>

        {(state.kind === 'built' || state.kind === 'published') && (
          <a
            href={state.previewUrl}
            target="_blank"
            rel="noopener"
            className="rounded-xl bg-white border border-slate-200 px-3 py-1.5 text-xs font-medium hover:border-bsj-primary hover:text-bsj-primary transition inline-flex items-center gap-1.5"
          >
            <Eye className="h-3.5 w-3.5" />
            로컬 미리보기
          </a>
        )}

        <button
          onClick={publish}
          disabled={state.kind === 'pending'}
          className="rounded-xl bg-gradient-to-r from-bsj-primary to-sky-500 px-3 py-1.5 text-xs font-medium text-white hover:shadow-lg active:scale-95 transition inline-flex items-center gap-1.5 disabled:opacity-50"
        >
          {state.kind === 'pending' && state.phase === 'publishing' ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <ExternalLink className="h-3.5 w-3.5" />
          )}
          GitHub 게시
        </button>

        {state.kind === 'published' && (
          <a
            href={state.liveUrl}
            target="_blank"
            rel="noopener"
            className="rounded-xl bg-emerald-500 text-white px-3 py-1.5 text-xs font-medium hover:shadow-lg active:scale-95 transition inline-flex items-center gap-1.5"
          >
            <CheckCircle2 className="h-3.5 w-3.5" />
            라이브 열기
          </a>
        )}
      </div>
    </div>
  )
}

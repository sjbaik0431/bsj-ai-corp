'use client'

import { useState, useRef } from 'react'
import { Send, Paperclip, Mic, Sparkles, Loader2, CheckCircle2, AlertCircle } from 'lucide-react'

type Reply = { ok: true; ownerLabel: string; title: string; reply: string } | { ok: false; error: string }

export function TaskInput() {
  const [text, setText] = useState('')
  const [files, setFiles] = useState<File[]>([])
  const [pending, setPending] = useState(false)
  const [reply, setReply] = useState<Reply | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  const samples = [
    '조아호텔 5월 매출 정리해서 IR 자료 만들어줘',
    '나라장터 이번주 MICE 입찰 공고 조사',
    '진천메가폴리스 입주 문의 고객 응대 메일 초안',
  ]

  async function submit() {
    if (!text.trim() || pending) return
    setPending(true)
    setReply(null)
    try {
      const res = await fetch('/api/task', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      })
      const data = await res.json()
      if (!res.ok || !data.ok) {
        setReply({ ok: false, error: data.error ?? '서버 오류' })
      } else {
        setReply({
          ok: true,
          ownerLabel: data.task.ownerLabel,
          title: data.task.title,
          reply: data.initialReply,
        })
        setText('')
        setFiles([])
        // notify live-tasks to refresh immediately
        window.dispatchEvent(new CustomEvent('bsj:task-created'))
      }
    } catch (e) {
      setReply({ ok: false, error: e instanceof Error ? e.message : String(e) })
    } finally {
      setPending(false)
    }
  }

  return (
    <div className="glass rounded-3xl p-5 md:p-6 shadow-sm">
      <div className="flex items-center gap-2 mb-3">
        <Sparkles className="h-5 w-5 text-bsj-accent" />
        <h2 className="text-lg font-bold text-bsj-ink">무엇을 도와드릴까요?</h2>
      </div>

      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) submit()
        }}
        placeholder="과제를 입력하세요. Ctrl+Enter로 전송."
        rows={3}
        disabled={pending}
        className="w-full rounded-2xl border border-slate-200 bg-white/80 p-4 text-base outline-none focus:border-bsj-primary focus:ring-2 focus:ring-bsj-primary/20 resize-none disabled:opacity-60"
      />

      {files.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-2">
          {files.map((f, i) => (
            <span key={i} className="text-xs rounded-lg bg-slate-100 px-2 py-1">📎 {f.name}</span>
          ))}
        </div>
      )}

      <div className="mt-3 flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <input
            ref={fileRef}
            type="file"
            multiple
            className="hidden"
            onChange={(e) => setFiles(Array.from(e.target.files ?? []))}
          />
          <button onClick={() => fileRef.current?.click()} className="rounded-xl p-2 hover:bg-slate-100 transition" aria-label="파일 첨부">
            <Paperclip className="h-5 w-5 text-slate-600" />
          </button>
          <button className="rounded-xl p-2 hover:bg-slate-100 transition" aria-label="음성 입력">
            <Mic className="h-5 w-5 text-slate-600" />
          </button>
        </div>
        <button
          onClick={submit}
          disabled={pending || !text.trim()}
          className="rounded-2xl bg-gradient-to-r from-bsj-primary to-sky-500 px-5 py-2.5 text-white font-medium shadow-md hover:shadow-lg active:scale-95 transition flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          {pending ? '본부장 검토 중...' : '본부장에게 전달'}
        </button>
      </div>

      {reply && (
        <div className={`mt-4 rounded-2xl p-4 border ${reply.ok ? 'bg-sky-50 border-sky-200' : 'bg-rose-50 border-rose-200'}`}>
          {reply.ok ? (
            <div>
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle2 className="h-4 w-4 text-sky-600" />
                <span className="font-semibold text-bsj-ink">본부장</span>
                <span className="text-slate-500">→ {reply.ownerLabel}에게 배정</span>
              </div>
              <p className="mt-1 text-xs text-slate-500">"{reply.title}"</p>
              <p className="mt-2 text-sm text-slate-700 whitespace-pre-wrap">{reply.reply}</p>
            </div>
          ) : (
            <div className="flex items-start gap-2 text-sm text-rose-700">
              <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
              <span>{reply.error}</span>
            </div>
          )}
        </div>
      )}

      <div className="mt-4 flex flex-wrap gap-2">
        {samples.map((s) => (
          <button
            key={s}
            onClick={() => setText(s)}
            disabled={pending}
            className="text-xs rounded-full bg-white/70 border border-slate-200 px-3 py-1.5 text-slate-600 hover:bg-bsj-primary hover:text-white hover:border-bsj-primary transition disabled:opacity-50"
          >
            {s}
          </button>
        ))}
      </div>
    </div>
  )
}

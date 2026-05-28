'use client'

import { useState, useRef } from 'react'
import { Send, Paperclip, Mic, Sparkles } from 'lucide-react'

export function TaskInput() {
  const [text, setText] = useState('')
  const [files, setFiles] = useState<File[]>([])
  const fileRef = useRef<HTMLInputElement>(null)

  const samples = [
    '조아호텔 5월 매출 정리해서 IR 자료 만들어줘',
    '나라장터 이번주 MICE 입찰 공고 조사',
    '진천메가폴리스 입주 문의 고객 응대 메일 초안',
  ]

  const submit = async () => {
    if (!text.trim() && files.length === 0) return
    // Phase B에서 /api/task 연결
    alert('Phase B에서 본부장에게 자동 분배됩니다. (지금은 골격만)')
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
        placeholder="과제를 입력하세요. 파일을 끌어다 놓아도 됩니다."
        rows={3}
        className="w-full rounded-2xl border border-slate-200 bg-white/80 p-4 text-base outline-none focus:border-bsj-primary focus:ring-2 focus:ring-bsj-primary/20 resize-none"
      />

      {files.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-2">
          {files.map((f, i) => (
            <span key={i} className="text-xs rounded-lg bg-slate-100 px-2 py-1">
              📎 {f.name}
            </span>
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
          <button
            onClick={() => fileRef.current?.click()}
            className="rounded-xl p-2 hover:bg-slate-100 transition"
            aria-label="파일 첨부"
          >
            <Paperclip className="h-5 w-5 text-slate-600" />
          </button>
          <button className="rounded-xl p-2 hover:bg-slate-100 transition" aria-label="음성 입력">
            <Mic className="h-5 w-5 text-slate-600" />
          </button>
        </div>
        <button
          onClick={submit}
          className="rounded-2xl bg-gradient-to-r from-bsj-primary to-sky-500 px-5 py-2.5 text-white font-medium shadow-md hover:shadow-lg active:scale-95 transition flex items-center gap-2"
        >
          <Send className="h-4 w-4" />
          본부장에게 전달
        </button>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {samples.map((s) => (
          <button
            key={s}
            onClick={() => setText(s)}
            className="text-xs rounded-full bg-white/70 border border-slate-200 px-3 py-1.5 text-slate-600 hover:bg-bsj-primary hover:text-white hover:border-bsj-primary transition"
          >
            {s}
          </button>
        ))}
      </div>
    </div>
  )
}

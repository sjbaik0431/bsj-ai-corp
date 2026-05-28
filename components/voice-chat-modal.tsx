'use client'

import { useEffect, useRef, useState } from 'react'
import { X, Mic, Send, Loader2, Volume2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

type Turn = { who: 'me' | 'agent'; text: string }

export function VoiceChatModal({
  open,
  onClose,
  agentId,
  agentName,
  emoji,
  color,
}: {
  open: boolean
  onClose: () => void
  agentId: string
  agentName: string
  emoji: string
  color: string
}) {
  const [turns, setTurns] = useState<Turn[]>([])
  const [text, setText] = useState('')
  const [pending, setPending] = useState(false)
  const [recording, setRecording] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const recorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])

  useEffect(() => {
    if (!open) {
      setTurns([])
      setText('')
      setPending(false)
      setRecording(false)
      audioRef.current?.pause()
    }
  }, [open])

  async function send(input: string) {
    if (!input.trim() || pending) return
    setPending(true)
    setTurns((prev) => [...prev, { who: 'me', text: input }])
    setText('')
    try {
      const r = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ agent: agentId, text: input }),
      })
      const d = await r.json()
      if (r.ok && d.reply) {
        setTurns((prev) => [...prev, { who: 'agent', text: d.reply }])
        playTTS(d.reply)
      } else {
        setTurns((prev) => [...prev, { who: 'agent', text: '오류: ' + (d.error ?? '응답 실패') }])
      }
    } catch (e) {
      setTurns((prev) => [...prev, { who: 'agent', text: '오류: ' + (e instanceof Error ? e.message : String(e)) }])
    } finally {
      setPending(false)
    }
  }

  async function playTTS(text: string) {
    try {
      const r = await fetch('/api/voice/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, agent: agentId }),
      })
      if (!r.ok) return
      const blob = await r.blob()
      const url = URL.createObjectURL(blob)
      if (!audioRef.current) audioRef.current = new Audio()
      audioRef.current.src = url
      audioRef.current.play().catch(() => {})
    } catch {}
  }

  async function toggleRecord() {
    if (recording) {
      recorderRef.current?.stop()
      return
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mr = new MediaRecorder(stream)
      chunksRef.current = []
      mr.ondataavailable = (e) => chunksRef.current.push(e.data)
      mr.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop())
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' })
        const fd = new FormData()
        fd.append('audio', blob, 'speech.webm')
        setPending(true)
        try {
          const r = await fetch('/api/voice/stt', { method: 'POST', body: fd })
          const d = await r.json()
          if (r.ok && d.text) send(d.text)
        } catch {} finally {
          setPending(false)
          setRecording(false)
        }
      }
      recorderRef.current = mr
      mr.start()
      setRecording(true)
    } catch {
      setRecording(false)
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-slate-900/40 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 40, opacity: 0 }}
            className="w-full md:max-w-lg bg-white rounded-t-3xl md:rounded-3xl shadow-2xl flex flex-col max-h-[90vh] md:max-h-[80vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className={`h-11 w-11 rounded-2xl bg-gradient-to-br ${color} flex items-center justify-center text-2xl shadow`}>
                  {emoji}
                </div>
                <div>
                  <p className="font-bold text-bsj-ink">{agentName}</p>
                  <p className="text-[11px] text-slate-500">음성 채팅 (Whisper STT + TTS-1)</p>
                </div>
              </div>
              <button onClick={onClose} className="rounded-xl p-2 hover:bg-slate-100" aria-label="닫기">
                <X className="h-5 w-5 text-slate-500" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {turns.length === 0 ? (
                <div className="text-center text-sm text-slate-400 py-8">
                  음성 버튼을 누르거나 메시지를 입력해서 대화를 시작하세요.
                </div>
              ) : (
                turns.map((t, i) => (
                  <div key={i} className={`flex ${t.who === 'me' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] rounded-2xl px-3.5 py-2 text-sm ${t.who === 'me' ? 'bg-bsj-primary text-white' : 'bg-slate-100 text-slate-800'}`}>
                      {t.text}
                    </div>
                  </div>
                ))
              )}
              {pending && (
                <div className="flex justify-start">
                  <div className="rounded-2xl px-3.5 py-2 text-sm bg-slate-100 text-slate-500 inline-flex items-center gap-2">
                    <Loader2 className="h-3 w-3 animate-spin" /> 답변 작성 중...
                  </div>
                </div>
              )}
            </div>

            <div className="border-t border-slate-100 p-3 flex items-center gap-2">
              <button
                onClick={toggleRecord}
                disabled={pending && !recording}
                className={`rounded-xl p-2.5 transition ${recording ? 'bg-rose-100 text-rose-600' : 'hover:bg-slate-100 text-slate-600'} disabled:opacity-50`}
                aria-label="음성 입력"
              >
                <Mic className={`h-5 w-5 ${recording ? 'animate-pulse' : ''}`} />
              </button>
              <input
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') send(text) }}
                placeholder="메시지 입력 또는 마이크"
                className="flex-1 rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-bsj-primary"
                disabled={pending}
              />
              <button
                onClick={() => send(text)}
                disabled={pending || !text.trim()}
                className="rounded-xl p-2.5 bg-bsj-primary text-white hover:shadow disabled:opacity-50"
                aria-label="전송"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
            <div className="px-4 pb-3 text-[10px] text-slate-400 inline-flex items-center gap-1">
              <Volume2 className="h-3 w-3" />
              응답은 자동 재생됩니다 (브라우저 자동재생 정책에 따라 첫 클릭 필요)
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

import { NextRequest } from 'next/server'
import { openai } from '@/lib/openai'

export async function POST(req: NextRequest) {
  try {
    const form = await req.formData()
    const audio = form.get('audio')
    if (!(audio instanceof File)) return Response.json({ error: 'audio 파일이 없습니다' }, { status: 400 })

    const res = await openai().audio.transcriptions.create({
      file: audio,
      model: 'whisper-1',
      language: 'ko',
    })

    return Response.json({ ok: true, text: res.text })
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e)
    console.error('[stt]', msg)
    return Response.json({ error: msg }, { status: 500 })
  }
}

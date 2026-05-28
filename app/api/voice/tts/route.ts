import { NextRequest } from 'next/server'
import { openai, AGENT_VOICE } from '@/lib/openai'
import type { AgentId } from '@/lib/anthropic'

export async function POST(req: NextRequest) {
  try {
    const { text, agent } = await req.json() as { text?: string; agent?: AgentId }
    if (!text) return Response.json({ error: 'text가 없습니다' }, { status: 400 })

    const voice = (agent && AGENT_VOICE[agent]) || 'alloy'

    const res = await openai().audio.speech.create({
      model: 'tts-1',
      voice,
      input: text.slice(0, 4000),
      response_format: 'mp3',
    })

    const buf = Buffer.from(await res.arrayBuffer())
    return new Response(buf, {
      status: 200,
      headers: {
        'Content-Type': 'audio/mpeg',
        'Content-Length': String(buf.length),
        'Cache-Control': 'no-store',
      },
    })
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e)
    console.error('[tts]', msg)
    return Response.json({ error: msg }, { status: 500 })
  }
}

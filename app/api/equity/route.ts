import { NextRequest } from 'next/server'
import { loadEquity, transferShare } from '@/lib/store/equity'
import type { AgentId } from '@/lib/anthropic'

const VALID: AgentId[] = ['bonbujang', 'gihoek', 'saeop', 'gamsa', 'minwon']

export async function GET() {
  const state = await loadEquity()
  return Response.json(state)
}

export async function POST(req: NextRequest) {
  try {
    const { to, pct, reason } = await req.json() as { to?: AgentId; pct?: number; reason?: string }
    if (!to || !VALID.includes(to)) return Response.json({ error: 'invalid recipient' }, { status: 400 })
    const amount = typeof pct === 'number' ? pct : 1
    if (amount <= 0 || amount > 5) return Response.json({ error: 'pct 1-5 사이' }, { status: 400 })
    const state = await transferShare(to, amount, (reason ?? '').toString())
    return Response.json({ ok: true, state })
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e)
    return Response.json({ error: msg }, { status: 500 })
  }
}

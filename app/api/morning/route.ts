import { NextRequest } from 'next/server'
import { loadMorningBrief, generateMorningBrief } from '@/lib/morning/brief'

export async function GET() {
  const brief = await loadMorningBrief()
  return Response.json({ brief })
}

export async function POST(req: NextRequest) {
  const url = new URL(req.url)
  const force = url.searchParams.get('force') === '1'
  try {
    const existing = await loadMorningBrief()
    const today = new Date().toISOString().slice(0, 10)
    if (existing && existing.date === today && !force) {
      return Response.json({ brief: existing, cached: true })
    }
    const brief = await generateMorningBrief()
    return Response.json({ brief, cached: false })
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e)
    console.error('[morning]', msg)
    return Response.json({ error: msg }, { status: 500 })
  }
}

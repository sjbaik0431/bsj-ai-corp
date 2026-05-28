import { NextRequest } from 'next/server'
import { list } from '@/lib/store/tasks'

export async function GET(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params
  const all = await list()
  const task = all.find((t) => t.id === id)
  if (!task) return Response.json({ error: 'not found' }, { status: 404 })
  return Response.json({ task })
}

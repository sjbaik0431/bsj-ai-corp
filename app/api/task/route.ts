import { NextRequest } from 'next/server'
import { routeTask, ownerLabel } from '@/lib/agents/orchestrator'
import { executeTask } from '@/lib/agents/executor'
import { create, list } from '@/lib/store/tasks'

export async function POST(req: NextRequest) {
  let body: { text?: string } = {}
  try {
    body = await req.json()
  } catch {
    return Response.json({ error: 'invalid json' }, { status: 400 })
  }

  const text = (body.text ?? '').trim()
  if (!text) return Response.json({ error: 'text가 비어있습니다' }, { status: 400 })

  try {
    const decision = await routeTask(text)
    const task = await create({
      userInput: text,
      owner: decision.owner,
      ownerLabel: ownerLabel(decision.owner),
      title: decision.title,
      status: 'analyzing',
      progress: 10,
      decisionSummary: decision.decisionSummary,
      needsAudit: decision.needsAudit,
      domain: decision.domain,
    })

    // 백그라운드 팀장 실행 (응답 차단 안 함)
    queueMicrotask(() => {
      executeTask(task).catch((e) => console.error('[executeTask]', e))
    })

    return Response.json({
      ok: true,
      task,
      initialReply: decision.initialReply,
      estimatedMinutes: decision.estimatedMinutes,
    })
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e)
    console.error('[task POST]', msg)
    return Response.json({ error: msg }, { status: 500 })
  }
}

export async function GET() {
  const tasks = await list()
  return Response.json({ tasks })
}

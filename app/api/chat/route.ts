import { NextRequest } from 'next/server'
import { anthropic, AGENT_TO_MODEL, AGENT_LABEL, type AgentId } from '@/lib/anthropic'
import { loadPrompt } from '@/lib/agents/prompts'

const CHAT_SUFFIX = `
---
[음성 채팅 모드]
사용자(BSJ)가 음성으로 짧게 묻고 답합니다. 2-4문장 이내로 본인 직무 정체성에 맞게 답해주세요.
- 한국어, 구어체
- 마크다운 X, 평문만
- 길게 보고할 일은 "정식 과제로 입력 부탁드립니다" 안내
`

const VALID_AGENTS: AgentId[] = ['bonbujang', 'gihoek', 'saeop', 'gamsa', 'minwon']

export async function POST(req: NextRequest) {
  try {
    const { agent, text } = await req.json() as { agent?: AgentId; text?: string }
    if (!agent || !VALID_AGENTS.includes(agent)) return Response.json({ error: 'invalid agent' }, { status: 400 })
    if (!text?.trim()) return Response.json({ error: 'text 비어있음' }, { status: 400 })

    const prompt = await loadPrompt(agent)
    const res = await anthropic().messages.create({
      model: AGENT_TO_MODEL[agent],
      max_tokens: 400,
      system: prompt + CHAT_SUFFIX,
      messages: [{ role: 'user', content: text }],
    })

    const reply = res.content
      .filter((b) => b.type === 'text')
      .map((b) => (b as { type: 'text'; text: string }).text)
      .join('')
      .trim()

    return Response.json({ ok: true, reply, label: AGENT_LABEL[agent] })
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e)
    console.error('[chat]', msg)
    return Response.json({ error: msg }, { status: 500 })
  }
}

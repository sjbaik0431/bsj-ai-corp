import { anthropic, AGENT_TO_MODEL, AGENT_LABEL, type AgentId } from '@/lib/anthropic'
import { loadPrompt, loadRouter } from './prompts'

export type RoutingDecision = {
  owner: AgentId
  title: string
  decisionSummary: string
  estimatedMinutes: number
  initialReply: string
  needsAudit: boolean
}

const VALID_OWNERS: AgentId[] = ['bonbujang', 'gihoek', 'saeop', 'gamsa', 'minwon']

const SYSTEM_SUFFIX = `
---
[라우팅 작업 모드]
사용자가 새 과제를 입력했습니다. 본 메시지에 대해서는 **반드시 아래 JSON 형식 한 덩어리로만** 응답하세요. 다른 문장이나 마크다운 펜스는 일절 추가하지 마세요.

{
  "owner": "<gihoek|saeop|gamsa|minwon — 가장 적합한 1명. 본부장 자기 자신, 그리고 감사팀장은 owner로 지정 금지(감사팀장은 needsAudit=true일 때 자동 호출)>",
  "title": "<8-24자 한국어 작업 제목>",
  "decisionSummary": "<왜 그 팀장에게 맡겼는지 + 무엇을 산출할지 1-2문장>",
  "estimatedMinutes": <정수, 5-180 사이 추정>,
  "initialReply": "<사용자에게 보낼 본부장 답변 2-4문장. 작업 받았다는 확인 + 어떻게 진행할지 + 결과 전달 방식>",
  "needsAudit": <true|false — 외부 발송(이메일/카톡/공식문서), 공식 보고서, IR/제안서, 수치·법령·일정이 외부에 노출되는 산출물이면 true. 내부 메모/조사 요약/초안만 보기용은 false>
}
`

export async function routeTask(userInput: string): Promise<RoutingDecision> {
  const [bonbujangPrompt, routerRules] = await Promise.all([
    loadPrompt('bonbujang'),
    loadRouter(),
  ])

  const system = `${bonbujangPrompt}\n\n## 라우팅 규칙 참조\n${routerRules}\n${SYSTEM_SUFFIX}`

  const res = await anthropic().messages.create({
    model: AGENT_TO_MODEL.bonbujang,
    max_tokens: 1024,
    system,
    messages: [{ role: 'user', content: userInput }],
  })

  const text = res.content
    .filter((b) => b.type === 'text')
    .map((b) => (b as { type: 'text'; text: string }).text)
    .join('')
    .trim()

  const json = extractJson(text)
  const parsed = JSON.parse(json) as Partial<RoutingDecision>

  const owner = (parsed.owner ?? 'gihoek') as AgentId
  const safeOwner = VALID_OWNERS.includes(owner) && owner !== 'bonbujang' ? owner : 'gihoek'

  return {
    owner: safeOwner,
    title: String(parsed.title ?? '제목 미정').slice(0, 40),
    decisionSummary: String(parsed.decisionSummary ?? ''),
    estimatedMinutes: clampInt(parsed.estimatedMinutes, 5, 180, 30),
    initialReply: String(parsed.initialReply ?? '과제를 접수했습니다. 곧 진행 상황 공유드리겠습니다.'),
    needsAudit: Boolean(parsed.needsAudit),
  }
}

function extractJson(text: string): string {
  // 펜스가 있어도 안전하게 첫 { 부터 마지막 } 까지
  const start = text.indexOf('{')
  const end = text.lastIndexOf('}')
  if (start < 0 || end < 0 || end <= start) {
    throw new Error(`본부장 응답에서 JSON을 찾지 못함: ${text.slice(0, 200)}`)
  }
  return text.slice(start, end + 1)
}

function clampInt(v: unknown, min: number, max: number, fallback: number): number {
  const n = typeof v === 'number' ? Math.round(v) : parseInt(String(v), 10)
  if (Number.isNaN(n)) return fallback
  return Math.max(min, Math.min(max, n))
}

export function ownerLabel(o: AgentId): string {
  return AGENT_LABEL[o]
}

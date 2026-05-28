import Anthropic from '@anthropic-ai/sdk'

export const MODELS = {
  opus: 'claude-opus-4-7',
  sonnet: 'claude-sonnet-4-6',
  haiku: 'claude-haiku-4-5-20251001',
} as const

let cached: Anthropic | null = null

export function anthropic() {
  if (cached) return cached
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) throw new Error('ANTHROPIC_API_KEY 미설정 — .env.local에 추가하세요.')
  cached = new Anthropic({ apiKey })
  return cached
}

export type AgentId = 'bonbujang' | 'gihoek' | 'saeop' | 'gamsa' | 'minwon'

export const AGENT_TO_MODEL: Record<AgentId, string> = {
  bonbujang: MODELS.opus,
  gihoek: MODELS.sonnet,
  saeop: MODELS.sonnet,
  gamsa: MODELS.sonnet,
  minwon: MODELS.sonnet,
}

export const AGENT_LABEL: Record<AgentId, string> = {
  bonbujang: '본부장',
  gihoek: '기획팀장',
  saeop: '사업팀장',
  gamsa: '감사팀장',
  minwon: '민원팀장',
}

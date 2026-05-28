import OpenAI from 'openai'
import type { AgentId } from './anthropic'

let cached: OpenAI | null = null

export function openai() {
  if (cached) return cached
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) throw new Error('OPENAI_API_KEY 미설정 — .env.local에 추가하세요.')
  cached = new OpenAI({ apiKey })
  return cached
}

// 5인에게 다른 보이스 배정 (OpenAI TTS-1 6종)
export const AGENT_VOICE: Record<AgentId, 'alloy' | 'echo' | 'fable' | 'onyx' | 'nova' | 'shimmer'> = {
  bonbujang: 'onyx',
  gihoek: 'echo',
  saeop: 'alloy',
  gamsa: 'shimmer',
  minwon: 'nova',
}

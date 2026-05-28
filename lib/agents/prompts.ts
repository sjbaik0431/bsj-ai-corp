import { readFile } from 'node:fs/promises'
import path from 'node:path'
import type { AgentId } from '@/lib/anthropic'

const FILE_MAP: Record<AgentId, string> = {
  bonbujang: '01-bonbujang.md',
  gihoek: '02-gihoek.md',
  saeop: '03-saeop.md',
  gamsa: '04-gamsa.md',
  minwon: '05-minwon.md',
}

const cache = new Map<AgentId, string>()

function stripFrontmatter(md: string): string {
  if (md.startsWith('---')) {
    const end = md.indexOf('\n---', 3)
    if (end > 0) return md.slice(end + 4).trimStart()
  }
  return md
}

export async function loadPrompt(agent: AgentId): Promise<string> {
  if (cache.has(agent)) return cache.get(agent)!
  const file = path.join(process.cwd(), 'agents-memory', FILE_MAP[agent])
  const raw = await readFile(file, 'utf-8')
  const body = stripFrontmatter(raw)
  cache.set(agent, body)
  return body
}

export async function loadRouter(): Promise<string> {
  const file = path.join(process.cwd(), 'agents-memory', '_meta', 'router.md')
  const raw = await readFile(file, 'utf-8')
  return stripFrontmatter(raw)
}

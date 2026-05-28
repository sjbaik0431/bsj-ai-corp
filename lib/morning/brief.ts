import { readFile, writeFile, mkdir } from 'node:fs/promises'
import path from 'node:path'
import { anthropic, AGENT_TO_MODEL } from '@/lib/anthropic'
import { loadPrompt } from '@/lib/agents/prompts'
import { list as listTasks } from '@/lib/store/tasks'
import { pickMusic, pickPoem, type Music, type Poem } from './picks'

const DATA_DIR = path.join(process.cwd(), 'data')
const BRIEF_FILE = path.join(DATA_DIR, 'morning.json')

export type MorningBrief = {
  date: string
  generatedAt: string
  briefMarkdown: string
  music: Music
  poem: Poem
}

export async function loadMorningBrief(): Promise<MorningBrief | null> {
  try {
    const raw = await readFile(BRIEF_FILE, 'utf-8')
    return JSON.parse(raw) as MorningBrief
  } catch (e: unknown) {
    if ((e as NodeJS.ErrnoException).code === 'ENOENT') return null
    throw e
  }
}

async function saveMorningBrief(b: MorningBrief) {
  await mkdir(DATA_DIR, { recursive: true })
  await writeFile(BRIEF_FILE, JSON.stringify(b, null, 2), 'utf-8')
}

export async function generateMorningBrief(): Promise<MorningBrief> {
  const today = new Date()
  const dateStr = today.toISOString().slice(0, 10)

  const tasks = await listTasks()
  const active = tasks.filter((t) => t.status !== 'done' && t.status !== 'failed')
  const recentDone = tasks.filter((t) => t.status === 'done').slice(0, 3)

  const bonbujangPrompt = await loadPrompt('bonbujang')
  const system = `${bonbujangPrompt}

---
[모닝 브리핑 작성 모드]
오늘 ${dateStr} 아침 BSJ님에게 보내는 일일 브리핑을 짧은 마크다운으로 작성하세요.

구성:
- 한 줄 인사 (계절/요일 감각)
- ## 오늘의 우선순위 — 활성 작업 정리 + 추천 액션 2-3개
- ## 최근 완료 — 어제까지 마친 일 요약
- ## 본부장 한마디 — 격려 또는 짧은 조언 1-2문장

마크다운 본문만 출력. 200-400 단어.`

  const ctx = `## 활성 작업 ${active.length}건
${active.map((t) => `- #${t.id} ${t.title} (담당: ${t.ownerLabel}, 진행 ${t.progress}%)`).join('\n') || '_없음_'}

## 최근 완료 ${recentDone.length}건
${recentDone.map((t) => `- #${t.id} ${t.title} (${t.ownerLabel})`).join('\n') || '_없음_'}

위 자료를 바탕으로 오늘 BSJ님이 어떤 우선순위로 하루를 시작하면 좋을지 정리해 주세요.`

  const res = await anthropic().messages.create({
    model: AGENT_TO_MODEL.bonbujang,
    max_tokens: 1200,
    system,
    messages: [{ role: 'user', content: ctx }],
  })

  const md = res.content
    .filter((b) => b.type === 'text')
    .map((b) => (b as { type: 'text'; text: string }).text)
    .join('')
    .trim()

  const brief: MorningBrief = {
    date: dateStr,
    generatedAt: new Date().toISOString(),
    briefMarkdown: md,
    music: pickMusic(today),
    poem: pickPoem(today),
  }

  await saveMorningBrief(brief)
  return brief
}

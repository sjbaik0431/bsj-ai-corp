import { readFile, writeFile, mkdir } from 'node:fs/promises'
import path from 'node:path'
import type { AgentId } from '@/lib/anthropic'

const DATA_DIR = path.join(process.cwd(), 'data')
const EQUITY_FILE = path.join(DATA_DIR, 'equity.json')

export type ShareKey = 'bsj' | AgentId

export type EquityState = {
  holdings: Record<ShareKey, number>
  history: Array<{
    date: string
    fromKey: ShareKey
    toKey: ShareKey
    pct: number
    reason: string
  }>
}

const INITIAL: EquityState = {
  holdings: { bsj: 90, bonbujang: 6, gihoek: 1, saeop: 1, gamsa: 1, minwon: 1 },
  history: [],
}

export async function loadEquity(): Promise<EquityState> {
  try {
    const raw = await readFile(EQUITY_FILE, 'utf-8')
    return JSON.parse(raw) as EquityState
  } catch (e: unknown) {
    if ((e as NodeJS.ErrnoException).code === 'ENOENT') return INITIAL
    throw e
  }
}

export async function saveEquity(state: EquityState) {
  await mkdir(DATA_DIR, { recursive: true })
  await writeFile(EQUITY_FILE, JSON.stringify(state, null, 2), 'utf-8')
}

export async function transferShare(toKey: AgentId, pct: number, reason: string): Promise<EquityState> {
  const state = await loadEquity()
  if (state.holdings.bsj < pct) throw new Error('BSJ 지분 부족')
  state.holdings.bsj -= pct
  state.holdings[toKey] = (state.holdings[toKey] ?? 0) + pct
  state.history.unshift({
    date: new Date().toISOString(),
    fromKey: 'bsj',
    toKey,
    pct,
    reason: reason.slice(0, 200),
  })
  await saveEquity(state)
  return state
}

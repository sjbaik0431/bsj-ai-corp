import { readFile, writeFile, mkdir } from 'node:fs/promises'
import path from 'node:path'
import type { AgentId } from '@/lib/anthropic'

export type TaskStatus = 'analyzing' | 'running' | 'review' | 'done' | 'failed'

export type Task = {
  id: string
  createdAt: string
  updatedAt: string
  userInput: string
  owner: AgentId
  ownerLabel: string
  title: string
  status: TaskStatus
  progress: number
  decisionSummary: string
  reportMarkdown?: string
  errorMessage?: string
}

const DATA_DIR = path.join(process.cwd(), 'data')
const TASKS_FILE = path.join(DATA_DIR, 'tasks.json')

async function ensureDir() {
  await mkdir(DATA_DIR, { recursive: true })
}

async function readAll(): Promise<Task[]> {
  try {
    const raw = await readFile(TASKS_FILE, 'utf-8')
    return JSON.parse(raw) as Task[]
  } catch (e: unknown) {
    if ((e as NodeJS.ErrnoException).code === 'ENOENT') return []
    throw e
  }
}

async function writeAll(tasks: Task[]): Promise<void> {
  await ensureDir()
  await writeFile(TASKS_FILE, JSON.stringify(tasks, null, 2), 'utf-8')
}

export async function list(): Promise<Task[]> {
  const all = await readAll()
  return all.sort((a, b) => b.createdAt.localeCompare(a.createdAt))
}

export async function create(input: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>): Promise<Task> {
  const all = await readAll()
  const now = new Date().toISOString()
  const id = String(Math.max(0, ...all.map((t) => parseInt(t.id, 10) || 0)) + 1).padStart(3, '0')
  const task: Task = { ...input, id, createdAt: now, updatedAt: now }
  all.unshift(task)
  await writeAll(all)
  return task
}

export async function update(id: string, patch: Partial<Task>): Promise<Task | null> {
  const all = await readAll()
  const idx = all.findIndex((t) => t.id === id)
  if (idx < 0) return null
  all[idx] = { ...all[idx], ...patch, updatedAt: new Date().toISOString() }
  await writeAll(all)
  return all[idx]
}

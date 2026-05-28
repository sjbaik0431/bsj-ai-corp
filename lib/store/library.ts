import { readFile, writeFile, mkdir, readdir, stat } from 'node:fs/promises'
import path from 'node:path'
import type { Task, Domain } from './tasks'
import { DOMAIN_LABEL } from './tasks'

const LIBRARY_DIR = path.join(process.cwd(), 'public', 'library')

function slugify(s: string): string {
  return s
    .normalize('NFKC')
    .replace(/[\\/:*?"<>|]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 50)
    .trim()
}

export async function publishTaskToLibrary(task: Task): Promise<string | null> {
  if (!task.domain || !task.reportMarkdown) return null

  const dir = path.join(LIBRARY_DIR, task.domain)
  await mkdir(dir, { recursive: true })

  const slug = slugify(task.title) || 'untitled'
  const fileName = `${task.id}-${slug}.md`
  const filePath = path.join(dir, fileName)

  const frontmatter = [
    '---',
    `id: ${task.id}`,
    `title: ${JSON.stringify(task.title)}`,
    `owner: ${task.owner}`,
    `ownerLabel: ${JSON.stringify(task.ownerLabel)}`,
    `domain: ${task.domain}`,
    `domainLabel: ${JSON.stringify(DOMAIN_LABEL[task.domain])}`,
    `createdAt: ${task.createdAt}`,
    `updatedAt: ${task.updatedAt}`,
    `needsAudit: ${task.needsAudit ? 'true' : 'false'}`,
    task.auditVerdict ? `auditVerdict: ${task.auditVerdict}` : null,
    '---',
    '',
    `# ${task.title}`,
    '',
    `> **사용자 입력**: ${task.userInput}`,
    `> **본부장 배정 사유**: ${task.decisionSummary}`,
    '',
    '---',
    '',
    `## ${task.ownerLabel} 산출물`,
    '',
    task.reportMarkdown ?? '',
  ]
    .filter((l) => l !== null)
    .join('\n')

  const auditBlock = task.auditReport
    ? ['', '---', '', `## 감사 보고서 (verdict: ${task.auditVerdict ?? '미정'})`, '', task.auditReport].join('\n')
    : ''

  await writeFile(filePath, frontmatter + auditBlock, 'utf-8')
  return path.relative(process.cwd(), filePath).replace(/\\/g, '/')
}

export type LibraryEntry = {
  id: string
  title: string
  ownerLabel: string
  domain: Domain
  domainLabel: string
  createdAt: string
  auditVerdict?: 'pass' | 'flag' | 'fail'
  filePath: string
  fileName: string
}

export async function listLibrary(domain: Domain): Promise<LibraryEntry[]> {
  const dir = path.join(LIBRARY_DIR, domain)
  try {
    const files = await readdir(dir)
    const mds = files.filter((f) => f.endsWith('.md'))
    const entries = await Promise.all(
      mds.map(async (f) => {
        const filePath = path.join(dir, f)
        const raw = await readFile(filePath, 'utf-8')
        return parseEntry(raw, filePath, f, domain)
      }),
    )
    return entries.filter(Boolean).sort((a, b) => b!.createdAt.localeCompare(a!.createdAt)) as LibraryEntry[]
  } catch (e: unknown) {
    if ((e as NodeJS.ErrnoException).code === 'ENOENT') return []
    throw e
  }
}

function parseEntry(raw: string, filePath: string, fileName: string, domain: Domain): LibraryEntry | null {
  if (!raw.startsWith('---')) return null
  const end = raw.indexOf('\n---', 3)
  if (end < 0) return null
  const fm = raw.slice(3, end)
  const get = (key: string) => {
    const m = fm.match(new RegExp(`^${key}: (.*)$`, 'm'))
    if (!m) return null
    return m[1].startsWith('"') ? JSON.parse(m[1]) : m[1]
  }
  return {
    id: String(get('id') ?? '?'),
    title: String(get('title') ?? fileName),
    ownerLabel: String(get('ownerLabel') ?? '?'),
    domain,
    domainLabel: String(get('domainLabel') ?? DOMAIN_LABEL[domain]),
    createdAt: String(get('createdAt') ?? new Date().toISOString()),
    auditVerdict: (get('auditVerdict') as 'pass' | 'flag' | 'fail' | null) ?? undefined,
    filePath,
    fileName,
  }
}

export async function readLibraryFile(domain: Domain, fileName: string): Promise<{ entry: LibraryEntry; body: string } | null> {
  const filePath = path.join(LIBRARY_DIR, domain, fileName)
  try {
    await stat(filePath)
  } catch {
    return null
  }
  const raw = await readFile(filePath, 'utf-8')
  const entry = parseEntry(raw, filePath, fileName, domain)
  if (!entry) return null
  // body is everything after the frontmatter end marker
  const end = raw.indexOf('\n---', 3)
  const body = end > 0 ? raw.slice(end + 4).trimStart() : raw
  return { entry, body }
}

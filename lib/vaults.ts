import { readdir, readFile, stat } from 'node:fs/promises'
import path from 'node:path'

// 4개 활성 vault (LLM-Wiki는 폐기되거나 통합되어 미포함)
// 경로는 .env.local 또는 기본 경로 사용
const DEFAULT_VAULTS = {
  Ontology: 'C:\\Users\\bguu1\\OneDrive\\문서\\클로드코드\\Ontology',
  Zettelkasten: 'C:\\Users\\bguu1\\OneDrive\\Zettelkasten',
  wiki: 'C:\\Users\\bguu1\\wiki',
  'wiki-jincheon': 'C:\\Users\\bguu1\\wiki-jincheon',
} as const

export type VaultName = keyof typeof DEFAULT_VAULTS

function resolveVaultPaths(): Record<VaultName, string> {
  return {
    Ontology: process.env.VAULT_ONTOLOGY ?? DEFAULT_VAULTS.Ontology,
    Zettelkasten: process.env.VAULT_ZETTELKASTEN ?? DEFAULT_VAULTS.Zettelkasten,
    wiki: process.env.VAULT_WIKI ?? DEFAULT_VAULTS.wiki,
    'wiki-jincheon': process.env.VAULT_WIKI_JINCHEON ?? DEFAULT_VAULTS['wiki-jincheon'],
  }
}

export type VaultNote = {
  vault: VaultName
  title: string
  relativePath: string
  modifiedAt: string
  sizeBytes: number
  snippet: string
  tags: string[]
}

const SKIP_DIRS = new Set(['.obsidian', '.git', '.trash', 'node_modules', '_DELETE_PENDING', '__pycache__'])

async function walkVault(vault: VaultName, root: string, since: number): Promise<VaultNote[]> {
  const notes: VaultNote[] = []
  async function walk(dir: string, depth: number) {
    if (depth > 8) return
    let entries: import('node:fs').Dirent[]
    try {
      entries = await readdir(dir, { withFileTypes: true })
    } catch {
      return
    }
    for (const ent of entries) {
      if (SKIP_DIRS.has(ent.name)) continue
      if (ent.name.startsWith('.')) continue
      const full = path.join(dir, ent.name)
      if (ent.isDirectory()) {
        await walk(full, depth + 1)
      } else if (ent.isFile() && ent.name.toLowerCase().endsWith('.md')) {
        try {
          const s = await stat(full)
          if (s.mtimeMs < since) continue
          const raw = await readFile(full, 'utf-8')
          notes.push(parseNote(vault, full, root, s, raw))
        } catch {}
      }
    }
  }
  await walk(root, 0)
  return notes
}

function parseNote(vault: VaultName, fullPath: string, root: string, s: import('node:fs').Stats, raw: string): VaultNote {
  const relativePath = path.relative(root, fullPath).replace(/\\/g, '/')
  const fileName = path.basename(fullPath, '.md')

  let title = fileName
  let body = raw
  const tags: string[] = []

  if (raw.startsWith('---')) {
    const end = raw.indexOf('\n---', 3)
    if (end > 0) {
      const fm = raw.slice(3, end)
      const titleM = fm.match(/^title:\s*(.+)$/m)
      if (titleM) title = titleM[1].trim().replace(/^["']|["']$/g, '')
      const tagsM = fm.match(/^tags:\s*\[(.+)\]$/m)
      if (tagsM) {
        tags.push(...tagsM[1].split(',').map((t) => t.trim().replace(/^["']|["']$/g, '')))
      }
      body = raw.slice(end + 4)
    }
  }

  const cleanBody = body.replace(/^#+\s.*$/gm, '').replace(/\[\[([^\]|]+)(\|[^\]]+)?\]\]/g, '$1').replace(/\s+/g, ' ').trim()
  const snippet = cleanBody.slice(0, 180)

  return {
    vault,
    title,
    relativePath,
    modifiedAt: s.mtime.toISOString(),
    sizeBytes: s.size,
    snippet,
    tags,
  }
}

export async function getRecentVaultNotes(opts: { daysBack?: number; limit?: number } = {}): Promise<VaultNote[]> {
  const daysBack = opts.daysBack ?? 14
  const limit = opts.limit ?? 30
  const since = Date.now() - daysBack * 24 * 60 * 60 * 1000

  const paths = resolveVaultPaths()
  const results = await Promise.all(
    (Object.entries(paths) as [VaultName, string][]).map(([name, root]) => walkVault(name, root, since).catch(() => [])),
  )

  const all = results.flat()
  all.sort((a, b) => b.modifiedAt.localeCompare(a.modifiedAt))
  return all.slice(0, limit)
}

export async function getVaultStatus(): Promise<Array<{ name: VaultName; path: string; exists: boolean }>> {
  const paths = resolveVaultPaths()
  return Promise.all(
    (Object.entries(paths) as [VaultName, string][]).map(async ([name, p]) => ({
      name,
      path: p,
      exists: await stat(p).then(() => true).catch(() => false),
    })),
  )
}

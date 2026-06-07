import { spawn } from 'node:child_process'
import { mkdir, writeFile, rm, stat } from 'node:fs/promises'
import path from 'node:path'
import os from 'node:os'

const TARGET_REPO = process.env.DASHBOARD_TARGET_REPO ?? 'https://github.com/sjbaik0431/claude.git'
const TARGET_SUBDIR = process.env.DASHBOARD_TARGET_SUBDIR ?? 'bsj-ai-corp'
const TARGET_BRANCH = process.env.DASHBOARD_TARGET_BRANCH ?? 'main'

function run(cmd: string, args: string[], cwd: string): Promise<{ code: number; stdout: string; stderr: string }> {
  return new Promise((resolve) => {
    const env = { ...process.env }
    delete env.GITHUB_TOKEN
    const p = spawn(cmd, args, { cwd, env, shell: false })
    let stdout = '', stderr = ''
    p.stdout.on('data', (d) => (stdout += d.toString()))
    p.stderr.on('data', (d) => (stderr += d.toString()))
    p.on('close', (code) => resolve({ code: code ?? -1, stdout, stderr }))
  })
}

export type PublishResult = {
  ok: boolean
  liveUrl?: string
  message: string
  details?: string
}

export async function publishDashboardHTML(html: string): Promise<PublishResult> {
  const workRoot = path.join(os.tmpdir(), `bsj-dash-${Date.now()}`)
  await mkdir(workRoot, { recursive: true })

  try {
    // 1) shallow clone
    const cloneRes = await run('git', ['clone', '--depth', '1', '--branch', TARGET_BRANCH, TARGET_REPO, workRoot], os.tmpdir())
    if (cloneRes.code !== 0) {
      return { ok: false, message: 'git clone 실패', details: cloneRes.stderr.slice(-500) }
    }

    // 2) write dashboard
    const subDir = path.join(workRoot, TARGET_SUBDIR)
    await mkdir(subDir, { recursive: true })
    const indexPath = path.join(subDir, 'index.html')
    await writeFile(indexPath, html, 'utf-8')

    // 3) write small JSON snapshot
    const dataDir = path.join(subDir, 'data')
    await mkdir(dataDir, { recursive: true })
    await writeFile(path.join(dataDir, 'generated-at.json'), JSON.stringify({ at: new Date().toISOString() }, null, 2), 'utf-8')

    // 4) configure git user (commit author)
    await run('git', ['config', 'user.email', 'bsj0431@gmail.com'], workRoot)
    await run('git', ['config', 'user.name', 'BSJ AI corp'], workRoot)

    // 5) status check
    const statusRes = await run('git', ['status', '--porcelain'], workRoot)
    if (statusRes.stdout.trim() === '') {
      return {
        ok: true,
        liveUrl: liveUrl(),
        message: '변경 없음 (이미 최신 상태)',
      }
    }

    // 6) add + commit
    await run('git', ['add', TARGET_SUBDIR], workRoot)
    const commitMsg = `dashboard: BSJ AI corp 갱신 ${new Date().toISOString().slice(0, 16).replace('T', ' ')}`
    const commitRes = await run('git', ['commit', '-m', commitMsg], workRoot)
    if (commitRes.code !== 0) {
      return { ok: false, message: 'commit 실패', details: commitRes.stderr.slice(-500) }
    }

    // 7) push (env GITHUB_TOKEN 제거 후 시스템 자격증명 사용)
    const pushRes = await run('git', ['push', 'origin', TARGET_BRANCH], workRoot)
    if (pushRes.code !== 0) {
      return { ok: false, message: 'push 실패 (자격증명 확인 필요)', details: pushRes.stderr.slice(-500) }
    }

    return {
      ok: true,
      liveUrl: liveUrl(),
      message: '게시 완료',
      details: commitMsg,
    }
  } finally {
    // 8) cleanup
    await rm(workRoot, { recursive: true, force: true }).catch(() => {})
  }
}

function liveUrl(): string {
  // claude 레포 owner/name 추출
  const m = TARGET_REPO.match(/github\.com[\/:]([^\/]+)\/([^\/]+?)(?:\.git)?$/)
  if (!m) return 'https://github.com/'
  const [, owner, name] = m
  return `https://${owner}.github.io/${name}/${TARGET_SUBDIR}/`
}

export async function previewDashboardLocally(html: string): Promise<string> {
  const dir = path.join(process.cwd(), 'public', '_dashboard_preview')
  await mkdir(dir, { recursive: true })
  const filePath = path.join(dir, 'index.html')
  await writeFile(filePath, html, 'utf-8')
  // metadata file
  await writeFile(path.join(dir, '.generated-at'), new Date().toISOString(), 'utf-8')
  return '/_dashboard_preview/index.html'
}

export async function previewExists(): Promise<{ exists: boolean; generatedAt?: string }> {
  const meta = path.join(process.cwd(), 'public', '_dashboard_preview', '.generated-at')
  try {
    await stat(meta)
    const content = await import('node:fs/promises').then((m) => m.readFile(meta, 'utf-8'))
    return { exists: true, generatedAt: content.trim() }
  } catch {
    return { exists: false }
  }
}

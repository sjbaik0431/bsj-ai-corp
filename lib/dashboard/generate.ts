import { list as listTasks, type Task } from '@/lib/store/tasks'
import { listLibrary } from '@/lib/store/library'
import { loadEquity } from '@/lib/store/equity'
import { loadMorningBrief } from '@/lib/morning/brief'
import { getRecentVaultNotes, getVaultStatus, type VaultNote } from '@/lib/vaults'
import type { Domain } from '@/lib/store/tasks'

const DOMAINS: Domain[] = ['hadminsa', 'hotel', 'industrial', 'mice', 'life']
const DOMAIN_LABEL = { hadminsa: '행정사', hotel: '호텔', industrial: '산단', mice: 'MICE', life: '라이프' } as const

const STATUS_GLYPH: Record<string, string> = {
  analyzing: '◐',
  running: '◑',
  review: '◓',
  done: '●',
  failed: '✕',
}

const STATUS_COLOR: Record<string, string> = {
  analyzing: '#7dd3fc',
  running: '#86efac',
  review: '#fbbf24',
  done: '#94a3b8',
  failed: '#f87171',
}

function esc(s: string): string {
  return String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function fmtDateKST(iso: string): string {
  const d = new Date(iso)
  const opts: Intl.DateTimeFormatOptions = {
    timeZone: 'Asia/Seoul',
    year: '2-digit',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }
  return d.toLocaleString('ko-KR', opts).replace(/\./g, '-').replace(/-\s/g, ' ').replace(/-$/, '')
}

function fmtRelative(iso: string): string {
  const ms = Date.now() - new Date(iso).getTime()
  const m = Math.round(ms / 60000)
  if (m < 1) return '방금'
  if (m < 60) return `${m}분 전`
  const h = Math.round(m / 60)
  if (h < 24) return `${h}시간 전`
  const d = Math.round(h / 24)
  return `${d}일 전`
}

function renderHeader(): string {
  const now = new Date().toLocaleString('ko-KR', { timeZone: 'Asia/Seoul', dateStyle: 'long', timeStyle: 'short' })
  return `<header>
  <div class="brand"><span class="b-logo">BSJ</span> <span class="b-name">AI 주식회사 · 통합 터미널</span></div>
  <div class="meta">
    <span class="m-row">GENERATED <span class="hl">${esc(now)} KST</span></span>
    <span class="m-row">SOURCE <span class="hl">localhost:3000 · bsj-ai-corp</span></span>
  </div>
</header>`
}

function renderTaskQueue(tasks: Task[]): string {
  const active = tasks.filter((t) => t.status !== 'done' && t.status !== 'failed').slice(0, 12)
  const recent = tasks.filter((t) => t.status === 'done' || t.status === 'failed').slice(0, 8)

  const rows = (group: Task[]) =>
    group.length === 0
      ? `<tr><td colspan="6" class="empty">— 없음 —</td></tr>`
      : group
          .map(
            (t) => `<tr>
    <td class="num">#${esc(t.id)}</td>
    <td><span class="glyph" style="color:${STATUS_COLOR[t.status]}">${STATUS_GLYPH[t.status] ?? '?'}</span> ${esc(t.status)}</td>
    <td class="title">${esc(t.title)}${t.needsAudit ? ' <span class="tag tag-audit">AUDIT</span>' : ''}</td>
    <td>${esc(t.ownerLabel)}</td>
    <td class="num">${t.progress}%</td>
    <td class="num">${fmtRelative(t.updatedAt)}</td>
  </tr>`,
          )
          .join('\n')

  return `<section class="card span-full">
  <div class="card-head"><h2>⚡ 작업 큐</h2><span class="card-sub">활성 ${active.length} · 최근 완료/실패 ${recent.length}</span></div>
  <table class="dense">
    <thead><tr><th>ID</th><th>상태</th><th>제목</th><th>담당</th><th class="num">진척</th><th class="num">갱신</th></tr></thead>
    <tbody class="group-head"><tr><td colspan="6">▶ 활성</td></tr></tbody>
    <tbody>${rows(active)}</tbody>
    <tbody class="group-head"><tr><td colspan="6">▶ 최근 완료/실패</td></tr></tbody>
    <tbody>${rows(recent)}</tbody>
  </table>
</section>`
}

type LibEntryShape = { id: string; title: string; ownerLabel: string; createdAt: string; auditVerdict?: 'pass' | 'flag' | 'fail'; fileName: string }

function renderLibrarySection(libraryByDomain: Record<Domain, LibEntryShape[]>): string {
  const total = Object.values(libraryByDomain).reduce((a, b) => a + b.length, 0)
  const cols = DOMAINS.map((d) => {
    const items = (libraryByDomain[d] ?? []).slice(0, 5)
    const rows = items.length
      ? items
          .map(
            (e) => `<li>
      <span class="num small">#${esc(e.id)}</span>
      <a href="https://github.com/sjbaik0431/bsj-ai-corp/blob/main/public/library/${d}/${encodeURIComponent(e.fileName)}" target="_blank">${esc(e.title)}</a>
      <span class="meta-inline">${esc(e.ownerLabel)} · ${fmtRelative(e.createdAt)}${e.auditVerdict ? ` · ${esc(e.auditVerdict.toUpperCase())}` : ''}</span>
    </li>`,
          )
          .join('\n')
      : '<li class="empty">— 비어있음 —</li>'
    return `<div class="lib-col">
  <div class="lib-col-head"><span class="lib-tag">${DOMAIN_LABEL[d]}</span> <span class="count">${(libraryByDomain[d] ?? []).length}</span></div>
  <ul>${rows}</ul>
</div>`
  }).join('\n')

  return `<section class="card span-full">
  <div class="card-head"><h2>📚 자료실 — 최근 산출물 (도메인별 top 5)</h2><span class="card-sub">총 ${total}건</span></div>
  <div class="lib-grid">${cols}</div>
</section>`
}

function renderVaultsSection(notes: VaultNote[], status: Array<{ name: string; path: string; exists: boolean }>): string {
  const cols = (['Ontology', 'Zettelkasten', 'wiki', 'wiki-jincheon'] as const)
    .map((name) => {
      const items = notes.filter((n) => n.vault === name).slice(0, 6)
      const st = status.find((s) => s.name === name)
      const stTag = st?.exists ? `<span class="hl-green">●</span>` : `<span class="hl-red">●</span>`
      const rows = items.length
        ? items
            .map(
              (n) => `<li>
      ${stTag === '<span class="hl-green">●</span>' ? '' : ''}
      <span class="vt-title">${esc(n.title)}</span>
      <span class="meta-inline">${esc(n.relativePath)} · ${fmtRelative(n.modifiedAt)}</span>
      ${n.snippet ? `<div class="vt-snippet">${esc(n.snippet.slice(0, 130))}</div>` : ''}
    </li>`,
            )
            .join('\n')
        : '<li class="empty">— 최근 변경 없음 —</li>'
      return `<div class="lib-col">
  <div class="lib-col-head"><span class="lib-tag">${stTag} ${esc(name)}</span> <span class="count">${notes.filter((n) => n.vault === name).length}</span></div>
  <ul class="vt-list">${rows}</ul>
</div>`
    })
    .join('\n')

  return `<section class="card span-full">
  <div class="card-head"><h2>🗂 멀티볼트 — 최근 14일 변경된 노트</h2><span class="card-sub">총 ${notes.length}건 (vault×4)</span></div>
  <div class="lib-grid lib-grid-vault">${cols}</div>
</section>`
}

type MorningBrief = { date: string; briefMarkdown?: string; music?: { title: string; artist: string; genre: string }; poem?: { title: string; author: string } } | null

function renderMorningSection(brief: MorningBrief): string {
  if (!brief) {
    return `<section class="card">
  <div class="card-head"><h2>🌅 본부장 모닝 브리핑</h2><span class="card-sub">— 미생성 —</span></div>
  <p class="empty">오늘 모닝 브리핑이 아직 생성되지 않았습니다. BSJ AI corp 메인에서 생성 가능.</p>
</section>`
  }
  const briefHtml = (brief.briefMarkdown ?? '')
    .split('\n')
    .map((l) => {
      if (l.startsWith('## ')) return `<h3 class="bf-h3">${esc(l.slice(3))}</h3>`
      if (l.startsWith('# ')) return `<h2 class="bf-h2">${esc(l.slice(2))}</h2>`
      if (l.startsWith('- ')) return `<li>${esc(l.slice(2))}</li>`
      if (l.trim() === '') return ''
      return `<p>${esc(l)}</p>`
    })
    .join('\n')
  return `<section class="card span-full">
  <div class="card-head"><h2>🌅 본부장 모닝 브리핑</h2><span class="card-sub">${esc(brief.date)}</span></div>
  <div class="bf-grid">
    <div class="bf-main">${briefHtml}</div>
    <aside class="bf-side">
      ${brief.music ? `<div class="bf-pick"><div class="bf-pick-label">오늘의 음악</div><div class="bf-pick-title">${esc(brief.music.title)}</div><div class="bf-pick-sub">${esc(brief.music.artist)} · ${esc(brief.music.genre)}</div></div>` : ''}
      ${brief.poem ? `<div class="bf-pick"><div class="bf-pick-label">오늘의 시</div><div class="bf-pick-title">${esc(brief.poem.author)} 「${esc(brief.poem.title)}」</div></div>` : ''}
    </aside>
  </div>
</section>`
}

function renderKPISection(tasks: Task[], libCount: number, equity: { holdings: Record<string, number> }): string {
  const total = tasks.length
  const done = tasks.filter((t) => t.status === 'done').length
  const active = tasks.filter((t) => t.status !== 'done' && t.status !== 'failed').length
  const failed = tasks.filter((t) => t.status === 'failed').length
  const completion = total ? Math.round((done / total) * 100) : 0

  return `<section class="card">
  <div class="card-head"><h2>📊 KPI</h2></div>
  <div class="kpi-grid">
    <div class="kpi"><span class="kpi-num hl-green">${active}</span><span class="kpi-label">활성 작업</span></div>
    <div class="kpi"><span class="kpi-num">${done}</span><span class="kpi-label">완료</span></div>
    <div class="kpi"><span class="kpi-num hl-red">${failed}</span><span class="kpi-label">실패</span></div>
    <div class="kpi"><span class="kpi-num hl-amber">${completion}%</span><span class="kpi-label">완료율</span></div>
    <div class="kpi"><span class="kpi-num">${libCount}</span><span class="kpi-label">자료실 누적</span></div>
    <div class="kpi"><span class="kpi-num">${equity.holdings.bsj ?? 90}%</span><span class="kpi-label">BSJ 잔여 지분</span></div>
  </div>
</section>`
}

function renderArchiveLinks(): string {
  return `<section class="card">
  <div class="card-head"><h2>📎 기존 아카이브 (claude 레포)</h2><span class="card-sub">건드리지 않은 기존 자료</span></div>
  <ul class="link-list">
    <li><a href="../BSJ_AI_HUB_v3.html" target="_top">→ BSJ AI HUB v3 (74KB)</a></li>
    <li><a href="../bsj_command_center_v3_fixed.html" target="_top">→ BSJ Command Center v3</a></li>
    <li><a href="../briefing_20260606.html" target="_top">→ 최근 브리핑 2026-06-06</a></li>
    <li><a href="../01_dapullim/" target="_top">→ 01 다풀림</a></li>
    <li><a href="../02_joahotel/" target="_top">→ 02 조아호텔</a></li>
    <li><a href="../03_jincheon/" target="_top">→ 03 진천</a></li>
    <li><a href="../04_ezpmp_mice/" target="_top">→ 04 EZPMP MICE</a></li>
  </ul>
</section>`
}

const CSS = `
:root {
  --bg: #0a0a0a;
  --bg-card: #111111;
  --bg-row: #161616;
  --bg-row-alt: #1a1a1a;
  --border: #262626;
  --border-strong: #3f3f3f;
  --text: #e5e7eb;
  --text-dim: #94a3b8;
  --text-faint: #525252;
  --green: #86efac;
  --red: #f87171;
  --amber: #fbbf24;
  --cyan: #67e8f9;
  --blue: #93c5fd;
  --purple: #c4b5fd;
}
* { box-sizing: border-box; margin: 0; padding: 0; }
html, body { background: var(--bg); color: var(--text); font-family: 'JetBrains Mono', 'Cascadia Code', Consolas, Menlo, 'D2Coding', monospace; font-size: 13px; line-height: 1.5; }
body { padding: 16px; min-height: 100vh; }
a { color: var(--cyan); text-decoration: none; }
a:hover { text-decoration: underline; }
header { display: flex; justify-content: space-between; align-items: flex-start; padding-bottom: 14px; border-bottom: 1px solid var(--border-strong); margin-bottom: 16px; }
.brand { font-size: 16px; }
.b-logo { background: var(--amber); color: #000; padding: 2px 6px; font-weight: 800; }
.b-name { color: var(--text-dim); margin-left: 8px; }
.meta { text-align: right; color: var(--text-faint); font-size: 11px; }
.meta .m-row { display: block; }
.hl { color: var(--green); }
.hl-green { color: var(--green); }
.hl-red { color: var(--red); }
.hl-amber { color: var(--amber); }
.hl-cyan { color: var(--cyan); }
.grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px; }
.span-full { grid-column: 1 / -1; }
.card { background: var(--bg-card); border: 1px solid var(--border); padding: 12px 14px; }
.card-head { display: flex; justify-content: space-between; align-items: baseline; border-bottom: 1px dashed var(--border); padding-bottom: 6px; margin-bottom: 10px; }
.card-head h2 { font-size: 13px; font-weight: 700; color: var(--amber); letter-spacing: 0.02em; }
.card-sub { color: var(--text-faint); font-size: 11px; }
table.dense { width: 100%; border-collapse: collapse; }
table.dense th, table.dense td { padding: 4px 6px; text-align: left; border-bottom: 1px solid var(--border); }
table.dense th { color: var(--text-faint); font-weight: 500; font-size: 10.5px; text-transform: uppercase; letter-spacing: 0.06em; }
table.dense td { font-size: 12px; }
table.dense tbody tr:hover { background: var(--bg-row-alt); }
table.dense td.num, table.dense th.num { text-align: right; font-variant-numeric: tabular-nums; }
table.dense td.title { color: var(--text); }
table.dense td.empty { color: var(--text-faint); text-align: center; font-style: italic; padding: 12px; }
table.dense .group-head td { color: var(--cyan); font-weight: 700; font-size: 11px; padding-top: 10px; border: none; background: transparent; }
.glyph { font-size: 14px; vertical-align: middle; }
.tag { display: inline-block; padding: 1px 5px; border-radius: 2px; font-size: 9.5px; font-weight: 700; letter-spacing: 0.05em; vertical-align: middle; margin-left: 4px; }
.tag-audit { background: rgba(251, 191, 36, 0.15); color: var(--amber); border: 1px solid var(--amber); }
.lib-grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 10px; }
.lib-grid-vault { grid-template-columns: repeat(4, 1fr); }
.lib-col { background: var(--bg-row); border: 1px solid var(--border); padding: 8px 10px; }
.lib-col-head { display: flex; justify-content: space-between; border-bottom: 1px solid var(--border); padding-bottom: 5px; margin-bottom: 6px; }
.lib-tag { color: var(--amber); font-weight: 700; font-size: 11px; }
.count { color: var(--text-faint); font-size: 11px; }
.lib-col ul, .vt-list { list-style: none; }
.lib-col li, .vt-list li { padding: 5px 0; border-bottom: 1px dotted var(--border); font-size: 11.5px; }
.lib-col li:last-child, .vt-list li:last-child { border: none; }
.lib-col li.empty, .vt-list li.empty { color: var(--text-faint); font-style: italic; padding: 10px 0; }
.num.small { color: var(--text-faint); font-size: 10px; margin-right: 4px; }
.meta-inline { display: block; color: var(--text-faint); font-size: 10px; margin-top: 2px; }
.vt-title { color: var(--blue); font-weight: 500; }
.vt-snippet { color: var(--text-dim); font-size: 10.5px; margin-top: 3px; padding-left: 4px; border-left: 2px solid var(--border-strong); }
.kpi-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; }
.kpi { background: var(--bg-row); border: 1px solid var(--border); padding: 10px; text-align: center; }
.kpi-num { display: block; font-size: 22px; font-weight: 700; color: var(--cyan); font-variant-numeric: tabular-nums; }
.kpi-label { display: block; color: var(--text-faint); font-size: 10px; text-transform: uppercase; letter-spacing: 0.08em; margin-top: 4px; }
.bf-grid { display: grid; grid-template-columns: 2fr 1fr; gap: 14px; }
.bf-main h2.bf-h2 { color: var(--amber); font-size: 14px; margin: 10px 0 6px; }
.bf-main h3.bf-h3 { color: var(--cyan); font-size: 12px; margin: 8px 0 4px; }
.bf-main p { font-size: 12px; margin: 4px 0; }
.bf-main li { font-size: 12px; margin-left: 20px; }
.bf-side { display: flex; flex-direction: column; gap: 8px; }
.bf-pick { background: var(--bg-row); border: 1px solid var(--border); padding: 8px 10px; }
.bf-pick-label { color: var(--text-faint); font-size: 10px; text-transform: uppercase; letter-spacing: 0.08em; }
.bf-pick-title { color: var(--green); margin-top: 4px; font-weight: 600; font-size: 12px; }
.bf-pick-sub { color: var(--text-dim); font-size: 10px; margin-top: 2px; }
.link-list { list-style: none; }
.link-list li { padding: 4px 0; font-size: 11.5px; }
footer { margin-top: 18px; padding-top: 12px; border-top: 1px solid var(--border-strong); color: var(--text-faint); font-size: 10.5px; display: flex; justify-content: space-between; }
@media (max-width: 1100px) {
  .grid { grid-template-columns: 1fr 1fr; }
  .lib-grid { grid-template-columns: repeat(2, 1fr); }
  .lib-grid-vault { grid-template-columns: repeat(2, 1fr); }
  .kpi-grid { grid-template-columns: repeat(2, 1fr); }
}
@media (max-width: 700px) {
  .grid { grid-template-columns: 1fr; }
  .lib-grid, .lib-grid-vault, .kpi-grid { grid-template-columns: 1fr; }
  .bf-grid { grid-template-columns: 1fr; }
}
`

export async function generateDashboardHTML(): Promise<string> {
  const [tasks, equity, brief, vaultNotes, vaultStatus] = await Promise.all([
    listTasks(),
    loadEquity(),
    loadMorningBrief(),
    getRecentVaultNotes({ daysBack: 14, limit: 30 }),
    getVaultStatus(),
  ])

  const libraryByDomain: Record<Domain, LibEntryShape[]> = {
    hadminsa: [],
    hotel: [],
    industrial: [],
    mice: [],
    life: [],
  }
  for (const d of DOMAINS) {
    const items = await listLibrary(d).catch(() => [])
    libraryByDomain[d] = items.map((e) => ({
      id: e.id,
      title: e.title,
      ownerLabel: e.ownerLabel,
      createdAt: e.createdAt,
      auditVerdict: e.auditVerdict,
      fileName: e.fileName,
    }))
  }
  const libCount = Object.values(libraryByDomain).reduce((a, b) => a + b.length, 0)

  const body = `
${renderHeader()}
<main class="grid">
  ${renderKPISection(tasks, libCount, equity)}
  ${renderMorningSection(brief)}
  ${renderArchiveLinks()}
  ${renderTaskQueue(tasks)}
  ${renderLibrarySection(libraryByDomain)}
  ${renderVaultsSection(vaultNotes, vaultStatus)}
</main>
<footer>
  <span>BSJ AI 주식회사 · 통합 터미널 · v1.0</span>
  <span>tasks=${tasks.length} · lib=${libCount} · vaults=${vaultStatus.filter((v) => v.exists).length}/4 · notes=${vaultNotes.length}</span>
</footer>
`

  return `<!doctype html>
<html lang="ko">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>BSJ AI 주식회사 · 통합 터미널</title>
<style>${CSS}</style>
</head>
<body>${body}</body>
</html>`
}

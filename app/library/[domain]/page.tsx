import Link from 'next/link'
import { notFound } from 'next/navigation'
import { listLibrary } from '@/lib/store/library'
import { DOMAIN_LABEL, type Domain } from '@/lib/store/tasks'
import { ShieldCheck, ShieldAlert, ShieldX, FileText, ArrowLeft } from 'lucide-react'

const VALID_DOMAINS: Domain[] = ['hadminsa', 'hotel', 'industrial', 'mice', 'life']

export const dynamic = 'force-dynamic'

const verdictMap = {
  pass: { label: '감사 통과', bg: 'bg-emerald-50 text-emerald-700 border-emerald-200', ico: <ShieldCheck className="h-3.5 w-3.5" /> },
  flag: { label: '검토 권고', bg: 'bg-amber-50 text-amber-700 border-amber-200', ico: <ShieldAlert className="h-3.5 w-3.5" /> },
  fail: { label: '재작성 필요', bg: 'bg-rose-50 text-rose-700 border-rose-200', ico: <ShieldX className="h-3.5 w-3.5" /> },
}

export default async function DomainLibraryPage({ params }: { params: Promise<{ domain: string }> }) {
  const { domain } = await params
  if (!VALID_DOMAINS.includes(domain as Domain)) notFound()
  const d = domain as Domain
  const entries = await listLibrary(d)

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 md:px-8">
      <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-bsj-primary transition mb-6">
        <ArrowLeft className="h-4 w-4" />
        메인으로
      </Link>

      <div className="flex items-baseline justify-between mb-6">
        <div>
          <p className="text-xs uppercase tracking-wider text-slate-500">자료실</p>
          <h1 className="text-2xl md:text-3xl font-bold text-bsj-ink mt-1">{DOMAIN_LABEL[d]}</h1>
        </div>
        <p className="text-sm text-slate-500 tabular-nums">{entries.length}건</p>
      </div>

      {entries.length === 0 ? (
        <div className="glass rounded-2xl p-10 text-center text-sm text-slate-500">
          이 도메인에 게시된 자료가 아직 없습니다.<br />
          본부장이 이 영역의 과제를 완료하면 여기에 자동 게시됩니다.
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {entries.map((e) => {
            const v = e.auditVerdict ? verdictMap[e.auditVerdict] : null
            const created = new Date(e.createdAt)
            const dateStr = `${created.getFullYear()}-${String(created.getMonth() + 1).padStart(2, '0')}-${String(created.getDate()).padStart(2, '0')}`
            return (
              <Link
                key={e.fileName}
                href={`/library/${d}/${encodeURIComponent(e.fileName)}`}
                className="glass rounded-2xl p-5 shadow-sm hover:shadow-lg transition-all group"
              >
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-slate-500 to-slate-700 flex items-center justify-center text-white shadow shrink-0">
                    <FileText className="h-5 w-5" />
                  </div>
                  {v && (
                    <span className={`inline-flex items-center gap-1 text-[11px] rounded-full px-2 py-0.5 border ${v.bg}`}>
                      {v.ico}{v.label}
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-400">#{e.id} · {dateStr}</p>
                <h3 className="font-semibold text-bsj-ink mt-1 line-clamp-2 group-hover:text-bsj-primary transition">{e.title}</h3>
                <p className="mt-2 text-xs text-slate-500">{e.ownerLabel}</p>
              </Link>
            )
          })}
        </div>
      )}
    </main>
  )
}

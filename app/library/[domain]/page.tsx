import Link from 'next/link'
import { notFound } from 'next/navigation'
import { listLibrary } from '@/lib/store/library'
import { DOMAIN_LABEL, type Domain } from '@/lib/store/tasks'
import { ArrowLeft } from 'lucide-react'
import { LibraryFilter } from '@/components/library-filter'

const VALID_DOMAINS: Domain[] = ['hadminsa', 'hotel', 'industrial', 'mice', 'life']

export const dynamic = 'force-dynamic'

export default async function DomainLibraryPage({ params }: { params: Promise<{ domain: string }> }) {
  const { domain } = await params
  if (!VALID_DOMAINS.includes(domain as Domain)) notFound()
  const d = domain as Domain
  const entries = await listLibrary(d)
  const serializable = entries.map((e) => ({
    id: e.id,
    title: e.title,
    ownerLabel: e.ownerLabel,
    domain: e.domain,
    domainLabel: e.domainLabel,
    createdAt: e.createdAt,
    auditVerdict: e.auditVerdict,
    fileName: e.fileName,
  }))

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

      <LibraryFilter entries={serializable} domain={d} />
    </main>
  )
}

import Link from 'next/link'
import { notFound } from 'next/navigation'
import { readLibraryFile } from '@/lib/store/library'
import { DOMAIN_LABEL, type Domain } from '@/lib/store/tasks'
import { ArrowLeft } from 'lucide-react'
import { Markdown } from '@/components/markdown'

const VALID_DOMAINS: Domain[] = ['hadminsa', 'hotel', 'industrial', 'mice', 'life']

export const dynamic = 'force-dynamic'

export default async function LibraryFilePage({ params }: { params: Promise<{ domain: string; file: string }> }) {
  const { domain, file } = await params
  if (!VALID_DOMAINS.includes(domain as Domain)) notFound()
  const d = domain as Domain
  const fileName = decodeURIComponent(file)
  const data = await readLibraryFile(d, fileName)
  if (!data) notFound()
  const { entry, body } = data

  return (
    <main className="mx-auto max-w-4xl px-4 py-8 md:px-8">
      <Link href={`/library/${d}`} className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-bsj-primary transition mb-6">
        <ArrowLeft className="h-4 w-4" />
        {DOMAIN_LABEL[d]} 자료실
      </Link>

      <div className="mb-6">
        <p className="text-xs uppercase tracking-wider text-slate-500">#{entry.id} · {entry.ownerLabel} · {DOMAIN_LABEL[d]}</p>
        <p className="mt-2 text-xs text-slate-400">작성: {new Date(entry.createdAt).toLocaleString('ko-KR')}</p>
      </div>

      <article className="glass rounded-3xl p-6 md:p-10 shadow-sm">
        <Markdown source={body} />
      </article>
    </main>
  )
}

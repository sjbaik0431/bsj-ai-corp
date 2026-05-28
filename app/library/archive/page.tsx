import Link from 'next/link'
import { ArrowLeft, Archive } from 'lucide-react'

export default function ArchivePage() {
  return (
    <main className="mx-auto max-w-4xl px-4 py-8 md:px-8">
      <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-bsj-primary transition mb-6">
        <ArrowLeft className="h-4 w-4" />
        메인으로
      </Link>

      <div className="glass rounded-3xl p-8 md:p-10 shadow-sm">
        <div className="flex items-center gap-4 mb-4">
          <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-slate-300 to-slate-500 flex items-center justify-center text-white shadow">
            <Archive className="h-7 w-7" />
          </div>
          <div>
            <p className="text-xs uppercase tracking-wider text-slate-500">자료실 / 보관함</p>
            <h1 className="text-2xl md:text-3xl font-bold text-bsj-ink mt-1">보관함</h1>
            <p className="text-sm text-slate-500 mt-1">90일 지난 자료의 자동 이관처 (현재 보관 0건)</p>
          </div>
        </div>

        <div className="rounded-2xl bg-slate-50 border border-slate-200 p-5 mt-6 text-sm text-slate-600 leading-relaxed">
          이 폴더는 자료실 자동 정리(향후 구현)로 90일이 경과한 산출물의 이관 대상지입니다.
          별표로 표시된 자료(starred: true)는 영구 보관되어 본래 도메인 자료실에 남습니다.
        </div>
      </div>
    </main>
  )
}

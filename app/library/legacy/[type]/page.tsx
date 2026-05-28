import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, ExternalLink, LayoutDashboard, Bot } from 'lucide-react'

const LEGACY_MAP: Record<string, { title: string; subtitle: string; icon: typeof LayoutDashboard; note: string }> = {
  dashboard: {
    title: 'BSJ 통합대시보드 (이관본)',
    subtitle: '기존 GitHub Pages 통합 자료',
    icon: LayoutDashboard,
    note: '이전에 운영하던 통합대시보드는 별도 GitHub Pages 사이트로 유지됩니다. 새 자료는 본 시스템(BSJ AI 주식회사)에서 도메인별 자료실로 자동 게시됩니다.',
  },
  'ai-hub': {
    title: 'BSJ AI HUB V2.0 (이관본)',
    subtitle: '기존 AI 작업 자료',
    icon: Bot,
    note: 'AI HUB V2.0의 과거 자료는 별도 GitHub Pages에서 조회 가능합니다. 새 AI 산출물은 본 시스템 자료실(도메인별 5개)로 통합 게시됩니다.',
  },
}

export default async function LegacyPage({ params }: { params: Promise<{ type: string }> }) {
  const { type } = await params
  const meta = LEGACY_MAP[type]
  if (!meta) notFound()
  const Icon = meta.icon

  return (
    <main className="mx-auto max-w-4xl px-4 py-8 md:px-8">
      <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-bsj-primary transition mb-6">
        <ArrowLeft className="h-4 w-4" />
        메인으로
      </Link>

      <div className="glass rounded-3xl p-8 md:p-10 shadow-sm">
        <div className="flex items-center gap-4 mb-4">
          <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-cyan-400 to-sky-600 flex items-center justify-center text-white shadow">
            <Icon className="h-7 w-7" />
          </div>
          <div>
            <p className="text-xs uppercase tracking-wider text-slate-500">자료실 / 이관본</p>
            <h1 className="text-2xl md:text-3xl font-bold text-bsj-ink mt-1">{meta.title}</h1>
            <p className="text-sm text-slate-500 mt-1">{meta.subtitle}</p>
          </div>
        </div>

        <div className="rounded-2xl bg-sky-50/50 border border-sky-200 p-5 mt-6 text-sm text-slate-700 leading-relaxed">
          {meta.note}
        </div>

        <div className="mt-6 flex flex-wrap gap-2">
          <Link
            href="/library/hadminsa"
            className="inline-flex items-center gap-2 text-sm rounded-xl px-4 py-2 bg-white border border-slate-200 hover:border-bsj-primary hover:text-bsj-primary transition"
          >
            행정사 자료실 →
          </Link>
          <Link
            href="/library/hotel"
            className="inline-flex items-center gap-2 text-sm rounded-xl px-4 py-2 bg-white border border-slate-200 hover:border-bsj-primary hover:text-bsj-primary transition"
          >
            호텔 자료실 →
          </Link>
          <Link
            href="/library/industrial"
            className="inline-flex items-center gap-2 text-sm rounded-xl px-4 py-2 bg-white border border-slate-200 hover:border-bsj-primary hover:text-bsj-primary transition"
          >
            산업단지 자료실 →
          </Link>
          <Link
            href="/library/mice"
            className="inline-flex items-center gap-2 text-sm rounded-xl px-4 py-2 bg-white border border-slate-200 hover:border-bsj-primary hover:text-bsj-primary transition"
          >
            MICE 자료실 →
          </Link>
        </div>

        <p className="mt-6 text-xs text-slate-400 inline-flex items-center gap-1">
          <ExternalLink className="h-3 w-3" />
          기존 GitHub Pages 사이트는 별도 브라우저 즐겨찾기로 접근하세요.
        </p>
      </div>
    </main>
  )
}

import { NextRequest } from 'next/server'
import { generateDashboardHTML } from '@/lib/dashboard/generate'
import { previewDashboardLocally, publishDashboardHTML, previewExists } from '@/lib/dashboard/publish'

export async function GET() {
  const status = await previewExists()
  return Response.json({ ...status, previewUrl: status.exists ? '/_dashboard_preview/index.html' : null })
}

export async function POST(req: NextRequest) {
  const url = new URL(req.url)
  const mode = url.searchParams.get('mode') ?? 'build'

  try {
    const html = await generateDashboardHTML()

    if (mode === 'build') {
      const previewUrl = await previewDashboardLocally(html)
      return Response.json({ ok: true, mode: 'build', previewUrl, bytes: html.length })
    }

    if (mode === 'publish') {
      // 미리보기도 갱신
      await previewDashboardLocally(html)
      const result = await publishDashboardHTML(html)
      return Response.json({ ok: result.ok, mode: 'publish', ...result, bytes: html.length })
    }

    return Response.json({ error: 'mode는 build 또는 publish' }, { status: 400 })
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e)
    console.error('[dashboard]', msg)
    return Response.json({ error: msg }, { status: 500 })
  }
}

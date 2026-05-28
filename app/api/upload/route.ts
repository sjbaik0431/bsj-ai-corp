import { NextRequest } from 'next/server'
import { extractTextFromBuffer } from '@/lib/extract'

export async function POST(req: NextRequest) {
  try {
    const form = await req.formData()
    const files = form.getAll('files').filter((v) => v instanceof File) as File[]
    if (files.length === 0) return Response.json({ error: '파일이 없습니다' }, { status: 400 })

    const extracts = await Promise.all(
      files.map(async (f) => {
        const buf = Buffer.from(await f.arrayBuffer())
        const text = await extractTextFromBuffer(buf, f.name)
        return { name: f.name, size: f.size, text }
      }),
    )

    return Response.json({ ok: true, files: extracts })
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e)
    console.error('[upload]', msg)
    return Response.json({ error: msg }, { status: 500 })
  }
}

export const config = {
  api: { bodyParser: false },
}

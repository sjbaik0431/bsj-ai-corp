'use client'

import { useMemo } from 'react'
import { marked } from 'marked'

marked.setOptions({ gfm: true, breaks: true })

export function Markdown({ source, className = '' }: { source: string; className?: string }) {
  const html = useMemo(() => marked.parse(source ?? '', { async: false }) as string, [source])
  return (
    <div
      className={`prose-bsj ${className}`}
      // 입력은 우리 LLM 생성물(신뢰 가능), 사용자 입력은 별도로 escape됨
      dangerouslySetInnerHTML={{ __html: html }}
    />
  )
}

import type { Metadata, Viewport } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'BSJ AI 주식회사',
  description: '5인 AI 에이전트가 운영하는 1인 기업 통합 작업 공간',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#fafafa',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body className="min-h-screen bg-gradient-to-br from-sky-50 via-bsj-paper to-amber-50">
        {children}
      </body>
    </html>
  )
}

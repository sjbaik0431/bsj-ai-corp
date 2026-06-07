import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // 부모 폴더 package-lock.json과 충돌 방지 — 본 프로젝트를 워크스페이스 루트로 고정
  outputFileTracingRoot: __dirname,
  // 서버 전용 패키지는 webpack 번들에서 제외 (node:crypto 등 Node 내장 모듈 직접 사용 패키지)
  serverExternalPackages: ['node-cron', 'pdf-parse', 'mammoth'],
  images: {
    remotePatterns: [{ protocol: 'https', hostname: '**' }],
  },
}

export default nextConfig

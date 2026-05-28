# BSJ AI 주식회사

> 1인 기업 BSJ를 위한 5인 AI 에이전트 통합 웹앱. 본부장(Opus) + 기획·사업·감사·민원 팀장(Sonnet)이 행정사·호텔·산단·MICE·라이프 도메인을 24/7 hybrid로 운영.

## 주주 구조 (Cap Table)
- BSJ 90% · 본부장 6% · 4팀장 각 1%
- 성과 평가 시 BSJ → 우수 팀장에게 크레딧으로 1% 양도

## 기술 스택
- **Frontend**: Next.js 15 (App Router) + TypeScript + Tailwind v3 + Framer Motion
- **Runtime**: Cloudflare Pages (Edge) + @cloudflare/next-on-pages
- **AI**: Anthropic Claude API (Opus 4.7 + Sonnet 4.6)
- **음성**: OpenAI Whisper (STT) + OpenAI TTS-1
- **데이터**: Cloudflare KV (작업 상태) + 멀티볼트 미러 (`agents-memory/`)

## 개발
```bash
npm install
cp .env.example .env.local  # 키 채우기
npm run dev                  # http://localhost:3000
```

## 배포 (Cloudflare Pages)
```bash
npm run pages:build
npm run pages:deploy
# 또는 GitHub 연결 후 자동 배포
```

## 폴더 구조
```
app/             메인 UI 셸 + 라우팅 + API
components/      6대 핵심 UI 컴포넌트
lib/agents/      5인 에이전트 시스템 프롬프트
lib/             오케스트레이터/메모리/도구 래퍼
agents-memory/   멀티볼트 미러 (도메인 격리)
public/          캐릭터 SVG + 음악 + 시 데이터
```

자세한 마스터 플랜은 `../dapooli-multiagent-setup-plan-v2.md` 참고.

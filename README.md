# BSJ AI 주식회사 (로컬 전용)

> 1인 기업 BSJ를 위한 5인 AI 에이전트 통합 웹앱. **본인 PC에서만 운영**.
> 본부장(Opus) + 기획·사업·감사·민원 팀장(Sonnet)이 행정사·호텔·산단·MICE·라이프 도메인을 운영.

## 주주 구조
- BSJ 90% · 본부장 6% · 4팀장 각 1%
- 성과 평가 시 BSJ → 우수 팀장에게 크레딧으로 1% 양도

## 기술 스택
- **Frontend**: Next.js 15 (App Router) + TypeScript + Tailwind v3 + Framer Motion
- **Runtime**: Node.js 22+ (로컬), Next dev/build/start
- **AI**: Anthropic Claude API (Opus 4.7 + Sonnet 4.6)
- **음성** (Phase C): OpenAI Whisper (STT) + OpenAI TTS-1
- **저장소**: 멀티볼트 (`Ontology/agents-memory/`) + 로컬 SQLite (작업 상태, Phase B에서 추가)

## 첫 실행
```powershell
cd C:\Users\bguu1\bsj-ai-corp
npm install
copy .env.example .env.local
# .env.local에 ANTHROPIC_API_KEY 등 채우기
npm run dev
```
→ http://localhost:3000

## 부팅 시 자동 실행 (Windows)
`scripts\start-bsj.bat` 더블클릭 → 작업 표시줄에 백그라운드 실행.

자동 시작 등록:
```powershell
# 실행파일 단축 등록 (Win+R → shell:startup → 폴더에 .bat 바로가기 복사)
explorer shell:startup
```

## 운영 모드
- **개발 모드**: `npm run dev` — 코드 수정 즉시 반영 (HMR), 평소 작업 권장
- **프로덕션 모드**: `npm run build && npm run start` — 더 빠름, 안정적, 디스크 캐시 효과
- **백그라운드**: `start-bsj.bat`를 통한 hidden window 실행

## 폴더 구조
```
app/             메인 UI 셸 + 라우팅 + API
components/      6대 핵심 UI 컴포넌트
lib/             오케스트레이터/메모리/도구 래퍼
agents-memory/   5인 시스템 프롬프트 + 도메인 메모리 (멀티볼트 미러)
public/          캐릭터 SVG + 음악 + 시 데이터
scripts/         Windows 부팅·정리 보조 스크립트
```

## GitHub
원본: https://github.com/sjbaik0431/bsj-ai-corp (private, 백업·버전관리용. 배포는 안 함)

자세한 마스터 플랜은 `../dapooli-multiagent-setup-plan-v2.md` 참고.

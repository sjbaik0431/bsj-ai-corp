import { anthropic, AGENT_TO_MODEL } from '@/lib/anthropic'
import { loadPrompt } from './prompts'
import type { Task } from '@/lib/store/tasks'

const AUDIT_SUFFIX = `
---
[검증 작업 모드]
사업팀장(또는 다른 팀장)이 산출한 결과물이 외부 발송/공식 문서/IR 등으로 나갈 예정입니다. 당신의 직무인 팩트체크·검증을 즉시 수행하고 다음 마크다운 형식의 감사 의견서 한 편만 출력하세요. 다른 메타 설명·코드 펜스 없이 마크다운 본문만.

## 🛡️ 감사팀장 검증 (YYYY-MM-DD)

### 판정
**[PASS | FLAG | FAIL]** — 한 문장 종합

### 통과 항목
- [x] 항목 (근거 1줄)
- ...

### 의심 항목 / 빨간 깃발
> 없으면 "특이사항 없음" 한 줄
- ⚠️ 항목 (이유 + 권고 조치)
- ...

### 권고 수정
> 통과면 "수정 불필요"
- 항목 1
- ...

### 검증 메모
- 출처/근거 확인 횟수
- 추정·확인 필요 마킹 누락 여부
- 현행 법령·일정 적합성

---
**규칙**:
- 외부 출처 검증이 필요하나 접근 불가한 경우 "외부 검증 필요" 명시
- 판정 3종: **PASS** (그대로 발송 가능) / **FLAG** (수정 후 발송 권장) / **FAIL** (재작성 필요)
- 응답 첫 줄은 반드시 \`PASS\`, \`FLAG\`, \`FAIL\` 중 하나의 키워드를 \`### 판정\` 헤더 다음에 명시
`

export type AuditResult = {
  reportMarkdown: string
  verdict: 'pass' | 'flag' | 'fail'
}

export async function verifyTask(task: Task): Promise<AuditResult> {
  const gamsaPrompt = await loadPrompt('gamsa')
  const system = `${gamsaPrompt}\n${AUDIT_SUFFIX.replace('YYYY-MM-DD', new Date().toISOString().slice(0, 10))}`

  const auditInput = `## 검증 대상

**과제 제목**: ${task.title}
**최초 담당**: ${task.ownerLabel}
**본부장 배정 사유**: ${task.decisionSummary}

## 사용자 원문 입력
${task.userInput}

## ${task.ownerLabel} 산출물
${task.reportMarkdown ?? '(산출물 없음)'}

---
위 산출물을 외부 발송 전 전수 검증하세요.`

  const res = await anthropic().messages.create({
    model: AGENT_TO_MODEL.gamsa,
    max_tokens: 3072,
    system,
    messages: [{ role: 'user', content: auditInput }],
  })

  const md = res.content
    .filter((b) => b.type === 'text')
    .map((b) => (b as { type: 'text'; text: string }).text)
    .join('')
    .trim()

  const verdict = extractVerdict(md)
  return { reportMarkdown: md, verdict }
}

function extractVerdict(md: string): 'pass' | 'flag' | 'fail' {
  const upper = md.toUpperCase()
  // 1) "### 판정" 헤더 뒤 200자 안에서 **PASS/FLAG/FAIL** 형태로 찾기
  const judgIdx = upper.indexOf('### 판정')
  if (judgIdx >= 0) {
    const section = upper.slice(judgIdx, judgIdx + 200)
    const m = section.match(/\*\*\s*(PASS|FLAG|FAIL)\s*\*\*/)
    if (m) return m[1].toLowerCase() as 'pass' | 'flag' | 'fail'
  }
  // 2) 폴백: 문서 어디서든 첫 **PASS/FLAG/FAIL**
  const bm = upper.match(/\*\*\s*(PASS|FLAG|FAIL)\s*\*\*/)
  if (bm) return bm[1].toLowerCase() as 'pass' | 'flag' | 'fail'
  return 'flag'
}

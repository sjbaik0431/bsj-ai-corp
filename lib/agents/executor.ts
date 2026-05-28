import { anthropic, AGENT_TO_MODEL, AGENT_LABEL, type AgentId } from '@/lib/anthropic'
import { loadPrompt } from './prompts'
import { update, type Task } from '@/lib/store/tasks'
import { verifyTask } from './verifier'

const EXECUTION_SUFFIX = `
---
[작업 실행 모드]
본부장이 당신에게 이 과제를 위임했습니다. 당신의 직무 정체성에 맞게 **즉시 실행 가능한 마크다운 산출물 한 편**을 만들어 주세요.

요구사항:
- 한국어로 작성
- 마크다운 (제목·부제·표·체크리스트 적극 활용)
- 길이: 250-1200 단어 정도
- 외부 사실(가격·법령·날짜 등) 추정 시 "[추정]" 또는 "[확인 필요]" 명시
- 마지막에 "## 다음 액션" 섹션으로 2-4줄 정리

응답은 마크다운 본문만 출력하세요. 다른 메타 설명·코드 펜스 불필요.
`

export async function executeTask(task: Task): Promise<void> {
  try {
    // 1단계: 팀장 실행
    await update(task.id, { status: 'running', progress: 40 })

    const teamPrompt = await loadPrompt(task.owner)
    const system = `${teamPrompt}\n${EXECUTION_SUFFIX}`
    const userMessage = buildExecutionInput(task)

    const res = await anthropic().messages.create({
      model: AGENT_TO_MODEL[task.owner],
      max_tokens: 4096,
      system,
      messages: [{ role: 'user', content: userMessage }],
    })

    const report = res.content
      .filter((b) => b.type === 'text')
      .map((b) => (b as { type: 'text'; text: string }).text)
      .join('')
      .trim()

    const updated = await update(task.id, {
      status: task.needsAudit ? 'review' : 'done',
      progress: task.needsAudit ? 70 : 100,
      reportMarkdown: report,
    })

    // 2단계: 감사팀장 검증 (필요 시)
    if (task.needsAudit && updated) {
      const audit = await verifyTask(updated)
      await update(task.id, {
        status: 'done',
        progress: 100,
        auditReport: audit.reportMarkdown,
        auditVerdict: audit.verdict,
      })
    }
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e)
    console.error(`[executor:${task.id}:${task.owner}]`, msg)
    await update(task.id, {
      status: 'failed',
      progress: 100,
      errorMessage: msg,
    })
  }
}

function buildExecutionInput(task: Task): string {
  return `## 본부장 위임 메모

**작업 제목**: ${task.title}
**배정 사유**: ${task.decisionSummary}
**담당**: ${AGENT_LABEL[task.owner as AgentId]} (당신)
**감사팀장 검증 예정**: ${task.needsAudit ? '예 — 외부 발송 전 전수 검증됨' : '아니오 (내부용)'}

## 사용자 원문 입력

${task.userInput}

---
위 내용을 바탕으로 당신의 직무 영역에서 즉시 활용 가능한 산출물을 작성하세요.`
}

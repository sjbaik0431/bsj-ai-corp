import { anthropic, AGENT_TO_MODEL, AGENT_LABEL, type AgentId } from '@/lib/anthropic'
import { loadPrompt } from './prompts'
import { update, list, type Task } from '@/lib/store/tasks'
import { verifyTask } from './verifier'
import { publishTaskToLibrary } from '@/lib/store/library'

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

const RETRY_SUFFIX = `
---
[재작성 모드 — 감사 의견 반영]
이전 산출물이 감사팀장으로부터 **FAIL** 판정을 받았습니다. 아래 감사 의견을 한 줄도 빠짐없이 반영해서 산출물을 처음부터 다시 작성하세요. 빨간 깃발로 지적된 항목은 삭제하거나 "[확인 필요]"로 안전하게 표기.

응답은 새 마크다운 본문만. 사과·해명 텍스트 불필요.
`

export async function executeTask(task: Task): Promise<void> {
  try {
    await runOnce(task)
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e)
    console.error(`[executor:${task.id}:${task.owner}]`, msg)
    await update(task.id, { status: 'failed', progress: 100, errorMessage: msg })
  }
}

async function runOnce(task: Task, retryCount = 0): Promise<void> {
  await update(task.id, { status: 'running', progress: 40, retryCount })

  const teamPrompt = await loadPrompt(task.owner)
  const system = `${teamPrompt}\n${retryCount > 0 ? RETRY_SUFFIX : EXECUTION_SUFFIX}`
  const userMessage = buildExecutionInput(task, retryCount)

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

  if (task.needsAudit && updated) {
    const audit = await verifyTask(updated)
    await update(task.id, {
      auditReport: audit.reportMarkdown,
      auditVerdict: audit.verdict,
    })

    // FAIL이면서 첫 시도면 재작성 1회
    if (audit.verdict === 'fail' && retryCount === 0) {
      const refreshed = (await list()).find((t) => t.id === task.id)
      if (refreshed) {
        await runOnce(refreshed, 1)
        return
      }
    }

    await update(task.id, { status: 'done', progress: 100 })
  }

  // 자료실 게시
  const finalAll = await list()
  const final = finalAll.find((t) => t.id === task.id)
  if (final && final.status === 'done') {
    try {
      const libraryPath = await publishTaskToLibrary(final)
      if (libraryPath) await update(task.id, { libraryPath })
    } catch (e: unknown) {
      console.error(`[publish:${task.id}]`, e instanceof Error ? e.message : String(e))
    }
  }
}

function buildExecutionInput(task: Task, retryCount: number): string {
  const baseInput = `## 본부장 위임 메모

**작업 제목**: ${task.title}
**배정 사유**: ${task.decisionSummary}
**담당**: ${AGENT_LABEL[task.owner as AgentId]} (당신)
**감사팀장 검증 예정**: ${task.needsAudit ? '예 — 외부 발송 전 전수 검증됨' : '아니오 (내부용)'}

## 사용자 원문 입력

${task.userInput}`

  if (retryCount > 0 && task.auditReport && task.reportMarkdown) {
    return `${baseInput}

---

## 이전 산출물 (감사 FAIL)

${task.reportMarkdown}

---

## 감사팀장 의견 (반드시 반영)

${task.auditReport}

---
위 감사 의견 전수 반영해서 산출물을 처음부터 다시 작성하세요.`
  }

  return `${baseInput}

---
위 내용을 바탕으로 당신의 직무 영역에서 즉시 활용 가능한 산출물을 작성하세요.`
}

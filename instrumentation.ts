// Next.js 자동 호출: 서버 부팅 시 1회 실행
// KST 07:00 모닝 브리핑 트리거. brief 로직을 직접 import하지 않고 자기 자신의 HTTP 엔드포인트(/api/morning)를 호출하여
// 서버 코드의 node: 스킴 모듈이 instrumentation webpack 번들에 끌려오는 것을 피한다.

let lastFiredDate = ''

export async function register() {
  if (process.env.NEXT_RUNTIME !== 'nodejs') return
  if (process.env.BSJ_CRON_DISABLE === '1') return

  const port = process.env.PORT ?? '3000'
  const url = `http://127.0.0.1:${port}/api/morning?force=1`

  const tick = async () => {
    try {
      const parts = new Intl.DateTimeFormat('en-CA', {
        timeZone: 'Asia/Seoul',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      }).formatToParts(new Date())

      const get = (t: string) => parts.find((p) => p.type === t)?.value ?? ''
      const kstDate = `${get('year')}-${get('month')}-${get('day')}`
      const kstHour = parseInt(get('hour'), 10)
      const kstMinute = parseInt(get('minute'), 10)

      if (kstHour === 7 && kstMinute < 5 && lastFiredDate !== kstDate) {
        lastFiredDate = kstDate
        const res = await fetch(url, { method: 'POST' })
        if (res.ok) console.log(`[cron] morning brief generated for ${kstDate}`)
        else console.error(`[cron] morning brief failed: ${res.status}`)
      }
    } catch (e: unknown) {
      console.error('[cron:morning]', e instanceof Error ? e.message : String(e))
    }
  }

  setInterval(tick, 60_000)
  console.log('[cron] enabled: morning brief at 07:00 KST (HTTP-based)')
}

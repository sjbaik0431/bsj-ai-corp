// Next.js 자동 호출: 서버 부팅 시 1회 실행
export async function register() {
  if (process.env.NEXT_RUNTIME !== 'nodejs') return
  if (process.env.BSJ_CRON_DISABLE === '1') return

  const cron = await import('node-cron')

  // 매일 07:00 (Asia/Seoul) 모닝 브리핑 자동 생성
  cron.schedule(
    '0 7 * * *',
    async () => {
      try {
        const { generateMorningBrief } = await import('./lib/morning/brief')
        await generateMorningBrief()
        console.log('[cron] morning brief generated')
      } catch (e: unknown) {
        console.error('[cron:morning]', e instanceof Error ? e.message : String(e))
      }
    },
    { timezone: 'Asia/Seoul' },
  )

  console.log('[cron] scheduled: morning brief at 07:00 KST')
}

export default function EquityPage() {
  const capTable = [
    { name: 'BSJ (백상진)', role: '대주주 · 이사회 의장', share: 90, color: 'bg-amber-400' },
    { name: '본부장', role: 'CEO · 업무 분장', share: 6, color: 'bg-sky-500' },
    { name: '기획팀장', role: 'CSO · 조사·설계', share: 1, color: 'bg-emerald-500' },
    { name: '사업팀장', role: 'COO · 구축·실행', share: 1, color: 'bg-rose-500' },
    { name: '감사팀장', role: 'CIA · 팩트체크', share: 1, color: 'bg-purple-500' },
    { name: '민원팀장', role: 'CCO · 외부 연결', share: 1, color: 'bg-pink-500' },
  ]

  return (
    <main className="mx-auto max-w-4xl px-4 py-10 md:px-8">
      <h1 className="text-3xl md:text-4xl font-bold text-bsj-ink">주주총회 · 크레딧</h1>
      <p className="mt-2 text-slate-600">매월 1일 성과 평가 후 BSJ 지분 1%를 우수 팀장에게 크레딧으로 양도</p>

      <section className="mt-8">
        <h2 className="text-xl font-semibold">Cap Table (현재)</h2>
        <div className="mt-4 space-y-3">
          {capTable.map((row) => (
            <div key={row.name} className="rounded-2xl bg-white p-4 shadow-sm border border-slate-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold">{row.name}</p>
                  <p className="text-sm text-slate-500">{row.role}</p>
                </div>
                <p className="text-2xl font-bold tabular-nums">{row.share}%</p>
              </div>
              <div className="mt-3 h-2 w-full rounded-full bg-slate-100">
                <div className={`${row.color} h-2 rounded-full`} style={{ width: `${row.share}%` }} />
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-10">
        <h2 className="text-xl font-semibold">월간 KPI</h2>
        <p className="mt-2 text-slate-500 text-sm">아직 데이터 없음 — 첫 평가는 다음 달 1일에 자동 생성됩니다.</p>
      </section>

      <a href="/" className="mt-8 inline-block text-bsj-primary hover:underline">← 메인으로</a>
    </main>
  )
}

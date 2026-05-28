export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}))
  return Response.json({
    ok: true,
    note: 'Phase B 완성 후 본부장(Opus)이 자동 분배합니다.',
    received: body,
  }, { status: 202 })
}

export async function GET() {
  return Response.json({
    tasks: [
      { id: '052', title: '조아호텔 5월 IR 자료', owner: '사업팀장', progress: 67, status: 'running' },
      { id: '053', title: 'MICE 입찰 5건 검증', owner: '감사팀장', progress: 100, status: 'review' },
      { id: '054', title: '진천메가폴리스 IR 정리', owner: '기획팀장', progress: 23, status: 'running' },
    ],
  })
}

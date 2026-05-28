export const runtime = 'edge'

const FALLBACK = { temp: 22, condition: 'Clear', city: 'Cheongju' }

export async function GET() {
  const key = process.env.OPENWEATHER_API_KEY
  const city = process.env.OPENWEATHER_DEFAULT_CITY ?? 'Cheongju,KR'

  if (!key) {
    return Response.json({ ...FALLBACK, note: 'OPENWEATHER_API_KEY 미설정 — 기본값' })
  }

  try {
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${key}&units=metric&lang=kr`
    const r = await fetch(url, { next: { revalidate: 600 } })
    if (!r.ok) throw new Error(`OWM ${r.status}`)
    const d = await r.json() as { main: { temp: number }; weather: { main: string; description: string }[]; name: string }
    return Response.json({
      temp: Math.round(d.main.temp),
      condition: d.weather[0]?.description ?? d.weather[0]?.main ?? '맑음',
      city: d.name,
    })
  } catch (e) {
    return Response.json({ ...FALLBACK, error: String(e) })
  }
}

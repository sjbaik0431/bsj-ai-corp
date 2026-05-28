import { loadEquity } from '@/lib/store/equity'
import { EquityClient } from './client'

export const dynamic = 'force-dynamic'

export default async function EquityPage() {
  const state = await loadEquity()
  return <EquityClient initialState={state} />
}

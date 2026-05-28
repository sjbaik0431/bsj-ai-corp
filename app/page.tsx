import { Header } from '@/components/header'
import { MorningRoutine } from '@/components/morning-routine'
import { CharacterRow } from '@/components/character-row'
import { TaskInput } from '@/components/task-input'
import { LiveTasks } from '@/components/live-tasks'
import { LibraryGrid } from '@/components/library-grid'

export default function HomePage() {
  return (
    <main className="mx-auto max-w-7xl px-4 py-6 md:px-8 md:py-10">
      <Header />
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <MorningRoutine />
      </div>
      <section className="mt-8">
        <CharacterRow />
      </section>
      <section className="mt-8">
        <TaskInput />
      </section>
      <section className="mt-8">
        <LiveTasks />
      </section>
      <section className="mt-8 mb-12">
        <LibraryGrid />
      </section>
      <footer className="mt-16 border-t border-slate-200 pt-6 pb-10 text-center text-sm text-slate-500">
        <p>BSJ AI 주식회사 · 90/6/4 cap table · v0.1</p>
        <p className="mt-1">
          <a href="/equity" className="underline hover:text-bsj-primary">주주총회 · 크레딧</a>
        </p>
      </footer>
    </main>
  )
}

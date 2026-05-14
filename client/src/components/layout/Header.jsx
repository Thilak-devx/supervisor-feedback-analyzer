function Header() {
  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
            Dashboard
          </p>
          <p className="mt-1 text-lg font-semibold text-slate-950">
            Supervisor Feedback Analyzer
          </p>
        </div>

        <div className="w-fit rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-sm text-slate-600">
          Local analysis workspace
        </div>
      </div>
    </header>
  )
}

export default Header

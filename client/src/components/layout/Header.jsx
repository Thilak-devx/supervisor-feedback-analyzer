function Header() {
  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4 lg:px-8">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
            Client
          </p>
          <p className="mt-1 text-lg font-semibold text-slate-950">
            Supervisor Feedback Analyzer
          </p>
        </div>

        <div className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-sm text-slate-600">
          Ready for transcript input
        </div>
      </div>
    </header>
  )
}

export default Header

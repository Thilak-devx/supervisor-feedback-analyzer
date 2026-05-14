function ResultSection({
  title,
  description,
  content,
  isLoading,
  emptyMessage,
}) {
  const items = Array.isArray(content) ? content.filter(Boolean) : []

  return (
    <article className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex h-full flex-col gap-5">
        <div>
          <h3 className="text-lg font-semibold text-slate-950">{title}</h3>
          <p className="mt-2 text-sm leading-6 text-slate-600">{description}</p>
        </div>

        <div className="flex-1 rounded-3xl bg-slate-50 p-4">
          {isLoading ? (
            <div className="flex min-h-32 items-center justify-center gap-3 text-sm text-slate-500">
              <span
                className="spinner h-4 w-4 rounded-full border-2 border-slate-300 border-t-slate-700"
                aria-hidden="true"
              />
              Loading analysis...
            </div>
          ) : items.length > 0 ? (
            <ul className="space-y-3">
              {items.map((item) => (
                <li
                  key={item}
                  className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm leading-6 text-slate-700"
                >
                  {item}
                </li>
              ))}
            </ul>
          ) : (
            <p className="min-h-32 text-sm leading-6 text-slate-400">
              {emptyMessage}
            </p>
          )}
        </div>
      </div>
    </article>
  )
}

export default ResultSection

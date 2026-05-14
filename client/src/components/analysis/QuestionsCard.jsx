function QuestionsCard({ questions, isLoading }) {
  const items = Array.isArray(questions) ? questions.filter(Boolean) : []

  return (
    <article className="rounded-[2rem] border border-slate-200/90 bg-white p-5 shadow-[0_12px_40px_rgba(15,23,42,0.04)] sm:p-6">
      <div className="flex h-full flex-col gap-5">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
            Discussion
          </p>
          <h3 className="mt-2 text-xl font-semibold tracking-tight text-slate-950">
            Follow-Up Questions
          </h3>
          <p className="mt-2 text-sm leading-7 text-slate-600">
            Suggested next questions, ordered to support a clearer coaching
            conversation.
          </p>
        </div>

        <div className="flex-1 rounded-[1.75rem] bg-slate-50 p-4 sm:p-5">
          {isLoading ? (
            <div className="flex min-h-32 items-center justify-center gap-3 text-sm text-slate-500">
              <span
                className="spinner h-4 w-4 rounded-full border-2 border-slate-300 border-t-slate-700"
                aria-hidden="true"
              />
              Loading questions...
            </div>
          ) : items.length > 0 ? (
            <div className="space-y-4">
              <div className="rounded-[1.25rem] border border-slate-200 bg-white px-4 py-3">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                  Recommended order
                </p>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Start with context, then move into evidence, blockers, and
                  concrete next steps.
                </p>
              </div>

              <ol className="space-y-3">
              {items.map((question, index) => (
                <li
                  key={question}
                  className="flex gap-4 rounded-[1.5rem] border border-slate-200 bg-white px-4 py-4"
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-slate-900 text-sm font-semibold text-white">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <div className="flex flex-col gap-1 pt-0.5">
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                      Question {index + 1}
                    </p>
                    <p className="text-sm leading-7 text-slate-700">
                      {question}
                    </p>
                  </div>
                </li>
              ))}
              </ol>
            </div>
          ) : (
            <p className="min-h-24 text-sm leading-7 text-slate-400">
              No follow-up questions were returned for this run. Try running the
              analysis again if you want more coaching prompts.
            </p>
          )}
        </div>
      </div>
    </article>
  )
}

export default QuestionsCard

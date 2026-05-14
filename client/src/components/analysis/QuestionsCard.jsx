function QuestionsCard({ questions, isLoading }) {
  const items = Array.isArray(questions) ? questions.filter(Boolean) : []

  return (
    <article className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex h-full flex-col gap-5">
        <div>
          <h3 className="text-lg font-semibold text-slate-950">
            Follow-Up Questions
          </h3>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Suggested questions to help continue the conversation with clarity.
          </p>
        </div>

        <div className="flex-1 rounded-3xl bg-slate-50 p-4">
          {isLoading ? (
            <div className="flex min-h-40 items-center justify-center gap-3 text-sm text-slate-500">
              <span
                className="spinner h-4 w-4 rounded-full border-2 border-slate-300 border-t-slate-700"
                aria-hidden="true"
              />
              Loading questions...
            </div>
          ) : items.length > 0 ? (
            <ol className="space-y-3">
              {items.map((question, index) => (
                <li
                  key={question}
                  className="flex gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-4"
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-900 text-sm font-semibold text-white">
                    {index + 1}
                  </span>
                  <p className="pt-1 text-sm leading-6 text-slate-700">
                    {question}
                  </p>
                </li>
              ))}
            </ol>
          ) : (
            <p className="min-h-40 text-sm leading-6 text-slate-400">
              Follow-up questions will appear here.
            </p>
          )}
        </div>
      </div>
    </article>
  )
}

export default QuestionsCard

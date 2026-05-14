const toneClasses = {
  positive: 'border-emerald-200 bg-emerald-50/70 text-emerald-800',
  negative: 'border-rose-200 bg-rose-50/70 text-rose-800',
  neutral: 'border-slate-200 bg-slate-100 text-slate-700',
}

const toneLabels = {
  positive: 'Positive',
  negative: 'Negative',
  neutral: 'Neutral',
}

function EvidenceCard({ evidence, isLoading }) {
  const items = Array.isArray(evidence)
    ? evidence.filter((item) => item && typeof item === 'object')
    : []

  return (
    <article className="rounded-[2rem] border border-slate-200/90 bg-white p-5 shadow-[0_12px_40px_rgba(15,23,42,0.04)] sm:p-6">
      <div className="flex h-full flex-col gap-5">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
            Evidence
          </p>
          <h3 className="mt-2 text-xl font-semibold tracking-tight text-slate-950">
            Transcript highlights
          </h3>
          <p className="mt-2 text-sm leading-7 text-slate-600">
            Key observations pulled from the transcript, labeled for quick
            interpretation.
          </p>
        </div>

        <div className="flex-1 rounded-[1.75rem] bg-slate-50 p-4 sm:p-5">
          {isLoading ? (
            <div className="flex min-h-32 items-center justify-center gap-3 text-sm text-slate-500">
              <span
                className="spinner h-4 w-4 rounded-full border-2 border-slate-300 border-t-slate-700"
                aria-hidden="true"
              />
              Loading evidence...
            </div>
          ) : items.length > 0 ? (
            <ul className="space-y-4">
              {items.map((item) => {
                const tone =
                  item.sentiment === 'positive' || item.sentiment === 'negative'
                    ? item.sentiment
                    : 'neutral'
                const key = `${item.quote}-${item.category}-${item.explanation}`

                return (
                  <li
                    key={key}
                    className="rounded-[1.5rem] border border-slate-200 bg-white p-4 sm:p-5"
                  >
                    <div className="flex flex-col gap-5">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <span className="inline-flex w-fit rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-slate-600">
                          {item.category || 'General Observation'}
                        </span>
                        <span
                          className={`inline-flex w-fit rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] ${toneClasses[tone]}`}
                        >
                          {toneLabels[tone]}
                        </span>
                      </div>

                      <div className="rounded-[1.25rem] border border-slate-200 bg-slate-50/70 p-4 sm:p-5">
                        <blockquote className="text-base font-medium leading-8 tracking-[-0.01em] text-slate-950 sm:text-[1.05rem]">
                          "{item.quote}"
                        </blockquote>
                      </div>

                      <div className="space-y-2">
                        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                          Explanation
                        </p>
                        <p className="text-sm leading-7 text-slate-600">
                          {item.explanation}
                        </p>
                      </div>
                    </div>
                  </li>
                )
              })}
            </ul>
          ) : (
            <p className="min-h-24 text-sm leading-7 text-slate-500">
              No direct quote-level evidence was isolated for this run. The
              score, KPI mapping, and gap analysis may still reflect broader
              transcript patterns identified by the model.
            </p>
          )}
        </div>
      </div>
    </article>
  )
}

export default EvidenceCard

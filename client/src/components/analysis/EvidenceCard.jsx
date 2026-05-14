import { getEvidenceTone } from '../../utils/formatAnalysis.js'

const toneClasses = {
  positive: 'border-emerald-200 bg-emerald-50 text-emerald-800',
  negative: 'border-rose-200 bg-rose-50 text-rose-800',
  neutral: 'border-amber-200 bg-amber-50 text-amber-800',
}

const toneLabels = {
  positive: 'Positive',
  negative: 'Negative',
  neutral: 'Neutral',
}

function EvidenceCard({ evidence, isLoading }) {
  const items = Array.isArray(evidence) ? evidence.filter(Boolean) : []

  return (
    <article className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex h-full flex-col gap-5">
        <div>
          <h3 className="text-lg font-semibold text-slate-950">Evidence</h3>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Key observations pulled from the transcript, labeled for quick
            interpretation.
          </p>
        </div>

        <div className="flex-1 rounded-3xl bg-slate-50 p-4">
          {isLoading ? (
            <div className="flex min-h-40 items-center justify-center gap-3 text-sm text-slate-500">
              <span
                className="spinner h-4 w-4 rounded-full border-2 border-slate-300 border-t-slate-700"
                aria-hidden="true"
              />
              Loading evidence...
            </div>
          ) : items.length > 0 ? (
            <ul className="space-y-3">
              {items.map((item) => {
                const tone = getEvidenceTone(item)

                return (
                  <li
                    key={item}
                    className="rounded-2xl border border-slate-200 bg-white p-4"
                  >
                    <div className="flex flex-col gap-3">
                      <span
                        className={`inline-flex w-fit rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] ${toneClasses[tone]}`}
                      >
                        {toneLabels[tone]}
                      </span>
                      <p className="text-sm leading-6 text-slate-700">{item}</p>
                    </div>
                  </li>
                )
              })}
            </ul>
          ) : (
            <p className="min-h-40 text-sm leading-6 text-slate-400">
              Evidence highlights will appear here.
            </p>
          )}
        </div>
      </div>
    </article>
  )
}

export default EvidenceCard

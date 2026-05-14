import { parseGapItem } from '../../utils/formatAnalysis.js'

const priorityClasses = {
  high: 'border-rose-200 bg-rose-50/70 text-rose-700',
  standard: 'border-slate-200 bg-slate-100 text-slate-600',
}

function GapBucket({ title, description, items, emptyMessage }) {
  return (
    <div className="rounded-[1.5rem] border border-slate-200 bg-white p-4 sm:p-5">
      <div className="flex flex-col gap-2">
        <h4 className="text-sm font-semibold uppercase tracking-[0.12em] text-slate-700">
          {title}
        </h4>
        <p className="text-sm leading-6 text-slate-500">{description}</p>
      </div>

      {items.length > 0 ? (
        <ul className="mt-4 space-y-3">
          {items.map((item) => (
            <li
              key={`${item.label}-${item.detail}`}
              className="rounded-[1.25rem] border border-slate-200 bg-slate-50 px-4 py-4"
            >
              <div className="flex flex-col gap-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-sm font-semibold text-slate-900">
                    {item.label}
                  </p>
                  {item.type === 'gap' ? (
                    <span
                      className={`inline-flex rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] ${priorityClasses[item.priority]}`}
                    >
                      {item.priority === 'high' ? 'Important Gap' : 'Gap'}
                    </span>
                  ) : null}
                </div>
                <p className="text-sm leading-7 text-slate-600">{item.detail}</p>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-4 text-sm leading-7 text-slate-400">{emptyMessage}</p>
      )}
    </div>
  )
}

function GapAnalysisCard({ items, isLoading }) {
  const gaps = Array.isArray(items) ? items.map(parseGapItem).filter(Boolean) : []
  const observedGaps = gaps.filter((item) => item.type === 'gap')
  const missingInformation = gaps.filter((item) => item.type === 'missing')

  return (
    <article className="rounded-[2rem] border border-slate-200/90 bg-white p-5 shadow-[0_12px_40px_rgba(15,23,42,0.04)] sm:p-6">
      <div className="flex h-full flex-col gap-5">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
            Gaps
          </p>
          <h3 className="mt-2 text-xl font-semibold tracking-tight text-slate-950">
            Gap Analysis
          </h3>
          <p className="mt-2 text-sm leading-7 text-slate-600">
            Missing behaviors and missing information are separated so the next
            conversation can focus on what matters most.
          </p>
        </div>

        <div className="flex-1 rounded-[1.75rem] bg-slate-50 p-4 sm:p-5">
          {isLoading ? (
            <div className="flex min-h-28 items-center justify-center gap-3 text-sm text-slate-500">
              <span
                className="spinner h-4 w-4 rounded-full border-2 border-slate-300 border-t-slate-700"
                aria-hidden="true"
              />
              Loading gap analysis...
            </div>
          ) : (
            <div className="grid gap-4">
              <GapBucket
                title="Observed Gaps"
                description="Performance, communication, or follow-through issues that were explicitly detected."
                items={observedGaps}
                emptyMessage="No clear performance or communication gaps were identified in this run."
              />
              <GapBucket
                title="Missing Information"
                description="Areas where the transcript did not provide enough evidence for a stronger conclusion."
                items={missingInformation}
                emptyMessage="No major missing-information flags were raised in this run."
              />
            </div>
          )}
        </div>
      </div>
    </article>
  )
}

export default GapAnalysisCard

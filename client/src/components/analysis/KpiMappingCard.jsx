import { parseKpiItem } from '../../utils/formatAnalysis.js'

function KpiMappingCard({ items, isLoading }) {
  const kpis = Array.isArray(items) ? items.map(parseKpiItem).filter(Boolean) : []

  return (
    <article className="rounded-[2rem] border border-slate-200/90 bg-white p-5 shadow-[0_12px_40px_rgba(15,23,42,0.04)] sm:p-6">
      <div className="flex h-full flex-col gap-5">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
            Metrics
          </p>
          <h3 className="mt-2 text-xl font-semibold tracking-tight text-slate-950">
            KPI Mapping
          </h3>
          <p className="mt-2 text-sm leading-7 text-slate-600">
            Compact performance indicators connected to the transcript.
          </p>
        </div>

        <div className="flex-1 rounded-[1.75rem] bg-slate-50 p-4 sm:p-5">
          {isLoading ? (
            <div className="flex min-h-28 items-center justify-center gap-3 text-sm text-slate-500">
              <span
                className="spinner h-4 w-4 rounded-full border-2 border-slate-300 border-t-slate-700"
                aria-hidden="true"
              />
              Loading KPI mapping...
            </div>
          ) : kpis.length > 0 ? (
            <div className="grid auto-rows-fr gap-3 sm:grid-cols-2">
              {kpis.map((kpi) => (
                <article
                  key={`${kpi.label}-${kpi.description}`}
                  className="flex h-full min-w-0 flex-col rounded-[1.5rem] border border-slate-200 bg-white p-4 sm:p-5"
                >
                  <div className="flex h-full min-w-0 flex-col gap-4">
                    <div className="min-w-0 space-y-3">
                      <span className="inline-flex max-w-full rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-[0.68rem] font-semibold uppercase tracking-[0.12em] text-slate-500">
                        KPI Mapping
                      </span>
                      <h4 className="text-sm font-semibold leading-6 text-slate-900 break-words sm:text-[0.95rem]">
                        {kpi.label}
                      </h4>
                    </div>

                    <p className="text-sm leading-7 text-slate-600">
                      {kpi.description}
                    </p>

                    <span className="mt-auto inline-flex w-fit rounded-full bg-slate-100 px-3 py-1 text-[0.7rem] font-medium text-slate-500">
                      Transcript-aligned
                    </span>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <p className="min-h-20 text-sm leading-7 text-slate-400">
              No KPI connections were available for this run. Try rerunning the
              analysis for more detail.
            </p>
          )}
        </div>
      </div>
    </article>
  )
}

export default KpiMappingCard

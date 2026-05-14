import { getScoreDisplay } from '../../utils/formatAnalysis.js'

const toneClasses = {
  positive: 'border-emerald-200 bg-emerald-50 text-emerald-800',
  negative: 'border-rose-200 bg-rose-50 text-rose-800',
  neutral: 'border-amber-200 bg-amber-50 text-amber-800',
}

function ScoreCard({ rubricScore, isLoading }) {
  const score = typeof rubricScore?.score === 'number' ? rubricScore.score : 0
  const justification =
    typeof rubricScore?.justification === 'string'
      ? rubricScore.justification
      : ''
  const scoreDisplay = getScoreDisplay(score)

  return (
    <section className="rounded-[2rem] border border-slate-200/90 bg-white p-5 shadow-[0_12px_40px_rgba(15,23,42,0.04)] sm:p-8">
      <div className="grid gap-5 lg:grid-cols-[280px_minmax(0,1fr)] lg:items-stretch">
        <div className="rounded-[1.75rem] bg-slate-950 px-6 py-7 text-white sm:px-7 sm:py-8">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-300">
            Rubric Score
          </p>

          {isLoading ? (
            <div className="mt-6 flex items-center gap-3 text-sm text-slate-200">
              <span
                className="spinner h-5 w-5 rounded-full border-2 border-white/30 border-t-white"
                aria-hidden="true"
              />
              Calculating score...
            </div>
          ) : (
            <>
              <div className="mt-7 flex items-end gap-2">
                <span className="text-6xl font-semibold tracking-tight sm:text-7xl">
                  {score.toFixed(1)}
                </span>
                <span className="pb-2 text-sm text-slate-300">out of 10</span>
              </div>

              <div
                className={`mt-6 inline-flex rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] ${toneClasses[scoreDisplay.tone]}`}
              >
                {scoreDisplay.label}
              </div>
            </>
          )}
        </div>

        <div className="rounded-[1.75rem] border border-slate-200 bg-slate-50 p-5 sm:p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
            Summary
          </p>
          <h3 className="mt-2 text-xl font-semibold tracking-tight text-slate-950">
            Score justification
          </h3>
          {isLoading ? (
            <div className="mt-4 flex items-center gap-3 text-sm text-slate-500">
              <span
                className="spinner h-4 w-4 rounded-full border-2 border-slate-300 border-t-slate-700"
                aria-hidden="true"
              />
              Generating explanation...
            </div>
          ) : justification ? (
            <p className="mt-5 text-sm leading-7 text-slate-700 sm:text-[0.95rem]">
              {justification}
            </p>
          ) : (
            <p className="mt-4 text-sm leading-7 text-slate-400">
              A rubric explanation was not available for this run. Try
              analyzing again for more context.
            </p>
          )}
        </div>
      </div>
    </section>
  )
}

export default ScoreCard

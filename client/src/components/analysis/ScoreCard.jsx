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
    <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
      <div className="grid gap-6 lg:grid-cols-[240px_minmax(0,1fr)] lg:items-center">
        <div className="rounded-3xl bg-slate-950 px-6 py-8 text-white">
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
              <div className="mt-5 flex items-end gap-2">
                <span className="text-5xl font-semibold tracking-tight">
                  {score.toFixed(1)}
                </span>
                <span className="pb-1 text-sm text-slate-300">out of 10</span>
              </div>

              <div
                className={`mt-5 inline-flex rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] ${toneClasses[scoreDisplay.tone]}`}
              >
                {scoreDisplay.label}
              </div>
            </>
          )}
        </div>

        <div className="rounded-3xl bg-slate-50 p-5">
          <h3 className="text-lg font-semibold text-slate-950">Justification</h3>
          {isLoading ? (
            <div className="mt-4 flex items-center gap-3 text-sm text-slate-500">
              <span
                className="spinner h-4 w-4 rounded-full border-2 border-slate-300 border-t-slate-700"
                aria-hidden="true"
              />
              Generating explanation...
            </div>
          ) : justification ? (
            <p className="mt-4 text-sm leading-7 text-slate-700">
              {justification}
            </p>
          ) : (
            <p className="mt-4 text-sm leading-7 text-slate-400">
              The rubric explanation will appear here once the analysis is
              complete.
            </p>
          )}
        </div>
      </div>
    </section>
  )
}

export default ScoreCard

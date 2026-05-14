import { useEffect, useState } from 'react'
import EvidenceCard from './EvidenceCard.jsx'
import GapAnalysisCard from './GapAnalysisCard.jsx'
import KpiMappingCard from './KpiMappingCard.jsx'
import QuestionsCard from './QuestionsCard.jsx'
import ScoreCard from './ScoreCard.jsx'

function StatusBadge({ analysis, error, isLoading }) {
  const label = isLoading
    ? 'In progress'
    : error
      ? 'Needs attention'
      : analysis
        ? 'Complete'
        : 'Waiting'

  return (
    <div className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-600">
      {label}
    </div>
  )
}

function EmptyStateCard() {
  return (
    <section className="rounded-[2rem] border border-dashed border-slate-300 bg-white p-6 shadow-[0_12px_40px_rgba(15,23,42,0.04)] sm:p-8">
      <div className="flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">
        <div className="max-w-lg">
          <div className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500 w-fit">
            Ready
          </div>
          <h3 className="mt-5 text-2xl font-semibold tracking-tight text-slate-950">
            Your analysis workspace is prepared
          </h3>
          <p className="mt-3 text-sm leading-7 text-slate-600 sm:text-base">
            Add a transcript on the left to generate a structured review with
            evidence, score, KPI mapping, gap analysis, and follow-up
            questions.
          </p>

          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                Evidence
              </p>
              <p className="mt-2 text-sm text-slate-700">
                Quote-based observations with sentiment and explanation.
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                Score
              </p>
              <p className="mt-2 text-sm text-slate-700">
                Rubric score with concise reasoning and fallback protection.
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                Actions
              </p>
              <p className="mt-2 text-sm text-slate-700">
                KPI mapping, gaps, and follow-up questions in one panel.
              </p>
            </div>
          </div>
        </div>

        <div className="mx-auto w-full max-w-sm rounded-[1.75rem] border border-slate-200 bg-slate-50 p-5 xl:mx-0">
          <div className="rounded-[1.5rem] border border-slate-200 bg-white p-4">
            <div className="flex items-center justify-between">
              <div className="h-3 w-24 rounded-full bg-slate-200" />
              <div className="h-7 w-16 rounded-full bg-slate-100" />
            </div>
            <div className="mt-5 rounded-[1.25rem] bg-slate-950 p-5 text-white">
              <div className="h-3 w-20 rounded-full bg-white/20" />
              <div className="mt-5 h-10 w-24 rounded-full bg-white/15" />
              <div className="mt-4 h-6 w-28 rounded-full bg-white/15" />
            </div>
            <div className="mt-4 grid gap-3">
              <div className="rounded-[1.25rem] border border-slate-200 bg-slate-50 p-4">
                <div className="h-3 w-16 rounded-full bg-slate-200" />
                <div className="mt-3 h-4 w-full rounded-full bg-slate-200" />
                <div className="mt-2 h-4 w-5/6 rounded-full bg-slate-100" />
              </div>
              <div className="rounded-[1.25rem] border border-slate-200 bg-slate-50 p-4">
                <div className="h-3 w-20 rounded-full bg-slate-200" />
                <div className="mt-3 h-4 w-full rounded-full bg-slate-200" />
                <div className="mt-2 h-4 w-4/5 rounded-full bg-slate-100" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

const loadingMessages = [
  'Extracting evidence...',
  'Evaluating rubric...',
  'Mapping KPIs...',
  'Generating follow-up questions...',
]

function LoadingStateCard() {
  const [activeStepIndex, setActiveStepIndex] = useState(0)

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setActiveStepIndex((currentIndex) =>
        currentIndex < loadingMessages.length - 1 ? currentIndex + 1 : currentIndex,
      )
    }, 1400)

    return () => {
      window.clearInterval(intervalId)
    }
  }, [])

  return (
    <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-[0_12px_40px_rgba(15,23,42,0.04)] sm:p-8">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500 w-fit">
              Analysis in progress
            </div>
            <h3 className="mt-4 text-2xl font-semibold tracking-tight text-slate-950">
              Building your results dashboard
            </h3>
            <p className="mt-2 max-w-xl text-sm leading-7 text-slate-600 sm:text-base">
              The transcript is being processed in stages. Results will appear
              automatically as soon as the analysis is ready.
            </p>
          </div>

          <div className="flex items-center gap-3 rounded-[1.5rem] border border-slate-200 bg-slate-50 px-4 py-3">
            <span
              className="spinner h-6 w-6 rounded-full border-[3px] border-slate-200 border-t-slate-900"
              aria-hidden="true"
            />
            <span className="text-sm font-medium text-slate-700">
              {loadingMessages[activeStepIndex]}
            </span>
          </div>
        </div>

        <div className="rounded-[1.75rem] border border-slate-200 bg-slate-50 p-5">
          <div className="flex flex-col gap-4">
            {loadingMessages.map((step, index) => {
              const isCompleted = index < activeStepIndex
              const isActive = index === activeStepIndex

              return (
              <div
                key={step}
                className={`flex items-center gap-4 rounded-[1.25rem] border px-4 py-4 transition-colors ${
                  isActive
                    ? 'border-slate-300 bg-white'
                    : 'border-slate-200 bg-white'
                }`}
              >
                <div
                  className={`relative flex h-9 w-9 items-center justify-center rounded-full text-sm font-semibold ${
                    isCompleted || isActive
                      ? 'bg-slate-900 text-white'
                      : 'bg-slate-200 text-slate-500'
                  }`}
                >
                  {index + 1}
                  {isActive ? (
                    <span className="progress-ping absolute inset-0 rounded-full bg-slate-900/10" />
                  ) : null}
                </div>
                <div className="flex-1">
                  <p
                    className={`text-sm font-medium ${
                      isActive ? 'text-slate-950' : 'text-slate-700'
                    }`}
                  >
                    {step}
                  </p>
                  <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className={`h-full rounded-full ${
                        isCompleted
                          ? 'w-full bg-slate-900'
                          : isActive
                            ? 'progress-bar bg-slate-900'
                            : 'w-0 bg-slate-200'
                      }`}
                      style={isActive ? { animationDelay: `${index * 0.14}s` } : undefined}
                    />
                  </div>
                </div>
              </div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}

function ErrorStateCard({ error }) {
  return (
    <section className="rounded-[2rem] border border-red-200 bg-white p-8 shadow-[0_12px_40px_rgba(15,23,42,0.04)]">
      <div className="flex min-h-48 flex-col items-center justify-center text-center">
        <div className="rounded-full border border-red-200 bg-red-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-red-700">
          Error
        </div>
        <h3 className="mt-5 text-xl font-semibold text-slate-950">
          We could not complete the analysis
        </h3>
        <p className="mt-3 max-w-md text-sm leading-7 text-slate-600">
          {error ||
            'Something went wrong while generating the analysis. Please review the transcript and try again.'}
        </p>
      </div>
    </section>
  )
}

function IncompleteStateCard() {
  return (
    <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-[0_12px_40px_rgba(15,23,42,0.04)]">
      <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
        <div className="flex flex-col gap-2">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
            Partial Analysis
          </p>
          <h3 className="text-lg font-semibold text-slate-950">
            Some sections were incomplete
          </h3>
          <p className="text-sm leading-7 text-slate-600">
            The model returned a partial response, so fallback values are being
            shown where needed. You can still review the available insights or
            rerun the analysis for a fuller result.
          </p>
        </div>
      </div>
    </section>
  )
}

function hasIncompleteAnalysis(analysis) {
  if (!analysis) {
    return false
  }

  const hasFallbackJustification =
    typeof analysis.rubricScore?.justification === 'string' &&
    analysis.rubricScore.justification.includes('fallback values were used')

  const missingEvidence =
    !Array.isArray(analysis.evidence) || analysis.evidence.length === 0
  const missingKpiMapping =
    !Array.isArray(analysis.kpiMapping) || analysis.kpiMapping.length === 0
  const missingGapAnalysis =
    !Array.isArray(analysis.gapAnalysis) || analysis.gapAnalysis.length === 0
  const missingQuestions =
    !Array.isArray(analysis.followUpQuestions) ||
    analysis.followUpQuestions.length === 0

  if (hasFallbackJustification) {
    return true
  }

  const missingNonEvidenceSections = [
    missingKpiMapping,
    missingGapAnalysis,
    missingQuestions,
  ].filter(Boolean).length

  const hasOtherInsights =
    !missingKpiMapping ||
    !missingGapAnalysis ||
    !missingQuestions ||
    Boolean(analysis.rubricScore?.justification)

  if (missingEvidence && !hasOtherInsights) {
    return true
  }

  return missingNonEvidenceSections > 0
}

function ResultsDashboard({ analysis }) {
  return (
    <div className="flex flex-col gap-6 lg:gap-7">
      <ScoreCard rubricScore={analysis?.rubricScore} isLoading={false} />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.08fr)_minmax(0,0.92fr)]">
        <EvidenceCard evidence={analysis?.evidence} isLoading={false} />
        <QuestionsCard questions={analysis?.followUpQuestions} isLoading={false} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <KpiMappingCard items={analysis?.kpiMapping} isLoading={false} />
        <GapAnalysisCard items={analysis?.gapAnalysis} isLoading={false} />
      </div>
    </div>
  )
}

function AnalysisResults({ analysis, isLoading, error, hasRequestedAnalysis }) {
  const isIncomplete = hasIncompleteAnalysis(analysis)

  return (
    <aside className="flex flex-col gap-6 lg:gap-7">
      <section className="rounded-[2rem] border border-slate-200/90 bg-white p-5 shadow-[0_12px_40px_rgba(15,23,42,0.04)] sm:p-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
              Dashboard
            </p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950 sm:text-[2rem]">
              Analysis Results
            </h2>
            <p className="mt-3 max-w-xl text-sm leading-7 text-slate-600">
              Review the score, evidence, KPI mapping, gaps, and follow-up
              questions in one place.
            </p>
          </div>
          <StatusBadge analysis={analysis} error={error} isLoading={isLoading} />
        </div>
      </section>

      {!hasRequestedAnalysis && !analysis && !isLoading ? <EmptyStateCard /> : null}
      {isLoading ? <LoadingStateCard /> : null}
      {!isLoading && error ? <ErrorStateCard error={error} /> : null}

      {!isLoading && !error && analysis ? (
        <>
          {isIncomplete ? <IncompleteStateCard /> : null}
          <ResultsDashboard analysis={analysis} />
        </>
      ) : null}
    </aside>
  )
}

export default AnalysisResults

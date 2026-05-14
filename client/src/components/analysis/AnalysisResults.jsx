import EvidenceCard from './EvidenceCard.jsx'
import QuestionsCard from './QuestionsCard.jsx'
import ResultSection from './ResultSection.jsx'
import ScoreCard from './ScoreCard.jsx'

function AnalysisResults({ analysis, isLoading }) {
  return (
    <aside className="flex flex-col gap-6">
      <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
              Dashboard
            </p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
              Analysis Results
            </h2>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              Review the score, evidence, KPI mapping, gaps, and follow-up
              questions in one place.
            </p>
          </div>
          <div className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-600">
            {isLoading ? 'In progress' : analysis ? 'Complete' : 'Waiting'}
          </div>
        </div>
      </section>

      <ScoreCard rubricScore={analysis?.rubricScore} isLoading={isLoading} />

      <div className="grid gap-6 xl:grid-cols-2">
        <EvidenceCard evidence={analysis?.evidence} isLoading={isLoading} />
        <QuestionsCard
          questions={analysis?.followUpQuestions}
          isLoading={isLoading}
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <ResultSection
          title="KPI Mapping"
          description="How the conversation connects to measurable performance indicators."
          content={analysis?.kpiMapping}
          isLoading={isLoading}
          emptyMessage="KPI connections will appear here."
        />
        <ResultSection
          title="Gap Analysis"
          description="Observed gaps, missed opportunities, and areas that need stronger follow-through."
          content={analysis?.gapAnalysis}
          isLoading={isLoading}
          emptyMessage="Gap analysis details will appear here."
        />
      </div>
    </aside>
  )
}

export default AnalysisResults

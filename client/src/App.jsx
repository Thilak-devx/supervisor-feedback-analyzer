import { useState } from 'react'
import Header from './components/layout/Header.jsx'
import TranscriptInput from './components/analysis/TranscriptInput.jsx'
import AnalysisResults from './components/analysis/AnalysisResults.jsx'
import { analyzeTranscript } from './services/analysisService.js'
import sampleTranscripts from './data/sampleTranscripts.json'

function App() {
  const [transcript, setTranscript] = useState('')
  const [selectedSampleId, setSelectedSampleId] = useState('')
  const [analysis, setAnalysis] = useState(null)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSampleChange = (sampleId) => {
    setSelectedSampleId(sampleId)

    const selectedSample = sampleTranscripts.find(
      (sample) => sample.id === sampleId,
    )

    setTranscript(selectedSample?.transcript || '')
    setError('')
  }

  const handleAnalyze = async () => {
    const trimmedTranscript = transcript.trim()

    if (!trimmedTranscript) {
      setError('Please paste a transcript before running the analysis.')
      setAnalysis(null)
      return
    }

    setIsLoading(true)
    setError('')

    try {
      const result = await analyzeTranscript(trimmedTranscript)
      setAnalysis(result)
    } catch (requestError) {
      setAnalysis(null)
      setError(
        requestError.message ||
          'We could not complete the analysis. Please try again.',
      )
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <Header />

      <main className="mx-auto grid w-full max-w-7xl gap-8 px-6 py-8 lg:grid-cols-[minmax(0,1.05fr)_minmax(320px,0.95fr)] lg:px-8">
        <div className="flex flex-col gap-8">
          <section className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 bg-slate-50/80 px-6 py-5 sm:px-8">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
                Supervisor Feedback Analyzer
              </p>
              <h1 className="mt-3 max-w-3xl text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
                Turn conversation transcripts into a clear coaching summary.
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600">
                Paste a supervisor transcript, run the analysis, and review the
                results in a simple dashboard designed for quick decision-making.
              </p>
            </div>

            <div className="grid gap-4 px-6 py-5 sm:grid-cols-3 sm:px-8">
              <div className="rounded-2xl border border-slate-200 bg-white p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                  Step 1
                </p>
                <p className="mt-2 text-sm font-medium text-slate-900">
                  Add the full conversation transcript.
                </p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                  Step 2
                </p>
                <p className="mt-2 text-sm font-medium text-slate-900">
                  Run the analysis to score and organize the feedback.
                </p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                  Step 3
                </p>
                <p className="mt-2 text-sm font-medium text-slate-900">
                  Review evidence, gaps, KPIs, and next questions.
                </p>
              </div>
            </div>
          </section>

          <TranscriptInput
            transcript={transcript}
            onTranscriptChange={setTranscript}
            selectedSampleId={selectedSampleId}
            sampleTranscripts={sampleTranscripts}
            onSampleChange={handleSampleChange}
            onAnalyze={handleAnalyze}
            isLoading={isLoading}
            error={error}
          />
        </div>

        <AnalysisResults analysis={analysis} isLoading={isLoading} />
      </main>
    </div>
  )
}

export default App

function TranscriptInput({
  transcript,
  onTranscriptChange,
  selectedSampleId,
  sampleTranscripts,
  onSampleChange,
  onAnalyze,
  isLoading,
  error,
}) {
  return (
    <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                Input
              </p>
              <h2 className="mt-2 text-xl font-semibold tracking-tight text-slate-950">
                Transcript
              </h2>
            </div>
            <div className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-600">
              {isLoading ? 'Analyzing' : 'Ready'}
            </div>
          </div>
          <p className="text-sm leading-6 text-slate-600">
            Paste the full supervisor conversation below to prepare it for
            analysis.
          </p>
        </div>

        <label className="flex flex-col gap-3">
          <span className="text-sm font-medium text-slate-700">
            Load sample transcript
          </span>
          <select
            value={selectedSampleId}
            onChange={(event) => onSampleChange(event.target.value)}
            disabled={isLoading}
            className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-slate-400"
          >
            <option value="">Choose a sample transcript</option>
            {sampleTranscripts.map((sample) => (
              <option key={sample.id} value={sample.id}>
                {sample.label}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-3">
          <span className="text-sm font-medium text-slate-700">
            Conversation transcript
          </span>
          <textarea
            value={transcript}
            onChange={(event) => {
              onTranscriptChange(event.target.value)
              if (selectedSampleId) {
                onSampleChange('')
              }
            }}
            className="min-h-[360px] w-full resize-y rounded-3xl border border-slate-300 bg-slate-50 px-4 py-4 text-sm leading-6 text-slate-900 outline-none placeholder:text-slate-400 focus:border-slate-400"
            placeholder="Paste the transcript here..."
            disabled={isLoading}
          />
        </label>

        {error ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        ) : null}

        <div className="flex justify-end">
          <button
            type="button"
            onClick={onAnalyze}
            disabled={isLoading}
            className="inline-flex items-center justify-center gap-3 rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800 focus:outline-none disabled:cursor-not-allowed disabled:bg-slate-500"
          >
            {isLoading ? (
              <span
                className="spinner h-4 w-4 rounded-full border-2 border-white/30 border-t-white"
                aria-hidden="true"
              />
            ) : null}
            {isLoading ? 'Running Analysis...' : 'Run Analysis'}
          </button>
        </div>
      </div>
    </section>
  )
}

export default TranscriptInput

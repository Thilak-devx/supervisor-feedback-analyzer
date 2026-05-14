const ANALYZE_URL = 'http://localhost:5000/analyze'

export async function analyzeTranscript(transcript) {
  const response = await fetch(ANALYZE_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ transcript }),
  })

  const data = await response.json().catch(() => null)

  if (!response.ok) {
    throw new Error(
      data?.error || 'The analysis request failed. Please try again.',
    )
  }

  return data?.analysis ?? null
}

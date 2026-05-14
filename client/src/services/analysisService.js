const ANALYZE_URL =
  import.meta.env.VITE_ANALYZE_URL || 'http://localhost:5000/analyze'
const REQUEST_TIMEOUT_MS = 120000

export async function analyzeTranscript(transcript) {
  const controller = new AbortController()
  const timeoutId = window.setTimeout(() => {
    controller.abort()
  }, REQUEST_TIMEOUT_MS)

  try {
    const response = await fetch(ANALYZE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ transcript }),
      signal: controller.signal,
    })

    const data = await response.json().catch(() => null)

    if (!response.ok) {
      throw new Error(
        data?.error || 'The analysis request failed. Please try again.',
      )
    }

    return data?.analysis ?? null
  } catch (error) {
    if (error.name === 'AbortError') {
      throw new Error(
        'The analysis request timed out. Please try again in a moment.',
        { cause: error },
      )
    }

    throw error
  } finally {
    window.clearTimeout(timeoutId)
  }
}

const express = require('express')
const cors = require('cors')
const axios = require('axios')
const dotenv = require('dotenv')

dotenv.config()

const app = express()
const PORT = process.env.PORT || 5000
const OLLAMA_URL = process.env.OLLAMA_URL || 'http://localhost:11434/api/generate'
const OLLAMA_MODEL = 'llama3.2'
const TRANSCRIPT_MAX_LENGTH = 25000

const REQUIRED_TOP_LEVEL_FIELDS = [
  'evidence',
  'rubricScore',
  'kpiMapping',
  'gapAnalysis',
  'followUpQuestions',
]

const FALLBACK_ANALYSIS = {
  evidence: [],
  rubricScore: {
    score: 0,
    justification:
      'The model response was incomplete, so fallback values were used.',
  },
  kpiMapping: [],
  gapAnalysis: [],
  followUpQuestions: [],
}

app.disable('x-powered-by')
app.use(cors())
app.use(express.json({ limit: '1mb' }))

function buildSchemaInstructions() {
  return `
Return exactly one valid JSON object with this schema:
{
  "evidence": [
    {
      "quote": "string",
      "category": "string",
      "sentiment": "positive | negative | neutral",
      "explanation": "string"
    }
  ],
  "rubricScore": {
    "score": 0,
    "justification": "string"
  },
  "kpiMapping": ["string"],
  "gapAnalysis": ["string"],
  "followUpQuestions": ["string"]
}

Hard requirements:
- The response must begin with { and end with }.
- Return JSON only.
- Do not use markdown.
- Do not use code fences.
- Do not include notes, explanations, headings, or text outside the JSON object.
- All required top-level fields must exist.
- "evidence", "kpiMapping", "gapAnalysis", and "followUpQuestions" must always be arrays.
- Every item in "evidence" must be an object with "quote", "category", "sentiment", and "explanation".
- "evidence[].sentiment" must always be one of: "positive", "negative", "neutral".
- Every item inside those arrays must be a string.
- "rubricScore" must always be an object.
- "rubricScore.score" must always be a number from 0 to 10.
- "rubricScore.justification" must always be a string.
- Never use null for any required field.
- If information is missing, use empty arrays and explain uncertainty in "rubricScore.justification".
  `.trim()
}

function buildAnalysisPrompt(transcript) {
  return `
You are an expert conversation analyst for supervisor feedback.

${buildSchemaInstructions()}

Analyze this transcript and return only the JSON object.

Transcript:
${transcript}
  `.trim()
}

function buildRetryPrompt(transcript, previousResponse) {
  return `
Your previous response was invalid or malformed.

${buildSchemaInstructions()}

Try again and return only one corrected JSON object.

Transcript:
${transcript}

Previous invalid response:
${previousResponse}
  `.trim()
}

function stripCodeFences(text) {
  if (typeof text !== 'string') {
    return ''
  }

  return text.replace(/```json/gi, '').replace(/```/g, '').trim()
}

function extractJsonObject(text) {
  const input = stripCodeFences(text)

  if (!input) {
    return null
  }

  let depth = 0
  let startIndex = -1
  let inString = false
  let escaping = false

  for (let index = 0; index < input.length; index += 1) {
    const character = input[index]

    if (inString) {
      if (escaping) {
        escaping = false
      } else if (character === '\\') {
        escaping = true
      } else if (character === '"') {
        inString = false
      }

      continue
    }

    if (character === '"') {
      inString = true
      continue
    }

    if (character === '{') {
      if (depth === 0) {
        startIndex = index
      }

      depth += 1
      continue
    }

    if (character === '}') {
      if (depth === 0) {
        continue
      }

      depth -= 1

      if (depth === 0 && startIndex !== -1) {
        return input.slice(startIndex, index + 1)
      }
    }
  }

  return null
}

function normalizeStringValue(value) {
  if (typeof value === 'string') {
    return value.trim()
  }

  if (value === null || value === undefined) {
    return ''
  }

  return String(value).trim()
}

function normalizeStringArray(value) {
  if (!Array.isArray(value)) {
    return []
  }

  return value.map(normalizeStringValue).filter(Boolean)
}

function normalizeEvidenceSentiment(value) {
  const normalized = normalizeStringValue(value).toLowerCase()

  if (normalized === 'positive' || normalized === 'negative') {
    return normalized
  }

  return 'neutral'
}

function inferSentimentFromText(value) {
  const text = normalizeStringValue(value).toLowerCase()

  if (!text) {
    return 'neutral'
  }

  const positiveSignals = [
    'strong',
    'clear',
    'effective',
    'good',
    'improved',
    'well',
    'met',
    'consistent',
    'positive',
    'success',
  ]
  const negativeSignals = [
    'poor',
    'missed',
    'late',
    'unclear',
    'inconsistent',
    'negative',
    'gap',
    'weak',
    'issue',
    'risk',
  ]

  if (negativeSignals.some((signal) => text.includes(signal))) {
    return 'negative'
  }

  if (positiveSignals.some((signal) => text.includes(signal))) {
    return 'positive'
  }

  return 'neutral'
}

function splitStructuredText(value) {
  const rawValue = normalizeStringValue(value)

  if (!rawValue) {
    return {
      label: '',
      detail: '',
    }
  }

  const separators = [':', ' - ', ' – ', ' — ']

  for (const separator of separators) {
    if (rawValue.includes(separator)) {
      const [label, ...rest] = rawValue.split(separator)

      return {
        label: normalizeStringValue(label),
        detail: normalizeStringValue(rest.join(separator)),
      }
    }
  }

  return {
    label: '',
    detail: rawValue,
  }
}

function dedupeStrings(values) {
  const seen = new Set()

  return values.filter((value) => {
    const normalized = normalizeStringValue(value).toLowerCase()

    if (!normalized || seen.has(normalized)) {
      return false
    }

    seen.add(normalized)
    return true
  })
}

function extractTranscriptSegments(transcript) {
  if (typeof transcript !== 'string' || !transcript.trim()) {
    return []
  }

  const segments = transcript
    .split(/\n+/)
    .flatMap((line) =>
      line
        .split(/(?<=[.!?])\s+/)
        .map((segment) => normalizeStringValue(segment)),
    )
    .filter((segment) => segment.length >= 20)

  return dedupeStrings(segments).slice(0, 40)
}

function getKeywordTokens(value) {
  const stopWords = new Set([
    'about',
    'after',
    'again',
    'also',
    'because',
    'been',
    'before',
    'being',
    'between',
    'could',
    'during',
    'from',
    'have',
    'into',
    'more',
    'most',
    'only',
    'over',
    'that',
    'their',
    'there',
    'these',
    'they',
    'this',
    'very',
    'with',
    'would',
  ])

  return normalizeStringValue(value)
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((token) => token.length > 3 && !stopWords.has(token))
}

function findSupportingTranscriptQuote(transcriptSegments, contextText, usedQuotes) {
  if (!Array.isArray(transcriptSegments) || transcriptSegments.length === 0) {
    return ''
  }

  const tokens = getKeywordTokens(contextText)

  for (const segment of transcriptSegments) {
    const normalizedSegment = segment.toLowerCase()

    if (
      usedQuotes.has(normalizedSegment) ||
      (tokens.length > 0 &&
        !tokens.some((token) => normalizedSegment.includes(token)))
    ) {
      continue
    }

    return segment
  }

  for (const segment of transcriptSegments) {
    const normalizedSegment = segment.toLowerCase()

    if (!usedQuotes.has(normalizedSegment)) {
      return segment
    }
  }

  return ''
}

function normalizeEvidenceItem(value) {
  if (typeof value === 'string') {
    const quote = normalizeStringValue(value)

    if (!quote) {
      return null
    }

    return {
      quote,
      category: 'General Observation',
      sentiment: 'neutral',
      explanation: 'No detailed evidence structure was provided by the model.',
    }
  }

  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return null
  }

  const quote = normalizeStringValue(
    value.quote || value.excerpt || value.text || value.snippet,
  )
  const category =
    normalizeStringValue(value.category || value.type || value.area) ||
    'General Observation'
  const explanation =
    normalizeStringValue(value.explanation || value.reason || value.detail) ||
    'No detailed explanation was provided by the model.'

  if (!quote) {
    return null
  }

  return {
    quote,
    category,
    sentiment: normalizeEvidenceSentiment(value.sentiment),
    explanation,
  }
}

function normalizeEvidenceArray(value) {
  if (!Array.isArray(value)) {
    return []
  }

  return value.map(normalizeEvidenceItem).filter(Boolean)
}

function normalizeRubricScore(value) {
  const numericScore = Number(value?.score)
  const safeScore = Number.isFinite(numericScore)
    ? Math.min(10, Math.max(0, numericScore))
    : 0

  const justification =
    typeof value?.justification === 'string' && value.justification.trim()
      ? value.justification.trim()
      : FALLBACK_ANALYSIS.rubricScore.justification

  return {
    score: safeScore,
    justification,
  }
}

function createEvidenceItem({ quote, category, sentiment, explanation }) {
  const normalizedQuote = normalizeStringValue(quote)

  if (!normalizedQuote) {
    return null
  }

  return {
    quote: normalizedQuote,
    category: normalizeStringValue(category) || 'General Observation',
    sentiment:
      normalizeEvidenceSentiment(sentiment) ||
      inferSentimentFromText(explanation || quote),
    explanation:
      normalizeStringValue(explanation) ||
      'This item was inferred from the broader analysis output.',
  }
}

function buildFallbackEvidence(normalized, transcript) {
  const transcriptSegments = extractTranscriptSegments(transcript)
  const usedQuotes = new Set(
    normalized.evidence.map((item) => item.quote.toLowerCase()),
  )
  const fallbackEvidence = []

  const insightSources = [
    ...normalized.kpiMapping.map((item) => ({
      source: 'kpi',
      text: item,
    })),
    ...normalized.gapAnalysis.map((item) => ({
      source: 'gap',
      text: item,
    })),
  ]

  if (
    normalized.rubricScore.justification &&
    normalized.rubricScore.justification !== FALLBACK_ANALYSIS.rubricScore.justification
  ) {
    insightSources.push({
      source: 'score',
      text: normalized.rubricScore.justification,
    })
  }

  insightSources.forEach((item) => {
    if (fallbackEvidence.length >= 4) {
      return
    }

    const { label, detail } = splitStructuredText(item.text)
    const supportingQuote = findSupportingTranscriptQuote(
      transcriptSegments,
      `${label} ${detail}`,
      usedQuotes,
    )

    const evidenceItem = createEvidenceItem({
      quote: supportingQuote,
      category:
        label ||
        (item.source === 'kpi'
          ? 'KPI Signal'
          : item.source === 'gap'
            ? 'Gap Analysis'
            : 'Rubric Justification'),
      sentiment: inferSentimentFromText(item.text),
      explanation:
        detail ||
        `This evidence item was generated from the ${item.source} analysis.`,
    })

    if (evidenceItem) {
      usedQuotes.add(evidenceItem.quote.toLowerCase())
      fallbackEvidence.push(evidenceItem)
    }
  })

  if (fallbackEvidence.length === 0 && transcriptSegments.length > 0) {
    transcriptSegments.slice(0, 2).forEach((segment) => {
      const evidenceItem = createEvidenceItem({
        quote: segment,
        category: 'Transcript Observation',
        sentiment: 'neutral',
        explanation:
          'This fallback evidence was extracted directly from the transcript because structured evidence was incomplete.',
      })

      if (evidenceItem) {
        fallbackEvidence.push(evidenceItem)
      }
    })
  }

  return fallbackEvidence
}

function buildConsistentAnalysisPayload(payload, transcript) {
  const normalized = {
    evidence: normalizeEvidenceArray(payload?.evidence),
    rubricScore: normalizeRubricScore(payload?.rubricScore),
    kpiMapping: normalizeStringArray(payload?.kpiMapping),
    gapAnalysis: normalizeStringArray(payload?.gapAnalysis),
    followUpQuestions: normalizeStringArray(payload?.followUpQuestions),
  }

  const fallbackEvidence = buildFallbackEvidence(normalized, transcript)
  const combinedEvidence = [...normalized.evidence]

  fallbackEvidence.forEach((item) => {
    if (
      !combinedEvidence.some(
        (existingItem) =>
          existingItem.quote.toLowerCase() === item.quote.toLowerCase(),
      )
    ) {
      combinedEvidence.push(item)
    }
  })

  return {
    ...normalized,
    evidence: combinedEvidence.slice(0, 6),
  }
}

function createFallbackAnalysis(reason) {
  return {
    ...FALLBACK_ANALYSIS,
    rubricScore: {
      ...FALLBACK_ANALYSIS.rubricScore,
      justification: reason
        ? `${FALLBACK_ANALYSIS.rubricScore.justification} ${reason}`.trim()
        : FALLBACK_ANALYSIS.rubricScore.justification,
    },
  }
}

function validateAnalysisPayload(payload) {
  const missingFields = []
  const invalidFields = []

  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    return {
      isValid: false,
      missingFields: [...REQUIRED_TOP_LEVEL_FIELDS],
      invalidFields: [],
    }
  }

  REQUIRED_TOP_LEVEL_FIELDS.forEach((field) => {
    if (!(field in payload)) {
      missingFields.push(field)
    }
  })

  ;['evidence', 'kpiMapping', 'gapAnalysis', 'followUpQuestions'].forEach((field) => {
    if (field in payload && !Array.isArray(payload[field])) {
      invalidFields.push(field)
    }
  })

  if (Array.isArray(payload.evidence)) {
    payload.evidence.forEach((item, index) => {
      if (!item || typeof item !== 'object' || Array.isArray(item)) {
        invalidFields.push(`evidence[${index}]`)
        return
      }

      ;['quote', 'category', 'sentiment', 'explanation'].forEach((field) => {
        if (!(field in item)) {
          missingFields.push(`evidence[${index}].${field}`)
        }
      })

      if ('sentiment' in item) {
        const sentiment = normalizeEvidenceSentiment(item.sentiment)

        if (!['positive', 'negative', 'neutral'].includes(sentiment)) {
          invalidFields.push(`evidence[${index}].sentiment`)
        }
      }
    })
  }

  if (
    !payload.rubricScore ||
    typeof payload.rubricScore !== 'object' ||
    Array.isArray(payload.rubricScore)
  ) {
    invalidFields.push('rubricScore')
  } else {
    if (!('score' in payload.rubricScore)) {
      missingFields.push('rubricScore.score')
    } else if (!Number.isFinite(Number(payload.rubricScore.score))) {
      invalidFields.push('rubricScore.score')
    }

    if (!('justification' in payload.rubricScore)) {
      missingFields.push('rubricScore.justification')
    } else if (typeof payload.rubricScore.justification !== 'string') {
      invalidFields.push('rubricScore.justification')
    }
  }

  return {
    isValid: missingFields.length === 0 && invalidFields.length === 0,
    missingFields,
    invalidFields,
  }
}

function buildValidationReason(validation) {
  const parts = []

  if (validation.missingFields.length > 0) {
    parts.push(`missing fields: ${validation.missingFields.join(', ')}`)
  }

  if (validation.invalidFields.length > 0) {
    parts.push(`invalid fields: ${validation.invalidFields.join(', ')}`)
  }

  return parts.join('; ')
}

function sanitizeAnalysisPayload(payload, transcript = '', reason = '') {
  const normalized = buildConsistentAnalysisPayload(payload, transcript)
  const validation = validateAnalysisPayload(payload)

  const safeAnalysis = {
    evidence: normalized.evidence,
    rubricScore: normalized.rubricScore,
    kpiMapping: normalized.kpiMapping,
    gapAnalysis: normalized.gapAnalysis,
    followUpQuestions: normalized.followUpQuestions,
  }

  if (!validation.isValid) {
    const fallback = createFallbackAnalysis(
      reason || buildValidationReason(validation),
    )

    safeAnalysis.rubricScore = {
      score: safeAnalysis.rubricScore.score,
      justification:
        safeAnalysis.rubricScore.justification ===
        FALLBACK_ANALYSIS.rubricScore.justification
          ? fallback.rubricScore.justification
          : safeAnalysis.rubricScore.justification,
    }
  }

  return {
    analysis: safeAnalysis,
    validation,
  }
}

function parseAnalysisResponse(rawResponse) {
  const extractedJson = extractJsonObject(rawResponse)

  if (!extractedJson) {
    throw new Error('The model did not return a JSON object.')
  }

  let parsedPayload

  try {
    parsedPayload = JSON.parse(extractedJson)
  } catch (parseError) {
    throw new Error('The model returned invalid JSON.')
  }

  return sanitizeAnalysisPayload(parsedPayload)
}

async function requestOllama(prompt) {
  const response = await axios.post(
    OLLAMA_URL,
    {
      model: OLLAMA_MODEL,
      prompt,
      stream: false,
      format: 'json',
    },
    {
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 120000,
    },
  )

  return response.data?.response || ''
}

async function generateAnalysisWithRetry(transcript) {
  let lastError = null
  let lastRawResponse = ''

  for (let attempt = 0; attempt < 2; attempt += 1) {
    const prompt =
      attempt === 0
        ? buildAnalysisPrompt(transcript)
        : buildRetryPrompt(transcript, lastRawResponse)

    lastRawResponse = await requestOllama(prompt)

    try {
      const { analysis, validation } = parseAnalysisResponse(lastRawResponse)

      if (validation.isValid) {
        return sanitizeAnalysisPayload(analysis, transcript).analysis
      }

      lastError = new Error(buildValidationReason(validation))

      if (attempt === 1) {
        return sanitizeAnalysisPayload(
          analysis,
          transcript,
          lastError.message,
        ).analysis
      }
    } catch (parseError) {
      lastError = parseError

      if (attempt === 1) {
        return sanitizeAnalysisPayload(
          createFallbackAnalysis(lastError.message),
          transcript,
          lastError.message,
        ).analysis
      }
    }
  }

  return sanitizeAnalysisPayload(
    createFallbackAnalysis(lastError?.message),
    transcript,
    lastError?.message,
  ).analysis
}

app.get('/', (req, res) => {
  res.json({
    message: 'Supervisor Feedback Analyzer API is running.',
  })
})

app.post('/analyze', async (req, res) => {
  const { transcript } = req.body

  if (!transcript || typeof transcript !== 'string') {
    return res.status(400).json({
      error: 'A transcript string is required.',
    })
  }

  const trimmedTranscript = transcript.trim()

  if (!trimmedTranscript) {
    return res.status(400).json({
      error: 'A transcript string is required.',
    })
  }

  if (trimmedTranscript.length > TRANSCRIPT_MAX_LENGTH) {
    return res.status(413).json({
      error: 'The transcript is too long. Please shorten it and try again.',
    })
  }

  try {
    const analysis = await generateAnalysisWithRetry(trimmedTranscript)
    const safeAnalysis = sanitizeAnalysisPayload(
      analysis,
      trimmedTranscript,
    ).analysis

    return res.status(200).json({
      success: true,
      analysis: safeAnalysis,
    })
  } catch (error) {
    if (error.response) {
      return res.status(502).json({
        error: 'Ollama returned an upstream error while generating analysis.',
      })
    }

    if (error.request) {
      return res.status(503).json({
        error: `Could not reach Ollama at ${OLLAMA_URL}.`,
      })
    }

    return res.status(500).json({
      error: error.message || 'Failed to analyze transcript.',
    })
  }
})

app.listen(PORT, () => {
  console.log(`Supervisor Feedback Analyzer API listening on port ${PORT}`)
})

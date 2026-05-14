const express = require('express')
const cors = require('cors')
const axios = require('axios')
const dotenv = require('dotenv')

dotenv.config()

const app = express()
const PORT = process.env.PORT || 5000
const OLLAMA_URL = process.env.OLLAMA_URL || 'http://localhost:11434/api/generate'
const OLLAMA_MODEL = 'llama3.2'
const FALLBACK_ANALYSIS = {
  evidence: [],
  rubricScore: {
    score: 0,
    justification: 'The model response was incomplete, so fallback values were used.',
  },
  kpiMapping: [],
  gapAnalysis: [],
  followUpQuestions: [],
}

app.use(cors())
app.use(express.json())

function buildAnalysisPrompt(transcript) {
  return `
You are an expert conversation analyst for supervisor feedback.

Analyze the transcript below and return only valid JSON with this exact shape:
{
  "evidence": ["string"],
  "rubricScore": {
    "score": 0,
    "justification": "string"
  },
  "kpiMapping": ["string"],
  "gapAnalysis": ["string"],
  "followUpQuestions": ["string"]
}

Rules:
- Return raw JSON only. Do not use markdown fences.
- Every array item must be a string.
- "score" must be a number from 0 to 10.
- If information is missing, return empty arrays and explain uncertainty in "justification".

Transcript:
${transcript}
  `.trim()
}

function buildRetryPrompt(transcript, previousResponse) {
  return `
Your previous response could not be parsed into the required JSON shape.

Return only one valid JSON object with this exact schema:
{
  "evidence": ["string"],
  "rubricScore": {
    "score": 0,
    "justification": "string"
  },
  "kpiMapping": ["string"],
  "gapAnalysis": ["string"],
  "followUpQuestions": ["string"]
}

Rules:
- Output raw JSON only.
- Do not include markdown, commentary, or code fences.
- Ensure every required key exists even if the value is empty.
- "score" must be a number from 0 to 10.

Transcript:
${transcript}

Previous invalid response:
${previousResponse}
  `.trim()
}

function stripCodeFences(text) {
  return text
    .replace(/```json/gi, '')
    .replace(/```/g, '')
    .trim()
}

function extractJsonObject(text) {
  const trimmedText = stripCodeFences(text)

  if (!trimmedText) {
    return null
  }

  let depth = 0
  let startIndex = -1
  let inString = false
  let escaping = false

  for (let index = 0; index < trimmedText.length; index += 1) {
    const character = trimmedText[index]

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
    } else if (character === '}') {
      if (depth === 0) {
        continue
      }

      depth -= 1

      if (depth === 0 && startIndex !== -1) {
        return trimmedText.slice(startIndex, index + 1)
      }
    }
  }

  return null
}

function normalizeStringArray(value) {
  if (!Array.isArray(value)) {
    return []
  }

  return value
    .filter((item) => typeof item === 'string')
    .map((item) => item.trim())
    .filter(Boolean)
}

function normalizeRubricScore(value) {
  const numericScore = Number(value?.score)
  const safeScore = Number.isFinite(numericScore)
    ? Math.min(10, Math.max(0, numericScore))
    : 0

  return {
    score: safeScore,
    justification:
      typeof value?.justification === 'string' && value.justification.trim()
        ? value.justification.trim()
        : 'No justification was provided by the model.',
  }
}

function normalizeAnalysisPayload(payload) {
  return {
    evidence: normalizeStringArray(payload?.evidence),
    rubricScore: normalizeRubricScore(payload?.rubricScore),
    kpiMapping: normalizeStringArray(payload?.kpiMapping),
    gapAnalysis: normalizeStringArray(payload?.gapAnalysis),
    followUpQuestions: normalizeStringArray(payload?.followUpQuestions),
  }
}

function validateAnalysisPayload(payload) {
  const missingFields = []

  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    return {
      isValid: false,
      missingFields: [
        'evidence',
        'rubricScore',
        'kpiMapping',
        'gapAnalysis',
        'followUpQuestions',
      ],
    }
  }

  const requiredKeys = [
    'evidence',
    'rubricScore',
    'kpiMapping',
    'gapAnalysis',
    'followUpQuestions',
  ]

  requiredKeys.forEach((key) => {
    if (!(key in payload)) {
      missingFields.push(key)
    }
  })

  if (
    !payload.rubricScore ||
    typeof payload.rubricScore !== 'object' ||
    Array.isArray(payload.rubricScore)
  ) {
    if (!missingFields.includes('rubricScore')) {
      missingFields.push('rubricScore')
    }
  } else {
    if (!('score' in payload.rubricScore)) {
      missingFields.push('rubricScore.score')
    }

    if (!('justification' in payload.rubricScore)) {
      missingFields.push('rubricScore.justification')
    }
  }

  return {
    isValid: missingFields.length === 0,
    missingFields,
  }
}

function mergeWithFallback(analysis, missingFields) {
  const normalized = normalizeAnalysisPayload(analysis)

  if (missingFields.length === 0) {
    return normalized
  }

  const missingSections = missingFields
    .map((field) => field.split('.')[0])
    .filter((field, index, array) => array.indexOf(field) === index)

  if (missingSections.includes('rubricScore')) {
    normalized.rubricScore = {
      ...FALLBACK_ANALYSIS.rubricScore,
      ...normalized.rubricScore,
    }
  }

  if (!normalized.rubricScore.justification) {
    normalized.rubricScore.justification = FALLBACK_ANALYSIS.rubricScore.justification
  }

  return normalized
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

  const validation = validateAnalysisPayload(parsedPayload)

  return {
    analysis: mergeWithFallback(parsedPayload, validation.missingFields),
    validation,
  }
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

      if (validation.isValid || attempt === 1) {
        return analysis
      }

      lastError = new Error(
        `The model response was missing required fields: ${validation.missingFields.join(', ')}`,
      )
    } catch (parseError) {
      lastError = parseError
    }
  }

  if (lastError) {
    return {
      ...FALLBACK_ANALYSIS,
      rubricScore: {
        ...FALLBACK_ANALYSIS.rubricScore,
        justification: `${FALLBACK_ANALYSIS.rubricScore.justification} ${lastError.message}`,
      },
    }
  }

  return FALLBACK_ANALYSIS
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

  try {
    const analysis = await generateAnalysisWithRetry(transcript)

    return res.status(200).json({
      success: true,
      analysis,
    })
  } catch (error) {
    if (error.response) {
      return res.status(502).json({
        error: 'Ollama returned an upstream error while generating analysis.',
        details: error.response.data,
      })
    }

    if (error.request) {
      return res.status(503).json({
        error: 'Could not reach Ollama at http://localhost:11434.',
      })
    }

    return res.status(500).json({
      error: error.message || 'Failed to analyze transcript.',
    })
  }
})

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`)
})

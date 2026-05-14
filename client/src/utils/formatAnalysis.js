const positiveKeywords = [
  'good',
  'great',
  'strong',
  'effective',
  'clear',
  'timely',
  'supportive',
  'positive',
  'improved',
  'well',
  'helpful',
  'specific',
]

const negativeKeywords = [
  'missing',
  'unclear',
  'weak',
  'negative',
  'gap',
  'issue',
  'concern',
  'lacking',
  'missed',
  'limited',
  'inconsistent',
  'poor',
]

export function getEvidenceTone(text) {
  const normalizedText = typeof text === 'string' ? text.toLowerCase() : ''

  if (positiveKeywords.some((keyword) => normalizedText.includes(keyword))) {
    return 'positive'
  }

  if (negativeKeywords.some((keyword) => normalizedText.includes(keyword))) {
    return 'negative'
  }

  return 'neutral'
}

export function getScoreDisplay(score) {
  const numericScore = typeof score === 'number' ? Math.round(score * 10) / 10 : 0

  if (numericScore >= 8) {
    return {
      label: 'Strong',
      tone: 'positive',
    }
  }

  if (numericScore >= 5) {
    return {
      label: 'Moderate',
      tone: 'neutral',
    }
  }

  return {
    label: 'Needs Attention',
    tone: 'negative',
  }
}

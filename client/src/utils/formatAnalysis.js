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

export function parseKpiItem(item) {
  const rawValue = typeof item === 'string' ? item.trim() : ''

  if (!rawValue) {
    return null
  }

  const separators = [':', ' - ', ' – ', ' — ']

  for (const separator of separators) {
    if (rawValue.includes(separator)) {
      const [label, ...rest] = rawValue.split(separator)
      const description = rest.join(separator).trim()

      return {
        label: label.trim(),
        description:
          description || 'Mapped from the transcript as a relevant KPI signal.',
      }
    }
  }

  return {
    label: rawValue,
    description: 'Mapped from the transcript as a relevant KPI signal.',
  }
}

export function parseGapItem(item) {
  const rawValue = typeof item === 'string' ? item.trim() : ''

  if (!rawValue) {
    return null
  }

  const normalized = rawValue.toLowerCase()
  const isMissingInfo =
    normalized.includes('missing information') ||
    normalized.includes('not enough information') ||
    normalized.includes('unclear') ||
    normalized.includes('not mentioned') ||
    normalized.includes('did not mention') ||
    normalized.includes('unknown') ||
    normalized.includes('no evidence')

  const isHighPriority =
    normalized.includes('critical') ||
    normalized.includes('urgent') ||
    normalized.includes('high risk') ||
    normalized.includes('serious') ||
    normalized.includes('missed') ||
    normalized.includes('late') ||
    normalized.includes('inconsistent') ||
    normalized.includes('poor')

  const separators = [':', ' - ', ' – ', ' — ']

  for (const separator of separators) {
    if (rawValue.includes(separator)) {
      const [label, ...rest] = rawValue.split(separator)
      const detail = rest.join(separator).trim()

      return {
        label: label.trim(),
        detail: detail || rawValue,
        type: isMissingInfo ? 'missing' : 'gap',
        priority: isHighPriority ? 'high' : 'standard',
      }
    }
  }

  return {
    label: isMissingInfo ? 'Missing Information' : 'Observed Gap',
    detail: rawValue,
    type: isMissingInfo ? 'missing' : 'gap',
    priority: isHighPriority ? 'high' : 'standard',
  }
}

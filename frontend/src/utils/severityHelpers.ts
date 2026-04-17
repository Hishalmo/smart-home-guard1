import type { ClassLabel, AlertSeverity } from '@/types'
import { CATEGORY_SEVERITY } from '@/lib/constants'

export function getSeverity(category: ClassLabel): AlertSeverity {
  return CATEGORY_SEVERITY[category]
}

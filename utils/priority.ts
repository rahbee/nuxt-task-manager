import { TaskPriority, PRIORITY_COLORS, PRIORITY_ICONS, PRIORITY_LABELS } from '~/types/task'

export const getPriorityColor = (priority: TaskPriority): 'primary' | 'warning' | 'error' | 'neutral' => {
  return PRIORITY_COLORS[priority] as 'primary' | 'warning' | 'error' || 'neutral'
}

export const getPriorityIcon = (priority: TaskPriority) => {
  return PRIORITY_ICONS[priority] || 'i-lucide-minus'
}

export const getPriorityLabel = (priority: TaskPriority) => {
  return PRIORITY_LABELS[priority] || 'Unknown'
}

export const getPriorityWeight = (priority: TaskPriority): number => {
  switch (priority) {
    case TaskPriority.HIGH:
      return 3
    case TaskPriority.MEDIUM:
      return 2
    case TaskPriority.LOW:
      return 1
    default:
      return 0
  }
}

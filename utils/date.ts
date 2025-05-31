export const formatDate = (date: Date | string | undefined): string => {
  if (!date) return ''
  
  const d = typeof date === 'string' ? new Date(date) : date
  
  if (isNaN(d.getTime())) return ''
  
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

export const formatRelativeDate = (date: Date | string): string => {
  const d = typeof date === 'string' ? new Date(date) : date
  const now = new Date()
  const diffInMs = now.getTime() - d.getTime()
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24))
  
  if (diffInDays === 0) return 'Today'
  if (diffInDays === 1) return 'Yesterday'
  if (diffInDays < 7) return `${diffInDays} days ago`
  if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`
  if (diffInDays < 365) return `${Math.floor(diffInDays / 30)} months ago`
  
  return `${Math.floor(diffInDays / 365)} years ago`
}

export const isOverdue = (dueDate: Date | undefined, completed: boolean): boolean => {
  if (!dueDate || completed) return false
  return dueDate < new Date()
}

export const getDaysUntilDue = (dueDate: Date | undefined): number => {
  if (!dueDate) return 0
  
  const now = new Date()
  const diffInMs = dueDate.getTime() - now.getTime()
  return Math.ceil(diffInMs / (1000 * 60 * 60 * 24))
}

export const formatDueDate = (dueDate: Date | undefined, completed: boolean): string => {
  if (!dueDate) return ''
  
  const daysUntil = getDaysUntilDue(dueDate)
  
  if (completed) return formatDate(dueDate)
  
  if (daysUntil < 0) return `Overdue by ${Math.abs(daysUntil)} days`
  if (daysUntil === 0) return 'Due today'
  if (daysUntil === 1) return 'Due tomorrow'
  if (daysUntil <= 7) return `Due in ${daysUntil} days`
  
  return formatDate(dueDate)
}

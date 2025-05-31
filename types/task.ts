import { z } from 'zod'

// Enums for better type safety
export enum TaskPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high'
}

export enum TaskSortBy {
  CREATED_AT = 'createdAt',
  UPDATED_AT = 'updatedAt',
  DUE_DATE = 'dueDate',
  PRIORITY = 'priority',
  TITLE = 'title'
}

export enum SortOrder {
  ASC = 'asc',
  DESC = 'desc'
}

// Zod schemas for validation
export const TaskPrioritySchema = z.nativeEnum(TaskPriority)
export const TaskSortBySchema = z.nativeEnum(TaskSortBy)
export const SortOrderSchema = z.nativeEnum(SortOrder)

export const TaskSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(1, 'Title is required').max(200, 'Title too long'),
  description: z.string().max(1000, 'Description too long'),
  completed: z.boolean(),
  priority: TaskPrioritySchema,
  category: z.string().min(1, 'Category is required').max(50, 'Category too long'),
  dueDate: z.date().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
  tags: z.array(z.string().min(1).max(30)).max(10, 'Too many tags')
})

export const TaskFilterSchema = z.object({
  completed: z.boolean().optional(),
  priority: TaskPrioritySchema.optional(),
  category: z.string().optional(),
  search: z.string().optional(),
  tags: z.array(z.string()).optional(),
  overdue: z.boolean().optional()
}).partial()

export const TaskStatsSchema = z.object({
  total: z.number().min(0),
  completed: z.number().min(0),
  pending: z.number().min(0),
  overdue: z.number().min(0),
  highPriority: z.number().min(0)
})

// Type inference from schemas
export type Task = z.infer<typeof TaskSchema>
export type TaskFilter = z.infer<typeof TaskFilterSchema>
export type TaskStats = z.infer<typeof TaskStatsSchema>

// Helper types for creating tasks
export type CreateTaskInput = Omit<Task, 'id' | 'createdAt' | 'updatedAt'>
export type UpdateTaskInput = Partial<Omit<Task, 'id' | 'createdAt' | 'updatedAt'>>

// Priority helpers
export const PRIORITY_LABELS: Record<TaskPriority, string> = {
  [TaskPriority.LOW]: 'Low Priority',
  [TaskPriority.MEDIUM]: 'Medium Priority',
  [TaskPriority.HIGH]: 'High Priority'
}

export const PRIORITY_ICONS: Record<TaskPriority, string> = {
  [TaskPriority.LOW]: 'i-lucide-info',
  [TaskPriority.MEDIUM]: 'i-lucide-alert-circle',
  [TaskPriority.HIGH]: 'i-lucide-alert-triangle'
}

export const PRIORITY_COLORS: Record<TaskPriority, string> = {
  [TaskPriority.LOW]: 'primary',
  [TaskPriority.MEDIUM]: 'warning',
  [TaskPriority.HIGH]: 'error'
}

// Sort options for UI
export const SORT_OPTIONS = [
  { label: 'Created Date', value: TaskSortBy.CREATED_AT },
  { label: 'Updated Date', value: TaskSortBy.UPDATED_AT },
  { label: 'Due Date', value: TaskSortBy.DUE_DATE },
  { label: 'Priority', value: TaskSortBy.PRIORITY },
  { label: 'Title', value: TaskSortBy.TITLE }
]

// Priority options for UI
export const PRIORITY_OPTIONS = [
  { label: 'All Priorities', value: undefined },
  { label: PRIORITY_LABELS[TaskPriority.HIGH], value: TaskPriority.HIGH, icon: PRIORITY_ICONS[TaskPriority.HIGH] },
  { label: PRIORITY_LABELS[TaskPriority.MEDIUM], value: TaskPriority.MEDIUM, icon: PRIORITY_ICONS[TaskPriority.MEDIUM] },
  { label: PRIORITY_LABELS[TaskPriority.LOW], value: TaskPriority.LOW, icon: PRIORITY_ICONS[TaskPriority.LOW] }
]

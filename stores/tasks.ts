import { defineStore } from 'pinia'
import type { Task, TaskFilter, TaskStats, TaskSortBy, SortOrder } from '~/types/task'
import { TaskPriority, TaskSortBy as TaskSortByEnum, SortOrder as SortOrderEnum } from '~/types/task'
import { isOverdue } from '~/utils/date'

export const useTaskStore = defineStore('tasks', () => {
  // State
  const tasks = ref<Task[]>([])
  const loading = ref(false)
  const filter = ref<TaskFilter>({})
  const sortBy = ref<TaskSortBy>(TaskSortByEnum.DUE_DATE)
  const sortOrder = ref<SortOrder>(SortOrderEnum.DESC)

  // Getters
  const filteredTasks = computed(() => {
    let filtered = [...tasks.value]

    // Apply filters
    if (filter.value.completed !== undefined) {
      filtered = filtered.filter(task => task.completed === filter.value.completed)
    }

    if (filter.value.priority) {
      filtered = filtered.filter(task => task.priority === filter.value.priority)
    }

    if (filter.value.category) {
      filtered = filtered.filter(task => task.category === filter.value.category)
    }

    if (filter.value.search) {
      const search = filter.value.search.toLowerCase()
      filtered = filtered.filter(task => 
        task.title.toLowerCase().includes(search) ||
        task.description.toLowerCase().includes(search) ||
        task.tags.some(tag => tag.toLowerCase().includes(search))
      )
    }

    if (filter.value.tags && filter.value.tags.length > 0) {
      filtered = filtered.filter(task => 
        filter.value.tags!.some(tag => task.tags.includes(tag))
      )
    }

    if (filter.value.overdue) {
      filtered = filtered.filter(task => isOverdue(task.dueDate, task.completed))
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue: string | number | Date = a[sortBy.value] as string | number | Date
      let bValue: string | number | Date = b[sortBy.value] as string | number | Date

      // Handle dates
      if (aValue instanceof Date) aValue = aValue.getTime()
      if (bValue instanceof Date) bValue = bValue.getTime()

      // Handle priority sorting
      if (sortBy.value === 'priority') {
        const priorityOrder = { 
          [TaskPriority.LOW]: 1, 
          [TaskPriority.MEDIUM]: 2, 
          [TaskPriority.HIGH]: 3 
        }
        aValue = priorityOrder[a.priority]
        bValue = priorityOrder[b.priority]
      }

      if (sortOrder.value === 'asc') {
        return aValue > bValue ? 1 : -1
      } else {
        return aValue < bValue ? 1 : -1
      }
    })

    return filtered
  })

  const taskStats = computed((): TaskStats => {
    const total = tasks.value.length
    const completed = tasks.value.filter(task => task.completed).length
    const pending = total - completed
    const overdue = tasks.value.filter(task => isOverdue(task.dueDate, task.completed)).length
    const highPriority = tasks.value.filter(task => 
      task.priority === TaskPriority.HIGH && !task.completed
    ).length

    return { total, completed, pending, overdue, highPriority }
  })

  const categories = computed(() => {
    return [...new Set(tasks.value.map(task => task.category))].sort()
  })

  const allTags = computed(() => {
    return [...new Set(tasks.value.flatMap(task => task.tags))].sort()
  })

  const hasActiveFilters = computed(() => {
    return Object.values(filter.value).some(value => 
      value !== undefined && value !== '' && 
      (Array.isArray(value) ? value.length > 0 : true)
    )
  })

  // Actions
  const createTask = (taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => {
    const task: Task = {
      id: crypto.randomUUID(),
      createdAt: new Date(),
      updatedAt: new Date(),
      ...taskData
    }
    tasks.value.unshift(task)
    saveToLocalStorage()
    return task
  }

  const updateTask = (id: string, updates: Partial<Task>) => {
    const index = tasks.value.findIndex(task => task.id === id)
    if (index !== -1) {
      tasks.value[index] = {
        ...tasks.value[index],
        ...updates,
        updatedAt: new Date()
      }
      saveToLocalStorage()
      return tasks.value[index]
    }
    return null
  }

  const deleteTask = (id: string) => {
    const index = tasks.value.findIndex(task => task.id === id)
    if (index !== -1) {
      tasks.value.splice(index, 1)
      saveToLocalStorage()
      return true
    }
    return false
  }

  const toggleTaskCompletion = (id: string) => {
    const task = tasks.value.find(task => task.id === id)
    if (task) {
      task.completed = !task.completed
      task.updatedAt = new Date()
      saveToLocalStorage()
      return task
    }
    return null
  }

  const duplicateTask = (id: string) => {
    const originalTask = tasks.value.find(task => task.id === id)
    if (originalTask) {
      const duplicatedTask = createTask({
        title: `${originalTask.title} (Copy)`,
        description: originalTask.description,
        completed: false,
        priority: originalTask.priority,
        category: originalTask.category,
        dueDate: originalTask.dueDate,
        tags: [...originalTask.tags]
      })
      return duplicatedTask
    }
    return null
  }

  const setFilter = (newFilter: TaskFilter) => {
    filter.value = newFilter
  }

  const clearFilters = () => {
    filter.value = {}
  }

  const setSorting = (newSortBy: TaskSortBy, newSortOrder?: SortOrder) => {
    if (sortBy.value === newSortBy && !newSortOrder) {
      sortOrder.value = sortOrder.value === SortOrderEnum.ASC ? SortOrderEnum.DESC : SortOrderEnum.ASC
    } else {
      sortBy.value = newSortBy
      if (newSortOrder) {
        sortOrder.value = newSortOrder
      }
    }
  }

  const loadTasks = () => {
    loadFromLocalStorage()
  }

  const addTask = (taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => {
    return createTask(taskData)
  }

  const setSortOrder = (order: SortOrder) => {
    sortOrder.value = order
  }

  // Local storage persistence
  const saveToLocalStorage = () => {
    if (import.meta.client) {
      localStorage.setItem('tasks', JSON.stringify(tasks.value.map(task => ({
        ...task,
        createdAt: task.createdAt.toISOString(),
        updatedAt: task.updatedAt.toISOString(),
        dueDate: task.dueDate?.toISOString()
      }))))
    }
  }

  const loadFromLocalStorage = () => {
    if (import.meta.client) {
      const stored = localStorage.getItem('tasks')
      if (stored) {
        try {
          const parsedTasks = JSON.parse(stored) as Array<{
            id: string
            title: string
            description: string
            completed: boolean
            priority: TaskPriority
            category: string
            createdAt: string
            updatedAt: string
            dueDate?: string
            tags: string[]
          }>
          tasks.value = parsedTasks.map((task) => ({
            ...task,
            createdAt: new Date(task.createdAt),
            updatedAt: new Date(task.updatedAt),
            dueDate: task.dueDate ? new Date(task.dueDate) : undefined
          }))
        } catch (error) {
          console.error('Error loading tasks from localStorage:', error)
        }
      }
    }
  }

  return {
    // State
    tasks,
    loading,
    filter,
    sortBy,
    sortOrder,
    
    // Getters
    filteredTasks,
    taskStats,
    categories,
    allTags,
    hasActiveFilters,
    
    // Actions
    createTask,
    updateTask,
    deleteTask,
    toggleTaskCompletion,
    duplicateTask,
    setFilter,
    clearFilters,
    setSorting,
    loadTasks,
    addTask,
    setSortOrder,
    loadFromLocalStorage
  }
})

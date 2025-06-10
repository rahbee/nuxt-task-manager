<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900">
    <!-- Header -->
    <header class="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
      <div class="container mx-auto px-4 py-4">
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div class="flex items-center space-x-3">
            <UIcon name="i-heroicons-clipboard-document-list" class="w-8 h-8 text-primary-500 shrink-0" />
            <div>
              <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Task Manager</h1>
              <p class="text-sm text-gray-600 dark:text-gray-400">Organize your tasks efficiently</p>
            </div>
          </div>
          
          <div class="flex items-center space-x-3">
            <!-- Theme Toggle -->
            <ClientOnly>
              <UButton
                :icon="isDark ? 'i-heroicons-sun' : 'i-heroicons-moon'"
                :aria-label="isDark ? 'Switch to light mode' : 'Switch to dark mode'"
                size="sm"
                color="neutral"
                variant="ghost"
                @click="toggleColorMode"
              />
              <template #fallback>
                <UButton
                  icon="i-heroicons-moon"
                  size="sm"
                  color="neutral"
                  variant="ghost"
                  disabled
                  aria-label="Loading theme toggle"
                />
              </template>
            </ClientOnly>
            
            <!-- Add Task Button -->
            <UButton
              icon="i-heroicons-plus"
              size="sm"
              class="shrink-0"
              @click="() => openTaskForm()"
            >
              Add Task
            </UButton>
          </div>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="container mx-auto px-4 py-6">
      <!-- Tasks Section -->
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <!-- Section Header with Stats -->
        <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <!-- Main Header -->
          <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-4 gap-4">
            <h2 class="text-lg font-semibold text-gray-900 dark:text-white">
              Tasks Overview
            </h2>
            
            <!-- Search and Sort Controls -->
            <div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <!-- Search Input -->
              <UInput
                v-model="searchQuery"
                placeholder="Search tasks..."
                icon="i-lucide-search"
                size="sm"
                class="w-full sm:w-64"
                :trailing="false"
              />
              
              <!-- Sort Controls -->
              <div class="flex items-center gap-2">
                <USelectMenu
                  v-model="selectedSortOption"
                  :items="sortOptions"
                  placeholder="Sort by"
                  size="sm"
                  class="w-full sm:w-40"
                />
                <UButton
                  :icon="sortOrder === 'asc' ? 'i-heroicons-arrow-up' : 'i-heroicons-arrow-down'"
                  size="sm"
                  color="neutral"
                  variant="ghost"
                  class="shrink-0"
                  @click="toggleSortOrder"
                />
              </div>
            </div>
          </div>
          
          <!-- Stats Grid -->
          <div class="hidden sm:grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            <!-- Total Tasks -->
            <button 
              class="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg transition-all duration-200 hover:bg-gray-100 dark:hover:bg-gray-600/50 hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-blue-500/20 min-w-0"
              :class="{ 
                'ring-2 ring-blue-500/40 bg-blue-50 dark:bg-blue-900/20 scale-[1.02]': isFilterActive('total'),
                'hover:shadow-md': !isFilterActive('total')
              }"
              @click="toggleStatFilter('total')"
            >
              <div class="flex items-center justify-center w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg shrink-0">
                <UIcon name="i-lucide-list-todo" class="w-4 h-4 text-blue-600 dark:text-blue-400" />
              </div>
              <div class="text-left min-w-0">
                <div class="text-sm font-medium text-gray-900 dark:text-white">{{ taskStats.total }}</div>
                <div class="text-xs text-gray-500 dark:text-gray-400 truncate">Total</div>
              </div>
            </button>
            
            <!-- Completed Tasks -->
            <button 
              class="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg transition-all duration-200 hover:bg-gray-100 dark:hover:bg-gray-600/50 hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-green-500/20 min-w-0"
              :class="{ 
                'ring-2 ring-green-500/40 bg-green-50 dark:bg-green-900/20 scale-[1.02]': isFilterActive('completed'),
                'hover:shadow-md': !isFilterActive('completed')
              }"
              @click="toggleStatFilter('completed')"
            >
              <div class="flex items-center justify-center w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-lg shrink-0">
                <UIcon name="i-lucide-check-circle" class="w-4 h-4 text-green-600 dark:text-green-400" />
              </div>
              <div class="text-left min-w-0">
                <div class="text-sm font-medium text-gray-900 dark:text-white">{{ taskStats.completed }}</div>
                <div class="text-xs text-gray-500 dark:text-gray-400 truncate">Completed</div>
              </div>
            </button>
            
            <!-- Pending Tasks -->
            <button 
              class="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg transition-all duration-200 hover:bg-gray-100 dark:hover:bg-gray-600/50 hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-yellow-500/20 min-w-0"
              :class="{ 
                'ring-2 ring-yellow-500/40 bg-yellow-50 dark:bg-yellow-900/20 scale-[1.02]': isFilterActive('pending'),
                'hover:shadow-md': !isFilterActive('pending')
              }"
              @click="toggleStatFilter('pending')"
            >
              <div class="flex items-center justify-center w-8 h-8 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg shrink-0">
                <UIcon name="i-lucide-clock" class="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div class="text-left min-w-0">
                <div class="text-sm font-medium text-gray-900 dark:text-white">{{ taskStats.pending }}</div>
                <div class="text-xs text-gray-500 dark:text-gray-400 truncate">Pending</div>
              </div>
            </button>
            
            <!-- Overdue Tasks -->
            <button 
              class="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg transition-all duration-200 hover:bg-gray-100 dark:hover:bg-gray-600/50 hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-red-500/20 min-w-0"
              :class="{ 
                'ring-2 ring-red-500/40 bg-red-50 dark:bg-red-900/20 scale-[1.02]': isFilterActive('overdue'),
                'hover:shadow-md': !isFilterActive('overdue')
              }"
              @click="toggleStatFilter('overdue')"
            >
              <div class="flex items-center justify-center w-8 h-8 bg-red-100 dark:bg-red-900/30 rounded-lg shrink-0">
                <UIcon name="i-lucide-alert-triangle" class="w-4 h-4 text-red-600 dark:text-red-400" />
              </div>
              <div class="text-left min-w-0">
                <div class="text-sm font-medium text-gray-900 dark:text-white">{{ taskStats.overdue }}</div>
                <div class="text-xs text-gray-500 dark:text-gray-400 truncate">Overdue</div>
              </div>
            </button>
            
            <!-- High Priority Tasks -->
            <button 
              class="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg transition-all duration-200 hover:bg-gray-100 dark:hover:bg-gray-600/50 hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-orange-500/20 min-w-0"
              :class="{ 
                'ring-2 ring-orange-500/40 bg-orange-50 dark:bg-orange-900/20 scale-[1.02]': isFilterActive('highPriority'),
                'hover:shadow-md': !isFilterActive('highPriority')
              }"
              @click="toggleStatFilter('highPriority')"
            >
              <div class="flex items-center justify-center w-8 h-8 bg-orange-100 dark:bg-orange-900/30 rounded-lg shrink-0">
                <UIcon name="i-lucide-flame" class="w-4 h-4 text-orange-600 dark:text-orange-400" />
              </div>
              <div class="text-left min-w-0">
                <div class="text-sm font-medium text-gray-900 dark:text-white">{{ taskStats.highPriority }}</div>
                <div class="text-xs text-gray-500 dark:text-gray-400 truncate">High Priority</div>
              </div>
            </button>
          </div>
        </div>

        <!-- Tasks List -->
        <div class="p-6">
          <div v-if="loading" class="flex justify-center py-12">
            <UIcon name="i-heroicons-arrow-path" class="w-8 h-8 animate-spin text-primary-500" />
          </div>
          
          <div v-else-if="filteredTasks.length === 0" class="text-center py-12">
            <UIcon name="i-heroicons-clipboard-document-list" class="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">No tasks found</h3>
            <p class="text-gray-600 dark:text-gray-400 mb-4">
              {{ hasActiveFilters ? 'Try adjusting your filters or' : 'Get started by' }} creating your first task
            </p>
            <UButton
              icon="i-heroicons-plus"
              @click="() => openTaskForm()"
            >
              Add Task
            </UButton>
          </div>

          <div v-else class="grid gap-4">
            <TaskCard
              v-for="task in filteredTasks"
              :key="task.id"
              :task="task"
              @edit="editTask"
              @delete="(id: string) => deleteTask(id)"
              @toggle-completion="(id: string) => toggleTaskCompletion(id)"
              @duplicate="(id: string) => duplicateTask(id)"
            />
          </div>
        </div>
      </div>
    </main>

    <!-- Task Form Modal -->
    <UModal 
      v-model:open="showTaskForm"
      :title="editingTask ? 'Edit Task' : 'Create New Task'"
      :description="editingTask ? 'Update task details and save changes' : 'Fill in the form to create a new task'"
      :ui="{ 
        wrapper: 'max-w-7xl w-full mx-4 max-h-[90vh]',
        body: 'px-8 py-6',
        header: 'px-8 py-6',
        footer: 'px-8 py-6'
      }"
    >
      
      <template #body>
        <TaskForm
          :task="editingTask || undefined"
          :existing-categories="categories"
          :in-modal="true"
          :form-loading="loading"
          @submit="handleTaskSubmit"
          @update="handleTaskUpdate"
          @close="closeTaskForm"
        />
      </template>
      
      <template #footer>
        <div class="flex items-center justify-end gap-4">
          <UButton
            variant="ghost"
            size="lg"
            @click="closeTaskForm"
          >
            Cancel
          </UButton>
          <UButton
            type="submit"
            form="task-form"
            size="lg"
            :loading="loading"
          >
            {{ editingTask ? 'Update Task' : 'Create Task' }}
          </UButton>
        </div>
      </template>
    </UModal>

    <!-- Delete Confirmation Modal -->
    <UModal 
      v-model:open="showDeleteConfirm"
      title="Delete Task"
      description="This action cannot be undone. The task will be permanently removed from your task list."
    >
      <template #header>
        <div class="flex flex-col">
          <h3 class="text-xl font-semibold text-red-600 dark:text-red-400">
            Delete Task
          </h3>
          <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
            This action cannot be undone
          </p>
        </div>
      </template>
      
      <template #body>
        <div class="flex items-center space-x-3 mb-4">
          <UIcon name="i-heroicons-exclamation-triangle" class="w-6 h-6 text-error-500" />
          <p class="text-gray-600 dark:text-gray-400">
            Are you sure you want to delete "{{ taskToDelete?.title }}"? This action cannot be undone.
          </p>
        </div>
      </template>
      
      <template #footer>
        <div class="flex justify-end space-x-3">
          <UButton
            color="neutral"
            variant="outline"
            @click="showDeleteConfirm = false"
          >
            Cancel
          </UButton>
          <UButton
            color="error"
            @click="confirmDelete"
          >
            Delete
          </UButton>
        </div>
      </template>
    </UModal>
  </div>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia'
import type { Task, TaskFilter } from '~/types/task'
import { TaskPriority, SORT_OPTIONS, SortOrder } from '~/types/task'
import { useTaskStore } from '~/stores/tasks'

// Color mode
const colorMode = useColorMode()
const isDark = computed(() => colorMode.value === 'dark')

const toggleColorMode = () => {
  colorMode.preference = colorMode.value === 'dark' ? 'light' : 'dark'
}

// Store
const taskStore = useTaskStore()
const { 
  filteredTasks, 
  loading, 
  filter,
  sortOrder, 
  hasActiveFilters,
  categories,
  taskStats
} = storeToRefs(taskStore)

// Computed
// Search functionality
const searchQuery = ref(filter.value.search || '')

// Selected sort option computed property
const selectedSortOption = computed({
  get: () => SORT_OPTIONS.find(option => option.value === taskStore.sortBy) || SORT_OPTIONS[0],
  set: (option) => taskStore.setSorting(option.value)
})

// Search debouncing
let searchTimeout: NodeJS.Timeout
watch(searchQuery, () => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    const newFilter = { ...filter.value }
    if (searchQuery.value.trim()) {
      newFilter.search = searchQuery.value.trim()
    } else {
      const { search, ...rest } = newFilter
      taskStore.setFilter(rest)
      return
    }
    taskStore.setFilter(newFilter)
  }, 300)
})

// Watch for external filter changes to sync search query
watch(() => filter.value.search, (newSearch) => {
  if (searchQuery.value !== (newSearch || '')) {
    searchQuery.value = newSearch || ''
  }
})

// Stat filtering functions
const isFilterActive = (statType: string) => {
  switch (statType) {
    case 'total':
      return !hasActiveFilters.value
    case 'completed':
      return filter.value.completed === true
    case 'pending':
      return filter.value.completed === false && !filter.value.overdue
    case 'overdue':
      return filter.value.overdue === true
    case 'highPriority':
      return filter.value.priority === TaskPriority.HIGH
    default:
      return false
  }
}

const toggleStatFilter = (statType: string) => {
  // Check if the current filter is already active
  const isCurrentlyActive = isFilterActive(statType)
  
  if (isCurrentlyActive) {
    // If currently active, clear all filters to show all tasks
    taskStore.setFilter({})
    searchQuery.value = ''
    return
  }
  
  // Clear all existing filters and apply only the selected one
  const newFilter: TaskFilter = {}
  
  switch (statType) {
    case 'total':
      // Show all tasks - no filters needed
      break
    case 'completed':
      newFilter.completed = true
      break
    case 'pending':
      newFilter.completed = false
      break
    case 'overdue':
      newFilter.completed = false
      newFilter.overdue = true
      break
    case 'highPriority':
      newFilter.priority = TaskPriority.HIGH
      break
  }
  
  taskStore.setFilter(newFilter)
  searchQuery.value = '' // Clear search when applying stat filter
}

// Task Form Modal
const showTaskForm = ref(false)
const editingTask = ref<Task | null>(null)

const openTaskForm = (task?: Task) => {
  editingTask.value = task || null
  showTaskForm.value = true
}

const closeTaskForm = () => {
  showTaskForm.value = false
  editingTask.value = null
}

const handleTaskSubmit = async (taskData: Partial<Task>) => {
  try {
    if (editingTask.value) {
      await taskStore.updateTask(editingTask.value.id, taskData)
    } else {
      // Ensure required fields are present for new tasks
      const newTaskData = {
        title: taskData.title || '',
        description: taskData.description || '',
        completed: taskData.completed || false,
        priority: taskData.priority || TaskPriority.MEDIUM,
        category: taskData.category || 'General',
        tags: taskData.tags || [],
        dueDate: taskData.dueDate,
      }
      await taskStore.addTask(newTaskData)
    }
    closeTaskForm()
  } catch (error) {
    console.error('Error saving task:', error)
  }
}

const handleTaskUpdate = async (id: string, updates: Partial<Task>) => {
  try {
    await taskStore.updateTask(id, updates)
    closeTaskForm()
  } catch (error) {
    console.error('Error updating task:', error)
  }
}

// Task Actions
const editTask = (task: Task) => {
  openTaskForm(task)
}

const toggleTaskCompletion = async (id: string) => {
  try {
    await taskStore.toggleTaskCompletion(id)
  } catch (error) {
    console.error('Error updating task:', error)
  }
}

const duplicateTask = async (id: string) => {
  try {
    await taskStore.duplicateTask(id)
  } catch (error) {
    console.error('Error duplicating task:', error)
  }
}

// Delete Confirmation
const showDeleteConfirm = ref(false)
const taskToDelete = ref<Task | null>(null)

const deleteTask = (id: string) => {
  const task = filteredTasks.value.find(t => t.id === id)
  if (task) {
    taskToDelete.value = task
    showDeleteConfirm.value = true
  }
}

const confirmDelete = async () => {
  if (taskToDelete.value) {
    try {
      await taskStore.deleteTask(taskToDelete.value.id)
      showDeleteConfirm.value = false
      taskToDelete.value = null
    } catch (error) {
      console.error('Error deleting task:', error)
    }
  }
}

// Sort Options
const sortOptions = SORT_OPTIONS

const toggleSortOrder = () => {
  taskStore.setSortOrder(sortOrder.value === SortOrder.ASC ? SortOrder.DESC : SortOrder.ASC)
}

// SEO
useHead({
  title: 'Task Manager - Organize Your Tasks',
  meta: [
    { 
      name: 'description', 
      content: 'A modern task management application built with Nuxt 3, Vue 3, and TypeScript. Organize, prioritize, and track your tasks efficiently.' 
    }
  ]
})

// Initialize data
onMounted(() => {
  taskStore.loadTasks()
})
</script>

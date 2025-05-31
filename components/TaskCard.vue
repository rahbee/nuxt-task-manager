<template>
  <UCard 
    class="task-card group relative transition-all duration-200 hover:shadow-lg"
    :class="{
      'opacity-60': task.completed,
      'border-red-200 dark:border-red-800': isOverdue(task.dueDate, task.completed),
    }"
  >
    <!-- Priority indicator -->
    <div 
      class="absolute top-0 left-0 w-1 h-full rounded-l-lg"
      :class="`bg-${getPriorityColor(task.priority)}-500`"
    />
    
    <!-- Task header -->
    <div class="flex items-start justify-between gap-3 mb-3">
      <div class="flex items-start gap-3 flex-1 min-w-0">
        <!-- Completion checkbox -->
        <UCheckbox
          :model-value="task.completed"
          size="lg"
          class="mt-1 flex-shrink-0"
          @change="$emit('toggle-completion', task.id)"
        />
        
        <!-- Task content -->
        <div class="flex-1 min-w-0">
          <h3 
            class="font-medium text-gray-900 dark:text-white truncate"
            :class="{ 'line-through text-gray-500': task.completed }"
          >
            {{ task.title }}
          </h3>
          
          <p 
            v-if="task.description" 
            class="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2"
            :class="{ 'line-through': task.completed }"
          >
            {{ task.description }}
          </p>
        </div>
      </div>
      
      <!-- Actions dropdown -->
      <UDropdownMenu :items="dropdownItems" :content="{ align: 'end' }">
        <UButton
          variant="ghost"
          size="sm"
          icon="i-lucide-more-horizontal"
          class="opacity-0 group-hover:opacity-100 transition-opacity"
        />
      </UDropdownMenu>
    </div>
    
    <!-- Task metadata -->
    <div class="flex flex-wrap items-center gap-3 text-sm">
      <!-- Priority badge -->
      <UBadge
        :color="getPriorityColor(task.priority)"
        variant="soft"
        size="xs"
        :icon="getPriorityIcon(task.priority)"
      >
        {{ task.priority }}
      </UBadge>
      
      <!-- Category -->
      <UBadge variant="outline" size="xs" class="text-gray-600">
        {{ task.category }}
      </UBadge>
      
      <!-- Due date -->
      <div 
        v-if="task.dueDate" 
        class="flex items-center gap-1"
        :class="{
          'text-red-600 dark:text-red-400': isOverdue(task.dueDate, task.completed),
          'text-gray-600 dark:text-gray-400': !isOverdue(task.dueDate, task.completed)
        }"
      >
        <UIcon name="i-lucide-calendar" class="w-3 h-3" />
        <span class="text-xs">{{ formatDueDate(task.dueDate, task.completed) }}</span>
      </div>
      
      <!-- Tags -->
      <div v-if="task.tags.length > 0" class="flex items-center gap-1 flex-wrap">
        <UBadge
          v-for="tag in task.tags.slice(0, 3)"
          :key="tag"
          variant="soft"
          color="neutral"
          size="xs"
        >
          #{{ tag }}
        </UBadge>
        <span 
          v-if="task.tags.length > 3" 
          class="text-xs text-gray-500"
        >
          +{{ task.tags.length - 3 }} more
        </span>
      </div>
    </div>
    
    <!-- Created/Updated info -->
    <div class="flex items-center justify-between mt-3 pt-3 border-t border-gray-100 dark:border-gray-800">
      <span class="text-xs text-gray-500">
        Created {{ formatRelativeDate(task.createdAt) }}
      </span>
      <span 
        v-if="task.updatedAt.getTime() !== task.createdAt.getTime()"
        class="text-xs text-gray-500"
      >
        Updated {{ formatRelativeDate(task.updatedAt) }}
      </span>
    </div>
  </UCard>
</template>

<script setup lang="ts">
import type { Task } from '~/types/task'
import { formatDueDate, formatRelativeDate, isOverdue } from '~/utils/date'
import { getPriorityColor, getPriorityIcon } from '~/utils/priority'

interface Props {
  task: Task
}

interface Emits {
  (e: 'toggle-completion' | 'delete' | 'duplicate', id: string): void
  (e: 'edit', task: Task): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const dropdownItems = [
  [{
    label: 'Edit',
    icon: 'i-lucide-edit',
    onSelect: () => emit('edit', props.task)
  }],
  [{
    label: 'Duplicate',
    icon: 'i-lucide-copy',
    onSelect: () => emit('duplicate', props.task.id)
  }],
  [{
    label: 'Delete',
    icon: 'i-lucide-trash-2',
    onSelect: () => emit('delete', props.task.id)
  }]
]
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>

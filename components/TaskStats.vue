<template>
  <div class="grid grid-cols-2 md:grid-cols-5 gap-4">
    <!-- Total Tasks -->
    <UCard class="text-center">
      <div class="space-y-2">
        <div class="flex items-center justify-center">
          <UIcon name="i-lucide-list-todo" class="w-6 h-6 text-blue-500" />
        </div>
        <div>
          <div class="text-2xl font-bold text-gray-900 dark:text-white">
            {{ stats.total }}
          </div>
          <div class="text-sm text-gray-600 dark:text-gray-400">
            Total Tasks
          </div>
        </div>
      </div>
    </UCard>
    
    <!-- Completed Tasks -->
    <UCard class="text-center">
      <div class="space-y-2">
        <div class="flex items-center justify-center">
          <UIcon name="i-lucide-check-circle" class="w-6 h-6 text-green-500" />
        </div>
        <div>
          <div class="text-2xl font-bold text-gray-900 dark:text-white">
            {{ stats.completed }}
          </div>
          <div class="text-sm text-gray-600 dark:text-gray-400">
            Completed
          </div>
        </div>
      </div>
    </UCard>
    
    <!-- Pending Tasks -->
    <UCard class="text-center">
      <div class="space-y-2">
        <div class="flex items-center justify-center">
          <UIcon name="i-lucide-clock" class="w-6 h-6 text-yellow-500" />
        </div>
        <div>
          <div class="text-2xl font-bold text-gray-900 dark:text-white">
            {{ stats.pending }}
          </div>
          <div class="text-sm text-gray-600 dark:text-gray-400">
            Pending
          </div>
        </div>
      </div>
    </UCard>
    
    <!-- Overdue Tasks -->
    <UCard class="text-center">
      <div class="space-y-2">
        <div class="flex items-center justify-center">
          <UIcon name="i-lucide-alert-triangle" class="w-6 h-6 text-red-500" />
        </div>
        <div>
          <div class="text-2xl font-bold text-gray-900 dark:text-white">
            {{ stats.overdue }}
          </div>
          <div class="text-sm text-gray-600 dark:text-gray-400">
            Overdue
          </div>
        </div>
      </div>
    </UCard>
    
    <!-- High Priority Tasks -->
    <UCard class="text-center">
      <div class="space-y-2">
        <div class="flex items-center justify-center">
          <UIcon name="i-lucide-flame" class="w-6 h-6 text-orange-500" />
        </div>
        <div>
          <div class="text-2xl font-bold text-gray-900 dark:text-white">
            {{ stats.highPriority }}
          </div>
          <div class="text-sm text-gray-600 dark:text-gray-400">
            High Priority
          </div>
        </div>
      </div>
    </UCard>
  </div>
</template>

<script setup lang="ts">
import type { TaskStats } from '~/types/task'

interface Props {
  stats: TaskStats
}

defineProps<Props>()
</script>

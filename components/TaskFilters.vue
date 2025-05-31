<template>
  <UCard>
    <template #header>
      <div class="flex items-center justify-between">
        <h3 class="text-lg font-semibold">Filters</h3>
        <UButton
          v-if="hasActiveFilters"
          variant="ghost"
          size="sm"
          @click="clearAllFilters"
        >
          Clear All
        </UButton>
      </div>
    </template>
    
    <div class="space-y-4">
      <!-- Detailed Filters -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-3 max-w-4xl">
        <!-- Priority Filter -->
        <UFormField label="Priority">
          <USelectMenu
            v-model="selectedPriority"
            :items="priorityOptions"
            value-key="value"
            placeholder="All priorities"
            size="lg"
            class="w-full min-w-[200px]"
            @change="updatePriorityFilter"
          />
        </UFormField>
        
        <!-- Category Filter -->
        <UFormField label="Category">
          <USelectMenu
            v-model="selectedCategory"
            :items="categoryOptions"
            value-key="value"
            placeholder="All categories"
            size="lg"
            class="w-full min-w-[200px]"
            @change="updateCategoryFilter"
          />
        </UFormField>
        
        <!-- Tags Filter -->
        <UFormField label="Tags">
          <USelectMenu
            v-model="selectedTags"
            :items="tagOptions"
            value-key="value"
            placeholder="Select tags"
            size="lg"
            class="w-full min-w-[200px]"
            multiple
            @change="updateTagsFilter"
          />
        </UFormField>
      </div>
      
      <!-- Active Filters Display -->
      <div v-if="hasActiveFilters" class="pt-4 border-t border-gray-200 dark:border-gray-700">
        <div class="flex items-center gap-2 flex-wrap">
          <span class="text-sm font-medium text-gray-700 dark:text-gray-300">Active filters:</span>
          
          <UBadge
            v-if="filter.completed !== undefined"
            variant="soft"
            size="sm"
            class="cursor-pointer"
            @click="removeFilter('completed')"
          >
            {{ filter.completed ? 'Completed' : 'Pending' }}
            <UIcon name="i-lucide-x" class="w-3 h-3 ml-1" />
          </UBadge>
          
          <UBadge
            v-if="filter.priority"
            variant="soft"
            size="sm"
            :color="getPriorityColor(filter.priority)"
            class="cursor-pointer"
            @click="removeFilter('priority')"
          >
            {{ filter.priority }} priority
            <UIcon name="i-lucide-x" class="w-3 h-3 ml-1" />
          </UBadge>
          
          <UBadge
            v-if="filter.overdue"
            variant="soft"
            size="sm"
            color="error"
            class="cursor-pointer"
            @click="removeFilter('overdue')"
          >
            Overdue
            <UIcon name="i-lucide-x" class="w-3 h-3 ml-1" />
          </UBadge>
          
          <UBadge
            v-if="filter.category"
            variant="soft"
            size="sm"
            class="cursor-pointer"
            @click="removeFilter('category')"
          >
            {{ filter.category }}
            <UIcon name="i-lucide-x" class="w-3 h-3 ml-1" />
          </UBadge>
          
          <UBadge
            v-for="tag in selectedTags"
            :key="tag"
            variant="soft"
            size="sm"
            class="cursor-pointer"
            @click="removeTagFilter(tag)"
          >
            #{{ tag }}
            <UIcon name="i-lucide-x" class="w-3 h-3 ml-1" />
          </UBadge>
        </div>
      </div>
    </div>
  </UCard>
</template>

<script setup lang="ts">
import type { TaskFilter, TaskPriority } from '~/types/task'
import { PRIORITY_OPTIONS } from '~/types/task'
import { getPriorityColor } from '~/utils/priority'

interface Props {
  modelValue: TaskFilter
  categories: string[]
  tags: string[]
}

interface Emits {
  (e: 'filter-change', filter: TaskFilter): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// Local state
const selectedTags = ref<string[]>(props.modelValue.tags || [])
const selectedPriority = ref<TaskPriority | undefined>(props.modelValue.priority || undefined)
const selectedCategory = ref(props.modelValue.category || undefined)

// Computed filter object
const filter = computed(() => props.modelValue)

// Filter options
const priorityOptions = PRIORITY_OPTIONS

const categoryOptions = computed(() => [
  { label: 'All Categories', value: undefined },
  ...props.categories.map(cat => ({ label: cat, value: cat }))
])

const tagOptions = computed(() => 
  props.tags.map(tag => ({ label: `#${tag}`, value: tag }))
)

// Check if any filters are active
const hasActiveFilters = computed(() => {
  return !!(
    filter.value.completed !== undefined ||
    filter.value.priority ||
    filter.value.category ||
    filter.value.overdue ||
    (filter.value.tags && filter.value.tags.length > 0)
  )
})

// Methods
function updatePriorityFilter() {
  const newFilter = { ...props.modelValue }
  if (selectedPriority.value) {
    newFilter.priority = selectedPriority.value
  } else {
    const { priority, ...rest } = newFilter
    emit('filter-change', rest)
    return
  }
  emit('filter-change', newFilter)
}

function updateCategoryFilter() {
  const newFilter = { ...props.modelValue }
  if (selectedCategory.value) {
    newFilter.category = selectedCategory.value
  } else {
    const { category, ...rest } = newFilter
    emit('filter-change', rest)
    return
  }
  emit('filter-change', newFilter)
}

function updateTagsFilter() {
  const newFilter = { ...props.modelValue }
  if (selectedTags.value.length > 0) {
    newFilter.tags = [...selectedTags.value]
  } else {
    // Remove the tags property completely
    const { tags, ...rest } = newFilter
    emit('filter-change', rest)
    return
  }
  emit('filter-change', newFilter)
}

function removeFilter(key: keyof TaskFilter) {
  const newFilter = { ...props.modelValue }
  const { [key]: _, ...rest } = newFilter
  emit('filter-change', rest)
  
  // Reset local state
  if (key === 'priority') {
    selectedPriority.value = undefined
  } else if (key === 'category') {
    selectedCategory.value = undefined
  }
}

function removeTagFilter(tag: string) {
  selectedTags.value = selectedTags.value.filter(t => t !== tag)
  updateTagsFilter()
}

function clearAllFilters() {
  selectedTags.value = []
  selectedPriority.value = undefined
  selectedCategory.value = undefined
  emit('filter-change', {})
}

// Watch for external filter changes
watch(() => props.modelValue, (newFilter) => {
  selectedTags.value = newFilter.tags || []
  selectedPriority.value = newFilter.priority || undefined
  selectedCategory.value = newFilter.category || undefined
}, { deep: true })
</script>

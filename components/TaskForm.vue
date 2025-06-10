<template>
  <div>
    <!-- Form content -->
    <UForm
      id="task-form"
      :schema="formSchema"
      :state="formState"
      class="space-y-8"
      @submit="handleSubmit"
    >
      <!-- Title -->
      <UFormField label="Title" name="title" required>
        <UInput
          v-model="formState.title"
          placeholder="Enter task title..."
          size="xl"
          class="w-full text-xl font-medium"
        />
      </UFormField>
      
      <!-- Description -->
      <UFormField label="Description" name="description">
        <ClientOnly>
          <QuillEditor
            v-model="formState.description"
            theme="snow"
            :toolbar="toolbarOptions"
            class="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 min-h-[180px]"
          />
          <template #fallback>
            <UTextarea
              v-model="formState.description"
              placeholder="Enter task description..."
              :rows="6"
              resize
              class="w-full text-base"
              size="xl"
            />
          </template>
        </ClientOnly>
      </UFormField>
      
      <!-- Priority and Category in larger layout -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <UFormField label="Priority" name="priority" required>
          <USelectMenu
            v-model="selectedPriority"
            :items="priorityOptions"
            placeholder="Select priority"
            size="xl"
            class="w-full"
          />
        </UFormField>
        
        <UFormField label="Category" name="category" required>
          <USelectMenu
            v-model="selectedCategory"
            :items="categoryOptions"
            searchable
            create-item
            placeholder="Select existing or type new category..."
            size="xl"
            class="w-full"
            @create="handleCreateCategory"
          />
        </UFormField>
      </div>
      
      <!-- Due Date with larger input -->
      <UFormField label="Due Date" name="dueDate">
        <UInput
          v-model="formState.dueDate"
          type="datetime-local"
          :min="minDateTime"
          size="xl"
          class="w-full"
        />
      </UFormField>
      
      <!-- Tags with better spacing -->
      <UFormField label="Tags" name="tags">
        <div class="space-y-6">
          <UInput
            v-model="newTag"
            placeholder="Add a tag and press Enter..."
            size="xl"
            class="w-full"
            @keydown.enter.prevent="addTag"
          />
          <div v-if="formState.tags.length > 0" class="flex flex-wrap gap-4">
            <UBadge
              v-for="(tag, index) in formState.tags"
              :key="`${tag}-${index}`"
              variant="soft"
              size="lg"
              class="cursor-pointer px-4 py-3 text-base hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              @click="removeTag(index)"
            >
              #{{ tag }}
              <UIcon name="i-lucide-x" class="w-5 h-5 ml-3" />
            </UBadge>
          </div>
        </div>
      </UFormField>
    </UForm>
  </div>
</template>

<script setup lang="ts">
import { TaskPriority, PRIORITY_OPTIONS, type Task, type CreateTaskInput } from '~/types/task'
import { z } from 'zod'
import { ref, computed, defineAsyncComponent } from 'vue'

// Import QuillEditor only on client to avoid SSR errors
defineOptions({ name: 'TaskForm' })
const QuillEditor = import.meta.client
  ? defineAsyncComponent(() => import('@vueup/vue-quill').then(m => m.QuillEditor))
  : undefined
if (import.meta.client) {
  import('@vueup/vue-quill/dist/vue-quill.snow.css')
}

interface Props {
  task?: Task
  existingCategories?: string[]
  inModal?: boolean
  formLoading?: boolean
}

interface Emits {
  (e: 'close'): void
  (e: 'submit', task: CreateTaskInput): void
  (e: 'update', id: string, updates: Partial<Task>): void
}

const props = withDefaults(defineProps<Props>(), {
  task: undefined,
  existingCategories: () => [],
  inModal: false,
  formLoading: false
})

const emit = defineEmits<Emits>()

const loading = ref(false)
const newTag = ref('')

const isEditMode = computed(() => !!props.task)

// Form schema using our Zod schema but with string dates for form inputs
const formSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title too long'),
  description: z.string().max(1000, 'Description too long'),
  priority: z.nativeEnum(TaskPriority),
  category: z.string().min(1, 'Category is required').max(50, 'Category too long'),
  dueDate: z.string().optional(),
  tags: z.array(z.string().min(1).max(30)).max(10, 'Too many tags')
})

// Form state type
type FormState = {
  title: string
  description: string
  priority: TaskPriority
  category: string
  dueDate: string
  tags: string[]
}

// Form state
const formState = reactive<FormState>({
  title: props.task?.title || '',
  description: props.task?.description || '',
  priority: props.task?.priority || TaskPriority.MEDIUM,
  category: props.task?.category || '',
  dueDate: props.task?.dueDate ? formatDateTimeLocal(props.task.dueDate) : getDefaultDueDate(),
  tags: props.task?.tags ? [...props.task.tags] : []
})

// Use the new priority options from types
const priorityOptions = PRIORITY_OPTIONS.filter(option => option.value !== undefined)

const categoryOptions = computed(() => {
  // Use only existing categories from tasks
  const allCategories = [...props.existingCategories]
  const existingOptions = allCategories.map(cat => ({ label: cat, value: cat }))
  
  // Add current category if it's not in existing categories (for editing)
  if (formState.category && !allCategories.includes(formState.category)) {
    existingOptions.push({ label: formState.category, value: formState.category })
  }
  
  return existingOptions.sort((a, b) => a.label.localeCompare(b.label))
})

// Computed properties for dropdown v-model compatibility
const selectedPriority = computed({
  get: () => {
    const option = priorityOptions.find(opt => opt.value === formState.priority)
    return option || priorityOptions.find(opt => opt.value === TaskPriority.MEDIUM)
  },
  set: (value: { label: string; value: TaskPriority } | TaskPriority) => {
    if (typeof value === 'object' && value?.value) {
      formState.priority = value.value
    } else if (typeof value === 'string') {
      formState.priority = value as TaskPriority
    }
  }
})

const selectedCategory = computed({
  get: () => {
    if (!formState.category) return undefined
    return { label: formState.category, value: formState.category }
  },
  set: (value: { label: string; value: string } | string | undefined) => {
    if (typeof value === 'object' && value?.value) {
      formState.category = value.value
    } else if (typeof value === 'string') {
      formState.category = value
    } else {
      formState.category = ''
    }
  }
})

// Current datetime for min attribute
const minDateTime = computed(() => {
  const now = new Date()
  now.setMinutes(now.getMinutes() - now.getTimezoneOffset())
  return now.toISOString().slice(0, 16)
})

// Quill editor toolbar for a minimal set of controls
const toolbarOptions = [
  ['bold', 'italic', 'underline', 'strike', 'link', 'clean']
]

// Methods
function formatDateTimeLocal(date: Date): string {
  const d = new Date(date)
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset())
  return d.toISOString().slice(0, 16)
}

function getDefaultDueDate(): string {
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  return formatDateTimeLocal(tomorrow)
}

function addTag() {
  const tag = newTag.value.trim()
  if (tag && !formState.tags.includes(tag) && formState.tags.length < 10) {
    formState.tags.push(tag)
    newTag.value = ''
  }
}

function removeTag(index: number) {
  formState.tags.splice(index, 1)
}

function handleCreateCategory(value: string) {
  const newCategory = value.trim()
  if (newCategory && !props.existingCategories.includes(newCategory)) {
    // Set the new category as selected
    formState.category = newCategory
    // The parent component will handle adding it to the categories list when the task is saved
  }
}

async function handleSubmit() {
  loading.value = true
  
  try {
    // Validate the form data using our form schema
    formSchema.parse(formState)
    
    // Convert form data to proper task data
    const taskData: CreateTaskInput = {
      title: formState.title.trim(),
      description: formState.description.trim(),
      priority: formState.priority,
      category: formState.category.trim(),
      completed: props.task?.completed || false,
      dueDate: formState.dueDate ? new Date(formState.dueDate) : undefined,
      tags: formState.tags
    }
    
    if (isEditMode.value && props.task) {
      emit('update', props.task.id, taskData)
    } else {
      emit('submit', taskData)
    }
    
    emit('close')
  } catch (error) {
    console.error('Error submitting task:', error)
    // You could add toast notification here for validation errors
  } finally {
    loading.value = false
  }
}

// Watch for task prop changes (when editing)
watch(() => props.task, (newTask) => {
  if (newTask) {
    formState.title = newTask.title
    formState.description = newTask.description
    formState.priority = newTask.priority
    formState.category = newTask.category
    formState.dueDate = newTask.dueDate ? formatDateTimeLocal(newTask.dueDate) : getDefaultDueDate()
    formState.tags = [...newTask.tags]
  } else {
    // Reset form for new task
    formState.title = ''
    formState.description = ''
    formState.priority = TaskPriority.MEDIUM
    formState.category = ''
    formState.dueDate = getDefaultDueDate()
    formState.tags = []
  }
}, { immediate: true })
</script>

<template>
  <UCard class="max-w-md">
    <template #header>
      <div class="flex items-center gap-3">
        <UIcon name="i-heroicons-sparkles" class="w-6 h-6 text-primary" />
        <h2 class="text-xl font-semibold">{{ title }}</h2>
      </div>
    </template>

    <div class="space-y-4">
      <p class="text-gray-600 dark:text-gray-300">
        {{ message }}
      </p>
      
      <div class="flex gap-2">
        <UBadge color="success" variant="soft">
          {{ status }}
        </UBadge>
        <UBadge color="info" variant="outline">
          Nuxt 3
        </UBadge>
      </div>

      <UButton 
        color="primary" 
        icon="i-heroicons-hand-raised"
        :loading="isLoading"
        @click="handleClick"
      >
        {{ buttonText }}
      </UButton>
    </div>

    <template #footer>
      <div class="text-sm text-gray-500 dark:text-gray-400">
        <p>Built with Nuxt 3 + Vue 3 + TypeScript</p>
        <ClientOnly>
          <p class="mt-1">Current time: {{ currentTime }}</p>
          <template #fallback>
            <p class="mt-1">Loading time...</p>
          </template>
        </ClientOnly>
      </div>
    </template>
  </UCard>
</template>

<script setup lang="ts">
const props = defineProps<{
  title: string
  message: string
  status?: string
  buttonText?: string
}>()

const emit = defineEmits<{
  buttonClick: [message: string]
}>()

const isLoading = ref(false)
const currentTime = ref('')

// Update time every second (only on client)
onMounted(() => {
  const updateTime = () => {
    currentTime.value = new Date().toLocaleTimeString()
  }
  
  updateTime() // Initial update
  const interval = setInterval(updateTime, 1000)
  
  // Cleanup on unmount
  onUnmounted(() => {
    clearInterval(interval)
  })
})

const handleClick = async () => {
  isLoading.value = true
  
  // Simulate some async operation
  await new Promise(resolve => setTimeout(resolve, 1000))
  
  emit('buttonClick', `Hello from ${props.title}!`)
  isLoading.value = false
}
</script>

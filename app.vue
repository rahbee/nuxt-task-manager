<template>
  <UApp>
    <div class="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div class="container mx-auto px-4">
        <WelcomeCard 
          title="Welcome to Nuxt 3" 
          message="This is a custom Vue component with TypeScript support!"
          status="Active"
          button-text="Click me!"
          @button-click="handleButtonClick"
        />
        
        <!-- Show notification if exists -->
        <div v-if="notification" class="mt-6">
          <UAlert 
            color="success" 
            variant="solid" 
            :title="notification"
            :close-button="{ color: 'white' }"
            @close="notification = ''"
          />
        </div>
      </div>
    </div>
  </UApp>
</template>

<script setup lang="ts">
const notification = ref<string>('')

const handleButtonClick = (message: string) => {
  notification.value = message
  
  // Clear notification after 3 seconds
  setTimeout(() => {
    notification.value = ''
  }, 3000)
}

// SEO
useHead({
  title: 'Nuxt 3 Custom Components Demo',
  meta: [
    { name: 'description', content: 'Testing custom Vue components with TypeScript in Nuxt 3' }
  ]
})
</script>

<template>
  <div class="font-sans antialiased text-slate-900 bg-slate-50 min-h-screen">

    <div v-if="!isAppReady" class="flex h-screen w-full items-center justify-center bg-white">
      <div class="flex flex-col items-center gap-3">
        <Loader2 class="h-10 w-10 animate-spin text-slate-900" />
        <p class="text-sm text-slate-500 font-medium animate-pulse">初始化应用中...</p>
      </div>
    </div>

    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
    <Toaster></Toaster>
  </div>
</template>
<script setup lang="ts">
import { Loader2 } from 'lucide-vue-next'
import { Toaster } from 'vue-sonner'
import 'vue-sonner/style.css'


const user = useSupabaseUser()
const { initOrg, currentOrg } = useOrg()


const isAppReady = ref(false)

onMounted(async () => {
  if (user.value) {
    await initOrg()
  }

  isAppReady.value = true
})

watch(user, async (newUser) => {
  if (newUser) {
    if (!currentOrg.value) {
      await initOrg()
    }
  }
})
</script>
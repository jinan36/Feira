<script setup>
import { Loader2 } from 'lucide-vue-next'

const user = useSupabaseUser()

// 监听用户状态，一旦获取到 user，立即跳回首页
watch(user, () => {
  if (user.value) {
    return navigateTo('/')
  }
}, { immediate: true })

// 禁用布局
definePageMeta({
  layout: false
})
</script>

<template>
  <div class="flex flex-col items-center justify-center min-h-screen bg-slate-50 space-y-4">
    <Loader2 class="h-10 w-10 animate-spin text-primary" />

    <div class="text-center space-y-1">
      <h2 class="text-lg font-medium text-slate-900">正在验证身份</h2>
      <p class="text-sm text-slate-500">即将进入系统...</p>
    </div>
  </div>
</template>
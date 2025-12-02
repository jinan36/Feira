<script setup>
const user = useSupabaseUser()

// 核心逻辑：
// 页面一加载，Supabase 客户端会自动解析 URL 里的 #access_token...
// 我们只需要监听：一旦 user 变成了“有值”的状态，立马跳去首页
watch(user, () => {
  if (user.value) {
    return navigateTo('/') // Nuxt 的跳转方法
  }
}, { immediate: true })
</script>

<template>
  <div style="padding: 50px; text-align: center;">
    <p>正在验证身份，请稍候...</p>
    </div>
</template>
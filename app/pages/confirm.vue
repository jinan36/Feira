<script setup>
const user = useSupabaseUser()
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
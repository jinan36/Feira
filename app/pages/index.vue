<script setup>
const user = useSupabaseUser() // Nuxt 直接提供的钩子，这就是当前用户
const supabase = useSupabaseClient()

const logout = async () => {
  await supabase.auth.signOut()
  // 退出后，Nuxt 的中间件会自动检测到没用户了，把你踢回 /login
  // 所以这里不需要手动 router.push
}
</script>

<template>
  <div style="padding: 50px;">
    <h1>登录成功！🎉</h1>
    <p>当前用户邮箱: {{ user?.email }}</p>
    
    <button 
      @click="logout"
      style="margin-top: 20px; padding: 8px 16px; cursor: pointer;"
    >
      退出登录
    </button>
  </div>
</template>
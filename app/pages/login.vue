<script setup>
const supabase = useSupabaseClient()

const login = async () => {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: window.location.origin + '/confirm',
    },
  })
  if (error) console.error(error)
}
</script>

<template>
  <div style="padding: 50px; text-align: center;">
    <h1>请登录</h1>
    <p>点击下方按钮进行 Google 验证</p>
    
    <button 
      @click="login" 
      style="padding: 10px 20px; font-size: 16px; cursor: pointer;"
    >
      Google 登录
    </button>
  </div>
</template>
<script setup>
import { Layers, ArrowRight } from 'lucide-vue-next'

const supabase = useSupabaseClient()
const loading = ref(false)

const handleLogin = async () => {
  loading.value = true
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: window.location.origin + '/confirm',
    },
  })
  if (error) {
    loading.value = false
    alert(error.message)
  }
}

// 禁用默认布局（不需要底部导航）
definePageMeta({
  layout: false
})
</script>

<template>
  <div class="relative min-h-screen flex flex-col justify-center overflow-hidden bg-white selection:bg-slate-200">

    <div
      class="absolute inset-0 -z-10 h-full w-full bg-white bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)]">
    </div>

    <div class="container relative z-10 mx-auto max-w-lg px-6">

      <div class="mb-10 flex flex-col items-center text-center">
        <div
          class="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-900 shadow-xl shadow-slate-200 ring-1 ring-slate-900/5">
          <Layers class="h-8 w-8 text-white" stroke-width="1.5" />
        </div>
        <h1 class="mb-2 text-4xl font-bold tracking-tight text-slate-900 font-logo">
          FEIRA
        </h1>
      </div>

      <div class="space-y-4">
        <button @click="handleLogin" :disabled="loading"
          class="group relative flex h-14 w-full items-center justify-center gap-3 rounded-xl bg-white border border-slate-200 px-6 text-base font-medium text-slate-700 transition-all hover:border-slate-300 hover:bg-slate-50 hover:shadow-md active:scale-[0.98] disabled:opacity-70">
          <svg class="h-5 w-5" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img"
            xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512">
            <path fill="currentColor"
              d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z">
            </path>
          </svg>
          <span>{{ loading ? '正在连接...' : '使用 Google 账号登录' }}</span>
          <ArrowRight
            class="absolute right-4 h-4 w-4 opacity-0 transition-all group-hover:translate-x-1 group-hover:opacity-50" />
        </button>

        <div class="relative py-4">
          <div class="absolute inset-0 flex items-center">
            <span class="w-full border-t border-slate-200" />
          </div>
          <div class="relative flex justify-center text-xs uppercase">
            <span class="bg-white px-2 text-slate-400 font-medium tracking-wider">Secure Access</span>
          </div>
        </div>
      </div>

      <div class="mt-10 text-center">
        <p class="text-xs text-slate-400">
          点击登录即代表您同意 <a href="#" class="underline decoration-slate-300 underline-offset-2 hover:text-slate-600">服务条款</a>
          和 <a href="#" class="underline decoration-slate-300 underline-offset-2 hover:text-slate-600">隐私政策</a>
        </p>
      </div>

    </div>
  </div>
</template>
<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@700&display=swap');

.font-logo {
  font-family: 'Outfit', sans-serif;
}
</style>
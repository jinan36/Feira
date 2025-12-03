<template>
  <div class="font-sans antialiased text-slate-900 bg-slate-50 min-h-screen">
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
    <Toaster></Toaster>
  </div>
</template>
<script setup lang="ts">
import { Toaster } from 'vue-sonner'
import 'vue-sonner/style.css'
</script>
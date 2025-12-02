<script setup>
import { ClipboardList, PackageSearch, BarChart3, UserCog } from 'lucide-vue-next'

const route = useRoute()

// 定义四个 Tab
const tabs = [
    { name: '清单', path: '/', icon: ClipboardList },
    { name: '库房', path: '/products', icon: PackageSearch }, // 这个页面还没做
    { name: '报表', path: '/stats', icon: BarChart3 },      // 这个也没做
    { name: '我的', path: '/profile', icon: UserCog }       // 也没做
]
</script>

<template>
    <div class="flex flex-col h-dvh bg-slate-50 overflow-hidden">

        <main class="flex-1 overflow-y-auto scroll-smooth">
            <slot />
        </main>

        <nav class="border-t border-slate-200 bg-white pb-safe z-50 flex-shrink-0">
            <div class="flex items-center justify-around h-16">
                <NuxtLink v-for="tab in tabs" :key="tab.path" :to="tab.path"
                    class="flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors active:scale-95"
                    :class="route.path === tab.path ? 'text-slate-900' : 'text-slate-400 hover:text-slate-600'">
                    <component :is="tab.icon" :size="24" :stroke-width="route.path === tab.path ? 2.5 : 2" />
                    <span class="text-[10px] font-medium">{{ tab.name }}</span>
                </NuxtLink>
            </div>
        </nav>

    </div>
</template>

<style scoped>
/* 适配 iPhone 底部小黑条 */
.pb-safe {
    padding-bottom: env(safe-area-inset-bottom);
}
</style>
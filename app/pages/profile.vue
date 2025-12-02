<script setup>
import {
    Building2,
    LogOut,
    Plus,
    Store,
    UserCircle2 // 引入一个用户图标用于显示账号
} from 'lucide-vue-next'

// ... (原有的 script 逻辑部分保持不变)
const user = useSupabaseUser()
const supabase = useSupabaseClient()
const { currentOrg, initOrg, loading: orgLoading } = useOrg()
const { vendors, loading: vendorLoading, fetchVendors, createVendor, deleteVendor } = useVendors()

// 状态
const isVendorDialogOpen = ref(false)
const newVendorName = ref('')

// 初始化
onMounted(async () => {
    if (!currentOrg.value) await initOrg()
    if (currentOrg.value?.id) fetchVendors()
})

watch(currentOrg, (newVal) => {
    if (newVal?.id) fetchVendors()
})

const handleAddVendor = async () => {
    if (!newVendorName.value.trim()) return
    const success = await createVendor(newVendorName.value)
    if (success) {
        isVendorDialogOpen.value = false
        newVendorName.value = ''
    }
}

const handleLogout = async () => {
    await supabase.auth.signOut()
    navigateTo('/login')
}
</script>

<template>
    <div class="relative flex-1 p-6 selection:bg-slate-200">

        <div
            class="fixed inset-0 -z-10 h-full w-full bg-white bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)]">
        </div>

        <div class="max-w-lg mx-auto">

            <div class="space-y-10">

                <section class="space-y-4">
                    <h3 class="text-sm font-semibold text-slate-500 uppercase tracking-wider px-1">
                        工作空间
                    </h3>

                    <div
                        class="bg-white rounded-2xl border border-slate-100/80 shadow-sm p-5 flex items-center gap-5 transition-shadow hover:shadow-md">
                        <div
                            class="h-14 w-14 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
                            <Building2 class="w-7 h-7" stroke-width="1.5" />
                        </div>

                        <div class="flex-1 min-w-0">
                            <div v-if="orgLoading" class="space-y-2 animate-pulse">
                                <div class="h-6 w-32 bg-slate-200 rounded"></div>
                                <div class="h-4 w-24 bg-slate-100 rounded"></div>
                            </div>
                            <div v-else>
                                <div class="flex items-center gap-2 mb-1">
                                    <h2 class="text-xl font-bold text-slate-900 truncate">
                                        {{ currentOrg?.name || '未加载组织' }}
                                    </h2>
                                    <Badge variant="secondary"
                                        class="bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-100">
                                        Owner
                                    </Badge>
                                </div>
                                <p class="text-xs text-slate-400 font-mono leading-tight truncate">
                                    ID: {{ currentOrg?.id }}
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                <section class="space-y-4">
                    <div class="flex items-center justify-between px-1">
                        <h3 class="text-sm font-semibold text-slate-500 uppercase tracking-wider">
                            供应商管理
                        </h3>
                        <button @click="isVendorDialogOpen = true"
                            class="group flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors px-3 py-1.5 rounded-lg hover:bg-blue-50">
                            <Plus class="w-4 h-4 transition-transform group-hover:rotate-90" />
                            <span>新建</span>
                        </button>
                    </div>

                    <div class="bg-white rounded-2xl border border-slate-100/80 shadow-sm overflow-hidden">
                        <div v-if="vendorLoading" class="p-8 flex justify-center">
                            <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900"></div>
                        </div>

                        <div v-else-if="vendors.length === 0" class="py-12 px-6 text-center">
                            <div
                                class="h-20 w-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 shadow-inner">
                                <Store class="w-10 h-10 text-slate-300" stroke-width="1.5" />
                            </div>
                            <h4 class="text-base font-semibold text-slate-900 mb-2">还没有供应商</h4>
                            <p class="text-sm text-slate-500 max-w-xs mx-auto leading-relaxed">
                                添加您常去的采购地点（如超市、菜市场），以便在库房录入商品。
                            </p>
                        </div>

                        <div v-else class="divide-y divide-slate-50">
                            <div v-for="vendor in vendors" :key="vendor.id"
                                class="group flex items-center justify-between p-4 hover:bg-slate-50 transition-colors">
                                <div class="flex items-center gap-3">
                                    <div
                                        class="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 text-xs font-bold">
                                        {{ vendor.name.charAt(0).toUpperCase() }}
                                    </div>
                                    <span class="text-sm font-medium text-slate-700">{{ vendor.name }}</span>
                                </div>

                                <button @click="deleteVendor(vendor.id)"
                                    class="text-slate-300 hover:text-red-500 p-2 opacity-0 group-hover:opacity-100 transition-all">
                                    <Trash2 class="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                </section>
            </div>

            <div class="mt-4 space-y-6">

                <div
                    class="flex items-center justify-center gap-2 text-sm text-slate-500 bg-slate-50 py-3 rounded-xl border border-slate-100">
                    <UserCircle2 class="w-4 h-4" />
                    <span>当前登录：<span class="font-medium text-slate-700">{{ user?.email }}</span></span>
                </div>

                <button @click="handleLogout"
                    class="group relative flex h-14 w-full items-center justify-center gap-3 rounded-xl bg-slate-900 text-base font-medium text-white transition-all hover:bg-slate-800 hover:shadow-lg hover:shadow-slate-900/20 active:scale-[0.95]">
                    <LogOut class="w-5 h-5 transition-transform group-hover:-translate-x-1" />
                    <span>退出登录</span>
                </button>

                <p class="text-center text-[10px] text-slate-400 font-mono uppercase tracking-widest">
                    FEIRA v1.0.0
                </p>
            </div>

        </div>

    </div>
</template>
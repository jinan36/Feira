<script setup>
import {
    Building2,
    LogOut,
    Plus,
    Store,
    UserCircle2,
    ArrowLeftRight,
    Trash2
} from 'lucide-vue-next'

// 引入 Drawer 组件
import {
    Drawer,
    DrawerContent,
    DrawerHeader,
    DrawerTitle,
    DrawerDescription,
    DrawerFooter,
    DrawerClose
} from '@/components/ui/drawer'

const user = useSupabaseUser()
const supabase = useSupabaseClient()
const { currentOrg, initOrg, loading: orgLoading } = useOrg()
const { vendors, loading: vendorLoading, fetchVendors, createVendor, deleteVendor } = useVendors()

// 状态
const isVendorDialogOpen = ref(false)
const newVendorName = ref('')

// 删除确认弹窗状态
const isDeleteDialogOpen = ref(false)
const vendorToDelete = ref(null)

onMounted(async () => {
    if (!currentOrg.value) await initOrg()
    if (currentOrg.value?.id) fetchVendors()
})

watch(currentOrg, (newVal) => {
    if (newVal?.id) fetchVendors()
})

// 添加供应商
const handleAddVendor = async () => {
    if (!newVendorName.value.trim()) return
    const success = await createVendor(newVendorName.value)
    if (success) {
        isVendorDialogOpen.value = false
        newVendorName.value = ''
    }
}

// 打开删除确认框
const openDeleteConfirm = (vendor) => {
    vendorToDelete.value = vendor
    isDeleteDialogOpen.value = true
}

// 执行删除
const confirmDelete = async () => {
    if (vendorToDelete.value) {
        await deleteVendor(vendorToDelete.value.id)
        isDeleteDialogOpen.value = false
        vendorToDelete.value = null
    }
}

const handleLogout = async () => {
    await supabase.auth.signOut()
    navigateTo('/login')
}
</script>

<template>
    <div class="relative flex-1 p-6 pt-12 selection:bg-slate-200">

        <div
            class="fixed inset-0 -z-10 h-full w-full bg-white bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)]">
        </div>

        <div class="max-w-lg mx-auto space-y-10">

            <section class="space-y-3">
                <h3 class="text-xs font-semibold text-slate-400 uppercase tracking-wider px-1">
                    当前组织
                </h3>

                <div class="px-1">
                    <div v-if="orgLoading" class="flex items-center justify-between">
                        <div class="space-y-2">
                            <Skeleton class="h-9 w-48" />
                            <Skeleton class="h-4 w-24" />
                        </div>
                        <Skeleton class="h-9 w-9 rounded-full" />
                    </div>

                    <div v-else class="flex items-center justify-between gap-4">
                        <div class="flex-1 min-w-0">
                            <h2 class="text-3xl font-extrabold text-slate-900 tracking-tight leading-none truncate">
                                {{ currentOrg?.name || '未加载' }}
                            </h2>
                            <div class="flex items-center gap-2 mt-2">
                                <Badge variant="secondary"
                                    class="bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-100 rounded-sm px-1.5 h-5 text-[10px]">
                                    Owner
                                </Badge>
                                <p class="text-xs text-slate-400 font-mono">
                                    ID: {{ currentOrg?.id?.slice(0, 8) }}...
                                </p>
                            </div>
                        </div>

                        <Button variant="outline" size="icon" class="rounded-full h-9 w-9 shrink-0">
                            <ArrowLeftRight class="w-4 h-4 text-slate-500" />
                        </Button>
                    </div>
                </div>
            </section>

            <section class="space-y-4">
                <div class="flex items-center justify-between px-1">
                    <h3 class="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                        供应商管理
                    </h3>
                    <Button variant="ghost" size="sm"
                        class="text-blue-600 hover:text-blue-700 hover:bg-blue-50 h-8 px-2"
                        @click="isVendorDialogOpen = true">
                        <Plus class="w-4 h-4 mr-1" />
                        新建
                    </Button>
                </div>

                <Card class="border-slate-100 shadow-sm overflow-hidden">
                    <div v-if="vendorLoading" class="p-6 space-y-4">
                        <div class="flex items-center justify-between" v-for="i in 3" :key="i">
                            <div class="flex items-center gap-3">
                                <Skeleton class="h-9 w-9 rounded-full" />
                                <Skeleton class="h-4 w-32" />
                            </div>
                            <Skeleton class="h-8 w-8 rounded-md" />
                        </div>
                    </div>

                    <div v-else-if="vendors.length === 0" class="py-12 px-6 text-center">
                        <div
                            class="h-20 w-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 shadow-inner">
                            <Store class="w-10 h-10 text-slate-300" stroke-width="1.5" />
                        </div>
                        <h4 class="text-base font-semibold text-slate-900 mb-2">还没有供应商</h4>
                        <p class="text-sm text-slate-500 max-w-xs mx-auto leading-relaxed">
                            添加您常去的采购地点，以便录入商品。
                        </p>
                    </div>

                    <div v-else class="divide-y divide-slate-50">
                        <div v-for="vendor in vendors" :key="vendor.id"
                            class="flex items-center justify-between p-4 hover:bg-slate-50 transition-colors group">
                            <div class="flex items-center gap-3">
                                <div
                                    class="h-9 w-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 text-sm font-bold shadow-sm">
                                    {{ vendor.name.charAt(0).toUpperCase() }}
                                </div>
                                <span class="text-sm font-medium text-slate-700">{{ vendor.name }}</span>
                            </div>

                            <Button variant="ghost" size="icon"
                                class="h-8 w-8 text-slate-300 hover:text-red-600 hover:bg-red-50"
                                @click="openDeleteConfirm(vendor)">
                                <Trash2 class="w-4 h-4" />
                            </Button>
                        </div>
                    </div>
                </Card>
            </section>

            <div class="space-y-4 pb-10">
                <div class="flex items-center justify-center gap-2 text-xs text-slate-400">
                    <UserCircle2 class="w-3 h-3" />
                    <span>{{ user?.email }}</span>
                </div>

                <Button size="lg" class="w-full h-14 text-base font-medium rounded-xl shadow-lg shadow-slate-900/10"
                    @click="handleLogout">
                    <LogOut class="w-5 h-5 mr-2" />
                    退出登录
                </Button>

                <p class="text-center text-[10px] text-slate-300 font-mono uppercase tracking-widest pt-2">
                    FEIRA v1.0.0
                </p>
            </div>

        </div>

        <Drawer :open="isVendorDialogOpen" @update:open="isVendorDialogOpen = $event">
            <DrawerContent>
                <div class="mx-auto w-full max-w-sm">
                    <DrawerHeader>
                        <DrawerTitle class="text-xl font-bold">添加供应商</DrawerTitle>
                        <DrawerDescription>输入供应商名称，如：Atacadão</DrawerDescription>
                    </DrawerHeader>

                    <div class="p-4 pb-0 space-y-4">
                        <Input v-model="newVendorName" placeholder="例如: Atacadão" class="h-14 text-lg" />
                    </div>

                    <DrawerFooter>
                        <Button @click="handleAddVendor" :disabled="!newVendorName" class="w-full h-12 text-base">
                            确认添加
                        </Button>
                        <DrawerClose @click="newVendorName = ''" as-child>
                            <Button variant="outline" class="h-12">取消</Button>
                        </DrawerClose>
                    </DrawerFooter>
                </div>
            </DrawerContent>
        </Drawer>

        <AlertDialog :open="isDeleteDialogOpen" @update:open="isDeleteDialogOpen = $event">
            <AlertDialogContent class="max-w-[90%] rounded-2xl sm:max-w-[425px]">
                <AlertDialogHeader>
                    <AlertDialogTitle>确定要删除吗？</AlertDialogTitle>
                    <AlertDialogDescription>
                        您正在删除供应商 <span class="font-bold text-slate-900">“{{ vendorToDelete?.name }}”</span>。<br>
                        如果该供应商下有关联的商品，删除可能会失败。
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>取消</AlertDialogCancel>
                    <AlertDialogAction @click="confirmDelete"
                        class="bg-red-600 hover:bg-red-700 text-white border-none">
                        确认删除
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>

    </div>
</template>
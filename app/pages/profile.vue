<script setup>
import {
    LogOut, Plus, Store, UserCircle2, ArrowLeftRight, Trash2,
    Check, Users,
    ChevronRight
} from 'lucide-vue-next'
import {
    Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription, DrawerFooter, DrawerClose
} from '@/components/ui/drawer'

const user = useSupabaseUser()
const supabase = useSupabaseClient()

// 引入 Composable
const { currentOrg, myOrgs, loading: orgLoading, initOrg, switchOrg, createOrg } = useOrg()
const { members: orgMembers, fetchMembers } = useMembers()
const { vendors, loading: vendorLoading, fetchVendors, createVendor, deleteVendor } = useVendors()

// 状态管理
const showSwitchDrawer = ref(false)  // 切换组织抽屉
const isVendorDialogOpen = ref(false)// 供应商抽屉
const isDeleteDialogOpen = ref(false)// 删除确认弹窗

// 表单输入
const newVendorName = ref('')
const newOrgName = ref('')
const vendorToDelete = ref(null)
const isCreatingOrgMode = ref(false) // 切换抽屉里的视图状态

// 初始化加载
onMounted(async () => {
    if (currentOrg.value?.id) {
        fetchVendors()
        if (orgMembers.value.length === 0) fetchMembers()
    }
})

watch(currentOrg, (newVal) => {
    if (newVal?.id) {
        fetchVendors()
        fetchMembers()
    }
})

const handleAddVendor = async () => {
    if (!newVendorName.value.trim()) return
    const success = await createVendor(newVendorName.value)
    if (success) {
        isVendorDialogOpen.value = false
        newVendorName.value = ''
    }
}

const openDeleteConfirm = (vendor) => {
    vendorToDelete.value = vendor
    isDeleteDialogOpen.value = true
}
const confirmDelete = async () => {
    if (vendorToDelete.value) {
        await deleteVendor(vendorToDelete.value.id)
        isDeleteDialogOpen.value = false
        vendorToDelete.value = null
    }
}

const handleCreateOrg = async () => {
    if (!newOrgName.value.trim()) return
    const success = await createOrg(newOrgName.value.trim())
    if (success) {
        showSwitchDrawer.value = false
        newOrgName.value = ''
        isCreatingOrgMode.value = false
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

        <div class="max-w-lg mx-auto space-y-6">

            <section class="space-y-3">
                <h3 class="text-xs font-semibold text-slate-400 uppercase tracking-wider px-1">
                    当前组织
                </h3>

                <div class="px-1">
                    <div v-if="orgLoading" class="flex justify-between items-center">
                        <div class="space-y-2">
                            <Skeleton class="h-8 w-40" />
                            <Skeleton class="h-4 w-24" />
                        </div>
                        <Skeleton class="h-10 w-10 rounded-full" />
                    </div>

                    <div v-else class="flex items-center justify-between gap-4">
                        <div class="flex-1 min-w-0">
                            <h2 class="text-3xl font-extrabold text-slate-900 tracking-tight leading-none truncate">
                                {{ currentOrg?.name || '未加载' }}
                            </h2>
                            <div class="flex items-center gap-2 mt-2">
                                <Badge variant="outline"
                                    class="text-[10px] h-5 px-1.5 border-blue-200 bg-blue-50 text-blue-700 font-medium">
                                    Owner
                                </Badge>
                                <p class="text-xs text-slate-400 font-mono">
                                    ID: {{ currentOrg?.id?.slice(0, 8) }}...
                                </p>
                            </div>
                        </div>

                        <button @click="showSwitchDrawer = true"
                            class="group flex items-center justify-center h-10 w-10 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-900 hover:text-white transition-all active:scale-95 shadow-sm"
                            title="切换组织">
                            <ArrowLeftRight class="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </section>

            <section v-if="!currentOrg?.is_personal" class="space-y-3">
                <h3 class="text-xs font-semibold text-slate-400 uppercase tracking-wider px-1">
                    管理
                </h3>

                <div
                    class="bg-white rounded-xl border border-slate-100/80 shadow-sm overflow-hidden divide-y divide-slate-50">

                    <NuxtLink to="/members"
                        class="flex items-center justify-between p-4 active:bg-slate-50 transition-colors group">
                        <div class="flex items-center gap-3">
                            <div class="h-9 w-9 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
                                <Users class="w-5 h-5" />
                            </div>
                            <span class="text-sm font-medium text-slate-700">团队成员</span>
                        </div>

                        <div class="flex items-center gap-2">
                            <span class="text-xs text-slate-400">{{ orgMembers.length }} 人</span>
                            <ChevronRight class="w-4 h-4 text-slate-300 group-hover:text-slate-400" />
                        </div>
                    </NuxtLink>

                </div>
            </section>

            <section class="space-y-4">
                <div class="flex items-center justify-between px-1">
                    <h3 class="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                        供应商
                    </h3>
                    <button @click="isVendorDialogOpen = true"
                        class="group flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors rounded-lg hover:bg-blue-50">
                        <Plus class="w-4 h-4 transition-transform group-hover:rotate-90" />
                        <span>新建</span>
                    </button>
                </div>

                <div class="rounded-xl border-slate-100 shadow-sm overflow-hidden bg-white">
                    <div v-if="vendorLoading" class="p-6 space-y-4">
                        <div class="flex items-center justify-between" v-for="i in 2" :key="i">
                            <div class="flex items-center gap-3">
                                <Skeleton class="h-9 w-9 rounded-full" />
                                <Skeleton class="h-4 w-24" />
                            </div>
                            <Skeleton class="h-8 w-8 rounded-md" />
                        </div>
                    </div>

                    <div v-else-if="vendors.length === 0" class="py-10 px-6 text-center">
                        <div
                            class="h-16 w-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-3 shadow-inner">
                            <Store class="w-8 h-8 text-slate-300" stroke-width="1.5" />
                        </div>
                        <p class="text-sm text-slate-500 max-w-xs mx-auto">
                            暂无供应商，点击右上角添加。
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

                            <button @click="openDeleteConfirm(vendor)"
                                class="p-2 text-slate-300 transition-colors hover:text-red-500 hover:bg-red-50 rounded-full">
                                <Trash2 class="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            <div class="space-y-4">
                <div class="flex items-center justify-center gap-2 text-xs text-slate-400">
                    <UserCircle2 class="w-3 h-3" />
                    <span>{{ user?.email }}</span>
                </div>

                <Button size="lg"
                    class="w-full h-14 text-base font-medium rounded-xl shadow-lg shadow-slate-900/10 bg-slate-900 hover:bg-slate-800"
                    @click="handleLogout">
                    <LogOut class="w-5 h-5 mr-2" />
                    退出登录
                </Button>

                <p class="text-center text-[10px] text-slate-300 font-mono uppercase tracking-widest pt-2">
                    FEIRA v1.0.0
                </p>
            </div>

        </div>

        <Drawer :open="showSwitchDrawer" @update:open="showSwitchDrawer = $event">
            <DrawerContent>
                <div class="mx-auto w-full max-w-sm">
                    <DrawerHeader>
                        <DrawerTitle>{{ isCreatingOrgMode ? '创建新组织' : '切换组织' }}</DrawerTitle>
                    </DrawerHeader>

                    <div class="p-4 pt-0 space-y-4">
                        <div v-if="!isCreatingOrgMode" class="space-y-2">
                            <div v-for="org in myOrgs" :key="org.id"
                                @click="switchOrg(org.id); showSwitchDrawer = false;"
                                class="flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-all active:scale-95"
                                :class="org.id === currentOrg?.id ? 'bg-slate-900 text-white border-slate-900 shadow-md' : 'bg-white text-slate-700 border-slate-100 hover:border-slate-300'">
                                <div class="flex flex-col">
                                    <span class="font-bold text-sm">{{ org.name }}</span>
                                    <span class="text-[10px] opacity-60 font-mono">ID: {{ org.id.slice(0, 4) }}</span>
                                </div>
                                <Check v-if="org.id === currentOrg?.id" class="w-5 h-5" />
                            </div>
                        </div>
                        <div v-else class="space-y-4">
                            <Input v-model="newOrgName" placeholder="组织名称" class="h-12 text-lg" auto-focus />
                        </div>
                    </div>
                    <DrawerFooter>
                        <template v-if="!isCreatingOrgMode">
                            <Button @click="isCreatingOrgMode = true" size="lg">
                                <Plus class="w-4 h-4" /> 创建新组织
                            </Button>
                            <DrawerClose as-child>
                                <Button variant="outline" size="lg">取消</Button>
                            </DrawerClose>
                        </template>
                        <template v-else>
                            <Button size="lg" :disabled="!newOrgName" @click="handleCreateOrg">创建</Button>
                            <Button size="lg" variant="outline" @click="isCreatingOrgMode = false">取消</Button>
                        </template>
                    </DrawerFooter>
                </div>
            </DrawerContent>
        </Drawer>

        <Drawer :open="isVendorDialogOpen" @update:open="isVendorDialogOpen = $event">
            <DrawerContent>
                <div class="mx-auto w-full max-w-sm">
                    <DrawerHeader>
                        <DrawerTitle>添加供应商</DrawerTitle>
                        <DrawerDescription>输入名称</DrawerDescription>
                    </DrawerHeader>
                    <div class="p-4 space-y-4">
                        <Input v-model.trim="newVendorName" placeholder="例如: Atacadão" class="h-12 text-lg"
                            @keyup.enter="handleAddVendor" />
                    </div>
                    <DrawerFooter>
                        <Button @click="handleAddVendor" :disabled="!newVendorName"
                            class="w-full h-12 bg-slate-900">确认添加</Button>
                        <DrawerClose as-child>
                            <Button class="w-full h-12" variant="outline">
                                取消
                            </Button>
                        </DrawerClose>
                    </DrawerFooter>
                </div>
            </DrawerContent>
        </Drawer>

        <AlertDialog :open="isDeleteDialogOpen" @update:open="isDeleteDialogOpen = $event">
            <AlertDialogContent class="max-w-[90%] rounded-2xl">
                <AlertDialogHeader>
                    <AlertDialogTitle>确定要删除吗？</AlertDialogTitle>
                    <AlertDialogDescription>
                        如果该供应商下有关联商品，删除可能会失败。
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>取消</AlertDialogCancel>
                    <AlertDialogAction @click="confirmDelete" class="bg-red-600 hover:bg-red-700 border-none">确认删除
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>

    </div>
</template>
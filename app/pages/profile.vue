<script setup>
import {
    Building2, LogOut, Plus, Store, UserCircle2, ArrowLeftRight, Trash2,
    Check, Users, Info
} from 'lucide-vue-next'
import {
    Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription, DrawerFooter, DrawerClose
} from '@/components/ui/drawer'

const user = useSupabaseUser()
const supabase = useSupabaseClient()

// 引入 Composable
const { currentOrg, myOrgs, orgMembers, loading: orgLoading, initOrg, switchOrg, createOrg, fetchMembers, inviteMember } = useOrg()
const { vendors, loading: vendorLoading, fetchVendors, createVendor, deleteVendor } = useVendors()

// 状态管理
const showSwitchDrawer = ref(false)  // 切换组织抽屉
const showInviteDrawer = ref(false)  // 邀请成员抽屉
const isVendorDialogOpen = ref(false)// 供应商抽屉
const isDeleteDialogOpen = ref(false)// 删除确认弹窗

// 表单输入
const newVendorName = ref('')
const newOrgName = ref('')
const inviteEmail = ref('')
const vendorToDelete = ref(null)
const isCreatingOrgMode = ref(false) // 切换抽屉里的视图状态

// 初始化加载
onMounted(async () => {
    if (!currentOrg.value) await initOrg()
    if (currentOrg.value?.id) {
        fetchVendors()
        // 确保成员列表也加载了
        if (orgMembers.value.length === 0) fetchMembers()
    }
})

// 监听组织变化，重新拉取数据
watch(currentOrg, (newVal) => {
    if (newVal?.id) {
        fetchVendors()
        fetchMembers()
    }
})

// --- 动作处理 ---

// 1. 添加供应商
const handleAddVendor = async () => {
    if (!newVendorName.value.trim()) return
    const success = await createVendor(newVendorName.value)
    if (success) {
        isVendorDialogOpen.value = false
        newVendorName.value = ''
    }
}

// 2. 删除供应商确认
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

// 3. 创建新组织
const handleCreateOrg = async () => {
    if (!newOrgName.value.trim()) return
    const success = await createOrg(newOrgName.value.trim())
    if (success) {
        showSwitchDrawer.value = false
        newOrgName.value = ''
        isCreatingOrgMode.value = false // 重置回列表视图
    }
}

// 4. 邀请成员
const handleInvite = async () => {
    if (!inviteEmail.value.trim()) return
    const res = await inviteMember(inviteEmail.value.trim())
    if (res.success) {
        showInviteDrawer.value = false
        inviteEmail.value = ''
        alert('邀请成功！')
    } else {
        alert(res.msg)
    }
}

// 5. 退出登录
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

        <div class="max-w-lg mx-auto space-y-12">

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

            <section class="space-y-3">
                <div class="flex items-center justify-between px-1">
                    <h3 class="text-xs font-semibold text-slate-400 uppercase tracking-wider">团队成员</h3>

                    <button v-if="!currentOrg?.is_personal" @click="showInviteDrawer = true"
                        class="text-blue-600 text-xs flex items-center font-medium transition-opacity hover:opacity-80">
                        <Plus class="w-3 h-3 mr-1" /> 邀请
                    </button>
                    <span v-else class="text-[10px] text-slate-300 bg-slate-50 px-2 py-0.5 rounded-full">个人空间</span>
                </div>

                <div class="flex items-center gap-3 overflow-x-auto py-2 px-1 scrollbar-hide">
                    <div v-for="m in orgMembers" :key="m.id" class="flex flex-col items-center gap-1 min-w-[56px]">
                        <Avatar class="h-12 w-12 border-2 border-white shadow-sm ring-1 ring-slate-100">
                            <AvatarImage :src="m.profiles?.avatar_url" />
                            <AvatarFallback class="bg-slate-100 text-slate-600 font-bold">
                                {{ m.profiles?.full_name?.charAt(0).toUpperCase() || 'U' }}
                            </AvatarFallback>
                        </Avatar>
                        <span class="text-[10px] text-slate-500 truncate w-16 text-center">
                            {{ m.profiles?.full_name || '成员' }}
                        </span>
                    </div>
                </div>
            </section>

            <section class="space-y-4">
                <div class="flex items-center justify-between px-1">
                    <h3 class="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                        供应商
                    </h3>
                    <button @click="isVendorDialogOpen = true"
                        class="group flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors px-3 py-1.5 rounded-lg hover:bg-blue-50">
                        <Plus class="w-4 h-4 transition-transform group-hover:rotate-90" />
                        <span>新建</span>
                    </button>
                </div>

                <Card class="border-slate-100 shadow-sm overflow-hidden bg-white">
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
                </Card>
            </section>

            <div class="space-y-4 pb-10">
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
                        <DrawerDescription v-if="isCreatingOrgMode">输入新组织的名称</DrawerDescription>
                    </DrawerHeader>

                    <div class="p-4 space-y-4">
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

                            <button @click="isCreatingOrgMode = true"
                                class="w-full py-3 mt-4 text-sm font-medium text-slate-500 border border-dashed border-slate-300 rounded-xl hover:bg-slate-50 flex items-center justify-center gap-2 active:bg-slate-100">
                                <Plus class="w-4 h-4" /> 创建新组织
                            </button>
                        </div>

                        <div v-else class="space-y-4">
                            <Input v-model="newOrgName" placeholder="例如: 第二分店" class="h-12 text-lg" auto-focus />
                            <div class="flex gap-3">
                                <Button variant="outline" class="flex-1 h-12"
                                    @click="isCreatingOrgMode = false">取消</Button>
                                <Button class="flex-1 h-12 bg-slate-900" :disabled="!newOrgName"
                                    @click="handleCreateOrg">创建</Button>
                            </div>
                        </div>
                    </div>
                </div>
            </DrawerContent>
        </Drawer>

        <Drawer :open="showInviteDrawer" @update:open="showInviteDrawer = $event">
            <DrawerContent>
                <div class="mx-auto w-full max-w-sm">
                    <DrawerHeader>
                        <DrawerTitle>邀请成员</DrawerTitle>
                        <DrawerDescription>输入对方注册时的邮箱地址</DrawerDescription>
                    </DrawerHeader>
                    <div class="p-4 space-y-4">
                        <div class="p-3 bg-blue-50 text-blue-700 text-xs rounded-lg flex gap-2">
                            <Info class="w-4 h-4 shrink-0" />
                            <p>对方必须已经使用 Google 登录过本 App，否则无法邀请。</p>
                        </div>
                        <Input v-model="inviteEmail" placeholder="例如: partner@gmail.com" class="h-12 text-lg" />
                        <Button class="w-full h-12 bg-slate-900" :disabled="!inviteEmail"
                            @click="handleInvite">发送邀请</Button>
                    </div>
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
                        <Input v-model="newVendorName" placeholder="例如: Atacadão" class="h-12 text-lg"
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
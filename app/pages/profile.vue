<script setup>
import {
  LogOut,
  Plus,
  Store,
  UserCircle2,
  ArrowLeftRight,
  Trash2,
  Check,
  Users,
  ChevronRight
} from 'lucide-vue-next'
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

// 引入 Composable
const { currentOrg, myOrgs, loading: orgLoading, switchOrg, createOrg } = useOrg()
const { members: orgMembers, fetchMembers } = useMembers()
const { vendors, loading: vendorLoading, fetchVendors, createVendor, deleteVendor } = useVendors()

// 状态管理
const showSwitchDrawer = ref(false) // 切换组织抽屉
const isVendorDialogOpen = ref(false) // 供应商抽屉
const isDeleteDialogOpen = ref(false) // 删除确认弹窗

// 表单输入
const newVendorName = ref('')
const newOrgName = ref('')
const vendorToDelete = ref(null)
const isCreatingOrgMode = ref(false) // 切换抽屉里的视图状态

const runtimeConfig = useRuntimeConfig()
const version = runtimeConfig.public.appVersion

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

const handleSwitchOrg = async (id) => {
  await switchOrg(id)
  showSwitchDrawer = false
}
</script>

<template>
  <div class="relative flex-1 p-6 selection:bg-slate-200">
    <div
      class="fixed inset-0 -z-10 h-full w-full bg-white bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)] [background-size:16px_16px]"
    ></div>

    <div class="mx-auto max-w-lg space-y-6">
      <section class="space-y-3">
        <h3 class="px-1 text-xs font-semibold tracking-wider text-slate-400 uppercase">当前组织</h3>

        <div class="px-1">
          <div v-if="orgLoading" class="flex items-center justify-between">
            <div class="space-y-2">
              <Skeleton class="h-8 w-40" />
              <Skeleton class="h-4 w-24" />
            </div>
            <Skeleton class="h-10 w-10 rounded-full" />
          </div>

          <div v-else class="flex items-center justify-between gap-4">
            <div class="min-w-0 flex-1">
              <h2
                class="truncate text-3xl leading-none font-extrabold tracking-tight text-slate-900"
              >
                {{ currentOrg?.name || '未加载' }}
              </h2>
              <div class="mt-2 flex items-center gap-2">
                <Badge
                  variant="outline"
                  class="h-5 border-blue-200 bg-blue-50 px-1.5 text-[10px] font-medium text-blue-700"
                >
                  Owner
                </Badge>
                <p class="font-mono text-xs text-slate-400">
                  ID: {{ currentOrg?.id?.slice(0, 8) }}...
                </p>
              </div>
            </div>

            <button
              @click="showSwitchDrawer = true"
              class="group flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-500 shadow-sm transition-all hover:bg-slate-900 hover:text-white active:scale-95"
              title="切换组织"
            >
              <ArrowLeftRight class="h-5 w-5" />
            </button>
          </div>
        </div>
      </section>

      <section v-if="!currentOrg?.is_personal" class="space-y-3">
        <h3 class="px-1 text-xs font-semibold tracking-wider text-slate-400 uppercase">管理</h3>

        <div
          class="divide-y divide-slate-50 overflow-hidden rounded-xl border border-slate-100/80 bg-white shadow-sm"
        >
          <NuxtLink
            to="/members"
            class="group flex items-center justify-between p-4 transition-colors active:bg-slate-50"
          >
            <div class="flex items-center gap-3">
              <div
                class="flex h-9 w-9 items-center justify-center rounded-full bg-blue-50 text-blue-600"
              >
                <Users class="h-5 w-5" />
              </div>
              <span class="text-sm font-medium text-slate-700">团队成员</span>
            </div>

            <div class="flex items-center gap-2">
              <span class="text-xs text-slate-400">{{ orgMembers.length }} 人</span>
              <ChevronRight class="h-4 w-4 text-slate-300 group-hover:text-slate-400" />
            </div>
          </NuxtLink>
        </div>
      </section>

      <section class="space-y-4">
        <div class="flex items-center justify-between px-1">
          <h3 class="text-xs font-semibold tracking-wider text-slate-400 uppercase">供应商</h3>
          <button
            @click="isVendorDialogOpen = true"
            class="group flex items-center gap-1 rounded-lg text-sm font-medium text-blue-600 transition-colors hover:bg-blue-50 hover:text-blue-800"
          >
            <Plus class="h-4 w-4 transition-transform group-hover:rotate-90" />
            <span>新建</span>
          </button>
        </div>

        <div class="overflow-hidden rounded-xl border-slate-100 bg-white shadow-sm">
          <div v-if="vendorLoading" class="space-y-4 p-6">
            <div class="flex items-center justify-between" v-for="i in 2" :key="i">
              <div class="flex items-center gap-3">
                <Skeleton class="h-9 w-9 rounded-full" />
                <Skeleton class="h-4 w-24" />
              </div>
              <Skeleton class="h-8 w-8 rounded-md" />
            </div>
          </div>

          <div v-else-if="vendors.length === 0" class="px-6 py-10 text-center">
            <div
              class="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-slate-50 shadow-inner"
            >
              <Store class="h-8 w-8 text-slate-300" stroke-width="1.5" />
            </div>
            <p class="mx-auto max-w-xs text-sm text-slate-500">暂无供应商，点击右上角添加。</p>
          </div>

          <div v-else class="divide-y divide-slate-50">
            <div
              v-for="vendor in vendors"
              :key="vendor.id"
              class="group flex items-center justify-between p-4 transition-colors hover:bg-slate-50"
            >
              <div class="flex items-center gap-3">
                <div
                  class="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-sm font-bold text-slate-500 shadow-sm"
                >
                  {{ vendor.name.charAt(0).toUpperCase() }}
                </div>
                <span class="text-sm font-medium text-slate-700">{{ vendor.name }}</span>
              </div>

              <button
                @click="openDeleteConfirm(vendor)"
                class="rounded-full p-2 text-slate-300 transition-colors hover:bg-red-50 hover:text-red-500"
              >
                <Trash2 class="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </section>

      <div class="space-y-4">
        <div class="flex items-center justify-center gap-2 text-xs text-slate-400">
          <UserCircle2 class="h-3 w-3" />
          <span>{{ user?.email }}</span>
        </div>

        <Button
          size="lg"
          class="h-14 w-full rounded-xl bg-slate-900 text-base font-medium shadow-lg shadow-slate-900/10 hover:bg-slate-800"
          @click="handleLogout"
        >
          <LogOut class="mr-2 h-5 w-5" />
          退出登录
        </Button>

        <p class="pt-2 text-center font-mono text-[10px] tracking-widest text-slate-300 uppercase">
          FEIRA v{{ version }}
        </p>
      </div>
    </div>

    <Drawer :open="showSwitchDrawer" @update:open="showSwitchDrawer = $event">
      <DrawerContent>
        <div class="mx-auto w-full max-w-sm">
          <DrawerHeader>
            <DrawerTitle>{{ isCreatingOrgMode ? '创建新组织' : '切换组织' }}</DrawerTitle>
          </DrawerHeader>

          <div class="space-y-4 p-4 pt-0">
            <div v-if="!isCreatingOrgMode" class="space-y-2">
              <div
                v-for="org in myOrgs"
                :key="org.id"
                @click="handleSwitchOrg(org.id)"
                class="flex cursor-pointer items-center justify-between rounded-xl border p-4 transition-all active:scale-95"
                :class="
                  org.id === currentOrg?.id
                    ? 'border-slate-900 bg-slate-900 text-white shadow-md'
                    : 'border-slate-100 bg-white text-slate-700 hover:border-slate-300'
                "
              >
                <div class="flex flex-col">
                  <span class="text-sm font-bold">{{ org.name }}</span>
                  <span class="font-mono text-[10px] opacity-60">ID: {{ org.id.slice(0, 4) }}</span>
                </div>
                <Check v-if="org.id === currentOrg?.id" class="h-5 w-5" />
              </div>
            </div>
            <div v-else class="space-y-4">
              <Input v-model="newOrgName" placeholder="组织名称" class="h-12 text-lg" auto-focus />
            </div>
          </div>
          <DrawerFooter>
            <template v-if="!isCreatingOrgMode">
              <Button @click="isCreatingOrgMode = true" size="lg">
                <Plus class="h-4 w-4" /> 创建新组织
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
          <div class="space-y-4 p-4">
            <Input
              v-model.trim="newVendorName"
              placeholder="例如: Atacadão"
              class="h-12 text-lg"
              @keyup.enter="handleAddVendor"
            />
          </div>
          <DrawerFooter>
            <Button
              @click="handleAddVendor"
              :disabled="!newVendorName"
              class="h-12 w-full bg-slate-900"
              >确认添加</Button
            >
            <DrawerClose as-child>
              <Button class="h-12 w-full" variant="outline"> 取消 </Button>
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
          <AlertDialogAction @click="confirmDelete" class="border-none bg-red-600 hover:bg-red-700"
            >确认删除
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  </div>
</template>

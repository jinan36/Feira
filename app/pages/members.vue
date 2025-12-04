<script setup>
import { ArrowLeft, Plus, Mail, Shield } from 'lucide-vue-next'

const { currentOrg } = useOrg()
const { members: orgMembers, fetchMembers, inviteMember, loading, isOwner } = useMembers() // 引入 loading
const router = useRouter()

const showInviteDrawer = ref(false)
const inviteEmail = ref('')

definePageMeta({
  layout: false
})

onMounted(async () => {
  if (currentOrg.value?.id) {
    fetchMembers()
  }
})

watch(currentOrg, (newVal) => {
  if (newVal?.id) fetchMembers()
})

const handleInvite = async () => {
  if (!inviteEmail.value.trim()) return
  const success = await inviteMember(inviteEmail.value.trim())

  if (success) {
    showInviteDrawer.value = false
    inviteEmail.value = ''
  }
}
</script>

<template>
  <div class="min-h-screen bg-slate-50 pb-20 selection:bg-slate-200">
    <div
      class="sticky top-0 z-20 flex h-14 items-center justify-between border-b border-slate-200 bg-white/80 px-4 backdrop-blur-md"
    >
      <div class="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          class="-ml-2 h-10 w-10 rounded-full text-slate-600"
          @click="router.back()"
        >
          <ArrowLeft class="h-5 w-5" />
        </Button>
        <h1 class="text-lg font-bold text-slate-900">团队成员</h1>
      </div>

      <Button
        v-if="!currentOrg?.is_personal && isOwner"
        variant="ghost"
        size="sm"
        class="h-8 px-2 font-medium text-blue-600 hover:bg-blue-50 hover:text-blue-700"
        @click="showInviteDrawer = true"
      >
        <Plus class="mr-1 h-4 w-4" /> 邀请
      </Button>
    </div>
    <div class="space-y-3 p-4">
      <div v-if="loading" class="space-y-3">
        <div
          v-for="i in 3"
          :key="i"
          class="flex items-center gap-4 rounded-xl border border-slate-100 bg-white p-4"
        >
          <Skeleton class="h-12 w-12 rounded-full" />
          <div class="flex-1 space-y-2">
            <Skeleton class="h-4 w-32" />
            <Skeleton class="h-3 w-24" />
          </div>
        </div>
      </div>

      <template v-else>
        <div
          v-for="m in orgMembers"
          :key="m.id"
          class="flex items-center gap-4 rounded-xl border border-slate-100 bg-white p-4 shadow-sm transition-all hover:shadow-md"
        >
          <Avatar class="h-12 w-12 border border-slate-100">
            <AvatarImage :src="m.profiles?.avatar_url" />
            <AvatarFallback class="bg-slate-100 font-bold text-slate-600">
              {{ m.profiles?.full_name?.charAt(0).toUpperCase() || 'U' }}
            </AvatarFallback>
          </Avatar>

          <div class="min-w-0 flex-1 space-y-1">
            <div class="flex items-center justify-between">
              <h3 class="truncate font-bold text-slate-900">
                {{ m.profiles?.full_name || '未命名用户' }}
              </h3>
              <Badge
                :variant="m.role === 'owner' ? 'default' : 'secondary'"
                class="h-5 px-1.5 text-[10px] font-normal capitalize"
                :class="
                  m.role === 'owner'
                    ? 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                    : 'bg-slate-100 text-slate-600'
                "
              >
                {{ m.role }}
              </Badge>
            </div>
            <div class="flex items-center truncate text-xs text-slate-400">
              <Mail class="mr-1 h-3 w-3 shrink-0" />
              <span class="truncate">{{ m.profiles?.email }}</span>
            </div>
          </div>
        </div>

        <div v-if="currentOrg?.is_personal" class="py-12 text-center text-slate-400">
          <div
            class="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100"
          >
            <Shield class="h-8 w-8 text-slate-300" />
          </div>
          <p class="text-sm font-medium text-slate-600">个人空间</p>
          <p class="mx-auto mt-1 max-w-[200px] text-xs leading-relaxed">
            无法添加成员。请创建新组织以邀请他人协作。
          </p>
        </div>
      </template>
    </div>

    <Drawer :open="showInviteDrawer" @update:open="showInviteDrawer = $event">
      <DrawerContent>
        <div class="mx-auto w-full max-w-sm">
          <DrawerHeader>
            <DrawerTitle class="text-xl font-bold">邀请新成员</DrawerTitle>
            <DrawerDescription>输入对方注册时的邮箱地址</DrawerDescription>
          </DrawerHeader>

          <div class="space-y-4 p-4 pb-8">
            <div class="relative">
              <Mail class="absolute top-3.5 left-3 h-5 w-5 text-slate-400" />
              <Input
                v-model="inviteEmail"
                placeholder="partner@example.com"
                class="h-12 pl-10 text-lg"
                @keyup.enter="handleInvite"
              />
            </div>

            <Button
              class="h-12 w-full bg-slate-900 text-base"
              :disabled="!inviteEmail"
              @click="handleInvite"
            >
              发送邀请
            </Button>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  </div>
</template>

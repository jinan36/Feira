<script setup>
import {
    ArrowLeft,
    Plus,
    Mail,
    Shield,
} from 'lucide-vue-next'

const { currentOrg } = useOrg()
const { members: orgMembers, fetchMembers, inviteMember, loading } = useMembers() // 引入 loading
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
    <div class="min-h-screen bg-slate-50 selection:bg-slate-200 pb-20">

        <div
            class="sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b border-slate-200 px-4 h-14 flex items-center justify-between">
            <div class="flex items-center gap-2">
                <Button variant="ghost" size="icon" class="-ml-2 h-10 w-10 text-slate-600 rounded-full"
                    @click="router.back()">
                    <ArrowLeft class="w-5 h-5" />
                </Button>
                <h1 class="font-bold text-slate-900 text-lg">团队成员</h1>
            </div>

            <Button v-if="!currentOrg?.is_personal" variant="ghost" size="sm"
                class="text-blue-600 hover:text-blue-700 hover:bg-blue-50 font-medium h-8 px-2"
                @click="showInviteDrawer = true">
                <Plus class="w-4 h-4 mr-1" /> 邀请
            </Button>
        </div>
        <div class="p-4 space-y-3">
            <div v-if="loading" class="space-y-3">
                <div v-for="i in 3" :key="i"
                    class="flex items-center gap-4 p-4 bg-white border border-slate-100 rounded-xl">
                    <Skeleton class="h-12 w-12 rounded-full" />
                    <div class="space-y-2 flex-1">
                        <Skeleton class="h-4 w-32" />
                        <Skeleton class="h-3 w-24" />
                    </div>
                </div>
            </div>

            <template v-else>
                <div v-for="m in orgMembers" :key="m.id"
                    class="flex items-center gap-4 p-4 bg-white border border-slate-100 rounded-xl shadow-sm transition-all hover:shadow-md">
                    <Avatar class="h-12 w-12 border border-slate-100">
                        <AvatarImage :src="m.profiles?.avatar_url" />
                        <AvatarFallback class="bg-slate-100 text-slate-600 font-bold">
                            {{ m.profiles?.full_name?.charAt(0).toUpperCase() || 'U' }}
                        </AvatarFallback>
                    </Avatar>

                    <div class="flex-1 min-w-0 space-y-1">
                        <div class="flex items-center justify-between">
                            <h3 class="font-bold text-slate-900 truncate">
                                {{ m.profiles?.full_name || '未命名用户' }}
                            </h3>
                            <Badge :variant="m.role === 'owner' ? 'default' : 'secondary'"
                                class="text-[10px] h-5 px-1.5 font-normal capitalize"
                                :class="m.role === 'owner' ? 'bg-blue-100 text-blue-700 hover:bg-blue-200' : 'bg-slate-100 text-slate-600'">
                                {{ m.role }}
                            </Badge>
                        </div>
                        <div class="flex items-center text-xs text-slate-400 truncate">
                            <Mail class="w-3 h-3 mr-1 shrink-0" />
                            <span class="truncate">{{ m.profiles?.email }}</span>
                        </div>
                    </div>
                </div>

                <div v-if="currentOrg?.is_personal" class="py-12 text-center text-slate-400">
                    <div class="h-16 w-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Shield class="w-8 h-8 text-slate-300" />
                    </div>
                    <p class="text-sm font-medium text-slate-600">个人空间</p>
                    <p class="text-xs mt-1 max-w-[200px] mx-auto leading-relaxed">
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

                    <div class="p-4 space-y-4 pb-8">
                        <div class="relative">
                            <Mail class="absolute left-3 top-3.5 h-5 w-5 text-slate-400" />
                            <Input v-model="inviteEmail" placeholder="partner@example.com" class="h-12 text-lg pl-10"
                                @keyup.enter="handleInvite" />
                        </div>

                        <Button class="w-full h-12 bg-slate-900 text-base" :disabled="!inviteEmail"
                            @click="handleInvite">
                            发送邀请
                        </Button>
                    </div>
                </div>
            </DrawerContent>
        </Drawer>

    </div>
</template>
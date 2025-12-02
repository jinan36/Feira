<script setup>
const { initOrg, currentOrg, loading } = useOrg()
const user = useSupabaseUser()
const supabase = useSupabaseClient()

onMounted(() => {
    if (user.value) {
        initOrg()
    }
})

const logout = async () => {
    await supabase.auth.signOut()
    navigateTo('/login')
}
</script>

<template>
    <div class="p-8 space-y-4">
        <h1 class="text-2xl font-bold">首页</h1>

        <div v-if="loading">
            正在寻找你的组织...
        </div>

        <div v-else-if="currentOrg" class="border p-4 rounded bg-green-50">
            <p class="font-bold text-green-800">成功连接数据库！</p>
            <p>当前组织名称: {{ currentOrg.name }}</p>
            <p>组织 ID: {{ currentOrg.id }}</p>
        </div>

        <div v-else class="border p-4 rounded bg-red-50 text-red-800">
            尚未加载组织信息 (请检查控制台是否有报错)
        </div>

        <hr class="my-4" />

        <p class="text-gray-500 text-sm">当前用户: {{ user?.email }}</p>
        <Button @click="logout" class="bg-gray-200 px-4 py-2 rounded">退出登录</Button>
    </div>
</template>
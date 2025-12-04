<script setup>
import {
    Search, Plus, Trash2, PackageOpen,
    ShoppingCart, Store, Check, X
} from 'lucide-vue-next'
// 引入你的全屏组件 (假设你已经抽离了，如果没有抽离，就保持原样用 Teleport 代码)
import ProductAddSheet from '@/components/ProductAddSheet.vue'

const { currentOrg } = useOrg()
const { products, loading, fetchAllProducts, toggleStatus, createProduct, deleteProduct } = useProducts()
const { vendors, fetchVendors } = useVendors()

// 状态
const searchQuery = ref('')
const isAddOpen = ref(false)
const isDeleteDialogOpen = ref(false)
const productToDelete = ref(null)

// 初始化
onMounted(() => {
    if (currentOrg.value?.id) {
        fetchAllProducts()
    }
})

watch(currentOrg, (newVal) => {
    if (newVal?.id) fetchAllProducts()
})

// 搜索防抖
let searchTimer = null
const handleSearch = () => {
    clearTimeout(searchTimer)
    searchTimer = setTimeout(() => {
        fetchAllProducts(searchQuery.value)
    }, 300)
}

// 打开逻辑
const openAddPage = async () => {
    isAddOpen.value = true
    if (vendors.value.length === 0) {
        await fetchVendors()
    }
}

const handleCreateFromSheet = async (formData) => {
    const { name, vendorId } = formData
    const success = await createProduct(name, vendorId)
    if (success) {
        isAddOpen.value = false
    }
}

const openDeleteConfirm = (product) => {
    productToDelete.value = product
    isDeleteDialogOpen.value = true
}

const confirmDelete = async () => {
    if (productToDelete.value) {
        await deleteProduct(productToDelete.value.id)
        isDeleteDialogOpen.value = false
        productToDelete.value = null
    }
}
</script>

<template>
    <div class="relative bg-slate-50">

        <div
            class="sticky top-0 z-30 bg-slate-50/95 backdrop-blur-sm pt-6 px-6 pb-3 border-b border-slate-100/50 flex items-center gap-3">

            <div class="relative flex-1">
                <Search class="absolute left-3 top-3 h-5 w-5 text-slate-400" />
                <Input v-model="searchQuery" placeholder="搜索食材..."
                    class="pl-10 h-11 bg-white border-slate-200 focus-visible:ring-slate-900 rounded-xl text-base shadow-sm transition-all w-full"
                    @input="handleSearch" clearable />
            </div>

            <button @click="openAddPage"
                class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-900 text-white shadow-md shadow-slate-900/10 transition-transform active:scale-90 hover:bg-slate-800">
                <Plus class="h-6 w-6" stroke-width="2.5" />
            </button>

        </div>

        <div class="pt-3 pb-6 px-6 space-y-3">
            <div v-if="loading" class="space-y-3">
                <div v-for="i in 6" :key="i"
                    class="flex items-center justify-between p-4 bg-white rounded-xl border border-slate-100">
                    <div class="space-y-2">
                        <Skeleton class="h-5 w-24" />
                        <Skeleton class="h-3 w-16" />
                    </div>
                    <Skeleton class="h-8 w-16 rounded-full" />
                </div>
            </div>

            <div v-else-if="products.length === 0" class="flex flex-col items-center justify-center py-24 text-center">
                <div
                    class="h-20 w-20 bg-white rounded-full flex items-center justify-center mb-4 shadow-sm border border-slate-100">
                    <PackageOpen class="w-10 h-10 text-slate-300" stroke-width="1.5" />
                </div>
                <h3 class="text-lg font-medium text-slate-900">库房是空的</h3>
                <p class="text-sm text-slate-500 mt-1 max-w-[200px]">
                    点击右上角
                    <Plus class="w-4 h-4 inline-block align-middle bg-slate-900 text-white rounded-full p-0.5" />
                    添加第一个商品。
                </p>
            </div>

            <div v-else class="space-y-3">
                <div v-for="item in products" :key="item.id"
                    class="group flex items-center justify-between p-4 bg-white rounded-2xl border border-slate-100 shadow-sm transition-all active:scale-[0.99]">
                    <div class="flex-1 min-w-0 pr-4">
                        <h3 class="font-bold text-slate-900 truncate text-base mb-1.5 leading-none">{{ item.name }}</h3>
                        <div class="flex items-center gap-2">
                            <Badge variant="secondary"
                                class="text-[10px] h-5 px-1.5 font-normal bg-slate-50 text-slate-500 border border-slate-100">
                                {{ item.vendors?.name || '无供应商' }}
                            </Badge>
                        </div>
                    </div>
                    <div class="flex items-center gap-3">
                        <Button size="sm" :variant="item.is_needed ? 'default' : 'outline'"
                            class="h-9 px-4 min-w-[84px] transition-all duration-300 rounded-lg font-medium"
                            :class="item.is_needed ? 'bg-blue-600 hover:bg-blue-700 text-white border-transparent shadow-md shadow-blue-200' : 'text-slate-500 border-slate-200 hover:bg-slate-50 bg-white'"
                            @click="toggleStatus(item)">
                            <template v-if="item.is_needed">
                                <ShoppingCart class="w-3.5 h-3.5 mr-1.5" />已加
                            </template>
                            <template v-else>
                                <Plus class="w-3.5 h-3.5 mr-1.5" />加入
                            </template>
                        </Button>
                        <button @click="openDeleteConfirm(item)"
                            class="p-2 text-slate-300 hover:text-red-500 active:text-red-600 transition-colors">
                            <Trash2 class="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <ProductAddSheet v-model:open="isAddOpen" :vendors="vendors" @create="handleCreateFromSheet" />

        <AlertDialog :open="isDeleteDialogOpen" @update:open="isDeleteDialogOpen = $event">
            <AlertDialogContent class="max-w-[90%] rounded-2xl">
                <AlertDialogHeader>
                    <AlertDialogTitle>确定删除商品？</AlertDialogTitle>
                    <AlertDialogDescription>删除 <span class="font-bold text-slate-900">“{{ productToDelete?.name
                            }}”</span>
                        后，它将从所有清单中移除。</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>取消</AlertDialogCancel>
                    <AlertDialogAction @click="confirmDelete" class="bg-red-600 border-none">删除</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>

    </div>
</template>
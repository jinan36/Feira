<script setup>
import { Search, Plus, Trash2, PackageOpen, ShoppingCart, Store, Check, X } from 'lucide-vue-next'
// 引入你的全屏组件 (假设你已经抽离了，如果没有抽离，就保持原样用 Teleport 代码)
import ProductAddSheet from '@/components/ProductAddSheet.vue'

const { currentOrg } = useOrg()
const { products, loading, fetchAllProducts, toggleStatus, createProduct, deleteProduct } =
  useProducts()
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
      class="sticky top-0 z-30 flex items-center gap-3 border-b border-slate-100/50 bg-slate-50/95 px-6 pt-6 pb-3 backdrop-blur-sm"
    >
      <div class="relative flex-1">
        <Search class="absolute top-3 left-3 h-5 w-5 text-slate-400" />
        <Input
          v-model="searchQuery"
          placeholder="搜索食材..."
          class="h-11 w-full rounded-xl border-slate-200 bg-white pl-10 text-base shadow-sm transition-all focus-visible:ring-slate-900"
          @input="handleSearch"
          clearable
        />
      </div>

      <button
        @click="openAddPage"
        class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-900 text-white shadow-md shadow-slate-900/10 transition-transform hover:bg-slate-800 active:scale-90"
      >
        <Plus class="h-6 w-6" stroke-width="2.5" />
      </button>
    </div>

    <div class="space-y-3 px-6 pt-3 pb-6">
      <div v-if="loading" class="space-y-3">
        <div
          v-for="i in 6"
          :key="i"
          class="flex items-center justify-between rounded-xl border border-slate-100 bg-white p-4"
        >
          <div class="space-y-2">
            <Skeleton class="h-5 w-24" />
            <Skeleton class="h-3 w-16" />
          </div>
          <Skeleton class="h-8 w-16 rounded-full" />
        </div>
      </div>

      <div
        v-else-if="products.length === 0"
        class="flex flex-col items-center justify-center py-24 text-center"
      >
        <div
          class="mb-4 flex h-20 w-20 items-center justify-center rounded-full border border-slate-100 bg-white shadow-sm"
        >
          <PackageOpen class="h-10 w-10 text-slate-300" stroke-width="1.5" />
        </div>
        <h3 class="text-lg font-medium text-slate-900">库房是空的</h3>
        <p class="mt-1 max-w-[200px] text-sm text-slate-500">
          点击右上角
          <Plus
            class="inline-block h-4 w-4 rounded-full bg-slate-900 p-0.5 align-middle text-white"
          />
          添加第一个商品。
        </p>
      </div>

      <div v-else class="space-y-3">
        <div
          v-for="item in products"
          :key="item.id"
          class="group flex items-center justify-between rounded-2xl border border-slate-100 bg-white p-4 shadow-sm transition-all active:scale-[0.99]"
        >
          <div class="min-w-0 flex-1 pr-4">
            <h3 class="mb-1.5 truncate text-base leading-none font-bold text-slate-900">
              {{ item.name }}
            </h3>
            <div class="flex items-center gap-2">
              <Badge
                variant="secondary"
                class="h-5 border border-slate-100 bg-slate-50 px-1.5 text-[10px] font-normal text-slate-500"
              >
                {{ item.vendors?.name || '无供应商' }}
              </Badge>
            </div>
          </div>
          <div class="flex items-center gap-3">
            <Button
              size="sm"
              :variant="item.is_needed ? 'default' : 'outline'"
              class="h-9 min-w-[84px] rounded-lg px-4 font-medium transition-all duration-300"
              :class="
                item.is_needed
                  ? 'border-transparent bg-blue-600 text-white shadow-md shadow-blue-200 hover:bg-blue-700'
                  : 'border-slate-200 bg-white text-slate-500 hover:bg-slate-50'
              "
              @click="toggleStatus(item)"
            >
              <template v-if="item.is_needed">
                <ShoppingCart class="mr-1.5 h-3.5 w-3.5" />已加
              </template>
              <template v-else> <Plus class="mr-1.5 h-3.5 w-3.5" />加入 </template>
            </Button>
            <button
              @click="openDeleteConfirm(item)"
              class="p-2 text-slate-300 transition-colors hover:text-red-500 active:text-red-600"
            >
              <Trash2 class="h-4 w-4" />
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
          <AlertDialogDescription
            >删除
            <span class="font-bold text-slate-900">“{{ productToDelete?.name }}”</span>
            后，它将从所有清单中移除。</AlertDialogDescription
          >
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>取消</AlertDialogCancel>
          <AlertDialogAction @click="confirmDelete" class="border-none bg-red-600"
            >删除</AlertDialogAction
          >
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  </div>
</template>

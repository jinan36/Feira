<script setup>
import { ShoppingCart, CheckCircle2, Store, ArrowRight } from 'lucide-vue-next'
import PurchaseSheet from '@/components/PurchaseSheet.vue'

const { currentOrg } = useOrg()
const { products, loading, fetchAllProducts } = useProducts()
const { submitPurchase } = usePurchase()

const isPurchaseSheetOpen = ref(false)
const selectedProduct = ref(null)

onMounted(() => {
  if (currentOrg.value?.id) fetchAllProducts()
})

watch(currentOrg, (newVal) => {
  if (newVal?.id) fetchAllProducts()
})

const groupedList = computed(() => {
  if (!products.value) return {}

  const needed = products.value.filter((p) => p.is_needed)

  const groups = {}
  needed.forEach((p) => {
    const vendorName = p.vendors?.name || '其他'
    if (!groups[vendorName]) {
      groups[vendorName] = []
    }
    groups[vendorName].push(p)
  })

  return groups
})

const totalNeeded = computed(() => {
  return products.value.filter((p) => p.is_needed).length
})

const openPurchase = (product) => {
  selectedProduct.value = product
  isPurchaseSheetOpen.value = true
}

const handleConfirmPurchase = async (data) => {
  const success = await submitPurchase(data)

  if (success) {
    await fetchAllProducts()
    isPurchaseSheetOpen.value = false
    selectedProduct.value = null
  }
}
</script>

<template>
  <div class="min-h-full bg-slate-50">
    <div
      class="sticky top-0 z-30 flex items-center justify-between border-b border-slate-100/50 bg-slate-50/95 px-6 py-4 backdrop-blur-sm"
    >
      <div>
        <h1 class="text-2xl font-extrabold tracking-tight text-slate-900">采购清单</h1>
        <p class="mt-1 text-xs font-medium text-slate-500">
          {{
            new Date().toLocaleDateString('zh-CN', {
              weekday: 'long',
              month: 'long',
              day: 'numeric'
            })
          }}
        </p>
      </div>

      <div
        class="flex items-center rounded-full bg-blue-100 px-3 py-1.5 text-xs font-bold text-blue-700"
      >
        <ShoppingCart class="mr-1.5 h-3.5 w-3.5" />
        {{ totalNeeded }} 待购
      </div>
    </div>

    <div class="space-y-6 px-6 py-4">
      <div v-if="loading && totalNeeded === 0" class="space-y-4">
        <Skeleton class="h-32 w-full rounded-2xl" />
        <Skeleton class="h-32 w-full rounded-2xl" />
      </div>

      <div v-else-if="totalNeeded === 0" class="flex flex-col items-center py-20 text-center">
        <div class="mb-4 rounded-full bg-green-100 p-6">
          <CheckCircle2 class="h-12 w-12 text-green-600" />
        </div>
        <h3 class="text-xl font-bold text-slate-900">清单已清空！</h3>
        <p class="mt-2 max-w-[200px] text-slate-500">
          所有东西都买齐了，快去库房看看还要补什么吧。
        </p>
        <NuxtLink to="/products">
          <Button variant="outline" class="mt-6 rounded-full px-6">去库房加货</Button>
        </NuxtLink>
      </div>

      <div v-else v-for="(items, vendorName) in groupedList" :key="vendorName" class="space-y-2">
        <div class="flex items-center px-2 text-slate-400">
          <Store class="mr-2 h-4 w-4" />
          <span class="text-xs font-bold tracking-wider uppercase">{{ vendorName }}</span>
          <span class="ml-auto rounded-md bg-slate-200 px-1.5 py-0.5 text-[10px] text-slate-600">{{
            items.length
          }}</span>
        </div>

        <div
          class="divide-y divide-slate-50 overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm"
        >
          <div
            v-for="item in items"
            :key="item.id"
            @click="openPurchase(item)"
            class="group flex cursor-pointer items-center justify-between p-4 transition-colors active:bg-blue-50"
          >
            <div class="flex items-center gap-4">
              <div
                class="flex h-6 w-6 items-center justify-center rounded-full border-2 border-slate-200 transition-all group-active:scale-90 group-active:border-blue-500"
              >
                <div
                  class="h-3 w-3 rounded-full bg-blue-500 opacity-0 transition-opacity group-active:opacity-100"
                ></div>
              </div>

              <span
                class="text-base font-bold text-slate-700 transition-colors group-active:text-blue-700"
              >
                {{ item.name }}
              </span>
            </div>

            <ArrowRight
              class="h-4 w-4 text-slate-300 transition-all group-active:translate-x-1 group-active:text-blue-400"
            />
          </div>
        </div>
      </div>
    </div>

    <PurchaseSheet
      v-model:open="isPurchaseSheetOpen"
      :product="selectedProduct"
      @confirm="handleConfirmPurchase"
    />
  </div>
</template>

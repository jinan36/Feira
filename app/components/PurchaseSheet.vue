<script setup>
import { DollarSign, Hash } from 'lucide-vue-next'

const props = defineProps({
  open: Boolean,
  product: Object
})

const emit = defineEmits(['update:open', 'confirm'])

const price = ref('')
const quantity = ref('')
watch(
  () => props.open,
  (isOpen) => {
    if (isOpen) {
      price.value = ''
      quantity.value = ''
    }
  }
)

const close = () => {
  emit('update:open', false)
}

const handleConfirm = () => {
  if (!price.value) return

  emit('confirm', {
    product: props.product,
    price: parseFloat(price.value),
    quantity: quantity.value ? parseFloat(quantity.value) : null
  })
  close()
}
</script>

<template>
  <Teleport to="body">
    <Transition name="slide-up">
      <div v-if="open" class="pointer-events-none fixed inset-0 z-[70] flex flex-col justify-end">
        <div
          class="pointer-events-auto absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
          @click="close"
        ></div>

        <div
          class="pointer-events-auto relative flex max-h-[85vh] w-full flex-col overflow-y-auto rounded-t-3xl bg-white shadow-2xl"
        >
          <div class="flex justify-center pt-3 pb-1" @click="close">
            <div class="h-1.5 w-12 rounded-full bg-slate-200"></div>
          </div>

          <div class="border-b border-slate-50 px-6 py-4">
            <h2 class="text-xl leading-tight font-bold text-slate-900">
              {{ product?.name }}
            </h2>
            <p class="mt-1 flex items-center gap-1 text-sm text-slate-400">
              <span class="inline-block h-2 w-2 rounded-full bg-blue-500"></span>
              {{ product?.vendors?.name || '未知供应商' }}
            </p>
          </div>

          <div class="space-y-6 p-6">
            <div class="space-y-3">
              <Label class="text-xs font-bold tracking-wider text-slate-400 uppercase"
                >单价 (必填)</Label
              >
              <div class="relative">
                <DollarSign
                  class="absolute top-1/2 left-4 h-6 w-6 -translate-y-1/2 text-slate-900"
                  stroke-width="2.5"
                />
                <Input
                  v-model="price"
                  type="number"
                  inputmode="decimal"
                  placeholder="0.00"
                  class="h-16 rounded-2xl border-transparent bg-slate-50 pl-12 text-3xl font-bold text-slate-900 transition-all focus:bg-white focus:ring-4 focus:ring-slate-100"
                  auto-focus
                />
              </div>
            </div>

            <div class="space-y-3">
              <Label class="text-xs font-bold tracking-wider text-slate-400 uppercase"
                >数量 (可选)</Label
              >
              <div class="relative">
                <Hash class="absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 text-slate-400" />
                <Input
                  v-model="quantity"
                  type="number"
                  inputmode="numeric"
                  placeholder="1"
                  class="h-14 rounded-2xl border-transparent bg-slate-50 pl-12 text-lg font-medium text-slate-700 transition-all focus:bg-white focus:ring-4 focus:ring-slate-100"
                />
              </div>
            </div>

            <Button
              class="mt-4 h-14 w-full rounded-2xl bg-green-600 text-lg font-bold text-white shadow-xl shadow-green-200 transition-all hover:bg-green-700 active:scale-[0.98]"
              :disabled="!price"
              @click="handleConfirm"
            >
              确认购买
            </Button>
          </div>

          <div class="pb-safe h-6 bg-white"></div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.slide-up-enter-active,
.slide-up-leave-active {
  transition: transform 0.3s cubic-bezier(0.32, 0.72, 0, 1);
}
.slide-up-enter-from,
.slide-up-leave-to {
  transform: translateY(100%);
}
.pb-safe {
  padding-bottom: env(safe-area-inset-bottom);
}
</style>

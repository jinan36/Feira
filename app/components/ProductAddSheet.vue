<script setup>
import { X, Store, Check } from 'lucide-vue-next'

// 定义接收的参数
const props = defineProps({
    open: Boolean,      // 控制显示隐藏
    vendors: Array      // 供应商列表数据
})

// 定义抛出的事件
const emit = defineEmits(['update:open', 'create'])

// 本地表单状态
const newProductName = ref('')
const newProductVendor = ref('')

// 关闭函数
const close = () => {
    emit('update:open', false)
}

// 提交函数
const handleSubmit = () => {
    if (!newProductName.value || !newProductVendor.value) return

    // 把数据抛给父组件处理
    emit('create', {
        name: newProductName.value,
        vendorId: newProductVendor.value
    })

    // 清空表单 (可选，也可以在父组件成功后清空)
    newProductName.value = ''
    // newProductVendor.value = '' // 建议保留上次选中的供应商，体验更好
}

// 监听打开状态，每次打开自动聚焦或重置逻辑可以写在这里
</script>

<template>
    <Teleport to="body">
        <Transition name="slide-up">
            <div v-if="open" class="fixed inset-0 z-[60] flex flex-col bg-white">

                <div class="flex items-center justify-between px-4 h-14 border-b border-slate-100 bg-white shrink-0">
                    <button @click="close" class="p-2 -ml-2 text-slate-500 active:text-slate-900">
                        <X class="w-6 h-6" />
                    </button>
                    <h2 class="font-bold text-lg text-slate-900">录入新商品</h2>
                    <div class="w-10"></div>
                </div>

                <div class="flex-1 flex flex-col overflow-hidden">

                    <div class="p-4 space-y-3 shrink-0 bg-white z-10">
                        <Label class="text-sm font-bold text-slate-900">商品名称</Label>
                        <Input v-model.trim="newProductName" placeholder="例如: Arroz (大米)"
                            class="h-14 text-lg rounded-xl bg-slate-50 border-transparent focus:bg-white focus:border-slate-200 transition-all"
                            auto-focus />
                    </div>

                    <div class="px-4 pb-2 flex items-center justify-between shrink-0">
                        <Label class="text-sm font-bold text-slate-900">选择供应商</Label>
                        <NuxtLink to="/profile" class="text-xs font-medium text-blue-600" @click="close">
                            + 去添加
                        </NuxtLink>
                    </div>

                    <div class="flex-1 overflow-y-auto px-4 pb-4 space-y-2">
                        <div v-if="vendors.length === 0"
                            class="text-center py-8 border-2 border-dashed border-slate-100 rounded-xl bg-slate-50">
                            <Store class="w-8 h-8 text-slate-300 mx-auto mb-2" />
                            <p class="text-sm text-slate-400">暂无供应商</p>
                        </div>

                        <div v-for="v in vendors" :key="v.id" @click="newProductVendor = v.id"
                            class="flex items-center justify-between p-4 rounded-xl border-2 transition-all active:scale-[0.98]"
                            :class="newProductVendor === v.id
                                ? 'border-slate-900 bg-slate-900 text-white'
                                : 'border-slate-100 bg-white text-slate-700'">
                            <span class="font-medium text-base">{{ v.name }}</span>
                            <Check v-if="newProductVendor === v.id" class="w-5 h-5" />
                        </div>

                        <div class="h-2"></div>
                    </div>
                </div>

                <div class="p-4 border-t border-slate-100 bg-white safe-area-pb shrink-0">
                    <Button
                        class="w-full h-14 text-base font-medium rounded-xl bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-200"
                        :disabled="!newProductName || !newProductVendor" @click="handleSubmit">
                        保存并加入清单
                    </Button>
                </div>

            </div>
        </Transition>
    </Teleport>
</template>

<style scoped>
.slide-up-enter-active,
.slide-up-leave-active {
    transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

.slide-up-enter-from,
.slide-up-leave-to {
    transform: translateY(100%);
}

.safe-area-pb {
    padding-bottom: calc(1rem + env(safe-area-inset-bottom));
}
</style>
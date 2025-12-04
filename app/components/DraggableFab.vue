<script setup>
const props = defineProps({
    initialBottom: { type: Number, default: 96 }, // 默认距离底部 96px (避开导航栏)
    initialRight: { type: Number, default: 20 },  // 默认距离右边 20px
})

const emit = defineEmits(['click'])

const buttonRef = ref(null)

// 按钮当前的位置 (使用固定定位 fixed)
const position = reactive({ x: 0, y: 0 })
const isDragging = ref(false)
let startPos = { x: 0, y: 0 }
let initialButtonPos = { x: 0, y: 0 }
let hasMoved = false // 标记是否发生了移动，用于区分点击和拖拽

// 初始化位置 (放在右下角)
onMounted(() => {
    if (process.client) {
        const { innerWidth, innerHeight } = window
        // 计算初始左上角坐标 (屏幕宽 - 右边距 - 按钮宽, 屏幕高 - 底边距 - 按钮高)
        // 假设按钮大概 56px (w-14)
        position.x = innerWidth - props.initialRight - 56
        position.y = innerHeight - props.initialBottom - 56
    }
})

// --- 触摸/鼠标处理逻辑 ---

const handleStart = (e) => {
    isDragging.value = true
    hasMoved = false

    // 兼容鼠标和触摸
    const clientX = e.touches ? e.touches[0].clientX : e.clientX
    const clientY = e.touches ? e.touches[0].clientY : e.clientY

    startPos = { x: clientX, y: clientY }
    initialButtonPos = { x: position.x, y: position.y }

    // 监听移动和结束
    document.addEventListener('touchmove', handleMove, { passive: false })
    document.addEventListener('touchend', handleEnd)
    document.addEventListener('mousemove', handleMove)
    document.addEventListener('mouseup', handleEnd)
}

const handleMove = (e) => {
    if (!isDragging.value) return

    // 阻止默认滚动行为 (防止拖按钮时页面跟着滚)
    e.preventDefault()

    const clientX = e.touches ? e.touches[0].clientX : e.clientX
    const clientY = e.touches ? e.touches[0].clientY : e.clientY

    const dx = clientX - startPos.x
    const dy = clientY - startPos.y

    // 如果移动超过 5px，就视为拖拽，不再是点击
    if (Math.abs(dx) > 5 || Math.abs(dy) > 5) {
        hasMoved = true
    }

    // 更新位置
    let newX = initialButtonPos.x + dx
    let newY = initialButtonPos.y + dy

    // 边界检查 (防止拖出屏幕)
    const maxX = window.innerWidth - 56 // 减去按钮宽度
    const maxY = window.innerHeight - 56 // 减去按钮高度

    // 限制范围 (留一点边距)
    position.x = Math.max(0, Math.min(newX, maxX))
    position.y = Math.max(0, Math.min(newY, maxY))
}

const handleEnd = () => {
    isDragging.value = false

    // 移除监听
    document.removeEventListener('touchmove', handleMove)
    document.removeEventListener('touchend', handleEnd)
    document.removeEventListener('mousemove', handleMove)
    document.removeEventListener('mouseup', handleEnd)

    // 如果只是轻轻点了一下(没移动)，触发 click 事件
    if (!hasMoved) {
        emit('click')
    }
}
</script>

<template>
    <Teleport to="body">
        <div ref="buttonRef" class="fixed z-[100] touch-none cursor-move select-none"
            :style="{ left: position.x + 'px', top: position.y + 'px' }" @mousedown="handleStart"
            @touchstart="handleStart">
            <div class="flex h-14 w-14 items-center justify-center rounded-full bg-slate-900 text-white shadow-xl shadow-slate-900/40 transition-transform active:scale-90 hover:bg-slate-800"
                :class="{ 'scale-95 opacity-90': isDragging }">
                <slot />
            </div>
        </div>
    </Teleport>
</template>
<script setup>
import { RouterView } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { onMounted } from 'vue'
import BottomNavigation from '@/components/BottomNavigation.vue'

const userStore = useUserStore()

// 初始化应用
onMounted(() => {
  // 初始化用户数据
  userStore.initializeUser()
  
  // 设置页面标题
  document.title = 'AI一对一辅导'
  
  // 设置视口元标签
  const viewport = document.querySelector('meta[name="viewport"]')
  if (!viewport) {
    const meta = document.createElement('meta')
    meta.name = 'viewport'
    meta.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no'
    document.head.appendChild(meta)
  }
  
  // 禁用双击缩放
  document.addEventListener('touchstart', function (event) {
    if (event.touches.length > 1) {
      event.preventDefault()
    }
  })
  
  let lastTouchEnd = 0
  document.addEventListener('touchend', function (event) {
    const now = (new Date()).getTime()
    if (now - lastTouchEnd <= 300) {
      event.preventDefault()
    }
    lastTouchEnd = now
  }, false)
})
</script>

<template>
  <div id="app">
    <RouterView />
    <BottomNavigation />
  </div>
</template>

<style>
/* 全局样式已在 main.css 中定义 */
#app {
  min-height: 100vh;
  font-family: var(--font-family);
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

/* 防止移动端滚动回弹 */
body {
  overflow-x: hidden;
  -webkit-overflow-scrolling: touch;
}

/* 禁用文本选择 */
* {
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
}

/* 允许输入框文本选择 */
input, textarea {
  -webkit-user-select: text;
  -moz-user-select: text;
  -ms-user-select: text;
  user-select: text;
}

/* 移动端优化 */
@media (max-width: 768px) {
  /* 隐藏滚动条 */
  ::-webkit-scrollbar {
    display: none;
  }
  
  /* 优化触摸体验 */
  * {
    -webkit-tap-highlight-color: transparent;
    -webkit-touch-callout: none;
  }
  
  /* 防止页面缩放 */
  html {
    -ms-touch-action: manipulation;
    touch-action: manipulation;
  }
}
</style>

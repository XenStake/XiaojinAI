<template>
  <div class="bottom-navigation">
    <div 
      v-for="item in navItems" 
      :key="item.route"
      class="nav-item"
      :class="{ active: isActive(item.route) }"
      @click="navigateTo(item.route)"
    >
      <div class="nav-icon" :style="{ color: isActive(item.route) ? item.color : '#7F8C8D' }">
        {{ item.icon }}
      </div>
      <div class="nav-label" :style="{ color: isActive(item.route) ? item.color : '#7F8C8D' }">
        {{ item.label }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'

/**
 * 底部导航组件
 * 提供应用主要功能的快速访问入口
 */

const router = useRouter()
const route = useRoute()

// 导航项配置
const navItems = [
  {
    icon: '🏠',
    label: '首页',
    route: '/',
    color: '#4A90E2'
  },
  {
    icon: '📸',
    label: '拍照',
    route: '/camera',
    color: '#FF8A65'
  },
  {
    icon: '🤖',
    label: 'AI老师',
    route: '/tutor',
    color: '#66BB6A'
  },
  {
    icon: '⚔️',
    label: 'PK挑战',
    route: '/pk-challenge',
    color: '#E91E63'
  },
  {
    icon: '👤',
    label: '我的',
    route: '/profile',
    color: '#42A5F5'
  }
]

/**
 * 检查当前路由是否激活
 */
const isActive = (routePath) => {
  if (routePath === '/') {
    return route.path === '/'
  }
  return route.path.startsWith(routePath)
}

/**
 * 导航到指定路由
 */
const navigateTo = (routePath) => {
  if (route.path !== routePath) {
    router.push(routePath)
  }
}
</script>

<style scoped>
.bottom-navigation {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: var(--surface);
  border-top: 1px solid var(--border);
  display: flex;
  justify-content: space-around;
  align-items: center;
  padding: var(--spacing-sm) 0;
  box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  height: 70px;
}

.nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  padding: var(--spacing-xs);
  border-radius: var(--border-radius-md);
  min-width: 50px;
}

.nav-item:hover {
  background-color: rgba(0, 0, 0, 0.05);
}

.nav-item.active {
  transform: translateY(-2px);
}

.nav-icon {
  font-size: 20px;
  margin-bottom: 2px;
  transition: all 0.2s ease;
}

.nav-item.active .nav-icon {
  transform: scale(1.1);
}

.nav-label {
  font-size: var(--font-size-xs);
  font-weight: 500;
  transition: color 0.2s ease;
}

/* 响应式设计 */
@media (max-width: 480px) {
  .bottom-navigation {
    height: 65px;
    padding: var(--spacing-xs) 0;
  }
  
  .nav-icon {
    font-size: 18px;
  }
  
  .nav-label {
    font-size: 10px;
  }
}
</style>
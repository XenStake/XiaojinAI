import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import Camera from '../views/Camera.vue'
import Tutor from '../views/Tutor.vue'
import PKChallenge from '../views/PKChallenge.vue'
import Shop from '../views/Shop.vue'
import Profile from '../views/Profile.vue'
import Report from '../views/Report.vue'
import Invite from '../views/Invite.vue'
import Homework from '../views/Homework.vue'
import ErrorBook from '../views/ErrorBook.vue'
import CardPocket from '../views/CardPocket.vue'

/**
 * 路由配置
 * 定义应用的所有页面路由
 */
const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home,
    meta: {
      title: '首页',
      keepAlive: true
    }
  },
  {
    path: '/camera',
    name: 'Camera',
    component: Camera,
    meta: {
      title: '拍照检查',
      keepAlive: false
    }
  },
  {
    path: '/tutor',
    name: 'Tutor',
    component: Tutor,
    meta: {
      title: 'AI老师',
      keepAlive: true
    }
  },
  {
    path: '/pk-challenge',
    name: 'PKChallenge',
    component: PKChallenge,
    meta: {
      title: 'PK挑战',
      keepAlive: true
    }
  },

  {
    path: '/shop',
    name: 'Shop',
    component: Shop,
    meta: {
      title: '积分商城',
      keepAlive: true
    }
  },
  {
    path: '/profile',
    name: 'Profile',
    component: Profile,
    meta: {
      title: '个人中心',
      keepAlive: true
    }
  },
  {
    path: '/report',
    name: 'Report',
    component: Report,
    meta: { title: '学习报告' }
  },
  {
    path: '/invite',
    name: 'Invite',
    component: Invite,
    meta: { title: '邀请好友' }
  },
  {
    path: '/homework',
    name: 'Homework',
    component: Homework,
    meta: { title: '最近作业' }
  },
  {
    path: '/error-book',
    name: 'ErrorBook',
    component: ErrorBook,
    meta: { title: '错题本' }
  },
  {
    path: '/card-pocket',
    name: 'CardPocket',
    component: CardPocket,
    meta: {
      title: '卡牌口袋',
      keepAlive: true
    }
  }

]

/**
 * 创建路由实例
 */
const router = createRouter({
  history: createWebHistory(),
  routes
})

/**
 * 路由守卫 - 设置页面标题
 */
router.beforeEach((to, from, next) => {
  if (to.meta.title) {
    document.title = `${to.meta.title} - AI一对一辅导`
  }
  next()
})

export default router
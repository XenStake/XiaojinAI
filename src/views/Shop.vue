<template>
  <div class="shop-page page-content-mobile">
    <!-- 顶部导航 -->
    <div class="page-header">
      <button class="back-btn" @click="goBack">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M19 12H5M12 19L5 12L12 5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>
      <h1 class="page-title">积分商城</h1>
      <div class="header-actions">
        <button class="action-btn" @click="showOrders = true">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          <span class="d-none d-md-inline">订单</span>
        </button>
      </div>
    </div>

    <!-- 用户积分信息 -->
    <div class="points-info">
      <div class="points-card">
        <div class="points-icon">💎</div>
        <div class="points-details">
          <div class="points-label">我的积分</div>
          <div class="points-value">{{ userInfo.points }}</div>
        </div>
        <button class="points-history-btn" @click="showPointsHistory = true">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
            <polyline points="12,6 12,12 16,14" stroke="currentColor" stroke-width="2"/>
          </svg>
          积分记录
        </button>
      </div>
      

    </div>

    <!-- 商品分类 -->
    <div class="shop-categories container">
      <div class="categories-scroll">
        <button 
          v-for="category in categories" 
          :key="category.id"
          class="category-btn"
          :class="{ active: activeCategory === category.id }"
          @click="activeCategory = category.id"
        >
          <span class="category-icon">{{ category.icon }}</span>
          <span class="category-name">{{ category.name }}</span>
          <span class="category-count d-none d-md-inline">{{ getCategoryCount(category.id) }}</span>
        </button>
      </div>
    </div>

    <!-- 商品列表 -->
    <div class="shop-content container">
      <div class="products-grid row justify-content-center">
        <div 
          v-for="product in filteredProducts" 
          :key="product.id"
          class="product-card col-6 col-sm-6 col-md-3 col-lg-3 col-xl-3"
          :class="{ 
            'out-of-stock': product.stock === 0,
            'limited': product.isLimited
          }"
        >
          <!-- 商品图片 -->
          <div class="product-image">
            <img :src="product.image" :alt="product.name" />
            <div v-if="product.isLimited" class="limited-badge">限量</div>
            <div v-if="product.isHot" class="hot-badge">热门</div>
            <div v-if="product.stock === 0" class="stock-badge">售罄</div>
          </div>
          
          <!-- 商品信息 -->
          <div class="product-info">
            <h3 class="product-name">{{ product.name }}</h3>
            <p class="product-desc">{{ product.description }}</p>
            
            <!-- 商品价格 -->
            <div class="product-price">
              <div class="price-current">
                <span class="price-icon">💎</span>
                <span class="price-value">{{ product.price }}</span>
              </div>
              <div v-if="product.originalPrice" class="price-original">
                <span class="price-icon">💎</span>
                <span class="price-value">{{ product.originalPrice }}</span>
              </div>
            </div>
            
            <!-- 库存信息 -->
            <div class="product-stock" v-if="product.isLimited">
              <div class="stock-bar">
                <div 
                  class="stock-fill" 
                  :style="{ width: (product.stock / product.totalStock * 100) + '%' }"
                ></div>
              </div>
              <div class="stock-text">仅剩 {{ product.stock }} 件</div>
            </div>
            
            <!-- 操作按钮 -->
            <div class="product-actions">
              <button 
                class="btn btn-primary exchange-btn btn-mobile-full"
                :disabled="!canExchange(product)"
                @click="showExchangeDialog(product)"
              >
                {{ getExchangeButtonText(product) }}
              </button>
              <button class="btn btn-outline detail-btn btn-mobile-full d-md-inline-block" @click="showProductDetail(product)">
                详情
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 空状态 -->
      <div v-if="filteredProducts.length === 0" class="empty-state">
        <div class="empty-icon">🛍️</div>
        <div class="empty-text">暂无商品</div>
        <div class="empty-desc">该分类下暂时没有商品，请查看其他分类</div>
      </div>
    </div>

    <!-- 兑换确认弹窗 -->
    <div v-if="showExchangeConfirm" class="modal-overlay" @click="closeExchangeDialog">
      <div class="exchange-modal" @click.stop>
        <div class="modal-header">
          <h3>确认兑换</h3>
          <button class="close-btn" @click="closeExchangeDialog">×</button>
        </div>
        <div class="modal-content">
          <div class="exchange-product">
            <img :src="selectedProduct.image" :alt="selectedProduct.name" class="exchange-image" />
            <div class="exchange-info">
              <h4 class="exchange-name">{{ selectedProduct.name }}</h4>
              <p class="exchange-desc">{{ selectedProduct.description }}</p>
              <div class="exchange-price">
                <span class="price-icon">💎</span>
                <span class="price-value">{{ selectedProduct.price }}</span>
              </div>
            </div>
          </div>
          
          <!-- 数量选择 -->
          <div class="quantity-selector" v-if="selectedProduct.type !== 'privilege'">
            <label class="quantity-label">兑换数量：</label>
            <div class="quantity-controls">
              <button class="quantity-btn" @click="decreaseQuantity" :disabled="exchangeQuantity <= 1">-</button>
              <input v-model.number="exchangeQuantity" type="number" min="1" :max="getMaxQuantity()" class="quantity-input" />
              <button class="quantity-btn" @click="increaseQuantity" :disabled="exchangeQuantity >= getMaxQuantity()">+</button>
            </div>
            <div class="quantity-info">
              <span>总计：{{ selectedProduct.price * exchangeQuantity }} 积分</span>
            </div>
          </div>
          
          <!-- 收货信息 -->
          <div class="delivery-info" v-if="selectedProduct.type === 'physical'">
            <h4 class="delivery-title">收货信息</h4>
            <div class="form-group">
              <label>收货人姓名</label>
              <input v-model="deliveryInfo.name" type="text" placeholder="请输入收货人姓名" />
            </div>
            <div class="form-group">
              <label>联系电话</label>
              <input v-model="deliveryInfo.phone" type="tel" placeholder="请输入联系电话" />
            </div>
            <div class="form-group">
              <label>收货地址</label>
              <textarea v-model="deliveryInfo.address" placeholder="请输入详细收货地址" rows="3"></textarea>
            </div>
          </div>
        </div>
        <div class="modal-actions">
          <button class="btn btn-outline" @click="closeExchangeDialog">取消</button>
          <button class="btn btn-primary" @click="confirmExchange" :disabled="!canConfirmExchange()">
            确认兑换
          </button>
        </div>
      </div>
    </div>

    <!-- 商品详情弹窗 -->
    <div v-if="showProductDetails" class="modal-overlay" @click="closeProductDetail">
      <div class="product-detail-modal" @click.stop>
        <div class="modal-header">
          <h3>商品详情</h3>
          <button class="close-btn" @click="closeProductDetail">×</button>
        </div>
        <div class="modal-content">
          <div class="detail-image">
            <img :src="selectedProduct.image" :alt="selectedProduct.name" />
          </div>
          <div class="detail-info">
            <h3 class="detail-name">{{ selectedProduct.name }}</h3>
            <p class="detail-desc">{{ selectedProduct.description }}</p>
            <div class="detail-price">
              <span class="price-icon">💎</span>
              <span class="price-value">{{ selectedProduct.price }}</span>
            </div>
            <div class="detail-features" v-if="selectedProduct.features">
              <h4>商品特色</h4>
              <ul>
                <li v-for="feature in selectedProduct.features" :key="feature">{{ feature }}</li>
              </ul>
            </div>
            <div class="detail-usage" v-if="selectedProduct.usage">
              <h4>使用说明</h4>
              <p>{{ selectedProduct.usage }}</p>
            </div>
          </div>
        </div>
        <div class="modal-actions">
          <button class="btn btn-outline" @click="closeProductDetail">关闭</button>
          <button 
            class="btn btn-primary"
            :disabled="!canExchange(selectedProduct)"
            @click="showExchangeDialog(selectedProduct)"
          >
            {{ getExchangeButtonText(selectedProduct) }}
          </button>
        </div>
      </div>
    </div>

    <!-- 订单列表弹窗 -->
    <div v-if="showOrders" class="modal-overlay" @click="showOrders = false">
      <div class="orders-modal" @click.stop>
        <div class="modal-header">
          <h3>我的订单</h3>
          <button class="close-btn" @click="showOrders = false">×</button>
        </div>
        <div class="modal-content">
          <div class="orders-list">
            <div 
              v-for="order in userOrders" 
              :key="order.id"
              class="order-item"
            >
              <div class="order-header">
                <div class="order-id">订单号：{{ order.id }}</div>
                <div class="order-status" :class="order.status">{{ getOrderStatusText(order.status) }}</div>
              </div>
              <div class="order-content">
                <img :src="order.product.image" :alt="order.product.name" class="order-image" />
                <div class="order-info">
                  <div class="order-name">{{ order.product.name }}</div>
                  <div class="order-details">
                    <span>数量：{{ order.quantity }}</span>
                    <span>积分：{{ order.totalPoints }}</span>
                  </div>
                  <div class="order-time">{{ formatTime(order.createTime) }}</div>
                </div>
              </div>
            </div>
          </div>
          
          <div v-if="userOrders.length === 0" class="empty-orders">
            <div class="empty-icon">📦</div>
            <div class="empty-text">暂无订单</div>
            <div class="empty-desc">您还没有兑换过任何商品</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 积分记录弹窗 -->
    <div v-if="showPointsHistory" class="modal-overlay" @click="showPointsHistory = false">
      <div class="points-history-modal" @click.stop>
        <div class="modal-header">
          <h3>积分记录</h3>
          <button class="close-btn" @click="showPointsHistory = false">×</button>
        </div>
        <div class="modal-content">
          <div class="history-list">
            <div 
              v-for="record in pointsHistory" 
              :key="record.id"
              class="history-item"
            >
              <div class="history-icon" :class="record.type">
                {{ getHistoryIcon(record.type) }}
              </div>
              <div class="history-info">
                <div class="history-title">{{ record.title }}</div>
                <div class="history-desc">{{ record.description }}</div>
                <div class="history-time">{{ formatTime(record.time) }}</div>
              </div>
              <div class="history-points" :class="record.change > 0 ? 'positive' : 'negative'">
                {{ record.change > 0 ? '+' : '' }}{{ record.change }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '../stores/user'
import { useShopStore } from '../stores/shop'

/**
 * 积分商城页面组件
 * 实现积分兑换功能
 */

const router = useRouter()
const userStore = useUserStore()
const shopStore = useShopStore()

// 响应式数据
const activeCategory = ref('all')
const showExchangeConfirm = ref(false)
const showProductDetails = ref(false)
const showOrders = ref(false)
const showPointsHistory = ref(false)
const selectedProduct = ref(null)
const exchangeQuantity = ref(1)
const deliveryInfo = ref({
  name: '',
  phone: '',
  address: ''
})

// 商品分类
const categories = ref([
  { id: 'all', name: '全部', icon: '🛍️' },
  { id: 'virtual', name: '虚拟商品', icon: '💎' },
  { id: 'physical', name: '实物商品', icon: '📦' }
])

// 模拟商品数据
const products = ref([
  {
    id: '1',
    name: 'VIP学习卡（7天）',
    description: '享受7天VIP学习特权，无限制AI辅导',
    image: '/images/vip-card-7.jpg',
    price: 200,
    originalPrice: 300,
    type: 'privilege',
    category: 'virtual',
    stock: 999,
    isHot: true,
    features: ['无限AI辅导次数', '专属学习报告', '优先客服支持'],
    usage: '兑换后立即生效，有效期7天'
  },
  {
    id: '2',
    name: 'VIP学习卡（30天）',
    description: '享受30天VIP学习特权，学习效率翻倍',
    image: '/images/vip-card-30.jpg',
    price: 600,
    originalPrice: 900,
    type: 'privilege',
    category: 'virtual',
    stock: 999,
    isHot: true,
    features: ['无限AI辅导次数', '专属学习报告', '优先客服支持', '学习数据分析'],
    usage: '兑换后立即生效，有效期30天'
  },
  {
    id: '3',
    name: '精美笔记本',
    description: '高品质学习笔记本，记录你的学习点滴',
    image: '/images/notebook.jpg',
    price: 150,
    type: 'physical',
    category: 'physical',
    stock: 50,
    totalStock: 100,
    isLimited: true,
    features: ['A5尺寸', '80页优质纸张', '精美封面设计'],
    usage: '适合日常学习记录使用'
  },
  {
    id: '4',
    name: '学习文具套装',
    description: '包含笔、橡皮、尺子等学习必备文具',
    image: '/images/stationery-set.jpg',
    price: 100,
    type: 'physical',
    category: 'physical',
    stock: 30,
    totalStock: 50,
    isLimited: true,
    features: ['多色圆珠笔', '高品质橡皮', '透明直尺', '精美包装'],
    usage: '学习办公必备文具'
  },
  {
    id: '5',
    name: '错题本模板',
    description: '专业错题整理模板，提高学习效率',
    image: '/images/error-book.jpg',
    price: 50,
    type: 'virtual',
    category: 'virtual',
    stock: 999,
    features: ['科学分类方法', '复习提醒功能', '统计分析报告'],
    usage: '下载后可打印使用或在线编辑'
  },
  {
    id: '6',
    name: '学习计划助手',
    description: '智能学习计划制定工具，科学安排学习时间',
    image: '/images/study-planner.jpg',
    price: 80,
    type: 'virtual',
    category: 'virtual',
    stock: 999,
    features: ['智能时间分配', '进度跟踪', '提醒通知', '数据统计'],
    usage: '兑换后获得30天使用权限'
  },
  {
    id: '7',
    name: '专属学习徽章',
    description: '彰显学习成就的专属徽章',
    image: '/images/badge.jpg',
    price: 300,
    type: 'privilege',
    category: 'virtual',
    stock: 0,
    features: ['个人资料展示', '成就认证', '社区特权'],
    usage: '兑换后永久拥有'
  },
  {
    id: '8',
    name: '蓝牙耳机',
    description: '高品质蓝牙耳机，学习娱乐两不误',
    image: '/images/bluetooth-headphones.jpg',
    price: 800,
    originalPrice: 1000,
    type: 'physical',
    category: 'physical',
    stock: 10,
    totalStock: 20,
    isLimited: true,
    isHot: true,
    features: ['降噪功能', '长续航', '高音质', '舒适佩戴'],
    usage: '适合学习听课和日常娱乐使用'
  }
])

// 模拟用户订单
const userOrders = ref([
  {
    id: 'ORD001',
    product: {
      name: 'VIP学习卡（7天）',
      image: '/images/vip-card-7.jpg'
    },
    quantity: 1,
    totalPoints: 200,
    status: 'completed',
    createTime: Date.now() - 86400000 // 1天前
  },
  {
    id: 'ORD002',
    product: {
      name: '精美笔记本',
      image: '/images/notebook.jpg'
    },
    quantity: 2,
    totalPoints: 300,
    status: 'shipping',
    createTime: Date.now() - 172800000 // 2天前
  }
])

// 模拟积分记录
const pointsHistory = ref([
  {
    id: '1',
    type: 'earn',
    title: '每日签到',
    description: '连续签到奖励',
    change: 10,
    time: Date.now() - 3600000 // 1小时前
  },
  {
    id: '2',
    type: 'spend',
    title: '兑换商品',
    description: 'VIP学习卡（7天）',
    change: -200,
    time: Date.now() - 86400000 // 1天前
  },
  {
    id: '3',
    type: 'earn',
    title: 'PK挑战胜利',
    description: '战胜AI老师获得奖励',
    change: 100,
    time: Date.now() - 172800000 // 2天前
  },
  {
    id: '4',
    type: 'earn',
    title: '完成作业',
    description: '数学作业批改完成',
    change: 20,
    time: Date.now() - 259200000 // 3天前
  }
])

// 计算属性
const userInfo = computed(() => userStore.userInfo)

const filteredProducts = computed(() => {
  if (activeCategory.value === 'all') {
    return products.value
  }
  return products.value.filter(product => product.category === activeCategory.value)
})

// 方法
/**
 * 返回上一页
 */
const goBack = () => {
  router.back()
}

/**
 * 获取分类商品数量
 */
const getCategoryCount = (categoryId) => {
  if (categoryId === 'all') {
    return products.value.length
  }
  return products.value.filter(product => product.category === categoryId).length
}

/**
 * 检查是否可以兑换
 */
const canExchange = (product) => {
  return product.stock > 0 && userInfo.value.points >= product.price
}

/**
 * 获取兑换按钮文本
 */
const getExchangeButtonText = (product) => {
  if (product.stock === 0) {
    return '已售罄'
  }
  if (userInfo.value.points < product.price) {
    return '积分不足'
  }
  return '立即兑换'
}

/**
 * 显示兑换确认弹窗
 */
const showExchangeDialog = (product) => {
  if (!canExchange(product)) return
  
  selectedProduct.value = product
  exchangeQuantity.value = 1
  deliveryInfo.value = {
    name: '',
    phone: '',
    address: ''
  }
  showExchangeConfirm.value = true
  showProductDetails.value = false
}

/**
 * 关闭兑换弹窗
 */
const closeExchangeDialog = () => {
  showExchangeConfirm.value = false
  selectedProduct.value = null
}

/**
 * 显示商品详情
 */
const showProductDetail = (product) => {
  selectedProduct.value = product
  showProductDetails.value = true
}

/**
 * 关闭商品详情
 */
const closeProductDetail = () => {
  showProductDetails.value = false
  selectedProduct.value = null
}

/**
 * 获取最大兑换数量
 */
const getMaxQuantity = () => {
  if (!selectedProduct.value) return 1
  
  const maxByStock = selectedProduct.value.stock
  const maxByPoints = Math.floor(userInfo.value.points / selectedProduct.value.price)
  
  return Math.min(maxByStock, maxByPoints, 10) // 限制最大10个
}

/**
 * 增加数量
 */
const increaseQuantity = () => {
  if (exchangeQuantity.value < getMaxQuantity()) {
    exchangeQuantity.value++
  }
}

/**
 * 减少数量
 */
const decreaseQuantity = () => {
  if (exchangeQuantity.value > 1) {
    exchangeQuantity.value--
  }
}

/**
 * 检查是否可以确认兑换
 */
const canConfirmExchange = () => {
  if (!selectedProduct.value) return false
  
  const totalPoints = selectedProduct.value.price * exchangeQuantity.value
  if (userInfo.value.points < totalPoints) return false
  
  if (selectedProduct.value.type === 'physical') {
    return deliveryInfo.value.name && deliveryInfo.value.phone && deliveryInfo.value.address
  }
  
  return true
}

/**
 * 确认兑换
 */
const confirmExchange = async () => {
  if (!canConfirmExchange()) return
  
  try {
    const totalPoints = selectedProduct.value.price * exchangeQuantity.value
    
    // 扣除积分
    userStore.addPoints(-totalPoints)
    
    // 减少库存
    const productIndex = products.value.findIndex(p => p.id === selectedProduct.value.id)
    if (productIndex !== -1) {
      products.value[productIndex].stock -= exchangeQuantity.value
    }
    
    // 创建订单
    const newOrder = {
      id: 'ORD' + Date.now(),
      product: {
        name: selectedProduct.value.name,
        image: selectedProduct.value.image
      },
      quantity: exchangeQuantity.value,
      totalPoints,
      status: selectedProduct.value.type === 'physical' ? 'processing' : 'completed',
      createTime: Date.now(),
      deliveryInfo: selectedProduct.value.type === 'physical' ? { ...deliveryInfo.value } : null
    }
    
    userOrders.value.unshift(newOrder)
    
    // 添加积分记录
    pointsHistory.value.unshift({
      id: Date.now().toString(),
      type: 'spend',
      title: '兑换商品',
      description: selectedProduct.value.name,
      change: -totalPoints,
      time: Date.now()
    })
    
    alert('兑换成功！')
    closeExchangeDialog()
    
  } catch (error) {
    console.error('兑换失败:', error)
    alert('兑换失败，请重试')
  }
}



/**
 * 获取订单状态文本
 */
const getOrderStatusText = (status) => {
  const statusMap = {
    processing: '处理中',
    shipping: '配送中',
    completed: '已完成',
    cancelled: '已取消'
  }
  return statusMap[status] || '未知状态'
}

/**
 * 获取积分记录图标
 */
const getHistoryIcon = (type) => {
  const iconMap = {
    earn: '💰',
    spend: '💸',
    bonus: '🎁',
    refund: '↩️'
  }
  return iconMap[type] || '💎'
}

/**
 * 格式化时间
 */
const formatTime = (timestamp) => {
  const date = new Date(timestamp)
  const now = new Date()
  const diff = now - date
  
  if (diff < 3600000) { // 1小时内
    return Math.floor(diff / 60000) + '分钟前'
  } else if (diff < 86400000) { // 1天内
    return Math.floor(diff / 3600000) + '小时前'
  } else if (diff < 2592000000) { // 30天内
    return Math.floor(diff / 86400000) + '天前'
  } else {
    return date.toLocaleDateString()
  }
}

// 生命周期
onMounted(() => {
  // 初始化完成
})
</script>

<style scoped>
.shop-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding-bottom: 90px;
}

/* 页面头部 */
.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--spacing-md);
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
  position: sticky;
  top: 0;
  z-index: 100;
}

.back-btn {
  background: none;
  border: none;
  padding: var(--spacing-sm);
  cursor: pointer;
  color: var(--text-primary);
}

.page-title {
  font-size: var(--font-size-lg);
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  background: var(--primary-color);
  color: white;
  border: none;
  padding: var(--spacing-sm) var(--spacing-md);
  border-radius: var(--border-radius-md);
  font-size: var(--font-size-sm);
  cursor: pointer;
  transition: all 0.2s ease;
}

.action-btn:hover {
  background: var(--primary-dark);
}

/* 积分信息 */
.points-info {
  padding: var(--spacing-md);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.points-card {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: var(--border-radius-lg);
  padding: var(--spacing-lg);
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
}

.points-icon {
  font-size: 48px;
  animation: sparkle 2s ease-in-out infinite;
}

@keyframes sparkle {
  0%, 100% { transform: scale(1) rotate(0deg); }
  50% { transform: scale(1.1) rotate(5deg); }
}

.points-details {
  flex: 1;
}

.points-label {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  margin-bottom: var(--spacing-xs);
}

.points-value {
  font-size: var(--font-size-xxl);
  font-weight: 700;
  color: var(--primary-color);
  background: linear-gradient(45deg, var(--primary-color), var(--secondary-color));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.points-history-btn {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  background: var(--background);
  border: 1px solid var(--border);
  padding: var(--spacing-sm) var(--spacing-md);
  border-radius: var(--border-radius-md);
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.2s ease;
}

.points-history-btn:hover {
  background: var(--primary-light);
  border-color: var(--primary-color);
  color: var(--primary-color);
}



/* 商品分类 */
.shop-categories {
  background: white;
  padding: var(--spacing-md) 0;
  margin-bottom: var(--spacing-lg);
  box-shadow: var(--shadow-sm);
}

.categories-scroll {
  display: flex;
  gap: var(--spacing-md);
  justify-content: center;
  align-items: center;
  padding: 0 var(--spacing-md);
  flex-wrap: wrap;
}

.categories-scroll::-webkit-scrollbar {
  display: none;
}

.category-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-xs);
  background: rgba(255, 255, 255, 0.8);
  border: 2px solid transparent;
  padding: var(--spacing-md);
  border-radius: var(--border-radius-lg);
  cursor: pointer;
  transition: all 0.2s ease;
  min-width: 80px;
  white-space: nowrap;
}

.category-btn:hover {
  background: rgba(255, 255, 255, 0.95);
  transform: translateY(-2px);
}

.category-btn.active {
  background: rgba(255, 255, 255, 0.95);
  border-color: var(--primary-color);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.category-icon {
  font-size: 24px;
}

.category-name {
  font-size: var(--font-size-sm);
  font-weight: 600;
  color: var(--text-primary);
}

.category-count {
  font-size: var(--font-size-xs);
  color: var(--text-secondary);
  background: var(--background);
  padding: 2px 6px;
  border-radius: var(--border-radius-full);
}

/* 商品内容 */
.shop-content {
  padding: 0 var(--spacing-md);
}

.products-grid {
  margin: 0;
  margin-left: -4px;
  margin-right: -4px;
}

.product-card {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: var(--border-radius-lg);
  overflow: hidden;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  position: relative;
  margin-bottom: var(--spacing-md);
  margin-left: 4px;
  margin-right: 4px;
}

/* 桌面端确保每排显示4个商品 */
@media (min-width: 769px) {
  .product-card {
    flex: 0 0 calc(25% - 8px);
    max-width: calc(25% - 8px);
  }
}

@media (min-width: 1200px) {
  .product-card {
    margin-bottom: 0;
  }
}

.product-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
}

.product-card.out-of-stock {
  opacity: 0.6;
}

.product-card.limited {
  border: 2px solid var(--warning-color);
}

.product-image {
  position: relative;
  height: 120px;
  overflow: hidden;
}

.product-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.product-card:hover .product-image img {
  transform: scale(1.05);
}

.limited-badge,
.hot-badge,
.stock-badge {
  position: absolute;
  top: var(--spacing-sm);
  right: var(--spacing-sm);
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--border-radius-full);
  font-size: var(--font-size-xs);
  font-weight: 600;
  color: white;
}

.limited-badge {
  background: var(--warning-color);
}

.hot-badge {
  background: var(--error-color);
  animation: pulse 2s ease-in-out infinite;
}

.stock-badge {
  background: var(--text-secondary);
}

@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}

.product-info {
  padding: var(--spacing-sm);
}

.product-name {
  font-size: var(--font-size-xs);
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 var(--spacing-xs) 0;
  line-height: 1.3;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.product-desc {
  font-size: 10px;
  color: var(--text-secondary);
  line-height: 1.3;
  margin: 0 0 var(--spacing-xs) 0;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.product-price {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  margin-bottom: var(--spacing-sm);
}

.price-current {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
}

.price-current .price-icon {
  font-size: 16px;
}

.price-current .price-value {
  font-size: var(--font-size-sm);
  font-weight: 700;
  color: var(--primary-color);
}

.price-original {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  opacity: 0.6;
  text-decoration: line-through;
}

.price-original .price-icon {
  font-size: 12px;
}

.price-original .price-value {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
}

.product-stock {
  margin-bottom: var(--spacing-md);
}

.stock-bar {
  width: 100%;
  height: 6px;
  background: var(--background);
  border-radius: var(--border-radius-sm);
  overflow: hidden;
  margin-bottom: var(--spacing-xs);
}

.stock-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--warning-color), var(--error-color));
  border-radius: var(--border-radius-sm);
  transition: width 0.3s ease;
}

.stock-text {
  font-size: var(--font-size-xs);
  color: var(--warning-color);
  font-weight: 600;
}

.product-actions {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

@media (min-width: 769px) {
  .product-actions {
    flex-direction: column;
    gap: var(--spacing-xs);
  }
}

/* 空状态 */
.empty-state {
  text-align: center;
  padding: var(--spacing-xxl);
  color: white;
}

.empty-icon {
  font-size: 64px;
  margin-bottom: var(--spacing-md);
  opacity: 0.8;
}

.empty-text {
  font-size: var(--font-size-lg);
  font-weight: 600;
  margin-bottom: var(--spacing-sm);
}

.empty-desc {
  font-size: var(--font-size-md);
  opacity: 0.8;
}

/* 弹窗样式 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: var(--spacing-md);
}

.exchange-modal,
.product-detail-modal,
.orders-modal,
.points-history-modal {
  background: white;
  border-radius: var(--border-radius-lg);
  width: 100%;
  max-width: 500px;
  max-height: 80vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--spacing-lg);
  border-bottom: 1px solid var(--border);
}

.modal-header h3 {
  font-size: var(--font-size-lg);
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
}

.close-btn {
  background: none;
  border: none;
  font-size: 24px;
  color: var(--text-secondary);
  cursor: pointer;
  padding: var(--spacing-xs);
  line-height: 1;
}

.close-btn:hover {
  color: var(--text-primary);
}

.modal-content {
  flex: 1;
  overflow-y: auto;
  padding: var(--spacing-lg);
}

.modal-actions {
  display: flex;
  gap: var(--spacing-md);
  padding: var(--spacing-lg);
  border-top: 1px solid var(--border);
}

.modal-actions .btn {
  flex: 1;
}

/* 兑换弹窗 */
.exchange-product {
  display: flex;
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-lg);
  padding-bottom: var(--spacing-lg);
  border-bottom: 1px solid var(--border);
}

.exchange-image {
  width: 80px;
  height: 80px;
  border-radius: var(--border-radius-md);
  object-fit: cover;
}

.exchange-info {
  flex: 1;
}

.exchange-name {
  font-size: var(--font-size-md);
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 var(--spacing-xs) 0;
}

.exchange-desc {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  margin: 0 0 var(--spacing-sm) 0;
}

.exchange-price {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
}

.exchange-price .price-icon {
  font-size: 16px;
}

.exchange-price .price-value {
  font-size: var(--font-size-md);
  font-weight: 600;
  color: var(--primary-color);
}

/* 数量选择 */
.quantity-selector {
  margin-bottom: var(--spacing-lg);
  padding-bottom: var(--spacing-lg);
  border-bottom: 1px solid var(--border);
}

.quantity-label {
  display: block;
  font-size: var(--font-size-sm);
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: var(--spacing-sm);
}

.quantity-controls {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-sm);
}

.quantity-btn {
  width: 32px;
  height: 32px;
  background: var(--background);
  border: 1px solid var(--border);
  border-radius: var(--border-radius-sm);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  transition: all 0.2s ease;
}

.quantity-btn:hover:not(:disabled) {
  background: var(--primary-light);
  border-color: var(--primary-color);
  color: var(--primary-color);
}

.quantity-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.quantity-input {
  width: 60px;
  text-align: center;
  padding: var(--spacing-xs);
  border: 1px solid var(--border);
  border-radius: var(--border-radius-sm);
  font-size: var(--font-size-sm);
}

.quantity-info {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
}

/* 收货信息 */
.delivery-info {
  margin-bottom: var(--spacing-lg);
}

.delivery-title {
  font-size: var(--font-size-md);
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 var(--spacing-md) 0;
}

.form-group {
  margin-bottom: var(--spacing-md);
}

.form-group label {
  display: block;
  font-size: var(--font-size-sm);
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: var(--spacing-xs);
}

.form-group input,
.form-group textarea {
  width: 100%;
  padding: var(--spacing-sm);
  border: 1px solid var(--border);
  border-radius: var(--border-radius-sm);
  font-size: var(--font-size-sm);
  transition: all 0.2s ease;
}

.form-group input:focus,
.form-group textarea:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px var(--primary-light);
}

/* 商品详情弹窗 */
.detail-image {
  text-align: center;
  margin-bottom: var(--spacing-lg);
}

.detail-image img {
  width: 100%;
  max-width: 200px;
  height: auto;
  border-radius: var(--border-radius-md);
}

.detail-name {
  font-size: var(--font-size-lg);
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 var(--spacing-sm) 0;
}

.detail-desc {
  font-size: var(--font-size-md);
  color: var(--text-secondary);
  line-height: var(--line-height-normal);
  margin: 0 0 var(--spacing-md) 0;
}

.detail-price {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  margin-bottom: var(--spacing-lg);
}

.detail-price .price-icon {
  font-size: 20px;
}

.detail-price .price-value {
  font-size: var(--font-size-xl);
  font-weight: 700;
  color: var(--primary-color);
}

.detail-features,
.detail-usage {
  margin-bottom: var(--spacing-lg);
}

.detail-features h4,
.detail-usage h4 {
  font-size: var(--font-size-md);
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 var(--spacing-sm) 0;
}

.detail-features ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.detail-features li {
  padding: var(--spacing-xs) 0;
  color: var(--text-secondary);
  position: relative;
  padding-left: var(--spacing-md);
}

.detail-features li::before {
  content: '✓';
  position: absolute;
  left: 0;
  color: var(--success-color);
  font-weight: 600;
}

.detail-usage p {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  line-height: var(--line-height-normal);
  margin: 0;
}

/* 订单列表 */
.orders-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.order-item {
  border: 1px solid var(--border);
  border-radius: var(--border-radius-md);
  padding: var(--spacing-md);
}

.order-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-sm);
}

.order-id {
  font-size: var(--font-size-xs);
  color: var(--text-secondary);
}

.order-status {
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--border-radius-full);
  font-size: var(--font-size-xs);
  font-weight: 600;
  color: white;
}

.order-status.processing {
  background: var(--warning-color);
}

.order-status.shipping {
  background: var(--info-color);
}

.order-status.completed {
  background: var(--success-color);
}

.order-status.cancelled {
  background: var(--error-color);
}

.order-content {
  display: flex;
  gap: var(--spacing-md);
}

.order-image {
  width: 60px;
  height: 60px;
  border-radius: var(--border-radius-sm);
  object-fit: cover;
}

.order-info {
  flex: 1;
}

.order-name {
  font-size: var(--font-size-md);
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: var(--spacing-xs);
}

.order-details {
  display: flex;
  gap: var(--spacing-md);
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  margin-bottom: var(--spacing-xs);
}

.order-time {
  font-size: var(--font-size-xs);
  color: var(--text-secondary);
}

.empty-orders {
  text-align: center;
  padding: var(--spacing-xxl);
}

.empty-orders .empty-icon {
  font-size: 48px;
  margin-bottom: var(--spacing-md);
  opacity: 0.6;
}

.empty-orders .empty-text {
  font-size: var(--font-size-md);
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: var(--spacing-sm);
}

.empty-orders .empty-desc {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
}

/* 积分记录 */
.history-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.history-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  padding: var(--spacing-md);
  border-radius: var(--border-radius-md);
  transition: all 0.2s ease;
}

.history-item:hover {
  background: var(--background);
}

.history-icon {
  width: 40px;
  height: 40px;
  border-radius: var(--border-radius-round);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
}

.history-icon.earn {
  background: var(--success-light);
}

.history-icon.spend {
  background: var(--error-light);
}

.history-icon.bonus {
  background: var(--warning-light);
}

.history-info {
  flex: 1;
}

.history-title {
  font-size: var(--font-size-md);
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: var(--spacing-xs);
}

.history-desc {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  margin-bottom: var(--spacing-xs);
}

.history-time {
  font-size: var(--font-size-xs);
  color: var(--text-secondary);
}

.history-points {
  font-size: var(--font-size-md);
  font-weight: 600;
}

.history-points.positive {
  color: var(--success-color);
}

.history-points.negative {
  color: var(--error-color);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .points-info {
    padding: var(--spacing-sm);
  }
  
  .points-card {
    padding: var(--spacing-md);
  }
  
  .shop-categories {
    padding: 0 var(--spacing-sm) var(--spacing-sm);
  }
  
  .shop-content {
    padding: 0 var(--spacing-sm);
  }
  
  .products-grid {
    margin-left: -2px;
    margin-right: -2px;
  }
  
  .product-card {
    margin-bottom: var(--spacing-sm);
    margin-left: 2px;
    margin-right: 2px;
  }
  
  /* 确保移动端每排显示2个商品 */
  .product-card {
    flex: 0 0 calc(50% - 4px);
    max-width: calc(50% - 4px);
  }
  
  .product-image {
    height: 100px;
  }
  
  .product-info {
    padding: var(--spacing-xs);
  }
  
  .product-actions {
    flex-direction: column;
    gap: var(--spacing-xs);
  }
  
  .modal-overlay {
    padding: var(--spacing-sm);
  }
  
  .exchange-product {
    flex-direction: column;
    text-align: center;
  }
  
  .quantity-controls {
    justify-content: center;
  }
  
  .modal-actions {
    flex-direction: column;
  }
  
  .modal-actions .btn {
    flex: none;
  }
}

@media (max-width: 480px) {
  .page-header {
    padding: var(--spacing-sm);
  }
  
  .points-card {
    flex-direction: column;
    text-align: center;
    gap: var(--spacing-sm);
    padding: var(--spacing-sm);
  }
  
  .points-value {
    font-size: var(--font-size-xl);
  }
  
  .categories-scroll {
    padding: 0 var(--spacing-sm);
    gap: var(--spacing-sm);
  }
  
  .category-btn {
    min-width: 60px;
    padding: var(--spacing-xs) var(--spacing-sm);
  }
  
  .category-name {
    font-size: var(--font-size-xs);
  }
  
  .products-grid {
    margin-left: -1px;
    margin-right: -1px;
  }
  
  .product-card {
    margin-bottom: var(--spacing-xs);
    margin-left: 1px;
    margin-right: 1px;
    flex: 0 0 calc(50% - 2px);
    max-width: calc(50% - 2px);
  }
  
  .product-image {
    height: 80px;
  }
  
  .product-info {
    padding: 4px;
  }
  
  .product-name {
    font-size: 10px;
  }
  
  .product-desc {
    font-size: 8px;
    -webkit-line-clamp: 1;
  }
  
  .product-price {
    font-size: 10px;
  }
  
  .exchange-btn,
   .detail-btn {
     padding: 2px 4px;
     font-size: 8px;
     border-radius: 4px;
     transition: all 0.3s ease;
     text-align: center;
     min-height: 24px;
   }
  
  .modal-content {
    padding: var(--spacing-md);
  }
  
  .modal-actions {
    padding: var(--spacing-md);
  }
}
</style>
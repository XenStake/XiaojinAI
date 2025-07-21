import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

/**
 * 商城状态管理
 * 管理商品信息、兑换记录、库存等数据
 */
export const useShopStore = defineStore('shop', () => {
  // 商品列表
  const items = ref([
    // 虚拟商品
    {
      id: 'avatar_1',
      name: '可爱小熊头像',
      description: '萌萌哒小熊头像，让你的个人资料更可爱',
      image: '/shop/avatar_bear.png',
      category: 'virtual',
      pointsCost: 50,
      requiredLevel: 1,
      stock: -1, // -1表示无限库存
      isActive: true,
      sortOrder: 1
    },
    {
      id: 'avatar_2',
      name: '超级英雄头像',
      description: '酷炫的超级英雄头像，展现你的勇敢',
      image: '/shop/avatar_hero.png',
      category: 'virtual',
      pointsCost: 80,
      requiredLevel: 2,
      stock: -1,
      isActive: true,
      sortOrder: 2
    },
    {
      id: 'theme_1',
      name: '星空主题',
      description: '浪漫的星空主题界面',
      image: '/shop/theme_starry.png',
      category: 'virtual',
      pointsCost: 100,
      requiredLevel: 2,
      stock: -1,
      isActive: true,
      sortOrder: 3
    },
    {
      id: 'privilege_1',
      name: '专属AI老师',
      description: '解锁专属AI老师，获得更个性化的辅导',
      image: '/shop/privilege_ai.png',
      category: 'privilege',
      pointsCost: 500,
      requiredLevel: 3,
      stock: -1,
      isActive: true,
      sortOrder: 4
    },
    
    // 实物商品
    {
      id: 'stationery_1',
      name: '精美文具套装',
      description: '包含铅笔、橡皮、尺子等学习用品',
      image: '/shop/stationery_set.png',
      category: 'physical',
      pointsCost: 200,
      requiredLevel: 1,
      stock: 50,
      isActive: true,
      sortOrder: 5
    },
    {
      id: 'book_1',
      name: '数学思维训练册',
      description: '提升数学思维能力的专业训练册',
      image: '/shop/book_math.png',
      category: 'physical',
      pointsCost: 300,
      requiredLevel: 2,
      stock: 30,
      isActive: true,
      sortOrder: 6
    },
    {
      id: 'toy_1',
      name: '益智拼图玩具',
      description: '锻炼逻辑思维的益智拼图',
      image: '/shop/toy_puzzle.png',
      category: 'physical',
      pointsCost: 400,
      requiredLevel: 2,
      stock: 20,
      isActive: true,
      sortOrder: 7
    },
    {
      id: 'electronics_1',
      name: '学习平板电脑',
      description: '专为学习设计的平板电脑',
      image: '/shop/tablet.png',
      category: 'physical',
      pointsCost: 2000,
      requiredLevel: 4,
      stock: 5,
      isActive: true,
      sortOrder: 8
    }
  ])

  // 兑换订单
  const orders = ref([])

  // 用户已拥有的虚拟商品
  const ownedItems = ref(['avatar_1']) // 默认拥有一个头像

  // 商品分类
  const categories = ref([
    { value: 'all', label: '全部', icon: '🛍️' },
    { value: 'virtual', label: '虚拟商品', icon: '💎' },
    { value: 'physical', label: '实物商品', icon: '📦' },
    { value: 'privilege', label: '特权功能', icon: '👑' }
  ])

  // 计算属性
  const availableItems = computed(() => {
    return items.value.filter(item => 
      item.isActive && 
      (item.stock === -1 || item.stock > 0)
    ).sort((a, b) => a.sortOrder - b.sortOrder)
  })

  const virtualItems = computed(() => {
    return availableItems.value.filter(item => item.category === 'virtual')
  })

  const physicalItems = computed(() => {
    return availableItems.value.filter(item => item.category === 'physical')
  })

  const privilegeItems = computed(() => {
    return availableItems.value.filter(item => item.category === 'privilege')
  })

  // 方法
  /**
   * 根据分类获取商品
   */
  const getItemsByCategory = (category) => {
    if (category === 'all') return availableItems.value
    return availableItems.value.filter(item => item.category === category)
  }

  /**
   * 根据用户等级过滤商品
   */
  const getItemsByLevel = (userLevel, category = 'all') => {
    const categoryItems = getItemsByCategory(category)
    return categoryItems.filter(item => item.requiredLevel <= userLevel)
  }

  /**
   * 检查用户是否可以兑换商品
   */
  const canExchange = (itemId, userPoints, userLevel) => {
    const item = items.value.find(i => i.id === itemId)
    if (!item) return { canExchange: false, reason: '商品不存在' }
    
    if (!item.isActive) return { canExchange: false, reason: '商品已下架' }
    if (item.stock === 0) return { canExchange: false, reason: '库存不足' }
    if (userLevel < item.requiredLevel) return { canExchange: false, reason: '等级不足' }
    if (userPoints < item.pointsCost) return { canExchange: false, reason: '积分不足' }
    
    // 检查是否已拥有（仅虚拟商品）
    if (item.category === 'virtual' && ownedItems.value.includes(itemId)) {
      return { canExchange: false, reason: '已拥有该商品' }
    }
    
    return { canExchange: true }
  }

  /**
   * 兑换商品
   */
  const exchangeItem = async (itemId, userInfo) => {
    const item = items.value.find(i => i.id === itemId)
    if (!item) throw new Error('商品不存在')
    
    const checkResult = canExchange(itemId, userInfo.points, userInfo.level)
    if (!checkResult.canExchange) {
      throw new Error(checkResult.reason)
    }
    
    // 创建订单
    const order = {
      id: `order_${Date.now()}`,
      userId: userInfo.userId,
      itemId: item.id,
      itemName: item.name,
      itemCategory: item.category,
      pointsCost: item.pointsCost,
      userLevel: userInfo.level,
      status: 'pending',
      deliveryInfo: {
        type: item.category === 'physical' ? 'physical' : 'virtual',
        address: item.category === 'physical' ? userInfo.address : null,
        phone: item.category === 'physical' ? userInfo.phone : null,
        trackingNumber: null
      },
      createdAt: Date.now(),
      completedAt: null
    }
    
    // 减少库存
    if (item.stock > 0) {
      item.stock--
    }
    
    // 添加到订单列表
    orders.value.unshift(order)
    
    // 如果是虚拟商品，立即完成
    if (item.category === 'virtual' || item.category === 'privilege') {
      order.status = 'completed'
      order.completedAt = Date.now()
      ownedItems.value.push(itemId)
    } else {
      // 实物商品设置为处理中
      order.status = 'processing'
      // 模拟发货
      setTimeout(() => {
        order.deliveryInfo.trackingNumber = `TN${Date.now()}`
        order.status = 'shipped'
      }, 2000)
    }
    
    return order
  }

  /**
   * 获取用户订单
   */
  const getUserOrders = (userId) => {
    return orders.value.filter(order => order.userId === userId)
      .sort((a, b) => b.createdAt - a.createdAt)
  }

  /**
   * 更新订单状态
   */
  const updateOrderStatus = (orderId, status, trackingNumber = null) => {
    const order = orders.value.find(o => o.id === orderId)
    if (order) {
      order.status = status
      if (trackingNumber) {
        order.deliveryInfo.trackingNumber = trackingNumber
      }
      if (status === 'completed') {
        order.completedAt = Date.now()
      }
    }
  }

  /**
   * 获取商品详情
   */
  const getItemById = (itemId) => {
    return items.value.find(item => item.id === itemId)
  }

  /**
   * 检查用户是否拥有商品
   */
  const hasItem = (itemId) => {
    return ownedItems.value.includes(itemId)
  }

  /**
   * 添加新商品（管理员功能）
   */
  const addItem = (itemData) => {
    const newItem = {
      id: `item_${Date.now()}`,
      ...itemData,
      createdAt: Date.now(),
      updatedAt: Date.now()
    }
    items.value.push(newItem)
    return newItem
  }

  /**
   * 更新商品信息
   */
  const updateItem = (itemId, updates) => {
    const item = items.value.find(i => i.id === itemId)
    if (item) {
      Object.assign(item, updates, { updatedAt: Date.now() })
      return item
    }
    return null
  }

  /**
   * 删除商品
   */
  const removeItem = (itemId) => {
    const index = items.value.findIndex(i => i.id === itemId)
    if (index > -1) {
      items.value.splice(index, 1)
      return true
    }
    return false
  }

  return {
    // 状态
    items,
    orders,
    ownedItems,
    categories,
    
    // 计算属性
    availableItems,
    virtualItems,
    physicalItems,
    privilegeItems,
    
    // 方法
    getItemsByCategory,
    getItemsByLevel,
    canExchange,
    exchangeItem,
    getUserOrders,
    updateOrderStatus,
    getItemById,
    hasItem,
    addItem,
    updateItem,
    removeItem
  }
})
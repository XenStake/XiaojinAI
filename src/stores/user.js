import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

/**
 * 用户状态管理
 * 管理用户信息、积分、成就等级等数据
 */
export const useUserStore = defineStore('user', () => {
  // 用户基本信息
  const userInfo = ref({
    id: '1',
    username: 'student001',
    name: '小明',
    age: 10,
    grade: '4',
    school: '实验小学',
    avatar: '/avatars/default.png'
  })

  // 积分相关数据
  const points = ref({
    current: 1250, // 当前积分
    totalEarned: 2500, // 总获得积分
    totalSpent: 1250 // 总消费积分
  })

  // 成就等级数据
  const achievement = ref({
    currentLevel: 2, // 当前等级
    levelName: '勤奋学生', // 等级名称
    levelIcon: '📚', // 等级图标
    nextLevelPoints: 1500, // 下一等级所需积分
    unlockedPrivileges: ['个性化头像', '基础AI辅导'] // 已解锁特权
  })

  // 等级配置
  const levelConfig = [
    { level: 0, name: '新手学者', icon: '🌱', minPoints: 0, maxPoints: 499, privileges: ['基础功能'] },
    { level: 1, name: '勤奋学生', icon: '📚', minPoints: 500, maxPoints: 1499, privileges: ['个性化头像'] },
    { level: 2, name: '学习达人', icon: '⭐', minPoints: 1500, maxPoints: 3999, privileges: ['高级AI辅导'] },
    { level: 3, name: '知识专家', icon: '🎓', minPoints: 4000, maxPoints: 9999, privileges: ['专属学习计划'] },
    { level: 4, name: '学霸大师', icon: '👑', minPoints: 10000, maxPoints: Infinity, privileges: ['全部特权'] }
  ]

  // PK统计数据
  const pkStats = ref({
    totalExams: 15,
    winRate: 73,
    bestScore: 95,
    totalPoints: 850
  })

  // 计算属性
  const levelProgress = computed(() => {
    const currentLevelConfig = levelConfig[achievement.value.currentLevel]
    const nextLevelConfig = levelConfig[achievement.value.currentLevel + 1]
    
    if (!nextLevelConfig) return 100 // 已达到最高等级
    
    const currentLevelPoints = points.value.current - currentLevelConfig.minPoints
    const levelRange = nextLevelConfig.minPoints - currentLevelConfig.minPoints
    
    return Math.min(100, Math.max(0, (currentLevelPoints / levelRange) * 100))
  })

  const nextLevelPoints = computed(() => {
    const nextLevelConfig = levelConfig[achievement.value.currentLevel + 1]
    return nextLevelConfig ? nextLevelConfig.minPoints : points.value.current
  })

  // 方法
  /**
   * 更新用户信息
   */
  const updateUserInfo = (newInfo) => {
    userInfo.value = { ...userInfo.value, ...newInfo }
  }

  /**
   * 增加积分
   */
  const addPoints = (amount, source = 'unknown') => {
    points.value.current += amount
    points.value.totalEarned += amount
    
    // 检查是否升级
    checkLevelUp()
    
    // 记录积分获得记录
    addPointsRecord({
      type: 'earn',
      amount,
      source,
      timestamp: Date.now()
    })
  }

  /**
   * 消费积分
   */
  const spendPoints = (amount, purpose = 'unknown') => {
    if (points.value.current >= amount) {
      points.value.current -= amount
      points.value.totalSpent += amount
      
      // 检查是否降级
      checkLevelDown()
      
      // 记录积分消费记录
      addPointsRecord({
        type: 'spend',
        amount,
        purpose,
        timestamp: Date.now()
      })
      
      return true
    }
    return false
  }

  /**
   * 检查等级提升
   */
  const checkLevelUp = () => {
    const nextLevelConfig = levelConfig[achievement.value.currentLevel + 1]
    if (nextLevelConfig && points.value.current >= nextLevelConfig.minPoints) {
      achievement.value.currentLevel = nextLevelConfig.level
      achievement.value.levelName = nextLevelConfig.name
      achievement.value.levelIcon = nextLevelConfig.icon
      achievement.value.unlockedPrivileges = nextLevelConfig.privileges
      
      // 触发升级动画和奖励
      showLevelUpAnimation(nextLevelConfig)
    }
  }

  /**
   * 检查等级降低
   */
  const checkLevelDown = () => {
    const currentLevelConfig = levelConfig[achievement.value.currentLevel]
    if (points.value.current < currentLevelConfig.minPoints && achievement.value.currentLevel > 0) {
      const prevLevelConfig = levelConfig[achievement.value.currentLevel - 1]
      achievement.value.currentLevel = prevLevelConfig.level
      achievement.value.levelName = prevLevelConfig.name
      achievement.value.levelIcon = prevLevelConfig.icon
      achievement.value.unlockedPrivileges = prevLevelConfig.privileges
    }
  }

  /**
   * 显示升级动画
   */
  const showLevelUpAnimation = (levelConfig) => {
    // 这里可以触发升级动画事件
    console.log(`恭喜升级到 ${levelConfig.name}！`)
  }

  // 积分记录
  const pointsHistory = ref([])

  /**
   * 添加积分记录
   */
  const addPointsRecord = (record) => {
    pointsHistory.value.unshift({
      id: Date.now(),
      ...record
    })
    
    // 只保留最近100条记录
    if (pointsHistory.value.length > 100) {
      pointsHistory.value = pointsHistory.value.slice(0, 100)
    }
  }

  /**
   * 更新PK统计
   */
  const updatePKStats = (newStats) => {
    pkStats.value = { ...pkStats.value, ...newStats }
  }

  /**
   * 初始化用户数据
   */
  const initializeUser = () => {
    // 从localStorage加载用户数据
    const savedUserInfo = localStorage.getItem('userInfo')
    if (savedUserInfo) {
      userInfo.value = { ...userInfo.value, ...JSON.parse(savedUserInfo) }
    }
    
    const savedPoints = localStorage.getItem('userPoints')
    if (savedPoints) {
      points.value = { ...points.value, ...JSON.parse(savedPoints) }
    }
    
    const savedAchievement = localStorage.getItem('userAchievement')
    if (savedAchievement) {
      achievement.value = { ...achievement.value, ...JSON.parse(savedAchievement) }
    }
  }

  return {
    // 状态
    userInfo,
    points,
    achievement,
    levelConfig,
    pkStats,
    pointsHistory,
    
    // 计算属性
    levelProgress,
    nextLevelPoints,
    
    // 方法
    updateUserInfo,
    addPoints,
    spendPoints,
    updatePKStats,
    checkLevelUp,
    checkLevelDown,
    initializeUser
  }
})
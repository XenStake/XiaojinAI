<template>
  <div class="home-page container page-content-mobile">
    <!-- 欢迎区域 -->
    <div class="welcome-section">
      <div class="user-greeting">
        <div class="avatar-container">
          <img :src="userInfo.avatar" class="user-avatar" alt="用户头像" />
          <div class="online-indicator"></div>
          <!-- 学习提醒悬浮框 -->
          <div class="study-reminder-popup" v-if="showReminder" @click="handleReminderClick">
            <div class="reminder-popup-content">
              <div class="reminder-popup-icon">⏰</div>
              <div class="reminder-popup-text">学习提醒</div>
            </div>
          </div>
        </div>
        <div class="greeting-text">
          <h2 class="greeting-title">你好，{{ userInfo.name }}！</h2>
          <p class="greeting-subtitle">今天也要加油学习哦 📚</p>
        </div>
      </div>
      
      <!-- 今日学习统计 -->
      <div class="daily-stats">
        <div class="stats-container">
          <div class="stat-card">
            <div class="stat-icon completed">✅</div>
            <div class="stat-content">
              <div class="stat-number">{{ todayStats.completed }}</div>
              <div class="stat-label">今日完成</div>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon time">⏱️</div>
            <div class="stat-content">
              <div class="stat-number">{{ todayStats.timeSpent }}<span class="unit">分</span></div>
              <div class="stat-label">学习时长</div>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon accuracy">🎯</div>
            <div class="stat-content">
              <div class="stat-number">{{ todayStats.accuracy }}<span class="unit">%</span></div>
              <div class="stat-label">正确率</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 勤奋学生模块 -->
    <div class="diligent-student-section">
      <div class="section-header">
        <h3 class="section-title">📚 勤奋学生</h3>
        <div class="level-badge">
          <span class="level-icon">{{ achievement.levelIcon }}</span>
          <span class="level-name">{{ achievement.levelName }}</span>
          <span class="points-text">{{ points.current }}积分</span>
        </div>
      </div>
      <div class="student-actions">
        <div class="student-card" @click="goToReport">
          <div class="card-icon report">📊</div>
          <div class="card-content">
            <div class="card-title">学习报告</div>
            <div class="card-desc">查看学习进度和成绩</div>
          </div>
          <div class="card-arrow">></div>
        </div>
        <div class="student-card" @click="goToErrorBook">
          <div class="card-icon error">📖</div>
          <div class="card-content">
            <div class="card-title">错题本</div>
            <div class="card-desc">复习错题，巩固知识</div>
          </div>
          <div class="card-arrow">></div>
        </div>
      </div>
    </div>

    <!-- 快速开始模块 -->
    <div class="quick-functions">
      <h3 class="section-title">🚀 快速开始</h3>
      <div class="quick-start-container">
        <div class="quick-card" @click="goToCamera">
          <div class="quick-icon camera">📸</div>
          <div class="quick-content">
            <div class="quick-title">拍照检查</div>
            <div class="quick-desc">拍摄作业，AI智能批改</div>
          </div>
        </div>
        <div class="quick-card" @click="goToPK">
          <div class="quick-icon pk">⚔️</div>
          <div class="quick-content">
            <div class="quick-title">PK挑战</div>
            <div class="quick-desc">挑战AI老师，赢取积分</div>
          </div>
        </div>
        <div class="quick-card" @click="goToTutor">
          <div class="quick-icon tutor">🤖</div>
          <div class="quick-content">
            <div class="quick-title">AI辅导</div>
            <div class="quick-desc">一对一智能辅导</div>
          </div>
        </div>
        <div class="quick-card" @click="goToInvite">
          <div class="quick-icon invite">👥</div>
          <div class="quick-content">
            <div class="quick-title">邀请好友</div>
            <div class="quick-desc">邀请好友获得积分奖励</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 最近作业 -->
    <div class="recent-homework" v-if="recentItems.length > 0">
      <div class="section-header">
        <h3 class="section-title">📝 最近作业</h3>
        <button class="view-all-btn" @click="goToHomework">查看全部</button>
      </div>
      <div class="homework-list">
        <div 
          v-for="item in recentItems" 
          :key="item.id" 
          class="homework-item card"
          @click="viewDetail(item)"
        >
          <div class="item-icon">{{ item.subject === 'math' ? '🔢' : '📝' }}</div>
          <div class="item-content">
            <div class="item-title">{{ item.title }}</div>
            <div class="item-time">{{ formatTime(item.createdAt) }}</div>
          </div>
          <div class="item-result">
            <span :class="['result-badge', item.result]">{{ item.resultText }}</span>
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
import dayjs from 'dayjs'

/**
 * 首页组件
 * 展示用户信息、积分成就、快速功能入口等
 */

const router = useRouter()
const userStore = useUserStore()

// 响应式数据
const todayStats = ref({
  completed: 0, // 设为0以便测试学习提醒功能
  timeSpent: 45,
  accuracy: 85
})

const recentItems = ref([
  {
    id: '1',
    title: '数学作业 - 第3章练习',
    subject: 'math',
    result: 'good',
    resultText: '良好',
    createdAt: Date.now() - 3600000
  },
  {
    id: '2',
    title: '语文作业 - 古诗词背诵',
    subject: 'chinese',
    result: 'excellent',
    resultText: '优秀',
    createdAt: Date.now() - 7200000
  },
  {
    id: '3',
    title: '数学作业 - 应用题练习',
    subject: 'math',
    result: 'needs_improvement',
    resultText: '待提高',
    createdAt: Date.now() - 86400000
  }
])

// 学习提醒显示状态
const showReminder = ref(false)

// 计算属性
const userInfo = computed(() => userStore.userInfo)
const points = computed(() => userStore.points)
const achievement = computed(() => userStore.achievement)
const levelProgress = computed(() => userStore.levelProgress)
const nextLevelPoints = computed(() => userStore.nextLevelPoints)

// 方法
/**
 * 格式化时间显示
 */
const formatTime = (timestamp) => {
  const now = dayjs()
  const time = dayjs(timestamp)
  
  if (now.diff(time, 'day') === 0) {
    return time.format('HH:mm')
  } else if (now.diff(time, 'day') === 1) {
    return '昨天'
  } else if (now.diff(time, 'day') < 7) {
    return `${now.diff(time, 'day')}天前`
  } else {
    return time.format('MM-DD')
  }
}

/**
 * 查看作业详情
 */
const viewDetail = (item) => {
  // 这里可以跳转到作业详情页面
  console.log('查看作业详情:', item)
}

/**
 * 导航方法
 */
const goToCamera = () => router.push('/camera')
const goToPK = () => router.push('/pk-challenge')
const goToTutor = () => router.push('/tutor')
const goToShop = () => router.push('/shop')
const goToInvite = () => router.push('/invite')
const goToReport = () => router.push('/report')
const goToHomework = () => router.push('/homework')
const goToErrorBook = () => router.push('/error-book')

/**
 * 检查是否应该显示学习提醒
 */
const checkShouldShowReminder = () => {
  const today = dayjs().format('YYYY-MM-DD')
  const reminderData = JSON.parse(localStorage.getItem('studyReminder') || '{}')
  
  // 检查今天是否已经点击过提醒
  if (reminderData.clickedDate === today) {
    return false
  }
  
  // 检查今天是否已经完成学习任务
  if (todayStats.value.completed > 0) {
    return false
  }
  
  return true
}

/**
 * 处理学习提醒点击事件
 */
const handleReminderClick = () => {
  const today = dayjs().format('YYYY-MM-DD')
  
  // 记录今天已经点击过提醒
  localStorage.setItem('studyReminder', JSON.stringify({
    clickedDate: today
  }))
  
  // 隐藏提醒
  showReminder.value = false
  
  // 跳转到拍照检查页面
  router.push('/camera')
}

/**
 * 开始学习（保留原方法以防其他地方调用）
 */
const startStudy = () => {
  handleReminderClick()
}

/**
 * 组件挂载时的初始化
 */
onMounted(() => {
  // 检查是否应该显示学习提醒
  showReminder.value = checkShouldShowReminder()
  
  // 可以在这里加载用户数据、统计信息等
  console.log('首页加载完成')
})
</script>

<style scoped>
.home-page {
  padding-bottom: 90px; /* 为底部导航留出空间 */
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
}

/* 欢迎区域 */
.welcome-section {
  margin-bottom: var(--spacing-lg);
}

.user-greeting {
  display: flex;
  align-items: center;
  margin-bottom: var(--spacing-md);
}

.avatar-container {
  position: relative;
  margin-right: var(--spacing-md);
}

/* 学习提醒悬浮框 */
.study-reminder-popup {
  position: absolute;
  top: -8px;
  right: -8px;
  z-index: 100;
  cursor: pointer;
  animation: reminderPulse 2s infinite;
}

.reminder-popup-content {
  background: linear-gradient(135deg, #FF6B6B 0%, #FF8E53 100%);
  color: white;
  padding: 6px 10px;
  border-radius: 20px;
  display: flex;
  align-items: center;
  gap: 4px;
  box-shadow: 0 4px 12px rgba(255, 107, 107, 0.4);
  border: 2px solid white;
  font-size: 12px;
  font-weight: 600;
  min-width: 80px;
  justify-content: center;
}

.reminder-popup-icon {
  font-size: 14px;
  animation: reminderShake 1s infinite;
}

.reminder-popup-text {
  font-size: 11px;
  white-space: nowrap;
}

/* 提醒动画效果 */
@keyframes reminderPulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
}

@keyframes reminderShake {
  0%, 100% {
    transform: rotate(0deg);
  }
  25% {
    transform: rotate(-10deg);
  }
  75% {
    transform: rotate(10deg);
  }
}

.study-reminder-popup:hover .reminder-popup-content {
  transform: scale(1.05);
  box-shadow: 0 6px 16px rgba(255, 107, 107, 0.5);
}

.user-avatar {
  width: 60px;
  height: 60px;
  border-radius: var(--border-radius-round);
  border: 3px solid var(--primary-color);
  object-fit: cover;
}

.online-indicator {
  position: absolute;
  bottom: 2px;
  right: 2px;
  width: 16px;
  height: 16px;
  background-color: var(--success-color);
  border-radius: var(--border-radius-round);
  border: 2px solid white;
}

.greeting-text {
  flex: 1;
}

.greeting-title {
  font-size: var(--font-size-xl);
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 var(--spacing-xs) 0;
}

.greeting-subtitle {
  font-size: var(--font-size-md);
  color: var(--text-secondary);
  margin: 0;
}

/* 今日统计 */
.daily-stats {
  background: white;
  padding: var(--spacing-lg);
  border-radius: var(--border-radius-lg);
  box-shadow: var(--shadow-md);
  margin-bottom: var(--spacing-md);
}

.stats-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: var(--spacing-md);
}

.stat-card {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: var(--spacing-md);
  border-radius: var(--border-radius-md);
  background: linear-gradient(135deg, #f8f9ff 0%, #f0f4ff 100%);
  border: 1px solid rgba(74, 144, 226, 0.1);
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.stat-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, #4A90E2, #66BB6A, #FF8A65);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 25px rgba(74, 144, 226, 0.15);
}

.stat-card:hover::before {
  opacity: 1;
}

.stat-card:nth-child(1)::before {
  background: linear-gradient(90deg, #4CAF50, #66BB6A);
}

.stat-card:nth-child(2)::before {
  background: linear-gradient(90deg, #FF9800, #FFB74D);
}

.stat-card:nth-child(3)::before {
  background: linear-gradient(90deg, #2196F3, #42A5F5);
}

.stat-icon {
  font-size: 32px;
  margin-bottom: var(--spacing-sm);
  display: flex;
  align-items: center;
  justify-content: center;
  width: 50px;
  height: 50px;
  border-radius: var(--border-radius-round);
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10px);
}

.stat-icon.completed {
  background: linear-gradient(135deg, #4CAF50, #66BB6A);
  color: white;
}

.stat-icon.time {
  background: linear-gradient(135deg, #FF9800, #FFB74D);
  color: white;
}

.stat-icon.accuracy {
  background: linear-gradient(135deg, #2196F3, #42A5F5);
  color: white;
}

.stat-content {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.stat-number {
  font-size: var(--font-size-xxl);
  font-weight: 700;
  color: var(--text-primary);
  line-height: 1;
  margin-bottom: var(--spacing-xs);
}

.stat-number .unit {
  font-size: var(--font-size-md);
  font-weight: 500;
  color: var(--text-secondary);
  margin-left: 2px;
}

.stat-label {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  font-weight: 500;
  letter-spacing: 0.5px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .stats-container {
    gap: var(--spacing-sm);
  }
  
  .stat-card {
    padding: var(--spacing-sm);
  }
  
  .stat-icon {
    font-size: 24px;
    width: 40px;
    height: 40px;
  }
  
  .stat-number {
    font-size: var(--font-size-lg);
  }
  
  .stat-label {
    font-size: var(--font-size-xs);
  }
}

@media (max-width: 480px) {
  .daily-stats {
    padding: var(--spacing-md);
  }
  
  .stats-container {
    gap: var(--spacing-xs);
  }
  
  .stat-card {
    padding: var(--spacing-xs);
  }
  
  .stat-icon {
    font-size: 20px;
    width: 35px;
    height: 35px;
    margin-bottom: var(--spacing-xs);
  }
  
  .stat-number {
    font-size: var(--font-size-md);
  }
  
  .stat-label {
    font-size: 10px;
  }
}

/* 勤奋学生模块 */
.diligent-student-section {
  margin-bottom: var(--spacing-lg);
}

.diligent-student-section .section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-md);
  padding: 0 var(--spacing-xs);
}

.level-badge {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  background: linear-gradient(135deg, var(--primary-color), var(--primary-light));
  color: white;
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--border-radius-lg);
  font-size: var(--font-size-sm);
  font-weight: 500;
}

.level-icon {
  font-size: 16px;
}

.level-name {
  font-weight: 600;
}

.points-text {
  opacity: 0.9;
}

.student-actions {
  display: flex;
  gap: var(--spacing-md);
}

.student-card {
  flex: 1;
  background: white;
  border-radius: var(--border-radius-lg);
  padding: var(--spacing-lg);
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--border);
  position: relative;
  overflow: hidden;
}

.student-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, #4A90E2, #66BB6A);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.student-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-md);
}

.student-card:hover::before {
  opacity: 1;
}

.student-card:nth-child(1)::before {
  background: linear-gradient(90deg, #2196F3, #42A5F5);
}

.student-card:nth-child(2)::before {
  background: linear-gradient(90deg, #FF9800, #FFB74D);
}

.card-icon {
  width: 50px;
  height: 50px;
  border-radius: var(--border-radius-round);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  color: white;
  flex-shrink: 0;
}

.card-icon.report {
  background: linear-gradient(135deg, #2196F3, #42A5F5);
}

.card-icon.error {
  background: linear-gradient(135deg, #FF9800, #FFB74D);
}

.card-content {
  flex: 1;
}

.card-title {
  font-size: var(--font-size-md);
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: var(--spacing-xs);
}

.card-desc {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  line-height: var(--line-height-normal);
}

.card-arrow {
  font-size: var(--font-size-lg);
  color: var(--text-secondary);
  opacity: 0.6;
  transition: all 0.3s ease;
}

.student-card:hover .card-arrow {
  opacity: 1;
  transform: translateX(4px);
}

/* 响应式设计 - 勤奋学生模块 */
@media (max-width: 768px) {
  .student-actions {
    flex-direction: column;
    gap: var(--spacing-sm);
  }
  
  .student-card {
    padding: var(--spacing-md);
  }
  
  .card-icon {
    width: 40px;
    height: 40px;
    font-size: 20px;
  }
}

/* 快速开始模块 */
.quick-functions {
  margin-bottom: var(--spacing-lg);
}

.section-title {
  font-size: var(--font-size-lg);
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 var(--spacing-md) 0;
}

.quick-start-container {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--spacing-md);
}

.quick-card {
  background: white;
  border-radius: var(--border-radius-lg);
  padding: var(--spacing-lg);
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--border);
  position: relative;
  overflow: hidden;
}

.quick-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.quick-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-md);
}

.quick-card:hover::before {
  opacity: 1;
}

.quick-card:nth-child(1)::before {
  background: linear-gradient(90deg, #FF8A65, #FFB74D);
}

.quick-card:nth-child(2)::before {
  background: linear-gradient(90deg, #E91E63, #F06292);
}

.quick-card:nth-child(3)::before {
  background: linear-gradient(90deg, #66BB6A, #81C784);
}

.quick-card:nth-child(4)::before {
  background: linear-gradient(90deg, #42A5F5, #64B5F6);
}

.quick-icon {
  width: 60px;
  height: 60px;
  border-radius: var(--border-radius-round);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  color: white;
  margin-bottom: var(--spacing-md);
}

.quick-icon.camera {
  background: linear-gradient(135deg, #FF8A65, #FFB74D);
}

.quick-icon.pk {
  background: linear-gradient(135deg, #E91E63, #F06292);
}

.quick-icon.tutor {
  background: linear-gradient(135deg, #66BB6A, #81C784);
}

.quick-icon.invite {
  background: linear-gradient(135deg, #42A5F5, #64B5F6);
}

.quick-content {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.quick-title {
  font-size: var(--font-size-md);
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: var(--spacing-xs);
}

.quick-desc {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  line-height: var(--line-height-normal);
}

/* 响应式设计 - 快速开始模块 */
@media (max-width: 768px) {
  .quick-start-container {
    grid-template-columns: repeat(2, 1fr);
    gap: var(--spacing-sm);
  }
  
  .quick-card {
    padding: var(--spacing-md);
  }
  
  .quick-icon {
    width: 50px;
    height: 50px;
    font-size: 24px;
    margin-bottom: var(--spacing-sm);
  }
  
  .quick-title {
    font-size: var(--font-size-sm);
  }
  
  .quick-desc {
    font-size: var(--font-size-xs);
  }
}

@media (max-width: 480px) {
  .quick-start-container {
    grid-template-columns: 1fr;
  }
  
  .quick-card {
    flex-direction: row;
    text-align: left;
    padding: var(--spacing-md);
  }
  
  .quick-icon {
    margin-bottom: 0;
    margin-right: var(--spacing-md);
    flex-shrink: 0;
  }
  
  .quick-content {
    align-items: flex-start;
    flex: 1;
  }
}

/* 最近作业 */
.recent-homework {
  margin-bottom: var(--spacing-lg);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-md);
}

.view-all-btn {
  background: none;
  border: none;
  color: var(--primary-color);
  font-size: var(--font-size-sm);
  cursor: pointer;
  padding: var(--spacing-xs);
}

.homework-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.homework-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  cursor: pointer;
  transition: all 0.2s ease;
}

.homework-item:hover {
  transform: translateX(4px);
}

.item-icon {
  font-size: 24px;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--background);
  border-radius: var(--border-radius-md);
}

.item-content {
  flex: 1;
}

.item-title {
  font-size: var(--font-size-md);
  font-weight: 500;
  color: var(--text-primary);
  margin-bottom: 2px;
}

.item-time {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
}

.result-badge {
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--border-radius-sm);
  font-size: var(--font-size-xs);
  font-weight: 500;
}

.result-badge.excellent {
  background-color: var(--success-color);
  color: white;
}

.result-badge.good {
  background-color: var(--info-color);
  color: white;
}

.result-badge.needs_improvement {
  background-color: var(--warning-color);
  color: white;
}



/* 移动端优化 */
@media (max-width: 768px) {
  .achievement-header {
    flex-direction: column;
    gap: var(--spacing-md);
    text-align: center;
  }
  
  .level-progress {
    justify-content: center;
  }
  
  .study-reminder-popup {
    top: -6px;
    right: -6px;
  }
  
  .reminder-popup-content {
    padding: 4px 8px;
    font-size: 10px;
    min-width: 70px;
  }
  
  .reminder-popup-icon {
    font-size: 12px;
  }
  
  .reminder-popup-text {
    font-size: 9px;
  }
}
</style>
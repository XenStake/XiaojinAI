<template>
  <div class="homework-page container page-content-mobile">
    <!-- 页面标题 -->
    <div class="page-header">
      <h1 class="page-title">📚 最近作业</h1>
      <p class="page-subtitle">查看和管理你的学习作业</p>
    </div>

    <!-- 作业筛选 -->
    <div class="filter-section">
      <div class="filter-tabs">
        <button 
          v-for="tab in filterTabs" 
          :key="tab.key"
          :class="['filter-tab', { active: activeFilter === tab.key }]"
          @click="setActiveFilter(tab.key)"
        >
          <span class="tab-icon">{{ tab.icon }}</span>
          <span class="tab-text">{{ tab.label }}</span>
          <span class="tab-count">{{ getFilterCount(tab.key) }}</span>
        </button>
      </div>
    </div>

    <!-- 作业统计 -->
    <div class="stats-section">
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon">📝</div>
          <div class="stat-content">
            <div class="stat-number">{{ homeworkStats.total }}</div>
            <div class="stat-label">总作业数</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">✅</div>
          <div class="stat-content">
            <div class="stat-number">{{ homeworkStats.completed }}</div>
            <div class="stat-label">已完成</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">⏰</div>
          <div class="stat-content">
            <div class="stat-number">{{ homeworkStats.pending }}</div>
            <div class="stat-label">待完成</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">⚠️</div>
          <div class="stat-content">
            <div class="stat-number">{{ homeworkStats.overdue }}</div>
            <div class="stat-label">已逾期</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 作业列表 -->
    <div class="homework-section">
      <div class="section-header">
        <h2 class="section-title">作业列表</h2>
        <div class="sort-controls">
          <select v-model="sortBy" class="sort-select">
            <option value="dueDate">按截止时间</option>
            <option value="createDate">按创建时间</option>
            <option value="subject">按学科分类</option>
            <option value="difficulty">按难度等级</option>
          </select>
        </div>
      </div>
      
      <div class="homework-list" v-if="filteredHomework.length > 0">
        <div 
          v-for="homework in filteredHomework" 
          :key="homework.id" 
          class="homework-item card"
          @click="viewHomework(homework)"
        >
          <div class="homework-header">
            <div class="homework-subject">
              <span class="subject-icon">{{ getSubjectIcon(homework.subject) }}</span>
              <span class="subject-name">{{ homework.subject }}</span>
            </div>
            <div :class="['homework-status', homework.status]">{{ getStatusText(homework.status) }}</div>
          </div>
          
          <div class="homework-content">
            <h3 class="homework-title">{{ homework.title }}</h3>
            <p class="homework-description">{{ homework.description }}</p>
            
            <div class="homework-meta">
              <div class="meta-item">
                <span class="meta-icon">📅</span>
                <span class="meta-text">创建：{{ formatDate(homework.createDate) }}</span>
              </div>
              <div class="meta-item">
                <span class="meta-icon">⏰</span>
                <span class="meta-text">截止：{{ formatDate(homework.dueDate) }}</span>
              </div>
              <div class="meta-item">
                <span class="meta-icon">⭐</span>
                <span class="meta-text">难度：{{ getDifficultyText(homework.difficulty) }}</span>
              </div>
            </div>
          </div>
          
          <div class="homework-progress" v-if="homework.status === 'in-progress'">
            <div class="progress-bar">
              <div 
                class="progress-fill" 
                :style="{ width: homework.progress + '%' }"
              ></div>
            </div>
            <span class="progress-text">{{ homework.progress }}%</span>
          </div>
          
          <div class="homework-actions">
            <button 
              v-if="homework.status === 'pending' || homework.status === 'in-progress'"
              class="action-btn primary"
              @click.stop="startHomework(homework)"
            >
              {{ homework.status === 'pending' ? '开始作业' : '继续作业' }}
            </button>
            <button 
              v-if="homework.status === 'completed'"
              class="action-btn secondary"
              @click.stop="reviewHomework(homework)"
            >
              查看详情
            </button>
            <button 
              v-if="homework.status === 'overdue'"
              class="action-btn warning"
              @click.stop="retryHomework(homework)"
            >
              重新提交
            </button>
            <button 
              class="action-btn outline"
              @click.stop="shareHomework(homework)"
            >
              分享
            </button>
          </div>
        </div>
      </div>
      
      <div class="empty-state" v-else>
        <div class="empty-icon">📭</div>
        <p class="empty-text">暂无{{ getFilterText(activeFilter) }}作业</p>
        <p class="empty-desc">完成更多学习任务来获得作业吧！</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import dayjs from 'dayjs'

/**
 * 最近作业页面组件
 * 展示用户的学习作业列表和统计信息
 */

// 响应式数据
const activeFilter = ref('all')
const sortBy = ref('dueDate')

const filterTabs = [
  { key: 'all', label: '全部', icon: '📚' },
  { key: 'pending', label: '待完成', icon: '⏰' },
  { key: 'in-progress', label: '进行中', icon: '📝' },
  { key: 'completed', label: '已完成', icon: '✅' },
  { key: 'overdue', label: '已逾期', icon: '⚠️' }
]

const homeworkList = ref([
  {
    id: '1',
    title: '数学函数综合练习',
    description: '包含一次函数、二次函数和反比例函数的综合应用题',
    subject: '数学',
    difficulty: 3,
    status: 'pending',
    progress: 0,
    createDate: Date.now() - 86400000,
    dueDate: Date.now() + 172800000,
    totalQuestions: 20,
    completedQuestions: 0
  },
  {
    id: '2',
    title: '英语阅读理解训练',
    description: '科技类文章阅读理解，提升词汇量和理解能力',
    subject: '英语',
    difficulty: 2,
    status: 'in-progress',
    progress: 65,
    createDate: Date.now() - 172800000,
    dueDate: Date.now() + 86400000,
    totalQuestions: 15,
    completedQuestions: 10
  },
  {
    id: '3',
    title: '物理力学基础',
    description: '牛顿定律和力的分析，包含实验题和计算题',
    subject: '物理',
    difficulty: 4,
    status: 'completed',
    progress: 100,
    createDate: Date.now() - 259200000,
    dueDate: Date.now() - 86400000,
    totalQuestions: 12,
    completedQuestions: 12,
    score: 85
  },
  {
    id: '4',
    title: '化学方程式配平',
    description: '化学反应方程式的配平方法和技巧练习',
    subject: '化学',
    difficulty: 2,
    status: 'overdue',
    progress: 30,
    createDate: Date.now() - 345600000,
    dueDate: Date.now() - 172800000,
    totalQuestions: 25,
    completedQuestions: 8
  },
  {
    id: '5',
    title: '语文古诗词鉴赏',
    description: '唐宋诗词的意境分析和表现手法理解',
    subject: '语文',
    difficulty: 3,
    status: 'completed',
    progress: 100,
    createDate: Date.now() - 432000000,
    dueDate: Date.now() - 259200000,
    totalQuestions: 10,
    completedQuestions: 10,
    score: 92
  }
])

// 计算属性
const homeworkStats = computed(() => {
  const total = homeworkList.value.length
  const completed = homeworkList.value.filter(h => h.status === 'completed').length
  const pending = homeworkList.value.filter(h => h.status === 'pending').length
  const overdue = homeworkList.value.filter(h => h.status === 'overdue').length
  
  return { total, completed, pending, overdue }
})

const filteredHomework = computed(() => {
  let filtered = homeworkList.value
  
  // 按状态筛选
  if (activeFilter.value !== 'all') {
    filtered = filtered.filter(h => h.status === activeFilter.value)
  }
  
  // 排序
  filtered.sort((a, b) => {
    switch (sortBy.value) {
      case 'dueDate':
        return a.dueDate - b.dueDate
      case 'createDate':
        return b.createDate - a.createDate
      case 'subject':
        return a.subject.localeCompare(b.subject)
      case 'difficulty':
        return b.difficulty - a.difficulty
      default:
        return 0
    }
  })
  
  return filtered
})

// 方法
/**
 * 设置活动筛选器
 */
const setActiveFilter = (filter) => {
  activeFilter.value = filter
}

/**
 * 获取筛选器对应的数量
 */
const getFilterCount = (filter) => {
  if (filter === 'all') return homeworkList.value.length
  return homeworkList.value.filter(h => h.status === filter).length
}

/**
 * 获取筛选器文本
 */
const getFilterText = (filter) => {
  const tab = filterTabs.find(t => t.key === filter)
  return tab ? tab.label : ''
}

/**
 * 获取学科图标
 */
const getSubjectIcon = (subject) => {
  const icons = {
    '数学': '🔢',
    '英语': '🔤',
    '物理': '⚛️',
    '化学': '🧪',
    '语文': '📖',
    '历史': '📜',
    '地理': '🌍',
    '生物': '🧬'
  }
  return icons[subject] || '📚'
}

/**
 * 获取状态文本
 */
const getStatusText = (status) => {
  const statusMap = {
    'pending': '待完成',
    'in-progress': '进行中',
    'completed': '已完成',
    'overdue': '已逾期'
  }
  return statusMap[status] || status
}

/**
 * 获取难度文本
 */
const getDifficultyText = (difficulty) => {
  const levels = ['', '简单', '一般', '中等', '困难', '极难']
  return levels[difficulty] || '未知'
}

/**
 * 格式化日期
 */
const formatDate = (timestamp) => {
  return dayjs(timestamp).format('MM-DD HH:mm')
}

/**
 * 查看作业详情
 */
const viewHomework = (homework) => {
  console.log('查看作业:', homework.title)
  // 这里可以跳转到作业详情页面
}

/**
 * 开始作业
 */
const startHomework = (homework) => {
  console.log('开始作业:', homework.title)
  // 这里可以跳转到作业答题页面
  alert(`开始作业：${homework.title}`)
}

/**
 * 查看作业详情
 */
const reviewHomework = (homework) => {
  console.log('查看作业详情:', homework.title)
  alert(`作业详情：${homework.title}\n得分：${homework.score}分`)
}

/**
 * 重新提交作业
 */
const retryHomework = (homework) => {
  console.log('重新提交作业:', homework.title)
  alert(`重新提交作业：${homework.title}`)
}

/**
 * 分享作业
 */
const shareHomework = (homework) => {
  console.log('分享作业:', homework.title)
  alert(`分享作业：${homework.title}`)
}

/**
 * 组件挂载时的初始化
 */
onMounted(() => {
  console.log('最近作业页面加载完成')
})
</script>

<style scoped>
.homework-page {
  padding-bottom: 90px;
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
}

/* 页面标题 */
.page-header {
  text-align: center;
  margin-bottom: var(--spacing-lg);
  padding: var(--spacing-lg) 0;
}

.page-title {
  font-size: var(--font-size-xxl);
  font-weight: 700;
  color: var(--text-primary);
  margin: 0 0 var(--spacing-sm) 0;
}

.page-subtitle {
  font-size: var(--font-size-md);
  color: var(--text-secondary);
  margin: 0;
}

/* 筛选标签 */
.filter-section {
  margin-bottom: var(--spacing-lg);
}

.filter-tabs {
  display: flex;
  gap: var(--spacing-xs);
  overflow-x: auto;
  padding: var(--spacing-xs);
  background: white;
  border-radius: var(--border-radius-lg);
  box-shadow: var(--shadow-sm);
}

.filter-tab {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  padding: var(--spacing-sm) var(--spacing-md);
  border: none;
  border-radius: var(--border-radius-md);
  background: transparent;
  color: var(--text-secondary);
  font-size: var(--font-size-sm);
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
  min-width: fit-content;
}

.filter-tab:hover {
  background: var(--bg-secondary);
  color: var(--text-primary);
}

.filter-tab.active {
  background: var(--primary-color);
  color: white;
}

.tab-icon {
  font-size: 16px;
}

.tab-count {
  background: rgba(255, 255, 255, 0.2);
  padding: 2px 6px;
  border-radius: var(--border-radius-sm);
  font-size: var(--font-size-xs);
  font-weight: 600;
}

.filter-tab.active .tab-count {
  background: rgba(255, 255, 255, 0.3);
}

/* 统计卡片 */
.stats-section {
  margin-bottom: var(--spacing-lg);
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--spacing-sm);
}

.stat-card {
  background: white;
  padding: var(--spacing-md);
  border-radius: var(--border-radius-lg);
  box-shadow: var(--shadow-sm);
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: var(--spacing-xs);
  transition: all 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.stat-icon {
  font-size: 24px;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #f8f9ff 0%, #f0f4ff 100%);
  border-radius: var(--border-radius-round);
}

.stat-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
}

.stat-number {
  font-size: var(--font-size-lg);
  font-weight: 700;
  color: var(--primary-color);
}

.stat-label {
  font-size: var(--font-size-xs);
  color: var(--text-secondary);
}

/* 作业区块 */
.homework-section {
  margin-bottom: var(--spacing-xl);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-md);
}

.section-title {
  font-size: var(--font-size-lg);
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.section-title::before {
  content: '';
  width: 4px;
  height: 20px;
  background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
  border-radius: 2px;
}

.sort-controls {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.sort-select {
  padding: var(--spacing-xs) var(--spacing-sm);
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius-md);
  background: white;
  font-size: var(--font-size-sm);
  color: var(--text-primary);
  cursor: pointer;
}

/* 作业列表 */
.homework-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.homework-item {
  padding: var(--spacing-lg);
  cursor: pointer;
  transition: all 0.2s ease;
  border-left: 4px solid transparent;
}

.homework-item:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
  border-left-color: var(--primary-color);
}

.homework-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-md);
}

.homework-subject {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
}

.subject-icon {
  font-size: 20px;
}

.subject-name {
  font-size: var(--font-size-sm);
  font-weight: 600;
  color: var(--text-secondary);
}

.homework-status {
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--border-radius-sm);
  font-size: var(--font-size-xs);
  font-weight: 500;
}

.homework-status.pending {
  background-color: var(--warning-light);
  color: var(--warning-color);
}

.homework-status.in-progress {
  background-color: var(--info-light);
  color: var(--info-color);
}

.homework-status.completed {
  background-color: var(--success-light);
  color: var(--success-color);
}

.homework-status.overdue {
  background-color: var(--error-light);
  color: var(--error-color);
}

.homework-content {
  margin-bottom: var(--spacing-md);
}

.homework-title {
  font-size: var(--font-size-lg);
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 var(--spacing-sm) 0;
}

.homework-description {
  font-size: var(--font-size-md);
  color: var(--text-secondary);
  line-height: 1.5;
  margin: 0 0 var(--spacing-md) 0;
}

.homework-meta {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-md);
}

.meta-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
}

.meta-icon {
  font-size: 14px;
}

.meta-text {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
}

/* 进度条 */
.homework-progress {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-md);
}

.progress-bar {
  flex: 1;
  height: 8px;
  background: var(--bg-secondary);
  border-radius: var(--border-radius-sm);
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--primary-color), var(--secondary-color));
  border-radius: var(--border-radius-sm);
  transition: width 0.3s ease;
}

.progress-text {
  font-size: var(--font-size-sm);
  font-weight: 600;
  color: var(--primary-color);
  min-width: 40px;
}

/* 作业操作按钮 */
.homework-actions {
  display: flex;
  gap: var(--spacing-sm);
  flex-wrap: wrap;
}

.action-btn {
  padding: var(--spacing-xs) var(--spacing-md);
  border: none;
  border-radius: var(--border-radius-md);
  font-size: var(--font-size-sm);
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.action-btn.primary {
  background: var(--primary-color);
  color: white;
}

.action-btn.primary:hover {
  background: var(--primary-dark);
}

.action-btn.secondary {
  background: var(--secondary-color);
  color: white;
}

.action-btn.secondary:hover {
  background: var(--secondary-dark);
}

.action-btn.warning {
  background: var(--warning-color);
  color: white;
}

.action-btn.warning:hover {
  background: var(--warning-dark);
}

.action-btn.outline {
  background: transparent;
  color: var(--text-secondary);
  border: 1px solid var(--border-color);
}

.action-btn.outline:hover {
  background: var(--bg-secondary);
  color: var(--text-primary);
}

/* 空状态 */
.empty-state {
  text-align: center;
  padding: var(--spacing-xl) 0;
  color: var(--text-secondary);
}

.empty-icon {
  font-size: 48px;
  margin-bottom: var(--spacing-md);
}

.empty-text {
  font-size: var(--font-size-md);
  margin-bottom: var(--spacing-sm);
}

.empty-desc {
  font-size: var(--font-size-sm);
}

/* 移动端优化 */
@media (max-width: 768px) {
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .section-header {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--spacing-sm);
  }
  
  .homework-meta {
    flex-direction: column;
    gap: var(--spacing-xs);
  }
  
  .homework-actions {
    justify-content: flex-start;
  }
  
  .action-btn {
    flex: 1;
    min-width: 80px;
  }
}

@media (max-width: 480px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
  .filter-tabs {
    justify-content: flex-start;
  }
}
</style>
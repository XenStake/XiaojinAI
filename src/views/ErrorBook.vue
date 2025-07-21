<template>
  <div class="error-book-page container page-content-mobile">
    <!-- 页面标题 -->
    <div class="page-header">
      <h1 class="page-title">📖 错题本</h1>
      <p class="page-subtitle">复习错题，巩固知识点</p>
    </div>

    <!-- 错题统计 -->
    <div class="stats-section">
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon">❌</div>
          <div class="stat-content">
            <div class="stat-number">{{ errorStats.total }}</div>
            <div class="stat-label">总错题数</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">✅</div>
          <div class="stat-content">
            <div class="stat-number">{{ errorStats.mastered }}</div>
            <div class="stat-label">已掌握</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">📚</div>
          <div class="stat-content">
            <div class="stat-number">{{ errorStats.reviewing }}</div>
            <div class="stat-label">复习中</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">🔥</div>
          <div class="stat-content">
            <div class="stat-number">{{ errorStats.streak }}</div>
            <div class="stat-label">连续天数</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 学科筛选 -->
    <div class="filter-section">
      <div class="filter-tabs">
        <button 
          v-for="subject in subjects" 
          :key="subject.key"
          :class="['filter-tab', { active: activeSubject === subject.key }]"
          @click="setActiveSubject(subject.key)"
        >
          <span class="tab-icon">{{ subject.icon }}</span>
          <span class="tab-text">{{ subject.label }}</span>
          <span class="tab-count">{{ getSubjectCount(subject.key) }}</span>
        </button>
      </div>
    </div>

    <!-- 错题列表 -->
    <div class="error-list-section">
      <div class="section-header">
        <h2 class="section-title">错题列表</h2>
        <div class="sort-controls">
          <select v-model="sortBy" class="sort-select">
            <option value="date">按时间排序</option>
            <option value="difficulty">按难度排序</option>
            <option value="frequency">按错误次数</option>
            <option value="mastery">按掌握程度</option>
          </select>
        </div>
      </div>
      
      <div class="error-list" v-if="filteredErrors.length > 0">
        <div 
          v-for="error in filteredErrors" 
          :key="error.id" 
          class="error-item card"
          @click="viewErrorDetail(error)"
        >
          <div class="error-header">
            <div class="error-subject">
              <span class="subject-icon">{{ getSubjectIcon(error.subject) }}</span>
              <span class="subject-name">{{ error.subject }}</span>
            </div>
            <div :class="['error-status', error.status]">{{ getStatusText(error.status) }}</div>
          </div>
          
          <div class="error-content">
            <div class="error-question">
              <h3 class="question-title">{{ error.question }}</h3>
              <div class="question-type">{{ error.type }} · {{ getDifficultyText(error.difficulty) }}</div>
            </div>
            
            <div class="error-details">
              <div class="detail-row">
                <span class="detail-label">错误次数：</span>
                <span class="detail-value error-count">{{ error.errorCount }}次</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">最近错误：</span>
                <span class="detail-value">{{ formatDate(error.lastErrorDate) }}</span>
              </div>
              <div class="detail-row" v-if="error.knowledgePoints.length > 0">
                <span class="detail-label">知识点：</span>
                <div class="knowledge-points">
                  <span 
                    v-for="point in error.knowledgePoints" 
                    :key="point"
                    class="knowledge-point"
                  >
                    {{ point }}
                  </span>
                </div>
              </div>
            </div>
          </div>
          
          <div class="error-progress" v-if="error.status === 'reviewing'">
            <div class="progress-bar">
              <div 
                class="progress-fill" 
                :style="{ width: error.masteryLevel + '%' }"
              ></div>
            </div>
            <span class="progress-text">掌握度 {{ error.masteryLevel }}%</span>
          </div>
          
          <div class="error-actions">
            <button 
              class="action-btn primary"
              @click.stop="practiceError(error)"
            >
              {{ error.status === 'new' ? '开始练习' : '继续练习' }}
            </button>
            <button 
              class="action-btn secondary"
              @click.stop="viewExplanation(error)"
            >
              查看解析
            </button>
            <button 
              v-if="error.status === 'mastered'"
              class="action-btn success"
              @click.stop="reviewError(error)"
            >
              复习巩固
            </button>
            <button 
              class="action-btn outline"
              @click.stop="addToFavorites(error)"
            >
              {{ error.isFavorite ? '取消收藏' : '收藏' }}
            </button>
          </div>
        </div>
      </div>
      
      <div class="empty-state" v-else>
        <div class="empty-icon">🎉</div>
        <p class="empty-text">暂无{{ getSubjectText(activeSubject) }}错题</p>
        <p class="empty-desc">继续学习，遇到错题会自动收录到这里</p>
      </div>
    </div>

    <!-- 学习建议 -->
    <div class="suggestion-section" v-if="suggestions.length > 0">
      <h2 class="section-title">学习建议</h2>
      <div class="suggestion-list">
        <div 
          v-for="suggestion in suggestions" 
          :key="suggestion.id"
          class="suggestion-item card"
        >
          <div class="suggestion-icon">{{ suggestion.icon }}</div>
          <div class="suggestion-content">
            <div class="suggestion-title">{{ suggestion.title }}</div>
            <div class="suggestion-desc">{{ suggestion.description }}</div>
          </div>
          <button 
            class="suggestion-btn"
            @click="applySuggestion(suggestion)"
          >
            去练习
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import dayjs from 'dayjs'

/**
 * 错题本页面组件
 * 展示用户的错题记录和学习建议
 */

// 响应式数据
const activeSubject = ref('all')
const sortBy = ref('date')

const subjects = [
  { key: 'all', label: '全部', icon: '📚' },
  { key: '数学', label: '数学', icon: '🔢' },
  { key: '英语', label: '英语', icon: '🔤' },
  { key: '物理', label: '物理', icon: '⚛️' },
  { key: '化学', label: '化学', icon: '🧪' },
  { key: '语文', label: '语文', icon: '📖' }
]

const errorList = ref([
  {
    id: '1',
    question: '已知函数f(x)=x²-2x+1，求f(x)的最小值',
    subject: '数学',
    type: '函数题',
    difficulty: 3,
    status: 'reviewing',
    errorCount: 3,
    masteryLevel: 65,
    lastErrorDate: Date.now() - 86400000,
    knowledgePoints: ['二次函数', '函数最值', '配方法'],
    isFavorite: true
  },
  {
    id: '2',
    question: 'The book _____ I bought yesterday is very interesting.',
    subject: '英语',
    type: '语法填空',
    difficulty: 2,
    status: 'new',
    errorCount: 1,
    masteryLevel: 0,
    lastErrorDate: Date.now() - 172800000,
    knowledgePoints: ['定语从句', '关系代词'],
    isFavorite: false
  },
  {
    id: '3',
    question: '一个物体从高度h处自由落下，求落地时的速度',
    subject: '物理',
    type: '计算题',
    difficulty: 2,
    status: 'mastered',
    errorCount: 2,
    masteryLevel: 95,
    lastErrorDate: Date.now() - 259200000,
    knowledgePoints: ['自由落体运动', '运动学公式'],
    isFavorite: false
  },
  {
    id: '4',
    question: '配平化学方程式：Al + HCl → AlCl₃ + H₂',
    subject: '化学',
    type: '方程式配平',
    difficulty: 2,
    status: 'reviewing',
    errorCount: 4,
    masteryLevel: 40,
    lastErrorDate: Date.now() - 345600000,
    knowledgePoints: ['化学方程式', '配平方法'],
    isFavorite: true
  },
  {
    id: '5',
    question: '分析《静夜思》中"举头望明月，低头思故乡"的表现手法',
    subject: '语文',
    type: '诗歌鉴赏',
    difficulty: 3,
    status: 'mastered',
    errorCount: 1,
    masteryLevel: 90,
    lastErrorDate: Date.now() - 432000000,
    knowledgePoints: ['诗歌鉴赏', '表现手法', '对比'],
    isFavorite: false
  }
])

const suggestions = ref([
  {
    id: '1',
    icon: '🔢',
    title: '加强二次函数练习',
    description: '你在二次函数相关题目上错误较多，建议重点复习',
    subject: '数学',
    priority: 'high'
  },
  {
    id: '2',
    icon: '🔤',
    title: '复习定语从句',
    description: '定语从句是你的薄弱环节，多做相关练习',
    subject: '英语',
    priority: 'medium'
  }
])

// 计算属性
const errorStats = computed(() => {
  const total = errorList.value.length
  const mastered = errorList.value.filter(e => e.status === 'mastered').length
  const reviewing = errorList.value.filter(e => e.status === 'reviewing').length
  const streak = 7 // 连续复习天数，这里用固定值演示
  
  return { total, mastered, reviewing, streak }
})

const filteredErrors = computed(() => {
  let filtered = errorList.value
  
  // 按学科筛选
  if (activeSubject.value !== 'all') {
    filtered = filtered.filter(e => e.subject === activeSubject.value)
  }
  
  // 排序
  filtered.sort((a, b) => {
    switch (sortBy.value) {
      case 'date':
        return b.lastErrorDate - a.lastErrorDate
      case 'difficulty':
        return b.difficulty - a.difficulty
      case 'frequency':
        return b.errorCount - a.errorCount
      case 'mastery':
        return a.masteryLevel - b.masteryLevel
      default:
        return 0
    }
  })
  
  return filtered
})

// 方法
/**
 * 设置活动学科
 */
const setActiveSubject = (subject) => {
  activeSubject.value = subject
}

/**
 * 获取学科对应的错题数量
 */
const getSubjectCount = (subject) => {
  if (subject === 'all') return errorList.value.length
  return errorList.value.filter(e => e.subject === subject).length
}

/**
 * 获取学科文本
 */
const getSubjectText = (subject) => {
  const subjectObj = subjects.find(s => s.key === subject)
  return subjectObj ? subjectObj.label : ''
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
    'new': '待练习',
    'reviewing': '复习中',
    'mastered': '已掌握'
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
 * 查看错题详情
 */
const viewErrorDetail = (error) => {
  console.log('查看错题详情:', error.question)
  // 这里可以跳转到错题详情页面
}

/**
 * 练习错题
 */
const practiceError = (error) => {
  console.log('练习错题:', error.question)
  alert(`开始练习：${error.question}`)
}

/**
 * 查看解析
 */
const viewExplanation = (error) => {
  console.log('查看解析:', error.question)
  alert(`查看解析：${error.question}`)
}

/**
 * 复习错题
 */
const reviewError = (error) => {
  console.log('复习错题:', error.question)
  alert(`复习巩固：${error.question}`)
}

/**
 * 添加到收藏
 */
const addToFavorites = (error) => {
  error.isFavorite = !error.isFavorite
  console.log('收藏状态:', error.isFavorite)
}

/**
 * 应用学习建议
 */
const applySuggestion = (suggestion) => {
  console.log('应用建议:', suggestion.title)
  alert(`开始练习：${suggestion.title}`)
}

/**
 * 组件挂载时的初始化
 */
onMounted(() => {
  console.log('错题本页面加载完成')
})
</script>

<style scoped>
.error-book-page {
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

/* 错题列表区块 */
.error-list-section {
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

/* 错题列表 */
.error-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.error-item {
  padding: var(--spacing-lg);
  cursor: pointer;
  transition: all 0.2s ease;
  border-left: 4px solid transparent;
}

.error-item:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
  border-left-color: var(--error-color);
}

.error-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-md);
}

.error-subject {
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

.error-status {
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--border-radius-sm);
  font-size: var(--font-size-xs);
  font-weight: 500;
}

.error-status.new {
  background-color: var(--warning-light);
  color: var(--warning-color);
}

.error-status.reviewing {
  background-color: var(--info-light);
  color: var(--info-color);
}

.error-status.mastered {
  background-color: var(--success-light);
  color: var(--success-color);
}

.error-content {
  margin-bottom: var(--spacing-md);
}

.error-question {
  margin-bottom: var(--spacing-md);
}

.question-title {
  font-size: var(--font-size-md);
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 var(--spacing-xs) 0;
  line-height: 1.4;
}

.question-type {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
}

.error-details {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

.detail-row {
  display: flex;
  align-items: flex-start;
  gap: var(--spacing-sm);
}

.detail-label {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  min-width: 80px;
}

.detail-value {
  font-size: var(--font-size-sm);
  color: var(--text-primary);
}

.error-count {
  color: var(--error-color);
  font-weight: 600;
}

.knowledge-points {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-xs);
}

.knowledge-point {
  background: var(--bg-secondary);
  color: var(--text-secondary);
  padding: 2px 8px;
  border-radius: var(--border-radius-sm);
  font-size: var(--font-size-xs);
}

/* 进度条 */
.error-progress {
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
  background: linear-gradient(90deg, var(--success-color), var(--primary-color));
  border-radius: var(--border-radius-sm);
  transition: width 0.3s ease;
}

.progress-text {
  font-size: var(--font-size-sm);
  font-weight: 600;
  color: var(--success-color);
  min-width: 80px;
}

/* 错题操作按钮 */
.error-actions {
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

.action-btn.success {
  background: var(--success-color);
  color: white;
}

.action-btn.success:hover {
  background: var(--success-dark);
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

/* 学习建议 */
.suggestion-section {
  margin-bottom: var(--spacing-xl);
}

.suggestion-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.suggestion-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  padding: var(--spacing-md);
  transition: all 0.2s ease;
}

.suggestion-item:hover {
  transform: translateX(4px);
}

.suggestion-icon {
  font-size: 32px;
  width: 50px;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #f8f9ff 0%, #f0f4ff 100%);
  border-radius: var(--border-radius-round);
  flex-shrink: 0;
}

.suggestion-content {
  flex: 1;
}

.suggestion-title {
  font-size: var(--font-size-md);
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 4px;
}

.suggestion-desc {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  line-height: 1.4;
}

.suggestion-btn {
  background: var(--primary-color);
  color: white;
  border: none;
  padding: var(--spacing-sm) var(--spacing-md);
  border-radius: var(--border-radius-md);
  font-size: var(--font-size-sm);
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.suggestion-btn:hover {
  background: var(--primary-dark);
  transform: scale(1.05);
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
  
  .error-actions {
    justify-content: flex-start;
  }
  
  .action-btn {
    flex: 1;
    min-width: 70px;
  }
  
  .suggestion-item {
    flex-direction: column;
    text-align: center;
  }
  
  .suggestion-content {
    text-align: center;
  }
}

@media (max-width: 480px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
  .filter-tabs {
    justify-content: flex-start;
  }
  
  .detail-row {
    flex-direction: column;
    gap: 2px;
  }
  
  .detail-label {
    min-width: auto;
  }
}
</style>
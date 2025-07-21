<template>
  <div class="report-page container page-content-mobile">
    <!-- 页面标题 -->
    <div class="page-header">
      <h1 class="page-title">📊 学习报告</h1>
      <p class="page-subtitle">查看你的学习进度和成绩统计</p>
    </div>

    <!-- 学习概览 -->
    <div class="overview-section">
      <h2 class="section-title">学习概览</h2>
      <div class="stats-grid">
        <div class="stat-item">
          <div class="stat-icon">📚</div>
          <div class="stat-content">
            <div class="stat-number">{{ overviewStats.totalLessons }}</div>
            <div class="stat-label">总学习次数</div>
          </div>
        </div>
        <div class="stat-item">
          <div class="stat-icon">⏱️</div>
          <div class="stat-content">
            <div class="stat-number">{{ overviewStats.totalTime }}<span class="unit">分</span></div>
            <div class="stat-label">总学习时长</div>
          </div>
        </div>
        <div class="stat-item">
          <div class="stat-icon">🎯</div>
          <div class="stat-content">
            <div class="stat-number">{{ overviewStats.avgAccuracy }}<span class="unit">%</span></div>
            <div class="stat-label">平均正确率</div>
          </div>
        </div>
        <div class="stat-item">
          <div class="stat-icon">🏆</div>
          <div class="stat-content">
            <div class="stat-number">{{ overviewStats.totalPoints }}</div>
            <div class="stat-label">累计积分</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 最近学习记录 -->
    <div class="recent-section">
      <h2 class="section-title">最近学习记录</h2>
      <div class="record-list">
        <div 
          v-for="record in recentRecords" 
          :key="record.id" 
          class="record-item card"
        >
          <div class="record-icon">{{ record.subject === 'math' ? '🔢' : '📝' }}</div>
          <div class="record-content">
            <div class="record-title">{{ record.title }}</div>
            <div class="record-details">
              <span class="record-time">{{ formatTime(record.createdAt) }}</span>
              <span class="record-duration">{{ record.duration }}分钟</span>
            </div>
          </div>
          <div class="record-result">
            <span :class="['result-badge', record.result]">{{ record.resultText }}</span>
            <div class="record-score">{{ record.score }}分</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 学习趋势图表 -->
    <div class="chart-section">
      <h2 class="section-title">学习趋势</h2>
      <div class="chart-container">
        <div class="chart-placeholder">
          <div class="chart-icon">📈</div>
          <p>学习趋势图表</p>
          <p class="chart-desc">显示最近7天的学习时长和正确率变化</p>
        </div>
      </div>
    </div>

    <!-- 学科分析 -->
    <div class="subject-section">
      <h2 class="section-title">学科分析</h2>
      <div class="subject-list">
        <div 
          v-for="subject in subjectAnalysis" 
          :key="subject.name" 
          class="subject-item card"
        >
          <div class="subject-header">
            <div class="subject-icon">{{ subject.icon }}</div>
            <div class="subject-info">
              <div class="subject-name">{{ subject.name }}</div>
              <div class="subject-progress">
                <div class="progress-bar">
                  <div 
                    class="progress-fill" 
                    :style="{ width: subject.progress + '%' }"
                  ></div>
                </div>
                <span class="progress-text">{{ subject.progress }}%</span>
              </div>
            </div>
          </div>
          <div class="subject-stats">
            <div class="subject-stat">
              <span class="stat-label">练习次数</span>
              <span class="stat-value">{{ subject.practiceCount }}</span>
            </div>
            <div class="subject-stat">
              <span class="stat-label">平均分</span>
              <span class="stat-value">{{ subject.avgScore }}分</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import dayjs from 'dayjs'

/**
 * 学习报告页面组件
 * 展示用户的学习统计数据和分析
 */

// 响应式数据
const overviewStats = ref({
  totalLessons: 45,
  totalTime: 1280,
  avgAccuracy: 87,
  totalPoints: 2350
})

const recentRecords = ref([
  {
    id: '1',
    title: '数学练习 - 代数方程',
    subject: 'math',
    duration: 25,
    score: 92,
    result: 'excellent',
    resultText: '优秀',
    createdAt: Date.now() - 3600000
  },
  {
    id: '2',
    title: '语文练习 - 古诗词理解',
    subject: 'chinese',
    duration: 18,
    score: 85,
    result: 'good',
    resultText: '良好',
    createdAt: Date.now() - 7200000
  },
  {
    id: '3',
    title: '数学练习 - 几何图形',
    subject: 'math',
    duration: 30,
    score: 78,
    result: 'needs_improvement',
    resultText: '待提高',
    createdAt: Date.now() - 86400000
  }
])

const subjectAnalysis = ref([
  {
    name: '数学',
    icon: '🔢',
    progress: 85,
    practiceCount: 28,
    avgScore: 87
  },
  {
    name: '语文',
    icon: '📝',
    progress: 72,
    practiceCount: 15,
    avgScore: 82
  },
  {
    name: '英语',
    icon: '🔤',
    progress: 68,
    practiceCount: 12,
    avgScore: 79
  }
])

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
 * 组件挂载时的初始化
 */
onMounted(() => {
  console.log('学习报告页面加载完成')
})
</script>

<style scoped>
.report-page {
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

/* 通用区块样式 */
.section-title {
  font-size: var(--font-size-lg);
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 var(--spacing-md) 0;
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

/* 学习概览 */
.overview-section {
  margin-bottom: var(--spacing-xl);
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: var(--spacing-md);
}

.stat-item {
  background: white;
  padding: var(--spacing-lg);
  border-radius: var(--border-radius-lg);
  box-shadow: var(--shadow-md);
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  transition: all 0.3s ease;
}

.stat-item:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-lg);
}

.stat-icon {
  font-size: 32px;
  width: 50px;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #f8f9ff 0%, #f0f4ff 100%);
  border-radius: var(--border-radius-round);
}

.stat-content {
  flex: 1;
}

.stat-number {
  font-size: var(--font-size-xl);
  font-weight: 700;
  color: var(--primary-color);
  margin-bottom: 2px;
}

.stat-label {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
}

.unit {
  font-size: var(--font-size-md);
  font-weight: 500;
  margin-left: 2px;
}

/* 最近学习记录 */
.recent-section {
  margin-bottom: var(--spacing-xl);
}

.record-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.record-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  padding: var(--spacing-md);
  transition: all 0.2s ease;
}

.record-item:hover {
  transform: translateX(4px);
}

.record-icon {
  font-size: 24px;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--background);
  border-radius: var(--border-radius-md);
}

.record-content {
  flex: 1;
}

.record-title {
  font-size: var(--font-size-md);
  font-weight: 500;
  color: var(--text-primary);
  margin-bottom: 4px;
}

.record-details {
  display: flex;
  gap: var(--spacing-md);
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
}

.record-result {
  text-align: right;
}

.record-score {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  margin-top: 4px;
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

/* 图表区域 */
.chart-section {
  margin-bottom: var(--spacing-xl);
}

.chart-container {
  background: white;
  padding: var(--spacing-xl);
  border-radius: var(--border-radius-lg);
  box-shadow: var(--shadow-md);
}

.chart-placeholder {
  text-align: center;
  padding: var(--spacing-xl) 0;
  color: var(--text-secondary);
}

.chart-icon {
  font-size: 48px;
  margin-bottom: var(--spacing-md);
}

.chart-desc {
  font-size: var(--font-size-sm);
  margin-top: var(--spacing-sm);
}

/* 学科分析 */
.subject-section {
  margin-bottom: var(--spacing-xl);
}

.subject-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.subject-item {
  padding: var(--spacing-lg);
}

.subject-header {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-md);
}

.subject-icon {
  font-size: 24px;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #f8f9ff 0%, #f0f4ff 100%);
  border-radius: var(--border-radius-md);
}

.subject-info {
  flex: 1;
}

.subject-name {
  font-size: var(--font-size-md);
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: var(--spacing-xs);
}

.subject-progress {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.progress-bar {
  flex: 1;
  height: 8px;
  background-color: var(--background);
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--primary-color), var(--secondary-color));
  transition: width 0.3s ease;
}

.progress-text {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  min-width: 35px;
}

.subject-stats {
  display: flex;
  gap: var(--spacing-lg);
}

.subject-stat {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-xs);
}

.subject-stat .stat-label {
  font-size: var(--font-size-xs);
  color: var(--text-secondary);
}

.subject-stat .stat-value {
  font-size: var(--font-size-md);
  font-weight: 600;
  color: var(--primary-color);
}

/* 移动端优化 */
@media (max-width: 768px) {
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .stat-item {
    flex-direction: column;
    text-align: center;
    gap: var(--spacing-sm);
  }
  
  .record-item {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--spacing-sm);
  }
  
  .record-result {
    align-self: flex-end;
  }
  
  .subject-header {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--spacing-sm);
  }
  
  .subject-progress {
    width: 100%;
  }
}
</style>
<template>
  <div class="invite-page container page-content-mobile">
    <!-- 页面标题 -->
    <div class="page-header">
      <h1 class="page-title">👥 邀请好友</h1>
      <p class="page-subtitle">邀请好友一起学习，获得丰厚积分奖励</p>
    </div>

    <!-- 邀请奖励说明 -->
    <div class="reward-section">
      <h2 class="section-title">邀请奖励</h2>
      <div class="reward-flow">
        <div class="reward-step">
          <div class="step-icon">👤</div>
          <div class="step-content">
            <div class="step-title">你</div>
            <div class="step-reward">+100积分</div>
            <div class="step-desc">好友注册成功</div>
          </div>
        </div>
        <div class="reward-arrow">→</div>
        <div class="reward-step">
          <div class="step-icon">👥</div>
          <div class="step-content">
            <div class="step-title">好友</div>
            <div class="step-reward">+50积分</div>
            <div class="step-desc">注册完成奖励</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 邀请码分享 -->
    <div class="invite-section">
      <h2 class="section-title">我的邀请码</h2>
      <div class="invite-card">
        <div class="invite-code-container">
          <div class="invite-code">{{ inviteCode }}</div>
          <button class="copy-btn" @click="copyInviteCode">
            <span class="copy-icon">📋</span>
            复制
          </button>
        </div>
        <div class="invite-actions">
          <button class="share-btn wechat" @click="shareToWechat">
            <span class="share-icon">💬</span>
            微信分享
          </button>
          <button class="share-btn qq" @click="shareToQQ">
            <span class="share-icon">🐧</span>
            QQ分享
          </button>
          <button class="share-btn link" @click="copyInviteLink">
            <span class="share-icon">🔗</span>
            复制链接
          </button>
        </div>
      </div>
    </div>

    <!-- 邀请统计 -->
    <div class="stats-section">
      <h2 class="section-title">邀请统计</h2>
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon">👥</div>
          <div class="stat-content">
            <div class="stat-number">{{ inviteStats.totalInvites }}</div>
            <div class="stat-label">累计邀请</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">✅</div>
          <div class="stat-content">
            <div class="stat-number">{{ inviteStats.successfulInvites }}</div>
            <div class="stat-label">成功注册</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">🏆</div>
          <div class="stat-content">
            <div class="stat-number">{{ inviteStats.earnedPoints }}</div>
            <div class="stat-label">获得积分</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 邀请记录 -->
    <div class="history-section">
      <h2 class="section-title">邀请记录</h2>
      <div class="history-list" v-if="inviteHistory.length > 0">
        <div 
          v-for="record in inviteHistory" 
          :key="record.id" 
          class="history-item card"
        >
          <div class="history-avatar">
            <img :src="record.avatar" :alt="record.nickname" class="avatar-img" />
          </div>
          <div class="history-content">
            <div class="history-name">{{ record.nickname }}</div>
            <div class="history-time">{{ formatTime(record.joinTime) }}</div>
          </div>
          <div class="history-reward">
            <span :class="['reward-badge', record.status]">{{ record.statusText }}</span>
            <div class="reward-points" v-if="record.status === 'success'">+{{ record.points }}积分</div>
          </div>
        </div>
      </div>
      <div class="empty-state" v-else>
        <div class="empty-icon">📭</div>
        <p class="empty-text">还没有邀请记录</p>
        <p class="empty-desc">快去邀请好友一起学习吧！</p>
      </div>
    </div>

    <!-- 邀请规则 -->
    <div class="rules-section">
      <h2 class="section-title">邀请规则</h2>
      <div class="rules-card">
        <div class="rule-item">
          <span class="rule-number">1</span>
          <span class="rule-text">分享邀请码给好友，好友使用邀请码注册</span>
        </div>
        <div class="rule-item">
          <span class="rule-number">2</span>
          <span class="rule-text">好友注册成功后，你将获得100积分奖励</span>
        </div>
        <div class="rule-item">
          <span class="rule-number">3</span>
          <span class="rule-text">被邀请的好友也将获得50积分新人奖励</span>
        </div>
        <div class="rule-item">
          <span class="rule-number">4</span>
          <span class="rule-text">邀请数量不限，多邀多得</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import dayjs from 'dayjs'

/**
 * 邀请好友页面组件
 * 展示邀请码、奖励规则和邀请记录
 */

// 响应式数据
const inviteCode = ref('AI2024')

const inviteStats = ref({
  totalInvites: 8,
  successfulInvites: 5,
  earnedPoints: 500
})

const inviteHistory = ref([
  {
    id: '1',
    nickname: '小明',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=xiaoming',
    joinTime: Date.now() - 86400000,
    status: 'success',
    statusText: '已注册',
    points: 100
  },
  {
    id: '2',
    nickname: '小红',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=xiaohong',
    joinTime: Date.now() - 172800000,
    status: 'success',
    statusText: '已注册',
    points: 100
  },
  {
    id: '3',
    nickname: '小李',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=xiaoli',
    joinTime: Date.now() - 259200000,
    status: 'pending',
    statusText: '待注册',
    points: 0
  }
])

// 方法
/**
 * 复制邀请码
 */
const copyInviteCode = async () => {
  try {
    await navigator.clipboard.writeText(inviteCode.value)
    alert('邀请码已复制到剪贴板')
  } catch (err) {
    console.error('复制失败:', err)
    alert('复制失败，请手动复制')
  }
}

/**
 * 复制邀请链接
 */
const copyInviteLink = async () => {
  const inviteLink = `${window.location.origin}/register?invite=${inviteCode.value}`
  try {
    await navigator.clipboard.writeText(inviteLink)
    alert('邀请链接已复制到剪贴板')
  } catch (err) {
    console.error('复制失败:', err)
    alert('复制失败，请手动复制')
  }
}

/**
 * 分享到微信
 */
const shareToWechat = () => {
  const shareText = `我在使用AI一对一辅导学习，效果很不错！快来和我一起学习吧，使用邀请码：${inviteCode.value}`
  
  // 这里可以集成微信分享SDK
  alert('请复制以下内容分享给好友：\n' + shareText)
}

/**
 * 分享到QQ
 */
const shareToQQ = () => {
  const shareText = `我在使用AI一对一辅导学习，效果很不错！快来和我一起学习吧，使用邀请码：${inviteCode.value}`
  
  // 这里可以集成QQ分享SDK
  alert('请复制以下内容分享给好友：\n' + shareText)
}

/**
 * 格式化时间显示
 */
const formatTime = (timestamp) => {
  const now = dayjs()
  const time = dayjs(timestamp)
  
  if (now.diff(time, 'day') === 0) {
    return '今天'
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
  console.log('邀请好友页面加载完成')
})
</script>

<style scoped>
.invite-page {
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

/* 奖励说明 */
.reward-section {
  margin-bottom: var(--spacing-xl);
}

.reward-flow {
  background: white;
  padding: var(--spacing-xl);
  border-radius: var(--border-radius-lg);
  box-shadow: var(--shadow-md);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-lg);
}

.reward-step {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-sm);
  flex: 1;
}

.step-icon {
  font-size: 48px;
  width: 80px;
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #f8f9ff 0%, #f0f4ff 100%);
  border-radius: var(--border-radius-round);
  border: 3px solid var(--primary-color);
}

.step-title {
  font-size: var(--font-size-md);
  font-weight: 600;
  color: var(--text-primary);
}

.step-reward {
  font-size: var(--font-size-lg);
  font-weight: 700;
  color: var(--primary-color);
}

.step-desc {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
}

.reward-arrow {
  font-size: 24px;
  color: var(--primary-color);
  font-weight: bold;
}

/* 邀请码分享 */
.invite-section {
  margin-bottom: var(--spacing-xl);
}

.invite-card {
  background: white;
  padding: var(--spacing-xl);
  border-radius: var(--border-radius-lg);
  box-shadow: var(--shadow-md);
}

.invite-code-container {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-lg);
  padding: var(--spacing-md);
  background: linear-gradient(135deg, #f8f9ff 0%, #f0f4ff 100%);
  border-radius: var(--border-radius-md);
  border: 2px dashed var(--primary-color);
}

.invite-code {
  flex: 1;
  font-size: var(--font-size-xl);
  font-weight: 700;
  color: var(--primary-color);
  text-align: center;
  letter-spacing: 2px;
}

.copy-btn {
  background: var(--primary-color);
  color: white;
  border: none;
  padding: var(--spacing-sm) var(--spacing-md);
  border-radius: var(--border-radius-md);
  font-size: var(--font-size-sm);
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  transition: all 0.2s ease;
}

.copy-btn:hover {
  background: var(--primary-dark);
  transform: scale(1.05);
}

.invite-actions {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--spacing-md);
}

.share-btn {
  padding: var(--spacing-md);
  border: none;
  border-radius: var(--border-radius-md);
  font-size: var(--font-size-sm);
  font-weight: 600;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-xs);
  transition: all 0.2s ease;
}

.share-btn.wechat {
  background: linear-gradient(135deg, #07C160, #00D976);
  color: white;
}

.share-btn.qq {
  background: linear-gradient(135deg, #12B7F5, #00A6FB);
  color: white;
}

.share-btn.link {
  background: linear-gradient(135deg, #6C5CE7, #A29BFE);
  color: white;
}

.share-btn:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.share-icon {
  font-size: 20px;
}

/* 邀请统计 */
.stats-section {
  margin-bottom: var(--spacing-xl);
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--spacing-md);
}

.stat-card {
  background: white;
  padding: var(--spacing-lg);
  border-radius: var(--border-radius-lg);
  box-shadow: var(--shadow-md);
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: var(--spacing-sm);
  transition: all 0.3s ease;
}

.stat-card:hover {
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
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-xs);
}

.stat-number {
  font-size: var(--font-size-xl);
  font-weight: 700;
  color: var(--primary-color);
}

.stat-label {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
}

/* 邀请记录 */
.history-section {
  margin-bottom: var(--spacing-xl);
}

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
  transition: all 0.2s ease;
}

.history-item:hover {
  transform: translateX(4px);
}

.history-avatar {
  width: 50px;
  height: 50px;
  border-radius: var(--border-radius-round);
  overflow: hidden;
  border: 2px solid var(--primary-color);
}

.avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.history-content {
  flex: 1;
}

.history-name {
  font-size: var(--font-size-md);
  font-weight: 500;
  color: var(--text-primary);
  margin-bottom: 2px;
}

.history-time {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
}

.history-reward {
  text-align: right;
}

.reward-badge {
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--border-radius-sm);
  font-size: var(--font-size-xs);
  font-weight: 500;
}

.reward-badge.success {
  background-color: var(--success-color);
  color: white;
}

.reward-badge.pending {
  background-color: var(--warning-color);
  color: white;
}

.reward-points {
  font-size: var(--font-size-sm);
  color: var(--success-color);
  font-weight: 600;
  margin-top: 4px;
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

/* 邀请规则 */
.rules-section {
  margin-bottom: var(--spacing-xl);
}

.rules-card {
  background: white;
  padding: var(--spacing-lg);
  border-radius: var(--border-radius-lg);
  box-shadow: var(--shadow-md);
}

.rule-item {
  display: flex;
  align-items: flex-start;
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-md);
}

.rule-item:last-child {
  margin-bottom: 0;
}

.rule-number {
  width: 24px;
  height: 24px;
  background: var(--primary-color);
  color: white;
  border-radius: var(--border-radius-round);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--font-size-sm);
  font-weight: 600;
  flex-shrink: 0;
}

.rule-text {
  font-size: var(--font-size-md);
  color: var(--text-primary);
  line-height: 1.5;
}

/* 移动端优化 */
@media (max-width: 768px) {
  .reward-flow {
    flex-direction: column;
    gap: var(--spacing-md);
  }
  
  .reward-arrow {
    transform: rotate(90deg);
  }
  
  .step-icon {
    width: 60px;
    height: 60px;
    font-size: 32px;
  }
  
  .invite-actions {
    grid-template-columns: 1fr;
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
  .invite-code-container {
    flex-direction: column;
    text-align: center;
  }
  
  .copy-btn {
    align-self: center;
  }
}
</style>
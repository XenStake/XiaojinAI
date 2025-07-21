<template>
  <div class="profile-page page-content-mobile">
    <!-- 页面头部 -->
    <div class="page-header">
      <button class="back-btn" @click="$router.go(-1)">
        <i class="fas fa-arrow-left"></i>
      </button>
      <h1 class="page-title">个人中心</h1>
      <button class="settings-btn" @click="showSettings = true">
        <i class="fas fa-cog"></i>
      </button>
    </div>

    <!-- 用户信息卡片 -->
    <div class="user-info">
      <div class="user-card">
        <div class="user-avatar" @click="showAvatarPicker = true">
          <img :src="userStore.userInfo.avatar" :alt="userStore.userInfo.name" />
          <div class="avatar-overlay">
            <i class="fas fa-camera"></i>
          </div>
        </div>
        <div class="user-details">
          <h2 class="user-name">{{ userStore.userInfo.name }}</h2>
          <p class="user-level">{{ userStore.userInfo.level?.name || '初学者' }}</p>
          <div class="user-stats">
            <div class="stat-item">
              <span class="stat-value">{{ userStore.points.current }}</span>
              <span class="stat-label">积分</span>
            </div>
            <div class="stat-item">
              <span class="stat-value">{{ userStore.userInfo.studyDays || 0 }}</span>
              <span class="stat-label">学习天数</span>
            </div>
            <div class="stat-item clickable" @click="$router.push('/achievements')">
              <span class="stat-value">{{ userStore.achievement.unlocked?.length || 0 }}</span>
              <span class="stat-label">成就</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 等级进度 -->
      <div class="level-progress">
        <div class="progress-header">
          <span class="current-level">{{ userStore.userInfo.level?.name || '初学者' }}</span>
          <span class="next-level">{{ getNextLevel() }}</span>
        </div>
        <div class="progress-bar">
          <div 
            class="progress-fill" 
            :style="{ width: getLevelProgress() + '%' }"
          ></div>
        </div>
        <div class="progress-text">
          {{ userStore.userInfo.experience || 0 }}/{{ getNextLevelExp() }} 经验值
        </div>
      </div>
    </div>

    <!-- 学习统计 -->
    <div class="study-stats">
      <h3 class="section-title">
        <i class="fas fa-chart-line"></i>
        学习统计
      </h3>
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon">
            <i class="fas fa-book-open"></i>
          </div>
          <div class="stat-info">
            <div class="stat-number">{{ studyStats.totalQuestions }}</div>
            <div class="stat-desc">总题数</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">
            <i class="fas fa-check-circle"></i>
          </div>
          <div class="stat-info">
            <div class="stat-number">{{ studyStats.correctRate }}%</div>
            <div class="stat-desc">正确率</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">
            <i class="fas fa-clock"></i>
          </div>
          <div class="stat-info">
            <div class="stat-number">{{ studyStats.studyTime }}</div>
            <div class="stat-desc">学习时长</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">
            <i class="fas fa-trophy"></i>
          </div>
          <div class="stat-info">
            <div class="stat-number">{{ studyStats.pkWins }}</div>
            <div class="stat-desc">PK胜利</div>
          </div>
        </div>
      </div>
    </div>



    <!-- 每日签到 -->
    <div class="daily-checkin-section">
      <div class="checkin-card">
        <div class="checkin-info">
          <div class="checkin-icon">📅</div>
          <div class="checkin-text">
            <div class="checkin-title">每日签到</div>
            <div class="checkin-desc">连续签到{{ userInfo.consecutiveDays }}天</div>
          </div>
        </div>
        <button 
          class="checkin-btn"
          :class="{ disabled: userInfo.hasCheckedIn }"
          @click="dailyCheckin"
          :disabled="userInfo.hasCheckedIn"
        >
          {{ userInfo.hasCheckedIn ? '已签到' : '签到+10' }}
        </button>
      </div>
    </div>

    <!-- 功能菜单 -->
    <div class="menu-section">
      <div class="menu-group">
        <div class="menu-item" @click="$router.push('/shop')">
          <div class="menu-icon">
            <i class="fas fa-shopping-bag"></i>
          </div>
          <div class="menu-content">
            <div class="menu-title">积分商城</div>
            <div class="menu-desc">兑换精美礼品</div>
          </div>
          <div class="menu-arrow">
            <i class="fas fa-chevron-right"></i>
          </div>
        </div>
      </div>
      
      <div class="menu-group">
        <div class="menu-item" @click="$router.push('/card-pocket')">
          <div class="menu-icon">
            <i class="fas fa-id-card"></i>
          </div>
          <div class="menu-content">
            <div class="menu-title">卡牌口袋</div>
            <div class="menu-desc">管理我的卡牌</div>
          </div>
          <div class="menu-badge" v-if="cardCount > 0">{{ cardCount }}</div>
          <div class="menu-arrow">
            <i class="fas fa-chevron-right"></i>
          </div>
        </div>
      </div>

      <div class="menu-group">
        <div class="menu-item" @click="showFeedback = true">
          <div class="menu-icon">
            <i class="fas fa-comment-alt"></i>
          </div>
          <div class="menu-content">
            <div class="menu-title">意见反馈</div>
            <div class="menu-desc">帮助我们改进</div>
          </div>
          <div class="menu-arrow">
            <i class="fas fa-chevron-right"></i>
          </div>
        </div>
        
        <div class="menu-item" @click="showAbout = true">
          <div class="menu-icon">
            <i class="fas fa-info-circle"></i>
          </div>
          <div class="menu-content">
            <div class="menu-title">关于我们</div>
            <div class="menu-desc">了解更多信息</div>
          </div>
          <div class="menu-arrow">
            <i class="fas fa-chevron-right"></i>
          </div>
        </div>
      </div>
    </div>

    <!-- 头像选择弹窗 -->
    <div v-if="showAvatarPicker" class="modal-overlay" @click="showAvatarPicker = false">
      <div class="avatar-picker-modal" @click.stop>
        <div class="modal-header">
          <h3>选择头像</h3>
          <button class="close-btn" @click="showAvatarPicker = false">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="modal-content">
          <div class="avatar-options">
            <div 
              v-for="avatar in avatarOptions" 
              :key="avatar.id"
              class="avatar-option"
              :class="{ selected: selectedAvatar === avatar.url }"
              @click="selectedAvatar = avatar.url"
            >
              <img :src="avatar.url" :alt="avatar.name" />
            </div>
          </div>
          <div class="upload-section">
            <input 
              ref="avatarInput" 
              type="file" 
              accept="image/*" 
              @change="handleAvatarUpload" 
              style="display: none;"
            />
            <button class="upload-btn" @click="$refs.avatarInput.click()">
              <i class="fas fa-upload"></i>
              上传自定义头像
            </button>
          </div>
        </div>
        <div class="modal-actions">
          <button class="btn btn-secondary" @click="showAvatarPicker = false">
            取消
          </button>
          <button class="btn btn-primary" @click="updateAvatar">
            确认
          </button>
        </div>
      </div>
    </div>

    <!-- 设置弹窗 -->
    <div v-if="showSettings" class="modal-overlay" @click="showSettings = false">
      <div class="settings-modal" @click.stop>
        <div class="modal-header">
          <h3>设置</h3>
          <button class="close-btn" @click="showSettings = false">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="modal-content">
          <div class="setting-group">
            <h4>通知设置</h4>
            <div class="setting-item">
              <div class="setting-info">
                <div class="setting-title">学习提醒</div>
                <div class="setting-desc">每日学习提醒通知</div>
              </div>
              <div class="setting-control">
                <label class="switch">
                  <input type="checkbox" v-model="settings.studyReminder" />
                  <span class="slider"></span>
                </label>
              </div>
            </div>
            <div class="setting-item">
              <div class="setting-info">
                <div class="setting-title">PK邀请</div>
                <div class="setting-desc">接收PK挑战邀请</div>
              </div>
              <div class="setting-control">
                <label class="switch">
                  <input type="checkbox" v-model="settings.pkInvitation" />
                  <span class="slider"></span>
                </label>
              </div>
            </div>
          </div>
          
          <div class="setting-group">
            <h4>学习设置</h4>
            <div class="setting-item">
              <div class="setting-info">
                <div class="setting-title">难度等级</div>
                <div class="setting-desc">题目难度偏好</div>
              </div>
              <div class="setting-control">
                <select v-model="settings.difficulty" class="setting-select">
                  <option value="easy">简单</option>
                  <option value="medium">中等</option>
                  <option value="hard">困难</option>
                  <option value="auto">自动调节</option>
                </select>
              </div>
            </div>
            <div class="setting-item">
              <div class="setting-info">
                <div class="setting-title">答题时间</div>
                <div class="setting-desc">每题答题时间限制</div>
              </div>
              <div class="setting-control">
                <select v-model="settings.timeLimit" class="setting-select">
                  <option value="30">30秒</option>
                  <option value="60">60秒</option>
                  <option value="120">120秒</option>
                  <option value="0">无限制</option>
                </select>
              </div>
            </div>
          </div>
          
          <div class="setting-group">
            <h4>隐私设置</h4>
            <div class="setting-item">
              <div class="setting-info">
                <div class="setting-title">排行榜显示</div>
                <div class="setting-desc">在排行榜中显示我的信息</div>
              </div>
              <div class="setting-control">
                <label class="switch">
                  <input type="checkbox" v-model="settings.showInRanking" />
                  <span class="slider"></span>
                </label>
              </div>
            </div>
          </div>
        </div>
        <div class="modal-actions">
          <button class="btn btn-secondary" @click="resetSettings">
            重置
          </button>
          <button class="btn btn-primary" @click="saveSettings">
            保存
          </button>
        </div>
      </div>
    </div>

    <!-- 其他弹窗 -->

    <!-- 意见反馈弹窗 -->
    <div v-if="showFeedback" class="modal-overlay" @click="showFeedback = false">
      <div class="feedback-modal" @click.stop>
        <div class="modal-header">
          <h3>意见反馈</h3>
          <button class="close-btn" @click="showFeedback = false">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="modal-content">
          <div class="feedback-form">
            <div class="form-group">
              <label>反馈类型</label>
              <select v-model="feedback.type" class="form-control">
                <option value="bug">问题反馈</option>
                <option value="feature">功能建议</option>
                <option value="other">其他</option>
              </select>
            </div>
            <div class="form-group">
              <label>详细描述</label>
              <textarea 
                v-model="feedback.content" 
                class="form-control" 
                rows="4" 
                placeholder="请详细描述您的问题或建议..."
              ></textarea>
            </div>
            <div class="form-group">
              <label>联系方式（可选）</label>
              <input 
                v-model="feedback.contact" 
                type="text" 
                class="form-control" 
                placeholder="邮箱或手机号"
              />
            </div>
          </div>
        </div>
        <div class="modal-actions">
          <button class="btn btn-secondary" @click="showFeedback = false">
            取消
          </button>
          <button class="btn btn-primary" @click="submitFeedback">
            提交
          </button>
        </div>
      </div>
    </div>

    <!-- 关于我们弹窗 -->
    <div v-if="showAbout" class="modal-overlay" @click="showAbout = false">
      <div class="about-modal" @click.stop>
        <div class="modal-header">
          <h3>关于我们</h3>
          <button class="close-btn" @click="showAbout = false">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="modal-content">
          <div class="about-content">
            <div class="app-info">
              <div class="app-logo">
                <i class="fas fa-graduation-cap"></i>
              </div>
              <h4>AI一对一辅导</h4>
              <p class="version">版本 1.0.0</p>
            </div>
            <div class="about-text">
              <p>AI一对一辅导是一款智能学习辅导应用，通过人工智能技术为学生提供个性化的学习体验。</p>
              <p>我们致力于让每个学生都能享受到优质的教育资源，提高学习效率和成绩。</p>
            </div>
            <div class="contact-info">
              <div class="contact-item">
                <i class="fas fa-envelope"></i>
                <span>待定</span>
              </div>
              <div class="contact-item">
                <i class="fas fa-globe"></i>
                <span>待定</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 底部导航 -->
    <BottomNavigation />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useUserStore } from '@/stores/user'
import BottomNavigation from '@/components/BottomNavigation.vue'
import dayjs from 'dayjs'

const userStore = useUserStore()

// 响应式数据
const showAvatarPicker = ref(false)
const showSettings = ref(false)
const showAllAchievements = ref(false)

const showFeedback = ref(false)
const showAbout = ref(false)

const selectedAvatar = ref('')

// 用户信息（包含签到相关数据）
const userInfo = ref({
  hasCheckedIn: false,
  consecutiveDays: 0,
  points: 0
})

// 学习统计数据
const studyStats = ref({
  totalQuestions: 1250,
  correctRate: 85,
  studyTime: '42小时',
  pkWins: 23
})

// 卡牌数据
const userCards = ref({
  bronze: [],
  silver: [],
  gold: [],
  legendary: []
})

// 卡牌转赠记录
const transferRecords = ref([])

// 周报数据
const weeklyReport = ref({
  studyTime: 8.5,
  questions: 156,
  accuracy: 87
})

// 设置数据
const settings = ref({
  studyReminder: true,
  pkInvitation: true,
  difficulty: 'auto',
  timeLimit: 60,
  showInRanking: true
})

// 反馈数据
const feedback = ref({
  type: 'bug',
  content: '',
  contact: ''
})

// 头像选项
const avatarOptions = ref([
  { id: 1, name: '默认头像1', url: '/avatars/avatar1.png' },
  { id: 2, name: '默认头像2', url: '/avatars/avatar2.png' },
  { id: 3, name: '默认头像3', url: '/avatars/avatar3.png' },
  { id: 4, name: '默认头像4', url: '/avatars/avatar4.png' },
  { id: 5, name: '默认头像5', url: '/avatars/avatar5.png' },
  { id: 6, name: '默认头像6', url: '/avatars/avatar6.png' }
])

// 计算属性
const recentAchievements = computed(() => {
  return userStore.achievement.unlocked?.slice(0, 6) || []
})

const cardCount = computed(() => {
  return userCards.value.bronze.length + 
         userCards.value.silver.length + 
         userCards.value.gold.length + 
         userCards.value.legendary.length
})

// 方法
const getNextLevel = () => {
  const levels = [
    { name: '初学者', exp: 0 },
    { name: '学习者', exp: 100 },
    { name: '进步者', exp: 300 },
    { name: '优秀者', exp: 600 },
    { name: '专家', exp: 1000 },
    { name: '大师', exp: 1500 }
  ]
  
  const currentLevelName = userStore.userInfo.level?.name || '初学者'
  const currentIndex = levels.findIndex(level => level.name === currentLevelName)
  return currentIndex < levels.length - 1 ? levels[currentIndex + 1].name : '已达最高等级'
}

const getNextLevelExp = () => {
  const levels = [
    { name: '初学者', exp: 0 },
    { name: '学习者', exp: 100 },
    { name: '进步者', exp: 300 },
    { name: '优秀者', exp: 600 },
    { name: '专家', exp: 1000 },
    { name: '大师', exp: 1500 }
  ]
  
  const currentLevelName = userStore.userInfo.level?.name || '初学者'
  const currentIndex = levels.findIndex(level => level.name === currentLevelName)
  return currentIndex < levels.length - 1 ? levels[currentIndex + 1].exp : levels[currentIndex].exp
}

const getLevelProgress = () => {
  const currentExp = userStore.userInfo.experience || 0
  const nextLevelExp = getNextLevelExp()
  const currentLevelExp = userStore.userInfo.level?.exp || 0
  
  if (nextLevelExp === currentLevelExp) return 100
  
  return Math.round(((currentExp - currentLevelExp) / (nextLevelExp - currentLevelExp)) * 100)
}

const formatDate = (date) => {
  return dayjs(date).format('MM-DD')
}

const handleAvatarUpload = (event) => {
  const file = event.target.files[0]
  if (file) {
    const reader = new FileReader()
    reader.onload = (e) => {
      selectedAvatar.value = e.target.result
    }
    reader.readAsDataURL(file)
  }
}

const updateAvatar = () => {
  if (selectedAvatar.value) {
    userStore.updateUserInfo({ avatar: selectedAvatar.value })
    showAvatarPicker.value = false
  }
}

const saveSettings = () => {
  // 保存设置到本地存储或服务器
  localStorage.setItem('userSettings', JSON.stringify(settings.value))
  showSettings.value = false
  // 显示保存成功提示
  alert('设置已保存')
}

const resetSettings = () => {
  settings.value = {
    studyReminder: true,
    pkInvitation: true,
    difficulty: 'auto',
    timeLimit: 60,
    showInRanking: true
  }
}



const submitFeedback = () => {
  if (!feedback.value.content.trim()) {
    alert('请填写反馈内容')
    return
  }
  
  // 提交反馈到服务器
  console.log('提交反馈:', feedback.value)
  
  // 重置表单
  feedback.value = {
    type: 'bug',
    content: '',
    contact: ''
  }
  
  showFeedback.value = false
  alert('反馈提交成功，感谢您的建议！')
}

/**
 * 每日签到
 */
const dailyCheckin = () => {
  if (userInfo.value.hasCheckedIn) return
  
  // 更新用户信息
  userInfo.value.hasCheckedIn = true
  userInfo.value.consecutiveDays += 1
  
  // 增加积分
  const points = 10 + Math.min(userInfo.value.consecutiveDays, 7) // 连续签到额外奖励
  userInfo.value.points += points
  userStore.addPoints(points)
  
  // 保存到本地存储
  localStorage.setItem('userInfo', JSON.stringify(userInfo.value))
  
  alert(`签到成功！获得${points}积分`)
}

// 加载卡牌数据
const loadCardsFromStorage = () => {
  const saved = localStorage.getItem('userCards')
  if (saved) {
    userCards.value = JSON.parse(saved)
  }
}

// 加载用户信息
const loadUserInfo = () => {
  const saved = localStorage.getItem('userInfo')
  if (saved) {
    userInfo.value = { ...userInfo.value, ...JSON.parse(saved) }
  }
  
  // 检查是否需要重置每日签到状态
  const today = new Date().toDateString()
  const lastCheckin = localStorage.getItem('lastCheckinDate')
  if (lastCheckin !== today) {
    userInfo.value.hasCheckedIn = false
    localStorage.setItem('lastCheckinDate', today)
  }
}

// 生命周期
onMounted(() => {
  // 加载用户设置
  const savedSettings = localStorage.getItem('userSettings')
  if (savedSettings) {
    settings.value = { ...settings.value, ...JSON.parse(savedSettings) }
  }
  
  // 加载卡牌数据
  loadCardsFromStorage()
  
  // 加载用户信息
  loadUserInfo()
  
  selectedAvatar.value = userStore.userInfo.avatar
})
</script>

<style scoped>
.profile-page {
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

.back-btn,
.settings-btn {
  background: none;
  border: none;
  padding: var(--spacing-sm);
  cursor: pointer;
  color: var(--text-primary);
  font-size: 18px;
  transition: all 0.2s ease;
}

.back-btn:hover,
.settings-btn:hover {
  color: var(--primary-color);
  transform: scale(1.1);
}

.page-title {
  font-size: var(--font-size-lg);
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
}

/* 用户信息 */
.user-info {
  padding: var(--spacing-md);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.user-card {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: var(--border-radius-lg);
  padding: var(--spacing-lg);
  display: flex;
  align-items: center;
  gap: var(--spacing-lg);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
}

.user-avatar {
  position: relative;
  cursor: pointer;
}

.user-avatar img {
  width: 80px;
  height: 80px;
  border-radius: var(--border-radius-round);
  object-fit: cover;
  border: 3px solid var(--primary-color);
}

.avatar-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  border-radius: var(--border-radius-round);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.2s ease;
  color: white;
  font-size: 20px;
}

.user-avatar:hover .avatar-overlay {
  opacity: 1;
}

.user-details {
  flex: 1;
}

.user-name {
  font-size: var(--font-size-xl);
  font-weight: 700;
  color: var(--text-primary);
  margin: 0 0 var(--spacing-xs) 0;
}

.user-level {
  font-size: var(--font-size-md);
  color: var(--primary-color);
  font-weight: 600;
  margin: 0 0 var(--spacing-md) 0;
}

.user-stats {
  display: flex;
  gap: var(--spacing-lg);
}

.stat-item {
  text-align: center;
}

.stat-item.clickable {
  cursor: pointer;
  transition: all 0.2s ease;
  border-radius: var(--border-radius-md);
  padding: var(--spacing-xs);
}

.stat-item.clickable:hover {
  background: rgba(255, 255, 255, 0.1);
  transform: scale(1.05);
}

.stat-value {
  display: block;
  font-size: var(--font-size-lg);
  font-weight: 700;
  color: var(--primary-color);
  margin-bottom: var(--spacing-xs);
}

.stat-label {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
}

/* 等级进度 */
.level-progress {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: var(--border-radius-lg);
  padding: var(--spacing-lg);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
}

.progress-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-sm);
}

.current-level,
.next-level {
  font-size: var(--font-size-sm);
  font-weight: 600;
  color: var(--text-primary);
}

.next-level {
  color: var(--text-secondary);
}

.progress-bar {
  width: 100%;
  height: 8px;
  background: var(--background);
  border-radius: var(--border-radius-full);
  overflow: hidden;
  margin-bottom: var(--spacing-sm);
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--primary-color), var(--secondary-color));
  border-radius: var(--border-radius-full);
  transition: width 0.3s ease;
}

.progress-text {
  text-align: center;
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
}

/* 学习统计 */
.study-stats {
  padding: 0 var(--spacing-md) var(--spacing-md);
}

.section-title {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  font-size: var(--font-size-lg);
  font-weight: 600;
  color: white;
  margin: 0 0 var(--spacing-md) 0;
}

.section-title i {
  font-size: 20px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--spacing-md);
}

.stat-card {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: var(--border-radius-lg);
  padding: var(--spacing-lg);
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.15);
}

.stat-icon {
  width: 50px;
  height: 50px;
  border-radius: var(--border-radius-round);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  background: var(--primary-light);
  color: var(--primary-color);
}

.stat-info {
  flex: 1;
}

.stat-number {
  font-size: var(--font-size-xl);
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: var(--spacing-xs);
}

.stat-desc {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
}

/* 成就展示 */
.achievements {
  padding: 0 var(--spacing-md) var(--spacing-md);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-md);
}

.view-all-btn {
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.3);
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--border-radius-md);
  font-size: var(--font-size-sm);
  cursor: pointer;
  transition: all 0.2s ease;
}

.view-all-btn:hover {
  background: rgba(255, 255, 255, 0.3);
  border-color: rgba(255, 255, 255, 0.5);
}

.achievements-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: var(--spacing-md);
}

.achievement-item {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: var(--border-radius-lg);
  padding: var(--spacing-md);
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  opacity: 0.6;
}

.achievement-item.unlocked {
  opacity: 1;
}

.achievement-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.12);
}

.achievement-icon {
  width: 40px;
  height: 40px;
  border-radius: var(--border-radius-round);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  background: var(--warning-light);
  color: var(--warning-color);
}

.achievement-item.unlocked .achievement-icon {
  background: var(--success-light);
  color: var(--success-color);
}

.achievement-info {
  flex: 1;
}

.achievement-name {
  font-size: var(--font-size-md);
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: var(--spacing-xs);
}

.achievement-desc {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
}

.achievement-date {
  font-size: var(--font-size-xs);
  color: var(--text-secondary);
}

/* 每日签到 */
.daily-checkin-section {
  padding: 0 var(--spacing-md) var(--spacing-md);
}

.checkin-card {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: var(--border-radius-lg);
  padding: var(--spacing-lg);
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
}

.checkin-info {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
}

.checkin-icon {
  font-size: 32px;
}

.checkin-title {
  font-size: var(--font-size-md);
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: var(--spacing-xs);
}

.checkin-desc {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
}

.checkin-btn {
  background: linear-gradient(135deg, var(--success-color), #28a745);
  color: white;
  border: none;
  padding: var(--spacing-sm) var(--spacing-lg);
  border-radius: var(--border-radius-md);
  font-size: var(--font-size-sm);
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 4px 12px rgba(40, 167, 69, 0.3);
}

.checkin-btn:hover:not(.disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(40, 167, 69, 0.4);
}

.checkin-btn.disabled {
  background: var(--text-secondary);
  cursor: not-allowed;
  box-shadow: none;
}

/* 功能菜单 */
.menu-section {
  padding: 0 var(--spacing-md);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.menu-group {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: var(--border-radius-lg);
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
}

.menu-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  padding: var(--spacing-lg);
  cursor: pointer;
  transition: all 0.2s ease;
  border-bottom: 1px solid var(--border);
}

.menu-item:last-child {
  border-bottom: none;
}

.menu-item:hover {
  background: var(--primary-light);
}

.menu-icon {
  width: 40px;
  height: 40px;
  border-radius: var(--border-radius-round);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  background: var(--primary-light);
  color: var(--primary-color);
}

.menu-content {
  flex: 1;
}

.menu-title {
  font-size: var(--font-size-md);
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: var(--spacing-xs);
}

.menu-desc {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
}

.menu-badge {
  background: var(--error-color);
  color: white;
  font-size: var(--font-size-xs);
  font-weight: 600;
  padding: 2px 6px;
  border-radius: var(--border-radius-full);
  min-width: 18px;
  text-align: center;
}

.menu-arrow {
  color: var(--text-secondary);
  font-size: 14px;
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

.avatar-picker-modal,
.settings-modal,
.study-report-modal,
.error-book-modal,
.feedback-modal,
.about-modal {
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

/* 头像选择器 */
.avatar-options {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-lg);
}

.avatar-option {
  aspect-ratio: 1;
  border-radius: var(--border-radius-round);
  overflow: hidden;
  cursor: pointer;
  border: 3px solid transparent;
  transition: all 0.2s ease;
}

.avatar-option:hover {
  transform: scale(1.05);
}

.avatar-option.selected {
  border-color: var(--primary-color);
}

.avatar-option img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.upload-section {
  text-align: center;
  padding: var(--spacing-lg);
  border: 2px dashed var(--border);
  border-radius: var(--border-radius-md);
}

.upload-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-sm);
  background: var(--primary-light);
  color: var(--primary-color);
  border: none;
  padding: var(--spacing-sm) var(--spacing-md);
  border-radius: var(--border-radius-md);
  font-size: var(--font-size-sm);
  cursor: pointer;
  transition: all 0.2s ease;
  margin: 0 auto;
}

.upload-btn:hover {
  background: var(--primary-color);
  color: white;
}

/* 设置弹窗 */
.setting-group {
  margin-bottom: var(--spacing-lg);
}

.setting-group h4 {
  font-size: var(--font-size-md);
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 var(--spacing-md) 0;
  padding-bottom: var(--spacing-sm);
  border-bottom: 1px solid var(--border);
}

.setting-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--spacing-md) 0;
  border-bottom: 1px solid var(--border);
}

.setting-item:last-child {
  border-bottom: none;
}

.setting-info {
  flex: 1;
}

.setting-title {
  font-size: var(--font-size-md);
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: var(--spacing-xs);
}

.setting-desc {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
}

.setting-control {
  margin-left: var(--spacing-md);
}

.setting-select {
  padding: var(--spacing-xs) var(--spacing-sm);
  border: 1px solid var(--border);
  border-radius: var(--border-radius-sm);
  font-size: var(--font-size-sm);
  background: white;
  cursor: pointer;
}

/* 开关样式 */
.switch {
  position: relative;
  display: inline-block;
  width: 50px;
  height: 24px;
}

.switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: var(--text-secondary);
  transition: 0.4s;
  border-radius: 24px;
}

.slider:before {
  position: absolute;
  content: "";
  height: 18px;
  width: 18px;
  left: 3px;
  bottom: 3px;
  background-color: white;
  transition: 0.4s;
  border-radius: 50%;
}

input:checked + .slider {
  background-color: var(--primary-color);
}

input:checked + .slider:before {
  transform: translateX(26px);
}

/* 学习报告 */
.report-summary {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-lg);
}

.report-item {
  text-align: center;
  padding: var(--spacing-md);
  background: var(--background);
  border-radius: var(--border-radius-md);
}

.report-label {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  margin-bottom: var(--spacing-xs);
}

.report-value {
  font-size: var(--font-size-lg);
  font-weight: 700;
  color: var(--primary-color);
}

/* 错题本 */
.error-stats {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-lg);
  padding: var(--spacing-md);
  background: var(--background);
  border-radius: var(--border-radius-md);
}

.error-count {
  font-size: var(--font-size-md);
  font-weight: 600;
  color: var(--text-primary);
}

.practice-btn {
  background: var(--primary-color);
  color: white;
  border: none;
  padding: var(--spacing-sm) var(--spacing-md);
  border-radius: var(--border-radius-md);
  font-size: var(--font-size-sm);
  cursor: pointer;
  transition: all 0.2s ease;
}

.practice-btn:hover {
  background: var(--primary-dark);
}

.error-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.error-item {
  padding: var(--spacing-md);
  border: 1px solid var(--border);
  border-radius: var(--border-radius-md);
  transition: all 0.2s ease;
}

.error-item:hover {
  background: var(--background);
}

.error-subject {
  font-size: var(--font-size-xs);
  color: var(--primary-color);
  font-weight: 600;
  margin-bottom: var(--spacing-xs);
}

.error-question {
  font-size: var(--font-size-sm);
  color: var(--text-primary);
  margin-bottom: var(--spacing-xs);
}

.error-date {
  font-size: var(--font-size-xs);
  color: var(--text-secondary);
}

/* 反馈表单 */
.feedback-form {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

.form-group label {
  font-size: var(--font-size-sm);
  font-weight: 600;
  color: var(--text-primary);
}

.form-control {
  padding: var(--spacing-sm);
  border: 1px solid var(--border);
  border-radius: var(--border-radius-sm);
  font-size: var(--font-size-sm);
  transition: all 0.2s ease;
}

.form-control:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px var(--primary-light);
}

/* 关于我们 */
.about-content {
  text-align: center;
}

.app-info {
  margin-bottom: var(--spacing-lg);
}

.app-logo {
  font-size: 64px;
  color: var(--primary-color);
  margin-bottom: var(--spacing-md);
}

.app-info h4 {
  font-size: var(--font-size-xl);
  font-weight: 700;
  color: var(--text-primary);
  margin: 0 0 var(--spacing-xs) 0;
}

.version {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  margin: 0;
}

.about-text {
  margin-bottom: var(--spacing-lg);
  text-align: left;
}

.about-text p {
  font-size: var(--font-size-md);
  color: var(--text-secondary);
  line-height: var(--line-height-normal);
  margin-bottom: var(--spacing-sm);
}

.contact-info {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.contact-item {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-sm);
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
}

.contact-item i {
  color: var(--primary-color);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .user-card {
    flex-direction: column;
    text-align: center;
    gap: var(--spacing-md);
  }
  
  .user-stats {
    justify-content: center;
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
  .achievements-grid {
    grid-template-columns: 1fr;
  }
  
  .achievement-item {
    flex-direction: column;
    text-align: center;
    gap: var(--spacing-sm);
  }
  
  .report-summary {
    grid-template-columns: 1fr;
  }
  
  .avatar-options {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .modal-overlay {
    padding: var(--spacing-sm);
  }
  
  .modal-actions {
    flex-direction: column;
  }
  
  .modal-actions .btn {
    flex: none;
  }
  
  .menu-row {
    flex-direction: column;
  }
  
  .menu-item.half-width {
    margin-bottom: var(--spacing-md);
  }
}

@media (max-width: 480px) {
  .page-header {
    padding: var(--spacing-sm);
  }
  
  .user-info {
    padding: var(--spacing-sm);
  }
  
  .user-card {
    padding: var(--spacing-md);
  }
  
  .user-avatar img {
    width: 60px;
    height: 60px;
  }
  
  .user-stats {
    gap: var(--spacing-md);
  }
  
  .study-stats,
  .achievements,
  .menu-section {
    padding: 0 var(--spacing-sm);
  }
  
  .stat-card {
    padding: var(--spacing-md);
  }
  
  .menu-item {
    padding: var(--spacing-md);
  }
  
  .modal-content {
    padding: var(--spacing-md);
  }
  
  .modal-actions {
    padding: var(--spacing-md);
  }
  
  .avatar-options {
    grid-template-columns: repeat(2, 1fr);
    gap: var(--spacing-sm);
  }
}
</style>
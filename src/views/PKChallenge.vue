<template>
  <div class="pk-challenge-page page-content-mobile">
    <!-- 顶部导航 -->
    <div class="page-header">
      <button class="back-btn" @click="goBack">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M19 12H5M12 19L5 12L12 5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>
      <h1 class="page-title">PK挑战</h1>
      <div class="header-actions">
        <button class="action-btn" @click="showRankings = true">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M6 9L12 15L18 9" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          排行榜
        </button>
      </div>
    </div>

    <!-- 主要内容 -->
    <div class="pk-content">
      <!-- 挑战模式选择 -->
      <div class="challenge-modes" v-if="!currentChallenge">
        <div class="modes-header">
          <h2 class="section-title">⚔️ 选择挑战模式</h2>
          <p class="section-desc">与AI老师一较高下，赢取丰厚积分奖励！</p>
        </div>
        
        <div class="modes-grid">
          <div 
            v-for="mode in challengeModes" 
            :key="mode.id"
            class="mode-card"
            @click="selectMode(mode)"
          >
            <div class="mode-icon">{{ mode.icon }}</div>
            <div class="mode-info">
              <h3 class="mode-title">{{ mode.title }}</h3>
              <p class="mode-desc">{{ mode.description }}</p>
              <div class="mode-details">
                <div class="detail-item">
                  <span class="detail-label">题目数量：</span>
                  <span class="detail-value">{{ mode.questionCount }}题</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">时间限制：</span>
                  <span class="detail-value">{{ mode.timeLimit }}分钟</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">当前奖励：</span>
                  <span class="detail-value reward">{{ getCurrentReward(mode.id) }}分</span>
                </div>
                <div class="detail-item" v-if="canGetTreasureBox(mode.id)">
                  <span class="detail-label">首胜奖励：</span>
                  <span class="detail-value treasure">{{ treasureBoxConfig[mode.treasureBox].name }}</span>
                </div>
                <div class="detail-item" v-else>
                  <span class="detail-label">今日挑战：</span>
                  <span class="detail-value">{{ dailyChallenges[mode.id] }}/4次</span>
                </div>
              </div>
            </div>
            <div class="mode-difficulty" :class="mode.difficulty">
              {{ getDifficultyText(mode.difficulty) }}
            </div>
          </div>
        </div>
        
        <!-- 快速挑战 -->
        <div class="quick-challenge">
          <div class="quick-header">
            <h3 class="quick-title">⚡ 快速挑战</h3>
            <p class="quick-desc">随机题目，立即开始</p>
          </div>
          <button class="btn btn-primary quick-btn" @click="startQuickChallenge">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <polygon points="5,3 19,12 5,21 5,3" stroke="currentColor" stroke-width="2" fill="currentColor"/>
            </svg>
            开始快速挑战
          </button>
        </div>
      </div>
      
      <!-- 挑战进行中 -->
      <div class="challenge-active" v-if="currentChallenge && !challengeResult">
        <!-- 挑战头部信息 -->
        <div class="challenge-header">
          <div class="challenge-info">
            <div class="challenge-title">{{ currentChallenge.title }}</div>
            <div class="challenge-progress">
              <span class="progress-text">{{ currentQuestionIndex + 1 }}/{{ currentChallenge.questions.length }}</span>
              <div class="progress-bar">
                <div 
                  class="progress-fill" 
                  :style="{ width: ((currentQuestionIndex + 1) / currentChallenge.questions.length * 100) + '%' }"
                ></div>
              </div>
            </div>
          </div>
          
          <div class="challenge-timer">
            <div class="timer-icon">⏱️</div>
            <div class="timer-text">{{ formatTime(timeRemaining) }}</div>
          </div>
        </div>
        
        <!-- 对战双方 -->
        <div class="battle-arena">
          <div class="player-side">
            <div class="player-avatar">
              <img :src="userInfo.avatar" alt="用户头像" class="avatar-img" />
              <div class="player-name">{{ userInfo.name }}</div>
            </div>
            <div class="player-score">
              <div class="score-label">得分</div>
              <div class="score-value">{{ playerScore }}</div>
            </div>
          </div>
          
          <div class="vs-indicator">
            <div class="vs-text">VS</div>
            <div class="battle-effects" :class="{ active: showBattleEffect }">
              <div class="effect-spark"></div>
              <div class="effect-spark"></div>
              <div class="effect-spark"></div>
            </div>
          </div>
          
          <div class="ai-side">
            <div class="ai-avatar">
              <div class="avatar-icon">🤖</div>
              <div class="ai-name">AI老师</div>
            </div>
            <div class="ai-score">
              <div class="score-label">得分</div>
              <div class="score-value">{{ aiScore }}</div>
            </div>
          </div>
        </div>
        
        <!-- 当前题目 -->
        <div class="question-card" v-if="currentQuestion">
          <div class="question-header">
            <div class="question-type">{{ getQuestionTypeText(currentQuestion.type) }}</div>
            <div class="question-difficulty" :class="currentQuestion.difficulty">
              {{ getDifficultyText(currentQuestion.difficulty) }}
            </div>
          </div>
          
          <div class="question-content">
            <div class="question-text">{{ currentQuestion.question }}</div>
            
            <!-- 选择题选项 -->
            <div class="question-options" v-if="currentQuestion.type === 'choice'">
              <button 
                v-for="(option, index) in currentQuestion.options" 
                :key="index"
                class="option-btn"
                :class="{ 
                  selected: selectedAnswer === index,
                  correct: showAnswer && index === currentQuestion.correctAnswer,
                  wrong: showAnswer && selectedAnswer === index && index !== currentQuestion.correctAnswer
                }"
                @click="selectAnswer(index)"
                :disabled="showAnswer || timeUp"
              >
                {{ String.fromCharCode(65 + index) }}. {{ option }}
              </button>
            </div>
            
            <!-- 填空题输入 -->
            <div class="question-input" v-else-if="currentQuestion.type === 'fill'">
              <input 
                v-model="fillAnswer"
                type="text" 
                class="fill-input"
                placeholder="请输入答案"
                :disabled="showAnswer || timeUp"
                @keyup.enter="submitFillAnswer"
              >
              <button 
                class="submit-btn btn btn-primary"
                @click="submitFillAnswer"
                :disabled="!fillAnswer.trim() || showAnswer || timeUp"
              >
                提交
              </button>
            </div>
            
            <!-- 判断题 -->
            <div class="question-judge" v-else-if="currentQuestion.type === 'judge'">
              <button 
                class="judge-btn"
                :class="{ 
                  selected: selectedAnswer === true,
                  correct: showAnswer && currentQuestion.correctAnswer === true,
                  wrong: showAnswer && selectedAnswer === true && currentQuestion.correctAnswer !== true
                }"
                @click="selectAnswer(true)"
                :disabled="showAnswer || timeUp"
              >
                ✓ 正确
              </button>
              <button 
                class="judge-btn"
                :class="{ 
                  selected: selectedAnswer === false,
                  correct: showAnswer && currentQuestion.correctAnswer === false,
                  wrong: showAnswer && selectedAnswer === false && currentQuestion.correctAnswer !== false
                }"
                @click="selectAnswer(false)"
                :disabled="showAnswer || timeUp"
              >
                ✗ 错误
              </button>
            </div>
          </div>
          
          <!-- 答案解析 -->
          <div class="question-explanation" v-if="showAnswer && currentQuestion.explanation">
            <div class="explanation-header">
              <div class="explanation-icon">💡</div>
              <div class="explanation-title">解析</div>
            </div>
            <div class="explanation-text">{{ currentQuestion.explanation }}</div>
          </div>
          
          <!-- 操作按钮 -->
          <div class="question-actions">
            <button 
              v-if="!showAnswer && !timeUp"
              class="btn btn-outline"
              @click="skipQuestion"
            >
              跳过
            </button>
            <button 
              v-if="showAnswer"
              class="btn btn-primary"
              @click="nextQuestion"
            >
              {{ currentQuestionIndex < currentChallenge.questions.length - 1 ? '下一题' : '查看结果' }}
            </button>
          </div>
        </div>
      </div>
      
      <!-- 挑战结果 -->
      <div class="challenge-result" v-if="challengeResult">
        <div class="result-header">
          <div class="result-icon" :class="challengeResult.status">
            {{ challengeResult.status === 'win' ? '🏆' : challengeResult.status === 'lose' ? '😔' : '🤝' }}
          </div>
          <h2 class="result-title">{{ getResultTitle(challengeResult.status) }}</h2>
          <p class="result-subtitle">{{ challengeResult.message }}</p>
        </div>
        
        <!-- 得分对比 -->
        <div class="score-comparison">
          <div class="score-item player">
            <div class="score-avatar">
              <img :src="userInfo.avatar" alt="用户头像" />
            </div>
            <div class="score-info">
              <div class="score-name">{{ userInfo.name }}</div>
              <div class="score-points">{{ challengeResult.playerScore }}</div>
              <div class="score-accuracy">正确率: {{ challengeResult.playerAccuracy }}%</div>
            </div>
          </div>
          
          <div class="score-divider">VS</div>
          
          <div class="score-item ai">
            <div class="score-avatar">
              <div class="ai-avatar-icon">🤖</div>
            </div>
            <div class="score-info">
              <div class="score-name">AI老师</div>
              <div class="score-points">{{ challengeResult.aiScore }}</div>
              <div class="score-accuracy">正确率: {{ challengeResult.aiAccuracy }}%</div>
            </div>
          </div>
        </div>
        
        <!-- 奖励信息 -->
        <div class="reward-info" v-if="challengeResult.reward > 0 || challengeResult.card">
          <div class="reward-icon">🎁</div>
          <div class="reward-text">
            <div class="reward-title">恭喜获得奖励！</div>
            <div class="reward-points" v-if="challengeResult.reward > 0">+{{ challengeResult.reward }} 积分</div>
            <div class="treasure-reward" v-if="challengeResult.card">
              <div class="treasure-box" :style="{ color: treasureBoxConfig[challengeResult.treasureBox].color }">
                {{ treasureBoxConfig[challengeResult.treasureBox].icon }} {{ treasureBoxConfig[challengeResult.treasureBox].name }}
              </div>
              <div class="card-reward" :class="challengeResult.card.rarity">
                <span class="card-icon">{{ challengeResult.card.icon }}</span>
                <span class="card-name">{{ challengeResult.card.name }}</span>
                <span class="card-desc">{{ challengeResult.card.description }}</span>
              </div>
            </div>
          </div>
        </div>
        
        <!-- 详细统计 -->
        <div class="result-stats">
          <h3 class="stats-title">详细统计</h3>
          <div class="stats-grid">
            <div class="stat-item">
              <div class="stat-icon">📊</div>
              <div class="stat-info">
                <div class="stat-value">{{ challengeResult.totalQuestions }}</div>
                <div class="stat-label">总题数</div>
              </div>
            </div>
            <div class="stat-item">
              <div class="stat-icon">✅</div>
              <div class="stat-info">
                <div class="stat-value">{{ challengeResult.correctAnswers }}</div>
                <div class="stat-label">答对</div>
              </div>
            </div>
            <div class="stat-item">
              <div class="stat-icon">❌</div>
              <div class="stat-info">
                <div class="stat-value">{{ challengeResult.wrongAnswers }}</div>
                <div class="stat-label">答错</div>
              </div>
            </div>
            <div class="stat-item">
              <div class="stat-icon">⏱️</div>
              <div class="stat-info">
                <div class="stat-value">{{ formatTime(challengeResult.timeUsed) }}</div>
                <div class="stat-label">用时</div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- 操作按钮 -->
        <div class="result-actions">
          <button class="btn btn-outline" @click="shareResult">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <circle cx="18" cy="5" r="3" stroke="currentColor" stroke-width="2"/>
              <circle cx="6" cy="12" r="3" stroke="currentColor" stroke-width="2"/>
              <circle cx="18" cy="19" r="3" stroke="currentColor" stroke-width="2"/>
              <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" stroke="currentColor" stroke-width="2"/>
              <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" stroke="currentColor" stroke-width="2"/>
            </svg>
            分享成绩
          </button>
          <button class="btn btn-secondary" @click="challengeAgain">
            再来一局
          </button>
          <button class="btn btn-primary" @click="backToModes">
            返回选择
          </button>
        </div>
      </div>
    </div>
    
    <!-- 排行榜弹窗 -->
    <div v-if="showRankings" class="modal-overlay" @click="showRankings = false">
      <div class="rankings-modal" @click.stop>
        <div class="modal-header">
          <h3>🏆 排行榜</h3>
          <button class="close-btn" @click="showRankings = false">×</button>
        </div>
        <div class="rankings-content">
          <div class="ranking-tabs">
            <button 
              v-for="tab in rankingTabs" 
              :key="tab.id"
              class="tab-btn"
              :class="{ active: activeRankingTab === tab.id }"
              @click="activeRankingTab = tab.id"
            >
              {{ tab.name }}
            </button>
          </div>
          <div class="ranking-list">
            <div 
              v-for="(player, index) in getCurrentRankings()" 
              :key="player.id"
              class="ranking-item"
              :class="{ current: player.id === userInfo.id }"
            >
              <div class="rank-number" :class="getRankClass(index + 1)">
                {{ index + 1 }}
              </div>
              <div class="player-info">
                <img :src="player.avatar" alt="头像" class="player-avatar" />
                <div class="player-details">
                  <div class="player-name">{{ player.name }}</div>
                  <div class="player-level">{{ player.level }}</div>
                </div>
              </div>
              <div class="player-score">{{ player.score }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '../stores/user'
import { usePKStore } from '../stores/pk'

/**
 * PK挑战页面组件
 * 实现与AI老师的竞技对战功能
 */

const router = useRouter()
const userStore = useUserStore()
const pkStore = usePKStore()

// 响应式数据
const currentChallenge = ref(null)
const currentQuestionIndex = ref(0)
const selectedAnswer = ref(null)
const fillAnswer = ref('')
const showAnswer = ref(false)
const timeRemaining = ref(0)
const timeUp = ref(false)
const playerScore = ref(0)
const aiScore = ref(0)
const challengeResult = ref(null)
const showBattleEffect = ref(false)
const showRankings = ref(false)
const activeRankingTab = ref('weekly')
const challengeTimer = ref(null)
const showTreasureBox = ref(false)
const treasureBoxResult = ref(null)

// 每日挑战次数跟踪
const dailyChallenges = ref({
  easy: 0,
  normal: 0,
  hard: 0,
  lastResetDate: new Date().toDateString()
})

// 挑战模式配置
const challengeModes = ref([
  {
    id: 'easy',
    title: '新手挑战',
    description: '适合初学者的简单题目',
    icon: '🌱',
    difficulty: 'easy',
    questionCount: 10,
    timeLimit: 15,
    baseReward: 100,
    treasureBox: 'bronze'
  },
  {
    id: 'normal',
    title: '标准挑战',
    description: '中等难度，考验基础知识',
    icon: '⚡',
    difficulty: 'medium',
    questionCount: 15,
    timeLimit: 20,
    baseReward: 500,
    treasureBox: 'silver'
  },
  {
    id: 'hard',
    title: '高手挑战',
    description: '高难度题目，挑战极限',
    icon: '🔥',
    difficulty: 'hard',
    questionCount: 20,
    timeLimit: 25,
    baseReward: 1000,
    treasureBox: 'gold'
  }
])

// 排行榜标签
const rankingTabs = ref([
  { id: 'weekly', name: '本周' },
  { id: 'monthly', name: '本月' },
  { id: 'all', name: '总榜' }
])

// 宝箱配置
const treasureBoxConfig = ref({
  bronze: {
    name: '青铜宝箱',
    icon: '📦',
    color: '#CD7F32',
    cards: [
      { name: '青铜·金榜题名', rarity: 'bronze', icon: '🥉', description: '基础学习加成卡牌' },
      { name: '青铜·勤学苦练', rarity: 'bronze', icon: '📚', description: '提升学习效率' },
      { name: '青铜·专注力', rarity: 'bronze', icon: '🎯', description: '增强注意力集中' }
    ]
  },
  silver: {
    name: '白银宝箱',
    icon: '🎁',
    color: '#C0C0C0',
    cards: [
      { name: '白银·金榜题名', rarity: 'silver', icon: '🥈', description: '中级学习加成卡牌' },
      { name: '白银·智慧之光', rarity: 'silver', icon: '💡', description: '提升解题思路' },
      { name: '白银·记忆强化', rarity: 'silver', icon: '🧠', description: '增强记忆能力' }
    ]
  },
  gold: {
    name: '黄金宝箱',
    icon: '💎',
    color: '#FFD700',
    cards: [
      { name: '黄金·金榜题名', rarity: 'gold', icon: '🥇', description: '高级学习加成卡牌' },
      { name: '黄金·学神降临', rarity: 'gold', icon: '👑', description: '全能力大幅提升' },
      { name: '黄金·时间掌控', rarity: 'gold', icon: '⏰', description: '时间管理大师' },
      { name: '隐藏·传说金榜', rarity: 'legendary', icon: '🌟', description: '传说级学习神卡', hidden: true }
    ]
  }
})

// 计算属性
const userInfo = computed(() => userStore.userInfo)

// 模拟排行榜数据
const rankings = ref({
  weekly: [
    { id: '1', name: '学霸小明', avatar: '/avatars/1.jpg', level: 'Lv.15', score: 2580 },
    { id: '2', name: '数学天才', avatar: '/avatars/2.jpg', level: 'Lv.12', score: 2340 },
    { id: '3', name: '解题高手', avatar: '/avatars/3.jpg', level: 'Lv.18', score: 2120 },
    { id: userInfo.value?.id || '4', name: userInfo.value?.name || '我', avatar: userInfo.value?.avatar || '/avatars/default.jpg', level: 'Lv.8', score: 1850 },
    { id: '5', name: '勤奋学生', avatar: '/avatars/5.jpg', level: 'Lv.10', score: 1720 }
  ],
  monthly: [
    { id: '1', name: '月度冠军', avatar: '/avatars/1.jpg', level: 'Lv.20', score: 8950 },
    { id: '2', name: '学习达人', avatar: '/avatars/2.jpg', level: 'Lv.17', score: 8200 },
    { id: '3', name: '知识王者', avatar: '/avatars/3.jpg', level: 'Lv.19', score: 7800 }
  ],
  all: [
    { id: '1', name: '传奇学霸', avatar: '/avatars/1.jpg', level: 'Lv.25', score: 25000 },
    { id: '2', name: '终极高手', avatar: '/avatars/2.jpg', level: 'Lv.23', score: 22000 },
    { id: '3', name: '学神降临', avatar: '/avatars/3.jpg', level: 'Lv.24', score: 20000 }
  ]
})
const currentQuestion = computed(() => {
  if (!currentChallenge.value || currentQuestionIndex.value >= currentChallenge.value.questions.length) {
    return null
  }
  return currentChallenge.value.questions[currentQuestionIndex.value]
})

// 方法
/**
 * 检查并重置每日挑战次数
 */
const checkDailyReset = () => {
  const today = new Date().toDateString()
  if (dailyChallenges.value.lastResetDate !== today) {
    dailyChallenges.value = {
      easy: 0,
      normal: 0,
      hard: 0,
      lastResetDate: today
    }
    // 保存到本地存储
    localStorage.setItem('dailyChallenges', JSON.stringify(dailyChallenges.value))
  }
}

/**
 * 获取当前挑战的奖励积分
 */
const getCurrentReward = (modeId) => {
  const challengeCount = dailyChallenges.value[modeId] || 0
  const mode = challengeModes.value.find(m => m.id === modeId)
  
  if (!mode) return 0
  
  switch (challengeCount) {
    case 0: return mode.baseReward // 第一次：基础奖励
    case 1: return Math.floor(mode.baseReward * 0.4) // 第二次：40%
    case 2: return Math.floor(mode.baseReward * 0.1) // 第三次：10%
    default: return 0 // 第四次及以后：0积分
  }
}

/**
 * 检查是否可以获得宝箱
 */
const canGetTreasureBox = (modeId) => {
  return (dailyChallenges.value[modeId] || 0) === 0
}

/**
 * 开启宝箱
 */
const openTreasureBox = (boxType) => {
  const boxConfig = treasureBoxConfig.value[boxType]
  if (!boxConfig) return null
  
  let availableCards = [...boxConfig.cards]
  
  // 黄金宝箱有几率出隐藏款
  if (boxType === 'gold') {
    const hiddenCard = boxConfig.cards.find(card => card.hidden)
    if (hiddenCard && Math.random() < 0.1) { // 10%几率出隐藏款
      return hiddenCard
    } else {
      availableCards = boxConfig.cards.filter(card => !card.hidden)
    }
  }
  
  // 随机选择一张卡牌
  const randomIndex = Math.floor(Math.random() * availableCards.length)
  return availableCards[randomIndex]
}

/**
 * 返回上一页
 */
const goBack = () => {
  if (challengeTimer.value) {
    clearInterval(challengeTimer.value)
  }
  router.back()
}

/**
 * 获取难度文本
 */
const getDifficultyText = (difficulty) => {
  const difficultyMap = {
    easy: '简单',
    medium: '中等',
    hard: '困难',
    expert: '专家'
  }
  return difficultyMap[difficulty] || '中等'
}

/**
 * 获取题目类型文本
 */
const getQuestionTypeText = (type) => {
  const typeMap = {
    choice: '选择题',
    fill: '填空题',
    judge: '判断题'
  }
  return typeMap[type] || '题目'
}

/**
 * 格式化时间显示
 */
const formatTime = (seconds) => {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`
}

/**
 * 获取结果标题
 */
const getResultTitle = (status) => {
  const titleMap = {
    win: '恭喜获胜！',
    lose: '再接再厉！',
    tie: '平局！'
  }
  return titleMap[status] || '挑战结束'
}

/**
 * 获取排名样式类
 */
const getRankClass = (rank) => {
  if (rank === 1) return 'gold'
  if (rank === 2) return 'silver'
  if (rank === 3) return 'bronze'
  return ''
}

/**
 * 获取当前排行榜数据
 */
const getCurrentRankings = () => {
  return rankings.value[activeRankingTab.value] || []
}

/**
 * 选择挑战模式
 */
const selectMode = (mode) => {
  startChallenge(mode)
}

/**
 * 开始快速挑战
 */
const startQuickChallenge = () => {
  const randomMode = challengeModes.value[Math.floor(Math.random() * challengeModes.value.length)]
  startChallenge(randomMode)
}

/**
 * 开始挑战
 */
const startChallenge = async (mode) => {
  try {
    // 生成挑战题目
    const questions = generateQuestions(mode)
    
    currentChallenge.value = {
      ...mode,
      questions,
      startTime: Date.now()
    }
    
    currentQuestionIndex.value = 0
    playerScore.value = 0
    aiScore.value = 0
    timeRemaining.value = mode.timeLimit * 60
    challengeResult.value = null
    
    // 开始计时
    startTimer()
    
  } catch (error) {
    console.error('开始挑战失败:', error)
    alert('挑战开始失败，请重试')
  }
}

/**
 * 生成题目
 */
const generateQuestions = (mode) => {
  // 这里应该根据模式从题库中获取题目
  // 现在使用模拟数据
  const questions = []
  
  for (let i = 0; i < mode.questionCount; i++) {
    const questionTypes = ['choice', 'fill', 'judge']
    const type = questionTypes[Math.floor(Math.random() * questionTypes.length)]
    
    let question
    
    if (type === 'choice') {
      question = {
        id: i + 1,
        type: 'choice',
        difficulty: mode.difficulty,
        question: `计算 ${Math.floor(Math.random() * 20) + 1} × ${Math.floor(Math.random() * 20) + 1} = ?`,
        options: ['120', '144', '156', '168'],
        correctAnswer: 1,
        explanation: '这是一道基础的乘法计算题。'
      }
    } else if (type === 'fill') {
      question = {
        id: i + 1,
        type: 'fill',
        difficulty: mode.difficulty,
        question: '解方程：2x + 5 = 13，x = ___',
        correctAnswer: '4',
        explanation: '移项得到2x = 8，所以x = 4。'
      }
    } else {
      question = {
        id: i + 1,
        type: 'judge',
        difficulty: mode.difficulty,
        question: '判断：所有的质数都是奇数。',
        correctAnswer: false,
        explanation: '2是质数但不是奇数，所以这个说法是错误的。'
      }
    }
    
    questions.push(question)
  }
  
  return questions
}

/**
 * 开始计时
 */
const startTimer = () => {
  challengeTimer.value = setInterval(() => {
    timeRemaining.value--
    
    if (timeRemaining.value <= 0) {
      timeUp.value = true
      clearInterval(challengeTimer.value)
      endChallenge()
    }
  }, 1000)
}

/**
 * 选择答案
 */
const selectAnswer = (answer) => {
  if (showAnswer.value || timeUp.value) return
  
  selectedAnswer.value = answer
  showAnswer.value = true
  
  // 检查答案正确性
  const isCorrect = checkAnswer(answer)
  
  if (isCorrect) {
    playerScore.value += getQuestionScore(currentQuestion.value.difficulty)
    showBattleEffect.value = true
    setTimeout(() => {
      showBattleEffect.value = false
    }, 1000)
  }
  
  // AI也会"答题"（模拟）
  setTimeout(() => {
    const aiCorrect = Math.random() > 0.3 // AI有70%的正确率
    if (aiCorrect) {
      aiScore.value += getQuestionScore(currentQuestion.value.difficulty)
    }
  }, 500)
}

/**
 * 提交填空题答案
 */
const submitFillAnswer = () => {
  if (!fillAnswer.value.trim() || showAnswer.value || timeUp.value) return
  
  selectAnswer(fillAnswer.value.trim())
}

/**
 * 检查答案正确性
 */
const checkAnswer = (answer) => {
  const question = currentQuestion.value
  
  if (question.type === 'choice') {
    return answer === question.correctAnswer
  } else if (question.type === 'fill') {
    return answer.toLowerCase() === question.correctAnswer.toLowerCase()
  } else if (question.type === 'judge') {
    return answer === question.correctAnswer
  }
  
  return false
}

/**
 * 获取题目分数
 */
const getQuestionScore = (difficulty) => {
  const scoreMap = {
    easy: 10,
    medium: 15,
    hard: 20,
    expert: 25
  }
  return scoreMap[difficulty] || 10
}

/**
 * 跳过题目
 */
const skipQuestion = () => {
  showAnswer.value = true
  
  // AI仍然会答题
  setTimeout(() => {
    const aiCorrect = Math.random() > 0.3
    if (aiCorrect) {
      aiScore.value += getQuestionScore(currentQuestion.value.difficulty)
    }
  }, 500)
}

/**
 * 下一题
 */
const nextQuestion = () => {
  if (currentQuestionIndex.value < currentChallenge.value.questions.length - 1) {
    currentQuestionIndex.value++
    selectedAnswer.value = null
    fillAnswer.value = ''
    showAnswer.value = false
  } else {
    endChallenge()
  }
}

/**
 * 结束挑战
 */
const endChallenge = () => {
  if (challengeTimer.value) {
    clearInterval(challengeTimer.value)
  }
  
  const totalQuestions = currentChallenge.value.questions.length
  const correctAnswers = Math.floor(playerScore.value / getQuestionScore('medium'))
  const wrongAnswers = totalQuestions - correctAnswers
  const playerAccuracy = Math.round((correctAnswers / totalQuestions) * 100)
  const aiAccuracy = Math.round((aiScore.value / (totalQuestions * getQuestionScore('medium'))) * 100)
  
  let status = 'tie'
  let message = '势均力敌，平局！'
  let reward = 0
  let treasureBox = null
  let card = null
  
  const modeId = currentChallenge.value.id
  const isFirstWinToday = canGetTreasureBox(modeId)
  
  if (playerScore.value > aiScore.value) {
    status = 'win'
    message = '太棒了！你战胜了AI老师！'
    reward = getCurrentReward(modeId)
    
    // 如果是今日首胜，获得宝箱
    if (isFirstWinToday) {
      treasureBox = currentChallenge.value.treasureBox
      card = openTreasureBox(treasureBox)
      message += ' 恭喜获得今日首胜宝箱！'
    }
    
    // 更新每日挑战次数
    dailyChallenges.value[modeId]++
    localStorage.setItem('dailyChallenges', JSON.stringify(dailyChallenges.value))
    
  } else if (playerScore.value < aiScore.value) {
    status = 'lose'
    message = '虽然这次没有获胜，但你已经很棒了！'
    reward = 0 // 失败不获得积分
  } else {
    reward = Math.floor(getCurrentReward(modeId) * 0.5) // 平局获得一半积分
  }
  
  challengeResult.value = {
    status,
    message,
    playerScore: playerScore.value,
    aiScore: aiScore.value,
    playerAccuracy,
    aiAccuracy,
    totalQuestions,
    correctAnswers,
    wrongAnswers,
    timeUsed: (currentChallenge.value.timeLimit * 60) - timeRemaining.value,
    reward,
    treasureBox,
    card,
    isFirstWinToday
  }
  
  // 更新用户积分
  if (reward > 0) {
    userStore.addPoints(reward)
  }
  
  // 如果获得了卡牌，保存到用户卡牌口袋
  if (card) {
    saveCardToPocket(card)
  }
  
  // 更新PK统计
  pkStore.updatePKStats({
    win: status === 'win' ? 1 : 0,
    lose: status === 'lose' ? 1 : 0,
    tie: status === 'tie' ? 1 : 0
  })
}

/**
 * 保存卡牌到用户口袋
 */
const saveCardToPocket = (card) => {
  // 从localStorage获取现有卡牌
  const existingCards = JSON.parse(localStorage.getItem('userCards') || '{ "bronze": [], "silver": [], "gold": [], "legendary": [] }')
  
  // 生成唯一的卡牌编号
  const generateCardNumber = (rarity) => {
    const allCards = [
      ...existingCards.bronze,
      ...existingCards.silver,
      ...existingCards.gold,
      ...existingCards.legendary
    ]
    
    let number
    do {
      number = String(Math.floor(Math.random() * 999) + 1).padStart(3, '0')
    } while (allCards.some(c => c.number === number))
    
    return number
  }
  
  // 创建新卡牌对象
  const newCard = {
    id: Date.now() + Math.random(),
    number: generateCardNumber(card.rarity),
    name: card.name,
    description: card.description,
    rarity: card.rarity,
    icon: card.icon,
    obtainedAt: new Date().toISOString()
  }
  
  // 添加到对应稀有度的数组
  existingCards[card.rarity].push(newCard)
  
  // 保存到localStorage
  localStorage.setItem('userCards', JSON.stringify(existingCards))
}

/**
 * 分享结果
 */
const shareResult = () => {
  if (navigator.share) {
    navigator.share({
      title: 'AI一对一辅导 - PK挑战结果',
      text: `我在PK挑战中得了${challengeResult.value.playerScore}分！`,
      url: window.location.href
    })
  } else {
    alert('分享功能暂不支持')
  }
}

/**
 * 再来一局
 */
const challengeAgain = () => {
  const mode = challengeModes.value.find(m => m.id === currentChallenge.value.id)
  if (mode) {
    startChallenge(mode)
  }
}

/**
 * 返回模式选择
 */
const backToModes = () => {
  currentChallenge.value = null
  challengeResult.value = null
  currentQuestionIndex.value = 0
  selectedAnswer.value = null
  fillAnswer.value = ''
  showAnswer.value = false
  timeRemaining.value = 0
  timeUp.value = false
  playerScore.value = 0
  aiScore.value = 0
}

// 生命周期
onMounted(() => {
  // 加载每日挑战数据
  const savedChallenges = localStorage.getItem('dailyChallenges')
  if (savedChallenges) {
    dailyChallenges.value = JSON.parse(savedChallenges)
  }
  
  // 检查是否需要重置每日挑战次数
  checkDailyReset()
})

onUnmounted(() => {
  if (challengeTimer.value) {
    clearInterval(challengeTimer.value)
  }
})
</script>

<style scoped>
.pk-challenge-page {
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

/* 主要内容 */
.pk-content {
  padding: var(--spacing-md);
}

/* 挑战模式选择 */
.challenge-modes {
  max-width: 800px;
  margin: 0 auto;
}

.modes-header {
  text-align: center;
  margin-bottom: var(--spacing-xl);
  color: white;
}

.section-title {
  font-size: var(--font-size-xxl);
  font-weight: 700;
  margin: 0 0 var(--spacing-sm) 0;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.section-desc {
  font-size: var(--font-size-md);
  opacity: 0.9;
  margin: 0;
}

.modes-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--spacing-lg);
  margin-bottom: var(--spacing-xl);
}

@media (max-width: 768px) {
  .modes-grid {
    grid-template-columns: 1fr;
  }
}

.mode-card {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: var(--border-radius-lg);
  padding: var(--spacing-lg);
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  border: 2px solid transparent;
}

.mode-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
  border-color: var(--primary-color);
}

.mode-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, var(--primary-color), var(--secondary-color));
}

.mode-icon {
  font-size: 48px;
  text-align: center;
  margin-bottom: var(--spacing-md);
}

.mode-info {
  text-align: center;
}

.mode-title {
  font-size: var(--font-size-lg);
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 var(--spacing-sm) 0;
}

.mode-desc {
  font-size: var(--font-size-md);
  color: var(--text-secondary);
  margin: 0 0 var(--spacing-lg) 0;
  line-height: var(--line-height-normal);
}

.mode-details {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.detail-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-sm);
  background: var(--background);
  border-radius: var(--border-radius-sm);
}

.detail-label {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
}

.detail-value {
  font-size: var(--font-size-sm);
  font-weight: 600;
  color: var(--text-primary);
}

.detail-value.reward {
  color: var(--warning-color);
}

.detail-value.treasure {
  color: #FFD700;
  font-weight: 600;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
}

/* 宝箱和卡牌奖励样式 */
.treasure-reward {
  margin-top: var(--spacing-sm);
  padding: var(--spacing-md);
  background: linear-gradient(135deg, rgba(255, 215, 0, 0.1), rgba(255, 215, 0, 0.05));
  border-radius: var(--border-radius-md);
  border: 1px solid rgba(255, 215, 0, 0.3);
}

.treasure-box {
  font-size: var(--font-size-md);
  font-weight: 600;
  margin-bottom: var(--spacing-sm);
  text-align: center;
}

.card-reward {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-xs);
  padding: var(--spacing-md);
  border-radius: var(--border-radius-md);
  text-align: center;
}

.card-reward.bronze {
  background: linear-gradient(135deg, #CD7F32, #B8860B);
  color: white;
}

.card-reward.silver {
  background: linear-gradient(135deg, #C0C0C0, #A9A9A9);
  color: white;
}

.card-reward.gold {
  background: linear-gradient(135deg, #FFD700, #FFA500);
  color: white;
}

.card-reward.legendary {
  background: linear-gradient(135deg, #9400D3, #FF1493);
  color: white;
  animation: legendary-glow 2s ease-in-out infinite alternate;
}

@keyframes legendary-glow {
  from {
    box-shadow: 0 0 20px rgba(148, 0, 211, 0.5);
  }
  to {
    box-shadow: 0 0 30px rgba(255, 20, 147, 0.8);
  }
}

.card-icon {
  font-size: var(--font-size-xl);
}

.card-name {
  font-size: var(--font-size-md);
  font-weight: 600;
}

.card-desc {
  font-size: var(--font-size-sm);
  opacity: 0.9;
}

.mode-difficulty {
  position: absolute;
  top: var(--spacing-md);
  right: var(--spacing-md);
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--border-radius-full);
  font-size: var(--font-size-xs);
  font-weight: 600;
  color: white;
}

.mode-difficulty.easy {
  background: var(--success-color);
}

.mode-difficulty.medium {
  background: var(--warning-color);
}

.mode-difficulty.hard {
  background: var(--error-color);
}

.mode-difficulty.expert {
  background: linear-gradient(45deg, #ff6b6b, #feca57);
}

/* 快速挑战 */
.quick-challenge {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: var(--border-radius-lg);
  padding: var(--spacing-lg);
  text-align: center;
  border: 2px dashed var(--primary-color);
}

.quick-title {
  font-size: var(--font-size-lg);
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 var(--spacing-sm) 0;
}

.quick-desc {
  font-size: var(--font-size-md);
  color: var(--text-secondary);
  margin: 0 0 var(--spacing-lg) 0;
}

.quick-btn {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  margin: 0 auto;
  padding: var(--spacing-md) var(--spacing-xl);
  font-size: var(--font-size-md);
  font-weight: 600;
}

/* 挑战进行中 */
.challenge-active {
  max-width: 800px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
}

.challenge-header {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: var(--border-radius-lg);
  padding: var(--spacing-lg);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.challenge-title {
  font-size: var(--font-size-lg);
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: var(--spacing-sm);
}

.challenge-progress {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
}

.progress-text {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  min-width: 60px;
}

.progress-bar {
  width: 200px;
  height: 8px;
  background: var(--background);
  border-radius: var(--border-radius-sm);
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--primary-color), var(--secondary-color));
  border-radius: var(--border-radius-sm);
  transition: width 0.3s ease;
}

.challenge-timer {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  background: var(--error-light);
  color: var(--error-color);
  padding: var(--spacing-sm) var(--spacing-md);
  border-radius: var(--border-radius-md);
  font-weight: 600;
}

.timer-icon {
  font-size: 20px;
}

.timer-text {
  font-size: var(--font-size-md);
  font-family: 'Courier New', monospace;
}

/* 对战区域 */
.battle-arena {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: var(--border-radius-lg);
  padding: var(--spacing-lg);
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: relative;
}

.player-side,
.ai-side {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-md);
  flex: 1;
}

.player-avatar,
.ai-avatar {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-sm);
}

.avatar-img {
  width: 60px;
  height: 60px;
  border-radius: var(--border-radius-round);
  border: 3px solid var(--primary-color);
  object-fit: cover;
}

.avatar-icon {
  width: 60px;
  height: 60px;
  background: linear-gradient(135deg, var(--secondary-color), var(--secondary-light));
  border-radius: var(--border-radius-round);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  border: 3px solid var(--secondary-color);
}

.player-name,
.ai-name {
  font-size: var(--font-size-sm);
  font-weight: 600;
  color: var(--text-primary);
}

.player-score,
.ai-score {
  text-align: center;
}

.score-label {
  font-size: var(--font-size-xs);
  color: var(--text-secondary);
  margin-bottom: var(--spacing-xs);
}

.score-value {
  font-size: var(--font-size-xl);
  font-weight: 700;
  color: var(--primary-color);
}

.vs-indicator {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-sm);
  position: relative;
}

.vs-text {
  font-size: var(--font-size-lg);
  font-weight: 700;
  color: var(--text-primary);
  background: linear-gradient(45deg, var(--primary-color), var(--secondary-color));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.battle-effects {
  position: absolute;
  width: 100px;
  height: 100px;
  pointer-events: none;
}

.battle-effects.active .effect-spark {
  animation: spark 0.6s ease-out;
}

.effect-spark {
  position: absolute;
  width: 4px;
  height: 4px;
  background: var(--warning-color);
  border-radius: var(--border-radius-round);
}

.effect-spark:nth-child(1) {
  top: 20%;
  left: 30%;
  animation-delay: 0s;
}

.effect-spark:nth-child(2) {
  top: 60%;
  right: 25%;
  animation-delay: 0.2s;
}

.effect-spark:nth-child(3) {
  bottom: 30%;
  left: 50%;
  animation-delay: 0.4s;
}

@keyframes spark {
  0% {
    transform: scale(0) rotate(0deg);
    opacity: 1;
  }
  50% {
    transform: scale(1.5) rotate(180deg);
    opacity: 0.8;
  }
  100% {
    transform: scale(0) rotate(360deg);
    opacity: 0;
  }
}

/* 题目卡片 */
.question-card {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: var(--border-radius-lg);
  padding: var(--spacing-lg);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
}

.question-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-lg);
  padding-bottom: var(--spacing-md);
  border-bottom: 1px solid var(--border);
}

.question-type {
  font-size: var(--font-size-md);
  font-weight: 600;
  color: var(--primary-color);
}

.question-difficulty {
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--border-radius-full);
  font-size: var(--font-size-xs);
  font-weight: 600;
  color: white;
}

.question-text {
  font-size: var(--font-size-lg);
  color: var(--text-primary);
  line-height: var(--line-height-normal);
  margin-bottom: var(--spacing-lg);
  text-align: center;
  padding: var(--spacing-md);
  background: var(--background);
  border-radius: var(--border-radius-md);
  border-left: 4px solid var(--primary-color);
}

/* 选择题选项 */
.question-options {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-lg);
}

.option-btn {
  text-align: left;
  padding: var(--spacing-md) var(--spacing-lg);
  background: var(--background);
  border: 2px solid var(--border);
  border-radius: var(--border-radius-md);
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: var(--font-size-md);
  position: relative;
  overflow: hidden;
}

.option-btn:hover:not(:disabled) {
  background: var(--primary-light);
  border-color: var(--primary-color);
  transform: translateX(4px);
}

.option-btn.selected {
  background: var(--primary-light);
  border-color: var(--primary-color);
  color: var(--primary-color);
  font-weight: 600;
}

.option-btn.correct {
  background: var(--success-light);
  border-color: var(--success-color);
  color: var(--success-color);
}

.option-btn.wrong {
  background: var(--error-light);
  border-color: var(--error-color);
  color: var(--error-color);
}

.option-btn:disabled {
  cursor: not-allowed;
  opacity: 0.7;
}

/* 填空题输入 */
.question-input {
  display: flex;
  gap: var(--spacing-md);
  align-items: center;
  margin-bottom: var(--spacing-lg);
  justify-content: center;
}

.fill-input {
  flex: 1;
  max-width: 300px;
  padding: var(--spacing-md);
  border: 2px solid var(--border);
  border-radius: var(--border-radius-md);
  font-size: var(--font-size-md);
  text-align: center;
  transition: all 0.2s ease;
}

.fill-input:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px var(--primary-light);
}

.submit-btn {
  padding: var(--spacing-md) var(--spacing-lg);
}

/* 判断题 */
.question-judge {
  display: flex;
  gap: var(--spacing-lg);
  justify-content: center;
  margin-bottom: var(--spacing-lg);
}

.judge-btn {
  flex: 1;
  max-width: 200px;
  padding: var(--spacing-lg);
  background: var(--background);
  border: 2px solid var(--border);
  border-radius: var(--border-radius-md);
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: var(--font-size-md);
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-sm);
}

.judge-btn:hover:not(:disabled) {
  background: var(--primary-light);
  border-color: var(--primary-color);
  transform: scale(1.02);
}

.judge-btn.selected {
  background: var(--primary-light);
  border-color: var(--primary-color);
  color: var(--primary-color);
}

.judge-btn.correct {
  background: var(--success-light);
  border-color: var(--success-color);
  color: var(--success-color);
}

.judge-btn.wrong {
  background: var(--error-light);
  border-color: var(--error-color);
  color: var(--error-color);
}

/* 答案解析 */
.question-explanation {
  background: var(--info-light);
  border: 1px solid var(--info-color);
  border-radius: var(--border-radius-md);
  padding: var(--spacing-md);
  margin-bottom: var(--spacing-lg);
}

.explanation-header {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-sm);
}

.explanation-icon {
  font-size: 20px;
}

.explanation-title {
  font-size: var(--font-size-md);
  font-weight: 600;
  color: var(--info-color);
}

.explanation-text {
  font-size: var(--font-size-md);
  color: var(--text-primary);
  line-height: var(--line-height-normal);
}

/* 题目操作按钮 */
.question-actions {
  display: flex;
  gap: var(--spacing-md);
  justify-content: center;
}

/* 挑战结果 */
.challenge-result {
  max-width: 600px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
}

.result-header {
  text-align: center;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: var(--border-radius-lg);
  padding: var(--spacing-xl);
}

.result-icon {
  font-size: 64px;
  margin-bottom: var(--spacing-md);
}

.result-icon.win {
  animation: bounce 1s ease-in-out infinite alternate;
}

@keyframes bounce {
  0% { transform: translateY(0); }
  100% { transform: translateY(-10px); }
}

.result-title {
  font-size: var(--font-size-xxl);
  font-weight: 700;
  color: var(--text-primary);
  margin: 0 0 var(--spacing-sm) 0;
}

.result-subtitle {
  font-size: var(--font-size-md);
  color: var(--text-secondary);
  margin: 0;
}

/* 得分对比 */
.score-comparison {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: var(--border-radius-lg);
  padding: var(--spacing-lg);
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.score-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-sm);
  flex: 1;
}

.score-avatar img,
.ai-avatar-icon {
  width: 50px;
  height: 50px;
  border-radius: var(--border-radius-round);
}

.ai-avatar-icon {
  background: linear-gradient(135deg, var(--secondary-color), var(--secondary-light));
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
}

.score-name {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  margin-bottom: var(--spacing-xs);
}

.score-points {
  font-size: var(--font-size-xl);
  font-weight: 700;
  color: var(--primary-color);
  margin-bottom: var(--spacing-xs);
}

.score-accuracy {
  font-size: var(--font-size-xs);
  color: var(--text-secondary);
}

.score-divider {
  font-size: var(--font-size-lg);
  font-weight: 700;
  color: var(--text-primary);
  background: linear-gradient(45deg, var(--primary-color), var(--secondary-color));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

/* 奖励信息 */
.reward-info {
  background: linear-gradient(135deg, var(--warning-light), var(--warning-color));
  border-radius: var(--border-radius-lg);
  padding: var(--spacing-lg);
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  color: white;
  text-align: center;
  animation: glow 2s ease-in-out infinite alternate;
}

@keyframes glow {
  0% { box-shadow: 0 0 20px rgba(255, 193, 7, 0.3); }
  100% { box-shadow: 0 0 30px rgba(255, 193, 7, 0.6); }
}

.reward-icon {
  font-size: 32px;
}

.reward-title {
  font-size: var(--font-size-lg);
  font-weight: 600;
  margin-bottom: var(--spacing-xs);
}

.reward-points {
  font-size: var(--font-size-xl);
  font-weight: 700;
}

/* 详细统计 */
.result-stats {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: var(--border-radius-lg);
  padding: var(--spacing-lg);
}

.stats-title {
  font-size: var(--font-size-lg);
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 var(--spacing-lg) 0;
  text-align: center;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: var(--spacing-md);
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-md);
  background: var(--background);
  border-radius: var(--border-radius-md);
  text-align: center;
}

.stat-icon {
  font-size: 24px;
}

.stat-value {
  font-size: var(--font-size-lg);
  font-weight: 700;
  color: var(--primary-color);
}

.stat-label {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
}

/* 结果操作按钮 */
.result-actions {
  display: flex;
  gap: var(--spacing-md);
  justify-content: center;
  flex-wrap: wrap;
}

.result-actions .btn {
  flex: 1;
  min-width: 120px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-xs);
}

/* 排行榜弹窗 */
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

.rankings-modal {
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

.rankings-content {
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.ranking-tabs {
  display: flex;
  border-bottom: 1px solid var(--border);
}

.tab-btn {
  flex: 1;
  padding: var(--spacing-md);
  background: none;
  border: none;
  cursor: pointer;
  font-size: var(--font-size-md);
  color: var(--text-secondary);
  transition: all 0.2s ease;
  position: relative;
}

.tab-btn.active {
  color: var(--primary-color);
  font-weight: 600;
}

.tab-btn.active::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: var(--primary-color);
}

.ranking-list {
  flex: 1;
  overflow-y: auto;
  padding: var(--spacing-md);
}

.ranking-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  padding: var(--spacing-md);
  border-radius: var(--border-radius-md);
  margin-bottom: var(--spacing-sm);
  transition: all 0.2s ease;
}

.ranking-item:hover {
  background: var(--background);
}

.ranking-item.current {
  background: var(--primary-light);
  border: 1px solid var(--primary-color);
}

.rank-number {
  width: 32px;
  height: 32px;
  border-radius: var(--border-radius-round);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: var(--font-size-sm);
  background: var(--background);
  color: var(--text-primary);
}

.rank-number.gold {
  background: linear-gradient(135deg, #ffd700, #ffed4e);
  color: #b8860b;
}

.rank-number.silver {
  background: linear-gradient(135deg, #c0c0c0, #e8e8e8);
  color: #696969;
}

.rank-number.bronze {
  background: linear-gradient(135deg, #cd7f32, #daa520);
  color: #8b4513;
}

.player-info {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  flex: 1;
}

.player-avatar {
  width: 40px;
  height: 40px;
  border-radius: var(--border-radius-round);
  object-fit: cover;
}

.player-details {
  flex: 1;
}

.player-name {
  font-size: var(--font-size-md);
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 2px;
}

.player-level {
  font-size: var(--font-size-xs);
  color: var(--text-secondary);
}

.player-score {
  font-size: var(--font-size-md);
  font-weight: 600;
  color: var(--primary-color);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .modes-grid {
    grid-template-columns: 1fr;
  }
  
  .battle-arena {
    flex-direction: column;
    gap: var(--spacing-lg);
  }
  
  .vs-indicator {
    order: 2;
  }
  
  .challenge-header {
    flex-direction: column;
    gap: var(--spacing-md);
    text-align: center;
  }
  
  .challenge-progress {
    justify-content: center;
  }
  
  .question-input {
    flex-direction: column;
  }
  
  .fill-input {
    max-width: none;
  }
  
  .judge-btn {
    max-width: none;
  }
  
  .score-comparison {
    flex-direction: column;
    gap: var(--spacing-lg);
  }
  
  .score-divider {
    order: 2;
  }
  
  .result-actions {
    flex-direction: column;
  }
  
  .result-actions .btn {
    flex: none;
  }
  
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .rankings-modal {
    margin: var(--spacing-md);
    max-height: calc(100vh - 2 * var(--spacing-md));
  }
}

@media (max-width: 480px) {
  .pk-content {
    padding: var(--spacing-sm);
  }
  
  .mode-card {
    padding: var(--spacing-md);
  }
  
  .question-card {
    padding: var(--spacing-md);
  }
  
  .question-text {
    font-size: var(--font-size-md);
  }
  
  .option-btn {
    padding: var(--spacing-sm) var(--spacing-md);
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
  }
}
</style>
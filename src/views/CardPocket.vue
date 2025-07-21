<template>
  <div class="card-pocket-page">
    <!-- 页面头部 -->
    <div class="page-header">
      <button class="back-btn" @click="$router.go(-1)">
        <i class="fas fa-arrow-left"></i>
      </button>
      <h1 class="page-title">卡牌口袋</h1>
      <button class="transfer-btn" @click="showTransferModal = true">
        <i class="fas fa-gift"></i>
      </button>
    </div>

    <!-- 卡牌统计 -->
    <div class="card-stats">
      <div class="stats-grid">
        <div class="stat-item">
          <div class="stat-icon bronze">
            <i class="fas fa-medal"></i>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ userCards.bronze.length }}</div>
            <div class="stat-label">青铜卡牌</div>
          </div>
        </div>
        <div class="stat-item">
          <div class="stat-icon silver">
            <i class="fas fa-medal"></i>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ userCards.silver.length }}</div>
            <div class="stat-label">白银卡牌</div>
          </div>
        </div>
        <div class="stat-item">
          <div class="stat-icon gold">
            <i class="fas fa-medal"></i>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ userCards.gold.length }}</div>
            <div class="stat-label">黄金卡牌</div>
          </div>
        </div>
        <div class="stat-item">
          <div class="stat-icon legendary">
            <i class="fas fa-crown"></i>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ userCards.legendary.length }}</div>
            <div class="stat-label">隐藏款</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 卡牌分类标签 -->
    <div class="card-tabs">
      <div 
        v-for="tab in cardTabs" 
        :key="tab.key"
        class="tab-item"
        :class="{ active: activeTab === tab.key }"
        @click="activeTab = tab.key"
      >
        <i :class="tab.icon"></i>
        <span>{{ tab.label }}</span>
        <div class="tab-count">{{ userCards[tab.key].length }}</div>
      </div>
    </div>

    <!-- 卡牌列表 -->
    <div class="card-list">
      <div v-if="currentCards.length === 0" class="empty-state">
        <div class="empty-icon">
          <i class="fas fa-id-card"></i>
        </div>
        <div class="empty-text">暂无{{ getCurrentTabLabel() }}卡牌</div>
        <div class="empty-desc">通过PK挑战获得更多卡牌吧！</div>
      </div>
      
      <div v-else class="cards-grid">
        <div 
          v-for="card in currentCards" 
          :key="card.id"
          class="card-item"
          :class="card.rarity"
          @click="selectCard(card)"
        >
          <div class="card-header">
            <div class="card-number">#{{ card.number }}</div>
            <div class="card-rarity">{{ getRarityLabel(card.rarity) }}</div>
          </div>
          <div class="card-icon">
            <i :class="card.icon"></i>
          </div>
          <div class="card-info">
            <div class="card-name">{{ card.name }}</div>
            <div class="card-desc">{{ card.description }}</div>
          </div>
          <div class="card-date">{{ formatDate(card.obtainedAt) }}</div>
        </div>
      </div>
    </div>

    <!-- 转赠记录 -->
    <div class="transfer-section">
      <div class="section-header" @click="showTransferHistory = !showTransferHistory">
        <h3>转赠记录</h3>
        <i class="fas" :class="showTransferHistory ? 'fa-chevron-up' : 'fa-chevron-down'"></i>
      </div>
      
      <div v-if="showTransferHistory" class="transfer-history">
        <div v-if="transferRecords.length === 0" class="empty-state small">
          <div class="empty-text">暂无转赠记录</div>
        </div>
        
        <div v-else class="transfer-list">
          <div 
            v-for="record in transferRecords" 
            :key="record.id"
            class="transfer-item"
          >
            <div class="transfer-icon">
              <i class="fas fa-gift"></i>
            </div>
            <div class="transfer-info">
              <div class="transfer-card">{{ record.cardName }} #{{ record.cardNumber }}</div>
              <div class="transfer-target">转赠给: {{ record.targetUser }}</div>
              <div class="transfer-date">{{ formatDate(record.transferAt) }}</div>
            </div>
            <div class="transfer-status" :class="record.status">
              {{ getStatusLabel(record.status) }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 卡牌详情弹窗 -->
    <div v-if="selectedCard" class="modal-overlay" @click="selectedCard = null">
      <div class="card-detail-modal" @click.stop>
        <div class="modal-header">
          <h3>卡牌详情</h3>
          <button class="close-btn" @click="selectedCard = null">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="modal-content">
          <div class="card-preview" :class="selectedCard.rarity">
            <div class="card-number">#{{ selectedCard.number }}</div>
            <div class="card-icon large">
              <i :class="selectedCard.icon"></i>
            </div>
            <div class="card-name">{{ selectedCard.name }}</div>
            <div class="card-rarity">{{ getRarityLabel(selectedCard.rarity) }}</div>
            <div class="card-desc">{{ selectedCard.description }}</div>
            <div class="card-date">获得时间: {{ formatDate(selectedCard.obtainedAt) }}</div>
          </div>
        </div>
        <div class="modal-actions">
          <button class="btn btn-secondary" @click="selectedCard = null">
            关闭
          </button>
          <button class="btn btn-primary" @click="transferCard(selectedCard)">
            <i class="fas fa-gift"></i>
            转赠卡牌
          </button>
        </div>
      </div>
    </div>

    <!-- 转赠弹窗 -->
    <div v-if="showTransferModal" class="modal-overlay" @click="showTransferModal = false">
      <div class="transfer-modal" @click.stop>
        <div class="modal-header">
          <h3>转赠卡牌</h3>
          <button class="close-btn" @click="showTransferModal = false">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="modal-content">
          <div v-if="!transferCardData" class="transfer-step">
            <h4>选择要转赠的卡牌</h4>
            <div class="card-selector">
              <div 
                v-for="card in allCards" 
                :key="card.id"
                class="card-option"
                :class="{ selected: transferCardData?.id === card.id }"
                @click="transferCardData = card"
              >
                <div class="card-mini" :class="card.rarity">
                  <div class="card-number">#{{ card.number }}</div>
                  <div class="card-name">{{ card.name }}</div>
                </div>
              </div>
            </div>
          </div>
          
          <div v-else class="transfer-step">
            <h4>输入好友ID</h4>
            <div class="selected-card">
              <div class="card-mini" :class="transferCardData.rarity">
                <div class="card-number">#{{ transferCardData.number }}</div>
                <div class="card-name">{{ transferCardData.name }}</div>
              </div>
            </div>
            <div class="form-group">
              <label>好友注册ID</label>
              <input 
                v-model="friendId" 
                type="text" 
                class="form-control" 
                placeholder="请输入好友的注册ID"
              />
            </div>
            <div class="form-group">
              <label>转赠留言（可选）</label>
              <textarea 
                v-model="transferMessage" 
                class="form-control" 
                rows="3" 
                placeholder="给好友留个言吧..."
              ></textarea>
            </div>
          </div>
        </div>
        <div class="modal-actions">
          <button class="btn btn-secondary" @click="resetTransfer">
            {{ transferCardData ? '重新选择' : '取消' }}
          </button>
          <button 
            v-if="transferCardData" 
            class="btn btn-primary" 
            :disabled="!friendId.trim()"
            @click="confirmTransfer"
          >
            确认转赠
          </button>
        </div>
      </div>
    </div>

    <!-- 底部导航 -->
    <BottomNavigation />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import BottomNavigation from '@/components/BottomNavigation.vue'
import dayjs from 'dayjs'

const router = useRouter()

// 响应式数据
const activeTab = ref('bronze')
const selectedCard = ref(null)
const showTransferModal = ref(false)
const showTransferHistory = ref(false)
const transferCardData = ref(null)
const friendId = ref('')
const transferMessage = ref('')

// 卡牌数据
const userCards = ref({
  bronze: [
    {
      id: 1,
      number: '001',
      name: '金榜题名',
      description: '青铜级别的荣誉卡牌',
      rarity: 'bronze',
      icon: 'fas fa-trophy',
      obtainedAt: new Date('2024-01-15')
    },
    {
      id: 2,
      number: '003',
      name: '金榜题名',
      description: '青铜级别的荣誉卡牌',
      rarity: 'bronze',
      icon: 'fas fa-trophy',
      obtainedAt: new Date('2024-01-16')
    }
  ],
  silver: [
    {
      id: 3,
      number: '005',
      name: '金榜题名',
      description: '白银级别的荣誉卡牌',
      rarity: 'silver',
      icon: 'fas fa-star',
      obtainedAt: new Date('2024-01-17')
    }
  ],
  gold: [
    {
      id: 4,
      number: '007',
      name: '金榜题名',
      description: '黄金级别的荣誉卡牌',
      rarity: 'gold',
      icon: 'fas fa-crown',
      obtainedAt: new Date('2024-01-18')
    }
  ],
  legendary: [
    {
      id: 5,
      number: '999',
      name: '金榜题名',
      description: '传说级别的隐藏款卡牌',
      rarity: 'legendary',
      icon: 'fas fa-gem',
      obtainedAt: new Date('2024-01-19')
    }
  ]
})

// 转赠记录
const transferRecords = ref([
  {
    id: 1,
    cardName: '金榜题名',
    cardNumber: '002',
    targetUser: 'user123',
    transferAt: new Date('2024-01-14'),
    status: 'completed'
  },
  {
    id: 2,
    cardName: '金榜题名',
    cardNumber: '004',
    targetUser: 'user456',
    transferAt: new Date('2024-01-13'),
    status: 'pending'
  }
])

// 卡牌分类标签
const cardTabs = [
  { key: 'bronze', label: '青铜', icon: 'fas fa-medal' },
  { key: 'silver', label: '白银', icon: 'fas fa-medal' },
  { key: 'gold', label: '黄金', icon: 'fas fa-medal' },
  { key: 'legendary', label: '隐藏款', icon: 'fas fa-crown' }
]

// 计算属性
const currentCards = computed(() => {
  return userCards.value[activeTab.value] || []
})

const allCards = computed(() => {
  return [
    ...userCards.value.bronze,
    ...userCards.value.silver,
    ...userCards.value.gold,
    ...userCards.value.legendary
  ]
})

// 方法
const getCurrentTabLabel = () => {
  const tab = cardTabs.find(t => t.key === activeTab.value)
  return tab ? tab.label : ''
}

const getRarityLabel = (rarity) => {
  const labels = {
    bronze: '青铜',
    silver: '白银',
    gold: '黄金',
    legendary: '隐藏款'
  }
  return labels[rarity] || rarity
}

const getStatusLabel = (status) => {
  const labels = {
    completed: '已完成',
    pending: '待接收',
    failed: '转赠失败'
  }
  return labels[status] || status
}

const formatDate = (date) => {
  return dayjs(date).format('YYYY-MM-DD')
}

const selectCard = (card) => {
  selectedCard.value = card
}

const transferCard = (card) => {
  selectedCard.value = null
  transferCardData.value = card
  showTransferModal.value = true
}

const resetTransfer = () => {
  if (transferCardData.value) {
    transferCardData.value = null
    friendId.value = ''
    transferMessage.value = ''
  } else {
    showTransferModal.value = false
  }
}

const confirmTransfer = () => {
  if (!friendId.value.trim()) {
    alert('请输入好友ID')
    return
  }
  
  // 生成随机ID
  const recordId = Date.now()
  
  // 添加转赠记录
  transferRecords.value.unshift({
    id: recordId,
    cardName: transferCardData.value.name,
    cardNumber: transferCardData.value.number,
    targetUser: friendId.value,
    transferAt: new Date(),
    status: 'pending',
    message: transferMessage.value
  })
  
  // 从用户卡牌中移除
  const cardType = transferCardData.value.rarity
  const cardIndex = userCards.value[cardType].findIndex(c => c.id === transferCardData.value.id)
  if (cardIndex > -1) {
    userCards.value[cardType].splice(cardIndex, 1)
  }
  
  // 保存到本地存储
  saveCardsToStorage()
  saveTransferRecordsToStorage()
  
  // 重置状态
  resetTransfer()
  showTransferModal.value = false
  
  alert('卡牌转赠成功！')
}

const saveCardsToStorage = () => {
  localStorage.setItem('userCards', JSON.stringify(userCards.value))
}

const saveTransferRecordsToStorage = () => {
  localStorage.setItem('transferRecords', JSON.stringify(transferRecords.value))
}

const loadCardsFromStorage = () => {
  const saved = localStorage.getItem('userCards')
  if (saved) {
    userCards.value = JSON.parse(saved)
  }
}

const loadTransferRecordsFromStorage = () => {
  const saved = localStorage.getItem('transferRecords')
  if (saved) {
    transferRecords.value = JSON.parse(saved)
  }
}

// 生命周期
onMounted(() => {
  loadCardsFromStorage()
  loadTransferRecordsFromStorage()
})
</script>

<style scoped>
.card-pocket-page {
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
.transfer-btn {
  background: none;
  border: none;
  padding: var(--spacing-sm);
  cursor: pointer;
  color: var(--text-primary);
  font-size: 18px;
  transition: all 0.2s ease;
}

.back-btn:hover,
.transfer-btn:hover {
  color: var(--primary-color);
  transform: scale(1.1);
}

.page-title {
  font-size: var(--font-size-lg);
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
}

/* 卡牌统计 */
.card-stats {
  padding: var(--spacing-md);
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--spacing-sm);
}

.stat-item {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: var(--border-radius-lg);
  padding: var(--spacing-md);
  text-align: center;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.stat-icon {
  font-size: 24px;
  margin-bottom: var(--spacing-xs);
}

.stat-icon.bronze {
  color: #cd7f32;
}

.stat-icon.silver {
  color: #c0c0c0;
}

.stat-icon.gold {
  color: #ffd700;
}

.stat-icon.legendary {
  color: #ff6b6b;
}

.stat-value {
  font-size: var(--font-size-xl);
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: var(--spacing-xs);
}

.stat-label {
  font-size: var(--font-size-xs);
  color: var(--text-secondary);
}

/* 卡牌分类标签 */
.card-tabs {
  display: flex;
  padding: 0 var(--spacing-md);
  margin-bottom: var(--spacing-md);
  gap: var(--spacing-xs);
}

.tab-item {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-xs);
  padding: var(--spacing-sm);
  background: rgba(255, 255, 255, 0.7);
  border-radius: var(--border-radius-md);
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
}

.tab-item.active {
  background: rgba(255, 255, 255, 0.95);
  color: var(--primary-color);
  font-weight: 600;
}

.tab-count {
  background: var(--primary-color);
  color: white;
  border-radius: var(--border-radius-round);
  padding: 2px 6px;
  font-size: var(--font-size-xs);
  min-width: 18px;
  text-align: center;
}

.tab-item.active .tab-count {
  background: var(--primary-color);
}

/* 卡牌列表 */
.card-list {
  padding: 0 var(--spacing-md);
  margin-bottom: var(--spacing-lg);
}

.empty-state {
  text-align: center;
  padding: var(--spacing-xl) var(--spacing-md);
  background: rgba(255, 255, 255, 0.95);
  border-radius: var(--border-radius-lg);
  backdrop-filter: blur(10px);
}

.empty-state.small {
  padding: var(--spacing-lg) var(--spacing-md);
}

.empty-icon {
  font-size: 48px;
  color: var(--text-secondary);
  margin-bottom: var(--spacing-md);
}

.empty-text {
  font-size: var(--font-size-lg);
  color: var(--text-primary);
  margin-bottom: var(--spacing-sm);
}

.empty-desc {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
}

.cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: var(--spacing-md);
}

.card-item {
  background: rgba(255, 255, 255, 0.95);
  border-radius: var(--border-radius-lg);
  padding: var(--spacing-lg);
  cursor: pointer;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
  border: 2px solid transparent;
}

.card-item:hover {
  transform: translateY(-4px);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
}

.card-item.bronze {
  border-color: #cd7f32;
}

.card-item.silver {
  border-color: #c0c0c0;
}

.card-item.gold {
  border-color: #ffd700;
}

.card-item.legendary {
  border-color: #ff6b6b;
  animation: legendary-glow 2s ease-in-out infinite alternate;
}

@keyframes legendary-glow {
  from {
    box-shadow: 0 0 20px rgba(255, 107, 107, 0.3);
  }
  to {
    box-shadow: 0 0 30px rgba(255, 107, 107, 0.6);
  }
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-md);
}

.card-number {
  font-size: var(--font-size-sm);
  font-weight: 600;
  color: var(--text-secondary);
}

.card-rarity {
  font-size: var(--font-size-xs);
  padding: 2px 8px;
  border-radius: var(--border-radius-sm);
  background: var(--primary-light);
  color: var(--primary-color);
}

.card-icon {
  text-align: center;
  font-size: 48px;
  margin-bottom: var(--spacing-md);
  color: var(--primary-color);
}

.card-icon.large {
  font-size: 64px;
}

.card-name {
  font-size: var(--font-size-lg);
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: var(--spacing-xs);
  text-align: center;
}

.card-desc {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  text-align: center;
  margin-bottom: var(--spacing-md);
}

.card-date {
  font-size: var(--font-size-xs);
  color: var(--text-secondary);
  text-align: center;
}

/* 转赠记录 */
.transfer-section {
  padding: 0 var(--spacing-md);
  margin-bottom: var(--spacing-lg);
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--spacing-md);
  background: rgba(255, 255, 255, 0.95);
  border-radius: var(--border-radius-lg);
  cursor: pointer;
  margin-bottom: var(--spacing-md);
}

.section-header h3 {
  margin: 0;
  font-size: var(--font-size-lg);
  color: var(--text-primary);
}

.transfer-history {
  background: rgba(255, 255, 255, 0.95);
  border-radius: var(--border-radius-lg);
  padding: var(--spacing-md);
}

.transfer-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.transfer-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  padding: var(--spacing-md);
  background: rgba(255, 255, 255, 0.5);
  border-radius: var(--border-radius-md);
}

.transfer-icon {
  font-size: 20px;
  color: var(--primary-color);
}

.transfer-info {
  flex: 1;
}

.transfer-card {
  font-size: var(--font-size-md);
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: var(--spacing-xs);
}

.transfer-target {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  margin-bottom: var(--spacing-xs);
}

.transfer-date {
  font-size: var(--font-size-xs);
  color: var(--text-secondary);
}

.transfer-status {
  padding: 4px 8px;
  border-radius: var(--border-radius-sm);
  font-size: var(--font-size-xs);
  font-weight: 600;
}

.transfer-status.completed {
  background: #d4edda;
  color: #155724;
}

.transfer-status.pending {
  background: #fff3cd;
  color: #856404;
}

.transfer-status.failed {
  background: #f8d7da;
  color: #721c24;
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

.card-detail-modal,
.transfer-modal {
  background: white;
  border-radius: var(--border-radius-lg);
  max-width: 500px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--spacing-lg);
  border-bottom: 1px solid var(--border);
}

.modal-header h3 {
  margin: 0;
  font-size: var(--font-size-lg);
  color: var(--text-primary);
}

.close-btn {
  background: none;
  border: none;
  font-size: 18px;
  color: var(--text-secondary);
  cursor: pointer;
  padding: var(--spacing-xs);
}

.close-btn:hover {
  color: var(--text-primary);
}

.modal-content {
  padding: var(--spacing-lg);
}

.modal-actions {
  display: flex;
  gap: var(--spacing-md);
  padding: var(--spacing-lg);
  border-top: 1px solid var(--border);
}

.btn {
  flex: 1;
  padding: var(--spacing-sm) var(--spacing-md);
  border: none;
  border-radius: var(--border-radius-md);
  font-size: var(--font-size-md);
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-secondary {
  background: var(--background-secondary);
  color: var(--text-secondary);
}

.btn-secondary:hover {
  background: var(--border);
}

.btn-primary {
  background: var(--primary-color);
  color: white;
}

.btn-primary:hover {
  background: var(--primary-dark);
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* 卡牌预览 */
.card-preview {
  text-align: center;
  padding: var(--spacing-lg);
  border-radius: var(--border-radius-lg);
  border: 2px solid transparent;
}

.card-preview.bronze {
  border-color: #cd7f32;
  background: linear-gradient(135deg, #cd7f32, #e6a85c);
  color: white;
}

.card-preview.silver {
  border-color: #c0c0c0;
  background: linear-gradient(135deg, #c0c0c0, #e0e0e0);
  color: #333;
}

.card-preview.gold {
  border-color: #ffd700;
  background: linear-gradient(135deg, #ffd700, #ffed4e);
  color: #333;
}

.card-preview.legendary {
  border-color: #ff6b6b;
  background: linear-gradient(135deg, #ff6b6b, #ff8e8e);
  color: white;
}

/* 转赠表单 */
.transfer-step h4 {
  margin: 0 0 var(--spacing-md) 0;
  color: var(--text-primary);
}

.card-selector {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-md);
}

.card-option {
  cursor: pointer;
  transition: all 0.2s ease;
}

.card-option.selected .card-mini {
  border-color: var(--primary-color);
  transform: scale(1.05);
}

.card-mini {
  padding: var(--spacing-sm);
  border-radius: var(--border-radius-md);
  border: 2px solid transparent;
  text-align: center;
  transition: all 0.2s ease;
}

.card-mini.bronze {
  background: linear-gradient(135deg, #cd7f32, #e6a85c);
  color: white;
}

.card-mini.silver {
  background: linear-gradient(135deg, #c0c0c0, #e0e0e0);
  color: #333;
}

.card-mini.gold {
  background: linear-gradient(135deg, #ffd700, #ffed4e);
  color: #333;
}

.card-mini.legendary {
  background: linear-gradient(135deg, #ff6b6b, #ff8e8e);
  color: white;
}

.selected-card {
  display: flex;
  justify-content: center;
  margin-bottom: var(--spacing-md);
}

.form-group {
  margin-bottom: var(--spacing-md);
}

.form-group label {
  display: block;
  margin-bottom: var(--spacing-xs);
  font-size: var(--font-size-sm);
  font-weight: 600;
  color: var(--text-primary);
}

.form-control {
  width: 100%;
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

/* 响应式设计 */
@media (max-width: 768px) {
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .cards-grid {
    grid-template-columns: 1fr;
  }
  
  .card-tabs {
    flex-wrap: wrap;
  }
  
  .tab-item {
    flex: 1 1 calc(50% - var(--spacing-xs));
  }
}

@media (max-width: 480px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
  .tab-item {
    flex: 1 1 100%;
  }
  
  .card-selector {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .modal-overlay {
    padding: var(--spacing-sm);
  }
  
  .modal-actions {
    flex-direction: column;
  }
}
</style>
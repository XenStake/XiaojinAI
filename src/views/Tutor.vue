<template>
  <div class="tutor-page page-content-mobile">
    <!-- 顶部导航 -->
    <div class="page-header">
      <button class="back-btn" @click="goBack">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M19 12H5M12 19L5 12L12 5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>
      <div class="header-info">
        <h1 class="page-title">AI老师</h1>
        <div class="tutor-status">
          <div class="status-indicator online"></div>
          <span class="status-text">在线</span>
        </div>
      </div>
      <div class="header-actions">
        <button class="action-btn" @click="showSettings = true">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="2"/>
            <path d="M12 1V3M12 21V23M4.22 4.22L5.64 5.64M18.36 18.36L19.78 19.78M1 12H3M21 12H23M4.22 19.78L5.64 18.36M18.36 5.64L19.78 4.22" stroke="currentColor" stroke-width="2"/>
          </svg>
        </button>
      </div>
    </div>

    <!-- 聊天区域 -->
    <div class="chat-container" ref="chatContainer">
      <div class="chat-messages">
        <!-- 欢迎消息 -->
        <div class="message-group" v-if="messages.length === 0">
          <div class="welcome-message">
            <div class="ai-avatar">
              <div class="avatar-icon">🤖</div>
              <div class="avatar-status"></div>
            </div>
            <div class="welcome-content">
              <h3 class="welcome-title">你好！我是你的AI学习助手</h3>
              <p class="welcome-text">我可以帮你解答学习问题、讲解知识点、批改作业等。有什么问题尽管问我吧！</p>
              <div class="quick-questions">
                <button 
                  v-for="question in quickQuestions" 
                  :key="question.id"
                  class="quick-question-btn"
                  @click="sendQuickQuestion(question.text)"
                >
                  {{ question.text }}
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- 聊天消息 -->
        <div 
          v-for="(message, index) in messages" 
          :key="index"
          class="message-group"
          :class="{ 'user-message': message.type === 'user', 'ai-message': message.type === 'ai' }"
        >
          <div class="message-avatar" v-if="message.type === 'ai'">
            <div class="avatar-icon">🤖</div>
          </div>
          
          <div class="message-content">
            <div class="message-bubble" :class="message.type">
              <!-- 文本消息 -->
              <div v-if="message.contentType === 'text'" class="message-text">
                {{ message.content }}
              </div>
              
              <!-- 图片消息 -->
              <div v-else-if="message.contentType === 'image'" class="message-image">
                <img :src="message.content" alt="图片" @click="previewImage(message.content)" />
              </div>
              
              <!-- 知识点卡片 -->
              <div v-else-if="message.contentType === 'knowledge'" class="knowledge-card">
                <div class="knowledge-header">
                  <div class="knowledge-icon">{{ message.content.icon }}</div>
                  <div class="knowledge-title">{{ message.content.title }}</div>
                </div>
                <div class="knowledge-body">
                  <div class="knowledge-desc">{{ message.content.description }}</div>
                  <div class="knowledge-examples" v-if="message.content.examples">
                    <div class="examples-title">例题：</div>
                    <div 
                      v-for="(example, idx) in message.content.examples" 
                      :key="idx"
                      class="example-item"
                    >
                      <div class="example-question">{{ example.question }}</div>
                      <div class="example-answer">{{ example.answer }}</div>
                    </div>
                  </div>
                </div>
                <div class="knowledge-actions">
                  <button class="knowledge-btn" @click="practiceKnowledge(message.content)">
                    开始练习
                  </button>
                </div>
              </div>
              
              <!-- 练习题 -->
              <div v-else-if="message.contentType === 'exercise'" class="exercise-card">
                <div class="exercise-header">
                  <div class="exercise-title">练习题</div>
                  <div class="exercise-difficulty" :class="message.content.difficulty">
                    {{ getDifficultyText(message.content.difficulty) }}
                  </div>
                </div>
                <div class="exercise-question">{{ message.content.question }}</div>
                <div class="exercise-options" v-if="message.content.options">
                  <button 
                    v-for="(option, idx) in message.content.options" 
                    :key="idx"
                    class="option-btn"
                    :class="{ 
                      selected: message.content.selectedOption === idx,
                      correct: message.content.showAnswer && idx === message.content.correctAnswer,
                      wrong: message.content.showAnswer && message.content.selectedOption === idx && idx !== message.content.correctAnswer
                    }"
                    @click="selectOption(message, idx)"
                    :disabled="message.content.showAnswer"
                  >
                    {{ String.fromCharCode(65 + idx) }}. {{ option }}
                  </button>
                </div>
                <div class="exercise-explanation" v-if="message.content.showAnswer && message.content.explanation">
                  <div class="explanation-title">解析：</div>
                  <div class="explanation-text">{{ message.content.explanation }}</div>
                </div>
              </div>
            </div>
            
            <div class="message-time">{{ formatTime(message.timestamp) }}</div>
            
            <!-- 消息操作 -->
            <div class="message-actions" v-if="message.type === 'ai'">
              <button class="action-btn" @click="likeMessage(message)" :class="{ active: message.liked }">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M14 9V5A3 3 0 0 0 11 2A1 1 0 0 0 10 3V9L7 12V20H20L22 16V12H14Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </button>
              <button class="action-btn" @click="copyMessage(message.content)">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2" stroke="currentColor" stroke-width="2"/>
                  <path d="M5 15H4A2 2 0 0 1 2 13V4A2 2 0 0 1 4 2H13A2 2 0 0 1 15 4V5" stroke="currentColor" stroke-width="2"/>
                </svg>
              </button>
            </div>
          </div>
          
          <div class="message-avatar" v-if="message.type === 'user'">
            <img :src="userInfo.avatar" alt="用户头像" class="user-avatar" />
          </div>
        </div>
        
        <!-- 正在输入指示器 -->
        <div v-if="isTyping" class="message-group ai-message">
          <div class="message-avatar">
            <div class="avatar-icon">🤖</div>
          </div>
          <div class="message-content">
            <div class="message-bubble ai typing">
              <div class="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 输入区域 -->
    <div class="input-area">
      <!-- 功能按钮 -->
      <div class="input-tools">
        <button class="tool-btn" @click="showImagePicker = true">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" stroke="currentColor" stroke-width="2"/>
            <circle cx="8.5" cy="8.5" r="1.5" stroke="currentColor" stroke-width="2"/>
            <polyline points="21,15 16,10 5,21" stroke="currentColor" stroke-width="2"/>
          </svg>
        </button>
        <button class="tool-btn" @click="showVoiceInput = true">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M12 1A3 3 0 0 0 9 4V12A3 3 0 0 0 12 15A3 3 0 0 0 15 12V4A3 3 0 0 0 12 1Z" stroke="currentColor" stroke-width="2"/>
            <path d="M19 10V12A7 7 0 0 1 5 12V10" stroke="currentColor" stroke-width="2"/>
            <line x1="12" y1="19" x2="12" y2="23" stroke="currentColor" stroke-width="2"/>
            <line x1="8" y1="23" x2="16" y2="23" stroke="currentColor" stroke-width="2"/>
          </svg>
        </button>
        <button class="tool-btn" @click="showSubjectSelector = true">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M2 3H8A4 4 0 0 1 12 7A4 4 0 0 1 16 3H22V21H16A4 4 0 0 0 12 17A4 4 0 0 0 8 21H2V3Z" stroke="currentColor" stroke-width="2"/>
          </svg>
        </button>
      </div>
      
      <!-- 输入框 -->
      <div class="input-container">
        <textarea 
          v-model="inputText"
          ref="inputTextarea"
          class="message-input"
          placeholder="输入你的问题..."
          rows="1"
          @keydown="handleKeyDown"
          @input="adjustTextareaHeight"
        ></textarea>
        <button 
          class="send-btn"
          @click="sendMessage"
          :disabled="!inputText.trim() || isSending"
        >
          <svg v-if="!isSending" width="20" height="20" viewBox="0 0 24 24" fill="none">
            <line x1="22" y1="2" x2="11" y2="13" stroke="currentColor" stroke-width="2"/>
            <polygon points="22,2 15,22 11,13 2,9 22,2" stroke="currentColor" stroke-width="2"/>
          </svg>
          <div v-else class="loading-spinner"></div>
        </button>
      </div>
    </div>

    <!-- 图片选择器 -->
    <div v-if="showImagePicker" class="modal-overlay" @click="showImagePicker = false">
      <div class="image-picker" @click.stop>
        <div class="picker-header">
          <h3>选择图片</h3>
          <button class="close-btn" @click="showImagePicker = false">×</button>
        </div>
        <div class="picker-options">
          <label class="picker-option">
            <input type="file" accept="image/*" @change="handleImageUpload" style="display: none;">
            <div class="option-icon">📷</div>
            <div class="option-text">拍照</div>
          </label>
          <label class="picker-option">
            <input type="file" accept="image/*" @change="handleImageUpload" style="display: none;">
            <div class="option-icon">🖼️</div>
            <div class="option-text">从相册选择</div>
          </label>
        </div>
      </div>
    </div>

    <!-- 语音输入 -->
    <div v-if="showVoiceInput" class="modal-overlay" @click="showVoiceInput = false">
      <div class="voice-input" @click.stop>
        <div class="voice-header">
          <h3>语音输入</h3>
          <button class="close-btn" @click="showVoiceInput = false">×</button>
        </div>
        <div class="voice-content">
          <div class="voice-animation" :class="{ active: isRecording }">
            <div class="voice-circle"></div>
            <div class="voice-wave"></div>
          </div>
          <div class="voice-text">{{ isRecording ? '正在录音...' : '点击开始录音' }}</div>
          <button class="voice-btn" @click="toggleRecording">
            {{ isRecording ? '停止录音' : '开始录音' }}
          </button>
        </div>
      </div>
    </div>

    <!-- 科目选择器 -->
    <div v-if="showSubjectSelector" class="modal-overlay" @click="showSubjectSelector = false">
      <div class="subject-selector" @click.stop>
        <div class="selector-header">
          <h3>选择科目</h3>
          <button class="close-btn" @click="showSubjectSelector = false">×</button>
        </div>
        <div class="subject-grid">
          <button 
            v-for="subject in subjects" 
            :key="subject.id"
            class="subject-option"
            :class="{ active: currentSubject === subject.id }"
            @click="selectSubject(subject)"
          >
            <div class="subject-icon">{{ subject.icon }}</div>
            <div class="subject-name">{{ subject.name }}</div>
          </button>
        </div>
      </div>
    </div>

    <!-- 设置弹窗 -->
    <div v-if="showSettings" class="modal-overlay" @click="showSettings = false">
      <div class="settings-panel" @click.stop>
        <div class="settings-header">
          <h3>设置</h3>
          <button class="close-btn" @click="showSettings = false">×</button>
        </div>
        <div class="settings-content">
          <div class="setting-item">
            <div class="setting-label">AI回复速度</div>
            <select v-model="settings.responseSpeed" class="setting-select">
              <option value="fast">快速</option>
              <option value="normal">正常</option>
              <option value="slow">详细</option>
            </select>
          </div>
          <div class="setting-item">
            <div class="setting-label">语音播报</div>
            <label class="setting-switch">
              <input type="checkbox" v-model="settings.voiceEnabled">
              <span class="switch-slider"></span>
            </label>
          </div>
          <div class="setting-item">
            <div class="setting-label">自动保存对话</div>
            <label class="setting-switch">
              <input type="checkbox" v-model="settings.autoSave">
              <span class="switch-slider"></span>
            </label>
          </div>
        </div>
        <div class="settings-actions">
          <button class="btn btn-outline" @click="clearHistory">清空对话</button>
          <button class="btn btn-primary" @click="saveSettings">保存设置</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '../stores/user'
import dayjs from 'dayjs'

/**
 * AI辅导页面组件
 * 实现智能对话、知识点讲解、练习题等功能
 */

const router = useRouter()
const userStore = useUserStore()

// 响应式数据
const chatContainer = ref(null)
const inputTextarea = ref(null)
const inputText = ref('')
const messages = ref([])
const isTyping = ref(false)
const isSending = ref(false)
const isRecording = ref(false)
const currentSubject = ref('math')

// 弹窗状态
const showImagePicker = ref(false)
const showVoiceInput = ref(false)
const showSubjectSelector = ref(false)
const showSettings = ref(false)

// 设置
const settings = ref({
  responseSpeed: 'normal',
  voiceEnabled: false,
  autoSave: true
})

// 快速问题
const quickQuestions = ref([
  { id: 1, text: '这道数学题怎么做？' },
  { id: 2, text: '解释一下这个知识点' },
  { id: 3, text: '给我出几道练习题' },
  { id: 4, text: '检查我的作业' }
])

// 科目配置
const subjects = ref([
  { id: 'math', name: '数学', icon: '🔢' },
  { id: 'chinese', name: '语文', icon: '📝' },
  { id: 'english', name: '英语', icon: '🔤' },
  { id: 'physics', name: '物理', icon: '⚛️' },
  { id: 'chemistry', name: '化学', icon: '🧪' },
  { id: 'biology', name: '生物', icon: '🧬' }
])

// 计算属性
const userInfo = computed(() => userStore.userInfo)

// 方法
/**
 * 返回上一页
 */
const goBack = () => {
  router.back()
}

/**
 * 格式化时间
 */
const formatTime = (timestamp) => {
  return dayjs(timestamp).format('HH:mm')
}

/**
 * 获取难度文本
 */
const getDifficultyText = (difficulty) => {
  const difficultyMap = {
    easy: '简单',
    medium: '中等',
    hard: '困难'
  }
  return difficultyMap[difficulty] || '中等'
}

/**
 * 发送快速问题
 */
const sendQuickQuestion = (question) => {
  inputText.value = question
  sendMessage()
}

/**
 * 发送消息
 */
const sendMessage = async () => {
  if (!inputText.value.trim() || isSending.value) return
  
  const userMessage = {
    type: 'user',
    contentType: 'text',
    content: inputText.value.trim(),
    timestamp: Date.now()
  }
  
  messages.value.push(userMessage)
  const messageText = inputText.value.trim()
  inputText.value = ''
  adjustTextareaHeight()
  
  // 滚动到底部
  await nextTick()
  scrollToBottom()
  
  // 显示正在输入
  isTyping.value = true
  isSending.value = true
  
  try {
    // 模拟AI回复
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    const aiResponse = await generateAIResponse(messageText)
    messages.value.push(aiResponse)
    
    // 滚动到底部
    await nextTick()
    scrollToBottom()
    
  } catch (error) {
    console.error('发送消息失败:', error)
    const errorMessage = {
      type: 'ai',
      contentType: 'text',
      content: '抱歉，我现在无法回复。请稍后再试。',
      timestamp: Date.now()
    }
    messages.value.push(errorMessage)
  } finally {
    isTyping.value = false
    isSending.value = false
  }
}

/**
 * 生成AI回复
 */
const generateAIResponse = async (userMessage) => {
  // 这里应该调用实际的AI API
  // 现在使用模拟数据
  
  const lowerMessage = userMessage.toLowerCase()
  
  // 根据用户消息类型生成不同的回复
  if (lowerMessage.includes('练习') || lowerMessage.includes('题目')) {
    return {
      type: 'ai',
      contentType: 'exercise',
      content: {
        question: '计算下列表达式的值：2x + 3 = 11，求x的值',
        options: ['x = 2', 'x = 3', 'x = 4', 'x = 5'],
        correctAnswer: 2,
        difficulty: 'medium',
        explanation: '解题步骤：2x + 3 = 11，两边减去3得到2x = 8，两边除以2得到x = 4',
        selectedOption: null,
        showAnswer: false
      },
      timestamp: Date.now()
    }
  } else if (lowerMessage.includes('知识点') || lowerMessage.includes('解释')) {
    return {
      type: 'ai',
      contentType: 'knowledge',
      content: {
        icon: '📐',
        title: '一元一次方程',
        description: '一元一次方程是只含有一个未知数，并且未知数的最高次数是1的方程。',
        examples: [
          {
            question: '2x + 3 = 7',
            answer: 'x = 2'
          },
          {
            question: '3x - 5 = 10',
            answer: 'x = 5'
          }
        ]
      },
      timestamp: Date.now()
    }
  } else {
    // 普通文本回复
    const responses = [
      '我理解你的问题。让我来帮你分析一下。',
      '这是一个很好的问题！我来为你详细解答。',
      '根据你的描述，我建议你这样做...',
      '让我们一步步来解决这个问题。',
      '我可以帮你理解这个概念。'
    ]
    
    return {
      type: 'ai',
      contentType: 'text',
      content: responses[Math.floor(Math.random() * responses.length)],
      timestamp: Date.now()
    }
  }
}

/**
 * 处理键盘事件
 */
const handleKeyDown = (event) => {
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault()
    sendMessage()
  }
}

/**
 * 调整输入框高度
 */
const adjustTextareaHeight = () => {
  const textarea = inputTextarea.value
  if (textarea) {
    textarea.style.height = 'auto'
    textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px'
  }
}

/**
 * 滚动到底部
 */
const scrollToBottom = () => {
  if (chatContainer.value) {
    chatContainer.value.scrollTop = chatContainer.value.scrollHeight
  }
}

/**
 * 处理图片上传
 */
const handleImageUpload = (event) => {
  const file = event.target.files[0]
  if (file) {
    const reader = new FileReader()
    reader.onload = (e) => {
      const imageMessage = {
        type: 'user',
        contentType: 'image',
        content: e.target.result,
        timestamp: Date.now()
      }
      messages.value.push(imageMessage)
      showImagePicker.value = false
      
      // 模拟AI分析图片
      setTimeout(() => {
        const aiResponse = {
          type: 'ai',
          contentType: 'text',
          content: '我看到了你上传的图片。这是一道数学题，让我来帮你分析一下...',
          timestamp: Date.now()
        }
        messages.value.push(aiResponse)
        nextTick(() => scrollToBottom())
      }, 1000)
    }
    reader.readAsDataURL(file)
  }
}

/**
 * 预览图片
 */
const previewImage = (imageSrc) => {
  // 实现图片预览功能
  console.log('预览图片:', imageSrc)
}

/**
 * 切换录音状态
 */
const toggleRecording = () => {
  isRecording.value = !isRecording.value
  
  if (isRecording.value) {
    // 开始录音
    console.log('开始录音')
  } else {
    // 停止录音
    console.log('停止录音')
    showVoiceInput.value = false
    
    // 模拟语音识别结果
    setTimeout(() => {
      inputText.value = '这道题怎么做？'
    }, 500)
  }
}

/**
 * 选择科目
 */
const selectSubject = (subject) => {
  currentSubject.value = subject.id
  showSubjectSelector.value = false
  
  // 发送科目切换消息
  const subjectMessage = {
    type: 'ai',
    contentType: 'text',
    content: `好的，我们现在来学习${subject.name}。有什么问题可以问我！`,
    timestamp: Date.now()
  }
  messages.value.push(subjectMessage)
  nextTick(() => scrollToBottom())
}

/**
 * 选择练习题选项
 */
const selectOption = (message, optionIndex) => {
  if (message.content.showAnswer) return
  
  message.content.selectedOption = optionIndex
  message.content.showAnswer = true
  
  // 更新用户积分
  if (optionIndex === message.content.correctAnswer) {
    userStore.addPoints(5)
  }
}

/**
 * 开始知识点练习
 */
const practiceKnowledge = (knowledge) => {
  const practiceMessage = {
    type: 'ai',
    contentType: 'text',
    content: `好的，让我们开始练习${knowledge.title}相关的题目。`,
    timestamp: Date.now()
  }
  messages.value.push(practiceMessage)
  
  // 生成练习题
  setTimeout(() => {
    const exerciseMessage = {
      type: 'ai',
      contentType: 'exercise',
      content: {
        question: '解方程：3x - 7 = 14',
        options: ['x = 5', 'x = 6', 'x = 7', 'x = 8'],
        correctAnswer: 2,
        difficulty: 'medium',
        explanation: '解题步骤：3x - 7 = 14，两边加7得到3x = 21，两边除以3得到x = 7',
        selectedOption: null,
        showAnswer: false
      },
      timestamp: Date.now()
    }
    messages.value.push(exerciseMessage)
    nextTick(() => scrollToBottom())
  }, 1000)
}

/**
 * 点赞消息
 */
const likeMessage = (message) => {
  message.liked = !message.liked
  if (message.liked) {
    userStore.addPoints(1)
  }
}

/**
 * 复制消息
 */
const copyMessage = (content) => {
  if (navigator.clipboard) {
    navigator.clipboard.writeText(typeof content === 'string' ? content : JSON.stringify(content))
    alert('已复制到剪贴板')
  }
}

/**
 * 清空对话历史
 */
const clearHistory = () => {
  if (confirm('确定要清空所有对话记录吗？')) {
    messages.value = []
    showSettings.value = false
  }
}

/**
 * 保存设置
 */
const saveSettings = () => {
  // 保存设置到本地存储
  localStorage.setItem('tutorSettings', JSON.stringify(settings.value))
  showSettings.value = false
  alert('设置已保存')
}

/**
 * 加载设置
 */
const loadSettings = () => {
  const savedSettings = localStorage.getItem('tutorSettings')
  if (savedSettings) {
    settings.value = { ...settings.value, ...JSON.parse(savedSettings) }
  }
}

// 监听消息变化，自动滚动
watch(messages, () => {
  nextTick(() => scrollToBottom())
}, { deep: true })

// 生命周期
onMounted(() => {
  loadSettings()
  
  // 加载历史对话
  const savedMessages = localStorage.getItem('tutorMessages')
  if (savedMessages && settings.value.autoSave) {
    messages.value = JSON.parse(savedMessages)
  }
})

// 自动保存对话
watch(messages, () => {
  if (settings.value.autoSave) {
    localStorage.setItem('tutorMessages', JSON.stringify(messages.value))
  }
}, { deep: true })
</script>

<style scoped>
.tutor-page {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: var(--background);
}

/* 页面头部 */
.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--spacing-md);
  background: white;
  border-bottom: 1px solid var(--border);
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

.header-info {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-xs);
}

.page-title {
  font-size: var(--font-size-lg);
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
}

.tutor-status {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
}

.status-indicator {
  width: 8px;
  height: 8px;
  border-radius: var(--border-radius-round);
  background-color: var(--success-color);
}

.status-text {
  font-size: var(--font-size-xs);
  color: var(--success-color);
}

.action-btn {
  background: none;
  border: none;
  padding: var(--spacing-sm);
  cursor: pointer;
  color: var(--text-secondary);
  border-radius: var(--border-radius-md);
  transition: all 0.2s ease;
}

.action-btn:hover {
  background-color: var(--background);
}

.action-btn.active {
  color: var(--primary-color);
}

/* 聊天容器 */
.chat-container {
  flex: 1;
  overflow-y: auto;
  padding: var(--spacing-md);
  padding-bottom: 0;
}

.chat-messages {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
  padding-bottom: var(--spacing-md);
}

/* 欢迎消息 */
.welcome-message {
  display: flex;
  gap: var(--spacing-md);
  align-items: flex-start;
}

.ai-avatar {
  position: relative;
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, var(--primary-color) 0%, var(--primary-light) 100%);
  border-radius: var(--border-radius-round);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.avatar-icon {
  font-size: 20px;
}

.avatar-status {
  position: absolute;
  bottom: -2px;
  right: -2px;
  width: 12px;
  height: 12px;
  background-color: var(--success-color);
  border: 2px solid white;
  border-radius: var(--border-radius-round);
}

.welcome-content {
  flex: 1;
  background: white;
  padding: var(--spacing-lg);
  border-radius: var(--border-radius-lg);
  box-shadow: var(--shadow-sm);
}

.welcome-title {
  font-size: var(--font-size-lg);
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 var(--spacing-sm) 0;
}

.welcome-text {
  font-size: var(--font-size-md);
  color: var(--text-secondary);
  line-height: var(--line-height-normal);
  margin: 0 0 var(--spacing-lg) 0;
}

.quick-questions {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-sm);
}

.quick-question-btn {
  background: var(--primary-light);
  color: var(--primary-color);
  border: 1px solid var(--primary-color);
  padding: var(--spacing-sm) var(--spacing-md);
  border-radius: var(--border-radius-full);
  font-size: var(--font-size-sm);
  cursor: pointer;
  transition: all 0.2s ease;
}

.quick-question-btn:hover {
  background: var(--primary-color);
  color: white;
}

/* 消息组 */
.message-group {
  display: flex;
  gap: var(--spacing-sm);
  align-items: flex-start;
}

.message-group.user-message {
  flex-direction: row-reverse;
}

.message-avatar {
  width: 32px;
  height: 32px;
  border-radius: var(--border-radius-round);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  background: linear-gradient(135deg, var(--primary-color) 0%, var(--primary-light) 100%);
  color: white;
  font-size: 16px;
}

.user-avatar {
  width: 100%;
  height: 100%;
  border-radius: var(--border-radius-round);
  object-fit: cover;
}

.message-content {
  flex: 1;
  max-width: 70%;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

.user-message .message-content {
  align-items: flex-end;
}

.message-bubble {
  padding: var(--spacing-md);
  border-radius: var(--border-radius-lg);
  word-wrap: break-word;
  position: relative;
}

.message-bubble.user {
  background: var(--primary-color);
  color: white;
  border-bottom-right-radius: var(--border-radius-sm);
}

.message-bubble.ai {
  background: white;
  color: var(--text-primary);
  border: 1px solid var(--border);
  border-bottom-left-radius: var(--border-radius-sm);
  box-shadow: var(--shadow-sm);
}

.message-bubble.typing {
  padding: var(--spacing-md) var(--spacing-lg);
}

.message-text {
  font-size: var(--font-size-md);
  line-height: var(--line-height-normal);
}

.message-image img {
  max-width: 200px;
  max-height: 200px;
  border-radius: var(--border-radius-md);
  cursor: pointer;
  transition: all 0.2s ease;
}

.message-image img:hover {
  transform: scale(1.02);
}

.message-time {
  font-size: var(--font-size-xs);
  color: var(--text-secondary);
  margin-top: var(--spacing-xs);
}

.user-message .message-time {
  text-align: right;
}

.message-actions {
  display: flex;
  gap: var(--spacing-xs);
  margin-top: var(--spacing-xs);
}

.message-actions .action-btn {
  padding: var(--spacing-xs);
  font-size: var(--font-size-xs);
}

/* 正在输入动画 */
.typing-indicator {
  display: flex;
  gap: 4px;
  align-items: center;
}

.typing-indicator span {
  width: 8px;
  height: 8px;
  border-radius: var(--border-radius-round);
  background-color: var(--text-secondary);
  animation: typing 1.4s infinite ease-in-out;
}

.typing-indicator span:nth-child(1) {
  animation-delay: -0.32s;
}

.typing-indicator span:nth-child(2) {
  animation-delay: -0.16s;
}

@keyframes typing {
  0%, 80%, 100% {
    transform: scale(0.8);
    opacity: 0.5;
  }
  40% {
    transform: scale(1);
    opacity: 1;
  }
}

/* 知识点卡片 */
.knowledge-card {
  border: 1px solid var(--border);
  border-radius: var(--border-radius-md);
  overflow: hidden;
}

.knowledge-header {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-md);
  background: var(--primary-light);
  border-bottom: 1px solid var(--border);
}

.knowledge-icon {
  font-size: 24px;
}

.knowledge-title {
  font-size: var(--font-size-md);
  font-weight: 600;
  color: var(--primary-color);
}

.knowledge-body {
  padding: var(--spacing-md);
}

.knowledge-desc {
  font-size: var(--font-size-md);
  color: var(--text-primary);
  line-height: var(--line-height-normal);
  margin-bottom: var(--spacing-md);
}

.knowledge-examples {
  background: var(--background);
  padding: var(--spacing-md);
  border-radius: var(--border-radius-sm);
}

.examples-title {
  font-size: var(--font-size-sm);
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: var(--spacing-sm);
}

.example-item {
  margin-bottom: var(--spacing-sm);
}

.example-item:last-child {
  margin-bottom: 0;
}

.example-question {
  font-size: var(--font-size-sm);
  color: var(--text-primary);
  margin-bottom: 2px;
}

.example-answer {
  font-size: var(--font-size-sm);
  color: var(--success-color);
  font-weight: 500;
}

.knowledge-actions {
  padding: var(--spacing-md);
  border-top: 1px solid var(--border);
  background: var(--background);
}

.knowledge-btn {
  background: var(--primary-color);
  color: white;
  border: none;
  padding: var(--spacing-sm) var(--spacing-md);
  border-radius: var(--border-radius-md);
  font-size: var(--font-size-sm);
  cursor: pointer;
  transition: all 0.2s ease;
}

.knowledge-btn:hover {
  background: var(--primary-dark);
}

/* 练习题卡片 */
.exercise-card {
  border: 1px solid var(--border);
  border-radius: var(--border-radius-md);
  overflow: hidden;
}

.exercise-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-md);
  background: var(--info-light);
  border-bottom: 1px solid var(--border);
}

.exercise-title {
  font-size: var(--font-size-md);
  font-weight: 600;
  color: var(--info-color);
}

.exercise-difficulty {
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--border-radius-sm);
  font-size: var(--font-size-xs);
  font-weight: 500;
  color: white;
}

.exercise-difficulty.easy {
  background: var(--success-color);
}

.exercise-difficulty.medium {
  background: var(--warning-color);
}

.exercise-difficulty.hard {
  background: var(--error-color);
}

.exercise-question {
  padding: var(--spacing-md);
  font-size: var(--font-size-md);
  color: var(--text-primary);
  line-height: var(--line-height-normal);
}

.exercise-options {
  padding: 0 var(--spacing-md) var(--spacing-md);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.option-btn {
  text-align: left;
  padding: var(--spacing-md);
  background: var(--background);
  border: 1px solid var(--border);
  border-radius: var(--border-radius-md);
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: var(--font-size-sm);
}

.option-btn:hover:not(:disabled) {
  background: var(--primary-light);
  border-color: var(--primary-color);
}

.option-btn.selected {
  background: var(--primary-light);
  border-color: var(--primary-color);
  color: var(--primary-color);
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
}

.exercise-explanation {
  padding: var(--spacing-md);
  background: var(--info-light);
  border-top: 1px solid var(--border);
}

.explanation-title {
  font-size: var(--font-size-sm);
  font-weight: 600;
  color: var(--info-color);
  margin-bottom: var(--spacing-xs);
}

.explanation-text {
  font-size: var(--font-size-sm);
  color: var(--text-primary);
  line-height: var(--line-height-normal);
}

/* 输入区域 */
.input-area {
  background: white;
  border-top: 1px solid var(--border);
  padding: var(--spacing-md);
  margin-bottom: 90px;
}

.input-tools {
  display: flex;
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-sm);
}

.tool-btn {
  width: 40px;
  height: 40px;
  background: var(--background);
  border: 1px solid var(--border);
  border-radius: var(--border-radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  color: var(--text-secondary);
}

.tool-btn:hover {
  background: var(--primary-light);
  border-color: var(--primary-color);
  color: var(--primary-color);
}

.input-container {
  display: flex;
  gap: var(--spacing-sm);
  align-items: flex-end;
}

.message-input {
  flex: 1;
  min-height: 40px;
  max-height: 120px;
  padding: var(--spacing-sm) var(--spacing-md);
  border: 1px solid var(--border);
  border-radius: var(--border-radius-lg);
  font-size: var(--font-size-md);
  line-height: var(--line-height-normal);
  resize: none;
  outline: none;
  transition: all 0.2s ease;
}

.message-input:focus {
  border-color: var(--primary-color);
  box-shadow: 0 0 0 2px var(--primary-light);
}

.send-btn {
  width: 40px;
  height: 40px;
  background: var(--primary-color);
  color: white;
  border: none;
  border-radius: var(--border-radius-round);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  flex-shrink: 0;
}

.send-btn:hover:not(:disabled) {
  background: var(--primary-dark);
  transform: scale(1.05);
}

.send-btn:disabled {
  background: var(--text-secondary);
  cursor: not-allowed;
  transform: none;
}

.loading-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top: 2px solid white;
  border-radius: var(--border-radius-round);
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* 弹窗样式 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: var(--spacing-md);
}

.image-picker,
.voice-input,
.subject-selector,
.settings-panel {
  background: white;
  border-radius: var(--border-radius-lg);
  max-width: 400px;
  width: 100%;
  max-height: 80vh;
  overflow-y: auto;
}

.picker-header,
.voice-header,
.selector-header,
.settings-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-md);
  border-bottom: 1px solid var(--border);
}

.picker-header h3,
.voice-header h3,
.selector-header h3,
.settings-header h3 {
  margin: 0;
  font-size: var(--font-size-lg);
  color: var(--text-primary);
}

.close-btn {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: var(--text-secondary);
  padding: var(--spacing-xs);
}

/* 图片选择器 */
.picker-options {
  padding: var(--spacing-md);
  display: flex;
  gap: var(--spacing-md);
}

.picker-option {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-lg);
  background: var(--background);
  border: 1px solid var(--border);
  border-radius: var(--border-radius-md);
  cursor: pointer;
  transition: all 0.2s ease;
}

.picker-option:hover {
  background: var(--primary-light);
  border-color: var(--primary-color);
}

.option-icon {
  font-size: 32px;
}

.option-text {
  font-size: var(--font-size-sm);
  color: var(--text-primary);
}

/* 语音输入 */
.voice-content {
  padding: var(--spacing-xl);
  text-align: center;
}

.voice-animation {
  width: 100px;
  height: 100px;
  margin: 0 auto var(--spacing-lg);
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.voice-circle {
  width: 60px;
  height: 60px;
  background: var(--primary-color);
  border-radius: var(--border-radius-round);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 24px;
  z-index: 2;
}

.voice-circle::before {
  content: '🎤';
}

.voice-wave {
  position: absolute;
  width: 100px;
  height: 100px;
  border: 2px solid var(--primary-color);
  border-radius: var(--border-radius-round);
  opacity: 0;
}

.voice-animation.active .voice-wave {
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% {
    transform: scale(0.6);
    opacity: 1;
  }
  100% {
    transform: scale(1);
    opacity: 0;
  }
}

.voice-text {
  font-size: var(--font-size-md);
  color: var(--text-primary);
  margin-bottom: var(--spacing-lg);
}

.voice-btn {
  background: var(--primary-color);
  color: white;
  border: none;
  padding: var(--spacing-md) var(--spacing-xl);
  border-radius: var(--border-radius-full);
  font-size: var(--font-size-md);
  cursor: pointer;
  transition: all 0.2s ease;
}

.voice-btn:hover {
  background: var(--primary-dark);
}

/* 科目选择器 */
.subject-grid {
  padding: var(--spacing-md);
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--spacing-md);
}

.subject-option {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-md);
  background: var(--background);
  border: 2px solid var(--border);
  border-radius: var(--border-radius-md);
  cursor: pointer;
  transition: all 0.2s ease;
}

.subject-option:hover {
  border-color: var(--primary-color);
}

.subject-option.active {
  background: var(--primary-light);
  border-color: var(--primary-color);
  color: var(--primary-color);
}

.subject-icon {
  font-size: 24px;
}

.subject-name {
  font-size: var(--font-size-sm);
  font-weight: 500;
}

/* 设置面板 */
.settings-content {
  padding: var(--spacing-md);
}

.setting-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-md) 0;
  border-bottom: 1px solid var(--border);
}

.setting-item:last-child {
  border-bottom: none;
}

.setting-label {
  font-size: var(--font-size-md);
  color: var(--text-primary);
}

.setting-select {
  padding: var(--spacing-sm) var(--spacing-md);
  border: 1px solid var(--border);
  border-radius: var(--border-radius-md);
  font-size: var(--font-size-sm);
  background: white;
}

.setting-switch {
  position: relative;
  display: inline-block;
  width: 50px;
  height: 24px;
}

.setting-switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.switch-slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: var(--border);
  transition: 0.4s;
  border-radius: 24px;
}

.switch-slider:before {
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

input:checked + .switch-slider {
  background-color: var(--primary-color);
}

input:checked + .switch-slider:before {
  transform: translateX(26px);
}

.settings-actions {
  padding: var(--spacing-md);
  border-top: 1px solid var(--border);
  display: flex;
  gap: var(--spacing-sm);
}

.settings-actions .btn {
  flex: 1;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .chat-container {
    padding: var(--spacing-sm);
  }
  
  .message-content {
    max-width: 85%;
  }
  
  .welcome-content {
    padding: var(--spacing-md);
  }
  
  .quick-questions {
    flex-direction: column;
  }
  
  .subject-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .picker-options {
    flex-direction: column;
  }
  
  .input-tools {
    overflow-x: auto;
    padding-bottom: var(--spacing-xs);
  }
  
  .settings-actions {
    flex-direction: column;
  }
}
</style>
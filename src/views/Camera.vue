<template>
  <div class="camera-page">
    <!-- 顶部导航 -->
    <div class="page-header">
      <button class="back-btn" @click="goBack">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M19 12H5M12 19L5 12L12 5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>
      <h1 class="page-title">拍照检查</h1>
      <div class="header-actions">
        <button class="help-btn" @click="showHelp = true">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
            <path d="M9.09 9A3 3 0 0 1 12 6C13.66 6 15 7.34 15 9C15 10.66 13.66 12 12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            <path d="M12 17H12.01" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
      </div>
    </div>

    <!-- 主要内容区域 -->
    <div class="camera-content container page-content-mobile">
      <!-- 拍照区域 -->
      <div class="camera-section" v-if="!uploadedImage">
        <div class="camera-container">
          <div class="camera-preview" :class="{ 'camera-active': isCameraActive }">
            <video 
              ref="videoElement" 
              v-show="isCameraActive" 
              autoplay 
              playsinline
              class="camera-video"
            ></video>
            <canvas 
              ref="canvasElement" 
              style="display: none;"
            ></canvas>
            
            <!-- 相机未激活时的占位符 -->
            <div v-if="!isCameraActive" class="camera-placeholder">
              <div class="placeholder-icon">📸</div>
              <div class="placeholder-text">点击下方按钮开始拍照</div>
            </div>
            
            <!-- 拍照指导线 -->
            <div v-if="isCameraActive" class="camera-guides">
              <div class="guide-line horizontal"></div>
              <div class="guide-line vertical"></div>
            </div>
          </div>
          
          <!-- 拍照控制按钮 -->
          <div class="camera-controls">
            <button 
              v-if="!isCameraActive" 
              class="btn btn-primary camera-start-btn"
              @click="startCamera"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M23 19A2 2 0 0 1 21 21H3A2 2 0 0 1 1 19V8A2 2 0 0 1 3 6H7L9 3H15L17 6H21A2 2 0 0 1 23 8V19Z" stroke="currentColor" stroke-width="2"/>
                <circle cx="12" cy="13" r="4" stroke="currentColor" stroke-width="2"/>
              </svg>
              开启相机
            </button>
            
            <div v-if="isCameraActive" class="active-camera-controls">
              <button class="control-btn" @click="switchCamera" v-if="cameras.length > 1">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M17 8L21 12L17 16M7 16L3 12L7 8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </button>
              
              <button class="capture-btn" @click="capturePhoto">
                <div class="capture-inner"></div>
              </button>
              
              <button class="control-btn" @click="stopCamera">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2" stroke="currentColor" stroke-width="2"/>
                  <rect x="9" y="9" width="6" height="6" fill="currentColor"/>
                </svg>
              </button>
            </div>
          </div>
        </div>
        
        <!-- 上传选项 -->
        <div class="upload-section">
          <div class="section-divider">
            <span class="divider-text">或者</span>
          </div>
          
          <div class="upload-options">
            <label class="upload-btn btn btn-outline">
              <input 
                type="file" 
                accept="image/*" 
                @change="handleFileUpload" 
                style="display: none;"
              >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M21 15V19A2 2 0 0 1 19 21H5A2 2 0 0 1 3 19V15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <polyline points="7,10 12,15 17,10" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <line x1="12" y1="15" x2="12" y2="3" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              </svg>
              从相册选择
            </label>
          </div>
        </div>
      </div>
      
      <!-- 图片预览和处理区域 -->
      <div class="preview-section" v-if="uploadedImage">
        <div class="image-preview-container">
          <img :src="uploadedImage" alt="上传的图片" class="preview-image" />
          <div class="preview-actions">
            <button class="action-btn" @click="retakePhoto">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M3 12A9 9 0 0 1 12 3A9 9 0 0 1 21 12A9 9 0 0 1 12 21" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                <path d="M12 7V12L16 14" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              重新拍照
            </button>
            <button class="action-btn" @click="cropImage">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M6.13 1L6 16A2 2 0 0 0 8 18H21" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M21 6.13L8 6A2 2 0 0 0 6 8V21" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              裁剪
            </button>
          </div>
        </div>
        
        <!-- 科目选择 -->
        <div class="subject-selection">
          <h3 class="selection-title">选择科目</h3>
          <div class="subject-grid row">
            <button 
              v-for="subject in subjects" 
              :key="subject.id"
              :class="['subject-btn col-4 col-md-3 col-lg-2', { active: selectedSubject === subject.id }]"
              @click="selectSubject(subject.id)"
            >
              <div class="subject-icon">{{ subject.icon }}</div>
              <div class="subject-name">{{ subject.name }}</div>
            </button>
          </div>
        </div>
        
        <!-- 检查选项 -->
        <div class="check-options">
          <h3 class="selection-title">检查类型</h3>
          <div class="options-list">
            <label 
              v-for="option in checkOptions" 
              :key="option.id"
              class="option-item"
            >
              <input 
                type="checkbox" 
                :value="option.id"
                v-model="selectedOptions"
                class="option-checkbox"
              >
              <div class="option-content">
                <div class="option-icon">{{ option.icon }}</div>
                <div class="option-info">
                  <div class="option-name">{{ option.name }}</div>
                  <div class="option-desc">{{ option.description }}</div>
                </div>
              </div>
            </label>
          </div>
        </div>
        
        <!-- 开始检查按钮 -->
        <div class="check-action">
          <button 
            class="btn btn-primary check-btn btn-mobile-full"
            @click="startCheck"
            :disabled="!selectedSubject || selectedOptions.length === 0 || isChecking"
          >
            <div v-if="isChecking" class="loading-spinner"></div>
            {{ isChecking ? '正在检查中...' : '开始AI检查' }}
          </button>
        </div>
      </div>
      
      <!-- 检查结果区域 -->
      <div class="result-section" v-if="checkResult">
        <div class="result-header">
          <h2 class="result-title">检查结果</h2>
          <div class="result-score">
            <span class="score-label">得分</span>
            <span class="score-value">{{ checkResult.score }}</span>
            <span class="score-total">/100</span>
          </div>
        </div>
        
        <!-- 总体评价 -->
        <div class="overall-evaluation card">
          <div class="eval-header">
            <div class="eval-icon">{{ checkResult.level.icon }}</div>
            <div class="eval-info">
              <div class="eval-level">{{ checkResult.level.name }}</div>
              <div class="eval-comment">{{ checkResult.comment }}</div>
            </div>
          </div>
        </div>
        
        <!-- 详细分析 -->
        <div class="detailed-analysis">
          <h3 class="analysis-title">详细分析</h3>
          <div class="analysis-list">
            <div 
              v-for="(item, index) in checkResult.details" 
              :key="index"
              class="analysis-item card"
            >
              <div class="item-header">
                <div class="item-number">{{ index + 1 }}</div>
                <div class="item-status" :class="item.status">
                  {{ item.status === 'correct' ? '✓' : item.status === 'wrong' ? '✗' : '?' }}
                </div>
              </div>
              <div class="item-content">
                <div class="item-question">{{ item.question }}</div>
                <div class="item-answer" v-if="item.userAnswer">
                  <span class="answer-label">你的答案：</span>
                  <span class="answer-text">{{ item.userAnswer }}</span>
                </div>
                <div class="item-correct" v-if="item.correctAnswer">
                  <span class="answer-label">正确答案：</span>
                  <span class="answer-text correct">{{ item.correctAnswer }}</span>
                </div>
                <div class="item-explanation" v-if="item.explanation">
                  <span class="explanation-label">解析：</span>
                  <span class="explanation-text">{{ item.explanation }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- 建议和操作 -->
        <div class="suggestions-section">
          <h3 class="suggestions-title">学习建议</h3>
          <div class="suggestions-list">
            <div 
              v-for="suggestion in checkResult.suggestions" 
              :key="suggestion.id"
              class="suggestion-item"
            >
              <div class="suggestion-icon">{{ suggestion.icon }}</div>
              <div class="suggestion-text">{{ suggestion.text }}</div>
            </div>
          </div>
        </div>
        
        <!-- 操作按钮 -->
        <div class="result-actions">
          <button class="btn btn-outline" @click="saveResult">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M19 21H5A2 2 0 0 1 3 19V5A2 2 0 0 1 5 3H11L19 11V19A2 2 0 0 1 19 21Z" stroke="currentColor" stroke-width="2"/>
              <polyline points="17,21 17,13 7,13 7,21" stroke="currentColor" stroke-width="2"/>
              <polyline points="7,3 7,8 15,8" stroke="currentColor" stroke-width="2"/>
            </svg>
            保存结果
          </button>
          <button class="btn btn-primary" @click="shareResult">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <circle cx="18" cy="5" r="3" stroke="currentColor" stroke-width="2"/>
              <circle cx="6" cy="12" r="3" stroke="currentColor" stroke-width="2"/>
              <circle cx="18" cy="19" r="3" stroke="currentColor" stroke-width="2"/>
              <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" stroke="currentColor" stroke-width="2"/>
              <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" stroke="currentColor" stroke-width="2"/>
            </svg>
            分享结果
          </button>
          <button class="btn btn-secondary" @click="checkAnother">
            再检查一题
          </button>
        </div>
      </div>
    </div>
    
    <!-- 帮助弹窗 -->
    <div v-if="showHelp" class="help-modal" @click="showHelp = false">
      <div class="help-content" @click.stop>
        <div class="help-header">
          <h3>拍照检查使用指南</h3>
          <button class="close-btn" @click="showHelp = false">×</button>
        </div>
        <div class="help-body">
          <div class="help-item">
            <div class="help-icon">📸</div>
            <div class="help-text">
              <div class="help-title">拍照技巧</div>
              <div class="help-desc">保持手机稳定，确保作业内容清晰可见，避免反光和阴影</div>
            </div>
          </div>
          <div class="help-item">
            <div class="help-icon">🎯</div>
            <div class="help-text">
              <div class="help-title">选择科目</div>
              <div class="help-desc">准确选择作业科目，AI会根据科目特点进行专业分析</div>
            </div>
          </div>
          <div class="help-item">
            <div class="help-icon">✅</div>
            <div class="help-text">
              <div class="help-title">检查类型</div>
              <div class="help-desc">可选择多种检查类型，获得全面的作业分析报告</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '../stores/user'

/**
 * 拍照检查页面组件
 * 实现拍照上传、AI批改、结果展示等功能
 */

const router = useRouter()
const userStore = useUserStore()

// 响应式数据
const videoElement = ref(null)
const canvasElement = ref(null)
const isCameraActive = ref(false)
const cameras = ref([])
const currentCameraIndex = ref(0)
const uploadedImage = ref('')
const selectedSubject = ref('')
const selectedOptions = ref([])
const isChecking = ref(false)
const checkResult = ref(null)
const showHelp = ref(false)
const mediaStream = ref(null)

// 科目配置
const subjects = ref([
  { id: 'math', name: '数学', icon: '🔢' },
  { id: 'chinese', name: '语文', icon: '📝' },
  { id: 'english', name: '英语', icon: '🔤' },
  { id: 'physics', name: '物理', icon: '⚛️' },
  { id: 'chemistry', name: '化学', icon: '🧪' },
  { id: 'biology', name: '生物', icon: '🧬' }
])

// 检查选项配置
const checkOptions = ref([
  {
    id: 'accuracy',
    name: '答案正确性',
    description: '检查答案是否正确',
    icon: '✅'
  },
  {
    id: 'process',
    name: '解题过程',
    description: '分析解题步骤和方法',
    icon: '📋'
  },
  {
    id: 'handwriting',
    name: '书写规范',
    description: '评估字迹和格式',
    icon: '✍️'
  },
  {
    id: 'knowledge',
    name: '知识点分析',
    description: '识别涉及的知识点',
    icon: '🎯'
  }
])

// 方法
/**
 * 返回上一页
 */
const goBack = () => {
  if (mediaStream.value) {
    stopCamera()
  }
  router.back()
}

/**
 * 获取可用摄像头
 */
const getCameras = async () => {
  try {
    const devices = await navigator.mediaDevices.enumerateDevices()
    cameras.value = devices.filter(device => device.kind === 'videoinput')
  } catch (error) {
    console.error('获取摄像头失败:', error)
  }
}

/**
 * 启动相机
 */
const startCamera = async () => {
  try {
    const constraints = {
      video: {
        deviceId: cameras.value[currentCameraIndex.value]?.deviceId,
        width: { ideal: 1280 },
        height: { ideal: 720 }
      }
    }
    
    mediaStream.value = await navigator.mediaDevices.getUserMedia(constraints)
    videoElement.value.srcObject = mediaStream.value
    isCameraActive.value = true
  } catch (error) {
    console.error('启动相机失败:', error)
    alert('无法启动相机，请检查权限设置')
  }
}

/**
 * 停止相机
 */
const stopCamera = () => {
  if (mediaStream.value) {
    mediaStream.value.getTracks().forEach(track => track.stop())
    mediaStream.value = null
  }
  isCameraActive.value = false
}

/**
 * 切换摄像头
 */
const switchCamera = () => {
  currentCameraIndex.value = (currentCameraIndex.value + 1) % cameras.value.length
  stopCamera()
  setTimeout(startCamera, 100)
}

/**
 * 拍照
 */
const capturePhoto = () => {
  const canvas = canvasElement.value
  const video = videoElement.value
  const context = canvas.getContext('2d')
  
  canvas.width = video.videoWidth
  canvas.height = video.videoHeight
  context.drawImage(video, 0, 0)
  
  uploadedImage.value = canvas.toDataURL('image/jpeg', 0.8)
  stopCamera()
}

/**
 * 处理文件上传
 */
const handleFileUpload = (event) => {
  const file = event.target.files[0]
  if (file) {
    const reader = new FileReader()
    reader.onload = (e) => {
      uploadedImage.value = e.target.result
    }
    reader.readAsDataURL(file)
  }
}

/**
 * 重新拍照
 */
const retakePhoto = () => {
  uploadedImage.value = ''
  checkResult.value = null
  selectedSubject.value = ''
  selectedOptions.value = []
}

/**
 * 裁剪图片
 */
const cropImage = () => {
  // 这里可以集成图片裁剪功能
  console.log('裁剪图片功能')
}

/**
 * 选择科目
 */
const selectSubject = (subjectId) => {
  selectedSubject.value = subjectId
}

/**
 * 开始检查
 */
const startCheck = async () => {
  if (!selectedSubject.value || selectedOptions.value.length === 0) {
    alert('请选择科目和检查类型')
    return
  }
  
  isChecking.value = true
  
  try {
    // 模拟AI检查过程
    await new Promise(resolve => setTimeout(resolve, 3000))
    
    // 模拟检查结果
    checkResult.value = {
      score: 85,
      level: {
        name: '良好',
        icon: '👍'
      },
      comment: '整体完成情况不错，有几个小问题需要注意。',
      details: [
        {
          question: '第1题：计算 25 × 4 = ?',
          userAnswer: '100',
          correctAnswer: '100',
          status: 'correct',
          explanation: '答案正确！25×4可以简化为25×4=100'
        },
        {
          question: '第2题：解方程 2x + 3 = 11',
          userAnswer: 'x = 3',
          correctAnswer: 'x = 4',
          status: 'wrong',
          explanation: '解题步骤：2x + 3 = 11，两边减3得2x = 8，两边除以2得x = 4'
        },
        {
          question: '第3题：化简 (a+b)²',
          userAnswer: 'a² + 2ab + b²',
          correctAnswer: 'a² + 2ab + b²',
          status: 'correct',
          explanation: '完全平方公式应用正确！'
        }
      ],
      suggestions: [
        {
          id: '1',
          icon: '📚',
          text: '建议复习一元一次方程的解法步骤'
        },
        {
          id: '2',
          icon: '✍️',
          text: '书写工整，继续保持'
        },
        {
          id: '3',
          icon: '🎯',
          text: '可以多练习类似的计算题目'
        }
      ]
    }
    
    // 更新用户积分
    userStore.addPoints(10)
    
  } catch (error) {
    console.error('检查失败:', error)
    alert('检查失败，请重试')
  } finally {
    isChecking.value = false
  }
}

/**
 * 保存结果
 */
const saveResult = () => {
  // 保存检查结果到本地存储或服务器
  console.log('保存结果:', checkResult.value)
  alert('结果已保存')
}

/**
 * 分享结果
 */
const shareResult = () => {
  // 实现分享功能
  if (navigator.share) {
    navigator.share({
      title: 'AI作业检查结果',
      text: `我的作业得分：${checkResult.value.score}分`,
      url: window.location.href
    })
  } else {
    // 降级处理
    console.log('分享结果')
    alert('分享功能暂不支持')
  }
}

/**
 * 检查另一题
 */
const checkAnother = () => {
  uploadedImage.value = ''
  checkResult.value = null
  selectedSubject.value = ''
  selectedOptions.value = []
  isChecking.value = false
}

// 生命周期
onMounted(async () => {
  await getCameras()
})

onUnmounted(() => {
  if (mediaStream.value) {
    stopCamera()
  }
})
</script>

<style scoped>
.camera-page {
  min-height: 100vh;
  background-color: var(--background);
  padding-bottom: 90px;
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

.page-title {
  font-size: var(--font-size-lg);
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
}

.help-btn {
  background: none;
  border: none;
  padding: var(--spacing-sm);
  cursor: pointer;
  color: var(--text-secondary);
}

/* 主要内容 */
.camera-content {
  padding: var(--spacing-md);
}

/* 相机区域 */
.camera-section {
  margin-bottom: var(--spacing-lg);
}

.camera-container {
  background: white;
  border-radius: var(--border-radius-lg);
  padding: var(--spacing-md);
  box-shadow: var(--shadow-sm);
}

.camera-preview {
  position: relative;
  width: 100%;
  height: 300px;
  background-color: #f5f5f5;
  border-radius: var(--border-radius-md);
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}

.camera-video {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.camera-placeholder {
  text-align: center;
  color: var(--text-secondary);
}

.placeholder-icon {
  font-size: 48px;
  margin-bottom: var(--spacing-sm);
}

.placeholder-text {
  font-size: var(--font-size-md);
}

.camera-guides {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
}

.guide-line {
  position: absolute;
  background-color: rgba(255, 255, 255, 0.5);
}

.guide-line.horizontal {
  left: 0;
  right: 0;
  top: 50%;
  height: 1px;
  transform: translateY(-50%);
}

.guide-line.vertical {
  top: 0;
  bottom: 0;
  left: 50%;
  width: 1px;
  transform: translateX(-50%);
}

.camera-controls {
  margin-top: var(--spacing-md);
  display: flex;
  justify-content: center;
}

.camera-start-btn {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.active-camera-controls {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
}

.control-btn {
  width: 48px;
  height: 48px;
  border-radius: var(--border-radius-round);
  background: white;
  border: 2px solid var(--border);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
}

.control-btn:hover {
  background-color: var(--background);
}

.capture-btn {
  width: 72px;
  height: 72px;
  border-radius: var(--border-radius-round);
  background: white;
  border: 4px solid var(--primary-color);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
}

.capture-btn:hover {
  transform: scale(1.05);
}

.capture-inner {
  width: 48px;
  height: 48px;
  background-color: var(--primary-color);
  border-radius: var(--border-radius-round);
}

/* 上传区域 */
.upload-section {
  margin-top: var(--spacing-lg);
}

.section-divider {
  text-align: center;
  margin: var(--spacing-lg) 0;
  position: relative;
}

.section-divider::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  height: 1px;
  background-color: var(--border);
}

.divider-text {
  background: var(--background);
  padding: 0 var(--spacing-md);
  color: var(--text-secondary);
  font-size: var(--font-size-sm);
}

.upload-options {
  display: flex;
  justify-content: center;
}

.upload-btn {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

/* 预览区域 */
.preview-section {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
}

.image-preview-container {
  position: relative;
  background: white;
  border-radius: var(--border-radius-lg);
  padding: var(--spacing-md);
  box-shadow: var(--shadow-sm);
}

.preview-image {
  width: 100%;
  max-height: 400px;
  object-fit: contain;
  border-radius: var(--border-radius-md);
}

.preview-actions {
  display: flex;
  gap: var(--spacing-sm);
  margin-top: var(--spacing-md);
  justify-content: center;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  padding: var(--spacing-sm) var(--spacing-md);
  background: var(--background);
  border: 1px solid var(--border);
  border-radius: var(--border-radius-md);
  font-size: var(--font-size-sm);
  cursor: pointer;
  transition: all 0.2s ease;
}

.action-btn:hover {
  background-color: var(--primary-light);
}

/* 科目选择 */
.subject-selection,
.check-options {
  background: white;
  border-radius: var(--border-radius-lg);
  padding: var(--spacing-md);
  box-shadow: var(--shadow-sm);
}

.selection-title {
  font-size: var(--font-size-md);
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 var(--spacing-md) 0;
}

.subject-grid {
  margin: 0;
}

.subject-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-xs);
  padding: var(--spacing-md);
  background: var(--background);
  border: 2px solid var(--border);
  border-radius: var(--border-radius-md);
  cursor: pointer;
  transition: all 0.2s ease;
  margin-bottom: var(--spacing-sm);
}

@media (min-width: 1025px) {
  .subject-btn {
    margin-bottom: 0;
  }
}

.subject-btn:hover {
  border-color: var(--primary-color);
}

.subject-btn.active {
  background-color: var(--primary-light);
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

/* 检查选项 */
.options-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.option-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  padding: var(--spacing-md);
  background: var(--background);
  border: 1px solid var(--border);
  border-radius: var(--border-radius-md);
  cursor: pointer;
  transition: all 0.2s ease;
}

.option-item:hover {
  background-color: var(--primary-light);
}

.option-checkbox {
  width: 18px;
  height: 18px;
  accent-color: var(--primary-color);
}

.option-content {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  flex: 1;
}

.option-icon {
  font-size: 20px;
}

.option-info {
  flex: 1;
}

.option-name {
  font-size: var(--font-size-md);
  font-weight: 500;
  color: var(--text-primary);
  margin-bottom: 2px;
}

.option-desc {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
}

/* 检查按钮 */
.check-action {
  display: flex;
  justify-content: center;
}

.check-btn {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-md) var(--spacing-xl);
  font-size: var(--font-size-md);
  font-weight: 600;
}

.check-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
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

/* 结果区域 */
.result-section {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
}

.result-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: white;
  padding: var(--spacing-md);
  border-radius: var(--border-radius-lg);
  box-shadow: var(--shadow-sm);
}

.result-title {
  font-size: var(--font-size-lg);
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
}

.result-score {
  display: flex;
  align-items: baseline;
  gap: var(--spacing-xs);
}

.score-label {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
}

.score-value {
  font-size: var(--font-size-xxl);
  font-weight: 700;
  color: var(--primary-color);
}

.score-total {
  font-size: var(--font-size-md);
  color: var(--text-secondary);
}

/* 总体评价 */
.overall-evaluation {
  background: linear-gradient(135deg, var(--success-color) 0%, var(--success-light) 100%);
  color: white;
  border: none;
}

.eval-header {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
}

.eval-icon {
  font-size: 32px;
}

.eval-level {
  font-size: var(--font-size-lg);
  font-weight: 600;
  margin-bottom: var(--spacing-xs);
}

.eval-comment {
  font-size: var(--font-size-md);
  opacity: 0.9;
}

/* 详细分析 */
.detailed-analysis {
  background: white;
  border-radius: var(--border-radius-lg);
  padding: var(--spacing-md);
  box-shadow: var(--shadow-sm);
}

.analysis-title {
  font-size: var(--font-size-md);
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 var(--spacing-md) 0;
}

.analysis-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.analysis-item {
  border: 1px solid var(--border);
  border-radius: var(--border-radius-md);
  padding: var(--spacing-md);
}

.item-header {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-sm);
}

.item-number {
  width: 24px;
  height: 24px;
  background-color: var(--primary-color);
  color: white;
  border-radius: var(--border-radius-round);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--font-size-sm);
  font-weight: 600;
}

.item-status {
  width: 24px;
  height: 24px;
  border-radius: var(--border-radius-round);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  color: white;
}

.item-status.correct {
  background-color: var(--success-color);
}

.item-status.wrong {
  background-color: var(--error-color);
}

.item-status.partial {
  background-color: var(--warning-color);
}

.item-question {
  font-size: var(--font-size-md);
  font-weight: 500;
  color: var(--text-primary);
  margin-bottom: var(--spacing-sm);
}

.item-answer,
.item-correct {
  margin-bottom: var(--spacing-sm);
}

.answer-label {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  margin-right: var(--spacing-xs);
}

.answer-text {
  font-size: var(--font-size-sm);
  color: var(--text-primary);
}

.answer-text.correct {
  color: var(--success-color);
  font-weight: 500;
}

.item-explanation {
  background-color: var(--background);
  padding: var(--spacing-sm);
  border-radius: var(--border-radius-sm);
  border-left: 3px solid var(--info-color);
}

.explanation-label {
  font-size: var(--font-size-sm);
  color: var(--info-color);
  font-weight: 500;
  margin-right: var(--spacing-xs);
}

.explanation-text {
  font-size: var(--font-size-sm);
  color: var(--text-primary);
  line-height: var(--line-height-normal);
}

/* 建议区域 */
.suggestions-section {
  background: white;
  border-radius: var(--border-radius-lg);
  padding: var(--spacing-md);
  box-shadow: var(--shadow-sm);
}

.suggestions-title {
  font-size: var(--font-size-md);
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 var(--spacing-md) 0;
}

.suggestions-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.suggestion-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  padding: var(--spacing-sm);
  background-color: var(--background);
  border-radius: var(--border-radius-md);
}

.suggestion-icon {
  font-size: 20px;
}

.suggestion-text {
  font-size: var(--font-size-sm);
  color: var(--text-primary);
  line-height: var(--line-height-normal);
}

/* 操作按钮 */
.result-actions {
  display: flex;
  gap: var(--spacing-sm);
  flex-wrap: wrap;
}

.result-actions .btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-xs);
  min-width: 120px;
}

/* 帮助弹窗 */
.help-modal {
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

.help-content {
  background: white;
  border-radius: var(--border-radius-lg);
  max-width: 400px;
  width: 100%;
  max-height: 80vh;
  overflow-y: auto;
}

.help-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-md);
  border-bottom: 1px solid var(--border);
}

.help-header h3 {
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

.help-body {
  padding: var(--spacing-md);
}

.help-item {
  display: flex;
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-md);
}

.help-item:last-child {
  margin-bottom: 0;
}

.help-icon {
  font-size: 24px;
  flex-shrink: 0;
}

.help-title {
  font-size: var(--font-size-md);
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: var(--spacing-xs);
}

.help-desc {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  line-height: var(--line-height-normal);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .subject-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .result-actions {
    flex-direction: column;
  }
  
  .result-actions .btn {
    min-width: auto;
  }
  
  .active-camera-controls {
    gap: var(--spacing-sm);
  }
  
  .capture-btn {
    width: 60px;
    height: 60px;
  }
  
  .capture-inner {
    width: 40px;
    height: 40px;
  }
}
</style>
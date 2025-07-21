import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

/**
 * PK挑战状态管理
 * 管理试卷生成、答题过程、成绩统计等数据
 */
export const usePKStore = defineStore('pk', () => {
  // 当前考试数据
  const currentExam = ref(null)
  
  // 答题状态
  const examState = ref({
    currentQuestion: 1,
    answers: {},
    startTime: null,
    endTime: null,
    timeRemaining: 0,
    isSubmitted: false
  })

  // 试卷配置选项
  const examConfig = ref({
    grades: [
      { value: '1', label: '一年级' },
      { value: '2', label: '二年级' },
      { value: '3', label: '三年级' },
      { value: '4', label: '四年级' },
      { value: '5', label: '五年级' },
      { value: '6', label: '六年级' },
      { value: '7', label: '初一' },
      { value: '8', label: '初二' },
      { value: '9', label: '初三' },
      { value: '10', label: '高一' },
      { value: '11', label: '高二' },
      { value: '12', label: '高三' }
    ],
    subjects: [
      { value: 'math', name: '数学', icon: '🔢' },
      { value: 'chinese', name: '语文', icon: '📝' },
      { value: 'english', name: '英语', icon: '🔤' }
    ],
    difficulties: [
      { value: 'easy', name: '简单', stars: '⭐', description: '基础题目，适合入门' },
      { value: 'medium', name: '中等', stars: '⭐⭐', description: '中等难度，考验理解' },
      { value: 'hard', name: '困难', stars: '⭐⭐⭐', description: '高难度，挑战极限' }
    ]
  })

  // 快速挑战模式
  const quickModes = ref([
    {
      id: 'daily',
      title: '每日一练',
      description: '10道题，15分钟',
      icon: '📅',
      points: 20,
      config: { questionCount: 10, timeLimit: 15, difficulty: 'easy' }
    },
    {
      id: 'sprint',
      title: '冲刺挑战',
      description: '20道题，25分钟',
      icon: '🚀',
      points: 50,
      config: { questionCount: 20, timeLimit: 25, difficulty: 'medium' }
    },
    {
      id: 'master',
      title: '大师级',
      description: '30道题，40分钟',
      icon: '👑',
      points: 100,
      config: { questionCount: 30, timeLimit: 40, difficulty: 'hard' }
    }
  ])

  // 排行榜数据
  const leaderboard = ref({
    daily: [],
    weekly: [],
    monthly: []
  })

  // 历史考试记录
  const examHistory = ref([])

  // 计算属性
  const progressPercentage = computed(() => {
    if (!currentExam.value) return 0
    return (examState.value.currentQuestion / currentExam.value.totalQuestions) * 100
  })

  const answeredCount = computed(() => {
    return Object.keys(examState.value.answers).length
  })

  const timeUsed = computed(() => {
    if (!examState.value.startTime) return 0
    const endTime = examState.value.endTime || Date.now()
    return Math.floor((endTime - examState.value.startTime) / 1000)
  })

  // 方法
  /**
   * 生成试卷
   */
  const generateExam = async (config) => {
    const examId = `exam_${Date.now()}`
    
    // 模拟试卷生成
    const questions = await generateQuestions(config)
    
    currentExam.value = {
      id: examId,
      title: `${config.subject}${config.grade}年级${config.difficulty}难度测试`,
      subject: config.subject,
      grade: config.grade,
      difficulty: config.difficulty,
      totalQuestions: config.questionCount,
      totalScore: config.questionCount * 5, // 每题5分
      timeLimit: config.timeLimit * 60, // 转换为秒
      questions,
      createdAt: Date.now()
    }
    
    // 重置答题状态
    resetExamState()
    
    return currentExam.value
  }

  /**
   * 生成题目（模拟）
   */
  const generateQuestions = async (config) => {
    const questions = []
    
    for (let i = 1; i <= config.questionCount; i++) {
      questions.push({
        id: `q_${i}`,
        number: i,
        type: Math.random() > 0.5 ? 'choice' : 'fill',
        content: `这是第${i}道${config.subject}题目，难度为${config.difficulty}`,
        options: config.subject === 'math' ? ['A. 选项1', 'B. 选项2', 'C. 选项3', 'D. 选项4'] : null,
        correctAnswer: 'A',
        score: 5,
        knowledgePoints: ['基础运算', '逻辑推理'],
        difficulty: getDifficultyLevel(config.difficulty)
      })
    }
    
    return questions
  }

  /**
   * 获取难度等级数值
   */
  const getDifficultyLevel = (difficulty) => {
    const levels = { easy: 1, medium: 3, hard: 5 }
    return levels[difficulty] || 1
  }

  /**
   * 重置答题状态
   */
  const resetExamState = () => {
    examState.value = {
      currentQuestion: 1,
      answers: {},
      startTime: null,
      endTime: null,
      timeRemaining: 0,
      isSubmitted: false
    }
  }

  /**
   * 开始考试
   */
  const startExam = () => {
    examState.value.startTime = Date.now()
    examState.value.timeRemaining = currentExam.value.timeLimit
    
    // 开始倒计时
    startTimer()
  }

  /**
   * 开始计时器
   */
  const startTimer = () => {
    const timer = setInterval(() => {
      if (examState.value.timeRemaining > 0 && !examState.value.isSubmitted) {
        examState.value.timeRemaining--
      } else {
        clearInterval(timer)
        if (!examState.value.isSubmitted) {
          submitExam() // 时间到自动提交
        }
      }
    }, 1000)
  }

  /**
   * 保存答案
   */
  const saveAnswer = (questionId, answer) => {
    examState.value.answers[questionId] = {
      answer,
      timestamp: Date.now()
    }
  }

  /**
   * 跳转到指定题目
   */
  const goToQuestion = (questionNumber) => {
    if (questionNumber >= 1 && questionNumber <= currentExam.value.totalQuestions) {
      examState.value.currentQuestion = questionNumber
    }
  }

  /**
   * 下一题
   */
  const nextQuestion = () => {
    if (examState.value.currentQuestion < currentExam.value.totalQuestions) {
      examState.value.currentQuestion++
    }
  }

  /**
   * 上一题
   */
  const prevQuestion = () => {
    if (examState.value.currentQuestion > 1) {
      examState.value.currentQuestion--
    }
  }

  /**
   * 提交试卷
   */
  const submitExam = async () => {
    examState.value.endTime = Date.now()
    examState.value.isSubmitted = true
    
    // 批改试卷
    const report = await gradeExam()
    
    // 保存到历史记录
    examHistory.value.unshift({
      exam: currentExam.value,
      state: { ...examState.value },
      report,
      submittedAt: Date.now()
    })
    
    return report
  }

  /**
   * 批改试卷
   */
  const gradeExam = async () => {
    let correctCount = 0
    let totalScore = 0
    const wrongQuestions = []
    
    currentExam.value.questions.forEach(question => {
      const userAnswer = examState.value.answers[question.id]?.answer
      const isCorrect = userAnswer === question.correctAnswer
      
      if (isCorrect) {
        correctCount++
        totalScore += question.score
      } else {
        wrongQuestions.push({
          ...question,
          studentAnswer: userAnswer || '未作答',
          analysisText: `正确答案是${question.correctAnswer}，你的答案是${userAnswer || '未作答'}。`
        })
      }
    })
    
    const accuracy = Math.round((correctCount / currentExam.value.totalQuestions) * 100)
    const grade = getGrade(accuracy)
    const pointsEarned = calculatePoints(grade, accuracy)
    
    return {
      examId: currentExam.value.id,
      totalScore: currentExam.value.totalScore,
      earnedScore: totalScore,
      accuracy,
      correctCount,
      wrongCount: currentExam.value.totalQuestions - correctCount,
      timeUsed: timeUsed.value,
      avgTimePerQuestion: Math.round(timeUsed.value / currentExam.value.totalQuestions),
      grade,
      pointsEarned,
      ranking: Math.floor(Math.random() * 100) + 1, // 模拟排名
      totalParticipants: 500, // 模拟参与人数
      strengths: ['基础运算', '逻辑推理'],
      weaknesses: wrongQuestions.length > 0 ? ['应用题', '综合分析'] : [],
      suggestions: generateSuggestions(accuracy, wrongQuestions),
      wrongQuestions,
      createdAt: Date.now()
    }
  }

  /**
   * 获取等级评定
   */
  const getGrade = (accuracy) => {
    if (accuracy >= 95) return 'A+'
    if (accuracy >= 90) return 'A'
    if (accuracy >= 85) return 'B+'
    if (accuracy >= 80) return 'B'
    if (accuracy >= 75) return 'C+'
    if (accuracy >= 70) return 'C'
    return 'D'
  }

  /**
   * 计算获得积分
   */
  const calculatePoints = (grade, accuracy) => {
    const gradePoints = {
      'A+': 100, 'A': 80, 'B+': 60, 'B': 40, 'C+': 20, 'C': 10, 'D': 5
    }
    
    let points = gradePoints[grade] || 5
    
    // 满分奖励
    if (accuracy === 100) points += 50
    
    return points
  }

  /**
   * 生成学习建议
   */
  const generateSuggestions = (accuracy, wrongQuestions) => {
    const suggestions = []
    
    if (accuracy < 70) {
      suggestions.push('建议加强基础知识的学习和练习')
      suggestions.push('可以寻求老师或同学的帮助')
    } else if (accuracy < 85) {
      suggestions.push('基础掌握不错，可以尝试更多应用题')
      suggestions.push('注意审题，避免粗心错误')
    } else {
      suggestions.push('表现优秀！继续保持')
      suggestions.push('可以挑战更高难度的题目')
    }
    
    return suggestions
  }

  /**
   * 更新排行榜
   */
  const updateLeaderboard = (period, data) => {
    leaderboard.value[period] = data
  }

  return {
    // 状态
    currentExam,
    examState,
    examConfig,
    quickModes,
    leaderboard,
    examHistory,
    
    // 计算属性
    progressPercentage,
    answeredCount,
    timeUsed,
    
    // 方法
    generateExam,
    startExam,
    saveAnswer,
    goToQuestion,
    nextQuestion,
    prevQuestion,
    submitExam,
    updateLeaderboard,
    resetExamState
  }
})
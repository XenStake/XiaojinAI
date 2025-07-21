const express = require('express')
const { getDB } = require('../database/init')
const authRoutes = require('./auth')
const { authenticateToken } = authRoutes

const router = express.Router()

// 模拟AI回复生成
const generateAIResponse = (message, subject, context) => {
  const responses = {
    '数学': {
      greetings: [
        '你好！我是你的数学AI老师，有什么数学问题需要帮助吗？',
        '欢迎来到数学课堂！让我们一起探索数学的奥秘吧！',
        '数学世界很精彩，有什么想学的吗？'
      ],
      concepts: {
        '加法': '加法是数学中最基础的运算之一。比如 2 + 3 = 5，这表示把2个物体和3个物体放在一起，总共有5个物体。',
        '减法': '减法是加法的逆运算。比如 5 - 2 = 3，表示从5个物体中拿走2个，还剩3个。',
        '乘法': '乘法是重复加法的简便写法。比如 3 × 4 = 12，相当于 3 + 3 + 3 + 3 = 12。',
        '除法': '除法是乘法的逆运算。比如 12 ÷ 3 = 4，表示把12个物体平均分成3组，每组有4个。'
      },
      problems: [
        { question: '计算：25 + 37 = ?', answer: '62', explanation: '25 + 37 = 62，可以先算 25 + 30 = 55，再加 7 得到 62。' },
        { question: '计算：8 × 9 = ?', answer: '72', explanation: '8 × 9 = 72，可以记住乘法口诀：八九七十二。' },
        { question: '计算：84 ÷ 12 = ?', answer: '7', explanation: '84 ÷ 12 = 7，因为 12 × 7 = 84。' }
      ]
    },
    '语文': {
      greetings: [
        '你好！我是你的语文AI老师，让我们一起品味文字的魅力吧！',
        '欢迎来到语文课堂！有什么语文问题需要探讨吗？',
        '语文是一门美丽的学科，有什么想了解的吗？'
      ],
      concepts: {
        '古诗': '古诗是中华文化的瑰宝，通过简洁的文字表达深刻的情感和哲理。',
        '作文': '作文是表达思想和情感的重要方式，要做到言之有物、言之有序、言之有情。',
        '阅读理解': '阅读理解需要仔细阅读文章，理解作者的意图，把握文章的主旨和细节。'
      },
      problems: [
        { question: '"春眠不觉晓"的下一句是什么？', answer: '处处闻啼鸟', explanation: '这是孟浩然的《春晓》，描写春天早晨的美好景象。' },
        { question: '"床前明月光"的作者是谁？', answer: '李白', explanation: '这是李白的《静夜思》，表达了诗人对故乡的思念之情。' }
      ]
    },
    '英语': {
      greetings: [
        'Hello! I\'m your English AI teacher. How can I help you today?',
        'Welcome to English class! What would you like to learn?',
        '你好！我是你的英语AI老师，有什么英语问题需要帮助吗？'
      ],
      concepts: {
        '语法': 'Grammar is the system of rules that governs how words are combined to form sentences.',
        '词汇': 'Vocabulary is the collection of words that you know and use in a language.',
        '发音': 'Pronunciation is how words are spoken and sounds are made in a language.'
      },
      problems: [
        { question: 'What is the past tense of "go"?', answer: 'went', explanation: '"Go" is an irregular verb, its past tense is "went", not "goed".' },
        { question: 'How do you say "你好" in English?', answer: 'Hello', explanation: '"Hello" is the most common greeting in English.' }
      ]
    }
  }

  const subjectData = responses[subject] || responses['数学']
  
  // 简单的关键词匹配
  const lowerMessage = message.toLowerCase()
  
  if (lowerMessage.includes('你好') || lowerMessage.includes('hello') || lowerMessage.includes('hi')) {
    return subjectData.greetings[Math.floor(Math.random() * subjectData.greetings.length)]
  }
  
  // 检查是否询问概念
  for (const [concept, explanation] of Object.entries(subjectData.concepts)) {
    if (lowerMessage.includes(concept.toLowerCase())) {
      return explanation
    }
  }
  
  // 检查是否需要练习题
  if (lowerMessage.includes('练习') || lowerMessage.includes('题目') || lowerMessage.includes('问题')) {
    const problem = subjectData.problems[Math.floor(Math.random() * subjectData.problems.length)]
    return `来做一道练习题吧：${problem.question}`
  }
  
  // 默认回复
  const defaultResponses = [
    '这是一个很好的问题！让我来为你详细解答。',
    '我理解你的疑问，让我们一步步来分析这个问题。',
    '很高兴你能主动提问！这说明你在认真思考。',
    '这个问题很有意思，让我们一起探讨一下。'
  ]
  
  return defaultResponses[Math.floor(Math.random() * defaultResponses.length)]
}

// 发送消息给AI老师
router.post('/chat', authenticateToken, (req, res) => {
  try {
    const { message, subject = '数学', context = [] } = req.body
    
    if (!message || message.trim() === '') {
      return res.status(400).json({ error: '消息不能为空' })
    }
    
    // 生成AI回复
    const aiResponse = generateAIResponse(message, subject, context)
    
    const db = getDB()
    
    // 保存对话记录
    db.run(
      `INSERT INTO study_records (user_id, subject, type, content, duration) 
       VALUES (?, ?, ?, ?, ?)`,
      [
        req.user.userId,
        subject,
        'tutor',
        `用户：${message}\nAI：${aiResponse}`,
        30 // 假设对话用时30秒
      ],
      function(err) {
        if (err) {
          console.error('保存对话记录失败:', err)
        }
      }
    )
    
    // 奖励积分（每次对话2积分）
    db.run(
      'UPDATE users SET points = points + 2, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [req.user.userId]
    )
    
    db.run(
      'INSERT INTO point_records (user_id, type, amount, reason) VALUES (?, ?, ?, ?)',
      [req.user.userId, 'earn', 2, 'AI对话']
    )
    
    res.json({
      message: 'success',
      response: aiResponse,
      earnedPoints: 2
    })
  } catch (error) {
    console.error('AI对话错误:', error)
    res.status(500).json({ error: '对话失败' })
  }
})

// 获取知识点列表
router.get('/knowledge/:subject', authenticateToken, (req, res) => {
  const { subject } = req.params
  
  const knowledgeBase = {
    '数学': {
      '基础运算': {
        title: '基础运算',
        description: '加减乘除四则运算',
        topics: [
          { name: '加法运算', difficulty: '简单', content: '学习加法的基本概念和计算方法' },
          { name: '减法运算', difficulty: '简单', content: '学习减法的基本概念和计算方法' },
          { name: '乘法运算', difficulty: '中等', content: '学习乘法口诀和计算技巧' },
          { name: '除法运算', difficulty: '中等', content: '学习除法的概念和计算方法' }
        ]
      },
      '几何图形': {
        title: '几何图形',
        description: '平面和立体几何基础',
        topics: [
          { name: '三角形', difficulty: '中等', content: '三角形的性质和面积计算' },
          { name: '四边形', difficulty: '中等', content: '正方形、长方形、平行四边形等' },
          { name: '圆形', difficulty: '困难', content: '圆的周长和面积计算' }
        ]
      }
    },
    '语文': {
      '古诗词': {
        title: '古诗词',
        description: '中华古典诗词鉴赏',
        topics: [
          { name: '唐诗', difficulty: '中等', content: '学习唐代经典诗歌' },
          { name: '宋词', difficulty: '困难', content: '欣赏宋代词作名篇' },
          { name: '古文', difficulty: '困难', content: '阅读古代散文作品' }
        ]
      },
      '现代文': {
        title: '现代文',
        description: '现代文学作品阅读',
        topics: [
          { name: '记叙文', difficulty: '简单', content: '学习记叙文的写作技巧' },
          { name: '说明文', difficulty: '中等', content: '掌握说明文的结构特点' },
          { name: '议论文', difficulty: '困难', content: '学习议论文的论证方法' }
        ]
      }
    },
    '英语': {
      '基础语法': {
        title: '基础语法',
        description: '英语语法基础知识',
        topics: [
          { name: '名词', difficulty: '简单', content: '学习名词的分类和用法' },
          { name: '动词', difficulty: '中等', content: '掌握动词时态和语态' },
          { name: '形容词', difficulty: '简单', content: '学习形容词的比较级和最高级' }
        ]
      },
      '日常对话': {
        title: '日常对话',
        description: '实用英语口语表达',
        topics: [
          { name: '问候语', difficulty: '简单', content: '学习基本的问候和介绍' },
          { name: '购物对话', difficulty: '中等', content: '掌握购物场景的英语表达' },
          { name: '旅游英语', difficulty: '中等', content: '学习旅游相关的英语词汇' }
        ]
      }
    }
  }
  
  const subjectKnowledge = knowledgeBase[subject]
  if (!subjectKnowledge) {
    return res.status(404).json({ error: '科目不存在' })
  }
  
  res.json(subjectKnowledge)
})

// 获取具体知识点详情
router.get('/knowledge/:subject/:topic', authenticateToken, (req, res) => {
  const { subject, topic } = req.params
  
  // 这里应该从数据库或知识库中获取详细内容
  // 现在返回模拟数据
  const topicDetail = {
    title: topic,
    subject: subject,
    content: `这里是关于${topic}的详细讲解内容...`,
    examples: [
      { title: '例题1', content: '这是一个关于' + topic + '的例题' },
      { title: '例题2', content: '这是另一个关于' + topic + '的例题' }
    ],
    exercises: [
      { question: '练习题1：关于' + topic, answer: '答案1' },
      { question: '练习题2：关于' + topic, answer: '答案2' }
    ],
    relatedTopics: ['相关知识点1', '相关知识点2']
  }
  
  res.json(topicDetail)
})

// 获取对话历史
router.get('/chat/history', authenticateToken, (req, res) => {
  const { page = 1, limit = 20, subject } = req.query
  const offset = (page - 1) * limit
  const db = getDB()
  
  let query = `SELECT subject, content, created_at 
               FROM study_records 
               WHERE user_id = ? AND type = 'tutor'`
  let params = [req.user.userId]
  
  if (subject) {
    query += ' AND subject = ?'
    params.push(subject)
  }
  
  query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?'
  params.push(limit, offset)
  
  db.all(query, params, (err, records) => {
    if (err) {
      console.error('查询对话历史失败:', err)
      return res.status(500).json({ error: '获取对话历史失败' })
    }

    const conversations = records.map(record => {
      const messages = record.content.split('\n')
      return {
        subject: record.subject,
        messages: messages.map(msg => {
          const [role, content] = msg.split('：')
          return { role, content }
        }),
        createdAt: record.created_at
      }
    })

    res.json({
      conversations,
      page: parseInt(page),
      limit: parseInt(limit)
    })
  })
})

module.exports = router
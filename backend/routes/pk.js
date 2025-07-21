const express = require('express')
const { getDB } = require('../database/init')
const authRoutes = require('./auth')
const { authenticateToken } = authRoutes

const router = express.Router()

// 题库数据
const questionBank = {
  '数学': {
    '简单': [
      { question: '2 + 3 = ?', options: ['4', '5', '6', '7'], answer: 1, explanation: '2 + 3 = 5' },
      { question: '8 - 5 = ?', options: ['2', '3', '4', '5'], answer: 1, explanation: '8 - 5 = 3' },
      { question: '4 × 2 = ?', options: ['6', '7', '8', '9'], answer: 2, explanation: '4 × 2 = 8' },
      { question: '10 ÷ 2 = ?', options: ['4', '5', '6', '7'], answer: 1, explanation: '10 ÷ 2 = 5' },
      { question: '7 + 6 = ?', options: ['12', '13', '14', '15'], answer: 1, explanation: '7 + 6 = 13' }
    ],
    '中等': [
      { question: '25 + 37 = ?', options: ['60', '61', '62', '63'], answer: 2, explanation: '25 + 37 = 62' },
      { question: '84 - 29 = ?', options: ['54', '55', '56', '57'], answer: 1, explanation: '84 - 29 = 55' },
      { question: '12 × 8 = ?', options: ['94', '95', '96', '97'], answer: 2, explanation: '12 × 8 = 96' },
      { question: '144 ÷ 12 = ?', options: ['11', '12', '13', '14'], answer: 1, explanation: '144 ÷ 12 = 12' },
      { question: '15² = ?', options: ['220', '225', '230', '235'], answer: 1, explanation: '15² = 15 × 15 = 225' }
    ],
    '困难': [
      { question: '√64 = ?', options: ['6', '7', '8', '9'], answer: 2, explanation: '√64 = 8，因为 8² = 64' },
      { question: '2³ + 3² = ?', options: ['15', '16', '17', '18'], answer: 2, explanation: '2³ + 3² = 8 + 9 = 17' },
      { question: '(x + 3)(x - 2) = x² + ax - 6，求a', options: ['0', '1', '2', '3'], answer: 1, explanation: '展开得 x² + x - 6，所以 a = 1' }
    ]
  },
  '语文': {
    '简单': [
      { question: '"春眠不觉晓"的下一句是？', options: ['处处闻啼鸟', '夜来风雨声', '花落知多少', '疑是地上霜'], answer: 0, explanation: '这是孟浩然《春晓》中的诗句' },
      { question: '"床前明月光"的作者是？', options: ['杜甫', '李白', '白居易', '王维'], answer: 1, explanation: '这是李白的《静夜思》' },
      { question: '"红豆生南国"的下一句是？', options: ['春来发几枝', '秋来发几枝', '夏来发几枝', '冬来发几枝'], answer: 0, explanation: '这是王维《相思》中的诗句' }
    ],
    '中等': [
      { question: '《三国演义》的作者是？', options: ['吴承恩', '施耐庵', '罗贯中', '曹雪芹'], answer: 2, explanation: '《三国演义》是罗贯中所著' },
      { question: '"山重水复疑无路"的下一句是？', options: ['柳暗花明又一村', '柳暗花明见一村', '柳绿花红又一村', '柳暗花明有一村'], answer: 0, explanation: '这是陆游《游山西村》中的名句' }
    ],
    '困难': [
      { question: '"庄生晓梦迷蝴蝶"出自哪首诗？', options: ['《锦瑟》', '《无题》', '《春雨》', '《夜雨寄北》'], answer: 0, explanation: '出自李商隐的《锦瑟》' }
    ]
  },
  '英语': {
    '简单': [
      { question: 'What is your name?', options: ['My name is Tom', 'I am Tom', 'This is Tom', 'Call me Tom'], answer: 0, explanation: '询问姓名的标准回答' },
      { question: 'How old are you?', options: ['I have 12 years', 'I am 12 years old', 'I am 12 years', 'My age is 12'], answer: 1, explanation: '询问年龄的正确表达' },
      { question: 'What color is the sky?', options: ['Red', 'Blue', 'Green', 'Yellow'], answer: 1, explanation: 'The sky is blue' }
    ],
    '中等': [
      { question: 'Choose the correct past tense of "go"', options: ['goed', 'went', 'gone', 'going'], answer: 1, explanation: '"go"的过去式是"went"' },
      { question: 'Which is correct?', options: ['He don\'t like it', 'He doesn\'t like it', 'He not like it', 'He no like it'], answer: 1, explanation: '第三人称单数否定形式用doesn\'t' }
    ],
    '困难': [
      { question: 'Choose the correct form: "If I ___ you, I would study harder."', options: ['am', 'was', 'were', 'be'], answer: 2, explanation: '虚拟语气中，be动词用were' }
    ]
  }
}

// 生成试卷
const generateQuestions = (subject, difficulty, count) => {
  const questions = questionBank[subject]?.[difficulty] || []
  if (questions.length === 0) {
    throw new Error('该科目或难度的题目不存在')
  }
  
  // 随机选择题目
  const selectedQuestions = []
  const usedIndexes = new Set()
  
  while (selectedQuestions.length < count && selectedQuestions.length < questions.length) {
    const randomIndex = Math.floor(Math.random() * questions.length)
    if (!usedIndexes.has(randomIndex)) {
      usedIndexes.add(randomIndex)
      selectedQuestions.push({
        ...questions[randomIndex],
        id: selectedQuestions.length + 1
      })
    }
  }
  
  return selectedQuestions
}

// 模拟AI答题
const simulateAIAnswers = (questions, difficulty) => {
  const aiAnswers = []
  let correctRate = 0.7 // 基础正确率
  
  // 根据难度调整AI正确率
  switch (difficulty) {
    case '简单':
      correctRate = 0.9
      break
    case '中等':
      correctRate = 0.75
      break
    case '困难':
      correctRate = 0.6
      break
  }
  
  questions.forEach((question, index) => {
    const isCorrect = Math.random() < correctRate
    let selectedAnswer
    
    if (isCorrect) {
      selectedAnswer = question.answer
    } else {
      // 随机选择错误答案
      do {
        selectedAnswer = Math.floor(Math.random() * question.options.length)
      } while (selectedAnswer === question.answer)
    }
    
    aiAnswers.push({
      questionId: question.id,
      answer: selectedAnswer,
      isCorrect
    })
  })
  
  return aiAnswers
}

// 开始PK挑战
router.post('/start', authenticateToken, (req, res) => {
  try {
    const { mode, subject, difficulty, questionCount = 10 } = req.body
    
    if (!subject || !difficulty) {
      return res.status(400).json({ error: '请选择科目和难度' })
    }
    
    if (questionCount < 5 || questionCount > 20) {
      return res.status(400).json({ error: '题目数量应在5-20之间' })
    }
    
    // 生成题目
    const questions = generateQuestions(subject, difficulty, questionCount)
    
    if (questions.length === 0) {
      return res.status(400).json({ error: '没有找到合适的题目' })
    }
    
    // 生成AI答案（但不返回给前端）
    const aiAnswers = simulateAIAnswers(questions, difficulty)
    
    const db = getDB()
    
    // 创建PK记录
    db.run(
      `INSERT INTO pk_records (user_id, mode, subject, difficulty, question_count, questions) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        req.user.userId,
        mode,
        subject,
        difficulty,
        questions.length,
        JSON.stringify({ questions, aiAnswers })
      ],
      function(err) {
        if (err) {
          console.error('创建PK记录失败:', err)
          return res.status(500).json({ error: '创建挑战失败' })
        }

        res.json({
          message: 'PK挑战开始',
          pkId: this.lastID,
          questions: questions.map(q => ({
            id: q.id,
            question: q.question,
            options: q.options
          })), // 不返回答案
          timeLimit: questions.length * 60, // 每题1分钟
          aiProgress: 0 // AI初始进度
        })
      }
    )
  } catch (error) {
    console.error('开始PK挑战错误:', error)
    res.status(500).json({ error: error.message || '创建挑战失败' })
  }
})

// 提交答案
router.post('/submit/:pkId', authenticateToken, (req, res) => {
  try {
    const { pkId } = req.params
    const { answers, duration } = req.body
    
    if (!answers || !Array.isArray(answers)) {
      return res.status(400).json({ error: '答案格式错误' })
    }
    
    const db = getDB()
    
    // 获取PK记录
    db.get(
      'SELECT * FROM pk_records WHERE id = ? AND user_id = ?',
      [pkId, req.user.userId],
      (err, record) => {
        if (err) {
          console.error('查询PK记录失败:', err)
          return res.status(500).json({ error: '查询记录失败' })
        }

        if (!record) {
          return res.status(404).json({ error: 'PK记录不存在' })
        }

        const { questions, aiAnswers } = JSON.parse(record.questions)
        
        // 计算用户得分
        let userScore = 0
        const userResults = answers.map(userAnswer => {
          const question = questions.find(q => q.id === userAnswer.questionId)
          if (!question) return { ...userAnswer, isCorrect: false }
          
          const isCorrect = userAnswer.answer === question.answer
          if (isCorrect) userScore += 10
          
          return {
            ...userAnswer,
            isCorrect,
            correctAnswer: question.answer,
            explanation: question.explanation
          }
        })
        
        // 计算AI得分
        const aiScore = aiAnswers.filter(a => a.isCorrect).length * 10
        
        // 确定结果
        let result
        if (userScore > aiScore) {
          result = 'win'
        } else if (userScore < aiScore) {
          result = 'lose'
        } else {
          result = 'draw'
        }
        
        // 计算奖励积分
        let earnedPoints = 0
        switch (result) {
          case 'win':
            earnedPoints = 50
            break
          case 'draw':
            earnedPoints = 30
            break
          case 'lose':
            earnedPoints = 20
            break
        }
        
        // 根据难度调整奖励
        switch (record.difficulty) {
          case '中等':
            earnedPoints = Math.floor(earnedPoints * 1.2)
            break
          case '困难':
            earnedPoints = Math.floor(earnedPoints * 1.5)
            break
        }
        
        db.serialize(() => {
          db.run('BEGIN TRANSACTION')
          
          // 更新PK记录
          db.run(
            `UPDATE pk_records SET 
             user_score = ?, ai_score = ?, result = ?, duration = ?, 
             questions = ?, updated_at = CURRENT_TIMESTAMP 
             WHERE id = ?`,
            [
              userScore,
              aiScore,
              result,
              duration,
              JSON.stringify({ questions, aiAnswers, userResults }),
              pkId
            ]
          )
          
          // 更新用户统计
          const winIncrement = result === 'win' ? 1 : 0
          const loseIncrement = result === 'lose' ? 1 : 0
          
          db.run(
            `UPDATE users SET 
             points = points + ?, 
             pk_wins = pk_wins + ?, 
             pk_losses = pk_losses + ?, 
             updated_at = CURRENT_TIMESTAMP 
             WHERE id = ?`,
            [earnedPoints, winIncrement, loseIncrement, req.user.userId]
          )
          
          // 记录学习记录
          db.run(
            `INSERT INTO study_records (user_id, subject, type, content, score, duration) 
             VALUES (?, ?, ?, ?, ?, ?)`,
            [
              req.user.userId,
              record.subject,
              'pk',
              `PK挑战-${record.difficulty}`,
              userScore,
              duration
            ]
          )
          
          // 记录积分变动
          db.run(
            'INSERT INTO point_records (user_id, type, amount, reason, related_id) VALUES (?, ?, ?, ?, ?)',
            [req.user.userId, 'earn', earnedPoints, `PK挑战${result === 'win' ? '胜利' : result === 'draw' ? '平局' : '参与'}`, pkId]
          )
          
          db.run('COMMIT', (err) => {
            if (err) {
              console.error('提交PK结果失败:', err)
              db.run('ROLLBACK')
              return res.status(500).json({ error: '提交失败' })
            }

            res.json({
              message: 'PK挑战完成',
              result: {
                userScore,
                aiScore,
                result,
                earnedPoints,
                userResults,
                aiResults: aiAnswers.map(a => ({
                  questionId: a.questionId,
                  answer: a.answer,
                  isCorrect: a.isCorrect
                })),
                duration
              }
            })
          })
        })
      }
    )
  } catch (error) {
    console.error('提交PK答案错误:', error)
    res.status(500).json({ error: '提交失败' })
  }
})

// 获取PK历史记录
router.get('/history', authenticateToken, (req, res) => {
  const { page = 1, limit = 10, subject } = req.query
  const offset = (page - 1) * limit
  const db = getDB()
  
  let query = `SELECT id, mode, subject, difficulty, question_count, user_score, ai_score, result, duration, created_at 
               FROM pk_records 
               WHERE user_id = ?`
  let params = [req.user.userId]
  
  if (subject) {
    query += ' AND subject = ?'
    params.push(subject)
  }
  
  query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?'
  params.push(limit, offset)
  
  db.all(query, params, (err, records) => {
    if (err) {
      console.error('查询PK历史失败:', err)
      return res.status(500).json({ error: '获取历史记录失败' })
    }

    res.json({
      records: records.map(record => ({
        id: record.id,
        mode: record.mode,
        subject: record.subject,
        difficulty: record.difficulty,
        questionCount: record.question_count,
        userScore: record.user_score,
        aiScore: record.ai_score,
        result: record.result,
        duration: record.duration,
        createdAt: record.created_at
      })),
      page: parseInt(page),
      limit: parseInt(limit)
    })
  })
})

// 获取排行榜
router.get('/leaderboard', authenticateToken, (req, res) => {
  const { subject, period = 'all' } = req.query
  const db = getDB()
  
  let query = `SELECT u.id, u.nickname, u.avatar, 
                      COUNT(p.id) as total_games,
                      SUM(CASE WHEN p.result = 'win' THEN 1 ELSE 0 END) as wins,
                      SUM(CASE WHEN p.result = 'lose' THEN 1 ELSE 0 END) as losses,
                      AVG(p.user_score) as avg_score,
                      MAX(p.user_score) as best_score
               FROM users u 
               LEFT JOIN pk_records p ON u.id = p.user_id`
  
  let params = []
  let whereConditions = []
  
  if (subject) {
    whereConditions.push('p.subject = ?')
    params.push(subject)
  }
  
  if (period === 'week') {
    whereConditions.push('p.created_at >= datetime(\'now\', \'-7 days\')')
  } else if (period === 'month') {
    whereConditions.push('p.created_at >= datetime(\'now\', \'-30 days\')')
  }
  
  if (whereConditions.length > 0) {
    query += ' WHERE ' + whereConditions.join(' AND ')
  }
  
  query += ` GROUP BY u.id 
             HAVING total_games > 0 
             ORDER BY wins DESC, avg_score DESC 
             LIMIT 50`
  
  db.all(query, params, (err, records) => {
    if (err) {
      console.error('查询排行榜失败:', err)
      return res.status(500).json({ error: '获取排行榜失败' })
    }

    const leaderboard = records.map((record, index) => ({
      rank: index + 1,
      userId: record.id,
      nickname: record.nickname,
      avatar: record.avatar,
      totalGames: record.total_games,
      wins: record.wins,
      losses: record.losses,
      winRate: record.total_games > 0 ? Math.round((record.wins / record.total_games) * 100) : 0,
      avgScore: Math.round(record.avg_score || 0),
      bestScore: record.best_score || 0
    }))

    res.json({ leaderboard })
  })
})

// 获取PK详情
router.get('/detail/:pkId', authenticateToken, (req, res) => {
  const { pkId } = req.params
  const db = getDB()
  
  db.get(
    'SELECT * FROM pk_records WHERE id = ? AND user_id = ?',
    [pkId, req.user.userId],
    (err, record) => {
      if (err) {
        console.error('查询PK详情失败:', err)
        return res.status(500).json({ error: '获取详情失败' })
      }

      if (!record) {
        return res.status(404).json({ error: 'PK记录不存在' })
      }

      const questionData = JSON.parse(record.questions || '{}')
      
      res.json({
        id: record.id,
        mode: record.mode,
        subject: record.subject,
        difficulty: record.difficulty,
        questionCount: record.question_count,
        userScore: record.user_score,
        aiScore: record.ai_score,
        result: record.result,
        duration: record.duration,
        questions: questionData.questions || [],
        userResults: questionData.userResults || [],
        aiResults: questionData.aiAnswers || [],
        createdAt: record.created_at
      })
    }
  )
})

module.exports = router
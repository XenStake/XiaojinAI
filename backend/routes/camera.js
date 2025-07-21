const express = require('express')
const multer = require('multer')
const path = require('path')
const fs = require('fs')
const sharp = require('sharp')
const { getDB } = require('../database/init')
const authRoutes = require('./auth')
const { authenticateToken } = authRoutes

const router = express.Router()

// 配置图片上传
const imageStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '../uploads/camera')
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true })
    }
    cb(null, uploadPath)
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname)
    cb(null, `camera_${req.user.userId}_${Date.now()}${ext}`)
  }
})

const uploadImage = multer({
  storage: imageStorage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png/
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase())
    const mimetype = allowedTypes.test(file.mimetype)
    
    if (mimetype && extname) {
      return cb(null, true)
    } else {
      cb(new Error('只允许上传JPG、PNG格式的图片'))
    }
  }
})

// 模拟AI批改功能
const simulateAICheck = (subject, checkType, imagePath) => {
  // 这里应该调用真实的AI服务，现在用模拟数据
  const subjects = {
    '数学': {
      problems: [
        { question: '2 + 3 = ?', answer: '5', userAnswer: '5', correct: true },
        { question: '8 × 7 = ?', answer: '56', userAnswer: '54', correct: false },
        { question: '15 ÷ 3 = ?', answer: '5', userAnswer: '5', correct: true }
      ],
      suggestions: [
        '乘法运算需要多加练习，建议使用乘法口诀表',
        '计算时要仔细，避免粗心错误',
        '可以通过做更多练习题来提高计算速度'
      ]
    },
    '语文': {
      problems: [
        { question: '"春眠不觉晓"的下一句是？', answer: '处处闻啼鸟', userAnswer: '处处闻啼鸟', correct: true },
        { question: '"床前明月光"的作者是？', answer: '李白', userAnswer: '杜甫', correct: false }
      ],
      suggestions: [
        '古诗词背诵需要加强，建议每天背诵一首',
        '注意区分不同诗人的作品特点',
        '可以通过阅读诗词故事来加深理解'
      ]
    },
    '英语': {
      problems: [
        { question: 'What is your name?', answer: 'My name is...', userAnswer: 'My name is Tom', correct: true },
        { question: 'How old are you?', answer: 'I am ... years old', userAnswer: 'I have 12 years', correct: false }
      ],
      suggestions: [
        '英语句型结构需要加强练习',
        '注意动词的正确使用',
        '建议多做口语练习，提高表达能力'
      ]
    }
  }

  const subjectData = subjects[subject] || subjects['数学']
  const correctCount = subjectData.problems.filter(p => p.correct).length
  const totalCount = subjectData.problems.length
  const score = Math.round((correctCount / totalCount) * 100)

  return {
    problems: subjectData.problems,
    correctCount,
    totalCount,
    score,
    suggestions: subjectData.suggestions,
    analysis: {
      strengths: correctCount > totalCount / 2 ? ['基础知识掌握较好', '答题思路清晰'] : ['学习态度认真'],
      weaknesses: correctCount < totalCount / 2 ? ['基础知识需要加强', '计算准确性有待提高'] : ['细心程度需要提升'],
      recommendations: [
        '建议每天练习30分钟',
        '重点复习错题',
        '寻求老师或同学的帮助'
      ]
    }
  }
}

// 上传并检查图片
router.post('/check', authenticateToken, uploadImage.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: '请上传图片' })
    }

    const { subject, checkType = 'homework' } = req.body
    
    if (!subject) {
      return res.status(400).json({ error: '请选择科目' })
    }

    const imagePath = `/uploads/camera/${req.file.filename}`
    
    // 压缩图片
    const compressedPath = path.join(__dirname, '../uploads/camera', `compressed_${req.file.filename}`)
    await sharp(req.file.path)
      .resize(800, 600, { fit: 'inside', withoutEnlargement: true })
      .jpeg({ quality: 80 })
      .toFile(compressedPath)

    // 模拟AI检查
    const checkResult = simulateAICheck(subject, checkType, imagePath)
    
    const db = getDB()
    
    db.serialize(() => {
      db.run('BEGIN TRANSACTION')
      
      // 保存检查记录
      db.run(
        `INSERT INTO camera_records (user_id, image_path, subject, check_type, result, suggestions, score) 
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          req.user.userId,
          imagePath,
          subject,
          checkType,
          JSON.stringify(checkResult),
          JSON.stringify(checkResult.suggestions),
          checkResult.score
        ],
        function(err) {
          if (err) {
            console.error('保存检查记录失败:', err)
            db.run('ROLLBACK')
            return res.status(500).json({ error: '保存记录失败' })
          }

          const recordId = this.lastID
          
          // 保存学习记录
          db.run(
            `INSERT INTO study_records (user_id, subject, type, content, score, duration) 
             VALUES (?, ?, ?, ?, ?, ?)`,
            [
              req.user.userId,
              subject,
              'camera',
              `${checkType}检查`,
              checkResult.score,
              60 // 假设检查用时1分钟
            ]
          )
          
          // 计算奖励积分
          let earnedPoints = 0
          if (checkResult.score >= 90) {
            earnedPoints = 20
          } else if (checkResult.score >= 80) {
            earnedPoints = 15
          } else if (checkResult.score >= 70) {
            earnedPoints = 10
          } else {
            earnedPoints = 5
          }
          
          // 更新用户积分
          db.run(
            'UPDATE users SET points = points + ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
            [earnedPoints, req.user.userId]
          )
          
          // 记录积分变动
          db.run(
            'INSERT INTO point_records (user_id, type, amount, reason, related_id) VALUES (?, ?, ?, ?, ?)',
            [req.user.userId, 'earn', earnedPoints, '拍照检查', recordId]
          )
          
          db.run('COMMIT', (err) => {
            if (err) {
              console.error('事务提交失败:', err)
              db.run('ROLLBACK')
              return res.status(500).json({ error: '保存失败' })
            }

            res.json({
              message: '检查完成',
              recordId,
              result: checkResult,
              earnedPoints,
              imagePath
            })
          })
        }
      )
    })
  } catch (error) {
    console.error('图片检查错误:', error)
    res.status(500).json({ error: '检查失败' })
  }
})

// 获取检查历史
router.get('/history', authenticateToken, (req, res) => {
  const { page = 1, limit = 10, subject } = req.query
  const offset = (page - 1) * limit
  const db = getDB()
  
  let query = `SELECT id, image_path, subject, check_type, result, score, created_at 
               FROM camera_records 
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
      console.error('查询检查历史失败:', err)
      return res.status(500).json({ error: '获取历史记录失败' })
    }

    const formattedRecords = records.map(record => ({
      id: record.id,
      imagePath: record.image_path,
      subject: record.subject,
      checkType: record.check_type,
      result: JSON.parse(record.result || '{}'),
      score: record.score,
      createdAt: record.created_at
    }))

    res.json({
      records: formattedRecords,
      page: parseInt(page),
      limit: parseInt(limit)
    })
  })
})

// 获取检查详情
router.get('/record/:id', authenticateToken, (req, res) => {
  const { id } = req.params
  const db = getDB()
  
  db.get(
    `SELECT * FROM camera_records WHERE id = ? AND user_id = ?`,
    [id, req.user.userId],
    (err, record) => {
      if (err) {
        console.error('查询检查记录失败:', err)
        return res.status(500).json({ error: '获取记录失败' })
      }

      if (!record) {
        return res.status(404).json({ error: '记录不存在' })
      }

      res.json({
        id: record.id,
        imagePath: record.image_path,
        subject: record.subject,
        checkType: record.check_type,
        result: JSON.parse(record.result || '{}'),
        suggestions: JSON.parse(record.suggestions || '[]'),
        score: record.score,
        createdAt: record.created_at
      })
    }
  )
})

module.exports = router
const express = require('express')
const multer = require('multer')
const path = require('path')
const fs = require('fs')
const { getDB } = require('../database/init')
const authRoutes = require('./auth')
const { authenticateToken } = authRoutes

const router = express.Router()

// 配置头像上传
const avatarStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '../uploads/avatars')
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true })
    }
    cb(null, uploadPath)
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname)
    cb(null, `avatar_${req.user.userId}_${Date.now()}${ext}`)
  }
})

const uploadAvatar = multer({
  storage: avatarStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif/
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase())
    const mimetype = allowedTypes.test(file.mimetype)
    
    if (mimetype && extname) {
      return cb(null, true)
    } else {
      cb(new Error('只允许上传图片文件'))
    }
  }
})

// 获取用户信息
router.get('/profile', authenticateToken, (req, res) => {
  const db = getDB()
  
  db.get(
    'SELECT * FROM users WHERE id = ?',
    [req.user.userId],
    (err, user) => {
      if (err) {
        console.error('数据库查询错误:', err)
        return res.status(500).json({ error: '服务器错误' })
      }

      if (!user) {
        return res.status(404).json({ error: '用户不存在' })
      }

      res.json({
        id: user.id,
        username: user.username,
        nickname: user.nickname,
        avatar: user.avatar,
        points: user.points,
        level: user.level,
        exp: user.exp,
        totalStudyDays: user.total_study_days,
        continuousDays: user.continuous_days,
        pkWins: user.pk_wins,
        pkLosses: user.pk_losses,
        createdAt: user.created_at
      })
    }
  )
})

// 更新用户信息
router.put('/profile', authenticateToken, (req, res) => {
  const { nickname } = req.body
  const db = getDB()
  
  db.run(
    'UPDATE users SET nickname = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
    [nickname, req.user.userId],
    function(err) {
      if (err) {
        console.error('更新用户信息失败:', err)
        return res.status(500).json({ error: '更新失败' })
      }

      res.json({ message: '用户信息更新成功' })
    }
  )
})

// 上传头像
router.post('/avatar', authenticateToken, uploadAvatar.single('avatar'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: '请选择头像文件' })
  }

  const avatarPath = `/uploads/avatars/${req.file.filename}`
  const db = getDB()
  
  db.run(
    'UPDATE users SET avatar = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
    [avatarPath, req.user.userId],
    function(err) {
      if (err) {
        console.error('头像更新失败:', err)
        return res.status(500).json({ error: '头像更新失败' })
      }

      res.json({
        message: '头像更新成功',
        avatar: avatarPath
      })
    }
  )
})

// 每日签到
router.post('/checkin', authenticateToken, (req, res) => {
  const db = getDB()
  const today = new Date().toISOString().split('T')[0]
  
  // 检查今天是否已签到
  db.get(
    'SELECT id FROM checkin_records WHERE user_id = ? AND date = ?',
    [req.user.userId, today],
    (err, record) => {
      if (err) {
        console.error('签到查询失败:', err)
        return res.status(500).json({ error: '签到失败' })
      }

      if (record) {
        return res.status(400).json({ error: '今天已经签到过了' })
      }

      // 计算签到奖励积分
      const basePoints = 10
      const bonusPoints = Math.floor(Math.random() * 10) + 1 // 1-10随机奖励
      const totalPoints = basePoints + bonusPoints

      db.serialize(() => {
        db.run('BEGIN TRANSACTION')
        
        // 记录签到
        db.run(
          'INSERT INTO checkin_records (user_id, date, points) VALUES (?, ?, ?)',
          [req.user.userId, today, totalPoints]
        )
        
        // 更新用户积分
        db.run(
          'UPDATE users SET points = points + ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
          [totalPoints, req.user.userId]
        )
        
        // 记录积分变动
        db.run(
          'INSERT INTO point_records (user_id, type, amount, reason) VALUES (?, ?, ?, ?)',
          [req.user.userId, 'earn', totalPoints, '每日签到']
        )
        
        db.run('COMMIT', (err) => {
          if (err) {
            console.error('签到失败:', err)
            db.run('ROLLBACK')
            return res.status(500).json({ error: '签到失败' })
          }

          res.json({
            message: '签到成功',
            points: totalPoints,
            bonus: bonusPoints
          })
        })
      })
    }
  )
})

// 获取学习统计
router.get('/stats', authenticateToken, (req, res) => {
  const db = getDB()
  
  // 获取今日学习统计
  const today = new Date().toISOString().split('T')[0]
  
  db.all(
    `SELECT 
       COUNT(*) as total_records,
       SUM(CASE WHEN DATE(created_at) = ? THEN 1 ELSE 0 END) as today_records,
       SUM(CASE WHEN type = 'camera' THEN 1 ELSE 0 END) as camera_count,
       SUM(CASE WHEN type = 'tutor' THEN 1 ELSE 0 END) as tutor_count,
       SUM(CASE WHEN type = 'pk' THEN 1 ELSE 0 END) as pk_count,
       AVG(score) as avg_score,
       SUM(duration) as total_duration
     FROM study_records 
     WHERE user_id = ?`,
    [today, req.user.userId],
    (err, rows) => {
      if (err) {
        console.error('统计查询失败:', err)
        return res.status(500).json({ error: '获取统计失败' })
      }

      const stats = rows[0] || {}
      
      res.json({
        totalRecords: stats.total_records || 0,
        todayRecords: stats.today_records || 0,
        cameraCount: stats.camera_count || 0,
        tutorCount: stats.tutor_count || 0,
        pkCount: stats.pk_count || 0,
        avgScore: Math.round(stats.avg_score || 0),
        totalDuration: stats.total_duration || 0
      })
    }
  )
})

// 获取积分记录
router.get('/points/history', authenticateToken, (req, res) => {
  const { page = 1, limit = 20 } = req.query
  const offset = (page - 1) * limit
  const db = getDB()
  
  db.all(
    `SELECT type, amount, reason, created_at 
     FROM point_records 
     WHERE user_id = ? 
     ORDER BY created_at DESC 
     LIMIT ? OFFSET ?`,
    [req.user.userId, limit, offset],
    (err, records) => {
      if (err) {
        console.error('积分记录查询失败:', err)
        return res.status(500).json({ error: '获取积分记录失败' })
      }

      res.json({
        records: records.map(record => ({
          type: record.type,
          amount: record.amount,
          reason: record.reason,
          createdAt: record.created_at
        })),
        page: parseInt(page),
        limit: parseInt(limit)
      })
    }
  )
})

// 获取学习记录
router.get('/study/history', authenticateToken, (req, res) => {
  const { page = 1, limit = 20, type } = req.query
  const offset = (page - 1) * limit
  const db = getDB()
  
  let query = `SELECT subject, type, content, score, duration, created_at 
               FROM study_records 
               WHERE user_id = ?`
  let params = [req.user.userId]
  
  if (type) {
    query += ' AND type = ?'
    params.push(type)
  }
  
  query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?'
  params.push(limit, offset)
  
  db.all(query, params, (err, records) => {
    if (err) {
      console.error('学习记录查询失败:', err)
      return res.status(500).json({ error: '获取学习记录失败' })
    }

    res.json({
      records: records.map(record => ({
        subject: record.subject,
        type: record.type,
        content: record.content,
        score: record.score,
        duration: record.duration,
        createdAt: record.created_at
      })),
      page: parseInt(page),
      limit: parseInt(limit)
    })
  })
})

module.exports = router
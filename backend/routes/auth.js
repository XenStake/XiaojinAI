const express = require('express')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { getDB } = require('../database/init')

const router = express.Router()
const JWT_SECRET = process.env.JWT_SECRET || 'ai-tutor-secret-key'

// 用户注册
router.post('/register', async (req, res) => {
  try {
    const { username, password, nickname } = req.body

    if (!username || !password) {
      return res.status(400).json({ error: '用户名和密码不能为空' })
    }

    if (password.length < 6) {
      return res.status(400).json({ error: '密码长度不能少于6位' })
    }

    const db = getDB()
    
    // 检查用户名是否已存在
    db.get('SELECT id FROM users WHERE username = ?', [username], async (err, row) => {
      if (err) {
        console.error('数据库查询错误:', err)
        return res.status(500).json({ error: '服务器错误' })
      }

      if (row) {
        return res.status(400).json({ error: '用户名已存在' })
      }

      // 加密密码
      const hashedPassword = await bcrypt.hash(password, 10)
      const displayName = nickname || username

      // 创建用户
      db.run(
        'INSERT INTO users (username, password, nickname) VALUES (?, ?, ?)',
        [username, hashedPassword, displayName],
        function(err) {
          if (err) {
            console.error('用户创建失败:', err)
            return res.status(500).json({ error: '用户创建失败' })
          }

          // 生成JWT token
          const token = jwt.sign(
            { userId: this.lastID, username },
            JWT_SECRET,
            { expiresIn: '7d' }
          )

          res.status(201).json({
            message: '注册成功',
            token,
            user: {
              id: this.lastID,
              username,
              nickname: displayName,
              avatar: '/uploads/avatars/default.png',
              points: 0,
              level: 1,
              exp: 0
            }
          })
        }
      )
    })
  } catch (error) {
    console.error('注册错误:', error)
    res.status(500).json({ error: '服务器错误' })
  }
})

// 用户登录
router.post('/login', (req, res) => {
  try {
    const { username, password } = req.body

    if (!username || !password) {
      return res.status(400).json({ error: '用户名和密码不能为空' })
    }

    const db = getDB()
    
    db.get(
      'SELECT * FROM users WHERE username = ?',
      [username],
      async (err, user) => {
        if (err) {
          console.error('数据库查询错误:', err)
          return res.status(500).json({ error: '服务器错误' })
        }

        if (!user) {
          return res.status(401).json({ error: '用户名或密码错误' })
        }

        // 验证密码
        const isValidPassword = await bcrypt.compare(password, user.password)
        if (!isValidPassword) {
          return res.status(401).json({ error: '用户名或密码错误' })
        }

        // 生成JWT token
        const token = jwt.sign(
          { userId: user.id, username: user.username },
          JWT_SECRET,
          { expiresIn: '7d' }
        )

        // 更新最后登录时间
        db.run(
          'UPDATE users SET updated_at = CURRENT_TIMESTAMP WHERE id = ?',
          [user.id]
        )

        res.json({
          message: '登录成功',
          token,
          user: {
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
            pkLosses: user.pk_losses
          }
        })
      }
    )
  } catch (error) {
    console.error('登录错误:', error)
    res.status(500).json({ error: '服务器错误' })
  }
})

// 验证token中间件
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]

  if (!token) {
    return res.status(401).json({ error: '访问令牌缺失' })
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: '访问令牌无效' })
    }
    req.user = user
    next()
  })
}

// 验证token
router.get('/verify', authenticateToken, (req, res) => {
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
        valid: true,
        user: {
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
          pkLosses: user.pk_losses
        }
      })
    }
  )
})

module.exports = router
module.exports.authenticateToken = authenticateToken
const express = require('express')
const cors = require('cors')
const path = require('path')
const fs = require('fs')
require('dotenv').config()

// 导入路由
const authRoutes = require('./routes/auth')
const userRoutes = require('./routes/user')
const cameraRoutes = require('./routes/camera')
const tutorRoutes = require('./routes/tutor')
const pkRoutes = require('./routes/pk')
const shopRoutes = require('./routes/shop')

// 导入数据库初始化
const { initDatabase } = require('./database/init')

const app = express()
const PORT = process.env.PORT || 3000

// 中间件配置
app.use(cors({
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
  credentials: true
}))

app.use(express.json({ limit: '50mb' }))
app.use(express.urlencoded({ extended: true, limit: '50mb' }))

// 静态文件服务
app.use('/uploads', express.static(path.join(__dirname, 'uploads')))

// 确保上传目录存在
const uploadsDir = path.join(__dirname, 'uploads')
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true })
}

// API路由
app.use('/api/auth', authRoutes)
app.use('/api/user', userRoutes)
app.use('/api/camera', cameraRoutes)
app.use('/api/tutor', tutorRoutes)
app.use('/api/pk', pkRoutes)
app.use('/api/shop', shopRoutes)

// 健康检查
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'AI一对一辅导后端服务运行正常',
    timestamp: new Date().toISOString()
  })
})

// 404处理
app.use('*', (req, res) => {
  res.status(404).json({ 
    error: '接口不存在',
    path: req.originalUrl 
  })
})

// 错误处理中间件
app.use((err, req, res, next) => {
  console.error('服务器错误:', err)
  res.status(500).json({ 
    error: '服务器内部错误',
    message: process.env.NODE_ENV === 'development' ? err.message : '请稍后重试'
  })
})

// 初始化数据库并启动服务器
initDatabase().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 AI一对一辅导后端服务已启动`)
    console.log(`📍 服务地址: http://localhost:${PORT}`)
    console.log(`🔍 健康检查: http://localhost:${PORT}/api/health`)
    console.log(`📁 上传目录: ${uploadsDir}`)
  })
}).catch(err => {
  console.error('数据库初始化失败:', err)
  process.exit(1)
})
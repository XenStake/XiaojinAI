const sqlite3 = require('sqlite3').verbose()
const path = require('path')
const fs = require('fs')

// 数据库文件路径
const dbPath = path.join(__dirname, 'ai_tutor.db')

// 确保数据库目录存在
const dbDir = path.dirname(dbPath)
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true })
}

// 创建数据库连接
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('数据库连接失败:', err.message)
  } else {
    console.log('✅ 数据库连接成功')
  }
})

// 初始化数据库表
const initDatabase = () => {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      // 用户表
      db.run(`
        CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          username TEXT UNIQUE NOT NULL,
          password TEXT NOT NULL,
          nickname TEXT,
          avatar TEXT DEFAULT '/uploads/avatars/default.png',
          points INTEGER DEFAULT 0,
          level INTEGER DEFAULT 1,
          exp INTEGER DEFAULT 0,
          total_study_days INTEGER DEFAULT 0,
          continuous_days INTEGER DEFAULT 0,
          pk_wins INTEGER DEFAULT 0,
          pk_losses INTEGER DEFAULT 0,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `)

      // 学习记录表
      db.run(`
        CREATE TABLE IF NOT EXISTS study_records (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER NOT NULL,
          subject TEXT NOT NULL,
          type TEXT NOT NULL, -- 'camera', 'tutor', 'pk'
          content TEXT,
          score INTEGER,
          duration INTEGER, -- 学习时长(秒)
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users (id)
        )
      `)

      // 拍照检查记录表
      db.run(`
        CREATE TABLE IF NOT EXISTS camera_records (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER NOT NULL,
          image_path TEXT NOT NULL,
          subject TEXT NOT NULL,
          check_type TEXT NOT NULL, -- 'homework', 'test', 'note'
          result TEXT, -- JSON格式的检查结果
          suggestions TEXT, -- 学习建议
          score INTEGER,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users (id)
        )
      `)

      // PK挑战记录表
      db.run(`
        CREATE TABLE IF NOT EXISTS pk_records (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER NOT NULL,
          mode TEXT NOT NULL, -- 'quick', 'custom'
          subject TEXT NOT NULL,
          difficulty TEXT NOT NULL,
          question_count INTEGER NOT NULL,
          user_score INTEGER DEFAULT 0,
          ai_score INTEGER DEFAULT 0,
          result TEXT NOT NULL, -- 'win', 'lose', 'draw'
          questions TEXT, -- JSON格式的题目和答案
          duration INTEGER, -- 答题时长(秒)
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users (id)
        )
      `)

      // 商品表
      db.run(`
        CREATE TABLE IF NOT EXISTS products (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          description TEXT,
          type TEXT NOT NULL, -- 'virtual', 'physical', 'privilege'
          category TEXT NOT NULL,
          price INTEGER NOT NULL, -- 积分价格
          stock INTEGER DEFAULT -1, -- -1表示无限库存
          image TEXT,
          status TEXT DEFAULT 'active', -- 'active', 'inactive'
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `)

      // 兑换记录表
      db.run(`
        CREATE TABLE IF NOT EXISTS exchange_records (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER NOT NULL,
          product_id INTEGER NOT NULL,
          quantity INTEGER DEFAULT 1,
          total_points INTEGER NOT NULL,
          status TEXT DEFAULT 'pending', -- 'pending', 'completed', 'cancelled'
          address TEXT, -- 实物商品收货地址
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users (id),
          FOREIGN KEY (product_id) REFERENCES products (id)
        )
      `)

      // 积分记录表
      db.run(`
        CREATE TABLE IF NOT EXISTS point_records (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER NOT NULL,
          type TEXT NOT NULL, -- 'earn', 'spend'
          amount INTEGER NOT NULL,
          reason TEXT NOT NULL,
          related_id INTEGER, -- 关联的记录ID
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users (id)
        )
      `)

      // 签到记录表
      db.run(`
        CREATE TABLE IF NOT EXISTS checkin_records (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER NOT NULL,
          date DATE NOT NULL,
          points INTEGER DEFAULT 10,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users (id),
          UNIQUE(user_id, date)
        )
      `)

      // 插入默认商品数据
      db.run(`
        INSERT OR IGNORE INTO products (id, name, description, type, category, price, image) VALUES
        (1, '学习笔记本', '精美的学习笔记本，记录你的学习点滴', 'physical', 'stationery', 500, '/uploads/products/notebook.png'),
        (2, '个性头像框', '炫酷的头像装饰框，彰显你的个性', 'virtual', 'decoration', 200, '/uploads/products/avatar_frame.png'),
        (3, '学霸称号', '专属学霸称号，展示你的学习实力', 'virtual', 'title', 1000, '/uploads/products/title.png'),
        (4, 'VIP会员(7天)', '享受VIP专属功能和特权', 'privilege', 'vip', 800, '/uploads/products/vip.png'),
        (5, '错题本', '智能错题整理，助力学习提升', 'virtual', 'tool', 300, '/uploads/products/error_book.png')
      `)

      console.log('✅ 数据库表初始化完成')
      resolve()
    })
  })
}

// 获取数据库连接
const getDB = () => db

module.exports = {
  initDatabase,
  getDB
}
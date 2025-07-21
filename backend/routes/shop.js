const express = require('express')
const { getDB } = require('../database/init')
const authRoutes = require('./auth')
const { authenticateToken } = authRoutes

const router = express.Router()

// 获取商品列表
router.get('/products', authenticateToken, (req, res) => {
  const { category, type, page = 1, limit = 20 } = req.query
  const offset = (page - 1) * limit
  const db = getDB()
  
  let query = 'SELECT * FROM products WHERE status = "active"'
  let params = []
  
  if (category) {
    query += ' AND category = ?'
    params.push(category)
  }
  
  if (type) {
    query += ' AND type = ?'
    params.push(type)
  }
  
  query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?'
  params.push(limit, offset)
  
  db.all(query, params, (err, products) => {
    if (err) {
      console.error('查询商品失败:', err)
      return res.status(500).json({ error: '获取商品列表失败' })
    }

    res.json({
      products: products.map(product => ({
        id: product.id,
        name: product.name,
        description: product.description,
        type: product.type,
        category: product.category,
        price: product.price,
        stock: product.stock,
        image: product.image,
        createdAt: product.created_at
      })),
      page: parseInt(page),
      limit: parseInt(limit)
    })
  })
})

// 获取商品详情
router.get('/products/:id', authenticateToken, (req, res) => {
  const { id } = req.params
  const db = getDB()
  
  db.get(
    'SELECT * FROM products WHERE id = ? AND status = "active"',
    [id],
    (err, product) => {
      if (err) {
        console.error('查询商品详情失败:', err)
        return res.status(500).json({ error: '获取商品详情失败' })
      }

      if (!product) {
        return res.status(404).json({ error: '商品不存在' })
      }

      res.json({
        id: product.id,
        name: product.name,
        description: product.description,
        type: product.type,
        category: product.category,
        price: product.price,
        stock: product.stock,
        image: product.image,
        createdAt: product.created_at
      })
    }
  )
})

// 兑换商品
router.post('/exchange', authenticateToken, (req, res) => {
  try {
    const { productId, quantity = 1, address } = req.body
    
    if (!productId) {
      return res.status(400).json({ error: '请选择要兑换的商品' })
    }
    
    if (quantity < 1) {
      return res.status(400).json({ error: '兑换数量必须大于0' })
    }
    
    const db = getDB()
    
    db.serialize(() => {
      db.run('BEGIN TRANSACTION')
      
      // 获取商品信息
      db.get(
        'SELECT * FROM products WHERE id = ? AND status = "active"',
        [productId],
        (err, product) => {
          if (err) {
            console.error('查询商品失败:', err)
            db.run('ROLLBACK')
            return res.status(500).json({ error: '查询商品失败' })
          }

          if (!product) {
            db.run('ROLLBACK')
            return res.status(404).json({ error: '商品不存在' })
          }

          // 检查库存
          if (product.stock !== -1 && product.stock < quantity) {
            db.run('ROLLBACK')
            return res.status(400).json({ error: '库存不足' })
          }

          const totalPoints = product.price * quantity

          // 获取用户积分
          db.get(
            'SELECT points FROM users WHERE id = ?',
            [req.user.userId],
            (err, user) => {
              if (err) {
                console.error('查询用户积分失败:', err)
                db.run('ROLLBACK')
                return res.status(500).json({ error: '查询用户信息失败' })
              }

              if (!user) {
                db.run('ROLLBACK')
                return res.status(404).json({ error: '用户不存在' })
              }

              // 检查积分是否足够
              if (user.points < totalPoints) {
                db.run('ROLLBACK')
                return res.status(400).json({ 
                  error: '积分不足',
                  required: totalPoints,
                  current: user.points
                })
              }

              // 检查实物商品是否需要地址
              if (product.type === 'physical' && !address) {
                db.run('ROLLBACK')
                return res.status(400).json({ error: '实物商品需要提供收货地址' })
              }

              // 创建兑换记录
              db.run(
                `INSERT INTO exchange_records (user_id, product_id, quantity, total_points, address) 
                 VALUES (?, ?, ?, ?, ?)`,
                [req.user.userId, productId, quantity, totalPoints, address],
                function(err) {
                  if (err) {
                    console.error('创建兑换记录失败:', err)
                    db.run('ROLLBACK')
                    return res.status(500).json({ error: '兑换失败' })
                  }

                  const exchangeId = this.lastID

                  // 扣除用户积分
                  db.run(
                    'UPDATE users SET points = points - ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
                    [totalPoints, req.user.userId]
                  )

                  // 更新商品库存
                  if (product.stock !== -1) {
                    db.run(
                      'UPDATE products SET stock = stock - ? WHERE id = ?',
                      [quantity, productId]
                    )
                  }

                  // 记录积分变动
                  db.run(
                    'INSERT INTO point_records (user_id, type, amount, reason, related_id) VALUES (?, ?, ?, ?, ?)',
                    [req.user.userId, 'spend', totalPoints, `兑换商品：${product.name}`, exchangeId]
                  )

                  db.run('COMMIT', (err) => {
                    if (err) {
                      console.error('兑换事务提交失败:', err)
                      db.run('ROLLBACK')
                      return res.status(500).json({ error: '兑换失败' })
                    }

                    res.json({
                      message: '兑换成功',
                      exchangeId,
                      product: {
                        name: product.name,
                        type: product.type,
                        quantity,
                        totalPoints
                      },
                      remainingPoints: user.points - totalPoints
                    })
                  })
                }
              )
            }
          )
        }
      )
    })
  } catch (error) {
    console.error('兑换商品错误:', error)
    res.status(500).json({ error: '兑换失败' })
  }
})

// 获取兑换记录
router.get('/exchanges', authenticateToken, (req, res) => {
  const { page = 1, limit = 20, status } = req.query
  const offset = (page - 1) * limit
  const db = getDB()
  
  let query = `SELECT e.*, p.name as product_name, p.type as product_type, p.image as product_image
               FROM exchange_records e
               JOIN products p ON e.product_id = p.id
               WHERE e.user_id = ?`
  let params = [req.user.userId]
  
  if (status) {
    query += ' AND e.status = ?'
    params.push(status)
  }
  
  query += ' ORDER BY e.created_at DESC LIMIT ? OFFSET ?'
  params.push(limit, offset)
  
  db.all(query, params, (err, records) => {
    if (err) {
      console.error('查询兑换记录失败:', err)
      return res.status(500).json({ error: '获取兑换记录失败' })
    }

    res.json({
      records: records.map(record => ({
        id: record.id,
        productId: record.product_id,
        productName: record.product_name,
        productType: record.product_type,
        productImage: record.product_image,
        quantity: record.quantity,
        totalPoints: record.total_points,
        status: record.status,
        address: record.address,
        createdAt: record.created_at
      })),
      page: parseInt(page),
      limit: parseInt(limit)
    })
  })
})

// 获取兑换详情
router.get('/exchanges/:id', authenticateToken, (req, res) => {
  const { id } = req.params
  const db = getDB()
  
  db.get(
    `SELECT e.*, p.name as product_name, p.description as product_description, 
            p.type as product_type, p.image as product_image
     FROM exchange_records e
     JOIN products p ON e.product_id = p.id
     WHERE e.id = ? AND e.user_id = ?`,
    [id, req.user.userId],
    (err, record) => {
      if (err) {
        console.error('查询兑换详情失败:', err)
        return res.status(500).json({ error: '获取兑换详情失败' })
      }

      if (!record) {
        return res.status(404).json({ error: '兑换记录不存在' })
      }

      res.json({
        id: record.id,
        product: {
          id: record.product_id,
          name: record.product_name,
          description: record.product_description,
          type: record.product_type,
          image: record.product_image
        },
        quantity: record.quantity,
        totalPoints: record.total_points,
        status: record.status,
        address: record.address,
        createdAt: record.created_at
      })
    }
  )
})

// 获取商品分类
router.get('/categories', authenticateToken, (req, res) => {
  const db = getDB()
  
  db.all(
    'SELECT DISTINCT category, type FROM products WHERE status = "active" ORDER BY category',
    [],
    (err, categories) => {
      if (err) {
        console.error('查询商品分类失败:', err)
        return res.status(500).json({ error: '获取分类失败' })
      }

      // 组织分类数据
      const categoryMap = {}
      categories.forEach(item => {
        if (!categoryMap[item.type]) {
          categoryMap[item.type] = []
        }
        if (!categoryMap[item.type].includes(item.category)) {
          categoryMap[item.type].push(item.category)
        }
      })

      res.json({
        categories: {
          virtual: categoryMap.virtual || [],
          physical: categoryMap.physical || [],
          privilege: categoryMap.privilege || []
        }
      })
    }
  )
})

// 获取推荐商品
router.get('/recommendations', authenticateToken, (req, res) => {
  const db = getDB()
  
  // 获取用户积分
  db.get(
    'SELECT points FROM users WHERE id = ?',
    [req.user.userId],
    (err, user) => {
      if (err) {
        console.error('查询用户积分失败:', err)
        return res.status(500).json({ error: '获取推荐失败' })
      }

      const userPoints = user ? user.points : 0
      
      // 推荐用户能够兑换的商品
      db.all(
        `SELECT * FROM products 
         WHERE status = "active" AND price <= ? 
         ORDER BY price DESC 
         LIMIT 6`,
        [userPoints],
        (err, affordableProducts) => {
          if (err) {
            console.error('查询推荐商品失败:', err)
            return res.status(500).json({ error: '获取推荐失败' })
          }

          // 如果能兑换的商品不足6个，补充一些热门商品
          if (affordableProducts.length < 6) {
            db.all(
              `SELECT * FROM products 
               WHERE status = "active" AND id NOT IN (${affordableProducts.map(() => '?').join(',') || 'NULL'})
               ORDER BY created_at DESC 
               LIMIT ?`,
              [...affordableProducts.map(p => p.id), 6 - affordableProducts.length],
              (err, popularProducts) => {
                if (err) {
                  console.error('查询热门商品失败:', err)
                  return res.status(500).json({ error: '获取推荐失败' })
                }

                const recommendations = [...affordableProducts, ...popularProducts]
                
                res.json({
                  recommendations: recommendations.map(product => ({
                    id: product.id,
                    name: product.name,
                    description: product.description,
                    type: product.type,
                    category: product.category,
                    price: product.price,
                    stock: product.stock,
                    image: product.image,
                    affordable: product.price <= userPoints
                  }))
                })
              }
            )
          } else {
            res.json({
              recommendations: affordableProducts.map(product => ({
                id: product.id,
                name: product.name,
                description: product.description,
                type: product.type,
                category: product.category,
                price: product.price,
                stock: product.stock,
                image: product.image,
                affordable: true
              }))
            })
          }
        }
      )
    }
  )
})

// 检查商品兑换条件
router.post('/check-exchange', authenticateToken, (req, res) => {
  const { productId, quantity = 1 } = req.body
  
  if (!productId) {
    return res.status(400).json({ error: '请选择商品' })
  }
  
  const db = getDB()
  
  // 获取商品信息
  db.get(
    'SELECT * FROM products WHERE id = ? AND status = "active"',
    [productId],
    (err, product) => {
      if (err) {
        console.error('查询商品失败:', err)
        return res.status(500).json({ error: '查询商品失败' })
      }

      if (!product) {
        return res.status(404).json({ error: '商品不存在' })
      }

      // 获取用户积分
      db.get(
        'SELECT points FROM users WHERE id = ?',
        [req.user.userId],
        (err, user) => {
          if (err) {
            console.error('查询用户积分失败:', err)
            return res.status(500).json({ error: '查询用户信息失败' })
          }

          const totalPoints = product.price * quantity
          const canExchange = user.points >= totalPoints && 
                             (product.stock === -1 || product.stock >= quantity)

          res.json({
            canExchange,
            product: {
              id: product.id,
              name: product.name,
              price: product.price,
              stock: product.stock,
              type: product.type
            },
            quantity,
            totalPoints,
            userPoints: user.points,
            pointsNeeded: Math.max(0, totalPoints - user.points),
            stockAvailable: product.stock === -1 ? true : product.stock >= quantity
          })
        }
      )
    }
  )
})

module.exports = router
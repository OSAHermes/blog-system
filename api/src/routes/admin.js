const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { query } = require('../db/connection');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

// POST /login - Admin login
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password required' });
    }
    
    const users = await query('SELECT * FROM users WHERE username = ?', [username]);
    if (!users.length) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const user = users[0];
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );
    
    res.json({
      success: true,
      data: { token, user: { id: user.id, username: user.username, role: user.role } }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Middleware
function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

// GET /statistics - Get statistics
router.get('/statistics', authenticate, async (req, res) => {
  try {
    const [articles] = await query('SELECT COUNT(*) as count FROM articles');
    const [categories] = await query('SELECT COUNT(*) as count FROM categories');
    const [tags] = await query('SELECT COUNT(*) as count FROM tags');
    const [views] = await query('SELECT SUM(view_count) as total FROM articles');
    
    res.json({
      success: true,
      data: {
        articles: articles[0].count,
        categories: categories[0].count,
        tags: tags[0].count,
        totalViews: views[0].total || 0
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /settings - Get all settings
router.get('/settings', authenticate, async (req, res) => {
  try {
    const settings = await query('SELECT * FROM site_settings');
    const settingsObj = {};
    settings.forEach(s => {
      settingsObj[s.key] = s.value;
    });
    res.json({ success: true, data: settingsObj });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /settings - Update settings
router.put('/settings', authenticate, async (req, res) => {
  try {
    const settings = req.body;
    for (const [key, value] of Object.entries(settings)) {
      await query(
        'INSERT INTO site_settings (key, value) VALUES (?, ?) ON DUPLICATE KEY UPDATE value = VALUES(value)',
        [key, value]
      );
    }
    res.json({ success: true, message: 'Settings updated' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Articles CRUD
router.get('/articles', authenticate, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;
    
    const [articles] = await query(`
      SELECT a.*, c.name as category_name, u.username as author
      FROM articles a
      LEFT JOIN categories c ON a.category_id = c.id
      LEFT JOIN users u ON a.created_by = u.id
      ORDER BY a.created_at DESC
      LIMIT ? OFFSET ?
    `, [limit, offset]);
    
    const [total] = await query('SELECT COUNT(*) as count FROM articles');
    
    res.json({
      success: true,
      data: articles,
      pagination: { page, limit, total: total[0].count }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/articles', authenticate, async (req, res) => {
  try {
    const { title, slug, summary, content, category_id, tags, status } = req.body;
    
    const result = await query(`
      INSERT INTO articles (title, slug, summary, content, category_id, status, created_by)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [title, slug, summary, content, category_id || null, status || 1, req.user.id]);
    
    const articleId = result.insertId;
    
    // Insert tags
    if (tags && tags.length > 0) {
      for (const tagName of tags) {
        const [tag] = await query('SELECT id FROM tags WHERE name = ?', [tagName]);
        if (tag.length) {
          await query('INSERT INTO article_tags (article_id, tag_id) VALUES (?, ?)', [articleId, tag[0].id]);
        } else {
          const newTag = await query('INSERT INTO tags (name, slug) VALUES (?, ?)', [tagName, tagName.toLowerCase().replace(/\s+/g, '-')]);
          await query('INSERT INTO article_tags (article_id, tag_id) VALUES (?, ?)', [articleId, newTag.insertId]);
        }
      }
    }
    
    res.json({ success: true, data: { id: articleId } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/articles/:id', authenticate, async (req, res) => {
  try {
    const { title, slug, summary, content, category_id, status } = req.body;
    
    await query(`
      UPDATE articles 
      SET title = ?, slug = ?, summary = ?, content = ?, category_id = ?, status = ?
      WHERE id = ?
    `, [title, slug, summary, content, category_id, status, req.params.id]);
    
    res.json({ success: true, message: 'Article updated' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/articles/:id', authenticate, async (req, res) => {
  try {
    await query('DELETE FROM articles WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Article deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Categories CRUD
router.get('/categories', authenticate, async (req, res) => {
  try {
    const categories = await query('SELECT * FROM categories ORDER BY sort_order ASC');
    res.json({ success: true, data: categories });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/categories', authenticate, async (req, res) => {
  try {
    const { name, slug, description, sort_order } = req.body;
    const result = await query(
      'INSERT INTO categories (name, slug, description, sort_order) VALUES (?, ?, ?, ?)',
      [name, slug, description, sort_order || 0]
    );
    res.json({ success: true, data: { id: result.insertId } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/categories/:id', authenticate, async (req, res) => {
  try {
    const { name, slug, description, sort_order } = req.body;
    await query(
      'UPDATE categories SET name = ?, slug = ?, description = ?, sort_order = ? WHERE id = ?',
      [name, slug, description, sort_order, req.params.id]
    );
    res.json({ success: true, message: 'Category updated' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/categories/:id', authenticate, async (req, res) => {
  try {
    const [articles] = await query('SELECT COUNT(*) as count FROM articles WHERE category_id = ?', [req.params.id]);
    if (articles[0].count > 0) {
      return res.status(400).json({ error: 'Cannot delete category with articles' });
    }
    await query('DELETE FROM categories WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Category deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Tags CRUD
router.get('/tags', authenticate, async (req, res) => {
  try {
    const tags = await query('SELECT * FROM tags ORDER BY name ASC');
    res.json({ success: true, data: tags });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/tags', authenticate, async (req, res) => {
  try {
    const { name, slug } = req.body;
    const result = await query('INSERT INTO tags (name, slug) VALUES (?, ?)', [name, slug]);
    res.json({ success: true, data: { id: result.insertId } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/tags/:id', authenticate, async (req, res) => {
  try {
    const { name, slug } = req.body;
    await query('UPDATE tags SET name = ?, slug = ? WHERE id = ?', [name, slug, req.params.id]);
    res.json({ success: true, message: 'Tag updated' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/tags/:id', authenticate, async (req, res) => {
  try {
    await query('DELETE FROM tags WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Tag deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Links CRUD
router.get('/links', authenticate, async (req, res) => {
  try {
    const links = await query('SELECT * FROM links ORDER BY sort_order ASC');
    res.json({ success: true, data: links });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/links', authenticate, async (req, res) => {
  try {
    const { name, url, description, logo, sort_order } = req.body;
    const result = await query(
      'INSERT INTO links (name, url, description, logo, sort_order) VALUES (?, ?, ?, ?, ?)',
      [name, url, description, logo, sort_order || 0]
    );
    res.json({ success: true, data: { id: result.insertId } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/links/:id', authenticate, async (req, res) => {
  try {
    const { name, url, description, logo, sort_order } = req.body;
    await query(
      'UPDATE links SET name = ?, url = ?, description = ?, logo = ?, sort_order = ? WHERE id = ?',
      [name, url, description, logo, sort_order, req.params.id]
    );
    res.json({ success: true, message: 'Link updated' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/links/:id', authenticate, async (req, res) => {
  try {
    await query('DELETE FROM links WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Link deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
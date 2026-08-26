const express = require('express');
const router = express.Router();
const { query } = require('../db/connection');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Auth middleware
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

// GET /settings - Get site settings
router.get('/settings', async (req, res) => {
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

// GET /articles - Get published articles list
router.get('/articles', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    
    const [articles] = await query(`
      SELECT a.*, c.name as category_name, c.slug as category_slug
      FROM articles a
      LEFT JOIN categories c ON a.category_id = c.id
      WHERE a.status = 1
      ORDER BY a.created_at DESC
      LIMIT ? OFFSET ?
    `, [limit, offset]);
    
    const [total] = await query('SELECT COUNT(*) as count FROM articles WHERE status = 1');
    
    res.json({
      success: true,
      data: articles,
      pagination: {
        page,
        limit,
        total: total[0].count,
        totalPages: Math.ceil(total[0].count / limit)
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /articles/:slug - Get article by slug
router.get('/articles/:slug', async (req, res) => {
  try {
    const [article] = await query(`
      SELECT a.*, c.name as category_name, c.slug as category_slug,
             GROUP_CONCAT(t.name SEPARATOR ', ') as tags
      FROM articles a
      LEFT JOIN categories c ON a.category_id = c.id
      LEFT JOIN article_tags at ON a.id = at.article_id
      LEFT JOIN tags t ON at.tag_id = t.id
      WHERE a.slug = ? AND a.status = 1
      GROUP BY a.id
    `, [req.params.slug]);
    
    if (!article) {
      return res.status(404).json({ error: 'Article not found' });
    }
    
    // Increment view count
    await query('UPDATE articles SET view_count = view_count + 1 WHERE id = ?', [article.id]);
    
    res.json({ success: true, data: article });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /categories - Get all categories
router.get('/categories', async (req, res) => {
  try {
    const categories = await query(`
      SELECT c.*, COUNT(a.id) as article_count
      FROM categories c
      LEFT JOIN articles a ON c.id = a.category_id AND a.status = 1
      GROUP BY c.id
      ORDER BY c.sort_order ASC
    `);
    res.json({ success: true, data: categories });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /categories/:id/articles - Get articles by category
router.get('/categories/:id/articles', async (req, res) => {
  try {
    const articles = await query(`
      SELECT a.*, c.name as category_name
      FROM articles a
      LEFT JOIN categories c ON a.category_id = c.id
      WHERE a.category_id = ? AND a.status = 1
      ORDER BY a.created_at DESC
    `, [req.params.id]);
    
    res.json({ success: true, data: articles });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /tags - Get all tags
router.get('/tags', async (req, res) => {
  try {
    const tags = await query(`
      SELECT t.*, COUNT(at.article_id) as article_count
      FROM tags t
      LEFT JOIN article_tags at ON t.id = at.tag_id
      GROUP BY t.id
      ORDER BY t.name ASC
    `);
    res.json({ success: true, data: tags });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /tags/:slug/articles - Get articles by tag
router.get('/tags/:slug/articles', async (req, res) => {
  try {
    const articles = await query(`
      SELECT a.*, c.name as category_name
      FROM articles a
      JOIN article_tags at ON a.id = at.article_id
      JOIN tags t ON at.tag_id = t.id
      LEFT JOIN categories c ON a.category_id = c.id
      WHERE t.slug = ? AND a.status = 1
      ORDER BY a.created_at DESC
    `, [req.params.slug]);
    
    res.json({ success: true, data: articles });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /links - Get all links
router.get('/links', async (req, res) => {
  try {
    const links = await query('SELECT * FROM links ORDER BY sort_order ASC');
    res.json({ success: true, data: links });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /search - Search articles
router.get('/search', async (req, res) => {
  try {
    const query = req.query.q;
    if (!query) {
      return res.json({ success: true, data: [], total: 0 });
    }
    
    const articles = await query(`
      SELECT a.*, c.name as category_name
      FROM articles a
      LEFT JOIN categories c ON a.category_id = c.id
      WHERE a.status = 1 AND (
        a.title LIKE ? OR a.content LIKE ? OR a.summary LIKE ?
      )
      ORDER BY a.created_at DESC
      LIMIT 20
    `, [`%${query}%`, `%${query}%`, `%${query}%`]);
    
    res.json({ success: true, data: articles, total: articles.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
# Database Seed Data

Run after container startup:

```bash
# Initialize database
docker exec -i blog_mysql mysql -uroot -pblogroot123 blog < /opt/data/blog-system/init.sql

# Or manually seed:
docker exec -i blog_mysql mysql -uroot -pblogroot123 blog << 'EOF'
-- Admin user (password: admin123)
INSERT INTO users (username, password, email, role) VALUES
('admin', '$2a$10$PSYTURvBTQw14NWswmp5meFXfSMf1hXj.rrqWRmet96DRhi/Ub1KK', 'admin@example.com', 'admin');

-- Default categories
INSERT IGNORE INTO categories (name, slug, description, sort_order) VALUES
('技术分享', 'tech', '技术文章、教程、实践总结', 1),
('生活随笔', 'life', '生活感悟、旅行记录、日常点滴', 2),
('学习笔记', 'study', '学习心得、读书笔记、知识整理', 3);

-- Default tags
INSERT IGNORE INTO tags (name, slug) VALUES
('JavaScript', 'javascript'),
('Vue.js', 'vuejs'),
('Node.js', 'nodejs'),
('Python', 'python'),
('前端', 'frontend'),
('后端', 'backend');

-- Sample article
INSERT IGNORE INTO articles (title, slug, summary, content, category_id, status, created_by) VALUES
('欢迎使用个人博客系统', 'welcome-to-blog', 'Vue 3 + Node.js 个人博客系统', '## 特性\n\n- Markdown 写作\n- 主题切换\n- 标签分类', 1, 1, 1);

-- Link article to tags
INSERT IGNORE INTO article_tags (article_id, tag_id) VALUES (1, 1), (1, 5);
EOF
```

## Bcrypt Hash

Password: `admin123`
Hash: `$2a$10$PSYTURvBTQw14NWswmp5meFXfSMf1hXj.rrqWRmet96DRhi/Ub1KK`

Generate new hash:
```bash
node -e "require('bcryptjs').hash('your-password', 10).then(h => console.log(h))"
```
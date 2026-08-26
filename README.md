# 个人博客系统

基于 Vue 3 + Node.js + MySQL 的个人博客系统，支持 Docker 一键部署。

## 功能特性

### 前台
- 📝 文章列表（分页）
- 📖 文章详情（Markdown 渲染）
- 🏷️ 标签云
- 📁 分类导航
- 🔗 友情链接
- 🔍 全文搜索
- 🎨 主题切换（亮色/暗色/蓝色/绿色）

### 后台
- 📊 统计概览
- ✏️ 文章管理（CRUD）
- 📁 分类管理
- 🏷️ 标签管理
- 🔗 友链管理
- ⚙️ 站点设置

## 快速开始

### 1. 克隆项目
```bash
git clone https://github.com/your-org/blog-system.git
cd blog-system
```

### 2. 配置环境变量
```bash
cp .env.example .env
# 修改默认密码
```

### 3. 启动服务
```bash
docker-compose up -d
```

### 4. 访问
- 前台: http://localhost:8080
- 后台: http://localhost:8080/admin
- API: http://localhost:3000/api/v1/public

### 默认账号
- 用户名: admin
- 密码: admin123

## 技术栈

| 层级 | 技术 |
|------|------|
| 前端 | Vue 3 + Vite + Pinia + Naive UI |
| 后端 | Node.js + Express |
| 数据库 | MySQL 8.0 |
| 部署 | Docker + Docker Compose |

## 项目结构
```
blog-system/
├── docker-compose.yml
├── .env.example
├── init.sql
├── api/                    # 后端 API
│   ├── package.json
│   ├── Dockerfile
│   └── src/
│       ├── index.js
│       ├── db/
│       │   └── connection.js
│       └── routes/
│           ├── public.js   # 前台接口
│           └── admin.js    # 后台接口
└── web/                    # 前端应用
    ├── package.json
    ├── Dockerfile
    ├── nginx.conf
    └── src/
        ├── main.js
        ├── App.vue
        ├── components/
        │   ├── AppHeader.vue
        │   └── AppFooter.vue
        ├── views/
        │   ├── HomePage.vue
        │   ├── ArticlePage.vue
        │   ├── CategoryPage.vue
        │   ├── TagsPage.vue
        │   ├── LinksPage.vue
        │   ├── SearchPage.vue
        │   └── admin/
        │       ├── AdminLayout.vue
        │       ├── AdminDashboard.vue
        │       ├── AdminArticles.vue
        │       ├── AdminArticleEdit.vue
        │       ├── AdminCategories.vue
        │       ├── AdminTags.vue
        │       ├── AdminLinks.vue
        │       └── AdminLogin.vue
        ├── stores/
        │   ├── theme.js
        │   └── auth.js
        └── router/
            └── index.js
```

## API 文档

### 前台接口 (无需鉴权)
- `GET /api/v1/public/settings` - 获取站点设置
- `GET /api/v1/public/articles` - 文章列表
- `GET /api/v1/public/articles/:slug` - 文章详情
- `GET /api/v1/public/categories` - 分类列表
- `GET /api/v1/public/tags` - 标签列表
- `GET /api/v1/public/links` - 友链列表
- `GET /api/v1/public/search?q=` - 搜索文章

### 后台接口 (需要 JWT 鉴权)
- `POST /api/v1/admin/login` - 登录
- `GET /api/v1/admin/statistics` - 统计信息
- `GET /api/v1/admin/settings` - 获取设置
- `PUT /api/v1/admin/settings` - 更新设置
- `GET /api/v1/admin/articles` - 文章管理
- `POST /api/v1/admin/articles` - 新建文章
- `PUT /api/v1/admin/articles/:id` - 编辑文章
- `DELETE /api/v1/admin/articles/:id` - 删除文章
- `GET /api/v1/admin/categories` - 分类管理
- `POST /api/v1/admin/categories` - 新建分类
- `PUT /api/v1/admin/categories/:id` - 编辑分类
- `DELETE /api/v1/admin/categories/:id` - 删除分类
- `GET /api/v1/admin/tags` - 标签管理
- `POST /api/v1/admin/tags` - 新建标签
- `PUT /api/v1/admin/tags/:id` - 编辑标签
- `DELETE /api/v1/admin/tags/:id` - 删除标签
- `GET /api/v1/admin/links` - 友链管理
- `POST /api/v1/admin/links` - 新建友链
- `PUT /api/v1/admin/links/:id` - 编辑友链
- `DELETE /api/v1/admin/links/:id` - 删除友链

## 安全说明
- 默认密码请尽快修改
- 生产环境请修改 JWT_SECRET
- 启用 HTTPS
- 定期备份数据库

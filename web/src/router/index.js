import { createRouter, createWebHistory } from 'vue-router'
import axios from 'axios'
import { useAuthStore } from '../stores/auth'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'Home',
      component: () => import('../views/HomePage.vue'),
      meta: { title: '首页' }
    },
    {
      path: '/categories',
      name: 'Categories',
      component: () => import('../views/CategoryPage.vue'),
      meta: { title: '分类' }
    },
    {
      path: '/categories/:id',
      name: 'CategoryArticles',
      component: () => import('../views/CategoryPage.vue'),
      meta: { title: '分类文章' }
    },
    {
      path: '/tags',
      name: 'Tags',
      component: () => import('../views/TagsPage.vue'),
      meta: { title: '标签' }
    },
    {
      path: '/tags/:slug',
      name: 'TagArticles',
      component: () => import('../views/TagsPage.vue'),
      meta: { title: '标签文章' }
    },
    {
      path: '/links',
      name: 'Links',
      component: () => import('../views/LinksPage.vue'),
      meta: { title: '友情链接' }
    },
    {
      path: '/search',
      name: 'Search',
      component: () => import('../views/SearchPage.vue'),
      meta: { title: '搜索' }
    },
    {
      path: '/article/:slug',
      name: 'Article',
      component: () => import('../views/ArticlePage.vue'),
      meta: { title: '文章详情' }
    },
    {
      path: '/admin',
      name: 'Admin',
      component: () => import('../views/admin/AdminLayout.vue'),
      meta: { requiresAuth: true },
      children: [
        { path: '', redirect: '/admin' },
        { path: 'dashboard', name: 'AdminDashboard', component: () => import('../views/admin/AdminDashboard.vue') },
        { path: 'articles', name: 'AdminArticles', component: () => import('../views/admin/AdminArticles.vue') },
        { path: 'articles/new', name: 'AdminArticleNew', component: () => import('../views/admin/AdminArticleEdit.vue') },
        { path: 'articles/edit/:id', name: 'AdminArticleEdit', component: () => import('../views/admin/AdminArticleEdit.vue') },
        { path: 'categories', name: 'AdminCategories', component: () => import('../views/admin/AdminCategories.vue') },
        { path: 'tags', name: 'AdminTags', component: () => import('../views/admin/AdminTags.vue') },
        { path: 'links', name: 'AdminLinks', component: () => import('../views/admin/AdminLinks.vue') }
      ]
    }
  ]
})

// Update document title
router.beforeEach((to, from, next) => {
  document.title = to.meta.title ? `${to.meta.title} - 个人博客` : '个人博客'
  next()
})

// Auth guard
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()
  if (to.meta.requiresAuth && !authStore.isAuthenticated()) {
    next('/admin')
  } else {
    next()
  }
})

export default router
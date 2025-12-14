import { createWebHistory, createRouter } from 'vue-router'
import HomeView from '@/views/HomeView.vue'
import JobsView from '@/views/JobsView.vue'

const routes = [
  { path: '/', component: HomeView },
  { path: '/jobs', component: JobsView },
]

export const router = createRouter({
  history: createWebHistory(),
  routes,
})

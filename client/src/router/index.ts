import { createWebHistory, createRouter } from 'vue-router'
import HomeView from "@/views/HomeView.vue"
import JobsView from "@/views/JobsView.vue"
import JobDetailView from "@/views/JobDetailView.vue"
import LoginView from "@/views/LoginView.vue"
import SignupView from "@/views/SignupView.vue"
// import type { RouteRecordRaw } from 'vue-router'
// import MainLayout from '@/layouts/MainLayout.vue'
// import DashboardOverviewView from '@/views/DashboardOverview.vue'
import JobBoardView from '@/views/JobBoard.vue'
import SettingsView from '@/views/Settings.vue'
import CreateJobView from '@/views/CreateJob.vue'
import NotFoundView from '@/views/NotFound.vue'
import MainLayout from '../components/dashboard/MainLayout.vue'
import Dashboard from '../views/Dashboard.vue'

const routes = [
  { path: "/", component: HomeView },
  { path: "/jobs", component: JobsView },
  { path: "/jobs/:id", component: JobDetailView, name: "job-detail" },
  { path: "/login", component: LoginView, name: "login" },
  { path: "/signup", component: SignupView, name: "signup" },
  // { path: "/apply/:jobId", component: JobApplicationView, name: "apply" },
  // { path: "/create-job", component: CreateJobView, name: "create-job" },
  // { path: "/dashboard", component: DashboardView, name: "dashboard" },
  {
    path: '/',
    redirect: '/dashboard'
  },
  {
    path: '/dashboard',
    component: MainLayout,
    children: [
      {
        path: '',
        component: Dashboard,
        name: 'Dashboard'
      },
      {
        path: 'jobs',
        component: JobBoardView,
        name: 'JobBoard'
      },
      {
        path: 'settings',
        component: SettingsView,
        name: 'Settings'
      },
      {
        path: 'create-job',
        component: CreateJobView,
        name: 'CreateJob'
      }
    ]
  },
  {
    path: '/:pathMatch(.*)*',
    component: NotFoundView
  }
]

export const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

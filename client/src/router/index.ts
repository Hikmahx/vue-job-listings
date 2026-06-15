import { createWebHistory, createRouter } from 'vue-router'
import { authService } from '@/services/authService'

// Lazy-load all views for code splitting
const HomeView = () => import('@/views/HomeView.vue')
const JobsView = () => import('@/views/JobsView.vue')
const JobDetailView = () => import('@/views/JobDetailView.vue')
const JobApplicationView = () => import('@/views/JobApplicationView.vue')
const LoginView = () => import('@/views/LoginView.vue')
const SignupView = () => import('@/views/SignupView.vue')
const NotFoundView = () => import('@/views/NotFound.vue')

// Dashboard (protected)
const MainLayout = () => import('@/components/dashboard/MainLayout.vue')
const Dashboard = () => import('@/views/Dashboard.vue')
const AppliedJobsView = () => import('@/views/AppliedJobs.vue')
const SettingsView = () => import('@/views/Settings.vue')
const CreateJobView = () => import('@/views/CreateJob.vue')
const CompaniesView = () => import('@/views/CompaniesView.vue')
const CompanyFormView = () => import('@/views/CompanyFormView.vue')
const CompanyDetailView = () => import('@/views/CompanyDetailView.vue')
const ColdEmailTracker = () => import('@/views/ColdEmailTracker.vue')

const routes = [
  { path: '/', component: HomeView },
  { path: '/jobs', component: JobsView },
  { path: '/jobs/:id', component: JobDetailView, name: 'job-detail' },
  { path: '/jobs/:jobId/apply', component: JobApplicationView, name: 'apply' },
  { path: '/login', component: LoginView, name: 'login' },
  { path: '/signup', component: SignupView, name: 'signup' },

  // Dashboard — protected, requires auth
  {
    path: '/dashboard',
    component: MainLayout,
    meta: { requiresAuth: true },
    children: [
      { path: '', component: Dashboard, name: 'Dashboard' },
      { path: 'applied-jobs', component: AppliedJobsView, name: 'AppliedJobs' },
      { path: 'settings', component: SettingsView, name: 'Settings' },
      { path: 'create-job', component: CreateJobView, name: 'CreateJob' },
      { path: 'companies', component: CompaniesView, name: 'Companies' },
      { path: 'companies/create', component: CompanyFormView, name: 'CreateCompany' },
      { path: 'companies/:slug', component: CompanyDetailView, name: 'CompanyDetail' },
      { path: 'companies/:slug/edit', component: CompanyFormView, name: 'EditCompany' },
      { path: 'cold-email-tracker', component: ColdEmailTracker, name: 'ColdEmailTracker' },
    ],
  },

  { path: '/:pathMatch(.*)*', component: NotFoundView },
]

export const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

// Auth guard — mirrors MERN protected routes pattern
router.beforeEach((to) => {
  if (to.meta.requiresAuth && !authService.isAuthenticated()) {
    return { name: 'login', query: { redirect: to.fullPath } }
  }
})

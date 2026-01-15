import { createWebHistory, createRouter } from "vue-router"
import HomeView from "@/views/HomeView.vue"
import JobsView from "@/views/JobsView.vue"
import JobDetailView from "@/views/JobDetailView.vue"
import LoginView from "@/views/LoginView.vue"
import SignupView from "@/views/SignupView.vue"
// import JobApplicationView from "@/views/JobApplicationView.vue"
// import CreateJobView from "@/views/CreateJobView.vue"
// import DashboardView from "@/views/DashboardView.vue"

const routes = [
  { path: "/", component: HomeView },
  { path: "/jobs", component: JobsView },
  { path: "/jobs/:id", component: JobDetailView, name: "job-detail" },
  { path: "/login", component: LoginView, name: "login" },
  { path: "/signup", component: SignupView, name: "signup" },
  // { path: "/apply/:jobId", component: JobApplicationView, name: "apply" },
  // { path: "/create-job", component: CreateJobView, name: "create-job" },
  // { path: "/dashboard", component: DashboardView, name: "dashboard" },
]

export const router = createRouter({
  history: createWebHistory(),
  routes,
})

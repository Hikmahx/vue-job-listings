import { createWebHistory, createRouter } from "vue-router"
import HomeView from "@/views/HomeView.vue"
import JobsView from "@/views/JobsView.vue"
import JobDetailView from "@/views/JobDetailView.vue"

const routes = [
  { path: "/", component: HomeView },
  { path: "/jobs", component: JobsView },
  { path: "/jobs/:id", component: JobDetailView, name: "job-detail" },
]

export const router = createRouter({
  history: createWebHistory(),
  routes,
})

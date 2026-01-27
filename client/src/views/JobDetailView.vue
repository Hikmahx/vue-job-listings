<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Heart, Share2, MapPin, Clock, Briefcase, ExternalLink } from 'lucide-vue-next'
import Header from '@/components/Header.vue'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { getSalaryDisplay } from '@/utils/salaryFormatter'
import { useJobStore } from '@/stores/JobStore'

const jobStore = useJobStore()
const route = useRoute()
const router = useRouter()
const isFavorited = ref(false)

const jobId = computed(() => route.params.id as string)
const jobDetail = computed(() => jobStore.currentJob)
const loading = computed(() => jobStore.loading)
const error = computed(() => jobStore.error)
const jobDetails = computed(() => jobDetail.value?.jobDetails || null)
const salaryDisplay = computed(() => {
  if (!jobDetail.value) return ''
  return getSalaryDisplay(
    jobDetail.value.minSalary,
    jobDetail.value.maxSalary,
    jobDetail.value.currency,
    jobDetail.value.timeframe,
  )
})

const quickInfoItems = computed(() =>
  [
    {
      icon: Briefcase,
      label: 'Salary',
      value: salaryDisplay.value,
      show: !!salaryDisplay.value,
    },
    {
      icon: Clock,
      label: 'Experience',
      value: jobDetails.value?.experienceRequired,
      show: !!jobDetails.value?.experienceRequired,
    },
    {
      icon: MapPin,
      label: 'Location',
      value: jobDetail.value?.location,
      show: true,
      capitalize: true,
    },
    {
      icon: Briefcase,
      label: 'Level',
      value: jobDetail.value?.level,
      show: true,
      capitalize: true,
    },
  ].filter((item) => item.show),
)

const companyInfoItems = computed(() =>
  [
    {
      label: 'Market',
      value: jobDetail.value?.market,
      show: !!jobDetail.value?.market,
      capitalize: true,
    },
    {
      label: 'Founded',
      value: jobDetails.value?.foundedYear || '',
      show: !!jobDetails.value?.foundedYear,
    },
    {
      label: 'Company Size',
      value: jobDetail.value?.companySize ? `${jobDetail.value.companySize} employees` : null,
      show: !!jobDetail.value?.companySize,
    },
  ].filter((item) => item.show),
)

onMounted(async () => {
  await fetchJobDetail()
})

watch(
  () => route.params.id,
  async (newId) => {
    if (newId) {
      await fetchJobDetail()
    }
  },
)

async function fetchJobDetail() {
  try {
    await jobStore.getJobById(jobId.value)
  } catch (err) {
    console.error('Error fetching job:', err)
  }
}

function handleApplyClick() {
  if (jobDetails.value?.externalApply && jobDetails.value?.apply) {
    window.open(jobDetails.value.apply, '_blank')
  } else {
    router.push({ name: 'apply', params: { jobId: jobId.value } })
  }
}

function handleShare() {
  if (navigator.share) {
    navigator.share({
      title: jobDetail.value?.position,
      text: `Check out this job at ${jobDetail.value?.company}`,
      url: window.location.href,
    })
  } else {
    navigator.clipboard.writeText(window.location.href)
    alert('Link copied to clipboard!')
  }
}

function toggleFavorite() {
  isFavorited.value = !isFavorited.value
}
</script>

<template>
  <div class="min-h-screen bg-cyan-50 relative">
    <Header>
      <!-- <div class="w-full flex max-w-6xl mx-auto px-4">
        <button @click="router.back()" class="text-white hover:underline font-bold -mt-20">
          ← Back to Jobs
        </button>
      </div> -->
      <div class="relative max-w-6xl mx-auto px-4 h-full flex items-center">
        <!-- Loading State -->
        <div v-if="loading" class="max-w-6xl mx-auto px-4 -mt-8">
          <div class="bg-white rounded-md shadow-md p-8 animate-pulse">
            <div class="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div class="h-6 bg-gray-200 rounded w-1/2 mb-6"></div>
            <div class="h-32 bg-gray-200 rounded"></div>
          </div>
        </div>

        <!-- Error State -->
        <div v-else-if="error" class="max-w-6xl mx-auto px-4 -mt-8">
          <div class="bg-white rounded-md shadow-md p-8 text-center">
            <p class="leading-loose text-red-500 font-semibold">{{ error }}</p>
          </div>
        </div>

        <!-- Content -->
        <div v-else-if="jobDetail" class="max-w-6xl mx-auto px-4 relative -top-20 pb-12">
          <!-- Company Header Card -->
          <div class="bg-white rounded-md shadow-md mb-8 overflow-hidden">
            <div class="flex items-center justify-between p-8 md:p-12">
              <div class="flex items-center gap-6">
                <div>
                  <Avatar class="w-12 h-12">
                    <AvatarImage
                      :src="jobDetail.logo"
                      :alt="jobDetail.company"
                      class="w-full h-full object-contain p-2"
                    />
                    <AvatarFallback>{{ jobDetail.company.charAt(0) }}</AvatarFallback>
                  </Avatar>
                </div>
                <div>
                  <h1 class="text-2xl md:text-3xl font-bold text-[#19202d] mb-2">
                    {{ jobDetail.company }}
                  </h1>
                  <p class="leading-loose text-grayish-cyan">
                    {{ jobDetail.company.toLowerCase().replace(/\s+/g, '') }}.com
                  </p>
                </div>
              </div>
              <a
                v-if="jobDetails?.website"
                :href="jobDetails.website"
                target="_blank"
                class="hidden md:block px-6 py-3 bg-cyan-50 text-cyan-400 rounded-md hover:bg-cyan-400 hover:text-cyan-50 transition-colors font-bold"
              >
                Company Site
              </a>
            </div>
            <a
              v-if="jobDetails?.website"
              :href="jobDetails.website"
              target="_blank"
              class="md:hidden block w-full py-3 bg-cyan-50 text-cyan-400 text-center hover:bg-cyan-400 hover:text-cyan-50 transition-colors font-bold"
            >
              Company Site
            </a>
          </div>

          <div class="flex flex-col lg:flex-row gap-8">
            <!-- Main Content -->
            <div class="flex-1">
              <div class="bg-white rounded-md shadow-md p-8 md:p-12">
                <!-- Job Header -->
                <div class="flex flex-col md:flex-row md:items-start md:justify-between gap-6 mb-8">
                  <div class="flex-1">
                    <div class="flex items-center gap-3 text-grayish-cyan mb-3">
                      <span>{{ jobDetail.postedAt }}</span>
                      <span>•</span>
                      <span class="capitalize">{{ jobDetail.contract }}</span>
                    </div>
                    <h2 class="text-2xl md:text-3xl font-bold text-[#19202d] mb-3">
                      {{ jobDetail.position }}
                    </h2>
                    <p class="leading-loose text-cyan-400 font-bold text-sm mb-4">
                      {{ jobDetail.location }}
                    </p>
                    <div class="flex gap-2 items-center">
                      <button
                        @click="toggleFavorite"
                        :class="[
                          'p-2 rounded-md transition-colors',
                          isFavorited
                            ? 'bg-red-50 text-red-500'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200',
                        ]"
                        title="Save job"
                      >
                        <Heart :fill="isFavorited ? 'currentColor' : 'none'" :size="20" />
                      </button>
                      <button
                        @click="handleShare"
                        class="p-2 rounded-md bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
                        title="Share job"
                      >
                        <Share2 :size="20" />
                      </button>
                    </div>
                  </div>
                  <button
                    @click="handleApplyClick"
                    class="px-8 py-4 bg-cyan-400 text-white rounded-md hover:bg-cyan-900 transition-colors font-bold whitespace-nowrap flex items-center gap-2 justify-center"
                  >
                    <span>{{ jobDetails?.externalApply ? 'Apply' : 'Apply Now' }}</span>
                    <ExternalLink v-if="jobDetails?.externalApply" :size="18" />
                  </button>
                </div>

                <!-- Job Description -->
                <div v-if="jobDetails" class="prose max-w-none">
                  <p class="leading-loose text-grayish-cyan mb-8 whitespace-pre-line">
                    {{ jobDetails.description }}
                  </p>

                  <!-- Requirements -->
                  <div v-if="jobDetails.requirements" class="mb-8">
                    <h3 class="text-xl font-bold text-[#19202d] mb-4">Requirements</h3>
                    <p class="leading-loose text-grayish-cyan mb-4 whitespace-pre-line">
                      {{ jobDetails.requirements.content }}
                    </p>
                    <ul
                      class="list-disc ml-6 space-y-3 text-grayish-cyan marker:text-cyan-400 marker:bg-cyan-50"
                    >
                      <li
                        v-for="(item, index) in jobDetails.requirements.items"
                        :key="index"
                        class="leading-loose"
                      >
                        {{ item }}
                      </li>
                    </ul>
                  </div>

                  <!-- Responsibilities -->
                  <div v-if="jobDetails.responsibilities" class="mb-8">
                    <h3 class="text-xl font-bold text-[#19202d] mb-4">What You Will Do</h3>
                    <p class="leading-loose text-grayish-cyan mb-4 whitespace-pre-line">
                      {{ jobDetails.responsibilities.content }}
                    </p>
                    <ol
                      class="list-decimal ml-6 space-y-3 text-grayish-cyan marker:text-cyan-400 marker:font-bold marker:bg-cyan-50"
                    >
                      <li
                        v-for="(item, index) in jobDetails.responsibilities.items"
                        :key="index"
                        class="leading-loose"
                      >
                        <span>{{ item }}</span>
                      </li>
                    </ol>
                  </div>
                </div>
              </div>
            </div>

            <!-- Sidebar -->
            <div class="lg:w-80 space-y-6">
              <div class="lg:sticky lg:top-8">
                <!-- Quick Info Card -->
                <div class="bg-white rounded-md shadow-md p-6 mb-6">
                  <h3 class="text-lg font-bold text-[#19202d] mb-4">Job Details</h3>
                  <div class="space-y-4">
                    <div
                      v-for="item in quickInfoItems"
                      :key="item.label"
                      class="flex items-start gap-3"
                    >
                      <component :is="item.icon" :size="20" class="text-cyan-400 mt-0.5" />
                      <div>
                        <p class="leading-loose text-xs text-grayish-cyan mb-1">{{ item.label }}</p>
                        <p
                          class="font-semibold text-[#19202d]"
                          :class="{ capitalize: item.capitalize }"
                        >
                          {{ item.value }}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Company Info Card -->
                <div class="bg-white rounded-md shadow-md p-6 mb-6">
                  <h3 class="text-lg font-bold text-[#19202d] mb-4">About Company</h3>
                  <div class="space-y-3">
                    <div v-for="item in companyInfoItems" :key="item.label">
                      <p class="leading-loose text-xs text-grayish-cyan mb-1">{{ item.label }}</p>
                      <p
                        class="font-semibold text-[#19202d]"
                        :class="{ capitalize: item.capitalize }"
                      >
                        {{ item.value }}
                      </p>
                    </div>
                    <div v-if="jobDetails?.website">
                      <a
                        :href="jobDetails.website"
                        target="_blank"
                        class="inline-flex items-center gap-2 text-cyan-400 hover:underline font-semibold"
                      >
                        View Profile
                        <ExternalLink :size="16" />
                      </a>
                    </div>
                  </div>
                </div>

                <!-- Skills -->
                <div v-if="jobDetail.skills?.length > 0" class="bg-white rounded-md shadow-md p-6">
                  <h3 class="text-lg font-bold text-[#19202d] mb-4">Required Skills</h3>
                  <div class="flex flex-wrap gap-2">
                    <span
                      v-for="skill in jobDetail.skills"
                      :key="skill"
                      class="px-3 py-1.5 bg-cyan-50 text-cyan-400 rounded-md text-sm font-semibold capitalize"
                    >
                      {{ skill }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Bottom Apply Section -->
          <div class="bg-white rounded-md shadow-md p-6 mt-8 mb-8">
            <div class="flex flex-col md:flex-row items-center justify-between gap-4">
              <div class="text-center md:text-left">
                <h3 class="text-xl font-bold text-[#19202d] mb-1">
                  {{ jobDetail.position }}
                </h3>
                <p class="leading-loose text-grayish-cyan">{{ jobDetail.company }}</p>
              </div>
              <button
                @click="handleApplyClick"
                class="w-full md:w-auto px-8 py-4 bg-cyan-400 text-white rounded-md hover:bg-cyan-900 transition-colors font-bold flex items-center gap-2 justify-center"
              >
                <span>{{ jobDetails?.externalApply ? 'Apply' : 'Apply Now' }}</span>
                <ExternalLink v-if="jobDetails?.externalApply" :size="18" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </Header>
  </div>
</template>

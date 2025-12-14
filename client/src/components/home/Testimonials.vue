<script setup lang="ts">
import { ref, onMounted } from 'vue'
import SectionTitle from './SectionTitle.vue'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { ChevronLeft, ChevronRight } from 'lucide-vue-next'

interface SuccessStories {
  id: number
  content: string
  name: string
  role: string
  company: string
  image: string
}

const currentIndex = ref(0)
const isMounted = ref(false)

onMounted(() => {
  isMounted.value = true
})

const successStories: SuccessStories[] = [
  {
    id: 1,
    content:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin nec ante vitae purus tempus egestas. Curabitur euismod purus sed elit faucibus. Vivamus in ante sed libero feugiat fermentum. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin nec ante vitae purus tempus egestas. Curabitur euismod purus sed elit faucibus.',
    name: 'Lorem ipsum dolor',
    role: 'Senior Software Developer',
    company: 'Photosnap',
    image: '/lorem1.webp',
  },
  {
    id: 2,
    content:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin nec ante vitae purus tempus egestas. Curabitur euismod purus sed elit faucibus. Vivamus in ante sed libero feugiat fermentum. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin nec ante vitae purus tempus egestas. Curabitur euismod purus sed elit faucibus.',
    name: 'Lorem ipsum',
    role: 'Mobile Developer',
    company: 'MyHome',
    image: '/lorem2.png',
  },
  {
    id: 3,
    content:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin nec ante vitae purus tempus egestas. Curabitur euismod purus sed elit faucibus. Vivamus in ante sed libero feugiat fermentum. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin nec ante vitae purus tempus egestas. Curabitur euismod purus sed elit faucibus.',
    name: 'Lorem ipsum',
    role: 'Senior Software Engineer',
    company: 'Loop Studios',
    image: '/lorem3.png',
  },
  {
    id: 4,
    content:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin nec ante vitae purus tempus egestas. Curabitur euismod purus sed elit faucibus. Vivamus in ante sed libero feugiat fermentum. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin nec ante vitae purus tempus egestas. Curabitur euismod purus sed elit faucibus.',
    name: 'Lorem ipsum dolor',
    role: 'Frontend Developer',
    company: 'Shortly',
    image: '/lorem4.png',
  },
  {
    id: 5,
    content:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin nec ante vitae purus tempus egestas. Curabitur euismod purus sed elit faucibus. Vivamus in ante sed libero feugiat fermentum. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin nec ante vitae purus tempus egestas. Curabitur euismod purus sed elit faucibus.',
    name: 'Lorem ipsum',
    role: 'UI/UX Designer',
    company: 'The Air Filter Company',
    image: '/lorem5.png',
  },
]

const handlePrev = () => {
  currentIndex.value = (currentIndex.value - 1 + successStories.length) % successStories.length
}

const handleNext = () => {
  currentIndex.value = (currentIndex.value + 1) % successStories.length
}

const getCardrole = (index: number) => {
  const diff = (index - currentIndex.value + successStories.length) % successStories.length

  if (diff === 0) return 'center'
  if (diff === 1 || diff === successStories.length - 1) return diff === 1 ? 'right' : 'left'
  if (diff === 2 || diff === successStories.length - 2) return diff === 2 ? 'far-right' : 'far-left'
  return 'hidden'
}

const roleClasses: Record<string, string> = {
  center: 'left-1/2 -translate-x-1/2 z-30 opacity-100 scale-100',
  left: 'left-[25%] -translate-x-1/2 z-20 opacity-80 scale-[0.7]',
  right: 'left-[75%] -translate-x-1/2 z-20 opacity-80 scale-[0.7]',
  'far-left': 'left-[15%] -translate-x-1/2 z-10 opacity-40 scale-[0.6]',
  'far-right': 'left-[85%] -translate-x-1/2 z-10 opacity-40 scale-[0.6]',
  hidden: 'opacity-0 pointer-events-none',
}
</script>

<template>
  <div v-if="isMounted" class="w-full px-4 py-16 lg:py-24 bg-cyan-50 overflow-hidden">
    <SectionTitle title="WHAT THEY HAVE SAID" />

    <div class="w-full max-w-6xl mx-auto">
      <div class="relative h-[400px] md:h-[300px]">
        <div class="relative w-full h-full">
          <div
            v-for="(story, index) in successStories"
            :key="story.id"
            class="absolute top-0 w-full max-w-3xl rounded-xl border border-border bg-white p-6 md:p-8 shadow-sm transition-all duration-500 ease-in-out"
            :class="roleClasses[getCardrole(index)]"
          >
            <div class="flex flex-col justify-between h-full gap-8">
              <p
                class="text-gray-600 text-sm md:text-base leading-loose font-thin line-clamp-6 md:line-clamp-none"
              >
                {{ story.content }}
              </p>

              <div class="flex gap-4">
                <Avatar class="w-12 h-12">
                  <AvatarImage :src="story.image" :alt="story.name" class="object-contain" />
                  <AvatarFallback>{{ story.name.charAt(0) }}</AvatarFallback>
                </Avatar>

                <div class="flex items-center">
                  <div>
                    <h4 class="font-bold text-cyan-900 text-sm mb-1">
                      {{ story.name }}
                    </h4>
                    <p class="text-grayish-cyan text-xs">{{ story.role }}, {{ story.company }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Controls -->
        <div
          class="absolute left-0 right-0 bottom-[-60px] flex justify-center items-center space-x-2"
        >
          <button class="p-2" @click="handlePrev">
            <ChevronLeft class="h-5 w-5 text-grayish-cyan" />
          </button>

          <button
            v-for="(_, index) in successStories"
            :key="index"
            @click="currentIndex = index"
            class="h-2.5 w-2.5 rounded-full transition-colors duration-200"
            :class="currentIndex === index ? 'bg-cyan-400' : 'bg-gray-300'"
          />

          <button class="p-2" @click="handleNext">
            <ChevronRight class="h-5 w-5 text-grayish-cyan" />
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from '@/components/ui/accordion'
import SvgSlanted from '../icons/SvgSlanted.vue'

interface FAQItem {
  id: string
  question: string
  answer: string
}

const faqItems: FAQItem[] = [
  {
    id: '1',
    question: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit?',
    answer:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin nec ante vitae purus tempus egestas. Curabitur euismod purus sed elit faucibus. Vivamus in ante sed libero feugiat fermentum.',
  },
  {
    id: '2',
    question: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit?',
    answer:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin nec ante vitae purus tempus egestas. Curabitur euismod purus sed elit faucibus. Vivamus in ante sed libero feugiat fermentum.',
  },
  {
    id: '3',
    question: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit?',
    answer:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin nec ante vitae purus tempus egestas. Curabitur euismod purus sed elit faucibus. Vivamus in ante sed libero feugiat fermentum.',
  },
  {
    id: '4',
    question: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit?',
    answer:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin nec ante vitae purus tempus egestas. Curabitur euismod purus sed elit faucibus. Vivamus in ante sed libero feugiat fermentum.',
  },
  {
    id: '5',
    question: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit?',
    answer:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin nec ante vitae purus tempus egestas. Curabitur euismod purus sed elit faucibus. Vivamus in ante sed libero feugiat fermentum.',
  },
]
</script>

<template>
  <div class="relative overflow-hidden bg-cyan-50">
    <div class="bg-cyan-400 bg-opacity-[15%] overflow-hidden">
      <SvgSlanted class="text-cyan-400 absolute -left-80 -bottom-80" />
      <div class="relative z-10  py-16 lg:py-24">
        <div class="container max-w-3xl lg:max-w-6xl 2xl:max-w-7xl mx-auto px-4">
          <div class="flex flex-col lg:flex-row gap-8 lg:gap-12">
            <!-- Left -->
            <div class="flex flex-col justify-start flex-1 text-center lg:text-left">
              <h1
                class="text-4xl sm:text-5xl font-semibold mb-6 tracking-wider text-cyan-900"
                :style="{ color: 'rgb(44, 58, 58)' }"
              >
                FAQs
              </h1>

              <p
                class="text-sm sm:text-base lg:text-lg leading-loose text-grayish-cyan"
                :style="{ color: 'rgb(123, 142, 142)' }"
              >
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin nec ante vitae purus
                tempus egestas. Curabitur euismod purus sed elit faucibus.
              </p>
            </div>

            <!-- Accordion -->
            <div
              class="bg-white rounded-xl p-6 sm:p-8 lg:p-8 shadow-[0_12px_16px_0_#d7e9ec]f shadow-lg w-full max-w-[720px] mx-auto lg:mr-0"
            >
              <Accordion type="single" collapsible default-value="1" class="w-full">
                <AccordionItem
                  v-for="item in faqItems"
                  :key="item.id"
                  :value="item.id"
                  class="border-b border-gray-200 py-4 last:border-b-0"
                >
                  <AccordionTrigger
                    class="hover:no-underline flex justify-between items-center gap-4 text-left"
                    :style="{ color: 'rgb(44, 58, 58)' }"
                  >
                    <span class="text-base sm:text-lg font-medium">
                      {{ item.question }}
                    </span>
                  </AccordionTrigger>

                  <AccordionContent
                    class="text-sm sm:text-base pt-4 pb-0 leading-loose text-grayish-cyan"
                  >
                    {{ item.answer }}
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

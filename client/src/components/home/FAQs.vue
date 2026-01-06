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
    question: 'Do I need to create an account before applying for a job?',
    answer:
      'You can browse, search, and explore all job listings without creating an account. However, to apply for jobs, save listings, or receive personalized notifications, you will need to create an account. This helps us keep your applications organized and provide a better experience.',
  },
  {
    id: '2',
    question: 'Can I, as a founder, create and manage multiple company profiles?',
    answer:
      'Yes, founders can create and manage multiple company profiles from a single account. This makes it easy to post jobs for different teams or ventures, update company details independently, and track applications across all your companies in one place.',
  },
  {
    id: '3',
    question: 'How accurate is the AI-powered job search?',
    answer:
      'Our AI search uses a Retrieval-Augmented Generation (RAG) pipeline to deeply analyze your query and match it against the job database. It combines semantic understanding with structured filters to surface highly relevant roles, improving accuracy compared to keyword-only search.',
  },
  {
    id: '4',
    question: 'Can I switch between AI search and regular filters?',
    answer:
      'Yes, you can easily toggle between AI-powered search and traditional filters at any time. This flexibility allows you to explore jobs conversationally using natural language or refine results manually using precise filters based on your exact requirements.',
  },
  {
    id: '5',
    question: 'What types of jobs can I find on this platform?',
    answer:
      'The platform features a wide range of roles across different industries, experience levels, and work types. You can find remote, hybrid, and onsite positions, spanning startups and growing companies, with detailed information to help you make informed decisions.',
  },
]
</script>

<template>
  <div class="relative overflow-hidden bg-cyan-50">
    <div class="bg-cyan-400 bg-opacity-[15%] overflow-hidden">
      <SvgSlanted class="text-cyan-400 absolute -left-80 -bottom-80" />
      <div class="relative z-10 py-16 lg:py-24">
        <div class="container max-w-3xl lg:max-w-6xl 2xl:max-w-7xl mx-auto px-4">
          <div class="flex flex-col lg:flex-row gap-8 lg:gap-12">
            <!-- Left -->
            <div class="flex flex-col justify-start flex-1 text-center lg:text-left">
              <h1 class="text-2xl lg:text-3xl font-bold mb-6 tracking-wider text-cyan-900">FAQs</h1>

              <p class="text-sm sm:text-base leading-loose text-grayish-cyan">
                Find clear answers to common questions about using the platform, applying for jobs,
                and managing searches. Learn how features work, how AI-powered search helps, and how
                founders and job seekers can get started quickly.
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

<script setup lang="ts">
import { computed, ref } from 'vue'
import { Twitter, Facebook, Instagram, Github } from 'lucide-vue-next'
import type { Component } from 'vue'

interface SocialLink {
  name: string
  href: string
  icon: Component
}

interface FooterLink {
  text: string
  href: string
}

interface FooterColumn {
  title: string
  links: FooterLink[]
}

const socialLinks: SocialLink[] = [
  {
    name: 'twitter',
    href: '#',
    icon: Twitter,
  },
  {
    name: 'facebook',
    href: '#',
    icon: Facebook,
  },
  {
    name: 'instagram',
    href: '#',
    icon: Instagram,
  },
  {
    name: 'github',
    href: '#',
    icon: Github,
  },
]

const footerColumns: FooterColumn[] = [
  {
    title: 'Resources',
    links: [
      { text: 'Service', href: '#' },
      { text: 'Browse Jobs', href: '#' },
      // { text: 'About us', href: '#' },
      { text: 'Companies', href: '#' },
    ],
  },
  {
    title: 'Help',
    links: [
      { text: 'Customer Support', href: '#' },
      { text: 'Terms & Conditions', href: '#' },
      { text: 'Privacy Policy', href: '#' },
    ],
  },
]

const currentYear = computed(() => new Date().getFullYear())
</script>

<template>
  <footer class="bg-cyan-900 text-white py-16 lg:py-24">
    <div class="container mx-auto px-4 max-w-7xl">
      <div
        class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 md:gap-12 xl:gap-8 mb-12"
      >
        <div class="lg:col-span-1">
          <div class="flex items-center gap-2 mb-4">
            <router-link to="/" class="flex items-center">
              <img src="/logo.svg" alt="JobList Logo" class="h-5" />
            </router-link>
          </div>
          <p class="text-grayish-cyan text-sm leading-relaxed mb-6">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin nec ante vitae purus
            tempus egestas.
          </p>
          <!-- Socials -->
          <div class="flex gap-3">
            <a
              v-for="social in socialLinks"
              :key="social.name"
              :href="social.href"
              class="w-10 h-10 rounded-full flex items-center justify-center bg-grayish-cyan hover:bg-cyan-400 hover:text-cyan-50 transition-colors"
            >
              <component :is="social.icon" class="w-5 h-5 text-white" />
            </a>
          </div>
        </div>

        <div v-for="column in footerColumns" :key="column.title">
          <h3 class="text-white font-semibold text-lg mb-4 md:mb-6">{{ column.title }}</h3>
          <ul class="space-y-3">
            <li v-for="link in column.links" :key="link.text">
              <a
                :href="link.href"
                class="text-grayish-cyan hover:text-white transition-colors text-sm md:text-base"
              >
                {{ link.text }}
              </a>
            </li>
          </ul>
        </div>

        <div>
          <h3 class="text-white font-semibold text-lg mb-4 md:mb-6">Subscribe to Newsletter</h3>
          <div class="flex w-full">
            <input
              type="email"
              placeholder="Enter email address"
              class="flex-1 w-full px-4 py-3 rounded-l-lg text-xs placeholder:text-xs focus:outline-none bg-white text-cyan-900"
            />
            <button
              class="px-6 md:px-8 py-3 rounded-r-lg text-white bg-cyan-400 font-medium text-sm md:text-base hover:opacity-90 transition-opacity"
            >
              Join
            </button>
          </div>
        </div>
      </div>

      <div class="pt-8 border-t border-grayish-cyan">
        <p class="text-grayish-cyan text-center text-sm">
          © {{ currentYear }} JobList, All Rights Reserved. | Site by
          <a
            href="https://github.com/Hikmahx"
            target="_blank"
            rel="noopener noreferrer"
            class="text-cyan-50 hover:text-white transition-colors underline"
          >
            Hikmah
          </a>
        </p>
      </div>
    </div>
  </footer>
</template>

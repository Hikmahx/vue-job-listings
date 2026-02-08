<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ArrowLeft, Edit, MapPin, Calendar, Globe, Users, Building2 } from 'lucide-vue-next';
import { useCompanyStore } from '@/stores/CompanyStore';
import { storeToRefs } from 'pinia';

const route = useRoute();
const router = useRouter();
const companyStore = useCompanyStore();
const { currentCompany, loading, error } = storeToRefs(companyStore);

onMounted(async () => {
  const slug = route.params.slug as string;
  try {
    await companyStore.fetchCompanyBySlug(slug);
  } catch (err) {
    console.error('Failed to fetch company:', err);
  }
});

const handleEdit = () => {
  router.push(`/dashboard/companies/${route.params.slug}/edit`);
};

const handleBack = () => {
  router.push('/dashboard/companies');
};
</script>

<template>
  <div class="bg-white rounded-lg shadow-md p-8">
    <button
      @click="handleBack"
      class="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
    >
      <ArrowLeft class="w-5 h-5" />
      Back to Companies
    </button>

    <div v-if="loading" class="text-center py-12">
      <p class="text-gray-600">Loading company details...</p>
    </div>

    <div v-else-if="error" class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
      {{ error }}
    </div>

    <div v-else-if="currentCompany" class="space-y-8">
      <!-- Header -->
      <div class="flex items-start justify-between">
        <div class="flex items-center gap-6">
          <div
            v-if="currentCompany.logo"
            class="w-20 h-20 rounded-lg bg-gray-200 flex items-center justify-center overflow-hidden"
          >
            <img :src="currentCompany.logo" :alt="currentCompany.name" class="w-full h-full object-cover" />
          </div>
          <div v-else class="w-20 h-20 rounded-lg bg-cyan-400 flex items-center justify-center">
            <span class="text-white font-bold text-2xl">{{ currentCompany.name.charAt(0) }}</span>
          </div>
          <div>
            <h1 class="text-3xl font-bold text-gray-900 mb-2">{{ currentCompany.name }}</h1>
            <p class="text-gray-600">{{ currentCompany.description }}</p>
          </div>
        </div>
        <button
          @click="handleEdit"
          class="flex items-center gap-2 bg-cyan-400 hover:bg-cyan-900 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
        >
          <Edit class="w-5 h-5" />
          Edit Company
        </button>
      </div>

      <!-- Company Info Grid -->
      <div class="grid md:grid-cols-2 gap-6">
        <div class="flex items-start gap-3">
          <MapPin class="w-5 h-5 text-cyan-400 mt-1" />
          <div>
            <p class="text-sm text-gray-500 mb-1">Location</p>
            <p class="font-semibold text-gray-900">{{ currentCompany.location }}</p>
          </div>
        </div>

        <div class="flex items-start gap-3">
          <Building2 class="w-5 h-5 text-cyan-400 mt-1" />
          <div>
            <p class="text-sm text-gray-500 mb-1">Market</p>
            <p class="font-semibold text-gray-900 capitalize">
              {{ currentCompany.market?.replace('_', ' ') }}
            </p>
          </div>
        </div>

        <div v-if="currentCompany.foundedYear" class="flex items-start gap-3">
          <Calendar class="w-5 h-5 text-cyan-400 mt-1" />
          <div>
            <p class="text-sm text-gray-500 mb-1">Founded</p>
            <p class="font-semibold text-gray-900">{{ currentCompany.foundedYear }}</p>
          </div>
        </div>

        <div v-if="currentCompany.teamSize" class="flex items-start gap-3">
          <Users class="w-5 h-5 text-cyan-400 mt-1" />
          <div>
            <p class="text-sm text-gray-500 mb-1">Team Size</p>
            <p class="font-semibold text-gray-900">{{ currentCompany.teamSize }} employees</p>
          </div>
        </div>

        <div v-if="currentCompany.website" class="flex items-start gap-3">
          <Globe class="w-5 h-5 text-cyan-400 mt-1" />
          <div>
            <p class="text-sm text-gray-500 mb-1">Website</p>
            <a
              :href="currentCompany.website"
              target="_blank"
              rel="noopener noreferrer"
              class="font-semibold text-cyan-400 hover:underline"
            >
              {{ currentCompany.website }}
            </a>
          </div>
        </div>
      </div>

      <!-- Founders Section -->
      <div v-if="currentCompany.founders && currentCompany.founders.length > 0">
        <h2 class="text-2xl font-bold text-gray-900 mb-4">Founders</h2>
        <div class="grid md:grid-cols-2 gap-4">
          <div
            v-for="founder in currentCompany.founders"
            :key="founder.id"
            class="border border-gray-200 rounded-lg p-4"
          >
            <div class="flex items-center justify-between">
              <div>
                <p class="font-semibold text-gray-900">
                  {{ founder.user.firstName }} {{ founder.user.lastName }}
                </p>
                <p class="text-sm text-gray-600">{{ founder.user.email }}</p>
                <p v-if="founder.title" class="text-sm text-gray-500 mt-1">{{ founder.title }}</p>
              </div>
              <span
                :class="[
                  'px-2 py-1 rounded text-xs font-semibold capitalize',
                  founder.permission === 'owner'
                    ? 'bg-purple-100 text-purple-700'
                    : founder.permission === 'admin'
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-gray-100 text-gray-700',
                ]"
              >
                {{ founder.permission }}
              </span>
            </div>
            <p class="text-xs text-gray-500 mt-2">
              Joined {{ new Date(founder.joinedAt).toLocaleDateString() }}
            </p>
          </div>
        </div>
      </div>

      <!-- Team Section -->
      <div v-if="currentCompany.team && currentCompany.team.length > 0">
        <h2 class="text-2xl font-bold text-gray-900 mb-4">Team Members</h2>
        <div class="grid md:grid-cols-2 gap-4">
          <div
            v-for="member in currentCompany.team"
            :key="member.id"
            class="border border-gray-200 rounded-lg p-4"
          >
            <div class="flex items-center justify-between">
              <div>
                <p class="font-semibold text-gray-900">
                  {{ member.user.firstName }} {{ member.user.lastName }}
                </p>
                <p class="text-sm text-gray-600">{{ member.user.email }}</p>
                <p v-if="member.title" class="text-sm text-gray-500 mt-1">{{ member.title }}</p>
              </div>
              <span
                :class="[
                  'px-2 py-1 rounded text-xs font-semibold capitalize',
                  member.permission === 'owner'
                    ? 'bg-purple-100 text-purple-700'
                    : member.permission === 'admin'
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-gray-100 text-gray-700',
                ]"
              >
                {{ member.permission }}
              </span>
            </div>
            <p class="text-xs text-gray-500 mt-2">
              Joined {{ new Date(member.joinedAt).toLocaleDateString() }}
            </p>
          </div>
        </div>
      </div>

      <div v-if="(!currentCompany.founders || currentCompany.founders.length === 0) && (!currentCompany.team || currentCompany.team.length === 0)" class="text-center py-8 text-gray-500">
        <p>No team members found.</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ArrowLeft, Save } from 'lucide-vue-next';
import { useCompanyStore } from '@/stores/CompanyStore';
import { storeToRefs } from 'pinia';
import { useForm } from 'vee-validate';
import { toTypedSchema } from '@vee-validate/zod';
import * as z from 'zod';

const route = useRoute();
const router = useRouter();
const companyStore = useCompanyStore();
const { currentCompany, loading } = storeToRefs(companyStore);

const isEdit = ref(false);
const formErrors = ref<string[]>([]);

const formSchema = toTypedSchema(
  z.object({
    name: z.string().min(1, 'Company name is required').max(100),
    description: z.string().min(1, 'Description is required'),
    market: z.string().min(1, 'Market is required'),
    location: z.string().min(1, 'Location is required'),
    logo: z.string().optional(),
    teamSize: z.number().optional(),
    foundedYear: z.number().min(1800).max(new Date().getFullYear()).optional(),
    website: z.string().url('Invalid URL').optional().or(z.literal('')),
  })
);

const { handleSubmit, defineField, errors } = useForm({
  validationSchema: formSchema,
});

const [name] = defineField('name');
const [description] = defineField('description');
const [market] = defineField('market');
const [location] = defineField('location');
const [logo] = defineField('logo');
const [teamSize] = defineField('teamSize');
const [foundedYear] = defineField('foundedYear');
const [website] = defineField('website');

const marketOptions = [
  { value: 'saas', label: 'SaaS' },
  { value: 'fintech', label: 'Fintech' },
  { value: 'healthtech', label: 'Healthtech' },
  { value: 'ecommerce', label: 'E-commerce' },
  { value: 'education', label: 'Education' },
  { value: 'software', label: 'Software' },
  { value: 'marketplace', label: 'Marketplace' },
  { value: 'ai_ml', label: 'AI/ML' },
  { value: 'devtools', label: 'Dev Tools' },
  { value: 'gaming', label: 'Gaming' },
  { value: 'social_media', label: 'Social Media' },
  { value: 'cryptocurrency', label: 'Cryptocurrency' },
  { value: 'security', label: 'Security' },
  { value: 'climate_tech', label: 'Climate Tech' },
  { value: 'real_estate', label: 'Real Estate' },
  { value: 'travel', label: 'Travel' },
  { value: 'food_beverage', label: 'Food & Beverage' },
  { value: 'others', label: 'Others' },
];

onMounted(async () => {
  isEdit.value = route.name === 'EditCompany';
  if (isEdit.value) {
    const slug = route.params.slug as string;
    try {
      await companyStore.fetchCompanyBySlug(slug);
      if (currentCompany.value) {
        name.value = currentCompany.value.name;
        description.value = currentCompany.value.description;
        market.value = currentCompany.value.market;
        location.value = currentCompany.value.location;
        logo.value = currentCompany.value.logo || '';
        teamSize.value = currentCompany.value.teamSize;
        foundedYear.value = currentCompany.value.foundedYear;
        website.value = currentCompany.value.website || '';
      }
    } catch (err) {
      console.error('Failed to fetch company:', err);
    }
  }
});

const onSubmit = handleSubmit(async (values) => {
  formErrors.value = [];
  try {
    if (isEdit.value) {
      await companyStore.updateCompany(route.params.slug as string, values);
    } else {
      await companyStore.createCompany(values);
    }
    router.push('/dashboard/companies');
  } catch (err: any) {
    if (err.response?.data?.errors) {
      formErrors.value = err.response.data.errors.map((e: any) => e.msg || e.message);
    } else {
      formErrors.value = [err.response?.data?.message || 'Failed to save company'];
    }
  }
});

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
      Back
    </button>

    <h1 class="text-3xl font-bold text-gray-900 mb-8">
      {{ isEdit ? 'Edit Company' : 'Create Company' }}
    </h1>

    <form @submit.prevent="onSubmit" class="space-y-6">
      <div v-if="formErrors.length > 0" class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
        <ul class="list-disc list-inside">
          <li v-for="(error, index) in formErrors" :key="index">{{ error }}</li>
        </ul>
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">Company Name *</label>
        <input
          v-model="name"
          type="text"
          class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-400 focus:border-transparent"
          :class="{ 'border-red-500': errors.name }"
        />
        <p v-if="errors.name" class="text-red-500 text-sm mt-1">{{ errors.name }}</p>
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">Description *</label>
        <textarea
          v-model="description"
          rows="4"
          class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-400 focus:border-transparent"
          :class="{ 'border-red-500': errors.description }"
        ></textarea>
        <p v-if="errors.description" class="text-red-500 text-sm mt-1">{{ errors.description }}</p>
      </div>

      <div class="grid md:grid-cols-2 gap-6">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Market *</label>
          <select
            v-model="market"
            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-400 focus:border-transparent"
            :class="{ 'border-red-500': errors.market }"
          >
            <option value="">Select Market</option>
            <option v-for="option in marketOptions" :key="option.value" :value="option.value">
              {{ option.label }}
            </option>
          </select>
          <p v-if="errors.market" class="text-red-500 text-sm mt-1">{{ errors.market }}</p>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Location *</label>
          <input
            v-model="location"
            type="text"
            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-400 focus:border-transparent"
            :class="{ 'border-red-500': errors.location }"
          />
          <p v-if="errors.location" class="text-red-500 text-sm mt-1">{{ errors.location }}</p>
        </div>
      </div>

      <div class="grid md:grid-cols-2 gap-6">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Logo URL</label>
          <input
            v-model="logo"
            type="url"
            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-400 focus:border-transparent"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Website</label>
          <input
            v-model="website"
            type="url"
            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-400 focus:border-transparent"
            :class="{ 'border-red-500': errors.website }"
            placeholder="https://example.com"
          />
          <p v-if="errors.website" class="text-red-500 text-sm mt-1">{{ errors.website }}</p>
        </div>
      </div>

      <div class="grid md:grid-cols-2 gap-6">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Team Size</label>
          <input
            v-model.number="teamSize"
            type="number"
            min="1"
            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-400 focus:border-transparent"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Founded Year</label>
          <input
            v-model.number="foundedYear"
            type="number"
            min="1800"
            :max="new Date().getFullYear()"
            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-400 focus:border-transparent"
            :class="{ 'border-red-500': errors.foundedYear }"
          />
          <p v-if="errors.foundedYear" class="text-red-500 text-sm mt-1">{{ errors.foundedYear }}</p>
        </div>
      </div>

      <div class="flex gap-4 pt-4">
        <button
          type="button"
          @click="handleBack"
          class="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          :disabled="loading"
          class="flex items-center gap-2 px-6 py-3 bg-cyan-400 hover:bg-cyan-900 text-white rounded-lg font-semibold transition-colors disabled:opacity-50"
        >
          <Save class="w-5 h-5" />
          {{ loading ? 'Saving...' : isEdit ? 'Update Company' : 'Create Company' }}
        </button>
      </div>
    </form>
  </div>
</template>

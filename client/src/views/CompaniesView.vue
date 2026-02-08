<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { Plus, MoreVertical, Eye, Edit, Trash2 } from 'lucide-vue-next';
import { useCompanyStore } from '@/stores/CompanyStore';
import { storeToRefs } from 'pinia';

const router = useRouter();
const companyStore = useCompanyStore();
const { companies, loading, error } = storeToRefs(companyStore);

const showDeleteDialog = ref(false);
const companyToDelete = ref<string | null>(null);
const showMenu = ref<string | null>(null);

onMounted(async () => {
  try {
    await companyStore.fetchMyCompanies();
  } catch (err) {
    console.error('Failed to fetch companies:', err);
  }
});

const handleCreate = () => {
  router.push('/dashboard/companies/create');
};

const handleView = (slug: string) => {
  router.push(`/dashboard/companies/${slug}`);
  showMenu.value = null;
};

const handleEdit = (slug: string) => {
  router.push(`/dashboard/companies/${slug}/edit`);
  showMenu.value = null;
};

const handleDeleteClick = (slug: string) => {
  companyToDelete.value = slug;
  showDeleteDialog.value = true;
  showMenu.value = null;
};

const confirmDelete = async () => {
  if (companyToDelete.value) {
    try {
      await companyStore.deleteCompany(companyToDelete.value);
      showDeleteDialog.value = false;
      companyToDelete.value = null;
    } catch (err) {
      console.error('Failed to delete company:', err);
    }
  }
};

const cancelDelete = () => {
  showDeleteDialog.value = false;
  companyToDelete.value = null;
};

const toggleMenu = (slug: string) => {
  showMenu.value = showMenu.value === slug ? null : slug;
};
</script>

<template>
  <div class="bg-white rounded-lg shadow-md p-8">
    <div class="flex items-center justify-between mb-6">
      <h2 class="text-2xl font-bold text-gray-900">My Companies</h2>
      <button
        @click="handleCreate"
        class="flex items-center gap-2 bg-cyan-400 hover:bg-cyan-900 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
      >
        <Plus class="w-5 h-5" />
        Create Company
      </button>
    </div>

    <div v-if="error" class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
      {{ error }}
    </div>

    <div v-if="loading" class="text-center py-12">
      <p class="text-gray-600">Loading companies...</p>
    </div>

    <div v-else-if="companies.length === 0" class="text-center py-12">
      <p class="text-gray-600 mb-4">You haven't created any companies yet.</p>
      <button
        @click="handleCreate"
        class="bg-cyan-400 hover:bg-cyan-900 text-white px-6 py-3 rounded-lg font-semibold"
      >
        Create Your First Company
      </button>
    </div>

    <div v-else class="overflow-x-auto">
      <table class="w-full border-collapse">
        <thead>
          <tr class="border-b border-gray-200">
            <th class="text-left py-3 px-4 font-semibold text-gray-900">Company</th>
            <th class="text-left py-3 px-4 font-semibold text-gray-900">Market</th>
            <th class="text-left py-3 px-4 font-semibold text-gray-900">Location</th>
            <th class="text-left py-3 px-4 font-semibold text-gray-900">Permission</th>
            <th class="text-left py-3 px-4 font-semibold text-gray-900">Created</th>
            <th class="text-right py-3 px-4 font-semibold text-gray-900">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="company in companies"
            :key="company.id"
            class="border-b border-gray-100 hover:bg-gray-50 transition-colors"
          >
            <td class="py-4 px-4">
              <div class="flex items-center gap-3">
                <div
                  v-if="company.logo"
                  class="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden"
                >
                  <img :src="company.logo" :alt="company.name" class="w-full h-full object-cover" />
                </div>
                <div v-else class="w-10 h-10 rounded-full bg-cyan-400 flex items-center justify-center">
                  <span class="text-white font-bold text-sm">{{ company.name.charAt(0) }}</span>
                </div>
                <div>
                  <p class="font-semibold text-gray-900">{{ company.name }}</p>
                  <p class="text-sm text-gray-500">{{ company.description?.substring(0, 50) }}...</p>
                </div>
              </div>
            </td>
            <td class="py-4 px-4">
              <span class="capitalize text-gray-700">{{ company.market?.replace('_', ' ') }}</span>
            </td>
            <td class="py-4 px-4">
              <span class="text-gray-700">{{ company.location }}</span>
            </td>
            <td class="py-4 px-4">
              <span
                :class="[
                  'px-2 py-1 rounded text-xs font-semibold capitalize',
                  company.permission === 'owner'
                    ? 'bg-purple-100 text-purple-700'
                    : company.permission === 'admin'
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-gray-100 text-gray-700',
                ]"
              >
                {{ company.permission }}
              </span>
            </td>
            <td class="py-4 px-4">
              <span class="text-sm text-gray-600">
                {{ new Date(company.createdAt || '').toLocaleDateString() }}
              </span>
            </td>
            <td class="py-4 px-4">
              <div class="flex justify-end relative">
                <button
                  @click="toggleMenu(company.slug)"
                  class="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <MoreVertical class="w-5 h-5 text-gray-600" />
                </button>
                <div
                  v-if="showMenu === company.slug"
                  class="absolute right-0 top-10 bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-[150px]"
                >
                  <button
                    @click="handleView(company.slug)"
                    class="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center gap-2 text-gray-700"
                  >
                    <Eye class="w-4 h-4" />
                    View
                  </button>
                  <button
                    @click="handleEdit(company.slug)"
                    class="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center gap-2 text-gray-700"
                  >
                    <Edit class="w-4 h-4" />
                    Edit
                  </button>
                  <button
                    @click="handleDeleteClick(company.slug)"
                    class="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center gap-2 text-red-600"
                  >
                    <Trash2 class="w-4 h-4" />
                    Delete
                  </button>
                </div>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Delete Confirmation Dialog -->
    <div
      v-if="showDeleteDialog"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      @click="cancelDelete"
    >
      <div class="bg-white rounded-lg p-6 max-w-md w-full mx-4" @click.stop>
        <h3 class="text-xl font-bold text-gray-900 mb-4">Delete Company</h3>
        <p class="text-gray-600 mb-6">
          Are you sure you want to delete this company? This action cannot be undone.
        </p>
        <div class="flex gap-4 justify-end">
          <button
            @click="cancelDelete"
            class="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            @click="confirmDelete"
            class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

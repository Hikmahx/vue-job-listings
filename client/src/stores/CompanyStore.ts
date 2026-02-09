import { defineStore } from 'pinia';
import { ref } from 'vue';
import { companyService, type Company, type CreateCompanyData } from '@/services/companyService';

export const useCompanyStore = defineStore('company', () => {
  const companies = ref<Company[]>([]);
  const currentCompany = ref<Company | null>(null);
  const loading = ref(false);
  const error = ref<string | null>(null);

  const fetchMyCompanies = async () => {
    loading.value = true;
    error.value = null;
    try {
      companies.value = await companyService.getMyCompanies();
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to fetch companies';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const fetchCompanyBySlug = async (slug: string) => {
    loading.value = true;
    error.value = null;
    try {
      currentCompany.value = await companyService.getCompanyBySlug(slug);
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to fetch company';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const createCompany = async (data: CreateCompanyData) => {
    loading.value = true;
    error.value = null;
    try {
      const company = await companyService.createCompany(data);
      companies.value.push(company);
      return company;
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to create company';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const updateCompany = async (slug: string, data: Partial<CreateCompanyData>) => {
    loading.value = true;
    error.value = null;
    try {
      const updated = await companyService.updateCompany(slug, data);
      const index = companies.value.findIndex((c) => c.slug === slug);
      if (index !== -1) {
        companies.value[index] = updated;
      }
      if (currentCompany.value?.slug === slug) {
        currentCompany.value = updated;
      }
      return updated;
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to update company';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const deleteCompany = async (slug: string) => {
    loading.value = true;
    error.value = null;
    try {
      await companyService.deleteCompany(slug);
      companies.value = companies.value.filter((c) => c.slug !== slug);
      if (currentCompany.value?.slug === slug) {
        currentCompany.value = null;
      }
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to delete company';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const clearCurrentCompany = () => {
    currentCompany.value = null;
  };

  return {
    companies,
    currentCompany,
    loading,
    error,
    fetchMyCompanies,
    fetchCompanyBySlug,
    createCompany,
    updateCompany,
    deleteCompany,
    clearCurrentCompany,
  };
});

import api from './api';

export interface Company {
  id: string;
  name: string;
  slug: string;
  logo?: string;
  description: string;
  market: string;
  location: string;
  teamSize?: number;
  foundedYear?: number;
  website?: string;
  permission?: string;
  createdAt?: string;
  updatedAt?: string;
  founders?: Array<{
    id: string;
    user: {
      id: string;
      firstName: string;
      lastName: string;
      email: string;
    };
    role: string;
    permission: string;
    title?: string;
    joinedAt: string;
  }>;
  team?: Array<{
    id: string;
    user: {
      id: string;
      firstName: string;
      lastName: string;
      email: string;
    };
    role: string;
    permission: string;
    title?: string;
    joinedAt: string;
  }>;
}

export interface CreateCompanyData {
  name: string;
  description: string;
  market: string;
  location: string;
  logo?: string;
  teamSize?: number;
  foundedYear?: number;
  website?: string;
}

export const companyService = {
  async getMyCompanies(): Promise<Company[]> {
    const res = await api.get('/companies/my-companies');
    return res.data;
  },

  async getCompanyBySlug(slug: string): Promise<Company> {
    const res = await api.get(`/companies/${slug}`);
    return res.data;
  },

  async createCompany(data: CreateCompanyData): Promise<Company> {
    const res = await api.post('/companies/create', data);
    return res.data;
  },

  async updateCompany(slug: string, data: Partial<CreateCompanyData>): Promise<Company> {
    const res = await api.put(`/companies/${slug}/update`, data);
    return res.data;
  },

  async deleteCompany(slug: string): Promise<void> {
    await api.delete(`/companies/${slug}/delete`);
  },
};

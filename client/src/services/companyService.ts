import axios from 'axios';

const API_URL = 'http://127.0.0.1:8000/api';

const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

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
    const res = await axiosInstance.get('/companies/my-companies');
    return res.data;
  },

  async getCompanyBySlug(slug: string): Promise<Company> {
    const res = await axiosInstance.get(`/companies/${slug}`);
    return res.data;
  },

  async createCompany(data: CreateCompanyData): Promise<Company> {
    const res = await axiosInstance.post('/companies/create', data);
    return res.data;
  },

  async updateCompany(slug: string, data: Partial<CreateCompanyData>): Promise<Company> {
    const res = await axiosInstance.put(`/companies/${slug}/update`, data);
    return res.data;
  },

  async deleteCompany(slug: string): Promise<void> {
    await axiosInstance.delete(`/companies/${slug}/delete`);
  },
};

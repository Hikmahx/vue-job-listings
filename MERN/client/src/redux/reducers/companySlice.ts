import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { companyService, Company, CreateCompanyData } from '../../services/companyService';

interface CompanyState {
  companies: Company[];
  currentCompany: Company | null;
  loading: boolean;
  error: string | null;
}

const initialState: CompanyState = {
  companies: [],
  currentCompany: null,
  loading: false,
  error: null,
};

export const fetchMyCompanies = createAsyncThunk(
  'companies/fetchMyCompanies',
  async (_, { rejectWithValue }) => {
    try {
      const companies = await companyService.getMyCompanies();
      return companies;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch companies');
    }
  }
);

export const fetchCompanyBySlug = createAsyncThunk(
  'companies/fetchCompanyBySlug',
  async (slug: string, { rejectWithValue }) => {
    try {
      const company = await companyService.getCompanyBySlug(slug);
      return company;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch company');
    }
  }
);

export const createCompany = createAsyncThunk(
  'companies/createCompany',
  async (data: CreateCompanyData, { rejectWithValue }) => {
    try {
      const company = await companyService.createCompany(data);
      return company;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create company');
    }
  }
);

export const updateCompany = createAsyncThunk(
  'companies/updateCompany',
  async ({ slug, data }: { slug: string; data: Partial<CreateCompanyData> }, { rejectWithValue }) => {
    try {
      const company = await companyService.updateCompany(slug, data);
      return company;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update company');
    }
  }
);

export const deleteCompany = createAsyncThunk(
  'companies/deleteCompany',
  async (slug: string, { rejectWithValue }) => {
    try {
      await companyService.deleteCompany(slug);
      return slug;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete company');
    }
  }
);

const companySlice = createSlice({
  name: 'companies',
  initialState,
  reducers: {
    clearCurrentCompany: (state) => {
      state.currentCompany = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch my companies
      .addCase(fetchMyCompanies.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMyCompanies.fulfilled, (state, action: PayloadAction<Company[]>) => {
        state.loading = false;
        state.companies = action.payload;
      })
      .addCase(fetchMyCompanies.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Fetch company by slug
      .addCase(fetchCompanyBySlug.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCompanyBySlug.fulfilled, (state, action: PayloadAction<Company>) => {
        state.loading = false;
        state.currentCompany = action.payload;
      })
      .addCase(fetchCompanyBySlug.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Create company
      .addCase(createCompany.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createCompany.fulfilled, (state, action: PayloadAction<Company>) => {
        state.loading = false;
        state.companies.push(action.payload);
      })
      .addCase(createCompany.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Update company
      .addCase(updateCompany.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateCompany.fulfilled, (state, action: PayloadAction<Company>) => {
        state.loading = false;
        const index = state.companies.findIndex((c) => c.slug === action.payload.slug);
        if (index !== -1) {
          state.companies[index] = action.payload;
        }
        if (state.currentCompany?.slug === action.payload.slug) {
          state.currentCompany = action.payload;
        }
      })
      .addCase(updateCompany.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Delete company
      .addCase(deleteCompany.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteCompany.fulfilled, (state, action: PayloadAction<string>) => {
        state.loading = false;
        state.companies = state.companies.filter((c) => c.slug !== action.payload);
        if (state.currentCompany?.slug === action.payload) {
          state.currentCompany = null;
        }
      })
      .addCase(deleteCompany.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearCurrentCompany } = companySlice.actions;
export default companySlice.reducer;

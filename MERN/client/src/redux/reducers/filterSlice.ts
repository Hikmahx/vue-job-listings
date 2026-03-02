import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { FilterFields } from '../../types';

export interface FilterState extends FilterFields {
  selectedBtns: string[];
  aiMode: boolean;
}

const initialState: FilterState = {
  search: '',
  location: '',
  minSalary: undefined,
  maxSalary: undefined,
  timeframe: '',
  workType: '',
  level: '',
  skills: [],
  markets: [],
  companySizes: [],
  contract: [],
  roles: [],
  currency: '',
  sortByCompany: false,
  selectedBtns: [],
  aiMode: false,
};

const filterSlice = createSlice({
  name: 'filters',
  initialState,
  reducers: {
    setSearch: (state, action: PayloadAction<string>) => {
      state.search = action.payload;
    },
    setLocation: (state, action: PayloadAction<string>) => {
      state.location = action.payload;
    },
    setMinSalary: (state, action: PayloadAction<number | undefined>) => {
      state.minSalary = action.payload;
    },
    setMaxSalary: (state, action: PayloadAction<number | undefined>) => {
      state.maxSalary = action.payload;
    },
    setTimeframe: (state, action: PayloadAction<string>) => {
      state.timeframe = action.payload;
    },
    setWorkType: (state, action: PayloadAction<string>) => {
      state.workType = action.payload;
    },
    setLevel: (state, action: PayloadAction<string>) => {
      state.level = action.payload;
    },
    setSkills: (state, action: PayloadAction<string[]>) => {
      state.skills = action.payload;
    },
    addSkill: (state, action: PayloadAction<string>) => {
      if (!state.skills.includes(action.payload)) {
        state.skills.push(action.payload);
      }
    },
    removeSkill: (state, action: PayloadAction<string>) => {
      state.skills = state.skills.filter((skill) => skill !== action.payload);
    },
    setMarkets: (state, action: PayloadAction<string[]>) => {
      state.markets = action.payload;
    },
    addMarket: (state, action: PayloadAction<string>) => {
      if (!state.markets.includes(action.payload)) {
        state.markets.push(action.payload);
      }
    },
    removeMarket: (state, action: PayloadAction<string>) => {
      state.markets = state.markets.filter((market) => market !== action.payload);
    },
    setCompanySizes: (state, action: PayloadAction<string[]>) => {
      state.companySizes = action.payload;
    },
    addCompanySize: (state, action: PayloadAction<string>) => {
      if (!state.companySizes.includes(action.payload)) {
        state.companySizes.push(action.payload);
      }
    },
    removeCompanySize: (state, action: PayloadAction<string>) => {
      state.companySizes = state.companySizes.filter((size) => size !== action.payload);
    },
    setContract: (state, action: PayloadAction<string[]>) => {
      state.contract = action.payload;
    },
    addContract: (state, action: PayloadAction<string>) => {
      if (!state.contract.includes(action.payload)) {
        state.contract.push(action.payload);
      }
    },
    removeContract: (state, action: PayloadAction<string>) => {
      state.contract = state.contract.filter((c) => c !== action.payload);
    },
    setRoles: (state, action: PayloadAction<string[]>) => {
      state.roles = action.payload;
    },
    addRole: (state, action: PayloadAction<string>) => {
      if (!state.roles.includes(action.payload)) {
        state.roles.push(action.payload);
      }
    },
    removeRole: (state, action: PayloadAction<string>) => {
      state.roles = state.roles.filter((role) => role !== action.payload);
    },
    setCurrency: (state, action: PayloadAction<string>) => {
      state.currency = action.payload;
    },
    setSortByCompany: (state, action: PayloadAction<boolean>) => {
      state.sortByCompany = action.payload;
    },
    setAIMode: (state, action: PayloadAction<boolean>) => {
      state.aiMode = action.payload;
    },
    addSelectedBtn: (state, action: PayloadAction<string>) => {
      if (!state.selectedBtns.includes(action.payload)) {
        state.selectedBtns.push(action.payload);
      }
    },
    removeSelectedBtn: (state, action: PayloadAction<string>) => {
      state.selectedBtns = state.selectedBtns.filter((btn) => btn !== action.payload);
    },
    clearSelectedBtns: (state) => {
      state.selectedBtns = [];
    },
    resetFilters: () => {
      return initialState;
    },
    setFilters: (state, action: PayloadAction<Partial<FilterFields>>) => {
      Object.assign(state, action.payload);
    },
    loadFromObject: (state, action: PayloadAction<Record<string, unknown>>) => {
      const data = action.payload;
      if (data.search !== undefined) state.search = String(data.search).trim();
      if (data.location !== undefined) state.location = String(data.location);
      if (data.workType !== undefined) state.workType = String(data.workType);
      if (data.level !== undefined) state.level = String(data.level);
      if (data.currency !== undefined) state.currency = String(data.currency);
      if (data.minSalary !== undefined) state.minSalary = Number(data.minSalary);
      if (data.maxSalary !== undefined) state.maxSalary = Number(data.maxSalary);
      if (data.timeframe !== undefined) state.timeframe = String(data.timeframe);
      if (data.sortByCompany !== undefined)
        state.sortByCompany = data.sortByCompany === 'true';
      if (data.aiMode !== undefined) state.aiMode = data.aiMode === 'true';
      if (data.skills !== undefined) {
        state.skills =
          typeof data.skills === 'string'
            ? (data.skills as string).split(',').filter(Boolean)
            : Array.isArray(data.skills)
              ? (data.skills as string[])
              : [];
      }
      if (data.markets !== undefined) {
        state.markets =
          typeof data.markets === 'string'
            ? (data.markets as string).split(',').filter(Boolean)
            : Array.isArray(data.markets)
              ? (data.markets as string[])
              : [];
      }
      if (data.roles !== undefined) {
        state.roles =
          typeof data.roles === 'string'
            ? (data.roles as string).split(',').filter(Boolean)
            : Array.isArray(data.roles)
              ? (data.roles as string[])
              : [];
      }
      if (data.companySizes !== undefined) {
        state.companySizes =
          typeof data.companySizes === 'string'
            ? (data.companySizes as string).split(',').filter(Boolean)
            : Array.isArray(data.companySizes)
              ? (data.companySizes as string[])
              : [];
      }
      if (data.contract !== undefined) {
        state.contract =
          typeof data.contract === 'string'
            ? (data.contract as string).split(',').filter(Boolean)
            : Array.isArray(data.contract)
              ? (data.contract as string[])
              : [];
      }
    },
  },
});

/** Build query object from filter state (for URL sync) */
export function toQueryObject(state: FilterState): Record<string, string> {
  const query: Record<string, string> = {};
  if (!state.aiMode && state.search && String(state.search).trim() !== '')
    query.search = String(state.search).trim();
  if (state.location) query.location = state.location;
  if (state.workType) query.workType = state.workType;
  if (state.level) query.level = state.level;
  if (state.currency) query.currency = state.currency;
  if (state.minSalary != null && state.minSalary > 0) query.minSalary = String(state.minSalary);
  if (state.maxSalary != null && state.maxSalary > 0) query.maxSalary = String(state.maxSalary);
  if (state.timeframe) query.timeframe = state.timeframe;
  if (state.sortByCompany) query.sortByCompany = 'true';
  if (state.aiMode) query.aiMode = 'true';
  if (state.skills.length > 0) query.skills = state.skills.join(',');
  if (state.markets.length > 0) query.markets = state.markets.join(',');
  if (state.roles.length > 0) query.roles = state.roles.join(',');
  if (state.companySizes.length > 0) query.companySizes = state.companySizes.join(',');
  if (state.contract.length > 0) query.contract = state.contract.join(',');
  return query;
}

export const {
  setSearch,
  setLocation,
  setMinSalary,
  setMaxSalary,
  setTimeframe,
  setWorkType,
  setLevel,
  setSkills,
  addSkill,
  removeSkill,
  setMarkets,
  addMarket,
  removeMarket,
  setCompanySizes,
  addCompanySize,
  removeCompanySize,
  setContract,
  addContract,
  removeContract,
  setRoles,
  addRole,
  removeRole,
  setCurrency,
  setSortByCompany,
  setAIMode,
  addSelectedBtn,
  removeSelectedBtn,
  clearSelectedBtns,
  resetFilters,
  setFilters,
  loadFromObject,
} = filterSlice.actions;

export default filterSlice.reducer;

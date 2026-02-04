import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { FilterFields } from '../../types';

interface FilterState extends FilterFields {
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
    resetFilters: (state) => {
      return initialState;
    },
    setFilters: (state, action: PayloadAction<Partial<FilterFields>>) => {
      Object.assign(state, action.payload);
    },
  },
});

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
} = filterSlice.actions;

export default filterSlice.reducer;

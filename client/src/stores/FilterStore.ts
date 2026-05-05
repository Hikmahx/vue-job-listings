import { defineStore } from 'pinia'
import { levelsOptions } from '@/constants/filters'

export interface FilterFields {
  search: string
  location: string
  minSalary: number | undefined
  maxSalary: number | undefined
  timeframe: string
  workType: string
  level: string
  skills: string[]
  markets: string[]
  companySizes: string[]
  contract: string[]
  roles: string[]
  currency: string
  sortByCompany: boolean
}

/** AI-only filters returned by backend */
export type AIFilters = Record<string, unknown>

// Declare the full state shape as a plain interface so Pinia infers it correctly.
// Inline return-type annotations on state() break Pinia's store type inference for
// extra fields like aiFilters — a known limitation of the options-API form.
interface FilterState extends FilterFields {
  selectedBtns: string[]
  aiMode: boolean
  aiFilters: AIFilters
}

function initialState(): FilterState {
  return {
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
    aiFilters: {},
  }
}

export const useFilterStore = defineStore('filterStore', {
  state: () => initialState(),

  getters: {
    uniqueSelectedBtns: (state) => Array.from(new Set(state.selectedBtns)),
    groupedFilters: (state) => {
      const skip = new Set(['selectedBtns', 'aiMode', 'aiFilters'])
      return Object.entries(state)
        .filter(([key]) => !skip.has(key))
        .filter(([, value]) =>
          value !== null &&
          value !== undefined &&
          !(Array.isArray(value) && (value as unknown[]).length === 0) &&
          !(typeof value === 'string' && value.trim() === ''),
        )
        .map(([key, value]) => {
          if (Array.isArray(value)) {
            return (value as unknown[]).length === 1
              ? { [key]: (value as unknown[])[0] }
              : { [key]: (value as unknown[]).length }
          }
          if (typeof value === 'string' || typeof value === 'number') return { [key]: value }
          if (typeof value === 'boolean' && value) return { [key]: value }
          return undefined
        })
        .filter(Boolean)
    },
  },

  actions: {
    setSearch(value: string) { this.search = value },
    setLocation(value: string) { this.location = value },
    setWorkType(value: string) { this.workType = value },
    setLevel(value: string) { this.level = value },
    setSortByCompany(value: boolean) { this.sortByCompany = value },

    setAIMode(enabled: boolean) {
      this.aiMode = enabled
      if (!enabled) this.aiFilters = {}
    },

    setFilters(filters: Partial<FilterFields>) {
      Object.assign(this, filters)
    },

    setAIFilters(aiFilters: AIFilters) {
      this.aiFilters = aiFilters
    },

    removeFilterValue(value: string, filterType: 'role' | 'level' | 'skills') {
      if (filterType === 'level') { if (this.level === value) this.level = ''; return }
      const field = filterType === 'role' ? this.roles : this.skills
      const idx = field.indexOf(value)
      if (idx !== -1) field.splice(idx, 1)
    },

    resetFilters() {
      Object.assign(this, initialState())
    },

    addSelectedBtn(value: string) {
      if (!this.selectedBtns.includes(value)) this.selectedBtns.push(value)
    },
    removeSelectedBtn(value: string) {
      this.selectedBtns = this.selectedBtns.filter((v) => v !== value)
    },
    clearSelectedBtns() { this.selectedBtns = [] },
    toggleSelectedBtn(value: string) {
      this.selectedBtns.includes(value) ? this.removeSelectedBtn(value) : this.addSelectedBtn(value)
    },

    onFilterClick(value: string, filterType: 'role' | 'level' | 'skills') {
      if (filterType === 'level') {
        const levelObj = levelsOptions.find((l) => l.label === value || l.value === value)
        if (levelObj) this.level = levelObj.value
        return
      }
      const field = filterType === 'role' ? this.roles : this.skills
      if (filterType === 'skills') value = value.toLowerCase().replace(/\s+/g, '-')
      if (!field.includes(value)) field.push(value)
    },

    loadFromObject(data: Record<string, unknown>) {
      if (data.search !== undefined) this.search = String(data.search).trim()
      if (data.location !== undefined) this.location = String(data.location)
      if (data.workType !== undefined) this.workType = String(data.workType)
      if (data.level !== undefined) this.level = String(data.level)
      if (data.currency !== undefined) this.currency = String(data.currency)
      if (data.minSalary !== undefined) this.minSalary = Number(data.minSalary)
      if (data.maxSalary !== undefined) this.maxSalary = Number(data.maxSalary)
      if (data.timeframe !== undefined) this.timeframe = String(data.timeframe)
      if (data.sortByCompany !== undefined) this.sortByCompany = data.sortByCompany === 'true'
      if (data.aiMode !== undefined) this.aiMode = data.aiMode === 'true'

      const toArray = (v: unknown): string[] =>
        typeof v === 'string' ? v.split(',').filter(Boolean)
        : Array.isArray(v) ? (v as string[])
        : []

      if (data.skills !== undefined) this.skills = toArray(data.skills)
      if (data.markets !== undefined) this.markets = toArray(data.markets)
      if (data.roles !== undefined) this.roles = toArray(data.roles)
      if (data.companySizes !== undefined) this.companySizes = toArray(data.companySizes)
      if (data.contract !== undefined) this.contract = toArray(data.contract)
    },

    toQueryObject(): Record<string, string> {
      const query: Record<string, string> = {}
      if (!this.aiMode && this.search?.trim()) query.search = this.search.trim()
      if (this.location) query.location = this.location
      if (this.workType) query.workType = this.workType
      if (this.level) query.level = this.level
      if (this.currency) query.currency = this.currency
      if (this.minSalary && this.minSalary > 0) query.minSalary = String(this.minSalary)
      if (this.maxSalary && this.maxSalary > 0) query.maxSalary = String(this.maxSalary)
      if (this.timeframe) query.timeframe = this.timeframe
      if (this.sortByCompany) query.sortByCompany = 'true'
      if (this.aiMode) query.aiMode = 'true'
      if (this.skills.length > 0) query.skills = this.skills.join(',')
      if (this.markets.length > 0) query.markets = this.markets.join(',')
      if (this.roles.length > 0) query.roles = this.roles.join(',')
      if (this.companySizes.length > 0) query.companySizes = this.companySizes.join(',')
      if (this.contract.length > 0) query.contract = this.contract.join(',')

      if (this.aiMode) {
        Object.entries(this.aiFilters).forEach(([key, value]) => {
          if (value === undefined || value === null || value === '') return
          if (query[key] !== undefined) return // don't override explicit filter modal keys
          query[key] = String(value)
        })
      }
      return query
    },
  },
})

import { defineStore } from 'pinia'
import {
  levelsOptions,
  rolesOptions,
  skillsOptions,
  marketsOptions,
  companySizesOptions,
  contractOptions,
  workTypesOptions,
} from '@/constants/filters'

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

export const useFilterStore = defineStore('filterStore', {
  state: (): FilterFields & { selectedBtns: string[] } => ({
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
    // Selected buttons from job cards
    selectedBtns: [],
  }),

  getters: {
    uniqueSelectedBtns: (state) => Array.from(new Set(state.selectedBtns)),
    groupedFilters: (state) => {
      const data = Object.entries(state).filter(([key]) => key !== 'selectedBtns')
      const mappedData = data
        .filter(
          ([key, value]) =>
            value !== null &&
            value !== undefined &&
            !(Array.isArray(value) && value.length === 0) &&
            !(typeof value === 'string' && value.trim() === ''),
        )
        .map(([key, value]) => {
          if (Array.isArray(value)) {
            if (value.length === 1) {
              return { [key]: value[0] }
            }
            if (value.length > 1) {
              return { [key]: value.length }
            }
          } else if (typeof value === 'string' || typeof value === 'number') {
            return { [key]: value }
          } else if (typeof value === 'boolean' && value === true) {
            return { [key]: value }
          }
        })
        .filter(Boolean)

      return mappedData
    },
  },

  actions: {
    /**
     * Remove a value from the correct filter array (roles, skills, etc.)
     * Used for 'x' and 'clear' actions in the UI.
     */
    removeFilterValue(value: string, filterType: 'role' | 'level' | 'skills') {
      let field: string[] | undefined
      switch (filterType) {
        case 'role':
          field = this.roles
          break
        case 'level':
          if (this.level === value) {
            this.level = ''
          }
          return
        case 'skills':
          field = this.skills
          break
        default:
          return
      }
      if (field) {
        const idx = field.indexOf(value)
        if (idx !== -1) {
          field.splice(idx, 1)
        }
      }
    },

    setFilters(filters: Record<string, any>) {
      Object.assign(this, filters)
    },

    resetFilters() {
      this.search = ''
      this.location = ''
      this.minSalary = undefined
      this.maxSalary = undefined
      this.timeframe = ''
      this.workType = ''
      this.level = ''
      this.skills = []
      this.markets = []
      this.companySizes = []
      this.contract = []
      this.roles = []
      this.currency = ''
      this.sortByCompany = false
    },

    // Selected buttons actions
    addSelectedBtn(value: string) {
      if (!this.selectedBtns.includes(value)) this.selectedBtns.push(value)
    },

    removeSelectedBtn(value: string) {
      this.selectedBtns = this.selectedBtns.filter((v) => v !== value)
    },

    clearSelectedBtns() {
      this.selectedBtns = []
    },

    toggleSelectedBtn(value: string) {
      if (this.selectedBtns.includes(value)) this.removeSelectedBtn(value)
      else this.addSelectedBtn(value)
    },

    /**
     * Handle filter click from job cards: intelligently categorize the clicked value
     * and update the appropriate filter field (level, roles, skills, etc.).
     */
    onFilterClick(value: string, filterType: 'role' | 'level' | 'skills') {
      let field: string[] | undefined
      switch (filterType) {
        case 'role':
          field = this.roles
          break
        case 'level':
          const levelObj = levelsOptions.find((l) => l.label === value || l.value === value)
          if (levelObj) {
            this.level = levelObj.value
            return
          }
          break
        case 'skills':
          field = this.skills
          value = value.toLowerCase().replace(/\s+/g, '-')
          break
        default:
          return
      }
      if (field && !field.includes(value)) {
        field.push(value)
      }
    },

    loadFromObject(data: Record<string, any>) {
      console.log('Loading filters from URL:', data)

      if (data.search !== undefined) this.search = String(data.search)
      if (data.location !== undefined) this.location = String(data.location)
      if (data.workType !== undefined) this.workType = String(data.workType)
      if (data.level !== undefined) this.level = String(data.level)
      if (data.currency !== undefined) this.currency = String(data.currency)
      if (data.minSalary !== undefined) this.minSalary = Number(data.minSalary)
      if (data.maxSalary !== undefined) this.maxSalary = Number(data.maxSalary)
      if (data.timeframe !== undefined) this.timeframe = String(data.timeframe)
      if (data.sortByCompany !== undefined) this.sortByCompany = data.sortByCompany === 'true'

      if (data.skills !== undefined) {
        this.skills =
          typeof data.skills === 'string'
            ? data.skills.split(',').filter(Boolean)
            : Array.isArray(data.skills)
              ? data.skills
              : []
      }

      if (data.markets !== undefined) {
        this.markets =
          typeof data.markets === 'string'
            ? data.markets.split(',').filter(Boolean)
            : Array.isArray(data.markets)
              ? data.markets
              : []
      }

      if (data.roles !== undefined) {
        this.roles =
          typeof data.roles === 'string'
            ? data.roles.split(',').filter(Boolean)
            : Array.isArray(data.roles)
              ? data.roles
              : []
      }

      if (data.companySizes !== undefined) {
        this.companySizes =
          typeof data.companySizes === 'string'
            ? data.companySizes.split(',').filter(Boolean)
            : Array.isArray(data.companySizes)
              ? data.companySizes
              : []
      }

      if (data.contract !== undefined) {
        this.contract =
          typeof data.contract === 'string'
            ? data.contract.split(',').filter(Boolean)
            : Array.isArray(data.contract)
              ? data.contract
              : []
      }

      console.log('Store after loading:', {
        workType: this.workType,
        level: this.level,
        skills: this.skills,
        markets: this.markets,
        roles: this.roles,
      })
    },

    /**
     * Export filter state as an object (used to build query string)
     */
    toQueryObject(): Record<string, any> {
      const query: Record<string, any> = {}

      if (this.search) query.search = this.search
      if (this.location) query.location = this.location
      if (this.workType) query.workType = this.workType
      if (this.level) query.level = this.level
      if (this.currency) query.currency = this.currency
      if (this.minSalary !== undefined) query.minSalary = this.minSalary
      if (this.maxSalary !== undefined) query.maxSalary = this.maxSalary
      if (this.timeframe) query.timeframe = this.timeframe
      if (this.sortByCompany) query.sortByCompany = 'true'

      if (this.skills.length > 0) query.skills = this.skills.join(',')
      if (this.markets.length > 0) query.markets = this.markets.join(',')
      if (this.roles.length > 0) query.roles = this.roles.join(',')
      if (this.companySizes.length > 0) query.companySizes = this.companySizes.join(',')
      if (this.contract.length > 0) query.contract = this.contract.join(',')

      return query
    },
  },
})

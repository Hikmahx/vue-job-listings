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
  country: string
  minSalary: number | undefined
  maxSalary: number | undefined
  workType: string
  level: string
  skills: string[]
  markets: string[]
  companySizes: string[]
  contract: string[]
  roles: string[]
  currency: string
  sortByDate: boolean
}

export const useFilterStore = defineStore('filterStore', {
  state: (): FilterFields & { selectedBtns: string[] } => ({
    search: '',
    country: '',
    minSalary: undefined,
    maxSalary: undefined,
    workType: '',
    level: '',
    skills: [],
    markets: [],
    companySizes: [],
    contract: [],
    roles: [],
    currency: '',
    sortByDate: false,
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
    removeFilterValue(value: string, filterType: 'role' | 'level' | 'language' | 'tool') {
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
        case 'language':
          field = this.skills
          break
        case 'tool':
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
    // Filter field actions
    updateField<K extends keyof FilterFields>(field: K, value: FilterFields[K]) {
      // Use Pinia's $patch for a clean, typed update
      this.$patch({ [field]: value } as Partial<FilterFields>)
    },

    updateMultipleFields(item: Partial<FilterFields>) {
      // Patch multiple fields at once; typed as Partial<FilterFields>
      this.$patch(item)
    },

    /**
     * Alias with a clearer name for updating multiple filter fields at once.
     * Use this from components when you want to set several fields in one call.
     */
    setFilters(item: Partial<FilterFields>) {
      this.updateMultipleFields(item)
    },

    resetFilters() {
      this.search = ''
      this.country = ''
      this.minSalary = undefined
      this.maxSalary = undefined
      this.workType = ''
      this.level = ''
      this.skills = []
      this.markets = []
      this.companySizes = []
      this.contract = []
      this.roles = []
      this.currency = ''
      this.sortByDate = false
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
    onFilterClick(value: string, filterType: 'role' | 'level' | 'language' | 'tool') {
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
        case 'language':
          // Normalize skill/language values to match SearchableMultiSelect option values
          field = this.skills
          value = value.toLowerCase().replace(/\s+/g, '-')
          break
        case 'tool':
          // Tools are stored alongside skills (normalized)
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
  },
})

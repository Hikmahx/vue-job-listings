<script setup lang="ts">
import { inject, computed } from 'vue'
import FilterBtn from './FilterBtn.vue'
import { levels } from '@/constants/filters'

const filters = inject('filters')
const groupedFilters = inject('groupedFilters')

const formatSalary = (salary: number) => {
  if (salary >= 1000000) return `${(salary / 1000000).toFixed(0)}M`
  if (salary >= 1000) return `${(salary / 1000).toFixed(0)}k`
  return salary.toString()
}

const selectedBtns = computed(() => {
  const filterData = groupedFilters(filters.value)
  const btns = []

  for (const item of filterData) {
    const [key, value] = Object.entries(item)[0]

    if (key === 'search' || key === 'country' || key === 'sortByDate') continue

    switch (key) {
      case 'workType':
        btns.push({
          text: value.charAt(0).toUpperCase() + value.slice(1),
          key: 'workType',
          value: '',
        })
        break

      case 'level':
        const lang = levels.find((opt) => opt.value === value)
        btns.push({
          text: lang?.label || value,
          key: 'level',
          value: '',
        })
        break

      // case 'level':
      //   btns.push({
      //     text: value.charAt(0).toUpperCase() + value.slice(1),
      //     key: 'level',
      //     value: '',
      //   })
      //   break

      // spokenLanguages removed

      case 'minSalary':
      case 'maxSalary':
        const min = filterData.find((item) => item.minSalary)?.['minSalary']
        const max = filterData.find((item) => item.maxSalary)?.['maxSalary']
        const currency = filterData.find((item) => item.currency)?.['currency'] || ''

        let salaryText = ''
        if (min && max)
          salaryText = `${currency}${formatSalary(min)}-${currency}${formatSalary(max)}`
        else if (min) salaryText = `>${currency}${formatSalary(min)}`
        else if (max) salaryText = `<${currency}${formatSalary(max)}`

        if (salaryText && !btns.some((btn) => btn.key === 'salary')) {
          btns.push({
            text: salaryText,
            key: 'salary',
            value: { minSalary: undefined, maxSalary: undefined, currency: '' },
          })
        }
        break

      case 'skills':
      case 'markets':
      case 'companySizes':
      case 'contract':
      case 'roles':
        if (typeof value === 'number') {
          btns.push({
            text: value === 1 ? filters.value[key][0] : `${key} • ${value}`,
            key: key,
            value: [],
          })
        } else {
          btns.push({
            text: value,
            key: key,
            value: [],
          })
        }
        break
    }
  }

  return btns
})

const removeBtn = (btnText) => {
  const btnToRemove = selectedBtns.value.find((btn) => btn.text === btnText)

  if (btnToRemove) {
    if (btnToRemove.key === 'salary') {
      filters.value.minSalary = undefined
      filters.value.maxSalary = undefined
      filters.value.currency = ''
    } else {
      filters.value[btnToRemove.key] = btnToRemove.value
    }
    groupedFilters(filters.value)
  }
}

const clearAllBtns = () => {
  Object.assign(filters.value, {
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
  })
  groupedFilters(filters.value)
}
</script>

<template>
  <div :class="`${selectedBtns.length > 0 ? 'block' : 'hidden'} border-t pt-5`">
    <div class="w-full relative h-auto">
      <div class="flex flex-wrap gap-4">
        <FilterBtn :btns="selectedBtns.map((btn) => btn.text)" :removeBtn="removeBtn" />
      </div>
      <button
        class="absolute right-6 top-4 text-teal-600 font-semibold cursor-pointer hover:underline"
        @click="clearAllBtns"
      >
        Clear
      </button>
    </div>
  </div>
</template>

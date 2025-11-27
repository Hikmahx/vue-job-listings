<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useFilterStore } from '@/stores/FilterStore'
import FilterBtn from './FilterBtn.vue'
import { levelsOptions, skillsOptions, marketsOptions, rolesOptions } from '@/constants/filters'

const filterStore = useFilterStore()
const { groupedFilters, skills, markets, companySizes, contract, roles, workType, level } =
  storeToRefs(filterStore)

onMounted(() => {
  console.log('On mount filter data', {
    workType: workType.value,
    level: level.value,
    skills: skills.value,
    markets: markets.value,
    roles: roles.value,
    companySizes: companySizes.value,
    contract: contract.value,
  })
  console.log('Grouped filters', groupedFilters.value)
})

const formatSalary = (salary: number) => {
  if (salary >= 1000000) return `${(salary / 1000000).toFixed(0)}M`
  if (salary >= 1000) return `${(salary / 1000).toFixed(0)}k`
  return salary.toString()
}

const selectedBtns = computed(() => {
  const filterData = (groupedFilters.value ?? []) as Array<Record<string, unknown>>
  const btns: Array<{ text: string; key: string; value: unknown }> = []

  for (const item of filterData) {
    const entries = Object.entries(item || {})
    const first = entries[0]
    if (!first) continue
    const [key, value] = first

    if (key === 'search' || key === 'country' || key === 'sortByCompany') continue

    switch (key) {
      case 'workType':
        btns.push({
          text: String(value).replace(/^./, (c) => c.toUpperCase()),
          key: 'workType',
          value: '',
        })
        break

      case 'level':
        const lang = levelsOptions.find((opt) => opt.value === value)
        btns.push({ text: lang?.label || String(value), key: 'level', value: '' })
        break

      case 'minSalary':
      case 'maxSalary':
        const foundMin = filterData.find((it) => it && 'minSalary' in it) as any
        const foundMax = filterData.find((it) => it && 'maxSalary' in it) as any
        const foundCurrency = filterData.find((it) => it && 'currency' in it) as any

        const min = foundMin?.minSalary as number | undefined
        const max = foundMax?.maxSalary as number | undefined
        const currency = (foundCurrency?.currency as string) || ''

        let salaryText = ''
        if (min && max)
          salaryText = `${currency}${formatSalary(min)}-${currency}${formatSalary(max)}`
        else if (min) salaryText = `>${currency}${formatSalary(min)}`
        else if (max) salaryText = `<${currency}${formatSalary(max)}`

        if (salaryText && !btns.some((b) => b.key === 'salary')) {
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
        // Map stored values back to a human-friendly label.
        const arrays: Record<string, string[] | undefined> = {
          skills: skills.value,
          markets: markets.value,
          companySizes: companySizes.value,
          contract: contract.value,
          roles: roles.value,
        }
        const arr = arrays[key] as string[] | undefined
        if (typeof value === 'number') {
          btns.push({ text: value === 1 ? (arr?.[0] ?? '') : `${key} • ${value}`, key, value: [] })
        } else {
          // For skills and markets, stored values may be normalized (e.g. 'javascript')
          let label = String(value)
          if (key === 'skills') {
            const found = skillsOptions.find(
              (s) => s.toLowerCase().replace(/\s+/g, '-') === String(value),
            )
            label = found ?? String(value)
          } else if (key === 'markets') {
            const found = marketsOptions.find(
              (m) => m.toLowerCase().replace(/\s+/g, '-') === String(value),
            )
            label = found ?? String(value)
          } else if (key === 'roles') {
            // roles are stored as plain labels
            const found = rolesOptions.find((r) => r === String(value))
            label = found ?? String(value)
          }
          btns.push({ text: label, key, value: [] })
        }
        break
    }
  }

  return btns
})

const removeBtn = (btnText: string) => {
  const btnToRemove = selectedBtns.value.find((btn) => btn.text === btnText)

  if (btnToRemove) {
    if (btnToRemove.key === 'salary') {
      // Clear salary fields in one call
      filterStore.setFilters({ minSalary: undefined, maxSalary: undefined, currency: '' })
    } else {
      const key = btnToRemove.key as keyof import('@/stores/FilterStore').FilterFields
      filterStore.setFilters({ [key]: btnToRemove.value } as any)
    }
  }
}

const clearAllBtns = () => {
  filterStore.resetFilters()
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

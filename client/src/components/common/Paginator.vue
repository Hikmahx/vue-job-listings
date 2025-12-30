<script setup lang="ts">
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination'

interface Props {
  totalPages: number
  currentPage: number
  itemsPerPage?: number
}

const props = withDefaults(defineProps<Props>(), {
  itemsPerPage: 10,
})

const emit = defineEmits<{
  (e: 'change', page: number): void
}>()
</script>

<template>
  <Pagination
    :items-per-page="itemsPerPage"
    :total="totalPages * itemsPerPage"
    :default-page="currentPage"
    @update:page="emit('change', $event)"
    v-slot="{ page }"
  >
    <PaginationContent v-slot="{ items }">
      <PaginationPrevious />

      <div v-for="(item, index) in items" :key="index">
        <PaginationItem
          v-if="item.type === 'page'"
          :value="item.value"
          :is-active="item.value === page"
        >
          {{ item.value }}
        </PaginationItem>

        <PaginationEllipsis
          v-else
          :index="index"
        />
      </div>

      <PaginationNext />
    </PaginationContent>
  </Pagination>
</template>

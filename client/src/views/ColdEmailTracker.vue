<script setup lang="ts">
/**
 * ColdEmailTracker.vue — mirrors MERN ColdEmailTracker.tsx exactly.
 * Same stats panels, same filter bar, same table layout, same modal flow.
 */
import { ref, computed, onMounted } from 'vue'
import {
  Plus, Trash2, Download, Search, ChevronDown, ChevronUp,
  Loader2, AlertCircle, Inbox, Eye, Pencil, MessageCircle,
  FileUp, Edit3, MailOpen, Reply, Ban, CheckCircle,
  Building2, Calendar, Tag, CheckCheck,
} from 'lucide-vue-next'
import type { ColdEmailEntry, ColdEmailStatus, ColdEmailFollowUp } from '@/types/coldEmail'
import { coldEmailService } from '@/services/coldEmailService'
import ColdEmailEntryModal from '@/components/cold-email/ColdEmailEntryModal.vue'

// ── status config 
const STATUS_CONFIG = {
  opened:  { label: 'Opened',  icon: MailOpen,      cls: 'bg-amber-100 text-amber-800 border-amber-200' },
  replied: { label: 'Replied', icon: Reply,         cls: 'bg-orange-100 text-orange-800 border-orange-200' },
  ignored: { label: 'Ignored', icon: Ban,           cls: 'bg-red-100 text-red-800 border-red-200' },
  booked:  { label: 'Booked',  icon: CheckCircle,   cls: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
} as const

function fmtDate(v: string): string {
  if (!v) return '—'
  const s = String(v).slice(0, 10)
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) return '—'
  try { return new Date(s + 'T12:00:00').toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) }
  catch { return s }
}

function truncate(str: string, n: number): string {
  return str.length > n ? str.slice(0, n) + '…' : str
}

// ── state 
const entries        = ref<ColdEmailEntry[]>([])
const loading        = ref(true)
const error          = ref<string | null>(null)
const search         = ref('')
const statusFilter   = ref<ColdEmailStatus | 'all'>('all')
const selectedTags   = ref<string[]>([])
const companyFilter  = ref('all')
const sortBy         = ref<'company' | 'updatedAt' | 'date'>('updatedAt')
const sortDesc       = ref(true)
const modalOpen      = ref(false)
const editingEntry   = ref<ColdEmailEntry | null>(null)
const addDropOpen    = ref(false)
const filterCo       = ref(false)
const filterSt       = ref(false)
const filterTg       = ref(false)
const importing      = ref(false)
const fileInput      = ref<HTMLInputElement | null>(null)

// ── data ─────────────────────────────────────────────────────────────────────
async function fetchEntries() {
  loading.value = true; error.value = null
  try { entries.value = await coldEmailService.getEntries() }
  catch (e: unknown) {
    const err = e as { response?: { data?: { message?: string } }; message?: string }
    error.value = err?.response?.data?.message || err?.message || 'Failed to load entries'
    entries.value = []
  } finally { loading.value = false }
}
onMounted(fetchEntries)

// ── derived ──────────────────────────────────────────────────────────────────
const allTags = computed(() => {
  const s = new Set<string>()
  entries.value.forEach(e => (e.tags ?? []).forEach(t => s.add(t)))
  return Array.from(s).sort()
})
const allCompanies = computed(() => {
  const s = new Set(entries.value.map(e => e.company).filter(Boolean))
  return Array.from(s).sort()
})

const filtered = computed(() => {
  let list = entries.value.filter(e => {
    const q = search.value.toLowerCase()
    const matchSearch = !q || [e.company, e.roleApplyingFor, e.notes,
      ...(e.recipients ?? []).flatMap(r => [r.fullName, r.email])]
      .some(s => String(s).toLowerCase().includes(q))
    const matchStatus  = statusFilter.value === 'all' || e.status === statusFilter.value
    const matchTag     = selectedTags.value.length === 0 || (e.tags ?? []).some(t => selectedTags.value.includes(t))
    const matchCompany = companyFilter.value === 'all' || e.company === companyFilter.value
    return matchSearch && matchStatus && matchTag && matchCompany
  })
  return [...list].sort((a, b) => {
    if (sortBy.value === 'company') {
      const c = a.company.localeCompare(b.company, undefined, { numeric: true })
      return sortDesc.value ? -c : c
    }
    if (sortBy.value === 'date') {
      const c = (a.message?.date ?? '').localeCompare(b.message?.date ?? '')
      return sortDesc.value ? -c : c
    }
    const c = (a.updatedAt || '').localeCompare(b.updatedAt || '', undefined, { numeric: true })
    return sortDesc.value ? -c : c
  })
})

const followUpCols = computed(() => {
  if (!filtered.value.length) return 1
  return Math.min(4, Math.max(...filtered.value.map(e => (e.followUps ?? []).length), 1))
})

const stats = computed(() => {
  const total   = entries.value.length
  const replied = entries.value.filter(e => e.status === 'replied' || e.status === 'booked' || e.message?.response).length
  const opened  = entries.value.filter(e => e.status === 'opened').length
  return { total, replied, opened }
})

// ── actions ──────────────────────────────────────────────────────────────────
function openAdd()   { addDropOpen.value = false; editingEntry.value = null; modalOpen.value = true }
function openEdit(e: ColdEmailEntry) { editingEntry.value = e; modalOpen.value = true }

function handleSaved(saved: ColdEmailEntry) {
  const idx = entries.value.findIndex(e => e.id === saved.id)
  if (idx >= 0) { const next = [...entries.value]; next[idx] = saved; entries.value = next }
  else entries.value = [saved, ...entries.value]
  modalOpen.value = false; editingEntry.value = null
}

async function saveModal(id: string | null, data: Partial<ColdEmailEntry>): Promise<ColdEmailEntry> {
  return id ? coldEmailService.update(id, data) : coldEmailService.create(data)
}

async function updateStatus(entry: ColdEmailEntry, status: ColdEmailStatus) {
  try {
    const updated = await coldEmailService.update(entry.id, { ...entry, status })
    entries.value = entries.value.map(e => e.id === entry.id ? updated : e)
  } catch (e: unknown) {
    const err = e as { response?: { data?: { message?: string } }; message?: string }
    error.value = err?.response?.data?.message || err?.message || 'Failed to update status'
  }
}

async function toggleFollowUpRead(entry: ColdEmailEntry, index: number) {
  const list = [...(entry.followUps ?? [{ date: '', read: false }])]
  while (list.length <= index) list.push({ date: '', read: false })
  list[index] = { ...list[index], read: !list[index].read }
  try {
    const updated = await coldEmailService.update(entry.id, { ...entry, followUps: list })
    entries.value = entries.value.map(e => e.id === entry.id ? updated : e)
  } catch (e: unknown) {
    const err = e as { response?: { data?: { message?: string } }; message?: string }
    error.value = err?.response?.data?.message || err?.message || 'Failed to update'
  }
}

async function deleteRow(id: string) {
  if (!window.confirm('Delete this cold email entry?')) return
  error.value = null
  try { await coldEmailService.delete(id); entries.value = entries.value.filter(e => e.id !== id) }
  catch (e: unknown) {
    const err = e as { response?: { data?: { message?: string } }; message?: string }
    error.value = err?.response?.data?.message || err?.message || 'Failed to delete'
  }
}

function toggleTag(tag: string) {
  selectedTags.value = selectedTags.value.includes(tag)
    ? selectedTags.value.filter(t => t !== tag)
    : [...selectedTags.value, tag]
}

function handleExport() {
  const header = 'company,roleApplyingFor,recipientName,recipientEmail,status,date,notes,tags'
  const rows = filtered.value.map(e => {
    const r = e.recipients?.[0]
    return [e.company, e.roleApplyingFor, r?.fullName ?? '', r?.email ?? '',
      e.status, e.message?.date ?? '', e.notes, (e.tags ?? []).join(';')]
      .map(v => `"${String(v).replace(/"/g, '""')}"`)
      .join(',')
  })
  const csv = [header, ...rows].join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url; a.download = `cold-email-tracker-${new Date().toISOString().slice(0, 10)}.csv`; a.click()
  URL.revokeObjectURL(url)
}

async function handleFileChange(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0];
  (e.target as HTMLInputElement).value = ''
  if (!file) return
  importing.value = true; error.value = null
  try {
    const text = await file.text()
    const lines = text.trim().split('\n').slice(1) // skip header
    for (const line of lines) {
      const cols = line.split(',').map(c => c.replace(/^"|"$/g, '').replace(/""/g, '"'))
      if (!cols[0] && !cols[1]) continue
      await coldEmailService.create({
        company: cols[0] ?? '', roleApplyingFor: cols[1] ?? '',
        recipients: cols[2] || cols[3] ? [{ fullName: cols[2] ?? '', email: cols[3] ?? '', avatar: '' }] : [],
        status: (['opened','replied','ignored','booked'].includes(cols[4]) ? cols[4] : 'ignored') as ColdEmailStatus,
        notes: cols[6] ?? '',
        tags: cols[7] ? cols[7].split(';').filter(Boolean) : [],
      })
    }
    await fetchEntries()
  } catch (e: unknown) {
    const err = e as { response?: { data?: { message?: string } }; message?: string }
    error.value = err?.response?.data?.message || err?.message || 'Import failed'
  } finally { importing.value = false }
}

function closeDropdowns() { filterCo.value = false; filterSt.value = false; filterTg.value = false }
</script>

<template>
  <div class="space-y-8">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 class="text-2xl font-semibold text-slate-900 tracking-tight">Cold Email Tracker</h1>
        <p class="mt-1 text-sm text-slate-500">Track outreach, read receipts, and responses</p>
      </div>
      <div class="flex items-center gap-2">
        <!-- Add dropdown -->
        <div class="relative">
          <button type="button" @click="addDropOpen = !addDropOpen"
            class="inline-flex items-center gap-2 bg-cyan-400 hover:bg-cyan-500 text-white px-4 py-2.5 rounded-lg text-sm font-medium shadow-sm">
            <Plus class="w-4 h-4" /> Add entry <ChevronDown class="w-4 h-4 opacity-80" />
          </button>
          <template v-if="addDropOpen">
            <div class="fixed inset-0 z-10" aria-hidden @click="addDropOpen = false" />
            <div class="absolute right-0 top-full mt-1.5 py-1 bg-white rounded-lg shadow-lg border border-slate-200 z-20 min-w-[200px]">
              <button type="button" @click="() => { addDropOpen = false; fileInput?.click() }" :disabled="importing"
                class="w-full flex items-center gap-2.5 px-4 py-2.5 text-left text-slate-700 hover:bg-slate-50 text-sm disabled:opacity-60">
                <Loader2 v-if="importing" class="w-4 h-4 animate-spin shrink-0 text-cyan-400" />
                <FileUp v-else class="w-4 h-4 shrink-0 text-slate-400" /> Import CSV
              </button>
              <button type="button" @click="openAdd"
                class="w-full flex items-center gap-2.5 px-4 py-2.5 text-left text-slate-700 hover:bg-slate-50 text-sm">
                <Edit3 class="w-4 h-4 shrink-0 text-slate-400" /> Manual entry
              </button>
            </div>
          </template>
        </div>
        <input ref="fileInput" type="file" accept=".csv" class="hidden" @change="handleFileChange" />
        <button type="button" @click="handleExport"
          class="inline-flex items-center gap-2 bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 px-4 py-2.5 rounded-lg text-sm font-medium shadow-sm">
          <Download class="w-4 h-4" /> Export CSV
        </button>
      </div>
    </div>

    <!-- Error banner -->
    <div v-if="error" class="flex items-center gap-3 px-4 py-3 bg-amber-50 border border-amber-200/80 rounded-lg text-amber-800 text-sm">
      <AlertCircle class="w-5 h-5 shrink-0" />
      <p class="flex-1 font-medium">{{ error }}</p>
      <button type="button" class="text-amber-600 hover:text-amber-800 font-medium" @click="error = null">Dismiss</button>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="flex flex-col items-center justify-center min-h-[400px]">
      <Loader2 class="w-10 h-10 text-cyan-400 animate-spin mb-4" />
      <p class="text-slate-500 font-medium">Loading…</p>
    </div>

    <template v-else>
      <!-- Search + date sort -->
      <div class="flex flex-col sm:flex-row gap-3 sm:items-center">
        <div class="relative flex-1 max-w-md">
          <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          <input v-model="search" type="text" placeholder="Search"
            class="w-full pl-9 pr-3 py-2.5 border border-slate-200 rounded-lg text-sm placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-cyan-400 bg-white" />
        </div>
        <div class="flex items-center gap-2">
          <span class="text-sm text-slate-500">Date</span>
          <button type="button" @click="() => { sortBy = 'date'; sortDesc = !sortDesc }"
            class="inline-flex items-center gap-2 px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-700 bg-white hover:bg-slate-50">
            <Calendar class="w-4 h-4 text-slate-400" />
            {{ sortBy === 'date' ? (sortDesc ? 'Newest first' : 'Oldest first') : 'Date' }}
            <ChevronDown class="w-4 h-4" />
          </button>
        </div>
      </div>

      <!-- Stats panels -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div class="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
          <h3 class="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">Initiation</h3>
          <div class="grid grid-cols-2 gap-4">
            <div class="flex items-start gap-3">
              <div class="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center shrink-0"><Inbox class="w-5 h-5 text-slate-600" /></div>
              <div><p class="text-2xl font-semibold text-slate-900 tabular-nums">{{ stats.total }}</p><p class="text-sm text-slate-500">Total entries</p></div>
            </div>
            <div class="flex items-start gap-3">
              <div class="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center shrink-0"><MessageCircle class="w-5 h-5 text-slate-600" /></div>
              <div><p class="text-2xl font-semibold text-slate-900 tabular-nums">{{ stats.total }}</p><p class="text-sm text-slate-500">Sent</p></div>
            </div>
          </div>
        </div>
        <div class="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
          <h3 class="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">Engagement</h3>
          <div class="grid grid-cols-2 gap-4">
            <div class="flex items-start gap-3">
              <div class="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center shrink-0"><MailOpen class="w-5 h-5 text-amber-600" /></div>
              <div><p class="text-2xl font-semibold text-slate-900 tabular-nums">{{ stats.opened }}</p><p class="text-sm text-slate-500">Opened</p></div>
            </div>
            <div class="flex items-start gap-3">
              <div class="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center shrink-0"><Reply class="w-5 h-5 text-emerald-600" /></div>
              <div><p class="text-2xl font-semibold text-slate-900 tabular-nums">{{ stats.replied }}</p><p class="text-sm text-slate-500">Replied</p></div>
            </div>
          </div>
        </div>
      </div>

      <!-- Filter bar -->
      <div class="flex flex-wrap items-center gap-2">
        <!-- Company -->
        <div class="relative">
          <button type="button" @click="() => { filterCo = !filterCo; filterSt = false; filterTg = false }"
            class="inline-flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-full text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 shadow-sm">
            <Building2 class="w-4 h-4 text-slate-500" /> Company <ChevronDown class="w-4 h-4" />
          </button>
          <template v-if="filterCo">
            <div class="fixed inset-0 z-10" aria-hidden @click="filterCo = false" />
            <div class="absolute left-0 top-full mt-1 py-1 bg-white rounded-lg shadow-lg border border-slate-200 z-20 min-w-[200px] max-h-60 overflow-y-auto">
              <button type="button" @click="() => { companyFilter = 'all'; filterCo = false }" class="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50">All companies</button>
              <button v-for="c in allCompanies" :key="c" type="button" @click="() => { companyFilter = c; filterCo = false }" class="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50">{{ c }}</button>
            </div>
          </template>
        </div>
        <!-- Status -->
        <div class="relative">
          <button type="button" @click="() => { filterSt = !filterSt; filterCo = false; filterTg = false }"
            class="inline-flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-full text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 shadow-sm">
            <MailOpen class="w-4 h-4 text-slate-500" /> Status <ChevronDown class="w-4 h-4" />
          </button>
          <template v-if="filterSt">
            <div class="fixed inset-0 z-10" aria-hidden @click="filterSt = false" />
            <div class="absolute left-0 top-full mt-1 py-1 bg-white rounded-lg shadow-lg border border-slate-200 z-20 min-w-[160px]">
              <button type="button" @click="() => { statusFilter = 'all'; filterSt = false }" class="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50">All statuses</button>
              <button v-for="s in Object.keys(STATUS_CONFIG)" :key="s" type="button"
                @click="() => { statusFilter = s as ColdEmailStatus; filterSt = false }"
                class="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50">{{ STATUS_CONFIG[s as ColdEmailStatus].label }}</button>
            </div>
          </template>
        </div>
        <!-- Tags -->
        <div class="relative">
          <button type="button" @click="() => { filterTg = !filterTg; filterCo = false; filterSt = false }"
            :class="['inline-flex items-center gap-2 px-4 py-2 border rounded-full text-sm font-medium shadow-sm', filterTg ? 'border-cyan-300 bg-cyan-50/50 text-cyan-800' : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50']">
            <Tag class="w-4 h-4 text-slate-500" /> Tags
            <span v-if="selectedTags.length > 0" class="bg-cyan-100 text-cyan-800 text-xs px-1.5 py-0.5 rounded-full">{{ selectedTags.length }}</span>
            <ChevronDown class="w-4 h-4" />
          </button>
          <template v-if="filterTg">
            <div class="fixed inset-0 z-10" aria-hidden @click="filterTg = false" />
            <div class="absolute left-0 top-full mt-1 py-2 bg-white rounded-lg shadow-lg border border-slate-200 z-20 min-w-[220px] max-h-60 overflow-y-auto">
              <p v-if="!allTags.length" class="px-4 py-2 text-sm text-slate-500">No tags yet</p>
              <label v-for="t in allTags" :key="t" class="flex items-center gap-2 px-4 py-2 hover:bg-slate-50 cursor-pointer">
                <input type="checkbox" :checked="selectedTags.includes(t)" @change="toggleTag(t)" class="rounded border-slate-300 text-cyan-600 focus:ring-cyan-400" />
                <span class="text-sm text-slate-700">{{ t }}</span>
              </label>
            </div>
          </template>
        </div>
      </div>

      <!-- Table -->
      <div class="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead>
              <tr class="border-b border-slate-200 bg-slate-50/80">
                <th class="text-left px-3 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">Recipients</th>
                <th class="text-left px-3 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">Role</th>
                <th class="text-left px-3 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  <button type="button" class="flex items-center gap-1 hover:text-slate-700"
                    @click="() => { sortBy = 'company'; sortDesc = !sortDesc }">
                    Company
                    <ChevronDown v-if="sortBy !== 'company' || sortDesc" class="w-3.5 h-3.5" :class="sortBy !== 'company' ? 'opacity-50' : ''" />
                    <ChevronUp v-else class="w-3.5 h-3.5" />
                  </button>
                </th>
                <th class="text-left px-3 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">Message</th>
                <th class="text-left px-3 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">Date</th>
                <th v-for="n in followUpCols" :key="n" class="text-left px-3 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">Flw-up {{ n }}</th>
                <th class="text-left px-3 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                <th class="text-left px-3 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">Tags</th>
                <th class="text-left px-3 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">Notes</th>
                <th class="text-right px-3 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wider w-24">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              <!-- Empty state -->
              <tr v-if="!filtered.length">
                <td :colspan="9 + followUpCols" class="px-6 py-20 text-center">
                  <div class="flex flex-col items-center text-slate-500">
                    <div class="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center mb-4"><Inbox class="w-7 h-7 text-slate-400" /></div>
                    <p class="font-medium text-slate-600">{{ !entries.length ? 'No entries yet' : 'No matches' }}</p>
                    <p class="text-sm mt-1 max-w-sm">{{ !entries.length ? 'Add an entry or import CSV to get started.' : 'Try changing your filters.' }}</p>
                    <button v-if="!entries.length" type="button" @click="openAdd"
                      class="mt-5 inline-flex items-center gap-2 bg-cyan-400 hover:bg-cyan-500 text-white px-4 py-2.5 rounded-lg text-sm font-medium">
                      <Plus class="w-4 h-4" /> Add entry
                    </button>
                  </div>
                </td>
              </tr>

              <!-- Rows -->
              <tr v-for="entry in filtered" :key="entry.id" class="hover:bg-slate-50/50 transition-colors">
                <!-- Recipients -->
                <td class="px-3 py-2 align-middle">
                  <div class="flex items-center gap-2">
                    <template v-if="entry.recipients?.[0]">
                      <div v-if="entry.recipients[0].avatar" class="w-9 h-9 rounded-full object-cover ring-2 ring-white shadow-sm overflow-hidden">
                        <img :src="entry.recipients[0].avatar" alt="" class="w-full h-full object-cover" />
                      </div>
                      <div v-else class="w-9 h-9 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 text-slate-600 flex items-center justify-center text-sm font-semibold shadow-sm">
                        {{ (entry.recipients[0].fullName || entry.recipients[0].email || '?').slice(0,1).toUpperCase() }}
                      </div>
                      <div class="min-w-0">
                        <div class="font-medium text-slate-900 truncate max-w-[140px]">{{ entry.recipients[0].fullName || '—' }}</div>
                        <div class="text-xs text-slate-500 truncate max-w-[140px]">{{ entry.recipients[0].email || '—' }}</div>
                      </div>
                      <span v-if="entry.recipients.length > 1" class="shrink-0 text-xs font-medium text-slate-500 bg-slate-100/80 px-2 py-0.5 rounded-md">
                        +{{ entry.recipients.length - 1 }}
                      </span>
                    </template>
                    <span v-else class="text-slate-400">—</span>
                  </div>
                </td>

                <!-- Role -->
                <td class="px-3 py-2 text-sm text-slate-700">{{ entry.roleApplyingFor || '—' }}</td>

                <!-- Company -->
                <td class="px-3 py-2">
                  <div class="flex items-center gap-1.5">
                    <Building2 class="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span class="text-sm text-slate-900 truncate max-w-[120px]">{{ entry.company || '—' }}</span>
                  </div>
                </td>

                <!-- Message -->
                <td class="px-3 py-2 align-top" :title="[entry.message?.subject, entry.message?.emailSent].filter(Boolean).join('\n')">
                  <div class="min-w-[120px] max-w-[200px] relative pr-6">
                    <template v-if="entry.message?.subject || entry.message?.emailSent">
                      <div v-if="entry.message?.subject" class="text-slate-900 text-xs font-semibold truncate">{{ truncate(entry.message.subject, 28) }}</div>
                      <div v-if="entry.message?.emailSent" class="text-slate-600 text-xs truncate mt-0.5">{{ truncate(entry.message.emailSent, 32) }}</div>
                      <span :class="['absolute top-0 right-0 inline-flex shrink-0', entry.message?.read ? 'text-emerald-500' : 'text-slate-300']">
                        <CheckCheck class="w-4 h-4" />
                      </span>
                    </template>
                    <span v-else class="text-slate-400 text-xs">—</span>
                  </div>
                </td>

                <!-- Date -->
                <td class="px-3 py-2 text-xs text-slate-600">{{ fmtDate(entry.message?.date ?? '') }}</td>

                <!-- Follow-ups -->
                <td v-for="i in followUpCols" :key="i" class="px-3 py-2 align-top">
                  <div :class="['min-w-[70px] flex items-start justify-between gap-1', (entry.followUps?.[i-1]?.date ?? '').trim() ? 'relative pr-6' : '']">
                    <span class="text-xs text-slate-600">{{ (entry.followUps?.[i-1]?.date ?? '').trim() ? fmtDate(entry.followUps![i-1].date) : '—' }}</span>
                    <button v-if="(entry.followUps?.[i-1]?.date ?? '').trim()" type="button"
                      :class="['absolute top-0 right-0 p-0.5 rounded shrink-0', entry.followUps?.[i-1]?.read ? 'text-emerald-500 hover:text-emerald-600' : 'text-slate-300 hover:text-slate-400']"
                      :title="entry.followUps?.[i-1]?.read ? 'Mark unread' : 'Mark read'"
                      @click.prevent="toggleFollowUpRead(entry, i-1)">
                      <CheckCheck class="w-4 h-4" />
                    </button>
                  </div>
                </td>

                <!-- Status -->
                <td class="px-3 py-2">
                  <select :value="entry.status"
                    :class="['inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border cursor-pointer focus:outline-none', STATUS_CONFIG[entry.status as ColdEmailStatus]?.cls ?? STATUS_CONFIG.ignored.cls]"
                    @change="updateStatus(entry, ($event.target as HTMLSelectElement).value as ColdEmailStatus)">
                    <option v-for="s in Object.keys(STATUS_CONFIG)" :key="s" :value="s">{{ STATUS_CONFIG[s as ColdEmailStatus].label }}</option>
                  </select>
                </td>

                <!-- Tags -->
                <td class="px-3 py-2">
                  <div class="flex flex-wrap gap-1 max-w-[100px]">
                    <span v-for="t in (entry.tags ?? [])" :key="t" class="inline-flex px-1.5 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-700 truncate max-w-[80px]">{{ t }}</span>
                    <span v-if="!(entry.tags ?? []).length" class="text-slate-400 text-xs">—</span>
                  </div>
                </td>

                <!-- Notes -->
                <td class="px-3 py-2 text-sm text-slate-600 max-w-[100px] truncate" :title="entry.notes ?? undefined">{{ entry.notes || '—' }}</td>

                <!-- Actions -->
                <td class="px-3 py-2 text-right whitespace-nowrap">
                  <div class="flex items-center justify-end gap-0.5">
                    <button type="button" class="p-2 text-slate-400 hover:text-cyan-600 hover:bg-cyan-50/80 rounded-lg" title="Edit" @click="openEdit(entry)">
                      <Pencil class="w-4 h-4" />
                    </button>
                    <button type="button" class="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50/80 rounded-lg" title="Delete" @click="deleteRow(entry.id)">
                      <Trash2 class="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </template>

    <!-- Modal -->
    <ColdEmailEntryModal
      :key="editingEntry?.id ?? 'new'"
      :open="modalOpen"
      :entry="editingEntry"
      :save="saveModal"
      @close="() => { modalOpen = false; editingEntry = null }"
      @saved="handleSaved"
    />
  </div>
</template>

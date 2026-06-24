<script setup lang="ts">
import { ref, watch } from 'vue'
import type {
  ColdEmailEntry,
  ColdEmailMessage,
  ColdEmailRecipient,
  ColdEmailFollowUp,
} from '@/types/coldEmail'
import RecipientsList from './RecipientsList.vue'
import MessageSection from './MessageSection.vue'
import FollowUpsList from './FollowUpsList.vue'
import TagsInput from './TagsInput.vue'
import TextInput from './TextInput.vue'
import DateInput from './DateInput.vue'

const STATUS_OPTIONS = ['ignored', 'opened', 'replied', 'booked'] as const
const STATUS_LABELS: Record<string, string> = {
  opened: 'Opened',
  replied: 'Replied',
  ignored: 'Ignored',
  booked: 'Booked',
}

const emptyMessage = (): ColdEmailMessage => ({
  subject: '',
  date: '',
  read: false,
  response: false,
  emailSent: '',
})
const emptyFollowUp = (): ColdEmailFollowUp => ({ date: '', read: false })
const emptyRecipient = (): ColdEmailRecipient => ({ fullName: '', email: '', avatar: '' })

const props = defineProps<{
  open: boolean
  entry: ColdEmailEntry | null
  save: (id: string | null, data: Partial<ColdEmailEntry>) => Promise<ColdEmailEntry>
}>()

const emit = defineEmits<{ close: []; saved: [entry: ColdEmailEntry] }>()

const saving = ref(false)
const form = ref<Partial<ColdEmailEntry>>({
  company: '',
  roleApplyingFor: '',
  recipients: [emptyRecipient()],
  message: emptyMessage(),
  followUps: [emptyFollowUp()],
  status: 'ignored',
  tags: [],
  notes: '',
  followUpDate: '',
})

watch(
  () => props.open,
  (isOpen) => {
    if (!isOpen) return
    const e = props.entry
    if (e) {
      const recs = (e.recipients ?? []).length
        ? e.recipients
        : [{ fullName: e.contactNames ?? '', email: e.contactEmail ?? '', avatar: '' }]
      form.value = {
        company: e.company ?? '',
        roleApplyingFor: e.roleApplyingFor ?? '',
        recipients: recs.length ? recs : [emptyRecipient()],
        message: { ...emptyMessage(), ...e.message },
        followUps: (e.followUps ?? [emptyFollowUp()]).length >= 1 ? e.followUps : [emptyFollowUp()],
        status: e.status ?? 'ignored',
        tags: e.tags ?? [],
        notes: e.notes ?? '',
        followUpDate: e.followUpDate ?? '',
      }
    } else {
      form.value = {
        company: '',
        roleApplyingFor: '',
        recipients: [emptyRecipient()],
        message: emptyMessage(),
        followUps: [emptyFollowUp()],
        status: 'ignored',
        tags: [],
        notes: '',
        followUpDate: '',
      }
    }
  },
)

const updateRecipient = (index: number, patch: Partial<ColdEmailRecipient>) => {
  const list = [...(form.value.recipients ?? [emptyRecipient()])]
  list[index] = { ...list[index], ...patch }
  form.value = { ...form.value, recipients: list }
}
const addRecipient = () => {
  form.value = { ...form.value, recipients: [...(form.value.recipients ?? []), emptyRecipient()] }
}
const removeRecipient = (index: number) => {
  const list = (form.value.recipients ?? []).filter((_, i) => i !== index)
  form.value = { ...form.value, recipients: list.length ? list : [emptyRecipient()] }
}
const updateMessage = (patch: Partial<ColdEmailMessage>) => {
  form.value = { ...form.value, message: { ...(form.value.message ?? emptyMessage()), ...patch } }
}
const updateFollowUp = (index: number, patch: Partial<ColdEmailFollowUp>) => {
  const list = [...(form.value.followUps ?? [emptyFollowUp()])]
  while (list.length <= index) list.push(emptyFollowUp())
  list[index] = { ...list[index], ...patch }
  form.value = { ...form.value, followUps: list }
}
const addFollowUp = () => {
  const list = [...(form.value.followUps ?? [emptyFollowUp()])]
  if (list.length >= 4) return
  form.value = { ...form.value, followUps: [...list, emptyFollowUp()] }
}
const removeFollowUp = (index: number) => {
  const list = (form.value.followUps ?? [emptyFollowUp()]).filter((_, i) => i !== index)
  form.value = { ...form.value, followUps: list.length >= 1 ? list : [emptyFollowUp()] }
}
const addTag = (tag: string) => {
  form.value = { ...form.value, tags: [...(form.value.tags ?? []), tag] }
}
const removeTag = (index: number) => {
  form.value = { ...form.value, tags: (form.value.tags ?? []).filter((_, i) => i !== index) }
}

const handleSubmit = async () => {
  saving.value = true
  try {
    const fu = form.value.followUps ?? [emptyFollowUp()]
    const cleaned: ColdEmailFollowUp[] = [fu[0]].concat(
      fu.slice(1).filter((f) => (f?.date ?? '').trim() !== ''),
    )
    const validStatuses = ['opened', 'replied', 'ignored', 'booked']
    const status =
      form.value.status && validStatuses.includes(form.value.status) ? form.value.status : 'ignored'
    const payload = { ...form.value, followUps: cleaned, status }
    const saved = await props.save(props.entry?.id ?? null, payload)
    emit('saved', saved)
    emit('close')
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <Teleport to="body">
    <div v-if="open" class="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        class="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
        aria-hidden
        @click="emit('close')"
      />
      <div
        class="relative bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto border border-slate-200/80"
      >
        <div
          class="sticky top-0 bg-white/95 backdrop-blur border-b border-slate-100 px-6 py-4 flex items-center justify-between rounded-t-2xl"
        >
          <h2 class="text-lg font-semibold text-slate-900">
            {{ entry?.id ? 'Edit entry' : 'New entry' }}
          </h2>
          <button
            type="button"
            class="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
            @click="emit('close')"
          >
            ✕
          </button>
        </div>

        <form class="p-6 space-y-6" @submit.prevent="handleSubmit">
          <RecipientsList
            :recipients="form.recipients ?? []"
            @update="updateRecipient"
            @add="addRecipient"
            @remove="removeRecipient"
          />

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <TextInput
              label="Company"
              :model-value="form.company ?? ''"
              placeholder="Company name"
              @update:model-value="form.company = $event"
            />
            <TextInput
              label="Role applying for"
              :model-value="form.roleApplyingFor ?? ''"
              placeholder="e.g. Product Manager"
              @update:model-value="form.roleApplyingFor = $event"
            />
          </div>

          <MessageSection :message="form.message" @update="updateMessage" />

          <FollowUpsList
            :follow-ups="form.followUps ?? []"
            @update="updateFollowUp"
            @add="addFollowUp"
            @remove="removeFollowUp"
          />

          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1">Status</label>
            <select
              :value="form.status ?? 'ignored'"
              class="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-cyan-400"
              @change="
                form.status = ($event.target as HTMLSelectElement).value as ColdEmailEntry['status']
              "
            >
              <option v-for="s in STATUS_OPTIONS" :key="s" :value="s">
                {{ STATUS_LABELS[s] }}
              </option>
            </select>
          </div>

          <TagsInput :tags="form.tags ?? []" @add="addTag" @remove="removeTag" />

          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1">Notes</label>
            <textarea
              :value="form.notes ?? ''"
              rows="2"
              placeholder="Optional notes…"
              class="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm min-h-[60px] placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-cyan-400"
              @input="form.notes = ($event.target as HTMLTextAreaElement).value"
            />
          </div>

          <DateInput
            label="Follow-up date"
            :model-value="form.followUpDate"
            @update:model-value="form.followUpDate = $event"
          />

          <div class="flex justify-end gap-3 pt-5 border-t border-slate-100">
            <button
              type="button"
              class="px-4 py-2.5 text-slate-600 hover:bg-slate-100 rounded-lg font-medium"
              @click="emit('close')"
            >
              Cancel
            </button>
            <button
              type="submit"
              :disabled="saving"
              class="px-4 py-2.5 bg-cyan-400 hover:bg-cyan-500 text-white rounded-lg font-medium disabled:opacity-50 flex items-center gap-2 shadow-sm"
            >
              {{ saving ? 'Saving…' : entry?.id ? 'Save changes' : 'Create entry' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </Teleport>
</template>

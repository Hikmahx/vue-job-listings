import { useState, useEffect } from 'react'
import type {
  ColdEmailEntry,
  ColdEmailMessage,
  ColdEmailRecipient,
  ColdEmailFollowUp,
} from '../../types'
import { RecipientsList } from './RecipientsList'
import { MessageSection } from './MessageSection'
import { FollowUpsList } from './FollowUpsList'
import { TagsInput } from './TagsInput'
import { TextInput } from './TextInput'
import { DateInput } from './DateInput'

const STATUS_OPTIONS: ColdEmailEntry['status'][] = [
  'ignored',
  'opened',
  'replied',
  'booked',
]
const STATUS_LABELS: Record<ColdEmailEntry['status'], string> = {
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

const emptyRecipient = (): ColdEmailRecipient => ({
  fullName: '',
  email: '',
  avatar: '',
})

interface ColdEmailEntryModalProps {
  open: boolean
  onClose: () => void
  entry: ColdEmailEntry | null
  onSaved: (entry: ColdEmailEntry) => void
  save: (
    id: string | null,
    data: Partial<ColdEmailEntry>,
  ) => Promise<ColdEmailEntry>
}

export default function ColdEmailEntryModal({
  open,
  onClose,
  entry,
  onSaved,
  save,
}: ColdEmailEntryModalProps) {
  const isEdit = !!entry?.id
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState<Partial<ColdEmailEntry>>({
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

  useEffect(() => {
    if (!open) return
    if (entry) {
      const recs = (entry.recipients ?? []).length
        ? entry.recipients
        : [
            {
              fullName: entry.contactNames ?? '',
              email: entry.contactEmail ?? '',
              avatar: '',
            },
          ]
      const fu = entry.followUps ?? [emptyFollowUp()]
      setForm({
        company: entry.company ?? '',
        roleApplyingFor: entry.roleApplyingFor ?? '',
        recipients: recs.length ? recs : [emptyRecipient()],
        message: { ...emptyMessage(), ...entry.message },
        followUps: fu.length >= 1 ? fu : [emptyFollowUp()],
        status: entry.status ?? 'ignored',
        tags: entry.tags ?? [],
        notes: entry.notes ?? '',
        followUpDate: entry.followUpDate ?? '',
      })
    } else {
      setForm({
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
    }
  }, [open, entry])

  const update = (patch: Partial<ColdEmailEntry>) => {
    setForm((prev) => ({ ...prev, ...patch }))
  }

  const updateRecipient = (
    index: number,
    patch: Partial<ColdEmailRecipient>,
  ) => {
    setForm((prev) => {
      const list = [...(prev.recipients ?? [emptyRecipient()])]
      list[index] = { ...list[index], ...patch }
      return { ...prev, recipients: list }
    })
  }

  const addRecipient = () => {
    setForm((prev) => ({
      ...prev,
      recipients: [...(prev.recipients ?? []), emptyRecipient()],
    }))
  }

  const removeRecipient = (index: number) => {
    setForm((prev) => {
      const list = (prev.recipients ?? []).filter((_, i) => i !== index)
      return { ...prev, recipients: list.length ? list : [emptyRecipient()] }
    })
  }

  const addTag = (tag: string) => {
    setForm((prev) => ({ ...prev, tags: [...(prev.tags ?? []), tag] }))
  }

  const removeTag = (index: number) => {
    setForm((prev) => ({
      ...prev,
      tags: (prev.tags ?? []).filter((_, i) => i !== index),
    }))
  }

  const updateMessage = (patch: Partial<ColdEmailMessage>) => {
    setForm((prev) => ({
      ...prev,
      message: { ...(prev.message ?? emptyMessage()), ...patch },
    }))
  }

  const updateFollowUp = (index: number, patch: Partial<ColdEmailFollowUp>) => {
    setForm((prev) => {
      const list = [...(prev.followUps ?? [emptyFollowUp()])]
      while (list.length <= index) list.push(emptyFollowUp())
      list[index] = { ...list[index], ...patch }
      return { ...prev, followUps: list }
    })
  }

  const addFollowUp = () => {
    setForm((prev) => {
      const list = [...(prev.followUps ?? [emptyFollowUp()])]
      if (list.length >= 4) return prev
      return { ...prev, followUps: [...list, emptyFollowUp()] }
    })
  }

  const removeFollowUp = (index: number) => {
    setForm((prev) => {
      const list = (prev.followUps ?? [emptyFollowUp()]).filter(
        (_, i) => i !== index,
      )
      return { ...prev, followUps: list.length >= 1 ? list : [emptyFollowUp()] }
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      const fu = form.followUps ?? [emptyFollowUp()]
      const cleaned: ColdEmailFollowUp[] = [fu[0]].concat(
        fu.slice(1).filter((f) => (f?.date ?? '').trim() !== ''),
      )
      const status =
        form.status &&
        ['opened', 'replied', 'ignored', 'booked'].includes(form.status)
          ? form.status
          : 'ignored'
      const payload = { ...form, followUps: cleaned, status }
      const saved = await save(isEdit ? entry!.id : null, payload)
      onSaved(saved)
      onClose()
    } finally {
      setSaving(false)
    }
  }

  if (!open) return null

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center p-4'>
      <div
        className='absolute inset-0 bg-slate-900/40 backdrop-blur-sm'
        onClick={onClose}
        aria-hidden
      />
      <div className='relative bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto border border-slate-200/80'>
        <div className='sticky top-0 bg-white/95 backdrop-blur border-b border-slate-100 px-6 py-4 flex items-center justify-between rounded-t-2xl'>
          <h2 className='text-lg font-semibold text-slate-900'>
            {isEdit ? 'Edit entry' : 'New entry'}
          </h2>
          <button
            type='button'
            onClick={onClose}
            className='p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors'
            aria-label='Close'
          >
            <ion-icon name="close" className="w-5 h-5"></ion-icon>
          </button>
        </div>

        <form onSubmit={handleSubmit} className='p-6 space-y-6'>
          <RecipientsList
            recipients={form.recipients ?? []}
            onUpdate={updateRecipient}
            onAdd={addRecipient}
            onRemove={removeRecipient}
          />

          <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
            <TextInput
              label='Company'
              value={form.company ?? ''}
              onChange={(value) => update({ company: value })}
              placeholder='Company name'
            />
            <TextInput
              label='Role applying for'
              value={form.roleApplyingFor ?? ''}
              onChange={(value) => update({ roleApplyingFor: value })}
              placeholder='e.g. Product Manager'
            />
          </div>

          <MessageSection message={form.message} onUpdate={updateMessage} />

          <FollowUpsList
            followUps={form.followUps ?? []}
            onUpdate={updateFollowUp}
            onAdd={addFollowUp}
            onRemove={removeFollowUp}
          />

          <div>
            <label className='block text-sm font-medium text-slate-700 mb-1'>
              Status
            </label>
            <select
              value={form.status ?? 'ignored'}
              onChange={(e) =>
                update({ status: e.target.value as ColdEmailEntry['status'] })
              }
              className='w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-cyan-400 focus:border-cyan-400'
            >
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>
                  {STATUS_LABELS[s]}
                </option>
              ))}
            </select>
          </div>

          <TagsInput
            tags={form.tags ?? []}
            onAdd={addTag}
            onRemove={removeTag}
          />

          <div>
            <label className='block text-sm font-medium text-slate-700 mb-1'>
              Notes
            </label>
            <textarea
              value={form.notes ?? ''}
              onChange={(e) => update({ notes: e.target.value })}
              className='w-full border border-slate-200 rounded-lg px-3 py-2 text-sm min-h-[60px] placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-cyan-400 focus:border-cyan-400'
              placeholder='Optional notes…'
              rows={2}
            />
          </div>

          <DateInput
            label='Follow-up date'
            value={form.followUpDate}
            onChange={(value) => update({ followUpDate: value })}
          />

          <div className='flex justify-end gap-3 pt-5 border-t border-slate-100'>
            <button
              type='button'
              onClick={onClose}
              className='px-4 py-2.5 text-slate-600 hover:bg-slate-100 rounded-lg font-medium transition-colors'
            >
              Cancel
            </button>
            <button
              type='submit'
              disabled={saving}
              className='px-4 py-2.5 bg-cyan-400 hover:bg-cyan-500 text-white rounded-lg font-medium disabled:opacity-50 flex items-center gap-2 shadow-sm focus:outline-none focus:ring-1 focus:ring-cyan-400 focus:ring-offset-2 transition-colors'
            >
              {saving && <ion-icon name="ellipsis-vertical" className='w-4 h-4 animate-spin'></ion-icon>}
              {isEdit ? 'Save changes' : 'Create entry'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

import type { ColdEmailFollowUp } from '../../types'
import { FormSection } from './FormSection'

interface FollowUpsListProps {
  followUps: ColdEmailFollowUp[]
  onUpdate: (index: number, patch: Partial<ColdEmailFollowUp>) => void
  onAdd: () => void
  onRemove: (index: number) => void
}

function formatDateForInput(value: string | undefined): string {
  if (!value) return ''
  const s = String(value).slice(0, 10)
  return /^\d{4}-\d{2}-\d{2}$/.test(s) ? s : ''
}

export function FollowUpsList({
  followUps,
  onUpdate,
  onAdd,
  onRemove,
}: FollowUpsListProps) {
  const canAddMore = followUps.length < 4

  return (
    <FormSection
      title='Follow-ups'
      highlight
      action={
        canAddMore && (
          <button
            type='button'
            onClick={onAdd}
            className='text-sm text-cyan-400 hover:text-cyan-500 hover:underline flex items-center gap-1'
          >
            <ion-icon name="add-outline" className="w-4 h-4"></ion-icon> Add follow-up
          </button>
        )
      }
    >
      {followUps.map((fu, i) => (
        <div key={i} className='flex items-center gap-3 flex-wrap'>
          <span className='text-xs font-medium text-slate-500 w-16'>
            Flw-up {i + 1}
          </span>
          <input
            type='date'
            value={formatDateForInput(fu.date)}
            onChange={(e) => onUpdate(i, { date: e.target.value || '' })}
            className='border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-cyan-400'
          />
          <label className='flex items-center gap-2 text-sm text-slate-600'>
            <input
              type='checkbox'
              checked={!!fu.read}
              onChange={(e) => onUpdate(i, { read: e.target.checked })}
              className='rounded border-slate-300 text-cyan-600'
            />
            <ion-icon name="checkmark-done-outline" className="w-4 h-4"></ion-icon> Read
          </label>
          {followUps.length > 1 && (
            <button
              type='button'
              onClick={() => onRemove(i)}
              className='p-1 text-slate-400 hover:text-red-600'
              title='Remove follow-up'
            >
              <ion-icon name="trash-outline" className="w-4 h-4"></ion-icon>
            </button>
          )}
        </div>
      ))}
    </FormSection>
  )
}

import type { ColdEmailRecipient } from '../../types'

interface RecipientsListProps {
  recipients: ColdEmailRecipient[]
  onUpdate: (index: number, patch: Partial<ColdEmailRecipient>) => void
  onAdd: () => void
  onRemove: (index: number) => void
}

export function RecipientsList({
  recipients,
  onUpdate,
  onAdd,
  onRemove,
}: RecipientsListProps) {
  return (
    <div>
      <label className='block text-sm font-medium text-slate-700 mb-2'>
        Recipients
      </label>
      {recipients.map((r, i) => (
        <div key={i} className='flex gap-2 items-start mb-2'>
          <input
            type='text'
            value={r.fullName}
            onChange={(e) => onUpdate(i, { fullName: e.target.value })}
            placeholder='Full name'
            className='flex-1 border border-slate-200 rounded-lg px-3 py-2 text-sm placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-cyan-400 focus:border-cyan-400'
          />
          <input
            type='email'
            value={r.email}
            onChange={(e) => onUpdate(i, { email: e.target.value })}
            placeholder='Email'
            className='flex-1 border border-slate-200 rounded-lg px-3 py-2 text-sm placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-cyan-400 focus:border-cyan-400'
          />
          <button
            type='button'
            onClick={() => onRemove(i)}
            className='p-2 text-slate-400 hover:text-red-600'
            title='Remove'
          >
            <ion-icon name="trash-outline" className="w-4 h-4"></ion-icon>
          </button>
        </div>
      ))}
      <button
        type='button'
        onClick={onAdd}
        className='text-sm text-cyan-400 hover:text-cyan-500 hover:underline flex items-center gap-1'
      >
        <ion-icon name="add-outline" className="w-4 h-4"></ion-icon> Add recipient
      </button>
    </div>
  )
}

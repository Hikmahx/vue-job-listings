import { useState } from 'react'

interface TagsInputProps {
  tags: string[]
  onAdd: (tag: string) => void
  onRemove: (index: number) => void
}

export function TagsInput({ tags, onAdd, onRemove }: TagsInputProps) {
  const [tagInput, setTagInput] = useState('')

  const handleAdd = () => {
    const t = tagInput.trim()
    if (t) {
      onAdd(t)
      setTagInput('')
    }
  }

  return (
    <div>
      <label className='block text-sm font-medium text-slate-700 mb-1'>
        Tags
      </label>
      <div className='flex flex-wrap gap-2 mb-2'>
        {tags.map((t, i) => (
          <span
            key={i}
            className='inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700'
          >
            {t}
            <button
              type='button'
              onClick={() => onRemove(i)}
              className='text-slate-500 hover:text-red-600'
            >
              &times;
            </button>
          </span>
        ))}
      </div>
      <div className='flex gap-2'>
        <input
          type='text'
          value={tagInput}
          onChange={(e) => setTagInput(e.target.value)}
          onKeyDown={(e) =>
            e.key === 'Enter' && (e.preventDefault(), handleAdd())
          }
          placeholder='Add tag (e.g. Hot Lead)'
          className='flex-1 border border-slate-200 rounded-lg px-3 py-2 text-sm placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-cyan-400 focus:border-cyan-400'
        />
        <button
          type='button'
          onClick={handleAdd}
          className='px-3 py-2 bg-slate-100 rounded-lg text-sm font-medium text-slate-700'
        >
          Add
        </button>
      </div>
    </div>
  )
}

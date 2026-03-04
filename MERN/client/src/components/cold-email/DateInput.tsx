function formatDateForInput(value: string | undefined): string {
  if (!value) return '';
  const s = String(value).slice(0, 10);
  return /^\d{4}-\d{2}-\d{2}$/.test(s) ? s : '';
}

interface DateInputProps {
  label?: string;
  value: string | undefined;
  onChange: (value: string) => void;
  required?: boolean;
}

export function DateInput({ label, value, onChange, required = false }: DateInputProps) {
  return (
    <div>
      {label && (
        <label className="block text-xs font-medium text-slate-500 mb-1">
          {label}
          {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <input
        type="date"
        value={formatDateForInput(value)}
        onChange={(e) => onChange(e.target.value || '')}
        className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-cyan-400 focus:border-cyan-400"
      />
    </div>
  );
}

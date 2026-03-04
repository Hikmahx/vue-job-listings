import { ReactNode } from 'react';

interface FormSectionProps {
  title: string;
  children: ReactNode;
  action?: ReactNode;
  highlight?: boolean;
}

export function FormSection({ title, children, action, highlight = false }: FormSectionProps) {
  return (
    <div className={`border border-slate-200 rounded-lg p-4 space-y-3 ${highlight ? 'bg-slate-50/50' : ''}`}>
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-700">{title}</h3>
        {action}
      </div>
      {children}
    </div>
  );
}

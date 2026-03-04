import { CheckCheck, MessageCircle } from 'lucide-react';
import type { ColdEmailMessage } from '../../types';
import { FormSection } from './FormSection';

interface MessageSectionProps {
  message: Partial<ColdEmailMessage> | undefined;
  onUpdate: (patch: Partial<ColdEmailMessage>) => void;
}

function formatDateForInput(value: string | undefined): string {
  if (!value) return '';
  const s = String(value).slice(0, 10);
  return /^\d{4}-\d{2}-\d{2}$/.test(s) ? s : '';
}

export function MessageSection({ message = {}, onUpdate }: MessageSectionProps) {
  return (
    <FormSection title="Message" highlight>
      <div>
        <label className="block text-xs font-medium text-slate-500 mb-1">Subject</label>
        <input
          type="text"
          value={message.subject ?? ''}
          onChange={(e) => onUpdate({ subject: e.target.value })}
          className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-cyan-400 focus:border-cyan-400"
          placeholder="Email subject"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1">Date sent</label>
          <input
            type="date"
            value={formatDateForInput(message.date)}
            onChange={(e) => onUpdate({ date: e.target.value || '' })}
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-cyan-400 focus:border-cyan-400"
          />
        </div>
        <div className="flex items-end gap-4">
          <label className="flex items-center gap-2 text-sm text-slate-600">
            <input
              type="checkbox"
              checked={!!message.read}
              onChange={(e) => onUpdate({ read: e.target.checked })}
              className="rounded border-slate-300 text-cyan-600"
            />
            <CheckCheck className="w-4 h-4" /> Read
          </label>
          <label className="flex items-center gap-2 text-sm text-slate-600">
            <input
              type="checkbox"
              checked={!!message.response}
              onChange={(e) => onUpdate({ response: e.target.checked })}
              className="rounded border-slate-300 text-cyan-600"
            />
            <MessageCircle className="w-4 h-4" /> Response
          </label>
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-slate-500 mb-1">Email sent (content)</label>
        <textarea
          value={message.emailSent ?? ''}
          onChange={(e) => onUpdate({ emailSent: e.target.value })}
          className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm min-h-[80px] placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-cyan-400 focus:border-cyan-400"
          placeholder="Paste or type the email you sent…"
          rows={3}
        />
      </div>
    </FormSection>
  );
}

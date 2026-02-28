import { useState, useEffect } from 'react';
import { X, CheckCheck, MessageCircle, Loader2, Plus, Trash2 } from 'lucide-react';
import type { ColdEmailEntry, ColdEmailMessage, ColdEmailRecipient, ColdEmailFollowUp } from '../../types';

const STATUS_OPTIONS: ColdEmailEntry['status'][] = ['ignored', 'opened', 'replied', 'booked'];
const STATUS_LABELS: Record<ColdEmailEntry['status'], string> = {
  opened: 'Opened',
  replied: 'Replied',
  ignored: 'Ignored',
  booked: 'Booked',
};

const emptyMessage = (): ColdEmailMessage => ({
  subject: '',
  date: '',
  read: false,
  response: false,
  emailSent: '',
});

const emptyFollowUp = (): ColdEmailFollowUp => ({ date: '', read: false });

const emptyRecipient = (): ColdEmailRecipient => ({ fullName: '', email: '', avatar: '' });

function formatDateForInput(value: string): string {
  if (!value) return '';
  const s = String(value).slice(0, 10);
  return /^\d{4}-\d{2}-\d{2}$/.test(s) ? s : '';
}

interface ColdEmailEntryModalProps {
  open: boolean;
  onClose: () => void;
  entry: ColdEmailEntry | null;
  onSaved: (entry: ColdEmailEntry) => void;
  save: (id: string | null, data: Partial<ColdEmailEntry>) => Promise<ColdEmailEntry>;
}

export default function ColdEmailEntryModal({
  open,
  onClose,
  entry,
  onSaved,
  save,
}: ColdEmailEntryModalProps) {
  const isEdit = !!entry?.id;
  const [saving, setSaving] = useState(false);
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
  });
  const [tagInput, setTagInput] = useState('');

  useEffect(() => {
    if (!open) return;
    if (entry) {
      const recs = (entry.recipients ?? []).length ? entry.recipients : [{ fullName: entry.contactNames ?? '', email: entry.contactEmail ?? '', avatar: '' }];
      const fu = entry.followUps ?? [emptyFollowUp()];
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
      });
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
      });
    }
    setTagInput('');
  }, [open, entry]);

  const update = (patch: Partial<ColdEmailEntry>) => {
    setForm((prev) => ({ ...prev, ...patch }));
  };

  const updateRecipient = (index: number, patch: Partial<ColdEmailRecipient>) => {
    setForm((prev) => {
      const list = [...(prev.recipients ?? [emptyRecipient()])];
      list[index] = { ...list[index], ...patch };
      return { ...prev, recipients: list };
    });
  };

  const addRecipient = () => {
    setForm((prev) => ({ ...prev, recipients: [...(prev.recipients ?? []), emptyRecipient()] }));
  };

  const removeRecipient = (index: number) => {
    setForm((prev) => {
      const list = (prev.recipients ?? []).filter((_, i) => i !== index);
      return { ...prev, recipients: list.length ? list : [emptyRecipient()] };
    });
  };

  const addTag = () => {
    const t = tagInput.trim();
    if (!t) return;
    setForm((prev) => ({ ...prev, tags: [...(prev.tags ?? []), t] }));
    setTagInput('');
  };

  const removeTag = (index: number) => {
    setForm((prev) => ({ ...prev, tags: (prev.tags ?? []).filter((_, i) => i !== index) }));
  };

  const updateMessage = (patch: Partial<ColdEmailMessage>) => {
    setForm((prev) => ({ ...prev, message: { ...(prev.message ?? emptyMessage()), ...patch } }));
  };

  const updateFollowUp = (index: number, patch: Partial<ColdEmailFollowUp>) => {
    setForm((prev) => {
      const list = [...(prev.followUps ?? [emptyFollowUp()])];
      while (list.length <= index) list.push(emptyFollowUp());
      list[index] = { ...list[index], ...patch };
      return { ...prev, followUps: list };
    });
  };

  const addFollowUp = () => {
    setForm((prev) => {
      const list = [...(prev.followUps ?? [emptyFollowUp()])];
      if (list.length >= 4) return prev;
      return { ...prev, followUps: [...list, emptyFollowUp()] };
    });
  };

  const removeFollowUp = (index: number) => {
    setForm((prev) => {
      const list = (prev.followUps ?? [emptyFollowUp()]).filter((_, i) => i !== index);
      return { ...prev, followUps: list.length >= 1 ? list : [emptyFollowUp()] };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const fu = form.followUps ?? [emptyFollowUp()];
      const cleaned: ColdEmailFollowUp[] = [fu[0]].concat(
        fu.slice(1).filter((f) => (f?.date ?? '').trim() !== '')
      );
      const status = (form.status && ['opened', 'replied', 'ignored', 'booked'].includes(form.status)) ? form.status : 'ignored';
      const payload = { ...form, followUps: cleaned, status };
      const saved = await save(isEdit ? entry!.id : null, payload);
      onSaved(saved);
      onClose();
    } finally {
      setSaving(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} aria-hidden />
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto border border-slate-200/80">
        <div className="sticky top-0 bg-white/95 backdrop-blur border-b border-slate-100 px-6 py-4 flex items-center justify-between rounded-t-2xl">
          <h2 className="text-lg font-semibold text-slate-900">{isEdit ? 'Edit entry' : 'New entry'}</h2>
          <button type="button" onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors" aria-label="Close">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Recipients</label>
            {(form.recipients ?? []).map((r, i) => (
              <div key={i} className="flex gap-2 items-start mb-2">
                <input
                  type="text"
                  value={r.fullName}
                  onChange={(e) => updateRecipient(i, { fullName: e.target.value })}
                  placeholder="Full name"
                  className="flex-1 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500"
                />
                <input
                  type="email"
                  value={r.email}
                  onChange={(e) => updateRecipient(i, { email: e.target.value })}
                  placeholder="Email"
                  className="flex-1 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500"
                />
                <button type="button" onClick={() => removeRecipient(i)} className="p-2 text-slate-400 hover:text-red-600" title="Remove">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
            <button type="button" onClick={addRecipient} className="text-sm text-cyan-600 hover:underline flex items-center gap-1">
              <Plus className="w-4 h-4" /> Add recipient
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Company</label>
              <input
                type="text"
                value={form.company ?? ''}
                onChange={(e) => update({ company: e.target.value })}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500"
                placeholder="Company name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Role applying for</label>
              <input
                type="text"
                value={form.roleApplyingFor ?? ''}
                onChange={(e) => update({ roleApplyingFor: e.target.value })}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500"
                placeholder="e.g. Product Manager"
              />
            </div>
          </div>

          <div className="border border-slate-200 rounded-lg p-4 space-y-3 bg-slate-50/50">
            <h3 className="text-sm font-semibold text-slate-700">Message</h3>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Subject</label>
              <input
                type="text"
                value={form.message?.subject ?? ''}
                onChange={(e) => updateMessage({ subject: e.target.value })}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500"
                placeholder="Email subject"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Date sent</label>
                <input
                  type="date"
                  value={formatDateForInput(form.message?.date ?? '')}
                  onChange={(e) => updateMessage({ date: e.target.value || '' })}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500"
                />
              </div>
              <div className="flex items-end gap-4">
                <label className="flex items-center gap-2 text-sm text-slate-600">
                  <input type="checkbox" checked={!!form.message?.read} onChange={(e) => updateMessage({ read: e.target.checked })} className="rounded border-slate-300 text-cyan-600" />
                  <CheckCheck className="w-4 h-4" /> Read
                </label>
                <label className="flex items-center gap-2 text-sm text-slate-600">
                  <input type="checkbox" checked={!!form.message?.response} onChange={(e) => updateMessage({ response: e.target.checked })} className="rounded border-slate-300 text-cyan-600" />
                  <MessageCircle className="w-4 h-4" /> Response
                </label>
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Email sent (content)</label>
              <textarea
                value={form.message?.emailSent ?? ''}
                onChange={(e) => updateMessage({ emailSent: e.target.value })}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm min-h-[80px] focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500"
                placeholder="Paste or type the email you sent…"
                rows={3}
              />
            </div>
          </div>

          <div className="border border-slate-200 rounded-lg p-4 space-y-3 bg-slate-50/50">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-700">Follow-ups</h3>
              {(form.followUps ?? []).length < 4 && (
                <button type="button" onClick={addFollowUp} className="text-sm text-cyan-600 hover:underline flex items-center gap-1">
                  <Plus className="w-4 h-4" /> Add follow-up
                </button>
              )}
            </div>
            {(form.followUps ?? [emptyFollowUp()]).map((fu, i) => (
              <div key={i} className="flex items-center gap-3 flex-wrap">
                <span className="text-xs font-medium text-slate-500 w-16">Flw-up {i + 1}</span>
                <input
                  type="date"
                  value={formatDateForInput(fu.date)}
                  onChange={(e) => updateFollowUp(i, { date: e.target.value || '' })}
                  className="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                />
                <label className="flex items-center gap-2 text-sm text-slate-600">
                  <input type="checkbox" checked={!!fu.read} onChange={(e) => updateFollowUp(i, { read: e.target.checked })} className="rounded border-slate-300 text-cyan-600" />
                  <CheckCheck className="w-4 h-4" /> Read
                </label>
                {(form.followUps ?? []).length > 1 && (
                  <button type="button" onClick={() => removeFollowUp(i)} className="p-1 text-slate-400 hover:text-red-600" title="Remove follow-up">
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
            <select
              value={form.status ?? 'ignored'}
              onChange={(e) => update({ status: e.target.value as ColdEmailEntry['status'] })}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500"
            >
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>{STATUS_LABELS[s]}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Tags</label>
            <div className="flex flex-wrap gap-2 mb-2">
              {(form.tags ?? []).map((t, i) => (
                <span key={i} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
                  {t}
                  <button type="button" onClick={() => removeTag(i)} className="text-slate-500 hover:text-red-600">&times;</button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                placeholder="Add tag (e.g. Hot Lead)"
                className="flex-1 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500"
              />
              <button type="button" onClick={addTag} className="px-3 py-2 bg-slate-100 rounded-lg text-sm font-medium text-slate-700">Add</button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Notes</label>
            <textarea
              value={form.notes ?? ''}
              onChange={(e) => update({ notes: e.target.value })}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm min-h-[60px] focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500"
              placeholder="Optional notes…"
              rows={2}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Follow-up date</label>
            <input
              type="date"
              value={formatDateForInput(form.followUpDate ?? '')}
              onChange={(e) => update({ followUpDate: e.target.value || '' })}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500"
            />
          </div>

          <div className="flex justify-end gap-3 pt-5 border-t border-slate-100">
            <button type="button" onClick={onClose} className="px-4 py-2.5 text-slate-600 hover:bg-slate-100 rounded-lg font-medium transition-colors">Cancel</button>
            <button type="submit" disabled={saving} className="px-4 py-2.5 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg font-medium disabled:opacity-50 flex items-center gap-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 transition-colors">
              {saving && <Loader2 className="w-4 h-4 animate-spin" />}
              {isEdit ? 'Save changes' : 'Create entry'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

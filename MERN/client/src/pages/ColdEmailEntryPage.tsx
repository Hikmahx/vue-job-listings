import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Save, Trash2, Loader2, AlertCircle, CheckCheck, MessageCircle, Plus } from 'lucide-react';
import type { ColdEmailEntry, ColdEmailMessage, ColdEmailRecipient, ColdEmailFollowUp } from '../types';
import { coldEmailService } from '../services/coldEmailService';

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

export default function ColdEmailEntryPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isNew = id === 'new';
  const [entry, setEntry] = useState<ColdEmailEntry | null>(null);
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tagInput, setTagInput] = useState('');
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

  useEffect(() => {
    if (isNew) {
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
      setLoading(false);
      return;
    }
    if (!id) return;
    setLoading(true);
    setError(null);
    coldEmailService
      .getEntry(id)
      .then((data) => {
        if (data) {
          setEntry(data);
          const recs = (data.recipients ?? []).length ? data.recipients : [{ fullName: data.contactNames ?? '', email: data.contactEmail ?? '', avatar: '' }];
          const fu = data.followUps ?? [emptyFollowUp()];
          setForm({
            company: data.company ?? '',
            roleApplyingFor: data.roleApplyingFor ?? '',
            recipients: recs.length ? recs : [emptyRecipient()],
            message: { ...emptyMessage(), ...data.message },
            followUps: fu.length >= 1 ? fu : [emptyFollowUp()],
            status: data.status ?? 'ignored',
            tags: data.tags ?? [],
            notes: data.notes ?? '',
            followUpDate: data.followUpDate ?? '',
          });
        } else {
          setError('Entry not found');
        }
      })
      .catch((err: any) => {
        setError(err?.response?.data?.message || err?.message || 'Failed to load entry');
      })
      .finally(() => setLoading(false));
  }, [id, isNew]);

  const update = useCallback((patch: Partial<ColdEmailEntry>) => {
    setForm((prev) => ({ ...prev, ...patch }));
  }, []);

  const updateRecipient = useCallback((index: number, patch: Partial<ColdEmailRecipient>) => {
    setForm((prev) => {
      const list = [...(prev.recipients ?? [emptyRecipient()])];
      list[index] = { ...list[index], ...patch };
      return { ...prev, recipients: list };
    });
  }, []);

  const addRecipient = useCallback(() => {
    setForm((prev) => ({ ...prev, recipients: [...(prev.recipients ?? []), emptyRecipient()] }));
  }, []);

  const removeRecipient = useCallback((index: number) => {
    setForm((prev) => {
      const list = (prev.recipients ?? []).filter((_, i) => i !== index);
      return { ...prev, recipients: list.length ? list : [emptyRecipient()] };
    });
  }, []);

  const updateMessage = useCallback((patch: Partial<ColdEmailMessage>) => {
    setForm((prev) => ({ ...prev, message: { ...(prev.message ?? emptyMessage()), ...patch } }));
  }, []);

  const updateFollowUp = useCallback((index: number, patch: Partial<ColdEmailFollowUp>) => {
    setForm((prev) => {
      const list = [...(prev.followUps ?? [emptyFollowUp()])];
      while (list.length <= index) list.push(emptyFollowUp());
      list[index] = { ...list[index], ...patch };
      return { ...prev, followUps: list };
    });
  }, []);

  const addFollowUp = useCallback(() => {
    setForm((prev) => {
      const list = [...(prev.followUps ?? [emptyFollowUp()])];
      if (list.length >= 4) return prev;
      return { ...prev, followUps: [...list, emptyFollowUp()] };
    });
  }, []);

  const removeFollowUp = useCallback((index: number) => {
    setForm((prev) => {
      const list = (prev.followUps ?? [emptyFollowUp()]).filter((_, i) => i !== index);
      return { ...prev, followUps: list.length >= 1 ? list : [emptyFollowUp()] };
    });
  }, []);

  const addTag = useCallback(() => {
    const t = tagInput.trim();
    if (!t) return;
    setForm((prev) => ({ ...prev, tags: [...(prev.tags ?? []), t] }));
    setTagInput('');
  }, [tagInput]);

  const removeTag = useCallback((index: number) => {
    setForm((prev) => ({ ...prev, tags: (prev.tags ?? []).filter((_, i) => i !== index) }));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const fu = form.followUps ?? [emptyFollowUp()];
      const cleaned: ColdEmailFollowUp[] = [fu[0]].concat(
        fu.slice(1).filter((f) => (f?.date ?? '').trim() !== '')
      );
      const payload = { ...form, followUps: cleaned };
      if (isNew) {
        const created = await coldEmailService.create(payload);
        navigate(`/dashboard/cold-email-tracker/${created.id}`, { replace: true });
      } else if (entry?.id) {
        const updated = await coldEmailService.update(entry.id, payload);
        setEntry(updated);
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!entry?.id || !window.confirm('Delete this cold email entry? This cannot be undone.')) return;
    setDeleting(true);
    setError(null);
    try {
      await coldEmailService.delete(entry.id);
      navigate('/dashboard/cold-email-tracker', { replace: true });
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || 'Failed to delete');
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 flex flex-col items-center justify-center">
        <Loader2 className="w-10 h-10 text-cyan-500 animate-spin mb-4" />
        <p className="text-slate-600 font-medium">Loading entry…</p>
      </div>
    );
  }

  if (!isNew && !entry) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 text-center">
        <p className="text-slate-600 mb-4">Entry not found.</p>
        <Link to="/dashboard/cold-email-tracker" className="text-cyan-600 hover:underline font-medium">
          Back to Cold Email Tracker
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Link to="/dashboard/cold-email-tracker" className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 font-medium">
        <ArrowLeft className="w-4 h-4" /> Back to tracker
      </Link>

      {error && (
        <div className="flex items-center gap-3 px-4 py-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-800">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <p className="text-sm font-medium">{error}</p>
          <button type="button" onClick={() => setError(null)} className="ml-auto text-amber-600 hover:text-amber-800 font-medium text-sm">Dismiss</button>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200">
          <h1 className="text-xl font-bold text-slate-900">
            {isNew ? 'New cold email entry' : (entry?.company ? `${entry.company} – Edit` : 'Edit entry')}
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Recipients</label>
            {(form.recipients ?? []).map((r, i) => (
              <div key={i} className="flex gap-2 items-start mb-2">
                <input type="text" value={r.fullName} onChange={(e) => updateRecipient(i, { fullName: e.target.value })} placeholder="Full name" className="flex-1 border border-slate-300 rounded-lg px-3 py-2 text-sm" />
                <input type="email" value={r.email} onChange={(e) => updateRecipient(i, { email: e.target.value })} placeholder="Email" className="flex-1 border border-slate-300 rounded-lg px-3 py-2 text-sm" />
                <button type="button" onClick={() => removeRecipient(i)} className="p-2 text-slate-400 hover:text-red-600">Remove</button>
              </div>
            ))}
            <button type="button" onClick={addRecipient} className="text-sm text-cyan-600 hover:underline flex items-center gap-1">
              <Plus className="w-4 h-4" /> Add recipient
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Company</label>
              <input type="text" value={form.company ?? ''} onChange={(e) => update({ company: e.target.value })} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" placeholder="Company name" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Role applying for</label>
              <input type="text" value={form.roleApplyingFor ?? ''} onChange={(e) => update({ roleApplyingFor: e.target.value })} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" placeholder="e.g. Product Manager" />
            </div>
          </div>

          <div className="border border-slate-200 rounded-lg p-4 space-y-3 bg-slate-50/50">
            <h3 className="text-sm font-semibold text-slate-700">Message</h3>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Subject</label>
              <input type="text" value={form.message?.subject ?? ''} onChange={(e) => updateMessage({ subject: e.target.value })} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" placeholder="Email subject" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Date sent</label>
                <input type="date" value={formatDateForInput(form.message?.date ?? '')} onChange={(e) => updateMessage({ date: e.target.value || '' })} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" />
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
              <textarea value={form.message?.emailSent ?? ''} onChange={(e) => updateMessage({ emailSent: e.target.value })} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm min-h-[100px]" placeholder="Paste or type the email you sent…" rows={4} />
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
                <input type="date" value={formatDateForInput(fu.date)} onChange={(e) => updateFollowUp(i, { date: e.target.value || '' })} className="border border-slate-300 rounded-lg px-3 py-2 text-sm" />
                <label className="flex items-center gap-2 text-sm text-slate-600">
                  <input type="checkbox" checked={!!fu.read} onChange={(e) => updateFollowUp(i, { read: e.target.checked })} className="rounded border-slate-300 text-cyan-600" />
                  <CheckCheck className="w-4 h-4" /> Read
                </label>
                {(form.followUps ?? []).length > 1 && (
                  <button type="button" onClick={() => removeFollowUp(i)} className="p-1 text-slate-400 hover:text-red-600" title="Remove follow-up">Remove</button>
                )}
              </div>
            ))}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
            <select value={form.status ?? 'ignored'} onChange={(e) => update({ status: e.target.value as ColdEmailEntry['status'] })} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm">
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
              <input type="text" value={tagInput} onChange={(e) => setTagInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())} placeholder="Add tag" className="flex-1 border border-slate-300 rounded-lg px-3 py-2 text-sm" />
              <button type="button" onClick={addTag} className="px-3 py-2 bg-slate-100 rounded-lg text-sm font-medium text-slate-700">Add</button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Notes</label>
            <textarea value={form.notes ?? ''} onChange={(e) => update({ notes: e.target.value })} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm min-h-[80px]" placeholder="Optional notes…" rows={3} />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Follow-up date</label>
            <input type="date" value={formatDateForInput(form.followUpDate ?? '')} onChange={(e) => update({ followUpDate: e.target.value || '' })} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-slate-200">
            <div>
              {!isNew && entry?.id && (
                <button type="button" onClick={handleDelete} disabled={deleting} className="inline-flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg font-medium disabled:opacity-50">
                  {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                  Delete entry
                </button>
              )}
            </div>
            <div className="flex gap-2">
              <Link to="/dashboard/cold-email-tracker" className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium">Cancel</Link>
              <button type="submit" disabled={saving} className="inline-flex items-center gap-2 px-4 py-2 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg font-medium disabled:opacity-50">
                {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                {isNew ? 'Create entry' : 'Save changes'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

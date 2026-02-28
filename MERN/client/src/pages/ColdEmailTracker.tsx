import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  Plus,
  Trash2,
  Download,
  Search,
  ChevronDown,
  ChevronUp,
  Loader2,
  AlertCircle,
  Inbox,
  Clock,
  Eye,
  Pencil,
  MessageCircle,
  FileUp,
  Edit3,
  MailOpen,
  Reply,
  Ban,
  CheckCircle,
  Building2,
  Calendar,
  Tag,
  CheckCheck,
} from 'lucide-react';
import type { ColdEmailEntry, ColdEmailRecipient, ColdEmailStatus, ColdEmailFollowUp } from '../types';
import { coldEmailService } from '../services/coldEmailService';
import { exportToCsv, parseCsvForImport } from '../utils/coldEmailStorage';
import ColdEmailEntryModal from '../components/cold-email/ColdEmailEntryModal';
import { truncateChars } from '../utils/truncateWords';

const STATUS_CONFIG: Record<ColdEmailStatus, { label: string; icon: typeof MailOpen; className: string }> = {
  opened: { label: 'Opened', icon: MailOpen, className: 'bg-amber-100 text-amber-800 border-amber-200' },
  replied: { label: 'Replied', icon: Reply, className: 'bg-orange-100 text-orange-800 border-orange-200' },
  ignored: { label: 'Ignored', icon: Ban, className: 'bg-red-100 text-red-800 border-red-200' },
  booked: { label: 'Booked', icon: CheckCircle, className: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
};

function formatDisplayDate(value: string): string {
  if (!value) return '—';
  const s = String(value).slice(0, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) return '—';
  try {
    return new Date(s + 'T12:00:00').toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return s;
  }
}

function RecipientsCell({ recipients }: { recipients: ColdEmailRecipient[] }) {
  const list = recipients?.length ? recipients : [];
  const first = list[0];
  const rest = list.length - 1;
  return (
    <td className="px-3 py-2 align-middle">
      <div className="flex items-center gap-2">
        {first ? (
          <>
            {first.avatar ? (
              <img src={first.avatar} alt="" className="w-9 h-9 rounded-full object-cover ring-2 ring-white shadow-sm" />
            ) : (
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 text-slate-600 flex items-center justify-center text-sm font-semibold shadow-sm">
                {(first.fullName || first.email || '?').slice(0, 1).toUpperCase()}
              </div>
            )}
            <div className="min-w-0">
              <div className="font-medium text-slate-900 truncate max-w-[140px]">{first.fullName || '—'}</div>
              <div className="text-xs text-slate-500 truncate max-w-[140px]">{first.email || '—'}</div>
            </div>
            {rest > 0 && (
              <span className="shrink-0 text-xs font-medium text-slate-500 bg-slate-100/80 px-2 py-0.5 rounded-md">
                +{rest}
              </span>
            )}
          </>
        ) : (
          <span className="text-slate-400">—</span>
        )}
      </div>
    </td>
  );
}

/** Build native tooltip text for message (subject, date, read/response, content) */
function messageTooltipText(msg: ColdEmailEntry['message'] | null | undefined): string {
  if (!msg) return 'Message';
  const parts: string[] = [];
  if (msg.subject) parts.push(`Subject: ${msg.subject}`);
  if (msg.date) parts.push(`Date: ${formatDisplayDate(msg.date)}`);
  if (msg.read) parts.push('Read');
  if (msg.response) parts.push('Response');
  const content = (msg as any)?.emailSent ?? '';
  if (content) parts.push(content.slice(0, 200) + (content.length > 200 ? '…' : ''));
  return parts.join('\n') || 'Message';
}

/** Message column: bold subject, truncated content, read tick (green/gray) in corner, native tooltip on hover */
function MessageCell({ msg }: { msg: ColdEmailEntry['message'] }) {
  const subject = msg?.subject ?? '';
  const content = (msg as any)?.emailSent ?? '';
  const subjectTruncated = truncateChars(subject, 28);
  const contentTruncated = truncateChars(content, 32);
  const isRead = !!msg?.read;
  const hasAny = subject || content;
  return (
    <td className="px-3 py-2 align-top" title={messageTooltipText(msg)}>
      <div className="min-w-[120px] max-w-[200px] relative pr-6">
        {hasAny ? (
          <>
            {subject ? <div className="text-slate-900 text-xs font-semibold truncate">{subjectTruncated}</div> : null}
            {content ? <div className="text-slate-600 text-xs truncate mt-0.5">{contentTruncated}</div> : null}
            <span className={`absolute top-0 right-0 inline-flex shrink-0 ${isRead ? 'text-emerald-500' : 'text-slate-300'}`}>
              <CheckCheck className="w-4 h-4" />
            </span>
          </>
        ) : (
          <span className="text-slate-400 text-xs">—</span>
        )}
      </div>
    </td>
  );
}

/** Follow-up column: date + double-tick only when date exists (green if read, gray otherwise); click tick to toggle read */
function FollowUpCell({
  followUp,
  onToggleRead,
}: {
  followUp: ColdEmailFollowUp;
  onToggleRead: () => void;
}) {
  const date = formatDisplayDate(followUp?.date ?? '');
  const isRead = !!followUp?.read;
  const hasDate = !!(followUp?.date ?? '').trim();
  return (
    <td className="px-3 py-2 align-top">
      <div className={`min-w-[70px] flex items-start justify-between gap-1 ${hasDate ? 'relative pr-6' : ''}`}>
        <span className="text-xs text-slate-600">{hasDate ? date : '—'}</span>
        {hasDate && (
          <button
            type="button"
            onClick={(e) => { e.preventDefault(); onToggleRead(); }}
            className={`absolute top-0 right-0 p-0.5 rounded shrink-0 ${isRead ? 'text-emerald-500 hover:text-emerald-600' : 'text-slate-300 hover:text-slate-400'}`}
            title={isRead ? 'Mark unread' : 'Mark read'}
            aria-label={isRead ? 'Mark unread' : 'Mark read'}
          >
            <CheckCheck className="w-4 h-4" />
          </button>
        )}
      </div>
    </td>
  );
}

function StatusPill({
  status,
  onSelect,
}: {
  status: ColdEmailStatus;
  onSelect?: (s: ColdEmailStatus) => void;
}) {
  const config = STATUS_CONFIG[status];
  const Icon = config.icon;
  if (!onSelect) {
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${config.className}`}>
        <Icon className="w-3.5 h-3.5 shrink-0" />
        {config.label}
      </span>
    );
  }
  return (
    <select
      value={status}
      onChange={(e) => onSelect(e.target.value as ColdEmailStatus)}
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-slate-300 ${config.className}`}
      style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23475569' d='M6 8L1 3h10z'/%3E%3C/svg%3E")`,
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'right 6px center',
        paddingRight: '28px',
      }}
    >
      {(Object.keys(STATUS_CONFIG) as ColdEmailStatus[]).map((s) => (
        <option key={s} value={s}>{STATUS_CONFIG[s].label}</option>
      ))}
    </select>
  );
}

export default function ColdEmailTracker() {
  const [entries, setEntries] = useState<ColdEmailEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<ColdEmailStatus | 'all'>('all');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [companyFilter, setCompanyFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'company' | 'updatedAt' | 'date'>('updatedAt');
  const [sortDesc, setSortDesc] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<ColdEmailEntry | null>(null);
  const [addDropdownOpen, setAddDropdownOpen] = useState(false);
  const [filterCompanyOpen, setFilterCompanyOpen] = useState(false);
  const [filterStatusOpen, setFilterStatusOpen] = useState(false);
  const [filterTagsOpen, setFilterTagsOpen] = useState(false);
  const [importing, setImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchEntries = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await coldEmailService.getEntries();
      setEntries(data);
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || 'Failed to load entries');
      setEntries([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEntries();
  }, [fetchEntries]);

  const handleAddManual = () => {
    setAddDropdownOpen(false);
    setEditingEntry(null);
    setModalOpen(true);
  };

  const handleImportCsv = () => {
    setAddDropdownOpen(false);
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setImporting(true);
    setError(null);
    try {
      const text = await file.text();
      const parsed = parseCsvForImport(text);
      for (const row of parsed) {
        await coldEmailService.create(row);
      }
      await fetchEntries();
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || 'Import failed');
    } finally {
      setImporting(false);
    }
  };

  const handleEditEntry = (entry: ColdEmailEntry) => {
    setEditingEntry(entry);
    setModalOpen(true);
  };

  const handleModalSaved = useCallback((saved: ColdEmailEntry) => {
    setEntries((prev) => {
      const idx = prev.findIndex((e) => e.id === saved.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = saved;
        return next;
      }
      return [saved, ...prev];
    });
    setModalOpen(false);
    setEditingEntry(null);
  }, []);

  const saveModal = useCallback(async (id: string | null, data: Partial<ColdEmailEntry>): Promise<ColdEmailEntry> => {
    if (id) return coldEmailService.update(id, data);
    return coldEmailService.create(data);
  }, []);

  const updateStatus = useCallback(async (entry: ColdEmailEntry, status: ColdEmailStatus) => {
    try {
      const updated = await coldEmailService.update(entry.id, { ...entry, status });
      setEntries((prev) => prev.map((e) => (e.id === entry.id ? updated : e)));
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || 'Failed to update status');
    }
  }, []);

  const toggleFollowUpRead = useCallback(async (entry: ColdEmailEntry, index: number) => {
    const list = [...(entry.followUps ?? [{ date: '', read: false }])];
    while (list.length <= index) list.push({ date: '', read: false });
    list[index] = { ...list[index], read: !list[index].read };
    try {
      const updated = await coldEmailService.update(entry.id, { ...entry, followUps: list });
      setEntries((prev) => prev.map((e) => (e.id === entry.id ? updated : e)));
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || 'Failed to update');
    }
  }, []);

  const deleteRow = useCallback(async (id: string) => {
    if (!window.confirm('Delete this cold email entry?')) return;
    setError(null);
    try {
      await coldEmailService.delete(id);
      setEntries((prev) => prev.filter((e) => e.id !== id));
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || 'Failed to delete');
    }
  }, []);

  const allTags = useMemo(() => {
    const set = new Set<string>();
    entries.forEach((e) => (e.tags ?? []).forEach((t) => set.add(t)));
    return Array.from(set).sort();
  }, [entries]);

  const allCompanies = useMemo(() => {
    const set = new Set(entries.map((e) => e.company).filter(Boolean));
    return Array.from(set).sort();
  }, [entries]);

  const filteredAndSorted = useMemo(() => {
    let list = entries.filter((e) => {
      const matchSearch =
        !search ||
        [e.company, e.roleApplyingFor, e.notes, ...(e.recipients ?? []).flatMap((r) => [r.fullName, r.email])]
          .some((s) => String(s).toLowerCase().includes(search.toLowerCase()));
      const matchStatus = statusFilter === 'all' || e.status === statusFilter;
      const matchTag = selectedTags.length === 0 || (e.tags ?? []).some((t) => selectedTags.includes(t));
      const matchCompany = companyFilter === 'all' || e.company === companyFilter;
      return matchSearch && matchStatus && matchTag && matchCompany;
    });
    list = [...list].sort((a, b) => {
      if (sortBy === 'company') {
        const cmp = a.company.localeCompare(b.company, undefined, { numeric: true });
        return sortDesc ? -cmp : cmp;
      }
      if (sortBy === 'date') {
        const aDate = a.message?.date ?? '';
        const bDate = b.message?.date ?? '';
        const cmp = aDate.localeCompare(bDate);
        return sortDesc ? -cmp : cmp;
      }
      const cmp = (a.updatedAt || '').localeCompare(b.updatedAt || '', undefined, { numeric: true });
      return sortDesc ? -cmp : cmp;
    });
    return list;
  }, [entries, search, statusFilter, selectedTags, companyFilter, sortBy, sortDesc]);

  const followUpColumnCount = useMemo(() => {
    if (filteredAndSorted.length === 0) return 1;
    const max = Math.max(...filteredAndSorted.map((e) => (e.followUps ?? []).length), 1);
    return Math.min(4, max);
  }, [filteredAndSorted]);

  const stats = useMemo(() => {
    const total = entries.length;
    const replied = entries.filter((e) => e.status === 'replied' || e.status === 'booked' || e.message?.response).length;
    const opened = entries.filter((e) => e.status === 'opened').length;
    return { total, replied, opened, awaiting: total - replied };
  }, [entries]);

  const toggleTagFilter = (tag: string) => {
    setSelectedTags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]));
  };

  const handleExport = useCallback(() => {
    const csv = exportToCsv(filteredAndSorted);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cold-email-tracker-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }, [filteredAndSorted]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <Loader2 className="w-10 h-10 text-cyan-500 animate-spin mb-4" />
        <p className="text-slate-500 font-medium">Loading…</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">Cold Email Tracker</h1>
          <p className="mt-1 text-sm text-slate-500">Track outreach, read receipts, and responses</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <button
              type="button"
              onClick={() => setAddDropdownOpen((o) => !o)}
              className="inline-flex items-center gap-2 bg-cyan-600 hover:bg-cyan-700 text-white px-4 py-2.5 rounded-lg text-sm font-medium shadow-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add entry
              <ChevronDown className="w-4 h-4 opacity-80" />
            </button>
            {addDropdownOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setAddDropdownOpen(false)} aria-hidden />
                <div className="absolute right-0 top-full mt-1.5 py-1 bg-white rounded-lg shadow-lg border border-slate-200 z-20 min-w-[200px] overflow-hidden">
                  <button
                    type="button"
                    onClick={handleImportCsv}
                    disabled={importing}
                    className="w-full flex items-center gap-2.5 px-4 py-2.5 text-left text-slate-700 hover:bg-slate-50 text-sm transition-colors disabled:opacity-60"
                  >
                    {importing ? <Loader2 className="w-4 h-4 animate-spin shrink-0" /> : <FileUp className="w-4 h-4 shrink-0 text-slate-400" />}
                    Import CSV
                  </button>
                  <button
                    type="button"
                    onClick={handleAddManual}
                    className="w-full flex items-center gap-2.5 px-4 py-2.5 text-left text-slate-700 hover:bg-slate-50 text-sm transition-colors"
                  >
                    <Edit3 className="w-4 h-4 shrink-0 text-slate-400" />
                    Manual entry
                  </button>
                </div>
              </>
            )}
          </div>
          <input ref={fileInputRef} type="file" accept=".csv" className="hidden" onChange={handleFileChange} />
          <button
            type="button"
            onClick={handleExport}
            className="inline-flex items-center gap-2 bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 px-4 py-2.5 rounded-lg text-sm font-medium shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-300 focus:ring-offset-2 transition-colors"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-3 px-4 py-3 bg-amber-50 border border-amber-200/80 rounded-lg text-amber-800 text-sm">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <p className="flex-1 font-medium">{error}</p>
          <button type="button" onClick={() => setError(null)} className="text-amber-600 hover:text-amber-800 font-medium">
            Dismiss
          </button>
        </div>
      )}

      {/* Search + date row (like image 2) */}
      <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 bg-white"
          />
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm text-slate-500">Date</span>
          <button
            type="button"
            onClick={() => { setSortBy('date'); setSortDesc(!sortDesc); }}
            className="inline-flex items-center gap-2 px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-700 bg-white hover:bg-slate-50"
          >
            <Calendar className="w-4 h-4 text-slate-400" />
            {sortBy === 'date' ? (sortDesc ? 'Newest first' : 'Oldest first') : 'Date'}
            <ChevronDown className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Initiation & Engagement panels (like image 2) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
          <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">Initiation</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                <Inbox className="w-5 h-5 text-slate-600" />
              </div>
              <div>
                <p className="text-2xl font-semibold text-slate-900 tabular-nums">{stats.total}</p>
                <p className="text-sm text-slate-500">Total entries</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                <MessageCircle className="w-5 h-5 text-slate-600" />
              </div>
              <div>
                <p className="text-2xl font-semibold text-slate-900 tabular-nums">{stats.total}</p>
                <p className="text-sm text-slate-500">Sent</p>
              </div>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
          <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">Engagement</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center shrink-0">
                <MailOpen className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-semibold text-slate-900 tabular-nums">{stats.opened}</p>
                <p className="text-sm text-slate-500">Opened</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center shrink-0">
                <Reply className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-2xl font-semibold text-slate-900 tabular-nums">{stats.replied}</p>
                <p className="text-sm text-slate-500">Replied</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filter bar – pill buttons with dropdowns (like image 1) */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative">
          <button
            type="button"
            onClick={() => { setFilterCompanyOpen(!filterCompanyOpen); setFilterStatusOpen(false); setFilterTagsOpen(false); }}
            className="inline-flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-full text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 shadow-sm"
          >
            <Building2 className="w-4 h-4 text-slate-500" />
            Company
            <ChevronDown className="w-4 h-4" />
          </button>
          {filterCompanyOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setFilterCompanyOpen(false)} aria-hidden />
              <div className="absolute left-0 top-full mt-1 py-1 bg-white rounded-lg shadow-lg border border-slate-200 z-20 min-w-[200px] max-h-60 overflow-y-auto">
                <button type="button" onClick={() => { setCompanyFilter('all'); setFilterCompanyOpen(false); }} className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50">All companies</button>
                {allCompanies.map((c) => (
                  <button key={c} type="button" onClick={() => { setCompanyFilter(c); setFilterCompanyOpen(false); }} className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50">{c}</button>
                ))}
              </div>
            </>
          )}
        </div>
        <div className="relative">
          <button
            type="button"
            onClick={() => { setFilterStatusOpen(!filterStatusOpen); setFilterCompanyOpen(false); setFilterTagsOpen(false); }}
            className="inline-flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-full text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 shadow-sm"
          >
            <MailOpen className="w-4 h-4 text-slate-500" />
            Status
            <ChevronDown className="w-4 h-4" />
          </button>
          {filterStatusOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setFilterStatusOpen(false)} aria-hidden />
              <div className="absolute left-0 top-full mt-1 py-1 bg-white rounded-lg shadow-lg border border-slate-200 z-20 min-w-[160px]">
                <button type="button" onClick={() => { setStatusFilter('all'); setFilterStatusOpen(false); }} className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50">All statuses</button>
                {(Object.keys(STATUS_CONFIG) as ColdEmailStatus[]).map((s) => (
                  <button key={s} type="button" onClick={() => { setStatusFilter(s); setFilterStatusOpen(false); }} className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50">{STATUS_CONFIG[s].label}</button>
                ))}
              </div>
            </>
          )}
        </div>
        <div className="relative">
          <button
            type="button"
            onClick={() => { setFilterTagsOpen(!filterTagsOpen); setFilterCompanyOpen(false); setFilterStatusOpen(false); }}
            className={`inline-flex items-center gap-2 px-4 py-2 border rounded-full text-sm font-medium shadow-sm ${filterTagsOpen ? 'border-cyan-300 bg-cyan-50/50 text-cyan-800' : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'}`}
          >
            <Tag className="w-4 h-4 text-slate-500" />
            Tags
            {selectedTags.length > 0 && <span className="bg-cyan-100 text-cyan-800 text-xs px-1.5 py-0.5 rounded-full">{selectedTags.length}</span>}
            <ChevronDown className="w-4 h-4" />
          </button>
          {filterTagsOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setFilterTagsOpen(false)} aria-hidden />
              <div className="absolute left-0 top-full mt-1 py-2 bg-white rounded-lg shadow-lg border border-slate-200 z-20 min-w-[220px] max-h-60 overflow-y-auto">
                {allTags.length === 0 ? (
                  <p className="px-4 py-2 text-sm text-slate-500">No tags yet</p>
                ) : (
                  allTags.map((t) => (
                    <label key={t} className="flex items-center gap-2 px-4 py-2 hover:bg-slate-50 cursor-pointer">
                      <input type="checkbox" checked={selectedTags.includes(t)} onChange={() => toggleTagFilter(t)} className="rounded border-slate-300 text-cyan-600 focus:ring-cyan-500" />
                      <span className="text-sm text-slate-700">{t}</span>
                    </label>
                  ))
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Table – Recipients | Role | Company | Message | Date | Flw-up 1–4 | Status | Tags | Notes | Actions */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80">
                <th className="text-left px-3 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">Recipients</th>
                <th className="text-left px-3 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">Role</th>
                <th className="text-left px-3 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  <button type="button" onClick={() => { setSortBy('company'); setSortDesc(!sortDesc); }} className="flex items-center gap-1 hover:text-slate-700">
                    Company
                    {sortBy === 'company' ? (sortDesc ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />) : <ChevronDown className="w-3.5 h-3.5 opacity-50" />}
                  </button>
                </th>
                <th className="text-left px-3 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">Message</th>
                <th className="text-left px-3 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">Date</th>
                {Array.from({ length: followUpColumnCount }, (_, i) => i + 1).map((n) => (
                  <th key={n} className="text-left px-3 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">Flw-up {n}</th>
                ))}
                <th className="text-left px-3 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                <th className="text-left px-3 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">Tags</th>
                <th className="text-left px-3 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">Notes</th>
                <th className="text-right px-3 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wider w-24">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredAndSorted.length === 0 ? (
                <tr>
                  <td colSpan={9 + followUpColumnCount} className="px-6 py-20 text-center">
                    <div className="flex flex-col items-center text-slate-500">
                      <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center mb-4">
                        <Inbox className="w-7 h-7 text-slate-400" />
                      </div>
                      <p className="font-medium text-slate-600">{entries.length === 0 ? 'No entries yet' : 'No matches'}</p>
                      <p className="text-sm mt-1 max-w-sm">{entries.length === 0 ? 'Add an entry or import CSV to get started.' : 'Try changing your filters.'}</p>
                      {entries.length === 0 && (
                        <button type="button" onClick={handleAddManual} className="mt-5 inline-flex items-center gap-2 bg-cyan-600 hover:bg-cyan-700 text-white px-4 py-2.5 rounded-lg text-sm font-medium">
                          <Plus className="w-4 h-4" /> Add entry
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                filteredAndSorted.map((entry) => (
                  <tr key={entry.id} className="hover:bg-slate-50/50 transition-colors">
                    <RecipientsCell recipients={entry.recipients ?? []} />
                    <td className="px-3 py-2 text-sm text-slate-700">{entry.roleApplyingFor || '—'}</td>
                    <td className="px-3 py-2">
                      <div className="flex items-center gap-1.5">
                        <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="text-sm text-slate-900 truncate max-w-[120px]">{entry.company || '—'}</span>
                      </div>
                    </td>
                    <MessageCell msg={entry.message} />
                    <td className="px-3 py-2 text-xs text-slate-600">{formatDisplayDate(entry.message?.date ?? '') || '—'}</td>
                    {Array.from({ length: followUpColumnCount }, (_, i) => i).map((i) => (
                      <FollowUpCell
                        key={i}
                        followUp={(entry.followUps ?? [{ date: '', read: false }])[i] ?? { date: '', read: false }}
                        onToggleRead={() => toggleFollowUpRead(entry, i)}
                      />
                    ))}
                    <td className="px-3 py-2">
                      <StatusPill
                        status={(['opened', 'replied', 'ignored', 'booked'].includes(entry.status ?? '') ? entry.status : 'ignored') as ColdEmailStatus}
                        onSelect={(s) => updateStatus(entry, s)}
                      />
                    </td>
                    <td className="px-3 py-2">
                      <div className="flex flex-wrap gap-1 max-w-[100px]">
                        {(entry.tags ?? []).map((t) => (
                          <span key={t} className="inline-flex px-1.5 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-700 truncate max-w-[80px]">
                            {t}
                          </span>
                        ))}
                        {!(entry.tags ?? []).length && <span className="text-slate-400 text-xs">—</span>}
                      </div>
                    </td>
                    <td className="px-3 py-2 text-sm text-slate-600 max-w-[100px] truncate" title={entry.notes ?? undefined}>
                      {entry.notes || '—'}
                    </td>
                    <td className="px-3 py-2 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-0.5">
                        <Link to={`/dashboard/cold-email-tracker/${entry.id}`} className="p-2 text-slate-400 hover:text-cyan-600 hover:bg-cyan-50/80 rounded-lg" title="View">
                          <Eye className="w-4 h-4" />
                        </Link>
                        <button type="button" onClick={() => handleEditEntry(entry)} className="p-2 text-slate-400 hover:text-cyan-600 hover:bg-cyan-50/80 rounded-lg" title="Edit">
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button type="button" onClick={() => deleteRow(entry.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50/80 rounded-lg" title="Delete">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <ColdEmailEntryModal
        key={editingEntry?.id ?? 'new'}
        open={modalOpen}
        onClose={() => { setModalOpen(false); setEditingEntry(null); }}
        entry={editingEntry}
        onSaved={handleModalSaved}
        save={saveModal}
      />
    </div>
  );
}

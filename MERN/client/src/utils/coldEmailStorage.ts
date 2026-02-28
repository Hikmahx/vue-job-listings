import type { ColdEmailEntry, ColdEmailMessage, ColdEmailFollowUp } from '../types';

const STORAGE_KEY = 'cold-email-tracker';

const emptyMessage = (): ColdEmailMessage => ({
  subject: '',
  date: '',
  read: false,
  response: false,
  emailSent: '',
});

const emptyFollowUp = (): ColdEmailFollowUp => ({ date: '', read: false });

export function createNewEntry(): ColdEmailEntry {
  const now = new Date().toISOString();
  return {
    id: crypto.randomUUID(),
    company: '',
    roleApplyingFor: '',
    recipients: [],
    message: emptyMessage(),
    followUps: [emptyFollowUp()],
    status: 'ignored',
    tags: [],
    notes: '',
    followUpDate: '',
    createdAt: now,
    updatedAt: now,
  };
}

export function loadEntries(): ColdEmailEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as ColdEmailEntry[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveEntries(entries: ColdEmailEntry[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
}

const escape = (v: string) => (v.includes(',') || v.includes('"') ? `"${String(v).replace(/"/g, '""')}"` : v);

export function exportToCsv(entries: ColdEmailEntry[]): string {
  const headers = [
    'Company',
    'Recipients',
    'Role',
    'Status',
    'Tags',
    'Message Subject',
    'Message Date',
    'Message Read',
    'Message Response',
    'Flw-up 1 Date',
    'Flw-up 1 Read',
    'Flw-up 2 Date',
    'Flw-up 2 Read',
    'Flw-up 3 Date',
    'Flw-up 3 Read',
    'Flw-up 4 Date',
    'Flw-up 4 Read',
    'Notes',
    'Follow-up Date',
  ];
  const rows = entries.map((e) => {
    const recStr = (e.recipients ?? []).map((r) => `${r.fullName} <${r.email}>`).join('; ');
    const fu = e.followUps ?? [emptyFollowUp()];
    return [
      e.company,
      recStr,
      e.roleApplyingFor,
      e.status,
      (e.tags ?? []).join('; '),
      e.message?.subject ?? '',
      e.message?.date ?? '',
      e.message?.read ? 'Yes' : '',
      e.message?.response ? 'Yes' : '',
      fu[0]?.date ?? '',
      fu[0]?.read ? 'Yes' : '',
      fu[1]?.date ?? '',
      fu[1]?.read ? 'Yes' : '',
      fu[2]?.date ?? '',
      fu[2]?.read ? 'Yes' : '',
      fu[3]?.date ?? '',
      fu[3]?.read ? 'Yes' : '',
      e.notes,
      e.followUpDate,
    ];
  });
  return [headers.map(escape).join(','), ...rows.map((r) => r.map((c) => escape(String(c ?? ''))).join(','))].join('\n');
}

/** Parse CSV text into partial entries for import (minimal validation) */
export function parseCsvForImport(csvText: string): Partial<ColdEmailEntry>[] {
  const lines = csvText.split(/\r?\n/).filter(Boolean);
  if (lines.length < 2) return [];
  const headers = lines[0].toLowerCase().split(',').map((h) => h.trim().replace(/^"|"$/g, ''));
  const rows: Partial<ColdEmailEntry>[] = [];
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map((v) => v.replace(/^"|"$/g, '').replace(/""/g, '"').trim());
    const row: Record<string, string> = {};
    headers.forEach((h, j) => { row[h] = values[j] ?? ''; });
    const recipients: { fullName: string; email: string }[] = [];
    const recStr = row['recipients'] ?? row['contact names'] ?? '';
    if (recStr) {
      recStr.split(';').forEach((part: string) => {
        const m = part.trim().match(/^(.+?)\s*<([^>]+)>$/);
        if (m) recipients.push({ fullName: m[1].trim(), email: m[2].trim() });
        else if (part.trim()) recipients.push({ fullName: part.trim(), email: '' });
      });
    }
    if (recipients.length === 0 && (row['email'] || row['contact names'])) {
      recipients.push({ fullName: row['contact names'] ?? row['contactnames'] ?? '', email: row['email'] ?? '' });
    }
    const msgSubject = row['message subject'] ?? row['msg1 subject'] ?? '';
    const msgDate = row['message date'] ?? row['msg1 date'] ?? '';
    const msgRead = /yes|1|true/i.test(row['message read'] ?? row['msg1 read'] ?? '');
    const msgResponse = /yes|1|true/i.test(row['message response'] ?? row['msg1 response'] ?? '');
    const followUps: ColdEmailFollowUp[] = [
      { date: row['flw-up 1 date'] ?? '', read: /yes|1|true/i.test(row['flw-up 1 read'] ?? '') },
      { date: row['flw-up 2 date'] ?? '', read: /yes|1|true/i.test(row['flw-up 2 read'] ?? '') },
      { date: row['flw-up 3 date'] ?? '', read: /yes|1|true/i.test(row['flw-up 3 read'] ?? '') },
      { date: row['flw-up 4 date'] ?? '', read: /yes|1|true/i.test(row['flw-up 4 read'] ?? '') },
    ].filter((f) => f.date || f.read);
    if (followUps.length === 0) followUps.push({ date: '', read: false });
    rows.push({
      company: row['company'] ?? '',
      roleApplyingFor: row['role'] ?? '',
      recipients: recipients.length ? recipients : [{ fullName: '', email: '' }],
      status: ['opened', 'replied', 'ignored', 'booked'].includes(row['status']?.toLowerCase() ?? '') ? row['status'].toLowerCase() as ColdEmailEntry['status'] : 'ignored',
      tags: (row['tags'] ?? '').split(';').map((t: string) => t.trim()).filter(Boolean),
      notes: row['notes'] ?? '',
      followUpDate: row['follow-up date'] ?? row['followupdate'] ?? '',
      message: { subject: msgSubject, date: msgDate, read: msgRead, response: msgResponse, emailSent: '' },
      followUps,
    });
  }
  return rows;
}

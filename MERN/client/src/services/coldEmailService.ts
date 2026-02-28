import api from './api';
import type { ColdEmailEntry, ColdEmailMessage, ColdEmailFollowUp } from '../types';

const BASE = '/cold-emails';

function normalizeEntry(raw: any): ColdEmailEntry {
  let message: ColdEmailMessage;
  let followUps: ColdEmailFollowUp[];
  if (raw.message && typeof raw.message === 'object') {
    message = {
      subject: raw.message.subject ?? '',
      date: raw.message.date ?? '',
      read: !!raw.message.read,
      response: !!raw.message.response,
      emailSent: raw.message.emailSent ?? '',
    };
    followUps = Array.isArray(raw.followUps) && raw.followUps.length >= 1
      ? raw.followUps.slice(0, 4).map((f: any) => ({ date: f?.date ?? '', read: !!f?.read }))
      : [{ date: '', read: false }];
  } else {
    message = {
      subject: raw.message1?.subject ?? '',
      date: raw.message1?.date ?? '',
      read: !!raw.message1?.read,
      response: !!raw.message1?.response,
      emailSent: raw.message1?.emailSent ?? '',
    };
    followUps = [raw.message2, raw.message3, raw.message4, raw.message5]
      .filter(Boolean)
      .map((m: any) => ({ date: m?.date ?? '', read: !!m?.read }));
    if (followUps.length === 0) followUps = [{ date: '', read: false }];
  }
  return {
    ...raw,
    message,
    followUps,
  } as ColdEmailEntry;
}

export const coldEmailService = {
  async getEntries(): Promise<ColdEmailEntry[]> {
    const { data } = await api.get<any[]>(BASE);
    return (Array.isArray(data) ? data : []).map(normalizeEntry);
  },

  async getEntry(id: string): Promise<ColdEmailEntry | null> {
    try {
      const { data } = await api.get<any>(`${BASE}/${id}`);
      return data ? normalizeEntry(data) : null;
    } catch {
      return null;
    }
  },

  async create(entry: Partial<ColdEmailEntry>): Promise<ColdEmailEntry> {
    const { data } = await api.post<any>(BASE, entry);
    return normalizeEntry(data);
  },

  async update(id: string, patch: Partial<ColdEmailEntry>): Promise<ColdEmailEntry> {
    const { data } = await api.put<any>(`${BASE}/${id}`, patch);
    return normalizeEntry(data);
  },

  async delete(id: string): Promise<void> {
    await api.delete(`${BASE}/${id}`);
  },
};

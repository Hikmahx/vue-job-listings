import { _axiosInstance } from './authService'
import type { ColdEmailEntry, ColdEmailMessage, ColdEmailFollowUp } from '@/types/coldEmail'

const BASE = '/cold-emails'

function normalizeEntry(raw: Record<string, unknown>): ColdEmailEntry {
  let message: ColdEmailMessage
  let followUps: ColdEmailFollowUp[]

  const rawMsg = raw.message as Record<string, unknown> | undefined
  if (rawMsg && typeof rawMsg === 'object') {
    message = {
      subject: (rawMsg.subject as string) ?? '',
      date: (rawMsg.date as string) ?? '',
      read: !!(rawMsg.read),
      response: !!(rawMsg.response),
      emailSent: (rawMsg.emailSent as string) ?? '',
    }
    const rawFu = raw.followUps as Array<Record<string, unknown>> | undefined
    followUps =
      Array.isArray(rawFu) && rawFu.length >= 1
        ? rawFu.slice(0, 4).map((f) => ({ date: (f?.date as string) ?? '', read: !!(f?.read) }))
        : [{ date: '', read: false }]
  } else {
    // (message1..5)
    const m1 = raw.message1 as Record<string, unknown> | undefined
    message = {
      subject: (m1?.subject as string) ?? '',
      date: (m1?.date as string) ?? '',
      read: !!(m1?.read),
      response: !!(m1?.response),
      emailSent: (m1?.emailSent as string) ?? '',
    }
    followUps = ([raw.message2, raw.message3, raw.message4, raw.message5] as Array<Record<string, unknown> | undefined>)
      .filter(Boolean)
      .map((m) => ({ date: (m?.date as string) ?? '', read: !!(m?.read) }))
    if (followUps.length === 0) followUps = [{ date: '', read: false }]
  }

  const rawRecipients = raw.recipients as Array<Record<string, unknown>> | undefined
  const recipients = Array.isArray(rawRecipients)
    ? rawRecipients.map((r) => ({
        fullName: (r?.fullName as string) ?? '',
        email: (r?.email as string) ?? '',
        avatar: (r?.avatar as string) ?? '',
      }))
    : []

  return {
    id: String(raw.id),
    company: (raw.company as string) ?? '',
    roleApplyingFor: (raw.roleApplyingFor as string) ?? '',
    recipients,
    message,
    followUps,
    status: (['opened', 'replied', 'ignored', 'booked'].includes(raw.status as string)
      ? raw.status
      : 'ignored') as ColdEmailEntry['status'],
    tags: Array.isArray(raw.tags) ? (raw.tags as string[]) : [],
    notes: (raw.notes as string) ?? '',
    followUpDate: (raw.followUpDate as string) ?? '',
    createdAt: (raw.createdAt as string) ?? new Date().toISOString(),
    updatedAt: (raw.updatedAt as string) ?? new Date().toISOString(),
  }
}

export const coldEmailService = {
  async getEntries(): Promise<ColdEmailEntry[]> {
    const { data } = await _axiosInstance.get<unknown[]>(`${BASE}/`)
    return (Array.isArray(data) ? data : []).map((r) => normalizeEntry(r as Record<string, unknown>))
  },

  async getEntry(id: string): Promise<ColdEmailEntry | null> {
    try {
      const { data } = await _axiosInstance.get<unknown>(`${BASE}/${id}/`)
      return data ? normalizeEntry(data as Record<string, unknown>) : null
    } catch {
      return null
    }
  },

  async create(entry: Partial<ColdEmailEntry>): Promise<ColdEmailEntry> {
    const { data } = await _axiosInstance.post<unknown>(`${BASE}/`, entry)
    return normalizeEntry(data as Record<string, unknown>)
  },

  async update(id: string, patch: Partial<ColdEmailEntry>): Promise<ColdEmailEntry> {
    const { data } = await _axiosInstance.put<unknown>(`${BASE}/${id}/`, patch)
    return normalizeEntry(data as Record<string, unknown>)
  },

  async delete(id: string): Promise<void> {
    await _axiosInstance.delete(`${BASE}/${id}/`)
  },
}

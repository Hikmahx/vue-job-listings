// Mirrors MERN types/index.ts ColdEmail* interfaces exactly

export interface ColdEmailRecipient {
  fullName: string
  email: string
  avatar?: string
}

export interface ColdEmailMessage {
  subject: string
  date: string
  read: boolean
  response: boolean
  emailSent: string
}

export interface ColdEmailFollowUp {
  date: string
  read: boolean
}

export type ColdEmailStatus = 'opened' | 'replied' | 'ignored' | 'booked'

export interface ColdEmailEntry {
  id: string
  company: string
  roleApplyingFor: string
  recipients: ColdEmailRecipient[]
  message: ColdEmailMessage
  followUps: ColdEmailFollowUp[]
  status: ColdEmailStatus
  tags: string[]
  notes: string
  followUpDate: string
  createdAt: string
  updatedAt: string
  // Legacy (MERN compat)
  contactNames?: string
  contactEmail?: string
}

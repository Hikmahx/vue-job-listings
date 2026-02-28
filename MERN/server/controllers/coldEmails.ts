import { Response } from 'express';
import { ColdEmailEntry } from '../models/ColdEmailEntry';
import { AuthRequest } from '../middleware/auth';

function normalizeRecipients(doc: any): Array<{ fullName: string; email: string; avatar?: string }> {
  const recs = doc.recipients;
  if (Array.isArray(recs) && recs.length > 0) {
    return recs.map((r: any) => ({
      fullName: r?.fullName ?? '',
      email: r?.email ?? '',
      avatar: r?.avatar ?? '',
    }));
  }
  const name = doc.contactNames ?? '';
  const email = doc.contactEmail ?? '';
  if (name || email) {
    return [{ fullName: name, email, avatar: '' }];
  }
  return [];
}

function msgToMessage(m: any) {
  return {
    subject: m?.subject ?? '',
    date: m?.date ?? '',
    read: !!m?.read,
    response: !!m?.response,
    emailSent: m?.emailSent ?? '',
  };
}

function toMessageAndFollowUps(doc: any) {
  if (doc.message && typeof doc.message === 'object') {
    const followUps = Array.isArray(doc.followUps) && doc.followUps.length >= 1
      ? doc.followUps.slice(0, 4).map((f: any) => ({ date: f?.date ?? '', read: !!f?.read }))
      : [{ date: '', read: false }];
    return { message: msgToMessage(doc.message), followUps };
  }
  const message = msgToMessage(doc.message1);
  const followUps: Array<{ date: string; read: boolean }> = [
    doc.message2, doc.message3, doc.message4, doc.message5,
  ].filter(Boolean).map((m: any) => ({ date: m?.date ?? '', read: !!m?.read }));
  if (followUps.length === 0) followUps.push({ date: '', read: false });
  return { message, followUps };
}

function toResponse(doc: any) {
  const { message, followUps } = toMessageAndFollowUps(doc);
  const status = doc.status;
  const validStatus = ['opened', 'replied', 'ignored', 'booked'].includes(status) ? status : 'ignored';
  return {
    id: doc._id.toString(),
    company: doc.company ?? '',
    roleApplyingFor: doc.roleApplyingFor ?? '',
    recipients: normalizeRecipients(doc),
    message,
    followUps,
    status: validStatus,
    tags: Array.isArray(doc.tags) ? doc.tags : [],
    notes: doc.notes ?? '',
    followUpDate: doc.followUpDate ?? '',
    createdAt: doc.createdAt?.toISOString?.() ?? new Date().toISOString(),
    updatedAt: doc.updatedAt?.toISOString?.() ?? new Date().toISOString(),
  };
}

function normalizeMessage(bodyMsg: any, existing: any) {
  if (!bodyMsg || typeof bodyMsg !== 'object') return existing ?? {};
  return {
    subject: bodyMsg.subject ?? existing?.subject ?? '',
    date: bodyMsg.date ?? existing?.date ?? '',
    read: bodyMsg.read ?? existing?.read ?? false,
    response: bodyMsg.response ?? existing?.response ?? false,
    emailSent: bodyMsg.emailSent ?? existing?.emailSent ?? '',
  };
}

// GET /api/cold-emails — list all entries for the authenticated user
export const getColdEmailEntries = async (req: AuthRequest, res: Response) => {
  try {
    const entries = await ColdEmailEntry.find({ user: req.user?.id })
      .sort({ updatedAt: -1 })
      .lean();
    res.json(entries.map(toResponse));
  } catch (error: any) {
    console.error('Get cold email entries error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// GET /api/cold-emails/:id — get one entry by id (must belong to user)
export const getColdEmailEntryById = async (req: AuthRequest, res: Response) => {
  try {
    const entry = await ColdEmailEntry.findOne({
      _id: req.params.id,
      user: req.user?.id,
    }).lean();
    if (!entry) {
      return res.status(404).json({ message: 'Cold email entry not found' });
    }
    res.json(toResponse(entry));
  } catch (error: any) {
    console.error('Get cold email entry error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// POST /api/cold-emails — create a new entry
export const createColdEmailEntry = async (req: AuthRequest, res: Response) => {
  try {
    const body = req.body;
    const recipients = Array.isArray(body.recipients) && body.recipients.length > 0
      ? body.recipients.map((r: any) => ({
          fullName: r?.fullName ?? '',
          email: r?.email ?? '',
          avatar: r?.avatar ?? '',
        }))
      : [{ fullName: body.contactNames ?? '', email: body.contactEmail ?? '', avatar: '' }];
    let message = normalizeMessage(body.message, null);
    let followUps: Array<{ date: string; read: boolean }>;
    if (Array.isArray(body.followUps) && body.followUps.length >= 1) {
      followUps = body.followUps.slice(0, 4).map((f: any) => ({ date: f?.date ?? '', read: !!f?.read }));
    } else if (body.message1 || body.message2) {
      message = normalizeMessage(body.message1, null);
      followUps = [body.message2, body.message3, body.message4, body.message5]
        .filter(Boolean)
        .map((m: any) => ({ date: m?.date ?? '', read: !!m?.read }));
      if (followUps.length === 0) followUps = [{ date: '', read: false }];
    } else {
      followUps = [{ date: '', read: false }];
    }
    const doc = await ColdEmailEntry.create({
      user: req.user?.id,
      company: body.company ?? '',
      roleApplyingFor: body.roleApplyingFor ?? '',
      recipients,
      message,
      followUps,
      status: ['opened', 'replied', 'booked'].includes(body.status) ? body.status : 'ignored',
      tags: Array.isArray(body.tags) ? body.tags : [],
      notes: body.notes ?? '',
      followUpDate: body.followUpDate ?? '',
    });
    res.status(201).json(toResponse(doc));
  } catch (error: any) {
    console.error('Create cold email entry error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// PUT /api/cold-emails/:id — update an entry (must belong to user)
export const updateColdEmailEntry = async (req: AuthRequest, res: Response) => {
  try {
    const entry = await ColdEmailEntry.findOne({
      _id: req.params.id,
      user: req.user?.id,
    });
    if (!entry) {
      return res.status(404).json({ message: 'Cold email entry not found' });
    }
    const body = req.body;
    ['company', 'roleApplyingFor', 'notes', 'followUpDate'].forEach((field) => {
      if (body[field] !== undefined) (entry as any)[field] = body[field];
    });
    if (body.status && ['opened', 'replied', 'ignored', 'booked'].includes(body.status)) {
      (entry as any).status = body.status;
    }
    if (Array.isArray(body.tags)) {
      (entry as any).tags = body.tags;
    }
    if (Array.isArray(body.recipients) && body.recipients.length > 0) {
      (entry as any).recipients = body.recipients.map((r: any) => ({
        fullName: r?.fullName ?? '',
        email: r?.email ?? '',
        avatar: r?.avatar ?? '',
      }));
    }
    if (body.message && typeof body.message === 'object') {
      (entry as any).message = normalizeMessage(body.message, (entry as any).message);
    }
    if (Array.isArray(body.followUps) && body.followUps.length >= 1) {
      (entry as any).followUps = body.followUps.slice(0, 4).map((f: any) => ({ date: f?.date ?? '', read: !!f?.read }));
    }
    await entry.save();
    res.json(toResponse(entry));
  } catch (error: any) {
    console.error('Update cold email entry error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// DELETE /api/cold-emails/:id — delete an entry (must belong to user)
export const deleteColdEmailEntry = async (req: AuthRequest, res: Response) => {
  try {
    const result = await ColdEmailEntry.findOneAndDelete({
      _id: req.params.id,
      user: req.user?.id,
    });
    if (!result) {
      return res.status(404).json({ message: 'Cold email entry not found' });
    }
    res.json({ message: 'Deleted successfully' });
  } catch (error: any) {
    console.error('Delete cold email entry error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

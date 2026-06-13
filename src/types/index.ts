export type EmailIntent = '咨询' | '投诉' | '报价' | '催办' | '其他';
export type EmailStatus = 'unread' | 'read' | 'replied' | 'pending';
export type TaskStatus = 'pending' | 'in_progress' | 'completed';
export type ToneType = 'formal' | 'friendly' | 'urgent' | 'professional';
export type ApprovalStatus = 'none' | 'pending' | 'approved' | 'rejected';

export interface EmailEntities {
  customerName: string | null;
  product: string | null;
  amount: number | null;
  deadline: string | null;
  contactInfo: string | null;
}

export interface ApprovalRecord {
  id: string;
  emailId: string;
  submitterId: string;
  submitterName: string;
  status: ApprovalStatus;
  submittedAt: string;
  reviewedAt?: string;
  reviewerId?: string;
  reviewerName?: string;
  rejectReason?: string;
  content?: string;
}

export interface Email {
  id: string;
  userId: string;
  contactId: string;
  subject: string;
  content: string;
  intent: EmailIntent;
  confidence: number;
  entities: EmailEntities;
  status: EmailStatus;
  approvalStatus: ApprovalStatus;
  approvalHistory: ApprovalRecord[];
  receivedAt: string;
  repliedAt?: string;
  createdAt: string;
}

export interface Contact {
  id: string;
  userId: string;
  name: string;
  company: string;
  position: string;
  email: string;
  phone: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Task {
  id: string;
  userId: string;
  emailId: string;
  title: string;
  description: string;
  status: TaskStatus;
  deadline: string;
  reminderAt: string;
  completedAt?: string;
  createdAt: string;
}

export interface Template {
  id: string;
  userId: string;
  name: string;
  content: string;
  category: string;
  createdAt: string;
}

export interface Statistics {
  id: string;
  userId: string;
  date: string;
  totalEmails: number;
  repliedEmails: number;
  pendingEmails: number;
  avgResponseTime: number;
  convertedLeads: number;
  createdAt: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

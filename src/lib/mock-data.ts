
import { User, Application, ApplicationStep, ChatMessage, Invoice, VisaApplication } from '@/types';

export const mockUsers: User[] = [
  {
    id: 'user-1',
    email: 'john.doe@example.com',
    role: 'customer',
    name: 'John Doe',
    phone: '+971501234567',
    createdAt: '2024-01-15T10:00:00Z',
    profileComplete: true,
  },
  {
    id: 'agent-1',
    email: 'sarah.agent@waflow.com',
    role: 'agent',
    name: 'Sarah Johnson',
    phone: '+971509876543',
    createdAt: '2024-01-10T08:00:00Z',
    profileComplete: true,
  },
];

export const applicationSteps: ApplicationStep[] = [
  {
    id: 1,
    title: 'KYC & Background Check',
    description: 'Identity verification and background screening',
    status: 'approved',
    agentNotes: 'All documents verified successfully',
    completedAt: '2024-01-20T14:30:00Z',
  },
  {
    id: 2,
    title: 'Trade Name Reservation',
    description: 'Reserve your business name with authorities',
    status: 'approved',
    agentNotes: 'Name "TechFlow Solutions" approved',
    completedAt: '2024-01-22T09:15:00Z',
  },
  {
    id: 3,
    title: 'Activity Clearance',
    description: 'Get clearance for your business activities',
    status: 'in-progress',
    agentNotes: 'Waiting for economic department approval',
  },
  {
    id: 4,
    title: 'Office Lease & Setup',
    description: 'Secure office space and setup requirements',
    status: 'pending',
  },
  {
    id: 5,
    title: 'License Issuance',
    description: 'Final business license processing',
    status: 'pending',
  },
  {
    id: 6,
    title: 'Visa Application',
    description: 'Process residence visa applications',
    status: 'pending',
  },
  {
    id: 7,
    title: 'VAT & Corporate Tax Registration',
    description: 'Register for VAT and corporate tax',
    status: 'pending',
  },
  {
    id: 8,
    title: 'Bank Account Setup',
    description: 'Open corporate bank account',
    status: 'pending',
  },
];

export const mockApplications: Application[] = [
  {
    id: 'APP-2024-001',
    customerId: 'user-1',
    agentId: 'agent-1',
    businessName: 'TechFlow Solutions',
    businessType: 'freezone',
    status: 'under-review',
    currentStep: 3,
    steps: applicationSteps,
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-23T16:45:00Z',
  },
];

export const mockChatMessages: ChatMessage[] = [
  {
    id: 'msg-1',
    applicationId: 'APP-2024-001',
    senderId: 'agent-1',
    senderName: 'Sarah Johnson',
    senderRole: 'agent',
    message: 'Hello John! I\'ve been assigned as your agent for the business registration. I\'ve reviewed your documents and everything looks good for the KYC process.',
    timestamp: '2024-01-20T10:00:00Z',
  },
  {
    id: 'msg-2',
    applicationId: 'APP-2024-001',
    senderId: 'user-1',
    senderName: 'John Doe',
    senderRole: 'customer',
    message: 'Thank you Sarah! What\'s the next step after KYC approval?',
    timestamp: '2024-01-20T10:15:00Z',
  },
  {
    id: 'msg-3',
    applicationId: 'APP-2024-001',
    senderId: 'agent-1',
    senderName: 'Sarah Johnson',
    senderRole: 'agent',
    message: 'We\'ll proceed with trade name reservation. I\'ve already submitted "TechFlow Solutions" for approval. You should hear back within 2-3 business days.',
    timestamp: '2024-01-20T10:30:00Z',
  },
];

export const mockInvoices: Invoice[] = [
  {
    id: 'INV-001',
    applicationId: 'APP-2024-001',
    amount: 15000,
    currency: 'AED',
    status: 'paid',
    notes: 'Initial setup fee for Freezone license',
    createdAt: '2024-01-18T12:00:00Z',
    paidAt: '2024-01-19T14:30:00Z',
  },
  {
    id: 'INV-002',
    applicationId: 'APP-2024-001',
    amount: 5000,
    currency: 'AED',
    status: 'pending',
    notes: 'Office lease and setup fees',
    createdAt: '2024-01-23T09:00:00Z',
  },
];

export const mockVisaApplication: VisaApplication = {
  id: 'VISA-001',
  applicationId: 'APP-2024-001',
  customerId: 'user-1',
  status: 'pending',
  documents: [],
  createdAt: '2024-01-23T15:00:00Z',
  updatedAt: '2024-01-23T15:00:00Z',
};

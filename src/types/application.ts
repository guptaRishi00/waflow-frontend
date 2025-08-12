export interface ApplicationDocument {
  _id: string;
  documentName: string;
  name?: string;
  status: string;
  stepName?: string;
  relatedStepName?: string;
  applicationId: string;
  documentType: string;
  documentUrl?: string;
  url?: string;
  fileUrl?: string;
  uploadedAt: string;
  updatedAt: string;
}

export interface Customer {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
}

export interface ApplicationStep {
  _id: string;
  stepName: string;
  status: string;
  isCompleted: boolean;
  documents?: ApplicationDocument[];
}

export interface ApiApplicationData {
  _id: string;
  applicationId: string;
  status: string;
  applicationType: string;
  customer: Customer;
  steps: ApplicationStep[];
  emirate?: string;
  legalForm?: string;
  proposedCompanyNamesEN?: string[];
  proposedCompanyNameAR?: string;
  officeRequired?: boolean;
  officeType?: string;
  applicationNotes?: string;
  businessActivities?: string[];
  assignedAgent?: {
    fullName: string;
  };
  totalAgreedCost?: number;
  paymentEntries?: Array<{
    paymentMethod?: string;
    amountPaid?: number;
    paymentDate?: string;
    transactionRefNo?: string;
    paymentStatus?: string;
    receiptUpload?: string | null;
    additionalNotes?: string;
  }>;
  shareholderDetails?: any;
  sponsorDetails?: any;
  createdAt: string;
  updatedAt: string;
}

export interface WorkflowStep {
  id: string;
  title: string;
  stepName: string;
  icon: string;
  status: "not-started" | "submitted" | "awaiting" | "approved" | "declined";
  internalNotes: string;
  customerNotes: string;
  documents: ApplicationDocument[];
  substeps?: WorkflowStep[];
  syncStatus?: "synced" | "pending" | "error";
}

export interface ApplicationDetails {
  customerName: string;
  applicationType: string;
  emirate: string;
  legalForm: string;
  proposedCompanyNames: string[];
  officeRequirement: string;
  officeType: string;
  applicationNotes: string;
  assignedAgent: string;
  totalAgreedCost: number;
  paymentEntries: Array<{
    method: string;
    amount: number;
    date: string;
    reference: string;
    status: string;
    receipt: string | null;
    notes: string;
  }>;
  shareholders: any[];
}

export const statusColors = {
  "not-started": "bg-gray-500",
  submitted: "bg-blue-500",
  awaiting: "bg-yellow-500",
  approved: "bg-green-500",
  declined: "bg-red-500",
} as const;

export const statusIcons = {
  "not-started": "Clock",
  submitted: "FileCheck",
  awaiting: "AlertCircle",
  approved: "CheckCircle",
  declined: "XCircle",
} as const;

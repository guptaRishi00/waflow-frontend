export interface User {
  id: string;
  email: string;
  role: "customer" | "agent" | "manager";
  name: string;
  phone?: string;
  createdAt: string;
  profileComplete: boolean;
  assignedAgentId?: string; // for customers
  managerId?: string; // for agents
}

export interface VisaSubStep {
  memberId: {
    _id: string;
    firstName?: string;
    lastName?: string;
    email?: string;
  };
  medical: { stepName: string; status: string; updatedAt: string };
  residenceVisa: { stepName: string; status: string; updatedAt: string };
  emiratesIdSoft: { stepName: string; status: string; updatedAt: string };
  emiratesIdHard: { stepName: string; status: string; updatedAt: string };
}

export interface Application {
  _id: string;
  customer: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber?: string;
  };
  assignedAgent?: {
    _id: string;
    fullName: string;
    email: string;
  };
  status: ApplicationStatus;
  steps: ApplicationStep[];
  createdAt: string;
  updatedAt: string;
  visaSubSteps?: VisaSubStep[];
}

export interface ApplicationStep {
  stepName: string;
  status: "Not Started" | "Started" | "Submitted" | "Approved" | "Declined";
  updatedAt: string;
}

export interface Document {
  id: string;
  name: string;
  type: DocumentType;
  url: string;
  status: "not-uploaded" | "uploaded" | "verified" | "rejected";
  uploadedAt: string;
  verifiedAt?: string;
  rejectionReason?: string;
}

export type DocumentType =
  | "passport"
  | "passport-photo"
  | "proof-of-address"
  | "source-of-funds"
  | "emirates-id"
  | "visa-documents"
  | "other";

export type ApplicationStatus =
  | "New"
  | "In Progress"
  | "Waiting for Agent Review"
  | "Ready for Processing"
  | "Awaiting Client Response"
  | "Completed"
  | "Rejected";

export interface ChatMessage {
  id: string;
  applicationId: string;
  senderId: string;
  senderName: string;
  senderRole: "customer" | "agent" | "manager";
  message: string;
  timestamp: string;
  attachments?: string[];
}

export interface Invoice {
  id: string;
  applicationId: string;
  amount: number;
  currency: string;
  status: "pending" | "paid" | "partial";
  pdfUrl?: string;
  notes?: string;
  createdAt: string;
  paidAt?: string;
}

export interface VisaApplication {
  id: string;
  applicationId: string;
  customerId: string;
  status: "pending" | "submitted" | "approved" | "rejected";
  appointmentLetter?: string;
  documents: Document[];
  createdAt: string;
  updatedAt: string;
}

import React, { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  FileText,
  Upload,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  FileCheck,
  AlertTriangle,
  Eye,
  RefreshCw,
  Shield,
  Home,
  Building2,
  UserCheck,
  Calendar,
  Banknote,
  Building,
  ClipboardCheck,
  MessageSquare,
  Plus,
  Trash2,
} from "lucide-react";
import {
  WorkflowStep as WorkflowStepType,
  ApplicationDocument,
} from "@/types/application";
import { useFileUpload } from "@/hooks/useFileUpload";
import { ApiApplicationData } from "@/types/application";
import axios from "axios";
import { useToast } from "@/hooks/use-toast";
import { useSelector } from "react-redux";
import { RootState } from "@/app/store";

interface Note {
  _id?: string;
  message: string;
  addedBy: {
    fullName?: string;
    email?: string;
  };
  addedByRole: string;
  timestamp: string;
  stepId?: string;
  stepName?: string;
}

interface WorkflowStepProps {
  step: WorkflowStepType;
  stepIndex: number;
  workflowSteps: WorkflowStepType[];
  applicationData: ApiApplicationData | null;
  isBulkUpdateInProgress: boolean;
  onUpdateStepStatus: (
    stepId: string,
    newStatus: WorkflowStepType["status"]
  ) => Promise<void>;
  onUpdateStepNotes: (
    stepId: string,
    field: "internalNotes" | "customerNotes",
    value: string
  ) => void;
  onDocumentStatusChange: (
    documentId: string,
    newStatus: string,
    options?: { isBulk?: boolean }
  ) => Promise<void>;
  fetchApplicationDocuments: (applicationId: string) => Promise<void>;
  userRole?: string;
}

const WorkflowStep: React.FC<WorkflowStepProps> = ({
  step,
  stepIndex,
  workflowSteps,
  applicationData,
  isBulkUpdateInProgress,
  onUpdateStepStatus,
  onUpdateStepNotes,
  onDocumentStatusChange,
  fetchApplicationDocuments,
  userRole,
}) => {
  // Debug: Log the application data structure
  console.log("🔍 WorkflowStep Debug - applicationData:", {
    applicationId: applicationData?.applicationId,
    _id: applicationData?._id,
    customerId: applicationData?.customer?._id,
    fullApplicationData: applicationData,
  });
  const { isUploading, handleFileInputChange } = useFileUpload(
    applicationData,
    fetchApplicationDocuments
  );
  const { toast } = useToast();
  const { token } = useSelector((state: RootState) => state.customerAuth);
  const [notes, setNotes] = useState<Note[]>([]);
  const [newNote, setNewNote] = useState("");
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [isLoadingNotes, setIsLoadingNotes] = useState(false);

  // Load notes for this step - only once when component mounts
  useEffect(() => {
    if (applicationData?.applicationId && token) {
      loadNotes();
    }
  }, [applicationData?.applicationId, token]); // Remove loadNotes from dependency

  const loadNotes = async () => {
    if (!applicationData?.applicationId || !token) return;

    setIsLoadingNotes(true);
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/api/application/${
          applicationData.applicationId
        }`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success && response.data.data.notes) {
        setNotes(response.data.data.notes);
      }
    } catch (error) {
      console.error("Error loading notes:", error);
    } finally {
      setIsLoadingNotes(false);
    }
  };

  const addNote = async () => {
    if (!newNote.trim() || !applicationData?.customer?._id || !token) return;

    setIsAddingNote(true);
    try {
      const backendStepName = getBackendStepName(step.title);
      console.log("📝 Note Creation Debug:", {
        message: newNote,
        stepId: step.id,
        frontendTitle: step.title,
        backendStepName,
        customerId: applicationData.customer._id,
        token: token ? "Present" : "Missing",
      });

      const response = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/api/application/note/${
          applicationData.customer._id
        }`,
        {
          message: newNote,
          stepId: step.id,
          stepName: backendStepName,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.message === "Note added successfully") {
        setNewNote("");
        // Add the new note to local state instead of reloading
        const newNoteObj = {
          _id: Date.now().toString(), // Temporary ID
          message: newNote,
          addedBy: { fullName: "You" },
          addedByRole: userRole || "user",
          timestamp: new Date().toISOString(),
        };
        setNotes((prev) => [newNoteObj, ...prev]);
        toast({
          title: "Note added successfully",
          description: "Your note has been added to this step",
        });
      }
    } catch (error) {
      console.error("Error adding note:", error);
      toast({
        title: "Error adding note",
        description: "Failed to add note. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsAddingNote(false);
    }
  };

  const deleteNote = async (noteId: string) => {
    if (!applicationData?.customer?._id) return;

    try {
      // Since there's no delete endpoint, we'll just remove from local state
      setNotes(notes.filter((note) => note._id !== noteId));
      toast({
        title: "Note removed",
        description: "Note has been removed from view",
      });
    } catch (error) {
      console.error("Error removing note:", error);
      toast({
        title: "Error removing note",
        description: "Failed to remove note. Please try again.",
        variant: "destructive",
      });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Map frontend step titles to backend workflow step names
  const getBackendStepName = (frontendTitle: string): string => {
    // Common step name mappings
    const stepMapping: { [key: string]: string } = {
      // Mainland and Freezone steps
      "KYC & Background Check": "KYC & Background Check",
      "Business Activity Selection": "Business Activity Selection",
      "Trade Name Reservation": "Trade Name Reservation",
      "Legal Structure Confirmation": "Legal Structure Confirmation",
      "Initial Approval / Pre-Approval": "Initial Approval / Pre-Approval",
      "MoA Drafting & Signature": "MoA Drafting & Signature",
      "Office Lease / Flexi Desk": "Office Lease / Flexi Desk",
      "Payment & License Issuance": "Payment & License Issuance",
      "Establishment Card": "Establishment Card",
      "Visa Allocation Request": "Visa Allocation Request",
      "Visa Application": "Visa Application",
      "Medical & Emirates ID": "Medical & Emirates ID",
      "Corporate Tax Registration": "Corporate Tax Registration",
      "VAT Registration": "VAT Registration",
      "Bank Account Setup": "Bank Account Setup",
      "Chamber of Commerce Registration": "Chamber of Commerce Registration",
      "Registered Agent Appointment": "Registered Agent Appointment",

      // Alternative names that might be used
      KYC: "KYC & Background Check",
      "Background Check": "KYC & Background Check",
      "Business Activity": "Business Activity Selection",
      "Trade Name": "Trade Name Reservation",
      "Legal Structure": "Legal Structure Confirmation",
      "Initial Approval": "Initial Approval / Pre-Approval",
      "Pre-Approval": "Initial Approval / Pre-Approval",
      MoA: "MoA Drafting & Signature",
      "Office Lease": "Office Lease / Flexi Desk",
      "Flexi Desk": "Office Lease / Flexi Desk",
      Payment: "Payment & License Issuance",
      "License Issuance": "Payment & License Issuance",
      Establishment: "Establishment Card",
      Visa: "Visa Application",
      Medical: "Medical & Emirates ID",
      "Emirates ID": "Medical & Emirates ID",
      "Corporate Tax": "Corporate Tax Registration",
      VAT: "VAT Registration",
      "Bank Account": "Bank Account Setup",
      Chamber: "Chamber of Commerce Registration",
    };

    // First try exact match
    if (stepMapping[frontendTitle]) {
      return stepMapping[frontendTitle];
    }

    // Then try partial match
    for (const [key, value] of Object.entries(stepMapping)) {
      if (
        frontendTitle.toLowerCase().includes(key.toLowerCase()) ||
        key.toLowerCase().includes(frontendTitle.toLowerCase())
      ) {
        return value;
      }
    }

    // If no match found, return the original title
    console.warn(`No step name mapping found for: ${frontendTitle}`);
    return frontendTitle;
  };

  const getStepState = (stepIndex: number) => {
    const step = workflowSteps[stepIndex];
    if (!step) return "upcoming";

    if (step.status === "approved") {
      return "completed";
    }

    if (stepIndex > 0) {
      const previousStep = workflowSteps[stepIndex - 1];
      if (previousStep && previousStep.status !== "approved") {
        return "upcoming";
      }
    }

    if (stepIndex === 0) {
      return "active";
    }

    return "active";
  };

  const getStepColor = () => {
    // Color based on step status, not just state
    if (step.status === "approved") return "bg-green-500 border-green-200";
    if (step.status === "declined") return "bg-red-500 border-red-200";
    if (step.status === "awaiting") return "bg-yellow-500 border-yellow-200";
    if (step.status === "submitted") return "bg-blue-500 border-blue-200";
    if (step.status === "not-started") return "bg-gray-400 border-gray-200";

    // Fallback to state-based colors
    const stepState = getStepState(stepIndex);
    if (stepState === "completed") return "bg-green-500 border-green-200";
    if (stepState === "active") return "bg-blue-500 border-blue-200";
    return "bg-gray-400 border-gray-200";
  };

  const stepState = getStepState(stepIndex);
  // Temporarily make all steps editable to see the dropdown
  // Hide dropdown when step is approved - no further changes needed
  // For now, allow editing if step is not approved (temporarily remove role check)
  const isEditable = step.status !== "approved";

  // Debug: Log the user role to see what's happening
  console.log("🔍 WorkflowStep Debug:", {
    stepTitle: step.title,
    userRole,
    isEditable,
    stepStatus: step.status,
    stepId: step.id,
  });

  // Render icon based on icon name
  const renderIcon = (iconName: string) => {
    const iconProps = { className: "h-5 w-5" };
    switch (iconName) {
      case "Shield":
        return <Shield {...iconProps} />;
      case "Home":
        return <Home {...iconProps} />;
      case "FileCheck":
        return <FileCheck {...iconProps} />;
      case "Building2":
        return <Building2 {...iconProps} />;
      case "UserCheck":
        return <UserCheck {...iconProps} />;
      case "Calendar":
        return <Calendar {...iconProps} />;
      case "Banknote":
        return <Banknote {...iconProps} />;
      case "Building":
        return <Building {...iconProps} />;
      case "ClipboardCheck":
        return <ClipboardCheck {...iconProps} />;
      case "CheckCircle":
        return <CheckCircle {...iconProps} />;
      default:
        return <FileText {...iconProps} />;
    }
  };

  return (
    <Accordion type="single" collapsible className="w-full">
      <AccordionItem
        value={`step-${stepIndex}`}
        className={`relative border rounded-lg shadow-sm overflow-hidden ${
          step.status === "approved"
            ? "border-l-green-500 bg-green-50"
            : step.status === "declined"
            ? "border-l-red-500 bg-red-50"
            : step.status === "awaiting"
            ? "border-l-amber-500 bg-amber-50"
            : step.status === "submitted"
            ? "border-l-blue-500 bg-blue-50"
            : step.status === "not-started"
            ? "border-l-gray-400 bg-gray-50"
            : stepState === "completed"
            ? "border-l-green-500 bg-green-50"
            : stepState === "active"
            ? "border-l-blue-500 bg-blue-50"
            : "border-l-gray-400 bg-gray-50"
        }`}
      >
        {/* Status Indicator Banner */}
        <div
          className={`absolute top-0 right-0 px-3 py-1 rounded-bl-lg text-xs font-medium text-white shadow-sm z-10 ${
            step.status === "approved"
              ? "bg-green-600 border-b border-l border-green-700"
              : step.status === "declined"
              ? "bg-red-600 border-b border-l border-red-700"
              : step.status === "awaiting"
              ? "bg-amber-600 border-b border-l border-amber-700"
              : step.status === "submitted"
              ? "bg-blue-600 border-b border-l border-blue-700"
              : step.status === "not-started"
              ? "bg-slate-600 border-b border-l border-slate-700"
              : "bg-gray-600 border-b border-l border-gray-700"
          }`}
        >
          {step.status.replace("-", " ").toUpperCase()}
        </div>

        {/* Sync Status Indicator */}
        {step.syncStatus && step.syncStatus !== "synced" && (
          <div
            className={`absolute top-0 left-0 px-2 py-1 rounded-br-lg text-xs font-medium text-white z-10 ${
              step.syncStatus === "pending"
                ? "bg-orange-500"
                : step.syncStatus === "error"
                ? "bg-red-500"
                : "bg-gray-500"
            }`}
          >
            {step.syncStatus === "pending" ? "⏳ Syncing..." : "❌ Sync Error"}
          </div>
        )}

        <AccordionTrigger className="px-6 py-4 hover:no-underline">
          <div className="flex items-center gap-4 w-full">
            <div
              className={`w-12 h-12 rounded-full flex items-center justify-center ${getStepColor()} text-white shadow-lg`}
            >
              {renderIcon(step.icon)}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h3 className="font-semibold text-lg">{step.title}</h3>
                {/* Status Icon */}
                <div
                  className={`p-1 rounded-full ${
                    step.status === "approved"
                      ? "bg-green-100 text-green-600"
                      : step.status === "declined"
                      ? "bg-red-100 text-red-600"
                      : step.status === "awaiting"
                      ? "bg-amber-100 text-amber-600"
                      : step.status === "submitted"
                      ? "bg-blue-100 text-blue-600"
                      : step.status === "not-started"
                      ? "bg-slate-100 text-slate-600"
                      : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {step.status === "approved" && (
                    <CheckCircle className="h-4 w-4" />
                  )}
                  {step.status === "declined" && (
                    <XCircle className="h-4 w-4" />
                  )}
                  {step.status === "awaiting" && <Clock className="h-4 w-4" />}
                  {step.status === "submitted" && (
                    <FileCheck className="h-4 w-4" />
                  )}
                  {step.status === "not-started" && (
                    <Shield className="h-4 w-4" />
                  )}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <Badge
                    variant={
                      step.status === "approved" ? "default" : "secondary"
                    }
                    className={`${
                      step.status === "approved"
                        ? "bg-green-600 text-white border-green-700"
                        : step.status === "declined"
                        ? "bg-red-600 text-white border-red-700"
                        : step.status === "awaiting"
                        ? "bg-amber-600 text-white border-amber-700"
                        : step.status === "submitted"
                        ? "bg-blue-600 text-white border-blue-700"
                        : step.status === "not-started"
                        ? "bg-slate-600 text-white border-slate-700"
                        : "bg-gray-600 text-white border-gray-700"
                    }`}
                  >
                    {step.status.replace("-", " ").toUpperCase()}
                  </Badge>
                  {/* Add any additional badges here if needed */}
                </div>
              </div>
            </div>
          </div>
        </AccordionTrigger>

        <AccordionContent className="px-6 pb-6">
          {/* Step Content Based on State */}
          {stepState === "upcoming" && (
            <div className="p-4 bg-gray-100 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="h-4 w-4 text-gray-500" />
                <h4 className="font-medium text-gray-700">Step Locked</h4>
              </div>
              <p className="text-sm text-gray-600">
                This step will become available once the previous step is
                approved. Required documentation and processes will be outlined
                here.
              </p>
              <div className="mt-3 p-2 bg-gray-200 rounded text-xs text-gray-600">
                <strong>Prerequisite:</strong> Previous step must be approved to
                unlock this step.
              </div>
            </div>
          )}

          {(stepState === "active" || stepState === "completed") && (
            <>
              {/* Document Upload */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Documents
                  </h4>
                  {isUploading && (
                    <Badge variant="secondary" className="text-xs">
                      Uploading...
                    </Badge>
                  )}
                </div>

                {/* Show different content based on step status */}
                {step.status === "approved" ? (
                  <div className="border-2 border-dashed border-green-300 bg-green-50 rounded-lg p-6 text-center">
                    <CheckCircle className="h-10 w-10 mx-auto mb-3 text-green-500" />
                    <p className="text-sm font-medium text-green-700 mb-1">
                      Step Approved
                    </p>
                    <p className="text-xs text-green-600">
                      This step has been approved. No further changes or uploads
                      are allowed.
                    </p>
                  </div>
                ) : (
                  <>
                    {(() => {
                      const shouldBlockUpload = (() => {
                        if (!step.documents || step.documents.length === 0) {
                          return false;
                        }

                        const blockingStatuses = [
                          "Approved",
                          "approved",
                          "Under Review",
                          "under review",
                          "UnderReview",
                          "Uploaded",
                          "uploaded",
                        ];

                        const hasBlockingDocument = step.documents.some((doc) =>
                          blockingStatuses.includes(doc.status)
                        );

                        return hasBlockingDocument;
                      })();

                      if (shouldBlockUpload) {
                        return (
                          <div className="border-2 border-dashed border-orange-300 bg-orange-50 rounded-lg p-6 text-center">
                            <Upload className="h-10 w-10 mx-auto mb-3 text-orange-500" />
                            <p className="text-sm font-medium text-orange-700 mb-1">
                              Document already uploaded
                            </p>
                            <p className="text-xs text-orange-600">
                              A document for this step already exists with an
                              active status. You can only upload a new document
                              if the existing one is rejected or requires
                              resubmission.
                            </p>
                          </div>
                        );
                      }

                      return (
                        <>
                          {/* Show status message for rejected/resubmission documents */}
                          {step.documents && step.documents.length > 0 && (
                            <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                              <div className="flex items-center gap-2 mb-2">
                                <AlertTriangle className="h-4 w-4 text-yellow-600" />
                                <span className="text-sm font-medium text-yellow-800">
                                  Document requires attention
                                </span>
                              </div>
                              <p className="text-xs text-yellow-700">
                                The uploaded document has been rejected or
                                requires resubmission. Please upload a new
                                document to proceed.
                              </p>
                            </div>
                          )}

                          {/* File Upload Input */}
                          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                            <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                            <p className="text-sm text-gray-600 mb-4">
                              Upload documents for this step
                            </p>
                            <div className="flex items-center justify-center">
                              <input
                                type="file"
                                onChange={(e) => {
                                  const backendStepName = getBackendStepName(
                                    step.title
                                  );
                                  console.log("📁 File Upload Debug:", {
                                    frontendTitle: step.title,
                                    backendStepName,
                                    stepId: step.id,
                                  });
                                  handleFileInputChange(e, backendStepName);
                                }}
                                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                                disabled={isUploading}
                              />
                            </div>
                          </div>
                        </>
                      );
                    })()}
                  </>
                )}

                {/* Documents List */}
                {step.documents && step.documents.length > 0 && (
                  <div className="space-y-4 mt-6">
                    <h5 className="font-medium text-sm text-gray-700">
                      Uploaded Documents:
                    </h5>
                    {step.documents.map((document) => (
                      <div
                        key={document._id}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <FileText className="h-4 w-4 text-blue-600" />
                          <div>
                            <span className="font-medium text-sm">
                              {document.documentName || document.name}
                            </span>
                            <Badge variant="outline" className="ml-2 text-xs">
                              {document.documentType}
                            </Badge>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => window.open(document.url, "_blank")}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Notes Section */}
              <div className="space-y-6 mt-8">
                <h4 className="font-medium flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" />
                  Notes
                </h4>

                {/* Add New Note */}
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Textarea
                      placeholder="Add a note for this step..."
                      value={newNote}
                      onChange={(e) => setNewNote(e.target.value)}
                      className="flex-1"
                      rows={2}
                    />
                    <Button
                      onClick={addNote}
                      disabled={!newNote.trim() || isAddingNote}
                      size="sm"
                      className="px-4"
                    >
                      {isAddingNote ? (
                        <RefreshCw className="h-4 w-4 animate-spin" />
                      ) : (
                        <Plus className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>

                {/* Notes List */}
                <div className="space-y-3">
                  {isLoadingNotes ? (
                    <div className="text-center py-4 text-gray-500">
                      <RefreshCw className="h-4 w-4 animate-spin mx-auto mb-2" />
                      Loading notes...
                    </div>
                  ) : notes.length > 0 ? (
                    notes.map((note) => (
                      <div
                        key={note._id}
                        className="p-3 bg-gray-50 rounded-lg border-l-4 border-l-blue-500"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p className="text-sm text-gray-800 mb-2">
                              {note.message}
                            </p>
                            <div className="flex items-center gap-2 text-xs text-gray-500">
                              <span className="font-medium">
                                {note.addedBy?.fullName || "Unknown User"}
                              </span>
                              <span>•</span>
                              <span>{formatDate(note.timestamp)}</span>
                              <span>•</span>
                              <Badge variant="outline" className="text-xs">
                                {note.addedByRole}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-4 text-gray-500">
                      <MessageSquare className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                      <p className="text-sm">No notes yet</p>
                      <p className="text-xs">
                        Add a note to track progress or provide updates
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Status Management */}
              {stepState === "active" && (
                <div className="space-y-4 mt-8">
                  <h4 className="font-medium flex items-center gap-2">
                    <ClipboardCheck className="h-4 w-4" />
                    Status Management
                  </h4>
                  <div className="flex items-center gap-3">
                    <Select
                      value={step.status}
                      onValueChange={(value) =>
                        onUpdateStepStatus(step.id, value as any)
                      }
                      disabled={isBulkUpdateInProgress}
                    >
                      <SelectTrigger className="w-48">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="not-started">Not Started</SelectItem>
                        <SelectItem value="awaiting">Awaiting</SelectItem>
                        <SelectItem value="submitted">Submitted</SelectItem>
                        <SelectItem value="approved">Approved</SelectItem>
                        <SelectItem value="declined">Declined</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}
            </>
          )}
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};

export { WorkflowStep };

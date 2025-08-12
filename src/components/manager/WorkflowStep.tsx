import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
} from "lucide-react";
import {
  WorkflowStep as WorkflowStepType,
  ApplicationDocument,
} from "@/types/application";
import { useFileUpload } from "@/hooks/useFileUpload";
import { ApiApplicationData } from "@/types/application";

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

export const WorkflowStep: React.FC<WorkflowStepProps> = ({
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
  const { isUploading, handleFileInputChange } = useFileUpload(
    applicationData,
    fetchApplicationDocuments
  );

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
    <div className={`relative ${stepIndex > 0 ? "" : ""}`}>
      {/* Timeline connector */}
      {stepIndex < workflowSteps.length - 1 && (
        <div
          className={`absolute left-6 top-16 w-0.5 h-12 ${
            step.status === "approved"
              ? "bg-green-300"
              : step.status === "declined"
              ? "bg-red-300"
              : step.status === "awaiting"
              ? "bg-amber-300"
              : step.status === "submitted"
              ? "bg-blue-300"
              : step.status === "not-started"
              ? "bg-slate-300"
              : "bg-gray-300"
          }`}
        ></div>
      )}

      <Card
        className={`border-l-4 relative ${
          step.status === "approved"
            ? "border-l-green-500 bg-green-50"
            : step.status === "declined"
            ? "border-l-red-500 bg-red-50"
            : step.status === "awaiting"
            ? "border-l-yellow-500 bg-yellow-50"
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
          className={`absolute top-0 right-0 px-3 py-1 rounded-bl-lg text-xs font-medium text-white shadow-sm ${
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
            className={`absolute top-0 left-0 px-2 py-1 rounded-br-lg text-xs font-medium text-white ${
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

        <CardHeader className="pb-3">
          <div className="flex items-center gap-4">
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
                    {step.status}
                  </Badge>

                  {/* Sync Status Indicator */}
                  {step.syncStatus && step.syncStatus !== "synced" && (
                    <div className="flex items-center gap-1">
                      <Badge
                        variant="outline"
                        className={`text-xs ${
                          step.syncStatus === "pending"
                            ? "border-orange-300 bg-orange-50 text-orange-700"
                            : "border-red-300 bg-red-50 text-red-700"
                        }`}
                      >
                        {step.syncStatus === "pending"
                          ? "⏳ Pending Sync"
                          : "❌ Sync Error"}
                      </Badge>

                      {/* Retry Sync Button */}
                      {step.syncStatus === "error" && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() =>
                            onUpdateStepStatus(step.id, step.status)
                          }
                          className="h-5 w-5 p-0 text-red-600 hover:text-red-700"
                          title="Retry sync with backend"
                        >
                          <RefreshCw className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  )}
                </div>

                {/* Status Description */}
                <span className="text-sm text-gray-600">
                  {step.status === "approved" &&
                    "✓ Step completed successfully"}
                  {step.status === "declined" && "✗ Step requires attention"}
                  {step.status === "awaiting" && "⏳ Waiting for response"}
                  {step.status === "submitted" && "📋 Under review"}
                  {step.status === "not-started" && "🔒 Step not yet initiated"}
                </span>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
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
                              <div className="flex items-center gap-2 text-yellow-800">
                                <AlertTriangle className="h-4 w-4" />
                                <span className="text-sm font-medium">
                                  Document requires attention
                                </span>
                              </div>
                              <p className="text-xs text-yellow-700 mt-1">
                                Previous document was rejected or requires
                                resubmission. Please upload a new version.
                              </p>
                            </div>
                          )}

                          <div
                            className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                              isUploading
                                ? "border-gray-300 bg-gray-50"
                                : "border-blue-300 bg-blue-50 hover:border-blue-400 hover:bg-blue-100"
                            }`}
                          >
                            <Upload
                              className={`h-10 w-10 mx-auto mb-3 ${
                                isUploading ? "text-gray-400" : "text-blue-500"
                              }`}
                            />
                            <p className="text-sm font-medium text-gray-700 mb-1">
                              {isUploading
                                ? "Uploading document..."
                                : "Upload documents for this step"}
                            </p>
                            <p className="text-xs text-gray-500 mb-4">
                              {step.documents && step.documents.length > 0
                                ? "Previous document was rejected or requires resubmission. Upload a new version."
                                : "Supported formats: PDF, DOC, DOCX, JPG, JPEG, PNG (Max 10MB)"}
                            </p>
                            <div className="flex items-center justify-center">
                              <label
                                htmlFor={`file-input-${step.id}`}
                                className={`cursor-pointer inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white transition-colors ${
                                  isUploading
                                    ? "bg-gray-400 cursor-not-allowed"
                                    : "bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                }`}
                              >
                                <Upload className="h-4 w-4 mr-2" />
                                {isUploading ? "Uploading..." : "Choose File"}
                              </label>
                              <input
                                type="file"
                                onChange={(e) =>
                                  handleFileInputChange(e, step.title)
                                }
                                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                                className="hidden"
                                disabled={isUploading}
                                id={`file-input-${step.id}`}
                              />
                            </div>
                          </div>
                        </>
                      );
                    })()}
                  </>
                )}

                {/* Uploaded documents */}
                {step.documents && step.documents.length > 0 ? (
                  <div className="space-y-2">
                    <h5 className="text-sm font-medium text-gray-700">
                      Uploaded Documents:
                    </h5>
                    {step.documents.map((document, docIndex) => (
                      <div
                        key={docIndex}
                        className="flex items-center justify-between p-3 border rounded-lg bg-white"
                      >
                        <div className="flex items-center gap-3">
                          <FileText className="h-4 w-4 text-blue-600" />
                          <div className="flex flex-col">
                            <span className="text-sm font-medium">
                              {document.name ||
                                document.documentName ||
                                "Document"}
                            </span>
                            {document.documentType && (
                              <span className="text-xs text-gray-500">
                                {document.documentType}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {/* View Document Button */}
                          {document.url ||
                          document.documentUrl ||
                          document.fileUrl ? (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                const documentUrl =
                                  document.url ||
                                  document.documentUrl ||
                                  document.fileUrl;
                                if (documentUrl) {
                                  window.open(documentUrl, "_blank");
                                }
                              }}
                              className="h-7 px-2"
                            >
                              <Eye className="h-3 w-3 mr-1" />
                              View
                            </Button>
                          ) : (
                            <span className="text-xs text-gray-500 px-2 py-1">
                              No URL available
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4 text-gray-500">
                    <div className="text-sm font-medium mb-1">No Documents</div>
                    <div className="text-xs">
                      No documents uploaded for this step yet
                    </div>
                  </div>
                )}
              </div>

              {/* Notes */}
              {(step.internalNotes ||
                step.customerNotes ||
                stepState === "active") && (
                <div className="space-y-3">
                  <h4 className="font-medium">Notes</h4>
                  {step.status === "approved" ? (
                    <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                      <p className="text-sm text-green-800">
                        {step.internalNotes ||
                          "No internal notes for this approved step."}
                      </p>
                      <p className="text-xs text-green-600 mt-2">
                        ✓ Step approved - notes are read-only
                      </p>
                    </div>
                  ) : stepState === "active" &&
                    (userRole === "manager" || userRole === "agent") ? (
                    <Textarea
                      value={step.internalNotes}
                      onChange={(e) =>
                        onUpdateStepNotes(
                          step.id,
                          "internalNotes",
                          e.target.value
                        )
                      }
                      placeholder="Add notes for this step..."
                      className="min-h-[60px]"
                    />
                  ) : step.internalNotes ? (
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm">{step.internalNotes}</p>
                    </div>
                  ) : null}
                </div>
              )}

              {/* Step Status Management - Moved to Bottom */}
              {isEditable ? (
                <div className="space-y-4 pt-6 border-t border-gray-200">
                  <div className="flex items-center justify-between">
                    <Label
                      htmlFor={`step-status-${step.id}`}
                      className="text-base font-semibold text-gray-800"
                    >
                      Step Status:
                    </Label>

                    {/* Warning message when application data is not available */}
                    {(!applicationData || !applicationData.applicationId) && (
                      <div className="flex items-center gap-1 text-xs text-orange-600">
                        <svg
                          className="w-3 h-3"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z"
                          />
                        </svg>
                        <span>Data not loaded</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-4">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Select
                            value={step.status}
                            onValueChange={(value) =>
                              onUpdateStepStatus(
                                step.id,
                                value as WorkflowStepType["status"]
                              )
                            }
                            disabled={
                              !applicationData || !applicationData.applicationId
                            }
                          >
                            <SelectTrigger className="h-12 w-[200px] text-base font-medium">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="not-started">
                                Not Started
                              </SelectItem>
                              <SelectItem value="submitted">
                                Submitted for Review
                              </SelectItem>
                              <SelectItem value="awaiting">
                                Awaiting Response
                              </SelectItem>
                              <SelectItem value="approved">Approved</SelectItem>
                              <SelectItem value="declined">Declined</SelectItem>
                            </SelectContent>
                          </Select>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>
                            {!applicationData || !applicationData.applicationId
                              ? "Application data not loaded. Please wait or refresh the page."
                              : "Update the current step status"}
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>

                    <span className="text-sm text-gray-600 font-medium">
                      Update the current step status
                    </span>
                  </div>
                </div>
              ) : (
                // Show approved status message when step is approved
                <div className="space-y-4 pt-6 border-t border-gray-200">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 text-green-600">
                      <CheckCircle className="h-5 w-5" />
                      <span className="font-semibold">Step Approved</span>
                    </div>
                    <Badge
                      variant="secondary"
                      className="bg-green-100 text-green-800"
                    >
                      {step.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600">
                    This step has been completed and approved. No further
                    changes are needed.
                  </p>
                </div>
              )}

              {/* Change History */}
              <div className="space-y-2">
                <h4 className="font-medium text-sm">Change History</h4>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  <div className="p-2 bg-gray-50 rounded text-xs text-gray-500">
                    No change history available
                  </div>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

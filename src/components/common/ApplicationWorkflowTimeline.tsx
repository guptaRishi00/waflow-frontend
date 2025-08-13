import React, { useState, useEffect, useRef } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  CheckCircle,
  Clock,
  XCircle,
  Circle,
  Upload,
  Download,
  Eye,
  FileText,
  Shield,
  MessageSquare,
  History,
  User,
  ChevronDown,
} from "lucide-react";
import { useSelector } from "react-redux";
import { RootState } from "@/app/store";
import axios from "axios";
import { useToast } from "@/hooks/use-toast";
import { uploadToCloudinary } from "@/lib/cloudinary";

interface WorkflowStep {
  stepName: string;
  status: string;
  updatedAt: string;
  _id?: string;
}

interface Document {
  _id: string;
  documentName: string;
  documentType: string;
  relatedStepName: string;
  fileUrl: string;
  status: string;
  uploadedBy: string;
  uploadedDate: string;
  fileSize?: number;
  fileType?: string;
}

interface ApplicationWorkflowTimelineProps {
  applicationId: string;
  steps: WorkflowStep[];
  applicationType: string;
}

const workflowSteps = {
  mainland: [
    "KYC & Background Check",
    "Business Activity Selection",
    "Trade Name Reservation",
    "Legal Structure Confirmation",
    "Initial Approval / Pre-Approval",
    "MoA Drafting & Signature",
    "Office Lease / Flexi Desk",
    "Payment & License Issuance",
    "Establishment Card",
    "Visa Allocation Request",
    "Visa Application",
    "Medical & Emirates ID",
    "Corporate Tax Registration",
    "VAT Registration",
    "Bank Account Setup",
    "Chamber of Commerce Registration",
  ],
  freezone: [
    "KYC & Background Check",
    "Business Activity Selection",
    "Trade Name Reservation",
    "Legal Structure Confirmation",
    "Initial Approval / Pre-Approval",
    "MoA Drafting & Signature",
    "Office Lease / Flexi Desk",
    "Payment & License Issuance",
    "Establishment Card",
    "Visa Allocation Request",
    "Visa Application",
    "Medical & Emirates ID",
    "Corporate Tax Registration",
    "VAT Registration",
    "Bank Account Setup",
    "Chamber of Commerce Registration",
  ],
  offshore: [
    "KYC & Background Check",
    "Business Activity Selection",
    "Trade Name Reservation",
    "Legal Structure Confirmation",
    "Initial Approval / Pre-Approval",
    "MoA Drafting & Signature",
    "Payment & License Issuance",
    "Corporate Tax Registration",
    "VAT Registration",
    "Bank Account Setup",
    "Registered Agent Appointment",
  ],
};

export const ApplicationWorkflowTimeline: React.FC<
  ApplicationWorkflowTimelineProps
> = ({ applicationId, steps, applicationType }) => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isLoadingDocuments, setIsLoadingDocuments] = useState(false);
  const fileInputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});
  const { token } = useSelector((state: RootState) => state.customerAuth);
  const { toast } = useToast();

  // Get the correct workflow steps based on application type
  const getWorkflowSteps = () => {
    const type = applicationType?.toLowerCase();
    return (
      workflowSteps[type as keyof typeof workflowSteps] ||
      workflowSteps.mainland
    );
  };

  const workflowStepNames = getWorkflowSteps();

  // Debug: Log when component mounts and refs are set
  useEffect(() => {
    console.log("ApplicationWorkflowTimeline mounted");
    console.log("Workflow steps:", workflowStepNames);
  }, [workflowStepNames]);

  // Fetch documents for this application
  useEffect(() => {
    const fetchDocuments = async () => {
      if (!token || !applicationId) return;

      setIsLoadingDocuments(true);
      try {
        const response = await axios.get(
          `${
            import.meta.env.VITE_BASE_URL
          }/api/document/application/${applicationId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setDocuments(response.data.data || []);
      } catch (error) {
        console.error("Error fetching documents:", error);
        toast({
          title: "Error",
          description: "Failed to load documents",
          variant: "destructive",
        });
      } finally {
        setIsLoadingDocuments(false);
      }
    };

    fetchDocuments();
  }, [applicationId, token, toast]);

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case "approved":
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case "rejected":
        return <XCircle className="h-5 w-5 text-red-600" />;
      case "submitted for review":
        return <Clock className="h-5 w-5 text-purple-600" />;
      case "in progress":
      case "started":
        return <Clock className="h-5 w-5 text-blue-600" />;
      case "not started":
        return <Circle className="h-5 w-5 text-gray-400" />;
      default:
        return <Clock className="h-5 w-5 text-yellow-600" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const statusColors = {
      "not started": "bg-yellow-100 text-yellow-800 border-yellow-300",
      started: "bg-blue-100 text-blue-800 border-blue-200",
      "submitted for review": "bg-purple-100 text-purple-800 border-purple-200",
      "in progress": "bg-blue-100 text-blue-800 border-blue-200",
      approved: "bg-green-100 text-green-800 border-green-200",
      rejected: "bg-red-100 text-red-800 border-red-200",
    };

    return (
      <Badge
        variant="outline"
        className={
          statusColors[status.toLowerCase() as keyof typeof statusColors] ||
          "bg-gray-100 text-gray-800"
        }
      >
        {status.toUpperCase()}
      </Badge>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const handleFileUpload = async (file: File, stepName: string) => {
    console.log("Uploading file:", file.name, "for step:", stepName);

    // Check file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please select a file smaller than 10MB",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    try {
      // Upload to Cloudinary
      const uploadResult = await uploadToCloudinary(file);
      const uploadedUrl = uploadResult.secure_url;

      // Create document via backend API
      const formData = new FormData();
      formData.append("file", file);
      formData.append("documentName", file.name);
      formData.append("documentType", "General");
      formData.append("relatedStepName", stepName);
      formData.append("linkedModel", "Application");
      formData.append("applicationId", applicationId);

      const response = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/api/document/create-document`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      // Add new document to local state
      const newDocument = response.data.data;
      setDocuments((prev) => [...prev, newDocument]);

      toast({
        title: "Document uploaded",
        description: "Document has been uploaded successfully",
      });
    } catch (error) {
      console.error("Error uploading document:", error);
      toast({
        title: "Upload failed",
        description: "Failed to upload document. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileInputChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    stepName: string
  ) => {
    console.log("File input changed for step:", stepName);
    console.log("Event target files:", e.target.files);
    const file = e.target.files?.[0];
    if (file) {
      console.log(
        "File selected:",
        file.name,
        "Size:",
        file.size,
        "Type:",
        file.type
      );
      handleFileUpload(file, stepName);
    } else {
      console.log("No file selected");
    }
    // Reset the input value so the same file can be selected again
    e.target.value = "";
  };

  const handleDownload = async (documentId: string, fileName: string) => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/api/document/file/${documentId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
          responseType: "blob",
        }
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error downloading document:", error);
      toast({
        title: "Download failed",
        description: "Failed to download document. Please try again.",
        variant: "destructive",
      });
    }
  };

  const getDocumentsForStep = (stepName: string) => {
    return documents.filter((doc) => doc.relatedStepName === stepName);
  };

  const getStepStatus = (stepName: string) => {
    const step = steps.find((s) => s.stepName === stepName);
    return step?.status || "Not Started";
  };

  const getStepUpdateDate = (stepName: string) => {
    const step = steps.find((s) => s.stepName === stepName);
    return step?.updatedAt;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-primary flex items-center gap-2">
            <Shield className="h-6 w-6" />
            Application Workflow Timeline
          </h2>
          <p className="text-muted-foreground">
            Follow the progress through each step of the application process
          </p>
        </div>
        <Badge variant="outline" className="text-primary">
          {steps.filter((s) => s.status === "Approved").length}/
          {workflowStepNames.length} Completed
        </Badge>
      </div>

      <div className="space-y-4">
        {workflowStepNames.map((stepName, index) => {
          const stepStatus = getStepStatus(stepName);
          const stepUpdateDate = getStepUpdateDate(stepName);
          const stepDocuments = getDocumentsForStep(stepName);

          return (
            <Accordion key={index} type="single" collapsible className="w-full">
              <AccordionItem
                value={`step-${index}`}
                className="border rounded-lg"
              >
                <AccordionTrigger className="px-6 py-4 hover:no-underline bg-gray-50 hover:bg-gray-100 transition-colors">
                  <div className="flex items-center justify-between w-full pr-4">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(stepStatus)}
                      <div className="text-left">
                        <div className="text-lg font-semibold">
                          Step {index + 1}: {stepName}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {stepUpdateDate &&
                            `Last updated: ${formatDate(stepUpdateDate)}`}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {getStatusBadge(stepStatus)}
                    </div>
                  </div>
                </AccordionTrigger>

                <AccordionContent className="px-6 pb-6">
                  <div className="space-y-6">
                    {/* Documents Section */}
                    <div>
                      <h4 className="font-medium text-sm text-muted-foreground mb-3">
                        Documents 1111
                      </h4>

                      {/* Drop Zone */}
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors">
                        <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-sm text-gray-600 mb-4">
                          Upload documents for this step
                        </p>

                        {/* Simple file input */}
                        <div className="flex items-center justify-center">
                          <input
                            type="file"
                            onChange={(e) => handleFileInputChange(e, stepName)}
                            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                            disabled={isUploading}
                          />
                        </div>
                      </div>

                      {/* Documents List */}
                      {stepDocuments.length > 0 && (
                        <div className="mt-4 space-y-2">
                          {stepDocuments.map((document) => (
                            <div
                              key={document._id}
                              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                            >
                              <div className="flex items-center gap-3">
                                <FileText className="h-4 w-4 text-blue-600" />
                                <span className="font-medium text-sm">
                                  {document.documentName}
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Badge
                                  variant="outline"
                                  className={
                                    document.status === "Approved"
                                      ? "bg-blue-100 text-blue-800"
                                      : document.status === "Rejected"
                                      ? "bg-red-100 text-red-800"
                                      : "bg-yellow-100 text-yellow-800"
                                  }
                                >
                                  {document.status === "Approved"
                                    ? "Verified"
                                    : document.status}
                                </Badge>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() =>
                                    window.open(document.fileUrl, "_blank")
                                  }
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() =>
                                    handleDownload(
                                      document._id,
                                      document.documentName
                                    )
                                  }
                                >
                                  <Download className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Notes Section */}
                    <div>
                      <h4 className="font-medium text-sm text-muted-foreground mb-3 flex items-center gap-2">
                        <MessageSquare className="h-4 w-4" />
                        Notes
                      </h4>
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-500">
                          No notes added yet
                        </p>
                      </div>
                    </div>

                    {/* Change History Section */}
                    <div>
                      <h4 className="font-medium text-sm text-muted-foreground mb-3 flex items-center gap-2">
                        <History className="h-4 w-4" />
                        Change History
                      </h4>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-gray-500" />
                            <span className="text-sm font-medium">
                              Agent Smith
                            </span>
                            <span className="text-sm text-gray-600">
                              Status updated to not-started
                            </span>
                          </div>
                          <span className="text-xs text-gray-500">
                            2 hours ago
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          );
        })}
      </div>
    </div>
  );
};

export default ApplicationWorkflowTimeline;

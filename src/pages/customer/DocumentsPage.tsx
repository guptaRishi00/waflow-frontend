import * as React from "react";
import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Upload,
  FileText,
  CheckCircle,
  XCircle,
  Eye,
  Download,
  Clock,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { DocumentType } from "@/types";
import axios from "axios";
import { useSelector } from "react-redux";
import { RootState } from "@/app/store";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Document as PDFDocument, Page as PDFPage } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";
import StepsCarousel from "./components/StepsCarousel";
import DocumentUploadSection from "./components/DocumentUploadSection";
import AddNote from "./components/AddNote";
// import StepsCarousel from "./components/StepsCarousel";
// import StepsCarousel from "./components/StepsCarousel";

interface DocumentItem {
  type: DocumentType;
  title: string;
  description: string;
  required: boolean;
  status: "not-uploaded" | "uploaded" | "verified" | "rejected";
  fileName?: string;
  uploadedAt?: string;
  rejectionReason?: string;
  fileUrl?: string; // Added fileUrl to the interface
  _id?: string; // MongoDB document ID for PDF preview
  notes?: { message: string; addedByRole?: string; timestamp: string }[]; // Added notes to the interface
}

const getStatusIcon = (status: DocumentItem["status"]) => {
  switch (status) {
    case "verified":
      return <CheckCircle className="h-5 w-5 text-green-600" />;
    case "rejected":
      return <XCircle className="h-5 w-5 text-red-600" />;
    case "uploaded":
      return <FileText className="h-5 w-5 text-yellow-600" />;
    default:
      return <Upload className="h-5 w-5 text-gray-400" />;
  }
};

const getStatusBadge = (status: DocumentItem["status"]) => {
  const variants = {
    "not-uploaded": "bg-gray-100 text-gray-800",
    uploaded: "bg-yellow-100 text-yellow-800",
    verified: "bg-green-100 text-green-800",
    rejected: "bg-red-100 text-red-800",
  };

  return <Badge className={variants[status]}>{status.replace("-", " ")}</Badge>;
};

export const DocumentsPage: React.FC = () => {
  const [documents, setDocuments] = useState<DocumentItem[]>([]);

  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { user, token } = useSelector((state: RootState) => state.customerAuth);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [applicationId, setApplicationId] = useState<string | null>(null);
  const [steps, setSteps] = useState<{ stepName: string; status: string }[]>(
    []
  );

  const [selectedStep, setSelectedStep] = useState("KYC & Background Check");
  const stepsWithDocuments = {
    "KYC & Background Check": [
      {
        id: "passport",
        label: "KYC & Background Check - Document",
        description: "Valid passport with at least 6 months validity",
      },
    ],
    "Business Activity Selection": [
      {
        id: "document",
        label: "Business Activity Selection - Document",
        description: "Recent trade license copy",
      },
    ],
    "Trade Name Reservation": [
      {
        id: "document",
        label: "Trade Name Reservation - Document",
        description: "Initial approval receipt",
      },
    ],
    "Legal Structure Confirmation": [
      {
        id: "document",
        label: "Legal Structure Confirmation - Document",
        description: "Legal Structure Confirmation",
      },
    ],
    "Initial Approval / Pre-Approval": [
      {
        id: "document",
        label: "Initial Approval / Pre-Approval - Document",
        description: "Legal Structure Confirmation",
      },
    ],
    "MoA Drafting & Signature": [
      {
        id: "document",
        label: "MoA Drafting & Signature - Document",
        description: "Legal Structure Confirmation",
      },
    ],
    "Office Lease / Flexi Desk": [
      {
        id: "document",
        label: "Office Lease / Flexi Desk - Document",
        description: "Legal Structure Confirmation",
      },
    ],
    "Payment & License Issuance": [
      {
        id: "document",
        label: "Payment & License Issuance - Document",
        description: "Legal Structure Confirmation",
      },
    ],
    "Establishment Card": [
      {
        id: "document",
        label: "Establishment Card - Document",
        description: "Legal Structure Confirmation",
      },
    ],
    "Visa Allocation Request": [
      {
        id: "document",
        label: "Visa Allocation Request - Document",
        description: "Legal Structure Confirmation",
      },
    ],
    "Visa Application": [
      {
        id: "document",
        label: "Visa Application - Document",
        description: "Legal Structure Confirmation",
      },
    ],
    "Medical & Emirates ID": [
      {
        id: "document",
        label: "Medical & Emirates ID - Document",
        description: "Legal Structure Confirmation",
      },
    ],
    "Corporate Tax Registration": [
      {
        id: "document",
        label: "Corporate Tax Registration - Document",
        description: "Legal Structure Confirmation",
      },
    ],
    "VAT Registration": [
      {
        id: "document",
        label: "VAT Registration - Document",
        description: "Legal Structure Confirmation",
      },
    ],
    "Bank Account Setup": [
      {
        id: "document",
        label: "Bank Account Setup - Document",
        description: "Legal Structure Confirmation",
      },
    ],
    "Chamber of Commerce Registration": [
      {
        id: "document",
        label: "Chamber of Commerce Registration - Document",
        description: "Legal Structure Confirmation",
      },
    ],
  };

  const [uploadedFiles, setUploadedFiles] = useState<{
    [key: string]: File | null;
  }>({});

  const [stepDocuments, setStepDocuments] = useState<any[]>([]); // Holds uploaded docs for the current step

  const handleFileChange = (stepName: string, file: File | null) => {
    setUploadedFiles((prev) => ({
      ...prev,
      [stepName]: file,
    }));
  };

  // Helper to fetch and merge required/uploaded documents
  const fetchAndMergeDocuments = async () => {
    setLoading(true);
    try {
      // 1. Fetch required document types
      const requiredRes = await axios.get(
        import.meta.env.VITE_BASE_URL + "/api/document/required",
        { headers: { Authorization: `Bearer ${token}` } }
      );
      // 2. Fetch user's uploaded documents
      const uploadedRes = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/api/document/customer/${
          user?.userId
        }`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      // 3. Merge the two lists
      const requiredDocs = requiredRes.data.requiredDocuments;
      const uploadedDocs = uploadedRes.data.data;
      // Map required docs, attach upload info if present
      const merged = requiredDocs.map((reqDoc: any) => {
        const uploaded = uploadedDocs.find(
          (u: any) => u.documentType === reqDoc.type
        );
        // Only set status if document exists, otherwise always 'not-started'
        return {
          ...reqDoc,
          status: uploaded && uploaded._id ? uploaded.status : "not-started",
          fileName: uploaded?.fileName,
          uploadedAt: uploaded?.uploadedAt,
          rejectionReason: uploaded?.rejectionReason,
          fileUrl: uploaded?.fileUrl,
          _id: uploaded?._id,
          notes: uploaded?.notes || [], // Merge notes
        };
      });
      setDocuments(merged);
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to load documents.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Ensure status is 'not-started' if document does not exist on every reload or change
  useEffect(() => {
    fetchAndMergeDocuments();
  }, [user, token, toast]);

  // Fetch uploaded document for the current step
  const fetchStepDocuments = async (stepName: string) => {
    setLoading(true);
    try {
      if (!user?.userId || !token) return;
      // Fetch uploaded documents for this user
      const uploadedRes = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/api/document/customer/${user.userId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      // Find document(s) for this step
      const docsForStep = uploadedRes.data.data.filter(
        (doc: any) => doc.relatedStepName === stepName
      );
      setStepDocuments(docsForStep);
    } catch (err) {
      setStepDocuments([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch required documents and user's uploaded documents
  useEffect(() => {
    if (user && token) fetchAndMergeDocuments();
    // Fetch application steps for step uploads
    const fetchApplicationSteps = async () => {
      if (!user?.userId) return;
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_BASE_URL}/api/dashboard/customer/${
            user.userId
          }`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        let stepsArr = [];
        let appId = null;
        if (res.data.application && Array.isArray(res.data.application.steps)) {
          stepsArr = res.data.application.steps;
          appId = res.data.application._id;
        } else if (Array.isArray(res.data.steps)) {
          stepsArr = res.data.steps;
          appId = res.data.application?._id || null;
        }
        setSteps(stepsArr);
        setApplicationId(appId);
      } catch (err) {
        setSteps([]);
        setApplicationId(null);
      }
    };
    if (user && token) fetchApplicationSteps();
  }, [user, token, toast]);

  console.log("Application Id:", applicationId);

  // Fetch on mount and when selectedStep changes
  useEffect(() => {
    if (user && token && selectedStep) {
      fetchStepDocuments(selectedStep);
    }
  }, [user, token, selectedStep]);

  const completedCount = documents.filter(
    (doc) => doc.status === "verified"
  ).length;
  const uploadedCount = documents.filter(
    (doc) => doc.status !== "not-uploaded"
  ).length;

  if (loading) {
    return (
      <div className="p-8 text-center text-lg text-muted-foreground">
        Loading documents...
      </div>
    );
  }

  if (documents.length === 0) {
    return (
      <div className="p-8 text-center text-lg text-muted-foreground">
        No required documents found.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-primary">Document Upload</h1>
        <p className="text-muted-foreground">
          Upload your required documents for KYC verification
        </p>
      </div>

      {/* Carousel Section */}
      <div className="w-full mx-auto p-2 space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Application Steps
            </CardTitle>
            <CardDescription>
              {completedCount} of {documents.length} documents verified
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Progress bar */}
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-green-600 h-2 rounded-full transition-all duration-300"></div>
            </div>

            {/* Steps carousel */}
            <StepsCarousel
              onStepSelect={setSelectedStep}
              selectedStepName={selectedStep}
            />

            {/* Status summary */}
            <div className="flex justify-between items-center text-sm text-muted-foreground bg-gray-50 p-3 rounded-lg">
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span>{completedCount} verified</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  <Upload className="w-4 h-4 text-blue-600" />
                  <span>{uploadedCount} uploaded</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4 text-gray-400" />
                  <span>10 remaining</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <DocumentUploadSection
        documents={stepsWithDocuments[selectedStep] || []}
        uploadedFiles={uploadedFiles}
        onFileChange={handleFileChange}
        onUploadSuccess={() => fetchStepDocuments(selectedStep)}
        uploadedDocs={stepDocuments}
        stepName={selectedStep}
      />

      {/* Help Text */}
      <Card>
        <CardContent className="p-4">
          <h4 className="font-medium mb-2">Upload Guidelines</h4>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• Accepted formats: PDF, JPEG, PNG</li>
            <li>• Maximum file size: 10MB per document</li>
            <li>• Ensure documents are clear and readable</li>
            <li>• All documents must be valid and not expired</li>
            <li>• Processing time: 1-2 business days after upload</li>
          </ul>
        </CardContent>
      </Card>

      <Dialog open={!!previewUrl} onOpenChange={() => setPreviewUrl(null)}>
        <DialogContent className="max-w-3xl w-full">
          <DialogTitle>Document Preview</DialogTitle>
          {(() => {
            // Find the document being previewed
            const doc = documents.find((d) => d.fileUrl === previewUrl);
            const documentId = doc && doc._id;
            const pdfUrl =
              previewUrl && previewUrl.match(/\.pdf$/i) && documentId
                ? `${
                    import.meta.env.VITE_BASE_URL
                  }/api/document/file/${documentId}`
                : null;
            if (previewUrl && previewUrl.match(/\.(jpg|jpeg|png)$/i)) {
              return (
                <img
                  src={previewUrl}
                  alt="Document Preview"
                  className="max-w-full max-h-[80vh] mx-auto"
                />
              );
            } else if (pdfUrl) {
              return (
                <div
                  style={{ width: "100%", height: "80vh", overflow: "auto" }}
                >
                  <PDFDocument
                    file={pdfUrl}
                    loading={<div>Loading PDF...</div>}
                    error={<div>Failed to load PDF.</div>}
                  >
                    <PDFPage pageNumber={1} width={800} />
                  </PDFDocument>
                </div>
              );
            } else if (previewUrl) {
              return <div className="text-center">Preview not available</div>;
            } else {
              return null;
            }
          })()}
        </DialogContent>
      </Dialog>
    </div>
  );
};

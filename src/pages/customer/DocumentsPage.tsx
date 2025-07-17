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
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { DocumentType } from "@/types";
import axios from "axios";
import { useSelector } from "react-redux";
import { RootState } from "@/app/store";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Document as PDFDocument, Page as PDFPage } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

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
  const [uploading, setUploading] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useSelector((state: RootState) => state.customerAuth);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // Fetch required documents and user's uploaded documents
  useEffect(() => {
    const fetchDocuments = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("token");
        // 1. Fetch required document types
        const requiredRes = await axios.get(
          import.meta.env.VITE_BASE_URL + "/api/document/required",
          { headers: { Authorization: `Bearer ${token}` } }
        );
        // 2. Fetch user's uploaded documents
        const uploadedRes = await axios.get(
          `${import.meta.env.VITE_BASE_URL}/api/document/customer/${
            user?._id || user?.userId
          }`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        // 3. Merge the two lists
        const requiredDocs = requiredRes.data.requiredDocuments; // [{type, title, description, required}]
        const uploadedDocs = uploadedRes.data.data; // [{documentType, fileName, status, uploadedAt, ...}]
        // Map required docs, attach upload info if present
        const merged = requiredDocs.map((reqDoc: any) => {
          const uploaded = uploadedDocs.find(
            (u: any) => u.documentType === reqDoc.type
          );
          return {
            ...reqDoc,
            status: uploaded ? uploaded.status : "not-uploaded",
            fileName: uploaded?.fileName,
            uploadedAt: uploaded?.uploadedAt,
            rejectionReason: uploaded?.rejectionReason,
            fileUrl: uploaded?.fileUrl, // <-- add this line
            _id: uploaded?._id, // <-- add this line
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
    if (user) fetchDocuments();
  }, [user, toast]);

  const handleFileUpload = async (documentType: DocumentType, file: File) => {
    setUploading(documentType);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("documentType", documentType); // required
    formData.append("documentName", file.name); // required
    formData.append("linkedTo", user?._id || user?.userId || ""); // required
    formData.append("linkedModel", "Customer"); // required

    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        import.meta.env.VITE_BASE_URL + "/api/document/create-document",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // After upload, refresh the document list
      toast({
        title: "Document Uploaded",
        description: `${file.name} has been uploaded successfully.`,
      });
      // Refresh documents
      setUploading(null);
      setLoading(true);
      // Re-fetch documents
      const requiredRes = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/api/document/required`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const uploadedRes = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/api/document/customer/${
          user?._id || user?.userId
        }`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const requiredDocs = requiredRes.data.requiredDocuments;
      const uploadedDocs = uploadedRes.data.data;
      const merged = requiredDocs.map((reqDoc: any) => {
        const uploaded = uploadedDocs.find(
          (u: any) => u.documentType === reqDoc.type
        );
        return {
          ...reqDoc,
          status: uploaded ? uploaded.status : "not-uploaded",
          fileName: uploaded?.fileName,
          uploadedAt: uploaded?.uploadedAt,
          rejectionReason: uploaded?.rejectionReason,
          fileUrl: uploaded?.fileUrl, // <-- add this line
          _id: uploaded?._id, // <-- add this line
        };
      });
      setDocuments(merged);
      setLoading(false);
    } catch (error: any) {
      toast({
        title: "Upload Failed",
        description: error?.response?.data?.message || "An error occurred.",
        variant: "destructive",
      });
      setUploading(null);
    }
  };

  const handleFileSelect = (
    documentType: DocumentType,
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type and size
      const maxSize = 10 * 1024 * 1024; // 10MB
      const allowedTypes = ["application/pdf", "image/jpeg", "image/png"];
      if (!allowedTypes.includes(file.type)) {
        toast({
          title: "Invalid File Type",
          description: "Please upload PDF, JPEG, or PNG files only.",
          variant: "destructive",
        });
        return;
      }
      if (file.size > maxSize) {
        toast({
          title: "File Too Large",
          description: "Please upload files smaller than 10MB.",
          variant: "destructive",
        });
        return;
      }
      handleFileUpload(documentType, file);
    }
  };

  const mockDownloadDocument = (fileName: string) => {
    toast({
      title: "Download",
      description: `Downloading ${fileName}...`,
    });
  };

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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-primary">Document Upload</h1>
        <p className="text-muted-foreground">
          Upload your required documents for KYC verification
        </p>
      </div>

      {/* Progress Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Upload Progress</CardTitle>
          <CardDescription>
            {completedCount} of {documents.length} documents verified
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
            <div
              className="bg-gradient-to-r from-primary to-secondary h-3 rounded-full transition-all duration-500"
              style={{ width: `${(completedCount / documents.length) * 100}%` }}
            />
          </div>
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>{uploadedCount} uploaded</span>
            <span>{completedCount} verified</span>
            <span>{documents.length - uploadedCount} remaining</span>
          </div>
        </CardContent>
      </Card>

      {/* Documents List */}
      <div className="grid gap-4">
        {documents.map((document) => (
          <Card key={document.type}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4">
                  <div className="mt-1">{getStatusIcon(document.status)}</div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <h3 className="font-semibold">{document.title}</h3>
                      {document.required && (
                        <span className="text-red-500 text-sm">*</span>
                      )}
                      {getStatusBadge(document.status)}
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">
                      {document.description}
                    </p>
                    {document.fileName && (
                      <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                        <FileText className="h-4 w-4" />
                        <span>{document.fileName}</span>
                        <span>•</span>
                        <span>
                          Uploaded{" "}
                          {new Date(document.uploadedAt!).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                    {document.rejectionReason && (
                      <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-800">
                        <strong>Rejection Reason:</strong>{" "}
                        {document.rejectionReason}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {document.fileUrl && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPreviewUrl(document.fileUrl!)}
                    >
                      <Eye className="h-4 w-4" />
                      View
                    </Button>
                  )}
                  {document.fileName && (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => mockDownloadDocument(document.fileName!)}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    </>
                  )}
                  <div>
                    <Label
                      htmlFor={`file-${document.type}`}
                      className={`cursor-pointer inline-flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                        uploading === document.type
                          ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                          : "bg-primary text-primary-foreground hover:bg-primary/90"
                      }`}
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      {uploading === document.type
                        ? "Uploading..."
                        : document.fileName
                        ? "Replace"
                        : "Upload"}
                    </Label>
                    <Input
                      id={`file-${document.type}`}
                      type="file"
                      className="hidden"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={(e) => handleFileSelect(document.type, e)}
                      disabled={uploading === document.type}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

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
            const doc = documents.find(
              d => d.fileUrl === previewUrl
            );
            const documentId = doc && doc._id;
            const pdfUrl = previewUrl && previewUrl.match(/\.pdf$/i) && documentId
              ? `${import.meta.env.VITE_BASE_URL}/api/document/file/${documentId}`
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
                <div style={{ width: '100%', height: '80vh', overflow: 'auto' }}>
                  <PDFDocument file={pdfUrl} loading={<div>Loading PDF...</div>} error={<div>Failed to load PDF.</div>}>
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

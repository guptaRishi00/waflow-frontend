import React, { useState } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Document as PDFDocument, Page as PDFPage } from "react-pdf";
import {
  Upload,
  FileText,
  Image,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
} from "lucide-react";
import axios from "axios";
import { useSelector } from "react-redux";
import { RootState } from "@/app/store";

type Document = {
  id: string;
  label: string;
  description?: string;
  required?: boolean;
  status?: "pending" | "verified" | "rejected";
  fileUrl?: string;
};

type Props = {
  documents: Document[];
  uploadedFiles: { [key: string]: File | null };
  onFileChange: (id: string, file: File | null, stepName?: string) => void;
  onUploadSuccess?: () => void;
  uploadedDocs?: any[];
  stepName: string; // <-- add this
};

const DocumentUploadSection: React.FC<Props> = ({
  documents,
  uploadedFiles,
  onFileChange,
  onUploadSuccess,
  uploadedDocs = [],
  stepName,
}) => {
  const { toast } = useToast();

  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploadingId, setUploadingId] = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);

  const { user } = useSelector((state: RootState) => state.customerAuth);

  const handleFileSelect = async (doc: Document, file: File) => {
    const maxSize = 10 * 1024 * 1024; // 10MB
    const allowedTypes = ["application/pdf", "image/jpeg", "image/png"];

    if (!allowedTypes.includes(file.type)) {
      toast({
        title: "Invalid File Type",
        description: "Only PDF, JPG, or PNG files are allowed.",
        variant: "destructive",
      });
      return;
    }

    if (file.size > maxSize) {
      toast({
        title: "File Too Large",
        description: "File must be less than 10MB.",
        variant: "destructive",
      });
      return;
    }

    onFileChange(stepName, file, stepName); // Use stepName as id/documentType

    const token = localStorage.getItem("token");
    const formData = new FormData();
    formData.append("file", file);
    formData.append("documentType", stepName); // Use stepName
    formData.append("documentName", file.name);
    formData.append("linkedTo", "customer-id-here");
    formData.append("linkedModel", "Customer");
    formData.append("relatedStepName", stepName); // Use stepName

    setUploadingId(stepName);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_BASE_URL}/api/document/create-document`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      const customerId = user?.userId;
      if (!customerId || !token) return;

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const stepStatusResponse = await axios.patch(
        `${
          import.meta.env.VITE_BASE_URL
        }/api/application/stepStatus/${customerId}`,
        {
          status: "Submitted for Review",
          stepName: stepName,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("Step status updated:", stepStatusResponse.data);

      toast({
        title: "Uploaded Successfully",
        description: `${file.name} has been uploaded.`,
      });
      if (onUploadSuccess) onUploadSuccess();
    } catch (error: any) {
      console.error("Upload failed", error);
      toast({
        title: "Upload Failed",
        description: error?.message || "An error occurred.",
        variant: "destructive",
      });
    } finally {
      setUploadingId(null);
    }
  };

  const handleDrop = (e: React.DragEvent, doc: Document) => {
    e.preventDefault();
    setDragOverId(null);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelect(doc, files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent, docId: string) => {
    e.preventDefault();
    setDragOverId(docId);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOverId(null);
  };

  const getStatusBadge = (status?: Document["status"]) => {
    switch (status) {
      case "verified":
        return (
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-50 text-green-700 text-sm font-medium rounded-full border border-green-200">
            <CheckCircle size={14} />
            Verified
          </div>
        );
      case "rejected":
        return (
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-50 text-red-700 text-sm font-medium rounded-full border border-red-200">
            <XCircle size={14} />
            Rejected
          </div>
        );
      case "pending":
        return (
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-700 text-sm font-medium rounded-full border border-amber-200">
            <Clock size={14} />
            Pending Review
          </div>
        );
      default:
        return null;
    }
  };

  const getFileIcon = (file: File) => {
    if (file.type.startsWith("image/")) {
      return <Image size={18} className="text-blue-600" />;
    }
    return <FileText size={18} className="text-red-600" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Document Upload
        </h3>
        <p className="text-sm text-gray-600">
          Upload your required documents. Accepted formats: PDF, JPG, PNG (Max
          10MB each)
        </p>
      </div>

      {documents.map((doc) => {
        const file = uploadedFiles[doc.id];
        const uploadedDoc = uploadedDocs.find(
          (d) => d.documentType === stepName
        );
        console.log("Matching doc for card", doc.id, ":", uploadedDoc);
        const previewSrc = file
          ? URL.createObjectURL(file)
          : uploadedDoc?.fileUrl || doc.fileUrl || null;

        const showUploadInput = !file && !uploadedDoc?.fileUrl && !doc.fileUrl;
        const isRejected =
          uploadedDoc?.status === "Rejected" ||
          uploadedDoc?.status === "rejected";

        return (
          <div
            key={doc.id}
            className={`relative overflow-hidden rounded-xl border-2 transition-all duration-200 ${
              dragOverId === doc.id
                ? "border-blue-400 bg-blue-50"
                : file || uploadedDoc?.fileUrl || doc.fileUrl
                ? "border-green-200 bg-green-50"
                : "border-gray-200 bg-white hover:border-gray-300"
            } ${uploadingId === stepName ? "animate-pulse" : ""}`}
          >
            <div className="p-6">
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                    <FileText size={20} className="text-white" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <label
                      htmlFor={`file-${doc.id}`}
                      className="block font-semibold text-gray-900 cursor-pointer hover:text-blue-600 transition-colors"
                    >
                      {doc.label}
                      {doc.required && (
                        <span className="text-red-500 ml-1">*</span>
                      )}
                    </label>
                    {doc.description && (
                      <p className="text-sm text-gray-600 mt-1">
                        {doc.description}
                      </p>
                    )}
                  </div>
                </div>
                {/* Always show status badge if uploadedDoc exists */}
                {uploadedDoc
                  ? getStatusBadge(uploadedDoc.status)
                  : getStatusBadge(doc.status)}
              </div>

              {/* Upload Area */}
              <div
                className={`relative border-2 border-dashed rounded-lg p-6 transition-all duration-200 ${
                  dragOverId === doc.id
                    ? "border-blue-400 bg-blue-50"
                    : "border-gray-300 hover:border-blue-400 hover:bg-gray-50"
                }`}
                onDrop={(e) => handleDrop(e, doc)}
                onDragOver={(e) => handleDragOver(e, doc.id)}
                onDragLeave={handleDragLeave}
              >
                {showUploadInput ? (
                  <div className="text-center">
                    <Upload size={32} className="mx-auto text-gray-400 mb-3" />
                    <div className="text-sm">
                      <span className="font-medium text-blue-600 hover:text-blue-500">
                        Click to upload
                      </span>
                      <span className="text-gray-500"> or drag and drop</span>
                    </div>
                    <p className="text-xs text-gray-400 mt-2">
                      PDF, JPG, PNG up to 10MB
                    </p>
                    <input
                      id={`file-${doc.id}`}
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleFileSelect(doc, file);
                      }}
                      disabled={
                        uploadingId === stepName || doc.status === "verified"
                      }
                    />
                  </div>
                ) : (
                  <>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {file ? getFileIcon(file) : <FileText size={18} />}
                        <div>
                          <p className="font-medium text-gray-900">
                            {file?.name ||
                              uploadedDoc?.documentName ||
                              "Uploaded Document"}
                          </p>
                          <p className="text-sm text-gray-500">
                            {file
                              ? formatFileSize(file.size)
                              : uploadedDoc?.documentName
                              ? "Click preview to view document"
                              : ""}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        {previewSrc && (
                          <button
                            onClick={() => window.open(previewSrc, "_blank")}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
                          >
                            <Eye size={16} />
                            Preview
                          </button>
                        )}
                      </div>
                    </div>
                    {/* Show re-upload button and input below if rejected */}
                    {isRejected && (
                      <div className="mt-4 flex flex-col items-start gap-2">
                        <label htmlFor={`file-${doc.id}`}>
                          <span className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg cursor-pointer">
                            <Upload size={16} />
                            Re-upload
                          </span>
                        </label>
                        <input
                          id={`file-${doc.id}`}
                          type="file"
                          accept=".pdf,.jpg,.jpeg,.png"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleFileSelect(doc, file);
                          }}
                          disabled={
                            uploadingId === stepName ||
                            doc.status === "verified"
                          }
                        />
                      </div>
                    )}
                  </>
                )}

                {uploadingId === stepName && (
                  <div className="absolute inset-0 bg-white/90 flex items-center justify-center rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                      <span className="text-sm font-medium text-gray-700">
                        Uploading...
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}

      {/* Preview Modal */}
      <Dialog open={!!previewUrl} onOpenChange={() => setPreviewUrl(null)}>
        <DialogContent className="max-w-4xl w-full max-h-[90vh] p-0">
          <DialogTitle className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            Document Preview
          </DialogTitle>
          <div className="p-6 overflow-auto max-h-[calc(90vh-80px)]">
            {(() => {
              if (!previewUrl) return null;

              if (previewUrl.match(/\.(jpg|jpeg|png)$/i)) {
                return (
                  <div className="flex justify-center">
                    <img
                      src={previewUrl}
                      alt="Preview"
                      className="max-w-full max-h-[70vh] rounded-lg shadow-lg"
                    />
                  </div>
                );
              } else if (previewUrl.match(/\.pdf$/i)) {
                return (
                  <div className="w-full h-[70vh] overflow-auto border rounded-lg">
                    <PDFDocument
                      file={previewUrl}
                      loading={
                        <div className="flex items-center justify-center h-full">
                          <div className="flex items-center gap-3">
                            <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                            <span className="text-gray-600">
                              Loading PDF...
                            </span>
                          </div>
                        </div>
                      }
                      error={
                        <div className="flex items-center justify-center h-full text-red-600">
                          Failed to load PDF document
                        </div>
                      }
                    >
                      <PDFPage pageNumber={1} width={800} />
                    </PDFDocument>
                  </div>
                );
              } else {
                return (
                  <div className="flex items-center justify-center h-64 text-gray-500">
                    Preview not available for this file type
                  </div>
                );
              }
            })()}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DocumentUploadSection;

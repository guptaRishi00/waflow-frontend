import React, { useState, useEffect } from "react";
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
import AddNote from "./AddNote";

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

  const [uploadingId, setUploadingId] = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);
  const [pendingFiles, setPendingFiles] = useState<{
    [docId: string]: File | null;
  }>({});
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

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
        const pendingFile = pendingFiles[doc.id] || null;
        const previewUrl = React.useMemo(() => {
          if (pendingFile) {
            return URL.createObjectURL(pendingFile);
          }
          return null;
        }, [pendingFile]);
        useEffect(() => {
          return () => {
            if (previewUrl) URL.revokeObjectURL(previewUrl);
          };
        }, [previewUrl]);
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
            className={`relative overflow-hidden rounded-2xl border-2 shadow-md transition-all duration-300 mb-10 group hover:shadow-xl active:shadow-lg focus-within:shadow-xl bg-white/90 backdrop-blur-sm ${
              dragOverId === doc.id
                ? "border-blue-400 bg-blue-50"
                : file || uploadedDoc?.fileUrl || doc.fileUrl
                ? "border-green-200 bg-green-50"
                : "border-gray-200 hover:border-blue-400 hover:bg-gray-50"
            } ${uploadingId === stepName ? "animate-pulse" : ""}`}
            tabIndex={0}
            aria-label={`Document card for ${doc.label}`}
          >
            <div className="p-6 md:p-10 flex flex-col gap-6">
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-2">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center shadow-md">
                    <FileText
                      size={24}
                      className="text-white"
                      aria-label="Document icon"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <label
                      htmlFor={`file-${doc.id}`}
                      className="block font-semibold text-lg text-gray-900 cursor-pointer hover:text-blue-600 transition-colors"
                    >
                      {doc.label}
                      {doc.required && (
                        <span className="text-red-500 ml-1" title="Required">
                          *
                        </span>
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
                <div className="flex items-center gap-2">
                  {uploadedDoc
                    ? getStatusBadge(uploadedDoc.status)
                    : getStatusBadge(doc.status)}
                </div>
              </div>

              {/* Upload Area */}
              <div
                className={`relative border-2 border-dashed rounded-xl p-8 transition-all duration-200 flex flex-col items-center justify-center bg-gradient-to-br from-blue-50/60 to-white group-hover:from-blue-100 group-hover:to-blue-50 ${
                  dragOverId === doc.id
                    ? "border-blue-400 bg-blue-50"
                    : "border-gray-200 hover:border-blue-400 hover:bg-gray-50"
                }`}
                onDrop={(e) => {
                  e.preventDefault();
                  setDragOverId(null);
                  const files = e.dataTransfer.files;
                  if (files.length > 0) {
                    setPendingFiles((prev) => ({
                      ...prev,
                      [doc.id]: files[0],
                    }));
                  }
                }}
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragOverId(doc.id);
                }}
                onDragLeave={(e) => {
                  e.preventDefault();
                  setDragOverId(null);
                }}
                tabIndex={0}
                aria-label={`Upload area for ${doc.label}`}
              >
                {showUploadInput ? (
                  <div className="text-center w-full">
                    <label className="block cursor-pointer w-full">
                      <Upload
                        size={40}
                        className="mx-auto text-blue-400 mb-4 group-hover:scale-110 transition-transform"
                        aria-label="Select or drag file"
                      />
                      <div className="text-base font-medium text-blue-700 mb-1">
                        Click to select or drag and drop
                      </div>
                      <p className="text-xs text-gray-500 mb-2">
                        PDF, JPG, PNG up to 10MB
                      </p>
                      <input
                        id={`file-${doc.id}`}
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file)
                            setPendingFiles((prev) => ({
                              ...prev,
                              [doc.id]: file,
                            }));
                        }}
                        disabled={
                          uploadingId === stepName || doc.status === "verified"
                        }
                        aria-label={`Select file for ${doc.label}`}
                      />
                    </label>
                    {pendingFile && (
                      <div className="mt-6 flex flex-col items-center gap-2 animate-fade-in">
                        <div className="flex items-center gap-3 bg-gray-100 px-3 py-1 rounded-full">
                          <span className="text-sm text-gray-800 font-medium">
                            {pendingFile.name}
                          </span>
                          <span className="text-xs text-gray-500">
                            {formatFileSize(pendingFile.size)}
                          </span>
                          <button
                            type="button"
                            className="ml-2 text-gray-400 hover:text-red-500 focus:outline-none focus:ring-2 focus:ring-red-300 rounded-full"
                            aria-label="Remove selected file"
                            onClick={() =>
                              setPendingFiles((prev) => ({
                                ...prev,
                                [doc.id]: null,
                              }))
                            }
                          >
                            &#10005;
                          </button>
                        </div>
                        {/* Preview of selected file */}
                        {previewUrl && (
                          <div className="mt-2">
                            {pendingFile.type.startsWith("image/") ? (
                              <img
                                src={previewUrl}
                                alt="Preview"
                                className="max-h-32 rounded shadow border mx-auto"
                              />
                            ) : pendingFile.type === "application/pdf" ? (
                              <div className="flex items-center gap-2 text-gray-600">
                                <FileText size={20} />
                                <span>PDF Preview</span>
                              </div>
                            ) : (
                              <div className="flex items-center gap-2 text-gray-400">
                                <FileText size={20} />
                                <span>No preview available</span>
                              </div>
                            )}
                          </div>
                        )}
                        <button
                          type="button"
                          className="px-6 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold shadow hover:from-blue-700 hover:to-indigo-700 focus:ring-2 focus:ring-blue-400 focus:outline-none disabled:opacity-50 transition-all"
                          onClick={async () => {
                            await handleFileSelect(doc, pendingFile);
                            setPendingFiles((prev) => ({
                              ...prev,
                              [doc.id]: null,
                            }));
                          }}
                          disabled={uploadingId === stepName}
                          aria-label={`Upload file for ${doc.label}`}
                        >
                          {uploadingId === stepName ? (
                            <span className="flex items-center gap-2">
                              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                              Uploading...
                            </span>
                          ) : (
                            "Upload"
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <>
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center gap-3">
                        {file ? getFileIcon(file) : <FileText size={20} />}
                        <div>
                          <p className="font-medium text-gray-900">
                            {file?.name ||
                              uploadedDoc?.documentName ||
                              "Uploaded Document"}
                          </p>
                          <p className="text-xs text-gray-500">
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
                            onClick={() => setPreviewUrl(previewSrc)}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 text-xs font-medium rounded-lg transition-colors shadow-sm focus:ring-2 focus:ring-blue-400 focus:outline-none"
                            title="Preview document"
                            aria-label={`Preview document for ${doc.label}`}
                          >
                            <Eye size={16} />
                            Preview
                          </button>
                        )}
                      </div>
                    </div>
                    {isRejected && (
                      <div className="mt-4 flex flex-col items-start gap-2">
                        <label
                          htmlFor={`file-${doc.id}`}
                          className="cursor-pointer"
                        >
                          <span className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-medium rounded-lg">
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
                            if (file)
                              setPendingFiles((prev) => ({
                                ...prev,
                                [doc.id]: file,
                              }));
                          }}
                          disabled={
                            uploadingId === stepName ||
                            doc.status === "verified"
                          }
                          aria-label={`Re-upload file for ${doc.label}`}
                        />
                      </div>
                    )}
                  </>
                )}
                {uploadingId === stepName && (
                  <div className="absolute inset-0 bg-white/80 flex flex-col items-center justify-center rounded-xl z-10 animate-fade-in">
                    <div className="flex items-center gap-3 w-full">
                      <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                      <span className="text-base font-medium text-gray-700">
                        Uploading...
                      </span>
                    </div>
                    {/* Progress bar */}
                    <div className="w-full mt-4 h-2 bg-blue-100 rounded-full overflow-hidden">
                      <div className="h-2 bg-gradient-to-r from-blue-400 to-blue-600 animate-pulse rounded-full w-3/4"></div>
                    </div>
                  </div>
                )}
                {/* Success checkmark animation (optional, show after upload) */}
                {/* <div className="absolute right-4 top-4 animate-bounce-in text-green-500"><CheckCircle size={28} /></div> */}
              </div>

              {/* Notes section for uploaded document */}
              {uploadedDoc && (
                <div className="mt-6 animate-fade-in">
                  {uploadedDoc.notes && uploadedDoc.notes.length > 0 ? (
                    <div className="bg-gray-50 p-3 rounded-xl border border-gray-200">
                      <div className="font-semibold text-xs mb-2 text-gray-700">
                        Notes:
                      </div>
                      <ul className="space-y-2">
                        {uploadedDoc.notes.map((note: any, idx: number) => (
                          <li
                            key={idx}
                            className="flex items-start gap-3 border-b last:border-b-0 pb-2"
                          >
                            {/* Avatar with initials */}
                            <div className="flex-shrink-0 w-7 h-7 rounded-full bg-blue-200 text-blue-800 flex items-center justify-center font-bold text-xs shadow-sm">
                              {note.addedByRole
                                ? note.addedByRole[0].toUpperCase()
                                : "U"}
                            </div>
                            <div className="flex-1">
                              <div className="font-medium text-gray-800">
                                {note.message}
                              </div>
                              <div className="text-xs text-gray-500 flex items-center gap-2 mt-1">
                                <span>
                                  {note.addedByRole && `(${note.addedByRole})`}
                                </span>
                                <span className="ml-2 text-gray-400">
                                  {note.timestamp &&
                                    new Date(note.timestamp).toLocaleString()}
                                </span>
                              </div>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : (
                    <div className="text-xs text-gray-400">No notes</div>
                  )}
                  {uploadedDoc._id && <AddNote docId={uploadedDoc._id} />}
                </div>
              )}
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

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eye, FileText, User, HardDrive } from "lucide-react";
import { useSelector } from "react-redux";
import { RootState } from "@/app/store";
import { useToast } from "@/hooks/use-toast";
import axios from "axios";

interface ApplicationDocument {
  _id: string;
  fileName: string;
  stepName: string;
  fileSize: string;
  fileType: string;
  uploadedBy: string;
  uploadedAt: string;
  status: string;
  applicationId: string;
  documentUrl?: string;
}

interface Application {
  _id: string;
  applicationId: string;
  applicationName: string;
  customer: {
    firstName: string;
    lastName: string;
  };
  totalFileSize: number;
  totalDocuments: number;
  status: string;
  createdAt: string;
}

interface ApplicationDocumentsModalProps {
  isOpen: boolean;
  onClose: () => void;
  application: Application | null;
}

export const ApplicationDocumentsModal: React.FC<
  ApplicationDocumentsModalProps
> = ({ isOpen, onClose, application }) => {
  const { token } = useSelector((state: RootState) => state.customerAuth);
  const { toast } = useToast();
  const [documents, setDocuments] = useState<ApplicationDocument[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch documents when modal opens
  useEffect(() => {
    if (isOpen && application) {
      fetchDocuments();
    }
  }, [isOpen, application]);

  const fetchDocuments = async () => {
    if (!application || !token) return;

    setLoading(true);
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/api/document/application/${
          application._id
        }`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const docs = response.data.data || [];
      console.log("docs", docs);

      const transformedDocs = docs.map((doc: any) => ({
        _id: doc._id,
        fileName: doc.relatedStepName,
        stepName: doc.stepName || doc.workflowStep?.name || "Unknown Step",
        fileSize: doc.fileSize || "0 KB",
        fileType:
          doc.documentType ||
          doc.mimeType?.split("/")[1]?.toUpperCase() ||
          "Unknown",
        uploadedBy: doc.uploadedBy?.firstName
          ? `${doc.uploadedBy.firstName} ${doc.uploadedBy.lastName}`
          : doc.uploadedBy || "Unknown",
        uploadedAt: doc.uploadedAt || doc.createdAt || new Date().toISOString(),
        status: doc.status || "uploaded",
        applicationId: doc.applicationId || application.applicationId,
        documentUrl: doc.documentUrl || doc.fileUrl || doc.url || null,
      }));

      setDocuments(transformedDocs);
      console.log("transformedDocs", transformedDocs);
    } catch (error) {
      console.error("Error fetching documents:", error);

      // Fallback to mock data
      const mockDocs: ApplicationDocument[] = [
        {
          _id: "doc-1",
          fileName: "passport_john_doe.pdf",
          stepName: "Identity Verification",
          fileSize: "1.2 MB",
          fileType: "PDF",
          uploadedBy: "John Doe",
          uploadedAt: "2024-01-15T00:00:00.000Z",
          status: "uploaded",
          applicationId: application.applicationId,
          documentUrl: "https://example.com/documents/passport_john_doe.pdf",
        },
        {
          _id: "doc-2",
          fileName: "photo_john_doe.jpg",
          stepName: "Photo Upload",
          fileSize: "800 KB",
          fileType: "JPG",
          uploadedBy: "John Doe",
          uploadedAt: "2024-01-14T00:00:00.000Z",
          status: "verified",
          applicationId: application.applicationId,
          documentUrl: "https://example.com/documents/photo_john_doe.jpg",
        },
        {
          _id: "doc-3",
          fileName: "emirates_id_john.pdf",
          stepName: "Government ID",
          fileSize: "500 KB",
          fileType: "PDF",
          uploadedBy: "Agent Smith",
          uploadedAt: "2024-01-13T00:00:00.000Z",
          status: "verified",
          applicationId: application.applicationId,
          documentUrl: "https://example.com/documents/emirates_id_john.pdf",
        },
      ];

      setDocuments(mockDocs);
      toast({
        title: "Warning",
        description: "Using demo data. Some features may be limited.",
        variant: "default",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleViewDocument = (document: ApplicationDocument) => {
    if (document.documentUrl) {
      // Open document URL in a new tab
      window.open(document.documentUrl, "_blank");
      toast({
        title: "Document Opened",
        description: `Opening ${document.fileName} in new tab...`,
        variant: "default",
      });
    } else {
      // Fallback if no URL is available
      toast({
        title: "Document Unavailable",
        description: `No link available for ${document.fileName}`,
        variant: "destructive",
      });
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status.toLowerCase()) {
      case "verified":
        return "default";
      case "uploaded":
        return "secondary";
      case "pending":
        return "outline";
      default:
        return "secondary";
    }
  };

  const formatFileSize = (size: string) => {
    return size;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (!application) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-gray-900">
            {application.applicationName} - Documents
          </DialogTitle>
        </DialogHeader>

        {/* Application Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-gray-500" />
            <div>
              <p className="text-sm text-gray-600">Application</p>
              <p className="font-medium">{application.applicationId}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-gray-500" />
            <div>
              <p className="text-sm text-gray-600">Customer</p>
              <p className="font-medium">
                {application.customer.firstName} {application.customer.lastName}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <HardDrive className="w-4 h-4 text-gray-500" />
            <div>
              <p className="text-sm text-gray-600">Total Size</p>
              <p className="font-medium">{application.totalFileSize} MB</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-gray-500" />
            <div>
              <p className="text-sm text-gray-600">Documents</p>
              <p className="font-medium">{application.totalDocuments}</p>
            </div>
          </div>
        </div>

        {/* Documents Table */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Documents</h3>

          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="text-gray-600 mt-2">Loading documents...</p>
            </div>
          ) : documents.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h4 className="text-lg font-medium text-gray-900 mb-2">
                No documents found
              </h4>
              <p className="text-gray-600">
                No step documents found for this application.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-medium text-gray-700">
                      Application Number
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">
                      Name
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">
                      Size
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">
                      Type
                    </th>

                    <th className="text-left py-3 px-4 font-medium text-gray-700">
                      Uploaded At
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">
                      Status
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {documents.map((doc) => (
                    <tr
                      key={doc._id}
                      className="border-b border-gray-100 hover:bg-gray-50"
                    >
                      <td className="py-4 px-4">
                        <Badge variant="outline" className="font-mono">
                          {doc.applicationId}
                        </Badge>
                      </td>
                      <td className="py-4 px-4">
                        <div className="font-medium text-gray-900">
                          {doc.fileName}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="text-gray-900">
                          {formatFileSize(doc.fileSize)}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <Badge variant="secondary">{doc.fileType}</Badge>
                      </td>

                      <td className="py-4 px-4">
                        <div className="text-gray-900">
                          {formatDate(doc.uploadedAt)}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <Badge variant={getStatusVariant(doc.status)}>
                          {doc.status}
                        </Badge>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewDocument(doc)}
                            className="h-8 w-8 p-0"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

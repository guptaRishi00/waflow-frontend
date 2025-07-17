import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Download, Eye, Upload, Filter, Check, X } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
// import { useAuth } from '@/contexts/AuthContext';
import { DocumentUploadModal } from "@/components/common/DocumentUploadModal";
import { useSelector } from "react-redux";
import { RootState } from "@/app/store";

interface DocumentItem {
  id: string;
  customerName: string;
  applicationId: string;
  fileName: string;
  category: "passport" | "photo" | "visa" | "invoice" | "government" | "other";
  uploadedAt: string;
  status: "uploaded" | "verified" | "rejected";
  fileUrl: string;
  fileType: string;
  customerId?: string;
  description?: string;
}

const mockDocuments: DocumentItem[] = [
  {
    id: "1",
    customerName: "John Doe",
    applicationId: "APP-001",
    fileName: "passport_john_doe.pdf",
    category: "passport",
    uploadedAt: "2024-01-15",
    status: "uploaded",
    fileUrl: "/placeholder-doc.pdf",
    fileType: "pdf",
    customerId: "CUST-001",
  },
  {
    id: "2",
    customerName: "Jane Smith",
    applicationId: "APP-002",
    fileName: "photo_jane_smith.jpg",
    category: "photo",
    uploadedAt: "2024-01-14",
    status: "verified",
    fileUrl: "/placeholder-image.jpg",
    fileType: "image",
    customerId: "CUST-002",
  },
];

export const DirectoryPage: React.FC = () => {
  const { token, user } = useSelector((state: RootState) => state.customerAuth);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [documents, setDocuments] = useState<DocumentItem[]>(mockDocuments);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  const filteredDocuments = documents.filter((doc) => {
    const matchesSearch =
      doc.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.applicationId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.fileName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === "all" || doc.category === selectedCategory;
    const matchesStatus =
      selectedStatus === "all" || doc.status === selectedStatus;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "verified":
        return "bg-green-100 text-green-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      default:
        return "bg-yellow-100 text-yellow-800";
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "passport":
        return "bg-blue-100 text-blue-800";
      case "photo":
        return "bg-purple-100 text-purple-800";
      case "visa":
        return "bg-indigo-100 text-indigo-800";
      case "invoice":
        return "bg-orange-100 text-orange-800";
      case "government":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const handleDownload = (doc: DocumentItem) => {
    console.log("Downloading:", doc.fileName);
  };

  const handleView = (doc: DocumentItem) => {
    console.log("Viewing:", doc.fileName);
    window.open(doc.fileUrl, "_blank");
  };

  const handleUpload = () => {
    setIsUploadModalOpen(true);
  };

  const handleVerify = (docId: string) => {
    setDocuments((docs) =>
      docs.map((doc) =>
        doc.id === docId ? { ...doc, status: "verified" as const } : doc
      )
    );
  };

  const handleReject = (docId: string) => {
    setDocuments((docs) =>
      docs.map((doc) =>
        doc.id === docId ? { ...doc, status: "rejected" as const } : doc
      )
    );
  };

  const handleDocumentUpload = (newDocument: any) => {
    setDocuments((prev) => [newDocument, ...prev]);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Document Directory
          </h1>
          <p className="text-gray-600 mt-1">
            Review and manage customer documents
          </p>
        </div>
        <Button
          onClick={handleUpload}
          className="bg-primary hover:bg-primary/90"
        >
          <Upload className="w-4 h-4 mr-2" />
          Upload Document
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search by customer name, application ID, or filename..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select
              value={selectedCategory}
              onValueChange={setSelectedCategory}
            >
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="passport">Passport</SelectItem>
                <SelectItem value="photo">Photo</SelectItem>
                <SelectItem value="visa">Visa</SelectItem>
                <SelectItem value="invoice">Invoice</SelectItem>
                <SelectItem value="government">Government</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="uploaded">Uploaded</SelectItem>
                <SelectItem value="verified">Verified</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Documents Grid */}
      <div className="grid gap-4">
        {filteredDocuments.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <div className="text-gray-400 mb-4">
                <Filter className="w-12 h-12 mx-auto" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No documents found
              </h3>
              <p className="text-gray-600">
                Try adjusting your search or filter criteria
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredDocuments.map((doc) => (
            <Card key={doc.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-gray-900">
                        {doc.fileName}
                      </h3>
                      <Badge className={getCategoryColor(doc.category)}>
                        {doc.category}
                      </Badge>
                      <Badge className={getStatusColor(doc.status)}>
                        {doc.status}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span>
                        <strong>Customer:</strong> {doc.customerName}
                      </span>
                      <span>
                        <strong>App ID:</strong> {doc.applicationId}
                      </span>
                      <span>
                        <strong>Uploaded:</strong>{" "}
                        {new Date(doc.uploadedAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleView(doc)}
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      View
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDownload(doc)}
                    >
                      <Download className="w-4 h-4 mr-1" />
                      Download
                    </Button>
                    {doc.status === "uploaded" && (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleVerify(doc.id)}
                          className="text-green-600 hover:text-green-700"
                        >
                          <Check className="w-4 h-4 mr-1" />
                          Verify
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleReject(doc.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <X className="w-4 h-4 mr-1" />
                          Reject
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Document Upload Modal */}
      <DocumentUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onUpload={handleDocumentUpload}
      />
    </div>
  );
};

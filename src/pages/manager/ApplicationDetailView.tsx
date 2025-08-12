import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  FileText,
  Download,
  Eye,
  Upload,
  Plus,
  Edit,
  Calendar,
  User,
  Building,
  DollarSign,
  FileImage,
  X,
  Check,
  AlertCircle,
  CreditCard,
  Receipt,
  MessageSquare,
  Workflow,
} from "lucide-react";
import { useSelector } from "react-redux";
import { RootState } from "@/app/store";
import axios from "axios";
import { useToast } from "@/hooks/use-toast";
import { uploadToCloudinary } from "@/lib/cloudinary";
import ApplicationWorkflowTimeline from "@/components/common/ApplicationWorkflowTimeline";
import { NotesModule } from "@/components/common/NotesModule";

interface Application {
  _id: string;
  applicationNumber: string;
  status: string;
  paymentStatus: string;
  applicationType?: string;
  assignedAgent?: {
    _id: string;
    fullName: string;
    email: string;
  };
  submissionDate: string;
  lastUpdatedDate: string;
  companyJurisdiction?: string;
  businessSetup?: {
    companyType?: string;
    businessActivity?: string;
    proposedName?: string;
    alternativeNames?: string[];
    officeType?: string;
    quotedPrice?: number;
  };
  investors?: Array<{
    name: string;
    ownershipPercentage: number;
    role: string;
  }>;
  payments?: Array<{
    amount: number;
    status: string;
    invoiceUrl?: string;
    paymentDate?: string;
  }>;
  documents?: Array<{
    _id: string;
    name: string;
    uploadedBy: string;
    uploadedDate: string;
    downloadUrl: string;
    fileSize?: number;
    fileType?: string;
  }>;
  steps?: Array<{
    stepName: string;
    status: string;
    updatedAt: string;
    _id?: string;
  }>;
  customer?: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber?: string;
  };
}

type TabType = "details" | "workflow" | "payments" | "notes";

interface ApplicationDetailViewProps {
  applicationId: string;
  onBack: () => void;
}

export const ApplicationDetailView: React.FC<ApplicationDetailViewProps> = ({
  applicationId,
  onBack,
}) => {
  const [application, setApplication] = useState<Application | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const initialTab: TabType = "details";
  const [activeTab, setActiveTab] = useState<TabType>(initialTab);
  const [uploadForm, setUploadForm] = useState({
    title: "",
    file: null as File | null,
  });
  const [isUploading, setIsUploading] = useState(false);
  const { token } = useSelector((state: RootState) => state.customerAuth);
  const { toast } = useToast();

  useEffect(() => {
    const fetchApplicationData = async () => {
      if (!token || !applicationId) return;

      setIsLoading(true);
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_BASE_URL}/api/application/${applicationId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setApplication(response.data.data);
      } catch (error) {
        console.error("Error fetching application data:", error);
        toast({
          title: "Error",
          description: "Failed to load application data",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchApplicationData();
  }, [applicationId, token, toast]);

  const getStatusBadge = (status: string) => {
    const statusColors = {
      "in progress": "bg-blue-100 text-blue-800 border-blue-200",
      approved: "bg-green-100 text-green-800 border-green-200",
      rejected: "bg-red-100 text-red-800 border-red-200",
      pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
      completed: "bg-green-100 text-green-800 border-green-200",
      "under review": "bg-purple-100 text-purple-800 border-purple-200",
    };

    return (
      <Badge
        variant="outline"
        className={
          statusColors[status.toLowerCase() as keyof typeof statusColors] ||
          "bg-gray-100 text-gray-800"
        }
      >
        {status}
      </Badge>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Please select a file smaller than 10MB",
          variant: "destructive",
        });
        return;
      }
      setUploadForm((prev) => ({ ...prev, file }));
    }
  };

  const handleUpload = async () => {
    if (!uploadForm.title || !uploadForm.file || !application) return;

    setIsUploading(true);
    try {
      // Upload to Cloudinary
      const uploadResult = await uploadToCloudinary(uploadForm.file);
      const uploadedUrl = uploadResult.secure_url;

      // Update application with the document URL via PATCH
      const response = await axios.patch(
        `${
          import.meta.env.VITE_BASE_URL
        }/api/application/customer/${applicationId}`,
        {
          documents: [
            {
              name: uploadForm.title,
              uploadedBy: "Manager",
              uploadedDate: new Date().toISOString(),
              downloadUrl: uploadedUrl,
              fileSize: uploadForm.file.size,
              fileType: uploadForm.file.type,
            },
          ],
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      // Update application documents locally
      if (application.documents) {
        setApplication((prev) =>
          prev
            ? {
                ...prev,
                documents: [
                  ...prev.documents,
                  {
                    _id: Date.now().toString(), // Temporary ID for UI
                    name: uploadForm.title,
                    uploadedBy: "Manager",
                    uploadedDate: new Date().toISOString(),
                    downloadUrl: uploadedUrl,
                    fileSize: uploadForm.file.size,
                    fileType: uploadForm.file.type,
                  },
                ],
              }
            : null
        );
      }

      toast({
        title: "Document uploaded",
        description: "Document has been uploaded successfully",
      });

      setIsUploadDialogOpen(false);
      setUploadForm({ title: "", file: null });
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

  const handleDownload = async (documentId: string, fileName: string) => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/api/document/download/${documentId}`,
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">
            Loading application details...
          </p>
        </div>
      </div>
    );
  }

  if (!application) {
    return (
      <div className="text-center py-8">
        <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Application Not Found
        </h3>
        <p className="text-muted-foreground mb-4">
          The application you're looking for doesn't exist.
        </p>
        <Button onClick={onBack} variant="outline">
          Go Back
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button onClick={onBack} variant="outline" size="sm">
            <FileText className="h-4 w-4 mr-2" />
            Back to Applications
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-primary">
              Application Details
            </h1>
            <p className="text-muted-foreground">
              Application #{application.applicationNumber}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {getStatusBadge(application.status)}
          <Badge variant="outline">{application.paymentStatus}</Badge>
        </div>
      </div>

      {/* Application Summary Card */}
      <Card>
        <CardHeader>
          <CardTitle>Application Summary</CardTitle>
          <CardDescription>
            Key information about this application
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Application ID</p>
              <p className="text-sm font-medium">{application._id}</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Submission Date</p>
              <p className="text-sm">
                {formatDate(application.submissionDate)}
              </p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Last Updated</p>
              <p className="text-sm">
                {formatDate(application.lastUpdatedDate)}
              </p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Assigned Agent</p>
              <p className="text-sm">
                {application.assignedAgent?.fullName || "Not assigned"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <div className="border rounded-lg p-4 bg-white">
        {/* Tab Navigation */}
        <div className="grid w-full grid-cols-4 mb-6 bg-gray-100 border rounded-lg p-1">
          <button
            onClick={() => setActiveTab("details")}
            className={`flex items-center gap-2 px-3 py-2 rounded transition-all ${
              activeTab === "details"
                ? "bg-blue-500 text-white border-blue-500"
                : "bg-white border hover:bg-gray-50"
            } border rounded`}
          >
            <FileText className="h-4 w-4" />
            Application Details
          </button>
          <button
            onClick={() => setActiveTab("workflow")}
            className={`flex items-center gap-2 px-3 py-2 rounded transition-all ${
              activeTab === "workflow"
                ? "bg-blue-500 text-white border-blue-500"
                : "bg-white border hover:bg-gray-50"
            } border rounded`}
          >
            <Workflow className="h-4 w-4" />
            Workflow Timeline
          </button>
          <button
            onClick={() => setActiveTab("payments")}
            className={`flex items-center gap-2 px-3 py-2 rounded transition-all ${
              activeTab === "payments"
                ? "bg-blue-500 text-white border-blue-500"
                : "bg-white border hover:bg-gray-50"
            } border rounded`}
          >
            <CreditCard className="h-4 w-4" />
            Payment Details
          </button>
          <button
            onClick={() => setActiveTab("notes")}
            className={`flex items-center gap-2 px-3 py-2 rounded transition-all ${
              activeTab === "notes"
                ? "bg-blue-500 text-white border-blue-500"
                : "bg-white border hover:bg-gray-50"
            } border rounded`}
          >
            <MessageSquare className="h-4 w-4" />
            NOTES
          </button>
        </div>

          {/* Application Details Tab */}
          {activeTab === "details" && (
            <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Customer Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5 text-blue-600" />
                    Customer Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {application.customer ? (
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">
                          Name:
                        </span>
                        <span className="text-sm font-medium">
                          {application.customer.firstName}{" "}
                          {application.customer.lastName}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">
                          Email:
                        </span>
                        <span className="text-sm">
                          {application.customer.email}
                        </span>
                      </div>
                      {application.customer.phoneNumber && (
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">
                            Phone:
                          </span>
                          <span className="text-sm">
                            {application.customer.phoneNumber}
                          </span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      No customer information available
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* Business Setup Details */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building className="h-5 w-5 text-green-600" />
                    Business Setup Details
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {application.businessSetup ? (
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">
                          Company Type:
                        </span>
                        <span className="text-sm">
                          {application.businessSetup.companyType ||
                            "Not specified"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">
                          Business Activity:
                        </span>
                        <span className="text-sm">
                          {application.businessSetup.businessActivity ||
                            "Not specified"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">
                          Proposed Name:
                        </span>
                        <span className="text-sm">
                          {application.businessSetup.proposedName ||
                            "Not specified"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">
                          Office Type:
                        </span>
                        <span className="text-sm">
                          {application.businessSetup.officeType ||
                            "Not specified"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">
                          Quoted Price:
                        </span>
                        <span className="text-sm">
                          {application.businessSetup.quotedPrice
                            ? `$${application.businessSetup.quotedPrice}`
                            : "Not specified"}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      No business setup details available
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* Investor Details */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5 text-purple-600" />
                    Investor Details
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {application.investors && application.investors.length > 0 ? (
                    <div className="space-y-3">
                      {application.investors.map((investor, idx) => (
                        <div key={idx} className="p-3 bg-gray-50 rounded-lg">
                          <h4 className="font-medium text-sm mb-2">
                            Investor {idx + 1}
                          </h4>
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span className="text-sm text-muted-foreground">
                                Name:
                              </span>
                              <span className="text-sm">{investor.name}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm text-muted-foreground">
                                Ownership:
                              </span>
                              <span className="text-sm">
                                {investor.ownershipPercentage}%
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm text-muted-foreground">
                                Role:
                              </span>
                              <span className="text-sm">{investor.role}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      No investor details available
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* Documents */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileImage className="h-5 w-5 text-orange-600" />
                    Documents
                  </CardTitle>
                  <CardDescription>
                    {application.documents?.length || 0} document(s) uploaded
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Upload Button */}
                    <div className="flex justify-between items-center">
                      <div>
                        <h4 className="font-medium text-sm">
                          Upload New Document
                        </h4>
                        <p className="text-xs text-muted-foreground">
                          Max file size: 10MB
                        </p>
                      </div>
                      <Dialog
                        open={isUploadDialogOpen}
                        onOpenChange={setIsUploadDialogOpen}
                      >
                        <DialogTrigger asChild>
                          <Button size="sm">
                            <Upload className="h-4 w-4 mr-2" />
                            Upload Document
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Upload Document</DialogTitle>
                            <DialogDescription>
                              Upload a new document for this application.
                              Maximum file size is 10MB.
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div>
                              <Label htmlFor="title">Document Title</Label>
                              <Input
                                id="title"
                                value={uploadForm.title}
                                onChange={(e) =>
                                  setUploadForm((prev) => ({
                                    ...prev,
                                    title: e.target.value,
                                  }))
                                }
                                placeholder="Enter document title"
                              />
                            </div>
                            <div>
                              <Label htmlFor="file">Select File</Label>
                              <Input
                                id="file"
                                type="file"
                                onChange={handleFileChange}
                                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                              />
                              <p className="text-xs text-muted-foreground mt-1">
                                Supported formats: PDF, DOC, DOCX, JPG, JPEG,
                                PNG
                              </p>
                            </div>
                          </div>
                          <DialogFooter>
                            <Button
                              variant="outline"
                              onClick={() => {
                                setIsUploadDialogOpen(false);
                                setUploadForm({ title: "", file: null });
                              }}
                            >
                              Cancel
                            </Button>
                            <Button
                              onClick={handleUpload}
                              disabled={
                                !uploadForm.title ||
                                !uploadForm.file ||
                                isUploading
                              }
                            >
                              {isUploading ? (
                                <>
                                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                  Uploading...
                                </>
                              ) : (
                                <>
                                  <Upload className="h-4 w-4 mr-2" />
                                  Upload
                                </>
                              )}
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </div>

                    {/* Documents List */}
                    {application.documents &&
                    application.documents.length > 0 ? (
                      <div className="space-y-3">
                        {application.documents.map((document, idx) => (
                          <div
                            key={document._id}
                            className="p-3 bg-gray-50 rounded-lg"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <h5 className="font-medium text-sm">
                                  {document.name}
                                </h5>
                                <p className="text-sm text-muted-foreground">
                                  Uploaded by {document.uploadedBy} on{" "}
                                  {formatDate(document.uploadedDate)}
                                </p>
                                {document.fileSize && (
                                  <p className="text-xs text-muted-foreground">
                                    {formatFileSize(document.fileSize)}
                                  </p>
                                )}
                              </div>
                              <div className="flex items-center gap-2">
                                <Button size="sm" variant="outline">
                                  <Eye className="h-4 w-4 mr-1" />
                                  View
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() =>
                                    handleDownload(document._id, document.name)
                                  }
                                >
                                  <Download className="h-4 w-4 mr-1" />
                                  Download
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-4">
                        <FileImage className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-muted-foreground">
                          No documents uploaded yet
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Workflow Timeline Tab */}
          {activeTab === "workflow" && (
            <div className="space-y-6">
              {application && application.steps && (
                <ApplicationWorkflowTimeline
                  applicationId={applicationId}
                  steps={application.steps}
                  applicationType={application.applicationType || "mainland"}
                />
              )}
            </div>
          )}

          {/* Payment Details Tab */}
          {activeTab === "payments" && (
            <div className="space-y-6">
              <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-green-600" />
                  Payment Details
                </CardTitle>
                <CardDescription>
                  Track payment status and invoices for this application
                </CardDescription>
              </CardHeader>
              <CardContent>
                {application.payments && application.payments.length > 0 ? (
                  <div className="space-y-4">
                    {application.payments.map((payment, idx) => (
                      <div key={idx} className="p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium text-sm">
                              Payment {idx + 1}
                            </h4>
                            <p className="text-sm text-muted-foreground">
                              ${payment.amount}
                            </p>
                            {payment.paymentDate && (
                              <p className="text-xs text-muted-foreground">
                                {formatDate(payment.paymentDate)}
                              </p>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge
                              variant="outline"
                              className={
                                payment.status === "paid"
                                  ? "bg-green-100 text-green-800"
                                  : payment.status === "pending"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : "bg-red-100 text-red-800"
                              }
                            >
                              {payment.status}
                            </Badge>
                            {payment.invoiceUrl && (
                              <Button size="sm" variant="outline">
                                <Receipt className="h-4 w-4 mr-1" />
                                Download Invoice
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      No Payment Records
                    </h3>
                    <p className="text-muted-foreground">
                      Payment details will appear here once payments are
                      processed.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
            </div>
          )}

          {/* Notes Tab */}
          {activeTab === "notes" && (
            <div className="space-y-6">
              <NotesModule
                customerId={application.customer?._id || ""}
                applicationId={applicationId}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ApplicationDetailView;

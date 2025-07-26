import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Upload,
  FileText,
  CheckCircle,
  Calendar,
  Download,
  Info,
  User,
  XCircle,
  Clock,
  HelpCircle,
  Eye,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import axios from "axios";
import { useSelector } from "react-redux";
import { RootState } from "@/app/store";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useRef } from "react";

interface VisaFormData {
  firstName: string;
  lastName: string;
  applicationType: string;
  nationality: string;
  passportNumber: string;
  passportExpiry: string;
  emiratesId: string;
  residenceAddress: string;
  emergencyContact: string;
  emergencyPhone: string;
}

interface VisaSubStep {
  memberId: {
    _id: string;
    firstName?: string;
    lastName?: string;
    email?: string;
  };
  medical: { stepName: string; status: string; updatedAt: string };
  residenceVisa: { stepName: string; status: string; updatedAt: string };
  emiratesIdSoft: { stepName: string; status: string; updatedAt: string };
  emiratesIdHard: { stepName: string; status: string; updatedAt: string };
}

interface VisaMember {
  firstName: string;
  lastName: string;
  passportNumber: string;
  nationality: string;
  dob?: string;
  emiratesId?: string;
  relationship?: string;
  documents: File[];
}

interface SubmittedVisaApplication {
  _id: string;
  status: string;
  members: VisaMember[];
  documents: any[];
  createdAt: string;
  visaSubSteps?: any[];
}

export const VisaPage: React.FC = () => {
  const [formData, setFormData] = useState<{ emiratesId: string }>({
    emiratesId: "",
  });

  const { user, token } = useSelector((state: RootState) => state.customerAuth);
  const { toast } = useToast();
  // Remove VisaMember, members, memberForm, handleAddMember, handleRemoveMember, handleFileChange, handleVisaSubmit, and related UI.
  // Add state for required documents
  const [requiredDocs, setRequiredDocs] = useState([
    { label: "Passport Copy", type: "passport", file: null },
    { label: "Emirates ID (Front & Back)", type: "emirates-id", file: null },
    { label: "Medical Certificate", type: "medical", file: null },
  ]);
  const [submitting, setSubmitting] = useState(false);
  const [submittedVisas, setSubmittedVisas] = useState<
    SubmittedVisaApplication[]
  >([]);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  // Add state for fetched documents
  const [documents, setDocuments] = useState<any[]>([]);

  // Fetch submitted visa members for this customer
  useEffect(() => {
    const fetchVisaMembers = async () => {
      if (!token || !user?.userId) return;
      try {
        const res = await axios.get(
          `${
            import.meta.env.VITE_BASE_URL
          }/api/application/visa-members/customer/${user.userId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setVisaMembers(
          Array.isArray(res.data.visaMembers) ? res.data.visaMembers : []
        );
        console.log("Fetched visaMembers:", res.data.visaMembers);
      } catch (err) {
        setVisaMembers([]);
      }
    };
    fetchVisaMembers();
  }, [token, user]);

  // Fetch all documents for this customer
  useEffect(() => {
    const fetchDocuments = async () => {
      if (!token || !user?.userId) return;
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_BASE_URL}/api/document/customer/${
            user.userId
          }`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setDocuments(Array.isArray(res.data.data) ? res.data.data : []);
        console.log("Fetched documents:", res.data.data);
      } catch (err) {
        setDocuments([]);
      }
    };
    fetchDocuments();
  }, [token, user]);

  const [visaMembers, setVisaMembers] = useState<any[]>([]);
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const totalPages = Math.ceil(visaMembers.length / itemsPerPage);
  const paginatedMembers = visaMembers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // Handle file selection for required docs
  const handleDocFileChange = (idx: number, file: File | null) => {
    setRequiredDocs((prev) =>
      prev.map((doc, i) => (i === idx ? { ...doc, file } : doc))
    );
  };

  // Submit visa application (integrated with main form and required docs)
  const handleVisaFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      // Validate required docs
      if (requiredDocs.some((doc) => !doc.file)) {
        toast({
          title: "Missing Documents",
          description: "Please upload all required documents.",
          variant: "destructive",
        });
        setSubmitting(false);
        return;
      }
      // 2. Prepare member object with only emiratesId
      const member = {
        emiratesId: formData.emiratesId,
      };
      // 1. Upload all required documents
      const allDocIds: string[] = [];
      for (const doc of requiredDocs) {
        const formDataDoc = new FormData();
        formDataDoc.append("file", doc.file!);
        formDataDoc.append("documentType", doc.type);
        formDataDoc.append("documentName", doc.file!.name);
        formDataDoc.append("linkedTo", user?.userId || "");
        formDataDoc.append("linkedModel", "Customer");
        formDataDoc.append("memberId", member.emiratesId); // Add memberId to document upload
        const res = await axios.post(
          `${import.meta.env.VITE_BASE_URL}/api/document/create-document`,
          formDataDoc,
          {
            headers: {
              "Content-Type": "multipart/form-data",
              Authorization: `Bearer ${token}`,
            },
          }
        );
        if (res.data.data && res.data.data._id) {
          allDocIds.push(res.data.data._id);
        }
      }
      // 3. Submit visa application (no applicationId required)
      const visaRes = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/api/application/visa-member/${
          user.userId
        }`,
        {
          memberId: member.emiratesId, // or the correct memberId value
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast({
        title: "Visa Application Submitted",
        description: "Your visa application has been submitted.",
      });
      setSubmittedVisas((prev) => [visaRes.data.data, ...prev]);
      setFormData({ emiratesId: "" });
      setRequiredDocs((prev) => prev.map((doc) => ({ ...doc, file: null })));
    } catch (err: any) {
      toast({
        title: "Error",
        description:
          err?.response?.data?.message || "Failed to submit visa application.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  // Helper for status badge
  const getStatusBadge = (status: string) => {
    let color = "bg-yellow-100 text-yellow-800";
    let icon = <Clock className="h-4 w-4 mr-1" />;
    let label = status;
    if (status === "Approved") {
      color = "bg-green-100 text-green-800";
      icon = <CheckCircle className="h-4 w-4 mr-1" />;
      label = "Approved";
    } else if (status === "Not Started") {
      color = "bg-gray-100 text-gray-800";
      icon = <HelpCircle className="h-4 w-4 mr-1" />;
      label = "Not Started";
    } else if (status === "Declined") {
      color = "bg-red-100 text-red-800";
      icon = <XCircle className="h-4 w-4 mr-1" />;
      label = "Declined";
    } else if (status === "Started") {
      color = "bg-blue-100 text-blue-800";
      icon = <Info className="h-4 w-4 mr-1" />;
      label = "In Progress";
    }
    return (
      <span
        className={`inline-flex items-center px-2 py-1 rounded ${color} text-xs font-medium`}
      >
        {icon}
        {label}
      </span>
    );
  };

  return (
    <TooltipProvider>
      <div className="space-y-8 max-w-4xl mx-auto px-2 md:px-0">
        {/* Visa Application Form (integrated) */}
        <Card>
          <CardHeader>
            <CardTitle>Visa Application Details</CardTitle>
            <CardDescription>
              Complete your visa application information and upload required
              documents
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleVisaFormSubmit} className="space-y-6">
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <Label htmlFor="emiratesId">Emirates ID (if available)</Label>
                  <Input
                    id="emiratesId"
                    value={formData.emiratesId}
                    onChange={(e) =>
                      handleInputChange("emiratesId", e.target.value)
                    }
                    placeholder="Enter Emirates ID number"
                  />
                </div>
              </div>
              {/* Required Documents Upload */}
              <div className="space-y-4 mt-4">
                {requiredDocs.map((doc, idx) => (
                  <div
                    key={doc.type}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex items-center space-x-3">
                      <FileText className="h-5 w-5 text-primary" />
                      <div>
                        <p className="font-medium">{doc.label}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Input
                        type="file"
                        accept="application/pdf,image/*"
                        onChange={(e) =>
                          handleDocFileChange(idx, e.target.files?.[0] || null)
                        }
                      />
                      {doc.file && (
                        <span className="text-xs text-muted-foreground">
                          {doc.file.name}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              <Button
                type="submit"
                className="w-full bg-primary hover:bg-primary/90"
                disabled={submitting}
              >
                {submitting ? "Submitting..." : "Submit Visa Application"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* List of Visa Members */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Your Visa Members
            </CardTitle>
            <CardDescription>
              Track the status of your submitted visa applications and their
              documents
            </CardDescription>
          </CardHeader>
          <CardContent>
            {visaMembers.length === 0 ? (
              <div className="text-center py-8">
                <User className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground text-lg font-medium">
                  No visa members found
                </p>
                <p className="text-muted-foreground text-sm">
                  Submit your first visa application above to see it here
                </p>
              </div>
            ) : (
              <>
                <div className="space-y-4">
                  {paginatedMembers.map((member) => (
                    <div
                      key={member._id}
                      className="border rounded-lg p-6 hover:shadow-md transition-shadow"
                    >
                      {/* Member Header */}
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                            <User className="w-5 h-5 text-primary" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-lg">
                              Member ID: {member.memberId || "N/A"}
                            </h3>
                          </div>
                        </div>
                      </div>

                      {/* Documents Section */}
                      <div className="border-t pt-4">
                        <div className="flex items-center gap-2 mb-3">
                          <FileText className="w-4 h-4 text-muted-foreground" />
                          <h4 className="font-medium text-sm">
                            Uploaded Documents
                          </h4>
                        </div>

                        {documents.filter(
                          (doc) =>
                            doc.memberId && doc.memberId === member.memberId
                        ).length === 0 ? (
                          <div className="text-center py-4 bg-gray-50 rounded-lg">
                            <FileText className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                            <p className="text-muted-foreground text-sm">
                              No documents uploaded yet
                            </p>
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {documents
                              .filter(
                                (doc) =>
                                  doc.memberId &&
                                  doc.memberId === member.memberId
                              )
                              .map((doc) => (
                                <div
                                  key={doc._id}
                                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border"
                                >
                                  <div className="flex items-center gap-2">
                                    <FileText className="w-4 h-4 text-blue-600" />
                                    <div>
                                      <p className="text-sm font-medium text-gray-900">
                                        {doc.documentName ||
                                          doc.fileName ||
                                          doc._id}
                                      </p>
                                      <p className="text-xs text-gray-500">
                                        {new Date(
                                          doc.createdAt
                                        ).toLocaleDateString()}
                                      </p>
                                    </div>
                                  </div>
                                  {doc.fileUrl && (
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() =>
                                        window.open(
                                          doc.fileUrl,
                                          "_blank",
                                          "noopener,noreferrer"
                                        )
                                      }
                                    >
                                      <Eye className="w-4 h-4 mr-1" />
                                      View
                                    </Button>
                                  )}
                                </div>
                              ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Enhanced Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between mt-6 pt-4 border-t">
                    <div className="text-sm text-muted-foreground">
                      Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
                      {Math.min(currentPage * itemsPerPage, visaMembers.length)}{" "}
                      of {visaMembers.length} members
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          setCurrentPage((p) => Math.max(p - 1, 1))
                        }
                        disabled={currentPage === 1}
                      >
                        Previous
                      </Button>
                      <div className="flex items-center gap-1">
                        {Array.from(
                          { length: totalPages },
                          (_, i) => i + 1
                        ).map((page) => (
                          <Button
                            key={page}
                            variant={
                              currentPage === page ? "default" : "outline"
                            }
                            size="sm"
                            onClick={() => setCurrentPage(page)}
                            className="w-8 h-8 p-0"
                          >
                            {page}
                          </Button>
                        ))}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          setCurrentPage((p) => Math.min(p + 1, totalPages))
                        }
                        disabled={currentPage === totalPages}
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>

        {/* Status Legend */}
      </div>
    </TooltipProvider>
  );
};

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
}

export const VisaPage: React.FC = () => {
  const [formData, setFormData] = useState<VisaFormData>({
    firstName: "",
    lastName: "",
    applicationType: "",
    nationality: "",
    passportNumber: "",
    passportExpiry: "",
    emiratesId: "",
    residenceAddress: "",
    emergencyContact: "",
    emergencyPhone: "",
  });

  const [applicationStatus] = useState<
    "draft" | "submitted" | "approved" | "rejected"
  >("submitted");
  const [appointmentLetter] = useState("visa_appointment_letter.pdf");
  const { user, token } = useSelector((state: RootState) => state.customerAuth);
  const [applicationId, setApplicationId] = useState<string | null>(null);
  const [visaSubSteps, setVisaSubSteps] = useState<VisaSubStep[]>([]);
  const [loading, setLoading] = useState(true);
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

  // Fetch applicationId and visaSubSteps
  useEffect(() => {
    const fetchApplicationAndVisaSubSteps = async () => {
      if (!user?.userId || !token) return;
      setLoading(true);
      try {
        // 1. Get applicationId from dashboard endpoint
        const dashboardRes = await axios.get(
          `${import.meta.env.VITE_BASE_URL}/api/dashboard/customer/${
            user.userId
          }`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        let appId = null;
        if (
          dashboardRes.data.application &&
          dashboardRes.data.application._id
        ) {
          appId = dashboardRes.data.application._id;
        } else if (dashboardRes.data.application?._id) {
          appId = dashboardRes.data.application._id;
        }
        setApplicationId(appId);
        if (!appId) {
          setVisaSubSteps([]);
          setLoading(false);
          return;
        }
        // 2. Fetch application details (including visaSubSteps)
        const appRes = await axios.get(
          `${import.meta.env.VITE_BASE_URL}/api/application/${appId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const visaSubStepsArr = appRes.data.data.visaSubSteps || [];
        setVisaSubSteps(visaSubStepsArr);
      } catch (err) {
        setVisaSubSteps([]);
        toast({
          title: "Error",
          description: "Failed to load visa application data.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    fetchApplicationAndVisaSubSteps();
  }, [user, token, toast]);

  // Fetch submitted visa applications for this customer
  useEffect(() => {
    const fetchSubmittedVisas = async () => {
      if (!token) return;
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_BASE_URL}/api/application/visa`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        // Filter to only this customer
        setSubmittedVisas(
          res.data.data.filter((v: any) => v.customer?._id === user?.userId)
        );
      } catch (err) {
        setSubmittedVisas([]);
      }
    };
    fetchSubmittedVisas();
  }, [token, user]);

  const handleInputChange = (field: keyof VisaFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Visa Application Submitted",
      description: "Your visa application has been submitted for review.",
    });
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
      // 1. Upload all required documents
      const allDocIds: string[] = [];
      for (const doc of requiredDocs) {
        const formDataDoc = new FormData();
        formDataDoc.append("file", doc.file!);
        formDataDoc.append("documentType", doc.type);
        formDataDoc.append("documentName", doc.file!.name);
        formDataDoc.append("linkedTo", user?.userId || "");
        formDataDoc.append("linkedModel", "Customer");
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
      // 2. Prepare member object with required fields
      const member = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        passportNumber: formData.passportNumber,
        nationality: formData.nationality,
        dob: "", // Not collected in form, use empty string
        emiratesId: formData.emiratesId,
      };
      // 3. Submit visa application (no applicationId required)
      const visaRes = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/api/application/visa`,
        {
          customerId: user.userId,
          members: [member],
          documentIds: allDocIds,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast({
        title: "Visa Application Submitted",
        description: "Your visa application has been submitted.",
      });
      setSubmittedVisas((prev) => [visaRes.data.data, ...prev]);
      setFormData({
        firstName: "",
        lastName: "",
        applicationType: "",
        nationality: "",
        passportNumber: "",
        passportExpiry: "",
        emiratesId: "",
        residenceAddress: "",
        emergencyContact: "",
        emergencyPhone: "",
      });
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

  // Calculate overall progress
  const totalSubsteps = visaSubSteps.reduce((acc, member) => acc + 4, 0);
  const approvedSubsteps = visaSubSteps.reduce((acc, member) => {
    return (
      acc +
      [
        member.medical,
        member.residenceVisa,
        member.emiratesIdSoft,
        member.emiratesIdHard,
      ].filter((step) => step.status === "Approved").length
    );
  }, 0);

  // Legend for status colors
  const statusLegend = [
    {
      color: "bg-green-100 text-green-800",
      label: "Approved",
      icon: <CheckCircle className="h-4 w-4 mr-1" />,
    },
    {
      color: "bg-yellow-100 text-yellow-800",
      label: "Submitted/Other",
      icon: <Clock className="h-4 w-4 mr-1" />,
    },
    {
      color: "bg-gray-100 text-gray-800",
      label: "Not Started",
      icon: <HelpCircle className="h-4 w-4 mr-1" />,
    },
    {
      color: "bg-red-100 text-red-800",
      label: "Declined",
      icon: <XCircle className="h-4 w-4 mr-1" />,
    },
    {
      color: "bg-blue-100 text-blue-800",
      label: "In Progress",
      icon: <Info className="h-4 w-4 mr-1" />,
    },
  ];

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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    value={formData.firstName}
                    onChange={(e) =>
                      handleInputChange("firstName", e.target.value)
                    }
                    placeholder="Enter first name"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    value={formData.lastName}
                    onChange={(e) =>
                      handleInputChange("lastName", e.target.value)
                    }
                    placeholder="Enter last name"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="applicationType">Application Type</Label>
                  <Select
                    value={formData.applicationType}
                    onValueChange={(value) =>
                      handleInputChange("applicationType", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select visa type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="investor">Investor Visa</SelectItem>
                      <SelectItem value="employee">Employee Visa</SelectItem>
                      <SelectItem value="partner">Partner Visa</SelectItem>
                      <SelectItem value="family">Family Visa</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="nationality">Nationality</Label>
                  <Input
                    id="nationality"
                    value={formData.nationality}
                    onChange={(e) =>
                      handleInputChange("nationality", e.target.value)
                    }
                    placeholder="Enter your nationality"
                  />
                </div>

                <div>
                  <Label htmlFor="passportNumber">Passport Number</Label>
                  <Input
                    id="passportNumber"
                    value={formData.passportNumber}
                    onChange={(e) =>
                      handleInputChange("passportNumber", e.target.value)
                    }
                    placeholder="Enter passport number"
                  />
                </div>

                <div>
                  <Label htmlFor="passportExpiry">Passport Expiry Date</Label>
                  <Input
                    id="passportExpiry"
                    type="date"
                    value={formData.passportExpiry}
                    onChange={(e) =>
                      handleInputChange("passportExpiry", e.target.value)
                    }
                  />
                </div>

                <div className="md:col-span-2">
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

                <div className="md:col-span-2">
                  <Label htmlFor="residenceAddress">
                    UAE Residence Address
                  </Label>
                  <Textarea
                    id="residenceAddress"
                    value={formData.residenceAddress}
                    onChange={(e) =>
                      handleInputChange("residenceAddress", e.target.value)
                    }
                    placeholder="Enter your UAE residence address"
                    rows={3}
                  />
                </div>

                <div>
                  <Label htmlFor="emergencyContact">
                    Emergency Contact Name
                  </Label>
                  <Input
                    id="emergencyContact"
                    value={formData.emergencyContact}
                    onChange={(e) =>
                      handleInputChange("emergencyContact", e.target.value)
                    }
                    placeholder="Enter emergency contact name"
                  />
                </div>

                <div>
                  <Label htmlFor="emergencyPhone">
                    Emergency Contact Phone
                  </Label>
                  <Input
                    id="emergencyPhone"
                    value={formData.emergencyPhone}
                    onChange={(e) =>
                      handleInputChange("emergencyPhone", e.target.value)
                    }
                    placeholder="+971 50 123 4567"
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

        {/* List of Submitted Visa Applications */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Your Submitted Visa Applications</CardTitle>
            <CardDescription>
              Track status and details of your submitted visa applications.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {submittedVisas.length === 0 ? (
              <div className="text-muted-foreground">
                No visa applications submitted yet.
              </div>
            ) : (
              <div className="space-y-4">
                {submittedVisas.map((visa) => (
                  <div
                    key={visa._id}
                    className="border rounded-lg p-4 bg-gray-50"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <Badge
                        className={
                          visa.status === "Approved"
                            ? "bg-green-100 text-green-800"
                            : visa.status === "Rejected"
                            ? "bg-red-100 text-red-800"
                            : visa.status === "In Review"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-yellow-100 text-yellow-800"
                        }
                      >
                        {visa.status}
                      </Badge>
                      <span className="text-xs text-muted-foreground ml-2">
                        Submitted {new Date(visa.createdAt).toLocaleString()}
                      </span>
                    </div>
                    <div className="font-semibold mb-1">Members:</div>
                    <ul className="list-disc ml-6">
                      {visa.members.map((m, idx) => (
                        <li key={idx}>
                          {m.firstName} {m.lastName} ({m.passportNumber},{" "}
                          {m.nationality})
                        </li>
                      ))}
                    </ul>
                    <div className="font-semibold mt-2 mb-1">Documents:</div>
                    <ul className="list-disc ml-6">
                      {visa.documents.map((doc, idx) => (
                        <li key={idx}>
                          {doc.documentName || doc.fileName || doc._id}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-primary flex items-center gap-2">
              <User className="h-7 w-7 text-primary" /> Visa Application
            </h1>
            <p className="text-muted-foreground mt-1">
              Track your UAE residence visa progress and substeps for all
              applicants.
            </p>
          </div>
          {totalSubsteps > 0 && (
            <div className="flex flex-col items-end">
              <span className="text-sm text-muted-foreground">
                Overall Progress
              </span>
              <div className="flex items-center gap-2 mt-1">
                <span className="font-semibold text-lg text-primary">
                  {approvedSubsteps} / {totalSubsteps}
                </span>
                <span className="text-xs text-muted-foreground">
                  substeps approved
                </span>
              </div>
              <div className="w-40 h-2 bg-gray-200 rounded mt-1">
                <div
                  className="h-2 rounded bg-gradient-to-r from-primary to-secondary transition-all duration-500"
                  style={{
                    width: `${(approvedSubsteps / totalSubsteps) * 100}%`,
                  }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Status Legend */}
        <div className="flex flex-wrap gap-3 items-center mb-2">
          {statusLegend.map((item) => (
            <span
              key={item.label}
              className={`inline-flex items-center px-2 py-1 rounded ${item.color} text-xs font-medium`}
            >
              {item.icon}
              {item.label}
            </span>
          ))}
        </div>

        {/* Visa Substeps Section */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-lg">Visa Application Progress</CardTitle>
            <CardDescription>
              Track the status of each visa substep for all members.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center text-muted-foreground py-8">
                Loading visa substeps...
              </div>
            ) : visaSubSteps.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                No visa applicants or substeps found.
              </div>
            ) : (
              <div className="space-y-8">
                {visaSubSteps.map((member, idx) => (
                  <div
                    key={member.memberId?._id || idx}
                    className="border rounded-lg p-4 bg-gray-50"
                  >
                    <div className="mb-3 flex items-center gap-2 font-semibold text-primary">
                      <User className="h-5 w-5" />
                      {member.memberId?.firstName || "N/A"}{" "}
                      {member.memberId?.lastName || ""}{" "}
                      <span className="text-xs text-muted-foreground ml-2">
                        ({member.memberId?.email || member.memberId?._id})
                      </span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {[
                        member.medical,
                        member.residenceVisa,
                        member.emiratesIdSoft,
                        member.emiratesIdHard,
                      ].map((step, i) => (
                        <Tooltip key={i}>
                          <TooltipTrigger asChild>
                            <div className="flex items-center space-x-3 p-3 border rounded bg-white hover:shadow transition-all cursor-default">
                              <span className="font-medium w-44">
                                {step.stepName}
                              </span>
                              {getStatusBadge(step.status)}
                              <span className="text-xs text-muted-foreground ml-2">
                                {step.updatedAt
                                  ? new Date(step.updatedAt).toLocaleString()
                                  : ""}
                              </span>
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>
                            <span>Status: {step.status}</span>
                            {step.updatedAt && (
                              <div className="text-xs text-muted-foreground mt-1">
                                Last updated:{" "}
                                {new Date(step.updatedAt).toLocaleString()}
                              </div>
                            )}
                          </TooltipContent>
                        </Tooltip>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </TooltipProvider>
  );
};

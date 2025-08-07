import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { Progress } from "@/components/ui/progress";
import {
  FileText,
  Upload,
  MessageSquare,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  User,
  Building,
  CreditCard,
  FileCheck,
  Calendar,
  Shield,
  Home,
  UserCheck,
  Banknote,
  Building2,
  StickyNote,
  Plus,
  Trash2,
  Edit3,
} from "lucide-react";
import { NotesModule } from "@/components/common/NotesModule";
import { mockApplications } from "@/lib/mock-data";
import { useSelector } from "react-redux";
import { RootState } from "@/app/store";
import api from "@/lib/api";
import {
  ApplicationInfoForm,
  CompanyInfoForm,
  CustomerInfoForm,
  EditSectionModal,
  PaymentDetailsForm,
  ShareholderInfoForm,
} from "./EditSectionModal";
import axios from "axios";

interface WorkflowStep {
  id: string;
  title: string;
  icon: React.ReactNode;
  status: "not-started" | "submitted" | "awaiting" | "approved" | "declined";
  internalNotes: string;
  customerNotes: string;
  documents: any[];
  substeps?: WorkflowStep[];
}

const statusColors = {
  "not-started": "bg-gray-500",
  submitted: "bg-blue-500",
  awaiting: "bg-yellow-500",
  approved: "bg-green-500",
  declined: "bg-red-500",
};

const statusIcons = {
  "not-started": <Clock className="h-4 w-4" />,
  submitted: <FileCheck className="h-4 w-4" />,
  awaiting: <AlertCircle className="h-4 w-4" />,
  approved: <CheckCircle className="h-4 w-4" />,
  declined: <XCircle className="h-4 w-4" />,
};

export const ApplicationDetailsPage: React.FC = () => {
  const { id } = useParams();
  const { user, token } = useSelector((state: RootState) => state.customerAuth);
  const [activeTab, setActiveTab] = useState("workflow");
  const [editingField, setEditingField] = useState<string | null>(null);

  const [applicationData, setApplicationData] = useState<any>(null);

  // Mock application data - in real app, fetch by ID
  const application = mockApplications[0];

  console.log("Application ID from params:", id);

  // Fetch application by ID
  useEffect(() => {
    if (id) {
      const fetchApplication = async () => {
        try {
          const response = await axios.get(
            `${import.meta.env.VITE_BASE_URL}/api/application/${id}`,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );
          console.log("Fetched application:", response.data.data);
          setApplicationData(response.data.data);
        } catch (error) {
          console.error("Error fetching application:", error.message);
        }
      };

      fetchApplication();
    }
  }, [id]);

  // Update applicationDetails when API data is fetched
  useEffect(() => {
    if (applicationData) {
      setApplicationDetails({
        customerName:
          `${applicationData.customer?.firstName || ""} ${
            applicationData.customer?.lastName || ""
          }`.trim() || "N/A",
        applicationType: applicationData.applicationType || "N/A",
        emirate: applicationData.emirate || "N/A",
        legalForm: applicationData.legalForm || "N/A",
        proposedCompanyNames: applicationData.proposedCompanyNamesEN || [],
        officeRequirement: applicationData.officeRequired
          ? "Required"
          : "Not Required",
        officeType: applicationData.officeType || "N/A",
        applicationNotes: applicationData.applicationNotes || "",
        assignedAgent: applicationData.assignedAgent?.fullName || "N/A",
        totalAgreedCost: applicationData.totalAgreedCost || 0,
        paymentEntries:
          applicationData.paymentEntries?.map((payment) => ({
            method: payment.paymentMethod || "N/A",
            amount: payment.amountPaid || 0,
            date: payment.paymentDate
              ? new Date(payment.paymentDate).toISOString().split("T")[0]
              : "",
            reference: payment.transactionRefNo || "",
            status: payment.paymentStatus || "Pending",
            receipt: payment.receiptUpload || null,
            notes: payment.additionalNotes || "",
          })) || [],
        shareholders: applicationData.shareholderDetails
          ? [applicationData.shareholderDetails]
          : [],
      });
    }
  }, [applicationData]);

  // Update workflow steps when API data is fetched
  useEffect(() => {
    if (applicationData?.steps) {
      const getStepIcon = (stepName: string) => {
        const stepNameLower = stepName.toLowerCase();
        if (
          stepNameLower.includes("kyc") ||
          stepNameLower.includes("background")
        )
          return <Shield className="h-5 w-5" />;
        if (
          stepNameLower.includes("office") ||
          stepNameLower.includes("lease") ||
          stepNameLower.includes("flexi")
        )
          return <Home className="h-5 w-5" />;
        if (
          stepNameLower.includes("trade") ||
          stepNameLower.includes("license") ||
          stepNameLower.includes("approval")
        )
          return <FileCheck className="h-5 w-5" />;
        if (
          stepNameLower.includes("establishment") ||
          stepNameLower.includes("visa allocation")
        )
          return <Building2 className="h-5 w-5" />;
        if (
          stepNameLower.includes("visa") &&
          !stepNameLower.includes("allocation")
        )
          return <UserCheck className="h-5 w-5" />;
        if (
          stepNameLower.includes("medical") ||
          stepNameLower.includes("emirates")
        )
          return <Calendar className="h-5 w-5" />;
        if (stepNameLower.includes("tax") || stepNameLower.includes("vat"))
          return <Banknote className="h-5 w-5" />;
        if (stepNameLower.includes("bank") || stepNameLower.includes("account"))
          return <Building className="h-5 w-5" />;
        if (
          stepNameLower.includes("chamber") ||
          stepNameLower.includes("commerce")
        )
          return <Building2 className="h-5 w-5" />;
        return <FileText className="h-5 w-5" />;
      };

      const mapStatus = (status: string) => {
        switch (status) {
          case "Approved":
            return "approved";
          case "Submitted for Review":
            return "submitted";
          case "Awaiting Response":
            return "awaiting";
          case "Declined":
            return "declined";
          case "Not Started":
          default:
            return "not-started";
        }
      };

      const steps = applicationData.steps.map((step, index) => ({
        id: step._id || `step-${index}`,
        title: step.stepName,
        icon: getStepIcon(step.stepName),
        status: mapStatus(step.status) as WorkflowStep["status"],
        internalNotes: "",
        customerNotes: "",
        documents: [],
      }));

      setWorkflowSteps(steps);
    }
  }, [applicationData]);

  // Application details state - will be populated from API data
  const [applicationDetails, setApplicationDetails] = useState({
    customerName: "Loading...",
    applicationType: "Loading...",
    emirate: "Loading...",
    legalForm: "Loading...",
    proposedCompanyNames: [],
    officeRequirement: "Loading...",
    officeType: "Loading...",
    applicationNotes: "",
    assignedAgent: "Loading...",
    totalAgreedCost: 0,
    paymentEntries: [],
    shareholders: [],
  });

  const [workflowSteps, setWorkflowSteps] = useState<WorkflowStep[]>([]);

  const getOverallProgress = () => {
    const totalSteps = workflowSteps.length;
    const completedSteps = workflowSteps.filter(
      (step) => step.status === "approved"
    ).length;
    return Math.round((completedSteps / totalSteps) * 100);
  };

  const updateStepStatus = (
    stepId: string,
    newStatus: WorkflowStep["status"]
  ) => {
    setWorkflowSteps((prev) =>
      prev.map((step) =>
        step.id === stepId ? { ...step, status: newStatus } : step
      )
    );
  };

  const updateStepNotes = (
    stepId: string,
    field: "internalNotes" | "customerNotes",
    value: string
  ) => {
    setWorkflowSteps((prev) =>
      prev.map((step) =>
        step.id === stepId ? { ...step, [field]: value } : step
      )
    );
  };

  const getStepState = (stepIndex: number) => {
    const completedSteps = workflowSteps.filter(
      (step) => step.status === "approved"
    ).length;
    if (stepIndex < completedSteps) return "completed";
    if (stepIndex === completedSteps) return "active";
    return "upcoming";
  };

  const renderWorkflowStep = (
    step: WorkflowStep,
    stepIndex: number,
    isSubstep = false
  ) => {
    const stepState = getStepState(stepIndex);
    const isEditable =
      stepState === "active" &&
      (user?.role === "manager" || user?.role === "agent");

    const getStepColor = () => {
      if (stepState === "completed") return "bg-green-500 border-green-200";
      if (stepState === "active") return "bg-blue-500 border-blue-200";
      return "bg-gray-400 border-gray-200";
    };

    return (
      <div
        key={step.id}
        className={`relative ${isSubstep ? "ml-12 mt-4" : ""}`}
      >
        {/* Timeline connector */}
        {!isSubstep && stepIndex < workflowSteps.length - 1 && (
          <div className="absolute left-6 top-16 w-0.5 h-12 bg-gray-300"></div>
        )}

        <Card
          className={`border-l-4 ${
            stepState === "completed"
              ? "border-l-green-500 bg-green-50"
              : stepState === "active"
              ? "border-l-blue-500 bg-blue-50"
              : "border-l-gray-400 bg-gray-50"
          }`}
        >
          <CardHeader className="pb-3">
            <div className="flex items-center gap-4">
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center ${getStepColor()} text-white shadow-lg`}
              >
                {step.icon}
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-lg">{step.title}</h3>
                <div className="flex items-center gap-2 mt-1">
                  {statusIcons[step.status]}
                  <Badge
                    variant={
                      step.status === "approved" ? "default" : "secondary"
                    }
                  >
                    {step.status.replace("-", " ").toUpperCase()}
                  </Badge>
                  {isEditable && (
                    <Select
                      value={step.status}
                      onValueChange={(value) =>
                        updateStepStatus(
                          step.id,
                          value as WorkflowStep["status"]
                        )
                      }
                    >
                      <SelectTrigger className="w-[180px] ml-4">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="not-started">Not Started</SelectItem>
                        <SelectItem value="submitted">
                          Submitted for Review
                        </SelectItem>
                        <SelectItem value="awaiting">
                          Awaiting Response
                        </SelectItem>
                        <SelectItem value="approved">Approved</SelectItem>
                        <SelectItem value="declined">Declined</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                </div>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* Step Content Based on State */}
            {stepState === "upcoming" && (
              <div className="p-4 bg-gray-100 rounded-lg">
                <h4 className="font-medium text-gray-700 mb-2">
                  Step Description
                </h4>
                <p className="text-sm text-gray-600">
                  This step will become available once the previous step is
                  completed. Required documentation and processes will be
                  outlined here.
                </p>
              </div>
            )}

            {(stepState === "active" || stepState === "completed") && (
              <>
                {/* Document Upload */}
                <div className="space-y-3">
                  <h4 className="font-medium">Documents</h4>
                  {stepState === "active" && (
                    <div className="border-2 border-dashed border-blue-300 rounded-lg p-4 text-center">
                      <Upload className="h-8 w-8 mx-auto text-blue-400 mb-2" />
                      <p className="text-sm text-gray-600 mb-2">
                        Upload documents for this step
                      </p>
                      <Button variant="outline" size="sm">
                        <Upload className="h-4 w-4 mr-2" />
                        Choose Files
                      </Button>
                    </div>
                  )}

                  {/* Uploaded documents */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <FileText className="h-4 w-4" />
                        <span className="text-sm">Passport Copy.pdf</span>
                      </div>
                      <Badge variant="default">Verified</Badge>
                    </div>
                  </div>
                </div>

                {/* Notes */}
                {(step.internalNotes ||
                  step.customerNotes ||
                  stepState === "active") && (
                  <div className="space-y-3">
                    <h4 className="font-medium">Notes</h4>
                    {stepState === "active" &&
                      (user?.role === "manager" || user?.role === "agent") && (
                        <Textarea
                          value={step.internalNotes}
                          onChange={(e) =>
                            updateStepNotes(
                              step.id,
                              "internalNotes",
                              e.target.value
                            )
                          }
                          placeholder="Add notes for this step..."
                          className="min-h-[60px]"
                        />
                      )}
                    {stepState === "completed" && step.internalNotes && (
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <p className="text-sm">{step.internalNotes}</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Change History */}
                <div className="space-y-2">
                  <h4 className="font-medium text-sm">Change History</h4>
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    <div className="p-2 bg-gray-50 rounded text-xs">
                      <div className="flex justify-between mb-1">
                        <span className="font-medium">Agent Smith</span>
                        <span className="text-gray-500">2 hours ago</span>
                      </div>
                      <p>Status updated to {step.status}</p>
                    </div>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Substeps */}
        {step.substeps && stepState !== "upcoming" && (
          <div className="mt-4 space-y-4">
            {step.substeps.map((substep, subIndex) =>
              renderWorkflowStep(substep, stepIndex + subIndex + 1, true)
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Application Number
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {applicationData?.applicationId || "N/A"}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Overall Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Badge variant="default">
                {applicationData?.status || "N/A"}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Assigned Agent
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <User className="h-4 w-4" />
              <span className="font-semibold">
                {applicationData?.assignedAgent?.fullName || "Not assigned"}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Application Type
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Building className="h-4 w-4" />
              <span className="font-semibold">
                {applicationData?.applicationType || "N/A"}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Payment Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              <div className="flex-1">
                <Progress
                  value={
                    applicationData?.paymentEntries?.length > 0
                      ? (applicationData.paymentEntries.reduce(
                          (sum, payment) => sum + (payment.amountPaid || 0),
                          0
                        ) /
                          (applicationData.totalAgreedCost || 1)) *
                        100
                      : 0
                  }
                  className="mb-1"
                />
                <span className="text-sm text-gray-600">
                  $
                  {applicationData?.paymentEntries?.reduce(
                    (sum, payment) => sum + (payment.amountPaid || 0),
                    0
                  ) || 0}{" "}
                  / ${applicationData?.totalAgreedCost || "N/A"}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content with Accordions */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Panel - Application Details Accordion */}
        <div className="space-y-4">
          <Accordion
            type="single"
            collapsible
            className="w-full"
            defaultValue="application-details"
          >
            <AccordionItem value="application-details">
              <AccordionTrigger className="text-lg font-semibold">
                <div className="flex items-center gap-2">
                  <Edit3 className="h-5 w-5" />
                  Application Details
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-4">
                  <Accordion type="multiple" className="space-y-2">
                    {/* Application Info */}
                    <AccordionItem value="application-info">
                      <AccordionTrigger className="flex items-center justify-between hover:no-underline">
                        <div className="flex items-center gap-2">
                          <Building className="h-4 w-4" />
                          <span>Application Info</span>
                        </div>
                        <EditSectionModal
                          title="Application Info"
                          trigger={
                            <div
                              className="h-8 w-8 p-0 flex items-center justify-center hover:bg-gray-100 rounded cursor-pointer"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <Edit3 className="h-4 w-4" />
                            </div>
                          }
                        >
                          <ApplicationInfoForm
                            applicationDetails={applicationDetails}
                            setApplicationDetails={setApplicationDetails}
                          />
                        </EditSectionModal>
                      </AccordionTrigger>
                      <AccordionContent className="space-y-2 text-sm">
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <span className="text-muted-foreground">Type:</span>{" "}
                            {applicationData?.applicationType || "N/A"}
                          </div>
                          <div>
                            <span className="text-muted-foreground">
                              Emirate:
                            </span>{" "}
                            {applicationData?.emirate || "N/A"}
                          </div>
                          <div>
                            <span className="text-muted-foreground">
                              Legal Form:
                            </span>{" "}
                            {applicationData?.legalForm || "N/A"}
                          </div>
                          <div>
                            <span className="text-muted-foreground">
                              Agent:
                            </span>{" "}
                            {applicationData?.assignedAgent?.fullName || "N/A"}
                          </div>
                        </div>
                        {applicationDetails.applicationNotes && (
                          <div className="mt-2 p-2 bg-gray-50 rounded text-xs">
                            <span className="text-muted-foreground">
                              Notes:
                            </span>{" "}
                            {applicationDetails.applicationNotes}
                          </div>
                        )}
                      </AccordionContent>
                    </AccordionItem>

                    {/* Customer Info */}
                    <AccordionItem value="customer-info">
                      <AccordionTrigger className="flex items-center justify-between hover:no-underline">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4" />
                          <span>Customer Info</span>
                        </div>
                        <EditSectionModal
                          title="Customer Info"
                          trigger={
                            <div
                              className="h-8 w-8 p-0 flex items-center justify-center hover:bg-gray-100 rounded cursor-pointer"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <Edit3 className="h-4 w-4" />
                            </div>
                          }
                        >
                          <CustomerInfoForm
                            applicationDetails={applicationDetails}
                            setApplicationDetails={setApplicationDetails}
                          />
                        </EditSectionModal>
                      </AccordionTrigger>
                      <AccordionContent className="space-y-4 text-sm">
                        {/* Basic Information Section */}
                        <div className="bg-gray-50 rounded-lg p-4">
                          <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                            <User className="h-4 w-4" />
                            Basic Information
                          </h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div className="flex flex-col">
                              <span className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                                Customer Name
                              </span>
                              <span className="text-sm font-medium text-gray-900">
                                {applicationData?.customer?.firstName &&
                                applicationData?.customer?.lastName
                                  ? `${applicationData.customer.firstName} ${applicationData.customer.lastName}`
                                  : "N/A"}
                              </span>
                            </div>
                            <div className="flex flex-col">
                              <span className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                                Application Type
                              </span>
                              <span className="text-sm font-medium text-gray-900">
                                {applicationData?.applicationType || "N/A"}
                              </span>
                            </div>
                            <div className="flex flex-col">
                              <span className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                                Emirate
                              </span>
                              <span className="text-sm font-medium text-gray-900">
                                {applicationData?.emirate || "N/A"}
                              </span>
                            </div>
                            <div className="flex flex-col">
                              <span className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                                Legal Form
                              </span>
                              <span className="text-sm font-medium text-gray-900">
                                {applicationData?.legalForm || "N/A"}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Company Information Section */}
                        <div className="bg-blue-50 rounded-lg p-4">
                          <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                            <Building2 className="h-4 w-4" />
                            Company Information
                          </h4>
                          <div className="space-y-3">
                            <div className="flex flex-col">
                              <span className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                                Proposed Company Names (EN)
                              </span>
                              <div className="bg-white rounded border p-2">
                                {applicationData?.proposedCompanyNamesEN
                                  ?.filter((name) => name)
                                  .map((name, index) => (
                                    <div
                                      key={index}
                                      className="flex items-center gap-2 text-sm"
                                    >
                                      <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                                      <span className="font-medium text-gray-900">
                                        {name}
                                      </span>
                                    </div>
                                  )) || (
                                  <span className="text-gray-500">N/A</span>
                                )}
                              </div>
                            </div>
                            <div className="flex flex-col">
                              <span className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                                Proposed Company Name (AR)
                              </span>
                              <div className="bg-white rounded border p-2">
                                <span className="text-sm font-medium text-gray-900">
                                  {applicationData?.proposedCompanyNameAR ||
                                    "N/A"}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Business Details Section */}
                        <div className="bg-green-50 rounded-lg p-4">
                          <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                            <FileText className="h-4 w-4" />
                            Business Details
                          </h4>
                          <div className="space-y-3">
                            <div className="flex flex-col">
                              <span className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                                Business Activities
                              </span>
                              <div className="bg-white rounded border p-2">
                                {applicationData?.businessActivities
                                  ?.filter((activity) => activity)
                                  .map((activity, index) => (
                                    <div
                                      key={index}
                                      className="flex items-center gap-2 text-sm"
                                    >
                                      <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                                      <span className="font-medium text-gray-900">
                                        {activity}
                                      </span>
                                    </div>
                                  )) || (
                                  <span className="text-gray-500">N/A</span>
                                )}
                              </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              <div className="flex flex-col">
                                <span className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                                  Number of Shareholders
                                </span>
                                <div className="bg-white rounded border p-2">
                                  <span className="text-sm font-medium text-gray-900">
                                    {applicationData?.shareholderDetails
                                      ? "1"
                                      : "N/A"}
                                  </span>
                                </div>
                              </div>
                              <div className="flex flex-col">
                                <span className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                                  Basic Investment
                                </span>
                                <div className="bg-white rounded border p-2">
                                  <span className="text-sm font-medium text-gray-900">
                                    {applicationData?.totalAgreedCost
                                      ? `$${applicationData.totalAgreedCost.toLocaleString()}`
                                      : "N/A"}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Office Information Section */}
                        <div className="bg-purple-50 rounded-lg p-4">
                          <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                            <Home className="h-4 w-4" />
                            Office Information
                          </h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div className="flex flex-col">
                              <span className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                                Office Requirement
                              </span>
                              <div className="bg-white rounded border p-2">
                                <span className="text-sm font-medium text-gray-900">
                                  {applicationData?.officeRequired !== undefined
                                    ? applicationData.officeRequired
                                      ? "Required"
                                      : "Not Required"
                                    : "N/A"}
                                </span>
                              </div>
                            </div>
                            <div className="flex flex-col">
                              <span className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                                Office Type
                              </span>
                              <div className="bg-white rounded border p-2">
                                <span className="text-sm font-medium text-gray-900">
                                  {applicationData?.officeType || "N/A"}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </AccordionContent>
                    </AccordionItem>

                    {/* Company Info */}
                    <AccordionItem value="company-info">
                      <AccordionTrigger className="flex items-center justify-between hover:no-underline">
                        <div className="flex items-center gap-2">
                          <Building2 className="h-4 w-4" />
                          <span>Company Info</span>
                        </div>
                        <EditSectionModal
                          title="Company Info"
                          trigger={
                            <div
                              className="h-8 w-8 p-0 flex items-center justify-center hover:bg-gray-100 rounded cursor-pointer"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <Edit3 className="h-4 w-4" />
                            </div>
                          }
                        >
                          <CompanyInfoForm
                            applicationDetails={applicationDetails}
                            setApplicationDetails={setApplicationDetails}
                          />
                        </EditSectionModal>
                      </AccordionTrigger>
                      <AccordionContent className="space-y-2 text-sm">
                        <div>
                          <span className="text-muted-foreground">
                            Proposed Names:
                          </span>
                          <div className="ml-2 space-y-1">
                            {applicationData?.proposedCompanyNamesEN
                              ?.filter((name) => name)
                              .map((name, index) => (
                                <div key={index}>• {name}</div>
                              )) || <div>N/A</div>}
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <span className="text-muted-foreground">
                              Office Req:
                            </span>{" "}
                            {applicationData?.officeRequired !== undefined
                              ? applicationData.officeRequired
                                ? "Required"
                                : "Not Required"
                              : "N/A"}
                          </div>
                          <div>
                            <span className="text-muted-foreground">
                              Office Type:
                            </span>{" "}
                            {applicationData?.officeType || "N/A"}
                          </div>
                        </div>
                      </AccordionContent>
                    </AccordionItem>

                    {/* Sponsor Info */}
                    <AccordionItem value="sponsor-info">
                      <AccordionTrigger className="flex items-center justify-between hover:no-underline">
                        <div className="flex items-center gap-2">
                          <Shield className="h-4 w-4" />
                          <span>Sponsor Info</span>
                        </div>
                        <EditSectionModal
                          title="Sponsor Info"
                          trigger={
                            <div
                              className="h-8 w-8 p-0 flex items-center justify-center hover:bg-gray-100 rounded cursor-pointer"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <Edit3 className="h-4 w-4" />
                            </div>
                          }
                        >
                          <div className="space-y-4">
                            <p className="text-sm text-muted-foreground">
                              Sponsor information will be added here.
                            </p>
                          </div>
                        </EditSectionModal>
                      </AccordionTrigger>
                      <AccordionContent className="space-y-2 text-sm">
                        <div className="grid grid-cols-1 gap-3">
                          <div className="flex justify-between items-center">
                            <span className="font-medium text-gray-700">
                              Sponsor Required:
                            </span>
                            <span className="text-gray-900">
                              {applicationData?.sponsorDetails
                                ?.sponsorRequired || "N/A"}
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="font-medium text-gray-700">
                              Sponsor Name:
                            </span>
                            <span className="text-gray-900">
                              {applicationData?.sponsorDetails?.sponsorName ||
                                "N/A"}
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="font-medium text-gray-700">
                              Sponsor Nationality:
                            </span>
                            <span className="text-gray-900">
                              {applicationData?.sponsorDetails
                                ?.sponsorNationality || "N/A"}
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="font-medium text-gray-700">
                              Sponsor Passport Copy:
                            </span>
                            <span className="text-gray-900">
                              {applicationData?.sponsorDetails
                                ?.sponsorPassportCopy ? (
                                <span className="text-green-600">
                                  ✓ Uploaded
                                </span>
                              ) : (
                                "N/A"
                              )}
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="font-medium text-gray-700">
                              Sponsor Emirates ID:
                            </span>
                            <span className="text-gray-900">
                              {applicationData?.sponsorDetails
                                ?.sponsorEmiratesId || "N/A"}
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="font-medium text-gray-700">
                              Sponsor Contact Number:
                            </span>
                            <span className="text-gray-900">
                              {applicationData?.sponsorDetails
                                ?.sponsorContactNumber || "N/A"}
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="font-medium text-gray-700">
                              Sponsor Address:
                            </span>
                            <span className="text-gray-900">
                              {applicationData?.sponsorDetails
                                ?.sponsorAddress || "N/A"}
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="font-medium text-gray-700">
                              Sponsor Relationship:
                            </span>
                            <span className="text-gray-900">
                              {applicationData?.sponsorDetails
                                ?.sponsorRelationship || "N/A"}
                            </span>
                          </div>
                        </div>
                      </AccordionContent>
                    </AccordionItem>

                    {/* Share Holder Info */}
                    <AccordionItem value="shareholder-info">
                      <AccordionTrigger className="flex items-center justify-between hover:no-underline">
                        <div className="flex items-center gap-2">
                          <UserCheck className="h-4 w-4" />
                          <span>Share Holder Info</span>
                        </div>
                        <EditSectionModal
                          title="Share Holder Info"
                          trigger={
                            <div
                              className="h-8 w-8 p-0 flex items-center justify-center hover:bg-gray-100 rounded cursor-pointer"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <Edit3 className="h-4 w-4" />
                            </div>
                          }
                        >
                          <ShareholderInfoForm
                            applicationDetails={applicationDetails}
                            setApplicationDetails={setApplicationDetails}
                          />
                        </EditSectionModal>
                      </AccordionTrigger>
                      <AccordionContent className="space-y-2 text-sm">
                        {applicationData?.shareholderDetails ? (
                          <div className="grid grid-cols-1 gap-3">
                            <div className="flex justify-between items-center">
                              <span className="font-medium text-gray-700">
                                Passport Copy:
                              </span>
                              <span className="text-gray-900">
                                {applicationData.shareholderDetails
                                  .passportCopy ? (
                                  <span className="text-green-600">
                                    ✓ Uploaded
                                  </span>
                                ) : (
                                  "N/A"
                                )}
                              </span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="font-medium text-gray-700">
                                Emirates ID (if available):
                              </span>
                              <span className="text-gray-900">
                                {applicationData.shareholderDetails
                                  .emiratesId || "N/A"}
                              </span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="font-medium text-gray-700">
                                Visa Required:
                              </span>
                              <span className="text-gray-900">
                                {applicationData.shareholderDetails
                                  .visaRequired || "N/A"}
                              </span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="font-medium text-gray-700">
                                Visa Type:
                              </span>
                              <span className="text-gray-900">
                                {applicationData.shareholderDetails.visaType ||
                                  "N/A"}
                              </span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="font-medium text-gray-700">
                                Salary:
                              </span>
                              <span className="text-gray-900">
                                {applicationData.shareholderDetails.salary ||
                                  "N/A"}
                              </span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="font-medium text-gray-700">
                                Passport-sized Photo:
                              </span>
                              <span className="text-gray-900">
                                {applicationData.shareholderDetails
                                  .passportPhoto ? (
                                  <span className="text-green-600">
                                    ✓ Uploaded
                                  </span>
                                ) : (
                                  "N/A"
                                )}
                              </span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="font-medium text-gray-700">
                                NOC Letter (if employed):
                              </span>
                              <span className="text-gray-900">
                                {applicationData.shareholderDetails
                                  .nocLetter ? (
                                  <span className="text-green-600">
                                    ✓ Uploaded
                                  </span>
                                ) : (
                                  "N/A"
                                )}
                              </span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="font-medium text-gray-700">
                                Home Country Address:
                              </span>
                              <span className="text-gray-900">
                                {applicationData.shareholderDetails
                                  .homeCountryAddress || "N/A"}
                              </span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="font-medium text-gray-700">
                                UAE Mobile Number:
                              </span>
                              <span className="text-gray-900">
                                {applicationData.shareholderDetails
                                  .uaeMobileNumber || "N/A"}
                              </span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="font-medium text-gray-700">
                                Home Mobile Number:
                              </span>
                              <span className="text-gray-900">
                                {applicationData.shareholderDetails
                                  .homeMobileNumber || "N/A"}
                              </span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="font-medium text-gray-700">
                                Email Address:
                              </span>
                              <span className="text-gray-900">
                                {applicationData.shareholderDetails
                                  .emailAddress || "N/A"}
                              </span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="font-medium text-gray-700">
                                Nationality:
                              </span>
                              <span className="text-gray-900">
                                {applicationData.shareholderDetails
                                  .nationality || "N/A"}
                              </span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="font-medium text-gray-700">
                                Mother's Name:
                              </span>
                              <span className="text-gray-900">
                                {applicationData.shareholderDetails
                                  .mothersName || "N/A"}
                              </span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="font-medium text-gray-700">
                                Father's Name:
                              </span>
                              <span className="text-gray-900">
                                {applicationData.shareholderDetails
                                  .fathersName || "N/A"}
                              </span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="font-medium text-gray-700">
                                Source of Funds:
                              </span>
                              <span className="text-gray-900">
                                {applicationData.shareholderDetails
                                  .sourceOfFunds || "N/A"}
                              </span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="font-medium text-gray-700">
                                Shareholder Name:
                              </span>
                              <span className="text-gray-900">
                                {applicationData.shareholderDetails
                                  .shareholderName || "N/A"}
                              </span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="font-medium text-gray-700">
                                Shareholder Nationality:
                              </span>
                              <span className="text-gray-900">
                                {applicationData.shareholderDetails
                                  .shareholderNationality || "N/A"}
                              </span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="font-medium text-gray-700">
                                Shareholder Passport Copy:
                              </span>
                              <span className="text-gray-900">
                                {applicationData.shareholderDetails
                                  .shareholderPassportCopy ? (
                                  <span className="text-green-600">
                                    ✓ Uploaded
                                  </span>
                                ) : (
                                  "N/A"
                                )}
                              </span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="font-medium text-gray-700">
                                Ownership Percentage (%):
                              </span>
                              <span className="text-gray-900">
                                {applicationData.shareholderDetails
                                  .ownershipPercentage
                                  ? `${applicationData.shareholderDetails.ownershipPercentage}%`
                                  : "N/A"}
                              </span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="font-medium text-gray-700">
                                Designation:
                              </span>
                              <span className="text-gray-900">
                                {applicationData.shareholderDetails
                                  .designation || "N/A"}
                              </span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="font-medium text-gray-700">
                                Nature of Control:
                              </span>
                              <span className="text-gray-900">
                                {applicationData.shareholderDetails
                                  .natureOfControl || "N/A"}
                              </span>
                            </div>
                          </div>
                        ) : (
                          <div className="text-muted-foreground">N/A</div>
                        )}
                      </AccordionContent>
                    </AccordionItem>

                    {/* Uploaded Documents */}
                    <AccordionItem value="uploaded-documents">
                      <AccordionTrigger className="flex items-center justify-between hover:no-underline">
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4" />
                          <span>Uploaded Documents</span>
                        </div>
                        <EditSectionModal
                          title="Uploaded Documents"
                          trigger={
                            <div
                              className="h-8 w-8 p-0 flex items-center justify-center hover:bg-gray-100 rounded cursor-pointer"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <Edit3 className="h-4 w-4" />
                            </div>
                          }
                        >
                          <div className="space-y-4">
                            <p className="text-sm text-muted-foreground">
                              Document management interface will be added here.
                            </p>
                          </div>
                        </EditSectionModal>
                      </AccordionTrigger>
                      <AccordionContent className="space-y-2 text-sm">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between p-2 border rounded">
                            <div className="flex items-center gap-2">
                              <FileText className="h-4 w-4" />
                              <span>Passport Copy.pdf</span>
                            </div>
                            <Badge variant="default" className="text-xs">
                              Verified
                            </Badge>
                          </div>
                          <div className="flex items-center justify-between p-2 border rounded">
                            <div className="flex items-center gap-2">
                              <FileText className="h-4 w-4" />
                              <span>Emirates ID.pdf</span>
                            </div>
                            <Badge variant="secondary" className="text-xs">
                              Pending
                            </Badge>
                          </div>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>

        {/* Middle Panel - Workflow Timeline Accordion */}
        <div className="lg:col-span-2">
          <Accordion
            type="single"
            collapsible
            className="w-full"
            defaultValue="workflow-timeline"
          >
            <AccordionItem value="workflow-timeline">
              <AccordionTrigger className="text-lg font-semibold">
                <div className="flex items-center gap-2">
                  <FileCheck className="h-5 w-5" />
                  Application Workflow Timeline
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="text-sm text-gray-600 mb-4">
                  Follow the progress through each step of the application
                  process
                </div>
                <div className="space-y-8">
                  {workflowSteps.map((step, index) =>
                    renderWorkflowStep(step, index)
                  )}
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>

        {/* Right Panel - Payment Details Accordion */}
        <div className="space-y-6">
          <Accordion
            type="single"
            collapsible
            className="w-full"
            defaultValue="payment-details"
          >
            <AccordionItem value="payment-details">
              <AccordionTrigger className="text-lg font-semibold">
                <div className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Payment Details
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label className="text-sm text-muted-foreground">
                        Total Agreed Cost
                      </Label>
                      <div className="flex items-center gap-2">
                        <span className="text-sm">$</span>
                        <Input
                          type="number"
                          value={applicationData?.totalAgreedCost || ""}
                          readOnly
                          className="w-32"
                          placeholder="N/A"
                        />
                      </div>
                    </div>
                    <EditSectionModal
                      title="Payment Details"
                      trigger={
                        <div
                          className="h-8 w-8 p-0 flex items-center justify-center hover:bg-gray-100 rounded cursor-pointer"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Edit3 className="h-4 w-4" />
                        </div>
                      }
                    >
                      <PaymentDetailsForm
                        applicationDetails={applicationDetails}
                        setApplicationDetails={setApplicationDetails}
                      />
                    </EditSectionModal>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-medium">
                        Payment Entries
                      </Label>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          const newEntry = {
                            method: "Bank Transfer",
                            amount: 0,
                            date: new Date().toISOString().split("T")[0],
                            reference: "",
                            status: "Pending",
                            receipt: null,
                            notes: "",
                          };
                          setApplicationDetails((prev) => ({
                            ...prev,
                            paymentEntries: [...prev.paymentEntries, newEntry],
                          }));
                        }}
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Add
                      </Button>
                    </div>

                    {applicationData?.paymentEntries?.map((payment, index) => (
                      <Card key={index} className="border border-gray-200">
                        <CardContent className="p-3 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">
                              Payment {index + 1}
                            </span>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => {
                                const updatedEntries =
                                  applicationDetails.paymentEntries.filter(
                                    (_, i) => i !== index
                                  );
                                setApplicationDetails((prev) => ({
                                  ...prev,
                                  paymentEntries: updatedEntries,
                                }));
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>

                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <Label className="text-xs text-muted-foreground">
                                Method
                              </Label>
                              <Select
                                value={payment.paymentMethod || ""}
                                disabled
                              >
                                <SelectTrigger className="h-8">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="Bank Transfer">
                                    Bank Transfer
                                  </SelectItem>
                                  <SelectItem value="Credit Card">
                                    Credit Card
                                  </SelectItem>
                                  <SelectItem value="Cash">Cash</SelectItem>
                                  <SelectItem value="Cheque">Cheque</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>

                            <div>
                              <Label className="text-xs text-muted-foreground">
                                Amount
                              </Label>
                              <Input
                                type="number"
                                value={payment.amountPaid || ""}
                                readOnly
                                className="h-8"
                                placeholder="N/A"
                              />
                            </div>

                            <div>
                              <Label className="text-xs text-muted-foreground">
                                Date
                              </Label>
                              <Input
                                type="date"
                                value={
                                  payment.paymentDate
                                    ? new Date(payment.paymentDate)
                                        .toISOString()
                                        .split("T")[0]
                                    : ""
                                }
                                readOnly
                                className="h-8"
                              />
                            </div>

                            <div>
                              <Label className="text-xs text-muted-foreground">
                                Status
                              </Label>
                              <Select
                                value={payment.paymentStatus || ""}
                                disabled
                              >
                                <SelectTrigger className="h-8">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="Pending">
                                    Pending
                                  </SelectItem>
                                  <SelectItem value="Completed">
                                    Completed
                                  </SelectItem>
                                  <SelectItem value="Failed">Failed</SelectItem>
                                  <SelectItem value="Refunded">
                                    Refunded
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>

                          <div>
                            <Label className="text-xs text-muted-foreground">
                              Reference No.
                            </Label>
                            <Input
                              value={payment.transactionRefNo || ""}
                              readOnly
                              className="h-8"
                              placeholder="N/A"
                            />
                          </div>

                          <div>
                            <Label className="text-xs text-muted-foreground">
                              Receipt Upload
                            </Label>
                            {payment.receiptUpload ? (
                              <div className="border rounded p-2">
                                <div className="flex items-center gap-2">
                                  <FileText className="h-4 w-4 text-green-600" />
                                  <a
                                    href={payment.receiptUpload}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-xs text-blue-600 hover:underline"
                                  >
                                    View Receipt
                                  </a>
                                </div>
                              </div>
                            ) : (
                              <div className="border-2 border-dashed border-gray-300 rounded p-2 text-center">
                                <Upload className="h-4 w-4 mx-auto text-gray-400 mb-1" />
                                <p className="text-xs text-gray-500">N/A</p>
                              </div>
                            )}
                          </div>

                          <div>
                            <Label className="text-xs text-muted-foreground">
                              Notes
                            </Label>
                            <Textarea
                              value={payment.additionalNotes || ""}
                              readOnly
                              className="h-16 text-xs"
                              placeholder="N/A"
                            />
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </div>

      {/* Communication Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <StickyNote className="h-5 w-5" />
              Internal Notes Timeline
            </CardTitle>
            <div className="text-sm text-gray-600">
              Internal communication visible only to agents and managers
            </div>
          </CardHeader>
          <CardContent>
            {user?.role === "manager" || user?.role === "agent" ? (
              <div className="space-y-4">
                {/* Add new internal note */}
                <div className="space-y-2">
                  <Textarea
                    placeholder="Add internal note..."
                    className="min-h-[80px]"
                  />
                  <Button size="sm">Add Internal Note</Button>
                </div>

                {/* Internal notes timeline */}
                <div className="space-y-3 max-h-80 overflow-y-auto">
                  <div className="relative pl-8 pb-4">
                    <div className="absolute left-2 top-2 w-2 h-2 bg-blue-500 rounded-full"></div>
                    <div className="absolute left-3 top-6 w-0.5 h-full bg-gray-200"></div>
                    <div className="bg-gray-50 rounded-lg p-3">
                      <div className="flex justify-between items-start mb-2">
                        <span className="font-medium text-sm">
                          Manager Johnson
                        </span>
                        <span className="text-xs text-gray-500">
                          2 hours ago
                        </span>
                      </div>
                      <p className="text-sm text-gray-700">
                        Application approved for next step. All documents
                        verified successfully.
                      </p>
                    </div>
                  </div>

                  <div className="relative pl-8 pb-4">
                    <div className="absolute left-2 top-2 w-2 h-2 bg-green-500 rounded-full"></div>
                    <div className="absolute left-3 top-6 w-0.5 h-full bg-gray-200"></div>
                    <div className="bg-gray-50 rounded-lg p-3">
                      <div className="flex justify-between items-start mb-2">
                        <span className="font-medium text-sm">Agent Smith</span>
                        <span className="text-xs text-gray-500">1 day ago</span>
                      </div>
                      <p className="text-sm text-gray-700">
                        Initial KYC documents received and under review.
                      </p>
                    </div>
                  </div>

                  <div className="relative pl-8">
                    <div className="absolute left-2 top-2 w-2 h-2 bg-gray-400 rounded-full"></div>
                    <div className="bg-gray-50 rounded-lg p-3">
                      <div className="flex justify-between items-start mb-2">
                        <span className="font-medium text-sm">System</span>
                        <span className="text-xs text-gray-500">
                          3 days ago
                        </span>
                      </div>
                      <p className="text-sm text-gray-700">
                        Application created and assigned to Agent Smith.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-gray-600">
                Internal notes are only visible to managers and agents.
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Customer Communication Timeline
            </CardTitle>
            <div className="text-sm text-gray-600">
              All communication with the customer
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Add customer communication */}
              <div className="space-y-2">
                <Textarea
                  placeholder="Send message to customer..."
                  className="min-h-[80px]"
                />
                <Button size="sm">Send to Customer</Button>
              </div>

              {/* Customer communication timeline */}
              <div className="space-y-3 max-h-80 overflow-y-auto">
                <div className="relative pl-8 pb-4">
                  <div className="absolute left-2 top-2 w-2 h-2 bg-blue-500 rounded-full"></div>
                  <div className="absolute left-3 top-6 w-0.5 h-full bg-gray-200"></div>
                  <div className="bg-blue-50 rounded-lg p-3">
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-medium text-sm">To Customer</span>
                      <span className="text-xs text-blue-600">3 hours ago</span>
                    </div>
                    <p className="text-sm text-gray-700">
                      Your documents have been received and are under review. We
                      will update you within 24 hours.
                    </p>
                  </div>
                </div>

                <div className="relative pl-8 pb-4">
                  <div className="absolute left-2 top-2 w-2 h-2 bg-green-500 rounded-full"></div>
                  <div className="absolute left-3 top-6 w-0.5 h-full bg-gray-200"></div>
                  <div className="bg-green-50 rounded-lg p-3">
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-medium text-sm">From Customer</span>
                      <span className="text-xs text-green-600">
                        5 hours ago
                      </span>
                    </div>
                    <p className="text-sm text-gray-700">
                      I have uploaded all required documents as requested.
                      Please let me know if you need anything else.
                    </p>
                  </div>
                </div>

                <div className="relative pl-8">
                  <div className="absolute left-2 top-2 w-2 h-2 bg-gray-400 rounded-full"></div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-medium text-sm">To Customer</span>
                      <span className="text-xs text-gray-500">2 days ago</span>
                    </div>
                    <p className="text-sm text-gray-700">
                      Welcome! Your application has been received. Please upload
                      your passport and Emirates ID to proceed.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

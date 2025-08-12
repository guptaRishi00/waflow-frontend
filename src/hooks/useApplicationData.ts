import { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useToast } from "@/hooks/use-toast";
import { logout } from "@/features/customerAuthSlice";
import { RootState } from "@/app/store";
import {
  ApiApplicationData,
  ApplicationDocument,
  WorkflowStep,
  ApplicationDetails,
} from "@/types/application";
import {
  Clock,
  FileCheck,
  AlertCircle,
  CheckCircle,
  XCircle,
  Shield,
  Home,
  Building2,
  UserCheck,
  Calendar,
  Banknote,
  Building,
  ClipboardCheck,
  FileText,
} from "lucide-react";

export const useApplicationData = (id: string | undefined) => {
  const navigate = useNavigate();
  const { user, token } = useSelector((state: RootState) => state.customerAuth);
  const { toast } = useToast();
  const dispatch = useDispatch();

  const [applicationData, setApplicationData] =
    useState<ApiApplicationData | null>(null);
  const [applicationDocuments, setApplicationDocuments] = useState<
    ApplicationDocument[]
  >([]);
  const [workflowSteps, setWorkflowSteps] = useState<WorkflowStep[]>([]);
  const [applicationDetails, setApplicationDetails] =
    useState<ApplicationDetails>({
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

  const [documentFetchAttempts, setDocumentFetchAttempts] = useState(0);
  const [isLoadingDocuments, setIsLoadingDocuments] = useState(false);
  const [isBulkUpdateInProgress, setIsBulkUpdateInProgress] = useState(false);
  const [backendErrorCount, setBackendErrorCount] = useState(0);
  const [lastBackendError, setLastBackendError] = useState<string | null>(null);

  const isWorkflowProgressionRunning = useRef(false);
  const isDocumentMergingRunning = useRef(false);

  // Function to fetch application data
  const fetchApplication = async () => {
    if (!id || !token) return;

    try {
      console.log("🔄 Fetching application with ID:", id);
      const response = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/api/application/${id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const appData = response.data.data;
      console.log("✅ Application data received:", {
        _id: appData?._id,
        applicationId: appData?.applicationId,
        stepCount: appData?.steps?.length
      });
      setApplicationData(appData);

      // Fetch documents immediately after setting application data
      if (appData?._id) {
        fetchApplicationDocuments(appData._id);
      }
    } catch (error) {
      console.error("Error fetching application:", error);
    }
  };

  // Function to fetch application documents
  const fetchApplicationDocuments = async (applicationId: string) => {
    if (!applicationId || !token) return;

    setIsLoadingDocuments(true);

    try {
      const response = await axios.get(
        `${
          import.meta.env.VITE_BASE_URL
        }/api/document/application/${applicationId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data.success && response.data.data) {
        setApplicationDocuments(response.data.data);
        setDocumentFetchAttempts(0);
      } else {
        setApplicationDocuments([]);
      }
    } catch (error: any) {
      if (error.response?.status === 401 || error.response?.status === 403) {
        toast({
          title: "Authentication Error",
          description: "Your session has expired. Please log in again.",
          variant: "destructive",
        });
        dispatch(logout());
        navigate("/auth");
        return;
      }

      toast({
        title: "Error",
        description: "Failed to fetch documents. Please try again.",
        variant: "destructive",
      });

      setApplicationDocuments([]);

      if (documentFetchAttempts < 3) {
        setDocumentFetchAttempts((prev) => prev + 1);
        setTimeout(() => {
          if (applicationId && token) {
            fetchApplicationDocuments(applicationId);
          }
        }, 2000);
      }
    } finally {
      setIsLoadingDocuments(false);
    }
  };

  // Get step icon name based on step name
  const getStepIconName = (stepName: string): string => {
    const stepNameLower = stepName.toLowerCase();
    if (stepNameLower.includes("kyc") || stepNameLower.includes("background"))
      return "Shield";
    if (
      stepNameLower.includes("office") ||
      stepNameLower.includes("lease") ||
      stepNameLower.includes("flexi")
    )
      return "Home";
    if (
      stepNameLower.includes("trade") ||
      stepNameLower.includes("license") ||
      stepNameLower.includes("approval")
    )
      return "FileCheck";
    if (
      stepNameLower.includes("establishment") ||
      stepNameLower.includes("visa allocation")
    )
      return "Building2";
    if (stepNameLower.includes("visa") && !stepNameLower.includes("allocation"))
      return "UserCheck";
    if (stepNameLower.includes("medical") || stepNameLower.includes("emirates"))
      return "Calendar";
    if (stepNameLower.includes("tax") || stepNameLower.includes("vat"))
      return "Banknote";
    if (stepNameLower.includes("bank") || stepNameLower.includes("account"))
      return "Building";
    if (
      stepNameLower.includes("insurance") ||
      stepNameLower.includes("liability")
    )
      return "Shield";
    if (stepNameLower.includes("compliance") || stepNameLower.includes("audit"))
      return "ClipboardCheck";
    if (stepNameLower.includes("final") || stepNameLower.includes("completion"))
      return "CheckCircle";
    return "FileText";
  };

  // Map status from backend to UI status
  const mapStatus = (status: string): WorkflowStep["status"] => {
    const statusMap: { [key: string]: WorkflowStep["status"] } = {
      "not-started": "not-started",
      "not started": "not-started",
      notstarted: "not-started",
      submitted: "submitted",
      "under-review": "awaiting",
      "under review": "awaiting",
      underreview: "awaiting",
      awaiting: "awaiting",
      "awaiting response": "awaiting",
      awaitingresponse: "awaiting",
      approved: "approved",
      Approved: "approved",
      APPROVED: "approved",
      declined: "declined",
      rejected: "declined",
      Declined: "declined",
      REJECTED: "declined",
    };

    const normalizedStatus = status?.toLowerCase().trim();
    return statusMap[normalizedStatus] || "not-started";
  };

  // Update application details when API data is fetched
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
      const mappedSteps = applicationData.steps.map((step: any) => {
        const mappedStatus = mapStatus(step.status);
        const stepId = step._id || `step_${step.stepName}`;

        return {
          id: stepId,
          title: step.stepName,
          stepName: step.stepName,
          icon: getStepIconName(step.stepName),
          status: mappedStatus,
          internalNotes: step.internalNotes || "",
          customerNotes: step.customerNotes || "",
          documents: step.documents || [],
          syncStatus: "synced" as const,
        };
      });

      setWorkflowSteps(mappedSteps);
    }
  }, [applicationData?.steps]);

  // Fetch application by ID
  useEffect(() => {
    console.log("🔄 useEffect triggered for fetchApplication:", { id, hasToken: !!token });
    if (id && token) {
      fetchApplication();
    }
  }, [id, token]);

  return {
    applicationData,
    applicationDocuments,
    workflowSteps,
    applicationDetails,
    setApplicationDetails,
    setWorkflowSteps,
    isLoadingDocuments,
    isBulkUpdateInProgress,
    setIsBulkUpdateInProgress,
    backendErrorCount,
    setBackendErrorCount,
    lastBackendError,
    setLastBackendError,
    isWorkflowProgressionRunning,
    isDocumentMergingRunning,
    fetchApplication,
    fetchApplicationDocuments,
  };
};

import { useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useToast } from "@/hooks/use-toast";
import { logout } from "@/features/customerAuthSlice";
import { RootState } from "@/app/store";
import {
  WorkflowStep,
  ApplicationDocument,
  ApiApplicationData,
} from "@/types/application";

export const useWorkflowManagement = (
  workflowSteps: WorkflowStep[],
  setWorkflowSteps: React.Dispatch<React.SetStateAction<WorkflowStep[]>>,
  applicationDocuments: ApplicationDocument[],
  applicationData: ApiApplicationData | null,
  setApplicationData: React.Dispatch<
    React.SetStateAction<ApiApplicationData | null>
  >,
  isBulkUpdateInProgress: boolean,
  setIsBulkUpdateInProgress: React.Dispatch<React.SetStateAction<boolean>>,
  backendErrorCount: number,
  setBackendErrorCount: React.Dispatch<React.SetStateAction<number>>,
  setLastBackendError: React.Dispatch<React.SetStateAction<string | null>>
) => {
  const navigate = useNavigate();
  const { user, token } = useSelector((state: RootState) => state.customerAuth);
  const { toast } = useToast();

  const isWorkflowProgressionRunning = useRef(false);
  const isDocumentMergingRunning = useRef(false);

  // Auto-retry mechanism for pending syncs
  useEffect(() => {
    if (backendErrorCount > 0) {
      const interval = setInterval(() => {
        const pendingSteps = workflowSteps.filter(
          (step) => step.syncStatus === "pending"
        );
        if (pendingSteps.length > 0) {
          if (backendErrorCount < 3) {
            retrySyncPendingSteps();
          }
        }
      }, 30000);

      return () => clearInterval(interval);
    }
  }, [backendErrorCount, workflowSteps]);

  // Merge documents with workflow steps
  useEffect(() => {
    if (isDocumentMergingRunning.current) return;

    if (workflowSteps.length > 0 && applicationDocuments.length > 0) {
      isDocumentMergingRunning.current = true;

      try {
        setWorkflowSteps((prevSteps) => {
          const updatedSteps = prevSteps.map((step) => {
            const stepDocuments = applicationDocuments.filter((doc) => {
              const normalizedStepTitle = step.title?.toLowerCase().trim();
              const docStepName = doc.stepName || doc.relatedStepName;
              const normalizedDocStepName = docStepName?.toLowerCase().trim();
              const normalizedStepName = step.stepName?.toLowerCase().trim();

              const matchesTitle =
                normalizedStepTitle === normalizedDocStepName;
              const matchesStepName =
                normalizedStepName === normalizedDocStepName;
              const stepContainsDoc =
                normalizedStepTitle.includes(normalizedDocStepName) ||
                normalizedDocStepName.includes(normalizedStepTitle);
              const stepNameContainsDoc =
                normalizedStepName.includes(normalizedDocStepName) ||
                normalizedDocStepName.includes(normalizedStepName);

              return (
                matchesTitle ||
                matchesStepName ||
                stepContainsDoc ||
                stepNameContainsDoc
              );
            });

            return { ...step, documents: stepDocuments };
          });

          return updatedSteps;
        });

        console.log(
          `🎯 Document Merging Complete: ${workflowSteps.length} steps, ${applicationDocuments.length} documents`
        );
      } finally {
        isDocumentMergingRunning.current = false;
      }
    }
  }, [applicationDocuments]);

  // Workflow progression logic
  useEffect(() => {
    if (
      !applicationDocuments.length ||
      !workflowSteps.length ||
      isBulkUpdateInProgress ||
      isWorkflowProgressionRunning.current
    ) {
      return;
    }

    const checkWorkflowProgression = async () => {
      isWorkflowProgressionRunning.current = true;

      try {
        const currentSteps = [...workflowSteps];

        for (const [index, step] of currentSteps.entries()) {
          if (step.status === "approved") continue;

          const stepDocuments = applicationDocuments.filter((doc) => {
            const normalizedStepTitle = step.title?.toLowerCase().trim();
            const docStepName = doc.stepName || doc.relatedStepName;
            const normalizedDocStepName = docStepName?.toLowerCase().trim();
            const normalizedStepName = step.stepName?.toLowerCase().trim();

            const matchesTitle = normalizedStepTitle === normalizedDocStepName;
            const matchesStepName =
              normalizedStepName === normalizedDocStepName;

            return matchesTitle || matchesStepName;
          });

          if (stepDocuments.length > 0) {
            const allDocsApproved = stepDocuments.every((doc) => {
              const normalizedDocStatus = doc.status?.toLowerCase().trim();
              return normalizedDocStatus === "approved";
            });

            if (allDocsApproved) {
              await updateStepStatus(step.id, "approved");

              const nextStepIndex = index + 1;
              if (nextStepIndex < currentSteps.length) {
                const nextStep = currentSteps[nextStepIndex];
                if (nextStep.status === "not-started") {
                  await updateStepStatus(nextStep.id, "submitted");
                }
              }
              break;
            }
          }
        }
      } finally {
        isWorkflowProgressionRunning.current = false;
      }
    };

    checkWorkflowProgression();
  }, [applicationDocuments, isBulkUpdateInProgress]);

  const updateStepStatus = async (
    stepId: string,
    newStatus: WorkflowStep["status"]
  ) => {
    try {
      // Enhanced debugging
      console.log("🔍 updateStepStatus called with:", {
        stepId,
        newStatus,
        applicationData: applicationData
          ? {
              _id: applicationData._id,
              applicationId: applicationData.applicationId,
            }
          : null,
        hasApplicationData: !!applicationData,
        hasApplicationId: !!(applicationData && applicationData._id),
      });

      // Validate required data
      if (!applicationData || !applicationData.applicationId) {
        console.error("❌ Validation failed:", {
          applicationData: applicationData,
          applicationId: applicationData?.applicationId,
          _id: applicationData?._id,
          stepId,
        });
        throw new Error("Application data not available");
      }

      const mapToBackendStatus = (status: WorkflowStep["status"]) => {
        switch (status) {
          case "not-started":
            return "Not Started";
          case "submitted":
            return "Submitted for Review";
          case "awaiting":
            return "Awaiting Response";
          case "approved":
            return "Approved";
          case "declined":
            return "Declined";
          default:
            return "Not Started";
        }
      };

      const step = workflowSteps.find((s) => s.id === stepId);
      if (!step) throw new Error("Step not found");

      const backendStatus = mapToBackendStatus(newStatus);

      console.log(
        `Updating step status: ${step.stepName} to ${backendStatus} for application: ${applicationData.applicationId}`
      );

      const response = await axios.patch(
        `${import.meta.env.VITE_BASE_URL}/api/application/step-status/${
          applicationData.applicationId
        }`,
        {
          stepName: step.stepName,
          status: backendStatus,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      console.log("🔍 Backend response:", response.data);

      // Check if the response indicates success (backend returns message on success)
      if (
        response.data.message &&
        response.data.message.includes("successfully")
      ) {
        setWorkflowSteps((prev) =>
          prev.map((s) =>
            s.id === stepId
              ? { ...s, status: newStatus, syncStatus: "synced" as const }
              : s
          )
        );

        setApplicationData((prev: any) => ({
          ...prev,
          steps: prev.steps.map((s: any) =>
            s.stepName === step.stepName ? { ...s, status: backendStatus } : s
          ),
        }));

        toast({
          title: "Step Status Updated",
          description: `${step.stepName} status updated to ${backendStatus}`,
        });
      } else {
        throw new Error("Failed to update step status");
      }
    } catch (error: any) {
      console.error("Error updating step status:", error);

      const isBackendError = error.response?.status === 500;

      if (isBackendError) {
        setBackendErrorCount((prev) => prev + 1);
        setLastBackendError(error.message || "Backend configuration error");

        toast({
          title: "Backend Service Temporarily Unavailable",
          description:
            "The step status update service is currently experiencing technical difficulties. Your changes have been saved locally and will be synchronized once the service is restored.",
          variant: "destructive",
        });

        setWorkflowSteps((prev) =>
          prev.map((s) =>
            s.id === stepId
              ? { ...s, status: newStatus, syncStatus: "pending" as const }
              : s
          )
        );

        const currentStep = workflowSteps.find((s) => s.id === stepId);
        if (currentStep) {
          const mapToBackendStatus = (status: WorkflowStep["status"]) => {
            switch (status) {
              case "not-started":
                return "Not Started";
              case "submitted":
                return "Submitted for Review";
              case "awaiting":
                return "Awaiting Response";
              case "approved":
                return "Approved";
              case "declined":
                return "Declined";
              default:
                return "Not Started";
            }
          };

          setApplicationData((prev: any) => ({
            ...prev,
            steps: prev.steps.map((s: any) =>
              s.stepName === currentStep.stepName
                ? {
                    ...s,
                    status: mapToBackendStatus(newStatus),
                    syncStatus: "pending",
                  }
                : s
            ),
          }));
        }

        toast({
          title: "Changes Saved Locally",
          description: `Step status updated to ${newStatus} (local only - will sync when backend is restored)`,
        });

        setTimeout(() => {
          const pendingSteps = workflowSteps.filter(
            (s) => s.syncStatus === "pending"
          );
          if (pendingSteps.length > 0) {
            // Auto-retry will handle this
          }
        }, 5000);

        return;
      }

      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to update step status";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
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

  const retrySyncPendingSteps = async () => {
    // Enhanced debugging
    console.log("🔄 retrySyncPendingSteps called with:", {
      applicationData: applicationData
        ? {
            _id: applicationData._id,
            applicationId: applicationData.applicationId,
          }
        : null,
      hasApplicationData: !!applicationData,
      hasApplicationId: !!(applicationData && applicationData._id),
    });

    // Validate required data
    if (!applicationData || !applicationData.applicationId) {
      console.error("❌ retrySyncPendingSteps validation failed:", {
        applicationData: applicationData,
        applicationId: applicationData?.applicationId,
        _id: applicationData?._id,
      });
      toast({
        title: "Cannot Sync",
        description:
          "Application data not available. Please refresh the page and try again.",
        variant: "destructive",
      });
      return;
    }

    const pendingSteps = workflowSteps.filter(
      (step) => step.syncStatus === "pending"
    );

    if (pendingSteps.length === 0) {
      toast({
        title: "No Pending Changes",
        description: "All steps are already synced with the backend.",
      });
      return;
    }

    toast({
      title: "Syncing Changes",
      description: `Attempting to sync ${pendingSteps.length} pending step(s) with the backend...`,
    });

    let successCount = 0;
    let errorCount = 0;

    for (const step of pendingSteps) {
      try {
        const mapToBackendStatus = (status: WorkflowStep["status"]) => {
          switch (status) {
            case "not-started":
              return "Not Started";
            case "submitted":
              return "Submitted for Review";
            case "awaiting":
              return "Awaiting Response";
            case "approved":
              return "Approved";
            case "declined":
              return "Declined";
            default:
              return "Not Started";
          }
        };

        const backendStatus = mapToBackendStatus(step.status);

        console.log(
          `Retrying sync for step: ${step.stepName} with status: ${backendStatus} for application: ${applicationData.applicationId}`
        );

        const response = await axios.patch(
          `${import.meta.env.VITE_BASE_URL}/api/application/step-status/${
            applicationData.applicationId
          }`,
          {
            stepName: step.stepName,
            status: backendStatus,
          },
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        console.log("🔄 Retry sync response:", response.data);

        if (
          response.data.message &&
          response.data.message.includes("successfully")
        ) {
          setWorkflowSteps((prev) =>
            prev.map((s) =>
              s.id === step.id ? { ...s, syncStatus: "synced" as const } : s
            )
          );

          setApplicationData((prev: any) => ({
            ...prev,
            steps: prev.steps.map((s: any) =>
              s.stepName === step.stepName ? { ...s, status: backendStatus } : s
            ),
          }));

          successCount++;

          if (backendErrorCount > 0) {
            toast({
              title: "Backend Restored",
              description: `Successfully synced step "${step.stepName}" with the backend.`,
            });
          }
        }
      } catch (error: any) {
        console.error(`Failed to sync step ${step.stepName}:`, error);

        setWorkflowSteps((prev) =>
          prev.map((s) =>
            s.id === step.id ? { ...s, syncStatus: "error" as const } : s
          )
        );

        errorCount++;
      }
    }

    if (successCount > 0 && errorCount === 0) {
      toast({
        title: "Sync Complete",
        description: `Successfully synced ${successCount} step(s) with the backend.`,
      });

      if (
        successCount ===
        workflowSteps.filter((step) => step.syncStatus === "pending").length
      ) {
        setBackendErrorCount(0);
        setLastBackendError(null);
        toast({
          title: "Backend Service Restored",
          description:
            "All pending changes have been synchronized successfully.",
        });
      }
    } else if (successCount > 0 && errorCount > 0) {
      toast({
        title: "Partial Sync Complete",
        description: `Synced ${successCount} step(s), ${errorCount} step(s) failed.`,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Sync Failed",
        description: `Failed to sync any steps. The backend may still be experiencing issues.`,
        variant: "destructive",
      });
    }
  };

  const handleDocumentStatusChange = async (
    documentId: string,
    newStatus: string,
    options: { isBulk?: boolean } = {}
  ) => {
    try {
      const response = await axios.put(
        `${import.meta.env.VITE_BASE_URL}/api/document/${documentId}`,
        { status: newStatus },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (
        response.data.message &&
        response.data.message.includes("successfully")
      ) {
        // Update local state - the useEffect hooks will handle workflow progression
        toast({
          title: "Status Updated",
          description: `Document status updated to ${newStatus}`,
        });
      } else {
        throw new Error("Failed to update document status");
      }
    } catch (error) {
      console.error("Error updating document status:", error);
      toast({
        title: "Error",
        description: "Failed to update document status",
        variant: "destructive",
      });
    }
  };

  return {
    updateStepStatus,
    updateStepNotes,
    retrySyncPendingSteps,
    handleDocumentStatusChange,
    isWorkflowProgressionRunning,
    isDocumentMergingRunning,
  };
};

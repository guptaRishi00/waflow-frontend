import React, { useState } from "react";
import { useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, Clock, CreditCard, MessageSquare } from "lucide-react";
import { NotesModule } from "@/components/common/NotesModule";
import { RootState } from "@/app/store";

// Custom hooks
import { useApplicationData } from "@/hooks/useApplicationData";
import { useWorkflowManagement } from "@/hooks/useWorkflowManagement";

// Components
import { ApplicationHeader } from "@/components/manager/ApplicationHeader";
import { BackendStatusWarning } from "@/components/manager/BackendStatusWarning";
import { WorkflowStep } from "@/components/manager/WorkflowStep";

// Import existing components
import { EditSectionModal } from "./EditSectionModal";

// New components
import { ApplicationDetailsForms } from "@/components/manager/ApplicationDetailsForms";
import { PaymentDetails } from "@/components/manager/PaymentDetails";

export const ApplicationDetailsPage: React.FC = () => {
  const { id } = useParams();
  const { user } = useSelector((state: RootState) => state.customerAuth);
  const [activeTab, setActiveTab] = useState("workflow");

  // Use custom hooks for data management
  const {
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
    fetchApplication,
    fetchApplicationDocuments,
  } = useApplicationData(id);

  // Use custom hook for workflow management
  const {
    updateStepStatus,
    updateStepNotes,
    retrySyncPendingSteps,
    handleDocumentStatusChange,
  } = useWorkflowManagement(
    workflowSteps,
    setWorkflowSteps,
    applicationDocuments,
    applicationData,
    () => {}, // setApplicationData is handled in the hook
    isBulkUpdateInProgress,
    setIsBulkUpdateInProgress,
    backendErrorCount,
    setBackendErrorCount,
    setLastBackendError
  );

  const getOverallProgress = () => {
    const totalSteps = workflowSteps.length;
    const completedSteps = workflowSteps.filter(
      (step) => step.status === "approved"
    ).length;
    return Math.round((completedSteps / totalSteps) * 100);
  };

  const hasPendingSteps = workflowSteps.some(
    (step) => step.syncStatus === "pending"
  );

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Backend Status Warning */}
      <BackendStatusWarning
        backendErrorCount={backendErrorCount}
        lastBackendError={lastBackendError}
        hasPendingSteps={hasPendingSteps}
        onRetrySync={retrySyncPendingSteps}
        onDismiss={() => {
          setBackendErrorCount(0);
          setLastBackendError(null);
        }}
      />

      {/* Application Header */}
      <ApplicationHeader applicationData={applicationData} />

      {/* Tabs */}
      <div className="border rounded-lg p-4 bg-white">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-6">
            <TabsTrigger value="workflow" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Application Details
            </TabsTrigger>
            <TabsTrigger value="timeline" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Application Workflow Timeline
            </TabsTrigger>
            <TabsTrigger value="payments" className="flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              Payment Details
            </TabsTrigger>
            <TabsTrigger value="notes" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              NOTES
            </TabsTrigger>
          </TabsList>

          {/* Application Details Tab */}
          <TabsContent value="workflow" className="space-y-6">
            <ApplicationDetailsForms
              applicationDetails={applicationDetails}
              setApplicationDetails={setApplicationDetails}
              applicationData={applicationData}
              fetchApplication={fetchApplication}
            />
          </TabsContent>

          {/* Application Workflow Timeline Tab */}
          <TabsContent value="timeline" className="space-y-6">
            <div className="space-y-6">
              {/* Workflow Steps */}
              <div className="space-y-6">
                {workflowSteps.map((step, index) => (
                  <WorkflowStep
                    key={step.id}
                    step={step}
                    stepIndex={index}
                    workflowSteps={workflowSteps}
                    applicationData={applicationData}
                    isBulkUpdateInProgress={isBulkUpdateInProgress}
                    onUpdateStepStatus={updateStepStatus}
                    onUpdateStepNotes={updateStepNotes}
                    onDocumentStatusChange={handleDocumentStatusChange}
                    fetchApplicationDocuments={fetchApplicationDocuments}
                    userRole={user?.role}
                  />
                ))}
              </div>
            </div>
          </TabsContent>

          {/* Payment Details Tab */}
          <TabsContent value="payments" className="space-y-6">
            <PaymentDetails applicationData={applicationData} />
          </TabsContent>

          {/* Notes Tab */}
          <TabsContent value="notes" className="space-y-6">
            <div className="space-y-6">
              <NotesModule
                customerId={applicationData?.customer?._id || ""}
                applicationId={applicationData?._id || ""}
              />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ApplicationDetailsPage;

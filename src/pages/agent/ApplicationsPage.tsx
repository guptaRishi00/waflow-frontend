import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ProgressTracker } from "@/components/ui/progress-tracker";
import {
  FileText,
  MessageSquare,
  DollarSign,
  Eye,
  Edit,
  CheckCircle2,
  XCircle,
} from "lucide-react";
// import { mockApplications } from '@/lib/mock-data';
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { ApplicationDetailsModal } from "@/components/common/ApplicationDetailsModal";
import type { Application } from "@/types";
import { useSelector } from "react-redux";
import { RootState } from "@/app/store";
import axios from "axios";
import ApplicationCard from "./ApplicationCard";
import StepManagement from "./StepManagement";
import CustomerDocuments from "./CustomerDocuments";
import VisaApplicationsList from "./VisaApplicationsList";

export const ApplicationsPage: React.FC = () => {
  const [applications, setApplications] = useState<any[]>([]);
  const [selectedApp, setSelectedApp] = useState(applications[0]);
  const [agentNotes, setAgentNotes] = useState("");
  const [stepStatus, setStepStatus] = useState<string>("");
  const [selectedApplication, setSelectedApplication] =
    useState<Application | null>(null);
  const [isApplicationModalOpen, setIsApplicationModalOpen] = useState(false);
  const { toast } = useToast();
  const { token } = useSelector((state: RootState) => state.customerAuth);
  const [stepActionLoading, setStepActionLoading] = useState(false);
  const [customerDocuments, setCustomerDocuments] = useState<any[]>([]);
  const [applicationDocuments, setApplicationDocuments] = useState<any[]>([]);
  // Remove visaApplications, visaLoading, fetchVisaApps, and handleVisaStatusUpdate state and logic

  const [demo, setDemo] = useState(null);

  // Fetch applications (already present)
  useEffect(() => {
    const fetchApplications = async () => {
      if (!token) return;
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_BASE_URL}/api/application`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        const apps = response.data.data;
        setApplications(apps);
        console.log("Fetched applications:", apps);
      } catch (err) {
        console.error("Error fetching applications:", err);
      }
    };
    fetchApplications();
  }, [token]);

  // Ensure selectedApp is set after applications load
  useEffect(() => {
    if (applications.length > 0 && !selectedApp) {
      setSelectedApp(applications[0]);
    }
  }, [applications, selectedApp]);

  // Fetch customer profile and documents for selectedApp
  useEffect(() => {
    const fetchCustomerProfileAndDocuments = async () => {
      if (!selectedApp?.customer?._id || !token) return;
      try {
        const customerResponse = await axios.get(
          `${import.meta.env.VITE_BASE_URL}/api/user/customer/${
            selectedApp.customer._id
          }`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setCustomerProfile(customerResponse.data.data);
      } catch (err) {
        console.error("Error fetching customer profile:", err);
      }
    };
    fetchCustomerProfileAndDocuments();
  }, [token, selectedApp]);

  // Fetch customer documents for selectedApp
  useEffect(() => {
    const fetchDocuments = async () => {
      if (
        !selectedApp ||
        !selectedApp.customer ||
        !selectedApp.customer._id ||
        !selectedApp._id ||
        !token
      )
        return;
      console.log(
        "Fetching documents for customer:",
        selectedApp.customer._id,
        "and application:",
        selectedApp._id
      );
      try {
        // Fetch customer-linked documents
        const customerRes = await axios.get(
          `${import.meta.env.VITE_BASE_URL}/api/document/customer/${
            selectedApp.customer._id
          }`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setCustomerDocuments(customerRes.data.data || []);
        console.log(
          "API response for customerDocuments:",
          customerRes.data.data
        );
      } catch (err) {
        setCustomerDocuments([]);
        console.error("Error fetching customer documents:", err);
      }
      try {
        // Fetch application-linked documents
        const appRes = await axios.get(
          `${import.meta.env.VITE_BASE_URL}/api/document/application/${
            selectedApp._id
          }`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setApplicationDocuments(appRes.data.data || []);
      } catch (err) {
        setApplicationDocuments([]);
        console.error("Error fetching application documents:", err);
      }
    };
    fetchDocuments();
  }, [selectedApp, token]);

  // Remove visaApplications, visaLoading, fetchVisaApps, and handleVisaStatusUpdate state and logic

  const handleUpdateStep = () => {
    toast({
      title: "Step Updated",
      description: "Application step has been updated successfully.",
    });
  };

  const handleCreateInvoice = () => {
    toast({
      title: "Invoice Created",
      description: "Invoice has been created and sent to customer.",
    });
  };

  const handleViewApplication = (application: Application) => {
    setSelectedApplication(application);
    setIsApplicationModalOpen(true);
  };

  // Approve/Reject handler for ProgressTracker
  const handleStepAction = async (
    stepIndex: number,
    action: "approve" | "reject"
  ) => {
    if (!selectedApp || !selectedApp.steps || !selectedApp._id) return;
    const step = selectedApp.steps[stepIndex];
    if (!step) return;
    setStepActionLoading(true);
    try {
      // Find the customer ID from the selected application
      if (!selectedApp.customer?._id) {
        toast({
          title: "Error",
          description: "Customer ID not found for this application.",
          variant: "destructive",
        });
        return;
      }

      const response = await axios.patch(
        `${import.meta.env.VITE_BASE_URL}/api/application/step-status/${
          selectedApp._id
        }`,
        {
          stepName: step.stepName,
          status: action === "approve" ? "Approved" : "Declined",
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      // Update local state with new application data
      const updatedApp = response.data.application;
      setSelectedApp(updatedApp);
      setApplications((prev) =>
        prev.map((a) => (a._id === updatedApp._id ? updatedApp : a))
      );
      toast({
        title: `Step ${action === "approve" ? "Approved" : "Rejected"}`,
        description: `Step "${step.stepName}" has been ${
          action === "approve" ? "approved" : "rejected"
        }.`,
      });
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to update step status.",
        variant: "destructive",
      });
      console.error("Error updating step status:", err);
    } finally {
      setStepActionLoading(false);
    }
  };

  // Add a function to refetch the selected application from the backend
  const refetchSelectedApplication = async () => {
    if (!selectedApp || !selectedApp._id || !token) return;
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/api/application/${selectedApp._id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const updatedApp = response.data.data;
      setSelectedApp(updatedApp);
      setApplications((prev) =>
        prev.map((a) => (a._id === updatedApp._id ? updatedApp : a))
      );
    } catch (err) {
      console.error("Error refetching application:", err);
    }
  };

  // Remove visaApplications, visaLoading, fetchVisaApps, and handleVisaStatusUpdate state and logic

  return (
    <div className="space-y-6 w-full px-4">
      <div>
        <h1 className="text-3xl font-bold text-primary">
          Applications Management
        </h1>
        <p className="text-muted-foreground">
          Manage customer applications and track progress
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full">
        {/* Applications List */}
        {applications.map((app, index) => (
          <div key={app._id ?? index} className="mb-2">
            <ApplicationCard
              app={app}
              selectedApp={selectedApp}
              setSelectedApp={setSelectedApp}
              applications={applications}
            />
          </div>
        ))}
        {/* Application Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Application Header */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>
                    {selectedApp?.customer?.firstName}{" "}
                    {selectedApp?.customer?.lastName}
                  </CardTitle>
                  <CardDescription>
                    {selectedApp?.customer?.email} • Created{" "}
                    {selectedApp
                      ? new Date(selectedApp.createdAt).toLocaleDateString()
                      : ""}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Progress Tracker */}
          {/* Visa Section replacing Application Steps */}
          {/* Remove the Card with VisaApplicationsList from the render */}

          {/* Customer Documents */}
          <Card>
            <CardHeader>
              <CardTitle>Customer Documents</CardTitle>
              <CardDescription>
                All documents uploaded by the customer or for this application
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CustomerDocuments
                selectedApp={selectedApp}
                token={token}
                onApplicationRefetch={refetchSelectedApplication}
                visaDocuments={[]} // No longer fetching visa documents here
              />
            </CardContent>
          </Card>

          {/* Step Management */}
          <Card>
            <CardHeader>
              <CardTitle>Update Application Step</CardTitle>
              <CardDescription>
                Manage the current step and add agent notes
              </CardDescription>
            </CardHeader>
            <CardContent>
              {selectedApp && (
                <StepManagement
                  applicationId={selectedApp._id}
                  steps={selectedApp.steps}
                  status={selectedApp.status}
                  notes={selectedApp.notes}
                  stepStatus={stepStatus}
                  setStepStatus={setStepStatus}
                  agentNotes={agentNotes}
                  setAgentNotes={setAgentNotes}
                  handleUpdateStep={handleUpdateStep}
                />
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Application Details Modal */}
      <ApplicationDetailsModal
        application={selectedApplication}
        isOpen={isApplicationModalOpen}
        onClose={() => {
          setIsApplicationModalOpen(false);
          setSelectedApplication(null);
        }}
      />
    </div>
  );
};

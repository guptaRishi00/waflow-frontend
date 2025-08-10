// import React from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  ClipboardList,
  MessageSquare,
  Edit,
  CheckCircle2,
  AlertCircle,
  Clock,
  Hourglass,
  Send,
  FileCheck,
} from "lucide-react";
import { useSelector } from "react-redux";
import { RootState } from "@/app/store";
import axios from "axios";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

const StepManagement = ({
  applicationId,
  steps = [],
  status,
  notes,
  stepStatus,
  setStepStatus,
  agentNotes,
  setAgentNotes,
  handleUpdateStep,
}: {
  applicationId: string;
  steps: any[];
  status?: string;
  notes?: any;
  stepStatus: string;
  setStepStatus: (status: string) => void;
  agentNotes: string;
  setAgentNotes: (notes: string) => void;
  handleUpdateStep: (newStatus?: string) => void;
}) => {
  const { token, user } = useSelector((state: RootState) => state.customerAuth);
  const { toast } = useToast();
  const [localSteps, setLocalSteps] = useState(steps);
  const [localNotes, setLocalNotes] = useState(notes || []);
  const [loading, setLoading] = useState(false);

  // Update step status API integration
  const updateStepStatus = async (newStatus: string) => {
    if (!applicationId || !localSteps.length) return;
    setLoading(true);
    try {
      const currentStep =
        localSteps.find(
          (step: any) => step.status.toLowerCase() !== "approved"
        ) || localSteps[localSteps.length - 1];
      // We need to get the customer ID from the application
      // For now, we'll need to pass the customer ID as a prop or get it from context
      // This is a temporary fix - the component should receive customerId as a prop
      const customerId = applicationId; // This should be the actual customer ID

      const response = await axios.patch(
        `${
          import.meta.env.VITE_BASE_URL
        }/api/application/step-status/${applicationId}`,
        {
          stepName: currentStep.stepName,
          status: newStatus,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setLocalSteps(response.data.application.steps);
      toast({
        title: "Step Updated",
        description: `Step status updated to ${newStatus}`,
      });
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to update step status.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Add note API integration
  const addNote = async () => {
    if (!applicationId || !agentNotes.trim() || !user?.userId) return;
    setLoading(true);
    try {
      const response = await axios.post(
        `${
          import.meta.env.VITE_BASE_URL
        }/api/application/note/${applicationId}`,
        {
          message: agentNotes,
          addedBy: user.userId,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setLocalNotes(response.data.notes);
      setAgentNotes("");
      toast({
        title: "Note Added",
        description: "Your note has been added.",
      });
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to add note.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  console.log("StepManagement props:", { steps, status, notes });

  const getStatusIcon = (status: string) => {
    status = status.toLowerCase();
    switch (status) {
      case "pending":
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case "in progress":
        return <Hourglass className="h-4 w-4 text-blue-500" />;
      case "submitted":
        return <Send className="h-4 w-4 text-purple-500" />;
      case "approved":
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case "rejected":
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    status = status.toLowerCase();
    switch (status) {
      case "pending":
        return (
          <Badge
            variant="outline"
            className="bg-yellow-100 text-yellow-800 border-yellow-300"
          >
            Pending
          </Badge>
        );
      case "in progress":
        return (
          <Badge
            variant="outline"
            className="bg-blue-50 text-blue-700 border-blue-200"
          >
            In Progress
          </Badge>
        );
      case "submitted":
        return (
          <Badge
            variant="outline"
            className="bg-purple-50 text-purple-700 border-purple-200"
          >
            Submitted
          </Badge>
        );
      case "approved":
        return (
          <Badge
            variant="outline"
            className="bg-green-50 text-green-700 border-green-200"
          >
            Approved
          </Badge>
        );
      case "rejected":
        return (
          <Badge
            variant="outline"
            className="bg-red-100 text-red-800 border-red-300"
          >
            Rejected
          </Badge>
        );
      default:
        return null; // Return null for 'Unknown' status
    }
  };

  // Helper to capitalize the first letter of a status
  const formatStatus = (status: string) =>
    status ? status.charAt(0).toUpperCase() + status.slice(1) : "";

  // Find the first non-approved step
  const currentStepIndex = steps.findIndex(
    (step) => step.status.toLowerCase() !== "approved"
  );
  const currentStepIndex1 =
    currentStepIndex === -1 ? steps.length - 1 : currentStepIndex;
  const completedSteps = steps.filter(
    (step) => step.status.toLowerCase() === "approved"
  ).length;
  const totalSteps = steps.length;

  return (
    <div className="grid gap-6 md:grid-cols-12 w-full">
      {/* Left Column - Current Step & Action */}
      <div className="md:col-span-7 space-y-6">
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <ClipboardList className="h-5 w-5 text-primary" />
                Current Step
              </CardTitle>
              <Badge variant="outline" className="text-primary">
                {completedSteps}/{totalSteps} Completed
              </Badge>
            </div>
            <CardDescription>
              {currentStepIndex < steps.length
                ? `Working on step ${currentStepIndex1 + 1} of ${steps.length}`
                : "All steps completed!"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between border p-4 rounded-lg bg-muted/30">
                <div className="flex items-center gap-3">
                  {currentStepIndex < steps.length ? (
                    getStatusIcon(steps[currentStepIndex1].status)
                  ) : (
                    <FileCheck className="h-4 w-4 text-green-500" />
                  )}
                  <span className="font-medium">
                    {currentStepIndex < steps.length
                      ? `Step ${currentStepIndex1 + 1}: ${
                          steps[currentStepIndex1].stepName
                        }`
                      : "All steps completed!"}
                  </span>
                  {currentStepIndex < steps.length && (
                    <span className="ml-2 px-2 py-1 rounded bg-muted text-xs font-medium">
                      {formatStatus(steps[currentStepIndex1].status)}
                    </span>
                  )}
                </div>
                {currentStepIndex < steps.length &&
                  getStatusBadge(steps[currentStepIndex1].status)}
              </div>
              {/* Dynamic Action Buttons for Current Step */}
              {currentStepIndex < steps.length && (
                <div className="flex flex-wrap gap-2">
                  {/* All action buttons removed as per user request */}
                </div>
              )}
              {/* Agent Notes */}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Right Column - All Steps & Notes */}
      <div className="md:col-span-5 space-y-6">
        {/* All Steps */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <ClipboardList className="h-5 w-5 text-primary" />
              All Steps
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[180px]">
              <div className="space-y-2">
                {steps.map((step: any, idx: number) => (
                  <div
                    key={idx}
                    className={`flex flex-col md:flex-row justify-between items-center p-3 rounded-md text-sm gap-2 ${
                      idx === currentStepIndex1
                        ? "bg-primary/10 border border-primary/30"
                        : "bg-muted/20"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {getStatusIcon(step.status)}
                      <span
                        className={
                          idx === currentStepIndex1 ? "font-medium" : ""
                        }
                      >
                        Step {idx + 1}: {step.stepName}
                      </span>
                      <span className="ml-2 px-2 py-1 rounded bg-muted text-xs font-medium">
                        {formatStatus(step.status)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(step.status)}
                      {/* Action Buttons for each step removed as per user request */}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Notes */}
      </div>
    </div>
  );
};

export default StepManagement;

import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eye, DollarSign, Filter, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { ApplicationDetailsModal } from "@/components/common/ApplicationDetailsModal";
import { useSelector } from "react-redux";
import { RootState } from "@/app/store";
import axios from "axios";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

import type { Application } from "@/types";
import { CreateApplicationModal } from "./CreateApplicationModal";

interface ApplicationData {
  _id: string;
  applicationId: string;
  customer: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
  };
  applicationType: string;
  emirate: string;
  legalForm: string;
  proposedCompanyNamesEN: string[];
  status: string;
  steps: Array<{
    stepName: string;
    status: string;
    updatedAt: string;
  }>;
  assignedAgent?: {
    _id: string;
    fullName: string;
    email: string;
  };
  createdAt: string;
  totalAgreedCost?: number;
}

interface Agent {
  _id: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  status: string;
}

export const ManagerApplicationsPage: React.FC = () => {
  const [applications, setApplications] = useState<ApplicationData[]>([]);
  const [loading, setLoading] = useState(true);
  const [isApplicationModalOpen, setIsApplicationModalOpen] = useState(false);
  const [selectedApplication, setSelectedApplication] =
    useState<ApplicationData | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isAssignAgentModalOpen, setIsAssignAgentModalOpen] = useState(false);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [selectedAgentId, setSelectedAgentId] = useState<string>("");
  const [assigningAgent, setAssigningAgent] = useState(false);
  const [applicationToAssign, setApplicationToAssign] = useState<string>("");

  const { toast } = useToast();
  const { token } = useSelector((state: RootState) => state.customerAuth);
  const navigate = useNavigate();

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/api/application`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setApplications(response.data.data);
    } catch (error) {
      console.error("Error fetching applications:", error);
      toast({
        title: "Error",
        description: "Failed to fetch applications.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchAgents = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/api/user/agents`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setAgents(response.data.data);
    } catch (error) {
      console.error("Error fetching agents:", error);
      toast({
        title: "Error",
        description: "Failed to fetch agents.",
        variant: "destructive",
      });
    }
  };

  const handleViewApplication = (application: ApplicationData) => {
    navigate(`/manager/applications/${application.applicationId}`);
  };

  const handleAssignAgent = (applicationId: string) => {
    setApplicationToAssign(applicationId);
    setSelectedAgentId("");
    fetchAgents();
    setIsAssignAgentModalOpen(true);
  };

  const confirmAssignAgent = async () => {
    if (!selectedAgentId) {
      toast({
        title: "Error",
        description: "Please select an agent.",
        variant: "destructive",
      });
      return;
    }

    setAssigningAgent(true);
    try {
      const selectedAgent = agents.find(
        (agent) => agent._id === selectedAgentId
      );

      const applicationToUpdate = applications.find(
        (app) => app._id === applicationToAssign
      );
      if (!applicationToUpdate) {
        throw new Error("Application not found");
      }

      const response = await axios.patch(
        `${import.meta.env.VITE_BASE_URL}/api/application/customer/${
          applicationToUpdate.applicationId
        }`,
        {
          assignedAgent: selectedAgentId,
          assignedAgentRole: "agent",
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // Update the applications list with the new assignment
      setApplications((prev) =>
        prev.map((app) =>
          app._id === applicationToAssign
            ? {
                ...app,
                assignedAgent: {
                  _id: selectedAgentId,
                  fullName: selectedAgent?.fullName || "",
                  email: selectedAgent?.email || "",
                },
              }
            : app
        )
      );

      toast({
        title: "Agent Assigned",
        description: "Application has been assigned to an agent successfully.",
      });

      setIsAssignAgentModalOpen(false);
      setApplicationToAssign("");
      setSelectedAgentId("");
    } catch (error) {
      console.error("Error assigning agent:", error);
      toast({
        title: "Error",
        description: "Failed to assign agent to application.",
        variant: "destructive",
      });
    } finally {
      setAssigningAgent(false);
    }
  };

  // Calculate progress based on completed steps
  const calculateProgress = (steps: ApplicationData["steps"]) => {
    if (!steps || steps.length === 0) return 0;
    const completedSteps = steps.filter(
      (step) => step.status === "Approved" || step.status === "Completed"
    ).length;
    return Math.round((completedSteps / steps.length) * 100);
  };

  // Get current step number
  const getCurrentStep = (steps: ApplicationData["steps"]) => {
    if (!steps || steps.length === 0) return 0;
    const completedSteps = steps.filter(
      (step) => step.status === "Approved" || step.status === "Completed"
    ).length;
    return completedSteps;
  };

  // Map backend status to frontend status
  const mapStatus = (status: string) => {
    switch (status) {
      case "Completed":
        return "approved";
      case "In Progress":
        return "under-review";
      case "New":
      case "Ready for Processing":
        return "submitted";
      default:
        return status.toLowerCase().replace(" ", "-");
    }
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case "Completed":
        return "bg-green-100 text-green-800";
      case "In Progress":
        return "bg-yellow-100 text-yellow-800";
      case "New":
      case "Ready for Processing":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-primary">
              All Applications
            </h1>
            <p className="text-muted-foreground">
              Overview of all customer applications across all agents
            </p>
          </div>
          <Button onClick={() => setIsCreateModalOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Application
          </Button>
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading applications...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-primary">All Applications</h1>
          <p className="text-muted-foreground">
            Overview of all customer applications across all agents
          </p>
        </div>
        <Button onClick={() => setIsCreateModalOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create Application
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-primary">
                {applications.length}
              </p>
              <p className="text-sm text-muted-foreground">
                Total Applications
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">
                {
                  applications.filter((app) => app.status === "Completed")
                    .length
                }
              </p>
              <p className="text-sm text-muted-foreground">Completed</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-yellow-600">
                {
                  applications.filter((app) => app.status === "In Progress")
                    .length
                }
              </p>
              <p className="text-sm text-muted-foreground">In Progress</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">
                {
                  applications.filter(
                    (app) =>
                      app.status === "New" ||
                      app.status === "Ready for Processing"
                  ).length
                }
              </p>
              <p className="text-sm text-muted-foreground">New/Ready</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Applications Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Applications Overview</CardTitle>
              <CardDescription>
                All customer applications with status and progress
              </CardDescription>
            </div>
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3">Application ID</th>
                  <th className="text-left p-3">Customer Name</th>
                  <th className="text-left p-3">Type</th>
                  <th className="text-left p-3">Status</th>
                  <th className="text-left p-3">Progress</th>
                  <th className="text-left p-3">Agent</th>
                  <th className="text-left p-3">Created</th>
                  <th className="text-left p-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {applications.map((app) => (
                  <tr key={app._id} className="border-b hover:bg-gray-50">
                    <td className="p-3">
                      <Badge variant="outline" className="font-mono text-xs">
                        {app.applicationId}
                      </Badge>
                    </td>
                    <td className="p-3 font-medium">
                      {app.customer.firstName} {app.customer.lastName}
                    </td>
                    <td className="p-3 capitalize">{app.applicationType}</td>
                    <td className="p-3">
                      <Badge
                        variant="default"
                        className={getStatusColor(app.status)}
                      >
                        {app.status}
                      </Badge>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center space-x-2">
                        <div className="w-20 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-gradient-to-r from-primary to-secondary h-2 rounded-full"
                            style={{
                              width: `${calculateProgress(app.steps)}%`,
                            }}
                          />
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {getCurrentStep(app.steps)}/{app.steps.length}
                        </span>
                      </div>
                    </td>
                    <td className="p-3">
                      {app.assignedAgent ? (
                        <span className="text-sm">
                          {app.assignedAgent.fullName}
                        </span>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleAssignAgent(app._id)}
                        >
                          Assign
                        </Button>
                      )}
                    </td>
                    <td className="p-3 text-sm text-muted-foreground">
                      {new Date(app.createdAt).toLocaleDateString()}
                    </td>
                    <td className="p-3">
                      <div className="flex space-x-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleViewApplication(app)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Application Details Modal */}
      <ApplicationDetailsModal
        application={selectedApplication as any}
        isOpen={isApplicationModalOpen}
        onClose={() => {
          setIsApplicationModalOpen(false);
          setSelectedApplication(null);
        }}
      />

      {/* Create Application Modal */}
      <CreateApplicationModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />

      {/* Assign Agent Modal */}
      <Dialog
        open={isAssignAgentModalOpen}
        onOpenChange={setIsAssignAgentModalOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign Agent to Application</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="application" className="text-right">
                Application:
              </Label>
              <Badge variant="outline" className="font-mono text-xs">
                {applications.find((app) => app._id === applicationToAssign)
                  ?.applicationId || applicationToAssign}
              </Badge>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="agent" className="text-right">
                Assign To:
              </Label>
              <Select
                onValueChange={setSelectedAgentId}
                defaultValue={selectedAgentId}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select an agent" />
                </SelectTrigger>
                <SelectContent>
                  {agents
                    .filter((agent) => {
                      // Handle different cases and default to active if no status
                      const status = agent.status?.toLowerCase() || "active";
                      return status === "active";
                    })
                    .map((agent) => (
                      <SelectItem key={agent._id} value={agent._id}>
                        {agent.fullName} ({agent.email})
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setIsAssignAgentModalOpen(false)}
              disabled={assigningAgent}
            >
              Cancel
            </Button>
            <Button
              onClick={confirmAssignAgent}
              disabled={assigningAgent || !selectedAgentId}
            >
              {assigningAgent ? "Assigning..." : "Assign Agent"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

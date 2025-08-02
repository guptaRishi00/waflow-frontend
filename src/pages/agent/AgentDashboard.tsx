import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Users,
  FileText,
  Clock,
  CheckCircle,
  MessageSquare,
  DollarSign,
  CheckCircle2,
  XCircle,
  Eye,
  Plus,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { RootState } from "@/app/store";
import axios from "axios";
import { useToast } from "@/hooks/use-toast";
import { PageLoader } from "@/components/ui/page-loader";
import type { Application } from "@/types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import VisaApplicationsList from "./VisaApplicationsList";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const AgentDashboard: React.FC = () => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const { token, user } = useSelector((state: RootState) => state.customerAuth);
  const { toast } = useToast();
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const [visaApplications, setVisaApplications] = useState<any[]>([]);
  const [visaLoading, setVisaLoading] = useState(false);

  // Fetch applications from backend
  const fetchApplications = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/api/application`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const apps = response.data.data;
      setApplications(apps);
    } catch (err) {
      console.error("Error fetching applications:", err);
      toast({
        title: "Error",
        description: "Failed to load applications.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, [token, toast]);

  // Update application status (Approve/Reject)
  const handleAppStatusUpdate = async (
    appId: string,
    stepName: string,
    status: string
  ) => {
    setActionLoading(appId + status);
    try {
      // Find the customer ID from the applications list
      const application = applications.find((app) => app._id === appId);
      if (!application?.customer?._id) {
        toast({
          title: "Error",
          description: "Customer ID not found for this application.",
          variant: "destructive",
        });
        return;
      }

      const response = await axios.patch(
        `${import.meta.env.VITE_BASE_URL}/api/application/stepStatus/${
          application.customer._id
        }`,
        { stepName, status },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast({
        title: `Application ${status}`,
        description: `Application step "${stepName}" marked as ${status}.`,
      });
      fetchApplications();
    } catch (err) {
      toast({
        title: "Error",
        description: `Failed to update application status.`,
        variant: "destructive",
      });
    } finally {
      setActionLoading(null);
    }
  };

  const handleVisaStatusUpdate = async (id: string, status: string) => {
    // Visa applications are now handled through regular application steps
    // This function is deprecated as visa endpoints have been removed
    toast({
      title: "Info",
      description:
        "Visa applications are now handled through regular application steps.",
    });
  };

  // Calculate stats from real data
  const stats = {
    totalClients: applications.length,
    activeApplications: applications.filter(
      (app) => app.status === "In Progress"
    ).length,
    completedApplications: applications.filter(
      (app) => app.status === "Completed"
    ).length,
    pendingTasks: applications.filter(
      (app) => app.status === "Waiting for Agent Review"
    ).length,
    monthlyRevenue: applications.length * 5000, // Mock calculation
  };

  const activeApplications = applications
    .filter(
      (app) =>
        app.status === "In Progress" ||
        app.status === "Waiting for Agent Review" ||
        app.status === "New"
    )
    .slice(0, 3); // Show only first 3 active applications

  // Helper: filter applications with submitted or in-progress visa substeps
  const visaRelevantStatuses = [
    "Started",
    "Submitted for Review",
    "Awaiting Response",
    "Approved",
  ];
  const submittedVisaApps = applications.filter(
    (app) =>
      Array.isArray(app.visaSubSteps) &&
      app.visaSubSteps.some((member) =>
        ["medical", "residenceVisa", "emiratesIdSoft", "emiratesIdHard"].some(
          (key) =>
            member[key] && visaRelevantStatuses.includes(member[key].status)
        )
      )
  );

  return (
    <div className="space-y-10 w-full px-4 bg-gray-50 min-h-screen pb-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-primary">Agent Dashboard</h1>
          <p className="text-lg text-muted-foreground">
            Manage your client applications and track progress
          </p>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
        <Card className="shadow-lg rounded-xl hover:shadow-xl transition-shadow">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-lg text-muted-foreground">Total Clients</p>
              <p className="text-3xl font-bold">{stats.totalClients}</p>
            </div>
            <Users className="h-10 w-10 text-primary" />
          </CardContent>
        </Card>
        <Card className="shadow-lg rounded-xl hover:shadow-xl transition-shadow">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-lg text-muted-foreground">Active Apps</p>
              <p className="text-3xl font-bold">{stats.activeApplications}</p>
            </div>
            <FileText className="h-10 w-10 text-secondary" />
          </CardContent>
        </Card>
      </div>

      <hr className="my-8 border-gray-200" />

      {/* Visa Applications Section */}

      <hr className="my-8 border-gray-200" />

      <div className="grid grid-cols-1 gap-8">
        {/* Active Applications */}
        <div>
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <Badge className="bg-yellow-100 text-yellow-800">Active</Badge>{" "}
            Active Applications
          </h2>
          <Card className="shadow-lg rounded-xl">
            <CardHeader>
              <CardTitle>Active Applications</CardTitle>
              <CardDescription>
                Applications requiring your attention
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-12 text-muted-foreground">
                  Loading applications...
                </div>
              ) : activeApplications.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <span className="text-5xl">🗂️</span>
                  <div>No active applications found</div>
                </div>
              ) : (
                <div className="space-y-4">
                  {activeApplications.map((app) => {
                    const approvedSteps =
                      app.steps?.filter((step) => step.status === "Approved")
                        .length || 0;
                    const totalSteps = app.steps?.length || 0;
                    // Find first non-approved step
                    const currentStep =
                      app.steps?.find((step) => step.status !== "Approved") ||
                      app.steps?.[app.steps.length - 1];

                    return (
                      <div
                        key={app._id}
                        className="flex items-center justify-between p-4 border rounded-lg bg-white hover:shadow-md transition-shadow"
                      >
                        <div>
                          <div className="font-medium">
                            {app.customer?.firstName} {app.customer?.lastName}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {app.customer?.email}
                          </div>
                          <div className="text-xs mt-1">
                            {approvedSteps}/{totalSteps} steps approved
                          </div>
                        </div>
                        <div className="flex items-center space-x-2 ml-4">
                          <Badge
                            variant={
                              app.status === "In Progress"
                                ? "secondary"
                                : "default"
                            }
                            className={
                              app.status === "In Progress"
                                ? "bg-yellow-100 text-yellow-800"
                                : ""
                            }
                          >
                            {app.status}
                          </Badge>
                          <Button size="sm" variant="outline" asChild>
                            <Link
                              to={`/agent/applications?selected=${app._id}`}
                            >
                              View
                            </Link>
                          </Button>
                          {/* Approve/Reject buttons for current step */}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <hr className="my-8 border-gray-200" />

      {/* All Applications List */}
      <Card className="mt-10 shadow-lg rounded-xl">
        <CardHeader>
          <CardTitle>All Applications</CardTitle>
          <CardDescription>
            List of all applications assigned to you
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <PageLoader message="Loading applications..." />
          ) : applications.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              No applications found
            </div>
          ) : (
            <div className="space-y-2">
              {applications.map((app) => {
                // Find first non-approved step
                const currentStep =
                  app.steps?.find((step) => step.status !== "Approved") ||
                  app.steps?.[app.steps.length - 1];
                return (
                  <div
                    key={app._id}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div>
                      <div className="font-medium">
                        {app.customer?.firstName} {app.customer?.lastName}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {app.customer?.email} • {app._id}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button size="sm" variant="outline" asChild>
                        <Link to={`/agent/applications?selected=${app._id}`}>
                          Open
                        </Link>
                      </Button>
                      {/* Approve/Reject buttons for current step */}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
    </div>
  );
};

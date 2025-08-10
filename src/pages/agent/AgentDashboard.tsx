import { useState, useEffect, useCallback } from "react";
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
  Bell,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { RootState } from "@/app/store";
import axios from "axios";
import { useToast } from "@/hooks/use-toast";
import { PageLoader } from "@/components/ui/page-loader";
import type { Application } from "@/types";

interface Notification {
  _id: string;
  title: string;
  message: string;
  type: string;
  status: "Read" | "Unread";
  createdAt: string;
  updatedAt: string;
}
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

  // Notification states
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loadingNotifications, setLoadingNotifications] = useState(false);
  const [previousNotificationCount, setPreviousNotificationCount] = useState(0);

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

  // Fetch notifications for agent
  const fetchNotifications = useCallback(async () => {
    if (!token || !user?.id) return;
    try {
      setLoadingNotifications(true);
      const response = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/api/notification/agent/${user.id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const newNotifications = response.data.data || [];

      // Check if there are new unread notifications
      const currentUnreadCount = newNotifications.filter(
        (n) => n.status === "Unread"
      ).length;
      if (
        currentUnreadCount > previousNotificationCount &&
        previousNotificationCount > 0
      ) {
        toast({
          title: "New Notifications",
          description: `You have ${currentUnreadCount} unread notifications`,
          variant: "default",
        });
      }

      setPreviousNotificationCount(currentUnreadCount);
      setNotifications(newNotifications);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      setNotifications([]);
    } finally {
      setLoadingNotifications(false);
    }
  }, [token, user?.id, previousNotificationCount, toast]);

  useEffect(() => {
    fetchApplications();
    fetchNotifications();
  }, [token, toast, fetchNotifications]);

  // Refresh notifications every 30 seconds
  useEffect(() => {
    if (!token || !user?.id) return;

    const interval = setInterval(() => {
      fetchNotifications();
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [token, user?.id, fetchNotifications]);

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
        `${import.meta.env.VITE_BASE_URL}/api/application/step-status/${
          application._id
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

  // Mark notification as read
  const markAsRead = async (notificationId: string) => {
    try {
      await axios.patch(
        `${
          import.meta.env.VITE_BASE_URL
        }/api/notification/read/${notificationId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      // Update the notification status locally
      setNotifications((prev) =>
        prev.map((notification) =>
          notification._id === notificationId
            ? { ...notification, status: "Read" }
            : notification
        )
      );
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  // Clear all notifications
  const clearAllNotifications = async () => {
    try {
      await axios.patch(
        `${import.meta.env.VITE_BASE_URL}/api/notification/clear-all`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      // Clear notifications locally
      setNotifications([]);
      toast({
        title: "Notifications cleared",
        description: "All notifications have been cleared.",
      });
    } catch (error) {
      console.error("Error clearing notifications:", error);
      toast({
        title: "Error",
        description: "Failed to clear notifications. Please try again.",
        variant: "destructive",
      });
    }
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
    unreadNotifications: notifications.filter((n) => n.status === "Unread")
      .length,
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
          <div className="flex items-center gap-3">
            <h1 className="text-4xl font-bold text-primary">Agent Dashboard</h1>
            {stats.unreadNotifications > 0 && (
              <Badge variant="secondary" className="text-sm">
                {stats.unreadNotifications} notifications
              </Badge>
            )}
          </div>
          <p className="text-lg text-muted-foreground">
            Manage your client applications and track progress
          </p>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
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
        <Card className="shadow-lg rounded-xl hover:shadow-xl transition-shadow">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-lg text-muted-foreground">Notifications</p>
              <p className="text-3xl font-bold">{stats.unreadNotifications}</p>
            </div>
            <Bell className="h-10 w-10 text-blue-600" />
          </CardContent>
        </Card>
      </div>

      <hr className="my-8 border-gray-200" />

      {/* Notifications Section */}
      <div className="mb-10">
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <Bell className="h-6 w-6 text-blue-600" />
          Notifications
        </h2>
        <Card className="shadow-lg rounded-xl">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Recent Notifications</CardTitle>
                <CardDescription>Important updates and alerts</CardDescription>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearAllNotifications}
                >
                  Clear All
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loadingNotifications ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="p-4 rounded-lg bg-gray-100 animate-pulse"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gray-200 rounded"></div>
                      <div className="flex-1">
                        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : notifications.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Bell className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <div>No notifications</div>
                <p className="text-sm">You're all caught up!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {notifications.slice(0, 5).map((notification) => (
                  <div
                    key={notification._id}
                    className={`p-4 rounded-lg transition-all hover:shadow-sm cursor-pointer ${
                      notification.status === "Unread"
                        ? "bg-blue-50 border border-blue-200"
                        : "bg-gray-50 border border-gray-200"
                    }`}
                    onClick={() => {
                      if (notification.status === "Unread") {
                        markAsRead(notification._id);
                      }
                    }}
                  >
                    <div className="flex items-start gap-3">
                      <Bell className="h-4 w-4 text-blue-600 mt-0.5" />
                      <div className="flex-1 min-w-0">
                        <h5 className="font-medium text-sm truncate">
                          {notification.title}
                        </h5>
                        <p className="text-sm text-gray-600 truncate">
                          {notification.message}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(
                            notification.createdAt
                          ).toLocaleDateString()}
                        </p>
                      </div>
                      {notification.status === "Unread" && (
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      )}
                    </div>
                  </div>
                ))}
                {notifications.length > 5 && (
                  <div className="text-center pt-2">
                    <Button variant="outline" size="sm">
                      View All ({notifications.length})
                    </Button>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Notification Tasks */}
      <div className="mb-10">
        <Card className="shadow-lg rounded-xl">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <Bell className="h-6 w-6 text-blue-600" />
              <h3 className="text-lg font-semibold">Notification Tasks</h3>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-3 h-3 rounded-full ${
                      stats.unreadNotifications > 0
                        ? "bg-blue-500"
                        : "bg-green-500"
                    }`}
                  ></div>
                  <span className="text-sm">Check Notifications</span>
                </div>
                <Badge
                  variant={
                    stats.unreadNotifications > 0 ? "secondary" : "default"
                  }
                >
                  {stats.unreadNotifications > 0
                    ? `${stats.unreadNotifications} unread`
                    : "All caught up"}
                </Badge>
              </div>
            </div>
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

import React from "react";
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
  Shield,
  FileText,
  Bell,
  TrendingUp,
  Clock,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  UserCheck,
  Eye,
  XCircle,
  DollarSign,
  UserCog,
  MessageSquare,
} from "lucide-react";
import { Link } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { PageLoader } from "@/components/ui/page-loader";
import axios from "axios";
import { useState, useEffect, useCallback } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/app/store";

interface Application {
  _id: string;
  customer:
    | string
    | {
        _id: string;
        firstName: string;
        lastName: string;
        email: string;
        phoneNumber?: string;
      };
  status: string;
  steps: Array<{
    stepName: string;
    status: string;
  }>;
  createdAt: string;
}

export const ManagerDashboard: React.FC = () => {
  const { toast } = useToast();
  const { token, user } = useSelector((state: RootState) => state.customerAuth);

  // Loading states
  const [isLoading, setIsLoading] = useState(true);
  const [loadingAgents, setLoadingAgents] = useState(false);
  const [loadingCustomers, setLoadingCustomers] = useState(false);
  const [loadingApplications, setLoadingApplications] = useState(false);
  const [loadingNotifications, setLoadingNotifications] = useState(false);

  // Data states
  const [recentAgents, setRecentAgents] = useState<any[]>([]);
  const [allCustomers, setAllCustomers] = useState<any[]>([]);
  const [allApplications, setAllApplications] = useState<Application[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Memoized fetch functions to prevent unnecessary re-renders
  const fetchAgents = useCallback(async () => {
    if (!token) return;

    setLoadingAgents(true);
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/api/user/agents`,
        {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        }
      );
      const agents = res.data.data || [];

      // Get customer count for each agent using the new API endpoint
      const agentsWithCustomerCount = await Promise.all(
        agents.map(async (agent) => {
          try {
            const customerCountRes = await axios.get(
              `${import.meta.env.VITE_BASE_URL}/api/dashboard/agent/${
                agent._id
              }/customers`,
              {
                headers: { Authorization: `Bearer ${token}` },
              }
            );

            return {
              ...agent,
              customers: customerCountRes.data.customerCount || 0,
            };
          } catch (err) {
            console.error(
              `Error fetching customer count for agent ${agent._id}:`,
              err
            );
            return {
              ...agent,
              customers: 0,
            };
          }
        })
      );

      setRecentAgents(agentsWithCustomerCount);
    } catch (err) {
      console.error("Error fetching agents:", err);
      setRecentAgents([]);
    } finally {
      setLoadingAgents(false);
    }
  }, [token]);

  const fetchCustomers = useCallback(async () => {
    if (!token) return;

    setLoadingCustomers(true);
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/api/user/customers`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setAllCustomers(response.data.data || []);
    } catch (error) {
      console.error("Error fetching customers:", error);
      setAllCustomers([]);
    } finally {
      setLoadingCustomers(false);
    }
  }, [token]);

  const fetchApplications = useCallback(async () => {
    if (!token) return;

    setLoadingApplications(true);
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/api/application`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setAllApplications(response.data.data || []);
    } catch (error) {
      console.error("Error fetching applications:", error);
      setAllApplications([]);
    } finally {
      setLoadingApplications(false);
    }
  }, [token]);

  const fetchNotifications = useCallback(async () => {
    if (!token || !user?.userId) return;
    try {
      setLoadingNotifications(true);
      const response = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/api/notification/admin/${
          user.userId
        }`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setNotifications(response.data.data || []);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      setNotifications([]);
    } finally {
      setLoadingNotifications(false);
    }
  }, [token, user?.userId]);

  useEffect(() => {
    fetchAgents();
    fetchCustomers();
    fetchApplications();
    fetchNotifications();
  }, [
    token,
    fetchAgents,
    fetchCustomers,
    fetchApplications,
    fetchNotifications,
  ]);

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

  console.log("Recent Agents:", recentAgents.length);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await Promise.all([
        fetchAgents(),
        fetchCustomers(),
        fetchApplications(),
        fetchNotifications(),
      ]);
      toast({
        title: "Refreshed",
        description: "Dashboard data has been updated.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to refresh dashboard data.",
        variant: "destructive",
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  console.log("All Applications:", allApplications.length);
  console.log("Applications data:", allApplications);
  console.log("All Customers:", allCustomers.length);
  console.log("Customers data:", allCustomers);

  // Calculate application status breakdown
  const applicationStatusCounts = {
    inProgress: allApplications.filter((app) => app.status === "In Progress")
      .length,
    awaitingClientAction: allApplications.filter(
      (app) => app.status === "Awaiting Client Action"
    ).length,
    underReview: allApplications.filter((app) => app.status === "Under Review")
      .length,
    approved: allApplications.filter((app) => app.status === "Approved").length,
    rejected: allApplications.filter((app) => app.status === "Rejected").length,
  };

  // Calculate completion rate
  const totalApplications = allApplications.length;
  const completedApplications = allApplications.filter(
    (app) => app.status === "Completed" || app.status === "Approved"
  ).length;
  const completionRate =
    totalApplications > 0
      ? Math.round((completedApplications / totalApplications) * 100)
      : 0;

  // Calculate pending applications (not completed)
  const pendingApplications = allApplications.filter(
    (app) => app.status !== "Completed" && app.status !== "Approved"
  ).length;

  // Calculate active agents
  const activeAgents = recentAgents.filter(
    (agent) => agent.status === "active"
  ).length;

  // Track overall loading state
  useEffect(() => {
    const allDataLoaded =
      !loadingAgents &&
      !loadingCustomers &&
      !loadingApplications &&
      !loadingNotifications;
    setIsLoading(!allDataLoaded);
  }, [
    loadingAgents,
    loadingCustomers,
    loadingApplications,
    loadingNotifications,
  ]);

  const stats = {
    totalAgents: recentAgents.length,
    totalCustomers: allCustomers.length,
    completionRate: completionRate,
    pendingPayments: 0, // Static value as requested
  };

  // Daily tasks for managers
  const dailyTasks = [
    {
      id: 1,
      title: "Review Pending Applications",
      description: `${pendingApplications} applications need attention`,
      icon: AlertCircle,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
      link: "/manager/applications",
      completed: pendingApplications === 0,
    },
    {
      id: 2,
      title: "Check Agent Performance",
      description: `${activeAgents} active agents to review`,
      icon: UserCheck,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      link: "/manager/agents",
      completed: false,
    },
    {
      id: 3,
      title: "Monitor Completed Applications",
      description: `${completedApplications} applications completed today`,
      icon: CheckCircle,
      color: "text-green-600",
      bgColor: "bg-green-50",
      link: "/manager/applications",
      completed: completedApplications > 0,
    },
    {
      id: 4,
      title: "Review Customer Feedback",
      description: "Check customer satisfaction and feedback",
      icon: Eye,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      link: "/manager/customers",
      completed: false,
    },
  ];

  // Loading state
  if (isLoading) {
    return <PageLoader message="Loading dashboard data..." size="lg" />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <div className="">
          <h1 className="text-3xl font-bold text-primary">Manager Dashboard</h1>
          <p className="text-muted-foreground">
            Overview of all operations and performance
          </p>
        </div>
        <Button
          onClick={handleRefresh}
          disabled={isRefreshing}
          variant="outline"
          size="sm"
        >
          <RefreshCw
            className={`h-4 w-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`}
          />
          {isRefreshing ? "Refreshing..." : "Refresh"}
        </Button>
      </div>

      {/* Application Status Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">In Progress</p>
                <p className="text-2xl font-bold">
                  {applicationStatusCounts.inProgress}
                </p>
              </div>
              <Clock className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">
                  Awaiting Client Action
                </p>
                <p className="text-2xl font-bold">
                  {applicationStatusCounts.awaitingClientAction}
                </p>
              </div>
              <AlertCircle className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Under Review</p>
                <p className="text-2xl font-bold">
                  {applicationStatusCounts.underReview}
                </p>
              </div>
              <Eye className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Approved</p>
                <p className="text-2xl font-bold">
                  {applicationStatusCounts.approved}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Rejected</p>
                <p className="text-2xl font-bold">
                  {applicationStatusCounts.rejected}
                </p>
              </div>
              <XCircle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Key Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Agents</p>
                <p className="text-2xl font-bold">{stats.totalAgents}</p>
              </div>
              <UserCog className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Customers</p>
                <p className="text-2xl font-bold">{stats.totalCustomers}</p>
              </div>
              <Users className="h-8 w-8 text-secondary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Completion Rate</p>
                <p className="text-2xl font-bold">{stats.completionRate}%</p>
                <p className="text-xs text-muted-foreground">
                  {completedApplications}/{totalApplications} applications
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pending Payment</p>
                <p className="text-2xl font-bold">{stats.pendingPayments}</p>
              </div>
              <DollarSign className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Customers and Notifications in same row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Customers */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Recent Customers (Top 5)</CardTitle>
                <CardDescription>Newly registered customers</CardDescription>
              </div>
              <Button asChild variant="outline" size="sm">
                <Link to="/manager/customers">See All</Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {allCustomers
                .sort(
                  (a, b) =>
                    new Date(b.createdAt).getTime() -
                    new Date(a.createdAt).getTime()
                )
                .slice(0, 5)
                .map((customer, index) => {
                  console.log(`Processing customer ${customer._id}:`, customer);
                  // Find the customer's application
                  const customerApplication = allApplications.find((app) => {
                    // Handle populated customer object
                    if (
                      app.customer &&
                      typeof app.customer === "object" &&
                      "_id" in app.customer
                    ) {
                      const match =
                        (app.customer as { _id: string })._id === customer._id;
                      if (match) {
                        console.log(
                          `Found application for customer ${customer._id}:`,
                          app
                        );
                      }
                      return match;
                    }
                    // Handle customer as string ID
                    if (app.customer && typeof app.customer === "string") {
                      const match = app.customer === customer._id;
                      if (match) {
                        console.log(
                          `Found application for customer ${customer._id}:`,
                          app
                        );
                      }
                      return match;
                    }
                    return false;
                  });

                  // Find assigned agent
                  const assignedAgent = recentAgents.find(
                    (agent) => agent._id === customer.assignedAgentId
                  );

                  return (
                    <div
                      key={customer._id || index}
                      className="p-3 border rounded-lg space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <p className="font-medium">
                            {customer.firstName} {customer.lastName}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {customer.email}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {customer.phoneNumber || "No phone"}
                          </p>
                        </div>
                        <Badge
                          variant="default"
                          className="bg-blue-100 text-blue-800"
                        >
                          Customer
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <span className="text-muted-foreground">
                            Application:
                          </span>
                          <span className="ml-1 font-medium">
                            {customerApplication ? "Created" : "Not created"}
                          </span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Status:</span>
                          <span className="ml-1">
                            {customerApplication?.status ? (
                              <Badge
                                variant="outline"
                                className={`text-xs ${
                                  customerApplication.status === "New" ||
                                  customerApplication.status ===
                                    "Ready for Processing"
                                    ? "bg-blue-100 text-blue-800 border-blue-200"
                                    : customerApplication.status ===
                                        "In Progress" ||
                                      customerApplication.status ===
                                        "Waiting for Agent Review"
                                    ? "bg-yellow-100 text-yellow-800 border-yellow-200"
                                    : customerApplication.status ===
                                        "Completed" ||
                                      customerApplication.status === "Approved"
                                    ? "bg-green-100 text-green-800 border-green-200"
                                    : customerApplication.status ===
                                        "Rejected" ||
                                      customerApplication.status === "Declined"
                                    ? "bg-red-100 text-red-800 border-red-200"
                                    : customerApplication.status ===
                                      "Awaiting Client Response"
                                    ? "bg-orange-100 text-orange-800 border-orange-200"
                                    : "bg-gray-100 text-gray-800 border-gray-200"
                                }`}
                              >
                                {customerApplication.status}
                              </Badge>
                            ) : (
                              <span className="text-muted-foreground text-xs">
                                No application
                              </span>
                            )}
                          </span>
                        </div>
                        <div className="col-span-2">
                          <span className="text-muted-foreground">Agent:</span>
                          <span className="ml-1 font-medium">
                            {assignedAgent
                              ? `${
                                  assignedAgent.fullName || assignedAgent.name
                                }`
                              : "Not assigned"}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              {allCustomers.length === 0 && (
                <div className="text-center py-4">
                  <Users className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">
                    No customers yet
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Notifications</CardTitle>
                <CardDescription>Important updates and alerts</CardDescription>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    // Clear all notifications
                    setNotifications([]);
                    toast({
                      title: "Notifications cleared",
                      description: "All notifications have been cleared.",
                    });
                  }}
                >
                  Clear All
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    if (token && user?.userId) {
                      const fetchNotifications = async () => {
                        setLoadingNotifications(true);
                        try {
                          const response = await axios.get(
                            `${
                              import.meta.env.VITE_BASE_URL
                            }/api/notification/admin/${user.userId}`,
                            {
                              headers: { Authorization: `Bearer ${token}` },
                            }
                          );
                          setNotifications(response.data.data || []);
                        } catch (error) {
                          console.error("Error fetching notifications:", error);
                        } finally {
                          setLoadingNotifications(false);
                        }
                      };
                      fetchNotifications();
                    }
                  }}
                  disabled={loadingNotifications}
                >
                  <RefreshCw
                    className={`h-4 w-4 ${
                      loadingNotifications ? "animate-spin" : ""
                    }`}
                  />
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
            ) : (
              <div className="space-y-3">
                {/* KYC Review Card */}
                <div className="p-4 rounded-lg bg-yellow-50 border border-yellow-200">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                      <Clock className="h-5 w-5 text-yellow-700" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-yellow-800 text-sm">
                        Review KYC Documents
                      </h3>
                      <p className="text-yellow-600 text-xs">
                        {pendingApplications} customers waiting for verification
                      </p>
                    </div>
                  </div>
                </div>

                {/* Customer Messages Card */}
                <div className="p-4 rounded-lg bg-blue-50 border border-blue-200">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                      <MessageSquare className="h-5 w-5 text-blue-700" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-blue-800 text-sm">
                        Customer Messages
                      </h3>
                      <p className="text-blue-600 text-xs">
                        {
                          notifications.filter((n) => n.type === "message")
                            .length
                        }{" "}
                        unread messages requiring response
                      </p>
                    </div>
                  </div>
                </div>

                {/* License Applications Card */}
                <div className="p-4 rounded-lg bg-green-50 border border-green-200">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                      <FileText className="h-5 w-5 text-green-700" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-green-800 text-sm">
                        License Applications
                      </h3>
                      <p className="text-green-600 text-xs">
                        {
                          allApplications.filter(
                            (app) => app.status === "Ready for Processing"
                          ).length
                        }{" "}
                        applications ready for submission
                      </p>
                    </div>
                  </div>
                </div>

                {/* Dynamic notifications from API */}
                {notifications.length > 0 && (
                  <div className="pt-3 border-t border-gray-200">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">
                      Recent Notifications
                    </h4>
                    <div className="space-y-2 max-h-32 overflow-y-auto">
                      {notifications.slice(0, 3).map((notification) => (
                        <div
                          key={notification._id}
                          className={`p-2 rounded-lg transition-all hover:shadow-sm cursor-pointer ${
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
                          <div className="flex items-start gap-2">
                            <Bell className="h-3 w-3 text-blue-600 mt-0.5" />
                            <div className="flex-1 min-w-0">
                              <h5 className="font-medium text-xs truncate">
                                {notification.title}
                              </h5>
                              <p className="text-xs text-gray-600 truncate">
                                {notification.message}
                              </p>
                            </div>
                            {notification.status === "Unread" && (
                              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

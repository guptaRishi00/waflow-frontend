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
import axios from "axios";
import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/app/store";

export const ManagerDashboard: React.FC = () => {
  const { toast } = useToast();
  const { token, user } = useSelector((state: RootState) => state.customerAuth);
  // Move recent agents to state
  const [recentAgents, setRecentAgents] = useState<any[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loadingNotifications, setLoadingNotifications] = useState(false);

  // Fetch agents from backend on mount
  useEffect(() => {
    const fetchAgents = async () => {
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
        setRecentAgents([]);
      }
    };
    if (token) fetchAgents();
  }, [token]);

  // Fetch notifications
  useEffect(() => {
    const fetchNotifications = async () => {
      if (!token || !user?.userId) return;

      setLoadingNotifications(true);
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_BASE_URL}/api/notification/admin/${
            user.userId
          }`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setNotifications(response.data.data || []);
      } catch (error) {
        console.error("Error fetching notifications:", error);
        setNotifications([]);
      } finally {
        setLoadingNotifications(false);
      }
    };

    fetchNotifications();
  }, [token, user?.userId]);

  // Mark notification as read
  const markAsRead = async (notificationId: string) => {
    try {
      await axios.patch(
        `${
          import.meta.env.VITE_BASE_URL
        }/api/notification/read/${notificationId}`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
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

  const [allCustomers, setAllCustomers] = useState<any[]>([]);

  useEffect(() => {
    const fetchCustomer = async () => {
      const response = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/api/user/customers`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setAllCustomers(response.data.data || []);
    };
    fetchCustomer();
  }, []);

  const [allApplications, setAllApplications] = useState<any[]>([]);

  const fetchApplications = async () => {
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
    }
  };

  useEffect(() => {
    if (token) {
      fetchApplications();
    }
  }, [token]);

  // Refresh applications every 30 seconds to get latest status updates
  useEffect(() => {
    if (token) {
      const interval = setInterval(() => {
        fetchApplications();
      }, 30000); // 30 seconds

      return () => clearInterval(interval);
    }
  }, [token]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await fetchApplications();
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

  // Calculate completed applications
  const completedApplications = allApplications.filter(
    (app) => app.status === "Completed"
  ).length;

  // Calculate pending applications (not completed)
  const pendingApplications = allApplications.filter(
    (app) => app.status !== "Completed"
  ).length;

  // Calculate active agents
  const activeAgents = recentAgents.filter(
    (agent) => agent.status === "active"
  ).length;

  const stats = {
    totalAgents: recentAgents.length,
    totalCustomers: allCustomers.length,
    activeApplications: allApplications.length,
    completedApplications: completedApplications,
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

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Agents</p>
                <p className="text-2xl font-bold">{stats.totalAgents}</p>
              </div>
              <Shield className="h-8 w-8 text-primary" />
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
                <p className="text-sm text-muted-foreground">
                  All Applications
                </p>
                <p className="text-2xl font-bold">{stats.activeApplications}</p>
              </div>
              <FileText className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Completed</p>
                <p className="text-2xl font-bold">
                  {stats.completedApplications}
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
              <Clock className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Daily Tasks and Recent Agents in same row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Agents */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Agents</CardTitle>
            <CardDescription>Newly added agents</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentAgents.map((agent, index) => (
                <div
                  key={String(
                    ("fullName" in agent && agent.fullName) ||
                      agent.email ||
                      index
                  )}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div>
                    <p className="font-medium">
                      {String(
                        "fullName" in agent ? agent.fullName : agent.name
                      )}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {agent.email}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {agent.customers ?? 0} customers
                    </p>
                  </div>
                  <Badge
                    variant="default"
                    className="bg-green-100 text-green-800"
                  >
                    {agent.status || "active"}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <CardTitle>Notifications</CardTitle>
                  {notifications.filter((n) => n.status === "Unread").length >
                    0 && (
                    <Badge variant="destructive" className="text-xs">
                      {
                        notifications.filter((n) => n.status === "Unread")
                          .length
                      }
                    </Badge>
                  )}
                </div>
                <CardDescription>
                  Recent updates and important alerts
                </CardDescription>
              </div>
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
          </CardHeader>
          <CardContent>
            {loadingNotifications ? (
              <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="p-2 rounded-lg border-2 border-gray-200 bg-gray-50 animate-pulse"
                  >
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                ))}
              </div>
            ) : notifications.length > 0 ? (
              <div className="space-y-2">
                {notifications.map((notification) => (
                  <div
                    key={notification._id}
                    className={`p-3 rounded-lg border-2 transition-all hover:shadow-md cursor-pointer ${
                      notification.status === "Unread"
                        ? "border-blue-200 bg-blue-50"
                        : "border-gray-200 bg-white hover:border-gray-300"
                    }`}
                    onClick={() => {
                      if (notification.status === "Unread") {
                        markAsRead(notification._id);
                      }
                    }}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Bell className="h-4 w-4 text-blue-600" />
                          <h3 className="font-medium text-sm">
                            {notification.title}
                          </h3>
                          {notification.status === "Unread" && (
                            <Badge variant="secondary" className="text-xs">
                              New
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground ml-6 mb-2">
                          {notification.message}
                        </p>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground ml-6">
                          <span>
                            {new Date(
                              notification.createdAt
                            ).toLocaleDateString()}
                          </span>
                          <span>
                            {new Date(
                              notification.createdAt
                            ).toLocaleTimeString()}
                          </span>
                          <span className="capitalize">
                            {notification.type}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4">
                <Bell className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">
                  No notifications yet
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common management tasks</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <Button asChild className="flex-1 min-w-[200px]">
              <Link to="/manager/agents">
                <Shield className="h-4 w-4 mr-2" />
                Manage Agents
              </Link>
            </Button>
            <Button asChild variant="outline" className="flex-1 min-w-[200px]">
              <Link to="/manager/customers">
                <Users className="h-4 w-4 mr-2" />
                View Customers
              </Link>
            </Button>
            <Button asChild variant="outline" className="flex-1 min-w-[200px]">
              <Link to="/manager/applications">
                <FileText className="h-4 w-4 mr-2" />
                Review Applications
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

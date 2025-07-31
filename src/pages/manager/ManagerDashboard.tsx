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
  const { token } = useSelector((state: RootState) => state.customerAuth);
  // Move recent agents to state
  const [recentAgents, setRecentAgents] = useState<any[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);

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

        {/* Daily Tasks */}
        <Card>
          <CardHeader>
            <CardTitle>Notifications</CardTitle>
            <CardDescription>
              Key tasks to complete today for optimal operations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {dailyTasks.map((task) => {
                const IconComponent = task.icon;
                return (
                  <Link key={task.id} to={task.link} className="block">
                    <div
                      className={`p-2 rounded-lg border-2 transition-all hover:shadow-md ${
                        task.completed
                          ? "border-green-200 bg-green-50"
                          : "border-gray-200 bg-white hover:border-gray-300"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <IconComponent
                              className={`h-3 w-3 ${task.color}`}
                            />
                            <h3 className="font-medium text-xs">
                              {task.title}
                            </h3>
                            {task.completed && (
                              <CheckCircle className="h-3 w-3 text-green-600" />
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground ml-5">
                            {task.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
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

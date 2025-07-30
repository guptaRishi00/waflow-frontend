import React, { useEffect, useState } from "react";
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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Plus,
  Search,
  MoreHorizontal,
  Eye,
  EyeOff,
  Edit,
  UserX,
  UserCheck,
  Phone,
  Mail,
  Calendar,
  Users,
  FileText,
  TrendingUp,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ApplicationDetailsModal } from "@/components/common/ApplicationDetailsModal";
import { mockApplications } from "@/lib/mock-data";
import type { Application } from "@/types";
import axios from "axios";
import { useSelector } from "react-redux";
import { RootState } from "@/app/store";
import { useNavigate } from "react-router-dom";

// Mock agents data
const mockAgents = [
  {
    id: "1",
    name: "Sarah Johnson",
    email: "sarah.johnson@waflow.com",
    phone: "+971-50-234-5678",
    customersAssigned: 12,
    status: "active",
    createdAt: "2024-01-15",
    applications: ["APP-2024-001", "APP-2024-003", "APP-2024-007"],
    completionRate: 95,
    avgResponseTime: "2.3 hours",
  },
  {
    id: "2",
    name: "Ahmed Al Mahmoud",
    email: "ahmed.mahmoud@waflow.com",
    phone: "+971-55-345-6789",
    customersAssigned: 8,
    status: "active",
    createdAt: "2024-02-20",
    applications: ["APP-2024-002", "APP-2024-005"],
    completionRate: 88,
    avgResponseTime: "1.8 hours",
  },
  {
    id: "3",
    name: "Lisa Chen",
    email: "lisa.chen@waflow.com",
    phone: "+971-52-456-7890",
    customersAssigned: 15,
    status: "inactive",
    createdAt: "2023-11-10",
    applications: ["APP-2024-004", "APP-2024-006", "APP-2024-008"],
    completionRate: 92,
    avgResponseTime: "3.1 hours",
  },
];

export const AgentsPage: React.FC = () => {
  const navigate = useNavigate();
  const [agents, setAgents] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<any>(null);
  const [selectedApplication, setSelectedApplication] =
    useState<Application | null>(null);
  const [isApplicationModalOpen, setIsApplicationModalOpen] = useState(false);
  const [newAgent, setNewAgent] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
  });
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});
  const [showPassword, setShowPassword] = useState(false);
  const { toast } = useToast();

  // Password strength validation
  const checkPasswordStrength = (password: string) => {
    const hasCapital = /[A-Z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);
    const hasMinLength = password.length >= 8;

    return {
      hasCapital,
      hasNumber,
      hasSpecial,
      hasMinLength,
      isStrong: hasCapital && hasNumber && hasSpecial && hasMinLength,
    };
  };

  const passwordStrength = checkPasswordStrength(newAgent.password);

  const { token, user } = useSelector((state: RootState) => state.customerAuth);

  // const filteredAgents = agents.filter(
  //   (agent) =>
  //     agent.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
  //     agent.email.toLowerCase().includes(searchTerm.toLowerCase())
  // );

  const handleCreateAgent = () => {
    // Validate form
    const errors: { [key: string]: string } = {};

    if (!newAgent.name) errors.name = "Name is required";
    if (!newAgent.email) errors.email = "Email is required";
    if (!newAgent.phone) errors.phone = "Phone is required";
    if (!newAgent.password) {
      errors.password = "Password is required";
    } else if (!passwordStrength.isStrong) {
      errors.password =
        "Password must be strong (capital letter, number, special character, min 8 chars)";
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    toast({
      title: "Agent Created",
      description: `New agent ${newAgent.name} has been created successfully.`,
    });
    setIsCreateModalOpen(false);
    setNewAgent({ name: "", email: "", phone: "", password: "" });
    setFormErrors({});
  };

  const handleEditAgent = () => {
    toast({
      title: "Agent Updated",
      description: `Agent ${selectedAgent?.name} has been updated successfully.`,
    });
    setIsEditModalOpen(false);
  };

  const handleToggleStatus = (agent: any) => {
    const newStatus = agent.status === "active" ? "inactive" : "active";
    toast({
      title: "Status Updated",
      description: `Agent ${agent.name} has been ${
        newStatus === "active" ? "activated" : "deactivated"
      }.`,
    });
  };

  const handleViewApplication = (applicationId: string) => {
    const application = mockApplications.find(
      (app) => app.id === applicationId
    );
    if (application) {
      setSelectedApplication(application);
      setIsApplicationModalOpen(true);
    }
  };

  const generatePassword = () => {
    // Generate a strong password that meets all requirements
    const chars = "abcdefghijklmnopqrstuvwxyz";
    const numbers = "0123456789";
    const special = "!@#$%^&*";
    const capital = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

    let password = "";

    // Ensure at least one of each required character type
    password += capital[Math.floor(Math.random() * capital.length)]; // Capital letter
    password += numbers[Math.floor(Math.random() * numbers.length)]; // Number
    password += special[Math.floor(Math.random() * special.length)]; // Special character

    // Fill the rest with random characters to reach minimum length
    const allChars = chars + numbers + special + capital;
    for (let i = 0; i < 5; i++) {
      password += allChars[Math.floor(Math.random() * allChars.length)];
    }

    // Shuffle the password to make it more random
    password = password
      .split("")
      .sort(() => Math.random() - 0.5)
      .join("");

    setNewAgent({ ...newAgent, password });
  };

  useEffect(() => {
    const fetchAgents = async () => {
      try {
        setIsLoading(true);
        setError("");
        console.log("Fetching agents...");
        console.log("Token:", token);
        console.log("User:", user);
        console.log("User role:", user?.role);
        console.log("API URL:", import.meta.env.VITE_BASE_URL);

        const baseUrl =
          import.meta.env.VITE_BASE_URL || "http://localhost:5000";
        console.log("Using base URL:", baseUrl);

        const response = await axios.get(
          // `${import.meta.env.VITE_BASE_URL}/api/user/agents`,
          `${baseUrl}/api/user/agents`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        console.log("Fetched agents:", response.data);
        setAgents(response.data.data);
      } catch (error) {
        console.error("Error fetching agents:", error);
        console.error("Error response:", error.response?.data);
        console.error("Error status:", error.response?.status);

        let errorMessage = "Failed to fetch agents";

        if (error.response?.status === 403) {
          console.error("Access denied - User role may not have permission");
          console.error("Required roles: admin, manager");
          console.error("Current user role:", user?.role);
          errorMessage =
            "Access denied. You don't have permission to view agents.";
        } else if (error.response?.status === 401) {
          console.error("Unauthorized - Token may be invalid or expired");
          errorMessage = "Unauthorized. Please log in again.";
        } else if (!error.response) {
          console.error("Network error - Backend server may not be running");
          errorMessage =
            "Network error. Please check if the backend server is running.";
        }

        setError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    if (token) {
      if (user?.role === "admin" || user?.role === "manager") {
        fetchAgents();
      } else {
        console.error("User does not have permission to view agents");
        console.error("Required roles: admin, manager");
        console.error("Current user role:", user?.role);
      }
    } else {
      console.error("No token available");
    }
  }, [token, user]);

  console.log("Agents data:", agents);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-primary">Agents Management</h1>
          <p className="text-muted-foreground">
            Manage your team of agents and their performance
          </p>
        </div>
        <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary/90">
              <Plus className="h-4 w-4 mr-2" />
              Create New Agent
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Agent</DialogTitle>
              <DialogDescription>
                Add a new agent to your team. All fields are required. Login
                credentials will be sent via email.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  value={newAgent.name}
                  onChange={(e) =>
                    setNewAgent({ ...newAgent, name: e.target.value })
                  }
                  placeholder="Enter agent's full name"
                  className={formErrors.name ? "border-red-500" : ""}
                />
                {formErrors.name && (
                  <p className="text-xs text-red-500 mt-1">{formErrors.name}</p>
                )}
              </div>
              <div>
                <Label htmlFor="email">Email Address *</Label>
                <Input
                  id="email"
                  type="email"
                  value={newAgent.email}
                  onChange={(e) =>
                    setNewAgent({ ...newAgent, email: e.target.value })
                  }
                  placeholder="agent@waflow.com"
                  className={formErrors.email ? "border-red-500" : ""}
                />
                {formErrors.email && (
                  <p className="text-xs text-red-500 mt-1">
                    {formErrors.email}
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="phone">Phone Number *</Label>
                <Input
                  id="phone"
                  value={newAgent.phone}
                  onChange={(e) =>
                    setNewAgent({ ...newAgent, phone: e.target.value })
                  }
                  placeholder="+971-XX-XXX-XXXX"
                  className={formErrors.phone ? "border-red-500" : ""}
                />
                {formErrors.phone && (
                  <p className="text-xs text-red-500 mt-1">
                    {formErrors.phone}
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="password">Password *</Label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={newAgent.password}
                      onChange={(e) =>
                        setNewAgent({ ...newAgent, password: e.target.value })
                      }
                      placeholder="Enter password"
                      className={`pr-10 ${
                        formErrors.password ? "border-red-500" : ""
                      }`}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={generatePassword}
                  >
                    Auto Generate
                  </Button>
                </div>
                {/* Password Strength Indicator */}
                {newAgent.password && (
                  <div className="mt-2 space-y-2">
                    <div className="text-xs text-muted-foreground">
                      Password strength requirements:
                    </div>
                    <div className="space-y-1">
                      <div
                        className={`text-xs flex items-center gap-2 ${
                          passwordStrength.hasCapital
                            ? "text-green-600"
                            : "text-red-500"
                        }`}
                      >
                        <div
                          className={`w-2 h-2 rounded-full ${
                            passwordStrength.hasCapital
                              ? "bg-green-600"
                              : "bg-red-500"
                          }`}
                        ></div>
                        Capital letter (A-Z)
                      </div>
                      <div
                        className={`text-xs flex items-center gap-2 ${
                          passwordStrength.hasNumber
                            ? "text-green-600"
                            : "text-red-500"
                        }`}
                      >
                        <div
                          className={`w-2 h-2 rounded-full ${
                            passwordStrength.hasNumber
                              ? "bg-green-600"
                              : "bg-red-500"
                          }`}
                        ></div>
                        Number (0-9)
                      </div>
                      <div
                        className={`text-xs flex items-center gap-2 ${
                          passwordStrength.hasSpecial
                            ? "text-green-600"
                            : "text-red-500"
                        }`}
                      >
                        <div
                          className={`w-2 h-2 rounded-full ${
                            passwordStrength.hasSpecial
                              ? "bg-green-600"
                              : "bg-red-500"
                          }`}
                        ></div>
                        Special character (!@#$%^&*)
                      </div>
                      <div
                        className={`text-xs flex items-center gap-2 ${
                          passwordStrength.hasMinLength
                            ? "text-green-600"
                            : "text-red-500"
                        }`}
                      >
                        <div
                          className={`w-2 h-2 rounded-full ${
                            passwordStrength.hasMinLength
                              ? "bg-green-600"
                              : "bg-red-500"
                          }`}
                        ></div>
                        Minimum 8 characters
                      </div>
                    </div>
                    {passwordStrength.isStrong && (
                      <div className="text-xs text-green-600 font-medium">
                        ✓ Password is strong!
                      </div>
                    )}
                  </div>
                )}
                {formErrors.password && (
                  <span className="text-xs text-red-500">
                    {formErrors.password}
                  </span>
                )}
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsCreateModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreateAgent}
                className="bg-primary hover:bg-primary/90"
              >
                Create Agent
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}

      {/* Agents Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Agents</CardTitle>
          <CardDescription>
            Manage your team members and their access
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading && (
            <div className="flex items-center justify-center py-8">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                <p className="text-muted-foreground">Loading agents...</p>
              </div>
            </div>
          )}

          {error && (
            <div className="flex items-center justify-center py-8">
              <div className="text-center">
                <p className="text-red-600 mb-2">{error}</p>
                <p className="text-sm text-muted-foreground">
                  Please check the browser console for more details.
                </p>
              </div>
            </div>
          )}

          {!isLoading && !error && agents.length === 0 && (
            <div className="flex items-center justify-center py-8">
              <div className="text-center">
                <p className="text-muted-foreground">No agents found.</p>
              </div>
            </div>
          )}

          {!isLoading && !error && agents.length > 0 && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Agent</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Customers</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {agents.map((agent) => (
                  <TableRow key={agent._id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{agent.fullName}</p>
                        <p className="text-sm text-muted-foreground">
                          {agent.email}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <p className="text-sm flex items-center gap-1">
                          <Phone className="h-3 w-3" />
                          {agent.phoneNumber}
                        </p>
                        <p className="text-sm flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          {agent.email}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className="bg-blue-50 text-blue-700"
                      >
                        {agent.status} assigned
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          agent.status === "active" ? "default" : "secondary"
                        }
                        className={
                          agent.status === "active"
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }
                      >
                        {agent.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <p className="text-sm flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(agent.createdAt).toLocaleDateString()}
                      </p>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => {
                              navigate(`/manager/agents/${agent._id}`);
                            }}
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            View Profile
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => {
                              setSelectedAgent(agent);
                              setIsEditModalOpen(true);
                            }}
                          >
                            <Edit className="h-4 w-4 mr-2" />
                            Edit Details
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleToggleStatus(agent)}
                          >
                            {agent.status === "active" ? (
                              <>
                                <UserX className="h-4 w-4 mr-2" />
                                Deactivate
                              </>
                            ) : (
                              <>
                                <UserCheck className="h-4 w-4 mr-2" />
                                Activate
                              </>
                            )}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Edit Agent Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Agent Details</DialogTitle>
            <DialogDescription>
              Update agent information. Email cannot be changed.
            </DialogDescription>
          </DialogHeader>
          {selectedAgent && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-name">Full Name</Label>
                <Input
                  id="edit-name"
                  defaultValue={selectedAgent.name}
                  placeholder="Enter agent's full name"
                />
              </div>
              <div>
                <Label htmlFor="edit-email">Email Address</Label>
                <Input
                  id="edit-email"
                  type="email"
                  defaultValue={selectedAgent.email}
                  disabled
                  className="bg-gray-100"
                />
              </div>
              <div>
                <Label htmlFor="edit-phone">Phone Number</Label>
                <Input
                  id="edit-phone"
                  defaultValue={selectedAgent.phone}
                  placeholder="+971-XX-XXX-XXXX"
                />
              </div>
              <div>
                <Label>Reset Password</Label>
                <Button variant="outline" className="w-full mt-2">
                  Send Password Reset Email
                </Button>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleEditAgent}
              className="bg-primary hover:bg-primary/90"
            >
              Update Agent
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Agent Profile Modal */}
      <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Agent Profile</DialogTitle>
          </DialogHeader>
          {selectedAgent && (
            <div className="space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Name</Label>
                  <p className="font-medium">{selectedAgent.name}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Email</Label>
                  <p className="font-medium">{selectedAgent.email}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Phone</Label>
                  <p className="font-medium">{selectedAgent.phone}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Status</Label>
                  <Badge
                    variant={
                      selectedAgent.status === "active"
                        ? "default"
                        : "secondary"
                    }
                    className={
                      selectedAgent.status === "active"
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }
                  >
                    {selectedAgent.status}
                  </Badge>
                </div>
              </div>

              {/* Performance Summary */}
              <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Performance Summary
                </h3>
                <div className="grid grid-cols-3 gap-4">
                  <Card>
                    <CardContent className="pt-4">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-primary">
                          {selectedAgent.customersAssigned}
                        </p>
                        <p className="text-sm text-muted-foreground flex items-center justify-center gap-1">
                          <Users className="h-3 w-3" />
                          Customers
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-4">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-green-600">
                          {selectedAgent.completionRate}%
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Completion Rate
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-4">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-blue-600">
                          {selectedAgent.avgResponseTime}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Avg Response
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Applications Handled */}
              <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Applications Handled ({selectedAgent.applications.length})
                </h3>
                <div className="space-y-2">
                  {selectedAgent.applications.map((appId: string) => {
                    const application = mockApplications.find(
                      (app) => app.id === appId
                    );
                    return application ? (
                      <div
                        key={appId}
                        className="flex items-center justify-between p-3 border rounded-lg"
                      >
                        <div>
                          <p className="font-medium">
                            {application.businessName}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {appId} • {application.businessType}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge
                            variant={
                              application.status === "under-review"
                                ? "secondary"
                                : "default"
                            }
                            className={
                              application.status === "under-review"
                                ? "bg-yellow-100 text-yellow-800"
                                : ""
                            }
                          >
                            {application.status.replace("-", " ")}
                          </Badge>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleViewApplication(appId)}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                        </div>
                      </div>
                    ) : null;
                  })}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

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

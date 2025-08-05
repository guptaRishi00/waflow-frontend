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
  ChevronLeft,
  ChevronRight,
  ChevronDown,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { PageLoader } from "@/components/ui/page-loader";

import axios from "axios";
import { useSelector } from "react-redux";
import { RootState } from "@/app/store";

export const AgentsPage: React.FC = () => {
  const [agents, setAgents] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("active"); // "all", "active", "inactive"
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<any>(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [totalItems, setTotalItems] = useState(0);

  const [newAgent, setNewAgent] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
  });
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});
  const [showPassword, setShowPassword] = useState(false);
  const { toast } = useToast();
  const [customers, setCustomers] = useState([]);
  const [isCustomersLoading, setIsCustomersLoading] = useState(false);

  const [editFormData, setEditFormData] = useState({
    fullName: "",
    email: "",
    phoneNumber: "",
    password: "",
  });
  const [editFormErrors, setEditFormErrors] = useState<{
    [key: string]: string;
  }>({});
  const [showEditPassword, setShowEditPassword] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [agentToToggle, setAgentToToggle] = useState<any>(null);

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

  const handleCreateAgent = async () => {
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

    setIsLoading(true);
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/api/user/create-agent`,
        {
          fullName: newAgent.name,
          email: newAgent.email,
          phoneNumber: newAgent.phone,
          password: newAgent.password,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      toast({
        title: "Success",
        description: `New agent ${newAgent.name} has been created successfully.`,
      });

      // Refresh the agents list
      fetchAgents();

      setIsCreateModalOpen(false);
      setNewAgent({ name: "", email: "", phone: "", password: "" });
      setFormErrors({});
    } catch (error: any) {
      console.error("Agent creation error:", error);
      console.error("Error response:", error?.response);
      toast({
        title: "Error",
        description: error?.response?.data?.message || "Failed to create agent",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditAgent = async () => {
    if (!selectedAgent || !token) return;

    // Validate form
    const errors: { [key: string]: string } = {};
    if (!editFormData.fullName) errors.fullName = "Full name is required";
    if (!editFormData.phoneNumber)
      errors.phoneNumber = "Phone number is required";
    if (editFormData.password && editFormData.password.length < 8) {
      errors.password = "Password must be at least 8 characters";
    }

    if (Object.keys(errors).length > 0) {
      setEditFormErrors(errors);
      return;
    }

    setIsUpdating(true);
    try {
      const updateData: any = {
        fullName: editFormData.fullName,
        phoneNumber: editFormData.phoneNumber,
      };

      // Only include password if it's provided
      if (editFormData.password) {
        updateData.password = editFormData.password;
      }

      const response = await axios.put(
        `${import.meta.env.VITE_BASE_URL}/api/user/agent/${selectedAgent._id}`,
        updateData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      toast({
        title: "Success",
        description: "Agent updated successfully!",
      });

      // Update the agents list with the new data
      setAgents((prevAgents) =>
        prevAgents.map((agent) =>
          agent._id === selectedAgent._id
            ? { ...agent, ...response.data.data }
            : agent
        )
      );

      setIsEditModalOpen(false);
      setEditFormData({
        fullName: "",
        email: "",
        phoneNumber: "",
        password: "",
      });
      setEditFormErrors({});
      setShowEditPassword(false);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error?.response?.data?.message || "Failed to update agent",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleToggleStatus = (agent: any) => {
    setAgentToToggle(agent);
    setIsStatusModalOpen(true);
  };

  const confirmToggleStatus = async () => {
    if (!agentToToggle || !token) return;

    const newStatus = agentToToggle.status === "active" ? "inactive" : "active";

    setIsUpdating(true);
    try {
      const response = await axios.put(
        `${import.meta.env.VITE_BASE_URL}/api/user/agent/${agentToToggle._id}`,
        { status: newStatus },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // Update the agents list with the new status
      setAgents((prevAgents) =>
        prevAgents.map((agent) =>
          agent._id === agentToToggle._id
            ? { ...agent, status: newStatus }
            : agent
        )
      );

      toast({
        title: "Status Updated",
        description: `Agent ${agentToToggle.fullName} has been ${
          newStatus === "active" ? "activated" : "deactivated"
        } successfully.`,
      });

      setIsStatusModalOpen(false);
      setAgentToToggle(null);
    } catch (error: any) {
      toast({
        title: "Error",
        description:
          error?.response?.data?.message || "Failed to update agent status",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
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

  const fetchAgents = async () => {
    try {
      setIsLoading(true);
      setError("");
      console.log("Fetching agents...");
      console.log("Token:", token);
      console.log("User:", user);
      console.log("User role:", user?.role);
      console.log("API URL:", import.meta.env.VITE_BASE_URL);

      const baseUrl = import.meta.env.VITE_BASE_URL || "http://localhost:5000";
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

  useEffect(() => {
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

  // Fetch customers on page load for the table
  useEffect(() => {
    const fetchCustomers = async () => {
      if (!token) return;
      setIsCustomersLoading(true);
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_BASE_URL}/api/user/customers`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setCustomers(response.data.data || []);
      } catch (err) {
        toast({
          title: "Error",
          description: "Failed to load customers.",
          variant: "destructive",
        });
        setCustomers([]);
      } finally {
        setIsCustomersLoading(false);
      }
    };
    fetchCustomers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  // Update edit form when selected agent changes
  useEffect(() => {
    if (selectedAgent && isEditModalOpen) {
      setEditFormData({
        fullName: selectedAgent.fullName || "",
        email: selectedAgent.email || "",
        phoneNumber: selectedAgent.phoneNumber || "",
        password: "",
      });
      setEditFormErrors({});
      setShowEditPassword(false);
    }
  }, [selectedAgent, isEditModalOpen]);

  console.log("Agents data:", agents);
  console.log("Current status filter:", statusFilter);
  console.log(
    "Agents with their status:",
    agents.map((agent) => ({ name: agent.fullName, status: agent.status }))
  );

  // Log first few agents to see their structure
  if (agents.length > 0) {
    console.log("First agent structure:", agents[0]);
    console.log(
      "All agent statuses:",
      agents.map((agent) => agent.status)
    );
  }

  // Pagination logic
  const filteredAgents = agents.filter((agent) => {
    console.log(
      `Processing agent: ${agent.fullName}, status: ${agent.status}, filter: ${statusFilter}`
    );

    // First filter by status
    if (statusFilter !== "all" && agent.status !== statusFilter) {
      console.log(
        `Filtering out agent ${agent.fullName} with status: ${agent.status}, filter: ${statusFilter}`
      );
      return false;
    }

    // Then filter by search term
    const matchesSearch =
      agent.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      agent.email?.toLowerCase().includes(searchTerm.toLowerCase());

    console.log(`Agent ${agent.fullName} passes filters: ${matchesSearch}`);
    return matchesSearch;
  });

  // Sort agents by creation date (newest first)
  const sortedAgents = filteredAgents.sort((a, b) => {
    const dateA = new Date(a.createdAt).getTime();
    const dateB = new Date(b.createdAt).getTime();
    return dateB - dateA; // Descending order (newest first)
  });

  const totalPages = Math.ceil(sortedAgents.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedAgents = sortedAgents.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (value: string) => {
    setItemsPerPage(Number(value));
    setCurrentPage(1); // Reset to first page when changing items per page
  };

  // Reset to first page when search term or status filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter]);

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

      {/* Search and Filters */}
      <div className="flex items-center gap-2 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search agents..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">
              {statusFilter === "all"
                ? "All Status"
                : statusFilter === "active"
                ? "Active Only"
                : "Inactive Only"}
              <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setStatusFilter("all")}>
              All Agents
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setStatusFilter("active")}>
              Active Only
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setStatusFilter("inactive")}>
              Inactive Only
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">
              {itemsPerPage} items per page
              <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => handleItemsPerPageChange("5")}>
              5 items
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleItemsPerPageChange("10")}>
              10 items
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleItemsPerPageChange("20")}>
              20 items
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleItemsPerPageChange("50")}>
              50 items
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Agents Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Agents</CardTitle>
          <CardDescription>
            Manage your team members and their access
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading && <PageLoader message="Loading agents..." />}

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

          {!isLoading &&
            !error &&
            agents.length > 0 &&
            filteredAgents.length === 0 && (
              <div className="flex items-center justify-center py-8">
                <div className="text-center">
                  <p className="text-muted-foreground">
                    No agents match your search criteria.
                  </p>
                </div>
              </div>
            )}

          {!isLoading && !error && filteredAgents.length > 0 && (
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
                {paginatedAgents.map((agent) => (
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
                        {isCustomersLoading
                          ? "Loading..."
                          : `${
                              customers.filter(
                                (c) => c.assignedAgentId === agent._id
                              ).length
                            } assigned`}
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
                              setSelectedAgent(agent);
                              setIsViewModalOpen(true);
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

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-2 py-4">
          <div className="text-sm text-muted-foreground">
            Showing {startIndex + 1} to{" "}
            {Math.min(endIndex, filteredAgents.length)} of{" "}
            {filteredAgents.length} results
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              variant="outline"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

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
                <Label htmlFor="edit-name">Full Name *</Label>
                <Input
                  id="edit-name"
                  value={editFormData.fullName}
                  onChange={(e) =>
                    setEditFormData({
                      ...editFormData,
                      fullName: e.target.value,
                    })
                  }
                  placeholder="Enter agent's full name"
                  className={editFormErrors.fullName ? "border-red-500" : ""}
                />
                {editFormErrors.fullName && (
                  <p className="text-xs text-red-500 mt-1">
                    {editFormErrors.fullName}
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="edit-email">Email Address</Label>
                <Input
                  id="edit-email"
                  type="email"
                  value={editFormData.email}
                  disabled
                  className="bg-gray-100 cursor-not-allowed"
                  placeholder="Email address (read-only)"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Email address cannot be changed
                </p>
              </div>
              <div>
                <Label htmlFor="edit-phone">Phone Number *</Label>
                <Input
                  id="edit-phone"
                  value={editFormData.phoneNumber}
                  onChange={(e) =>
                    setEditFormData({
                      ...editFormData,
                      phoneNumber: e.target.value,
                    })
                  }
                  placeholder="+971-XX-XXX-XXXX"
                  className={editFormErrors.phoneNumber ? "border-red-500" : ""}
                />
                {editFormErrors.phoneNumber && (
                  <p className="text-xs text-red-500 mt-1">
                    {editFormErrors.phoneNumber}
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="edit-password">New Password (Optional)</Label>
                <div className="relative">
                  <Input
                    id="edit-password"
                    type={showEditPassword ? "text" : "password"}
                    value={editFormData.password}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        password: e.target.value,
                      })
                    }
                    placeholder="Leave blank to keep current password"
                    className={`pr-10 ${
                      editFormErrors.password ? "border-red-500" : ""
                    }`}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowEditPassword(!showEditPassword)}
                  >
                    {showEditPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                {editFormErrors.password && (
                  <p className="text-xs text-red-500 mt-1">
                    {editFormErrors.password}
                  </p>
                )}
                <p className="text-xs text-muted-foreground mt-1">
                  Leave blank to keep the current password
                </p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleEditAgent}
              disabled={isUpdating}
              className="bg-primary hover:bg-primary/90"
            >
              {isUpdating ? "Updating..." : "Update Agent"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Status Confirmation Modal */}
      <Dialog open={isStatusModalOpen} onOpenChange={setIsStatusModalOpen}>
        <DialogContent>
          {agentToToggle && (
            <>
              <DialogHeader>
                <DialogTitle>
                  {agentToToggle.status === "active"
                    ? "Deactivate Agent"
                    : "Activate Agent"}
                </DialogTitle>
                <DialogDescription>
                  {agentToToggle.status === "active"
                    ? `Are you sure you want to deactivate ${agentToToggle.fullName}? This will prevent them from accessing the system.`
                    : `Are you sure you want to activate ${agentToToggle.fullName}? This will restore their access to the system.`}
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsStatusModalOpen(false);
                    setAgentToToggle(null);
                  }}
                >
                  Cancel
                </Button>
                <Button
                  onClick={confirmToggleStatus}
                  disabled={isUpdating}
                  variant={
                    agentToToggle.status === "active"
                      ? "destructive"
                      : "default"
                  }
                  className={
                    agentToToggle.status === "active"
                      ? "bg-red-600 hover:bg-red-700"
                      : ""
                  }
                >
                  {isUpdating
                    ? "Updating..."
                    : agentToToggle.status === "active"
                    ? "Deactivate"
                    : "Activate"}
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* View Agent Profile Modal */}
      <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Agent Profile</DialogTitle>
            <DialogDescription>
              View agent information and performance details
            </DialogDescription>
          </DialogHeader>
          {selectedAgent && (
            <div className="space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Full Name</Label>
                  <p className="font-medium">{selectedAgent.fullName}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Email</Label>
                  <p className="font-medium">{selectedAgent.email}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Phone Number</Label>
                  <p className="font-medium">{selectedAgent.phoneNumber}</p>
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
                <div>
                  <Label className="text-muted-foreground">Member Since</Label>
                  <p className="font-medium">
                    {new Date(selectedAgent.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <Label className="text-muted-foreground">
                    Customers Assigned
                  </Label>
                  <p className="font-medium">
                    {isCustomersLoading
                      ? "Loading..."
                      : customers.filter(
                          (c) => c.assignedAgentId === selectedAgent._id
                        ).length}
                  </p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

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
  const [agents, setAgents] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
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
  const { toast } = useToast();

  const { token, user } = useSelector((state: RootState) => state.customerAuth);

  // const filteredAgents = agents.filter(
  //   (agent) =>
  //     agent.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
  //     agent.email.toLowerCase().includes(searchTerm.toLowerCase())
  // );

  const handleCreateAgent = () => {
    toast({
      title: "Agent Created",
      description: `New agent ${newAgent.name} has been created successfully.`,
    });
    setIsCreateModalOpen(false);
    setNewAgent({ name: "", email: "", phone: "", password: "" });
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
    const password = Math.random().toString(36).slice(-8);
    setNewAgent({ ...newAgent, password });
  };

  useEffect(() => {
    const fetchAgents = async () => {
      const response = await axios.get(
        // `${import.meta.env.VITE_API_URL}/api/user/agents`,
        `http://localhost:5000/api/user/agents`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("Fetched agents:", response.data);
      setAgents(response.data.data);
    };
    fetchAgents();
  }, []);

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
                Add a new agent to your team. Login credentials will be sent via
                email.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  value={newAgent.name}
                  onChange={(e) =>
                    setNewAgent({ ...newAgent, name: e.target.value })
                  }
                  placeholder="Enter agent's full name"
                />
              </div>
              <div>
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={newAgent.email}
                  onChange={(e) =>
                    setNewAgent({ ...newAgent, email: e.target.value })
                  }
                  placeholder="agent@waflow.com"
                />
              </div>
              <div>
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  value={newAgent.phone}
                  onChange={(e) =>
                    setNewAgent({ ...newAgent, phone: e.target.value })
                  }
                  placeholder="+971-XX-XXX-XXXX"
                />
              </div>
              <div>
                <Label htmlFor="password">Password</Label>
                <div className="flex gap-2">
                  <Input
                    id="password"
                    type="password"
                    value={newAgent.password}
                    onChange={(e) =>
                      setNewAgent({ ...newAgent, password: e.target.value })
                    }
                    placeholder="Enter password"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={generatePassword}
                  >
                    Auto Generate
                  </Button>
                </div>
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
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search agents by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Agents Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Agents</CardTitle>
          <CardDescription>
            Manage your team members and their access
          </CardDescription>
        </CardHeader>
        <CardContent>
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

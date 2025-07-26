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
  Plus,
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
  const [showAddModal, setShowAddModal] = useState(false);
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phoneNumber: "",
    password: "",
  });
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});
  // Move recent agents to state
  const [recentAgents, setRecentAgents] = useState<any[]>([]);

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
        setRecentAgents(res.data.data || []);
      } catch (err) {
        setRecentAgents([]);
      }
    };
    if (token) fetchAgents();
  }, [token]);

  console.log("Recent Agents:", recentAgents.length);

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    const errors: { [key: string]: string } = {};
    ["fullName", "email", "phoneNumber", "password"].forEach((field) => {
      if (!form[field as keyof typeof form]) {
        errors[field] = "Required";
      }
    });
    return errors;
  };

  const handleAddAgent = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormErrors({});
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    setAdding(true);
    try {
      await axios.post(
        `${import.meta.env.VITE_BASE_URL}/api/user/create-agent`,
        form,
        {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        }
      );
      toast({ title: "Success", description: "Agent created successfully!" });
      setShowAddModal(false);
      setForm({ fullName: "", email: "", phoneNumber: "", password: "" });
      // Try to fetch latest agents from backend (if endpoint exists)
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_BASE_URL}/api/user/agents`,
          {
            headers: { Authorization: `Bearer ${token}` },
            withCredentials: true,
          }
        );
        setRecentAgents(res.data.data || []);
      } catch {
        // Fallback: add the new agent locally
        setRecentAgents((prev) => [
          {
            name: form.fullName,
            email: form.email,
            customers: 0,
            status: "active",
          },
          ...prev.slice(0, 2),
        ]);
      }
    } catch (err: any) {
      toast({
        title: "Error",
        description: err?.response?.data?.message || "Failed to create agent.",
        variant: "destructive",
      });
    } finally {
      setAdding(false);
    }
  };

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

  useEffect(() => {
    const fetchApplication = async () => {
      const response = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/api/application`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setAllApplications(response.data.data || []);
    };
    fetchApplication();
  }, []);

  console.log("All Applications:", allApplications.length);

  const stats = {
    totalAgents: recentAgents.length,
    totalCustomers: allCustomers.length,
    activeApplications: allApplications.length,
    completedApplications: 25,
    pendingPayments: 8,
    notifications: 12,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <div className="">
          <h1 className="text-3xl font-bold text-primary">Manager Dashboard</h1>
          <p className="text-muted-foreground">
            Overview of all operations and performance
          </p>
        </div>
        <Button onClick={() => setShowAddModal(true)}>
          <Plus />
          Add Agent
        </Button>
      </div>

      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Add New Agent</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddAgent} className="space-y-3">
            <div className="grid grid-cols-1 gap-4">
              <div>
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  name="fullName"
                  value={form.fullName}
                  onChange={handleFormChange}
                />
                {formErrors.fullName && (
                  <span className="text-xs text-red-500">
                    {formErrors.fullName}
                  </span>
                )}
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleFormChange}
                />
                {formErrors.email && (
                  <span className="text-xs text-red-500">
                    {formErrors.email}
                  </span>
                )}
              </div>
              <div>
                <Label htmlFor="phoneNumber">Phone Number</Label>
                <Input
                  name="phoneNumber"
                  value={form.phoneNumber}
                  onChange={handleFormChange}
                />
                {formErrors.phoneNumber && (
                  <span className="text-xs text-red-500">
                    {formErrors.phoneNumber}
                  </span>
                )}
              </div>
              <div>
                <Label htmlFor="password">Password</Label>
                <Input
                  name="password"
                  type="password"
                  value={form.password}
                  onChange={handleFormChange}
                />
                {formErrors.password && (
                  <span className="text-xs text-red-500">
                    {formErrors.password}
                  </span>
                )}
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowAddModal(false)}
                disabled={adding}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={adding} className="font-semibold">
                {adding ? "Adding..." : "Add Agent"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 gap-4">
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
                <p className="text-sm text-muted-foreground">All Application</p>
                <p className="text-2xl font-bold">{stats.activeApplications}</p>
              </div>
              <FileText className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
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

        {/* Quick Actions */}
      </div>
    </div>
  );
};

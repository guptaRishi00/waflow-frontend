import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Save, User } from "lucide-react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import axios from "axios";
import { useSelector } from "react-redux";
import { RootState } from "@/app/store";

interface Agent {
  _id: string;
  name: string;
  email: string;
  phone: string;
  status: string;
  createdAt: string;
  customersAssigned?: number;
  completionRate?: number;
  avgResponseTime?: string;
}

export const AgentProfilePage: React.FC = () => {
  const { agentId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { token } = useSelector((state: RootState) => state.customerAuth);

  const [agent, setAgent] = useState<Agent | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
  });

  // Fetch agent data
  useEffect(() => {
    const fetchAgent = async () => {
      if (!agentId || !token) return;

      try {
        setIsLoading(true);
        const response = await axios.get(
          `${import.meta.env.VITE_BASE_URL}/api/user/agent/${agentId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        const agentData = response.data.data;
        setAgent(agentData);
        setFormData({
          name: agentData.name || "",
          email: agentData.email || "",
          phone: agentData.phone || "",
        });
      } catch (error) {
        console.error("Error fetching agent:", error);
        toast({
          title: "Error",
          description: "Failed to load agent information.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchAgent();
  }, [agentId, token, toast]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = async () => {
    if (!agent || !token) return;

    setIsSaving(true);
    try {
      await axios.put(
        `${import.meta.env.VITE_BASE_URL}/api/user/agents/${agentId}`,
        {
          name: formData.name,
          phone: formData.phone,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      toast({
        title: "Success",
        description: "Agent information updated successfully!",
      });

      // Update local state
      setAgent((prev) =>
        prev
          ? {
              ...prev,
              name: formData.name,
              phone: formData.phone,
            }
          : null
      );
    } catch (error: any) {
      toast({
        title: "Error",
        description:
          error?.response?.data?.message ||
          "Failed to update agent information.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
            <p className="text-muted-foreground">
              Loading agent information...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!agent) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-muted-foreground">Agent not found.</p>
            <Button
              onClick={() => navigate("/manager/agents")}
              className="mt-2"
            >
              Back to Agents
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            to="/manager/agents"
            className="text-sm text-primary hover:text-primary/80 flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Agents
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-primary">Agent Profile</h1>
            <p className="text-muted-foreground">
              Manage agent information and details
            </p>
          </div>
        </div>
        <Button onClick={handleSave} disabled={isSaving}>
          <Save className="h-4 w-4 mr-2" />
          {isSaving ? "Saving..." : "Save Changes"}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Basic Information Card */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Basic Information
            </CardTitle>
            <CardDescription>
              Update agent's personal information. Email cannot be modified.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Enter agent's full name"
                />
              </div>
              <div>
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  name="email"
                  value={formData.email}
                  disabled
                  className="bg-gray-100 cursor-not-allowed"
                  placeholder="Email address (read-only)"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Email address cannot be changed
                </p>
              </div>
              <div>
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="+971-XX-XXX-XXXX"
                />
              </div>
              <div>
                <Label>Status</Label>
                <div className="flex items-center gap-2 mt-2">
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
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Agent Stats Card */}
        <Card>
          <CardHeader>
            <CardTitle>Agent Statistics</CardTitle>
            <CardDescription>Performance overview</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-primary">
                {agent.customersAssigned || 0}
              </p>
              <p className="text-sm text-muted-foreground">
                Customers Assigned
              </p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">
                {agent.completionRate || 0}%
              </p>
              <p className="text-sm text-muted-foreground">Completion Rate</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">
                {agent.avgResponseTime || "N/A"}
              </p>
              <p className="text-sm text-muted-foreground">Avg Response Time</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                Member since {new Date(agent.createdAt).toLocaleDateString()}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

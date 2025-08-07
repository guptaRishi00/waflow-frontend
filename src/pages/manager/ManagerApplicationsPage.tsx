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
import { Eye, MessageSquare, DollarSign, Filter } from "lucide-react";
import { mockApplications } from "@/lib/mock-data";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { ApplicationDetailsModal } from "@/components/common/ApplicationDetailsModal";
import type { Application } from "@/types";
import axios from "axios";
import { useSelector } from "react-redux";
import { RootState } from "@/app/store";

export const ManagerApplicationsPage: React.FC = () => {
  const [applications] = useState(mockApplications);
  const [selectedApplication, setSelectedApplication] =
    useState<Application | null>(null);
  const [isApplicationModalOpen, setIsApplicationModalOpen] = useState(false);
  const { toast } = useToast();

  const { token, user } = useSelector((state: RootState) => state.customerAuth);

  const handleViewApplication = (application: Application) => {
    setSelectedApplication(application);
    setIsApplicationModalOpen(true);
  };

  const handleAssignAgent = (applicationId: string) => {
    toast({
      title: "Agent Assigned",
      description: "Application has been assigned to an agent successfully.",
    });
  };

  useEffect(() => {
    const fetchApplication = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/application`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        console.log("Applications fetched successfully:", response.data);
      } catch (error) {
        console.error("Failed to fetch applications:", error);
        toast({
          title: "Error",
          description: "Failed to load applications. Please try again later.",
          variant: "destructive",
        });
      }
    };
    fetchApplication();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-primary">All Applications</h1>
        <p className="text-muted-foreground">
          Overview of all customer applications across all agents
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-primary">
                {applications.length}
              </p>
              <p className="text-sm text-muted-foreground">
                Total Applications
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">
                {applications.filter((app) => app.status === "approved").length}
              </p>
              <p className="text-sm text-muted-foreground">Approved</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-yellow-600">
                {
                  applications.filter((app) => app.status === "under-review")
                    .length
                }
              </p>
              <p className="text-sm text-muted-foreground">Under Review</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">
                {
                  applications.filter((app) => app.status === "submitted")
                    .length
                }
              </p>
              <p className="text-sm text-muted-foreground">Submitted</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Applications Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Applications Overview</CardTitle>
              <CardDescription>
                All customer applications with status and progress
              </CardDescription>
            </div>
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3">Application ID</th>
                  <th className="text-left p-3">Business Name</th>
                  <th className="text-left p-3">Type</th>
                  <th className="text-left p-3">Status</th>
                  <th className="text-left p-3">Progress</th>
                  <th className="text-left p-3">Agent</th>
                  <th className="text-left p-3">Created</th>
                  <th className="text-left p-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {applications.map((app) => (
                  <tr key={app.id} className="border-b hover:bg-gray-50">
                    <td className="p-3">
                      <Badge variant="outline" className="font-mono text-xs">
                        {app.id}
                      </Badge>
                    </td>
                    <td className="p-3 font-medium">{app.businessName}</td>
                    <td className="p-3 capitalize">{app.businessType}</td>
                    <td className="p-3">
                      <Badge
                        variant={
                          app.status === "under-review"
                            ? "secondary"
                            : "default"
                        }
                        className={
                          app.status === "under-review"
                            ? "bg-yellow-100 text-yellow-800"
                            : app.status === "approved"
                            ? "bg-green-100 text-green-800"
                            : ""
                        }
                      >
                        {app.status.replace("-", " ")}
                      </Badge>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center space-x-2">
                        <div className="w-20 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-gradient-to-r from-primary to-secondary h-2 rounded-full"
                            style={{ width: `${(app.currentStep / 8) * 100}%` }}
                          />
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {app.currentStep}/8
                        </span>
                      </div>
                    </td>
                    <td className="p-3">
                      {app.agentId ? (
                        <span className="text-sm">Agent {app.agentId}</span>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleAssignAgent(app.id)}
                        >
                          Assign
                        </Button>
                      )}
                    </td>
                    <td className="p-3 text-sm text-muted-foreground">
                      {new Date(app.createdAt).toLocaleDateString()}
                    </td>
                    <td className="p-3">
                      <div className="flex space-x-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleViewApplication(app)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="ghost" asChild>
                          <Link to={`/manager/chat?application=${app.id}`}>
                            <MessageSquare className="h-4 w-4" />
                          </Link>
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

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

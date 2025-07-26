import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ProgressTracker } from "@/components/ui/progress-tracker";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  FileText,
  MessageSquare,
  CreditCard,
  Calendar,
  Loader2,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { RootState } from "@/app/store";
import axios from "axios";
import { useToast } from "@/hooks/use-toast";

export const CustomerDashboard: React.FC = () => {
  const { user, token } = useSelector((state: RootState) => state.customerAuth);
  const { toast } = useToast();
  const [application, setApplication] = useState<any>(null);
  const [recentInvoices, setRecentInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch real application data
  useEffect(() => {
    const fetchApplicationData = async () => {
      if (!token || !user?.userId) return;

      console.log("Fetching application data for user:", user.userId);
      console.log("Token available:", !!token);

      setLoading(true);
      try {
        // Fetch customer's application
        const applicationResponse = await axios.get(
          `${import.meta.env.VITE_BASE_URL}/api/application/app/${user.userId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        console.log("Application response:", applicationResponse.data);

        if (applicationResponse.data.data) {
          setApplication(applicationResponse.data.data);
        }

        // Fetch invoices (if endpoint exists)
        try {
          const invoicesResponse = await axios.get(
            `${import.meta.env.VITE_BASE_URL}/api/invoice/customer/${
              user.userId
            }`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          setRecentInvoices(invoicesResponse.data.data?.slice(0, 2) || []);
        } catch (error) {
          console.log("No invoices endpoint available");
          setRecentInvoices([]);
        }
      } catch (error: any) {
        console.error("Error fetching application data:", error);
        console.error("Error response:", error.response?.data);
        console.error("Error status:", error.response?.status);
        toast({
          title: "Error",
          description:
            error.response?.data?.message || "Failed to load application data",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchApplicationData();
  }, [token, user, toast]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-primary">Welcome back!</h1>
          <p className="text-muted-foreground">
            Track your UAE business registration progress
          </p>
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="w-4 h-4 animate-spin" />
            Loading your application data...
          </div>
        </div>
      </div>
    );
  }

  if (!application) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-primary">Welcome back!</h1>
          <p className="text-muted-foreground">
            Track your UAE business registration progress
          </p>
        </div>
        <div className="text-center py-8">
          <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-muted-foreground mb-2">
            No Application Found
          </h2>
          <p className="text-muted-foreground mb-4">
            You haven't submitted any business registration applications yet.
          </p>
          <Button asChild>
            <Link to="/customer/basic-info">Start Your Application</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-primary">Welcome back!</h1>
        <p className="text-muted-foreground">
          Track your UAE business registration progress
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Status</p>
                <Badge
                  variant="secondary"
                  className="bg-yellow-100 text-yellow-800"
                >
                  {application.status?.replace("-", " ") || "Pending"}
                </Badge>
              </div>
              <Calendar className="h-8 w-8 text-secondary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Business Type</p>
                <p className="text-lg font-semibold capitalize">
                  {application.jurisdiction || "N/A"}
                </p>
              </div>
              <div className="w-8 h-8 rounded-full waflow-gradient flex items-center justify-center">
                <span className="text-xs font-bold text-white">UAE</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Progress Tracker */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Application Progress</CardTitle>
            <CardDescription>
              Your business registration application
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ProgressTracker
              steps={application.steps || []}
              currentStep={application.currentStep || 0}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

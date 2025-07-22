import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useSelector } from "react-redux";
import { RootState } from "@/app/store";
import { useToast } from "@/hooks/use-toast";
import VisaApplicationsList from "./VisaApplicationsList";
import axios from "axios";

const VisaApplicationsPage: React.FC = () => {
  const { token } = useSelector((state: RootState) => state.customerAuth);
  const { toast } = useToast();
  const [visaApplications, setVisaApplications] = useState<any[]>([]);
  const [visaLoading, setVisaLoading] = useState(false);

  // Fetch all submitted visa applications
  useEffect(() => {
    const fetchVisaApps = async () => {
      if (!token) return;
      setVisaLoading(true);
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_BASE_URL}/api/application/visa`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setVisaApplications(res.data.data || []);
      } catch (err) {
        setVisaApplications([]);
      } finally {
        setVisaLoading(false);
      }
    };
    fetchVisaApps();
  }, [token]);

  // Approve/Reject handler for visa applications
  const handleVisaStatusUpdate = async (id: string, status: string) => {
    try {
      await axios.patch(
        `${import.meta.env.VITE_BASE_URL}/api/application/visa/${id}/approve`,
        { status },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setVisaApplications((prev) =>
        prev.map((v) => (v._id === id ? { ...v, status } : v))
      );
      toast({
        title: `Visa ${status}`,
        description: `Visa application marked as ${status}.`,
      });
    } catch (err: any) {
      toast({
        title: "Error",
        description:
          err?.response?.data?.message || "Failed to update visa status.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6 w-full px-4">
      <div>
        <h1 className="text-3xl font-bold text-primary">Visa Applications</h1>
        <p className="text-muted-foreground">
          Review, preview, and manage all submitted visa applications.
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>All Submitted Visa Applications</CardTitle>
          <CardDescription>
            Review, preview, and manage all submitted visa applications.
          </CardDescription>
        </CardHeader>
        <CardContent className="relative z-0">
          <VisaApplicationsList
            visaApplications={visaApplications}
            loading={visaLoading}
            onStatusUpdate={handleVisaStatusUpdate}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default VisaApplicationsPage;

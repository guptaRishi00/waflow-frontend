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
import { Badge } from "@/components/ui/badge";
import { Search, Eye, FileText, Database } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useSelector } from "react-redux";
import { RootState } from "@/app/store";
import { useToast } from "@/hooks/use-toast";
import axios from "axios";

interface Application {
  _id: string;
  applicationId: string;
  applicationName: string;
  customer: {
    firstName: string;
    lastName: string;
  };
  totalFileSize: number;
  totalDocuments: number;
  status: string;
  createdAt: string;
}

export const DocumentDirectoryPage: React.FC = () => {
  const { token } = useSelector((state: RootState) => state.customerAuth);
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedApplicationFilter, setSelectedApplicationFilter] =
    useState<string>("all");
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [filteredApplications, setFilteredApplications] = useState<
    Application[]
  >([]);
  const [documentLoadingStates, setDocumentLoadingStates] = useState<{
    [key: string]: boolean;
  }>({});

  // Fetch all applications with document information
  useEffect(() => {
    const fetchApplications = async () => {
      setLoading(true);
      try {
        if (!token) return;

        const response = await axios.get(
          `${import.meta.env.VITE_BASE_URL}/api/application`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        const apps = response.data.data || [];

        // Transform the data to include document information
        const transformedApps = await Promise.all(
          apps.map(async (app: any) => {
            // Set loading state for this application
            setDocumentLoadingStates((prev) => ({ ...prev, [app._id]: true }));

            try {
              // Fetch documents for this application
              const docsResponse = await axios.get(
                `${import.meta.env.VITE_BASE_URL}/api/document/application/${
                  app._id
                }`,
                { headers: { Authorization: `Bearer ${token}` } }
              );

              const documents = docsResponse.data.data || [];
              const totalFileSize =
                documents.reduce((acc: number, doc: any) => {
                  // Handle different file size formats (bytes, KB, MB)
                  let size = doc.fileSize || 0;
                  if (typeof size === "string") {
                    // If it's a string like "2.5 MB", extract the number
                    const match = size.match(
                      /(\d+(?:\.\d+)?)\s*(KB|MB|GB|bytes?)/i
                    );
                    if (match) {
                      const value = parseFloat(match[1]);
                      const unit = match[2].toLowerCase();
                      switch (unit) {
                        case "gb":
                          size = value * 1024 * 1024 * 1024;
                          break;
                        case "mb":
                          size = value * 1024 * 1024;
                          break;
                        case "kb":
                          size = value * 1024;
                          break;
                        default:
                          size = value;
                          break;
                      }
                    }
                  }
                  return acc + size;
                }, 0) /
                (1024 * 1024); // Convert to MB

              return {
                _id: app._id,
                applicationId: app.applicationId || `APP-${app._id.slice(-3)}`,
                applicationName:
                  app.applicationName ||
                  `${app.customer?.firstName} ${app.customer?.lastName} Business Setup`,
                customer: {
                  firstName: app.customer?.firstName || "Unknown",
                  lastName: app.customer?.lastName || "Customer",
                },
                totalFileSize: Math.round(totalFileSize * 100) / 100, // Round to 2 decimal places
                totalDocuments: documents.length,
                status: app.status || "Pending",
                createdAt: app.createdAt,
              };
            } catch (error) {
              // If document fetch fails, return app with default values
              return {
                _id: app._id,
                applicationId: app.applicationId || `APP-${app._id.slice(-3)}`,
                applicationName:
                  app.applicationName ||
                  `${app.customer?.firstName} ${app.customer?.lastName} Business Setup`,
                customer: {
                  firstName: app.customer?.firstName || "Unknown",
                  lastName: app.customer?.lastName || "Customer",
                },
                totalFileSize: 0,
                totalDocuments: 0,
                status: app.status || "Pending",
                createdAt: app.createdAt,
              };
            } finally {
              // Clear loading state for this application
              setDocumentLoadingStates((prev) => ({
                ...prev,
                [app._id]: false,
              }));
            }
          })
        );

        setApplications(transformedApps);
        setFilteredApplications(transformedApps);
      } catch (error) {
        console.error("Error fetching applications:", error);

        // Fallback to mock data for demonstration
        const mockApps: Application[] = [
          {
            _id: "mock-1",
            applicationId: "APP-001",
            applicationName: "John Doe Business Setup",
            customer: { firstName: "John", lastName: "Doe" },
            totalFileSize: 2.5,
            totalDocuments: 3,
            status: "In Progress",
            createdAt: new Date().toISOString(),
          },
          {
            _id: "mock-2",
            applicationId: "APP-002",
            applicationName: "Jane Smith LLC Formation",
            customer: { firstName: "Jane", lastName: "Smith" },
            totalFileSize: 4.1,
            totalDocuments: 2,
            status: "Pending",
            createdAt: new Date().toISOString(),
          },
        ];

        setApplications(mockApps);
        setFilteredApplications(mockApps);

        toast({
          title: "Warning",
          description: "Using demo data. Some features may be limited.",
          variant: "default",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
  }, [token, toast]);

  // Filter applications based on search term and application filter
  useEffect(() => {
    let filtered = applications;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (app) =>
          app.customer.firstName
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          app.customer.lastName
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          app.applicationId.toLowerCase().includes(searchTerm.toLowerCase()) ||
          app.applicationName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by application number
    if (selectedApplicationFilter !== "all") {
      filtered = filtered.filter(
        (app) => app.applicationId === selectedApplicationFilter
      );
    }

    setFilteredApplications(filtered);
  }, [searchTerm, selectedApplicationFilter, applications]);

  // Format file size
  const formatFileSize = (sizeInMB: number) => {
    if (sizeInMB === 0) return "0 MB";
    return `${sizeInMB} MB`;
  };

  // Handle view application
  const handleViewApplication = (applicationId: string) => {
    // Check if it's a mock application
    if (applicationId.startsWith("mock-")) {
      toast({
        title: "Demo Mode",
        description:
          "This is demo data. In production, you would be redirected to the application details.",
        variant: "default",
      });
      return;
    }

    // Navigate to application details page
    window.location.href = `/manager/applications/${applicationId}`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Document Directory
          </h1>
          <p className="text-gray-600 mt-2">
            Documents grouped by application number
          </p>
        </div>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            {/* Search Bar */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search by customer name, application number, or application name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Application Number Filter */}
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-700">
                Application Number:
              </span>
              <Select
                value={selectedApplicationFilter}
                onValueChange={setSelectedApplicationFilter}
              >
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="All Applications" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Applications</SelectItem>
                  {applications.map((app) => (
                    <SelectItem
                      key={app.applicationId}
                      value={app.applicationId}
                    >
                      {app.applicationId}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Applications Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="w-5 h-5" />
            Applications ({filteredApplications.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="text-gray-600 mt-2">Loading applications...</p>
            </div>
          ) : filteredApplications.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No applications found
              </h3>
              <p className="text-gray-600">
                {searchTerm || selectedApplicationFilter !== "all"
                  ? "Try adjusting your search or filter criteria"
                  : "No applications have been created yet"}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-medium text-gray-700">
                      Application Number
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">
                      Application Name
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">
                      Customer Name
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">
                      Total File Size
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">
                      Total Documents
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredApplications.map((app) => (
                    <tr
                      key={app._id}
                      className="border-b border-gray-100 hover:bg-gray-50"
                    >
                      <td className="py-4 px-4">
                        <Badge variant="outline" className="font-mono">
                          {app.applicationId}
                        </Badge>
                      </td>
                      <td className="py-4 px-4">
                        <div className="font-medium text-gray-900">
                          {app.applicationName}
                        </div>
                        <div className="text-sm text-gray-500">
                          Created:{" "}
                          {new Date(app.createdAt).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="font-medium text-gray-900">
                          {app.customer.firstName} {app.customer.lastName}
                        </div>
                        <div className="text-sm text-gray-500">
                          <Badge
                            variant={
                              app.status === "In Progress"
                                ? "default"
                                : "secondary"
                            }
                            className="text-xs"
                          >
                            {app.status}
                          </Badge>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        {documentLoadingStates[app._id] ? (
                          <div className="animate-pulse bg-gray-200 h-4 w-16 rounded"></div>
                        ) : (
                          <div className="text-gray-900">
                            {formatFileSize(app.totalFileSize)}
                          </div>
                        )}
                      </td>
                      <td className="py-4 px-4">
                        {documentLoadingStates[app._id] ? (
                          <div className="animate-pulse bg-gray-200 h-4 w-20 rounded"></div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary">
                              {app.totalDocuments} document
                              {app.totalDocuments !== 1 ? "s" : ""}
                            </Badge>
                          </div>
                        )}
                      </td>
                      <td className="py-4 px-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewApplication(app._id)}
                          className="flex items-center gap-2"
                        >
                          <Eye className="w-4 h-4" />
                          View
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  User,
  Mail,
  Phone,
  Calendar,
  MapPin,
  FileText,
  Activity,
  Edit,
  Eye,
  ChevronDown,
  Upload,
  Download,
  Eye as EyeIcon,
  CheckCircle2,
  X,
  Loader2,
  MessageSquare,
} from "lucide-react";
import { useSelector } from "react-redux";
import { RootState } from "@/app/store";
import axios from "axios";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface Customer {
  _id: string;
  customerId: string;
  assignedAgentId?: string;
  assignedAgentRole?: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  dob?: string;
  gender?: string;
  email: string;
  phoneNumber?: string;
  nationality?: string;
  emiratesIdNumber?: string;
  passportNumber?: string;
  status?: string;
  createdAt: string;
  updatedAt?: string;
  lastActivityDate?: string;
  address?: {
    line1: string;
    line2?: string;
    city: string;
    state: string;
    country: string;
    zipcode: string;
  };
  assignedAgent?: {
    _id: string;
    fullName: string;
    email: string;
  };
}

interface Application {
  _id: string;
  applicationNumber: string;
  status: string;
  paymentStatus: string;
  customer: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  assignedAgent?: {
    _id: string;
    fullName: string;
  };
  submissionDate: string;
  lastUpdatedDate: string;
  companyJurisdiction?: string;
  steps?: Array<{
    stepName: string;
    status: string;
    description?: string;
  }>;
  notes?: Array<{
    _id: string;
    message: string;
    addedBy: string;
    createdAt: string;
  }>;
  businessSetup?: {
    companyType?: string;
    businessActivity?: string;
    proposedName?: string;
    alternativeNames?: string[];
    officeType?: string;
    quotedPrice?: number;
  };
  investors?: Array<{
    name: string;
    ownershipPercentage: number;
    role: string;
  }>;
  payments?: Array<{
    amount: number;
    status: string;
    invoiceUrl?: string;
  }>;
  documents?: Array<{
    _id: string;
    name: string;
    uploadedBy: string;
    uploadedDate: string;
    downloadUrl: string;
    fileSize?: number;
    fileType?: string;
  }>;
}

interface CustomerDetailViewProps {
  customerId: string;
  onBack: () => void;
}

export const CustomerDetailView: React.FC<CustomerDetailViewProps> = ({
  customerId,
  onBack,
}) => {
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [editForm, setEditForm] = useState({
    customerId: "",
    assignedAgentId: "",
    assignedAgentRole: "",
    firstName: "",
    middleName: "",
    lastName: "",
    dob: "",
    gender: "",
    email: "",
    phoneNumber: "",
    nationality: "",
    emiratesIdNumber: "",
    passportNumber: "",
    address: {
      line1: "",
      line2: "",
      city: "",
      state: "",
      country: "",
      zipcode: "",
    },
  });
  const { token } = useSelector((state: RootState) => state.customerAuth);
  const { toast } = useToast();

  useEffect(() => {
    const fetchCustomerData = async () => {
      if (!token || !customerId) return;

      setIsLoading(true);
      try {
        // Fetch customer details
        const customerResponse = await axios.get(
          `${import.meta.env.VITE_BASE_URL}/api/user/customer/${customerId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setCustomer(customerResponse.data.data);

        // Fetch customer applications
        const applicationsResponse = await axios.get(
          `${import.meta.env.VITE_BASE_URL}/api/application/app/${customerId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setApplications(applicationsResponse.data.data || []);
      } catch (error) {
        console.error("Error fetching customer data:", error);
        toast({
          title: "Error",
          description: "Failed to load customer data",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchCustomerData();
  }, [customerId, token, toast]);

  const getStatusBadge = (status: string) => {
    const statusColors = {
      active: "bg-green-100 text-green-800 border-green-200",
      inactive: "bg-red-100 text-red-800 border-red-200",
      pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
    };

    return (
      <Badge
        variant="outline"
        className={
          statusColors[status.toLowerCase() as keyof typeof statusColors] ||
          "bg-gray-100 text-gray-800"
        }
      >
        {status}
      </Badge>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getCustomerInitials = (customer: Customer) => {
    return `${customer.firstName.charAt(0)}${customer.lastName.charAt(
      0
    )}`.toUpperCase();
  };

  const handleEditClick = () => {
    if (customer) {
      setEditForm({
        customerId: customer.customerId || "",
        assignedAgentId: customer.assignedAgentId || "",
        assignedAgentRole: customer.assignedAgentRole || "",
        firstName: customer.firstName || "",
        middleName: customer.middleName || "",
        lastName: customer.lastName || "",
        dob: customer.dob
          ? new Date(customer.dob).toISOString().split("T")[0]
          : "",
        gender: customer.gender || "",
        email: customer.email || "",
        phoneNumber: customer.phoneNumber || "",
        nationality: customer.nationality || "",
        emiratesIdNumber: customer.emiratesIdNumber || "",
        passportNumber: customer.passportNumber || "",
        address: {
          line1: customer.address?.line1 || "",
          line2: customer.address?.line2 || "",
          city: customer.address?.city || "",
          state: customer.address?.state || "",
          country: customer.address?.country || "",
          zipcode: customer.address?.zipcode || "",
        },
      });
      setIsEditDialogOpen(true);
    }
  };

  const handleUpdateCustomer = async () => {
    if (!customer || !token) return;

    setIsUpdating(true);
    try {
      const response = await axios.put(
        `${import.meta.env.VITE_BASE_URL}/api/user/customer/${customer._id}`,
        editForm,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setCustomer(response.data.data);
      toast({
        title: "Customer Updated",
        description: "Customer information has been updated successfully",
      });
      setIsEditDialogOpen(false);
    } catch (error) {
      console.error("Error updating customer:", error);
      toast({
        title: "Update Failed",
        description: "Failed to update customer information. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">
            Loading customer details...
          </p>
        </div>
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="text-center py-8">
        <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Customer Not Found
        </h3>
        <p className="text-muted-foreground mb-4">
          The customer you're looking for doesn't exist.
        </p>
        <Button onClick={onBack} variant="outline">
          Go Back
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button onClick={onBack} variant="outline" size="sm">
            <Eye className="h-4 w-4 mr-2" />
            Back to Customers
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-primary">
              Customer Information
            </h1>
            <p className="text-muted-foreground">
              Detailed customer profile and applications
            </p>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={handleEditClick}>
          <Edit className="h-4 w-4 mr-2" />
          Edit Customer
        </Button>
      </div>

      <Tabs defaultValue="customer-info" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="customer-info">Customer Info</TabsTrigger>
          <TabsTrigger value="applications">Applications</TabsTrigger>
        </TabsList>

        {/* Customer Info Tab */}
        <TabsContent value="customer-info" className="mt-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarFallback className="text-lg">
                    {getCustomerInitials(customer)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle className="text-xl">
                    {customer.firstName} {customer.middleName}{" "}
                    {customer.lastName}
                  </CardTitle>
                  <CardDescription>
                    Customer ID: {customer.customerId}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Status */}
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">
                  Status
                </span>
                {getStatusBadge(customer.status || "active")}
              </div>

              {/* Contact Information */}
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">{customer.email}</p>
                    <p className="text-xs text-muted-foreground">
                      Email Address
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">
                      {customer.phoneNumber || "Not provided"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Phone Number
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">
                      {customer.nationality || "Not specified"}
                    </p>
                    <p className="text-xs text-muted-foreground">Nationality</p>
                  </div>
                </div>
              </div>

              {/* Identity Documents */}
              <div className="space-y-3 pt-2 border-t">
                <div className="flex items-center gap-3">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">
                      {customer.emiratesIdNumber || "Not provided"}
                    </p>
                    <p className="text-xs text-muted-foreground">Emirates ID</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">
                      {customer.passportNumber || "Not provided"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Passport Number
                    </p>
                  </div>
                </div>
              </div>

              {/* Address */}
              {customer.address && (
                <div className="space-y-3 pt-2 border-t">
                  <div className="flex items-start gap-3">
                    <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <div className="space-y-1">
                      <p className="text-sm font-medium">
                        {customer.address.line1}
                      </p>
                      {customer.address.line2 && (
                        <p className="text-sm">{customer.address.line2}</p>
                      )}
                      <p className="text-sm">
                        {customer.address.city}, {customer.address.state}{" "}
                        {customer.address.zipcode}
                      </p>
                      <p className="text-sm">{customer.address.country}</p>
                      <p className="text-xs text-muted-foreground">Address</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Dates */}
              <div className="space-y-3 pt-2 border-t">
                <div className="flex items-center gap-3">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">
                      {formatDate(customer.createdAt)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Created Date
                    </p>
                  </div>
                </div>

                {customer.lastActivityDate && (
                  <div className="flex items-center gap-3">
                    <Activity className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">
                        {formatDate(customer.lastActivityDate)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Last Activity
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Application Count */}
              <div className="space-y-3 pt-2 border-t">
                <div className="flex items-center gap-3">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">
                      {applications.length} Application(s)
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Total Applications
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Activity className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">
                      {
                        applications.filter((app) => app.status === "active")
                          .length
                      }{" "}
                      Active
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Active Applications
                    </p>
                  </div>
                </div>
              </div>

              {/* Assigned Agent */}
              {customer.assignedAgent && (
                <div className="space-y-3 pt-2 border-t">
                  <div className="flex items-center gap-3">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">
                        {customer.assignedAgent.fullName}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Assigned Agent
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Applications Tab */}
        <TabsContent value="applications" className="mt-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Applications ({applications.length})</CardTitle>
                  <CardDescription>
                    All applications for this customer
                  </CardDescription>
                </div>
                <Badge variant="secondary">
                  {applications.filter((app) => app.status === "active").length}{" "}
                  Active
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              {applications.length > 0 ? (
                <div className="space-y-4">
                  {applications.map((application, index) => (
                    <ApplicationAccordion
                      key={application._id}
                      application={application}
                      index={index}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    No Applications
                  </h3>
                  <p className="text-muted-foreground">
                    This customer hasn't submitted any applications yet.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Edit Customer Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Customer Information</DialogTitle>
            <DialogDescription>
              Update customer details. All fields are editable.
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Basic Information */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="customerId">Customer ID</Label>
                <Input
                  id="customerId"
                  value={editForm.customerId}
                  onChange={(e) =>
                    setEditForm((prev) => ({
                      ...prev,
                      customerId: e.target.value,
                    }))
                  }
                  placeholder="e.g., CX-0001"
                />
              </div>

              <div>
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  value={editForm.firstName}
                  onChange={(e) =>
                    setEditForm((prev) => ({
                      ...prev,
                      firstName: e.target.value,
                    }))
                  }
                  placeholder="First Name"
                />
              </div>

              <div>
                <Label htmlFor="middleName">Middle Name</Label>
                <Input
                  id="middleName"
                  value={editForm.middleName}
                  onChange={(e) =>
                    setEditForm((prev) => ({
                      ...prev,
                      middleName: e.target.value,
                    }))
                  }
                  placeholder="Middle Name (Optional)"
                />
              </div>

              <div>
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  value={editForm.lastName}
                  onChange={(e) =>
                    setEditForm((prev) => ({
                      ...prev,
                      lastName: e.target.value,
                    }))
                  }
                  placeholder="Last Name"
                />
              </div>

              <div>
                <Label htmlFor="dob">Date of Birth</Label>
                <Input
                  id="dob"
                  type="date"
                  value={editForm.dob}
                  onChange={(e) =>
                    setEditForm((prev) => ({ ...prev, dob: e.target.value }))
                  }
                />
              </div>

              <div>
                <Label htmlFor="gender">Gender</Label>
                <select
                  id="gender"
                  value={editForm.gender}
                  onChange={(e) =>
                    setEditForm((prev) => ({ ...prev, gender: e.target.value }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>

            {/* Contact Information */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={editForm.email}
                  onChange={(e) =>
                    setEditForm((prev) => ({ ...prev, email: e.target.value }))
                  }
                  placeholder="Email Address"
                />
              </div>

              <div>
                <Label htmlFor="phoneNumber">Phone Number</Label>
                <Input
                  id="phoneNumber"
                  value={editForm.phoneNumber}
                  onChange={(e) =>
                    setEditForm((prev) => ({
                      ...prev,
                      phoneNumber: e.target.value,
                    }))
                  }
                  placeholder="Phone Number"
                />
              </div>

              <div>
                <Label htmlFor="nationality">Nationality</Label>
                <Input
                  id="nationality"
                  value={editForm.nationality}
                  onChange={(e) =>
                    setEditForm((prev) => ({
                      ...prev,
                      nationality: e.target.value,
                    }))
                  }
                  placeholder="Nationality"
                />
              </div>

              <div>
                <Label htmlFor="emiratesIdNumber">Emirates ID</Label>
                <Input
                  id="emiratesIdNumber"
                  value={editForm.emiratesIdNumber}
                  onChange={(e) =>
                    setEditForm((prev) => ({
                      ...prev,
                      emiratesIdNumber: e.target.value,
                    }))
                  }
                  placeholder="Emirates ID Number"
                />
              </div>

              <div>
                <Label htmlFor="passportNumber">Passport Number</Label>
                <Input
                  id="passportNumber"
                  value={editForm.passportNumber}
                  onChange={(e) =>
                    setEditForm((prev) => ({
                      ...prev,
                      passportNumber: e.target.value,
                    }))
                  }
                  placeholder="Passport Number"
                />
              </div>
            </div>
          </div>

          {/* Agent Assignment */}
          <div className="space-y-4 pt-4 border-t">
            <h4 className="font-semibold">Agent Assignment</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="assignedAgentId">Assigned Agent ID</Label>
                <Input
                  id="assignedAgentId"
                  value={editForm.assignedAgentId}
                  onChange={(e) =>
                    setEditForm((prev) => ({
                      ...prev,
                      assignedAgentId: e.target.value,
                    }))
                  }
                  placeholder="Agent ID"
                />
              </div>
              <div>
                <Label htmlFor="assignedAgentRole">Agent Role</Label>
                <Input
                  id="assignedAgentRole"
                  value={editForm.assignedAgentRole}
                  onChange={(e) =>
                    setEditForm((prev) => ({
                      ...prev,
                      assignedAgentRole: e.target.value,
                    }))
                  }
                  placeholder="Agent Role"
                />
              </div>
            </div>
          </div>

          {/* Address Information */}
          <div className="space-y-4 pt-4 border-t">
            <h4 className="font-semibold">Address Information</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <Label htmlFor="addressLine1">Address Line 1</Label>
                <Input
                  id="addressLine1"
                  value={editForm.address.line1}
                  onChange={(e) =>
                    setEditForm((prev) => ({
                      ...prev,
                      address: { ...prev.address, line1: e.target.value },
                    }))
                  }
                  placeholder="Address Line 1"
                />
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="addressLine2">Address Line 2</Label>
                <Input
                  id="addressLine2"
                  value={editForm.address.line2}
                  onChange={(e) =>
                    setEditForm((prev) => ({
                      ...prev,
                      address: { ...prev.address, line2: e.target.value },
                    }))
                  }
                  placeholder="Address Line 2 (Optional)"
                />
              </div>
              <div>
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  value={editForm.address.city}
                  onChange={(e) =>
                    setEditForm((prev) => ({
                      ...prev,
                      address: { ...prev.address, city: e.target.value },
                    }))
                  }
                  placeholder="City"
                />
              </div>
              <div>
                <Label htmlFor="state">State</Label>
                <Input
                  id="state"
                  value={editForm.address.state}
                  onChange={(e) =>
                    setEditForm((prev) => ({
                      ...prev,
                      address: { ...prev.address, state: e.target.value },
                    }))
                  }
                  placeholder="State"
                />
              </div>
              <div>
                <Label htmlFor="country">Country</Label>
                <Input
                  id="country"
                  value={editForm.address.country}
                  onChange={(e) =>
                    setEditForm((prev) => ({
                      ...prev,
                      address: { ...prev.address, country: e.target.value },
                    }))
                  }
                  placeholder="Country"
                />
              </div>
              <div>
                <Label htmlFor="zipcode">Zip Code</Label>
                <Input
                  id="zipcode"
                  value={editForm.address.zipcode}
                  onChange={(e) =>
                    setEditForm((prev) => ({
                      ...prev,
                      address: { ...prev.address, zipcode: e.target.value },
                    }))
                  }
                  placeholder="Zip Code"
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEditDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleUpdateCustomer} disabled={isUpdating}>
              {isUpdating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Updating...
                </>
              ) : (
                <>
                  <Edit className="h-4 w-4 mr-2" />
                  Update Customer
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

// Application Accordion Component
interface ApplicationAccordionProps {
  application: Application;
  index: number;
}

const ApplicationAccordion: React.FC<ApplicationAccordionProps> = ({
  application,
  index,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [uploadForm, setUploadForm] = useState({
    title: "",
    file: null as File | null,
  });
  const [isUploading, setIsUploading] = useState(false);
  const [isStepActionLoading, setIsStepActionLoading] = useState(false);
  const [agentNotes, setAgentNotes] = useState("");
  const [isAddingNote, setIsAddingNote] = useState(false);
  const { token, user } = useSelector((state: RootState) => state.customerAuth);
  const { toast } = useToast();

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Please select a file smaller than 10MB",
          variant: "destructive",
        });
        return;
      }
      setUploadForm((prev) => ({ ...prev, file }));
    }
  };

  const handleUpload = async () => {
    if (!uploadForm.title || !uploadForm.file || !application) return;

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("title", uploadForm.title);
      formData.append("file", uploadForm.file);
      formData.append("applicationId", application._id);

      const response = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/api/document/create-document`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      toast({
        title: "Document uploaded",
        description: "Document has been uploaded successfully",
      });

      setIsUploadDialogOpen(false);
      setUploadForm({ title: "", file: null });
    } catch (error) {
      console.error("Error uploading document:", error);
      toast({
        title: "Upload failed",
        description: "Failed to upload document. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleDownload = async (documentId: string, fileName: string) => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/api/document/download/${documentId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
          responseType: "blob",
        }
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error downloading document:", error);
      toast({
        title: "Download failed",
        description: "Failed to download document. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Step management functions
  const handleStepAction = async (
    stepIndex: number,
    action: "approve" | "reject"
  ) => {
    if (!application.steps || !token) return;

    setIsStepActionLoading(true);
    try {
      const step = application.steps[stepIndex];
      const response = await axios.patch(
        `${import.meta.env.VITE_BASE_URL}/api/application/step-status/${
          application._id
        }`,
        {
          stepName: step.stepName,
          status: action === "approve" ? "Approved" : "Declined",
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast({
        title: `Step ${action === "approve" ? "Approved" : "Rejected"}`,
        description: `Step "${step.stepName}" has been ${
          action === "approve" ? "approved" : "rejected"
        }.`,
      });
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to update step status.",
        variant: "destructive",
      });
    } finally {
      setIsStepActionLoading(false);
    }
  };

  // Add note function
  const addNote = async () => {
    if (!application._id || !agentNotes.trim() || !user?.userId) return;

    setIsAddingNote(true);
    try {
      await axios.post(
        `${import.meta.env.VITE_BASE_URL}/api/application/note/${
          application._id
        }`,
        {
          message: agentNotes,
          addedBy: user.userId,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setAgentNotes("");
      toast({
        title: "Note Added",
        description: "Your note has been added successfully.",
      });
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to add note.",
        variant: "destructive",
      });
    } finally {
      setIsAddingNote(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusColors = {
      "in progress": "bg-blue-100 text-blue-800 border-blue-200",
      approved: "bg-green-100 text-green-800 border-green-200",
      rejected: "bg-red-100 text-red-800 border-red-200",
      pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
      completed: "bg-green-100 text-green-800 border-green-200",
    };

    return (
      <Badge
        variant="outline"
        className={
          statusColors[status.toLowerCase() as keyof typeof statusColors] ||
          "bg-gray-100 text-gray-800"
        }
      >
        {status}
      </Badge>
    );
  };

  return (
    <div className="border rounded-lg">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-4">
          <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium">
            {index + 1}
          </div>
          <div>
            <h3 className="font-semibold">Application {index + 1}</h3>
            <p className="text-sm text-muted-foreground">
              ID: {application.applicationNumber}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {getStatusBadge(application.status)}
          <Badge variant="outline">{application.paymentStatus}</Badge>
          <ChevronDown
            className={`h-4 w-4 transition-transform ${
              isExpanded ? "rotate-180" : ""
            }`}
          />
        </div>
      </button>

      {isExpanded && (
        <div className="p-4 border-t bg-gray-50">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Application Details */}
            <div className="space-y-4">
              <h4 className="font-semibold text-sm">Application Details</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Application ID:</span>
                  <span className="font-medium">{application._id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    Submission Date:
                  </span>
                  <span>{formatDate(application.submissionDate)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Last Updated:</span>
                  <span>{formatDate(application.lastUpdatedDate)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    Company Jurisdiction:
                  </span>
                  <span>
                    {application.companyJurisdiction || "Not specified"}
                  </span>
                </div>
                {application.assignedAgent && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      Assigned Agent:
                    </span>
                    <span>{application.assignedAgent.fullName}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Business Setup Details */}
            {application.businessSetup && (
              <div className="space-y-4">
                <h4 className="font-semibold text-sm">
                  Business Setup Details
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Company Type:</span>
                    <span>
                      {application.businessSetup.companyType || "Not specified"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      Business Activity:
                    </span>
                    <span>
                      {application.businessSetup.businessActivity ||
                        "Not specified"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      Proposed Name:
                    </span>
                    <span>
                      {application.businessSetup.proposedName ||
                        "Not specified"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Office Type:</span>
                    <span>
                      {application.businessSetup.officeType || "Not specified"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Quoted Price:</span>
                    <span>
                      {application.businessSetup.quotedPrice
                        ? `$${application.businessSetup.quotedPrice}`
                        : "Not specified"}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Step Management */}
            {application.steps && application.steps.length > 0 && (
              <div className="space-y-4">
                <h4 className="font-semibold text-sm">Application Steps</h4>
                <div className="space-y-3">
                  {application.steps.map((step, stepIndex) => (
                    <div
                      key={stepIndex}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium">
                          {stepIndex + 1}
                        </div>
                        <div>
                          <p className="font-medium text-sm">{step.stepName}</p>
                          <p className="text-xs text-muted-foreground">
                            {step.description || "No description"}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusBadge(step.status)}
                        {step.status.toLowerCase() === "pending" && (
                          <div className="flex gap-1">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                handleStepAction(stepIndex, "approve")
                              }
                              disabled={isStepActionLoading}
                            >
                              <CheckCircle2 className="h-3 w-3 mr-1" />
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                handleStepAction(stepIndex, "reject")
                              }
                              disabled={isStepActionLoading}
                            >
                              <X className="h-3 w-3 mr-1" />
                              Reject
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Notes Section */}
            <div className="space-y-4">
              <h4 className="font-semibold text-sm">Notes & Comments</h4>

              {/* Add Note */}
              <div className="space-y-3">
                <Textarea
                  placeholder="Add a note or comment..."
                  value={agentNotes}
                  onChange={(e) => setAgentNotes(e.target.value)}
                  className="min-h-[80px]"
                />
                <div className="flex justify-end">
                  <Button
                    size="sm"
                    onClick={addNote}
                    disabled={!agentNotes.trim() || isAddingNote}
                  >
                    {isAddingNote ? (
                      <>
                        <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                        Adding...
                      </>
                    ) : (
                      <>
                        <MessageSquare className="h-3 w-3 mr-1" />
                        Add Note
                      </>
                    )}
                  </Button>
                </div>
              </div>

              {/* Display Notes */}
              {application.notes && application.notes.length > 0 && (
                <div className="space-y-3">
                  <h5 className="text-sm font-medium">Previous Notes</h5>
                  <div className="space-y-2">
                    {application.notes.map((note, noteIndex) => (
                      <div
                        key={noteIndex}
                        className="p-3 bg-gray-50 rounded-lg border"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p className="text-sm">{note.message}</p>
                            <p className="text-xs text-muted-foreground mt-1">
                              Added by {note.addedBy} on{" "}
                              {formatDate(note.createdAt)}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Investors */}
          {application.investors && application.investors.length > 0 && (
            <div className="mt-6">
              <h4 className="font-semibold text-sm mb-3">Investor Details</h4>
              <div className="space-y-3">
                {application.investors.map((investor, idx) => (
                  <div key={idx} className="p-3 bg-white rounded border">
                    <h5 className="font-medium text-sm mb-2">
                      Investor {idx + 1}
                    </h5>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
                      <div>
                        <span className="text-muted-foreground">Name:</span>
                        <p className="font-medium">{investor.name}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">
                          Ownership:
                        </span>
                        <p className="font-medium">
                          {investor.ownershipPercentage}%
                        </p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Role:</span>
                        <p className="font-medium">{investor.role}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Payments */}
          {application.payments && application.payments.length > 0 && (
            <div className="mt-6">
              <h4 className="font-semibold text-sm mb-3">Payment Details</h4>
              <div className="space-y-3">
                {application.payments.map((payment, idx) => (
                  <div key={idx} className="p-3 bg-white rounded border">
                    <div className="flex items-center justify-between">
                      <div>
                        <h5 className="font-medium text-sm">
                          Payment {idx + 1}
                        </h5>
                        <p className="text-sm text-muted-foreground">
                          ${payment.amount}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant="outline"
                          className={
                            payment.status === "paid"
                              ? "bg-green-100 text-green-800"
                              : payment.status === "pending"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-red-100 text-red-800"
                          }
                        >
                          {payment.status}
                        </Badge>
                        {payment.invoiceUrl && (
                          <Button size="sm" variant="outline">
                            Download Invoice
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Documents */}
          <div className="mt-6">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-semibold text-sm">Documents</h4>
              <Dialog
                open={isUploadDialogOpen}
                onOpenChange={setIsUploadDialogOpen}
              >
                <DialogTrigger asChild>
                  <Button size="sm">
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Document
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Upload Document</DialogTitle>
                    <DialogDescription>
                      Upload a new document for this application. Maximum file
                      size is 10MB.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="title">Document Title</Label>
                      <Input
                        id="title"
                        value={uploadForm.title}
                        onChange={(e) =>
                          setUploadForm((prev) => ({
                            ...prev,
                            title: e.target.value,
                          }))
                        }
                        placeholder="Enter document title"
                      />
                    </div>
                    <div>
                      <Label htmlFor="file">Select File</Label>
                      <Input
                        id="file"
                        type="file"
                        onChange={handleFileChange}
                        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Supported formats: PDF, DOC, DOCX, JPG, JPEG, PNG
                      </p>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setIsUploadDialogOpen(false);
                        setUploadForm({ title: "", file: null });
                      }}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleUpload}
                      disabled={
                        !uploadForm.title || !uploadForm.file || isUploading
                      }
                    >
                      {isUploading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Uploading...
                        </>
                      ) : (
                        <>
                          <Upload className="h-4 w-4 mr-2" />
                          Upload
                        </>
                      )}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            {application.documents && application.documents.length > 0 ? (
              <div className="space-y-3">
                {application.documents.map((document, idx) => (
                  <div
                    key={document._id || idx}
                    className="p-3 bg-white rounded border"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h5 className="font-medium text-sm">{document.name}</h5>
                        <p className="text-sm text-muted-foreground">
                          Uploaded by {document.uploadedBy} on{" "}
                          {formatDate(document.uploadedDate)}
                        </p>
                        {document.fileSize && (
                          <p className="text-xs text-muted-foreground">
                            {formatFileSize(document.fileSize)}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <Button size="sm" variant="outline">
                          <EyeIcon className="h-4 w-4 mr-1" />
                          View
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            handleDownload(document._id, document.name)
                          }
                        >
                          <Download className="h-4 w-4 mr-1" />
                          Download
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4">
                <FileText className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">
                  No documents uploaded yet
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

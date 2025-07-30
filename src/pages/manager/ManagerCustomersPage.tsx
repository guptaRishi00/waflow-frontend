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
import {
  Eye,
  EyeOff,
  Search,
  Mail,
  Phone,
  Building,
  Filter,
  MessageSquare,
  Plus,
  FileText,
} from "lucide-react";
import { Link } from "react-router-dom";
import { CustomerNotesPage } from "@/components/common/CustomerNotesPage";
import { ApplicationDetailsModal } from "@/components/common/ApplicationDetailsModal";
import { mockApplications } from "@/lib/mock-data";
// import type { Application } from '@/types';
import { useSelector } from "react-redux";
import { RootState } from "@/app/store";
import { useToast } from "@/hooks/use-toast";
import axios from "axios";
// import { Dialog } from '@radix-ui/react-dialog';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Mock customer data
interface Customer {
  _id: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  dob?: string;
  email: string;
  phoneNumber?: string;
  currentAddress?: string;
  permanentAddress?: string;
  nationality?: string;
  gender?: string;
  designation?: string;
  companyType?: string;
  jurisdiction?: string;
  businessActivity1?: string;
  officeType?: string;
  quotedPrice?: number;
  paymentPlans?: string[] | string;
  paymentDetails?: string;
  createdAt: string;
  assignedAgentId?: string;
  userId: string;
}

interface Application {
  _id: string;
  customer: string;
  status: string;
  steps: Array<{
    stepName: string;
    status: string;
  }>;
  createdAt: string;
}

export const ManagerCustomersPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(
    null
  );
  const [customerDocuments, setCustomerDocuments] = useState<any[]>([]);

  const { token, user } = useSelector((state: RootState) => state.customerAuth);
  const { toast } = useToast();

  // Fetch applications from backend
  const fetchApplications = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/api/application`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const apps = response.data.data;
      setApplications(apps);
    } catch (err) {
      console.error("Error fetching applications:", err);
      toast({
        title: "Error",
        description: "Failed to load applications.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, [token, toast]);

  // Modal state and form fields for creating a customer
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({
    firstName: "",
    middleName: "",
    lastName: "",
    dob: "",
    email: "",
    phoneNumber: "",
    currentAddress: "",
    permanentAddress: "",
    nationality: "",
    gender: "",
    designation: "",
    companyType: "",
    jurisdiction: "",
    businessActivity1: "",
    officeType: "",
    quotedPrice: "",
    paymentPlans: "",
    paymentDetails: "",
    password: "",
  });
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});
  const [showPassword, setShowPassword] = useState(false);

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

  const passwordStrength = checkPasswordStrength(form.password);

  // Handle form field changes
  const handleFormChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // Handle Select field changes
  const handleSelectChange = (name: string, value: string) => {
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // Validate required fields
  const validateForm = () => {
    const errors: { [key: string]: string } = {};
    [
      "firstName",
      "lastName",
      "dob",
      "email",
      "phoneNumber",
      "currentAddress",
      "permanentAddress",
      "nationality",
      "gender",
      "designation",
      "companyType",
      "jurisdiction",
      "businessActivity1",
      "officeType",
      "quotedPrice",
      "paymentPlans",
      "paymentDetails",
      "password",
    ].forEach((field) => {
      if (!form[field as keyof typeof form]) {
        errors[field] = "Required";
      }
    });

    // Check password strength
    if (form.password && !passwordStrength.isStrong) {
      errors.password =
        "Password must be strong (capital letter, number, special character, min 8 chars)";
    }

    return errors;
  };

  // Handle form submit
  const handleCreateCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormErrors({});
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    setCreating(true);
    try {
      const payload = {
        ...form,
      };
      await axios.post(
        `${import.meta.env.VITE_BASE_URL}/api/user/create-customer`,
        payload,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      toast({
        title: "Success",
        description: "Customer created successfully!",
      });
      setShowCreateModal(false);
      setForm({
        firstName: "",
        middleName: "",
        lastName: "",
        dob: "",
        email: "",
        phoneNumber: "",
        currentAddress: "",
        permanentAddress: "",
        nationality: "",
        gender: "",
        designation: "",
        companyType: "",
        jurisdiction: "",
        businessActivity1: "",
        officeType: "",
        quotedPrice: "",
        paymentPlans: "",
        paymentDetails: "",
        password: "",
      });
      // Refresh applications list after customer creation
      fetchApplications();
      // Refresh customers list
      const fetchData = async () => {
        try {
          const customersResponse = await fetch(
            `${import.meta.env.VITE_BASE_URL}/api/user/customers`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              },
            }
          );

          if (customersResponse.ok) {
            const customersData = await customersResponse.json();
            setCustomers(customersData.data);
          }
        } catch (error) {
          console.error("Error refreshing customers:", error);
        }
      };
      fetchData();
    } catch (err: any) {
      toast({
        title: "Error",
        description:
          err?.response?.data?.message || "Failed to create customer.",
        variant: "destructive",
      });
    } finally {
      setCreating(false);
    }
  };

  // Fetch customers and applications from backend
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          console.log("No token found");
          return;
        }

        // Fetch all customers without filtering by agent
        const customersResponse = await fetch(
          `${import.meta.env.VITE_BASE_URL}/api/user/customers`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (customersResponse.ok) {
          const customersData = await customersResponse.json();
          // Set all customers without filtering by assignedAgentId
          setCustomers(customersData.data);

          if (customersData.data.length > 0) {
            setSelectedCustomer(customersData.data[0]);
          }
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const getCustomerApplications = (customerId: string) => {
    return applications.filter((app) => {
      if (!app.customer) return false;
      if (typeof app.customer === "string") {
        return app.customer === customerId;
      } else if (
        typeof app.customer === "object" &&
        app.customer !== null &&
        "_id" in app.customer &&
        typeof (app.customer as { _id: string })._id === "string"
      ) {
        return (app.customer as { _id: string })._id === customerId;
      }
      return false;
    });
  };

  const getCustomerName = (customer: Customer) => {
    return `${customer.firstName} ${customer.lastName}`;
  };

  const getCustomerInitials = (customer: Customer) => {
    return `${customer.firstName[0]}${customer.lastName[0]}`;
  };

  const getCurrentStep = (app: Application) => {
    return app.steps.filter(
      (step) => step.status === "Submitted" || step.status === "Approved"
    ).length;
  };

  // Fetch customer documents
  const fetchCustomerDocuments = async (customerId: string) => {
    if (!token) return;
    try {
      console.log("Fetching documents for customer:", customerId);
      const response = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/api/document/customer/${customerId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      console.log("Documents response:", response.data);
      setCustomerDocuments(response.data.data || []);
    } catch (error) {
      console.error("Error fetching customer documents:", error);
      setCustomerDocuments([]);
    }
  };

  const filteredCustomers = customers.filter(
    (customer) =>
      getCustomerName(customer)
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Add state for review note and loading per application
  const [reviewNotes, setReviewNotes] = useState<{ [appId: string]: string }>(
    {}
  );
  const [reviewLoading, setReviewLoading] = useState<{
    [appId: string]: boolean;
  }>({});

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-primary">
            Customer Management
          </h1>
          <p className="text-muted-foreground">
            View and manage your assigned customers
          </p>
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="text-muted-foreground">Loading customers...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <div className="">
          <h1 className="text-3xl font-bold text-primary">
            Customer Management
          </h1>
          <p className="text-muted-foreground">
            View and manage all customers in the database
          </p>
        </div>
        <Button onClick={() => setShowCreateModal(true)}>
          {" "}
          <span className="">
            <Plus />
          </span>
          Create Customer
        </Button>
      </div>

      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Create New Customer</DialogTitle>
          </DialogHeader>
          <form
            onSubmit={handleCreateCustomer}
            className="space-y-3 max-h-[70vh] overflow-y-auto"
          >
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  name="firstName"
                  value={form.firstName}
                  onChange={handleFormChange}
                />
                {formErrors.firstName && (
                  <span className="text-xs text-red-500">
                    {formErrors.firstName}
                  </span>
                )}
              </div>
              <div>
                <Label htmlFor="middleName">Middle Name</Label>
                <Input
                  name="middleName"
                  value={form.middleName}
                  onChange={handleFormChange}
                />
              </div>
              <div>
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  name="lastName"
                  value={form.lastName}
                  onChange={handleFormChange}
                />
                {formErrors.lastName && (
                  <span className="text-xs text-red-500">
                    {formErrors.lastName}
                  </span>
                )}
              </div>
              <div>
                <Label htmlFor="dob">Date of Birth</Label>
                <Input
                  name="dob"
                  type="date"
                  value={form.dob}
                  onChange={handleFormChange}
                />
                {formErrors.dob && (
                  <span className="text-xs text-red-500">{formErrors.dob}</span>
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
                <Label htmlFor="currentAddress">Current Address</Label>
                <Input
                  name="currentAddress"
                  value={form.currentAddress}
                  onChange={handleFormChange}
                />
                {formErrors.currentAddress && (
                  <span className="text-xs text-red-500">
                    {formErrors.currentAddress}
                  </span>
                )}
              </div>
              <div>
                <Label htmlFor="permanentAddress">Permanent Address</Label>
                <Input
                  name="permanentAddress"
                  value={form.permanentAddress}
                  onChange={handleFormChange}
                />
                {formErrors.permanentAddress && (
                  <span className="text-xs text-red-500">
                    {formErrors.permanentAddress}
                  </span>
                )}
              </div>
              <div>
                <Label htmlFor="nationality">Nationality</Label>
                <Input
                  name="nationality"
                  value={form.nationality}
                  onChange={handleFormChange}
                />
                {formErrors.nationality && (
                  <span className="text-xs text-red-500">
                    {formErrors.nationality}
                  </span>
                )}
              </div>
              <div>
                <Label htmlFor="gender">Gender</Label>
                <Select
                  value={form.gender}
                  onValueChange={(value) => handleSelectChange("gender", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                    <SelectItem value="prefer-not-to-say">
                      Prefer not to say
                    </SelectItem>
                  </SelectContent>
                </Select>
                {formErrors.gender && (
                  <span className="text-xs text-red-500">
                    {formErrors.gender}
                  </span>
                )}
              </div>
              <div>
                <Label htmlFor="designation">Designation</Label>
                <Input
                  name="designation"
                  value={form.designation}
                  onChange={handleFormChange}
                />
                {formErrors.designation && (
                  <span className="text-xs text-red-500">
                    {formErrors.designation}
                  </span>
                )}
              </div>
              <div>
                <Label htmlFor="companyType">Company Type</Label>
                <Input
                  name="companyType"
                  value={form.companyType}
                  onChange={handleFormChange}
                />
                {formErrors.companyType && (
                  <span className="text-xs text-red-500">
                    {formErrors.companyType}
                  </span>
                )}
              </div>
              <div>
                <Label htmlFor="jurisdiction">Jurisdiction</Label>
                <Select
                  value={form.jurisdiction}
                  onValueChange={(value) =>
                    handleSelectChange("jurisdiction", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select jurisdiction" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mainland">Mainland</SelectItem>
                    <SelectItem value="freezone">Freezone</SelectItem>
                    <SelectItem value="offshore">Offshore</SelectItem>
                  </SelectContent>
                </Select>
                {formErrors.jurisdiction && (
                  <span className="text-xs text-red-500">
                    {formErrors.jurisdiction}
                  </span>
                )}
              </div>
              <div>
                <Label htmlFor="businessActivity1">Business Activity</Label>
                <Input
                  name="businessActivity1"
                  value={form.businessActivity1}
                  onChange={handleFormChange}
                />
                {formErrors.businessActivity1 && (
                  <span className="text-xs text-red-500">
                    {formErrors.businessActivity1}
                  </span>
                )}
              </div>
              <div>
                <Label htmlFor="officeType">Office Type</Label>
                <Input
                  name="officeType"
                  value={form.officeType}
                  onChange={handleFormChange}
                />
                {formErrors.officeType && (
                  <span className="text-xs text-red-500">
                    {formErrors.officeType}
                  </span>
                )}
              </div>
              <div>
                <Label htmlFor="quotedPrice">Quoted Price</Label>
                <Input
                  name="quotedPrice"
                  value={form.quotedPrice}
                  onChange={handleFormChange}
                />
                {formErrors.quotedPrice && (
                  <span className="text-xs text-red-500">
                    {formErrors.quotedPrice}
                  </span>
                )}
              </div>
              <div>
                <Label htmlFor="paymentPlans">Payment Plans</Label>
                <Input
                  name="paymentPlans"
                  value={form.paymentPlans}
                  onChange={handleFormChange}
                />
                {formErrors.paymentPlans && (
                  <span className="text-xs text-red-500">
                    {formErrors.paymentPlans}
                  </span>
                )}
              </div>
              <div className="col-span-2">
                <Label htmlFor="paymentDetails">Payment Details</Label>
                <Textarea
                  name="paymentDetails"
                  value={form.paymentDetails}
                  onChange={handleFormChange}
                />
                {formErrors.paymentDetails && (
                  <span className="text-xs text-red-500">
                    {formErrors.paymentDetails}
                  </span>
                )}
              </div>
              <div className="col-span-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    name="password"
                    type={showPassword ? "text" : "password"}
                    value={form.password}
                    onChange={handleFormChange}
                    className="pr-10"
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
                {/* Password Strength Indicator */}
                {form.password && (
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
                type="button"
                variant="outline"
                onClick={() => setShowCreateModal(false)}
                disabled={creating}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={creating}
                className="font-semibold"
              >
                {creating ? "Creating..." : "Create Customer"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Customers List */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Customers ({customers.length})</CardTitle>
            <CardDescription>All customers in the database</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search customers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-3">
              {filteredCustomers.map((customer) => {
                const customerApps = getCustomerApplications(customer._id);
                return (
                  <div
                    key={customer._id}
                    className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                      selectedCustomer?._id === customer._id
                        ? "border-primary bg-primary/5"
                        : "hover:bg-gray-50"
                    }`}
                    onClick={() => {
                      setSelectedCustomer(customer);
                      fetchCustomerDocuments(customer._id);
                    }}
                  >
                    <div className="flex items-center space-x-3">
                      <Avatar>
                        <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                          {getCustomerInitials(customer)}
                        </AvatarFallback>
                      </Avatar>

                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">
                          {getCustomerName(customer)}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {customer.email}
                        </p>
                        <div className="flex items-center mt-1">
                          <Badge variant="outline" className="text-xs">
                            {customerApps.length} Apps
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Customer Details */}
        <div className="lg:col-span-2 space-y-6">
          {selectedCustomer && (
            <>
              {/* Customer Profile */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <Avatar className="w-16 h-16">
                        <AvatarFallback className="bg-primary text-primary-foreground text-lg">
                          {getCustomerInitials(selectedCustomer)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle>
                          {getCustomerName(selectedCustomer)}
                        </CardTitle>
                        <CardDescription>
                          Customer since{" "}
                          {new Date(
                            selectedCustomer.createdAt
                          ).toLocaleDateString()}
                        </CardDescription>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <strong>First Name:</strong>{" "}
                      {selectedCustomer.firstName || "N/A"}
                    </div>
                    <div>
                      <strong>Middle Name:</strong>{" "}
                      {selectedCustomer.middleName || "N/A"}
                    </div>
                    <div>
                      <strong>Last Name:</strong>{" "}
                      {selectedCustomer.lastName || "N/A"}
                    </div>
                    <div>
                      <strong>Date of Birth:</strong>{" "}
                      {selectedCustomer.dob
                        ? new Date(selectedCustomer.dob).toLocaleDateString()
                        : "N/A"}
                    </div>
                    <div>
                      <strong>Email:</strong> {selectedCustomer.email || "N/A"}
                    </div>
                    <div>
                      <strong>Phone Number:</strong>{" "}
                      {selectedCustomer.phoneNumber || "N/A"}
                    </div>
                    <div>
                      <strong>Current Address:</strong>{" "}
                      {selectedCustomer.currentAddress || "N/A"}
                    </div>
                    <div>
                      <strong>Permanent Address:</strong>{" "}
                      {selectedCustomer.permanentAddress || "N/A"}
                    </div>
                    <div>
                      <strong>Nationality:</strong>{" "}
                      {selectedCustomer.nationality || "N/A"}
                    </div>
                    <div>
                      <strong>Gender:</strong>{" "}
                      {selectedCustomer.gender || "N/A"}
                    </div>
                    <div>
                      <strong>Designation:</strong>{" "}
                      {selectedCustomer.designation || "N/A"}
                    </div>
                    <div>
                      <strong>Company Type:</strong>{" "}
                      {selectedCustomer.companyType || "N/A"}
                    </div>
                    <div>
                      <strong>Jurisdiction:</strong>{" "}
                      {selectedCustomer.jurisdiction || "N/A"}
                    </div>
                    <div>
                      <strong>Business Activity:</strong>{" "}
                      {selectedCustomer.businessActivity1 || "N/A"}
                    </div>
                    <div>
                      <strong>Office Type:</strong>{" "}
                      {selectedCustomer.officeType || "N/A"}
                    </div>
                    <div>
                      <strong>Quoted Price:</strong>{" "}
                      {selectedCustomer.quotedPrice || "N/A"}
                    </div>
                    <div>
                      <strong>Payment Plans:</strong>{" "}
                      {selectedCustomer.paymentPlans
                        ? Array.isArray(selectedCustomer.paymentPlans)
                          ? selectedCustomer.paymentPlans.join(", ")
                          : selectedCustomer.paymentPlans
                        : "N/A"}
                    </div>
                    <div className="md:col-span-2">
                      <strong>Payment Details:</strong>{" "}
                      {selectedCustomer.paymentDetails || "N/A"}
                    </div>

                    <div>
                      <strong>Created At:</strong>{" "}
                      {selectedCustomer.createdAt
                        ? new Date(
                            selectedCustomer.createdAt
                          ).toLocaleDateString()
                        : "N/A"}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Customer Documents */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    Uploaded Documents
                  </CardTitle>
                  <CardDescription>
                    Documents uploaded by the customer
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Debug info */}
                    <div className="text-xs text-gray-500 mb-2">
                      Total documents: {customerDocuments.length}
                      {customerDocuments.length > 0 && (
                        <div>
                          Document types:{" "}
                          {customerDocuments
                            .map((doc) => doc.documentType)
                            .join(", ")}
                        </div>
                      )}
                    </div>

                    {/* Local Proof */}
                    <div>
                      <h4 className="font-medium text-sm text-gray-700 mb-2">
                        Local Proof
                      </h4>
                      {(() => {
                        const localProofDoc = customerDocuments.find(
                          (doc) => doc.documentType === "local-proof"
                        );
                        return localProofDoc ? (
                          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border">
                            <div className="flex items-center gap-2">
                              <FileText className="w-4 h-4 text-blue-600" />
                              <div>
                                <p className="text-sm font-medium text-gray-900">
                                  {localProofDoc.documentName || "Local Proof"}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {new Date(
                                    localProofDoc.createdAt
                                  ).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                window.open(localProofDoc.fileUrl, "_blank")
                              }
                            >
                              <Eye className="w-4 h-4 mr-1" />
                              View
                            </Button>
                          </div>
                        ) : (
                          <div className="p-3 bg-gray-50 rounded-lg border text-gray-500 text-sm">
                            No local proof uploaded
                          </div>
                        );
                      })()}
                    </div>

                    {/* Passport Photo */}
                    <div>
                      <h4 className="font-medium text-sm text-gray-700 mb-2">
                        Passport Photo
                      </h4>
                      {(() => {
                        const passportPhotoDoc = customerDocuments.find(
                          (doc) => doc.documentType === "passport-photo"
                        );
                        return passportPhotoDoc ? (
                          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border">
                            <div className="flex items-center gap-2">
                              <FileText className="w-4 h-4 text-green-600" />
                              <div>
                                <p className="text-sm font-medium text-gray-900">
                                  {passportPhotoDoc.documentName ||
                                    "Passport Photo"}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {new Date(
                                    passportPhotoDoc.createdAt
                                  ).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                window.open(passportPhotoDoc.fileUrl, "_blank")
                              }
                            >
                              <Eye className="w-4 h-4 mr-1" />
                              View
                            </Button>
                          </div>
                        ) : (
                          <div className="p-3 bg-gray-50 rounded-lg border text-gray-500 text-sm">
                            No passport photo uploaded
                          </div>
                        );
                      })()}
                    </div>

                    {/* Bank Statement */}
                    <div>
                      <h4 className="font-medium text-sm text-gray-700 mb-2">
                        Bank Statement
                      </h4>
                      {(() => {
                        const bankStatementDoc = customerDocuments.find(
                          (doc) => doc.documentType === "bank-statement"
                        );
                        return bankStatementDoc ? (
                          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border">
                            <div className="flex items-center gap-2">
                              <FileText className="w-4 h-4 text-purple-600" />
                              <div>
                                <p className="text-sm font-medium text-gray-900">
                                  {bankStatementDoc.documentName ||
                                    "Bank Statement"}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {new Date(
                                    bankStatementDoc.createdAt
                                  ).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                window.open(bankStatementDoc.fileUrl, "_blank")
                              }
                            >
                              <Eye className="w-4 h-4 mr-1" />
                              View
                            </Button>
                          </div>
                        ) : (
                          <div className="p-3 bg-gray-50 rounded-lg border text-gray-500 text-sm">
                            No bank statement uploaded
                          </div>
                        );
                      })()}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Applications List for Selected Customer */}
              <>
                <CardContent>
                  <div className="space-y-4">
                    {getCustomerApplications(selectedCustomer._id).length ===
                    0 ? (
                      <div className="text-muted-foreground">
                        No applications found.
                      </div>
                    ) : (
                      getCustomerApplications(selectedCustomer._id).map(
                        (app) => (
                          <div
                            key={app._id}
                            className="border rounded-lg p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4"
                          >
                            <div></div>
                            <div className="flex gap-2 min-w-[220px]">
                              <Textarea
                                placeholder="Add a note (optional)"
                                value={reviewNotes[app._id] || ""}
                                onChange={(e) =>
                                  setReviewNotes((prev) => ({
                                    ...prev,
                                    [app._id]: e.target.value,
                                  }))
                                }
                                className="min-h-[36px]"
                              />
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  variant="default"
                                  disabled={reviewLoading[app._id]}
                                  onClick={async () => {
                                    setReviewLoading((prev) => ({
                                      ...prev,
                                      [app._id]: true,
                                    }));
                                    try {
                                      await axios.patch(
                                        `${
                                          import.meta.env.VITE_BASE_URL
                                        }/api/application/review-after-onboarding/${
                                          app._id
                                        }`,
                                        {
                                          decision: "approve",
                                          note: reviewNotes[app._id] || "",
                                        },
                                        {
                                          headers: {
                                            Authorization: `Bearer ${token}`,
                                          },
                                        }
                                      );
                                      toast({
                                        title: "Success",
                                        description:
                                          "Application marked as Ready for Processing",
                                      });
                                      fetchApplications();
                                    } catch (err: any) {
                                      console.error(
                                        "Review error (approve):",
                                        err?.response || err
                                      );
                                      toast({
                                        title: "Error",
                                        description:
                                          err?.response?.data?.message ||
                                          "Failed to review application.",
                                        variant: "destructive",
                                      });
                                    } finally {
                                      setReviewLoading((prev) => ({
                                        ...prev,
                                        [app._id]: false,
                                      }));
                                    }
                                  }}
                                >
                                  {reviewLoading[app._id]
                                    ? "Approving..."
                                    : "Approve"}
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  disabled={reviewLoading[app._id]}
                                  onClick={async () => {
                                    setReviewLoading((prev) => ({
                                      ...prev,
                                      [app._id]: true,
                                    }));
                                    try {
                                      await axios.patch(
                                        `${
                                          import.meta.env.VITE_BASE_URL
                                        }/api/application/review-after-onboarding/${
                                          app._id
                                        }`,
                                        {
                                          decision: "clarify",
                                          note: reviewNotes[app._id] || "",
                                        },
                                        {
                                          headers: {
                                            Authorization: `Bearer ${token}`,
                                          },
                                        }
                                      );
                                      toast({
                                        title: "Success",
                                        description:
                                          "Clarification requested from customer",
                                      });
                                      fetchApplications();
                                    } catch (err: any) {
                                      console.error(
                                        "Review error (clarify):",
                                        err?.response || err
                                      );
                                      toast({
                                        title: "Error",
                                        description:
                                          err?.response?.data?.message ||
                                          "Failed to review application.",
                                        variant: "destructive",
                                      });
                                    } finally {
                                      setReviewLoading((prev) => ({
                                        ...prev,
                                        [app._id]: false,
                                      }));
                                    }
                                  }}
                                >
                                  {reviewLoading[app._id]
                                    ? "Requesting..."
                                    : "Clarify"}
                                </Button>
                              </div>
                            </div>
                          </div>
                        )
                      )
                    )}
                  </div>
                </CardContent>
              </>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

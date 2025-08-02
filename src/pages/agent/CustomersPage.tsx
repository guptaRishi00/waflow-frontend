import React, { useState, useEffect } from "react";
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
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Search,
  MessageSquare,
  FileText,
  Phone,
  Mail,
  MapPin,
  Plus,
  Eye,
  EyeOff,
} from "lucide-react";
import { Link } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import axios from "axios";
import { useToast } from "@/hooks/use-toast";
import { useSelector } from "react-redux";
import { RootState } from "@/app/store";

interface Customer {
  _id: string;
  customerId: string;
  assignedAgentId?: string;
  assignedAgentRole?: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  dob?: string;
  email: string;
  phoneNumber?: string;
  nationality?: string;
  gender?: string;
  address?: {
    line1: string;
    line2?: string;
    city: string;
    state: string;
    country: string;
    zipcode: string;
  };
  emiratesIdNumber?: string;
  passportNumber?: string;
  createdAt: string;
  userId: string;
}

interface Application {
  _id: string;
  customer:
    | string
    | {
        _id: string;
        firstName: string;
        lastName: string;
        email: string;
        phoneNumber?: string;
      };
  status: string;
  steps: Array<{
    stepName: string;
    status: string;
  }>;
  createdAt: string;
}

export const CustomersPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(
    null
  );
  const [customerDocuments, setCustomerDocuments] = useState<any[]>([]);
  const [agentNames, setAgentNames] = useState<{ [key: string]: string }>({});

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
    addressLine1: "",
    addressLine2: "",
    addressCity: "",
    addressState: "",
    addressCountry: "",
    addressZipcode: "",
    nationality: "",
    gender: "",
    emiratesId: "",
    passportNumber: "",
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

    // Required fields according to backend controller
    const requiredFields = [
      "firstName",
      "lastName",
      "dob",
      "gender",
      "email",
      "phoneNumber",
      "nationality",
      "passportNumber",
      "password",
    ];

    requiredFields.forEach((field) => {
      const value = form[field as keyof typeof form];
      if (!value || (typeof value === "string" && value.trim() === "")) {
        errors[field] = "Required";
      }
    });

    // Validate address fields (address is required in backend)
    if (!form.addressLine1 || form.addressLine1.trim() === "") {
      errors.addressLine1 = "Required";
    }
    if (!form.addressCity || form.addressCity.trim() === "") {
      errors.addressCity = "Required";
    }
    if (!form.addressState || form.addressState.trim() === "") {
      errors.addressState = "Required";
    }
    if (!form.addressCountry || form.addressCountry.trim() === "") {
      errors.addressCountry = "Required";
    }
    if (!form.addressZipcode || form.addressZipcode.trim() === "") {
      errors.addressZipcode = "Required";
    }

    // Validate email format
    if (
      form.email &&
      !/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(form.email)
    ) {
      errors.email = "Invalid email address";
    }

    // Validate phone number format (7-15 digits)
    if (form.phoneNumber && !/^\d{7,15}$/.test(form.phoneNumber)) {
      errors.phoneNumber = "Phone number must be 7 to 15 digits";
    }

    // Validate passport number format (alphanumeric, max 20 chars)
    if (form.passportNumber && !/^[a-zA-Z0-9]*$/.test(form.passportNumber)) {
      errors.passportNumber = "Passport number must be alphanumeric";
    }

    // Validate first name and last name (alphabets only)
    if (form.firstName && !/^[A-Za-z\s]+$/.test(form.firstName)) {
      errors.firstName = "First name should contain alphabets only";
    }

    if (form.lastName && !/^[A-Za-z\s]+$/.test(form.lastName)) {
      errors.lastName = "Last name should contain alphabets only";
    }

    // Validate middle name (alphabets only, optional)
    if (form.middleName && !/^[A-Za-z\s]*$/.test(form.middleName)) {
      errors.middleName = "Middle name should contain alphabets only";
    }

    // Validate emirates ID (alphanumeric, optional)
    if (form.emiratesId && !/^[a-zA-Z0-9]*$/.test(form.emiratesId)) {
      errors.emiratesId = "Emirates ID must be alphanumeric";
    }

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
      // Ensure all required fields are present
      if (
        !form.passportNumber ||
        !form.addressLine1 ||
        !form.addressCity ||
        !form.addressState ||
        !form.addressCountry ||
        !form.addressZipcode
      ) {
        toast({
          title: "Validation Error",
          description: "Passport number and all address fields are required.",
          variant: "destructive",
        });
        setCreating(false);
        return;
      }

      const payload: any = {
        firstName: form.firstName,
        middleName: form.middleName || "",
        lastName: form.lastName,
        dob: form.dob,
        email: form.email,
        phoneNumber: form.phoneNumber,
        address: {
          line1: form.addressLine1,
          line2: form.addressLine2 || "",
          city: form.addressCity,
          state: form.addressState,
          country: form.addressCountry,
          zipcode: form.addressZipcode,
        },
        nationality: form.nationality,
        gender: form.gender,
        passportNumber: form.passportNumber,
        password: form.password,
        assignedAgentId: user?.userId,
      };

      // Only include emiratesIdNumber if provided
      if (form.emiratesId && form.emiratesId.trim()) {
        payload.emiratesIdNumber = form.emiratesId;
      }

      console.log("Sending payload:", payload); // Debug log

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
        addressLine1: "",
        addressLine2: "",
        addressCity: "",
        addressState: "",
        addressCountry: "",
        addressZipcode: "",
        nationality: "",
        gender: "",
        emiratesId: "",
        passportNumber: "",
        password: "",
      });
      // Refresh applications list after customer creation
      fetchApplications();
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

        // Decode token to get agent ID
        const tokenPayload = JSON.parse(atob(token.split(".")[1]));
        const agentId = tokenPayload.userId || tokenPayload.id;
        console.log("Agent ID:", agentId);

        // Fetch all customers
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
          const agentCustomers = customersData.data.filter(
            (customer: Customer) => customer.assignedAgentId === agentId
          );
          setCustomers(agentCustomers);

          // Fetch agent names for all customers
          const agentNamePromises = agentCustomers.map(
            async (customer: Customer) => {
              if (customer.assignedAgentId) {
                const agentName = await fetchAgentDetails(
                  customer.assignedAgentId
                );
                return { agentId: customer.assignedAgentId, agentName };
              }
              return null;
            }
          );

          const agentNameResults = await Promise.all(agentNamePromises);
          const agentNamesMap: { [key: string]: string } = {};
          agentNameResults.forEach((result) => {
            if (result) {
              agentNamesMap[result.agentId] = result.agentName;
            }
          });
          setAgentNames(agentNamesMap);

          if (agentCustomers.length > 0) {
            setSelectedCustomer(agentCustomers[0]);
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

      // Handle populated customer object (from backend populate)
      if (
        typeof app.customer === "object" &&
        app.customer !== null &&
        "_id" in app.customer
      ) {
        return (app.customer as { _id: string })._id === customerId;
      }

      // Handle customer as string ID
      if (typeof app.customer === "string") {
        return app.customer === customerId;
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

  // Fetch agent details to get agent names
  const fetchAgentDetails = async (agentId: string) => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/api/user/agents/${agentId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      return response.data.data?.fullName || "Unknown Agent";
    } catch (error) {
      console.error("Error fetching agent details:", error);
      return "Unknown Agent";
    }
  };

  // Get agent name for display
  const getAgentName = (agentId: string) => {
    return agentNames[agentId] || "Loading...";
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
            View and manage your assigned customers
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
            <p className="">
              All Fields are mandatory <span className="text-red-500">*</span>
            </p>
          </DialogHeader>
          <form
            onSubmit={handleCreateCustomer}
            className="space-y-3 max-h-[70vh] overflow-y-auto"
          >
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName">
                  First Name <span className="text-red-500">*</span>
                </Label>
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
                <Label htmlFor="lastName">
                  Last Name <span className="text-red-500">*</span>
                </Label>
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
                <Label htmlFor="dob">
                  Date of Birth <span className="text-red-500">*</span>
                </Label>
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
                <Label htmlFor="email">
                  Email <span className="text-red-500">*</span>
                </Label>
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
                <Label htmlFor="phoneNumber">
                  Phone Number <span className="text-red-500">*</span>
                </Label>
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
                <Label htmlFor="nationality">
                  Nationality <span className="text-red-500">*</span>
                </Label>
                <Input
                  name="nationality"
                  value={form.nationality}
                  onChange={handleFormChange}
                  placeholder="Enter nationality"
                />
                {formErrors.nationality && (
                  <span className="text-xs text-red-500">
                    {formErrors.nationality}
                  </span>
                )}
              </div>
              <div>
                <Label htmlFor="gender">
                  Gender <span className="text-red-500">*</span>
                </Label>
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
                  </SelectContent>
                </Select>
                {formErrors.gender && (
                  <span className="text-xs text-red-500">
                    {formErrors.gender}
                  </span>
                )}
              </div>
              <div>
                <Label htmlFor="addressLine1">
                  Address Line 1 <span className="text-red-500">*</span>
                </Label>
                <Input
                  name="addressLine1"
                  value={form.addressLine1}
                  onChange={handleFormChange}
                  placeholder="Enter address line 1"
                />
                {formErrors.addressLine1 && (
                  <span className="text-xs text-red-500">
                    {formErrors.addressLine1}
                  </span>
                )}
              </div>
              <div>
                <Label htmlFor="addressLine2">Address Line 2</Label>
                <Input
                  name="addressLine2"
                  value={form.addressLine2}
                  onChange={handleFormChange}
                  placeholder="Enter address line 2 (optional)"
                />
                {formErrors.addressLine2 && (
                  <span className="text-xs text-red-500">
                    {formErrors.addressLine2}
                  </span>
                )}
              </div>
              <div>
                <Label htmlFor="addressCity">
                  City <span className="text-red-500">*</span>
                </Label>
                <Input
                  name="addressCity"
                  value={form.addressCity}
                  onChange={handleFormChange}
                  placeholder="Enter city"
                />
                {formErrors.addressCity && (
                  <span className="text-xs text-red-500">
                    {formErrors.addressCity}
                  </span>
                )}
              </div>
              <div>
                <Label htmlFor="addressState">
                  State <span className="text-red-500">*</span>
                </Label>
                <Input
                  name="addressState"
                  value={form.addressState}
                  onChange={handleFormChange}
                  placeholder="Enter state"
                />
                {formErrors.addressState && (
                  <span className="text-xs text-red-500">
                    {formErrors.addressState}
                  </span>
                )}
              </div>
              <div>
                <Label htmlFor="addressCountry">
                  Country <span className="text-red-500">*</span>
                </Label>
                <Input
                  name="addressCountry"
                  value={form.addressCountry}
                  onChange={handleFormChange}
                  placeholder="Enter country"
                />
                {formErrors.addressCountry && (
                  <span className="text-xs text-red-500">
                    {formErrors.addressCountry}
                  </span>
                )}
              </div>
              <div>
                <Label htmlFor="addressZipcode">
                  Zipcode <span className="text-red-500">*</span>
                </Label>
                <Input
                  name="addressZipcode"
                  value={form.addressZipcode}
                  onChange={handleFormChange}
                  placeholder="Enter zipcode"
                />
                {formErrors.addressZipcode && (
                  <span className="text-xs text-red-500">
                    {formErrors.addressZipcode}
                  </span>
                )}
              </div>
              <div>
                <Label htmlFor="emiratesId">Emirates ID</Label>
                <Input
                  name="emiratesId"
                  value={form.emiratesId}
                  onChange={handleFormChange}
                  placeholder="Enter Emirates ID (optional)"
                />
                {formErrors.emiratesId && (
                  <span className="text-xs text-red-500">
                    {formErrors.emiratesId}
                  </span>
                )}
              </div>
              <div>
                <Label htmlFor="passportNumber">
                  Passport Number <span className="text-red-500">*</span>
                </Label>
                <Input
                  name="passportNumber"
                  value={form.passportNumber}
                  onChange={handleFormChange}
                  placeholder="Enter passport number"
                />
                {formErrors.passportNumber && (
                  <span className="text-xs text-red-500">
                    {formErrors.passportNumber}
                  </span>
                )}
              </div>
              <div>
                <Label htmlFor="password">
                  Password <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <Input
                    name="password"
                    type={showPassword ? "text" : "password"}
                    value={form.password}
                    onChange={handleFormChange}
                    placeholder="Enter password"
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
                {formErrors.password && (
                  <span className="text-xs text-red-500">
                    {formErrors.password}
                  </span>
                )}
                {form.password && (
                  <div className="mt-2 space-y-1">
                    <div className="flex items-center space-x-2">
                      <div
                        className={`h-2 w-2 rounded-full ${
                          passwordStrength.hasMinLength
                            ? "bg-green-500"
                            : "bg-gray-300"
                        }`}
                      />
                      <span className="text-xs">At least 8 characters</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div
                        className={`h-2 w-2 rounded-full ${
                          passwordStrength.hasCapital
                            ? "bg-green-500"
                            : "bg-gray-300"
                        }`}
                      />
                      <span className="text-xs">One capital letter</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div
                        className={`h-2 w-2 rounded-full ${
                          passwordStrength.hasNumber
                            ? "bg-green-500"
                            : "bg-gray-300"
                        }`}
                      />
                      <span className="text-xs">One number</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div
                        className={`h-2 w-2 rounded-full ${
                          passwordStrength.hasSpecial
                            ? "bg-green-500"
                            : "bg-gray-300"
                        }`}
                      />
                      <span className="text-xs">One special character</span>
                    </div>
                  </div>
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
            <CardTitle>Customers</CardTitle>
            <CardDescription>All assigned customers</CardDescription>
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
                    <div className="flex items-center space-x-2"></div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {selectedCustomer.customerId && (
                      <div>
                        <strong>Customer ID:</strong>{" "}
                        {selectedCustomer.customerId}
                      </div>
                    )}
                    {selectedCustomer.assignedAgentId && (
                      <div>
                        <strong>Assigned Agent:</strong>{" "}
                        {getAgentName(selectedCustomer.assignedAgentId)}
                      </div>
                    )}
                    {selectedCustomer.assignedAgentRole && (
                      <div>
                        <strong>Assigned Agent Role:</strong>{" "}
                        {selectedCustomer.assignedAgentRole}
                      </div>
                    )}
                    {selectedCustomer.firstName && (
                      <div>
                        <strong>First Name:</strong>{" "}
                        {selectedCustomer.firstName}
                      </div>
                    )}
                    {selectedCustomer.middleName && (
                      <div>
                        <strong>Middle Name:</strong>{" "}
                        {selectedCustomer.middleName}
                      </div>
                    )}
                    {selectedCustomer.lastName && (
                      <div>
                        <strong>Last Name:</strong>{" "}
                        {selectedCustomer.lastName}
                      </div>
                    )}
                    {selectedCustomer.dob && (
                      <div>
                        <strong>Date of Birth:</strong>{" "}
                        {new Date(selectedCustomer.dob).toLocaleDateString()}
                      </div>
                    )}
                    {selectedCustomer.email && (
                      <div>
                        <strong>Email:</strong> {selectedCustomer.email}
                      </div>
                    )}
                    {selectedCustomer.phoneNumber && (
                      <div>
                        <strong>Phone Number:</strong>{" "}
                        {selectedCustomer.phoneNumber}
                      </div>
                    )}
                    {selectedCustomer.nationality && (
                      <div>
                        <strong>Nationality:</strong>{" "}
                        {selectedCustomer.nationality}
                      </div>
                    )}
                    {selectedCustomer.gender && (
                      <div>
                        <strong>Gender:</strong>{" "}
                        {selectedCustomer.gender}
                      </div>
                    )}
                    {selectedCustomer.emiratesIdNumber && (
                      <div>
                        <strong>Emirates ID Number:</strong>{" "}
                        {selectedCustomer.emiratesIdNumber}
                      </div>
                    )}
                    {selectedCustomer.passportNumber && (
                      <div>
                        <strong>Passport Number:</strong>{" "}
                        {selectedCustomer.passportNumber}
                      </div>
                    )}
                    {selectedCustomer.address && (
                      <div className="md:col-span-2">
                        <strong>Address:</strong>{" "}
                        <div className="mt-1 text-sm">
                          {selectedCustomer.address.line1 && (
                            <div>Line 1: {selectedCustomer.address.line1}</div>
                          )}
                          {selectedCustomer.address.line2 && (
                            <div>Line 2: {selectedCustomer.address.line2}</div>
                          )}
                          {selectedCustomer.address.city && (
                            <div>City: {selectedCustomer.address.city}</div>
                          )}
                          {selectedCustomer.address.state && (
                            <div>State: {selectedCustomer.address.state}</div>
                          )}
                          {selectedCustomer.address.country && (
                            <div>Country: {selectedCustomer.address.country}</div>
                          )}
                          {selectedCustomer.address.zipcode && (
                            <div>Zipcode: {selectedCustomer.address.zipcode}</div>
                          )}
                        </div>
                      </div>
                    )}
                    {selectedCustomer.createdAt && (
                      <div>
                        <strong>Created At:</strong>{" "}
                        {new Date(selectedCustomer.createdAt).toLocaleDateString()}
                      </div>
                    )}
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
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <span className="text-sm font-medium">
                                  Application ID:
                                </span>
                                <span className="text-sm text-muted-foreground">
                                  {app._id}
                                </span>
                                <Badge
                                  variant="outline"
                                  className={`text-xs ${
                                    app.status === "New" ||
                                    app.status === "Ready for Processing"
                                      ? "bg-blue-100 text-blue-800 border-blue-200"
                                      : app.status === "In Progress" ||
                                        app.status ===
                                          "Waiting for Agent Review"
                                      ? "bg-yellow-100 text-yellow-800 border-yellow-200"
                                      : app.status === "Completed" ||
                                        app.status === "Approved"
                                      ? "bg-green-100 text-green-800 border-green-200"
                                      : app.status === "Rejected" ||
                                        app.status === "Declined"
                                      ? "bg-red-100 text-red-800 border-red-200"
                                      : app.status ===
                                        "Awaiting Client Response"
                                      ? "bg-orange-100 text-orange-800 border-orange-200"
                                      : "bg-gray-100 text-gray-800 border-gray-200"
                                  }`}
                                >
                                  {app.status}
                                </Badge>
                              </div>
                              <div className="text-xs text-muted-foreground">
                                Created:{" "}
                                {new Date(app.createdAt).toLocaleDateString()}
                              </div>
                            </div>
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

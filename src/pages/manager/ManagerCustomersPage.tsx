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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Eye,
  Search,
  Filter,
  FileText,
  Users,
  UserCheck,
  Clock,
  FileCheck,
  MoreHorizontal,
  Edit,
  UserX,
  Phone,
  Mail,
  Calendar,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Plus,
  EyeOff,
} from "lucide-react";
import { useSelector } from "react-redux";
import { RootState } from "@/app/store";
import { useToast } from "@/hooks/use-toast";
import { PageLoader } from "@/components/ui/page-loader";
import axios from "axios";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { CustomerDetailView } from "./CustomerDetailView";

// Customer interface
interface Customer {
  _id: string;
  customerId: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  dob?: string;
  gender?: string;
  email: string;
  phoneNumber?: string;
  nationality?: string;
  assignedAgentId?: string;
  assignedAgentRole?: string;
  createdAt: string;
  updatedAt?: string;
  status?: string;
  emiratesIdNumber?: string;
  passportNumber?: string;
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
    agentId: string;
    fullName: string;
    email: string;
  };
}

// Application interface
interface Application {
  _id: string;
  customer:
    | string
    | {
        _id: string;
        firstName: string;
        lastName: string;
        email: string;
      };
  status: string;
  createdAt: string;
}

export const ManagerCustomersPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const { token } = useSelector((state: RootState) => state.customerAuth);
  const { toast } = useToast();

  // Modal states
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(
    null
  );
  const [customerToToggle, setCustomerToToggle] = useState<Customer | null>(
    null
  );
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(
    null
  );

  // Edit form state
  const [editFormData, setEditFormData] = useState({
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
    password: "",
    address: {
      line1: "",
      line2: "",
      city: "",
      state: "",
      country: "",
      zipcode: "",
    },
  });
  const [editFormErrors, setEditFormErrors] = useState<{
    [key: string]: string;
  }>({});
  const [showEditPassword, setShowEditPassword] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  // Create customer form state
  const [createFormData, setCreateFormData] = useState({
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
  const [createFormErrors, setCreateFormErrors] = useState<{
    [key: string]: string;
  }>({});
  const [showCreatePassword, setShowCreatePassword] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

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

  const passwordStrength = checkPasswordStrength(createFormData.password);

  // Debug useEffect for edit form data
  useEffect(() => {
    if (isEditModalOpen && editFormData.firstName) {
      console.log("Edit form data updated:", editFormData);
    }
  }, [editFormData, isEditModalOpen]);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);

  // Fetch agent details by agent ID
  const fetchAgentDetails = async (agentId: string) => {
    if (!token) return null;
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/api/user/agents/${agentId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      return response.data.data;
    } catch (err: any) {
      // Only log non-404 errors to reduce console noise
      if (err.response?.status !== 404) {
        console.error("Error fetching agent details:", err);
      }
      return null;
    }
  };

  // Fetch customers from backend
  const fetchCustomers = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/api/user/customers`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const customersData = response.data.data || [];
      console.log("Raw customers data from API:", customersData);

      // Fetch agent details for each customer with assignedAgentId
      const customersWithAgents = await Promise.all(
        customersData.map(async (customer) => {
          if (customer.assignedAgentId) {
            const agentDetails = await fetchAgentDetails(
              customer.assignedAgentId
            );
            return {
              ...customer,
              assignedAgent: agentDetails,
            };
          }
          return customer;
        })
      );

      console.log("Processed customers data:", customersWithAgents);
      setCustomers(customersWithAgents);
    } catch (err) {
      console.error("Error fetching customers:", err);
      setError("Failed to load customers");
      toast({
        title: "Error",
        description: "Failed to load customers.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Fetch applications from backend
  const fetchApplications = async () => {
    if (!token) return;
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/api/application`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setApplications(response.data.data || []);
    } catch (err) {
      console.error("Error fetching applications:", err);
    }
  };

  useEffect(() => {
    fetchCustomers();
    fetchApplications();
  }, [token]);

  // Calculate summary statistics
  const totalCustomers = customers.length;
  const activeCustomers = customers.filter(
    (customer) =>
      customer.status === "active" ||
      (customer.assignedAgentId && customer.assignedAgentId !== null)
  ).length;
  const pendingAssignment = customers.filter(
    (customer) => !customer.assignedAgentId || customer.assignedAgentId === null
  ).length;
  const totalApplications = applications.length;

  // Get customer applications count
  const getCustomerApplicationsCount = (customerId: string) => {
    return applications.filter((app) => {
      if (typeof app.customer === "string") {
        return app.customer === customerId;
      }
      if (typeof app.customer === "object" && app.customer !== null) {
        return (app.customer as any)._id === customerId;
      }
      return false;
    }).length;
  };

  // Get customer status
  const getCustomerStatus = (customer: Customer) => {
    if (customer.status) return customer.status;
    return customer.assignedAgentId ? "active" : "pending";
  };

  // Get customer name
  const getCustomerName = (customer: Customer) => {
    return `${customer.firstName} ${customer.lastName}`;
  };

  // Get customer initials
  const getCustomerInitials = (customer: Customer) => {
    return `${customer.firstName[0]}${customer.lastName[0]}`;
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-GB");
  };

  // Handle edit customer
  const handleEditCustomer = async () => {
    if (!selectedCustomer || !token) return;

    // Validate form
    const errors: { [key: string]: string } = {};
    if (!editFormData.firstName) errors.firstName = "First name is required";
    if (!editFormData.lastName) errors.lastName = "Last name is required";
    if (!editFormData.email) errors.email = "Email is required";
    if (!editFormData.phoneNumber)
      errors.phoneNumber = "Phone number is required";
    if (!editFormData.nationality)
      errors.nationality = "Nationality is required";

    if (Object.keys(errors).length > 0) {
      setEditFormErrors(errors);
      return;
    }

    setIsUpdating(true);
    try {
      const updateData: any = {
        customerId: editFormData.customerId,
        assignedAgentId: editFormData.assignedAgentId,
        assignedAgentRole: editFormData.assignedAgentRole,
        firstName: editFormData.firstName,
        middleName: editFormData.middleName,
        lastName: editFormData.lastName,
        dob: editFormData.dob,
        gender: editFormData.gender,
        email: editFormData.email,
        phoneNumber: editFormData.phoneNumber,
        nationality: editFormData.nationality,
        emiratesIdNumber: editFormData.emiratesIdNumber,
        passportNumber: editFormData.passportNumber,
        address: editFormData.address,
      };

      // Only include password if it's provided
      if (editFormData.password) {
        updateData.password = editFormData.password;
      }

      const response = await axios.put(
        `${import.meta.env.VITE_BASE_URL}/api/user/customer/${
          selectedCustomer._id
        }`,
        updateData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      toast({
        title: "Success",
        description: "Customer updated successfully!",
      });

      // Update the customers list with the new data
      setCustomers((prevCustomers) =>
        prevCustomers.map((customer) =>
          customer._id === selectedCustomer._id
            ? { ...customer, ...response.data.data }
            : customer
        )
      );

      setIsEditModalOpen(false);
      setEditFormData({
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
        password: "",
        address: {
          line1: "",
          line2: "",
          city: "",
          state: "",
          country: "",
          zipcode: "",
        },
      });
      setEditFormErrors({});
      setShowEditPassword(false);
    } catch (error: any) {
      toast({
        title: "Error",
        description:
          error?.response?.data?.message || "Failed to update customer",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  // Handle toggle status
  const handleToggleStatus = (customer: Customer) => {
    setCustomerToToggle(customer);
    setIsStatusModalOpen(true);
  };

  const confirmToggleStatus = async () => {
    if (!customerToToggle || !token) return;

    const newStatus =
      getCustomerStatus(customerToToggle) === "active" ? "inactive" : "active";

    setIsUpdating(true);
    try {
      const response = await axios.put(
        `${import.meta.env.VITE_BASE_URL}/api/user/customer/${
          customerToToggle._id
        }`,
        { status: newStatus },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // Update the customers list with the new status
      setCustomers((prevCustomers) =>
        prevCustomers.map((customer) =>
          customer._id === customerToToggle._id
            ? { ...customer, status: newStatus }
            : customer
        )
      );

      toast({
        title: "Status Updated",
        description: `Customer ${getCustomerName(customerToToggle)} has been ${
          newStatus === "active" ? "activated" : "deactivated"
        } successfully.`,
      });

      setIsStatusModalOpen(false);
      setCustomerToToggle(null);
    } catch (error: any) {
      toast({
        title: "Error",
        description:
          error?.response?.data?.message || "Failed to update customer status",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  // Handle form field changes
  const handleCreateFormChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setCreateFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle Select field changes
  const handleCreateSelectChange = (name: string, value: string) => {
    setCreateFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Validate required fields
  const validateCreateForm = () => {
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
      const value = createFormData[field as keyof typeof createFormData];
      if (!value || (typeof value === "string" && value.trim() === "")) {
        errors[field] = "Required";
      }
    });

    // Validate address fields (address is required in backend)
    if (
      !createFormData.addressLine1 ||
      createFormData.addressLine1.trim() === ""
    ) {
      errors.addressLine1 = "Required";
    }
    if (
      !createFormData.addressCity ||
      createFormData.addressCity.trim() === ""
    ) {
      errors.addressCity = "Required";
    }
    if (
      !createFormData.addressState ||
      createFormData.addressState.trim() === ""
    ) {
      errors.addressState = "Required";
    }
    if (
      !createFormData.addressCountry ||
      createFormData.addressCountry.trim() === ""
    ) {
      errors.addressCountry = "Required";
    }
    if (
      !createFormData.addressZipcode ||
      createFormData.addressZipcode.trim() === ""
    ) {
      errors.addressZipcode = "Required";
    }

    // Validate email format
    if (
      createFormData.email &&
      !/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(createFormData.email)
    ) {
      errors.email = "Invalid email address";
    }

    // Validate phone number format (7-15 digits)
    if (
      createFormData.phoneNumber &&
      !/^\d{7,15}$/.test(createFormData.phoneNumber)
    ) {
      errors.phoneNumber = "Phone number must be 7 to 15 digits";
    }

    // Validate passport number format (alphanumeric, max 20 chars)
    if (
      createFormData.passportNumber &&
      !/^[a-zA-Z0-9]*$/.test(createFormData.passportNumber)
    ) {
      errors.passportNumber = "Passport number must be alphanumeric";
    }

    // Validate first name and last name (alphabets only)
    if (
      createFormData.firstName &&
      !/^[A-Za-z\s]+$/.test(createFormData.firstName)
    ) {
      errors.firstName = "First name should contain alphabets only";
    }

    if (
      createFormData.lastName &&
      !/^[A-Za-z\s]+$/.test(createFormData.lastName)
    ) {
      errors.lastName = "Last name should contain alphabets only";
    }

    // Validate middle name (alphabets only, optional)
    if (
      createFormData.middleName &&
      !/^[A-Za-z\s]*$/.test(createFormData.middleName)
    ) {
      errors.middleName = "Middle name should contain alphabets only";
    }

    // Validate emirates ID (alphanumeric, optional)
    if (
      createFormData.emiratesId &&
      !/^[a-zA-Z0-9]*$/.test(createFormData.emiratesId)
    ) {
      errors.emiratesId = "Emirates ID must be alphanumeric";
    }

    // Check password strength
    if (createFormData.password && !passwordStrength.isStrong) {
      errors.password =
        "Password must be strong (capital letter, number, special character, min 8 chars)";
    }

    return errors;
  };

  // Handle create customer
  const handleCreateCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateFormErrors({});
    const errors = validateCreateForm();
    if (Object.keys(errors).length > 0) {
      setCreateFormErrors(errors);
      return;
    }
    setIsCreating(true);
    try {
      // Ensure all required fields are present
      if (
        !createFormData.passportNumber ||
        !createFormData.addressLine1 ||
        !createFormData.addressCity ||
        !createFormData.addressState ||
        !createFormData.addressCountry ||
        !createFormData.addressZipcode
      ) {
        toast({
          title: "Validation Error",
          description: "Passport number and all address fields are required.",
          variant: "destructive",
        });
        setIsCreating(false);
        return;
      }

      const payload: any = {
        firstName: createFormData.firstName,
        middleName: createFormData.middleName || "",
        lastName: createFormData.lastName,
        dob: createFormData.dob,
        email: createFormData.email,
        phoneNumber: createFormData.phoneNumber,
        address: {
          line1: createFormData.addressLine1,
          line2: createFormData.addressLine2 || "",
          city: createFormData.addressCity,
          state: createFormData.addressState,
          country: createFormData.addressCountry,
          zipcode: createFormData.addressZipcode,
        },
        nationality: createFormData.nationality,
        gender: createFormData.gender,
        passportNumber: createFormData.passportNumber,
        password: createFormData.password,
      };

      // Only include emiratesIdNumber if provided
      if (createFormData.emiratesId && createFormData.emiratesId.trim()) {
        payload.emiratesIdNumber = createFormData.emiratesId;
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
      setIsCreateModalOpen(false);
      setCreateFormData({
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
      setCreateFormErrors({});
      setShowCreatePassword(false);
      // Refresh customers list
      fetchCustomers();
    } catch (err: any) {
      toast({
        title: "Error",
        description:
          err?.response?.data?.message || "Failed to create customer",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  // Update edit form when selected customer changes
  useEffect(() => {
    if (selectedCustomer && isEditModalOpen) {
      setEditFormData({
        customerId: selectedCustomer.customerId || "",
        assignedAgentId: selectedCustomer.assignedAgentId || "",
        assignedAgentRole: selectedCustomer.assignedAgentRole || "",
        firstName: selectedCustomer.firstName || "",
        middleName: selectedCustomer.middleName || "",
        lastName: selectedCustomer.lastName || "",
        dob: selectedCustomer.dob || "",
        gender: selectedCustomer.gender || "",
        email: selectedCustomer.email || "",
        phoneNumber: selectedCustomer.phoneNumber || "",
        nationality: selectedCustomer.nationality || "",
        emiratesIdNumber: selectedCustomer.emiratesIdNumber || "",
        passportNumber: selectedCustomer.passportNumber || "",
        password: "",
        address: {
          line1: selectedCustomer.address?.line1 || "",
          line2: selectedCustomer.address?.line2 || "",
          city: selectedCustomer.address?.city || "",
          state: selectedCustomer.address?.state || "",
          country: selectedCustomer.address?.country || "",
          zipcode: selectedCustomer.address?.zipcode || "",
        },
      });
      setEditFormErrors({});
      setShowEditPassword(false);
    }
  }, [selectedCustomer, isEditModalOpen]);

  // Filter customers based on search
  const filteredCustomers = customers.filter(
    (customer) =>
      getCustomerName(customer)
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.customerId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination logic
  const totalPages = Math.ceil(filteredCustomers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedCustomers = filteredCustomers.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (value: string) => {
    setItemsPerPage(Number(value));
    setCurrentPage(1);
  };

  const handleViewCustomerDetails = (customerId: string) => {
    setSelectedCustomerId(customerId);
  };

  const handleBackToCustomers = () => {
    setSelectedCustomerId(null);
  };

  // Reset to first page when search term changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  if (loading) {
    return <PageLoader message="Loading customers..." size="lg" />;
  }

  // Show customer detail view if a customer is selected
  if (selectedCustomerId) {
    return (
      <CustomerDetailView
        customerId={selectedCustomerId}
        onBack={handleBackToCustomers}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-primary">All Customers</h1>
          <p className="text-muted-foreground">
            Overview of all customers across all agents
          </p>
        </div>
        <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary/90">
              <Plus className="h-4 w-4 mr-2" />
              Create New Customer
            </Button>
          </DialogTrigger>
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
                    value={createFormData.firstName}
                    onChange={handleCreateFormChange}
                  />
                  {createFormErrors.firstName && (
                    <span className="text-xs text-red-500">
                      {createFormErrors.firstName}
                    </span>
                  )}
                </div>
                <div>
                  <Label htmlFor="middleName">Middle Name</Label>
                  <Input
                    name="middleName"
                    value={createFormData.middleName}
                    onChange={handleCreateFormChange}
                  />
                </div>
                <div>
                  <Label htmlFor="lastName">
                    Last Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    name="lastName"
                    value={createFormData.lastName}
                    onChange={handleCreateFormChange}
                  />
                  {createFormErrors.lastName && (
                    <span className="text-xs text-red-500">
                      {createFormErrors.lastName}
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
                    value={createFormData.dob}
                    onChange={handleCreateFormChange}
                  />
                  {createFormErrors.dob && (
                    <span className="text-xs text-red-500">
                      {createFormErrors.dob}
                    </span>
                  )}
                </div>
                <div>
                  <Label htmlFor="email">
                    Email <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    name="email"
                    type="email"
                    value={createFormData.email}
                    onChange={handleCreateFormChange}
                  />
                  {createFormErrors.email && (
                    <span className="text-xs text-red-500">
                      {createFormErrors.email}
                    </span>
                  )}
                </div>
                <div>
                  <Label htmlFor="phoneNumber">
                    Phone Number <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    name="phoneNumber"
                    value={createFormData.phoneNumber}
                    onChange={handleCreateFormChange}
                  />
                  {createFormErrors.phoneNumber && (
                    <span className="text-xs text-red-500">
                      {createFormErrors.phoneNumber}
                    </span>
                  )}
                </div>
                <div>
                  <Label htmlFor="nationality">
                    Nationality <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    name="nationality"
                    value={createFormData.nationality}
                    onChange={handleCreateFormChange}
                    placeholder="Enter nationality"
                  />
                  {createFormErrors.nationality && (
                    <span className="text-xs text-red-500">
                      {createFormErrors.nationality}
                    </span>
                  )}
                </div>
                <div>
                  <Label htmlFor="gender">
                    Gender <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={createFormData.gender}
                    onValueChange={(value) =>
                      handleCreateSelectChange("gender", value)
                    }
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
                  {createFormErrors.gender && (
                    <span className="text-xs text-red-500">
                      {createFormErrors.gender}
                    </span>
                  )}
                </div>
                <div>
                  <Label htmlFor="addressLine1">
                    Address Line 1 <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    name="addressLine1"
                    value={createFormData.addressLine1}
                    onChange={handleCreateFormChange}
                    placeholder="Enter address line 1"
                  />
                  {createFormErrors.addressLine1 && (
                    <span className="text-xs text-red-500">
                      {createFormErrors.addressLine1}
                    </span>
                  )}
                </div>
                <div>
                  <Label htmlFor="addressLine2">Address Line 2</Label>
                  <Input
                    name="addressLine2"
                    value={createFormData.addressLine2}
                    onChange={handleCreateFormChange}
                    placeholder="Enter address line 2 (optional)"
                  />
                  {createFormErrors.addressLine2 && (
                    <span className="text-xs text-red-500">
                      {createFormErrors.addressLine2}
                    </span>
                  )}
                </div>
                <div>
                  <Label htmlFor="addressCity">
                    City <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    name="addressCity"
                    value={createFormData.addressCity}
                    onChange={handleCreateFormChange}
                    placeholder="Enter city"
                  />
                  {createFormErrors.addressCity && (
                    <span className="text-xs text-red-500">
                      {createFormErrors.addressCity}
                    </span>
                  )}
                </div>
                <div>
                  <Label htmlFor="addressState">
                    State <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    name="addressState"
                    value={createFormData.addressState}
                    onChange={handleCreateFormChange}
                    placeholder="Enter state"
                  />
                  {createFormErrors.addressState && (
                    <span className="text-xs text-red-500">
                      {createFormErrors.addressState}
                    </span>
                  )}
                </div>
                <div>
                  <Label htmlFor="addressCountry">
                    Country <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    name="addressCountry"
                    value={createFormData.addressCountry}
                    onChange={handleCreateFormChange}
                    placeholder="Enter country"
                  />
                  {createFormErrors.addressCountry && (
                    <span className="text-xs text-red-500">
                      {createFormErrors.addressCountry}
                    </span>
                  )}
                </div>
                <div>
                  <Label htmlFor="addressZipcode">
                    Zipcode <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    name="addressZipcode"
                    value={createFormData.addressZipcode}
                    onChange={handleCreateFormChange}
                    placeholder="Enter zipcode"
                  />
                  {createFormErrors.addressZipcode && (
                    <span className="text-xs text-red-500">
                      {createFormErrors.addressZipcode}
                    </span>
                  )}
                </div>
                <div>
                  <Label htmlFor="emiratesId">Emirates ID</Label>
                  <Input
                    name="emiratesId"
                    value={createFormData.emiratesId}
                    onChange={handleCreateFormChange}
                    placeholder="Enter Emirates ID (optional)"
                  />
                  {createFormErrors.emiratesId && (
                    <span className="text-xs text-red-500">
                      {createFormErrors.emiratesId}
                    </span>
                  )}
                </div>
                <div>
                  <Label htmlFor="passportNumber">
                    Passport Number <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    name="passportNumber"
                    value={createFormData.passportNumber}
                    onChange={handleCreateFormChange}
                    placeholder="Enter passport number"
                  />
                  {createFormErrors.passportNumber && (
                    <span className="text-xs text-red-500">
                      {createFormErrors.passportNumber}
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
                      type={showCreatePassword ? "text" : "password"}
                      value={createFormData.password}
                      onChange={handleCreateFormChange}
                      placeholder="Enter password"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowCreatePassword(!showCreatePassword)}
                    >
                      {showCreatePassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  {createFormErrors.password && (
                    <span className="text-xs text-red-500">
                      {createFormErrors.password}
                    </span>
                  )}
                  {createFormData.password && (
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
                  onClick={() => setIsCreateModalOpen(false)}
                  disabled={isCreating}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isCreating}
                  className="font-semibold"
                >
                  {isCreating ? "Creating..." : "Create Customer"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Total Customers
                </p>
                <p className="text-2xl font-bold">{totalCustomers}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-green-100 rounded-lg">
                <UserCheck className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Active
                </p>
                <p className="text-2xl font-bold">{activeCustomers}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Pending Assignment
                </p>
                <p className="text-2xl font-bold">{pendingAssignment}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-purple-100 rounded-lg">
                <FileCheck className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Total Applications
                </p>
                <p className="text-2xl font-bold">{totalApplications}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Customer Directory */}
      <Card>
        <CardHeader>
          <CardTitle>Customer Directory</CardTitle>
          <CardDescription>Search and manage all customers</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Search and Filter Controls */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search customers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline">
                    {itemsPerPage} items per page
                    <ChevronDown className="ml-2 h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    onClick={() => handleItemsPerPageChange("5")}
                  >
                    5 items
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => handleItemsPerPageChange("10")}
                  >
                    10 items
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => handleItemsPerPageChange("20")}
                  >
                    20 items
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => handleItemsPerPageChange("50")}
                  >
                    50 items
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {error && (
            <div className="flex items-center justify-center py-8">
              <div className="text-center">
                <p className="text-red-600 mb-2">{error}</p>
              </div>
            </div>
          )}

          {!error && customers.length === 0 && (
            <div className="flex items-center justify-center py-8">
              <div className="text-center">
                <p className="text-muted-foreground">No customers found.</p>
              </div>
            </div>
          )}

          {!error && customers.length > 0 && filteredCustomers.length === 0 && (
            <div className="flex items-center justify-center py-8">
              <div className="text-center">
                <p className="text-muted-foreground">
                  No customers match your search criteria.
                </p>
              </div>
            </div>
          )}

          {!error && filteredCustomers.length > 0 && (
            <>
              <div className="overflow-x-auto border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[100px]">ID</TableHead>
                      <TableHead className="w-[180px]">Name</TableHead>
                      <TableHead className="w-[140px]">Contact</TableHead>
                      <TableHead className="w-[100px]">Nationality</TableHead>
                      <TableHead className="w-[80px]">Status</TableHead>
                      <TableHead className="w-[80px]">Apps</TableHead>
                      <TableHead className="w-[120px]">Agent</TableHead>
                      <TableHead className="w-[120px]">Last Activity</TableHead>
                      <TableHead className="w-[80px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedCustomers.map((customer) => (
                      <TableRow key={customer._id}>
                        <TableCell className="font-medium">
                          <span className="text-sm">{customer.customerId}</span>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-3">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                                {getCustomerInitials(customer)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="min-w-0 flex-1">
                              <div className="font-medium text-sm">
                                {getCustomerName(customer)}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">
                              {customer.phoneNumber || "N/A"}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm">
                            {customer.nationality || "N/A"}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              getCustomerStatus(customer) === "active"
                                ? "default"
                                : "secondary"
                            }
                            className={
                              getCustomerStatus(customer) === "active"
                                ? "bg-green-100 text-green-800 border-green-200"
                                : "bg-yellow-100 text-yellow-800 border-yellow-200"
                            }
                          >
                            {getCustomerStatus(customer)}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          <span className="text-sm font-medium">
                            {getCustomerApplicationsCount(customer._id)}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm">
                            {customer.assignedAgent
                              ? customer.assignedAgent.fullName
                              : "Admin"}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm">
                            {formatDate(customer.createdAt)}
                          </span>
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
                                  setSelectedCustomer(customer);
                                  setIsViewModalOpen(true);
                                }}
                              >
                                <Eye className="h-4 w-4 mr-2" />
                                View Profile
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() =>
                                  handleViewCustomerDetails(customer._id)
                                }
                              >
                                <FileText className="h-4 w-4 mr-2" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => {
                                  console.log(
                                    "Customer data for edit:",
                                    customer
                                  );
                                  console.log(
                                    "Customer address:",
                                    customer.address
                                  );
                                  console.log("Customer dob:", customer.dob);
                                  console.log(
                                    "Customer gender:",
                                    customer.gender
                                  );

                                  setSelectedCustomer(customer);
                                  setEditFormData({
                                    customerId: customer.customerId || "",
                                    assignedAgentId:
                                      customer.assignedAgentId || "",
                                    assignedAgentRole:
                                      customer.assignedAgentRole || "",
                                    firstName: customer.firstName || "",
                                    middleName: customer.middleName || "",
                                    lastName: customer.lastName || "",
                                    dob: customer.dob
                                      ? new Date(customer.dob)
                                          .toISOString()
                                          .split("T")[0]
                                      : "",
                                    gender: customer.gender || "",
                                    email: customer.email || "",
                                    phoneNumber: customer.phoneNumber || "",
                                    nationality: customer.nationality || "",
                                    emiratesIdNumber:
                                      customer.emiratesIdNumber || "",
                                    passportNumber:
                                      customer.passportNumber || "",
                                    password: "",
                                    address: {
                                      line1: customer.address?.line1 || "",
                                      line2: customer.address?.line2 || "",
                                      city: customer.address?.city || "",
                                      state: customer.address?.state || "",
                                      country: customer.address?.country || "",
                                      zipcode: customer.address?.zipcode || "",
                                    },
                                  });
                                  console.log("Edit form data set:", {
                                    customerId: customer.customerId || "",
                                    assignedAgentId:
                                      customer.assignedAgentId || "",
                                    assignedAgentRole:
                                      customer.assignedAgentRole || "",
                                    firstName: customer.firstName || "",
                                    middleName: customer.middleName || "",
                                    lastName: customer.lastName || "",
                                    dob: customer.dob
                                      ? new Date(customer.dob)
                                          .toISOString()
                                          .split("T")[0]
                                      : "",
                                    gender: customer.gender || "",
                                    email: customer.email || "",
                                    phoneNumber: customer.phoneNumber || "",
                                    nationality: customer.nationality || "",
                                    emiratesIdNumber:
                                      customer.emiratesIdNumber || "",
                                    passportNumber:
                                      customer.passportNumber || "",
                                    address: {
                                      line1: customer.address?.line1 || "",
                                      line2: customer.address?.line2 || "",
                                      city: customer.address?.city || "",
                                      state: customer.address?.state || "",
                                      country: customer.address?.country || "",
                                      zipcode: customer.address?.zipcode || "",
                                    },
                                  });
                                  setIsEditModalOpen(true);
                                }}
                              >
                                <Edit className="h-4 w-4 mr-2" />
                                Edit Details
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleToggleStatus(customer)}
                              >
                                {getCustomerStatus(customer) === "active" ? (
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
              </div>

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="flex flex-col sm:flex-row items-center justify-between px-2 py-4 gap-4 mt-4">
                  <div className="text-sm text-muted-foreground text-center sm:text-left">
                    Showing {startIndex + 1} to{" "}
                    {Math.min(endIndex, filteredCustomers.length)} of{" "}
                    {filteredCustomers.length} results
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <span className="text-sm">
                      Page {currentPage} of {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Edit Customer Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Customer Details</DialogTitle>
            <DialogDescription>
              Update customer information. All fields are editable.
            </DialogDescription>
          </DialogHeader>
          {selectedCustomer && (
            <div className="space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-customerId">Customer ID</Label>
                  <Input
                    id="edit-customerId"
                    value={editFormData.customerId || ""}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        customerId: e.target.value,
                      })
                    }
                    placeholder="e.g., CX-0001"
                  />
                </div>
                <div>
                  <Label htmlFor="edit-middleName">Middle Name</Label>
                  <Input
                    id="edit-middleName"
                    value={editFormData.middleName || ""}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        middleName: e.target.value,
                      })
                    }
                    placeholder="Middle Name (Optional)"
                  />
                </div>
                <div>
                  <Label htmlFor="edit-firstName">First Name *</Label>
                  <Input
                    id="edit-firstName"
                    value={editFormData.firstName}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        firstName: e.target.value,
                      })
                    }
                    placeholder="Enter first name"
                    className={editFormErrors.firstName ? "border-red-500" : ""}
                  />
                  {editFormErrors.firstName && (
                    <p className="text-xs text-red-500 mt-1">
                      {editFormErrors.firstName}
                    </p>
                  )}
                </div>
                <div>
                  <Label htmlFor="edit-lastName">Last Name *</Label>
                  <Input
                    id="edit-lastName"
                    value={editFormData.lastName}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        lastName: e.target.value,
                      })
                    }
                    placeholder="Enter last name"
                    className={editFormErrors.lastName ? "border-red-500" : ""}
                  />
                  {editFormErrors.lastName && (
                    <p className="text-xs text-red-500 mt-1">
                      {editFormErrors.lastName}
                    </p>
                  )}
                </div>
                <div>
                  <Label htmlFor="edit-dob">Date of Birth</Label>
                  <Input
                    id="edit-dob"
                    type="date"
                    value={editFormData.dob || ""}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        dob: e.target.value,
                      })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="edit-gender">Gender</Label>
                  <select
                    id="edit-gender"
                    value={editFormData.gender || ""}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        gender: e.target.value,
                      })
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-email">Email Address</Label>
                  <Input
                    id="edit-email"
                    type="email"
                    value={editFormData.email}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        email: e.target.value,
                      })
                    }
                    placeholder="Email Address"
                  />
                </div>
                <div>
                  <Label htmlFor="edit-phone">Phone Number *</Label>
                  <Input
                    id="edit-phone"
                    value={editFormData.phoneNumber}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        phoneNumber: e.target.value,
                      })
                    }
                    placeholder="+971-XX-XXX-XXXX"
                    className={
                      editFormErrors.phoneNumber ? "border-red-500" : ""
                    }
                  />
                  {editFormErrors.phoneNumber && (
                    <p className="text-xs text-red-500 mt-1">
                      {editFormErrors.phoneNumber}
                    </p>
                  )}
                </div>
                <div>
                  <Label htmlFor="edit-nationality">Nationality *</Label>
                  <Input
                    id="edit-nationality"
                    value={editFormData.nationality}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        nationality: e.target.value,
                      })
                    }
                    placeholder="Enter nationality"
                    className={
                      editFormErrors.nationality ? "border-red-500" : ""
                    }
                  />
                  {editFormErrors.nationality && (
                    <p className="text-xs text-red-500 mt-1">
                      {editFormErrors.nationality}
                    </p>
                  )}
                </div>
                <div>
                  <Label htmlFor="edit-emiratesId">Emirates ID</Label>
                  <Input
                    id="edit-emiratesId"
                    value={editFormData.emiratesIdNumber || ""}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        emiratesIdNumber: e.target.value,
                      })
                    }
                    placeholder="Emirates ID Number"
                  />
                </div>
                <div>
                  <Label htmlFor="edit-passport">Passport Number</Label>
                  <Input
                    id="edit-passport"
                    value={editFormData.passportNumber || ""}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        passportNumber: e.target.value,
                      })
                    }
                    placeholder="Passport Number"
                  />
                </div>
              </div>

              {/* Agent Assignment */}
              <div className="space-y-4 pt-4 border-t">
                <h4 className="font-semibold">Agent Assignment</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="edit-assignedAgentId">
                      Assigned Agent ID
                    </Label>
                    <Input
                      id="edit-assignedAgentId"
                      value={editFormData.assignedAgentId || ""}
                      onChange={(e) =>
                        setEditFormData({
                          ...editFormData,
                          assignedAgentId: e.target.value,
                        })
                      }
                      placeholder="Agent ID"
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-assignedAgentRole">Agent Role</Label>
                    <Input
                      id="edit-assignedAgentRole"
                      value={editFormData.assignedAgentRole || ""}
                      onChange={(e) =>
                        setEditFormData({
                          ...editFormData,
                          assignedAgentRole: e.target.value,
                        })
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
                    <Label htmlFor="edit-addressLine1">Address Line 1</Label>
                    <Input
                      id="edit-addressLine1"
                      value={editFormData.address?.line1 || ""}
                      onChange={(e) =>
                        setEditFormData({
                          ...editFormData,
                          address: {
                            ...editFormData.address,
                            line1: e.target.value,
                          },
                        })
                      }
                      placeholder="Address Line 1"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Label htmlFor="edit-addressLine2">Address Line 2</Label>
                    <Input
                      id="edit-addressLine2"
                      value={editFormData.address?.line2 || ""}
                      onChange={(e) =>
                        setEditFormData({
                          ...editFormData,
                          address: {
                            ...editFormData.address,
                            line2: e.target.value,
                          },
                        })
                      }
                      placeholder="Address Line 2 (Optional)"
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-city">City</Label>
                    <Input
                      id="edit-city"
                      value={editFormData.address?.city || ""}
                      onChange={(e) =>
                        setEditFormData({
                          ...editFormData,
                          address: {
                            ...editFormData.address,
                            city: e.target.value,
                          },
                        })
                      }
                      placeholder="City"
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-state">State</Label>
                    <Input
                      id="edit-state"
                      value={editFormData.address?.state || ""}
                      onChange={(e) =>
                        setEditFormData({
                          ...editFormData,
                          address: {
                            ...editFormData.address,
                            state: e.target.value,
                          },
                        })
                      }
                      placeholder="State"
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-country">Country</Label>
                    <Input
                      id="edit-country"
                      value={editFormData.address?.country || ""}
                      onChange={(e) =>
                        setEditFormData({
                          ...editFormData,
                          address: {
                            ...editFormData.address,
                            country: e.target.value,
                          },
                        })
                      }
                      placeholder="Country"
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-zipcode">Zip Code</Label>
                    <Input
                      id="edit-zipcode"
                      value={editFormData.address?.zipcode || ""}
                      onChange={(e) =>
                        setEditFormData({
                          ...editFormData,
                          address: {
                            ...editFormData.address,
                            zipcode: e.target.value,
                          },
                        })
                      }
                      placeholder="Zip Code"
                    />
                  </div>
                </div>
              </div>

              {/* Password Section */}
              <div className="space-y-4 pt-4 border-t">
                <h4 className="font-semibold">Password (Optional)</h4>
                <div>
                  <Label htmlFor="edit-password">New Password</Label>
                  <div className="relative">
                    <Input
                      id="edit-password"
                      type={showEditPassword ? "text" : "password"}
                      value={editFormData.password}
                      onChange={(e) =>
                        setEditFormData({
                          ...editFormData,
                          password: e.target.value,
                        })
                      }
                      placeholder="Leave blank to keep current password"
                      className={`pr-10 ${
                        editFormErrors.password ? "border-red-500" : ""
                      }`}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowEditPassword(!showEditPassword)}
                    >
                      {showEditPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  {editFormErrors.password && (
                    <p className="text-xs text-red-500 mt-1">
                      {editFormErrors.password}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground mt-1">
                    Leave blank to keep the current password
                  </p>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleEditCustomer}
              disabled={isUpdating}
              className="bg-primary hover:bg-primary/90"
            >
              {isUpdating ? "Updating..." : "Update Customer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Status Confirmation Modal */}
      <Dialog open={isStatusModalOpen} onOpenChange={setIsStatusModalOpen}>
        <DialogContent>
          {customerToToggle && (
            <>
              <DialogHeader>
                <DialogTitle>
                  {getCustomerStatus(customerToToggle) === "active"
                    ? "Deactivate Customer"
                    : "Activate Customer"}
                </DialogTitle>
                <DialogDescription>
                  {getCustomerStatus(customerToToggle) === "active"
                    ? `Are you sure you want to deactivate ${getCustomerName(
                        customerToToggle
                      )}? This will prevent them from accessing the system.`
                    : `Are you sure you want to activate ${getCustomerName(
                        customerToToggle
                      )}? This will restore their access to the system.`}
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsStatusModalOpen(false);
                    setCustomerToToggle(null);
                  }}
                >
                  Cancel
                </Button>
                <Button
                  onClick={confirmToggleStatus}
                  disabled={isUpdating}
                  variant={
                    getCustomerStatus(customerToToggle) === "active"
                      ? "destructive"
                      : "default"
                  }
                  className={
                    getCustomerStatus(customerToToggle) === "active"
                      ? "bg-red-600 hover:bg-red-700"
                      : ""
                  }
                >
                  {isUpdating
                    ? "Updating..."
                    : getCustomerStatus(customerToToggle) === "active"
                    ? "Deactivate"
                    : "Activate"}
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* View Customer Profile Modal */}
      <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Customer Information</DialogTitle>
            <DialogDescription>
              Complete customer profile and application details
            </DialogDescription>
          </DialogHeader>
          {selectedCustomer && (
            <div className="space-y-6">
              {/* Customer Info Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-primary">
                  Customer Info
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-muted-foreground">Customer ID</Label>
                    <p className="font-medium">{selectedCustomer.customerId}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Full Name</Label>
                    <p className="font-medium">
                      {getCustomerName(selectedCustomer)}
                    </p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">
                      Created Date
                    </Label>
                    <p className="font-medium">
                      {formatDate(selectedCustomer.createdAt)}
                    </p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">
                      Last Activity Date
                    </Label>
                    <p className="font-medium">
                      {formatDate(
                        selectedCustomer.updatedAt || selectedCustomer.createdAt
                      )}
                    </p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Email</Label>
                    <p className="font-medium">{selectedCustomer.email}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">
                      Phone Number
                    </Label>
                    <p className="font-medium">
                      {selectedCustomer.phoneNumber || "N/A"}
                    </p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Nationality</Label>
                    <p className="font-medium">
                      {selectedCustomer.nationality || "N/A"}
                    </p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Emirates ID</Label>
                    <p className="font-medium">
                      {selectedCustomer.emiratesIdNumber || "N/A"}
                    </p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">
                      Passport Number
                    </Label>
                    <p className="font-medium">
                      {selectedCustomer.passportNumber || "N/A"}
                    </p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Status</Label>
                    <Badge
                      variant={
                        getCustomerStatus(selectedCustomer) === "active"
                          ? "default"
                          : "secondary"
                      }
                      className={
                        getCustomerStatus(selectedCustomer) === "active"
                          ? "bg-green-100 text-green-800"
                          : "bg-yellow-100 text-yellow-800"
                      }
                    >
                      {getCustomerStatus(selectedCustomer)}
                    </Badge>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">
                      Assigned Agent
                    </Label>
                    <p className="font-medium">
                      {selectedCustomer.assignedAgent
                        ? selectedCustomer.assignedAgent.fullName
                        : "Admin"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Address Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-primary">Address</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-muted-foreground">
                      Address Line 1
                    </Label>
                    <p className="font-medium">
                      {selectedCustomer.address?.line1 || "N/A"}
                    </p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">
                      Address Line 2
                    </Label>
                    <p className="font-medium">
                      {selectedCustomer.address?.line2 || "N/A"}
                    </p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">City</Label>
                    <p className="font-medium">
                      {selectedCustomer.address?.city || "N/A"}
                    </p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">State</Label>
                    <p className="font-medium">
                      {selectedCustomer.address?.state || "N/A"}
                    </p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Country</Label>
                    <p className="font-medium">
                      {selectedCustomer.address?.country || "N/A"}
                    </p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Zipcode</Label>
                    <p className="font-medium">
                      {selectedCustomer.address?.zipcode || "N/A"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Applications Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-primary">
                  Applications
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-muted-foreground">
                        Total Applications
                      </Label>
                      <p className="font-medium text-lg">
                        {getCustomerApplicationsCount(selectedCustomer._id)}
                      </p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">
                        Application Status
                      </Label>
                      <div className="flex gap-2 mt-1">
                        {(() => {
                          const customerApps = applications.filter((app) => {
                            if (typeof app.customer === "string") {
                              return app.customer === selectedCustomer._id;
                            }
                            if (
                              typeof app.customer === "object" &&
                              app.customer !== null
                            ) {
                              return (
                                (app.customer as any)._id ===
                                selectedCustomer._id
                              );
                            }
                            return false;
                          });

                          const statusCounts = customerApps.reduce(
                            (acc, app) => {
                              acc[app.status] = (acc[app.status] || 0) + 1;
                              return acc;
                            },
                            {} as { [key: string]: number }
                          );

                          return Object.entries(statusCounts).map(
                            ([status, count]) => (
                              <Badge
                                key={status}
                                variant="outline"
                                className="text-xs"
                              >
                                {status}: {count}
                              </Badge>
                            )
                          );
                        })()}
                      </div>
                    </div>
                  </div>

                  {/* Application List */}
                  <div className="space-y-2">
                    <Label className="text-muted-foreground">
                      Application Details
                    </Label>
                    {(() => {
                      const customerApps = applications.filter((app) => {
                        if (typeof app.customer === "string") {
                          return app.customer === selectedCustomer._id;
                        }
                        if (
                          typeof app.customer === "object" &&
                          app.customer !== null
                        ) {
                          return (
                            (app.customer as any)._id === selectedCustomer._id
                          );
                        }
                        return false;
                      });

                      if (customerApps.length === 0) {
                        return (
                          <p className="text-sm text-muted-foreground">
                            No applications found
                          </p>
                        );
                      }

                      return customerApps.map((app, index) => (
                        <div
                          key={app._id}
                          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                        >
                          <div>
                            <p className="font-medium text-sm">
                              Application {index + 1}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Created: {formatDate(app.createdAt)}
                            </p>
                          </div>
                          <Badge
                            variant="outline"
                            className={
                              app.status === "New" ||
                              app.status === "Ready for Processing"
                                ? "bg-blue-100 text-blue-800 border-blue-200"
                                : app.status === "In Progress" ||
                                  app.status === "Waiting for Agent Review"
                                ? "bg-yellow-100 text-yellow-800 border-yellow-200"
                                : app.status === "Completed" ||
                                  app.status === "Approved"
                                ? "bg-green-100 text-green-800 border-green-200"
                                : app.status === "Rejected" ||
                                  app.status === "Declined"
                                ? "bg-red-100 text-red-800 border-red-200"
                                : app.status === "Awaiting Client Response"
                                ? "bg-orange-100 text-orange-800 border-orange-200"
                                : "bg-gray-100 text-gray-800 border-gray-200"
                            }
                          >
                            {app.status}
                          </Badge>
                        </div>
                      ));
                    })()}
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

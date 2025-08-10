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
  User,
  MapPin,
  Activity,
  Upload,
  Download,
  CheckCircle2,
  X,
  Loader2,
  MessageSquare,
  Shield,
  Building,
} from "lucide-react";
import { useSelector } from "react-redux";
import { RootState } from "@/app/store";
import { useToast } from "@/hooks/use-toast";
import { PageLoader } from "@/components/ui/page-loader";
import axios from "axios";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";

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
  applicationNumber: string;
  status: string;
  paymentStatus: string;
  customer:
    | string
    | {
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
  createdAt: string;
}

export const ManagerCustomersPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Filter states
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [nationalityFilter, setNationalityFilter] = useState<string>("all");
  const [agentFilter, setAgentFilter] = useState<string>("all");

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
  const [customerDetails, setCustomerDetails] = useState<Customer | null>(null);
  const [customerApplications, setCustomerApplications] = useState<
    Application[]
  >([]);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [agents, setAgents] = useState<
    Array<{ _id: string; fullName: string; email: string; status: string }>
  >([]);
  const [isLoadingAgents, setIsLoadingAgents] = useState(false);

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
    assignedAgentId: "",
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

  // Fetch all agents
  const fetchAgents = async () => {
    if (!token) return;
    setIsLoadingAgents(true);
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/api/user/agents`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setAgents(response.data.data || []);
    } catch (err: any) {
      console.error("Error fetching agents:", err);
      toast({
        title: "Error",
        description: "Failed to load agents",
        variant: "destructive",
      });
    } finally {
      setIsLoadingAgents(false);
    }
  };

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
    fetchAgents();
  }, [token]);

  // Get customer status
  const getCustomerStatus = (customer: Customer) => {
    if (customer.status) return customer.status;
    return customer.assignedAgentId ? "active" : "pending";
  };

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

  // Calculate summary statistics
  const totalCustomers = customers.length;
  const activeCustomers = customers.filter(
    (customer) => getCustomerStatus(customer) === "active"
  ).length;
  const pendingAssignment = customers.filter(
    (customer) => !customer.assignedAgentId || customer.assignedAgentId === null
  ).length;
  const totalApplications = applications.length;

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
      "assignedAgentId",
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
        assignedAgentId: createFormData.assignedAgentId,
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
        assignedAgentId: "",
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

  // Filter customers based on search and filters, include both active and inactive users
  const filteredCustomers = customers.filter((customer) => {
    // Apply status filter
    if (statusFilter !== "all") {
      const customerStatus = getCustomerStatus(customer);
      if (statusFilter !== customerStatus) return false;
    }

    // Apply nationality filter
    if (nationalityFilter !== "all") {
      if (!customer.nationality || customer.nationality !== nationalityFilter)
        return false;
    }

    // Apply agent filter
    if (agentFilter !== "all") {
      if (agentFilter === "unassigned") {
        if (customer.assignedAgentId) return false;
      } else {
        if (customer.assignedAgentId !== agentFilter) return false;
      }
    }

    // Apply search filter
    return (
      getCustomerName(customer)
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.customerId.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  // Sort customers by creation date (newest first)
  const sortedCustomers = filteredCustomers.sort((a, b) => {
    const dateA = new Date(a.createdAt).getTime();
    const dateB = new Date(b.createdAt).getTime();
    return dateB - dateA; // Descending order (newest first)
  });

  // Pagination logic
  const totalPages = Math.ceil(sortedCustomers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedCustomers = sortedCustomers.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (value: string) => {
    setItemsPerPage(Number(value));
    setCurrentPage(1);
  };

  const handleViewCustomerDetails = async (customerId: string) => {
    if (!token) return;

    setIsLoadingDetails(true);
    try {
      console.log("Fetching customer details for ID:", customerId);

      // Fetch customer details
      const customerResponse = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/api/user/customer/${customerId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      console.log("Customer response:", customerResponse.data);
      if (!customerResponse.data.data) {
        throw new Error("Customer not found");
      }

      let customerData = customerResponse.data.data;

      // Fetch agent details if customer has assignedAgentId
      if (customerData.assignedAgentId) {
        const agentDetails = await fetchAgentDetails(
          customerData.assignedAgentId
        );
        customerData = {
          ...customerData,
          assignedAgent: agentDetails,
        };
      }

      setCustomerDetails(customerData);

      // Fetch customer applications using specific customer API endpoint
      try {
        console.log("Fetching applications for customer ID:", customerId);
        const applicationsResponse = await axios.get(
          `${import.meta.env.VITE_BASE_URL}/api/application/app/${customerId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        console.log(
          "Customer applications response:",
          applicationsResponse.data
        );

        // Handle different response structures
        let applicationsData = [];
        if (
          applicationsResponse.data.success &&
          applicationsResponse.data.data
        ) {
          // If data is a single application object, wrap it in an array
          if (applicationsResponse.data.data._id) {
            applicationsData = [applicationsResponse.data.data];
          } else if (Array.isArray(applicationsResponse.data.data)) {
            applicationsData = applicationsResponse.data.data;
          }
        } else if (Array.isArray(applicationsResponse.data)) {
          applicationsData = applicationsResponse.data;
        }

        console.log(
          "Applications found for customer:",
          applicationsData.length
        );
        console.log("Customer applications data:", applicationsData);
        setCustomerApplications(applicationsData);
      } catch (applicationError) {
        console.log(
          "No applications found for customer:",
          applicationError.response?.status
        );
        // If no applications found (404), set empty array
        if (applicationError.response?.status === 404) {
          setCustomerApplications([]);
        } else {
          console.error("Error fetching applications:", applicationError);
          setCustomerApplications([]);
        }
      }

      setIsViewModalOpen(true);
    } catch (error) {
      console.error("Error fetching customer details:", error);
      console.error("Error response:", error.response?.data);
      toast({
        title: "Error",
        description:
          error.response?.data?.message || "Failed to load customer details",
        variant: "destructive",
      });
    } finally {
      setIsLoadingDetails(false);
    }
  };

  const handleBackToCustomers = () => {
    setSelectedCustomerId(null);
  };

  // Reset to first page when search term or filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, nationalityFilter, agentFilter]);

  // Get unique nationalities for filter
  const getUniqueNationalities = () => {
    const nationalities = customers
      .filter((customer) => customer.nationality)
      .map((customer) => customer.nationality)
      .filter(
        (nationality, index, array) => array.indexOf(nationality) === index
      )
      .sort();
    return nationalities;
  };

  // Reset filters function
  const resetFilters = () => {
    setStatusFilter("all");
    setNationalityFilter("all");
    setAgentFilter("all");
    setSearchTerm("");
  };

  // Check if any filters are active
  const hasActiveFilters = () => {
    return (
      statusFilter !== "all" ||
      nationalityFilter !== "all" ||
      agentFilter !== "all"
    );
  };

  if (loading) {
    return <PageLoader message="Loading customers..." size="lg" />;
  }

  // Remove the separate page navigation logic since we'll use popup modals

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-primary">All Customers</h1>
          <p className="text-muted-foreground">View and manage All customers</p>
        </div>
        <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary/90">
              <Plus className="h-4 w-4 mr-2" />
              Create New Customer
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Customer</DialogTitle>
              <p className="text-sm text-muted-foreground">
                Fields marked with <span className="text-red-500">*</span> are
                mandatory
              </p>
            </DialogHeader>
            <form
              onSubmit={handleCreateCustomer}
              className="space-y-3 max-h-[70vh] overflow-y-auto"
            >
              <div className="grid grid-cols-3 gap-4">
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
              </div>
              <div className="grid grid-cols-2 gap-4">
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
                  <Label htmlFor="assignedAgentId">
                    Assign Agent <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={createFormData.assignedAgentId}
                    onValueChange={(value) =>
                      handleCreateSelectChange("assignedAgentId", value)
                    }
                    disabled={isLoadingAgents}
                  >
                    <SelectTrigger>
                      <SelectValue
                        placeholder={
                          isLoadingAgents
                            ? "Loading agents..."
                            : "Select an agent"
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {(() => {
                        console.log("All agents:", agents);
                        const activeAgents = agents.filter((agent) => {
                          // Handle different cases and default to active if no status
                          const status =
                            agent.status?.toLowerCase() || "active";
                          return status === "active";
                        });
                        console.log("Active agents:", activeAgents);
                        return activeAgents.map((agent) => (
                          <SelectItem key={agent._id} value={agent._id}>
                            {agent.fullName} ({agent.email})
                          </SelectItem>
                        ));
                      })()}
                    </SelectContent>
                  </Select>
                  {createFormErrors.assignedAgentId && (
                    <span className="text-xs text-red-500">
                      {createFormErrors.assignedAgentId}
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
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant={hasActiveFilters() ? "default" : "outline"}
                    size="sm"
                    className={
                      hasActiveFilters()
                        ? "bg-primary text-primary-foreground"
                        : ""
                    }
                  >
                    <Filter className="h-4 w-4 mr-2" />
                    Filter{" "}
                    {hasActiveFilters() &&
                      `(${
                        [
                          statusFilter !== "all",
                          nationalityFilter !== "all",
                          agentFilter !== "all",
                        ].filter(Boolean).length
                      })`}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="p-3 space-y-3">
                    <div>
                      <label className="text-xs font-medium text-muted-foreground">
                        Status
                      </label>
                      <Select
                        value={statusFilter}
                        onValueChange={setStatusFilter}
                      >
                        <SelectTrigger className="h-8 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Status</SelectItem>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="pending">Pending</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-muted-foreground">
                        Nationality
                      </label>
                      <Select
                        value={nationalityFilter}
                        onValueChange={setNationalityFilter}
                      >
                        <SelectTrigger className="h-8 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Nationalities</SelectItem>
                          {getUniqueNationalities().map((nationality) => (
                            <SelectItem key={nationality} value={nationality!}>
                              {nationality}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-muted-foreground">
                        Agent Assignment
                      </label>
                      <Select
                        value={agentFilter}
                        onValueChange={setAgentFilter}
                      >
                        <SelectTrigger className="h-8 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Assignments</SelectItem>
                          <SelectItem value="unassigned">Unassigned</SelectItem>
                          {agents
                            .filter((agent) => {
                              // Handle different cases and default to active if no status
                              const status =
                                agent.status?.toLowerCase() || "active";
                              return status === "active";
                            })
                            .map((agent) => (
                              <SelectItem key={agent._id} value={agent._id}>
                                {agent.fullName}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={resetFilters}
                      className="w-full text-xs"
                    >
                      Clear Filters
                    </Button>
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>
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

          {!error && customers.length > 0 && sortedCustomers.length === 0 && (
            <div className="flex items-center justify-center py-8">
              <div className="text-center">
                <p className="text-muted-foreground">
                  No customers match your search criteria.
                </p>
              </div>
            </div>
          )}

          {!error && sortedCustomers.length > 0 && (
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
                                  handleViewCustomerDetails(customer._id);
                                }}
                              >
                                <Eye className="h-4 w-4 mr-2" />
                                View Profile
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
                    {Math.min(endIndex, sortedCustomers.length)} of{" "}
                    {sortedCustomers.length} results
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
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Customer Details</DialogTitle>
            <DialogDescription>
              Update customer information. Customer ID, Email, and Agent
              Assignment are read-only.
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
                    disabled
                    className="bg-gray-100 cursor-not-allowed"
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
                    disabled
                    className="bg-gray-100 cursor-not-allowed"
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
                    <Label>Assigned Agent Name</Label>
                    <Input
                      value={
                        selectedCustomer?.assignedAgent?.fullName ||
                        "Not assigned"
                      }
                      disabled
                      className="bg-gray-100 cursor-not-allowed"
                    />
                  </div>
                  <div>
                    <Label>Agent Email</Label>
                    <Input
                      value={
                        selectedCustomer?.assignedAgent?.email ||
                        "Not available"
                      }
                      disabled
                      className="bg-gray-100 cursor-not-allowed"
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
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Customer Profile</DialogTitle>
            <DialogDescription>
              Complete customer profile and application details
            </DialogDescription>
          </DialogHeader>

          {isLoadingDetails ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                <p className="mt-2 text-muted-foreground">
                  Loading customer details...
                </p>
              </div>
            </div>
          ) : customerDetails ? (
            <Tabs defaultValue="customer-info" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="customer-info">Customer Info</TabsTrigger>
                <TabsTrigger value="applications">Applications</TabsTrigger>
              </TabsList>

              {/* Customer Info Tab */}
              <TabsContent value="customer-info" className="mt-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Left Column - Basic Info */}
                  <Card>
                    <CardHeader>
                      <div className="flex items-center gap-4">
                        <Avatar className="h-16 w-16">
                          <AvatarFallback className="text-lg">
                            {getCustomerInitials(customerDetails)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <CardTitle className="text-2xl font-bold">
                            {customerDetails.firstName}{" "}
                            {customerDetails.middleName}{" "}
                            {customerDetails.lastName}
                          </CardTitle>
                          <CardDescription className="text-base">
                            Customer ID: {customerDetails.customerId}
                          </CardDescription>
                        </div>
                        <Badge
                          variant={
                            getCustomerStatus(customerDetails) === "active"
                              ? "default"
                              : "secondary"
                          }
                          className={
                            getCustomerStatus(customerDetails) === "active"
                              ? "bg-green-100 text-green-800 border-green-200"
                              : "bg-yellow-100 text-yellow-800 border-yellow-200"
                          }
                        >
                          {getCustomerStatus(customerDetails)}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* Contact Information */}
                      <div className="space-y-4">
                        <div className="flex items-center gap-3">
                          <Mail className="h-5 w-5 text-muted-foreground" />
                          <div>
                            <p className="text-base font-medium">
                              {customerDetails.email}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Email Address
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <Phone className="h-5 w-5 text-muted-foreground" />
                          <div>
                            <p className="text-base font-medium">
                              {customerDetails.phoneNumber || "Not provided"}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Phone Number
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <User className="h-5 w-5 text-muted-foreground" />
                          <div>
                            <p className="text-base font-medium">
                              {customerDetails.nationality || "Not specified"}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Nationality
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <Shield className="h-5 w-5 text-muted-foreground" />
                          <div>
                            <p className="text-base font-medium">
                              {customerDetails.assignedAgent?.fullName ||
                                "Not assigned"}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Assigned Agent
                            </p>
                            {customerDetails.assignedAgent?.email && (
                              <p className="text-xs text-muted-foreground">
                                {customerDetails.assignedAgent.email}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Identity Documents */}
                      <div className="space-y-4 pt-4 border-t">
                        <div className="flex items-center gap-3">
                          <FileText className="h-5 w-5 text-muted-foreground" />
                          <div>
                            <p className="text-base font-medium">
                              {customerDetails.emiratesIdNumber ||
                                "Not provided"}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Emirates ID
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <FileText className="h-5 w-5 text-muted-foreground" />
                          <div>
                            <p className="text-base font-medium">
                              {customerDetails.passportNumber || "Not provided"}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Passport Number
                            </p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Right Column - Additional Info */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">
                        Additional Information
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* Address */}
                      {customerDetails.address && (
                        <div className="space-y-3">
                          <div className="flex items-start gap-3">
                            <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                            <div className="space-y-1">
                              <p className="text-base font-medium">
                                {customerDetails.address.line1}
                              </p>
                              {customerDetails.address.line2 && (
                                <p className="text-base">
                                  {customerDetails.address.line2}
                                </p>
                              )}
                              <p className="text-base">
                                {customerDetails.address.city},{" "}
                                {customerDetails.address.state}{" "}
                                {customerDetails.address.zipcode}
                              </p>
                              <p className="text-base">
                                {customerDetails.address.country}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                Address
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Dates */}
                      <div className="space-y-3 pt-4 border-t">
                        <div className="flex items-center gap-3">
                          <Calendar className="h-5 w-5 text-muted-foreground" />
                          <div>
                            <p className="text-base font-medium">
                              {formatDate(customerDetails.createdAt)}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Created Date
                            </p>
                          </div>
                        </div>

                        {customerDetails.updatedAt && (
                          <div className="flex items-center gap-3">
                            <Activity className="h-5 w-5 text-muted-foreground" />
                            <div>
                              <p className="text-base font-medium">
                                {formatDate(customerDetails.updatedAt)}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                Last Activity
                              </p>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Application Statistics */}
                      <div className="space-y-3 pt-4 border-t">
                        <div className="flex items-center gap-3">
                          <FileText className="h-5 w-5 text-muted-foreground" />
                          <div>
                            <p className="text-base font-medium">
                              {Array.isArray(customerApplications)
                                ? customerApplications.length
                                : 0}{" "}
                              Application(s)
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Total Applications
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Activity className="h-5 w-5 text-muted-foreground" />
                          <div>
                            <p className="text-base font-medium">
                              {Array.isArray(customerApplications)
                                ? customerApplications.filter(
                                    (app) => app.status === "active"
                                  ).length
                                : 0}{" "}
                              Active
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Active Applications
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Additional Customer Details */}
                      <div className="space-y-3 pt-4 border-t">
                        <div className="flex items-center gap-3">
                          <User className="h-5 w-5 text-muted-foreground" />
                          <div>
                            <p className="text-base font-medium">
                              {customerDetails.gender || "Not specified"}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Gender
                            </p>
                          </div>
                        </div>
                        {customerDetails.dob && (
                          <div className="flex items-center gap-3">
                            <Calendar className="h-5 w-5 text-muted-foreground" />
                            <div>
                              <p className="text-base font-medium">
                                {formatDate(customerDetails.dob)}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                Date of Birth
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* Applications Tab */}
              <TabsContent value="applications" className="mt-6">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>
                          Applications (
                          {Array.isArray(customerApplications)
                            ? customerApplications.length
                            : 0}
                          )
                        </CardTitle>
                        <CardDescription>
                          All applications for this customer
                        </CardDescription>
                      </div>
                      <Badge variant="secondary">
                        {Array.isArray(customerApplications)
                          ? customerApplications.filter(
                              (app) => app.status === "active"
                            ).length
                          : 0}{" "}
                        Active
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {Array.isArray(customerApplications) &&
                    customerApplications.length > 0 ? (
                      <div className="space-y-4">
                        {customerApplications.map((application, index) => (
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
          ) : (
            <div className="text-center py-8">
              <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Customer Not Found
              </h3>
              <p className="text-muted-foreground">
                The customer you're looking for doesn't exist.
              </p>
            </div>
          )}
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
    <Card className="w-full">
      <CardHeader
        className="pb-3 cursor-pointer hover:bg-gray-50/50 transition-colors rounded-t-lg"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-semibold shadow-sm">
              {index + 1}
            </div>
            <div className="space-y-1">
              <CardTitle className="text-lg">
                Application #
                {application.applicationNumber || `APP-${index + 1}`}
              </CardTitle>
              <CardDescription className="text-sm">
                {application.businessSetup?.companyType ||
                  "Business Application"}{" "}
                • Created {formatDate(application.submissionDate)}
              </CardDescription>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {getStatusBadge(application.status)}
            <Badge variant="outline" className="text-xs">
              {application.paymentStatus}
            </Badge>
            <ChevronDown
              className={`h-5 w-5 text-muted-foreground transition-transform duration-200 ${
                isExpanded ? "rotate-180" : ""
              }`}
            />
          </div>
        </div>
      </CardHeader>

      {isExpanded && (
        <CardContent className="pt-0">
          <div className="space-y-6">
            {/* Application Overview */}
            <div className="bg-white rounded-lg border p-4">
              <h4 className="font-semibold text-base mb-4 flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Application Details
              </h4>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between py-2 border-b border-gray-100">
                    <span className="text-sm text-muted-foreground">
                      Application ID
                    </span>
                    <span className="font-medium text-sm">
                      {(application as any).applicationId || application._id}
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-gray-100">
                    <span className="text-sm text-muted-foreground">
                      Status
                    </span>
                    <div>{getStatusBadge(application.status)}</div>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-gray-100">
                    <span className="text-sm text-muted-foreground">
                      Application Type
                    </span>
                    <span className="font-medium text-sm">
                      {(application as any).applicationType || "N/A"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-gray-100">
                    <span className="text-sm text-muted-foreground">
                      Emirate
                    </span>
                    <span className="font-medium text-sm">
                      {(application as any).emirate || "N/A"}
                    </span>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between py-2 border-b border-gray-100">
                    <span className="text-sm text-muted-foreground">
                      Legal Form
                    </span>
                    <span className="font-medium text-sm">
                      {(application as any).legalForm || "N/A"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-gray-100">
                    <span className="text-sm text-muted-foreground">
                      Total Agreed Cost
                    </span>
                    <span className="font-medium text-sm">
                      {(application as any).totalAgreedCost
                        ? `AED ${(
                            application as any
                          ).totalAgreedCost.toLocaleString()}`
                        : "N/A"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-gray-100">
                    <span className="text-sm text-muted-foreground">
                      Assigned Agent
                    </span>
                    <span className="font-medium text-sm">
                      {application.assignedAgent?.fullName || "Unassigned"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-gray-100">
                    <span className="text-sm text-muted-foreground">
                      Created Date
                    </span>
                    <span className="font-medium text-sm">
                      {formatDate((application as any).createdAt)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Company Details */}
            <div className="bg-white rounded-lg border p-4">
              <h4 className="font-semibold text-base mb-4 flex items-center gap-2">
                <Building className="h-4 w-4" />
                Company Details
              </h4>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between py-2 border-b border-gray-100">
                    <span className="text-sm text-muted-foreground">
                      Company Names (EN)
                    </span>
                    <span className="font-medium text-sm">
                      {(application as any).proposedCompanyNamesEN?.length > 0
                        ? (application as any).proposedCompanyNamesEN.join(", ")
                        : "N/A"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-gray-100">
                    <span className="text-sm text-muted-foreground">
                      Company Name (AR)
                    </span>
                    <span className="font-medium text-sm">
                      {(application as any).proposedCompanyNameAR || "N/A"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-gray-100">
                    <span className="text-sm text-muted-foreground">
                      Office Required
                    </span>
                    <span className="font-medium text-sm">
                      {(application as any).officeRequired ? "Yes" : "No"}
                    </span>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between py-2 border-b border-gray-100">
                    <span className="text-sm text-muted-foreground">
                      Office Type
                    </span>
                    <span className="font-medium text-sm">
                      {(application as any).officeType || "N/A"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-gray-100">
                    <span className="text-sm text-muted-foreground">
                      Business Activities
                    </span>
                    <span className="font-medium text-sm">
                      {(application as any).businessActivities?.length > 0
                        ? (application as any).businessActivities.join(", ")
                        : "Not specified"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-gray-100">
                    <span className="text-sm text-muted-foreground">
                      Locked Status
                    </span>
                    <span className="font-medium text-sm">
                      {(application as any).isLocked ? "Locked" : "Unlocked"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Shareholder Details */}
            <div className="bg-white rounded-lg border p-4">
              <h4 className="font-semibold text-base mb-4 flex items-center gap-2">
                <User className="h-4 w-4" />
                Shareholder Details
              </h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between py-2 border-b border-gray-100">
                  <span className="text-sm text-muted-foreground">
                    Nature of Control
                  </span>
                  <span className="font-medium text-sm">
                    {(application as any).shareholderDetails?.natureOfControl
                      ?.length > 0
                      ? (
                          application as any
                        ).shareholderDetails.natureOfControl.join(", ")
                      : "Not specified"}
                  </span>
                </div>
              </div>
            </div>

            {/* Payment Information */}
            <div className="bg-white rounded-lg border p-4">
              <h4 className="font-semibold text-base mb-4 flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Payment Information
              </h4>
              {(application as any).paymentEntries &&
              (application as any).paymentEntries.length > 0 ? (
                <div className="space-y-4">
                  {(application as any).paymentEntries.map((payment, idx) => (
                    <div
                      key={payment._id || idx}
                      className="border rounded-lg p-4 bg-gray-50"
                    >
                      <h5 className="font-medium text-sm mb-3">
                        Payment {idx + 1}
                      </h5>
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        <div className="space-y-3">
                          <div className="flex items-center justify-between py-2 border-b border-gray-200">
                            <span className="text-sm text-muted-foreground">
                              Payment Method
                            </span>
                            <span className="font-medium text-sm">
                              {payment.paymentMethod}
                            </span>
                          </div>
                          <div className="flex items-center justify-between py-2 border-b border-gray-200">
                            <span className="text-sm text-muted-foreground">
                              Amount Paid
                            </span>
                            <span className="font-medium text-sm">
                              AED {payment.amountPaid?.toLocaleString()}
                            </span>
                          </div>
                          <div className="flex items-center justify-between py-2 border-b border-gray-200">
                            <span className="text-sm text-muted-foreground">
                              Payment Status
                            </span>
                            <Badge
                              variant={
                                payment.paymentStatus === "Failed"
                                  ? "destructive"
                                  : payment.paymentStatus === "Completed"
                                  ? "default"
                                  : "secondary"
                              }
                              className="text-xs"
                            >
                              {payment.paymentStatus}
                            </Badge>
                          </div>
                        </div>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between py-2 border-b border-gray-200">
                            <span className="text-sm text-muted-foreground">
                              Payment Date
                            </span>
                            <span className="font-medium text-sm">
                              {formatDate(payment.paymentDate)}
                            </span>
                          </div>
                          <div className="flex items-center justify-between py-2 border-b border-gray-200">
                            <span className="text-sm text-muted-foreground">
                              Transaction Ref
                            </span>
                            <span className="font-medium text-sm">
                              {payment.transactionRefNo}
                            </span>
                          </div>
                          {payment.additionalNotes && (
                            <div className="pt-2">
                              <span className="text-sm text-muted-foreground">
                                Notes:
                              </span>
                              <p className="text-sm font-medium mt-1">
                                {payment.additionalNotes}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4">
                  <Shield className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">
                    No payment information available
                  </p>
                </div>
              )}
            </div>

            {/* Application Steps */}
            {application.steps && application.steps.length > 0 && (
              <div className="space-y-4">
                <h4 className="font-semibold text-sm">5. Application Steps</h4>
                <div className="space-y-3">
                  {application.steps.map((step, stepIndex) => (
                    <div
                      key={stepIndex}
                      className="flex items-center justify-between p-3 border rounded-lg bg-white"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium">
                          {stepIndex + 1}
                        </div>
                        <div>
                          <p className="font-medium text-sm">{step.stepName}</p>
                          <p className="text-xs text-muted-foreground">
                            {step.description || "N/A"}
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
              <h4 className="font-semibold text-sm">7. Notes & Comments</h4>

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
                              Added by {note.addedBy || "N/A"} on{" "}
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
        </CardContent>
      )}
    </Card>
  );
};

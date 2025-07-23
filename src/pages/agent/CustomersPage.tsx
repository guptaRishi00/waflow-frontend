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
  Search,
  MessageSquare,
  FileText,
  Phone,
  Mail,
  MapPin,
  Plus,
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

export const CustomersPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(
    null
  );

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

  // Handle form field changes
  const handleFormChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
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
        assignedAgentId: user?.userId,
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
    return applications.filter((app) => app.customer === customerId);
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

  const filteredCustomers = customers.filter(
    (customer) =>
      getCustomerName(customer)
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
                <Input
                  name="gender"
                  value={form.gender}
                  onChange={handleFormChange}
                />
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
                <Input
                  name="jurisdiction"
                  value={form.jurisdiction}
                  onChange={handleFormChange}
                />
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
                <Input
                  name="password"
                  type="password"
                  value={form.password}
                  onChange={handleFormChange}
                />
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
                    onClick={() => setSelectedCustomer(customer)}
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
                    <div className="flex items-center space-x-2">
                      <Button size="sm" variant="outline" asChild>
                        <Link
                          to={`/agent/chat?customer=${selectedCustomer._id}`}
                        >
                          <MessageSquare className="h-4 w-4 mr-1" />
                          Chat
                        </Link>
                      </Button>
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
            </>
          )}
        </div>
      </div>
    </div>
  );
};

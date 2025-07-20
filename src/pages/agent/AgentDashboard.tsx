import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Users,
  FileText,
  Clock,
  CheckCircle,
  MessageSquare,
  DollarSign,
  CheckCircle2,
  XCircle,
  Eye,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { RootState } from "@/app/store";
import axios from "axios";
import { useToast } from "@/hooks/use-toast";
import type { Application } from "@/types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import VisaApplicationsList from "./VisaApplicationsList";

export const AgentDashboard: React.FC = () => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const { token, user } = useSelector((state: RootState) => state.customerAuth);
  const { toast } = useToast();
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const [visaApplications, setVisaApplications] = useState<any[]>([]);
  const [visaLoading, setVisaLoading] = useState(false);

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

  // Update application status (Approve/Reject)
  const handleAppStatusUpdate = async (
    appId: string,
    stepName: string,
    status: string
  ) => {
    setActionLoading(appId + status);
    try {
      const response = await axios.patch(
        `${import.meta.env.VITE_BASE_URL}/api/application/step/${appId}`,
        { stepName, status },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast({
        title: `Application ${status}`,
        description: `Application step "${stepName}" marked as ${status}.`,
      });
      fetchApplications();
    } catch (err) {
      toast({
        title: "Error",
        description: `Failed to update application status.`,
        variant: "destructive",
      });
    } finally {
      setActionLoading(null);
    }
  };

  const handleVisaStatusUpdate = async (id: string, status: string) => {
    try {
      await axios.patch(
        `${import.meta.env.VITE_BASE_URL}/api/application/visa/${id}/approve`,
        { status },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast({
        title: `Visa ${status}`,
        description: `Visa application marked as ${status}.`,
      });
      setVisaApplications((prev) =>
        prev.map((v) => (v._id === id ? { ...v, status } : v))
      );
    } catch (err: any) {
      toast({
        title: "Error",
        description:
          err?.response?.data?.message || "Failed to update visa status.",
        variant: "destructive",
      });
    }
  };

  // Calculate stats from real data
  const stats = {
    totalClients: applications.length,
    activeApplications: applications.filter(
      (app) => app.status === "In Progress"
    ).length,
    completedApplications: applications.filter(
      (app) => app.status === "Completed"
    ).length,
    pendingTasks: applications.filter(
      (app) => app.status === "Waiting for Agent Review"
    ).length,
    monthlyRevenue: applications.length * 5000, // Mock calculation
  };

  const activeApplications = applications
    .filter(
      (app) =>
        app.status === "In Progress" ||
        app.status === "Waiting for Agent Review" ||
        app.status === "New"
    )
    .slice(0, 3); // Show only first 3 active applications

  // Helper: filter applications with submitted or in-progress visa substeps
  const visaRelevantStatuses = [
    "Started",
    "Submitted for Review",
    "Awaiting Response",
    "Approved",
  ];
  const submittedVisaApps = applications.filter(
    (app) =>
      Array.isArray(app.visaSubSteps) &&
      app.visaSubSteps.some((member) =>
        ["medical", "residenceVisa", "emiratesIdSoft", "emiratesIdHard"].some(
          (key) =>
            member[key] && visaRelevantStatuses.includes(member[key].status)
        )
      )
  );

  return (
    <div className="space-y-10 w-full px-4 bg-gray-50 min-h-screen pb-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-extrabold text-primary mb-1">
            Agent Dashboard
          </h1>
          <p className="text-lg text-muted-foreground">
            Manage your client applications and track progress
          </p>
        </div>
        <Button
          onClick={() => setShowCreateModal(true)}
          className="h-12 px-6 text-lg font-semibold rounded-lg shadow bg-primary hover:bg-primary/90"
        >
          + Create Customer
        </Button>
      </div>

      {/* Create Customer Modal */}
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

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-10">
        <Card className="shadow-lg rounded-xl hover:shadow-xl transition-shadow">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-lg text-muted-foreground">Total Clients</p>
              <p className="text-3xl font-bold">{stats.totalClients}</p>
            </div>
            <Users className="h-10 w-10 text-primary" />
          </CardContent>
        </Card>
        <Card className="shadow-lg rounded-xl hover:shadow-xl transition-shadow">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-lg text-muted-foreground">Active Apps</p>
              <p className="text-3xl font-bold">{stats.activeApplications}</p>
            </div>
            <FileText className="h-10 w-10 text-secondary" />
          </CardContent>
        </Card>
        <Card className="shadow-lg rounded-xl hover:shadow-xl transition-shadow">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-lg text-muted-foreground">Completed</p>
              <p className="text-3xl font-bold">
                {stats.completedApplications}
              </p>
            </div>
            <CheckCircle className="h-10 w-10 text-green-600" />
          </CardContent>
        </Card>
        <Card className="shadow-lg rounded-xl hover:shadow-xl transition-shadow">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-lg text-muted-foreground">Pending Tasks</p>
              <p className="text-3xl font-bold">{stats.pendingTasks}</p>
            </div>
            <Clock className="h-10 w-10 text-orange-600" />
          </CardContent>
        </Card>
        <Card className="shadow-lg rounded-xl hover:shadow-xl transition-shadow">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-lg text-muted-foreground">Revenue (AED)</p>
              <p className="text-3xl font-bold">
                {stats.monthlyRevenue.toLocaleString()}
              </p>
            </div>
            <DollarSign className="h-10 w-10 text-green-600" />
          </CardContent>
        </Card>
      </div>

      <hr className="my-8 border-gray-200" />

      {/* Visa Applications Section */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <Badge className="bg-blue-100 text-blue-800">Visa</Badge> Visa
          Applications
        </h2>
        <Card className="shadow-lg rounded-xl">
          <CardHeader>
            <CardTitle className="text-xl font-semibold">
              All Submitted Visa Applications
            </CardTitle>
            <CardDescription>
              Review, preview, and manage all submitted visa applications.
            </CardDescription>
          </CardHeader>
          <CardContent className="relative z-0">
            <VisaApplicationsList
              key={visaApplications.length}
              visaApplications={visaApplications}
              loading={visaLoading}
              onStatusUpdate={handleVisaStatusUpdate}
            />
          </CardContent>
        </Card>
      </div>

      <hr className="my-8 border-gray-200" />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Active Applications */}
        <div>
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <Badge className="bg-yellow-100 text-yellow-800">Active</Badge>{" "}
            Active Applications
          </h2>
          <Card className="shadow-lg rounded-xl">
            <CardHeader>
              <CardTitle>Active Applications</CardTitle>
              <CardDescription>
                Applications requiring your attention
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-12 text-muted-foreground">
                  Loading applications...
                </div>
              ) : activeApplications.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <span className="text-5xl">🗂️</span>
                  <div>No active applications found</div>
                </div>
              ) : (
                <div className="space-y-4">
                  {activeApplications.map((app) => {
                    const approvedSteps =
                      app.steps?.filter((step) => step.status === "Approved")
                        .length || 0;
                    const totalSteps = app.steps?.length || 0;
                    // Find first non-approved step
                    const currentStep =
                      app.steps?.find((step) => step.status !== "Approved") ||
                      app.steps?.[app.steps.length - 1];

                    return (
                      <div
                        key={app._id}
                        className="flex items-center justify-between p-4 border rounded-lg bg-white hover:shadow-md transition-shadow"
                      >
                        <div>
                          <div className="font-medium">
                            {app.customer?.firstName} {app.customer?.lastName}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {app.customer?.email} • {app._id}
                          </div>
                          <div className="text-xs mt-1">
                            {approvedSteps}/{totalSteps} steps approved
                          </div>
                        </div>
                        <div className="flex items-center space-x-2 ml-4">
                          <Badge
                            variant={
                              app.status === "In Progress"
                                ? "secondary"
                                : "default"
                            }
                            className={
                              app.status === "In Progress"
                                ? "bg-yellow-100 text-yellow-800"
                                : ""
                            }
                          >
                            {app.status}
                          </Badge>
                          <Button size="sm" variant="outline" asChild>
                            <Link
                              to={`/agent/applications?selected=${app._id}`}
                            >
                              View
                            </Link>
                          </Button>
                          {/* Approve/Reject buttons for current step */}
                          {currentStep &&
                            [
                              "Started",
                              "Submitted for Review",
                              "Awaiting Response",
                            ].includes(currentStep.status) && (
                              <>
                                <Button
                                  size="sm"
                                  variant="default"
                                  className="flex items-center gap-1"
                                  onClick={() =>
                                    handleAppStatusUpdate(
                                      app._id,
                                      currentStep.stepName,
                                      "Approved"
                                    )
                                  }
                                  disabled={
                                    actionLoading === app._id + "Approved"
                                  }
                                >
                                  <CheckCircle2 className="h-4 w-4" /> Approve
                                </Button>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  className="flex items-center gap-1"
                                  onClick={() =>
                                    handleAppStatusUpdate(
                                      app._id,
                                      currentStep.stepName,
                                      "Declined"
                                    )
                                  }
                                  disabled={
                                    actionLoading === app._id + "Declined"
                                  }
                                >
                                  <XCircle className="h-4 w-4" /> Reject
                                </Button>
                              </>
                            )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        {/* Recent Activity */}
        <Card className="shadow-lg rounded-xl">
          <CardHeader>
            <CardTitle>Today's Tasks</CardTitle>
            <CardDescription>Your priority tasks for today</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center space-x-3 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                <Clock className="h-5 w-5 text-yellow-600" />
                <div>
                  <p className="font-medium text-yellow-900">
                    Review KYC Documents
                  </p>
                  <p className="text-sm text-yellow-700">
                    {
                      applications.filter(
                        (app) => app.status === "Waiting for Agent Review"
                      ).length
                    }{" "}
                    customers waiting for verification
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <MessageSquare className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="font-medium text-blue-900">Customer Messages</p>
                  <p className="text-sm text-blue-700">
                    5 unread messages requiring response
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg border border-green-200">
                <FileText className="h-5 w-5 text-green-600" />
                <div>
                  <p className="font-medium text-green-900">
                    License Applications
                  </p>
                  <p className="text-sm text-green-700">
                    {
                      applications.filter(
                        (app) => app.status === "Ready for Processing"
                      ).length
                    }{" "}
                    applications ready for submission
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <hr className="my-8 border-gray-200" />

      {/* All Applications List */}
      <Card className="mt-10 shadow-lg rounded-xl">
        <CardHeader>
          <CardTitle>All Applications</CardTitle>
          <CardDescription>
            List of all applications assigned to you
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-12 text-muted-foreground">
              Loading applications...
            </div>
          ) : applications.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              No applications found
            </div>
          ) : (
            <div className="space-y-2">
              {applications.map((app) => {
                // Find first non-approved step
                const currentStep =
                  app.steps?.find((step) => step.status !== "Approved") ||
                  app.steps?.[app.steps.length - 1];
                return (
                  <div
                    key={app._id}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div>
                      <div className="font-medium">
                        {app.customer?.firstName} {app.customer?.lastName}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {app.customer?.email} • {app._id}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button size="sm" variant="outline" asChild>
                        <Link to={`/agent/applications?selected=${app._id}`}>
                          Open
                        </Link>
                      </Button>
                      {/* Approve/Reject buttons for current step */}
                      {currentStep &&
                        [
                          "Started",
                          "Submitted for Review",
                          "Awaiting Response",
                        ].includes(currentStep.status) && (
                          <>
                            <Button
                              size="sm"
                              variant="default"
                              className="flex items-center gap-1"
                              onClick={() =>
                                handleAppStatusUpdate(
                                  app._id,
                                  currentStep.stepName,
                                  "Approved"
                                )
                              }
                              disabled={actionLoading === app._id + "Approved"}
                            >
                              <CheckCircle2 className="h-4 w-4" /> Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              className="flex items-center gap-1"
                              onClick={() =>
                                handleAppStatusUpdate(
                                  app._id,
                                  currentStep.stepName,
                                  "Declined"
                                )
                              }
                              disabled={actionLoading === app._id + "Declined"}
                            >
                              <XCircle className="h-4 w-4" /> Reject
                            </Button>
                          </>
                        )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card className="mt-10 shadow-lg rounded-xl">
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common tasks and shortcuts</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Button asChild className="h-16 bg-primary hover:bg-primary/90">
              <Link
                to="/agent/applications"
                className="flex flex-col items-center"
              >
                <FileText className="h-6 w-6 mb-1" />
                <span className="text-sm">View Applications</span>
              </Link>
            </Button>

            <Button asChild variant="outline" className="h-16">
              <Link
                to="/agent/customers"
                className="flex flex-col items-center"
              >
                <Users className="h-6 w-6 mb-1" />
                <span className="text-sm">Manage Customers</span>
              </Link>
            </Button>

            <Button asChild variant="outline" className="h-16">
              <Link to="/agent/chat" className="flex flex-col items-center">
                <MessageSquare className="h-6 w-6 mb-1" />
                <span className="text-sm">Customer Chat</span>
              </Link>
            </Button>

            <Button
              variant="outline"
              className="h-16 flex flex-col items-center"
            >
              <DollarSign className="h-6 w-6 mb-1" />
              <span className="text-sm">Create Invoice</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

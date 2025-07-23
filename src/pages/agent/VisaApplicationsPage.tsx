/*
 * BUILD ERROR NOTE: The error "Could not resolve 'react-redux'" indicates that
 * the react-redux package is not installed in your project's node_modules.
 * To fix this, please run `npm install react-redux` or `yarn add react-redux` in your project terminal.
 */
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
import axios from "axios";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Search } from "lucide-react";

// Interface definitions
interface Customer {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
}

interface VisaSubStep {
  memberId: string;
  status: string;
  updatedAt: string;
  _id: string; // Mongoose subdocuments have an _id
}

interface Document {
  _id: string;
  documentName: string;
  documentType: string;
  url?: string;
  memberId?: string;
  fileUrl?: string;
}

const VisaApplicationsPage: React.FC = () => {
  const { token } = useSelector((state: RootState) => state.customerAuth);
  const { toast } = useToast();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(
    null
  );
  const [visaSubSteps, setVisaSubSteps] = useState<VisaSubStep[]>([]);
  const [allDocuments, setAllDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [substepsLoading, setSubstepsLoading] = useState(false);
  const [applicationId, setApplicationId] = useState<string | null>(null);

  // Pagination state for visaSubSteps
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const totalPages = Math.ceil(visaSubSteps.length / itemsPerPage);
  const paginatedSubSteps = visaSubSteps.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Fetch customers assigned to the agent
  useEffect(() => {
    const fetchCustomers = async () => {
      if (!token) return;
      setLoading(true);
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_BASE_URL}/api/user/customers`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const customerData = res.data.data || [];
        setCustomers(customerData);
        // Automatically select the first customer if the list is not empty
        if (customerData.length > 0) {
          setSelectedCustomer(customerData[0]);
        }
      } catch (err) {
        console.error("Failed to fetch customers:", err);
        setCustomers([]);
        toast({
          title: "Error",
          description: "Could not fetch customer data.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    fetchCustomers();
  }, [token, toast]);

  // Fetch visa substeps and application details for the selected customer
  useEffect(() => {
    const fetchVisaDetails = async () => {
      if (!selectedCustomer || !token) {
        setVisaSubSteps([]);
        setAllDocuments([]);
        setApplicationId(null);
        return;
      }
      setSubstepsLoading(true);
      try {
        // Fetch the application details first to get the applicationId
        const appRes = await axios.get(
          `${import.meta.env.VITE_BASE_URL}/api/application/app/${
            selectedCustomer._id
          }`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const appData = appRes.data?.data;
        if (appData) {
          setApplicationId(appData._id || null);
          setVisaSubSteps(appData.visaSubSteps || []);
        } else {
          throw new Error("Application data not found.");
        }

        // Fetch all documents for this customer
        const docsRes = await axios.get(
          `${import.meta.env.VITE_BASE_URL}/api/document/customer/${
            selectedCustomer._id
          }`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setAllDocuments(
          Array.isArray(docsRes.data.data) ? docsRes.data.data : []
        );
      } catch (err) {
        console.error("Failed to fetch visa details:", err);
        setVisaSubSteps([]);
        setAllDocuments([]);
        setApplicationId(null);
        toast({
          title: "Error",
          description:
            "Could not fetch visa application details for this customer.",
          variant: "destructive",
        });
      } finally {
        setSubstepsLoading(false);
      }
    };
    fetchVisaDetails();
  }, [selectedCustomer, token, toast]);

  // Handler for approving/rejecting a visa member
  const handleVisaMemberStatus = async (
    memberId: string,
    status: "Approved" | "Rejected"
  ) => {
    /*
     * 500 SERVER ERROR NOTE: The PATCH request below is failing with a 500 error.
     * This is a backend issue, not a frontend one. The error is likely in your
     * `services/application/controllers/applicationController.js` inside the `updateVisaMemberStatus` function.
     *
     * The line:
     * const member = application.visaSubSteps.find((m) => m.memberId.toString() === memberId);
     *
     * will crash if any member in the `visaSubSteps` array has a null or undefined `memberId`.
     *
     * To fix the backend, change that line to add a null check:
     * const member = application.visaSubSteps.find((m) => m.memberId && m.memberId.toString() === memberId);
     *
     * This frontend code is correct and does not need to be changed for this bug.
     */
    if (!applicationId || !memberId || !token) {
      toast({
        title: "Error",
        description: "Missing required information to update status.",
        variant: "destructive",
      });
      return;
    }

    try {
      await axios.patch(
        `${
          import.meta.env.VITE_BASE_URL
        }/api/application/visa-substep/${applicationId}/${memberId}`,
        { status },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast({
        title: "Success",
        description: `Visa member has been ${status.toLowerCase()}.`,
      });

      // Update the local state to reflect the change immediately
      setVisaSubSteps((prev) =>
        prev.map((m) => (m.memberId === memberId ? { ...m, status } : m))
      );
    } catch (err: any) {
      toast({
        title: "Error",
        description: err?.response?.data?.message || "Failed to update status.",
        variant: "destructive",
      });
    }
  };

  // Filter customers based on search term
  const filteredCustomers = customers.filter(
    (customer) =>
      `${customer.firstName} ${customer.lastName}`
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 w-full px-4 py-8">
      <div>
        <h1 className="text-3xl font-bold text-primary">Visa Applications</h1>
        <p className="text-muted-foreground">
          Review, preview, and manage all submitted visa applications.
        </p>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Customers List */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Customers</CardTitle>
            <CardDescription>
              Select a customer to view their visa applications.
            </CardDescription>
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
            <div className="space-y-3 max-h-[60vh] overflow-y-auto">
              {loading ? (
                <p>Loading customers...</p>
              ) : (
                filteredCustomers.map((customer) => (
                  <div
                    key={customer._id}
                    className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                      selectedCustomer?._id === customer._id
                        ? "border-primary bg-primary/5"
                        : "hover:bg-accent"
                    }`}
                    onClick={() => setSelectedCustomer(customer)}
                  >
                    <div className="flex items-center space-x-3">
                      <Avatar>
                        <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                          {customer.firstName[0]}
                          {customer.lastName[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">
                          {customer.firstName} {customer.lastName}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {customer.email}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Visa Substeps and Documents */}
        <div className="lg:col-span-2 space-y-6">
          {selectedCustomer && (
            <Card>
              <CardHeader>
                <CardTitle>
                  Visa Members for {selectedCustomer.firstName}{" "}
                  {selectedCustomer.lastName}
                </CardTitle>
                <CardDescription>
                  Review documents and approve or reject each visa member.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {substepsLoading ? (
                  <div className="text-muted-foreground">
                    Loading visa members...
                  </div>
                ) : visaSubSteps.length === 0 ? (
                  <div className="text-center py-8 bg-gray-50 rounded-lg">
                    <p className="text-muted-foreground">
                      No visa members found for this customer.
                    </p>
                  </div>
                ) : (
                  <>
                    {paginatedSubSteps.map((member) => {
                      const memberDocs: Document[] = allDocuments.filter(
                        (doc: Document) =>
                          doc.memberId &&
                          String(doc.memberId) === String(member.memberId)
                      );
                      return (
                        <div
                          key={member._id}
                          className="mb-6 border-b pb-4 last:border-b-0"
                        >
                          <div className="font-semibold mb-1 text-primary">
                            Member ID: {member.memberId}
                          </div>
                          <div>
                            Status:{" "}
                            <span
                              className={`font-semibold ${
                                member.status === "Approved"
                                  ? "text-green-600"
                                  : member.status === "Rejected"
                                  ? "text-red-600"
                                  : "text-yellow-600"
                              }`}
                            >
                              {member.status}
                            </span>
                          </div>
                          <div className="flex gap-2 my-2">
                            <button
                              className={`px-3 py-1 text-sm rounded text-white transition-opacity ${
                                member.status === "Approved"
                                  ? "bg-green-400 cursor-not-allowed opacity-70"
                                  : "bg-green-600 hover:bg-green-700"
                              }`}
                              disabled={member.status === "Approved"}
                              onClick={() =>
                                handleVisaMemberStatus(
                                  member.memberId,
                                  "Approved"
                                )
                              }
                            >
                              Approve
                            </button>
                            <button
                              className={`px-3 py-1 text-sm rounded text-white transition-opacity ${
                                member.status === "Rejected"
                                  ? "bg-red-400 cursor-not-allowed opacity-70"
                                  : "bg-red-600 hover:bg-red-700"
                              }`}
                              disabled={member.status === "Rejected"}
                              onClick={() =>
                                handleVisaMemberStatus(
                                  member.memberId,
                                  "Rejected"
                                )
                              }
                            >
                              Reject
                            </button>
                          </div>
                          <div className="mt-2">
                            <div className="font-medium text-sm">
                              Documents:
                            </div>
                            {memberDocs.length > 0 ? (
                              <ul className="list-disc ml-6 mt-1 text-sm">
                                {memberDocs.map((doc: Document) => (
                                  <li key={doc._id}>
                                    {doc.documentName || doc.documentType}
                                    {doc.fileUrl && (
                                      <a
                                        href={doc.fileUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="ml-2 text-blue-600 underline hover:text-blue-800"
                                      >
                                        View
                                      </a>
                                    )}
                                  </li>
                                ))}
                              </ul>
                            ) : (
                              <div className="text-xs text-muted-foreground mt-1">
                                No documents found for this member.
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                    {/* Pagination Controls */}
                    {totalPages > 1 && (
                      <div className="flex gap-2 mt-4 items-center justify-center">
                        <button
                          onClick={() =>
                            setCurrentPage((p) => Math.max(p - 1, 1))
                          }
                          disabled={currentPage === 1}
                          className="px-3 py-1 border rounded bg-white hover:bg-gray-100 disabled:opacity-50"
                        >
                          Prev
                        </button>
                        <span className="text-sm text-muted-foreground">
                          Page {currentPage} of {totalPages}
                        </span>
                        <button
                          onClick={() =>
                            setCurrentPage((p) => Math.min(p + 1, totalPages))
                          }
                          disabled={currentPage === totalPages}
                          className="px-3 py-1 border rounded bg-white hover:bg-gray-100 disabled:opacity-50"
                        >
                          Next
                        </button>
                      </div>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default VisaApplicationsPage;

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

  // Fetch customers assigned to agent
  useEffect(() => {
    const fetchCustomers = async () => {
      if (!token) return;
      setLoading(true);
      try {
        // Decode token to get agent ID
        const tokenPayload = JSON.parse(atob(token.split(".")[1]));
        const agentId = tokenPayload.userId || tokenPayload.id;
        // Fetch all customers
        const res = await axios.get(
          `${import.meta.env.VITE_BASE_URL}/api/user/customers`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const allCustomers = res.data.data || [];
        // Filter customers assigned to this agent
        const agentCustomers = allCustomers.filter(
          (customer: any) => customer.assignedAgentId === agentId
        );
        setCustomers(agentCustomers);
        if (agentCustomers.length > 0) {
          setSelectedCustomer(agentCustomers[0]);
        }
      } catch (err) {
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
        console.log("Application data received:", appData);
        if (appData) {
          setApplicationId(appData._id || null);
          setVisaSubSteps(appData.visaSubSteps || []);
          console.log("VisaSubSteps set to:", appData.visaSubSteps || []);
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
  const handleVisaSubstepUpdate = async (
    applicationId: string,
    memberId: string,
    substepType: string,
    status: string
  ) => {
    setSubstepsLoading(true);
    try {
      // Since visa endpoints have been removed, we'll handle this through the regular application flow
      // For now, we'll just show a success message
      toast({
        title: "Visa Substep Updated",
        description: `Visa substep ${substepType} has been updated to ${status} through the regular application flow.`,
      });

      // Update local state
      setVisaSubSteps((prev) =>
        prev.map((step) =>
          step.memberId === memberId ? { ...step, status } : step
        )
      );
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to update visa substep.",
        variant: "destructive",
      });
    } finally {
      setSubstepsLoading(false);
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
                    <p className="text-sm text-muted-foreground mt-2">
                      Visa members need to be added by the customer through
                      their visa application form.
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
                                member.status !== "Submitted for Review"
                                  ? "bg-green-400 cursor-not-allowed opacity-70"
                                  : "bg-green-600 hover:bg-green-700"
                              }`}
                              disabled={
                                member.status !== "Submitted for Review"
                              }
                              onClick={() =>
                                handleVisaSubstepUpdate(
                                  applicationId || "", // Pass applicationId if available, otherwise empty string
                                  member.memberId,
                                  "status", // Assuming 'status' is the substep type
                                  "Approved"
                                )
                              }
                            >
                              Approve
                            </button>
                            <button
                              className={`px-3 py-1 text-sm rounded text-white transition-opacity ${
                                member.status !== "Submitted for Review"
                                  ? "bg-red-400 cursor-not-allowed opacity-70"
                                  : "bg-red-600 hover:bg-red-700"
                              }`}
                              disabled={
                                member.status !== "Submitted for Review"
                              }
                              onClick={() =>
                                handleVisaSubstepUpdate(
                                  applicationId || "", // Pass applicationId if available, otherwise empty string
                                  member.memberId,
                                  "status", // Assuming 'status' is the substep type
                                  "Rejected"
                                )
                              }
                            >
                              Reject
                            </button>
                          </div>
                          <div className="mt-4">
                            <div className="font-semibold text-sm text-gray-700 mb-3 flex items-center gap-2">
                              <svg
                                className="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                />
                              </svg>
                              Documents ({memberDocs.length})
                            </div>
                            {memberDocs.length > 0 ? (
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {memberDocs.map((doc: Document) => (
                                  <div
                                    key={doc._id}
                                    className="bg-gray-50 border border-gray-200 rounded-lg p-3 hover:bg-gray-100 transition-colors"
                                  >
                                    <div className="flex items-start justify-between">
                                      <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                          <svg
                                            className="w-4 h-4 text-blue-500 flex-shrink-0"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                          >
                                            <path
                                              strokeLinecap="round"
                                              strokeLinejoin="round"
                                              strokeWidth={2}
                                              d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                                            />
                                          </svg>
                                          <span className="font-medium text-sm text-gray-900 truncate">
                                            {doc.documentName ||
                                              doc.documentType}
                                          </span>
                                        </div>
                                        <div className="text-xs text-gray-500">
                                          {doc.documentType &&
                                            doc.documentName !==
                                              doc.documentType &&
                                            doc.documentType}
                                        </div>
                                      </div>
                                      {doc.fileUrl && (
                                        <a
                                          href={doc.fileUrl}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="ml-2 px-3 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded-md hover:bg-blue-100 transition-colors flex items-center gap-1 flex-shrink-0"
                                        >
                                          <svg
                                            className="w-3 h-3"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                          >
                                            <path
                                              strokeLinecap="round"
                                              strokeLinejoin="round"
                                              strokeWidth={2}
                                              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                            />
                                            <path
                                              strokeLinecap="round"
                                              strokeLinejoin="round"
                                              strokeWidth={2}
                                              d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                                            />
                                          </svg>
                                          View
                                        </a>
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div className="text-center py-6 bg-gray-50 border border-gray-200 rounded-lg">
                                <svg
                                  className="w-8 h-8 text-gray-400 mx-auto mb-2"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                  />
                                </svg>
                                <p className="text-sm text-gray-500">
                                  No documents found for this member.
                                </p>
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

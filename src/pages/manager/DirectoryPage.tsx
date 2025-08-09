import React, { useState } from "react";
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
import { Search, Eye, Upload, Filter } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DocumentUploadModal } from "@/components/common/DocumentUploadModal";
import axios from "axios";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useSelector } from "react-redux";
import { RootState } from "@/app/store";
import { useToast } from "@/hooks/use-toast";

interface Customer {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  companyType?: string;
  createdAt: string;
  assignedAgentId?: string;
}

interface DocumentApiItem {
  _id: string;
  documentType: string;
  documentName: string;
  fileUrl: string;
  status: string;
  uploadedAt: string;
  notes?: { message: string; addedByRole?: string; timestamp: string }[];
}

export const DirectoryPage: React.FC = () => {
  const { token, user } = useSelector((state: RootState) => state.customerAuth);
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [documentSearchTerm, setDocumentSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(
    null
  );
  const [customerDocuments, setCustomerDocuments] = useState<DocumentApiItem[]>(
    []
  );
  const [loadingCustomers, setLoadingCustomers] = useState(true);
  const [loadingDocs, setLoadingDocs] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [addingNoteDocId, setAddingNoteDocId] = useState<string | null>(null);
  const [newNote, setNewNote] = useState<string>("");
  const [applications, setApplications] = useState<any[]>([]);
  const [customerNotes, setCustomerNotes] = useState<any[]>([]);
  const [loadingNotes, setLoadingNotes] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState<any>(null);

  const customerId = user?.userId;

  // Fetch all customers from database
  React.useEffect(() => {
    const fetchCustomers = async () => {
      setLoadingCustomers(true);
      try {
        if (!token) return;

        // Fetch all customers directly from the database
        const customersResponse = await axios.get(
          `${import.meta.env.VITE_BASE_URL}/api/user/customers`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        const customersData = customersResponse.data.data || [];
        console.log("Customers loaded:", customersData.length);
        setCustomers(customersData);

        // Also fetch applications for reference
        const applicationsResponse = await axios.get(
          `${import.meta.env.VITE_BASE_URL}/api/application`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const apps = applicationsResponse.data.data || [];
        console.log("Applications loaded:", apps.length);
        setApplications(apps);
      } catch (err) {
        toast({
          title: "Error",
          description: "Failed to load customers.",
          variant: "destructive",
        });
        setCustomers([]);
      } finally {
        setLoadingCustomers(false);
      }
    };
    fetchCustomers();
  }, [token, toast]);

  // Fetch documents for selected customer
  React.useEffect(() => {
    const fetchDocs = async () => {
      if (!selectedCustomer || !token) return;
      setLoadingDocs(true);
      console.log("Fetching documents for customer:", selectedCustomer._id);

      try {
        // First, try to get documents directly linked to customer
        const customerDocsRes = await axios.get(
          `${import.meta.env.VITE_BASE_URL}/api/document/customer/${
            selectedCustomer._id
          }`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        console.log("Customer documents API response:", customerDocsRes.data);
        let allDocuments = customerDocsRes.data.data || [];

        // Also try to get documents through applications
        const customerApps = applications.filter(
          (app) => app.customer && app.customer._id === selectedCustomer._id
        );

        console.log("Customer applications found:", customerApps.length);

        // For each application, fetch its documents
        for (const app of customerApps) {
          try {
            const appDocsRes = await axios.get(
              `${import.meta.env.VITE_BASE_URL}/api/document/application/${
                app._id
              }`,
              { headers: { Authorization: `Bearer ${token}` } }
            );
            console.log(
              `Application ${app._id} documents:`,
              appDocsRes.data.data?.length || 0
            );
            if (appDocsRes.data.data) {
              allDocuments = [...allDocuments, ...appDocsRes.data.data];
            }
          } catch (appErr) {
            console.warn(
              `Failed to fetch documents for application ${app._id}:`,
              appErr
            );
          }
        }

        // Remove duplicates by _id
        const uniqueDocuments = allDocuments.filter(
          (doc, index, self) =>
            index === self.findIndex((d) => d._id === doc._id)
        );

        console.log("Total unique documents found:", uniqueDocuments.length);
        setCustomerDocuments(uniqueDocuments);
      } catch (err) {
        console.error("Error fetching documents:", err);
        console.error("Error response:", err.response?.data);
        toast({
          title: "Error",
          description: "Failed to load documents.",
          variant: "destructive",
        });
        setCustomerDocuments([]);
      } finally {
        setLoadingDocs(false);
      }
    };
    fetchDocs();
  }, [selectedCustomer, token, toast, applications]);

  // When a customer is selected, find their application and set notes
  React.useEffect(() => {
    if (!selectedCustomer) {
      setCustomerNotes([]);
      setSelectedApplication(null);
      return;
    }
    setLoadingNotes(true);
    // Find all applications for this customer
    const customerApps = applications.filter(
      (app) => app.customer && app.customer._id === selectedCustomer._id
    );
    if (customerApps.length > 0) {
      setSelectedApplication(customerApps[0]);
      setCustomerNotes(customerApps[0].notes || []);
    } else {
      setSelectedApplication(null);
      setCustomerNotes([]);
    }
    setLoadingNotes(false);
  }, [selectedCustomer, applications]);

  const filteredDocuments = customerDocuments.filter((doc) => {
    const matchesSearch =
      doc.documentType
        .toLowerCase()
        .includes(documentSearchTerm.toLowerCase()) ||
      doc.documentName
        .toLowerCase()
        .includes(documentSearchTerm.toLowerCase()) ||
      (selectedCustomer?.firstName + " " + selectedCustomer?.lastName)
        .toLowerCase()
        .includes(documentSearchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === "all" || doc.documentType === selectedCategory;
    const matchesStatus =
      selectedStatus === "all" || doc.status === selectedStatus;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Approved":
        return "bg-green-100 text-green-800";
      case "Rejected":
        return "bg-red-100 text-red-800";
      default:
        return "bg-yellow-100 text-yellow-800";
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "passport":
        return "bg-blue-100 text-blue-800";
      case "photo":
        return "bg-purple-100 text-purple-800";
      case "visa":
        return "bg-indigo-100 text-indigo-800";
      case "invoice":
        return "bg-orange-100 text-orange-800";
      case "government":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const handleUpload = () => {
    setIsUploadModalOpen(true);
  };

  // Add note to document
  const handleAddNote = async (docId: string) => {
    if (!newNote.trim()) return;
    setActionLoading(docId + "note");
    try {
      await axios.post(
        `${import.meta.env.VITE_BASE_URL}/api/document/${docId}/note`,
        { message: newNote },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      // Refresh documents
      if (selectedCustomer) {
        const res = await axios.get(
          `${import.meta.env.VITE_BASE_URL}/api/document/customer/${
            selectedCustomer._id
          }`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setCustomerDocuments(res.data.data || []);
      }
      setNewNote("");
      setAddingNoteDocId(null);
      toast({ title: "Success", description: "Note added." });
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to add note.",
        variant: "destructive",
      });
    } finally {
      setActionLoading(null);
    }
  };

  // Add note to application (not customer)
  const [newCustomerNote, setNewCustomerNote] = useState("");
  const [addingCustomerNote, setAddingCustomerNote] = useState(false);
  const handleAddCustomerNote = async () => {
    if (!newCustomerNote.trim() || !selectedApplication) return;
    setActionLoading("customerNote");
    try {
      await axios.post(
        `${import.meta.env.VITE_BASE_URL}/api/application/note/${
          selectedCustomer._id
        }`,
        { message: newCustomerNote },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setNewCustomerNote("");
      setAddingCustomerNote(false);
      // Refresh application and notes
      const response = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/api/application`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const apps = response.data.data || [];
      setApplications(apps);
      // Find the updated application and notes
      const updatedApp = apps.find(
        (app: any) => app._id === selectedApplication._id
      );
      setSelectedApplication(updatedApp);
      setCustomerNotes(updatedApp?.notes || []);
      toast({ title: "Success", description: "Note added." });
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to add note.",
        variant: "destructive",
      });
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex gap-6">
        {/* Customer List Sidebar */}
        <div className="w-80 min-w-[18rem] max-h-[80vh] overflow-y-auto">
          <Card>
            <CardHeader>
              <CardTitle>Customers ({customers.length})</CardTitle>
              <CardDescription>All customers in the database</CardDescription>
            </CardHeader>
            <CardContent>
              {/* Search for customers */}
              <div className="mb-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search customers..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {loadingCustomers ? (
                <div className="text-center py-8 text-muted-foreground">
                  Loading customers...
                </div>
              ) : customers.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No customers found.
                </div>
              ) : (
                <div className="space-y-2">
                  {customers
                    .filter(
                      (customer) =>
                        `${customer.firstName} ${customer.lastName}`
                          .toLowerCase()
                          .includes(searchTerm.toLowerCase()) ||
                        customer.email
                          .toLowerCase()
                          .includes(searchTerm.toLowerCase())
                    )
                    .map((customer) => (
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
                            {customer.phoneNumber && (
                              <p className="text-xs text-muted-foreground truncate">
                                {customer.phoneNumber}
                              </p>
                            )}
                            {customer.companyType && (
                              <p className="text-xs text-muted-foreground truncate">
                                {customer.companyType}
                              </p>
                            )}
                            <div className="flex items-center mt-1">
                              {customer.assignedAgentId ? (
                                <Badge variant="outline" className="text-xs">
                                  Assigned
                                </Badge>
                              ) : (
                                <Badge variant="secondary" className="text-xs">
                                  Admin
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Documents for Selected Customer */}
        <div className="flex-1">
          {selectedCustomer ? (
            <>
              {/* Header with customer info and filters */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">
                      {selectedCustomer.firstName} {selectedCustomer.lastName}{" "}
                      Documents
                    </h2>
                    <p className="text-gray-600 mt-1">
                      {filteredDocuments.length} document
                      {filteredDocuments.length !== 1 ? "s" : ""} found
                    </p>
                  </div>
                </div>

                {/* Search and Filters */}
                <Card>
                  <CardContent className="p-4">
                    <div className="flex flex-col md:flex-row gap-4 items-center">
                      {/* Search documents */}
                      <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <Input
                          placeholder="Search by customer name, application ID, or filename..."
                          value={documentSearchTerm}
                          onChange={(e) =>
                            setDocumentSearchTerm(e.target.value)
                          }
                          className="pl-10"
                        />
                      </div>

                      {/* Category filter */}
                      <Select
                        value={selectedCategory}
                        onValueChange={setSelectedCategory}
                      >
                        <SelectTrigger className="w-full md:w-48">
                          <SelectValue placeholder="All Categories" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Categories</SelectItem>
                          <SelectItem value="passport">Passport</SelectItem>
                          <SelectItem value="photo">Photo</SelectItem>
                          <SelectItem value="visa">Visa</SelectItem>
                          <SelectItem value="invoice">Invoice</SelectItem>
                          <SelectItem value="government">Government</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>

                      {/* Status filter */}
                      <Select
                        value={selectedStatus}
                        onValueChange={setSelectedStatus}
                      >
                        <SelectTrigger className="w-full md:w-48">
                          <SelectValue placeholder="All Status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Status</SelectItem>
                          <SelectItem value="Approved">Approved</SelectItem>
                          <SelectItem value="Rejected">Rejected</SelectItem>
                          <SelectItem value="Uploaded">Uploaded</SelectItem>
                          <SelectItem value="Pending">Pending</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Documents Grid */}
              <div className="space-y-4 mt-4">
                {loadingDocs ? (
                  <Card>
                    <CardContent className="p-12 text-center">
                      <div className="text-muted-foreground">
                        Loading documents...
                      </div>
                    </CardContent>
                  </Card>
                ) : filteredDocuments.length === 0 ? (
                  <Card>
                    <CardContent className="p-12 text-center">
                      <div className="text-gray-400 mb-4">
                        <Filter className="w-12 h-12 mx-auto" />
                      </div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        No documents found
                      </h3>
                      <p className="text-gray-600">
                        Try adjusting your search or filter criteria
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  filteredDocuments.map((doc) => (
                    <Card
                      key={doc._id}
                      className="hover:shadow-md transition-shadow border border-gray-200"
                    >
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            {/* File name as main title */}
                            <div className="flex items-center gap-3 mb-3">
                              <h3 className="font-semibold text-lg text-gray-900">
                                {doc.documentName}
                              </h3>
                              <Badge
                                variant="secondary"
                                className={getCategoryColor(doc.documentType)}
                              >
                                {doc.documentType}
                              </Badge>
                              <Badge
                                variant={
                                  doc.status === "Approved"
                                    ? "default"
                                    : doc.status === "Rejected"
                                    ? "destructive"
                                    : "secondary"
                                }
                                className={`${
                                  doc.status === "Approved"
                                    ? "bg-green-100 text-green-800 hover:bg-green-100"
                                    : doc.status === "Rejected"
                                    ? "bg-red-100 text-red-800 hover:bg-red-100"
                                    : "bg-yellow-100 text-yellow-800 hover:bg-yellow-100"
                                }`}
                              >
                                {doc.status.toLowerCase()}
                              </Badge>
                            </div>

                            {/* Document details */}
                            <div className="space-y-1 text-sm text-gray-600">
                              <div>
                                <span className="font-medium">Customer:</span>{" "}
                                {selectedCustomer?.firstName}{" "}
                                {selectedCustomer?.lastName}
                              </div>
                              <div>
                                <span className="font-medium">App ID:</span>{" "}
                                {doc.documentName}
                              </div>
                              <div>
                                <span className="font-medium">Uploaded:</span>{" "}
                                {new Date(doc.uploadedAt).toLocaleDateString()}
                              </div>
                            </div>
                          </div>

                          {/* Action buttons */}
                          <div className="flex items-center gap-2 ml-4">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => window.open(doc.fileUrl, "_blank")}
                              className="flex items-center gap-1"
                            >
                              <Eye className="w-4 h-4" />
                              View
                            </Button>
                          </div>
                        </div>

                        {/* Add note section - shown when adding */}
                        {addingNoteDocId === doc._id && (
                          <div className="mt-4 pt-4 border-t border-gray-200">
                            <div className="flex flex-col gap-3">
                              <textarea
                                className="w-full border border-gray-300 rounded-md p-3 text-sm resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="Enter note..."
                                value={newNote}
                                onChange={(e) => setNewNote(e.target.value)}
                                rows={3}
                              />
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  onClick={() => handleAddNote(doc._id)}
                                  disabled={
                                    actionLoading === doc._id + "note" ||
                                    !newNote.trim()
                                  }
                                >
                                  {actionLoading === doc._id + "note"
                                    ? "Adding..."
                                    : "Add Note"}
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => {
                                    setAddingNoteDocId(null);
                                    setNewNote("");
                                  }}
                                >
                                  Cancel
                                </Button>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Add note button - shown when not adding */}
                        {addingNoteDocId !== doc._id && (
                          <div className="mt-4 pt-4 border-t border-gray-200">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setAddingNoteDocId(doc._id)}
                              className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                            >
                              Add Note
                            </Button>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              Select a customer to view documents.
            </div>
          )}
        </div>
      </div>
      {/* Below documents grid, show notes for selected customer */}
      {selectedCustomer && (
        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle>Customer Notes</CardTitle>
              <CardDescription>
                Internal notes for this customer
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loadingNotes ? (
                <div className="text-center py-4 text-muted-foreground">
                  Loading notes...
                </div>
              ) : (
                <>
                  <div className="mb-4">
                    {addingCustomerNote ? (
                      <div className="flex flex-col gap-2">
                        <textarea
                          className="border rounded p-1 text-xs"
                          placeholder="Enter note..."
                          value={newCustomerNote}
                          onChange={(e) => setNewCustomerNote(e.target.value)}
                          rows={2}
                          style={{ minWidth: 180 }}
                        />
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="default"
                            onClick={handleAddCustomerNote}
                            disabled={
                              actionLoading === "customerNote" ||
                              !newCustomerNote.trim()
                            }
                          >
                            {actionLoading === "customerNote"
                              ? "Adding..."
                              : "Add Note"}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setAddingCustomerNote(false);
                              setNewCustomerNote("");
                            }}
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setAddingCustomerNote(true)}
                      >
                        + Add Note
                      </Button>
                    )}
                  </div>
                  {customerNotes.length === 0 ? (
                    <div className="text-center py-4 text-muted-foreground">
                      No notes yet.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {customerNotes.map((note: any) => (
                        <div
                          key={note._id || note.id}
                          className="border rounded p-3 bg-muted/30"
                        >
                          <div className="mb-1 text-sm">{note.message}</div>
                          <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <span>
                              {note.addedBy?.fullName || note.author || "Agent"}
                            </span>
                            <span>
                              {note.timestamp
                                ? new Date(note.timestamp).toLocaleString()
                                : ""}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </div>
      )}
      {/* Document Upload Modal */}
      <DocumentUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onUpload={() => {}}
      />
    </div>
  );
};

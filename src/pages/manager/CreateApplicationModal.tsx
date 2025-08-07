import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { CalendarIcon, Plus, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { useSelector } from "react-redux";
import { RootState } from "@/app/store";
import axios from "axios";
import { uploadToCloudinary, UploadResult } from "@/lib/cloudinary";

interface CreateApplicationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface PaymentEntry {
  id: string;
  method: string;
  amount: string;
  date: Date | undefined;
  reference: string;
  status: string;
  notes: string;
  receipt: File | null;
  receiptUrl?: string;
  receiptPublicId?: string;
  isUploading?: boolean;
}

interface Customer {
  _id: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  phoneNumber: string;
  email: string;
}

export const CreateApplicationModal: React.FC<CreateApplicationModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { toast } = useToast();
  const { token } = useSelector((state: RootState) => state.customerAuth);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    customerId: "",
    applicationType: "",
    emirate: "",
    legalForm: "",
    proposedCompanyNamesEN: "",
    officeRequired: false,
    officeType: "",
    applicationNotes: "",
    totalAgreedCost: "",
  });

  const [paymentEntries, setPaymentEntries] = useState<PaymentEntry[]>([
    {
      id: "1",
      method: "",
      amount: "",
      date: undefined,
      reference: "",
      status: "",
      notes: "",
      receipt: null,
      receiptUrl: "",
      receiptPublicId: "",
      isUploading: false,
    },
  ]);

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loadingCustomers, setLoadingCustomers] = useState(true);

  const applicationTypes = ["Mainland", "Freezone", "Offshore"];

  const emirates = [
    "Dubai",
    "Abu Dhabi",
    "Sharjah",
    "Ajman",
    "RAK",
    "Fujairah",
    "UAQ",
  ];

  const legalForms = [
    "LLC",
    "Sole Proprietorship",
    "Civil Company",
    "Branch",
    "Holding",
  ];

  const officeTypes = [
    "Flexi Desk",
    "Smart Office",
    "Executive Office",
    "Virtual Office",
    "Warehouse",
    "Retail Shop / Showroom",
    "Business Centre Office",
    "Shared Office / Co-working Space",
  ];

  const paymentMethods = [
    "Cash",
    "Bank Transfer",
    "Credit Card",
    "Cheque",
    "Online Payment",
  ];

  const paymentStatuses = ["Pending", "Completed", "Failed", "Partial"];

  // Fetch customers when modal opens
  useEffect(() => {
    if (isOpen && token) {
      fetchCustomers();
    }
  }, [isOpen, token]);

  const fetchCustomers = async () => {
    try {
      setLoadingCustomers(true);
      const response = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/api/user/customers`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setCustomers(response.data.data || []);
    } catch (error) {
      console.error("Error fetching customers:", error);
      toast({
        title: "Error",
        description: "Failed to load customers. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoadingCustomers(false);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const addPaymentEntry = () => {
    const newEntry: PaymentEntry = {
      id: Date.now().toString(),
      method: "",
      amount: "",
      date: undefined,
      reference: "",
      status: "",
      notes: "",
      receipt: null,
      receiptUrl: "",
      receiptPublicId: "",
      isUploading: false,
    };
    setPaymentEntries([...paymentEntries, newEntry]);
  };

  const removePaymentEntry = (id: string) => {
    if (paymentEntries.length > 1) {
      setPaymentEntries(paymentEntries.filter((entry) => entry.id !== id));
    }
  };

  const updatePaymentEntry = (id: string, field: string, value: any) => {
    setPaymentEntries((entries) =>
      entries.map((entry) =>
        entry.id === id ? { ...entry, [field]: value } : entry
      )
    );
  };

  const handleReceiptSelect = (id: string, file: File | null) => {
    if (!file) return;

    // Just store the file, don't upload yet
    updatePaymentEntry(id, "receipt", file);

    toast({
      title: "File Selected",
      description: "Receipt will be uploaded when you create the application.",
    });
  };

  const handleSubmit = async () => {
    // Validate required fields
    if (
      !formData.customerId ||
      !formData.applicationType ||
      !formData.emirate ||
      !formData.legalForm ||
      !formData.proposedCompanyNamesEN
    ) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // First, upload all receipts to Cloudinary
      const uploadedPaymentEntries = await Promise.all(
        paymentEntries
          .filter((entry) => entry.method && entry.amount) // Only include entries with method and amount
          .map(async (entry) => {
            let receiptUrl = "";

            // Upload receipt if file exists
            if (entry.receipt) {
              try {
                const uploadResult = await uploadToCloudinary(entry.receipt);
                receiptUrl = uploadResult.secure_url;
              } catch (error) {
                console.error("Error uploading receipt:", error);
                toast({
                  title: "Warning",
                  description: `Failed to upload receipt for payment ${entry.method}. Application will be created without this receipt.`,
                  variant: "destructive",
                });
              }
            }

            return {
              paymentMethod: entry.method,
              amountPaid: parseFloat(entry.amount) || 0,
              paymentDate: entry.date || new Date(),
              transactionRefNo: entry.reference,
              paymentStatus: entry.status || "Pending",
              receiptUpload: receiptUrl,
              additionalNotes: entry.notes,
            };
          })
      );

      const requestData = {
        customerId: formData.customerId,
        assignedAgent: null, // Will be assigned by the system
        assignedAgentRole: "admin", // Since this is manager creating
        applicationType: formData.applicationType,
        emirate: formData.emirate,
        legalForm: formData.legalForm,
        proposedCompanyNamesEN: [formData.proposedCompanyNamesEN], // Backend expects array
        proposedCompanyNameAR: "", // Optional
        officeRequired: formData.officeRequired,
        officeType: formData.officeType || undefined,
        totalAgreedCost: parseFloat(formData.totalAgreedCost) || 0,
        paymentEntries: uploadedPaymentEntries,
      };

      const response = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/api/application/create`,
        requestData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data.success) {
        toast({
          title: "Success",
          description: "Application created successfully!",
        });

        // Reset form
        setFormData({
          customerId: "",
          applicationType: "",
          emirate: "",
          legalForm: "",
          proposedCompanyNamesEN: "",
          officeRequired: false,
          officeType: "",
          applicationNotes: "",
          totalAgreedCost: "",
        });
        setPaymentEntries([
          {
            id: "1",
            method: "",
            amount: "",
            date: undefined,
            reference: "",
            status: "",
            notes: "",
            receipt: null,
            receiptUrl: "",
            receiptPublicId: "",
            isUploading: false,
          },
        ]);

        onClose();
      }
    } catch (error: any) {
      console.error("Error creating application:", error);
      const errorMessage =
        error.response?.data?.message ||
        "Failed to create application. Please try again.";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Application</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Customer Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Customer Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="customerId">Customer *</Label>
                <Select
                  value={formData.customerId}
                  onValueChange={(value) =>
                    handleInputChange("customerId", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue
                      placeholder={
                        loadingCustomers
                          ? "Loading customers..."
                          : "Select customer"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {customers.map((customer) => (
                      <SelectItem key={customer._id} value={customer._id}>
                        <div>
                          <div className="font-medium">
                            {customer.firstName} {customer.middleName}{" "}
                            {customer.lastName}
                          </div>
                          {customer.phoneNumber && (
                            <div className="text-sm text-muted-foreground">
                              {customer.phoneNumber}
                            </div>
                          )}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Application Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Application Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="applicationType">Application Type *</Label>
                  <Select
                    value={formData.applicationType}
                    onValueChange={(value) =>
                      handleInputChange("applicationType", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      {applicationTypes.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="emirate">Emirate *</Label>
                  <Select
                    value={formData.emirate}
                    onValueChange={(value) =>
                      handleInputChange("emirate", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select emirate" />
                    </SelectTrigger>
                    <SelectContent>
                      {emirates.map((emirate) => (
                        <SelectItem key={emirate} value={emirate}>
                          {emirate}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="legalForm">Legal Form *</Label>
                  <Select
                    value={formData.legalForm}
                    onValueChange={(value) =>
                      handleInputChange("legalForm", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select legal form" />
                    </SelectTrigger>
                    <SelectContent>
                      {legalForms.map((form) => (
                        <SelectItem key={form} value={form}>
                          {form}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="proposedCompanyNamesEN">
                    Proposed Company Name (EN) *
                  </Label>
                  <Input
                    id="proposedCompanyNamesEN"
                    value={formData.proposedCompanyNamesEN}
                    onChange={(e) =>
                      handleInputChange(
                        "proposedCompanyNamesEN",
                        e.target.value
                      )
                    }
                    placeholder="Enter company name"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="officeRequired"
                    checked={formData.officeRequired}
                    onCheckedChange={(checked) =>
                      handleInputChange("officeRequired", checked)
                    }
                  />
                  <Label htmlFor="officeRequired">Office Requirement</Label>
                </div>

                {formData.officeRequired && (
                  <div>
                    <Label htmlFor="officeType">Office Type</Label>
                    <Select
                      value={formData.officeType}
                      onValueChange={(value) =>
                        handleInputChange("officeType", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select office type" />
                      </SelectTrigger>
                      <SelectContent>
                        {officeTypes.map((type) => (
                          <SelectItem key={type} value={type}>
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>

              <div>
                <Label htmlFor="applicationNotes">Application Notes</Label>
                <Textarea
                  id="applicationNotes"
                  value={formData.applicationNotes}
                  onChange={(e) =>
                    handleInputChange("applicationNotes", e.target.value)
                  }
                  placeholder="Enter any additional notes..."
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Payment Details */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Payment Details</CardTitle>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addPaymentEntry}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Payment
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="totalAgreedCost">Total Agreed Cost (AED)</Label>
                <Input
                  id="totalAgreedCost"
                  type="number"
                  value={formData.totalAgreedCost}
                  onChange={(e) =>
                    handleInputChange("totalAgreedCost", e.target.value)
                  }
                  placeholder="0.00"
                />
              </div>

              {paymentEntries.map((entry, index) => (
                <Card key={entry.id} className="border-dashed">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm">
                        Payment Entry {index + 1}
                      </CardTitle>
                      {paymentEntries.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removePaymentEntry(entry.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <Label>Payment Method</Label>
                        <Select
                          value={entry.method}
                          onValueChange={(value) =>
                            updatePaymentEntry(entry.id, "method", value)
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select method" />
                          </SelectTrigger>
                          <SelectContent>
                            {paymentMethods.map((method) => (
                              <SelectItem key={method} value={method}>
                                {method}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label>Amount Paid (AED)</Label>
                        <Input
                          type="number"
                          value={entry.amount}
                          onChange={(e) =>
                            updatePaymentEntry(
                              entry.id,
                              "amount",
                              e.target.value
                            )
                          }
                          placeholder="0.00"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <Label>Payment Date</Label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className={cn(
                                "w-full justify-start text-left font-normal",
                                !entry.date && "text-muted-foreground"
                              )}
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {entry.date ? (
                                format(entry.date, "PPP")
                              ) : (
                                <span>Pick a date</span>
                              )}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={entry.date}
                              onSelect={(date) =>
                                updatePaymentEntry(entry.id, "date", date)
                              }
                              initialFocus
                              className="pointer-events-auto"
                            />
                          </PopoverContent>
                        </Popover>
                      </div>

                      <div>
                        <Label>Transaction Reference No.</Label>
                        <Input
                          value={entry.reference}
                          onChange={(e) =>
                            updatePaymentEntry(
                              entry.id,
                              "reference",
                              e.target.value
                            )
                          }
                          placeholder="Enter reference number"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <Label>Payment Status</Label>
                        <Select
                          value={entry.status}
                          onValueChange={(value) =>
                            updatePaymentEntry(entry.id, "status", value)
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                          <SelectContent>
                            {paymentStatuses.map((status) => (
                              <SelectItem key={status} value={status}>
                                {status}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label>Receipt Upload</Label>
                        <div className="space-y-2">
                          <Input
                            type="file"
                            accept=".pdf,.jpg,.jpeg,.png"
                            onChange={(e) =>
                              handleReceiptSelect(
                                entry.id,
                                e.target.files?.[0] || null
                              )
                            }
                          />
                          {entry.receipt && (
                            <div className="text-sm text-blue-600">
                              ✓ File selected: {entry.receipt.name}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div>
                      <Label>Additional Notes</Label>
                      <Textarea
                        value={entry.notes}
                        onChange={(e) =>
                          updatePaymentEntry(entry.id, "notes", e.target.value)
                        }
                        placeholder="Enter any additional notes..."
                        rows={2}
                      />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? "Creating..." : "Create Application"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

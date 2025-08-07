import React, { useState } from "react";
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
// import { supabase } from '@/integrations/supabase/client';

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
}

export const CreateApplicationModal: React.FC<CreateApplicationModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    customerName: "",
    applicationType: "",
    emirate: "",
    legalForm: "",
    companyNameEN: "",
    officeRequirement: false,
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
    },
  ]);

  const [customers, setCustomers] = useState<any[]>([]);
  const [loadingCustomers, setLoadingCustomers] = useState(true);

  // Load customers from database
  React.useEffect(() => {
    const loadCustomers = async () => {
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("user_id, first_name, last_name, phone")
          .eq("role", "customer");

        if (error) throw error;

        const customerList = data.map((profile) => ({
          id: profile.user_id,
          name: `${profile.first_name} ${profile.last_name}`,
          phone: profile.phone,
        }));

        setCustomers(customerList);
      } catch (error) {
        console.error("Error loading customers:", error);
      } finally {
        setLoadingCustomers(false);
      }
    };

    if (isOpen) {
      loadCustomers();
    }
  }, [isOpen]);

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

  const handleSubmit = async () => {
    // Validate required fields
    if (
      !formData.customerName ||
      !formData.applicationType ||
      !formData.emirate ||
      !formData.legalForm ||
      !formData.companyNameEN
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
      // Get current user profile
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("user_id", user.id)
        .single();

      // Find selected customer
      const selectedCustomer = customers.find(
        (c) => c.name === formData.customerName
      );
      if (!selectedCustomer) throw new Error("Customer not found");

      // Create application
      const { data: application, error: appError } = await supabase
        .from("applications")
        .insert({
          customer_id: selectedCustomer.id,
          agent_id: profile?.role === "agent" ? user.id : null,
          manager_id: profile?.role === "manager" ? user.id : null,
          business_name: formData.companyNameEN,
          business_type: formData.applicationType.toLowerCase(),
          status: "awaiting-customer-input",
          created_by_role: profile?.role || "agent",
          version: "v1.2",
        })
        .select()
        .single();

      if (appError) throw appError;

      // Save application fields filled by agent/manager
      const fieldEntries = [
        { field_name: "emirate", field_value: formData.emirate },
        { field_name: "legal_form", field_value: formData.legalForm },
        { field_name: "company_name_en", field_value: formData.companyNameEN },
        {
          field_name: "office_requirement",
          field_value: formData.officeRequirement.toString(),
        },
        { field_name: "office_type", field_value: formData.officeType },
        {
          field_name: "application_notes",
          field_value: formData.applicationNotes,
        },
        {
          field_name: "total_agreed_cost",
          field_value: formData.totalAgreedCost,
        },
      ].filter((entry) => entry.field_value);

      for (const entry of fieldEntries) {
        await supabase.from("application_fields").insert({
          application_id: application.id,
          field_name: entry.field_name,
          field_value: entry.field_value,
          filled_by_user_id: user.id,
          filled_by_role: profile?.role || "agent",
        });
      }

      // Send application initiated email
      const loginUrl = `${window.location.origin}/auth`;

      await supabase.functions.invoke("send-customer-notifications", {
        body: {
          type: "application_initiated",
          customerEmail:
            selectedCustomer.email ||
            `${selectedCustomer.name
              .toLowerCase()
              .replace(" ", ".")}@example.com`,
          customerName: selectedCustomer.name,
          loginUrl,
          username: selectedCustomer.email || selectedCustomer.name,
          applicationId: application.id,
          applicationName: formData.companyNameEN,
        },
      });

      toast({
        title: "Application Created Successfully",
        description:
          "Customer has been notified and can now complete their application.",
      });

      onClose();

      // Reset form
      setFormData({
        customerName: "",
        applicationType: "",
        emirate: "",
        legalForm: "",
        companyNameEN: "",
        officeRequirement: false,
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
        },
      ]);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create application. Please try again.",
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
                <Label htmlFor="customerName">Customer Name *</Label>
                <Select
                  value={formData.customerName}
                  onValueChange={(value) =>
                    handleInputChange("customerName", value)
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
                      <SelectItem key={customer.id} value={customer.name}>
                        <div>
                          <div className="font-medium">{customer.name}</div>
                          {customer.phone && (
                            <div className="text-sm text-muted-foreground">
                              {customer.phone}
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
                  <Label htmlFor="companyNameEN">
                    Proposed Company Name (EN) *
                  </Label>
                  <Input
                    id="companyNameEN"
                    value={formData.companyNameEN}
                    onChange={(e) =>
                      handleInputChange("companyNameEN", e.target.value)
                    }
                    placeholder="Enter company name"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="officeRequirement"
                    checked={formData.officeRequirement}
                    onCheckedChange={(checked) =>
                      handleInputChange("officeRequirement", checked)
                    }
                  />
                  <Label htmlFor="officeRequirement">Office Requirement</Label>
                </div>

                {formData.officeRequirement && (
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
                        <Input
                          type="file"
                          accept=".pdf,.jpg,.jpeg,.png"
                          onChange={(e) =>
                            updatePaymentEntry(
                              entry.id,
                              "receipt",
                              e.target.files?.[0] || null
                            )
                          }
                        />
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

import React, { useState } from "react";
import {
  CreditCard,
  DollarSign,
  Calendar,
  FileText,
  AlertCircle,
  CheckCircle,
  Clock,
  XCircle,
  Edit,
  Save,
  X,
  Plus,
  Trash2,
} from "lucide-react";
import { ApiApplicationData } from "@/types/application";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { useToast } from "@/hooks/use-toast";
import { useSelector } from "react-redux";
import { RootState } from "@/app/store";
import axios from "axios";

interface PaymentDetailsProps {
  applicationData: ApiApplicationData | null;
  onApplicationUpdate?: (updatedData: any) => void;
}

interface PaymentEntry {
  _id?: string;
  paymentMethod?: string;
  amountPaid?: number;
  paymentDate?: string;
  transactionRefNo?: string;
  paymentStatus?: string;
  receiptUpload?: string | null;
  additionalNotes?: string;
}

export const PaymentDetails: React.FC<PaymentDetailsProps> = ({
  applicationData,
  onApplicationUpdate,
}) => {
  const { toast } = useToast();
  const { token } = useSelector((state: RootState) => state.customerAuth);
  const [isEditingTotalCost, setIsEditingTotalCost] = useState(false);
  const [editingTotalCost, setEditingTotalCost] = useState(
    applicationData?.totalAgreedCost || 0
  );
  const [editingPaymentIndex, setEditingPaymentIndex] = useState<number | null>(
    null
  );
  const [editingPayment, setEditingPayment] = useState<PaymentEntry>({});
  const [isAddingPayment, setIsAddingPayment] = useState(false);
  const [newPayment, setNewPayment] = useState<PaymentEntry>({});
  const [isUpdating, setIsUpdating] = useState(false);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-AE", {
      style: "currency",
      currency: "AED",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatDateForInput = (dateString: string) => {
    return new Date(dateString).toISOString().split("T")[0];
  };

  const getPaymentStatusIcon = (status: string) => {
    switch (status?.toLowerCase()) {
      case "approved":
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "pending":
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case "rejected":
      case "declined":
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-600" />;
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "approved":
      case "completed":
        return "bg-green-100 text-green-800 border-green-200";
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "rejected":
      case "declined":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const totalPaid =
    applicationData?.paymentEntries?.reduce(
      (sum, payment) => sum + (payment.amountPaid || 0),
      0
    ) || 0;

  const remainingAmount = (applicationData?.totalAgreedCost || 0) - totalPaid;

  const handleEditTotalCost = () => {
    setIsEditingTotalCost(true);
    setEditingTotalCost(applicationData?.totalAgreedCost || 0);
  };

  const handleSaveTotalCost = async () => {
    if (!applicationData?.applicationId || !token) return;

    setIsUpdating(true);
    try {
      const response = await axios.patch(
        `${import.meta.env.VITE_BASE_URL}/api/application/customer/${
          applicationData.applicationId
        }`,
        {
          totalAgreedCost: editingTotalCost,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        toast({
          title: "Total cost updated",
          description: "Total agreed cost has been updated successfully",
        });
        setIsEditingTotalCost(false);
        // Call the callback to refresh parent data
        if (onApplicationUpdate) {
          await onApplicationUpdate(response.data.data);
        }
      }
    } catch (error: any) {
      console.error("Error updating total cost:", error);
      toast({
        title: "Error updating total cost",
        description:
          error.response?.data?.message || "Failed to update total cost",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCancelTotalCost = () => {
    setIsEditingTotalCost(false);
    setEditingTotalCost(applicationData?.totalAgreedCost || 0);
  };

  const handleEditPayment = (index: number, payment: PaymentEntry) => {
    setEditingPaymentIndex(index);
    setEditingPayment({ ...payment });
  };

  const handleSavePayment = async () => {
    if (
      !applicationData?.applicationId ||
      !token ||
      editingPaymentIndex === null
    )
      return;

    setIsUpdating(true);
    try {
      const updatedPaymentEntries = [...(applicationData.paymentEntries || [])];
      updatedPaymentEntries[editingPaymentIndex] = editingPayment;

      const response = await axios.patch(
        `${import.meta.env.VITE_BASE_URL}/api/application/customer/${
          applicationData.applicationId
        }`,
        {
          paymentEntries: updatedPaymentEntries,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        toast({
          title: "Payment updated",
          description: "Payment entry has been updated successfully",
        });
        setEditingPaymentIndex(null);
        setEditingPayment({});
        // Call the callback to refresh parent data
        if (onApplicationUpdate) {
          await onApplicationUpdate(response.data.data);
        }
      }
    } catch (error: any) {
      console.error("Error updating payment:", error);
      toast({
        title: "Error updating payment",
        description:
          error.response?.data?.message || "Failed to update payment",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCancelPayment = () => {
    setEditingPaymentIndex(null);
    setEditingPayment({});
  };

  const handleAddPayment = () => {
    setIsAddingPayment(true);
    setNewPayment({
      paymentMethod: "",
      amountPaid: 0,
      paymentDate: new Date().toISOString().split("T")[0],
      transactionRefNo: "",
      paymentStatus: "Pending",
      additionalNotes: "",
    });
  };

  const handleSaveNewPayment = async () => {
    if (!applicationData?.applicationId || !token) return;

    setIsUpdating(true);
    try {
      const updatedPaymentEntries = [
        ...(applicationData.paymentEntries || []),
        newPayment,
      ];

      const response = await axios.patch(
        `${import.meta.env.VITE_BASE_URL}/api/application/customer/${
          applicationData.applicationId
        }`,
        {
          paymentEntries: updatedPaymentEntries,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        toast({
          title: "Payment added",
          description: "New payment entry has been added successfully",
        });
        setIsAddingPayment(false);
        setNewPayment({});
        // Call the callback to refresh parent data
        if (onApplicationUpdate) {
          await onApplicationUpdate(response.data.data);
        }
      }
    } catch (error: any) {
      console.error("Error adding payment:", error);
      toast({
        title: "Error adding payment",
        description: error.response?.data?.message || "Failed to add payment",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCancelNewPayment = () => {
    setIsAddingPayment(false);
    setNewPayment({});
  };

  const handleDeletePayment = async (index: number) => {
    if (!applicationData?.applicationId || !token) return;

    if (!confirm("Are you sure you want to delete this payment entry?")) return;

    setIsUpdating(true);
    try {
      const updatedPaymentEntries = [...(applicationData.paymentEntries || [])];
      updatedPaymentEntries.splice(index, 1);

      const response = await axios.patch(
        `${import.meta.env.VITE_BASE_URL}/api/application/customer/${
          applicationData.applicationId
        }`,
        {
          paymentEntries: updatedPaymentEntries,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        toast({
          title: "Payment deleted",
          description: "Payment entry has been deleted successfully",
        });
        // Call the callback to refresh parent data
        if (onApplicationUpdate) {
          await onApplicationUpdate(response.data.data);
        }
      }
    } catch (error: any) {
      console.error("Error deleting payment:", error);
      toast({
        title: "Error deleting payment",
        description:
          error.response?.data?.message || "Failed to delete payment",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Payment Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Payment Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center justify-between">
                <div className="text-sm text-blue-600 font-medium">
                  Total Agreed Cost
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleEditTotalCost}
                  className="h-6 w-6 p-0 text-blue-600 hover:text-blue-800"
                >
                  <Edit className="h-3 w-3" />
                </Button>
              </div>
              {isEditingTotalCost ? (
                <div className="space-y-2 mt-2">
                  <Input
                    type="number"
                    value={editingTotalCost}
                    onChange={(e) =>
                      setEditingTotalCost(Number(e.target.value))
                    }
                    className="text-lg font-bold"
                  />
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={handleSaveTotalCost}
                      disabled={isUpdating}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      {isUpdating ? (
                        <Clock className="h-3 w-3 animate-spin" />
                      ) : (
                        <Save className="h-3 w-3" />
                      )}
                      Save
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleCancelTotalCost}
                    >
                      <X className="h-3 w-3" />
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-2xl font-bold text-blue-900">
                  {formatCurrency(applicationData?.totalAgreedCost || 0)}
                </div>
              )}
            </div>
            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <div className="text-sm text-green-600 font-medium">
                Total Paid
              </div>
              <div className="text-2xl font-bold text-green-900">
                {formatCurrency(totalPaid)}
              </div>
            </div>
            <div
              className={`p-4 rounded-lg border ${
                remainingAmount > 0
                  ? "bg-red-50 border-red-200"
                  : "bg-green-50 border-green-200"
              }`}
            >
              <div
                className={`text-sm font-medium ${
                  remainingAmount > 0 ? "text-red-600" : "text-green-600"
                }`}
              >
                {remainingAmount > 0 ? "Remaining Amount" : "Fully Paid"}
              </div>
              <div
                className={`text-2xl font-bold ${
                  remainingAmount > 0 ? "text-red-900" : "text-green-900"
                }`}
              >
                {formatCurrency(Math.abs(remainingAmount))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payment Entries */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Payment Entries
            </CardTitle>
            <Button
              onClick={handleAddPayment}
              disabled={isAddingPayment}
              className="bg-green-600 hover:bg-green-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Payment
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Add New Payment Form */}
          {isAddingPayment && (
            <div className="p-4 bg-green-50 rounded-lg border border-green-200 mb-4">
              <h4 className="font-semibold text-lg mb-3 text-green-800">
                Add New Payment
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="paymentMethod">Payment Method</Label>
                    <Select
                      value={newPayment.paymentMethod}
                      onValueChange={(value) =>
                        setNewPayment({ ...newPayment, paymentMethod: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select payment method" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Cash">Cash</SelectItem>
                        <SelectItem value="Bank Transfer">
                          Bank Transfer
                        </SelectItem>
                        <SelectItem value="Credit Card">Credit Card</SelectItem>
                        <SelectItem value="Cheque">Cheque</SelectItem>
                        <SelectItem value="Online Payment">
                          Online Payment
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="amountPaid">Amount Paid (AED)</Label>
                    <Input
                      id="amountPaid"
                      type="number"
                      value={newPayment.amountPaid}
                      onChange={(e) =>
                        setNewPayment({
                          ...newPayment,
                          amountPaid: Number(e.target.value),
                        })
                      }
                      placeholder="Enter amount"
                    />
                  </div>

                  <div>
                    <Label htmlFor="paymentDate">Payment Date</Label>
                    <Input
                      id="paymentDate"
                      type="date"
                      value={newPayment.paymentDate}
                      onChange={(e) =>
                        setNewPayment({
                          ...newPayment,
                          paymentDate: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <Label htmlFor="transactionRefNo">
                      Transaction Reference
                    </Label>
                    <Input
                      id="transactionRefNo"
                      value={newPayment.transactionRefNo}
                      onChange={(e) =>
                        setNewPayment({
                          ...newPayment,
                          transactionRefNo: e.target.value,
                        })
                      }
                      placeholder="Enter transaction reference"
                    />
                  </div>

                  <div>
                    <Label htmlFor="paymentStatus">Payment Status</Label>
                    <Select
                      value={newPayment.paymentStatus}
                      onValueChange={(value) =>
                        setNewPayment({ ...newPayment, paymentStatus: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Pending">Pending</SelectItem>
                        <SelectItem value="Completed">Completed</SelectItem>
                        <SelectItem value="Approved">Approved</SelectItem>
                        <SelectItem value="Rejected">Rejected</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="additionalNotes">Additional Notes</Label>
                    <Textarea
                      id="additionalNotes"
                      value={newPayment.additionalNotes}
                      onChange={(e) =>
                        setNewPayment({
                          ...newPayment,
                          additionalNotes: e.target.value,
                        })
                      }
                      placeholder="Enter additional notes"
                      rows={2}
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-2 mt-4">
                <Button
                  onClick={handleSaveNewPayment}
                  disabled={isUpdating}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {isUpdating ? (
                    <Clock className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Save className="h-4 w-4 mr-2" />
                  )}
                  Save Payment
                </Button>
                <Button variant="outline" onClick={handleCancelNewPayment}>
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {/* Existing Payment Entries */}
          {applicationData?.paymentEntries &&
          applicationData.paymentEntries.length > 0 ? (
            <div className="space-y-4">
              {applicationData.paymentEntries.map((payment, idx) => (
                <div key={idx} className="p-4 bg-gray-50 rounded-lg border">
                  {editingPaymentIndex === idx ? (
                    // Edit Mode
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="font-semibold text-lg">
                          Edit Payment #{idx + 1}
                        </h4>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={handleSavePayment}
                            disabled={isUpdating}
                            className="bg-blue-600 hover:bg-blue-700"
                          >
                            {isUpdating ? (
                              <Clock className="h-4 w-4 animate-spin" />
                            ) : (
                              <Save className="h-4 w-4" />
                            )}
                            Save
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={handleCancelPayment}
                          >
                            <X className="h-4 w-4" />
                            Cancel
                          </Button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-3">
                          <div>
                            <Label>Payment Method</Label>
                            <Select
                              value={editingPayment.paymentMethod}
                              onValueChange={(value) =>
                                setEditingPayment({
                                  ...editingPayment,
                                  paymentMethod: value,
                                })
                              }
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Cash">Cash</SelectItem>
                                <SelectItem value="Bank Transfer">
                                  Bank Transfer
                                </SelectItem>
                                <SelectItem value="Credit Card">
                                  Credit Card
                                </SelectItem>
                                <SelectItem value="Cheque">Cheque</SelectItem>
                                <SelectItem value="Online Payment">
                                  Online Payment
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div>
                            <Label>Amount Paid (AED)</Label>
                            <Input
                              type="number"
                              value={editingPayment.amountPaid}
                              onChange={(e) =>
                                setEditingPayment({
                                  ...editingPayment,
                                  amountPaid: Number(e.target.value),
                                })
                              }
                            />
                          </div>

                          <div>
                            <Label>Payment Date</Label>
                            <Input
                              type="date"
                              value={
                                editingPayment.paymentDate
                                  ? formatDateForInput(
                                      editingPayment.paymentDate
                                    )
                                  : ""
                              }
                              onChange={(e) =>
                                setEditingPayment({
                                  ...editingPayment,
                                  paymentDate: e.target.value,
                                })
                              }
                            />
                          </div>
                        </div>

                        <div className="space-y-3">
                          <div>
                            <Label>Transaction Reference</Label>
                            <Input
                              value={editingPayment.transactionRefNo}
                              onChange={(e) =>
                                setEditingPayment({
                                  ...editingPayment,
                                  transactionRefNo: e.target.value,
                                })
                              }
                            />
                          </div>

                          <div>
                            <Label>Payment Status</Label>
                            <Select
                              value={editingPayment.paymentStatus}
                              onValueChange={(value) =>
                                setEditingPayment({
                                  ...editingPayment,
                                  paymentStatus: value,
                                })
                              }
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Pending">Pending</SelectItem>
                                <SelectItem value="Completed">
                                  Completed
                                </SelectItem>
                                <SelectItem value="Approved">
                                  Approved
                                </SelectItem>
                                <SelectItem value="Rejected">
                                  Rejected
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div>
                            <Label>Additional Notes</Label>
                            <Textarea
                              value={editingPayment.additionalNotes}
                              onChange={(e) =>
                                setEditingPayment({
                                  ...editingPayment,
                                  additionalNotes: e.target.value,
                                })
                              }
                              rows={2}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    // View Mode
                    <>
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold text-lg">
                            Payment #{idx + 1}
                          </h4>
                          <Badge
                            variant="outline"
                            className={getPaymentStatusColor(
                              payment.paymentStatus || "pending"
                            )}
                          >
                            {getPaymentStatusIcon(
                              payment.paymentStatus || "pending"
                            )}
                            <span className="ml-1">
                              {payment.paymentStatus || "Pending"}
                            </span>
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="text-right">
                            <div className="text-2xl font-bold text-green-600">
                              {formatCurrency(payment.amountPaid || 0)}
                            </div>
                          </div>
                          <div className="flex gap-1">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleEditPayment(idx, payment)}
                              className="text-blue-600 hover:text-blue-700"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDeletePayment(idx)}
                              disabled={isUpdating}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-3">
                          <div className="flex items-center gap-2">
                            <CreditCard className="h-4 w-4 text-gray-500" />
                            <span className="text-sm font-medium text-gray-700">
                              Payment Method:
                            </span>
                            <span className="text-sm text-gray-900">
                              {payment.paymentMethod || "Not specified"}
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-gray-500" />
                            <span className="text-sm font-medium text-gray-700">
                              Payment Date:
                            </span>
                            <span className="text-sm text-gray-900">
                              {payment.paymentDate
                                ? formatDate(payment.paymentDate)
                                : "Not specified"}
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4 text-gray-500" />
                            <span className="text-sm font-medium text-gray-700">
                              Transaction Ref:
                            </span>
                            <span className="text-sm text-gray-900 font-mono">
                              {payment.transactionRefNo || "Not specified"}
                            </span>
                          </div>
                        </div>

                        <div className="space-y-3">
                          {payment.additionalNotes && (
                            <div>
                              <div className="text-sm font-medium text-gray-700 mb-1">
                                Additional Notes:
                              </div>
                              <div className="text-sm text-gray-900 bg-white p-2 rounded border">
                                {payment.additionalNotes}
                              </div>
                            </div>
                          )}

                          {payment.receiptUpload && (
                            <div>
                              <div className="text-sm font-medium text-gray-700 mb-1">
                                Receipt:
                              </div>
                              <a
                                href={payment.receiptUpload}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:text-blue-800 text-sm underline"
                              >
                                View Receipt
                              </a>
                            </div>
                          )}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No Payment Records
              </h3>
              <p className="text-gray-600">
                Payment details will appear here once payments are processed.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Payment Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Payment Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="font-medium text-gray-900">Application Details</h4>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Application ID:</span>
                  <span className="text-sm font-medium text-gray-900">
                    {applicationData?.applicationId}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">
                    Application Type:
                  </span>
                  <span className="text-sm font-medium text-gray-900">
                    {applicationData?.applicationType}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Emirate:</span>
                  <span className="text-sm font-medium text-gray-900">
                    {applicationData?.emirate}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Legal Form:</span>
                  <span className="text-sm font-medium text-gray-900">
                    {applicationData?.legalForm}
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-medium text-gray-900">Office Requirements</h4>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">
                    Office Required:
                  </span>
                  <span className="text-sm font-medium text-gray-900">
                    {applicationData?.officeRequired ? "Yes" : "No"}
                  </span>
                </div>
                {applicationData?.officeRequired && (
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Office Type:</span>
                    <span className="text-sm font-medium text-gray-900">
                      {applicationData?.officeType}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

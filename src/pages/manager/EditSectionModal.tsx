import React, { useState, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import {
  Plus,
  Trash2,
  Upload,
  Save,
  Eye,
  FileText,
  Image,
  X,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import axios from "axios";
import { useSelector } from "react-redux";
import { RootState } from "@/app/store";

interface EditSectionModalProps {
  title: string;
  children: React.ReactNode;
  trigger: React.ReactNode;
  applicationId?: string;
  onSave?: (data: any) => Promise<void>;
  onSaveSuccess?: () => void;
}

export const EditSectionModal: React.FC<EditSectionModalProps> = ({
  title,
  children,
  trigger,
  applicationId,
  onSave,
  onSaveSuccess,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  const handleSave = async () => {
    if (!onSave) return;

    setIsSaving(true);
    try {
      await onSave({});
      toast({
        title: "Success",
        description: `${title} updated successfully!`,
      });
      setIsOpen(false);
      onSaveSuccess?.();
    } catch (error: any) {
      toast({
        title: "Error",
        description:
          error?.response?.data?.message ||
          `Failed to update ${title.toLowerCase()}`,
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit {title}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {children}
          {onSave && (
            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button
                variant="outline"
                onClick={() => setIsOpen(false)}
                disabled={isSaving}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                disabled={isSaving}
                className="flex items-center gap-2"
              >
                <Save className="h-4 w-4" />
                {isSaving ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

interface ApplicationInfoFormProps {
  applicationDetails: any;
  setApplicationDetails: React.Dispatch<React.SetStateAction<any>>;
  applicationId?: string;
  customerId?: string;
}

export const ApplicationInfoForm: React.FC<ApplicationInfoFormProps> = ({
  applicationDetails,
  setApplicationDetails,
  applicationId,
}) => {
  return (
    <div className="space-y-4">
      <div>
        <Label>Application Type</Label>
        <Select
          value={applicationDetails.applicationType}
          onValueChange={(value) =>
            setApplicationDetails((prev) => ({
              ...prev,
              applicationType: value,
            }))
          }
        >
          <SelectTrigger className="mt-1">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Freezone">Free Zone</SelectItem>
            <SelectItem value="Mainland">Mainland</SelectItem>
            <SelectItem value="Offshore">Offshore</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label>Emirate</Label>
        <Select
          value={applicationDetails.emirate}
          onValueChange={(value) =>
            setApplicationDetails((prev) => ({ ...prev, emirate: value }))
          }
        >
          <SelectTrigger className="mt-1">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Dubai">Dubai</SelectItem>
            <SelectItem value="Abu Dhabi">Abu Dhabi</SelectItem>
            <SelectItem value="Sharjah">Sharjah</SelectItem>
            <SelectItem value="Ajman">Ajman</SelectItem>
            <SelectItem value="RAK">Ras Al Khaimah</SelectItem>
            <SelectItem value="Fujairah">Fujairah</SelectItem>
            <SelectItem value="UAQ">Umm Al Quwain</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label>Legal Form</Label>
        <Select
          value={applicationDetails.legalForm}
          onValueChange={(value) =>
            setApplicationDetails((prev) => ({ ...prev, legalForm: value }))
          }
        >
          <SelectTrigger className="mt-1">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="LLC">LLC</SelectItem>
            <SelectItem value="Sole Proprietorship">
              Sole Proprietorship
            </SelectItem>
            <SelectItem value="Civil Company">Civil Company</SelectItem>
            <SelectItem value="Branch">Branch</SelectItem>
            <SelectItem value="Holding">Holding</SelectItem>
            <SelectItem value="Freezone Company">Freezone Company</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label>Office Requirement</Label>
        <Select
          value={applicationDetails.officeRequirement}
          onValueChange={(value) =>
            setApplicationDetails((prev) => ({
              ...prev,
              officeRequirement: value,
            }))
          }
        >
          <SelectTrigger className="mt-1">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Required">Required</SelectItem>
            <SelectItem value="Not Required">Not Required</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label>Office Type</Label>
        <Select
          value={applicationDetails.officeType}
          onValueChange={(value) =>
            setApplicationDetails((prev) => ({ ...prev, officeType: value }))
          }
        >
          <SelectTrigger className="mt-1">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Flexi Desk">Flexi Desk</SelectItem>
            <SelectItem value="Smart Office">Smart Office</SelectItem>
            <SelectItem value="Executive Office">Executive Office</SelectItem>
            <SelectItem value="Virtual Office">Virtual Office</SelectItem>
            <SelectItem value="Warehouse">Warehouse</SelectItem>
            <SelectItem value="Retail Shop / Showroom">
              Retail Shop / Showroom
            </SelectItem>
            <SelectItem value="Business Centre Office">
              Business Centre Office
            </SelectItem>
            <SelectItem value="Shared Office / Co-working Space">
              Shared Office / Co-working Space
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label>Total Agreed Cost</Label>
        <Input
          type="number"
          value={applicationDetails.totalAgreedCost}
          onChange={(e) =>
            setApplicationDetails((prev) => ({
              ...prev,
              totalAgreedCost: parseFloat(e.target.value) || 0,
            }))
          }
          placeholder="Enter total cost"
        />
      </div>

      <div>
        <Label>Application Notes</Label>
        <Textarea
          value={applicationDetails.applicationNotes}
          onChange={(e) =>
            setApplicationDetails((prev) => ({
              ...prev,
              applicationNotes: e.target.value,
            }))
          }
          placeholder="Add any notes about this application..."
          rows={3}
        />
      </div>
    </div>
  );
};

export const CustomerInfoForm: React.FC<ApplicationInfoFormProps> = ({
  applicationDetails,
  setApplicationDetails,
  applicationId,
}) => {
  return (
    <div className="space-y-4">
      <div>
        <Label>Customer Name</Label>
        <Input
          value={applicationDetails.customerName}
          onChange={(e) =>
            setApplicationDetails((prev) => ({
              ...prev,
              customerName: e.target.value,
            }))
          }
          className="mt-1"
        />
      </div>
    </div>
  );
};

export const CompanyInfoForm: React.FC<ApplicationInfoFormProps> = ({
  applicationDetails,
  setApplicationDetails,
  applicationId,
}) => {
  return (
    <div className="space-y-4">
      <div className="space-y-3">
        <Label className="text-base font-medium">Proposed Company Names</Label>
        {applicationDetails.proposedCompanyNames.map(
          (name: string, index: number) => (
            <div key={index}>
              <Label className="text-sm text-muted-foreground">
                Name {index + 1}{" "}
                {index === 0 && <span className="text-red-500">*</span>}
              </Label>
              <Input
                value={name}
                onChange={(e) => {
                  const updatedNames = [
                    ...applicationDetails.proposedCompanyNames,
                  ];
                  updatedNames[index] = e.target.value;
                  setApplicationDetails((prev) => ({
                    ...prev,
                    proposedCompanyNames: updatedNames,
                  }));
                }}
                className="mt-1"
                placeholder={`Company name ${index + 1}`}
                required={index === 0}
              />
            </div>
          )
        )}
      </div>

      <div>
        <Label>Office Requirement</Label>
        <Select
          value={applicationDetails.officeRequirement}
          onValueChange={(value) =>
            setApplicationDetails((prev) => ({
              ...prev,
              officeRequirement: value,
            }))
          }
        >
          <SelectTrigger className="mt-1">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Required">Required</SelectItem>
            <SelectItem value="Not Required">Not Required</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label>Office Type</Label>
        <Select
          value={applicationDetails.officeType}
          onValueChange={(value) =>
            setApplicationDetails((prev) => ({ ...prev, officeType: value }))
          }
        >
          <SelectTrigger className="mt-1">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Flexi Desk">Flexi Desk</SelectItem>
            <SelectItem value="Smart Office">Smart Office</SelectItem>
            <SelectItem value="Executive Office">Executive Office</SelectItem>
            <SelectItem value="Virtual Office">Virtual Office</SelectItem>
            <SelectItem value="Warehouse">Warehouse</SelectItem>
            <SelectItem value="Retail Shop / Showroom">
              Retail Shop / Showroom
            </SelectItem>
            <SelectItem value="Business Centre Office">
              Business Centre Office
            </SelectItem>
            <SelectItem value="Shared Office / Co-working Space">
              Shared Office / Co-working Space
            </SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export const ShareholderInfoForm: React.FC<ApplicationInfoFormProps> = ({
  applicationDetails,
  setApplicationDetails,
}) => {
  const addShareholder = () => {
    const newShareholder = {
      name: "",
      nationality: "",
      passportCopy: null,
      ownershipPercentage: 0,
      designation: "",
      natureOfControl: {
        shareholder: false,
        votingRights: false,
        appointDirectors: false,
        controlViaAgreement: false,
        significantInfluence: false,
        beneficialOwner: false,
        trustee: false,
        other: "",
      },
    };
    setApplicationDetails((prev) => ({
      ...prev,
      shareholders: [...prev.shareholders, newShareholder],
    }));
  };

  const removeShareholder = (index: number) => {
    const updated = applicationDetails.shareholders.filter(
      (_: any, i: number) => i !== index
    );
    setApplicationDetails((prev) => ({ ...prev, shareholders: updated }));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label className="text-base font-medium">Shareholder Details</Label>
        <Button size="sm" variant="outline" onClick={addShareholder}>
          <Plus className="h-4 w-4 mr-1" />
          Add Shareholder
        </Button>
      </div>

      {applicationDetails.shareholders.map(
        (shareholder: any, index: number) => (
          <div key={index} className="border rounded-lg p-4 space-y-3">
            <div className="flex justify-between items-center">
              <h4 className="font-medium">Shareholder {index + 1}</h4>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => removeShareholder(index)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-sm">Name</Label>
                <Input
                  value={shareholder.name}
                  onChange={(e) => {
                    const updated = [...applicationDetails.shareholders];
                    updated[index].name = e.target.value;
                    setApplicationDetails((prev) => ({
                      ...prev,
                      shareholders: updated,
                    }));
                  }}
                  className="mt-1"
                />
              </div>

              <div>
                <Label className="text-sm">Nationality</Label>
                <Input
                  value={shareholder.nationality}
                  onChange={(e) => {
                    const updated = [...applicationDetails.shareholders];
                    updated[index].nationality = e.target.value;
                    setApplicationDetails((prev) => ({
                      ...prev,
                      shareholders: updated,
                    }));
                  }}
                  className="mt-1"
                />
              </div>

              <div>
                <Label className="text-sm">Ownership %</Label>
                <Input
                  type="number"
                  value={shareholder.ownershipPercentage}
                  onChange={(e) => {
                    const updated = [...applicationDetails.shareholders];
                    updated[index].ownershipPercentage = Number(e.target.value);
                    setApplicationDetails((prev) => ({
                      ...prev,
                      shareholders: updated,
                    }));
                  }}
                  className="mt-1"
                />
              </div>

              <div>
                <Label className="text-sm">Designation</Label>
                <Input
                  value={shareholder.designation}
                  onChange={(e) => {
                    const updated = [...applicationDetails.shareholders];
                    updated[index].designation = e.target.value;
                    setApplicationDetails((prev) => ({
                      ...prev,
                      shareholders: updated,
                    }));
                  }}
                  className="mt-1"
                />
              </div>
            </div>

            <div>
              <Label className="text-sm mb-2 block">Nature of Control</Label>
              <div className="grid grid-cols-2 gap-2 text-sm">
                {[
                  { key: "shareholder", label: "Shareholder" },
                  { key: "votingRights", label: "Voting Rights" },
                  { key: "appointDirectors", label: "Appoint Directors" },
                  {
                    key: "controlViaAgreement",
                    label: "Control via Agreement",
                  },
                  {
                    key: "significantInfluence",
                    label: "Significant Influence",
                  },
                  { key: "beneficialOwner", label: "Beneficial Owner" },
                  { key: "trustee", label: "Trustee" },
                ].map(({ key, label }) => (
                  <label key={key} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={
                        shareholder.natureOfControl[
                          key as keyof Omit<
                            typeof shareholder.natureOfControl,
                            "other"
                          >
                        ] as boolean
                      }
                      onChange={(e) => {
                        const updated = [...applicationDetails.shareholders];
                        updated[index].natureOfControl = {
                          ...updated[index].natureOfControl,
                          [key]: e.target.checked,
                        };
                        setApplicationDetails((prev) => ({
                          ...prev,
                          shareholders: updated,
                        }));
                      }}
                      className="h-4 w-4"
                    />
                    <span>{label}</span>
                  </label>
                ))}
              </div>

              <div className="mt-3">
                <Label className="text-sm">Other (specify)</Label>
                <Input
                  value={shareholder.natureOfControl.other}
                  onChange={(e) => {
                    const updated = [...applicationDetails.shareholders];
                    updated[index].natureOfControl.other = e.target.value;
                    setApplicationDetails((prev) => ({
                      ...prev,
                      shareholders: updated,
                    }));
                  }}
                  className="mt-1"
                  placeholder="Specify other control..."
                />
              </div>
            </div>

            <div>
              <Label className="text-sm">Passport Copy</Label>
              <div className="border-2 border-dashed border-gray-300 rounded p-3 text-center mt-1">
                <Upload className="h-6 w-6 mx-auto text-gray-400 mb-2" />
                <p className="text-sm text-gray-500">Upload passport copy</p>
              </div>
            </div>
          </div>
        )
      )}
    </div>
  );
};

// Custom ReceiptUpload component for handling existing receipts and new uploads
const ReceiptUpload: React.FC<{
  existingReceipt?: string | null;
  onReceiptChange: (file: File | null, existingUrl?: string | null) => void;
  applicationId?: string;
  customerId?: string;
}> = ({ existingReceipt, onReceiptChange, applicationId, customerId }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const { toast } = useToast();
  const { token } = useSelector((state: RootState) => state.customerAuth);
  const [isUploading, setIsUploading] = useState(false);

  // Handle file selection and upload
  const handleFileSelect = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please select a file smaller than 5MB",
        variant: "destructive",
      });
      return;
    }

    // Validate file type
    const allowedTypes = [".jpg", ".jpeg", ".png", ".pdf"];
    const fileExtension = "." + file.name.split(".").pop()?.toLowerCase();
    const isValidType = allowedTypes.includes(fileExtension);

    if (!isValidType) {
      toast({
        title: "Invalid file type",
        description: "Please select a JPG, PNG, or PDF file",
        variant: "destructive",
      });
      return;
    }

    setSelectedFile(file);

    // Create preview for images
    if (file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (e) => setPreviewUrl(e.target?.result as string);
      reader.readAsDataURL(file);
    } else {
      setPreviewUrl(null);
    }

    // Upload file to backend
    if (applicationId && customerId && token) {
      setIsUploading(true);
      try {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("documentName", `Receipt - ${file.name}`);
        formData.append("documentType", "Receipt");
        formData.append("linkedTo", customerId);
        formData.append("linkedModel", "Customer");
        formData.append("relatedStepName", "Payment & License Issuance");

        const response = await axios.post(
          `${import.meta.env.VITE_BASE_URL}/api/document/create-document`,
          formData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "multipart/form-data",
            },
          }
        );

        const uploadedUrl = response.data.data.fileUrl;
        onReceiptChange(null, uploadedUrl);

        toast({
          title: "Receipt Uploaded",
          description: "Receipt has been uploaded successfully!",
        });
      } catch (error: any) {
        toast({
          title: "Upload Failed",
          description:
            error?.response?.data?.message || "Failed to upload receipt",
          variant: "destructive",
        });
        // Reset file selection on error
        setSelectedFile(null);
        setPreviewUrl(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      } finally {
        setIsUploading(false);
      }
    } else {
      // Fallback for when we don't have the required IDs
      onReceiptChange(file, null);
    }
  };

  const handleRemove = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    onReceiptChange(null, null);
  };

  const handlePreview = (url: string) => {
    window.open(url, "_blank");
  };

  const getFileIcon = (fileName: string) => {
    const extension = fileName.split(".").pop()?.toLowerCase();
    return extension === "pdf" ? (
      <FileText className="w-4 h-4" />
    ) : (
      <Image className="w-4 h-4" />
    );
  };

  const getFileName = (url: string) => {
    const parts = url.split("/");
    return parts[parts.length - 1] || "Receipt";
  };

  return (
    <div className="space-y-2">
      {/* Show existing receipt if available */}
      {existingReceipt && !selectedFile && (
        <div className="border rounded-lg p-3 bg-green-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {getFileIcon(getFileName(existingReceipt))}
              <div>
                <p className="text-sm font-medium text-gray-900">
                  Existing Receipt
                </p>
                <p className="text-xs text-gray-500">
                  {getFileName(existingReceipt)}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => handlePreview(existingReceipt)}
              >
                <Eye className="w-4 h-4" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => onReceiptChange(null, null)}
                className="text-red-600 hover:text-red-700"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Upload new receipt */}
      {!existingReceipt && !selectedFile && (
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-[#0b1d9b] transition-colors">
          <input
            ref={fileInputRef}
            type="file"
            accept=".jpg,.jpeg,.png,.pdf"
            onChange={handleFileSelect}
            className="hidden"
          />
          <Button
            type="button"
            variant="ghost"
            onClick={() => fileInputRef.current?.click()}
            className="w-full"
            disabled={isUploading}
          >
            <Upload className="w-4 h-4 mr-2" />
            {isUploading ? "Uploading..." : "Upload Receipt"}
          </Button>
          <p className="text-xs text-gray-500 mt-1">Max 5MB • JPG, PNG, PDF</p>
        </div>
      )}

      {/* Show selected file */}
      {selectedFile && (
        <div className="border rounded-lg p-3 bg-blue-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {getFileIcon(selectedFile.name)}
              <div>
                <p className="text-sm font-medium text-gray-900">
                  {selectedFile.name}
                </p>
                <p className="text-xs text-gray-500">
                  {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              {previewUrl && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => handlePreview(previewUrl)}
                >
                  <Eye className="w-4 h-4" />
                </Button>
              )}
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleRemove}
                className="text-red-600 hover:text-red-700"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
          {previewUrl && (
            <div className="mt-3">
              <img
                src={previewUrl}
                alt="Preview"
                className="max-w-full h-32 object-cover rounded border"
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export const PaymentDetailsForm: React.FC<ApplicationInfoFormProps> = ({
  applicationDetails,
  setApplicationDetails,
  applicationId,
  customerId,
}) => {
  const addPaymentEntry = () => {
    const newEntry = {
      method: "Bank Transfer",
      amount: 0,
      date: new Date().toISOString().split("T")[0],
      reference: "",
      status: "Pending",
      receipt: null,
      notes: "",
    };
    setApplicationDetails((prev) => ({
      ...prev,
      paymentEntries: [...prev.paymentEntries, newEntry],
    }));
  };

  const removePaymentEntry = (index: number) => {
    const updatedEntries = applicationDetails.paymentEntries.filter(
      (_: any, i: number) => i !== index
    );
    setApplicationDetails((prev) => ({
      ...prev,
      paymentEntries: updatedEntries,
    }));
  };

  return (
    <div className="space-y-4">
      <div>
        <Label>Total Agreed Cost</Label>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-sm">$</span>
          <Input
            type="number"
            value={applicationDetails.totalAgreedCost}
            onChange={(e) =>
              setApplicationDetails((prev) => ({
                ...prev,
                totalAgreedCost: Number(e.target.value),
              }))
            }
            className="flex-1"
          />
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label className="text-base font-medium">Payment Entries</Label>
          <Button size="sm" variant="outline" onClick={addPaymentEntry}>
            <Plus className="h-4 w-4 mr-1" />
            Add Payment
          </Button>
        </div>

        {applicationDetails.paymentEntries.map(
          (payment: any, index: number) => (
            <div key={index} className="border rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-medium">Payment {index + 1}</span>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => removePaymentEntry(index)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-sm">Method</Label>
                  <Select
                    value={payment.method}
                    onValueChange={(value) => {
                      const updated = [...applicationDetails.paymentEntries];
                      updated[index].method = value;
                      setApplicationDetails((prev) => ({
                        ...prev,
                        paymentEntries: updated,
                      }));
                    }}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Bank Transfer">
                        Bank Transfer
                      </SelectItem>
                      <SelectItem value="Credit Card">Credit Card</SelectItem>
                      <SelectItem value="Cash">Cash</SelectItem>
                      <SelectItem value="Cheque">Cheque</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-sm">Amount</Label>
                  <Input
                    type="number"
                    value={payment.amount}
                    onChange={(e) => {
                      const updated = [...applicationDetails.paymentEntries];
                      updated[index].amount = Number(e.target.value);
                      setApplicationDetails((prev) => ({
                        ...prev,
                        paymentEntries: updated,
                      }));
                    }}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label className="text-sm">Date</Label>
                  <Input
                    type="date"
                    value={payment.date}
                    onChange={(e) => {
                      const updated = [...applicationDetails.paymentEntries];
                      updated[index].date = e.target.value;
                      setApplicationDetails((prev) => ({
                        ...prev,
                        paymentEntries: updated,
                      }));
                    }}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label className="text-sm">Status</Label>
                  <Select
                    value={payment.status}
                    onValueChange={(value) => {
                      const updated = [...applicationDetails.paymentEntries];
                      updated[index].status = value;
                      setApplicationDetails((prev) => ({
                        ...prev,
                        paymentEntries: updated,
                      }));
                    }}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Pending">Pending</SelectItem>
                      <SelectItem value="Completed">Completed</SelectItem>
                      <SelectItem value="Failed">Failed</SelectItem>
                      <SelectItem value="Refunded">Refunded</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label className="text-sm">Reference No.</Label>
                <Input
                  value={payment.reference}
                  onChange={(e) => {
                    const updated = [...applicationDetails.paymentEntries];
                    updated[index].reference = e.target.value;
                    setApplicationDetails((prev) => ({
                      ...prev,
                      paymentEntries: updated,
                    }));
                  }}
                  className="mt-1"
                  placeholder="Transaction reference"
                />
              </div>

              <div>
                <Label className="text-sm">Receipt Upload</Label>
                <ReceiptUpload
                  existingReceipt={payment.receipt}
                  applicationId={applicationId}
                  customerId={customerId}
                  onReceiptChange={(file, existingUrl) => {
                    const updated = [...applicationDetails.paymentEntries];
                    if (file) {
                      // Handle new file upload - in a real app, you'd upload to server here
                      updated[index].receipt = file.name; // For now, just store filename
                    } else if (existingUrl !== undefined) {
                      // Handle existing URL removal or new URL
                      updated[index].receipt = existingUrl;
                    }
                    setApplicationDetails((prev) => ({
                      ...prev,
                      paymentEntries: updated,
                    }));
                  }}
                />
              </div>

              <div>
                <Label className="text-sm">Notes</Label>
                <Textarea
                  value={payment.notes}
                  onChange={(e) => {
                    const updated = [...applicationDetails.paymentEntries];
                    updated[index].notes = e.target.value;
                    setApplicationDetails((prev) => ({
                      ...prev,
                      paymentEntries: updated,
                    }));
                  }}
                  className="mt-1 min-h-[60px]"
                  placeholder="Additional notes..."
                />
              </div>
            </div>
          )
        )}
      </div>
    </div>
  );
};

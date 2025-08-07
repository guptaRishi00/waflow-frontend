import React from "react";
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
import { Plus, Trash2, Upload } from "lucide-react";

interface EditSectionModalProps {
  title: string;
  children: React.ReactNode;
  trigger: React.ReactNode;
}

export const EditSectionModal: React.FC<EditSectionModalProps> = ({
  title,
  children,
  trigger,
}) => {
  return (
    <Dialog>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit {title}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">{children}</div>
      </DialogContent>
    </Dialog>
  );
};

interface ApplicationInfoFormProps {
  applicationDetails: any;
  setApplicationDetails: React.Dispatch<React.SetStateAction<any>>;
}

export const ApplicationInfoForm: React.FC<ApplicationInfoFormProps> = ({
  applicationDetails,
  setApplicationDetails,
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
            <SelectItem value="freezone">Free Zone</SelectItem>
            <SelectItem value="mainland">Mainland</SelectItem>
            <SelectItem value="offshore">Offshore</SelectItem>
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
            <SelectItem value="Ras Al Khaimah">Ras Al Khaimah</SelectItem>
            <SelectItem value="Fujairah">Fujairah</SelectItem>
            <SelectItem value="Umm Al Quwain">Umm Al Quwain</SelectItem>
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
            <SelectItem value="FZE">FZE</SelectItem>
            <SelectItem value="FZCO">FZCO</SelectItem>
            <SelectItem value="Branch">Branch</SelectItem>
            <SelectItem value="Representative Office">
              Representative Office
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label>Assigned Agent</Label>
        <Select
          value={applicationDetails.assignedAgent}
          onValueChange={(value) =>
            setApplicationDetails((prev) => ({ ...prev, assignedAgent: value }))
          }
        >
          <SelectTrigger className="mt-1">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Agent Smith">Agent Smith</SelectItem>
            <SelectItem value="Agent Johnson">Agent Johnson</SelectItem>
            <SelectItem value="Agent Williams">Agent Williams</SelectItem>
          </SelectContent>
        </Select>
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
          className="mt-1 min-h-[80px]"
          placeholder="Add general notes about the application..."
        />
      </div>
    </div>
  );
};

export const CustomerInfoForm: React.FC<ApplicationInfoFormProps> = ({
  applicationDetails,
  setApplicationDetails,
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
            <SelectItem value="Virtual Office">Virtual Office</SelectItem>
            <SelectItem value="Physical Office">Physical Office</SelectItem>
            <SelectItem value="Flexi Desk">Flexi Desk</SelectItem>
            <SelectItem value="Dedicated Desk">Dedicated Desk</SelectItem>
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
            <SelectItem value="Shared">Shared</SelectItem>
            <SelectItem value="Private">Private</SelectItem>
            <SelectItem value="Executive">Executive</SelectItem>
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

export const PaymentDetailsForm: React.FC<ApplicationInfoFormProps> = ({
  applicationDetails,
  setApplicationDetails,
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
                <div className="border-2 border-dashed border-gray-300 rounded p-3 text-center mt-1">
                  <Upload className="h-6 w-6 mx-auto text-gray-400 mb-2" />
                  <p className="text-sm text-gray-500">Upload receipt</p>
                </div>
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

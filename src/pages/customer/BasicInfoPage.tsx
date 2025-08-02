import React, { useState } from "react";
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
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useToast } from "@/hooks/use-toast";
import { Edit, Save, X, Upload, Eye, Trash2 } from "lucide-react";
import { FileUpload } from "@/components/customer/FileUpload";
import { BasicInfoForm } from "@/components/customer/BasicInfoForm";
import axios from "axios";
import { useSelector } from "react-redux";
import { RootState } from "@/app/store";

export interface BasicInfoData {
  // Personal Details
  firstName: string;
  middleName: string;
  lastName: string;
  dob: string;
  gender: string;
  nationality: string;

  // Contact Details
  email: string;
  phoneNumber: string;

  // Address Details
  address: {
    line1: string;
    line2: string;
    city: string;
    state: string;
    country: string;
    zipcode: string;
  };

  // Government IDs
  emiratesIdNumber: string;
  passportNumber: string;
}

const emptyBasicInfo: BasicInfoData = {
  firstName: "",
  middleName: "",
  lastName: "",
  dob: "",
  gender: "",
  nationality: "",
  email: "",
  phoneNumber: "",
  address: {
    line1: "",
    line2: "",
    city: "",
    state: "",
    country: "",
    zipcode: "",
  },
  emiratesIdNumber: "",
  passportNumber: "",
};

export const BasicInfoPage: React.FC = () => {
  const { user, token } = useSelector((state: RootState) => state.customerAuth);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<BasicInfoData | null>(null);
  const [originalData, setOriginalData] = useState<BasicInfoData | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  // Helper function to create a File object from document data
  const createFileFromDocument = async (document: any): Promise<File> => {
    // Create a blob from the file URL
    const response = await fetch(document.fileUrl);
    const blob = await response.blob();

    // Create a File object with the original filename
    return new File([blob], document.documentName || "document", {
      type: blob.type,
    });
  };

  // Fetch user data on mount
  React.useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch customer profile data using customerId
        const response = await axios.get(
          `${import.meta.env.VITE_BASE_URL}/api/user/customer`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        // Map backend fields to BasicInfoData
        const data = response.data.data;
        const mapped: BasicInfoData = {
          firstName: data.firstName || "",
          middleName: data.middleName || "",
          lastName: data.lastName || "",
          dob: data.dob ? new Date(data.dob).toISOString().slice(0, 10) : "",
          gender: data.gender || "",
          nationality: data.nationality || "",
          email: data.email || "",
          phoneNumber: data.phoneNumber || "",
          address: {
            line1: data.address?.line1 || "",
            line2: data.address?.line2 || "",
            city: data.address?.city || "",
            state: data.address?.state || "",
            country: data.address?.country || "",
            zipcode: data.address?.zipcode || "",
          },
          emiratesIdNumber: data.emiratesIdNumber || "",
          passportNumber: data.passportNumber || "",
        };

        setFormData(mapped);
        setOriginalData(mapped);
      } catch (err) {
        toast({
          title: "Error",
          description: "Failed to load profile info.",
          variant: "destructive",
        });
        setFormData(emptyBasicInfo);
        setOriginalData(emptyBasicInfo);
      }
    };
    if (user && token) fetchData();
  }, [user, token, toast]);

  console.log("BasicInfoPage User:", user);

  const handleEdit = () => {
    if (formData) setOriginalData({ ...formData });
    setIsEditing(true);
  };

  const handleSave = async () => {
    const errors = validateForm(formData);
    if (errors.length > 0) {
      toast({
        title: "Validation Error",
        description: errors.join(", "),
        variant: "destructive",
      });
      return;
    }
    setIsSaving(true);
    try {
      // Update the customer profile using customerId
      await axios.put(
        `${import.meta.env.VITE_BASE_URL}/api/customer/${user.customerId}`,
        formData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      toast({
        title: "Success",
        description: "Basic information updated successfully!",
      });
      setIsEditing(false);
    } catch (error: any) {
      console.error("Error updating basic info:", error);
      toast({
        title: "Error",
        description:
          error?.response?.data?.message ||
          "Failed to update basic information",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    if (originalData) setFormData({ ...originalData });
    setIsEditing(false);
  };

  const validateForm = (data: BasicInfoData): string[] => {
    const errors: string[] = [];

    // Required fields validation
    if (!data.firstName?.trim()) {
      errors.push("First name is required");
    }
    if (!data.lastName?.trim()) {
      errors.push("Last name is required");
    }
    if (!data.dob) {
      errors.push("Date of birth is required");
    }
    if (!data.gender) {
      errors.push("Gender is required");
    }
    if (!data.nationality?.trim()) {
      errors.push("Nationality is required");
    }
    if (!data.email?.trim()) {
      errors.push("Email is required");
    }
    if (!data.phoneNumber?.trim()) {
      errors.push("Phone number is required");
    }
    if (!data.passportNumber?.trim()) {
      errors.push("Passport number is required");
    }

    // Address validation
    if (!data.address.line1?.trim()) {
      errors.push("Address line 1 is required");
    }
    if (!data.address.city?.trim()) {
      errors.push("City is required");
    }
    if (!data.address.state?.trim()) {
      errors.push("State is required");
    }
    if (!data.address.country?.trim()) {
      errors.push("Country is required");
    }
    if (!data.address.zipcode?.trim()) {
      errors.push("Zipcode is required");
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (data.email && !emailRegex.test(data.email)) {
      errors.push("Invalid email format");
    }

    // Phone number validation (7-15 digits)
    const phoneRegex = /^\d{7,15}$/;
    if (data.phoneNumber && !phoneRegex.test(data.phoneNumber)) {
      errors.push("Phone number must be 7 to 15 digits");
    }

    // Passport number validation (alphanumeric)
    const passportRegex = /^[a-zA-Z0-9]*$/;
    if (data.passportNumber && !passportRegex.test(data.passportNumber)) {
      errors.push("Passport number must be alphanumeric");
    }

    // Emirates ID validation (alphanumeric, optional)
    if (data.emiratesIdNumber) {
      const emiratesIdRegex = /^[a-zA-Z0-9]*$/;
      if (!emiratesIdRegex.test(data.emiratesIdNumber)) {
        errors.push("Emirates ID must be alphanumeric");
      }
    }

    // Name validation (alphabets only)
    const nameRegex = /^[A-Za-z\s]+$/;
    if (data.firstName && !nameRegex.test(data.firstName)) {
      errors.push("First name should contain alphabets only");
    }
    if (data.lastName && !nameRegex.test(data.lastName)) {
      errors.push("Last name should contain alphabets only");
    }
    if (data.middleName && !nameRegex.test(data.middleName)) {
      errors.push("Middle name should contain alphabets only");
    }

    return errors;
  };

  const handleFileUpload = (
    field: keyof BasicInfoData,
    file: File | undefined
  ) => {
    if (!formData) return;
    setFormData((prev) => (prev ? { ...prev, [field]: file } : prev));
  };

  if (!formData) {
    return (
      <div className="p-8 text-center text-lg text-muted-foreground">
        Loading profile...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Basic Information
          </h1>
          <p className="text-gray-600 mt-1">
            Manage your personal and business details
          </p>
        </div>
        {!isEditing ? (
          <Button
            onClick={handleEdit}
            className="bg-[#0b1d9b] hover:bg-[#0b1d9b]/90"
          >
            <Edit className="w-4 h-4 mr-2" />
            Edit
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button
              onClick={handleSave}
              disabled={isSaving}
              className="bg-[#ffb200] hover:bg-[#ffb200]/90 text-black disabled:opacity-50"
            >
              {isSaving ? (
                <>
                  <div className="w-4 h-4 mr-2 border-2 border-black border-t-transparent rounded-full animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save
                </>
              )}
            </Button>
            <Button onClick={handleCancel} variant="outline">
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
          </div>
        )}
      </div>
      <BasicInfoForm
        data={formData}
        isEditing={isEditing}
        onDataChange={setFormData}
        onFileUpload={handleFileUpload}
      />
    </div>
  );
};

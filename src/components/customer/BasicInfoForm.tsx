import React from "react";
import { Card, CardContent } from "@/components/ui/card";
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
import { BasicInfoData } from "@/pages/customer/BasicInfoPage";
import { FileUpload } from "./FileUpload";
import { User, MapPin, CreditCard, Building, Users } from "lucide-react";

interface BasicInfoFormProps {
  data: BasicInfoData;
  isEditing: boolean;
  onDataChange: (data: BasicInfoData) => void;
  onFileUpload: (field: keyof BasicInfoData, file: File | undefined) => void;
}

export const BasicInfoForm: React.FC<BasicInfoFormProps> = ({
  data,
  isEditing,
  onDataChange,
  onFileUpload,
}) => {
  const handleInputChange = (field: keyof BasicInfoData, value: string) => {
    onDataChange({
      ...data,
      [field]: value,
    });
  };

  const handleAddressChange = (field: string, value: string) => {
    onDataChange({
      ...data,
      address: {
        ...data.address,
        [field]: value,
      },
    });
  };

  const renderField = (
    label: string,
    field: keyof BasicInfoData,
    type: "text" | "email" | "tel" | "date" | "select" = "text",
    options?: string[]
  ) => {
    const value = data[field] as string;

    if (!isEditing) {
      return (
        <div className="space-y-2">
          <Label className="text-sm font-medium text-gray-700">{label}</Label>
          <div className="p-3 bg-gray-50 rounded-md border">
            {type === "date"
              ? new Date(value).toLocaleDateString()
              : value || "Not provided"}
          </div>
        </div>
      );
    }

    if (type === "select") {
      return (
        <div className="space-y-2">
          <Label htmlFor={field}>{label}</Label>
          <Select
            value={value}
            onValueChange={(val) => handleInputChange(field, val)}
          >
            <SelectTrigger>
              <SelectValue placeholder={`Select ${label.toLowerCase()}`} />
            </SelectTrigger>
            <SelectContent>
              {options?.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      );
    }

    return (
      <div className="space-y-2">
        <Label htmlFor={field}>{label}</Label>
        <Input
          id={field}
          type={type}
          value={value}
          onChange={(e) => handleInputChange(field, e.target.value)}
        />
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Personal Details */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {renderField("First Name", "firstName")}
            {renderField("Middle Name", "middleName")}
            {renderField("Last Name", "lastName")}
            {renderField("Date of Birth", "dob", "date")}
            {renderField("Gender", "gender", "select", [
              "male",
              "female",
              "other",
            ])}
            {renderField("Nationality", "nationality")}
          </div>
        </CardContent>
      </Card>

      {/* Contact Details */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {renderField("Email", "email", "email")}
            {renderField("Phone Number", "phoneNumber", "tel")}
          </div>
        </CardContent>
      </Card>

      {/* Address Details */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="addressLine1">Address Line 1</Label>
              {isEditing ? (
                <Input
                  id="addressLine1"
                  value={data.address.line1}
                  onChange={(e) => handleAddressChange("line1", e.target.value)}
                />
              ) : (
                <div className="p-3 bg-gray-50 rounded-md border">
                  {data.address.line1 || "Not provided"}
                </div>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="addressLine2">Address Line 2</Label>
              {isEditing ? (
                <Input
                  id="addressLine2"
                  value={data.address.line2}
                  onChange={(e) => handleAddressChange("line2", e.target.value)}
                />
              ) : (
                <div className="p-3 bg-gray-50 rounded-md border">
                  {data.address.line2 || "Not provided"}
                </div>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="addressCity">City</Label>
              {isEditing ? (
                <Input
                  id="addressCity"
                  value={data.address.city}
                  onChange={(e) => handleAddressChange("city", e.target.value)}
                />
              ) : (
                <div className="p-3 bg-gray-50 rounded-md border">
                  {data.address.city || "Not provided"}
                </div>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="addressState">State</Label>
              {isEditing ? (
                <Input
                  id="addressState"
                  value={data.address.state}
                  onChange={(e) => handleAddressChange("state", e.target.value)}
                />
              ) : (
                <div className="p-3 bg-gray-50 rounded-md border">
                  {data.address.state || "Not provided"}
                </div>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="addressCountry">Country</Label>
              {isEditing ? (
                <Input
                  id="addressCountry"
                  value={data.address.country}
                  onChange={(e) =>
                    handleAddressChange("country", e.target.value)
                  }
                />
              ) : (
                <div className="p-3 bg-gray-50 rounded-md border">
                  {data.address.country || "Not provided"}
                </div>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="addressZipcode">Zipcode</Label>
              {isEditing ? (
                <Input
                  id="addressZipcode"
                  value={data.address.zipcode}
                  onChange={(e) =>
                    handleAddressChange("zipcode", e.target.value)
                  }
                />
              ) : (
                <div className="p-3 bg-gray-50 rounded-md border">
                  {data.address.zipcode || "Not provided"}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Government IDs */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {renderField("Emirates ID Number", "emiratesIdNumber")}
            {renderField("Passport Number", "passportNumber")}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

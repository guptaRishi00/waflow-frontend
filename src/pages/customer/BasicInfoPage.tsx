
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { useToast } from '@/hooks/use-toast';
import { Edit, Save, X, Upload, Eye, Trash2 } from 'lucide-react';
import { FileUpload } from '@/components/customer/FileUpload';
import { BasicInfoForm } from '@/components/customer/BasicInfoForm';
import axios from "axios";
import { useSelector } from "react-redux";
import { RootState } from "@/app/store";

export interface BasicInfoData {
  // Personal Details
  customerName: string;
  nationality: string;
  dateOfBirth: string;
  gender: string;
  phoneNumber: string;
  emailAddress: string;
  
  // Address Details
  permanentAddress: string;
  countryOfResidence: string;
  localAddress: string;
  localProof?: File;
  
  // Passport & ID
  passportNumber: string;
  passportExpiry: string;
  emiratesId: string;
  residenceVisa: string;
  passportPhoto?: File;
  
  // Financials
  sourceOfFund: string;
  bankStatement?: File;
  quotedPrice: string;
  paymentDetails: string;
  
  // Company Details
  companyTypePreference: string;
  businessActivity: string[];
  companyNameOptions: string[];
  officeType: string;
  companyJurisdiction: string;
  finalCompanyName: string;
  
  // Investor Info
  investorName: string;
  numberOfInvestors: string;
  investorPercentage: string;
  role: string;
}

const emptyBasicInfo: BasicInfoData = {
  customerName: '',
  nationality: '',
  dateOfBirth: '',
  gender: '',
  phoneNumber: '',
  emailAddress: '',
  permanentAddress: '',
  countryOfResidence: '',
  localAddress: '',
  localProof: undefined,
  passportNumber: '',
  passportExpiry: '',
  emiratesId: '',
  residenceVisa: '',
  passportPhoto: undefined,
  sourceOfFund: '',
  bankStatement: undefined,
  quotedPrice: '',
  paymentDetails: '',
  companyTypePreference: '',
  businessActivity: [],
  companyNameOptions: [],
  officeType: '',
  companyJurisdiction: '',
  finalCompanyName: '',
  investorName: '',
  investorPercentage: '',
  numberOfInvestors: '',
  role: '',
};

export const BasicInfoPage: React.FC = () => {
  const { user, token } = useSelector((state: RootState) => state.customerAuth);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<BasicInfoData | null>(null);
  const [originalData, setOriginalData] = useState<BasicInfoData | null>(null);
  const { toast } = useToast();

  // Fetch user data on mount
  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_BASE_URL}/api/user/customer/profile/${user.userId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        // Map backend fields to BasicInfoData
        const data = response.data.data;
        const mapped: BasicInfoData = {
          customerName: [data.firstName, data.middleName, data.lastName].filter(Boolean).join(' '),
          nationality: data.nationality || '',
          dateOfBirth: data.dob ? new Date(data.dob).toISOString().slice(0, 10) : '',
          gender: data.gender || '',
          phoneNumber: data.phoneNumber || '',
          emailAddress: data.email || '',
          permanentAddress: data.permanentAddress || '',
          countryOfResidence: data.countryOfResidence || '',
          localAddress: data.currentAddress || '',
          passportNumber: data.passportNumber || '',
          passportExpiry: data.passportExpiry || '',
          emiratesId: data.emiratesId || '',
          residenceVisa: data.residenceVisa || '',
          sourceOfFund: data.sourceOfFund || '',
          quotedPrice: data.quotedPrice ? String(data.quotedPrice) : '',
          paymentDetails: data.paymentDetails || '',
          companyTypePreference: data.companyType || '',
          businessActivity: [data.businessActivity1].filter(Boolean),
          companyNameOptions: [],
          officeType: data.officeType || '',
          companyJurisdiction: data.jurisdiction || '',
          finalCompanyName: '',
          investorName: '',
          numberOfInvestors: data.numberOfInvestors ? String(data.numberOfInvestors) : '',
          investorPercentage: '',
          role: data.role || '',
        };
        setFormData(mapped);
        setOriginalData(mapped);
      } catch (err) {
        toast({
          title: "Error",
          description: "Failed to load profile info.",
          variant: "destructive"
        });
        setFormData(emptyBasicInfo); // <-- Set empty form so user can edit
        setOriginalData(emptyBasicInfo);
      }
    };
    if (user && token) fetchData();
  }, [user, token, toast]);

  const handleEdit = () => {
    if (formData) setOriginalData({ ...formData });
    setIsEditing(true);
  };

  const handleSave = async () => {
    if (!formData) return;
    // Validation
    const errors = validateForm(formData);
    if (errors.length > 0) {
      toast({
        title: "Validation Error",
        description: errors.join(', '),
        variant: "destructive"
      });
      return;
    }
    try {
      await axios.put(
        `${import.meta.env.VITE_BASE_URL}/api/application/onboarding/${user.userId}`,
        formData,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      setIsEditing(false);
      toast({
        title: "Success",
        description: "Basic Info Updated Successfully",
      });
    } catch (err: any) {
      toast({
        title: "Error",
        description: err?.response?.data?.message || "Failed to update info.",
        variant: "destructive"
      });
    }
  };

  const handleCancel = () => {
    if (originalData) setFormData({ ...originalData });
    setIsEditing(false);
  };

  const validateForm = (data: BasicInfoData): string[] => {
    const errors: string[] = [];
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.emailAddress)) {
      errors.push('Invalid email format');
    }
    
    // Phone validation
    const phoneRegex = /^\+?[\d\s-]{10,15}$/;
    if (!phoneRegex.test(data.phoneNumber)) {
      errors.push('Phone number must be 10-15 digits');
    }
    
    // Passport expiry validation
    const today = new Date();
    const expiryDate = new Date(data.passportExpiry);
    if (expiryDate <= today) {
      errors.push('Passport expiry must be a future date');
    }
    
    // Company names validation
    data.companyNameOptions.forEach((name, index) => {
      if (name.length < 3) {
        errors.push(`Company name option ${index + 1} must be at least 3 characters`);
      }
    });
    
    return errors;
  };

  const handleFileUpload = (field: keyof BasicInfoData, file: File | undefined) => {
    if (!formData) return;
    setFormData(prev => prev ? { ...prev, [field]: file } : prev);
  };

  if (!formData) {
    return <div className="p-8 text-center text-lg text-muted-foreground">Loading profile...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Basic Information</h1>
          <p className="text-gray-600 mt-1">Manage your personal and business details</p>
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
              className="bg-[#ffb200] hover:bg-[#ffb200]/90 text-black"
            >
              <Save className="w-4 h-4 mr-2" />
              Save
            </Button>
            <Button 
              onClick={handleCancel}
              variant="outline"
            >
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


import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { BasicInfoData } from '@/pages/customer/BasicInfoPage';
import { FileUpload } from './FileUpload';
import { User, MapPin, CreditCard, Building, Users } from 'lucide-react';

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
  onFileUpload
}) => {
  const handleInputChange = (field: keyof BasicInfoData, value: string | string[]) => {
    onDataChange({
      ...data,
      [field]: value
    });
  };

  const handleCompanyNameChange = (index: number, value: string) => {
    const newOptions = [...data.companyNameOptions];
    newOptions[index] = value;
    onDataChange({
      ...data,
      companyNameOptions: newOptions
    });
  };

  const handleBusinessActivityChange = (activity: string) => {
    const currentActivities = data.businessActivity || [];
    const newActivities = currentActivities.includes(activity)
      ? currentActivities.filter(a => a !== activity)
      : [...currentActivities, activity];
    
    onDataChange({
      ...data,
      businessActivity: newActivities
    });
  };

  const renderField = (
    label: string,
    field: keyof BasicInfoData,
    type: 'text' | 'email' | 'tel' | 'date' | 'textarea' | 'select' = 'text',
    options?: string[]
  ) => {
    const value = data[field] as string;
    
    if (!isEditing) {
      return (
        <div className="space-y-2">
          <Label className="text-sm font-medium text-gray-700">{label}</Label>
          <div className="p-3 bg-gray-50 rounded-md border">
            {type === 'date' ? new Date(value).toLocaleDateString() : value || 'Not provided'}
          </div>
        </div>
      );
    }

    if (type === 'textarea') {
      return (
        <div className="space-y-2">
          <Label htmlFor={field}>{label}</Label>
          <Textarea
            id={field}
            value={value}
            onChange={(e) => handleInputChange(field, e.target.value)}
            className="min-h-[80px]"
          />
        </div>
      );
    }

    if (type === 'select' && options) {
      return (
        <div className="space-y-2">
          <Label htmlFor={field}>{label}</Label>
          <Select value={value} onValueChange={(val) => handleInputChange(field, val)}>
            <SelectTrigger>
              <SelectValue placeholder={`Select ${label.toLowerCase()}`} />
            </SelectTrigger>
            <SelectContent>
              {options.map(option => (
                <SelectItem key={option} value={option}>{option}</SelectItem>
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
    <Card>
      <CardContent className="p-6">
        <Accordion type="multiple" defaultValue={["personal", "address", "passport", "financial", "company", "investor"]} className="space-y-4">
          
          {/* Personal Details */}
          <AccordionItem value="personal" className="border rounded-lg">
            <AccordionTrigger className="px-4 py-3 hover:no-underline">
              <div className="flex items-center gap-3">
                <User className="w-5 h-5 text-[#0b1d9b]" />
                <span className="font-semibold">Personal Details</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-4 pb-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {renderField('Customer Name', 'customerName')}
                {renderField('Nationality', 'nationality')}
                {renderField('Date of Birth', 'dateOfBirth', 'date')}
                {renderField('Gender', 'gender', 'select', ['Male', 'Female', 'Other'])}
                {renderField('Phone Number', 'phoneNumber', 'tel')}
                {renderField('Email Address', 'emailAddress', 'email')}
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Address Details */}
          <AccordionItem value="address" className="border rounded-lg">
            <AccordionTrigger className="px-4 py-3 hover:no-underline">
              <div className="flex items-center gap-3">
                <MapPin className="w-5 h-5 text-[#0b1d9b]" />
                <span className="font-semibold">Address Details</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-4 pb-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {renderField('Permanent Address', 'permanentAddress', 'textarea')}
                {renderField('Country of Residence', 'countryOfResidence')}
                {renderField('Local Address', 'localAddress', 'textarea')}
                <div className="md:col-span-1">
                  <FileUpload
                    label="Local Proof"
                    file={data.localProof}
                    onFileChange={(file) => onFileUpload('localProof', file)}
                    disabled={!isEditing}
                  />
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Passport & ID */}
          <AccordionItem value="passport" className="border rounded-lg">
            <AccordionTrigger className="px-4 py-3 hover:no-underline">
              <div className="flex items-center gap-3">
                <CreditCard className="w-5 h-5 text-[#0b1d9b]" />
                <span className="font-semibold">Passport & ID</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-4 pb-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {renderField('Passport Number', 'passportNumber')}
                {renderField('Passport Expiry', 'passportExpiry', 'date')}
                {renderField('Emirates ID', 'emiratesId')}
                {renderField('Residence Visa', 'residenceVisa')}
                <div className="md:col-span-2">
                  <FileUpload
                    label="Passport Photo"
                    file={data.passportPhoto}
                    onFileChange={(file) => onFileUpload('passportPhoto', file)}
                    disabled={!isEditing}
                    accept="image/*"
                  />
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Financial Details */}
          <AccordionItem value="financial" className="border rounded-lg">
            <AccordionTrigger className="px-4 py-3 hover:no-underline">
              <div className="flex items-center gap-3">
                <CreditCard className="w-5 h-5 text-[#ffb200]" />
                <span className="font-semibold">Financial Details</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-4 pb-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {renderField('Source of Fund', 'sourceOfFund', 'textarea')}
                {renderField('Quoted Price (AED)', 'quotedPrice')}
                {renderField('Payment Details', 'paymentDetails', 'textarea')}
                <div>
                  <FileUpload
                    label="Bank Statement"
                    file={data.bankStatement}
                    onFileChange={(file) => onFileUpload('bankStatement', file)}
                    disabled={!isEditing}
                    accept=".pdf"
                  />
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Company Details */}
          <AccordionItem value="company" className="border rounded-lg">
            <AccordionTrigger className="px-4 py-3 hover:no-underline">
              <div className="flex items-center gap-3">
                <Building className="w-5 h-5 text-[#0b1d9b]" />
                <span className="font-semibold">Company Details</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-4 pb-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {renderField('Company Type Preference', 'companyTypePreference', 'select', 
                  ['Mainland', 'Free Zone', 'Offshore'])}
                
                <div className="space-y-2">
                  <Label>Business Activity</Label>
                  {isEditing ? (
                    <div className="space-y-2">
                      {['Trading', 'Consulting', 'Manufacturing', 'Services', 'Technology', 'Real Estate'].map(activity => (
                        <label key={activity} className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={data.businessActivity?.includes(activity) || false}
                            onChange={() => handleBusinessActivityChange(activity)}
                            className="rounded border-gray-300"
                          />
                          <span className="text-sm">{activity}</span>
                        </label>
                      ))}
                    </div>
                  ) : (
                    <div className="p-3 bg-gray-50 rounded-md border">
                      {data.businessActivity?.join(', ') || 'Not selected'}
                    </div>
                  )}
                </div>

                <div className="md:col-span-2 space-y-3">
                  <Label>Company Name Options (3 choices)</Label>
                  {data.companyNameOptions.map((name, index) => (
                    <div key={index} className="space-y-2">
                      <Label className="text-sm">Option {index + 1}</Label>
                      {isEditing ? (
                        <Input
                          value={name}
                          onChange={(e) => handleCompanyNameChange(index, e.target.value)}
                          placeholder={`Company name option ${index + 1}`}
                        />
                      ) : (
                        <div className="p-3 bg-gray-50 rounded-md border">{name || 'Not provided'}</div>
                      )}
                    </div>
                  ))}
                </div>

                {renderField('Office Type', 'officeType', 'select', 
                  ['Shared Office', 'Private Office', 'Virtual Office', 'Warehouse'])}
                {renderField('Company Jurisdiction', 'companyJurisdiction')}
                {renderField('Final Company Name', 'finalCompanyName')}
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Investor Information */}
          <AccordionItem value="investor" className="border rounded-lg">
            <AccordionTrigger className="px-4 py-3 hover:no-underline">
              <div className="flex items-center gap-3">
                <Users className="w-5 h-5 text-[#ffb200]" />
                <span className="font-semibold">Investor Information</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-4 pb-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {renderField('Investor Name', 'investorName')}
                {renderField('Number of Investors', 'numberOfInvestors')}
                {renderField('Investor Percentage (%)', 'investorPercentage')}
                {renderField('Role', 'role', 'select', 
                  ['Managing Director', 'Director', 'Partner', 'Shareholder', 'Manager'])}
              </div>
            </AccordionContent>
          </AccordionItem>

        </Accordion>
      </CardContent>
    </Card>
  );
};

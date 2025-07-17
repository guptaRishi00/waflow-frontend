
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

interface BasicInfoStepProps {
  data: any;
  onUpdate: (data: any) => void;
}

export const BasicInfoStep: React.FC<BasicInfoStepProps> = ({ data, onUpdate }) => {
  const handleChange = (field: string, value: string) => {
    onUpdate({ [field]: value });
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="customerName">Customer Name *</Label>
          <Input
            id="customerName"
            value={data.customerName || ''}
            onChange={(e) => handleChange('customerName', e.target.value)}
            placeholder="Enter full name"
            required
          />
        </div>
        
        <div>
          <Label htmlFor="nationality">Nationality</Label>
          <Input
            id="nationality"
            value={data.nationality || ''}
            onChange={(e) => handleChange('nationality', e.target.value)}
            placeholder="Enter nationality"
          />
        </div>
        
        <div>
          <Label htmlFor="dateOfBirth">Date of Birth</Label>
          <Input
            id="dateOfBirth"
            type="date"
            value={data.dateOfBirth || ''}
            onChange={(e) => handleChange('dateOfBirth', e.target.value)}
          />
        </div>
        
        <div>
          <Label htmlFor="gender">Gender</Label>
          <Select value={data.gender || ''} onValueChange={(value) => handleChange('gender', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select gender" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Male">Male</SelectItem>
              <SelectItem value="Female">Female</SelectItem>
              <SelectItem value="Other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <Label htmlFor="phoneNumber">Phone Number *</Label>
          <Input
            id="phoneNumber"
            value={data.phoneNumber || ''}
            onChange={(e) => handleChange('phoneNumber', e.target.value)}
            placeholder="+971 50 123 4567"
            required
          />
        </div>
        
        <div>
          <Label htmlFor="emailAddress">Email Address *</Label>
          <Input
            id="emailAddress"
            type="email"
            value={data.emailAddress || ''}
            onChange={(e) => handleChange('emailAddress', e.target.value)}
            placeholder="email@example.com"
            required
          />
        </div>
      </div>
      
      <div>
        <Label htmlFor="permanentAddress">Permanent Address</Label>
        <Textarea
          id="permanentAddress"
          value={data.permanentAddress || ''}
          onChange={(e) => handleChange('permanentAddress', e.target.value)}
          placeholder="Enter permanent address"
          rows={3}
        />
      </div>
    </div>
  );
};

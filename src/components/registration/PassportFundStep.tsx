
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { FileUpload } from '@/components/customer/FileUpload';

interface PassportFundStepProps {
  data: any;
  onUpdate: (data: any) => void;
}

export const PassportFundStep: React.FC<PassportFundStepProps> = ({ data, onUpdate }) => {
  const handleChange = (field: string, value: string) => {
    onUpdate({ [field]: value });
  };

  const handleFileUpload = (field: string, file: File | undefined) => {
    onUpdate({ [field]: file });
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="passportNumber">Passport Number</Label>
          <Input
            id="passportNumber"
            value={data.passportNumber || ''}
            onChange={(e) => handleChange('passportNumber', e.target.value)}
            placeholder="Enter passport number"
          />
        </div>
        
        <div>
          <Label htmlFor="passportExpiry">Passport Expiry</Label>
          <Input
            id="passportExpiry"
            type="date"
            value={data.passportExpiry || ''}
            onChange={(e) => handleChange('passportExpiry', e.target.value)}
          />
        </div>
      </div>
      
      <div>
        <Label htmlFor="sourceOfFund">Source of Fund</Label>
        <Textarea
          id="sourceOfFund"
          value={data.sourceOfFund || ''}
          onChange={(e) => handleChange('sourceOfFund', e.target.value)}
          placeholder="Describe your source of funds"
          rows={3}
        />
      </div>
      
      <div>
        <Label>Bank Statement</Label>
        <FileUpload
          label="Upload Bank Statement"
          accept=".pdf,.jpg,.jpeg,.png"
          onFileChange={(file) => handleFileUpload('bankStatement', file)}
          file={data.bankStatement}
        />
      </div>
    </div>
  );
};


import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { FileUpload } from '@/components/customer/FileUpload';

interface ResidencyLocationStepProps {
  data: any;
  onUpdate: (data: any) => void;
}

export const ResidencyLocationStep: React.FC<ResidencyLocationStepProps> = ({ data, onUpdate }) => {
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
          <Label htmlFor="countryOfResidence">Country of Residence</Label>
          <Input
            id="countryOfResidence"
            value={data.countryOfResidence || ''}
            onChange={(e) => handleChange('countryOfResidence', e.target.value)}
            placeholder="Enter country of residence"
          />
        </div>
        
        <div>
          <Label htmlFor="companyJurisdiction">Company Jurisdiction</Label>
          <Input
            id="companyJurisdiction"
            value={data.companyJurisdiction || ''}
            onChange={(e) => handleChange('companyJurisdiction', e.target.value)}
            placeholder="Enter jurisdiction"
          />
        </div>
        
        <div>
          <Label htmlFor="emiratesId">Emirates ID</Label>
          <Input
            id="emiratesId"
            value={data.emiratesId || ''}
            onChange={(e) => handleChange('emiratesId', e.target.value)}
            placeholder="Enter Emirates ID number"
          />
        </div>
      </div>
      
      <div>
        <Label htmlFor="localAddress">Local Address</Label>
        <Textarea
          id="localAddress"
          value={data.localAddress || ''}
          onChange={(e) => handleChange('localAddress', e.target.value)}
          placeholder="Enter local address in UAE"
          rows={3}
        />
      </div>
      
      <div className="space-y-4">
        <div>
          <Label>Local Proof</Label>
          <FileUpload
            label="Upload Local Proof (Address/Utility Bill)"
            accept=".pdf,.jpg,.jpeg,.png"
            onFileChange={(file) => handleFileUpload('localProof', file)}
            file={data.localProof}
          />
        </div>
        
        <div>
          <Label>Residence Visa (Optional)</Label>
          <FileUpload
            label="Upload Residence Visa"
            accept=".pdf,.jpg,.jpeg,.png"
            onFileChange={(file) => handleFileUpload('residenceVisa', file)}
            file={data.residenceVisa}
          />
        </div>
        
        <div>
          <Label>Temporary Visa (Optional)</Label>
          <FileUpload
            label="Upload Temporary Visa"
            accept=".pdf,.jpg,.jpeg,.png"
            onFileChange={(file) => handleFileUpload('temporaryVisa', file)}
            file={data.temporaryVisa}
          />
        </div>
      </div>
    </div>
  );
};

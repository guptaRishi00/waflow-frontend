
import React from 'react';
import { Label } from '@/components/ui/label';
import { FileUpload } from '@/components/customer/FileUpload';

interface FinalUploadsStepProps {
  data: any;
  onUpdate: (data: any) => void;
}

export const FinalUploadsStep: React.FC<FinalUploadsStepProps> = ({ data, onUpdate }) => {
  const handleFileUpload = (field: string, file: File | undefined) => {
    onUpdate({ [field]: file });
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div>
          <Label>Passport Photo</Label>
          <FileUpload
            label="Upload Passport Photo"
            accept=".jpg,.jpeg,.png"
            onFileChange={(file) => handleFileUpload('passportPhoto', file)}
            file={data.passportPhoto}
          />
        </div>
        
        <div>
          <Label>Other Relevant ID (Optional)</Label>
          <FileUpload
            label="Upload Any Other Relevant Document"
            accept=".pdf,.jpg,.jpeg,.png"
            onFileChange={(file) => handleFileUpload('otherDocument', file)}
            file={data.otherDocument}
          />
        </div>
      </div>
    </div>
  );
};

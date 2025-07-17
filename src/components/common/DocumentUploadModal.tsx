
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { FileUpload } from '@/components/customer/FileUpload';
import { useToast } from '@/hooks/use-toast';

interface DocumentUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (document: any) => void;
  customerId?: string;
  applicationId?: string;
}

export const DocumentUploadModal: React.FC<DocumentUploadModalProps> = ({
  isOpen,
  onClose,
  onUpload,
  customerId,
  applicationId
}) => {
  const [formData, setFormData] = useState({
    fileName: '',
    category: '',
    description: '',
    file: null as File | null,
    customerId: customerId || '',
    applicationId: applicationId || ''
  });
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const handleFileChange = (file: File | undefined) => {
    setFormData(prev => ({
      ...prev,
      file: file || null,
      fileName: file ? file.name : ''
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.file || !formData.category || !formData.customerId) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields and select a file.",
        variant: "destructive"
      });
      return;
    }

    setIsUploading(true);

    try {
      // Simulate upload process
      setTimeout(() => {
        const newDocument = {
          id: `DOC-${Date.now()}`,
          fileName: formData.fileName,
          category: formData.category as any,
          uploadedAt: new Date().toISOString(),
          uploadedBy: 'agent' as const,
          uploaderName: 'Agent Smith', // In real app, get from auth context
          status: 'uploaded' as const,
          fileUrl: URL.createObjectURL(formData.file!),
          fileType: formData.file!.type.startsWith('image/') ? 'image' as const : 'pdf' as const,
          description: formData.description,
          customerId: formData.customerId,
          applicationId: formData.applicationId
        };

        onUpload(newDocument);
        
        toast({
          title: "Document Uploaded",
          description: `${formData.fileName} has been uploaded successfully and added to customer's Digilocker.`
        });

        // Reset form
        setFormData({
          fileName: '',
          category: '',
          description: '',
          file: null,
          customerId: customerId || '',
          applicationId: applicationId || ''
        });
        
        setIsUploading(false);
        onClose();
      }, 2000);
    } catch (error) {
      toast({
        title: "Upload Failed",
        description: "Failed to upload document. Please try again.",
        variant: "destructive"
      });
      setIsUploading(false);
    }
  };

  const handleClose = () => {
    if (!isUploading) {
      setFormData({
        fileName: '',
        category: '',
        description: '',
        file: null,
        customerId: customerId || '',
        applicationId: applicationId || ''
      });
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Upload Document</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="customerId">Customer ID *</Label>
            <Input
              id="customerId"
              value={formData.customerId}
              onChange={(e) => setFormData(prev => ({ ...prev, customerId: e.target.value }))}
              placeholder="Enter customer ID"
              required
            />
          </div>

          <div>
            <Label htmlFor="applicationId">Application ID</Label>
            <Input
              id="applicationId"
              value={formData.applicationId}
              onChange={(e) => setFormData(prev => ({ ...prev, applicationId: e.target.value }))}
              placeholder="Enter application ID (optional)"
            />
          </div>

          <div>
            <Label htmlFor="category">Document Category *</Label>
            <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="passport">Passport</SelectItem>
                <SelectItem value="photo">Photo</SelectItem>
                <SelectItem value="visa">Visa</SelectItem>
                <SelectItem value="government">Government Document</SelectItem>
                <SelectItem value="invoice">Invoice</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <FileUpload
              label="Select Document"
              file={formData.file}
              onFileChange={handleFileChange}
              accept=".pdf,.jpg,.jpeg,.png"
            />
          </div>

          <div>
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Add a description for this document"
              rows={3}
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={handleClose} disabled={isUploading}>
              Cancel
            </Button>
            <Button type="submit" disabled={isUploading}>
              {isUploading ? 'Uploading...' : 'Upload Document'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};


import React, { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Upload, Eye, Trash2, FileText, Image } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface FileUploadProps {
  label: string;
  file?: File;
  onFileChange: (file: File | undefined) => void;
  disabled?: boolean;
  accept?: string;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  label,
  file,
  onFileChange,
  disabled = false,
  accept = '.jpg,.jpeg,.png,.pdf'
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const { toast } = useToast();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    
    if (!selectedFile) return;

    // Validate file size (5MB limit)
    if (selectedFile.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please select a file smaller than 5MB",
        variant: "destructive"
      });
      return;
    }

    // Validate file type
    const allowedTypes = accept.split(',').map(type => type.trim());
    const fileExtension = '.' + selectedFile.name.split('.').pop()?.toLowerCase();
    const mimeType = selectedFile.type;
    
    const isValidType = allowedTypes.some(type => 
      type.startsWith('.') ? fileExtension === type : mimeType.startsWith(type.replace('*', ''))
    );

    if (!isValidType) {
      toast({
        title: "Invalid file type",
        description: `Please select a file with one of these extensions: ${accept}`,
        variant: "destructive"
      });
      return;
    }

    onFileChange(selectedFile);

    // Create preview for images
    if (selectedFile.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => setPreviewUrl(e.target?.result as string);
      reader.readAsDataURL(selectedFile);
    } else {
      setPreviewUrl(null);
    }
  };

  const handleRemove = () => {
    onFileChange(undefined);
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handlePreview = () => {
    if (file) {
      const url = URL.createObjectURL(file);
      window.open(url, '_blank');
    }
  };

  const getFileIcon = (fileName: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    return extension === 'pdf' ? <FileText className="w-4 h-4" /> : <Image className="w-4 h-4" />;
  };

  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium text-gray-700">{label}</Label>
      
      {!disabled && !file && (
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-[#0b1d9b] transition-colors">
          <input
            ref={fileInputRef}
            type="file"
            accept={accept}
            onChange={handleFileSelect}
            className="hidden"
          />
          <Button
            type="button"
            variant="ghost"
            onClick={() => fileInputRef.current?.click()}
            className="w-full"
          >
            <Upload className="w-4 h-4 mr-2" />
            Upload {label}
          </Button>
          <p className="text-xs text-gray-500 mt-1">
            Max 5MB • {accept.replace(/\./g, '').toUpperCase()}
          </p>
        </div>
      )}

      {file && (
        <div className="border rounded-lg p-3 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {getFileIcon(file.name)}
              <div>
                <p className="text-sm font-medium text-gray-900">{file.name}</p>
                <p className="text-xs text-gray-500">
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-1">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handlePreview}
              >
                <Eye className="w-4 h-4" />
              </Button>
              {!disabled && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleRemove}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>

          {previewUrl && (
            <div className="mt-3">
              <img 
                src={previewUrl} 
                alt="Preview" 
                className="max-w-full h-32 object-cover rounded border"
              />
            </div>
          )}
        </div>
      )}

      {!file && disabled && (
        <div className="p-3 bg-gray-50 rounded-md border text-gray-500 text-sm">
          No file uploaded
        </div>
      )}
    </div>
  );
};

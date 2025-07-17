import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, Download, Eye, FileText, Image, Trash2, Upload } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

interface DigilockerDocument {
  id: string;
  fileName: string;
  category: 'passport' | 'photo' | 'visa' | 'invoice' | 'government' | 'other';
  uploadedAt: string;
  uploadedBy: 'customer' | 'agent';
  uploaderName: string;
  status: 'uploaded' | 'verified' | 'rejected';
  fileUrl: string;
  fileType: 'pdf' | 'image';
  description?: string;
}

const mockDocuments: DigilockerDocument[] = [
  {
    id: '1',
    fileName: 'passport_copy.pdf',
    category: 'passport',
    uploadedAt: '2024-01-15',
    uploadedBy: 'customer',
    uploaderName: 'You',
    status: 'verified',
    fileUrl: '/placeholder-doc.pdf',
    fileType: 'pdf'
  },
  {
    id: '2',
    fileName: 'passport_photo.jpg',
    category: 'photo',
    uploadedAt: '2024-01-14',
    uploadedBy: 'customer',
    uploaderName: 'You',
    status: 'uploaded',
    fileUrl: '/placeholder-image.jpg',
    fileType: 'image'
  },
  {
    id: '3',
    fileName: 'emirates_id.pdf',
    category: 'government',
    uploadedAt: '2024-01-16',
    uploadedBy: 'agent',
    uploaderName: 'Agent Smith',
    status: 'verified',
    fileUrl: '/placeholder-doc.pdf',
    fileType: 'pdf',
    description: 'Emirates ID issued by government'
  },
  {
    id: '4',
    fileName: 'trade_license.pdf',
    category: 'government',
    uploadedAt: '2024-01-17',
    uploadedBy: 'agent',
    uploaderName: 'Agent Smith',
    status: 'verified',
    fileUrl: '/placeholder-doc.pdf',
    fileType: 'pdf',
    description: 'Trade License from DED'
  }
];

export const DigilockerPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [documents, setDocuments] = useState<DigilockerDocument[]>(mockDocuments);
  const [previewDoc, setPreviewDoc] = useState<DigilockerDocument | null>(null);

  // Listen for new documents uploaded by agents/managers
  useEffect(() => {
    // In a real app, this would be a WebSocket connection or polling
    // For now, we'll simulate checking for new documents
    const checkForNewDocuments = () => {
      // This would sync with the actual backend
      console.log('Checking for new documents uploaded by agents...');
    };

    const interval = setInterval(checkForNewDocuments, 30000); // Check every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.fileName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.uploaderName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || doc.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'verified': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-yellow-100 text-yellow-800';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'passport': return 'bg-blue-100 text-blue-800';
      case 'photo': return 'bg-purple-100 text-purple-800';
      case 'visa': return 'bg-indigo-100 text-indigo-800';
      case 'government': return 'bg-green-100 text-green-800';
      case 'invoice': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleDownload = (doc: DigilockerDocument) => {
    console.log('Downloading:', doc.fileName);
    // Implementation for download
  };

  const handleView = (doc: DigilockerDocument) => {
    setPreviewDoc(doc);
  };

  const handleDelete = (doc: DigilockerDocument) => {
    if (doc.uploadedBy === 'agent') return; // Cannot delete agent-uploaded docs
    console.log('Deleting:', doc.fileName);
    // Implementation for delete
  };

  const handleUpload = () => {
    console.log('Upload new document');
    // Implementation for upload
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Digilocker</h1>
          <p className="text-gray-600 mt-1">Manage and view all your documents</p>
        </div>
        <Button onClick={handleUpload} className="bg-primary hover:bg-primary/90">
          <Upload className="w-4 h-4 mr-2" />
          Upload Document
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search by filename or uploader..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="passport">Passport</SelectItem>
                <SelectItem value="photo">Photo</SelectItem>
                <SelectItem value="visa">Visa</SelectItem>
                <SelectItem value="government">Government</SelectItem>
                <SelectItem value="invoice">Invoice</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Documents Grid */}
      <div className="grid gap-4">
        {filteredDocuments.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <div className="text-gray-400 mb-4">
                <FileText className="w-12 h-12 mx-auto" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No documents found</h3>
              <p className="text-gray-600">Try adjusting your search or upload new documents</p>
            </CardContent>
          </Card>
        ) : (
          filteredDocuments.map(doc => (
            <Card key={doc.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex-shrink-0">
                      {doc.fileType === 'pdf' ? (
                        <FileText className="w-8 h-8 text-red-500" />
                      ) : (
                        <Image className="w-8 h-8 text-blue-500" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-gray-900">{doc.fileName}</h3>
                        <Badge className={getCategoryColor(doc.category)}>
                          {doc.category}
                        </Badge>
                        <Badge className={getStatusColor(doc.status)}>
                          {doc.status}
                        </Badge>
                        {doc.uploadedBy === 'agent' && (
                          <Badge variant="outline" className="bg-blue-50 text-blue-700">
                            Agent Uploaded
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span><strong>Uploaded by:</strong> {doc.uploaderName}</span>
                        <span><strong>Date:</strong> {new Date(doc.uploadedAt).toLocaleDateString()}</span>
                      </div>
                      {doc.description && (
                        <p className="text-sm text-gray-600 mt-1">{doc.description}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleView(doc)}
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          View
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-4xl max-h-[80vh] overflow-auto">
                        <DialogHeader>
                          <DialogTitle>{doc.fileName}</DialogTitle>
                        </DialogHeader>
                        <div className="mt-4">
                          {doc.fileType === 'pdf' ? (
                            <div className="w-full h-96 bg-gray-100 rounded-lg flex items-center justify-center">
                              <div className="text-center">
                                <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                                <p className="text-gray-600">PDF Preview</p>
                                <p className="text-sm text-gray-500 mt-2">{doc.fileName}</p>
                              </div>
                            </div>
                          ) : (
                            <img 
                              src={doc.fileUrl} 
                              alt={doc.fileName}
                              className="w-full max-h-96 object-contain rounded-lg"
                            />
                          )}
                        </div>
                      </DialogContent>
                    </Dialog>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDownload(doc)}
                    >
                      <Download className="w-4 h-4 mr-1" />
                      Download
                    </Button>
                    {doc.uploadedBy === 'customer' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(doc)}
                        className="hover:bg-red-50 hover:text-red-600"
                      >
                        <Trash2 className="w-4 h-4 mr-1" />
                        Delete
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Dialog as PreviewDialog, DialogContent as PreviewDialogContent, DialogHeader as PreviewDialogHeader, DialogTitle as PreviewDialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Separator } from '@/components/ui/separator';
import { 
  User, 
  FileText, 
  Building, 
  Users, 
  DollarSign, 
  MapPin, 
  Download,
  ExternalLink,
  StickyNote,
  Calendar,
  Phone,
  Mail,
  Globe,
  CreditCard,
  Eye,
  AlertCircle,
  CheckCircle,
  XCircle,
  Clock
} from 'lucide-react';
import { Application } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { NotesModule } from './NotesModule';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { RootState } from '@/app/store';

interface ApplicationDetailsModalProps {
  application: Application | null;
  isOpen: boolean;
  onClose: () => void;
}

interface CustomerDetails {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  nationality?: string;
  dob?: string;
  gender?: string;
  permanentAddress?: string;
  currentAddress?: string;
  countryOfResidence?: string;
  passportNumber?: string;
  passportExpiry?: string;
  emiratesId?: string;
  residenceVisa?: string;
  sourceOfFund?: string;
  quotedPrice?: string;
  paymentDetails?: string;
  companyType?: string;
  jurisdiction?: string;
  businessActivity1?: string;
  officeType?: string;
  numberOfInvestors?: number;
  role?: string;
}

interface Document {
  _id: string;
  documentName: string;
  documentType: string;
  status: 'not-uploaded' | 'uploaded' | 'verified' | 'rejected';
  fileUrl?: string;
  uploadedAt?: string;
  rejectionReason?: string;
}

export const ApplicationDetailsModal: React.FC<ApplicationDetailsModalProps> = ({
  application,
  isOpen,
  onClose,
}) => {
  const { toast } = useToast();
  const { token } = useSelector((state: RootState) => state.customerAuth);
  const [customerDetails, setCustomerDetails] = useState<CustomerDetails | null>(null);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewType, setPreviewType] = useState<'image' | 'pdf' | 'other' | null>(null);

  // Fetch customer details and documents when modal opens
  useEffect(() => {
    console.log('Modal opened, application:', application);
    console.log('Modal isOpen:', isOpen);
    if (isOpen && application) {
      console.log('Fetching data for customer:', application.customer?._id);
      console.log('Token available:', !!token);
      fetchCustomerDetails();
      fetchDocuments();
    }
  }, [isOpen, application]);

  const fetchCustomerDetails = async () => {
    console.log('fetchCustomerDetails called');
    if (!application?.customer?._id || !token) {
      console.log('Missing customer ID or token:', { 
        customerId: application?.customer?._id, 
        hasToken: !!token 
      });
      return;
    }
    
    setLoading(true);
    try {
      console.log('Making request to fetch customer details');
      const response = await axios.get(
        `http://localhost:5000/api/user/customer/profile`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      console.log('Customer details response:', response.data);
      setCustomerDetails(response.data.data);
    } catch (error) {
      console.error('Error fetching customer details:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDocuments = async () => {
    console.log('fetchDocuments called');
    if (!application?.customer?._id || !token) {
      console.log('Missing customer ID or token for documents:', { 
        customerId: application?.customer?._id, 
        hasToken: !!token 
      });
      return;
    }
    
    try {
      console.log('Making request to fetch documents for customer:', application.customer._id);
      const response = await axios.get(
        `http://localhost:5000/api/document/customer/${application.customer._id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      console.log('Documents response:', response.data);
      console.log('Fetched documents:', response.data.data);
      setDocuments(response.data.data || []);
    } catch (error) {
      console.error('Error fetching documents:', error);
      console.error('Error details:', error.response?.data);
    }
  };

  if (!application) return null;

  const handleDownloadPDF = () => {
    toast({
      title: "PDF Download",
      description: "Customer summary PDF is being prepared...",
    });
  };

  const handleOpenFullView = () => {
    toast({
      title: "Full View",
      description: "Opening detailed customer profile...",
    });
  };

  const handlePreview = (fileUrl: string) => {
    console.log('handlePreview called with:', fileUrl);
    if (fileUrl.match(/\.(jpg|jpeg|png|gif|bmp|webp)$/i)) {
      setPreviewType('image');
    } else if (fileUrl.match(/\.pdf$/i)) {
      setPreviewType('pdf');
    } else {
      setPreviewType('other');
    }
    setPreviewUrl(fileUrl);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Approved': return 'bg-green-100 text-green-800';
      case 'In Progress': return 'bg-yellow-100 text-yellow-800';
      case 'Rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getDocumentStatusIcon = (status: string) => {
    switch (status) {
      case 'verified': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'rejected': return <XCircle className="h-4 w-4 text-red-600" />;
      case 'uploaded': return <Clock className="h-4 w-4 text-yellow-600" />;
      default: return <AlertCircle className="h-4 w-4 text-gray-400" />;
    }
  };

  const getDocumentStatusBadge = (status: string) => {
    const variants = {
      'not-uploaded': 'bg-gray-100 text-gray-800',
      'uploaded': 'bg-yellow-100 text-yellow-800',
      'verified': 'bg-green-100 text-green-800',
      'rejected': 'bg-red-100 text-red-800',
    };
    return <Badge className={variants[status]}>{status.replace('-', ' ')}</Badge>;
  };

  const approvedSteps = application.steps?.filter(step => step.status === 'Approved').length || 0;
  const totalSteps = application.steps?.length || 0;

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-hidden">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle className="text-2xl">Application Details</DialogTitle>
                <p className="text-muted-foreground mt-1">
                  {application.customer?.firstName} {application.customer?.lastName} • {application._id}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Badge className={getStatusColor(application.status)}>
                  {application.status.toUpperCase()}
                </Badge>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={handleDownloadPDF}>
                    <Download className="h-4 w-4 mr-1" />
                    PDF
                  </Button>
                  <Button size="sm" variant="outline" onClick={handleOpenFullView}>
                    <ExternalLink className="h-4 w-4 mr-1" />
                    Full View
                  </Button>
                </div>
              </div>
            </div>
          </DialogHeader>

          <div className="overflow-y-auto max-h-[calc(90vh-120px)]">
            <Tabs defaultValue="details" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="details">Customer Details</TabsTrigger>
                <TabsTrigger value="documents">Documents</TabsTrigger>
                <TabsTrigger value="notes">Notes</TabsTrigger>
                <TabsTrigger value="history">History</TabsTrigger>
              </TabsList>

              <TabsContent value="details" className="space-y-4">
                <Accordion type="multiple" defaultValue={["basic", "business", "status"]} className="w-full">
                  {/* Basic Information */}
                  <AccordionItem value="basic">
                    <AccordionTrigger className="text-lg font-semibold">
                      <div className="flex items-center gap-2">
                        <User className="h-5 w-5 text-primary" />
                        Basic Information
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <Card>
                        <CardContent className="pt-6">
                          {loading ? (
                            <div className="text-center py-4">Loading customer details...</div>
                          ) : (
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                              <div>
                                <label className="text-sm font-medium text-muted-foreground">Full Name</label>
                                <p className="font-medium">
                                  {customerDetails?.firstName} {customerDetails?.lastName}
                                </p>
                              </div>
                              <div>
                                <label className="text-sm font-medium text-muted-foreground">Nationality</label>
                                <p className="font-medium">{customerDetails?.nationality || 'N/A'}</p>
                              </div>
                              <div>
                                <label className="text-sm font-medium text-muted-foreground">Date of Birth</label>
                                <p className="font-medium">
                                  {customerDetails?.dob ? new Date(customerDetails.dob).toLocaleDateString() : 'N/A'}
                                </p>
                              </div>
                              <div>
                                <label className="text-sm font-medium text-muted-foreground">Gender</label>
                                <p className="font-medium">{customerDetails?.gender || 'N/A'}</p>
                              </div>
                              <div>
                                <label className="text-sm font-medium text-muted-foreground">Phone</label>
                                <p className="font-medium flex items-center gap-1">
                                  <Phone className="h-4 w-4" />
                                  {customerDetails?.phoneNumber || 'N/A'}
                                </p>
                              </div>
                              <div>
                                <label className="text-sm font-medium text-muted-foreground">Email</label>
                                <p className="font-medium flex items-center gap-1">
                                  <Mail className="h-4 w-4" />
                                  {customerDetails?.email || 'N/A'}
                                </p>
                              </div>
                            </div>
                          )}
                          <Separator className="my-4" />
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="text-sm font-medium text-muted-foreground">Permanent Address</label>
                              <p className="font-medium">{customerDetails?.permanentAddress || 'N/A'}</p>
                            </div>
                            <div>
                              <label className="text-sm font-medium text-muted-foreground">Local Address</label>
                              <p className="font-medium">{customerDetails?.currentAddress || 'N/A'}</p>
                            </div>
                            <div>
                              <label className="text-sm font-medium text-muted-foreground">Country of Residence</label>
                              <p className="font-medium flex items-center gap-1">
                                <Globe className="h-4 w-4" />
                                {customerDetails?.countryOfResidence || 'N/A'}
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </AccordionContent>
                  </AccordionItem>

                  {/* Passport & ID */}
                  <AccordionItem value="passport">
                    <AccordionTrigger className="text-lg font-semibold">
                      <div className="flex items-center gap-2">
                        <FileText className="h-5 w-5 text-primary" />
                        Passport & ID Documents
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <Card>
                        <CardContent className="pt-6">
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            <div>
                              <label className="text-sm font-medium text-muted-foreground">Passport Number</label>
                              <p className="font-medium">{customerDetails?.passportNumber || 'N/A'}</p>
                            </div>
                            <div>
                              <label className="text-sm font-medium text-muted-foreground">Passport Expiry</label>
                              <p className="font-medium flex items-center gap-1">
                                <Calendar className="h-4 w-4" />
                                {customerDetails?.passportExpiry ? new Date(customerDetails.passportExpiry).toLocaleDateString() : 'N/A'}
                              </p>
                            </div>
                            <div>
                              <label className="text-sm font-medium text-muted-foreground">Emirates ID</label>
                              <p className="font-medium">{customerDetails?.emiratesId || 'N/A'}</p>
                            </div>
                            <div>
                              <label className="text-sm font-medium text-muted-foreground">Residence Visa</label>
                              <p className="font-medium">{customerDetails?.residenceVisa || 'N/A'}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </AccordionContent>
                  </AccordionItem>

                  {/* Business Setup */}
                  <AccordionItem value="business">
                    <AccordionTrigger className="text-lg font-semibold">
                      <div className="flex items-center gap-2">
                        <Building className="h-5 w-5 text-primary" />
                        Business Setup Details
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <Card>
                        <CardContent className="pt-6">
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            <div>
                              <label className="text-sm font-medium text-muted-foreground">Company Type</label>
                              <Badge variant="outline" className="bg-blue-50 text-blue-700">
                                {customerDetails?.companyType?.toUpperCase() || 'N/A'}
                              </Badge>
                            </div>
                            <div>
                              <label className="text-sm font-medium text-muted-foreground">Business Activity</label>
                              <p className="font-medium">{customerDetails?.businessActivity1 || 'N/A'}</p>
                            </div>
                            <div>
                              <label className="text-sm font-medium text-muted-foreground">Office Type</label>
                              <p className="font-medium">{customerDetails?.officeType || 'N/A'}</p>
                            </div>
                            <div>
                              <label className="text-sm font-medium text-muted-foreground">Jurisdiction</label>
                              <p className="font-medium">{customerDetails?.jurisdiction || 'N/A'}</p>
                            </div>
                            <div>
                              <label className="text-sm font-medium text-muted-foreground">Quoted Price</label>
                              <p className="font-medium text-green-600">
                                {customerDetails?.quotedPrice ? `AED ${customerDetails.quotedPrice}` : 'N/A'}
                              </p>
                            </div>
                            <div>
                              <label className="text-sm font-medium text-muted-foreground">Number of Investors</label>
                              <p className="font-medium">{customerDetails?.numberOfInvestors || 'N/A'}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </AccordionContent>
                  </AccordionItem>

                  {/* Financials */}
                  <AccordionItem value="financials">
                    <AccordionTrigger className="text-lg font-semibold">
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-5 w-5 text-primary" />
                        Financial Information
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <Card>
                        <CardContent className="pt-6">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="text-sm font-medium text-muted-foreground">Source of Funds</label>
                              <p className="font-medium flex items-center gap-1">
                                <CreditCard className="h-4 w-4" />
                                {customerDetails?.sourceOfFund || 'N/A'}
                              </p>
                            </div>
                            <div>
                              <label className="text-sm font-medium text-muted-foreground">Payment Method</label>
                              <p className="font-medium">{customerDetails?.paymentDetails || 'N/A'}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </AccordionContent>
                  </AccordionItem>

                  {/* Status & Progress */}
                  <AccordionItem value="status">
                    <AccordionTrigger className="text-lg font-semibold">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-5 w-5 text-primary" />
                        Application Status & Progress
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <Card>
                        <CardContent className="pt-6">
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            <div>
                              <label className="text-sm font-medium text-muted-foreground">Application ID</label>
                              <p className="font-medium font-mono">{application._id}</p>
                            </div>
                            <div>
                              <label className="text-sm font-medium text-muted-foreground">Submission Date</label>
                              <p className="font-medium">{new Date(application.createdAt).toLocaleDateString()}</p>
                            </div>
                            <div>
                              <label className="text-sm font-medium text-muted-foreground">Current Status</label>
                              <Badge className={getStatusColor(application.status)}>
                                {application.status.toUpperCase()}
                              </Badge>
                            </div>
                            <div>
                              <label className="text-sm font-medium text-muted-foreground">Progress</label>
                              <div className="flex items-center gap-2">
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                  <div
                                    className="bg-gradient-to-r from-primary to-secondary h-2 rounded-full"
                                    style={{ width: `${(approvedSteps / totalSteps) * 100}%` }}
                                  />
                                </div>
                                <span className="text-sm font-medium">{approvedSteps}/{totalSteps}</span>
                              </div>
                            </div>
                            <div>
                              <label className="text-sm font-medium text-muted-foreground">Assigned Agent</label>
                              <p className="font-medium">
                                {application.assignedAgent?.fullName || 'Not Assigned'}
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </TabsContent>

              <TabsContent value="documents" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      Required Documents
                    </CardTitle>
                    <CardDescription>
                      Status of all required documents for this application
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {documents.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                          No documents uploaded yet
                        </div>
                      ) : (
                        documents.map((doc) => (
                          <div key={doc._id} className="border rounded-lg p-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                {getDocumentStatusIcon(doc.status)}
                                <div>
                                  <h4 className="font-medium">{doc.documentName}</h4>
                                  <p className="text-sm text-muted-foreground">{doc.documentType}</p>
                                  <p className="text-xs text-gray-500">File URL: {doc.fileUrl || 'No URL'}</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                {getDocumentStatusBadge(doc.status)}
                                <Button 
                                  size="sm" 
                                  variant="outline" 
                                  onClick={() => {
                                    console.log('View button clicked for doc:', doc);
                                    if (doc.fileUrl) {
                                      handlePreview(doc.fileUrl);
                                    } else {
                                      toast({
                                        title: "No File URL",
                                        description: "This document doesn't have a file URL to preview.",
                                        variant: "destructive"
                                      });
                                    }
                                  }}
                                >
                                  <Eye className="h-4 w-4 mr-1" />
                                  View
                                </Button>
                              </div>
                            </div>
                            {doc.rejectionReason && (
                              <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded">
                                <p className="text-sm text-red-700">
                                  <strong>Rejection Reason:</strong> {doc.rejectionReason}
                                </p>
                              </div>
                            )}
                            {doc.uploadedAt && (
                              <p className="text-xs text-muted-foreground mt-1">
                                Uploaded: {new Date(doc.uploadedAt).toLocaleDateString()}
                              </p>
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="notes" className="space-y-4">
                <NotesModule 
                  customerId={application.customer._id}
                  applicationId={application._id}
                />
              </TabsContent>

              <TabsContent value="history" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="h-5 w-5" />
                      Application History
                    </CardTitle>
                    <CardDescription>
                      Timeline of all activities and changes
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="border-l-4 border-blue-500 bg-blue-50 p-3 rounded">
                      <p className="text-sm text-gray-700 font-medium">
                        Application submitted and under review
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(application.createdAt).toLocaleDateString()} • System
                      </p>
                    </div>
                    
                    {application.steps?.map((step, index) => (
                      <div key={index} className={`border-l-4 ${
                        step.status === 'Approved' ? 'border-green-500 bg-green-50' :
                        step.status === 'Declined' ? 'border-red-500 bg-red-50' :
                        'border-yellow-500 bg-yellow-50'
                      } p-3 rounded`}>
                        <p className="text-sm text-gray-700 font-medium">
                          {step.stepName}: {step.status}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(step.updatedAt).toLocaleDateString()} • System
                        </p>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </DialogContent>
      </Dialog>
      {/* Preview Modal */}
      <PreviewDialog open={!!previewUrl} onOpenChange={() => { setPreviewUrl(null); setPreviewType(null); }}>
        <PreviewDialogContent className="max-w-3xl">
          <PreviewDialogHeader>
            <PreviewDialogTitle>Document Preview</PreviewDialogTitle>
          </PreviewDialogHeader>
          {previewType === 'image' && previewUrl && (
            <img src={previewUrl} alt="Document Preview" className="max-h-[70vh] mx-auto rounded shadow" />
          )}
          {previewType === 'pdf' && previewUrl && (
            <iframe src={previewUrl} title="PDF Preview" className="w-full h-[70vh] rounded shadow" />
          )}
          {previewType === 'other' && previewUrl && (
            <div className="text-center">
              <p className="mb-2">This file type cannot be previewed. <a href={previewUrl} target="_blank" rel="noopener noreferrer" className="text-primary underline">Download</a> instead.</p>
            </div>
          )}
        </PreviewDialogContent>
      </PreviewDialog>
    </>
  );
};

import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
  Eye
} from 'lucide-react';
import { Application } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { NotesModule } from './NotesModule';

interface ApplicationDetailsModalProps {
  application: Application | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ApplicationDetailsModal: React.FC<ApplicationDetailsModalProps> = ({
  application,
  isOpen,
  onClose,
}) => {
  const { toast } = useToast();

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

  // Mock customer data - in real app, this would be fetched based on application.customerId
  const customerData = {
    name: "Ahmed Al Rashid",
    nationality: "UAE",
    dob: "1985-03-15",
    gender: "Male",
    phone: "+971-50-123-4567",
    email: "ahmed.rashid@email.com",
    permanentAddress: "Al Wasl Road, Dubai, UAE",
    localAddress: "Business Bay, Dubai, UAE",
    countryOfResidence: "UAE",
    passportNumber: "A12345678",
    passportExpiry: "2028-06-15",
    emiratesId: "784-1985-1234567-8",
    visaTemporary: "Yes",
    residenceVisa: "Valid until 2025",
    localProof: "DEWA Bill",
    sourceOfFunds: "Personal Savings & Investment",
    paymentDetails: "Bank Transfer - Emirates NBD",
    investors: [
      { name: "Ahmed Al Rashid", percentage: 60, role: "Managing Director" },
      { name: "Sarah Johnson", percentage: 40, role: "Partner" }
    ]
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'under-review': return 'bg-yellow-100 text-yellow-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-2xl">Application Details</DialogTitle>
              <p className="text-muted-foreground mt-1">
                {application.businessName} • {application.id}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge className={getStatusColor(application.status)}>
                {application.status.replace('-', ' ').toUpperCase()}
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
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="details">Customer Details</TabsTrigger>
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
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                          <div>
                            <label className="text-sm font-medium text-muted-foreground">Full Name</label>
                            <p className="font-medium">{customerData.name}</p>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-muted-foreground">Nationality</label>
                            <p className="font-medium">{customerData.nationality}</p>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-muted-foreground">Date of Birth</label>
                            <p className="font-medium">{new Date(customerData.dob).toLocaleDateString()}</p>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-muted-foreground">Gender</label>
                            <p className="font-medium">{customerData.gender}</p>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-muted-foreground">Phone</label>
                            <p className="font-medium flex items-center gap-1">
                              <Phone className="h-4 w-4" />
                              {customerData.phone}
                            </p>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-muted-foreground">Email</label>
                            <p className="font-medium flex items-center gap-1">
                              <Mail className="h-4 w-4" />
                              {customerData.email}
                            </p>
                          </div>
                        </div>
                        <Separator className="my-4" />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="text-sm font-medium text-muted-foreground">Permanent Address</label>
                            <p className="font-medium">{customerData.permanentAddress}</p>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-muted-foreground">Local Address</label>
                            <p className="font-medium">{customerData.localAddress}</p>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-muted-foreground">Country of Residence</label>
                            <p className="font-medium flex items-center gap-1">
                              <Globe className="h-4 w-4" />
                              {customerData.countryOfResidence}
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
                            <p className="font-medium">{customerData.passportNumber}</p>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-muted-foreground">Passport Expiry</label>
                            <p className="font-medium flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              {new Date(customerData.passportExpiry).toLocaleDateString()}
                            </p>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-muted-foreground">Passport Photo</label>
                            <Button size="sm" variant="outline" className="h-8">
                              <Eye className="h-4 w-4 mr-1" />
                              Preview
                            </Button>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-muted-foreground">Emirates ID</label>
                            <p className="font-medium">{customerData.emiratesId}</p>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-muted-foreground">Temporary Visa</label>
                            <Badge variant="outline" className="bg-green-50 text-green-700">
                              {customerData.visaTemporary}
                            </Badge>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-muted-foreground">Residence Visa</label>
                            <p className="font-medium">{customerData.residenceVisa}</p>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-muted-foreground">Local Proof</label>
                            <p className="font-medium">{customerData.localProof}</p>
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
                              {application.businessType.toUpperCase()}
                            </Badge>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-muted-foreground">Business Activity</label>
                            <p className="font-medium">Trading, Import/Export, Consulting</p>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-muted-foreground">Proposed Name</label>
                            <p className="font-medium">{application.businessName}</p>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-muted-foreground">Alternative Names</label>
                            <div className="space-y-1">
                              <p className="text-sm">• {application.businessName} Solutions</p>
                              <p className="text-sm">• Global {application.businessName}</p>
                            </div>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-muted-foreground">Office Type</label>
                            <p className="font-medium">Flexi Desk</p>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-muted-foreground">Quoted Price</label>
                            <p className="font-medium text-green-600">AED 15,000</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </AccordionContent>
                </AccordionItem>

                {/* Investor Details */}
                <AccordionItem value="investors">
                  <AccordionTrigger className="text-lg font-semibold">
                    <div className="flex items-center gap-2">
                      <Users className="h-5 w-5 text-primary" />
                      Investor Details
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <Card>
                      <CardContent className="pt-6">
                        <div className="mb-4">
                          <label className="text-sm font-medium text-muted-foreground">Number of Investors</label>
                          <p className="font-medium text-lg">{customerData.investors.length}</p>
                        </div>
                        <div className="space-y-3">
                          {customerData.investors.map((investor, index) => (
                            <div key={index} className="border rounded-lg p-4 bg-gray-50">
                              <div className="grid grid-cols-3 gap-4">
                                <div>
                                  <label className="text-sm font-medium text-muted-foreground">Name</label>
                                  <p className="font-medium">{investor.name}</p>
                                </div>
                                <div>
                                  <label className="text-sm font-medium text-muted-foreground">Ownership</label>
                                  <Badge variant="outline" className="bg-blue-50 text-blue-700">
                                    {investor.percentage}%
                                  </Badge>
                                </div>
                                <div>
                                  <label className="text-sm font-medium text-muted-foreground">Role</label>
                                  <p className="font-medium">{investor.role}</p>
                                </div>
                              </div>
                            </div>
                          ))}
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
                              {customerData.sourceOfFunds}
                            </p>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-muted-foreground">Payment Method</label>
                            <p className="font-medium">{customerData.paymentDetails}</p>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-muted-foreground">Bank Statement</label>
                            <Button size="sm" variant="outline" className="h-8">
                              <Eye className="h-4 w-4 mr-1" />
                              View Document
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </AccordionContent>
                </AccordionItem>

                {/* Status & Jurisdiction */}
                <AccordionItem value="status">
                  <AccordionTrigger className="text-lg font-semibold">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-5 w-5 text-primary" />
                      Application Status & Jurisdiction
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <Card>
                      <CardContent className="pt-6">
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                          <div>
                            <label className="text-sm font-medium text-muted-foreground">Application ID</label>
                            <p className="font-medium font-mono">{application.id}</p>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-muted-foreground">Submission Date</label>
                            <p className="font-medium">{new Date(application.createdAt).toLocaleDateString()}</p>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-muted-foreground">Current Status</label>
                            <Badge className={getStatusColor(application.status)}>
                              {application.status.replace('-', ' ').toUpperCase()}
                            </Badge>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-muted-foreground">Company Jurisdiction</label>
                            <p className="font-medium">Dubai, UAE</p>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-muted-foreground">Progress</label>
                            <div className="flex items-center gap-2">
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div
                                  className="bg-gradient-to-r from-primary to-secondary h-2 rounded-full"
                                  style={{ width: `${(application.currentStep / 8) * 100}%` }}
                                />
                              </div>
                              <span className="text-sm font-medium">{application.currentStep}/8</span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </TabsContent>

            <TabsContent value="notes" className="space-y-4">
              <NotesModule 
                customerId={application.customerId}
                applicationId={application.id}
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
                  
                  <div className="border-l-4 border-green-500 bg-green-50 p-3 rounded">
                    <p className="text-sm text-gray-700 font-medium">
                      Documents verified and approved
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(Date.now() - 86400000).toLocaleDateString()} • Agent Sarah
                    </p>
                  </div>
                  
                  <div className="border-l-4 border-yellow-500 bg-yellow-50 p-3 rounded">
                    <p className="text-sm text-gray-700 font-medium">
                      Pending additional bank statement
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(Date.now() - 172800000).toLocaleDateString()} • Manager John
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
};

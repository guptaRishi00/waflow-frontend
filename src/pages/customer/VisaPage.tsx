
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Upload, FileText, CheckCircle, Calendar, Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface VisaFormData {
  applicationType: string;
  nationality: string;
  passportNumber: string;
  passportExpiry: string;
  emiratesId: string;
  residenceAddress: string;
  emergencyContact: string;
  emergencyPhone: string;
}

export const VisaPage: React.FC = () => {
  const [formData, setFormData] = useState<VisaFormData>({
    applicationType: '',
    nationality: '',
    passportNumber: '',
    passportExpiry: '',
    emiratesId: '',
    residenceAddress: '',
    emergencyContact: '',
    emergencyPhone: '',
  });
  
  const [applicationStatus] = useState<'draft' | 'submitted' | 'approved' | 'rejected'>('submitted');
  const [appointmentLetter] = useState('visa_appointment_letter.pdf');
  const { toast } = useToast();

  const handleInputChange = (field: keyof VisaFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Visa Application Submitted",
      description: "Your visa application has been submitted for review.",
    });
  };

  const getStatusBadge = () => {
    const variants = {
      draft: 'bg-gray-100 text-gray-800',
      submitted: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
    };

    return (
      <Badge className={variants[applicationStatus]}>
        {applicationStatus}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-primary">Visa Application</h1>
        <p className="text-muted-foreground">
          Apply for your UAE residence visa
        </p>
      </div>

      {/* Application Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Application Status</span>
            {getStatusBadge()}
          </CardTitle>
          <CardDescription>
            Track your visa application progress
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <p className="font-medium">Application Submitted</p>
                <p className="text-sm text-muted-foreground">January 23, 2024</p>
              </div>
            </div>
            
            {appointmentLetter && (
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Calendar className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="font-medium text-blue-900">Appointment Letter Ready</p>
                      <p className="text-sm text-blue-700">Download your visa appointment letter</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Visa Application Form */}
      <Card>
        <CardHeader>
          <CardTitle>Visa Application Details</CardTitle>
          <CardDescription>
            Complete your visa application information
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="applicationType">Application Type</Label>
                <Select 
                  value={formData.applicationType} 
                  onValueChange={(value) => handleInputChange('applicationType', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select visa type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="investor">Investor Visa</SelectItem>
                    <SelectItem value="employee">Employee Visa</SelectItem>
                    <SelectItem value="partner">Partner Visa</SelectItem>
                    <SelectItem value="family">Family Visa</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="nationality">Nationality</Label>
                <Input
                  id="nationality"
                  value={formData.nationality}
                  onChange={(e) => handleInputChange('nationality', e.target.value)}
                  placeholder="Enter your nationality"
                />
              </div>

              <div>
                <Label htmlFor="passportNumber">Passport Number</Label>
                <Input
                  id="passportNumber"
                  value={formData.passportNumber}
                  onChange={(e) => handleInputChange('passportNumber', e.target.value)}
                  placeholder="Enter passport number"
                />
              </div>

              <div>
                <Label htmlFor="passportExpiry">Passport Expiry Date</Label>
                <Input
                  id="passportExpiry"
                  type="date"
                  value={formData.passportExpiry}
                  onChange={(e) => handleInputChange('passportExpiry', e.target.value)}
                />
              </div>

              <div className="md:col-span-2">
                <Label htmlFor="emiratesId">Emirates ID (if available)</Label>
                <Input
                  id="emiratesId"
                  value={formData.emiratesId}
                  onChange={(e) => handleInputChange('emiratesId', e.target.value)}
                  placeholder="Enter Emirates ID number"
                />
              </div>

              <div className="md:col-span-2">
                <Label htmlFor="residenceAddress">UAE Residence Address</Label>
                <Textarea
                  id="residenceAddress"
                  value={formData.residenceAddress}
                  onChange={(e) => handleInputChange('residenceAddress', e.target.value)}
                  placeholder="Enter your UAE residence address"
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="emergencyContact">Emergency Contact Name</Label>
                <Input
                  id="emergencyContact"
                  value={formData.emergencyContact}
                  onChange={(e) => handleInputChange('emergencyContact', e.target.value)}
                  placeholder="Enter emergency contact name"
                />
              </div>

              <div>
                <Label htmlFor="emergencyPhone">Emergency Contact Phone</Label>
                <Input
                  id="emergencyPhone"
                  value={formData.emergencyPhone}
                  onChange={(e) => handleInputChange('emergencyPhone', e.target.value)}
                  placeholder="+971 50 123 4567"
                />
              </div>
            </div>

            <Button type="submit" className="w-full bg-primary hover:bg-primary/90">
              Submit Visa Application
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Required Documents */}
      <Card>
        <CardHeader>
          <CardTitle>Required Documents</CardTitle>
          <CardDescription>
            Upload these documents for your visa application
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center space-x-3">
                <FileText className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-medium">Passport Copy</p>
                  <p className="text-sm text-muted-foreground">Clear copy of passport pages</p>
                </div>
              </div>
              <Button variant="outline" size="sm">
                <Upload className="h-4 w-4 mr-2" />
                Upload
              </Button>
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center space-x-3">
                <FileText className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-medium">Emirates ID (Front & Back)</p>
                  <p className="text-sm text-muted-foreground">If you have an existing Emirates ID</p>
                </div>
              </div>
              <Button variant="outline" size="sm">
                <Upload className="h-4 w-4 mr-2" />
                Upload
              </Button>
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center space-x-3">
                <FileText className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-medium">Medical Certificate</p>
                  <p className="text-sm text-muted-foreground">Valid medical fitness certificate</p>
                </div>
              </div>
              <Button variant="outline" size="sm">
                <Upload className="h-4 w-4 mr-2" />
                Upload
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

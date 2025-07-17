
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, ArrowRight, Save, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { BasicInfoStep } from '@/components/registration/BasicInfoStep';
import { PassportFundStep } from '@/components/registration/PassportFundStep';
import { BusinessDetailsStep } from '@/components/registration/BusinessDetailsStep';
import { InvestorInfoStep } from '@/components/registration/InvestorInfoStep';
import { ResidencyLocationStep } from '@/components/registration/ResidencyLocationStep';
import { FinalUploadsStep } from '@/components/registration/FinalUploadsStep';
import { ConfirmationStep } from '@/components/registration/ConfirmationStep';

interface RegistrationData {
  // Step 1: Basic Information
  customerName: string;
  nationality: string;
  dateOfBirth: string;
  gender: string;
  phoneNumber: string;
  emailAddress: string;
  permanentAddress: string;
  
  // Step 2: Passport & Fund Details
  passportNumber: string;
  passportExpiry: string;
  sourceOfFund: string;
  bankStatement?: File;
  
  // Step 3: Business Details
  companyTypePreference: string;
  businessActivity: string[];
  companyNameOptions: string[];
  officeType: string;
  quotedPrice: string;
  
  // Step 4: Investor Info
  investorName: string;
  numberOfInvestors: string;
  investorPercentage: string;
  role: string;
  
  // Step 5: Residency & Location
  countryOfResidence: string;
  localAddress: string;
  localProof?: File;
  companyJurisdiction: string;
  emiratesId: string;
  residenceVisa?: File;
  temporaryVisa?: File;
  
  // Step 6: Final Uploads
  passportPhoto?: File;
  otherDocument?: File;
}

const steps = [
  { id: 1, title: 'Basic Information', description: 'Personal details' },
  { id: 2, title: 'Passport & Funds', description: 'Identity and financial info' },
  { id: 3, title: 'Business Details', description: 'Company preferences' },
  { id: 4, title: 'Investor Info', description: 'Ownership details' },
  { id: 5, title: 'Residency & Location', description: 'Address and jurisdiction' },
  { id: 6, title: 'Final Uploads', description: 'Required documents' },
  { id: 7, title: 'Confirmation', description: 'Review and submit' },
];

export const StartRegistrationPage: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [applicationId, setApplicationId] = useState<string>('');
  const [formData, setFormData] = useState<RegistrationData>({
    customerName: '',
    nationality: '',
    dateOfBirth: '',
    gender: '',
    phoneNumber: '',
    emailAddress: '',
    permanentAddress: '',
    passportNumber: '',
    passportExpiry: '',
    sourceOfFund: '',
    companyTypePreference: '',
    businessActivity: [],
    companyNameOptions: ['', '', ''],
    officeType: '',
    quotedPrice: '',
    investorName: '',
    numberOfInvestors: '',
    investorPercentage: '',
    role: '',
    countryOfResidence: '',
    localAddress: '',
    companyJurisdiction: '',
    emiratesId: '',
  });
  const { toast } = useToast();

  useEffect(() => {
    // Generate application ID when component mounts
    const tempId = `WF-TEMP-${Date.now().toString().slice(-6)}`;
    setApplicationId(tempId);
  }, []);

  const handleNext = () => {
    if (currentStep < steps.length) {
      saveProgress();
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const saveProgress = () => {
    // Save to localStorage for now (in real app, save to backend)
    localStorage.setItem(`registration_${applicationId}`, JSON.stringify({
      ...formData,
      currentStep,
      applicationId,
    }));
    
    console.log('Saving data:', formData);
    
    toast({
      title: "Progress Saved",
      description: "Your registration progress has been saved.",
    });
  };

  const saveDraft = () => {
    saveProgress();
    toast({
      title: "Draft Saved",
      description: "You can resume this registration later using your Application ID.",
    });
  };

  const updateFormData = (stepData: Partial<RegistrationData>) => {
    setFormData(prev => ({ ...prev, ...stepData }));
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <BasicInfoStep data={formData} onUpdate={updateFormData} />;
      case 2:
        return <PassportFundStep data={formData} onUpdate={updateFormData} />;
      case 3:
        return <BusinessDetailsStep data={formData} onUpdate={updateFormData} />;
      case 4:
        return <InvestorInfoStep data={formData} onUpdate={updateFormData} />;
      case 5:
        return <ResidencyLocationStep data={formData} onUpdate={updateFormData} />;
      case 6:
        return <FinalUploadsStep data={formData} onUpdate={updateFormData} />;
      case 7:
        return <ConfirmationStep data={formData} applicationId={applicationId} />;
      default:
        return null;
    }
  };

  const isStepValid = () => {
    if (currentStep === 1) {
      return formData.customerName && formData.emailAddress && formData.phoneNumber;
    }
    return true; // Other steps are optional for now
  };

  const progress = (currentStep / steps.length) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      {/* Header */}
      <div className="border-b bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link to="/" className="flex items-center space-x-2">
                <ArrowLeft className="h-5 w-5" />
                <span>Back to Home</span>
              </Link>
              <div className="h-6 w-px bg-gray-300" />
              <div>
                <h1 className="text-xl font-semibold">Company Registration</h1>
                {applicationId && (
                  <p className="text-sm text-muted-foreground">
                    Application ID: <span className="font-mono text-primary">{applicationId}</span>
                  </p>
                )}
              </div>
            </div>
            <Button variant="outline" onClick={saveDraft}>
              <Save className="h-4 w-4 mr-2" />
              Save Draft
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Progress Sidebar */}
            <div className="lg:col-span-1">
              <Card className="sticky top-8">
                <CardHeader>
                  <CardTitle className="text-lg">Progress</CardTitle>
                  <Progress value={progress} className="mt-2" />
                  <p className="text-sm text-muted-foreground">
                    Step {currentStep} of {steps.length}
                  </p>
                </CardHeader>
                <CardContent className="space-y-2">
                  {steps.map((step) => (
                    <div
                      key={step.id}
                      className={`flex items-center space-x-3 p-2 rounded-lg transition-colors ${
                        step.id === currentStep
                          ? 'bg-primary/10 text-primary'
                          : step.id < currentStep
                          ? 'bg-green-50 text-green-700'
                          : 'text-muted-foreground'
                      }`}
                    >
                      <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                        step.id === currentStep
                          ? 'bg-primary text-white'
                          : step.id < currentStep
                          ? 'bg-green-600 text-white'
                          : 'bg-gray-200'
                      }`}>
                        {step.id < currentStep ? (
                          <CheckCircle className="h-3 w-3" />
                        ) : (
                          step.id
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">{step.title}</p>
                        <p className="text-xs truncate">{step.description}</p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-3">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <span className="waflow-gradient w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                      {currentStep}
                    </span>
                    <span>{steps[currentStep - 1]?.title}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {renderStep()}
                  
                  {/* Navigation Buttons */}
                  {currentStep < steps.length && (
                    <div className="flex justify-between pt-6 border-t">
                      <Button
                        variant="outline"
                        onClick={handlePrevious}
                        disabled={currentStep === 1}
                      >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Previous
                      </Button>
                      
                      <Button
                        onClick={handleNext}
                        disabled={!isStepValid()}
                        className="bg-primary hover:bg-primary/90"
                      >
                        {currentStep === steps.length - 1 ? 'Review & Submit' : 'Save & Continue'}
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

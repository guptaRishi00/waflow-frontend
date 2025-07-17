
import React from 'react';
import { Button } from '@/components/ui/button';
import { CheckCircle, Mail, Phone } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Link } from 'react-router-dom';

interface ConfirmationStepProps {
  data: any;
  applicationId: string;
}

export const ConfirmationStep: React.FC<ConfirmationStepProps> = ({ data, applicationId }) => {
  const { toast } = useToast();

  const handleSubmit = () => {
    // In real app, submit to backend
    console.log('Final submission:', { ...data, applicationId });
    
    toast({
      title: "Registration Submitted!",
      description: "Your application has been submitted successfully. An agent will contact you soon.",
    });
  };

  return (
    <div className="space-y-8 text-center">
      <div className="flex flex-col items-center space-y-4">
        <div className="waflow-gradient w-16 h-16 rounded-full flex items-center justify-center">
          <CheckCircle className="h-8 w-8 text-white" />
        </div>
        <h2 className="text-2xl font-semibold waflow-text-gradient">
          Almost Done!
        </h2>
        <p className="text-muted-foreground max-w-md">
          Review your information below and submit your application. 
          Our team will contact you within 24 hours.
        </p>
      </div>

      <div className="bg-muted/30 rounded-lg p-6 text-left">
        <h3 className="font-semibold mb-4">Application Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <strong>Application ID:</strong>
            <br />
            <span className="font-mono text-primary">{applicationId}</span>
          </div>
          <div>
            <strong>Customer Name:</strong>
            <br />
            {data.customerName || 'Not provided'}
          </div>
          <div>
            <strong>Email:</strong>
            <br />
            {data.emailAddress || 'Not provided'}
          </div>
          <div>
            <strong>Phone:</strong>
            <br />
            {data.phoneNumber || 'Not provided'}
          </div>
          <div>
            <strong>Company Type:</strong>
            <br />
            {data.companyTypePreference || 'Not specified'}
          </div>
          <div>
            <strong>Business Activities:</strong>
            <br />
            {data.businessActivity?.join(', ') || 'Not specified'}
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <Button 
          onClick={handleSubmit}
          size="lg"
          className="bg-primary hover:bg-primary/90 px-8"
        >
          Submit Application
        </Button>
        
        <div className="text-center space-y-2">
          <p className="text-sm text-muted-foreground">
            After submission, you'll receive:
          </p>
          <div className="flex justify-center space-x-6 text-sm">
            <div className="flex items-center space-x-2">
              <Mail className="h-4 w-4 text-primary" />
              <span>Email confirmation</span>
            </div>
            <div className="flex items-center space-x-2">
              <Phone className="h-4 w-4 text-primary" />
              <span>Agent contact within 24h</span>
            </div>
          </div>
        </div>
        
        <p className="text-xs text-muted-foreground">
          Need help? <Link to="/" className="text-primary hover:underline">Contact our support team</Link>
        </p>
      </div>
    </div>
  );
};

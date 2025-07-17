
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ProgressTracker } from '@/components/ui/progress-tracker';
import { FileText, MessageSquare, DollarSign, Eye, Edit } from 'lucide-react';
import { mockApplications } from '@/lib/mock-data';
import { Link } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { ApplicationDetailsModal } from '@/components/common/ApplicationDetailsModal';
import type { Application } from '@/types';

// Extended interface for mock data compatibility
interface ExtendedApplication extends Application {
  businessName?: string;
  businessType?: string;
  currentStep?: number;
  customerId?: string;
}

export const ApplicationsPage: React.FC = () => {
  const [applications] = useState<ExtendedApplication[]>(mockApplications as ExtendedApplication[]);
  const [selectedApp, setSelectedApp] = useState<ExtendedApplication>(applications[0]);
  const [agentNotes, setAgentNotes] = useState('');
  const [stepStatus, setStepStatus] = useState<string>('');
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [isApplicationModalOpen, setIsApplicationModalOpen] = useState(false);
  const { toast } = useToast();

  const handleUpdateStep = () => {
    toast({
      title: "Step Updated",
      description: "Application step has been updated successfully.",
    });
  };

  const handleCreateInvoice = () => {
    toast({
      title: "Invoice Created",
      description: "Invoice has been created and sent to customer.",
    });
  };

  const handleViewApplication = (application: Application) => {
    setSelectedApplication(application);
    setIsApplicationModalOpen(true);
  };

  // Helper function to get business name
  const getBusinessName = (app: ExtendedApplication) => {
    return app.businessName || `${app.customer.firstName} ${app.customer.lastName}`;
  };

  // Helper function to get business type
  const getBusinessType = (app: ExtendedApplication) => {
    return app.businessType || 'Individual';
  };

  // Helper function to get current step
  const getCurrentStep = (app: ExtendedApplication) => {
    return app.currentStep || app.steps.filter(step => step.status === 'Submitted' || step.status === 'Approved').length;
  };

  // Helper function to get customer ID
  const getCustomerId = (app: ExtendedApplication) => {
    return app.customerId || app.customer._id;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-primary">Applications Management</h1>
        <p className="text-muted-foreground">
          Manage customer applications and track progress
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Applications List */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Applications</CardTitle>
            <CardDescription>All customer applications</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {applications.map((app) => (
                <div
                  key={app._id}
                  className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                    selectedApp._id === app._id 
                      ? 'border-primary bg-primary/5' 
                      : 'hover:bg-gray-50'
                  }`}
                  onClick={() => setSelectedApp(app)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-sm">{getBusinessName(app)}</span>
                    <Badge variant="outline" className="text-xs">
                      {app._id}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground capitalize">
                      {getBusinessType(app)}
                    </span>
                    <Badge 
                      variant={app.status === 'In Progress' ? 'secondary' : 'default'}
                      className={
                        app.status === 'In Progress' 
                          ? 'bg-yellow-100 text-yellow-800' 
                          : ''
                      }
                    >
                      {app.status.replace(' ', '-')}
                    </Badge>
                  </div>
                  
                  <div className="mt-2">
                    <div className="w-full bg-gray-200 rounded-full h-1.5">
                      <div
                        className="bg-gradient-to-r from-primary to-secondary h-1.5 rounded-full"
                        style={{ width: `${(getCurrentStep(app) / 8) * 100}%` }}
                      />
                    </div>
                    <span className="text-xs text-muted-foreground">
                      Step {getCurrentStep(app)}/8
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Application Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Application Header */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>{getBusinessName(selectedApp)}</CardTitle>
                  <CardDescription>
                    {selectedApp._id} • {getBusinessType(selectedApp)} • Created {new Date(selectedApp.createdAt).toLocaleDateString()}
                  </CardDescription>
                </div>
                <div className="flex items-center space-x-2">
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={() => handleViewApplication(selectedApp)}
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    View Details
                  </Button>
                  <Button size="sm" variant="outline" asChild>
                    <Link to={`/agent/customers/${getCustomerId(selectedApp)}`}>
                      <Eye className="h-4 w-4 mr-1" />
                      View Customer
                    </Link>
                  </Button>
                  <Button size="sm" variant="outline" asChild>
                    <Link to={`/agent/chat?application=${selectedApp._id}`}>
                      <MessageSquare className="h-4 w-4 mr-1" />
                      Chat
                    </Link>
                  </Button>
                  <Button size="sm" variant="outline" onClick={handleCreateInvoice}>
                    <DollarSign className="h-4 w-4 mr-1" />
                    Invoice
                  </Button>
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Progress Tracker */}
          <Card>
            <CardHeader>
              <CardTitle>Application Progress</CardTitle>
              <CardDescription>
                Track and update application steps
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ProgressTracker 
                steps={selectedApp.steps} 
                currentStep={getCurrentStep(selectedApp)}
              />
            </CardContent>
          </Card>

          {/* Step Management */}
          <Card>
            <CardHeader>
              <CardTitle>Update Application Step</CardTitle>
              <CardDescription>
                Manage the current step and add agent notes
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Current Step</label>
                  <Select value={getCurrentStep(selectedApp).toString()}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {selectedApp.steps.map((step, index) => (
                        <SelectItem key={`${selectedApp._id}-step-${index}`} value={(index + 1).toString()}>
                          Step {index + 1}: {step.stepName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Step Status</label>
                  <Select value={stepStatus} onValueChange={setStepStatus}>
                    <SelectTrigger>
                      <SelectValue placeholder="Update status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="in-progress">In Progress</SelectItem>
                      <SelectItem value="submitted">Submitted</SelectItem>
                      <SelectItem value="approved">Approved</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Agent Notes</label>
                <Textarea
                  value={agentNotes}
                  onChange={(e) => setAgentNotes(e.target.value)}
                  placeholder="Add notes about this step or any updates for the customer..."
                  rows={3}
                />
              </div>

              <Button onClick={handleUpdateStep} className="bg-primary hover:bg-primary/90">
                <Edit className="h-4 w-4 mr-2" />
                Update Step
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Application Details Modal */}
      <ApplicationDetailsModal
        application={selectedApplication}
        isOpen={isApplicationModalOpen}
        onClose={() => {
          setIsApplicationModalOpen(false);
          setSelectedApplication(null);
        }}
      />
    </div>
  );
};

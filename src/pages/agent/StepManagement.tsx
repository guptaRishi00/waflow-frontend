
// import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ClipboardList, MessageSquare, Edit, CheckCircle2, AlertCircle, Clock, Hourglass, Send, FileCheck } from 'lucide-react';

const StepManagement = ({
  steps = [],
  status,
  notes,
  stepStatus,
  setStepStatus,
  agentNotes,
  setAgentNotes,
  handleUpdateStep,
}: {
  steps: any[];
  status?: string;
  notes?: any;
  stepStatus: string;
  setStepStatus: (status: string) => void;
  agentNotes: string;
  setAgentNotes: (notes: string) => void;
  handleUpdateStep: () => void;
}) => {
  console.log('StepManagement props:', { steps, status, notes });
  
  const getStatusIcon = (status: string) => {
    status = status.toLowerCase();
    switch(status) {
      case 'pending': return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'in progress': return <Hourglass className="h-4 w-4 text-blue-500" />;
      case 'submitted': return <Send className="h-4 w-4 text-purple-500" />;
      case 'approved': return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'rejected': return <AlertCircle className="h-4 w-4 text-red-500" />;
      default: return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    status = status.toLowerCase();
    switch(status) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-300">Pending</Badge>;
      case 'in progress':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">In Progress</Badge>;
      case 'submitted':
        return <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">Submitted</Badge>;
      case 'approved':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Approved</Badge>;
      case 'rejected':
        return <Badge variant="outline" className="bg-red-100 text-red-800 border-red-300">Rejected</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  // Find the first non-approved step
  const currentStepIndex = steps.findIndex(step => step.status.toLowerCase() !== 'approved');
  const currentStepIndex1 = currentStepIndex === -1 ? steps.length - 1 : currentStepIndex;
  const completedSteps = steps.filter(step => step.status.toLowerCase() === 'approved').length;
  const totalSteps = steps.length;

  return (
    <div className="grid gap-6 md:grid-cols-12 w-full">
      {/* Left Column - Current Step & Action */}
      <div className="md:col-span-7 space-y-6">
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <ClipboardList className="h-5 w-5 text-primary" />
                Current Step
              </CardTitle>
              <Badge variant="outline" className="text-primary">
                {completedSteps}/{totalSteps} Completed
              </Badge>
            </div>
            <CardDescription>
              {currentStepIndex < steps.length ? 
                `Working on step ${currentStepIndex1 + 1} of ${steps.length}` : 
                "All steps completed!"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between border p-4 rounded-lg bg-muted/30">
                <div className="flex items-center gap-3">
                  {currentStepIndex < steps.length ? (
                    getStatusIcon(steps[currentStepIndex1].status)
                  ) : (
                    <FileCheck className="h-4 w-4 text-green-500" />
                  )}
                  <span className="font-medium">
                    {currentStepIndex < steps.length ? 
                      `Step ${currentStepIndex1 + 1}: ${steps[currentStepIndex1].stepName}` : 
                      "All steps completed!"}
                  </span>
                </div>
                {currentStepIndex < steps.length && (
                  getStatusBadge(steps[currentStepIndex1].status)
                )}
              </div>
              
              <div className="space-y-2">
                <label htmlFor="step-status" className="text-sm font-medium">
                  Step Status
                </label>
                <Select value={stepStatus} onValueChange={setStepStatus}>
                  <SelectTrigger id="step-status" className="w-full">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Pending">Pending</SelectItem>
                    <SelectItem value="In Progress">In Progress</SelectItem>
                    <SelectItem value="Submitted">Submitted</SelectItem>
                    <SelectItem value="Approved">Approved</SelectItem>
                    <SelectItem value="Rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <label htmlFor="agent-notes" className="text-sm font-medium">
                  Agent Notes
                </label>
                <Textarea
                  id="agent-notes"
                  value={agentNotes}
                  onChange={(e) => setAgentNotes(e.target.value)}
                  placeholder="Add notes about this step or any updates for the customer..."
                  rows={3}
                  className="resize-none"
                />
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button 
              onClick={handleUpdateStep} 
              className="w-full flex items-center gap-2"
            >
              <Edit className="h-4 w-4" />
              Update Step
            </Button>
          </CardFooter>
        </Card>
      </div>

      {/* Right Column - All Steps & Notes */}
      <div className="md:col-span-5 space-y-6">
        {/* All Steps */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <ClipboardList className="h-5 w-5 text-primary" />
              All Steps
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[180px]">
              <div className="space-y-2">
                {steps.map((step: any, idx: number) => (
                  <div 
                    key={idx} 
                    className={`flex justify-between items-center p-3 rounded-md text-sm ${
                      idx === currentStepIndex1 ? 'bg-primary/10 border border-primary/30' : 'bg-muted/20'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {getStatusIcon(step.status)}
                      <span className={idx === currentStepIndex1 ? 'font-medium' : ''}>
                        Step {idx + 1}: {step.stepName}
                      </span>
                    </div>
                    {getStatusBadge(step.status)}
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Notes */}
        {Array.isArray(notes) && notes.length > 0 && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-primary" />
                Notes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[180px]">
                <div className="space-y-3">
                  {notes.map((note: any, idx: number) => (
                    <div key={idx} className="p-3 bg-muted/30 rounded-md text-sm">
                      <p className="text-muted-foreground">{note.message}</p>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default StepManagement;

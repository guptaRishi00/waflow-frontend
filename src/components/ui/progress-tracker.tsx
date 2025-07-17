
import React from 'react';
import { CheckCircle, Clock, XCircle, Circle } from 'lucide-react';
import { ApplicationStep } from '@/types';
import { cn } from '@/lib/utils';

interface ProgressTrackerProps {
  steps: ApplicationStep[];
  currentStep: number;
  className?: string;
}

const getStatusIcon = (status: ApplicationStep['status']) => {
  switch (status) {
    case 'approved':
      return <CheckCircle className="h-5 w-5 text-green-600" />;
    case 'rejected':
      return <XCircle className="h-5 w-5 text-red-600" />;
    case 'in-progress':
    case 'submitted':
      return <Clock className="h-5 w-5 text-secondary" />;
    default:
      return <Circle className="h-5 w-5 text-gray-400" />;
  }
};

const getStatusColor = (status: ApplicationStep['status']) => {
  switch (status) {
    case 'approved':
      return 'border-green-600 bg-green-50';
    case 'rejected':
      return 'border-red-600 bg-red-50';
    case 'in-progress':
    case 'submitted':
      return 'border-secondary bg-yellow-50';
    default:
      return 'border-gray-300 bg-gray-50';
  }
};

export const ProgressTracker: React.FC<ProgressTrackerProps> = ({
  steps,
  currentStep,
  className,
}) => {
  return (
    <div className={cn("space-y-4", className)}>
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-primary mb-2">Application Progress</h3>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-gradient-to-r from-primary to-secondary h-2 rounded-full transition-all duration-500"
            style={{ width: `${(currentStep / steps.length) * 100}%` }}
          />
        </div>
        <p className="text-sm text-muted-foreground mt-2">
          Step {currentStep} of {steps.length} completed
        </p>
      </div>

      <div className="space-y-3">
        {steps.map((step, index) => (
          <div
            key={step.id}
            className={cn(
              "flex items-start space-x-4 p-4 rounded-lg border-l-4 transition-all duration-200",
              getStatusColor(step.status),
              index + 1 <= currentStep ? "opacity-100" : "opacity-60"
            )}
          >
            <div className="flex-shrink-0 mt-0.5">
              {getStatusIcon(step.status)}
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-semibold text-sm text-gray-900">
                    {step.title}
                  </h4>
                  <p className="text-sm text-gray-600 mt-1">
                    {step.description}
                  </p>
                  
                  {step.agentNotes && (
                    <div className="mt-2 p-2 bg-blue-50 rounded text-xs text-blue-800">
                      <strong>Agent Notes:</strong> {step.agentNotes}
                    </div>
                  )}
                  
                  {step.completedAt && (
                    <p className="text-xs text-gray-500 mt-1">
                      Completed: {new Date(step.completedAt).toLocaleDateString()}
                    </p>
                  )}
                </div>
                
                <span className={cn(
                  "inline-flex items-center px-2 py-1 rounded-full text-xs font-medium capitalize",
                  step.status === 'approved' && "bg-green-100 text-green-800",
                  step.status === 'rejected' && "bg-red-100 text-red-800",
                  (step.status === 'in-progress' || step.status === 'submitted') && "bg-yellow-100 text-yellow-800",
                  step.status === 'pending' && "bg-gray-100 text-gray-800"
                )}>
                  {step.status.replace('-', ' ')}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

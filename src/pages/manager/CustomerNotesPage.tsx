
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, User, FileText } from 'lucide-react';
import { NotesModule } from './NotesModule';
import { useNavigate } from 'react-router-dom';

interface CustomerNotesPageProps {
  customerId: string;
  customerName: string;
  applicationId?: string;
  onBack?: () => void;
}

export const CustomerNotesPage: React.FC<CustomerNotesPageProps> = ({
  customerId,
  customerName,
  applicationId,
  onBack
}) => {
  const navigate = useNavigate();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate(-1);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" onClick={handleBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        
        <div>
          <h1 className="text-3xl font-bold text-primary">Customer Notes</h1>
          <p className="text-muted-foreground">
            Internal notes and communications for {customerName}
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Customer Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Customer ID</label>
              <p className="font-medium font-mono">{customerId}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Customer Name</label>
              <p className="font-medium">{customerName}</p>
            </div>
            {applicationId && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">Application ID</label>
                <Badge variant="outline" className="font-mono">
                  {applicationId}
                </Badge>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <NotesModule 
        customerId={customerId}
        applicationId={applicationId}
      />
    </div>
  );
};

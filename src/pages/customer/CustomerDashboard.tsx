
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ProgressTracker } from '@/components/ui/progress-tracker';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FileText, MessageSquare, CreditCard, Calendar } from 'lucide-react';
import { mockApplications, mockInvoices } from '@/lib/mock-data';
import { Link } from 'react-router-dom';

export const CustomerDashboard: React.FC = () => {
  const application = mockApplications[0];
  const recentInvoices = mockInvoices.slice(0, 2);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-primary">Welcome back!</h1>
        <p className="text-muted-foreground">Track your UAE business registration progress</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Application</p>
                <p className="text-lg font-semibold">{application.id}</p>
              </div>
              <FileText className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Progress</p>
                <p className="text-lg font-semibold">{application.currentStep}/8 Steps</p>
              </div>
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-xs font-bold text-primary">
                  {Math.round((application.currentStep / 8) * 100)}%
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Status</p>
                <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                  {application.status.replace('-', ' ')}
                </Badge>
              </div>
              <Calendar className="h-8 w-8 text-secondary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Business Type</p>
                <p className="text-lg font-semibold capitalize">{application.businessType}</p>
              </div>
              <div className="w-8 h-8 rounded-full waflow-gradient flex items-center justify-center">
                <span className="text-xs font-bold text-white">UAE</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Progress Tracker */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Application Progress</CardTitle>
            <CardDescription>
              Your business registration for <strong>{application.businessName}</strong>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ProgressTracker 
              steps={application.steps} 
              currentStep={application.currentStep}
            />
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Invoices</CardTitle>
            <CardDescription>Your payment history</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentInvoices.map((invoice) => (
              <div key={invoice.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="font-medium">{invoice.notes}</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(invoice.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold">{invoice.amount} {invoice.currency}</p>
                  <Badge 
                    variant={invoice.status === 'paid' ? 'default' : 'secondary'}
                    className={
                      invoice.status === 'paid' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }
                  >
                    {invoice.status}
                  </Badge>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common tasks and navigation</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button asChild className="w-full justify-start bg-primary hover:bg-primary/90">
              <Link to="/customer/documents">
                <FileText className="mr-2 h-4 w-4" />
                Upload Documents
              </Link>
            </Button>
            
            <Button asChild variant="outline" className="w-full justify-start">
              <Link to="/customer/chat">
                <MessageSquare className="mr-2 h-4 w-4" />
                Chat with Agent
              </Link>
            </Button>
            
            <Button asChild variant="outline" className="w-full justify-start">
              <Link to="/customer/visa">
                <CreditCard className="mr-2 h-4 w-4" />
                Apply for Visa
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

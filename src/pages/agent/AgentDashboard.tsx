
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Users, FileText, Clock, CheckCircle, MessageSquare, DollarSign } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '@/app/store';
import axios from 'axios';
import { useToast } from '@/hooks/use-toast';
import type { Application } from '@/types';

export const AgentDashboard: React.FC = () => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const { token, user } = useSelector((state: RootState) => state.customerAuth);
  const { toast } = useToast();

  // Fetch applications from backend
  useEffect(() => {
    const fetchApplications = async () => {
      if (!token) return;
      
      setLoading(true);
      try {
        const response = await axios.get("http://localhost:5000/api/application", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const apps = response.data.data;
        setApplications(apps);
      } catch (err) {
        console.error('Error fetching applications:', err);
        toast({
          title: "Error",
          description: "Failed to load applications.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
  }, [token, toast]);

  // Calculate stats from real data
  const stats = {
    totalClients: applications.length,
    activeApplications: applications.filter(app => app.status === 'In Progress').length,
    completedApplications: applications.filter(app => app.status === 'Completed').length,
    pendingTasks: applications.filter(app => app.status === 'Waiting for Agent Review').length,
    monthlyRevenue: applications.length * 5000, // Mock calculation
  };

  const activeApplications = applications.filter(app => 
    app.status === 'In Progress' || app.status === 'Waiting for Agent Review'
  ).slice(0, 3); // Show only first 3 active applications

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-primary">Agent Dashboard</h1>
        <p className="text-muted-foreground">Manage your client applications and track progress</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Clients</p>
                <p className="text-2xl font-bold">{stats.totalClients}</p>
              </div>
              <Users className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Apps</p>
                <p className="text-2xl font-bold">{stats.activeApplications}</p>
              </div>
              <FileText className="h-8 w-8 text-secondary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Completed</p>
                <p className="text-2xl font-bold">{stats.completedApplications}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pending Tasks</p>
                <p className="text-2xl font-bold">{stats.pendingTasks}</p>
              </div>
              <Clock className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Revenue (AED)</p>
                <p className="text-2xl font-bold">{stats.monthlyRevenue.toLocaleString()}</p>
              </div>
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Active Applications */}
        <Card>
          <CardHeader>
            <CardTitle>Active Applications</CardTitle>
            <CardDescription>Applications requiring your attention</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8 text-muted-foreground">Loading applications...</div>
            ) : activeApplications.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">No active applications found</div>
            ) : (
              <div className="space-y-4">
                {activeApplications.map((app) => {
                  const approvedSteps = app.steps?.filter(step => step.status === 'Approved').length || 0;
                  const totalSteps = app.steps?.length || 0;
                  
                  return (
                    <div key={app._id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <p className="font-medium">
                            {app.customer?.firstName} {app.customer?.lastName}
                          </p>
                          <Badge variant="outline" className="text-xs">
                            {app._id}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {app.customer?.email} • Step {approvedSteps}/{totalSteps}
                        </p>
                        <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2">
                          <div
                            className="bg-gradient-to-r from-primary to-secondary h-1.5 rounded-full"
                            style={{ width: `${(approvedSteps / totalSteps) * 100}%` }}
                          />
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 ml-4">
                        <Badge 
                          variant={app.status === 'In Progress' ? 'secondary' : 'default'}
                          className={
                            app.status === 'In Progress' 
                              ? 'bg-yellow-100 text-yellow-800' 
                              : ''
                          }
                        >
                          {app.status}
                        </Badge>
                        <Button size="sm" variant="outline" asChild>
                          <Link to={`/agent/applications`}>
                            View
                          </Link>
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Today's Tasks</CardTitle>
            <CardDescription>Your priority tasks for today</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center space-x-3 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                <Clock className="h-5 w-5 text-yellow-600" />
                <div>
                  <p className="font-medium text-yellow-900">Review KYC Documents</p>
                  <p className="text-sm text-yellow-700">
                    {applications.filter(app => app.status === 'Waiting for Agent Review').length} customers waiting for verification
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <MessageSquare className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="font-medium text-blue-900">Customer Messages</p>
                  <p className="text-sm text-blue-700">5 unread messages requiring response</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg border border-green-200">
                <FileText className="h-5 w-5 text-green-600" />
                <div>
                  <p className="font-medium text-green-900">License Applications</p>
                  <p className="text-sm text-green-700">
                    {applications.filter(app => app.status === 'Ready for Processing').length} applications ready for submission
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common tasks and shortcuts</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Button asChild className="h-16 bg-primary hover:bg-primary/90">
              <Link to="/agent/applications" className="flex flex-col items-center">
                <FileText className="h-6 w-6 mb-1" />
                <span className="text-sm">View Applications</span>
              </Link>
            </Button>
            
            <Button asChild variant="outline" className="h-16">
              <Link to="/agent/customers" className="flex flex-col items-center">
                <Users className="h-6 w-6 mb-1" />
                <span className="text-sm">Manage Customers</span>
              </Link>
            </Button>
            
            <Button asChild variant="outline" className="h-16">
              <Link to="/agent/chat" className="flex flex-col items-center">
                <MessageSquare className="h-6 w-6 mb-1" />
                <span className="text-sm">Customer Chat</span>
              </Link>
            </Button>
            
            <Button variant="outline" className="h-16 flex flex-col items-center">
              <DollarSign className="h-6 w-6 mb-1" />
              <span className="text-sm">Create Invoice</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};


import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Users, Shield, FileText, Bell, TrendingUp, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';

export const ManagerDashboard: React.FC = () => {
  const stats = {
    totalAgents: 5,
    totalCustomers: 48,
    activeApplications: 23,
    completedApplications: 25,
    pendingPayments: 8,
    notifications: 12,
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-primary">Manager Dashboard</h1>
        <p className="text-muted-foreground">Overview of all operations and performance</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Agents</p>
                <p className="text-2xl font-bold">{stats.totalAgents}</p>
              </div>
              <Shield className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Customers</p>
                <p className="text-2xl font-bold">{stats.totalCustomers}</p>
              </div>
              <Users className="h-8 w-8 text-secondary" />
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
              <FileText className="h-8 w-8 text-blue-600" />
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
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pending Payments</p>
                <p className="text-2xl font-bold">{stats.pendingPayments}</p>
              </div>
              <Clock className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Notifications</p>
                <p className="text-2xl font-bold">{stats.notifications}</p>
              </div>
              <Bell className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Agents */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Agents</CardTitle>
            <CardDescription>Newly added agents</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { name: 'Sarah Johnson', email: 'sarah.agent@waflow.com', customers: 12, status: 'active' },
                { name: 'Ahmed Hassan', email: 'ahmed.agent@waflow.com', customers: 8, status: 'active' },
                { name: 'Maria Rodriguez', email: 'maria.agent@waflow.com', customers: 15, status: 'active' },
              ].map((agent, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">{agent.name}</p>
                    <p className="text-sm text-muted-foreground">{agent.email}</p>
                    <p className="text-xs text-muted-foreground">{agent.customers} customers</p>
                  </div>
                  <Badge variant="default" className="bg-green-100 text-green-800">
                    {agent.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common management tasks</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-3">
              <Button asChild className="h-12 bg-primary hover:bg-primary/90">
                <Link to="/manager/agents" className="flex items-center">
                  <Shield className="h-5 w-5 mr-2" />
                  <span>Manage Agents</span>
                </Link>
              </Button>
              
              <Button asChild variant="outline" className="h-12">
                <Link to="/manager/applications" className="flex items-center">
                  <FileText className="h-5 w-5 mr-2" />
                  <span>View All Applications</span>
                </Link>
              </Button>
              
              <Button asChild variant="outline" className="h-12">
                <Link to="/manager/customers" className="flex items-center">
                  <Users className="h-5 w-5 mr-2" />
                  <span>View All Customers</span>
                </Link>
              </Button>
              
              <Button asChild variant="outline" className="h-12">
                <Link to="/manager/directory" className="flex items-center">
                  <FileText className="h-5 w-5 mr-2" />
                  <span>Document Directory</span>
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

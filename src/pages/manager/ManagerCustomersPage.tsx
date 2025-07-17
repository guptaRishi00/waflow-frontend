import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Eye, Search, Mail, Phone, Building, Filter, MessageSquare } from 'lucide-react';
import { Link } from 'react-router-dom';
import { CustomerNotesPage } from '@/components/common/CustomerNotesPage';
import { ApplicationDetailsModal } from '@/components/common/ApplicationDetailsModal';
import { mockApplications } from '@/lib/mock-data';
import type { Application } from '@/types';

// Mock customer data
const mockCustomers = [
  {
    id: 'CUST-001',
    name: 'Ahmed Al Mansouri',
    email: 'ahmed.mansouri@email.com',
    phone: '+971501234567',
    nationality: 'UAE',
    status: 'active',
    totalApplications: 2,
    agentId: 'AGT-001',
    agentName: 'Sarah Johnson',
    createdAt: '2024-01-15',
    lastActivity: '2024-01-20',
    applicationId: 'APP-001'
  },
  {
    id: 'CUST-002',
    name: 'Maria Rodriguez',
    email: 'maria.rodriguez@email.com',
    phone: '+971509876543',
    nationality: 'Spain',
    status: 'active',
    totalApplications: 1,
    agentId: 'AGT-002',
    agentName: 'Ahmed Hassan',
    createdAt: '2024-01-10',
    lastActivity: '2024-01-18',
    applicationId: 'APP-002'
  },
  {
    id: 'CUST-003',
    name: 'John Smith',
    email: 'john.smith@email.com',
    phone: '+971505555555',
    nationality: 'UK',
    status: 'pending',
    totalApplications: 1,
    agentId: null,
    agentName: null,
    createdAt: '2024-01-12',
    lastActivity: '2024-01-16',
    applicationId: 'APP-003'
  }
];

export const ManagerCustomersPage: React.FC = () => {
  const [customers] = useState(mockCustomers);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [showNotesPage, setShowNotesPage] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [isApplicationModalOpen, setIsApplicationModalOpen] = useState(false);

  const filteredCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleViewCustomer = (customer: any) => {
    // Find the application associated with this customer
    const application = mockApplications.find(app => app.id === customer.applicationId);
    if (application) {
      setSelectedApplication(application);
      setIsApplicationModalOpen(true);
    }
  };

  const handleViewNotes = (customer: any) => {
    setSelectedCustomer(customer);
    setShowNotesPage(true);
  };

  if (showNotesPage && selectedCustomer) {
    return (
      <CustomerNotesPage
        customerId={selectedCustomer.id}
        customerName={selectedCustomer.name}
        applicationId={selectedCustomer.applicationId}
        onBack={() => {
          setShowNotesPage(false);
          setSelectedCustomer(null);
        }}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-primary">All Customers</h1>
        <p className="text-muted-foreground">
          Overview of all customers across all agents
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-primary">{customers.length}</p>
              <p className="text-sm text-muted-foreground">Total Customers</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">
                {customers.filter(c => c.status === 'active').length}
              </p>
              <p className="text-sm text-muted-foreground">Active</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-yellow-600">
                {customers.filter(c => c.status === 'pending').length}
              </p>
              <p className="text-sm text-muted-foreground">Pending Assignment</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">
                {customers.reduce((sum, c) => sum + c.totalApplications, 0)}
              </p>
              <p className="text-sm text-muted-foreground">Total Applications</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Customer Directory</CardTitle>
              <CardDescription>Search and manage all customers</CardDescription>
            </div>
            <div className="flex space-x-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search customers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3">Customer ID</th>
                  <th className="text-left p-3">Name</th>
                  <th className="text-left p-3">Contact</th>
                  <th className="text-left p-3">Nationality</th>
                  <th className="text-left p-3">Status</th>
                  <th className="text-left p-3">Applications</th>
                  <th className="text-left p-3">Assigned Agent</th>
                  <th className="text-left p-3">Last Activity</th>
                  <th className="text-left p-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredCustomers.map((customer) => (
                  <tr key={customer.id} className="border-b hover:bg-gray-50">
                    <td className="p-3">
                      <Badge variant="outline" className="font-mono text-xs">
                        {customer.id}
                      </Badge>
                    </td>
                    <td className="p-3">
                      <div>
                        <p className="font-medium">{customer.name}</p>
                        <p className="text-sm text-muted-foreground flex items-center mt-1">
                          <Mail className="h-3 w-3 mr-1" />
                          {customer.email}
                        </p>
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="text-sm flex items-center">
                        <Phone className="h-3 w-3 mr-1" />
                        {customer.phone}
                      </div>
                    </td>
                    <td className="p-3">{customer.nationality}</td>
                    <td className="p-3">
                      <Badge 
                        variant={customer.status === 'active' ? 'default' : 'secondary'}
                        className={
                          customer.status === 'active' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }
                      >
                        {customer.status}
                      </Badge>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center">
                        <Building className="h-4 w-4 mr-1 text-muted-foreground" />
                        <span className="font-medium">{customer.totalApplications}</span>
                      </div>
                    </td>
                    <td className="p-3">
                      {customer.agentName ? (
                        <div className="text-sm">
                          <p className="font-medium">{customer.agentName}</p>
                          <p className="text-muted-foreground">{customer.agentId}</p>
                        </div>
                      ) : (
                        <Badge variant="outline">Unassigned</Badge>
                      )}
                    </td>
                    <td className="p-3 text-sm text-muted-foreground">
                      {new Date(customer.lastActivity).toLocaleDateString()}
                    </td>
                    <td className="p-3">
                      <div className="flex space-x-1">
                        <Button 
                          size="sm" 
                          variant="ghost"
                          onClick={() => handleViewCustomer(customer)}
                          title="View Customer Details"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="ghost"
                          onClick={() => handleViewNotes(customer)}
                          title="View Notes"
                        >
                          <MessageSquare className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

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

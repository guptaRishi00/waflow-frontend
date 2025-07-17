
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Search, MessageSquare, FileText, Phone, Mail, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';

interface Customer {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  companyType?: string;
  createdAt: string;
  assignedAgentId?: string;
}

interface Application {
  _id: string;
  customer: string;
  status: string;
  steps: Array<{
    stepName: string;
    status: string;
  }>;
  createdAt: string;
}

export const CustomersPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  // Fetch customers and applications from backend
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          console.log('No token found');
          return;
        }

        // Decode token to get agent ID
        const tokenPayload = JSON.parse(atob(token.split('.')[1]));
        const agentId = tokenPayload.userId || tokenPayload.id;
        console.log('Agent ID:', agentId);

        // Fetch all customers
        const customersResponse = await fetch(`${import.meta.env.VITE_BASE_URL}/api/user/customers`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (customersResponse.ok) {
          const customersData = await customersResponse.json();
          const agentCustomers = customersData.data.filter((customer: Customer) => 
            customer.assignedAgentId === agentId
          );
          setCustomers(agentCustomers);
          
          if (agentCustomers.length > 0) {
            setSelectedCustomer(agentCustomers[0]);
          }
        }

        // Temporarily comment out applications fetch to isolate the issue
        /*
        // Fetch applications
        const applicationsResponse = await fetch(`${import.meta.env.VITE_BASE_URL}/api/application/applications`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (applicationsResponse.ok) {
          const applicationsData = await applicationsResponse.json();
          setApplications(applicationsData.data || []);
        }
        */

      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const getCustomerApplications = (customerId: string) => {
    return applications.filter(app => app.customer === customerId);
  };

  const getCustomerName = (customer: Customer) => {
    return `${customer.firstName} ${customer.lastName}`;
  };

  const getCustomerInitials = (customer: Customer) => {
    return `${customer.firstName[0]}${customer.lastName[0]}`;
  };

  const getCurrentStep = (app: Application) => {
    return app.steps.filter(step => step.status === 'Submitted' || step.status === 'Approved').length;
  };

  const filteredCustomers = customers.filter(customer =>
    getCustomerName(customer).toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-primary">Customer Management</h1>
          <p className="text-muted-foreground">
            View and manage your assigned customers
          </p>
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="text-muted-foreground">Loading customers...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-primary">Customer Management</h1>
        <p className="text-muted-foreground">
          View and manage your assigned customers
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Customers List */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Customers</CardTitle>
            <CardDescription>All assigned customers</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search customers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-3">
              {filteredCustomers.map((customer) => {
                const customerApps = getCustomerApplications(customer._id);
                return (
                  <div
                    key={customer._id}
                    className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                      selectedCustomer?._id === customer._id 
                        ? 'border-primary bg-primary/5' 
                        : 'hover:bg-gray-50'
                    }`}
                    onClick={() => setSelectedCustomer(customer)}
                  >
                    <div className="flex items-center space-x-3">
                      <Avatar>
                        <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                          {getCustomerInitials(customer)}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{getCustomerName(customer)}</p>
                        <p className="text-xs text-muted-foreground truncate">{customer.email}</p>
                        <div className="flex items-center mt-1">
                          <Badge variant="outline" className="text-xs">
                            {customerApps.length} Apps
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Customer Details */}
        <div className="lg:col-span-2 space-y-6">
          {selectedCustomer && (
            <>
              {/* Customer Profile */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <Avatar className="w-16 h-16">
                        <AvatarFallback className="bg-primary text-primary-foreground text-lg">
                          {getCustomerInitials(selectedCustomer)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle>{getCustomerName(selectedCustomer)}</CardTitle>
                        <CardDescription>
                          Customer since {new Date(selectedCustomer.createdAt).toLocaleDateString()}
                        </CardDescription>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Button size="sm" variant="outline" asChild>
                        <Link to={`/agent/chat?customer=${selectedCustomer._id}`}>
                          <MessageSquare className="h-4 w-4 mr-1" />
                          Chat
                        </Link>
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex items-center space-x-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{selectedCustomer.email}</span>
                    </div>
                    
                    {selectedCustomer.phoneNumber && (
                      <div className="flex items-center space-x-2">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{selectedCustomer.phoneNumber}</span>
                      </div>
                    )}
                    
                    <div className="flex items-center space-x-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">UAE</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Customer Applications */}
              <Card>
                <CardHeader>
                  <CardTitle>Applications</CardTitle>
                  <CardDescription>
                    Business registration applications for this customer
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {(() => {
                    const customerApps = getCustomerApplications(selectedCustomer._id);
                    return customerApps.length > 0 ? (
                      <div className="space-y-4">
                        {customerApps.map((app) => (
                          <div key={app._id} className="p-4 border rounded-lg">
                            <div className="flex items-center justify-between mb-3">
                              <div>
                                <h4 className="font-semibold">{getCustomerName(selectedCustomer)}</h4>
                                <p className="text-sm text-muted-foreground">
                                  {app._id} • {selectedCustomer.companyType || 'Individual'}
                                </p>
                              </div>
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
                            
                            <div className="mb-3">
                              <div className="flex items-center justify-between text-sm mb-1">
                                <span>Progress</span>
                                <span>{getCurrentStep(app)}/8 steps</span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div
                                  className="bg-gradient-to-r from-primary to-secondary h-2 rounded-full"
                                  style={{ width: `${(getCurrentStep(app) / 8) * 100}%` }}
                                />
                              </div>
                            </div>
                            
                            <div className="flex items-center space-x-2">
                              <Button size="sm" variant="outline" asChild>
                                <Link to={`/agent/applications`}>
                                  <FileText className="h-4 w-4 mr-1" />
                                  Manage
                                </Link>
                              </Button>
                              
                              <Button size="sm" variant="outline" asChild>
                                <Link to={`/agent/chat?application=${app._id}`}>
                                  <MessageSquare className="h-4 w-4 mr-1" />
                                  Chat
                                </Link>
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <p className="text-muted-foreground">No applications found for this customer</p>
                      </div>
                    );
                  })()}
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

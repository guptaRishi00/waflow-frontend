import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
// import { useAuth } from '@/contexts/AuthContext';
import { useToast } from "@/hooks/use-toast";
import { useSelector } from "react-redux";
import { RootState } from "@/app/store";

export const ManagerSettings: React.FC = () => {
  const { token, user } = useSelector((state: RootState) => state.customerAuth);
  const { toast } = useToast();

  const [profileData, setProfileData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
    department: "Operations Management",
    permissions: "Full Access",
  });

  const handleProfileUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Profile Updated",
      description: "Your profile information has been updated successfully.",
    });
  };

  const handlePasswordReset = () => {
    toast({
      title: "Password Reset",
      description: "Password reset instructions have been sent to your email.",
    });
  };

  const managerStats = {
    totalAgents: 5,
    totalCustomers: 48,
    totalApplications: 48,
    systemUptime: "99.9%",
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-primary">Manager Settings</h1>
        <p className="text-muted-foreground">
          Manage your manager profile and system settings
        </p>
      </div>

      {/* System Overview */}
      <Card>
        <CardHeader>
          <CardTitle>System Overview</CardTitle>
          <CardDescription>Current system status and metrics</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center p-4 border rounded-lg">
              <p className="text-2xl font-bold text-primary">
                {managerStats.totalAgents}
              </p>
              <p className="text-sm text-muted-foreground">Active Agents</p>
            </div>

            <div className="text-center p-4 border rounded-lg">
              <p className="text-2xl font-bold text-secondary">
                {managerStats.totalCustomers}
              </p>
              <p className="text-sm text-muted-foreground">Total Customers</p>
            </div>

            <div className="text-center p-4 border rounded-lg">
              <p className="text-2xl font-bold text-blue-600">
                {managerStats.totalApplications}
              </p>
              <p className="text-sm text-muted-foreground">Applications</p>
            </div>

            <div className="text-center p-4 border rounded-lg">
              <p className="text-2xl font-bold text-green-600">
                {managerStats.systemUptime}
              </p>
              <p className="text-sm text-muted-foreground">System Uptime</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Profile Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Profile Information</CardTitle>
          <CardDescription>
            Update your manager profile and contact information
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleProfileUpdate} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  value={profileData.name}
                  onChange={(e) =>
                    setProfileData((prev) => ({
                      ...prev,
                      name: e.target.value,
                    }))
                  }
                />
              </div>

              <div>
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={profileData.email}
                  onChange={(e) =>
                    setProfileData((prev) => ({
                      ...prev,
                      email: e.target.value,
                    }))
                  }
                />
              </div>

              <div>
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  value={profileData.phone}
                  onChange={(e) =>
                    setProfileData((prev) => ({
                      ...prev,
                      phone: e.target.value,
                    }))
                  }
                  placeholder="+971 50 123 4567"
                />
              </div>

              <div>
                <Label htmlFor="department">Department</Label>
                <Input
                  id="department"
                  value={profileData.department}
                  onChange={(e) =>
                    setProfileData((prev) => ({
                      ...prev,
                      department: e.target.value,
                    }))
                  }
                />
              </div>
            </div>

            <Button type="submit" className="bg-primary hover:bg-primary/90">
              Update Profile
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Manager Permissions */}
      <Card>
        <CardHeader>
          <CardTitle>Manager Permissions</CardTitle>
          <CardDescription>
            Your current access level and permissions
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Access Level</p>
              <p className="text-sm text-muted-foreground">
                Full system access
              </p>
            </div>
            <Badge className="bg-blue-100 text-blue-800">Manager</Badge>
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Agent Management</p>
              <p className="text-sm text-muted-foreground">
                Can create, edit, and manage agents
              </p>
            </div>
            <Badge className="bg-green-100 text-green-800">Enabled</Badge>
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Customer Management</p>
              <p className="text-sm text-muted-foreground">
                Can view and manage all customers
              </p>
            </div>
            <Badge className="bg-green-100 text-green-800">Enabled</Badge>
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Document Access</p>
              <p className="text-sm text-muted-foreground">
                Can view and manage all documents
              </p>
            </div>
            <Badge className="bg-green-100 text-green-800">Enabled</Badge>
          </div>
        </CardContent>
      </Card>

      {/* Security Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Security</CardTitle>
          <CardDescription>
            Manage your account security settings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-medium mb-2">Password</h4>
            <p className="text-sm text-muted-foreground mb-3">
              Reset your password to keep your account secure
            </p>
            <Button variant="outline" onClick={handlePasswordReset}>
              Reset Password
            </Button>
          </div>

          <Separator />

          <div>
            <h4 className="font-medium mb-2">Two-Factor Authentication</h4>
            <p className="text-sm text-muted-foreground mb-3">
              Add an extra layer of security to your account
            </p>
            <Button variant="outline" disabled>
              Enable 2FA (Coming Soon)
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Account Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Account Actions</CardTitle>
          <CardDescription>Manage your account status and data</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-medium mb-2">Sign Out</h4>
            <p className="text-sm text-muted-foreground mb-3">
              Sign out of your account on this device
            </p>
            <Button variant="outline">Sign Out</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

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

export const AgentSettings: React.FC = () => {
  const { token, user } = useSelector((state: RootState) => state.customerAuth);
  const { toast } = useToast();

  const [profileData, setProfileData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
    specialization: "Business Registration",
    languages: "English, Arabic",
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

  const agentStats = {
    totalClients: 12,
    completedApplications: 4,
    activeApplications: 8,
    customerSatisfaction: 4.8,
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-primary">Agent Settings</h1>
        <p className="text-muted-foreground">
          Manage your agent profile and account settings
        </p>
      </div>

      {/* Agent Performance */}
      <Card>
        <CardHeader>
          <CardTitle>Performance Overview</CardTitle>
          <CardDescription>
            Your performance metrics and statistics
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center p-4 border rounded-lg">
              <p className="text-2xl font-bold text-primary">
                {agentStats.totalClients}
              </p>
              <p className="text-sm text-muted-foreground">Total Clients</p>
            </div>

            <div className="text-center p-4 border rounded-lg">
              <p className="text-2xl font-bold text-green-600">
                {agentStats.completedApplications}
              </p>
              <p className="text-sm text-muted-foreground">Completed Apps</p>
            </div>

            <div className="text-center p-4 border rounded-lg">
              <p className="text-2xl font-bold text-secondary">
                {agentStats.activeApplications}
              </p>
              <p className="text-sm text-muted-foreground">Active Apps</p>
            </div>

            <div className="text-center p-4 border rounded-lg">
              <p className="text-2xl font-bold text-primary">
                {agentStats.customerSatisfaction}/5
              </p>
              <p className="text-sm text-muted-foreground">Customer Rating</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Profile Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Profile Information</CardTitle>
          <CardDescription>
            Update your professional details and contact information
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
                <Label htmlFor="specialization">Specialization</Label>
                <Input
                  id="specialization"
                  value={profileData.specialization}
                  onChange={(e) =>
                    setProfileData((prev) => ({
                      ...prev,
                      specialization: e.target.value,
                    }))
                  }
                />
              </div>

              <div className="md:col-span-2">
                <Label htmlFor="languages">Languages</Label>
                <Input
                  id="languages"
                  value={profileData.languages}
                  onChange={(e) =>
                    setProfileData((prev) => ({
                      ...prev,
                      languages: e.target.value,
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

      {/* Agent Status */}
      <Card>
        <CardHeader>
          <CardTitle>Agent Status</CardTitle>
          <CardDescription>
            Your current status and certifications
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Account Status</p>
              <p className="text-sm text-muted-foreground">
                Your agent account status
              </p>
            </div>
            <Badge className="bg-green-100 text-green-800">Active</Badge>
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Certification</p>
              <p className="text-sm text-muted-foreground">
                UAE Business Registration Certified
              </p>
            </div>
            <Badge className="bg-blue-100 text-blue-800">Verified</Badge>
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Availability</p>
              <p className="text-sm text-muted-foreground">
                Currently accepting new clients
              </p>
            </div>
            <Badge className="bg-green-100 text-green-800">Available</Badge>
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

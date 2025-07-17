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
// import { useAuth } from '@/contexts/AuthContext';
import { useToast } from "@/hooks/use-toast";
import { useSelector } from "react-redux";
import { RootState } from "@/app/store";

export const CustomerSettings: React.FC = () => {
  const { token, user } = useSelector((state: RootState) => state.customerAuth);
  const { toast } = useToast();

  const [profileData, setProfileData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-primary">Settings</h1>
        <p className="text-muted-foreground">
          Manage your account settings and preferences
        </p>
      </div>

      {/* Profile Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Profile Information</CardTitle>
          <CardDescription>
            Update your personal details and contact information
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

              <div className="md:col-span-2">
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
            </div>

            <Button type="submit" className="bg-primary hover:bg-primary/90">
              Update Profile
            </Button>
          </form>
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

          <Separator />

          <div>
            <h4 className="font-medium mb-2 text-red-600">Danger Zone</h4>
            <p className="text-sm text-muted-foreground mb-3">
              Permanently delete your account and all associated data
            </p>
            <Button variant="destructive" disabled>
              Delete Account (Contact Support)
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

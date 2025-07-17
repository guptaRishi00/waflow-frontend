import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
// import { useAuth } from '@/contexts/AuthContext';
import { useToast } from "@/hooks/use-toast";
import { useSelector } from "react-redux";
import { RootState } from "@/app/store";

interface SignupFormProps {
  onSwitchToLogin: () => void;
}

export const SignupForm: React.FC<SignupFormProps> = ({ onSwitchToLogin }) => {
  const [formData, setFormData] = useState({
    email: "",
    name: "",
    phone: "",
    role: "" as "customer" | "agent" | "manager" | "",
  });
  const [isLoading, setIsLoading] = useState(false);

  const { token, user } = useSelector((state: RootState) => state.customerAuth);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.role) {
      toast({
        title: "Role Required",
        description: "Please select your role to continue.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    // const success = await signup(
    //   formData.email,
    //   formData.name,
    //   formData.role,
    //   formData.phone
    // );

    setIsLoading(false);

    const success = true;

    if (!success) {
      toast({
        title: "Signup Failed",
        description: "Unable to create account. Please try again.",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Account Created",
        description: "Your account has been created successfully!",
      });
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <div className="waflow-gradient w-12 h-12 rounded-lg mx-auto mb-4 flex items-center justify-center">
          <span className="text-white font-bold text-xl">W</span>
        </div>
        <CardTitle className="text-2xl waflow-text-gradient">
          Join Waflow
        </CardTitle>
        <CardDescription>
          Create your account to start your UAE business registration
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, name: e.target.value }))
              }
              placeholder="Enter your full name"
              required
            />
          </div>

          <div>
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, email: e.target.value }))
              }
              placeholder="Enter your email"
              required
            />
          </div>

          <div>
            <Label htmlFor="phone">Phone Number (Optional)</Label>
            <Input
              id="phone"
              type="tel"
              value={formData.phone}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, phone: e.target.value }))
              }
              placeholder="+971 50 123 4567"
            />
          </div>

          <div>
            <Label htmlFor="role">I am a...</Label>
            <Select
              value={formData.role}
              onValueChange={(value: "customer" | "agent" | "manager") =>
                setFormData((prev) => ({ ...prev, role: value }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select your role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="customer">
                  Customer - I want to register a business
                </SelectItem>
                <SelectItem value="agent">
                  Agent - I help customers with registrations
                </SelectItem>
                <SelectItem value="manager">
                  Manager - I oversee agents and operations
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button
            type="submit"
            className="w-full bg-primary hover:bg-primary/90"
            disabled={isLoading}
          >
            {isLoading ? "Creating Account..." : "Create Account"}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Already have an account?{" "}
            <button
              onClick={onSwitchToLogin}
              className="text-primary hover:underline font-medium"
            >
              Login
            </button>
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

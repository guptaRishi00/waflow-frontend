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
import { useToast } from "@/hooks/use-toast";
import {
  ArrowRight,
  FileText,
  UserRound,
  Briefcase,
  Badge,
  Eye,
  EyeOff,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

import { fetchCustomer, loginSuccess } from "@/features/customerAuthSlice";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/app/store";
import { useEffect } from "react";

interface LoginFormProps {
  onSwitchToSignup: () => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({ onSwitchToSignup }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { token, user } = useSelector((state: RootState) => state.customerAuth);

  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      console.log("Redux user after login:", user);
      if (user.role === "customer") navigate("/customer/dashboard");
      else if (user.role === "agent") navigate("/agent/dashboard");
      else if (user.role === "manager") navigate("/manager/dashboard");
    }
  }, [user, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await axios.post(
        import.meta.env.VITE_BASE_URL + "/api/auth/login",
        { email, password }
      );

      if (response.status === 200) {
        const data = response.data;
        dispatch(loginSuccess({ token: data.token }));
        await dispatch(fetchCustomer());
      } else {
        toast({
          title: "Login Failed",
          description: "Invalid email or password. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Login Failed",
        description: "Invalid email or password. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = async (demoEmail: string, demoPassword: string) => {
    setIsLoading(true);
    setEmail(demoEmail);
    setPassword(demoPassword);

    try {
      const response = await axios.post(
        import.meta.env.VITE_BASE_URL + "/api/auth/login",
        {
          email: demoEmail,
          password: demoPassword,
        }
      );

      if (response.status === 200) {
        const data = response.data;

        dispatch(loginSuccess({ token: data.token }));
        await dispatch(fetchCustomer());

        console.log("login form: ", data);

        navigate("/customer/dashboard");
      }
    } catch (error) {
      console.error("Error logging in", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* New Registration Entry Module */}
      <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-secondary/5">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="waflow-gradient w-12 h-12 rounded-lg flex items-center justify-center">
                <FileText className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-lg waflow-text-gradient">
                  Begin Company Registration Process
                </h3>
                <p className="text-sm text-muted-foreground">
                  Start your UAE business registration - Step-by-Step guided
                  form
                </p>
              </div>
            </div>
            <Button asChild className="bg-primary hover:bg-primary/90">
              <Link to="/start-registration">
                Start Now
                <ArrowRight className="h-4 w-4 ml-2" />
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Login Form */}
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="waflow-gradient w-12 h-12 rounded-lg mx-auto mb-4 flex items-center justify-center">
            <span className="text-white font-bold text-xl">W</span>
          </div>
          <CardTitle className="text-2xl waflow-text-gradient">
            Welcome to Waflow
          </CardTitle>
          <CardDescription>
            Enter your credentials to access your account
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form className="space-y-4">
            <div>
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
              />
            </div>

            <div>
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-primary hover:bg-primary/90"
              disabled={isLoading}
              onClick={(e) => handleLogin(e)}
            >
              {isLoading ? "Logging in..." : "Login"}
            </Button>
          </form>

          {/* Demo Login Buttons */}
          <div className="mt-6 space-y-3">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  Demo Login
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() =>
                  handleDemoLogin("manager_demo@waflow.com", "manager123")
                }
                disabled={isLoading}
              >
                <Badge className="h-4 w-4 mr-2" />
                Login as Demo Manager
              </Button>

              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() =>
                  handleDemoLogin("agent_demo@waflow.com", "agent123")
                }
                disabled={isLoading}
              >
                <Briefcase className="h-4 w-4 mr-2" />
                Login as Demo Agent
              </Button>

              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() =>
                  handleDemoLogin("customer_demo@waflow.com", "customer123")
                }
                disabled={isLoading}
              >
                <UserRound className="h-4 w-4 mr-2" />
                Login as Demo Customer
              </Button>
            </div>
          </div>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Don't have an account?{" "}
              <button
                onClick={onSwitchToSignup}
                className="text-primary hover:underline font-medium"
              >
                Sign up
              </button>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

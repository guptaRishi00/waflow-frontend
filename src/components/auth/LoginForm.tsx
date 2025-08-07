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
import api from "@/lib/api";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/app/store";
import { useEffect } from "react";

interface LoginFormProps {}

export const LoginForm: React.FC<LoginFormProps> = () => {
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
      const response = await api.post(
        import.meta.env.VITE_BASE_URL + "/api/auth/login",
        { email, password },
        {
          withCredentials: true,
        }
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
      const response = await api.post(
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

          <div className="mt-6 text-center">
            <Link
              to="/forgot-password"
              className="text-sm text-primary hover:text-primary/80 underline"
            >
              Forgot Password?
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

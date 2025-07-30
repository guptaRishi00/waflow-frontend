import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Users, Shield, FileText, Bell, TrendingUp, Clock } from "lucide-react";
import { Link } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import axios from "axios";
import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/app/store";

export const ManagerDashboard: React.FC = () => {
  const { toast } = useToast();
  const { token } = useSelector((state: RootState) => state.customerAuth);
  // Move recent agents to state
  const [recentAgents, setRecentAgents] = useState<any[]>([]);

  // Fetch agents from backend on mount
  useEffect(() => {
    const fetchAgents = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_BASE_URL}/api/user/agents`,
          {
            headers: { Authorization: `Bearer ${token}` },
            withCredentials: true,
          }
        );
        setRecentAgents(res.data.data || []);
      } catch (err) {
        setRecentAgents([]);
      }
    };
    if (token) fetchAgents();
  }, [token]);

  console.log("Recent Agents:", recentAgents.length);

  const [allCustomers, setAllCustomers] = useState<any[]>([]);

  useEffect(() => {
    const fetchCustomer = async () => {
      const response = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/api/user/customers`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setAllCustomers(response.data.data || []);
    };
    fetchCustomer();
  }, []);

  const [allApplications, setAllApplications] = useState<any[]>([]);

  useEffect(() => {
    const fetchApplication = async () => {
      const response = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/api/application`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setAllApplications(response.data.data || []);
    };
    fetchApplication();
  }, []);

  console.log("All Applications:", allApplications.length);

  const stats = {
    totalAgents: recentAgents.length,
    totalCustomers: allCustomers.length,
    activeApplications: allApplications.length,
    completedApplications: 25,
    pendingPayments: 8,
    notifications: 12,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <div className="">
          <h1 className="text-3xl font-bold text-primary">Manager Dashboard</h1>
          <p className="text-muted-foreground">
            Overview of all operations and performance
          </p>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 gap-4">
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
                <p className="text-sm text-muted-foreground">All Application</p>
                <p className="text-2xl font-bold">{stats.activeApplications}</p>
              </div>
              <FileText className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
        {/* Recent Agents */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Agents</CardTitle>
            <CardDescription>Newly added agents</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentAgents.map((agent, index) => (
                <div
                  key={String(
                    ("fullName" in agent && agent.fullName) ||
                      agent.email ||
                      index
                  )}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div>
                    <p className="font-medium">
                      {String(
                        "fullName" in agent ? agent.fullName : agent.name
                      )}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {agent.email}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {agent.customers ?? 0} customers
                    </p>
                  </div>
                  <Badge
                    variant="default"
                    className="bg-green-100 text-green-800"
                  >
                    {agent.status || "active"}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
      </div>
    </div>
  );
};

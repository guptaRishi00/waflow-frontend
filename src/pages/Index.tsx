import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  CheckCircle,
  Users,
  FileText,
  MessageSquare,
  Shield,
  Globe,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { RootState } from "@/app/store";
// import { useAuth } from '@/contexts/AuthContext';

const Index = () => {
  const { token, user } = useSelector((state: RootState) => state.customerAuth);

  const features = [
    {
      icon: <FileText className="h-8 w-8 text-primary" />,
      title: "Complete Registration",
      description:
        "Full-service UAE business registration from start to finish",
    },
    {
      icon: <Users className="h-8 w-8 text-secondary" />,
      title: "Dedicated Agents",
      description: "Personal agent assigned to guide you through every step",
    },
    {
      icon: <MessageSquare className="h-8 w-8 text-primary" />,
      title: "Real-time Communication",
      description: "Chat directly with your agent and track progress instantly",
    },
    {
      icon: <Shield className="h-8 w-8 text-secondary" />,
      title: "Secure & Compliant",
      description: "Bank-level security with full UAE regulatory compliance",
    },
    {
      icon: <Globe className="h-8 w-8 text-primary" />,
      title: "All Business Types",
      description: "Freezone, Mainland, and Offshore company registration",
    },
    {
      icon: <CheckCircle className="h-8 w-8 text-secondary" />,
      title: "End-to-End Service",
      description: "From license to bank account, we handle everything",
    },
  ];

  const businessTypes = [
    {
      type: "Freezone",
      description: "100% foreign ownership, tax benefits, easy setup",
      benefits: [
        "No corporate tax",
        "100% profit repatriation",
        "No currency restrictions",
      ],
    },
    {
      type: "Mainland",
      description: "Trade anywhere in UAE, government contracts eligible",
      benefits: [
        "UAE market access",
        "Government contracts",
        "Local partnerships",
      ],
    },
    {
      type: "Offshore",
      description: "Asset protection, international business, tax optimization",
      benefits: [
        "Asset protection",
        "Tax optimization",
        "International flexibility",
      ],
    },
  ];

  if (user) {
    const dashboardPath =
      user.role === "customer" ? "/customer/dashboard" : "/agent/dashboard";
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
        <div className="container mx-auto px-4 py-16 text-center">
          <div className="waflow-gradient w-16 h-16 rounded-lg mx-auto mb-6 flex items-center justify-center">
            <span className="text-white font-bold text-2xl">W</span>
          </div>
          <h1 className="text-4xl font-bold waflow-text-gradient mb-4">
            Welcome back to Waflow!
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Continue managing your UAE business registration
          </p>
          <Button asChild size="lg" className="bg-primary hover:bg-primary/90">
            <Link to={dashboardPath}>Go to Dashboard</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      {/* Navigation */}
      <nav className="container mx-auto px-4 py-6 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="waflow-gradient w-10 h-10 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-lg">W</span>
          </div>
          <span className="text-2xl font-bold waflow-text-gradient">
            Waflow
          </span>
        </div>

        <div className="flex items-center space-x-4">
          <Button variant="ghost" asChild>
            <Link to="/auth">Login</Link>
          </Button>
          <Button asChild className="bg-primary hover:bg-primary/90">
            <Link to="/auth">Get Started</Link>
          </Button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-5xl md:text-6xl font-bold mb-6">
          Start Your UAE Business
          <span className="block waflow-text-gradient">Registration Today</span>
        </h1>
        <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
          Streamlined, secure, and fully managed UAE business registration
          platform. Get your license, visa, and bank account setup with
          dedicated agent support.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
          <Button
            size="lg"
            asChild
            className="bg-primary hover:bg-primary/90 px-8"
          >
            <Link to="/auth">Start Registration</Link>
          </Button>
          <Button size="lg" variant="outline" className="px-8">
            View Pricing
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-2xl mx-auto">
          <div className="text-center">
            <div className="text-3xl font-bold text-primary">15,000+</div>
            <div className="text-sm text-muted-foreground">
              Companies Registered
            </div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-secondary">98%</div>
            <div className="text-sm text-muted-foreground">Success Rate</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-primary">24/7</div>
            <div className="text-sm text-muted-foreground">Agent Support</div>
          </div>
        </div>
      </section>

      {/* Business Types */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Choose Your Business Structure
          </h2>
          <p className="text-xl text-muted-foreground">
            We support all major UAE business registration types
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {businessTypes.map((business) => (
            <Card
              key={business.type}
              className="p-6 hover:shadow-lg transition-shadow"
            >
              <CardContent className="p-0">
                <h3 className="text-2xl font-bold mb-3 waflow-text-gradient">
                  {business.type}
                </h3>
                <p className="text-muted-foreground mb-4">
                  {business.description}
                </p>
                <ul className="space-y-2">
                  {business.benefits.map((benefit, index) => (
                    <li key={index} className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-sm">{benefit}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="container mx-auto px-4 py-16 bg-white/50 rounded-3xl my-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Why Choose Waflow?
          </h2>
          <p className="text-xl text-muted-foreground">
            Complete UAE business registration platform with end-to-end support
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card
              key={index}
              className="p-6 text-center hover:shadow-lg transition-shadow"
            >
              <CardContent className="p-0">
                <div className="mb-4 flex justify-center">{feature.icon}</div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Process Steps */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Simple 8-Step Process
          </h2>
          <p className="text-xl text-muted-foreground">
            From application to business bank account in weeks, not months
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            "KYC & Background Check",
            "Trade Name Reservation",
            "Activity Clearance",
            "Office Lease & Setup",
            "License Issuance",
            "Visa Application",
            "VAT & Tax Registration",
            "Bank Account Setup",
          ].map((step, index) => (
            <div key={index} className="text-center">
              <div className="waflow-gradient w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg mx-auto mb-4">
                {index + 1}
              </div>
              <h4 className="font-semibold mb-2">{step}</h4>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-16 text-center">
        <div className="bg-gradient-to-r from-primary to-secondary rounded-3xl p-12 text-white">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Start Your UAE Business?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of successful entrepreneurs who chose Waflow
          </p>
          <Button size="lg" variant="secondary" asChild className="px-8">
            <Link to="/auth">Get Started Now</Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-8 border-t">
        <div className="flex flex-col md:flex-row items-center justify-between">
          <div className="flex items-center space-x-3 mb-4 md:mb-0">
            <div className="waflow-gradient w-8 h-8 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold">W</span>
            </div>
            <span className="font-bold waflow-text-gradient">Waflow</span>
          </div>
          <p className="text-muted-foreground text-sm">
            © 2024 Waflow. All rights reserved. | UAE Business Registration
            Simplified
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;

import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import axios from "axios";
import { RootState } from "@/app/store";
import {
  User,
  Mail,
  Phone,
  Calendar,
  Flag,
  Building,
  MapPin,
  DollarSign,
  Clock,
  CheckCircle2,
  AlertCircle,
  Circle,
} from "lucide-react";

const statusConfig: Record<
  string,
  { color: string; icon: React.ReactNode; bgColor: string }
> = {
  "Submitted for Review": {
    color: "text-yellow-800",
    icon: <Clock className="w-4 h-4" />,
    bgColor: "bg-yellow-100 border-yellow-300",
  },
  "Not Started": {
    color: "text-gray-600",
    icon: <Circle className="w-4 h-4" />,
    bgColor: "bg-gray-100 border-gray-300",
  },
  Completed: {
    color: "text-green-800",
    icon: <CheckCircle2 className="w-4 h-4" />,
    bgColor: "bg-green-100 border-green-300",
  },
  Approved: {
    color: "text-green-800",
    icon: <CheckCircle2 className="w-4 h-4" />,
    bgColor: "bg-green-100 border-green-300",
  },
  Rejected: {
    color: "text-red-800",
    icon: <AlertCircle className="w-4 h-4" />,
    bgColor: "bg-red-100 border-red-300",
  },
};

export default function ApplicationPage() {
  const [application, setApplication] = useState<any>(null);
  const [filter, setFilter] = useState("all");
  const { token, user } = useSelector((state: RootState) => state.customerAuth);

  useEffect(() => {
    const fetchApplication = async () => {
      if (!token) return;
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_BASE_URL}/api/application/app/${
            user?.userId
          }`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setApplication(response.data.data);
      } catch (err) {
        console.error("Error fetching application:", err);
      }
    };

    fetchApplication();
  }, [token]);

  if (!application) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="bg-card rounded-xl shadow-large p-8 flex flex-col items-center space-y-6 animate-fade-in">
          <div className="relative">
            <div className="animate-spin rounded-full h-12 w-12 border-3 border-muted border-t-primary"></div>
            <div className="absolute inset-0 rounded-full bg-gradient-primary opacity-10"></div>
          </div>
          <div className="text-center space-y-2">
            <h3 className="text-lg font-semibold text-card-foreground">
              Loading Application
            </h3>
            <p className="text-muted-foreground text-sm">
              Please wait while we fetch your application details...
            </p>
          </div>
        </div>
      </div>
    );
  }

  const { customer, assignedAgent, status, steps, notes } = application;
  const filteredSteps =
    filter === "all"
      ? steps
      : steps.filter((step: any) => step.status === filter);

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div
          style={{
            marginBottom: "3rem", // mb-12
            textAlign: "center",
            animation: "fade-in 1s ease-in-out",
          }}
        >
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: "4rem", // w-16
              height: "4rem", // h-16
            }}
          >
            <Building
              style={{ width: "2rem", height: "2rem", color: "hsl(0 0% 98%)" }}
              color="gray"
            />
          </div>

          <h1
            style={{
              fontSize: "2.25rem", // text-4xl
              fontWeight: "bold",
              color: "transparent",
              marginBottom: "0.75rem", // mb-3
              backgroundImage:
                "linear-gradient(to right, hsl(221 83% 53%), hsl(221 83% 53% / 0.8))",
              WebkitBackgroundClip: "text",
              backgroundClip: "text",
            }}
          >
            Application Dashboard
          </h1>

          <p
            style={{
              color: "hsl(215.4 16.3% 46.9%)", // text-muted-foreground
              fontSize: "1.125rem", // text-lg
              maxWidth: "42rem", // max-w-2xl
              marginLeft: "auto",
              marginRight: "auto",
            }}
          >
            Track your application progress and manage all your details in one
            place
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-8">
            {/* Customer Info */}
            <section className="bg-card rounded-xl shadow-soft border border-border animate-fade-in">
              <div
                style={{
                  background:
                    "linear-gradient(135deg, hsl(221 83% 53%), hsl(221 83% 45%))",
                  paddingLeft: "1.5rem", // px-6
                  paddingRight: "1.5rem",
                  paddingTop: "1.25rem", // py-5
                  paddingBottom: "1.25rem",
                  borderTopLeftRadius: "0.75rem", // rounded-t-xl
                  borderTopRightRadius: "0.75rem",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.75rem",
                  }}
                >
                  <User
                    style={{
                      width: "1.25rem",
                      height: "1.25rem",
                      color: "hsl(0 0% 98%)",
                    }}
                  />
                  <h2
                    style={{
                      fontSize: "1.125rem", // text-lg
                      fontWeight: 600, // font-semibold
                      color: "hsl(0 0% 98%)", // text-primary-foreground
                    }}
                  >
                    Customer Information
                  </h2>
                </div>
              </div>

              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                      <User className="w-3 h-3" />
                      Full Name
                    </label>
                    <p className="text-card-foreground font-medium">
                      {customer.firstName} {customer.middleName}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                      <Mail className="w-3 h-3" />
                      Email Address
                    </label>
                    <p className="text-card-foreground">{customer.email}</p>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                      <Phone className="w-3 h-3" />
                      Phone Number
                    </label>
                    <p className="text-card-foreground">
                      {customer.phoneNumber}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      Date of Birth
                    </label>
                    <p className="text-card-foreground">
                      {new Date(customer.dob).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                      <Flag className="w-3 h-3" />
                      Nationality
                    </label>
                    <p className="text-card-foreground">
                      {customer.nationality}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                      <Building className="w-3 h-3" />
                      Designation
                    </label>
                    <p className="text-card-foreground">
                      {customer.designation}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Company Type
                    </label>
                    <p className="text-card-foreground">
                      {customer.companyType}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      Jurisdiction
                    </label>
                    <p className="text-card-foreground">
                      {customer.jurisdiction}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Business Activity
                    </label>
                    <p className="text-card-foreground">
                      {customer.businessActivity1}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Office Type
                    </label>
                    <p className="text-card-foreground">
                      {customer.officeType}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                      <DollarSign className="w-3 h-3" />
                      Quoted Price
                    </label>
                    <p className="text-card-foreground font-semibold text-lg">
                      ₹{customer.quotedPrice}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Payment Details
                    </label>
                    <p className="text-card-foreground">
                      {customer.paymentDetails}
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Application Steps */}
            <section className="bg-card rounded-xl shadow-soft border border-border animate-fade-in">
              <div
                style={{
                  background:
                    "linear-gradient(135deg, hsl(221 83% 53%), hsl(221 83% 45%))",
                  paddingLeft: "1.5rem",
                  paddingRight: "1.5rem",
                  paddingTop: "1.25rem",
                  paddingBottom: "1.25rem",
                  borderTopLeftRadius: "0.75rem",
                  borderTopRightRadius: "0.75rem",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.75rem",
                  }}
                >
                  <CheckCircle2
                    style={{
                      width: "1.25rem",
                      height: "1.25rem",
                      color: "hsl(0 0% 98%)",
                    }}
                  />
                  <h2
                    style={{
                      fontSize: "1.125rem",
                      fontWeight: 600,
                      color: "hsl(0 0% 98%)",
                    }}
                  >
                    Application Steps
                  </h2>
                </div>
              </div>

              <div className="p-6">
                <div className="flex flex-wrap gap-3 mb-6">
                  {[
                    "all",
                    "Submitted for Review",
                    "Not Started",
                    "Completed",
                  ].map((f) => (
                    <button
                      key={f}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                        filter === f
                          ? "bg-primary text-primary-foreground shadow-medium"
                          : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground"
                      }`}
                      onClick={() => setFilter(f)}
                    >
                      {f === "all" ? "All Steps" : f}
                    </button>
                  ))}
                </div>

                <div className="space-y-4">
                  {filteredSteps.map((step: any, index: number) => (
                    <div
                      key={step._id}
                      className="bg-muted/30 rounded-lg p-4 border border-border hover:shadow-soft transition-all duration-200 animate-slide-in"
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium text-card-foreground">
                          {step.stepName}
                        </h3>
                        <span
                          className={`inline-flex items-center gap-2 px-3 py-1 rounded-lg text-sm font-medium border ${
                            statusConfig[step.status]?.bgColor ||
                            "bg-muted border-border"
                          } ${
                            statusConfig[step.status]?.color ||
                            "text-muted-foreground"
                          }`}
                        >
                          {statusConfig[step.status]?.icon}
                          {step.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          </div>

          {/* Right Column */}
          <div className="space-y-8">
            {/* Application Status */}
            <section className="bg-card rounded-xl shadow-soft border border-border animate-fade-in">
              <div
                style={{
                  background:
                    "linear-gradient(135deg, hsl(221 83% 53%), hsl(221 83% 45%))",
                  paddingLeft: "1.5rem",
                  paddingRight: "1.5rem",
                  paddingTop: "1.25rem",
                  paddingBottom: "1.25rem",
                  borderTopLeftRadius: "0.75rem",
                  borderTopRightRadius: "0.75rem",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.75rem",
                  }}
                >
                  <AlertCircle
                    style={{
                      width: "1.25rem",
                      height: "1.25rem",
                      color: "hsl(0 0% 98%)",
                    }}
                  />
                  <h2
                    style={{
                      fontSize: "1.125rem",
                      fontWeight: 600,
                      color: "hsl(0 0% 98%)",
                    }}
                  >
                    Application Status
                  </h2>
                </div>
              </div>

              <div className="p-6">
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-info/10 rounded-full mb-4">
                    <AlertCircle className="w-8 h-8 text-info" />
                  </div>
                  <p className="text-2xl font-bold text-primary mb-2">
                    {status}
                  </p>
                  <p className="text-muted-foreground text-sm">
                    Current application status
                  </p>
                </div>
              </div>
            </section>

            {/* Assigned Agent */}
            <section className="bg-card rounded-xl shadow-soft border border-border animate-fade-in">
              <div
                style={{
                  background:
                    "linear-gradient(135deg, hsl(221 83% 53%), hsl(221 83% 45%))",
                  paddingLeft: "1.5rem",
                  paddingRight: "1.5rem",
                  paddingTop: "1.25rem",
                  paddingBottom: "1.25rem",
                  borderTopLeftRadius: "0.75rem",
                  borderTopRightRadius: "0.75rem",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.75rem",
                  }}
                >
                  <User
                    style={{
                      width: "1.25rem",
                      height: "1.25rem",
                      color: "hsl(0 0% 98%)",
                    }}
                  />
                  <h2
                    style={{
                      fontSize: "1.125rem",
                      fontWeight: 600,
                      color: "hsl(0 0% 98%)",
                    }}
                  >
                    Assigned Agent
                  </h2>
                </div>
              </div>

              <div className="p-6">
                <div className="space-y-4">
                  <div className="text-center mb-4">
                    <div className="inline-flex items-center justify-center w-12 h-12 bg-primary/10 rounded-full mb-3">
                      <User className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="font-semibold text-card-foreground">
                      {assignedAgent.fullName}
                    </h3>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <Mail className="w-4 h-4 text-muted-foreground" />
                      <span className="text-card-foreground text-sm">
                        {assignedAgent.email}
                      </span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Phone className="w-4 h-4 text-muted-foreground" />
                      <span className="text-card-foreground text-sm">
                        {assignedAgent.phoneNumber}
                      </span>
                    </div>
                    <div className="flex items-center justify-center pt-2">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-success text-success-foreground">
                        {assignedAgent.status}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Notes Timeline */}
            <section className="bg-card rounded-xl shadow-soft border border-border animate-fade-in">
              <div
                style={{
                  background:
                    "linear-gradient(135deg, hsl(221 83% 53%), hsl(221 83% 45%))",
                  paddingLeft: "1.5rem",
                  paddingRight: "1.5rem",
                  paddingTop: "1.25rem",
                  paddingBottom: "1.25rem",
                  borderTopLeftRadius: "0.75rem",
                  borderTopRightRadius: "0.75rem",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.75rem",
                  }}
                >
                  <Clock
                    style={{
                      width: "1.25rem",
                      height: "1.25rem",
                      color: "hsl(0 0% 98%)",
                    }}
                  />
                  <h2
                    style={{
                      fontSize: "1.125rem",
                      fontWeight: 600,
                      color: "hsl(0 0% 98%)",
                    }}
                  >
                    Notes Timeline
                  </h2>
                </div>
              </div>
              <div className="p-6">
                {notes.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="inline-flex items-center justify-center w-12 h-12 bg-muted rounded-full mb-4">
                      <Clock className="w-6 h-6 text-muted-foreground" />
                    </div>
                    <p className="text-muted-foreground font-medium">
                      No notes available yet
                    </p>
                    <p className="text-muted-foreground text-sm mt-1">
                      Notes and updates will appear here as they're added
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {notes.map((note: any, index: number) => (
                      <div
                        key={note._id}
                        className="bg-muted/30 rounded-lg p-4 border border-border animate-slide-in"
                        style={{ animationDelay: `${index * 0.1}s` }}
                      >
                        <p className="text-card-foreground mb-3">
                          {note.message}
                        </p>
                        <div className="flex items-center justify-between text-sm text-muted-foreground">
                          <span className="font-medium">
                            {note.addedBy?.fullName || "You"}
                          </span>
                          <span>
                            {new Date(note.timestamp).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}

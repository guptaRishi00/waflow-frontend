import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { User, Building, CreditCard } from "lucide-react";
import { ApiApplicationData } from "@/types/application";

interface ApplicationHeaderProps {
  applicationData: ApiApplicationData | null;
}

export const ApplicationHeader: React.FC<ApplicationHeaderProps> = ({ applicationData }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-gray-600">
            Application Number
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {applicationData?.applicationId || "N/A"}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-gray-600">
            Overall Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <Badge variant="default">
              {applicationData?.status || "N/A"}
            </Badge>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-gray-600">
            Assigned Agent
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <User className="h-4 w-4" />
            <span className="font-semibold">
              {applicationData?.assignedAgent?.fullName || "Not assigned"}
            </span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-gray-600">
            Application Type
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <Building className="h-4 w-4" />
            <span className="font-semibold">
              {applicationData?.applicationType || "N/A"}
            </span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-gray-600">
            Payment Progress
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            <div className="flex-1">
              <Progress
                value={
                  applicationData?.paymentEntries?.length > 0
                    ? (applicationData.paymentEntries.reduce(
                        (sum, payment) => sum + (payment.amountPaid || 0),
                        0
                      ) /
                        (applicationData.totalAgreedCost || 1)) *
                      100
                    : 0
                }
                className="mb-1"
              />
              <span className="text-sm text-gray-600">
                $
                {applicationData?.paymentEntries?.reduce(
                  (sum, payment) => sum + (payment.amountPaid || 0),
                  0
                ) || 0}{" "}
                / ${applicationData?.totalAgreedCost || "N/A"}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

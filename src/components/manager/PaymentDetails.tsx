import React from "react";
import { CreditCard } from "lucide-react";
import { ApiApplicationData } from "@/types/application";

interface PaymentDetailsProps {
  applicationData: ApiApplicationData | null;
}

export const PaymentDetails: React.FC<PaymentDetailsProps> = ({ applicationData }) => {
  return (
    <div className="space-y-6">
      <div className="p-6 bg-gray-50 rounded-lg">
        <h3 className="text-lg font-semibold mb-4">Payment Details</h3>
        {applicationData?.paymentEntries && applicationData.paymentEntries.length > 0 ? (
          <div className="space-y-4">
            {applicationData.paymentEntries.map((payment, idx) => (
              <div key={idx} className="p-4 bg-white rounded-lg border">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-sm">Payment {idx + 1}</h4>
                    <p className="text-sm text-gray-600">${payment.amountPaid || 0}</p>
                    {payment.paymentDate && (
                      <p className="text-xs text-gray-500">
                        {new Date(payment.paymentDate).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                  <div className="text-sm text-gray-600">
                    {payment.paymentStatus || "Pending"}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Payment Records</h3>
            <p className="text-gray-600">
              Payment details will appear here once payments are processed.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

import React from "react";
import { useSelector } from "react-redux";
import {
  EditSectionModal,
  ApplicationInfoForm,
  CompanyInfoForm,
  CustomerInfoForm,
  ShareholderInfoForm,
} from "@/pages/manager/EditSectionModal";
import { ApplicationDetails, ApiApplicationData } from "@/types/application";
import { RootState } from "@/app/store";

interface ApplicationDetailsFormsProps {
  applicationDetails: ApplicationDetails;
  setApplicationDetails: React.Dispatch<
    React.SetStateAction<ApplicationDetails>
  >;
  applicationData: ApiApplicationData | null;
  fetchApplication: () => Promise<void>;
}

export const ApplicationDetailsForms: React.FC<
  ApplicationDetailsFormsProps
> = ({
  applicationDetails,
  setApplicationDetails,
  applicationData,
  fetchApplication,
}) => {
  // Get token from Redux store
  const { token } = useSelector((state: RootState) => state.customerAuth);

  // Local state for customer form
  const [customerFormData, setCustomerFormData] = React.useState<any>({});

  // Initialize customer form data when applicationData changes
  React.useEffect(() => {
    console.log("ApplicationData changed:", applicationData);
    if (applicationData?.customer) {
      console.log("Setting customer form data:", applicationData.customer);
      setCustomerFormData(applicationData.customer);
    }
  }, [applicationData?.customer]);

  // Debug logging
  console.log("Current customerFormData:", customerFormData);
  return (
    <div className="space-y-6">
      {/* Current Application Details Display */}
      <div className="bg-white p-6 rounded-lg border shadow-sm">
        <h3 className="text-lg font-semibold mb-4 text-gray-800">
          Current Application Details
        </h3>

        {/* Simple display for testing */}
        <div className="space-y-4">
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">
              Customer Name:{" "}
              <span className="font-medium text-gray-900">
                {applicationDetails.customerName}
              </span>
            </p>
            <p className="text-sm text-gray-600">
              Application Type:{" "}
              <span className="font-medium text-gray-900">
                {applicationDetails.applicationType}
              </span>
            </p>
            <p className="text-sm text-gray-600">
              Emirate:{" "}
              <span className="font-medium text-gray-900">
                {applicationDetails.emirate}
              </span>
            </p>
            <p className="text-sm text-gray-600">
              Legal Form:{" "}
              <span className="font-medium text-gray-900">
                {applicationDetails.legalForm}
              </span>
            </p>
          </div>

          <div className="p-4 bg-gray-50 rounded-lg">
            {/* Only show Office Requirement and Office Type if office is required */}
            {(() => {
              const officeReq = applicationDetails.officeRequirement;

              // Only show if office is explicitly required
              const isOfficeRequired =
                officeReq === "Required" ||
                officeReq === "true" ||
                officeReq === "yes" ||
                officeReq === "Yes";

              if (isOfficeRequired) {
                return (
                  <>
                    <p className="text-sm text-gray-600">
                      Office Requirement:{" "}
                      <span className="font-medium text-gray-900">
                        {applicationDetails.officeRequirement}
                      </span>
                    </p>
                    {applicationDetails.officeType && (
                      <p className="text-sm text-gray-600">
                        Office Type:{" "}
                        <span className="font-medium text-gray-900">
                          {applicationDetails.officeType}
                        </span>
                      </p>
                    )}
                  </>
                );
              }

              return null;
            })()}
            <p className="text-sm text-gray-600">
              Assigned Agent:{" "}
              <span className="font-medium text-gray-900">
                {applicationDetails.assignedAgent}
              </span>
            </p>
            <p className="text-sm text-gray-600">
              Total Cost:{" "}
              <span className="font-medium text-gray-900">
                AED{" "}
                {applicationDetails.totalAgreedCost?.toLocaleString() || "0"}
              </span>
            </p>
          </div>

          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">
              Company Names:{" "}
              <span className="font-medium text-gray-900">
                {applicationDetails.proposedCompanyNames.length > 0
                  ? applicationDetails.proposedCompanyNames.join(", ")
                  : "None"}
              </span>
            </p>
          </div>
        </div>
      </div>

      {/* Edit Forms */}
      <div className="bg-white p-6 rounded-lg border shadow-sm">
        <h3 className="text-lg font-semibold mb-6 text-gray-800">
          Edit Application Information
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Application Info */}
          <div className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-md transition-all duration-200">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <svg
                    className="w-5 h-5 text-blue-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">
                    Application Info
                  </h4>
                  <p className="text-sm text-gray-500">
                    Basic application details
                  </p>
                </div>
              </div>
            </div>
            <EditSectionModal
              title="Application Info"
              trigger={
                <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors duration-200 flex items-center justify-center gap-2">
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                    />
                  </svg>
                  Edit Application Info
                </button>
              }
              applicationId={applicationData?.applicationId}
              onSaveSuccess={fetchApplication}
              onSave={async () => {
                // Implementation for saving application info
              }}
            >
              <ApplicationInfoForm
                applicationDetails={applicationDetails}
                setApplicationDetails={setApplicationDetails}
                applicationId={applicationData?.applicationId}
              />
            </EditSectionModal>
          </div>

          {/* Customer Info */}
          <div className="p-4 border border-gray-200 rounded-lg hover:border-green-300 hover:shadow-md transition-all duration-200">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <svg
                    className="w-5 h-5 text-green-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Customer Info</h4>
                  <p className="text-sm text-gray-500">
                    Personal customer details
                  </p>
                </div>
              </div>
            </div>
            <EditSectionModal
              title="Customer Info"
              trigger={
                <button className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-md transition-colors duration-200 flex items-center justify-center gap-2">
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                    />
                  </svg>
                  Edit Customer Info
                </button>
              }
              applicationId={applicationData?.applicationId}
              onSaveSuccess={fetchApplication}
              onSave={async () => {
                // Save customer data changes
                console.log("Saving customer data:", customerFormData);

                try {
                  // Check if we have a token
                  if (!token) {
                    throw new Error("Authentication token not found");
                  }

                  // Get the customer ID from the application data
                  const customerId =
                    typeof applicationData?.customer === "string"
                      ? applicationData.customer
                      : applicationData?.customer?._id;

                  if (!customerId) {
                    throw new Error("Customer ID not found");
                  }

                  // Prepare data for API - ensure date format is correct
                  const dataToSend = { ...customerFormData };

                  // Convert date string to ISO format if it exists
                  if (dataToSend.dob && typeof dataToSend.dob === "string") {
                    dataToSend.dob = new Date(dataToSend.dob).toISOString();
                  }

                  // Remove empty fields to avoid validation errors
                  Object.keys(dataToSend).forEach((key) => {
                    if (
                      dataToSend[key] === "" ||
                      dataToSend[key] === null ||
                      dataToSend[key] === undefined
                    ) {
                      delete dataToSend[key];
                    }
                  });

                  console.log("Data being sent to API:", dataToSend);

                  // Check if we have any data to send
                  if (Object.keys(dataToSend).length === 0) {
                    throw new Error("No data to update");
                  }

                  // Make API call to update customer data
                  const response = await fetch(
                    `${
                      import.meta.env.VITE_BASE_URL
                    }/api/user/customer/${customerId}`,
                    {
                      method: "PUT",
                      headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                      },
                      body: JSON.stringify(dataToSend),
                    }
                  );

                  if (!response.ok) {
                    const errorData = await response.json().catch(() => ({}));
                    throw new Error(
                      errorData.message || "Failed to update customer"
                    );
                  }

                  const result = await response.json();
                  console.log("Customer updated successfully:", result);

                  // Refresh the application data to show updated information
                  await fetchApplication();
                } catch (error) {
                  console.error("Error updating customer:", error);
                  throw error; // Re-throw to show error in modal
                }
              }}
            >
              <CustomerInfoForm
                applicationDetails={customerFormData}
                setApplicationDetails={setCustomerFormData}
                applicationId={applicationData?.applicationId}
              />
            </EditSectionModal>
          </div>

          {/* Company Info */}
          <div className="p-4 border border-gray-200 rounded-lg hover:border-purple-300 hover:shadow-md transition-all duration-200">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <svg
                    className="w-5 h-5 text-purple-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                    />
                  </svg>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Company Info</h4>
                  <p className="text-sm text-gray-500">
                    Business entity details
                  </p>
                </div>
              </div>
            </div>
            <EditSectionModal
              title="Company Info"
              trigger={
                <button className="w-full bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-4 rounded-md transition-colors duration-200 flex items-center justify-center gap-2">
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                    />
                  </svg>
                  Edit Company Info
                </button>
              }
              applicationId={applicationData?.applicationId}
              onSaveSuccess={fetchApplication}
              onSave={async () => {
                // Implementation for saving company info
              }}
            >
              <CompanyInfoForm
                applicationDetails={applicationDetails}
                setApplicationDetails={setApplicationDetails}
                applicationId={applicationData?.applicationId}
              />
            </EditSectionModal>
          </div>

          {/* Shareholder Info */}
          <div className="p-4 border border-gray-200 rounded-lg hover:border-orange-300 hover:shadow-md transition-all duration-200">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                  <svg
                    className="w-5 h-5 text-orange-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">
                    Shareholder Info
                  </h4>
                  <p className="text-sm text-gray-500">Ownership details</p>
                </div>
              </div>
            </div>
            <EditSectionModal
              title="Shareholder Info"
              trigger={
                <button className="w-full bg-orange-600 hover:bg-orange-700 text-white font-medium py-2 px-4 rounded-md transition-colors duration-200 flex items-center justify-center gap-2">
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                    />
                  </svg>
                  Edit Shareholder Info
                </button>
              }
              applicationId={applicationData?.applicationId}
              onSaveSuccess={fetchApplication}
              onSave={async () => {
                // Implementation for saving shareholder info
              }}
            >
              <ShareholderInfoForm
                applicationDetails={applicationDetails}
                setApplicationDetails={setApplicationDetails}
                applicationId={applicationData?.applicationId}
                customerId={
                  typeof applicationData?.customer === "string"
                    ? applicationData.customer
                    : applicationData?.customer?._id
                }
              />
              {/* Debug info */}
              {process.env.NODE_ENV === "development" && (
                <div className="mt-2 p-2 bg-yellow-100 text-xs text-gray-600 rounded">
                  Debug: customerId ={" "}
                  {JSON.stringify(
                    typeof applicationData?.customer === "string"
                      ? applicationData.customer
                      : applicationData?.customer?._id
                  )}
                  <br />
                  Full customer data:{" "}
                  {JSON.stringify(applicationData?.customer)}
                  <br />
                  Application ID:{" "}
                  {JSON.stringify(applicationData?.applicationId)}
                  <br />
                  Full applicationData:{" "}
                  {JSON.stringify(applicationData, null, 2)}
                </div>
              )}
            </EditSectionModal>
          </div>
        </div>
      </div>
    </div>
  );
};

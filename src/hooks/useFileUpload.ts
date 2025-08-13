import { useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useToast } from "@/hooks/use-toast";
import { logout } from "@/features/customerAuthSlice";
import { RootState } from "@/app/store";
import { ApiApplicationData } from "@/types/application";

export const useFileUpload = (
  applicationData: ApiApplicationData | null,
  fetchApplicationDocuments: (applicationId: string) => Promise<void>
) => {
  const navigate = useNavigate();
  const { user, token } = useSelector((state: RootState) => state.customerAuth);
  const { toast } = useToast();
  const [isUploading, setIsUploading] = useState(false);

  const handleFileUpload = async (file: File, stepName: string) => {
    // Check file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please select a file smaller than 10MB",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    try {
      // Debug: Log the application data structure
      console.log("🔍 Document Upload Debug:", {
        applicationId: applicationData?.applicationId,
        _id: applicationData?._id,
        fullApplicationData: applicationData,
      });

      // Create document via backend API - let backend handle Cloudinary upload
      const formData = new FormData();
      formData.append("file", file);
      formData.append("documentName", file.name);
      formData.append("documentType", "General");
      formData.append("relatedStepName", stepName);
      formData.append("linkedModel", "Application");
      // Send the MongoDB ObjectId as applicationId for the linkedTo field
      formData.append("applicationId", applicationData?._id || "");
      formData.append("userId", user?.id || "");
      formData.append("uploadedBy", user?.id || "");

      const response = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/api/document/create-document`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      toast({
        title: "Document uploaded",
        description: "Document has been uploaded successfully",
      });

      // Don't auto-refresh to avoid infinite loops
      // The parent component should handle refreshing when needed
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to upload document. Please try again.";

      // Check if the error is related to authentication (401, 403)
      if (error.response?.status === 401 || error.response?.status === 403) {
        toast({
          title: "Authentication Error",
          description: "Your session has expired. Please log in again.",
          variant: "destructive",
        });

        // Dispatch logout action to clear auth state
        logout();

        // Redirect to login page
        navigate("/auth");
        return;
      }

      // For other errors, only show the error message without redirecting
      toast({
        title: "Upload failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileInputChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    stepName: string
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(file, stepName);
    }
    // Reset the input value so the same file can be selected again
    e.target.value = "";
  };

  return {
    isUploading,
    handleFileUpload,
    handleFileInputChange,
  };
};

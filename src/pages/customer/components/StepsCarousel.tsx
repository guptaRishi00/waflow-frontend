import React, { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import {
  CheckCircle,
  Upload,
  Clock,
  FileText,
  AlertCircle,
} from "lucide-react";
import axios from "axios";
import { useSelector } from "react-redux";
import { RootState } from "@/app/store";

type StepStatus = "Approved" | "Uploaded" | "Pending";

interface Step {
  stepName: string;
  status: StepStatus;
  updatedAt: string;
}

type Props = {
  onStepSelect?: (stepName: string) => void;
  selectedStepName?: string;
};

export default function StepsCarousel({
  onStepSelect,
  selectedStepName,
}: Props) {
  const { user } = useSelector((state: RootState) => state.customerAuth);
  const customerId = user?.userId;
  const [steps, setSteps] = useState<Step[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSteps = async () => {
      const token = localStorage.getItem("token");
      if (!customerId || !token) return;

      try {
        const response = await axios.get(
          `${
            import.meta.env.VITE_BASE_URL
          }/api/application/status/${customerId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const fetchedSteps = response.data?.data?.steps ?? [];
        setSteps(fetchedSteps);
      } catch (error) {
        console.error("Error fetching steps:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSteps();
  }, [customerId]);

  const getStepIcon = (status: StepStatus) => {
    switch (status) {
      case "Approved":
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case "Uploaded":
        return <Upload className="w-5 h-5 text-blue-600" />;
      case "Pending":
        return <Clock className="w-5 h-5 text-amber-500" />;
      default:
        return <FileText className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStepColor = (status: StepStatus) => {
    switch (status) {
      case "Approved":
        return "bg-gradient-to-br from-green-50 to-green-100 border-green-200 hover:shadow-md";
      case "Uploaded":
        return "bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 hover:shadow-md";
      case "Pending":
        return "bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200 hover:shadow-md";
      default:
        return "bg-gradient-to-br from-gray-50 to-gray-100 border-gray-200 hover:shadow-md";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-6">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
        <p className="text-sm text-gray-500 ml-3">Loading steps...</p>
      </div>
    );
  }

  if (!steps.length) {
    return (
      <p className="text-sm text-center text-gray-500 py-6">No steps found.</p>
    );
  }

  return (
    <div className="max-w-6xl relative px-8">
      <Carousel opts={{ align: "start" }} className="w-full">
        <CarouselContent className="-ml-2 md:-ml-4">
          {steps.map((step, index) => (
            <CarouselItem
              key={index}
              className="pl-2 md:pl-4 basis-1/3 sm:basis-1/4 md:basis-1/5 lg:basis-1/3"
            >
              <div className="p-1">
                <Card
                  onClick={() => onStepSelect?.(step.stepName)}
                  className={`cursor-pointer transition-all duration-300 hover:scale-105 ${getStepColor(
                    step.status
                  )} ${
                    selectedStepName === step.stepName
                      ? "ring-2 ring-blue-600"
                      : ""
                  }`}
                >
                  <CardContent className="flex flex-col items-center justify-center p-4 min-h-[120px]">
                    <div className="flex flex-col items-center gap-2 text-center">
                      {getStepIcon(step.status)}
                      <span className="text-xs font-medium text-gray-900 leading-tight">
                        {step.stepName}
                      </span>
                      <span
                        className={`px-2 py-1 text-xs rounded-full font-medium ${
                          step.status === "Approved"
                            ? "bg-green-100 text-green-800"
                            : step.status === "Uploaded"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-amber-100 text-amber-800"
                        }`}
                      >
                        {step.status}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="-left-6 bg-white hover:bg-gray-50" />
        <CarouselNext className="-right-6 bg-white hover:bg-gray-50" />
      </Carousel>
    </div>
  );
}

import React from "react";
import { User, Calendar } from "lucide-react"; // Using lucide-react for icons

// Helper to get Tailwind CSS classes for different statuses
const getStatusClasses = (status: string) => {
  const lowerStatus = status.toLowerCase();
  if (lowerStatus.includes("review")) {
    return "bg-yellow-100 text-yellow-800 border-yellow-200";
  }
  if (lowerStatus.includes("approved") || lowerStatus.includes("completed")) {
    return "bg-green-100 text-green-800 border-green-200";
  }
  if (lowerStatus.includes("rejected") || lowerStatus.includes("failed")) {
    return "bg-red-100 text-red-800 border-red-200";
  }
  return "bg-slate-100 text-slate-800 border-slate-200";
};

export default function ApplicationCard({ application }: { application: any }) {
  const { customer, assignedAgent, status, steps, updatedAt, _id } =
    application;

  // Calculate progress percentage
  const completedSteps = steps.filter(
    (step: any) => step.status.toLowerCase() === "completed"
  ).length;
  const totalSteps = steps.length;
  const progressPercentage =
    totalSteps > 0 ? (completedSteps / totalSteps) * 100 : 0;

  return (
    <div className="flex h-full flex-col rounded-lg border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
      {/* Card Header */}
      <div className="border-b border-slate-200 p-5">
        <div className="flex items-start justify-between">
          <h3 className="text-lg font-semibold capitalize text-slate-800">
            {customer.companyType} Setup
            <span className="mt-1 block text-xs font-normal text-slate-500">
              ID: ...{_id.slice(-6)}
            </span>
          </h3>
          <span
            className={`rounded-full border px-3 py-1 text-xs font-bold ${getStatusClasses(
              status
            )}`}
          >
            {status}
          </span>
        </div>
      </div>

      {/* Card Body */}
      <div className="p-5">
        {/* Progress Bar */}
        <div>
          <div className="mb-1 flex justify-between">
            <span className="text-sm font-medium text-slate-700">Progress</span>
            <span className="text-sm font-medium text-slate-700">
              {Math.round(progressPercentage)}%
            </span>
          </div>
          <div className="h-2 w-full rounded-full bg-slate-200">
            <div
              className="h-2 rounded-full bg-blue-600 transition-all duration-500"
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
          <p className="mt-1 text-right text-xs text-slate-500">
            {completedSteps} of {totalSteps} steps completed
          </p>
        </div>

        {/* Agent Info */}
        <div className="mt-6 flex items-center space-x-3 rounded-md bg-slate-50 p-3">
          <User className="h-5 w-5 text-slate-500" />
          <p className="text-sm text-slate-600">
            Assigned Agent:{" "}
            <strong className="font-medium text-slate-800">
              {assignedAgent.fullName}
            </strong>
          </p>
        </div>
      </div>

      {/* Card Footer */}
      <div className="mt-auto flex items-center justify-between border-t border-slate-200 bg-slate-50/70 p-5">
        <div className="flex items-center space-x-2 text-sm text-slate-500">
          <Calendar className="h-4 w-4" />
          <span>Updated: {new Date(updatedAt).toLocaleDateString()}</span>
        </div>
        <a
          href="#"
          className="rounded-md bg-white px-3 py-2 text-sm font-semibold text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 hover:bg-slate-50"
        >
          View Details
        </a>
      </div>
    </div>
  );
}

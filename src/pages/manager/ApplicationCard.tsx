import { Badge } from "@/components/ui/badge";

const ApplicationCard = ({
  app,
  selectedApp,
  setSelectedApp,
  applications,
}: {
  app: any;
  selectedApp: any;
  setSelectedApp: (app: any) => void;
  applications: any[];
}) => {
  console.log("ApplicationCard props:", { app, selectedApp, applications });
  return (
    <div
      key={app._id}
      className={`p-3 border rounded-lg cursor-pointer transition-colors ${
        selectedApp && selectedApp._id === app._id
          ? "border-primary bg-primary/5"
          : "hover:bg-gray-50"
      }`}
      onClick={() => setSelectedApp(app)}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="font-medium text-sm">
          {app.customer?.firstName} {app.customer?.lastName}
        </span>
      </div>
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground capitalize">
          {app.customer?.email}
        </span>
        <Badge
          variant="outline"
          className={`text-xs ${
            app.status === "New" || app.status === "Ready for Processing"
              ? "bg-blue-100 text-blue-800 border-blue-200"
              : app.status === "In Progress" ||
                app.status === "Waiting for Agent Review"
              ? "bg-yellow-100 text-yellow-800 border-yellow-200"
              : app.status === "Completed" || app.status === "Approved"
              ? "bg-green-100 text-green-800 border-green-200"
              : app.status === "Rejected" || app.status === "Declined"
              ? "bg-red-100 text-red-800 border-red-200"
              : app.status === "Awaiting Client Response"
              ? "bg-orange-100 text-orange-800 border-orange-200"
              : "bg-gray-100 text-gray-800 border-gray-200"
          }`}
        >
          {app.status}
        </Badge>
      </div>
      <div className="mt-2">
        <div className="w-full bg-gray-200 rounded-full h-1.5">
          <div
            className="bg-gradient-to-r from-primary to-secondary h-1.5 rounded-full"
            style={{
              width: `${
                ((app.steps?.filter((step: any) => step.status === "Approved")
                  .length || 0) /
                  (app.steps?.length || 1)) *
                100
              }%`,
            }}
          />
        </div>
        <span className="text-xs text-muted-foreground">
          Step{" "}
          {app.steps?.filter((step: any) => step.status === "Approved")
            .length || 0}
          /{app.steps?.length || 0}
        </span>
      </div>
    </div>
  );
};

export default ApplicationCard;

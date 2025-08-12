import React from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RefreshCw } from "lucide-react";

interface BackendStatusWarningProps {
  backendErrorCount: number;
  lastBackendError: string | null;
  hasPendingSteps: boolean;
  onRetrySync: () => void;
  onDismiss: () => void;
}

export const BackendStatusWarning: React.FC<BackendStatusWarningProps> = ({
  backendErrorCount,
  lastBackendError,
  hasPendingSteps,
  onRetrySync,
  onDismiss,
}) => {
  if (backendErrorCount === 0) return null;

  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <AlertTriangle className="h-5 w-5 text-yellow-600" />
          <div>
            <h3 className="text-sm font-medium text-yellow-800">
              Backend Service Issues Detected
            </h3>
            <p className="text-sm text-yellow-700 mt-1">
              {backendErrorCount} step status update
              {backendErrorCount > 1 ? "s" : ""} failed due to backend
              configuration issues. Your changes are saved locally and will
              sync automatically when the backend is restored.
            </p>
            {lastBackendError && (
              <p className="text-xs text-yellow-600 mt-1">
                Last error: {lastBackendError}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onRetrySync}
            className="text-yellow-700 border-yellow-300 hover:bg-yellow-100"
            disabled={!hasPendingSteps}
          >
            <RefreshCw className="h-4 w-4 mr-1" />
            Retry Sync
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onDismiss}
            className="text-yellow-700 border-yellow-300 hover:bg-yellow-100"
          >
            Dismiss
          </Button>
        </div>
      </div>
    </div>
  );
};

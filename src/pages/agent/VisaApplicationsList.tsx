import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, CheckCircle2, XCircle, FileText, Download } from "lucide-react";
import React, { useState, useEffect } from "react";

interface VisaApplicationsListProps {
  visaApplications: any[];
  loading: boolean;
  onStatusUpdate: (id: string, status: string) => void;
}

const VisaApplicationsList: React.FC<VisaApplicationsListProps> = ({
  visaApplications,
  loading,
  onStatusUpdate,
}) => {
  const isImage = (url: string) =>
    url && url.match(/\.(jpg|jpeg|png|gif|bmp|webp)$/i);
  const isPdf = (url: string) => url && url.match(/\.pdf$/i);

  return (
    <div>
      <h2 className="text-2xl font-bold mb-2">Visa Applications</h2>
      {loading ? (
        <div className="text-center py-8 text-muted-foreground">
          Loading visa applications...
        </div>
      ) : visaApplications.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          No submitted visa applications found
        </div>
      ) : (
        <div className="space-y-4">
          {visaApplications.map((visa) => (
            <div
              key={visa._id}
              className="border rounded-xl p-6 bg-white shadow-md flex flex-col gap-2 relative hover:shadow-lg transition-shadow"
            >
              {/* Status chip at top right */}
              <div className="absolute top-4 right-4">
                <Badge
                  className={
                    visa.status === "Approved"
                      ? "bg-green-100 text-green-800"
                      : visa.status === "Rejected"
                      ? "bg-red-100 text-red-800"
                      : visa.status === "In Review"
                      ? "bg-blue-100 text-blue-800"
                      : "bg-yellow-100 text-yellow-800"
                  }
                >
                  {visa.status}
                </Badge>
              </div>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 mb-2">
                <div className="flex flex-col gap-1">
                  <div className="text-lg font-semibold">
                    {visa.customer?.firstName} {visa.customer?.lastName}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {visa.customer?.email} • {visa._id}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Submitted {new Date(visa.createdAt).toLocaleString()}
                  </div>
                </div>
                <div className="flex flex-col md:items-end gap-1">
                  <div className="font-semibold">Members:</div>
                  <ul className="list-disc ml-6 text-sm">
                    {visa.members.map((m: any, idx: number) => (
                      <li key={idx}>
                        {m.firstName} {m.lastName} ({m.passportNumber},{" "}
                        {m.nationality})
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              <div className="mt-2">
                <div className="font-semibold mb-1">Documents:</div>
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {visa.documents.map((doc: any, idx: number) => {
                    // console.log('Visa Document:', doc, 'fileUrl:', doc.fileUrl);
                    return (
                      <li
                        key={idx}
                        className="flex items-center gap-2 bg-gray-50 rounded p-2 border"
                      >
                        <FileText className="h-5 w-5 text-blue-500" />
                        <span className="font-medium">
                          {doc.documentName || doc.fileName || doc._id}
                        </span>
                        <Badge className="bg-blue-100 text-blue-800 ml-2">
                          Visa
                        </Badge>
                        {doc.fileUrl && isImage(doc.fileUrl) && (
                          <a
                            href={doc.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="ml-2 px-2 py-1 text-xs text-blue-700 hover:bg-blue-100 rounded flex items-center gap-1"
                          >
                            <Eye className="inline h-4 w-4 align-text-bottom" />{" "}
                            Preview
                          </a>
                        )}
                        {doc.fileUrl && !isImage(doc.fileUrl) && (
                          <a
                            href={doc.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="ml-2 px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition flex items-center gap-1"
                            tabIndex={visa.status === "Rejected" ? -1 : 0}
                            aria-disabled={visa.status === "Rejected"}
                            style={{
                              pointerEvents:
                                visa.status === "Rejected" ? "none" : undefined,
                            }}
                          >
                            <Eye className="inline h-4 w-4 align-text-bottom" />{" "}
                            Preview
                          </a>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </div>
              <div className="flex gap-3 mt-4">
                <Button
                  size="sm"
                  variant="default"
                  className="flex items-center gap-1 px-4 py-2 text-sm font-semibold bg-green-600 hover:bg-green-700 text-white disabled:bg-green-200"
                  onClick={() => onStatusUpdate(visa._id, "Approved")}
                  disabled={visa.status !== "Submitted for Review"}
                >
                  <CheckCircle2 className="h-4 w-4" /> Approve
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  className="flex items-center gap-1 px-4 py-2 text-sm font-semibold bg-red-600 hover:bg-red-700 text-white disabled:bg-red-200"
                  onClick={() => onStatusUpdate(visa._id, "Rejected")}
                  disabled={visa.status !== "Submitted for Review"}
                >
                  <XCircle className="h-4 w-4" /> Reject
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default VisaApplicationsList;

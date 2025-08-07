import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { uploadToCloudinary } from "@/lib/cloudinary";
import { useToast } from "@/hooks/use-toast";

export const CloudinaryTest: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const { toast } = useToast();

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setResult(null);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      toast({
        title: "Error",
        description: "Please select a file first",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);
    try {
      console.log("Environment variables:", {
        VITE_CLOUD_NAME: import.meta.env.VITE_CLOUD_NAME,
        VITE_API_KEY: import.meta.env.VITE_API_KEY ? "Set" : "Not set",
        VITE_API_SECRET: import.meta.env.VITE_API_SECRET ? "Set" : "Not set",
      });

      const uploadResult = await uploadToCloudinary(file);
      setResult(uploadResult);

      toast({
        title: "Success",
        description: "File uploaded successfully!",
      });
    } catch (error: any) {
      console.error("Upload test error:", error);
      toast({
        title: "Error",
        description: error.message || "Upload failed",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Cloudinary Upload Test</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="file">Select File</Label>
          <Input
            id="file"
            type="file"
            accept=".pdf,.jpg,.jpeg,.png"
            onChange={handleFileSelect}
          />
        </div>

        <Button
          onClick={handleUpload}
          disabled={!file || uploading}
          className="w-full"
        >
          {uploading ? "Uploading..." : "Test Upload"}
        </Button>

        {result && (
          <div className="space-y-2">
            <h4 className="font-medium">Upload Result:</h4>
            <div className="text-sm space-y-1">
              <div>
                <strong>URL:</strong>{" "}
                <a
                  href={result.secure_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  {result.secure_url}
                </a>
              </div>
              <div>
                <strong>Public ID:</strong> {result.public_id}
              </div>
              <div>
                <strong>Format:</strong> {result.format}
              </div>
              <div>
                <strong>Size:</strong> {result.bytes} bytes
              </div>
            </div>
          </div>
        )}

        <div className="text-xs text-gray-500">
          <p>
            <strong>Environment Check:</strong>
          </p>
          <p>Cloud Name: {import.meta.env.VITE_CLOUD_NAME || "Not set"}</p>
          <p>API Key: {import.meta.env.VITE_API_KEY ? "Set" : "Not set"}</p>
          <p>
            API Secret: {import.meta.env.VITE_API_SECRET ? "Set" : "Not set"}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

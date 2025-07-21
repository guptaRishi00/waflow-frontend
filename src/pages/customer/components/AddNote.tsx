import React from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/app/store";

// UI Components
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

// Icons
import { Send, Loader2 } from "lucide-react";

// Defines the structure for API error responses
interface ApiErrorResponse {
  message: string;
}

export default function AddNote() {
  const [note, setNote] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState<string | null>(null);

  const { user } = useSelector((state: RootState) => state.customerAuth);
  const customerId = user?.userId;

  const handleNoteChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNote(e.target.value);
    // Clear messages when user starts typing
    if (error) setError(null);
    if (success) setSuccess(null);
  };

  const handleSubmit = async () => {
    if (!note.trim()) {
      setError("Note cannot be empty.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Authentication token not found. Please log in again.");
        return;
      }

      // Simulate API call since axios isn't available in artifacts
      const response = await fetch(
        `${import.meta.env.VITE_BASE_URL}/api/application/note/${customerId}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ message: note }),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      setSuccess("Note added successfully!");
      setNote("");
    } catch (err: any) {
      const errorMessage =
        err.message || "An error occurred. Please try again.";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="mx-auto w-full max-w-2xl space-y-4">
      {/* Textarea */}
      <div className="relative">
        <Textarea
          placeholder="Add a note for this customer... (Ctrl+Enter to submit)"
          value={note}
          onChange={handleNoteChange}
          onKeyDown={handleKeyDown}
          className="min-h-[120px] resize-y border-2 border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 rounded-2xl px-6 py-4 text-base placeholder:text-gray-400 shadow-sm transition-all duration-200 hover:shadow-md focus:shadow-lg"
          disabled={isLoading}
        />

        {/* Status indicator */}
        {note.trim() && !isLoading && (
          <div className="absolute right-4 top-4">
            <div className="h-2 w-2 rounded-full bg-green-400"></div>
          </div>
        )}
      </div>

      {/* Submit Button */}
      <Button
        onClick={handleSubmit}
        disabled={isLoading || !note.trim()}
        className="w-full h-14 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-lg font-semibold rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-lg"
      >
        {isLoading ? (
          <div className="flex items-center gap-3">
            <Loader2 size={22} className="animate-spin" />
            Adding Note...
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <Send size={20} />
            Add Note
          </div>
        )}
      </Button>

      {/* Feedback Messages */}
      {(error || success) && (
        <div className="text-center">
          {error && (
            <p className="text-red-500 font-medium bg-red-50 border border-red-200 rounded-xl px-4 py-3">
              {error}
            </p>
          )}
          {success && (
            <p className="text-green-600 font-medium bg-green-50 border border-green-200 rounded-xl px-4 py-3">
              {success}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

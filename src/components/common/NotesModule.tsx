import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  PlusCircle,
  Edit,
  Trash2,
  FileText,
  User,
  Shield,
  Calendar,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useSelector } from "react-redux";
import { RootState } from "@/app/store";
import axios from "axios";

interface Note {
  _id: string;
  message: string;
  addedBy: string | { _id: string; fullName: string; email: string } | null;
  addedByRole?: string;
  createdAt: string;
  updatedAt: string;
  timestamp?: string; // Backend might use timestamp instead of createdAt
  customerId: string;
}

interface NotesModuleProps {
  customerId: string;
  applicationId?: string;
  className?: string;
  applicationData?: any; // Add this to receive application data
  onApplicationUpdate?: (updatedData: any) => void; // Add callback for parent updates
}

export const NotesModule: React.FC<NotesModuleProps> = ({
  customerId,
  applicationId,
  className = "",
  applicationData,
  onApplicationUpdate,
}) => {
  const { token, user } = useSelector((state: RootState) => state.customerAuth);
  const { toast } = useToast();

  // Get notes from application data
  useEffect(() => {
    if (applicationData?.notes) {
      setNotes(applicationData.notes);
    }
  }, [applicationData?.notes]);

  const [notes, setNotes] = useState<Note[]>([]);

  const [isAddingNote, setIsAddingNote] = useState(false);
  const [editingNote, setEditingNote] = useState<string | null>(null);
  const [newNote, setNewNote] = useState({
    message: "",
  });

  const handleAddNote = async () => {
    if (!newNote.message.trim() || !customerId || !token) {
      toast({
        title: "Validation Error",
        description: "Please fill in the note message.",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/api/application/note/${customerId}`,
        {
          message: newNote.message,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // The backend returns { message: "Note added successfully", notes: application.notes }
      if (response.data.message && response.data.notes) {
        console.log("Backend response:", response.data);
        console.log("Updating notes with:", response.data.notes);

        toast({
          title: "Note Added",
          description: response.data.message,
        });

        // Update notes from the backend response for real-time updates
        // Ensure the new note appears at the top by sorting by creation date
        const sortedNotes = response.data.notes.sort((a: Note, b: Note) => {
          const dateA = new Date(a.createdAt || a.timestamp || 0);
          const dateB = new Date(b.createdAt || b.timestamp || 0);
          return dateB.getTime() - dateA.getTime(); // Newest first
        });

        // If the new note isn't in the backend response, add it manually at the top
        const newNoteExists = sortedNotes.some(
          (note) => note.message === newNote.message
        );
        if (!newNoteExists) {
          const newNoteObj = {
            _id: response.data.note?._id || Date.now().toString(),
            message: newNote.message,
            addedBy: user?.name || "Unknown",
            addedByRole: user?.role,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            customerId: customerId,
          };
          sortedNotes.unshift(newNoteObj); // Add to the beginning
        }

        setNotes(sortedNotes);

        setNewNote({ message: "" });
        setIsAddingNote(false);

        // Call the callback to refresh parent data for real-time updates
        if (onApplicationUpdate) {
          console.log("Calling onApplicationUpdate callback");
          // Pass the updated notes to trigger parent refresh
          await onApplicationUpdate(response.data.notes);
        }
      } else {
        console.log("Unexpected backend response:", response.data);
      }
    } catch (error: any) {
      console.error("Error adding note:", error);
      toast({
        title: "Error adding note",
        description: error.response?.data?.message || "Failed to add note",
        variant: "destructive",
      });
    }
  };

  const handleDeleteNote = (noteId: string) => {
    // Remove from local state only (backend delete endpoint was removed)
    setNotes(notes.filter((note) => note._id !== noteId));
    toast({
      title: "Note Removed",
      description: "Note has been removed from view.",
    });
  };

  const handleEditNote = (noteId: string) => {
    const note = notes.find((n) => n._id === noteId);
    if (note) {
      setNewNote({
        message: note.message,
      });
      setEditingNote(noteId);
      setIsAddingNote(true);
    }
  };

  const handleUpdateNote = () => {
    if (!editingNote) return;

    setNotes(
      notes.map((note) =>
        note._id === editingNote
          ? {
              ...note,
              message: newNote.message,
              updatedAt: new Date().toISOString(),
            }
          : note
      )
    );

    setNewNote({ message: "" });
    setIsAddingNote(false);
    setEditingNote(null);

    toast({
      title: "Note Updated",
      description: "Note has been updated successfully.",
    });
  };

  const canEditNote = (note: Note) => {
    if (
      typeof note.addedBy === "object" &&
      note.addedBy &&
      "fullName" in note.addedBy
    ) {
      return user?.name === note.addedBy.fullName;
    }
    return user?.name === note.addedBy;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Add Note Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Customer Notes
              </CardTitle>
              <CardDescription>
                Add internal notes or messages for the customer
              </CardDescription>
            </div>
            {!isAddingNote && (
              <Button onClick={() => setIsAddingNote(true)} size="sm">
                <PlusCircle className="h-4 w-4 mr-2" />
                Add Note
              </Button>
            )}
          </div>
        </CardHeader>

        {isAddingNote && (
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="note-message">Note Message</Label>
              <Textarea
                id="note-message"
                value={newNote.message}
                onChange={(e) =>
                  setNewNote({ ...newNote, message: e.target.value })
                }
                placeholder="Enter your note message..."
                rows={4}
                className="mt-1"
              />
            </div>

            <div className="flex gap-2">
              <Button
                onClick={editingNote ? handleUpdateNote : handleAddNote}
                className="bg-primary hover:bg-primary/90"
              >
                {editingNote ? "Update Note" : "Add Note"}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setIsAddingNote(false);
                  setEditingNote(null);
                  setNewNote({ message: "" });
                }}
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Notes List */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">
          Previous Notes ({notes.length})
        </h3>

        {notes.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No notes added yet.</p>
              <p className="text-sm">
                Click "Add Note" to create the first note for this customer.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {notes.map((note) => (
              <Card key={note._id} className="relative">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        {note.addedByRole === "manager" ? (
                          <Shield className="h-4 w-4 text-primary" />
                        ) : (
                          <User className="h-4 w-4 text-secondary" />
                        )}
                        <span className="font-medium">
                          {typeof note.addedBy === "object" &&
                          note.addedBy &&
                          "fullName" in note.addedBy
                            ? note.addedBy.fullName
                            : (note.addedBy as string) || "Unknown"}
                        </span>
                        <Badge variant="outline" className="text-xs">
                          {note.addedByRole || "agent"}
                        </Badge>
                      </div>
                    </div>

                    {canEditNote(note) && (
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleEditNote(note._id)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDeleteNote(note._id)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <p className="text-gray-700 text-sm leading-relaxed">
                      {note.message}
                    </p>
                  </div>

                  <Separator className="my-3" />

                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    <span>Created: {formatDate(note.createdAt)}</span>
                    {note.updatedAt !== note.createdAt && (
                      <span>• Updated: {formatDate(note.updatedAt)}</span>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};


import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { 
  PlusCircle, 
  Edit, 
  Trash2, 
  FileText, 
  Upload, 
  Bell, 
  BellOff,
  User,
  Shield,
  Calendar
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface Note {
  id: string;
  title: string;
  description: string;
  author: string;
  authorRole: 'agent' | 'manager';
  createdAt: string;
  updatedAt: string;
  notifyCustomer: boolean;
  attachment?: {
    name: string;
    url: string;
  };
  customerId: string;
}

interface NotesModuleProps {
  customerId: string;
  applicationId?: string;
  className?: string;
}

export const NotesModule: React.FC<NotesModuleProps> = ({ 
  customerId, 
  applicationId, 
  className = "" 
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  // Mock data - in real app, this would be fetched from API
  const [notes, setNotes] = useState<Note[]>([
    {
      id: '1',
      title: 'Customer Follow-up Required',
      description: 'Customer needs to provide additional bank statement from last 3 months. Missing documents for investment proof.',
      author: 'Sarah Johnson',
      authorRole: 'agent',
      createdAt: '2024-01-15T10:30:00Z',
      updatedAt: '2024-01-15T10:30:00Z',
      notifyCustomer: true,
      customerId: customerId,
    },
    {
      id: '2',
      title: 'Internal Review Note',
      description: 'Application looks good overall. All documents verified. Ready for approval once bank statement is provided.',
      author: 'John Manager',
      authorRole: 'manager',
      createdAt: '2024-01-14T15:45:00Z',
      updatedAt: '2024-01-14T15:45:00Z',
      notifyCustomer: false,
      customerId: customerId,
    }
  ]);

  const [isAddingNote, setIsAddingNote] = useState(false);
  const [editingNote, setEditingNote] = useState<string | null>(null);
  const [newNote, setNewNote] = useState({
    title: '',
    description: '',
    notifyCustomer: false,
    attachment: null as File | null
  });

  const handleAddNote = () => {
    if (!newNote.title.trim() || !newNote.description.trim()) {
      toast({
        title: "Validation Error",
        description: "Please fill in both title and description.",
        variant: "destructive"
      });
      return;
    }

    const note: Note = {
      id: Date.now().toString(),
      title: newNote.title,
      description: newNote.description,
      author: user?.name || 'Unknown',
      authorRole: user?.role === 'manager' ? 'manager' : 'agent',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      notifyCustomer: newNote.notifyCustomer,
      customerId: customerId,
      attachment: newNote.attachment ? {
        name: newNote.attachment.name,
        url: URL.createObjectURL(newNote.attachment)
      } : undefined
    };

    setNotes([note, ...notes]);
    setNewNote({ title: '', description: '', notifyCustomer: false, attachment: null });
    setIsAddingNote(false);

    toast({
      title: "Note Added",
      description: newNote.notifyCustomer 
        ? "Note added and customer will be notified." 
        : "Internal note added successfully.",
    });
  };

  const handleDeleteNote = (noteId: string) => {
    setNotes(notes.filter(note => note.id !== noteId));
    toast({
      title: "Note Deleted",
      description: "Note has been removed successfully.",
    });
  };

  const handleEditNote = (noteId: string) => {
    const note = notes.find(n => n.id === noteId);
    if (note) {
      setNewNote({
        title: note.title,
        description: note.description,
        notifyCustomer: note.notifyCustomer,
        attachment: null
      });
      setEditingNote(noteId);
      setIsAddingNote(true);
    }
  };

  const handleUpdateNote = () => {
    if (!editingNote) return;

    setNotes(notes.map(note => 
      note.id === editingNote 
        ? {
            ...note,
            title: newNote.title,
            description: newNote.description,
            notifyCustomer: newNote.notifyCustomer,
            updatedAt: new Date().toISOString()
          }
        : note
    ));

    setNewNote({ title: '', description: '', notifyCustomer: false, attachment: null });
    setIsAddingNote(false);
    setEditingNote(null);

    toast({
      title: "Note Updated",
      description: "Note has been updated successfully.",
    });
  };

  const canEditNote = (note: Note) => {
    return user?.name === note.author;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
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
              <Label htmlFor="note-title">Note Title</Label>
              <Input
                id="note-title"
                value={newNote.title}
                onChange={(e) => setNewNote({ ...newNote, title: e.target.value })}
                placeholder="Enter a brief title for this note..."
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="note-description">Description</Label>
              <Textarea
                id="note-description"
                value={newNote.description}
                onChange={(e) => setNewNote({ ...newNote, description: e.target.value })}
                placeholder="Enter detailed note content..."
                rows={4}
                className="mt-1"
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="notify-customer"
                checked={newNote.notifyCustomer}
                onCheckedChange={(checked) => setNewNote({ ...newNote, notifyCustomer: checked })}
              />
              <Label htmlFor="notify-customer" className="flex items-center gap-2">
                {newNote.notifyCustomer ? (
                  <Bell className="h-4 w-4 text-blue-600" />
                ) : (
                  <BellOff className="h-4 w-4 text-gray-400" />
                )}
                Notify Customer
              </Label>
            </div>

            <div>
              <Label htmlFor="note-attachment">Attachment (Optional)</Label>
              <div className="mt-1 flex items-center gap-2">
                <Input
                  id="note-attachment"
                  type="file"
                  onChange={(e) => setNewNote({ ...newNote, attachment: e.target.files?.[0] || null })}
                  className="flex-1"
                />
                <Upload className="h-4 w-4 text-gray-400" />
              </div>
            </div>

            <div className="flex gap-2">
              <Button 
                onClick={editingNote ? handleUpdateNote : handleAddNote}
                className="bg-primary hover:bg-primary/90"
              >
                {editingNote ? 'Update Note' : 'Add Note'}
              </Button>
              <Button 
                variant="outline" 
                onClick={() => {
                  setIsAddingNote(false);
                  setEditingNote(null);
                  setNewNote({ title: '', description: '', notifyCustomer: false, attachment: null });
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
        <h3 className="text-lg font-semibold">Previous Notes ({notes.length})</h3>
        
        {notes.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No notes added yet.</p>
              <p className="text-sm">Click "Add Note" to create the first note for this customer.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {notes.map((note) => (
              <Card key={note.id} className="relative">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        {note.authorRole === 'manager' ? (
                          <Shield className="h-4 w-4 text-primary" />
                        ) : (
                          <User className="h-4 w-4 text-secondary" />
                        )}
                        <span className="font-medium">{note.author}</span>
                        <Badge variant="outline" className="text-xs">
                          {note.authorRole}
                        </Badge>
                      </div>
                      
                      {note.notifyCustomer && (
                        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                          <Bell className="h-3 w-3 mr-1" />
                          Customer Notified
                        </Badge>
                      )}
                    </div>

                    {canEditNote(note) && (
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleEditNote(note.id)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDeleteNote(note.id)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-medium text-gray-900">{note.title}</h4>
                    <p className="text-gray-700 text-sm leading-relaxed">{note.description}</p>
                    
                    {note.attachment && (
                      <div className="flex items-center gap-2 p-2 bg-gray-50 rounded border">
                        <FileText className="h-4 w-4 text-gray-500" />
                        <span className="text-sm text-gray-700">{note.attachment.name}</span>
                        <Button size="sm" variant="ghost" className="ml-auto">
                          Download
                        </Button>
                      </div>
                    )}
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

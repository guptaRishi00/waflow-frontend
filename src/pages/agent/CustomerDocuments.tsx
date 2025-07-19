import { useEffect, useState } from "react";
import { Eye, FileText, File } from "lucide-react";
import axios from "axios";

interface CustomerDocumentsProps {
  selectedApp: any;
  token: string;
  onApplicationRefetch?: () => void; // <-- Add this prop
}

const getFileIcon = (fileUrl: string) => {
  if (!fileUrl) return <File className="h-5 w-5 text-gray-400" />;
  if (fileUrl.match(/\.pdf$/i))
    return <FileText className="h-5 w-5 text-red-600" />;
  if (fileUrl.match(/\.(jpg|jpeg|png|gif|bmp|webp)$/i))
    return <FileText className="h-5 w-5 text-blue-600" />;
  return <File className="h-5 w-5 text-gray-400" />;
};

const getStatusBadge = (status: string) => {
  switch (status?.toLowerCase()) {
    case "approved":
      return (
        <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">
          Approved
        </span>
      );
    case "rejected":
      return (
        <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-xs">
          Rejected
        </span>
      );
    case "pending":
      return (
        <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs">
          Pending
        </span>
      );
    default:
      return (
        <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-xs">
          {status}
        </span>
      );
  }
};

const CustomerDocuments: React.FC<CustomerDocumentsProps> = ({
  selectedApp,
  token,
  onApplicationRefetch,
}) => {
  const [customerDocuments, setCustomerDocuments] = useState<any[]>([]);
  const [applicationDocuments, setApplicationDocuments] = useState<any[]>([]);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [rejectingDocId, setRejectingDocId] = useState<string | null>(null);
  const [rejectNote, setRejectNote] = useState<string>("");
  const [addingNoteDocId, setAddingNoteDocId] = useState<string | null>(null);
  const [newNote, setNewNote] = useState<string>("");

  useEffect(() => {
    const fetchDocuments = async () => {
      if (
        !selectedApp ||
        !selectedApp.customer ||
        !selectedApp.customer._id ||
        !selectedApp._id ||
        !token
      )
        return;
      try {
        const customerRes = await axios.get(
          `${import.meta.env.VITE_BASE_URL}/api/document/customer/${
            selectedApp.customer._id
          }`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setCustomerDocuments(customerRes.data.data || []);
        console.log("customerDocuments:", customerRes.data.data || []);
      } catch (err) {
        setCustomerDocuments([]);
      }
      try {
        const appRes = await axios.get(
          `${import.meta.env.VITE_BASE_URL}/api/document/application/${
            selectedApp._id
          }`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setApplicationDocuments(appRes.data.data || []);
      } catch (err) {
        setApplicationDocuments([]);
      }
    };
    fetchDocuments();
  }, [selectedApp, token]);

  const handleStatusUpdate = async (docId: string, status: 'Approved' | 'Rejected', note?: string) => {
    setActionLoading(docId + status);
    try {
      await axios.put(
        `${import.meta.env.VITE_BASE_URL}/api/document/${docId}`,
        { status },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (status === 'Rejected' && note) {
        await axios.post(
          `${import.meta.env.VITE_BASE_URL}/api/document/${docId}/note`,
          { message: note },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }
      // Refresh documents after update
      const customerRes = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/api/document/customer/${selectedApp.customer._id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setCustomerDocuments(customerRes.data.data || []);
      // Refetch application data to update step status in real-time
      if (typeof onApplicationRefetch === 'function') {
        await onApplicationRefetch();
      }
    } catch (err) {
      // Optionally show error toast
      console.error('Error updating document status:', err);
    } finally {
      setActionLoading(null);
      setRejectingDocId(null);
      setRejectNote("");
    }
  };

  const handleAddNote = async (docId: string) => {
    if (!newNote.trim()) return;
    setActionLoading(docId + 'note');
    try {
      await axios.post(
        `${import.meta.env.VITE_BASE_URL}/api/document/${docId}/note`,
        { message: newNote },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      // Refresh documents after adding note
      const customerRes = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/api/document/customer/${selectedApp.customer._id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setCustomerDocuments(customerRes.data.data || []);
    } catch (err) {
      console.error('Error adding note:', err);
    } finally {
      setActionLoading(null);
      setAddingNoteDocId(null);
      setNewNote("");
    }
  };

  const renderDocumentList = (docs: any[], heading: string) => (
    <div>
      <h4 className="font-semibold mb-2">{heading}</h4>
      <div className="space-y-4">
        {docs.map((doc) => (
          <div
            key={doc._id}
            className="border rounded-lg p-4 flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              {getFileIcon(doc.fileUrl)}
              <div>
                <h4 className="font-medium">{doc.documentType}</h4>
                <p className="text-sm text-muted-foreground">
                  {doc.documentName}
                </p>
                {doc.uploadedAt && (
                  <p className="text-xs text-gray-500">
                    Uploaded: {new Date(doc.uploadedAt).toLocaleDateString()}
                  </p>
                )}
                {/* Show notes if present */}
                {doc.notes && doc.notes.length > 0 && (
                  <div className="mt-2 p-2 bg-yellow-50 border rounded">
                    <strong>Notes:</strong>
                    <ul>
                      {doc.notes.map((note: any, idx: number) => (
                        <li key={idx}>
                          <span className="font-semibold">{note.addedByRole === 'agent' || note.addedByRole === 'admin' ? 'Agent' : 'Customer'}:</span>
                          <span> {note.message}</span>
                          <span className="text-xs text-muted-foreground ml-2">
                            {note.timestamp ? new Date(note.timestamp).toLocaleString() : ""}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              {doc.fileUrl && (
                <a href={doc.fileUrl} target="_blank" rel="noopener noreferrer">
                  <Eye className="h-5 w-5 text-primary" />
                </a>
              )}
              {getStatusBadge(doc.status)}
              {/* Approve/Reject buttons for Pending status */}
              {doc.status?.toLowerCase() === 'pending' && (
                <>
                  <button
                    className="ml-2 px-2 py-1 bg-green-500 text-white rounded text-xs disabled:opacity-50"
                    disabled={actionLoading === doc._id + 'Approved'}
                    onClick={() => handleStatusUpdate(doc._id, 'Approved')}
                  >
                    {actionLoading === doc._id + 'Approved' ? 'Approving...' : 'Approve'}
                  </button>
                  {rejectingDocId === doc._id ? (
                    <div className="flex flex-col gap-2 ml-2">
                      <textarea
                        className="border rounded p-1 text-xs"
                        placeholder="Enter rejection note..."
                        value={rejectNote}
                        onChange={e => setRejectNote(e.target.value)}
                        rows={2}
                        style={{ minWidth: 180 }}
                      />
                      <div className="flex gap-2">
                        <button
                          className="px-2 py-1 bg-red-500 text-white rounded text-xs disabled:opacity-50"
                          disabled={actionLoading === doc._id + 'Rejected' || !rejectNote.trim()}
                          onClick={() => handleStatusUpdate(doc._id, 'Rejected', rejectNote)}
                        >
                          {actionLoading === doc._id + 'Rejected' ? 'Rejecting...' : 'Submit Rejection'}
                        </button>
                        <button
                          className="px-2 py-1 bg-gray-300 text-gray-800 rounded text-xs"
                          onClick={() => { setRejectingDocId(null); setRejectNote(""); }}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      className="ml-2 px-2 py-1 bg-red-500 text-white rounded text-xs disabled:opacity-50"
                      disabled={actionLoading === doc._id + 'Rejected'}
                      onClick={() => setRejectingDocId(doc._id)}
                    >
                      Reject
                    </button>
                  )}
                </>
              )}
              {/* Add Note button for any status */}
              {addingNoteDocId === doc._id ? (
                <div className="flex flex-col gap-2 ml-2">
                  <textarea
                    className="border rounded p-1 text-xs"
                    placeholder="Enter note for customer..."
                    value={newNote}
                    onChange={e => setNewNote(e.target.value)}
                    rows={2}
                    style={{ minWidth: 180 }}
                  />
                  <div className="flex gap-2">
                    <button
                      className="px-2 py-1 bg-blue-500 text-white rounded text-xs disabled:opacity-50"
                      disabled={actionLoading === doc._id + 'note' || !newNote.trim()}
                      onClick={() => handleAddNote(doc._id)}
                    >
                      {actionLoading === doc._id + 'note' ? 'Adding...' : 'Add Note'}
                    </button>
                    <button
                      className="px-2 py-1 bg-gray-300 text-gray-800 rounded text-xs"
                      onClick={() => { setAddingNoteDocId(null); setNewNote(""); }}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  className="ml-2 px-2 py-1 bg-blue-500 text-white rounded text-xs disabled:opacity-50"
                  disabled={actionLoading === doc._id + 'note'}
                  onClick={() => setAddingNoteDocId(doc._id)}
                >
                  Add Note
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const hasDocs =
    customerDocuments.length > 0 || applicationDocuments.length > 0;

  return (
    <div>
      {!hasDocs ? (
        <div className="text-center py-8 text-muted-foreground">
          No documents uploaded yet
        </div>
      ) : (
        <div className="space-y-8">
          {customerDocuments.length > 0 &&
            renderDocumentList(customerDocuments, "Customer-linked Documents")}
          {applicationDocuments.length > 0 &&
            renderDocumentList(
              applicationDocuments,
              "Application-linked Documents"
            )}
        </div>
      )}
    </div>
  );
};

export default CustomerDocuments;

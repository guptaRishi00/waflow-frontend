import { useEffect, useState } from 'react';
import { Eye, FileText, File } from 'lucide-react';
import axios from 'axios';

interface CustomerDocumentsProps {
  selectedApp: any;
  token: string;
}

const getFileIcon = (fileUrl: string) => {
  if (!fileUrl) return <File className="h-5 w-5 text-gray-400" />;
  if (fileUrl.match(/\.pdf$/i)) return <FileText className="h-5 w-5 text-red-600" />;
  if (fileUrl.match(/\.(jpg|jpeg|png|gif|bmp|webp)$/i)) return <FileText className="h-5 w-5 text-blue-600" />;
  return <File className="h-5 w-5 text-gray-400" />;
};

const getStatusBadge = (status: string) => {
  switch (status?.toLowerCase()) {
    case 'approved':
      return <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">Approved</span>;
    case 'rejected':
      return <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-xs">Rejected</span>;
    case 'pending':
      return <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs">Pending</span>;
    default:
      return <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-xs">{status}</span>;
  }
};

const CustomerDocuments: React.FC<CustomerDocumentsProps> = ({ selectedApp, token }) => {
  const [customerDocuments, setCustomerDocuments] = useState<any[]>([]);
  const [applicationDocuments, setApplicationDocuments] = useState<any[]>([]);

  useEffect(() => {
    const fetchDocuments = async () => {
      if (!selectedApp || !selectedApp.customer || !selectedApp.customer._id || !selectedApp._id || !token) return;
      try {
        const customerRes = await axios.get(
          `${import.meta.env.VITE_BASE_URL}/api/document/customer/${selectedApp.customer._id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setCustomerDocuments(customerRes.data.data || []);
        console.log('customerDocuments:', customerRes.data.data || []);
      } catch (err) {
        setCustomerDocuments([]);
      }
      try {
        const appRes = await axios.get(
          `${import.meta.env.VITE_BASE_URL}/api/document/application/${selectedApp._id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setApplicationDocuments(appRes.data.data || []);
      } catch (err) {
        setApplicationDocuments([]);
      }
    };
    fetchDocuments();
  }, [selectedApp, token]);

  const renderDocumentList = (docs: any[], heading: string) => (
    <div>
      <h4 className="font-semibold mb-2">{heading}</h4>
      <div className="space-y-4">
        {docs.map((doc) => (
          <div key={doc._id} className="border rounded-lg p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              {getFileIcon(doc.fileUrl)}
              <div>
                <h4 className="font-medium">{doc.documentName}</h4>
                <p className="text-sm text-muted-foreground">{doc.documentType}</p>
                {doc.uploadedAt && (
                  <p className="text-xs text-gray-500">Uploaded: {new Date(doc.uploadedAt).toLocaleDateString()}</p>
                )}
                {doc.rejectionReason && (
                  <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded">
                    <p className="text-sm text-red-700">
                      <strong>Rejection Reason:</strong> {doc.rejectionReason}
                    </p>
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
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const hasDocs = customerDocuments.length > 0 || applicationDocuments.length > 0;

  return (
    <div>
      {!hasDocs ? (
        <div className="text-center py-8 text-muted-foreground">
          No documents uploaded yet
        </div>
      ) : (
        <div className="space-y-8">
          {customerDocuments.length > 0 && renderDocumentList(customerDocuments, 'Customer-linked Documents')}
          {applicationDocuments.length > 0 && renderDocumentList(applicationDocuments, 'Application-linked Documents')}
        </div>
      )}
    </div>
  );
};

export default CustomerDocuments; 
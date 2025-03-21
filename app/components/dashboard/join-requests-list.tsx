import { useState, useEffect } from 'react';
import { Role, RequestStatus } from '@prisma/client';
import { toast } from 'sonner';
import { Button } from '~/components/ui/button';
import { format } from 'date-fns';

const API_BASE_URL = '/api';

interface JoinRequest {
  id: string;
  email: string;
  name: string;
  role: Role;
  status: RequestStatus;
  message: string | null;
  createdAt: string;
  reviewedAt: string | null;
  reviewedBy: string | null;
}

interface JoinRequestsListProps {
  roleFilter?: Role;
  statusFilter?: RequestStatus;
  limit?: number;
}

export function JoinRequestsList({
  roleFilter,
  statusFilter = 'PENDING',
  limit = 10,
}: JoinRequestsListProps) {
  const [joinRequests, setJoinRequests] = useState<JoinRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState<string>('');
  const [showRejectionModal, setShowRejectionModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<JoinRequest | null>(null);
  const [total, setTotal] = useState(0);
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    fetchJoinRequests();
  }, [roleFilter, statusFilter, limit, offset]);

  async function fetchJoinRequests() {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      if (roleFilter) params.append('role', roleFilter);
      if (statusFilter) params.append('status', statusFilter);
      params.append('limit', limit.toString());
      params.append('offset', offset.toString());

      const response = await fetch(`${API_BASE_URL}/join-request?${params.toString()}`);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch join requests');
      }

      const data = await response.json();
      setJoinRequests(data.data);
      setTotal(data.pagination.total);
    } catch (err) {
      console.error('Error fetching join requests:', err);
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');

      toast.error('Failed to load join requests', {
        description: err instanceof Error ? err.message : 'Please try again later',
      });
    } finally {
      setLoading(false);
    }
  }

  function handleApprove(request: JoinRequest) {
    updateRequestStatus(request.id, 'APPROVED');
  }

  function handleShowRejectModal(request: JoinRequest) {
    setSelectedRequest(request);
    setRejectionReason('');
    setShowRejectionModal(true);
  }

  function handleReject() {
    if (!selectedRequest) return;

    updateRequestStatus(selectedRequest.id, 'REJECTED', rejectionReason);
    setShowRejectionModal(false);
    setSelectedRequest(null);
  }

  async function updateRequestStatus(id: string, status: 'APPROVED' | 'REJECTED', reason?: string) {
    setProcessingId(id);

    try {
      if (status === 'APPROVED') {
        const response = await fetch(`${API_BASE_URL}/users/create-with-magic-link`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error('Failed to create user');
        }

        toast.success('User account created with Magic Link', {
          description: `User account created with Magic Link`,
        });
      }
      if (status === 'REJECTED') {
        const response = await fetch(`${API_BASE_URL}/join-request/${id}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            status,
            reason,
          }),
        });
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to update join request');
        }
      }
    } catch (err) {
      console.error('Error updating join request:', err);

      toast.error('Update Failed', {
        description: err instanceof Error ? err.message : 'Please try again later',
      });
    } finally {
      setProcessingId(null);
    }
  }

  function handleNextPage() {
    if (offset + limit < total) {
      setOffset(offset + limit);
    }
  }

  function handlePreviousPage() {
    if (offset - limit >= 0) {
      setOffset(Math.max(0, offset - limit));
    }
  }

  if (loading && joinRequests.length === 0) {
    return <div className="flex justify-center p-8">Loading join requests...</div>;
  }

  if (error && joinRequests.length === 0) {
    return (
      <div className="bg-destructive/15 text-destructive rounded-md p-4">
        <h3 className="font-medium">Error loading join requests</h3>
        <p>{error}</p>
        <Button onClick={fetchJoinRequests} className="mt-2" variant="outline">
          Retry
        </Button>
      </div>
    );
  }

  if (joinRequests.length === 0) {
    return (
      <div className="bg-muted rounded-md p-6 text-center">
        <h3 className="mb-2 text-lg font-medium">No Join Requests Found</h3>
        <p className="text-muted-foreground">
          {statusFilter === 'PENDING'
            ? 'There are no pending join requests at this time.'
            : `No ${statusFilter.toLowerCase()} join requests found.`}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto rounded-md border">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-muted/50">
              <th className="px-4 py-3 text-left font-medium whitespace-nowrap">Name</th>
              <th className="px-4 py-3 text-left font-medium whitespace-nowrap">Email</th>
              <th className="px-4 py-3 text-left font-medium whitespace-nowrap">Role</th>
              <th className="px-4 py-3 text-left font-medium whitespace-nowrap">Date</th>
              <th className="px-4 py-3 text-left font-medium whitespace-nowrap">Status</th>
              <th className="px-4 py-3 text-left font-medium whitespace-nowrap">Actions</th>
            </tr>
          </thead>
          <tbody>
            {joinRequests.map(request => (
              <tr key={request.id} className="border-t">
                <td className="px-4 py-3 font-medium whitespace-nowrap">{request.name}</td>
                <td className="px-4 py-3 whitespace-nowrap">{request.email}</td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <RoleBadge role={request.role} />
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  {format(new Date(request.createdAt), 'MMM d, yyyy')}
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <StatusBadge status={request.status} />
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  {request.status === 'PENDING' ? (
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        onClick={() => handleApprove(request)}
                        disabled={processingId === request.id}
                        variant="default"
                      >
                        {processingId === request.id ? 'Processing...' : 'Approve'}
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleShowRejectModal(request)}
                        disabled={processingId === request.id}
                        variant="destructive"
                      >
                        Reject
                      </Button>
                    </div>
                  ) : (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setSelectedRequest(request);
                      }}
                    >
                      View Details
                    </Button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {}
      {total > limit && (
        <div className="flex items-center justify-between">
          <p className="text-muted-foreground text-sm">
            Showing {offset + 1}-{Math.min(offset + limit, total)} of {total} requests
          </p>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePreviousPage}
              disabled={offset === 0}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleNextPage}
              disabled={offset + limit >= total}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {}
      {showRejectionModal && selectedRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-lg bg-white p-6">
            <h2 className="mb-4 text-xl font-bold">Reject Join Request</h2>
            <p className="mb-4">
              Are you sure you want to reject the request from{' '}
              <strong>{selectedRequest.name}</strong>?
            </p>
            <div className="mb-4">
              <label className="mb-1 block text-sm font-medium">Reason (optional)</label>
              <textarea
                className="w-full rounded-md border px-3 py-2"
                rows={3}
                value={rejectionReason}
                onChange={e => setRejectionReason(e.target.value)}
                placeholder="Provide a reason for rejection"
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setShowRejectionModal(false)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleReject}>
                Confirm Rejection
              </Button>
            </div>
          </div>
        </div>
      )}

      {}
      {selectedRequest && !showRejectionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-lg bg-white p-6">
            <h2 className="mb-4 text-xl font-bold">Request Details</h2>
            <div className="space-y-3">
              <div>
                <span className="font-medium">Name:</span> {selectedRequest.name}
              </div>
              <div>
                <span className="font-medium">Email:</span> {selectedRequest.email}
              </div>
              <div>
                <span className="font-medium">Role:</span> {selectedRequest.role}
              </div>
              <div>
                <span className="font-medium">Status:</span> {selectedRequest.status}
              </div>
              <div>
                <span className="font-medium">Created:</span>{' '}
                {format(new Date(selectedRequest.createdAt), 'MMM d, yyyy h:mm a')}
              </div>
              {selectedRequest.reviewedAt && (
                <div>
                  <span className="font-medium">Reviewed:</span>{' '}
                  {format(new Date(selectedRequest.reviewedAt), 'MMM d, yyyy h:mm a')}
                </div>
              )}
              {selectedRequest.message && (
                <div>
                  <span className="font-medium">Message:</span>
                  <div className="bg-muted mt-1 rounded p-2 text-sm whitespace-pre-wrap">
                    {selectedRequest.message}
                  </div>
                </div>
              )}
            </div>
            <div className="mt-4 flex justify-end">
              <Button variant="outline" onClick={() => setSelectedRequest(null)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function RoleBadge({ role }: { role: Role }) {
  let bgClass = 'bg-blue-100 text-blue-800';

  switch (role) {
    case 'ADMIN':
      bgClass = 'bg-purple-100 text-purple-800';
      break;
    case 'PROPERTY_MANAGER':
      bgClass = 'bg-green-100 text-green-800';
      break;
    case 'TENANT':
      bgClass = 'bg-blue-100 text-blue-800';
      break;
    case 'OWNER':
      bgClass = 'bg-amber-100 text-amber-800';
      break;
    case 'SERVICE_PROVIDER':
      bgClass = 'bg-orange-100 text-orange-800';
      break;
  }

  return (
    <span className={`inline-block rounded-full px-2 py-1 text-xs font-semibold ${bgClass}`}>
      {role.replace('_', ' ')}
    </span>
  );
}

function StatusBadge({ status }: { status: RequestStatus }) {
  let bgClass = 'bg-gray-100 text-gray-800';

  switch (status) {
    case 'PENDING':
      bgClass = 'bg-yellow-100 text-yellow-800';
      break;
    case 'APPROVED':
      bgClass = 'bg-green-100 text-green-800';
      break;
    case 'REJECTED':
      bgClass = 'bg-red-100 text-red-800';
      break;
  }

  return (
    <span className={`inline-block rounded-full px-2 py-1 text-xs font-semibold ${bgClass}`}>
      {status}
    </span>
  );
}

import type {
  PaymentFrequency,
  UtilityType,
  MaintenanceRequestStatus,
  RequestPriority,
} from '@prisma/client';
import { Zap, Droplet, Flame, Wifi, Trash } from 'lucide-react';

export const formatPaymentFrequency = (frequency: PaymentFrequency) => {
  switch (frequency) {
    case 'MONTHLY':
      return 'Monthly';
    case 'QUARTERLY':
      return 'Quarterly';
    case 'ANNUALLY':
      return 'Annually';
    case 'BIWEEKLY':
      return 'Bi-weekly';
    case 'WEEKLY':
      return 'Weekly';
    case 'DAILY':
      return 'Daily';
    default:
      return frequency;
  }
};

export const getUtilityIcon = (utility: UtilityType) => {
  switch (utility) {
    case 'ELECTRICITY':
      return <Zap className="mr-1 h-4 w-4" />;
    case 'WATER':
      return <Droplet className="mr-1 h-4 w-4" />;
    case 'GAS':
      return <Flame className="mr-1 h-4 w-4" />;
    case 'INTERNET':
      return <Wifi className="mr-1 h-4 w-4" />;
    case 'HEATING':
      return <Flame className="mr-1 h-4 w-4" />;
    case 'WASTE_DISPOSAL':
      return <Trash className="mr-1 h-4 w-4" />;
    default:
      return null;
  }
};

export const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
};

export const formatDate = (dateString: string | null) => {
  if (!dateString) return 'Not specified';
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

export const calculateDaysRemaining = (endDateString: string | null) => {
  if (!endDateString) return null;

  const endDate = new Date(endDateString);
  const today = new Date();
  const diffTime = endDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return diffDays;
};

export const getStatusBadgeVariant = (status: string) => {
  switch (status) {
    case 'ACTIVE':
      return 'success';
    case 'DRAFT':
      return 'secondary';
    case 'TERMINATED':
      return 'destructive';
    case 'EXPIRED':
      return 'outline';
    case 'RENEWED':
      return 'info';
    default:
      return 'default';
  }
};

export const formatDateTime = (dateString: string | null) => {
  if (!dateString) return 'Not specified';
  return new Date(dateString).toLocaleString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const getMaintenanceStatusBadgeVariant = (status: MaintenanceRequestStatus) => {
  switch (status) {
    case 'OPEN':
      return 'secondary';
    case 'ASSIGNED':
      return 'warning';
    case 'IN_PROGRESS':
      return 'warning';
    case 'COMPLETED':
      return 'success';
    case 'CANCELLED':
      return 'destructive';
    default:
      return 'default';
  }
};

export const getMaintenancePriorityBadgeVariant = (priority: RequestPriority) => {
  switch (priority) {
    case 'LOW':
      return 'default';
    case 'NORMAL':
      return 'secondary';
    case 'HIGH':
      return 'warning';
    case 'EMERGENCY':
      return 'destructive';
    default:
      return 'default';
  }
};

export const getInitials = (name: string) => {
  if (!name) return 'U';
  return name
    .split(' ')
    .map(part => part[0])
    .join('')
    .toUpperCase();
};

export const getPaymentStatusBadge = (status: string) => {
  switch (status) {
    case 'PAID':
      return 'success';
    case 'PENDING':
      return 'warning';
    case 'LATE':
      return 'destructive';
    case 'UPCOMING':
      return 'secondary';
    case 'PARTIAL':
      return 'info';
    default:
      return 'default';
  }
};

export const getDaysUntilDue = (dueDateString: string) => {
  const dueDate = new Date(dueDateString);
  const today = new Date();
  const diffTime = dueDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return 'Overdue';
  if (diffDays === 0) return 'Due today';
  return `Due in ${diffDays} day${diffDays !== 1 ? 's' : ''}`;
};

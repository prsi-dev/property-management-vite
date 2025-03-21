import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';
import { CalendarIcon, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { Badge } from '~/components/ui/badge';

type PaymentStatus = 'paid' | 'late' | 'missed' | 'pending' | 'not-due';

type PaymentRecord = {
  id: string;
  date: string;
  amount: number;
  status: PaymentStatus;
  lateBy?: number | null;
};

type RentPaymentHistoryProps = {
  paymentRecords: PaymentRecord[];
  currentRent?: number | null;
  dueDate?: number | null; // Day of the month
};

export function RentPaymentHistory({
  paymentRecords = [],
  currentRent,
  dueDate = 1,
}: RentPaymentHistoryProps) {
  if (paymentRecords.length === 0) {
    return null;
  }

  // Sort payment records by date (newest first)
  const sortedRecords = [...paymentRecords].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  // Get current month and calculate future months
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  // Function to generate month cells for the last 6 months and upcoming 3 months
  const generateMonthCells = () => {
    const cells = [];
    const monthNames = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ];

    // Generate past 6 months
    for (let i = 6; i >= 0; i--) {
      let monthIndex = currentMonth - i;
      let year = currentYear;

      if (monthIndex < 0) {
        monthIndex += 12;
        year -= 1;
      }

      const monthDisplay = `${monthNames[monthIndex]} ${year}`;

      // Find payment record for this month
      const paymentRecord = sortedRecords.find(record => {
        const recordDate = new Date(record.date);
        return recordDate.getMonth() === monthIndex && recordDate.getFullYear() === year;
      });

      cells.push(
        <article
          key={`month-${monthIndex}-${year}`}
          className="flex flex-col items-center space-y-2 rounded-md border p-2"
        >
          <h4 className="text-sm font-medium">{monthDisplay}</h4>
          {getStatusIndicator(paymentRecord)}
          {paymentRecord && (
            <span className="text-xs">${paymentRecord.amount.toLocaleString()}</span>
          )}
        </article>
      );
    }

    // Generate upcoming 3 months
    for (let i = 1; i <= 3; i++) {
      let monthIndex = currentMonth + i;
      let year = currentYear;

      if (monthIndex > 11) {
        monthIndex -= 12;
        year += 1;
      }

      const monthDisplay = `${monthNames[monthIndex]} ${year}`;
      const dueDateValue = dueDate || 1; // Default to 1st if null
      const isPastDue = now.getDate() > dueDateValue && i === 1;
      const isCurrent = i === 1;

      cells.push(
        <article
          key={`month-${monthIndex}-${year}`}
          className={`flex flex-col items-center space-y-2 rounded-md border p-2 ${isCurrent ? 'border-blue-200 bg-blue-50' : ''}`}
        >
          <h4 className="text-sm font-medium">{monthDisplay}</h4>
          {isCurrent ? (
            <Badge variant={isPastDue ? 'warning' : 'outline'}>
              {isPastDue ? 'Due Now' : 'Upcoming'}
            </Badge>
          ) : (
            <Badge variant="outline">Future</Badge>
          )}
          {currentRent && <span className="text-xs">${currentRent.toLocaleString()}</span>}
        </article>
      );
    }

    return cells;
  };

  // Function to get status indicator based on payment status
  const getStatusIndicator = (record?: PaymentRecord) => {
    if (!record) return <Badge variant="outline">No Data</Badge>;

    switch (record.status) {
      case 'paid':
        return (
          <div className="flex items-center gap-1">
            <CheckCircle className="h-4 w-4 text-green-500" />
            <Badge variant="success">Paid</Badge>
          </div>
        );
      case 'late':
        return (
          <div className="flex items-center gap-1">
            <AlertTriangle className="h-4 w-4 text-amber-500" />
            <Badge variant="warning">Late {record.lateBy ? `(${record.lateBy} days)` : ''}</Badge>
          </div>
        );
      case 'missed':
        return (
          <div className="flex items-center gap-1">
            <XCircle className="h-4 w-4 text-red-500" />
            <Badge variant="destructive">Missed</Badge>
          </div>
        );
      case 'pending':
        return <Badge variant="secondary">Pending</Badge>;
      case 'not-due':
        return <Badge variant="outline">Not Due</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  // Calculate payment stats
  const paymentStats = {
    totalPayments: sortedRecords.length,
    onTimePayments: sortedRecords.filter(record => record.status === 'paid').length,
    latePayments: sortedRecords.filter(record => record.status === 'late').length,
    missedPayments: sortedRecords.filter(record => record.status === 'missed').length,
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg font-semibold">Rent Payment History</CardTitle>
        <div className="flex items-center gap-2">
          <CalendarIcon className="text-muted-foreground h-4 w-4" />
          <span className="text-muted-foreground text-xs">
            Due: {dueDate ? `${dueDate}${getOrdinal(dueDate)} of each month` : 'Not set'}
          </span>
        </div>
      </CardHeader>
      <CardContent>
        <section className="mb-4 grid grid-cols-4 gap-2">
          <article className="rounded-md bg-blue-50 p-2 text-center">
            <h3 className="text-muted-foreground text-xs font-medium">Total Payments</h3>
            <p className="text-lg font-bold">{paymentStats.totalPayments}</p>
          </article>
          <article className="rounded-md bg-green-50 p-2 text-center">
            <h3 className="text-muted-foreground text-xs font-medium">On Time</h3>
            <p className="text-lg font-bold text-green-700">{paymentStats.onTimePayments}</p>
          </article>
          <article className="rounded-md bg-amber-50 p-2 text-center">
            <h3 className="text-muted-foreground text-xs font-medium">Late</h3>
            <p className="text-lg font-bold text-amber-700">{paymentStats.latePayments}</p>
          </article>
          <article className="rounded-md bg-red-50 p-2 text-center">
            <h3 className="text-muted-foreground text-xs font-medium">Missed</h3>
            <p className="text-lg font-bold text-red-700">{paymentStats.missedPayments}</p>
          </article>
        </section>

        <section className="grid grid-cols-5 gap-2">{generateMonthCells()}</section>

        <section className="mt-6">
          <h3 className="mb-2 text-sm font-medium text-gray-500">Recent Payments</h3>
          <ul className="space-y-2">
            {sortedRecords.slice(0, 3).map(record => (
              <li
                key={record.id}
                className="flex items-center justify-between rounded-md border p-2"
              >
                <div className="flex items-center gap-2">
                  {getStatusIndicator(record)}
                  <time className="text-sm">{new Date(record.date).toLocaleDateString()}</time>
                </div>
                <span className="text-sm font-medium">${record.amount.toLocaleString()}</span>
              </li>
            ))}
          </ul>
        </section>
      </CardContent>
    </Card>
  );
}

// Function to get ordinal suffix
function getOrdinal(n: number): string {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return s[(v - 20) % 10] || s[v] || s[0];
}

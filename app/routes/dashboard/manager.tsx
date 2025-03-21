import React from 'react';

export default function ManagerDashboard() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Property Manager Dashboard</h1>

      <div className="rounded-lg bg-white p-6 shadow-md">
        <h2 className="mb-4 text-xl font-semibold">Welcome, Property Manager</h2>
        <p className="text-gray-600">
          This dashboard gives you a complete overview of all properties and tenants under your
          management. Use the tools below to efficiently handle day-to-day operations.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-lg bg-white p-6 shadow-md">
          <h2 className="mb-4 text-xl font-semibold">Properties Overview</h2>
          <p className="text-gray-600">Manage all properties under your supervision.</p>
          <div className="mt-4">
            <span className="text-2xl font-bold">12</span>
            <span className="ml-2 text-sm text-gray-500">Active Properties</span>
          </div>
          <button className="bg-primary hover:bg-opacity-90 mt-4 rounded px-4 py-2 text-white transition">
            View Properties
          </button>
        </div>

        <div className="rounded-lg bg-white p-6 shadow-md">
          <h2 className="mb-4 text-xl font-semibold">Maintenance Requests</h2>
          <p className="text-gray-600">View and handle maintenance requests.</p>
          <div className="mt-4">
            <span className="text-2xl font-bold text-orange-500">3</span>
            <span className="ml-2 text-sm text-gray-500">Pending Requests</span>
          </div>
          <button className="bg-primary hover:bg-opacity-90 mt-4 rounded px-4 py-2 text-white transition">
            Review Requests
          </button>
        </div>

        <div className="rounded-lg bg-white p-6 shadow-md">
          <h2 className="mb-4 text-xl font-semibold">Lease Management</h2>
          <p className="text-gray-600">Manage tenant leases and renewals.</p>
          <div className="mt-4">
            <span className="text-2xl font-bold text-blue-500">2</span>
            <span className="ml-2 text-sm text-gray-500">Expiring Soon</span>
          </div>
          <button className="bg-primary hover:bg-opacity-90 mt-4 rounded px-4 py-2 text-white transition">
            Manage Leases
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="rounded-lg bg-white p-6 shadow-md">
          <h2 className="mb-4 text-xl font-semibold">Recent Activities</h2>
          <div className="space-y-4">
            <div className="border-b pb-3">
              <p className="font-medium">New maintenance request submitted</p>
              <p className="text-sm text-gray-500">Unit 1A - Leaking faucet in kitchen</p>
              <p className="text-xs text-gray-400">Today, 11:30 AM</p>
            </div>
            <div className="border-b pb-3">
              <p className="font-medium">Rent payment received</p>
              <p className="text-sm text-gray-500">Unit 1B - $900</p>
              <p className="text-xs text-gray-400">Yesterday, 3:15 PM</p>
            </div>
            <div className="border-b pb-3">
              <p className="font-medium">New tenant application</p>
              <p className="text-sm text-gray-500">For Unit 2C - Needs review</p>
              <p className="text-xs text-gray-400">Oct 15, 9:45 AM</p>
            </div>
          </div>
          <button className="mt-4 w-full rounded bg-gray-100 px-4 py-2 text-gray-800 transition hover:bg-gray-200">
            View All Activities
          </button>
        </div>

        <div className="rounded-lg bg-white p-6 shadow-md">
          <h2 className="mb-4 text-xl font-semibold">Upcoming Tasks</h2>
          <div className="space-y-4">
            <div className="flex items-center">
              <input type="checkbox" id="task1" className="mr-3 h-4 w-4" />
              <div>
                <label htmlFor="task1" className="font-medium">
                  Complete property inspection
                </label>
                <p className="text-sm text-gray-500">123 Maple Street - Due Oct 18</p>
              </div>
            </div>
            <div className="flex items-center">
              <input type="checkbox" id="task2" className="mr-3 h-4 w-4" />
              <div>
                <label htmlFor="task2" className="font-medium">
                  Review rental applications
                </label>
                <p className="text-sm text-gray-500">3 pending applications - Due Oct 20</p>
              </div>
            </div>
            <div className="flex items-center">
              <input type="checkbox" id="task3" className="mr-3 h-4 w-4" />
              <div>
                <label htmlFor="task3" className="font-medium">
                  Schedule maintenance for Unit 3B
                </label>
                <p className="text-sm text-gray-500">Plumbing issues - Due Oct 21</p>
              </div>
            </div>
          </div>
          <button className="mt-6 w-full rounded bg-gray-100 px-4 py-2 text-gray-800 transition hover:bg-gray-200">
            Add New Task
          </button>
        </div>
      </div>

      <div className="rounded-lg bg-white p-6 shadow-md">
        <h2 className="mb-4 text-xl font-semibold">Quick Actions</h2>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <button className="rounded-lg bg-blue-50 p-4 text-center text-sm text-blue-700 transition hover:bg-blue-100">
            Add New Property
          </button>
          <button className="rounded-lg bg-green-50 p-4 text-center text-sm text-green-700 transition hover:bg-green-100">
            Process Payment
          </button>
          <button className="rounded-lg bg-purple-50 p-4 text-center text-sm text-purple-700 transition hover:bg-purple-100">
            Schedule Viewing
          </button>
          <button className="rounded-lg bg-orange-50 p-4 text-center text-sm text-orange-700 transition hover:bg-orange-100">
            Generate Reports
          </button>
        </div>
      </div>
    </div>
  );
}

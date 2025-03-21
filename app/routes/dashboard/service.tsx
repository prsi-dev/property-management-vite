import React from 'react';

export default function ServiceProviderDashboard() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Service Provider Dashboard</h1>

      <div className="rounded-lg bg-white p-6 shadow-md">
        <h2 className="mb-4 text-xl font-semibold">Welcome, Service Provider</h2>
        <p className="text-gray-600">
          This dashboard helps you manage your maintenance tasks and appointments for properties.
          Track your work orders, update job statuses, and communicate with property managers.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-lg bg-white p-6 shadow-md">
          <h2 className="mb-4 text-xl font-semibold">Assigned Work Orders</h2>
          <p className="text-gray-600">View maintenance tasks assigned to you.</p>
          <div className="mt-4">
            <span className="text-2xl font-bold text-red-500">2</span>
            <span className="ml-2 text-sm text-gray-500">Pending Tasks</span>
          </div>
          <button className="bg-primary hover:bg-opacity-90 mt-4 rounded px-4 py-2 text-white transition">
            View Work Orders
          </button>
        </div>

        <div className="rounded-lg bg-white p-6 shadow-md">
          <h2 className="mb-4 text-xl font-semibold">Completed Jobs</h2>
          <p className="text-gray-600">History of your completed maintenance work.</p>
          <div className="mt-4">
            <span className="text-2xl font-bold text-green-500">15</span>
            <span className="ml-2 text-sm text-gray-500">Last 30 Days</span>
          </div>
          <button className="bg-primary hover:bg-opacity-90 mt-4 rounded px-4 py-2 text-white transition">
            View History
          </button>
        </div>

        <div className="rounded-lg bg-white p-6 shadow-md">
          <h2 className="mb-4 text-xl font-semibold">Schedule</h2>
          <p className="text-gray-600">View your upcoming appointments.</p>
          <div className="mt-4">
            <span className="text-2xl font-bold text-blue-500">3</span>
            <span className="ml-2 text-sm text-gray-500">Upcoming Appointments</span>
          </div>
          <button className="bg-primary hover:bg-opacity-90 mt-4 rounded px-4 py-2 text-white transition">
            View Calendar
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="rounded-lg bg-white p-6 shadow-md">
          <h2 className="mb-4 text-xl font-semibold">Today&apos;s Work Orders</h2>
          <div className="space-y-4">
            <div className="border-b pb-3">
              <p className="font-medium">Leaking faucet repair</p>
              <p className="text-sm text-gray-500">Unit 1A - 123 Sunset Blvd, Apartment City</p>
              <p className="text-sm text-gray-500">Scheduled: 10:00 AM - 12:00 PM</p>
              <div className="mt-2 flex items-center justify-between">
                <span className="inline-block rounded-full bg-yellow-100 px-2 py-1 text-xs font-semibold text-yellow-800">
                  In Progress
                </span>
                <button className="text-xs text-blue-600 hover:underline">Update Status</button>
              </div>
            </div>
            <div className="border-b pb-3">
              <p className="font-medium">HVAC inspection</p>
              <p className="text-sm text-gray-500">Building: Downtown Office Complex</p>
              <p className="text-sm text-gray-500">Scheduled: 2:00 PM - 4:00 PM</p>
              <div className="mt-2 flex items-center justify-between">
                <span className="inline-block rounded-full bg-blue-100 px-2 py-1 text-xs font-semibold text-blue-800">
                  Scheduled
                </span>
                <button className="text-xs text-blue-600 hover:underline">Update Status</button>
              </div>
            </div>
          </div>
          <button className="mt-4 w-full rounded bg-gray-100 px-4 py-2 text-gray-800 transition hover:bg-gray-200">
            View All Work Orders
          </button>
        </div>

        <div className="rounded-lg bg-white p-6 shadow-md">
          <h2 className="mb-4 text-xl font-semibold">Parts & Inventory</h2>
          <p className="mb-4 text-gray-600">Track parts used and request new supplies</p>
          <div className="mb-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Pipe Fittings</span>
              <span className="text-sm font-medium">12 remaining</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">HVAC Filters</span>
              <span className="text-sm font-medium text-orange-500">3 remaining</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Electrical Components</span>
              <span className="text-sm font-medium text-red-500">Out of Stock</span>
            </div>
          </div>
          <div className="flex space-x-3">
            <button className="bg-primary hover:bg-opacity-90 flex-1 rounded px-4 py-2 text-white transition">
              Request Supplies
            </button>
            <button className="flex-1 rounded bg-gray-100 px-4 py-2 text-gray-800 transition hover:bg-gray-200">
              View Inventory
            </button>
          </div>
        </div>
      </div>

      <div className="rounded-lg bg-white p-6 shadow-md">
        <h2 className="mb-4 text-xl font-semibold">Communication Center</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="rounded-lg border p-4">
            <h3 className="mb-2 font-medium">Messages</h3>
            <p className="mb-2 text-sm text-gray-600">You have 3 unread messages</p>
            <button className="text-sm text-blue-600 hover:underline">View Messages</button>
          </div>
          <div className="rounded-lg border p-4">
            <h3 className="mb-2 font-medium">Documentation</h3>
            <p className="mb-2 text-sm text-gray-600">Submit work documentation and photos</p>
            <button className="text-sm text-blue-600 hover:underline">Upload Files</button>
          </div>
          <div className="rounded-lg border p-4">
            <h3 className="mb-2 font-medium">Properties</h3>
            <p className="mb-2 text-sm text-gray-600">View property details and access codes</p>
            <button className="text-sm text-blue-600 hover:underline">View Properties</button>
          </div>
        </div>
      </div>
    </div>
  );
}

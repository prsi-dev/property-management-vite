import React from 'react';
import { Link } from 'react-router';

export default function GeneralDashboard() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Welcome to Property Management</h1>

      <div className="rounded-lg bg-white p-6 shadow-md">
        <h2 className="mb-4 text-xl font-semibold">Account Setup Required</h2>
        <p className="mb-4 text-gray-600">
          Your account seems to have an unrecognized role or requires additional setup. Please
          contact your administrator to ensure your account is properly configured.
        </p>

        <div className="mb-6 rounded-md border border-yellow-200 bg-yellow-50 p-4 text-yellow-800">
          <p className="font-medium">Possible reasons:</p>
          <ul className="mt-2 ml-5 list-disc">
            <li>Your account was recently created and is still being set up</li>
            <li>Your role may have been changed recently</li>
            <li>There may be a system issue with role assignments</li>
          </ul>
        </div>

        <div className="flex flex-col gap-4 sm:flex-row">
          <Link
            to="/profile"
            className="bg-primary hover:bg-opacity-90 rounded px-4 py-2 text-center text-white transition"
          >
            View Profile Settings
          </Link>
          <Link
            to="/help"
            className="rounded bg-gray-100 px-4 py-2 text-center text-gray-800 transition hover:bg-gray-200"
          >
            Contact Support
          </Link>
        </div>
      </div>

      <div className="rounded-lg bg-white p-6 shadow-md">
        <h2 className="mb-4 text-xl font-semibold">Available Features</h2>
        <p className="mb-4 text-gray-600">
          While your account is being set up, you can access these general features:
        </p>

        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="rounded-md border p-4">
            <h3 className="font-semibold">Profile Management</h3>
            <p className="text-sm text-gray-500">Update your personal information</p>
          </div>

          <div className="rounded-md border p-4">
            <h3 className="font-semibold">Notifications</h3>
            <p className="text-sm text-gray-500">View your system notifications</p>
          </div>

          <div className="rounded-md border p-4">
            <h3 className="font-semibold">Help Center</h3>
            <p className="text-sm text-gray-500">Access guides and contact support</p>
          </div>
        </div>
      </div>
    </div>
  );
}

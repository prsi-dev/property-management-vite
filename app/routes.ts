import { type RouteConfig, index, layout, route, prefix } from '@react-router/dev/routes';

export default [
  // Home page
  index('routes/home.tsx'),

  // Auth routes
  ...prefix('auth', [
    route('login', 'routes/auth/login.tsx'),
    route('logout', 'routes/auth/logout.tsx'),
    // route('signup', 'routes/auth/signup.tsx'), Removed to only use the invitation link
    route('forgot-password', 'routes/auth/forgot-password.tsx'),
    route('reset-password', 'routes/auth/reset-password.tsx'),
  ]),

  // Dashboard routes - protected
  ...prefix('dashboard', [
    layout('routes/dashboard/_dashboard.tsx', [
      index('routes/dashboard/index.tsx'),

      // Admin section - for property managers and system administrators
      ...prefix('admin', [
        // Admin dashboard
        index('routes/dashboard/admin/index.tsx'),

        // User management routes
        route('users', 'routes/dashboard/admin/users/index.tsx'),
        route('users/:id', 'routes/dashboard/admin/users/[id].tsx'), // Main user profile/details
        route('users/:id/properties', 'routes/dashboard/admin/users/[id]/properties.tsx'), // Dedicated properties view

        // Property management routes
        route('properties', 'routes/dashboard/admin/properties/index.tsx'),
        route('properties/:id', 'routes/dashboard/admin/properties/[id].tsx'),

        // Rental contract management routes
        route('rental-contracts', 'routes/dashboard/admin/rental-contracts/index.tsx'),
        route('rental-contracts/:id', 'routes/dashboard/admin/rental-contracts/[id].tsx'),

        // Event management routes
        route('events', 'routes/dashboard/admin/events/index.tsx'),
        route('events/:id', 'routes/dashboard/admin/events/[id].tsx'),
      ]),

      // Role-specific dashboard routes
      ...prefix('owner', [
        index('routes/dashboard/owner.tsx'),
        // Property management for owners
        route('properties', 'routes/dashboard/owner/properties/index.tsx'),
        route('properties/:id', 'routes/dashboard/owner/properties/[id].tsx'),
        // Rental contract management for owners
        route('rental-contracts', 'routes/dashboard/owner/rental-contracts/index.tsx'),
        route('rental-contracts/:id', 'routes/dashboard/owner/rental-contracts/[id].tsx'),
        // Event management for owners
        route('events', 'routes/dashboard/owner/events/index.tsx'),
        route('events/:id', 'routes/dashboard/owner/events/[id].tsx'),
      ]),

      // Tenant dashboard routes
      ...prefix('tenant', [
        index('routes/dashboard/tenant.tsx'),
        // Lease management for tenants
        route('lease', 'routes/dashboard/tenant/lease/index.tsx'),
        route('lease/:id', 'routes/dashboard/tenant/lease/[id].tsx'),
        // Payment management for tenants
        route('payments', 'routes/dashboard/tenant/payments/index.tsx'),
        route('payments/:id', 'routes/dashboard/tenant/payments/[id].tsx'),
        // Maintenance requests for tenants
        //route('maintenance', 'routes/dashboard/tenant/maintenance/index.tsx'),
        //route('maintenance/:id', 'routes/dashboard/tenant/maintenance/[id].tsx'),
        // Events for tenants
        route('events', 'routes/dashboard/tenant/events/index.tsx'),
        route('events/:id', 'routes/dashboard/tenant/events/[id].tsx'),
      ]),

      ...prefix('manager', [route('manager', 'routes/dashboard/manager.tsx')]),
      ...prefix('service', [route('service', 'routes/dashboard/service.tsx')]),
      route('general', 'routes/dashboard/general.tsx'),
    ]),
  ]),

  // API routes
  ...prefix('api', [
    route('join-request', 'api/join-request/route.ts'),
    route('join-request/:id', 'api/join-request/[id]/route.ts'),
    route('users', 'api/users/route.ts'),
    route('users/:id', 'api/users/[id]/route.ts'),
    route('users/:id/send-magic-link', 'api/users/[id]/send-magic-link/route.ts'),
    route('users/create-with-magic-link', 'api/users/create-with-magic-link/route.ts'),
    route('events', 'api/events/route.ts'),
    route('events/:id', 'api/events/[id]/route.ts'),
    route('properties', 'api/properties/route.ts'),
    route('properties/:id', 'api/properties/[id]/route.ts'),
  ]),
] satisfies RouteConfig;

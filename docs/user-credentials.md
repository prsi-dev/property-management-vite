# User Authentication Credentials

This document provides login credentials for all test users created during database seeding. These users are available in both the Prisma database and Supabase Auth system.

## Default Password

**All users share the same password:**

```
123456
```

## Available Users by Role

### Administrator

| Email             | Name       | Role  | Password |
| ----------------- | ---------- | ----- | -------- |
| admin@example.com | Admin User | ADMIN | 123456   |

### Property Managers

| Email               | Name             | Role             | Password |
| ------------------- | ---------------- | ---------------- | -------- |
| manager@example.com | Property Manager | PROPERTY_MANAGER | 123456   |

### Property Owners

| Email              | Name       | Role  | Password |
| ------------------ | ---------- | ----- | -------- |
| owner1@example.com | John Owner | OWNER | 123456   |
| owner2@example.com | Jane Owner | OWNER | 123456   |

### Tenants

| Email               | Name         | Role   | Password |
| ------------------- | ------------ | ------ | -------- |
| tenant1@example.com | Alice Tenant | TENANT | 123456   |
| tenant2@example.com | Bob Tenant   | TENANT | 123456   |

### Service Providers

| Email               | Name        | Role             | Password |
| ------------------- | ----------- | ---------------- | -------- |
| service@example.com | Bob Plumber | SERVICE_PROVIDER | 123456   |

## Pending Join Requests

The following email addresses have pending join requests but are **not** yet registered users:

| Email                  | Name               | Requested Role |
| ---------------------- | ------------------ | -------------- |
| potential@example.com  | Potential Tenant   | TENANT         |
| potential2@example.com | Potential Tenant 2 | TENANT         |
| potential3@example.com | Potential Owner 3  | OWNER          |
| potential4@example.com | Potential Tenant 4 | TENANT         |

## How to Use These Credentials

1. Navigate to the login page at `/auth/login`
2. Enter the email and password from the tables above
3. The system will authenticate and redirect to the appropriate role-based dashboard:
   - Administrators → `/dashboard/admin`
   - Property Managers → `/dashboard/manager`
   - Owners → `/dashboard/owner`
   - Tenants → `/dashboard/tenant`
   - Service Providers → `/dashboard/service`

## Resetting the Database

To reset the database and recreate these users, run:

```bash
npm run seed:auth
```

This command will:

1. Clean up any existing users in Supabase Auth
2. Reset the Prisma database
3. Recreate all users in both systems

## Notes

- These credentials are for testing purposes only
- In production, each user would have a unique, secure password
- The password "123456" is intentionally simple for development convenience
- All seeded users have email verification automatically set to "confirmed"

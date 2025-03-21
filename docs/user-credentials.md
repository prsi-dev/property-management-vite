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

## Families

The following families are seeded in the database:

### The Smiths

- Size: 4 members
- Income: $120,000/year
- Credit Score: 750
- Pets: Yes (one small dog - beagle)
- Employment: Both parents work full-time in professional roles
- Status: ACTIVE
- Description: A family of 4 with stable income and excellent rental history

### The Johnsons

- Size: 3 members
- Income: $95,000/year
- Credit Score: 720
- Pets: No
- Employment: Software engineer and teacher
- Status: ACTIVE
- Description: Young couple with one child looking for a long-term home

### The Garcia Family

- Size: 5 members
- Income: $135,000/year
- Credit Score: 710
- Pets: No
- Employment: Family business owners
- Status: ACTIVE
- Description: Multi-generational family seeking a spacious property

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

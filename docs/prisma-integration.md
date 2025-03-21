# Prisma Integration Documentation

## Overview

The property management system uses Prisma as its ORM with:

- PostgreSQL database
- Type-safe database queries
- Schema migrations
- Seeding functionality
- Complex relationships

## Database Setup

### Configuration

```typescript
// prisma/schema.prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}

// lib/db.ts
import { PrismaClient } from '@prisma/client';

declare global {
  var prisma: PrismaClient | undefined;
}

export const prisma = global.prisma || new PrismaClient();

if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma;
}
```

## Core Models

### User Management

```prisma
model User {
  id                           String               @id @default(uuid())
  email                        String               @unique
  password                     String
  name                         String
  role                         Role
  createdAt                    DateTime             @default(now())
  updatedAt                    DateTime             @updatedAt
  alternativeContact           String?
  creditScore                  Int?
  employer                     String?
  employmentStatus            String?
  identificationVerified      Boolean              @default(false)
  monthlyIncome               Float?
  location                    Location?            @relation(fields: [locationId], references: [id])
  locationId                  String?

  // Relations
  applicationForms            ApplicationForm[]
  maintenanceRequests         MaintenanceRequest[]
  notifications              Notification[]
  resourceAssignments        ResourceAssignment[]
  ownedResources             Resource[]           @relation("ResourceOwner")
  family                     Family?              @relation(fields: [familyId], references: [id])
}
```

### Property Management

```prisma
model Resource {
  id                   String                @id @default(uuid())
  type                 ResourceType
  label                String
  address              String?
  description          String?
  amenities            String[]
  images               String[]
  isActive             Boolean               @default(true)
  isAvailable          Boolean               @default(true)
  squareFootage        Float?
  rentAmount           Float?

  // Relations
  location             Location?             @relation(fields: [locationId], references: [id])
  maintenanceRequests  MaintenanceRequest[]
  rentalContracts      RentalContract[]
  owners               User[]                @relation("ResourceOwner")
  primaryFamily        Family?               @relation("PrimaryOccupant")
}
```

## Query Patterns

### Basic CRUD Operations

```typescript
// Create
const user = await prisma.user.create({
  data: {
    email,
    password: hashedPassword,
    name,
    role,
  },
});

// Read
const user = await prisma.user.findUnique({
  where: { email },
});

// Update
const user = await prisma.user.update({
  where: { id },
  data: { role: newRole },
});

// Delete
const user = await prisma.user.delete({
  where: { id },
});
```

### Complex Queries

#### Nested Relations

```typescript
// Get Property with All Relations
const property = await prisma.resource.findUnique({
  where: { id },
  include: {
    location: true,
    maintenanceRequests: {
      include: {
        reporter: true,
        assignedTo: true,
      },
    },
    rentalContracts: {
      include: {
        tenant: true,
        payments: true,
      },
    },
    owners: true,
  },
});
```

#### Filtered Queries

```typescript
// Get Active Properties with Available Units
const properties = await prisma.resource.findMany({
  where: {
    isActive: true,
    isAvailable: true,
    type: ResourceType.UNIT,
    rentAmount: {
      lte: maxRent,
      gte: minRent,
    },
  },
  orderBy: {
    rentAmount: 'asc',
  },
});
```

### Transactions

```typescript
// Create User and Family in Transaction
const [user, family] = await prisma.$transaction([
  prisma.user.create({
    data: userData,
  }),
  prisma.family.create({
    data: {
      ...familyData,
      members: {
        connect: { id: userData.id },
      },
    },
  }),
]);
```

## Migrations

### Migration Commands

```bash
# Create a new migration
npx prisma migrate dev --name migration_name

# Apply migrations to production
npx prisma migrate deploy

# Reset database
npx prisma migrate reset
```

### Migration Example

```sql
-- Migration: Add verification fields
-- migration.sql
ALTER TABLE "User" ADD COLUMN "identificationVerified" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "User" ADD COLUMN "identificationDocumentType" TEXT;
ALTER TABLE "User" ADD COLUMN "identificationDocumentNumber" TEXT;
```

## Seeding

### Seed Script

```typescript
// prisma/seed.ts
import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.create({
    data: {
      email: 'admin@example.com',
      password: adminPassword,
      name: 'System Admin',
      role: Role.ADMIN,
    },
  });

  // Create test property
  const property = await prisma.resource.create({
    data: {
      type: 'BUILDING',
      label: 'Test Property',
      address: '123 Test St',
      isActive: true,
      owners: {
        connect: { id: admin.id },
      },
    },
  });
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
```

## Performance Optimization

### Query Optimization

```typescript
// Select Specific Fields
const users = await prisma.user.findMany({
  select: {
    id: true,
    name: true,
    email: true,
  },
});

// Pagination
const properties = await prisma.resource.findMany({
  take: 10,
  skip: page * 10,
  orderBy: {
    createdAt: 'desc',
  },
});

// Efficient Counting
const count = await prisma.resource.count({
  where: {
    isActive: true,
  },
});
```

### Batch Operations

```typescript
// Create Multiple Records
const users = await prisma.user.createMany({
  data: userDataArray,
  skipDuplicates: true,
});

// Update Multiple Records
const updated = await prisma.resource.updateMany({
  where: {
    type: 'UNIT',
    isAvailable: true,
  },
  data: {
    rentAmount: {
      increment: 50,
    },
  },
});
```

## Error Handling

### Prisma Error Types

```typescript
import { Prisma } from '@prisma/client';

try {
  // Database operation
} catch (error) {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    // Handle known errors (P2002: Unique constraint failed)
    if (error.code === 'P2002') {
      throw new Error('A record with this value already exists');
    }
  } else if (error instanceof Prisma.PrismaClientValidationError) {
    // Handle validation errors
    throw new Error('Invalid data provided');
  }
}
```

### Custom Error Handling

```typescript
// Database Error Wrapper
async function dbOperation<T>(operation: () => Promise<T>): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      handlePrismaError(error);
    }
    throw error;
  }
}

// Usage
const user = await dbOperation(() =>
  prisma.user.create({
    data: userData,
  })
);
```

## Development Tools

### Prisma Studio

```bash
# Start Prisma Studio
npx prisma studio

# Generate Prisma Client
npx prisma generate

# Format Schema
npx prisma format
```

### Type Generation

```typescript
// Generate TypeScript types
import { Prisma } from '@prisma/client';

type UserWithRelations = Prisma.UserGetPayload<{
  include: {
    family: true;
    ownedResources: true;
  };
}>;
```

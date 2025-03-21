# Implementation Plan for Create/Edit Forms

This document outlines the plan for implementing consistent Create and Edit forms across all admin routes in the property management system.

## Pattern to Follow

For each entity (Events, Properties, Users, Rental Contracts), we'll implement:

1. **Component Structure**

   - Create a `create-{entity}-form.tsx` component
   - Create an `edit-{entity}-form.tsx` component
   - Both will use the same form schema and fields, differing only in default values and submission handling

2. **Integration Points**

   - The entity list page (`index.tsx`) will have:
     - An "Add" button in the header that opens the Create form
     - Edit buttons in the table rows that open the Edit form
   - The entity detail page (`[id].tsx`) will have:
     - An Edit button that opens the Edit form

3. **Form Pattern**
   - Modal dialog format
   - Form validation using Zod schema
   - Submit handling with loading state
   - Cancel button to close without saving

## Implementation Status

### Events

- ✅ `create-event-form.tsx`
- ✅ `edit-event-form.tsx`
- ✅ Integration in events/index.tsx
- ✅ Integration in events/[id].tsx

### Properties

- 🔲 `create-property-form.tsx`
- 🔲 `edit-property-form.tsx`
- 🔲 Integration in properties/index.tsx
- 🔲 Integration in properties/[id].tsx

### Users

- 🔲 `create-user-form.tsx`
- 🔲 `edit-user-form.tsx`
- 🔲 Integration in users/index.tsx
- 🔲 Integration in users/[id]/[id].tsx

### Rental Contracts

- 🔲 `create-rental-contract-form.tsx`
- 🔲 `edit-rental-contract-form.tsx`
- 🔲 Integration in rental-contracts/index.tsx
- 🔲 Integration in rental-contracts/[id].tsx

## Next Steps

1. Implement Property Forms:

   - Create `app/components/dashboard/properties/create-property-form.tsx`
   - Create `app/components/dashboard/properties/edit-property-form.tsx`
   - Update both properties/index.tsx and properties/[id].tsx

2. Implement User Forms:

   - Create `app/components/dashboard/users/create-user-form.tsx`
   - Create `app/components/dashboard/users/edit-user-form.tsx`
   - Update both users/index.tsx and users/[id]/[id].tsx

3. Implement Rental Contract Forms:
   - Create `app/components/dashboard/rental-contracts/create-rental-contract-form.tsx`
   - Create `app/components/dashboard/rental-contracts/edit-rental-contract-form.tsx`
   - Update both rental-contracts/index.tsx and rental-contracts/[id].tsx

## Form Fields by Entity

### Property Form Fields

- Label (string, required)
- Type (select, required)
- Address (string, optional)
- Description (textarea, optional)
- Bedroom Count (number, optional)
- Bathroom Count (number, optional)
- Square Footage (number, optional)
- Rent Amount (number, optional)
- Status (active/inactive, boolean)
- Parent Property (select, optional)
- Amenities (multi-select/tags, optional)

### User Form Fields

- Name (string, required)
- Email (string, required, email format)
- Role (select, required)
- Phone Number (string, optional)
- Employment Status (select, optional)
- Employer (string, optional)
- Monthly Income (number, optional)
- Organization (select, optional)

### Rental Contract Form Fields

- Contract Number (string, required)
- Property (select, required)
- Status (select, required)
- Start Date (date, required)
- End Date (date, optional)
- Is Open Ended (boolean)
- Base Rent Amount (number, required)
- Security Deposit (number, optional)
- Payment Frequency (select, required)

// Family-related types
export interface Family {
  id: string;
  name: string;
  description: string | null;
  income: number | null;
  hasPets: boolean;
  petDetails: string | null;
  employmentDetails: string | null;
  creditScore: number | null;
  moveInDate: Date | string | null;
  preferredRent: string | null;
  leaseLength: number | null;
  preferredLocation: string | null;
  references: string | null;
  status: FamilyStatus;
  verificationStatus: VerificationStatus;
  backgroundCheckStatus: VerificationStatus | null;
  creditCheckStatus: VerificationStatus | null;
  incomeVerificationStatus: VerificationStatus | null;
  users?: FamilyUser[];
  applications?: FamilyApplication[];
  documents?: FamilyDocument[];
  rentalHistory?: RentalHistory[];
  createdAt: Date;
  updatedAt: Date;
}

export interface FamilyMember {
  id: string;
  familyUserId: string;
  name: string;
  email: string | null;
  phone: string | null;
  role: string | null;
  age: number | null;
  isHeadOfFamily: boolean;
  createdAt: Date;
}

export interface FamilyUser {
  id: string;
  familyId: string;
  userId: string;
  role: string | null;
  age: number | null;
  isHeadOfFamily: boolean;
  createdAt: Date;
  updatedAt: Date;
  user?: User;
  family?: Family;
}

export interface FamilyDocument {
  id: string;
  familyId: string;
  name: string;
  type: DocumentType;
  url: string;
  createdAt: Date;
  updatedAt: Date;
  family?: Family;
}

export interface FamilyApplication {
  id: string;
  familyId: string;
  resourceId: string;
  status: ApplicationStatus;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
  family?: Family;
  resource?: Resource;
}

export interface RentalHistory {
  id: string;
  familyId: string;
  address: string;
  landlord: string | null;
  contactInfo: string | null;
  startDate: Date | string | null;
  endDate: Date | string | null;
  rent: number | null;
  leaveReason: string | null;
  createdAt: Date;
  updatedAt: Date;
  family?: Family;
}

export enum FamilyStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  PENDING = 'PENDING',
}

export enum VerificationStatus {
  PENDING = 'PENDING',
  VERIFIED = 'VERIFIED',
  FAILED = 'FAILED',
}

export enum DocumentType {
  INCOME = 'INCOME',
  RENTAL_HISTORY = 'RENTAL_HISTORY',
  BACKGROUND_CHECK = 'BACKGROUND_CHECK',
  CREDIT_REPORT = 'CREDIT_REPORT',
  IDENTIFICATION = 'IDENTIFICATION',
  OTHER = 'OTHER',
}

export enum ApplicationStatus {
  DRAFT = 'DRAFT',
  SUBMITTED = 'SUBMITTED',
  UNDER_REVIEW = 'UNDER_REVIEW',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  WAITLISTED = 'WAITLISTED',
}

// Expanded User type with family relationship
export interface User {
  // ... existing fields ...
  familyUsers?: FamilyUser[];
}

// Define Resource interface if it doesn't exist
export interface Resource {
  id: string;
  name: string;
  type: string;
  status: string;
  // Add other fields as needed
}

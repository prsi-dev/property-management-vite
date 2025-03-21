-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'PROPERTY_MANAGER', 'TENANT', 'OWNER', 'SERVICE_PROVIDER');

-- CreateEnum
CREATE TYPE "RequestStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "ResourceType" AS ENUM ('BUILDING', 'UNIT', 'COMMERCIAL_SPACE', 'PARKING_SPOT', 'STORAGE', 'LAND', 'TENANT');

-- CreateEnum
CREATE TYPE "EventType" AS ENUM ('LEASE_AGREEMENT', 'RENT_PAYMENT', 'MAINTENANCE_REQUEST', 'INSPECTION', 'MOVE_IN', 'MOVE_OUT', 'CONTRACT_RENEWAL', 'TERMINATION_NOTICE');

-- CreateEnum
CREATE TYPE "PropertyType" AS ENUM ('STRING', 'NUMBER', 'BOOLEAN', 'DATE', 'ENUM');

-- CreateEnum
CREATE TYPE "EventStatus" AS ENUM ('PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "EventParticipantRole" AS ENUM ('OWNER', 'TENANT', 'PROPERTY_MANAGER', 'WITNESS', 'SERVICE_PROVIDER');

-- CreateEnum
CREATE TYPE "EventParticipationStatus" AS ENUM ('PENDING', 'CONFIRMED', 'DECLINED', 'COMPLETED');

-- CreateEnum
CREATE TYPE "ApplicationStatus" AS ENUM ('PENDING', 'SCREENING', 'APPROVED', 'REJECTED', 'WAITLISTED');

-- CreateEnum
CREATE TYPE "ScreeningStatus" AS ENUM ('PENDING', 'PASSED', 'FAILED', 'WAIVED');

-- CreateEnum
CREATE TYPE "ContractStatus" AS ENUM ('DRAFT', 'ACTIVE', 'TERMINATED', 'EXPIRED', 'RENEWED');

-- CreateEnum
CREATE TYPE "MaintenanceCategory" AS ENUM ('PLUMBING', 'ELECTRICAL', 'HEATING', 'APPLIANCE', 'STRUCTURAL', 'PEST_CONTROL', 'LANDSCAPING', 'CLEANING', 'OTHER');

-- CreateEnum
CREATE TYPE "RequestPriority" AS ENUM ('EMERGENCY', 'HIGH', 'NORMAL', 'LOW');

-- CreateEnum
CREATE TYPE "ApprovalStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'PAID', 'LATE', 'PARTIAL', 'WAIVED');

-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('BANK_TRANSFER', 'DIRECT_DEBIT', 'CREDIT_CARD', 'CASH', 'CHECK', 'OTHER');

-- CreateEnum
CREATE TYPE "ExpenseCategory" AS ENUM ('MAINTENANCE', 'REPAIRS', 'UTILITIES', 'TAXES', 'INSURANCE', 'MANAGEMENT_FEES', 'LEGAL_FEES', 'OTHER');

-- CreateEnum
CREATE TYPE "PaymentFrequency" AS ENUM ('MONTHLY', 'QUARTERLY', 'ANNUALLY', 'BIWEEKLY', 'WEEKLY', 'DAILY');

-- CreateEnum
CREATE TYPE "UtilityType" AS ENUM ('ELECTRICITY', 'WATER', 'GAS', 'INTERNET', 'HEATING', 'WASTE_DISPOSAL');

-- CreateEnum
CREATE TYPE "CommunicationType" AS ENUM ('EMAIL', 'SMS', 'PHONE_CALL', 'IN_APP_MESSAGE', 'LETTER', 'IN_PERSON');

-- CreateEnum
CREATE TYPE "CommunicationDirection" AS ENUM ('OUTGOING', 'INCOMING');

-- CreateEnum
CREATE TYPE "MaintenanceRequestStatus" AS ENUM ('OPEN', 'ASSIGNED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "OrganizationType" AS ENUM ('INDIVIDUAL', 'COMPANY', 'PARTNERSHIP', 'TRUST', 'GOVERNMENT', 'NON_PROFIT');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('MAINTENANCE_UPDATE', 'PAYMENT_DUE', 'PAYMENT_RECEIVED', 'CONTRACT_UPDATE', 'APPLICATION_STATUS', 'GENERAL');

-- CreateEnum
CREATE TYPE "AuditAction" AS ENUM ('CREATE', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT', 'APPROVE', 'REJECT', 'ASSIGN');

-- CreateEnum
CREATE TYPE "FamilyStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'PENDING_VERIFICATION', 'FORMER');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" "Role" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "alternativeContact" TEXT,
    "creditScore" INTEGER,
    "employer" TEXT,
    "employmentStatus" TEXT,
    "identificationDocumentNumber" TEXT,
    "identificationDocumentType" TEXT,
    "identificationVerified" BOOLEAN NOT NULL DEFAULT false,
    "monthlyIncome" DOUBLE PRECISION,
    "phoneNumber" TEXT,
    "previousLandlordReference" TEXT,
    "organizationId" TEXT,
    "familyId" TEXT,
    "isHeadOfFamily" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JoinRequest" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" "Role" NOT NULL,
    "status" "RequestStatus" NOT NULL DEFAULT 'PENDING',
    "message" TEXT,
    "reviewedBy" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "JoinRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Resource" (
    "id" TEXT NOT NULL,
    "type" "ResourceType" NOT NULL,
    "label" TEXT NOT NULL,
    "parentId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "address" TEXT,
    "postalCode" TEXT,
    "amenities" TEXT[],
    "bathroomCount" DOUBLE PRECISION,
    "bedroomCount" INTEGER,
    "description" TEXT,
    "images" TEXT[],
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "squareFootage" DOUBLE PRECISION,
    "metadataGroupId" TEXT,
    "rentAmount" DOUBLE PRECISION,
    "primaryFamilyId" TEXT,

    CONSTRAINT "Resource_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Event" (
    "id" TEXT NOT NULL,
    "type" "EventType" NOT NULL,
    "label" TEXT NOT NULL,
    "resourceId" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "amount" DOUBLE PRECISION,
    "attachments" TEXT[],
    "notes" TEXT,
    "status" "EventStatus" NOT NULL DEFAULT 'PENDING',
    "metadataGroupId" TEXT,

    CONSTRAINT "Event_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MetadataGroup" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MetadataGroup_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MetadataField" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "dataType" "PropertyType" NOT NULL,
    "resourceId" TEXT,
    "userId" TEXT,
    "familyId" TEXT,
    "organizationId" TEXT,
    "contractId" TEXT,
    "maintenanceId" TEXT,
    "applicationId" TEXT,
    "paymentId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MetadataField_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ResourceAssignment" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "resourceId" TEXT NOT NULL,
    "familyId" TEXT,
    "role" "Role" NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "contractReference" TEXT,
    "rentalAmount" DOUBLE PRECISION,
    "paymentFrequency" "PaymentFrequency",
    "securityDeposit" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ResourceAssignment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EventAssignment" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "familyId" TEXT,
    "role" "EventParticipantRole" NOT NULL,
    "status" "EventParticipationStatus" NOT NULL DEFAULT 'PENDING',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EventAssignment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ApplicationForm" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "resourceId" TEXT,
    "familyId" TEXT,
    "desiredMoveInDate" TIMESTAMP(3) NOT NULL,
    "desiredRentalPeriod" INTEGER,
    "numberOfOccupants" INTEGER NOT NULL,
    "occupantDetails" TEXT,
    "hasPets" BOOLEAN NOT NULL DEFAULT false,
    "petDetails" TEXT,
    "incomeDocuments" TEXT[],
    "referencesProvided" BOOLEAN NOT NULL DEFAULT false,
    "backgroundCheckStatus" "ScreeningStatus" NOT NULL DEFAULT 'PENDING',
    "creditCheckStatus" "ScreeningStatus" NOT NULL DEFAULT 'PENDING',
    "incomeVerificationStatus" "ScreeningStatus" NOT NULL DEFAULT 'PENDING',
    "landlordReferenceStatus" "ScreeningStatus" NOT NULL DEFAULT 'PENDING',
    "status" "ApplicationStatus" NOT NULL DEFAULT 'PENDING',
    "reviewedBy" TEXT,
    "rejectionReason" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ApplicationForm_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContractVersion" (
    "id" TEXT NOT NULL,
    "contractId" TEXT NOT NULL,
    "versionNumber" INTEGER NOT NULL,
    "documentUrl" TEXT NOT NULL,
    "changesDescription" TEXT,
    "createdBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ContractVersion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RentalContract" (
    "id" TEXT NOT NULL,
    "contractNumber" TEXT NOT NULL,
    "resourceId" TEXT NOT NULL,
    "familyId" TEXT,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "isOpenEnded" BOOLEAN NOT NULL DEFAULT false,
    "baseRentAmount" DOUBLE PRECISION NOT NULL,
    "securityDeposit" DOUBLE PRECISION NOT NULL,
    "depositPaid" BOOLEAN NOT NULL DEFAULT false,
    "utilityCharges" DOUBLE PRECISION,
    "includedUtilities" "UtilityType"[],
    "paymentFrequency" "PaymentFrequency" NOT NULL DEFAULT 'MONTHLY',
    "paymentDueDay" INTEGER NOT NULL,
    "lateFeePercentage" DOUBLE PRECISION,
    "terminationNotice" INTEGER NOT NULL,
    "hasMietpreisbremse" BOOLEAN NOT NULL DEFAULT false,
    "previousRentAmount" DOUBLE PRECISION,
    "rentIncreaseSchedule" TEXT,
    "status" "ContractStatus" NOT NULL DEFAULT 'DRAFT',
    "terminationDate" TIMESTAMP(3),
    "terminationReason" TEXT,
    "contractDocumentUrl" TEXT,
    "additionalDocuments" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "metadataGroupId" TEXT,

    CONSTRAINT "RentalContract_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MaintenanceRequest" (
    "id" TEXT NOT NULL,
    "requestNumber" TEXT NOT NULL,
    "resourceId" TEXT NOT NULL,
    "reportedBy" TEXT NOT NULL,
    "familyId" TEXT,
    "category" "MaintenanceCategory" NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "priority" "RequestPriority" NOT NULL DEFAULT 'NORMAL',
    "images" TEXT[],
    "assignedTo" TEXT,
    "estimatedCost" DOUBLE PRECISION,
    "actualCost" DOUBLE PRECISION,
    "scheduledDate" TIMESTAMP(3),
    "completedDate" TIMESTAMP(3),
    "status" "MaintenanceRequestStatus" NOT NULL DEFAULT 'OPEN',
    "resolution" TEXT,
    "feedback" TEXT,
    "feedbackRating" INTEGER,
    "requiresOwnerApproval" BOOLEAN NOT NULL DEFAULT false,
    "ownerApprovalStatus" "ApprovalStatus",
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MaintenanceRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RentPayment" (
    "id" TEXT NOT NULL,
    "contractId" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "coversPeriodStart" TIMESTAMP(3) NOT NULL,
    "coversPeriodEnd" TIMESTAMP(3) NOT NULL,
    "dueDate" TIMESTAMP(3) NOT NULL,
    "datePaid" TIMESTAMP(3),
    "paymentMethod" "PaymentMethod",
    "paymentReference" TEXT,
    "status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "lateFee" DOUBLE PRECISION,
    "receiptUrl" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RentPayment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PropertyExpense" (
    "id" TEXT NOT NULL,
    "resourceId" TEXT NOT NULL,
    "category" "ExpenseCategory" NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "description" TEXT,
    "paidBy" TEXT,
    "paidTo" TEXT,
    "receiptUrl" TEXT,
    "isRecurring" BOOLEAN NOT NULL DEFAULT false,
    "recurringFrequency" "PaymentFrequency",
    "taxDeductible" BOOLEAN NOT NULL DEFAULT false,
    "accountingCategory" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PropertyExpense_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Communication" (
    "id" TEXT NOT NULL,
    "type" "CommunicationType" NOT NULL,
    "direction" "CommunicationDirection" NOT NULL,
    "userId" TEXT NOT NULL,
    "familyId" TEXT,
    "resourceId" TEXT,
    "maintenanceRequestId" TEXT,
    "subject" TEXT,
    "content" TEXT NOT NULL,
    "attachments" TEXT[],
    "sentAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "readAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Communication_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Organization" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "OrganizationType" NOT NULL,
    "registrationNumber" TEXT,
    "taxId" TEXT,
    "address" TEXT,
    "contactEmail" TEXT,
    "contactPhone" TEXT,
    "website" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Organization_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Tag" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "color" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Tag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "familyId" TEXT,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "type" "NotificationType" NOT NULL,
    "relatedResourceId" TEXT,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "action" "AuditAction" NOT NULL,
    "performedBy" TEXT NOT NULL,
    "details" TEXT,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Family" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "size" INTEGER NOT NULL,
    "income" DOUBLE PRECISION,
    "hasPets" BOOLEAN NOT NULL DEFAULT false,
    "petDetails" TEXT,
    "employmentDetails" TEXT,
    "creditScore" INTEGER,
    "references" TEXT,
    "preferredContactEmail" TEXT,
    "preferredContactPhone" TEXT,
    "moveInDate" TIMESTAMP(3),
    "moveOutDate" TIMESTAMP(3),
    "status" "FamilyStatus" NOT NULL DEFAULT 'ACTIVE',
    "documents" TEXT[],
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Family_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ResourceApplication" (
    "id" TEXT NOT NULL,
    "resourceId" TEXT NOT NULL,
    "familyId" TEXT NOT NULL,
    "status" "ApplicationStatus" NOT NULL DEFAULT 'PENDING',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ResourceApplication_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_ResourceOwner" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_ResourceOwner_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_ResourceTags" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_ResourceTags_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_OrganizationOwner" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_OrganizationOwner_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_OrganizationTags" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_OrganizationTags_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_ResourceOccupants" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_ResourceOccupants_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "JoinRequest_email_key" ON "JoinRequest"("email");

-- CreateIndex
CREATE UNIQUE INDEX "MetadataField_resourceId_key_key" ON "MetadataField"("resourceId", "key");

-- CreateIndex
CREATE UNIQUE INDEX "MetadataField_userId_key_key" ON "MetadataField"("userId", "key");

-- CreateIndex
CREATE UNIQUE INDEX "MetadataField_familyId_key_key" ON "MetadataField"("familyId", "key");

-- CreateIndex
CREATE UNIQUE INDEX "MetadataField_organizationId_key_key" ON "MetadataField"("organizationId", "key");

-- CreateIndex
CREATE UNIQUE INDEX "MetadataField_contractId_key_key" ON "MetadataField"("contractId", "key");

-- CreateIndex
CREATE UNIQUE INDEX "MetadataField_maintenanceId_key_key" ON "MetadataField"("maintenanceId", "key");

-- CreateIndex
CREATE UNIQUE INDEX "MetadataField_applicationId_key_key" ON "MetadataField"("applicationId", "key");

-- CreateIndex
CREATE UNIQUE INDEX "MetadataField_paymentId_key_key" ON "MetadataField"("paymentId", "key");

-- CreateIndex
CREATE UNIQUE INDEX "ContractVersion_contractId_versionNumber_key" ON "ContractVersion"("contractId", "versionNumber");

-- CreateIndex
CREATE UNIQUE INDEX "RentalContract_contractNumber_key" ON "RentalContract"("contractNumber");

-- CreateIndex
CREATE UNIQUE INDEX "MaintenanceRequest_requestNumber_key" ON "MaintenanceRequest"("requestNumber");

-- CreateIndex
CREATE UNIQUE INDEX "Tag_name_key" ON "Tag"("name");

-- CreateIndex
CREATE INDEX "_ResourceOwner_B_index" ON "_ResourceOwner"("B");

-- CreateIndex
CREATE INDEX "_ResourceTags_B_index" ON "_ResourceTags"("B");

-- CreateIndex
CREATE INDEX "_OrganizationOwner_B_index" ON "_OrganizationOwner"("B");

-- CreateIndex
CREATE INDEX "_OrganizationTags_B_index" ON "_OrganizationTags"("B");

-- CreateIndex
CREATE INDEX "_ResourceOccupants_B_index" ON "_ResourceOccupants"("B");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_familyId_fkey" FOREIGN KEY ("familyId") REFERENCES "Family"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Resource" ADD CONSTRAINT "Resource_metadataGroupId_fkey" FOREIGN KEY ("metadataGroupId") REFERENCES "MetadataGroup"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Resource" ADD CONSTRAINT "Resource_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Resource"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Resource" ADD CONSTRAINT "Resource_primaryFamilyId_fkey" FOREIGN KEY ("primaryFamilyId") REFERENCES "Family"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_metadataGroupId_fkey" FOREIGN KEY ("metadataGroupId") REFERENCES "MetadataGroup"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_resourceId_fkey" FOREIGN KEY ("resourceId") REFERENCES "Resource"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MetadataField" ADD CONSTRAINT "MetadataField_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "ApplicationForm"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MetadataField" ADD CONSTRAINT "MetadataField_contractId_fkey" FOREIGN KEY ("contractId") REFERENCES "RentalContract"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MetadataField" ADD CONSTRAINT "MetadataField_maintenanceId_fkey" FOREIGN KEY ("maintenanceId") REFERENCES "MaintenanceRequest"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MetadataField" ADD CONSTRAINT "MetadataField_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MetadataField" ADD CONSTRAINT "MetadataField_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES "RentPayment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MetadataField" ADD CONSTRAINT "MetadataField_resourceId_fkey" FOREIGN KEY ("resourceId") REFERENCES "Resource"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MetadataField" ADD CONSTRAINT "MetadataField_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MetadataField" ADD CONSTRAINT "MetadataField_familyId_fkey" FOREIGN KEY ("familyId") REFERENCES "Family"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ResourceAssignment" ADD CONSTRAINT "ResourceAssignment_resourceId_fkey" FOREIGN KEY ("resourceId") REFERENCES "Resource"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ResourceAssignment" ADD CONSTRAINT "ResourceAssignment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ResourceAssignment" ADD CONSTRAINT "ResourceAssignment_familyId_fkey" FOREIGN KEY ("familyId") REFERENCES "Family"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventAssignment" ADD CONSTRAINT "EventAssignment_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventAssignment" ADD CONSTRAINT "EventAssignment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventAssignment" ADD CONSTRAINT "EventAssignment_familyId_fkey" FOREIGN KEY ("familyId") REFERENCES "Family"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApplicationForm" ADD CONSTRAINT "ApplicationForm_resourceId_fkey" FOREIGN KEY ("resourceId") REFERENCES "Resource"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApplicationForm" ADD CONSTRAINT "ApplicationForm_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApplicationForm" ADD CONSTRAINT "ApplicationForm_familyId_fkey" FOREIGN KEY ("familyId") REFERENCES "Family"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContractVersion" ADD CONSTRAINT "ContractVersion_contractId_fkey" FOREIGN KEY ("contractId") REFERENCES "RentalContract"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RentalContract" ADD CONSTRAINT "RentalContract_metadataGroupId_fkey" FOREIGN KEY ("metadataGroupId") REFERENCES "MetadataGroup"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RentalContract" ADD CONSTRAINT "RentalContract_resourceId_fkey" FOREIGN KEY ("resourceId") REFERENCES "Resource"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RentalContract" ADD CONSTRAINT "RentalContract_familyId_fkey" FOREIGN KEY ("familyId") REFERENCES "Family"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MaintenanceRequest" ADD CONSTRAINT "MaintenanceRequest_reportedBy_fkey" FOREIGN KEY ("reportedBy") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MaintenanceRequest" ADD CONSTRAINT "MaintenanceRequest_resourceId_fkey" FOREIGN KEY ("resourceId") REFERENCES "Resource"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MaintenanceRequest" ADD CONSTRAINT "MaintenanceRequest_familyId_fkey" FOREIGN KEY ("familyId") REFERENCES "Family"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RentPayment" ADD CONSTRAINT "RentPayment_contractId_fkey" FOREIGN KEY ("contractId") REFERENCES "RentalContract"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PropertyExpense" ADD CONSTRAINT "PropertyExpense_resourceId_fkey" FOREIGN KEY ("resourceId") REFERENCES "Resource"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Communication" ADD CONSTRAINT "Communication_maintenanceRequestId_fkey" FOREIGN KEY ("maintenanceRequestId") REFERENCES "MaintenanceRequest"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Communication" ADD CONSTRAINT "Communication_resourceId_fkey" FOREIGN KEY ("resourceId") REFERENCES "Resource"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Communication" ADD CONSTRAINT "Communication_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Communication" ADD CONSTRAINT "Communication_familyId_fkey" FOREIGN KEY ("familyId") REFERENCES "Family"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_relatedResourceId_fkey" FOREIGN KEY ("relatedResourceId") REFERENCES "Resource"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_familyId_fkey" FOREIGN KEY ("familyId") REFERENCES "Family"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ResourceApplication" ADD CONSTRAINT "ResourceApplication_resourceId_fkey" FOREIGN KEY ("resourceId") REFERENCES "Resource"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ResourceApplication" ADD CONSTRAINT "ResourceApplication_familyId_fkey" FOREIGN KEY ("familyId") REFERENCES "Family"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ResourceOwner" ADD CONSTRAINT "_ResourceOwner_A_fkey" FOREIGN KEY ("A") REFERENCES "Resource"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ResourceOwner" ADD CONSTRAINT "_ResourceOwner_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ResourceTags" ADD CONSTRAINT "_ResourceTags_A_fkey" FOREIGN KEY ("A") REFERENCES "Resource"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ResourceTags" ADD CONSTRAINT "_ResourceTags_B_fkey" FOREIGN KEY ("B") REFERENCES "Tag"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_OrganizationOwner" ADD CONSTRAINT "_OrganizationOwner_A_fkey" FOREIGN KEY ("A") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_OrganizationOwner" ADD CONSTRAINT "_OrganizationOwner_B_fkey" FOREIGN KEY ("B") REFERENCES "Resource"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_OrganizationTags" ADD CONSTRAINT "_OrganizationTags_A_fkey" FOREIGN KEY ("A") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_OrganizationTags" ADD CONSTRAINT "_OrganizationTags_B_fkey" FOREIGN KEY ("B") REFERENCES "Tag"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ResourceOccupants" ADD CONSTRAINT "_ResourceOccupants_A_fkey" FOREIGN KEY ("A") REFERENCES "Family"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ResourceOccupants" ADD CONSTRAINT "_ResourceOccupants_B_fkey" FOREIGN KEY ("B") REFERENCES "Resource"("id") ON DELETE CASCADE ON UPDATE CASCADE;

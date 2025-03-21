import {
  PrismaClient,
  Role,
  ResourceType,
  OrganizationType,
  EventType,
  EventStatus,
  EventParticipantRole,
  EventParticipationStatus,
  MaintenanceCategory,
  RequestPriority,
  MaintenanceRequestStatus,
  ContractStatus,
  PaymentFrequency,
  UtilityType,
  PaymentStatus,
  PaymentMethod,
  ApplicationStatus,
  ScreeningStatus,
  RequestStatus,
  PropertyType,
  ExpenseCategory,
  NotificationType,
  AuditAction,
  CommunicationType,
  CommunicationDirection,
  FamilyStatus,
} from '@prisma/client';
import bcrypt from 'bcrypt';
import { randomUUID } from 'crypto';

//@ts-expect-error - Mjs file
import { cleanSupabaseUsers, seedUserToSupabase } from './supabase-seed-utils.mjs';

const prisma = new PrismaClient();

function generateId() {
  return randomUUID();
}

const userEmails: string[] = [];

async function main() {
  console.log('Starting seed...');
  const plainTextPassword = '123456';

  //@ts-expect-error - User type
  async function createUserInBothSystems(userData) {
    const prismaUser = await prisma.user.create({
      data: userData,
    });

    userEmails.push(prismaUser.email);

    await seedUserToSupabase(prismaUser, plainTextPassword);

    return prismaUser;
  }

  try {
    const seedUserEmails = [
      'admin@example.com',
      'manager@example.com',
      'owner1@example.com',
      'owner2@example.com',
      'tenant1@example.com',
      'tenant2@example.com',
      'service@example.com',
      'potential@example.com',
    ];
    await cleanSupabaseUsers(seedUserEmails);

    console.log('Cleaning database...');
    await prisma.metadataField.deleteMany({});
    await prisma.propertyExpense.deleteMany({});
    await prisma.communication.deleteMany({});
    await prisma.maintenanceRequest.deleteMany({});
    await prisma.rentPayment.deleteMany({});
    await prisma.contractVersion.deleteMany({});
    await prisma.rentalContract.deleteMany({});
    await prisma.eventAssignment.deleteMany({});
    await prisma.event.deleteMany({});
    await prisma.resourceAssignment.deleteMany({});
    await prisma.applicationForm.deleteMany({});
    await prisma.resourceApplication.deleteMany({});
    await prisma.joinRequest.deleteMany({});
    await prisma.resource.deleteMany({});
    await prisma.tag.deleteMany({});
    await prisma.metadataGroup.deleteMany({});
    await prisma.notification.deleteMany({});
    await prisma.auditLog.deleteMany({});
    await prisma.family.deleteMany({});
    await prisma.user.deleteMany({});
    await prisma.organization.deleteMany({});
    await prisma.location.deleteMany({});
    console.log('Database cleaned successfully');

    console.log('Seeding tags...');
    const luxuryTag = await prisma.tag.create({
      data: { id: generateId(), name: 'Luxury', color: '#FFD700' },
    });

    const affordableTag = await prisma.tag.create({
      data: { id: generateId(), name: 'Affordable', color: '#4CAF50' },
    });

    const newConstructionTag = await prisma.tag.create({
      data: { id: generateId(), name: 'New Construction', color: '#2196F3' },
    });

    console.log('Seeding metadata groups...');
    const residentialGroup = await prisma.metadataGroup.create({
      data: {
        id: generateId(),
        name: 'Residential Properties',
        description: 'Metadata for residential properties',
      },
    });

    const commercialGroup = await prisma.metadataGroup.create({
      data: {
        id: generateId(),
        name: 'Commercial Properties',
        description: 'Metadata for commercial properties',
      },
    });

    console.log('Seeding locations...');
    // Create locations for the resources
    const sunsetLocation = await prisma.location.create({
      data: {
        id: generateId(),
        name: 'Sunset Apartments Location',
        address: '789 Sunset Blvd',
        city: 'Apartment City',
        state: 'CA',
        zip: '30003',
        country: 'USA',
      },
    });

    const downtownLocation = await prisma.location.create({
      data: {
        id: generateId(),
        name: 'Downtown Office Location',
        address: '456 Business Ave',
        city: 'Downtown',
        state: 'NY',
        zip: '20001',
        country: 'USA',
      },
    });

    const suburbiaLocation = await prisma.location.create({
      data: {
        id: generateId(),
        name: 'Suburban Home Location',
        address: '123 Maple Street',
        city: 'Suburbia',
        state: 'WA',
        zip: '45678',
        country: 'USA',
      },
    });

    console.log('Seeding users...');
    const plainTextPassword = '123456';
    const hashedPassword = await bcrypt.hash(plainTextPassword, 10);

    const _admin = await createUserInBothSystems({
      id: generateId(),
      email: 'admin@example.com',
      password: hashedPassword,
      name: 'Admin User',
      role: Role.ADMIN,
    });

    const propertyManager = await createUserInBothSystems({
      id: generateId(),
      email: 'manager@example.com',
      password: hashedPassword,
      name: 'Property Manager',
      role: Role.PROPERTY_MANAGER,
    });

    const owner1 = await createUserInBothSystems({
      id: generateId(),
      email: 'owner1@example.com',
      password: hashedPassword,
      name: 'John Owner',
      role: Role.OWNER,
      phoneNumber: '+1234567890',
      identificationVerified: true,
    });

    const owner2 = await createUserInBothSystems({
      id: generateId(),
      email: 'owner2@example.com',
      password: hashedPassword,
      name: 'Jane Owner',
      role: Role.OWNER,
      phoneNumber: '+1234567890',
      identificationVerified: true,
    });

    const tenant1 = await createUserInBothSystems({
      id: generateId(),
      email: 'tenant1@example.com',
      password: hashedPassword,
      name: 'Alice Tenant',
      role: Role.TENANT,
      phoneNumber: '+1987654321',
      identificationVerified: true,
      creditScore: 720,
      monthlyIncome: 5000,
    });

    const tenant2 = await createUserInBothSystems({
      id: generateId(),
      email: 'tenant2@example.com',
      password: hashedPassword,
      name: 'Bob Tenant',
      role: Role.TENANT,
      phoneNumber: '+1555123456',
      identificationVerified: true,
      creditScore: 680,
      monthlyIncome: 4200,
    });

    const serviceProvider = await createUserInBothSystems({
      id: generateId(),
      email: 'service@example.com',
      password: hashedPassword,
      name: 'Bob Plumber',
      role: Role.SERVICE_PROVIDER,
      phoneNumber: '+1555123456',
    });

    console.log('Seeding join requests...');
    const _joinRequest1 = await prisma.joinRequest.create({
      data: {
        id: generateId(),
        email: 'potential@example.com',
        name: 'Potential Tenant',
        role: Role.TENANT,
        status: RequestStatus.PENDING,
        message: 'I am interested in renting a unit in Sunset Apartments.',
        createdAt: new Date('2023-03-01'),
      },
    });

    const _joinRequest2 = await prisma.joinRequest.create({
      data: {
        id: generateId(),
        email: 'potential2@example.com',
        name: 'Potential Tenant 2',
        role: Role.TENANT,
        status: RequestStatus.PENDING,
        message: 'I am interested in renting a unit in Sunset Apartments.',
        createdAt: new Date('2023-03-01'),
      },
    });

    const _joinRequest3 = await prisma.joinRequest.create({
      data: {
        id: generateId(),
        email: 'potential3@example.com',
        name: 'Potential Owner 3',
        role: Role.OWNER,
        status: RequestStatus.PENDING,
        message: 'I am interested in renting my unit in Berlin.',
        createdAt: new Date('2023-03-01'),
      },
    });

    await prisma.joinRequest.create({
      data: {
        id: generateId(),
        email: 'potential4@example.com',
        name: 'Potential Tenant 4',
        role: Role.TENANT,
        status: RequestStatus.PENDING,
        message: 'I am interested in renting a unit in Berlin.',
        createdAt: new Date('2023-03-01'),
      },
    });

    console.log('Seeding organizations...');
    const realEstateCompany = await prisma.organization.create({
      data: {
        id: generateId(),
        name: 'Real Estate Holdings LLC',
        type: OrganizationType.COMPANY,
        registrationNumber: 'REG12345',
        taxId: 'TAX98765',
        address: '123 Corporate Ave, Business City, 10001',
        contactEmail: 'contact@realestateholdings.com',
        contactPhone: '+1888777666',
        website: 'www.realestateholdings.com',
        members: {
          connect: [{ id: owner1.id }, { id: propertyManager.id }],
        },
        tags: {
          connect: [{ id: luxuryTag.id }],
        },
      },
    });

    console.log('Seeding resources...');
    const building1 = await prisma.resource.create({
      data: {
        id: generateId(),
        type: ResourceType.BUILDING,
        label: 'Sunset Apartments',
        description: 'A modern apartment complex with 20 units',
        address: '789 Sunset Blvd, Apartment City, CA',
        locationId: sunsetLocation.id,
        isActive: true,
        owners: {
          connect: [{ id: owner1.id }],
        },
        organizationOwners: {
          connect: [{ id: realEstateCompany.id }],
        },
        tags: {
          connect: [{ id: luxuryTag.id }],
        },
        metadataGroupId: residentialGroup.id,
      },
    });

    const unit1A = await prisma.resource.create({
      data: {
        id: generateId(),
        type: ResourceType.UNIT,
        label: 'Unit 1A',
        description: 'Spacious 2-bedroom apartment with balcony',
        address: '789 Sunset Blvd, Unit 1A, Apartment City, CA',
        locationId: sunsetLocation.id,
        bedroomCount: 2,
        bathroomCount: 1,
        squareFootage: 950,
        rentAmount: 1200,
        isActive: true,
        parentId: building1.id,
        owners: {
          connect: [{ id: owner1.id }],
        },
        tags: {
          connect: [{ id: luxuryTag.id }],
        },
        amenities: ['Balcony', 'Dishwasher', 'Central AC'],
      },
    });

    const _unit1B = await prisma.resource.create({
      data: {
        id: generateId(),
        type: ResourceType.UNIT,
        label: 'Unit 1B',
        description: 'Cozy 1-bedroom apartment with modern finishes',
        address: '789 Sunset Blvd, Unit 1B, Apartment City, CA',
        locationId: sunsetLocation.id,
        bedroomCount: 1,
        bathroomCount: 1,
        squareFootage: 650,
        rentAmount: 900,
        isActive: true,
        parentId: building1.id,
        owners: {
          connect: [{ id: owner1.id }],
        },
        tags: {
          connect: [{ id: affordableTag.id }],
        },
        amenities: ['Stainless Appliances', 'In-unit Laundry'],
      },
    });

    // Additional unit in Sunset Apartments
    console.log('Creating additional unit in Sunset Apartments...');
    const unit1C = await prisma.resource.create({
      data: {
        id: generateId(),
        type: ResourceType.UNIT,
        label: 'Unit 1C',
        description: 'Studio apartment with city view',
        address: '789 Sunset Blvd, Unit 1C, Apartment City, CA',
        locationId: sunsetLocation.id,
        bedroomCount: 0,
        bathroomCount: 1,
        squareFootage: 500,
        rentAmount: 750,
        isActive: true,
        parentId: building1.id,
        owners: {
          connect: [{ id: owner1.id }],
        },
        tags: {
          connect: [{ id: affordableTag.id }],
        },
        amenities: ['City View', 'Compact Kitchen'],
      },
    });
    console.log(`Created unit: ${unit1C.label}`);

    console.log('Seeding commercial property...');
    const commercialBuilding = await prisma.resource.create({
      data: {
        id: generateId(),
        type: ResourceType.BUILDING,
        label: 'Downtown Office Complex',
        description: 'A newly constructed office building with retail space on the ground floor',
        address: '456 Business Ave, Downtown, NY',
        locationId: downtownLocation.id,
        isActive: true,
        owners: {
          connect: [{ id: owner1.id }],
        },
        organizationOwners: {
          connect: [{ id: realEstateCompany.id }],
        },
        tags: {
          connect: [{ id: newConstructionTag.id }],
        },
        metadataGroupId: commercialGroup.id,
      },
    });

    const _commercialSpace = await prisma.resource.create({
      data: {
        id: generateId(),
        type: ResourceType.COMMERCIAL_SPACE,
        label: 'Office Suite 101',
        description: 'Corner office suite with large windows and reception area',
        address: '456 Business Ave, Suite 101, Downtown, NY',
        locationId: downtownLocation.id,
        squareFootage: 1500,
        rentAmount: 3500,
        isActive: true,
        parentId: commercialBuilding.id,
        tags: {
          connect: [{ id: newConstructionTag.id }],
        },
        amenities: ['High-speed Internet', 'Conference Room', 'Kitchen'],
      },
    });

    // Additional commercial space
    console.log('Creating additional commercial space...');
    const commercialSpace2 = await prisma.resource.create({
      data: {
        id: generateId(),
        type: ResourceType.COMMERCIAL_SPACE,
        label: 'Office Suite 202',
        description: 'Open plan office with kitchenette and private bathroom',
        address: '456 Business Ave, Suite 202, Downtown, NY',
        locationId: downtownLocation.id,
        squareFootage: 1200,
        rentAmount: 2800,
        isActive: true,
        parentId: commercialBuilding.id,
        tags: {
          connect: [{ id: newConstructionTag.id }],
        },
        amenities: ['High-speed Internet', 'Kitchenette', 'Private Bathroom'],
      },
    });
    console.log(`Created commercial space: ${commercialSpace2.label}`);

    console.log('Seeding standalone house with individual owner...');
    const standaloneHouse = await prisma.resource.create({
      data: {
        id: generateId(),
        type: ResourceType.BUILDING,
        label: 'Cozy Suburban House',
        description: 'A charming 3-bedroom house with garden in a quiet neighborhood',
        address: '123 Maple Street, Suburbia, WA',
        locationId: suburbiaLocation.id,
        bedroomCount: 3,
        bathroomCount: 2,
        squareFootage: 1800,
        rentAmount: 2200,
        isActive: true,
        amenities: ['Garden', 'Garage', 'Fireplace', 'Hardwood Floors'],
        images: ['https://example.com/image1.jpg', 'https://example.com/image2.jpg'],
        owners: {
          connect: [{ id: owner2.id }],
        },
        tags: {
          connect: [{ id: affordableTag.id }],
        },
      },
    });
    console.log(`Standalone house created: ${standaloneHouse.label} at ${standaloneHouse.address}`);

    console.log('Seeding resource assignments...');
    const _tenantAssignment = await prisma.resourceAssignment.create({
      data: {
        id: generateId(),
        userId: tenant1.id,
        resourceId: unit1A.id,
        role: Role.TENANT,
        startDate: new Date('2023-01-01'),
        isActive: true,
        isPrimary: true,
        rentalAmount: 1200,
        securityDeposit: 1200,
      },
    });

    const _tenantAssignment2 = await prisma.resourceAssignment.create({
      data: {
        id: generateId(),
        userId: tenant2.id,
        resourceId: _unit1B.id,
        role: Role.TENANT,
        startDate: new Date('2023-01-01'),
        isActive: true,
        isPrimary: true,
        rentalAmount: 900,
        securityDeposit: 900,
      },
    });

    // Create assignment for the new unit1C
    console.log('Creating resource assignment for Unit 1C...');
    const _tenantAssignment3 = await prisma.resourceAssignment.create({
      data: {
        id: generateId(),
        userId: tenant1.id, // Assigning to the same tenant as unit1A for demonstration
        resourceId: unit1C.id,
        role: Role.TENANT,
        startDate: new Date('2023-02-01'),
        isActive: true,
        isPrimary: false, // Secondary unit for tenant1
        rentalAmount: 750,
        securityDeposit: 750,
      },
    });
    console.log(`Created tenant assignment for ${unit1C.label}`);

    console.log('Creating resource assignment for standalone house...');
    await prisma.resourceAssignment.create({
      data: {
        id: generateId(),
        userId: tenant2.id,
        resourceId: standaloneHouse.id,
        role: Role.TENANT,
        startDate: new Date(),
        isActive: true,
        isPrimary: true,
        rentalAmount: standaloneHouse.rentAmount,
        securityDeposit: standaloneHouse.rentAmount,
      },
    });
    console.log(`Tenant assigned to house: ${tenant2.name} → ${standaloneHouse.label}`);

    console.log('Seeding application forms...');
    const _applicationForm1 = await prisma.applicationForm.create({
      data: {
        id: generateId(),
        userId: tenant1.id,
        resourceId: unit1A.id,
        desiredMoveInDate: new Date('2023-01-01'),
        desiredRentalPeriod: 12,
        numberOfOccupants: 1,
        occupantDetails: JSON.stringify([{ name: 'Alice Tenant', relationship: 'Self' }]),
        hasPets: false,
        incomeDocuments: [],
        referencesProvided: true,
        backgroundCheckStatus: ScreeningStatus.PASSED,
        creditCheckStatus: ScreeningStatus.PASSED,
        incomeVerificationStatus: ScreeningStatus.PASSED,
        landlordReferenceStatus: ScreeningStatus.WAIVED,
        status: ApplicationStatus.APPROVED,
        reviewedBy: propertyManager.id,
        notes: 'Excellent candidate with stable income and good credit.',
      },
    });

    console.log('Seeding additional application forms...');
    const potentialTenant = await createUserInBothSystems({
      id: generateId(),
      email: _joinRequest1.email,
      password: hashedPassword,
      name: _joinRequest1.name,
      role: Role.TENANT,
      phoneNumber: '+1555987654',
      identificationVerified: false,
      creditScore: 680,
      monthlyIncome: 4200,
    });

    await prisma.joinRequest.update({
      where: { id: _joinRequest1.id },
      data: {
        status: RequestStatus.APPROVED,
        reviewedBy: _admin.id,
        reviewedAt: new Date(),
      },
    });
    console.log(`Join request from ${_joinRequest1.name} has been approved`);

    const _applicationForUnit1B = await prisma.applicationForm.create({
      data: {
        id: generateId(),
        userId: potentialTenant.id,
        resourceId: _unit1B.id,
        desiredMoveInDate: new Date('2023-04-01'),
        desiredRentalPeriod: 12,
        numberOfOccupants: 2,
        occupantDetails: JSON.stringify([
          { name: 'Potential Tenant', relationship: 'Self' },
          { name: 'Partner', relationship: 'Spouse' },
        ]),
        hasPets: true,
        petDetails: 'One small cat, neutered and house-trained',
        incomeDocuments: [],
        referencesProvided: true,
        backgroundCheckStatus: ScreeningStatus.PENDING,
        creditCheckStatus: ScreeningStatus.PENDING,
        incomeVerificationStatus: ScreeningStatus.PENDING,
        landlordReferenceStatus: ScreeningStatus.PENDING,
        status: ApplicationStatus.SCREENING,
        notes: 'Application is currently under review.',
      },
    });

    console.log('Seeding rental contracts...');
    const contract1 = await prisma.rentalContract.create({
      data: {
        id: generateId(),
        contractNumber: 'CONT-2023-001',
        resourceId: unit1A.id,
        startDate: new Date('2023-01-01'),
        endDate: new Date('2024-01-01'),
        baseRentAmount: 1200,
        securityDeposit: 1200,
        depositPaid: true,
        utilityCharges: 150,
        includedUtilities: [UtilityType.WATER, UtilityType.WASTE_DISPOSAL],
        paymentFrequency: PaymentFrequency.MONTHLY,
        paymentDueDay: 1,
        lateFeePercentage: 5,
        terminationNotice: 60,
        status: ContractStatus.ACTIVE,
        contractDocumentUrl: 'https://example.com/contract-document.pdf',
      },
    });

    // Add rental contract for unit1C
    console.log('Creating rental contract for Unit 1C...');
    const contract3 = await prisma.rentalContract.create({
      data: {
        id: generateId(),
        contractNumber: 'CONT-2023-003',
        resourceId: unit1C.id,
        startDate: new Date('2023-02-01'),
        endDate: new Date('2024-02-01'),
        baseRentAmount: 750,
        securityDeposit: 750,
        depositPaid: true,
        utilityCharges: 100,
        includedUtilities: [UtilityType.WATER, UtilityType.WASTE_DISPOSAL],
        paymentFrequency: PaymentFrequency.MONTHLY,
        paymentDueDay: 1,
        lateFeePercentage: 5,
        terminationNotice: 60,
        status: ContractStatus.ACTIVE,
        contractDocumentUrl: 'https://example.com/contract-document.pdf',
      },
    });
    console.log(`Created rental contract for ${unit1C.label}: ${contract3.contractNumber}`);

    const houseContractStartDate = new Date();
    const houseContractEndDate = new Date();
    houseContractEndDate.setFullYear(houseContractEndDate.getFullYear() + 1);

    console.log('Creating rental contract for standalone house...');
    const houseContract = await prisma.rentalContract.create({
      data: {
        id: generateId(),
        contractNumber: `HOUSE-${new Date().getFullYear()}-${Math.floor(Math.random() * 1000)}`,
        resourceId: standaloneHouse.id,
        startDate: houseContractStartDate,
        endDate: houseContractEndDate,
        baseRentAmount: standaloneHouse.rentAmount || 0,
        securityDeposit: standaloneHouse.rentAmount || 0,
        depositPaid: true,
        paymentDueDay: 1,
        lateFeePercentage: 5,
        terminationNotice: 60,
        status: ContractStatus.ACTIVE,
        contractDocumentUrl: 'https://example.com/contract-document.pdf',
      },
    });
    console.log(`Rental contract created for house: ${houseContract.contractNumber}`);

    const _contractVersion1 = await prisma.contractVersion.create({
      data: {
        id: generateId(),
        contractId: contract1.id,
        versionNumber: 1,
        documentUrl: 'https://example.com/contract-document.pdf',
        createdBy: _admin.id,
      },
    });

    console.log('Seeding rent payments...');
    const _payment1 = await prisma.rentPayment.create({
      data: {
        id: generateId(),
        contractId: contract1.id,
        amount: 1200,
        coversPeriodStart: new Date('2023-01-01'),
        coversPeriodEnd: new Date('2023-01-31'),
        dueDate: new Date('2023-01-01'),
        datePaid: new Date('2023-01-01'),
        paymentMethod: PaymentMethod.BANK_TRANSFER,
        paymentReference: 'PMT-2023-01-001',
        status: PaymentStatus.PAID,
        receiptUrl: 'https://example.com/receipt-document.pdf',
      },
    });

    const _payment2 = await prisma.rentPayment.create({
      data: {
        id: generateId(),
        contractId: contract1.id,
        amount: 1200,
        coversPeriodStart: new Date('2023-02-01'),
        coversPeriodEnd: new Date('2023-02-28'),
        dueDate: new Date('2023-02-01'),
        datePaid: new Date('2023-02-03'),
        paymentMethod: PaymentMethod.BANK_TRANSFER,
        paymentReference: 'PMT-2023-02-001',
        status: PaymentStatus.PAID,
        lateFee: 60,
        receiptUrl: 'https://example.com/receipt-document.pdf',
      },
    });

    // Add payment for unit1C
    console.log('Creating rent payment for Unit 1C...');
    const _payment3 = await prisma.rentPayment.create({
      data: {
        id: generateId(),
        contractId: contract3.id,
        amount: 750,
        coversPeriodStart: new Date('2023-02-01'),
        coversPeriodEnd: new Date('2023-02-28'),
        dueDate: new Date('2023-02-01'),
        datePaid: new Date('2023-02-01'),
        paymentMethod: PaymentMethod.CREDIT_CARD,
        paymentReference: 'PMT-2023-02-002',
        status: PaymentStatus.PAID,
        receiptUrl: 'https://example.com/receipt-document.pdf',
      },
    });
    console.log(`Created rent payment for ${unit1C.label}`);

    // Add upcoming payment for unit1C
    const nextMonth = new Date();
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    nextMonth.setDate(1); // First day of next month

    const nextMonthEnd = new Date(nextMonth);
    nextMonthEnd.setMonth(nextMonthEnd.getMonth() + 1);
    nextMonthEnd.setDate(0); // Last day of next month

    console.log('Creating upcoming rent payment for Unit 1C...');
    const _upcomingPayment = await prisma.rentPayment.create({
      data: {
        id: generateId(),
        contractId: contract3.id,
        amount: 750,
        coversPeriodStart: nextMonth,
        coversPeriodEnd: nextMonthEnd,
        dueDate: nextMonth,
        paymentMethod: null,
        paymentReference: null,
        status: PaymentStatus.PENDING,
      },
    });
    console.log(`Created upcoming rent payment for ${unit1C.label}`);

    console.log('Seeding property expenses...');
    const _expense1 = await prisma.propertyExpense.create({
      data: {
        id: generateId(),
        resourceId: building1.id,
        category: ExpenseCategory.MAINTENANCE,
        amount: 500,
        date: new Date('2023-02-15'),
        description: 'Quarterly HVAC maintenance',
        paidBy: owner1.id,
        paidTo: 'HVAC Services Inc.',
        receiptUrl: 'https://example.com/receipt-document.pdf',
        isRecurring: true,
        recurringFrequency: PaymentFrequency.QUARTERLY,
        taxDeductible: true,
        accountingCategory: 'Maintenance',
      },
    });

    console.log('Seeding maintenance requests...');
    const maintenanceRequest1 = await prisma.maintenanceRequest.create({
      data: {
        id: generateId(),
        requestNumber: 'MR-2023-001',
        resourceId: unit1A.id,
        reportedBy: tenant1.id,
        category: MaintenanceCategory.PLUMBING,
        title: 'Leaking faucet in kitchen',
        description:
          'The kitchen sink faucet is leaking and causing water damage to the cabinet below.',
        priority: RequestPriority.NORMAL,
        images: ['https://example.com/image1.jpg', 'https://example.com/image2.jpg'],
        assignedTo: serviceProvider.id,
        estimatedCost: 150,
        scheduledDate: new Date('2023-03-15'),
        status: MaintenanceRequestStatus.ASSIGNED,
      },
    });

    // Add maintenance request for unit1C
    console.log('Creating maintenance request for Unit 1C...');
    const maintenanceRequest2 = await prisma.maintenanceRequest.create({
      data: {
        id: generateId(),
        requestNumber: 'MR-2023-002',
        resourceId: unit1C.id,
        reportedBy: tenant1.id,
        category: MaintenanceCategory.ELECTRICAL,
        title: 'Bathroom light fixture not working',
        description:
          'The light fixture in the bathroom has stopped working. I have tried replacing the bulb but it still does not work.',
        priority: RequestPriority.HIGH,
        images: ['https://example.com/image3.jpg'],
        assignedTo: serviceProvider.id,
        estimatedCost: 100,
        scheduledDate: new Date('2023-03-10'),
        status: MaintenanceRequestStatus.ASSIGNED,
      },
    });
    console.log(`Created maintenance request for ${unit1C.label}: ${maintenanceRequest2.title}`);

    console.log('Seeding events...');
    const _moveInEvent = await prisma.event.create({
      data: {
        id: generateId(),
        type: EventType.MOVE_IN,
        label: 'Move-in inspection for Unit 1A',
        resourceId: unit1A.id,
        startDate: new Date('2023-01-01T10:00:00Z'),
        endDate: new Date('2023-01-01T11:00:00Z'),
        status: EventStatus.COMPLETED,
        notes: 'All items in good condition. Tenant received keys.',
      },
    });

    const _eventAssignment1 = await prisma.eventAssignment.create({
      data: {
        id: generateId(),
        userId: propertyManager.id,
        eventId: _moveInEvent.id,
        role: EventParticipantRole.PROPERTY_MANAGER,
        status: EventParticipationStatus.COMPLETED,
      },
    });

    const _eventAssignment2 = await prisma.eventAssignment.create({
      data: {
        id: generateId(),
        userId: tenant1.id,
        eventId: _moveInEvent.id,
        role: EventParticipantRole.TENANT,
        status: EventParticipationStatus.COMPLETED,
      },
    });

    const _maintenanceEvent = await prisma.event.create({
      data: {
        id: generateId(),
        type: EventType.MAINTENANCE_REQUEST,
        label: `Maintenance: ${maintenanceRequest1.title}`,
        resourceId: unit1A.id,
        startDate: maintenanceRequest1.scheduledDate || new Date(),
        endDate: new Date(
          (maintenanceRequest1.scheduledDate?.getTime() || new Date().getTime()) +
            2 * 60 * 60 * 1000
        ),
        status: EventStatus.PENDING,
        notes: maintenanceRequest1.description,
      },
    });

    // Add event for the new maintenance request
    console.log('Creating event for the maintenance request on Unit 1C...');
    const _maintenanceEvent2 = await prisma.event.create({
      data: {
        id: generateId(),
        type: EventType.MAINTENANCE_REQUEST,
        label: `Maintenance: ${maintenanceRequest2.title}`,
        resourceId: unit1C.id,
        startDate: maintenanceRequest2.scheduledDate || new Date(),
        endDate: new Date(
          (maintenanceRequest2.scheduledDate?.getTime() || new Date().getTime()) +
            1.5 * 60 * 60 * 1000
        ),
        status: EventStatus.PENDING,
        notes: maintenanceRequest2.description,
      },
    });
    console.log(`Created event for maintenance request on ${unit1C.label}`);

    const _serviceProviderAssignment = await prisma.eventAssignment.create({
      data: {
        id: generateId(),
        userId: serviceProvider.id,
        eventId: _maintenanceEvent.id,
        role: EventParticipantRole.SERVICE_PROVIDER,
        status: EventParticipationStatus.CONFIRMED,
      },
    });

    const _maintenanceEventAssignment = await prisma.eventAssignment.create({
      data: {
        id: generateId(),
        userId: tenant1.id,
        eventId: _maintenanceEvent.id,
        role: EventParticipantRole.TENANT,
        status: EventParticipationStatus.CONFIRMED,
        notes: `Tenant will be present during the maintenance visit. Reference: ${maintenanceRequest1.requestNumber}`,
      },
    });

    // Add event assignments for the new maintenance event
    console.log('Creating event assignments for the maintenance request on Unit 1C...');
    const _serviceProviderAssignment2 = await prisma.eventAssignment.create({
      data: {
        id: generateId(),
        userId: serviceProvider.id,
        eventId: _maintenanceEvent2.id,
        role: EventParticipantRole.SERVICE_PROVIDER,
        status: EventParticipationStatus.CONFIRMED,
      },
    });

    const _maintenanceEventAssignment2 = await prisma.eventAssignment.create({
      data: {
        id: generateId(),
        userId: tenant1.id,
        eventId: _maintenanceEvent2.id,
        role: EventParticipantRole.TENANT,
        status: EventParticipationStatus.CONFIRMED,
        notes: `Tenant will be present during the maintenance visit. Reference: ${maintenanceRequest2.requestNumber}`,
      },
    });
    console.log('Created event assignments for maintenance request on Unit 1C');

    console.log('Seeding communications...');
    const _communication1 = await prisma.communication.create({
      data: {
        id: generateId(),
        type: CommunicationType.EMAIL,
        direction: CommunicationDirection.OUTGOING,
        userId: propertyManager.id,
        resourceId: unit1A.id,
        subject: 'Welcome to Sunset Apartments',
        content:
          'Dear Alice, welcome to your new home at Sunset Apartments. Please let us know if you need anything.',
        sentAt: new Date('2023-01-02T09:00:00Z'),
        readAt: new Date('2023-01-02T10:30:00Z'),
      },
    });

    console.log('Creating welcome communication for house tenant...');
    await prisma.communication.create({
      data: {
        id: generateId(),
        type: CommunicationType.EMAIL,
        direction: CommunicationDirection.OUTGOING,
        userId: owner2.id,
        resourceId: standaloneHouse.id,
        subject: 'Welcome to Your New Home',
        content: `Dear ${tenant2.name},

I'm excited to welcome you to your new home at ${standaloneHouse.address}. I've scheduled our move-in inspection for next week.

Please let me know if you have any questions before then.

Best regards,
${owner2.name}`,
        sentAt: new Date(),
      },
    });
    console.log('Welcome communication created for house tenant');

    console.log('Seeding notifications...');
    const _notification1 = await prisma.notification.create({
      data: {
        id: generateId(),
        userId: tenant1.id,
        title: 'Rent Due Soon',
        message: 'Your rent payment for March 2023 is due in 5 days.',
        type: NotificationType.PAYMENT_DUE,
        relatedResourceId: unit1A.id,
        isRead: false,
      },
    });

    console.log('Creating notification for tenant2...');
    await prisma.notification.create({
      data: {
        id: generateId(),
        userId: tenant2.id,
        title: 'Welcome to Unit 1B',
        message: `Your assignment to ${_unit1B.label} has been confirmed. Monthly rent: $${_tenantAssignment2.rentalAmount}`,
        type: NotificationType.GENERAL,
        relatedResourceId: _unit1B.id,
        isRead: false,
      },
    });
    console.log(`Notification created for ${tenant2.name} regarding unit assignment`);

    const _eventReminderNotification = await prisma.notification.create({
      data: {
        id: generateId(),
        userId: _eventAssignment1.userId,
        title: `Reminder: ${_moveInEvent.label}`,
        message: `You have a scheduled event: ${_moveInEvent.label} on ${_moveInEvent.startDate.toLocaleDateString()} at ${_moveInEvent.startDate.toLocaleTimeString()}`,
        type: NotificationType.GENERAL,
        relatedResourceId: unit1A.id,
        isRead: false,
      },
    });

    console.log('Seeding audit logs...');
    const _auditLog1 = await prisma.auditLog.create({
      data: {
        id: generateId(),
        entityType: 'User',
        entityId: tenant1.id,
        action: AuditAction.CREATE,
        performedBy: _admin.id,
        details: JSON.stringify({ action: 'Created new tenant account' }),
        timestamp: new Date('2023-01-01T08:00:00Z'),
      },
    });

    const _auditLog2 = await prisma.auditLog.create({
      data: {
        id: generateId(),
        entityType: 'RentalContract',
        entityId: contract1.id,
        action: AuditAction.CREATE,
        performedBy: propertyManager.id,
        details: JSON.stringify({
          action: 'Created new rental contract',
          contractNumber: 'CONT-2023-001',
        }),
        timestamp: new Date('2023-01-01T09:30:00Z'),
      },
    });

    const _maintenanceExpense = await prisma.propertyExpense.create({
      data: {
        id: generateId(),
        resourceId: unit1A.id,
        category: ExpenseCategory.REPAIRS,
        amount: maintenanceRequest1.estimatedCost || 0,
        date: maintenanceRequest1.scheduledDate || new Date(),
        description: `Expense for maintenance request: ${maintenanceRequest1.title}`,
        paidBy: owner1.id,
        paidTo: serviceProvider.name,
        isRecurring: false,
        taxDeductible: true,
        accountingCategory: 'Repairs',
      },
    });

    console.log('Processing additional join requests...');

    await prisma.joinRequest.update({
      where: { id: _joinRequest2.id },
      data: {
        status: RequestStatus.APPROVED,
        reviewedBy: _admin.id,
        reviewedAt: new Date(),
      },
    });
    console.log(`Join request from ${_joinRequest2.name} has been approved`);

    await prisma.joinRequest.update({
      where: { id: _joinRequest3.id },
      data: {
        status: RequestStatus.REJECTED,
        reviewedBy: _admin.id,
        reviewedAt: new Date(),
        message: 'We are not accepting new owners at this time.',
      },
    });
    console.log(`Join request from ${_joinRequest3.name} has been rejected`);

    // Create metadata fields
    console.log('Seeding metadata fields...');
    const _buildingMetadata = await prisma.metadataField.create({
      data: {
        id: generateId(),
        key: 'yearBuilt',
        value: '2010',
        dataType: PropertyType.NUMBER,
        resourceId: building1.id,
      },
    });

    const _unitMetadata = await prisma.metadataField.create({
      data: {
        id: generateId(),
        key: 'floorLevel',
        value: '1',
        dataType: PropertyType.NUMBER,
        resourceId: unit1A.id,
      },
    });

    const _userMetadata = await prisma.metadataField.create({
      data: {
        id: generateId(),
        key: 'preferredContactMethod',
        value: 'email',
        dataType: PropertyType.STRING,
        userId: tenant1.id,
      },
    });

    const _commercialBuildingMetadata = await prisma.metadataField.create({
      data: {
        id: generateId(),
        key: 'yearBuilt',
        value: '2022',
        dataType: PropertyType.NUMBER,
        resourceId: commercialBuilding.id,
      },
    });

    // Create families
    console.log('\nCreating family records...');
    const smithFamily = await prisma.family.create({
      data: {
        id: generateId(),
        name: 'The Smiths',
        description: 'A family of 4 with stable income and excellent rental history',
        size: 4,
        income: 120000,
        hasPets: true,
        petDetails: 'One small dog (beagle)',
        employmentDetails: 'Both parents work full-time in professional roles',
        creditScore: 750,
        references: 'Available upon request',
        preferredContactEmail: tenant1.email,
        preferredContactPhone: tenant1.phoneNumber,
        status: FamilyStatus.ACTIVE,
        members: {
          connect: [{ id: tenant1.id }],
        },
      },
    });

    const johnsonFamily = await prisma.family.create({
      data: {
        id: generateId(),
        name: 'The Johnsons',
        description: 'Young couple with one child looking for a long-term home',
        size: 3,
        income: 95000,
        hasPets: false,
        employmentDetails: 'Software engineer and teacher',
        creditScore: 720,
        status: FamilyStatus.ACTIVE,
        preferredContactEmail: tenant2.email,
        preferredContactPhone: tenant2.phoneNumber,
        members: {
          connect: [{ id: tenant2.id }],
        },
      },
    });

    const garciaFamily = await prisma.family.create({
      data: {
        id: generateId(),
        name: 'The Garcia Family',
        description: 'Multi-generational family seeking a spacious property',
        size: 5,
        income: 135000,
        hasPets: false,
        employmentDetails: 'Family business owners',
        creditScore: 710,
        status: FamilyStatus.ACTIVE,
      },
    });

    console.log('Created families:', smithFamily.name, johnsonFamily.name, garciaFamily.name);

    // Create a family application for a property
    console.log('Creating family application for a property...');
    const propertyForApplication = await prisma.resource.findFirst({
      where: {
        type: ResourceType.UNIT,
        isActive: true,
      },
    });

    if (smithFamily && propertyForApplication) {
      const _resourceApplication = await prisma.resourceApplication.create({
        data: {
          id: generateId(),
          resourceId: propertyForApplication.id,
          familyId: smithFamily.id,
          status: ApplicationStatus.PENDING,
          notes: 'Family application for 3-bedroom property',
        },
      });
      console.log(
        `Created resource application for ${smithFamily.name} for ${propertyForApplication.label}`
      );
    } else {
      console.log('Could not create resource application - missing family or property');
    }

    // Update all resource assignments to include family context
    console.log('Updating resource assignments with family context...');

    // Update tenant1's assignments
    await prisma.resourceAssignment.updateMany({
      where: {
        userId: tenant1.id,
        isActive: true,
      },
      data: {
        familyId: smithFamily.id,
      },
    });
    console.log(
      `Updated resource assignments for ${tenant1.name} with family: ${smithFamily.name}`
    );

    // Update tenant2's assignments
    await prisma.resourceAssignment.updateMany({
      where: {
        userId: tenant2.id,
        isActive: true,
      },
      data: {
        familyId: johnsonFamily.id,
      },
    });
    console.log(
      `Updated resource assignments for ${tenant2.name} with family: ${johnsonFamily.name}`
    );

    // Update users with their family IDs
    await prisma.user.update({
      where: { id: tenant1.id },
      data: {
        familyId: smithFamily.id,
        isHeadOfFamily: true,
      },
    });

    await prisma.user.update({
      where: { id: tenant2.id },
      data: {
        familyId: johnsonFamily.id,
        isHeadOfFamily: true,
      },
    });

    // Create a family-based rental contract
    console.log('Creating a family-based rental contract...');
    const familyContract = await prisma.rentalContract.create({
      data: {
        id: generateId(),
        contractNumber: 'FAM-2023-001',
        resourceId: unit1A.id,
        familyId: smithFamily.id,
        startDate: new Date('2023-05-01'),
        endDate: new Date('2024-05-01'),
        baseRentAmount: 1250, // Family rate
        securityDeposit: 1250,
        depositPaid: true,
        utilityCharges: 175, // Increased for family
        includedUtilities: [UtilityType.WATER, UtilityType.WASTE_DISPOSAL],
        paymentFrequency: PaymentFrequency.MONTHLY,
        paymentDueDay: 1,
        lateFeePercentage: 5,
        terminationNotice: 60,
        status: ContractStatus.ACTIVE,
        contractDocumentUrl: 'https://example.com/family-contract-document.pdf',
      },
    });
    console.log(`Created family contract ${familyContract.contractNumber} for ${smithFamily.name}`);

    // Update event assignments to include family context
    console.log('Updating event assignments with family context...');
    const eventAssignment = await prisma.eventAssignment.findFirst({
      where: {
        userId: tenant1.id,
      },
      include: {
        event: true,
      },
    });

    if (eventAssignment) {
      // Update the event assignment to include family information
      await prisma.eventAssignment.update({
        where: { id: eventAssignment.id },
        data: {
          familyId: smithFamily.id,
        },
      });
      console.log(
        `Updated event assignment for ${eventAssignment.event.label} with family: ${smithFamily.name}`
      );
    }

    // Create a maintenance request from a family
    console.log('Creating a family-based maintenance request...');
    const familyMaintenanceRequest = await prisma.maintenanceRequest.create({
      data: {
        id: generateId(),
        requestNumber: 'FAMMR-2023-001',
        resourceId: unit1A.id,
        reportedBy: tenant1.id,
        familyId: smithFamily.id,
        category: MaintenanceCategory.APPLIANCE,
        title: 'Refrigerator not cooling properly',
        description:
          'Our refrigerator is not keeping food cold enough. It was working fine until yesterday.',
        priority: RequestPriority.HIGH,
        images: ['https://example.com/image-fridge1.jpg'],
        assignedTo: serviceProvider.id,
        estimatedCost: 200,
        scheduledDate: new Date('2023-05-10'),
        status: MaintenanceRequestStatus.ASSIGNED,
      },
    });
    console.log(`Created family maintenance request: ${familyMaintenanceRequest.title}`);

    // Send a notification to a family
    console.log('Creating a family notification...');
    const familyNotification = await prisma.notification.create({
      data: {
        id: generateId(),
        userId: tenant1.id,
        familyId: smithFamily.id,
        title: 'Family Contract Confirmation',
        message: `Your family contract for Unit 1A has been confirmed. Monthly rent: $${familyContract.baseRentAmount}`,
        type: NotificationType.CONTRACT_UPDATE,
        relatedResourceId: unit1A.id,
        isRead: false,
      },
    });
    console.log(`Created family notification: ${familyNotification.title}`);

    console.log('\nFAMILY SUMMARY:');
    console.log('===============');
    console.log(`Total families: 3`);
    console.log(`Families with pets: 1`);
    console.log(
      `Average family size: ${(smithFamily.size + johnsonFamily.size + garciaFamily.size) / 3}`
    );

    // Calculate average family income safely handling null values
    const totalIncome =
      (smithFamily.income || 0) + (johnsonFamily.income || 0) + (garciaFamily.income || 0);
    console.log(`Average family income: $${totalIncome / 3}`);

    console.log('\nFamily-Resource Applications:');
    console.log(
      `- ${smithFamily.name} applied for ${propertyForApplication?.label || 'a property'}`
    );

    console.log('\nFamily Contracts:');
    console.log(
      `- ${smithFamily.name}: Contract ${familyContract.contractNumber} for Unit 1A, amount: $${familyContract.baseRentAmount}/month`
    );

    console.log('\nFamily Maintenance Requests:');
    console.log(
      `- ${smithFamily.name}: ${familyMaintenanceRequest.title} (${familyMaintenanceRequest.status})`
    );

    console.log('Seed completed successfully!');
  } catch (error) {
    console.error('Error during seeding:', error);

    if (userEmails.length > 0) {
      console.log('Attempting to clean up created Supabase users due to error...');
      try {
        await cleanSupabaseUsers(userEmails);
      } catch (cleanupError) {
        console.error('Error during Supabase cleanup:', cleanupError);
      }
    }

    throw error;
  }
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

import { Family } from '@/types';

interface FamilyFilters {
  size?: string;
  hasPets?: boolean;
  minIncome?: number;
  minCreditScore?: number;
  verified?: boolean;
  longTerm?: boolean;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}

interface FamilyResponse {
  families: Partial<Family>[];
  pagination: {
    total: number;
    offset: number;
    limit: number;
    hasMore: boolean;
  };
}

/**
 * Fetch families with optional filtering
 */
export async function getFamilies(filters: FamilyFilters = {}): Promise<FamilyResponse> {
  // Convert filters to URL search params
  const params = new URLSearchParams();

  if (filters.size) params.append('size', filters.size);
  if (filters.hasPets !== undefined) params.append('hasPets', String(filters.hasPets));
  if (filters.minIncome) params.append('minIncome', String(filters.minIncome));
  if (filters.minCreditScore) params.append('minCreditScore', String(filters.minCreditScore));
  if (filters.verified !== undefined) params.append('verified', String(filters.verified));
  if (filters.longTerm !== undefined) params.append('longTerm', String(filters.longTerm));
  if (filters.sortBy) params.append('sortBy', filters.sortBy);
  if (filters.sortOrder) params.append('sortOrder', filters.sortOrder);
  if (filters.limit) params.append('limit', String(filters.limit));
  if (filters.offset) params.append('offset', String(filters.offset));

  const queryString = params.toString();
  const url = `/api/families${queryString ? `?${queryString}` : ''}`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Failed to fetch families: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Fetch a single family by ID
 */
export async function getFamily(id: string): Promise<Family> {
  const response = await fetch(`/api/families/${id}`);

  if (!response.ok) {
    throw new Error(`Failed to fetch family: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Create a new family
 */
export async function createFamily(familyData: Partial<Family>): Promise<Family> {
  const response = await fetch('/api/families', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(familyData),
  });

  if (!response.ok) {
    throw new Error(`Failed to create family: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Update an existing family
 */
export async function updateFamily(id: string, familyData: Partial<Family>): Promise<Family> {
  const response = await fetch(`/api/families/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(familyData),
  });

  if (!response.ok) {
    throw new Error(`Failed to update family: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Add a user to a family
 */
export async function addFamilyMember(
  familyId: string,
  userData: {
    userId: string;
    role?: string;
    age?: number;
    isHeadOfFamily?: boolean;
  }
): Promise<Family> {
  const response = await fetch(`/api/families/${familyId}/members`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(userData),
  });

  if (!response.ok) {
    throw new Error(`Failed to add family member: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Remove a user from a family
 */
export async function removeFamilyMember(familyId: string, userId: string): Promise<void> {
  const response = await fetch(`/api/families/${familyId}/members/${userId}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    throw new Error(`Failed to remove family member: ${response.statusText}`);
  }
}

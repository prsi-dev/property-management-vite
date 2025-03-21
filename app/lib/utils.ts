import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { redirect } from 'react-router';
import type { $Enums } from '@prisma/client';
import type { User, SignOut, AuthError } from '@supabase/supabase-js';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function redirectWithHeaders(url: string, headers: Headers, init?: ResponseInit) {
  const response = redirect(url, init);

  headers.forEach((value, key) => {
    response.headers.append(key, value);
  });

  return response;
}

export function jsonWithHeaders(
  data: {
    success?: boolean;
    errors?:
      | { email?: string[] | undefined }
      | { email?: string[] | undefined; password?: string[] | undefined };
    message?: string;
    redirectTo?: string;
    registered?: boolean;
    reset?: boolean;
    error?: string | null;
    user?: User;
    signOut?: (options?: SignOut) => Promise<{ error: AuthError | null }>;
    dbUser?:
      | {
          email: string;
          password: string;
          name: string;
          id: string;
          role: $Enums.Role;
          createdAt: Date;
          updatedAt: Date;
          alternativeContact: string | null;
          creditScore: number | null;
          employer: string | null;
          employmentStatus: string | null;
          identificationDocumentNumber: string | null;
          identificationDocumentType: string | null;
          identificationVerified: boolean;
          monthlyIncome: number | null;
          phoneNumber: string | null;
          previousLandlordReference: string | null;
          organizationId: string | null;
        }[]
      | null;
  },
  headers: Headers,
  init?: ResponseInit
) {
  return new Response(JSON.stringify(data), {
    ...init,
    headers: {
      ...Object.fromEntries(headers.entries()),
      ...(init?.headers || {}),
      'Content-Type': 'application/json',
    },
  });
}

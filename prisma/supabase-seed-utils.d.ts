export function createSupabaseAdmin(): any;

export function seedUserToSupabase(
  user: { email: string; id: string },
  plainTextPassword: string
): Promise<any>;

export function removeUserFromSupabase(email: string): Promise<void>;

export function cleanSupabaseUsers(emails: string[]): Promise<void>;

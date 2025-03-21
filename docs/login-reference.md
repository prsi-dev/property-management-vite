# Login Quick Reference

## Test User Accounts

| Role             | Email               | Password |
| ---------------- | ------------------- | -------- |
| Admin            | admin@example.com   | 123456   |
| Manager          | manager@example.com | 123456   |
| Owner            | owner1@example.com  | 123456   |
| Owner            | owner2@example.com  | 123456   |
| Tenant           | tenant1@example.com | 123456   |
| Tenant           | tenant2@example.com | 123456   |
| Service Provider | service@example.com | 123456   |

## Dashboard Routes

After login, users are automatically redirected to their role-specific dashboard:

- `/dashboard/admin` - Administrator dashboard
- `/dashboard/manager` - Property manager dashboard
- `/dashboard/owner` - Property owner dashboard
- `/dashboard/tenant` - Tenant dashboard
- `/dashboard/service` - Service provider dashboard

## Notes

- For development use only
- All users have verified email addresses
- For full documentation, see [User Credentials Documentation](./user-credentials.md)

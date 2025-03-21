# Welcome to React Router!

A modern, production-ready template for building full-stack React applications using React Router.

## Features

- 🚀 Server-side rendering
- ⚡️ Hot Module Replacement (HMR)
- 📦 Asset bundling and optimization
- 🔄 Data loading and mutations
- 🔒 TypeScript by default
- 🎉 TailwindCSS for styling
- 📖 [React Router docs](https://reactrouter.com/)

## Getting Started

### Installation

Install the dependencies:

```bash
npm install
```

### Development

Start the development server with HMR:

```bash
npm run dev
```

Your application will be available at `http://localhost:3000`.

## Database Setup and Seeding

### Database Seeding

This project uses Prisma with Supabase for database and authentication. To seed the database:

```bash
# Regular Prisma seed (database only)
npm run prisma:seed

# Seed both database and Supabase Auth tables
npm run seed:auth
```

To use the Supabase Auth integration:

1. Add your Supabase service role key to the `.env` file:

```
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key-from-supabase-dashboard"
```

2. Run the auth-enabled seed command which will create users in both Prisma and Supabase Auth:

```bash
npm run seed:auth
```

All seeded users will have the password: `password123`

### Test User Credentials

For a complete list of all test users created during seeding, their roles, and login information, see:

- [User Credentials Documentation](./docs/user-credentials.md)

## Building for Production

Create a production build:

```bash
npm run build
```

## Deployment

[![Deploy to Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fremix-run%2Freact-router-templates%2Ftree%2Fmain%2Fvercel&project-name=my-react-router-app&repository-name=my-react-router-app)

## Styling

This template comes with [Tailwind CSS](https://tailwindcss.com/) already configured for a simple default starting experience. You can use whatever CSS framework you prefer.

---

Built with ❤️ using React Router.

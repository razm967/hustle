# Hustle - Teen Job Platform

A Next.js application connecting teens with local job opportunities. Features job browsing, saving, and application management.

## Features

### For Employees (Teens)
- **Browse Jobs**: Search and filter available job opportunities
- **Save Jobs**: Bookmark interesting jobs for later
- **Apply to Jobs**: Submit applications with personal messages
- **My Jobs**: Track saved, applied, in-progress, and completed jobs
- **Job Management**: Organized tabs for different job statuses

### For Employers
- **Post Jobs**: Create job listings with details, location, and requirements
- **Manage Applications**: Review and respond to job applications
- **Job Status**: Update job status (open, in-progress, completed)

### General Features
- **Responsive Design**: Works on desktop and mobile devices
- **Dark/Light Mode**: Automatic theme switching
- **Static Header**: Hero section stays visible while scrolling
- **Real-time Updates**: Live job status and save state updates

## Database Setup

Before running the application, you need to set up the database tables. Run the following SQL script in your Supabase SQL editor:

```sql
-- Run the migration script
\i database-migration.sql
```

Or copy and paste the contents of `database-migration.sql` into your Supabase SQL editor.

## Getting Started

First, install dependencies:

```bash
npm install
# or
yarn install
# or
pnpm install
```

Then, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Environment Variables

Make sure to set up your environment variables for Supabase:

```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

## Project Structure

```
hustle/
├── app/                    # Next.js app directory
│   ├── employee/          # Employee-specific pages
│   │   ├── browse-jobs/   # Job browsing page
│   │   ├── saved/         # Saved jobs management
│   │   └── job/[id]/      # Individual job details
│   ├── employer/          # Employer-specific pages
│   └── auth/              # Authentication pages
├── components/            # Reusable UI components
│   ├── ui/               # Base UI components
│   ├── job-listings.tsx  # Job display component
│   ├── heroSection.tsx   # Static header component
│   └── Sidebar.tsx       # Navigation sidebar
├── lib/                  # Utility libraries
│   ├── jobs-service.ts   # Job-related API functions
│   ├── database-types.ts # TypeScript type definitions
│   └── supabase.ts       # Supabase client setup
└── database-migration.sql # Database setup script
```

## New Features Added

### Job Saving System
- **Save/Unsave Jobs**: Click the bookmark icon on any job to save it
- **Saved Jobs Page**: Access via "My Jobs" in the navigation
- **Status Tracking**: See which jobs you've applied to vs. just saved
- **Organized Tabs**: Separate views for saved, applied, in-progress, and completed jobs

### Enhanced Navigation
- **Updated Sidebar**: Added "My Jobs" link for employees
- **Static Hero Section**: Header remains visible while scrolling
- **Improved UX**: Better visual feedback for job interactions

### Database Enhancements
- **New saved_jobs table**: Stores user job bookmarks
- **Enhanced job queries**: Include save status and application status
- **Row Level Security**: Secure access to saved jobs data

## Technology Stack

- **Frontend**: Next.js 14, React, TypeScript
- **Styling**: Tailwind CSS, shadcn/ui components
- **Backend**: Supabase (PostgreSQL, Auth, Real-time)
- **Icons**: Lucide React
- **State Management**: React hooks

## Learn More

To learn more about the technologies used:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API
- [Supabase Documentation](https://supabase.com/docs) - learn about Supabase features
- [Tailwind CSS](https://tailwindcss.com/docs) - utility-first CSS framework
- [shadcn/ui](https://ui.shadcn.com/) - re-usable component library

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

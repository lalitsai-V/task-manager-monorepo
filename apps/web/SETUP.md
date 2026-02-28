# TaskFlow - Task Manager SaaS Application

A modern, full-stack task management platform built with Next.js 14, Supabase, Server Actions, Zod validation, and Tailwind CSS.

## Features

- **Personal Task Management**: Create, edit, and manage personal tasks
- **Group Collaboration**: Create groups and share tasks with team members
- **Real-time Updates**: Automatic synchronization across devices
- **Secure Authentication**: Supabase Authentication with middleware protection
- **Group Task Tracking**: Track who completed what tasks in group projects
- **User Profile**: View statistics and group memberships
- **Dark Modern UI**: Professional dark theme with red accents

## Tech Stack

- **Frontend**: Next.js 14 (App Router), React 19, Tailwind CSS
- **Backend**: Next.js Server Actions, Supabase
- **Database**: PostgreSQL (via Supabase)
- **Authentication**: Supabase Auth
- **Validation**: Zod
- **Types**: TypeScript

## Quick Start

### Prerequisites

- Node.js 18+ 
- npm/yarn/pnpm
- Supabase account (free at https://supabase.com)

### 1. Clone and Install

```bash
npm install
```

### 2. Supabase Setup

#### 2.1 Create a Supabase Project

1. Go to https://supabase.com
2. Create a new project
3. Get your Project URL and Anon Key from Settings > API

#### 2.2 Create Database Tables

Run the following SQL queries in Supabase SQL Editor:

```sql
-- Create groups table
CREATE TABLE groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create tasks table
CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  is_completed BOOLEAN DEFAULT false,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  group_id UUID REFERENCES groups(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create group_members table
CREATE TABLE group_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(group_id, user_id)
);

-- Create task_completions table
CREATE TABLE task_completions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(task_id, user_id)
);
```

#### 2.3 Enable Row Level Security (RLS)

Enable RLS on all tables:

```sql
ALTER TABLE groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_completions ENABLE ROW LEVEL SECURITY;
```

#### 2.4 Create RLS Policies

```sql
-- Groups: Users can select groups they're members of
CREATE POLICY "Users can select own groups"
ON groups FOR SELECT
TO authenticated
USING (
  auth.uid() = created_by OR
  EXISTS (
    SELECT 1 FROM group_members 
    WHERE group_members.group_id = groups.id 
    AND group_members.user_id = auth.uid()
  )
);

-- Groups: Users can create groups
CREATE POLICY "Users can create groups"
ON groups FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = created_by);

-- Tasks: Users can select their own tasks and group tasks
CREATE POLICY "Users can select own tasks"
ON tasks FOR SELECT
TO authenticated
USING (
  user_id = auth.uid() OR
  (
    group_id IS NOT NULL AND
    EXISTS (
      SELECT 1 FROM group_members
      WHERE group_members.group_id = tasks.group_id
      AND group_members.user_id = auth.uid()
    )
  )
);

-- Tasks: Users can insert tasks
CREATE POLICY "Users can create tasks"
ON tasks FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

-- Tasks: Users can update their own tasks
CREATE POLICY "Users can update own tasks"
ON tasks FOR UPDATE
TO authenticated
USING (user_id = auth.uid() OR group_id IS NOT NULL)
WITH CHECK (user_id = auth.uid());

-- Tasks: Users can delete their own tasks
CREATE POLICY "Users can delete own tasks"
ON tasks FOR DELETE
TO authenticated
USING (user_id = auth.uid());

-- Group Members: Users can select group members
CREATE POLICY "Users can view group members"
ON group_members FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM group_members gm
    WHERE gm.group_id = group_members.group_id
    AND gm.user_id = auth.uid()
  )
);

-- Group Members: Users can insert members
CREATE POLICY "Users can add group members"
ON group_members FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM group_members gm
    WHERE gm.group_id = group_members.group_id
    AND gm.user_id = auth.uid()
  )
);

-- Task Completions: Users can select completions
CREATE POLICY "Users can view task completions"
ON task_completions FOR SELECT
TO authenticated
USING (
  user_id = auth.uid() OR
  EXISTS (
    SELECT 1 FROM tasks
    WHERE tasks.id = task_completions.task_id
    AND (
      tasks.user_id = auth.uid() OR
      EXISTS (
        SELECT 1 FROM group_members
        WHERE group_members.group_id = tasks.group_id
        AND group_members.user_id = auth.uid()
      )
    )
  )
);

-- Task Completions: Users can insert/delete completions
CREATE POLICY "Users can mark tasks complete"
ON task_completions FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());
```

### 3. Environment Configuration

Copy `.env.local.example` to `.env.local`:

```bash
cp .env.local.example .env.local
```

Add your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=your_project_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
task-manager-app/
├── app/
│   ├── (auth)/              # Authentication routes
│   │   ├── login/
│   │   └── signup/
│   ├── dashboard/           # Protected dashboard routes
│   │   ├── groups/
│   │   ├── profile/
│   │   └── page.tsx
│   ├── actions/             # Server actions
│   │   ├── tasks.ts
│   │   └── groups.ts
│   ├── layout.tsx
│   ├── page.tsx            # Landing page
│   └── globals.css
├── components/
│   ├── ui/                 # Reusable UI components
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Card.tsx
│   │   └── Sidebar.tsx
│   ├── tasks/              # Task-related components
│   │   ├── CreateTaskForm.tsx
│   │   └── TaskList.tsx
│   ├── groups/             # Group-related components
│   │   ├── CreateGroupForm.tsx
│   │   ├── GroupList.tsx
│   │   └── InviteMemberForm.tsx
│   └── profile/            # Profile components
├── lib/
│   ├── supabase/
│   │   ├── server.ts      # Server-side Supabase client
│   │   └── client.ts      # Client-side Supabase client
│   └── validations/
│       └── index.ts        # Zod schemas
├── types/
│   └── index.ts            # TypeScript types
├── middleware.ts           # Authentication middleware
├── tsconfig.json
├── next.config.ts
├── tailwind.config.ts
└── package.json
```

## Key Features Explained

### Authentication Flow

1. Users land on `/` (public landing page)
2. `/login` and `/signup` are protected by middleware
3. After authentication, users are redirected to `/dashboard`
4. Middleware ensures only authenticated users can access `/dashboard`

### Server Actions

All mutations use Next.js Server Actions with Zod validation:

- `createTask()` - Create personal or group task
- `updateTask()` - Update task status
- `deleteTask()` - Delete task
- `createGroup()` - Create new group
- `inviteMember()` - Add user to group
- `markTaskCompleted()` - Mark task as complete

### Row Level Security

The database uses RLS policies to ensure:

- Users can only see their own personal tasks
- Users can only see group tasks if they're members
- Users can only modify their own tasks
- Group members can mark group tasks complete

## Deployment

### Build for Production

```bash
npm run build
npm run start
```

### Deploy to Vercel

```bash
vercel deploy
```

## Future Enhancements

- Real-time collaboration with Supabase Realtime
- Task comments and discussions
- Task due dates and reminders
- Email notifications
- Dark mode toggle preferences
- Bulk operations
- Search and filtering
- Task templates
- Recurring tasks

## License

MIT

## Support

For issues and questions, please create an issue in the repository.

# TaskFlow Architecture & Technical Documentation

## Project Overview

TaskFlow is a production-ready, full-stack SaaS task management application built with modern web technologies. It demonstrates industry best practices for authentication, data validation, security, and component architecture.

## Technology Stack

### Frontend
- **Framework**: Next.js 14 (App Router)
- **Runtime**: React 19
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS v4
- **UI Pattern**: Server Components + Client Components
- **Form Validation**: Zod v4

### Backend
- **Server Runtime**: Node.js + Next.js
- **Data Handling**: Server Actions
- **Authentication**: Supabase Auth
- **Database**: PostgreSQL (via Supabase)
- **Security**: Row-Level Security (RLS) Policies

### DevOps
- **Package Manager**: npm
- **Linting**: ESLint
- **Code Quality**: TypeScript strict mode
- **Environment**: .env.local for secrets

## Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                   User Browser                          │
│         (React Components + Event Handlers)             │
└─────────────────┬───────────────────────────────────────┘
                  │ HTTP Requests
                  ▼
┌─────────────────────────────────────────────────────────┐
│              Next.js Server (App Router)                │
│  ┌──────────────────────────────────────────────────┐  │
│  │ Middleware (Auth & Route Protection)             │  │
│  └──────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────┐  │
│  │ Server Actions (Zod Validation + Business Logic)│  │
│  └──────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────┐  │
│  │ Route Handlers (API Routes)                      │  │
│  └──────────────────────────────────────────────────┘  │
└─────────────────┬───────────────────────────────────────┘
                  │ HTTPS + Auth Token
                  ▼
┌─────────────────────────────────────────────────────────┐
│                  Supabase Backend                       │
│  ┌──────────────────────────────────────────────────┐  │
│  │ Authentication & User Management                 │  │
│  └──────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────┐  │
│  │ PostgreSQL Database                              │  │
│  │ - Row-Level Security (RLS) Policies              │  │
│  │ - Automatic data isolation by user               │  │
│  └──────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

## Data Flow Patterns

### Task Creation Flow
```
User Form Input
    ↓
Client Component (CreateTaskForm)
    ↓
Server Action (createTask)
    ↓
Zod Validation (createTaskSchema)
    ↓
Authentication Check (getUser)
    ↓
Supabase INSERT (tasks table)
    ↓
RLS Policy Enforcement
    ↓
revalidatePath (Cache Invalidation)
    ↓
UI Update (via ISR)
```

### Authentication Flow
```
User Signs Up
    ↓
Supabase Auth (signUp)
    ↓
Auth Token Created
    ↓
Cookie Set (Secure HTTP-Only)
    ↓
Middleware Validates Token
    ↓
User Redirected to /dashboard
    ↓
Protected Routes Accessible
```

### Data Access Flow
```
Client Request
    ↓
Middleware Validates Token
    ↓
Server Action Receives Request
    ↓
getUser() (Get Auth User)
    ↓
Supabase Query (SELECT with RLS)
    ↓
RLS Policy Checks:
  - User owns data? ✓ Allow
  - User in group? ✓ Allow
  - Neither? ✗ Block
    ↓
Data Returned to Client
```

## File Structure & Organization

### Root Level
```
/
├── middleware.ts              # Auth & route protection
├── database.sql               # Database schema & RLS
├── .env.local.example        # Environment template
├── SETUP.md                   # Database setup guide
├── DEPLOYMENT.md              # Deployment checklist
├── package.json               # Dependencies
└── tsconfig.json              # TypeScript config
```

### App Directory (Next.js Routes)
```
/app
├── (auth)/                    # Auth group (public)
│   ├── layout.tsx            # Auth layout wrapper
│   ├── login/
│   │   └── page.tsx          # Login page
│   └── signup/
│       └── page.tsx          # Signup page
├── dashboard/                # Dashboard group (protected)
│   ├── layout.tsx            # Dashboard wrapper + sidebar
│   ├── page.tsx              # Main dashboard (personal tasks)
│   ├── groups/
│   │   ├── page.tsx          # Groups list
│   │   └── [id]/
│   │       └── page.tsx      # Group detail
│   └── profile/
│       └── page.tsx          # User profile
├── actions/                   # Server Actions
│   ├── tasks.ts              # Task mutations
│   └── groups.ts             # Group mutations
├── layout.tsx                # Root layout
├── page.tsx                  # Landing page
└── globals.css               # Global styles
```

### Components Directory
```
/components
├── ui/                        # Reusable UI components
│   ├── Button.tsx            # Styled button (variants)
│   ├── Input.tsx             # Form input (with label & error)
│   ├── Card.tsx              # Card container
│   ├── Sidebar.tsx           # Navigation sidebar
│   └── index.ts              # Barrel export
├── tasks/                     # Task-specific components
│   ├── CreateTaskForm.tsx    # Form for new tasks
│   └── TaskList.tsx          # Task list display
├── groups/                    # Group-specific components
│   ├── CreateGroupForm.tsx   # Form for new groups
│   ├── GroupList.tsx         # Group list display
│   └── InviteMemberForm.tsx  # Invite member form
└── profile/                   # Profile components
```

### Library Directory
```
/lib
├── supabase/
│   ├── server.ts             # Server-side Supabase client
│   └── client.ts             # Client-side Supabase client
├── validations/
│   └── index.ts              # Zod schemas
└── utils.ts                  # Helper functions
```

### Types Directory
```
/types
└── index.ts                  # TypeScript interfaces
    ├── Task interface
    ├── Group interface
    ├── GroupMember interface
    ├── TaskCompletion interface
    └── User interface
```

## Key Components Explained

### Middleware (middleware.ts)

**Purpose**: Route protection and authentication

**Features**:
- Validates JWT token from Supabase
- Redirects unauthenticated users to /login
- Redirects authenticated users away from /login and /signup
- Preserves user session with cookie handling

**Matcher**: Applies to all routes except API, static files, and images

### Server Actions (app/actions/*.ts)

**Purpose**: Secure server-side business logic

**Pattern**:
1. Accept input from client
2. Parse with Zod schema
3. Get authenticated user
4. Check authorization
5. Execute database operation
6. Revalidate cache
7. Return result or error

**Example**:
```typescript
export async function createTask(input: CreateTaskInput) {
  // 1. Validate
  const validated = createTaskSchema.parse(input)
  
  // 2. Authenticate
  const user = await getUser()
  if (!user) return { error: 'Unauthorized' }
  
  // 3. Execute
  const { data, error } = await supabase
    .from('tasks')
    .insert({ ...validated, user_id: user.id })
  
  // 4. Handle cache
  revalidatePath('/dashboard')
  
  // 5. Return
  return { data, error }
}
```

### Zod Schemas (lib/validations/index.ts)

**Purpose**: Input validation and type inference

**Benefits**:
- Runtime validation (type-safe)
- Clear error messages
- Automatic TypeScript types via `z.infer<>`
- Reusable across server and client

**Example**:
```typescript
const createTaskSchema = z.object({
  title: z.string().min(1).max(255),
  group_id: z.string().uuid().optional().nullable(),
})

type CreateTaskInput = z.infer<typeof createTaskSchema>
```

### RLS Policies (Database)

**Purpose**: Data isolation at database level

**Benefits**:
- Multi-tenant security
- No SQL injection attacks
- Automatic data isolation
- Even server code can't bypass

**Example Policy**:
```sql
CREATE POLICY "Users can select own tasks"
ON tasks FOR SELECT
TO authenticated
USING (
  user_id = auth.uid() OR  -- Own task
  (group_id IS NOT NULL AND EXISTS (  -- Or in group
    SELECT 1 FROM group_members
    WHERE group_id = tasks.group_id
    AND user_id = auth.uid()
  ))
);
```

## Component Patterns

### Server Components (Default)
- Fetch data directly from database
- No hydration needed
- Secure (server-side only code)
- Great for initial page load

```typescript
// app/dashboard/page.tsx
export default async function DashboardPage() {
  const tasks = await fetchUserTasks()
  return <TaskList tasks={tasks} />
}
```

### Client Components
- Interactive features (forms, state)
- Event handlers
- Use `'use client'` directive
- Call Server Actions

```typescript
// components/tasks/CreateTaskForm.tsx
'use client'

export function CreateTaskForm() {
  const [title, setTitle] = useState('')
  
  async function handleSubmit(e: FormEvent) {
    const result = await createTask({ title })
  }
}
```

## Security Considerations

### Authentication
- Supabase handles JWT token generation
- Token stored in secure HTTP-only cookie
- Middleware validates on every request
- Automatic token refresh

### Authorization
- User-level access control via RLS
- Group membership validation
- Creator-only delete permissions
- Task visibility isolated by user

### Data Validation
- Zod schemas validate all input
- Server Action validation before DB
- RLS policies provide final validation
- No client-side-only validation

### Secrets Management
- Never expose in code
- Use .env.local (gitignored)
- Service role key only in server code
- Public key (anon key) safe for client

## Database Design

### Normalized Schema
- Separate tables for entities
- Foreign keys for relationships
- Unique constraints for data integrity
- Indexes for query performance

### Indexes (Performance)
- user_id on tasks (fast user task lookup)
- group_id on tasks (fast group task lookup)
- group_id on group_members (fast member lookup)
- task_id on task_completions (fast completion lookup)

### Constraints
- NOT NULL for required fields
- UNIQUE constraints prevent duplicates
- FOREIGN KEYS ensure referential integrity
- ON DELETE CASCADE for cleanup

## Performance Optimizations

### Caching
- `revalidatePath()` after mutations
- Incremental Static Regeneration (ISR)
- Server-side data fetching

### Database
- Indexed foreign keys
- Query optimization via RLS
- Small data transfers (only needed columns)

### Frontend
- Server Components (no hydration)
- Code splitting via dynamic imports
- CSS-in-JS optimization via Tailwind

## Error Handling Patterns

### Server Actions
```typescript
try {
  // Validate, authenticate, execute
  const { data, error } = await operation()
  if (error) return { error: error.message }
  return { data }
} catch (error) {
  return { error: 'Unexpected error' }
}
```

### Client Components
```typescript
const [error, setError] = useState<string | null>(null)

try {
  const result = await serverAction()
  if (result.error) setError(result.error)
} catch (err) {
  setError('Unexpected error')
}
```

## Testing Strategy

### Unit Tests
- Individual component rendering
- Validation schema tests
- Utility function tests

### Integration Tests
- Server Action flows
- Database operations with RLS
- Authentication flows

### E2E Tests
- User signup flow
- Task CRUD operations
- Group collaboration

## Deployment Checklist

- [ ] Build succeeds: `npm run build`
- [ ] No TypeScript errors
- [ ] Environment variables set
- [ ] Database initialized
- [ ] RLS policies verified
- [ ] Security headers configured
- [ ] HTTPS enabled
- [ ] Domain configured in Supabase
- [ ] Error monitoring set up
- [ ] Database backups configured

## Future Enhancements

1. **Real-time Features**
   - Supabase Realtime for live updates
   - WebSocket subscriptions
   - Optimistic updates

2. **Advanced Features**
   - Task comments and discussions
   - Due dates and reminders
   - Email notifications
   - File attachments
   - Recurring tasks
   - Task templates

3. **Scalability**
   - Redis caching layer
   - CDN for static assets
   - Database read replicas
   - Message queues for async tasks

4. **Analytics & Monitoring**
   - User analytics
   - Performance monitoring
   - Error tracking
   - User behavior insights

5. **Enterprise Features**
   - SSO/SAML
   - Advanced permissions
   - Team management
   - Audit logs
   - Data export

---

**Document Version**: 1.0  
**Last Updated**: 2024  
**Audience**: Developers, DevOps, Project Managers

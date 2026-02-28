# TaskFlow - Visual Architecture & Data Flow Diagrams

## 1. Full Application Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                         User's Browser                              │
│                                                                     │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │           Next.js Client Components (React)                  │  │
│  │                                                              │  │
│  │  Landing Page    Login/Signup    Dashboard         Profile  │  │
│  │  - Hero          - Form          - Sidebar         - Stats  │  │
│  │  - Features      - Validation    - Task List       - Groups │  │
│  │  - CTA Buttons   - Auth          - Create Form     - Email  │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                │                                    │
│                                │ HTTP/HTTPS with JWT Token          │
│                                ▼                                    │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │                  Event Handlers & State                      │  │
│  │  - Form Submissions → Server Actions                         │  │
│  │  - Click Handlers → Server Actions                           │  │
│  │  - Client State (Loading, Errors)                            │  │
│  └──────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
                                │
                                │
┌─────────────────────────────────────────────────────────────────────┐
│                   Next.js Server (App Router)                       │
│                                                                     │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │                      middleware.ts                           │  │
│  │  ✓ Validate JWT Token                                        │  │
│  │  ✓ Check User Authentication                                │  │
│  │  ✓ Protect Routes (/dashboard, /profile, etc.)             │  │
│  │  ✓ Redirect if Unauthorized                                │  │
│  └──────────────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │                 Page/Route Components                        │  │
│  │  - Server Components (fetch data)                            │  │
│  │  - Pass data to Client Components                            │  │
│  │  - Render HTML for response                                  │  │
│  └──────────────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │                    Server Actions                            │  │
│  │                                                              │  │
│  │  createTask()        ┐                                      │  │
│  │  updateTask()        ├─ Validate with Zod                  │  │
│  │  deleteTask()        │                                      │  │
│  │  markTaskCompleted() ┘                                      │  │
│  │                     ↓                                        │  │
│  │  getUser() → Check Auth                                     │  │
│  │  ↓                                                           │  │
│  │  Authorize (Check permissions)                              │  │
│  │  ↓                                                           │  │
│  │  Supabase Query                                             │  │
│  │  ↓                                                           │  │
│  │  revalidatePath() → Cache Invalidation                      │  │
│  │  ↓                                                           │  │
│  │  Return Result to Client                                    │  │
│  └──────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
                                │
                                │ HTTPS + Auth Token
                                │
┌─────────────────────────────────────────────────────────────────────┐
│                      Supabase Backend                               │
│                                                                     │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │                 Authentication Service                       │  │
│  │  - User Registration                                         │  │
│  │  - JWT Token Generation                                      │  │
│  │  - Session Management                                        │  │
│  │  - Email Verification                                        │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                │
│                                ▼
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │                   PostgreSQL Database                        │  │
│  │                                                              │  │
│  │  ┌─────────────────────────────────────────────────────┐   │  │
│  │  │ Row-Level Security (RLS) Policies                   │   │  │
│  │  │ ✓ User Isolation                                    │   │  │
│  │  │ ✓ Group Membership Check                            │   │  │
│  │  │ ✓ Creator Verification                              │   │  │
│  │  └─────────────────────────────────────────────────────┘   │  │
│  │                        │                                    │  │
│  │                        ▼                                    │  │
│  │  ┌──────────────┬──────────────┬──────────────────────┐   │  │
│  │  │  groups      │  tasks       │  group_members       │   │  │
│  │  │  id, name    │  id, title   │  id, group_id        │   │  │
│  │  │  created_by  │  is_completed│  user_id             │   │  │
│  │  └──────────────┴──────────────┴──────────────────────┘   │  │
│  │                                                             │  │
│  │  ┌────────────────────────────────────────────────────┐   │  │
│  │  │ task_completions                                   │   │  │
│  │  │ id, task_id, user_id, completed_at                │   │  │
│  │  └────────────────────────────────────────────────────┘   │  │
│  └──────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
```

## 2. Authentication Flow

```
┌─────────────┐
│  User Visit │
│  localhost  │
└──────┬──────┘
       │
       ▼
   ┌───────────────────────────┐
   │   middleware.ts Checks    │
   │   └─ Valid JWT Token?     │
   └───────┬───────────────────┘
           │
      No   │   Yes
      │    │
      │    ▼
      │ ┌────────────────┐
      │ │ Authenticated  │
      │ │ User           │
      │ │ ↓              │
      │ │ Check Route    │
      │ │ ├─ /login      │ (Redirect to /dashboard)
      │ │ ├─ /signup     │ (Redirect to /dashboard)
      │ │ └─ /dashboard  │ (Allow access) ✓
      │ └────────────────┘
      │
      ▼
┌──────────────────────────┐
│  Unauthenticated User    │
│  ├─ / (Landing) → ✓      │
│  ├─ /login → ✓           │
│  ├─ /signup → ✓          │
│  └─ /dashboard → Redirect│
└──────────────────────────┘

LOGIN/SIGNUP FLOW:
┌────────────┐
│ Form Input │
└──────┬─────┘
       │
       ▼
┌────────────────────┐
│ Client Component   │
│ (use client)       │
│ - Collect email    │
│ - Collect password │
└──────┬─────────────┘
       │
       ▼
┌────────────────────────────┐
│ Supabase Auth Handler      │
│ signUp() or signIn()       │
└──────┬─────────────────────┘
       │
       ├─ Success ──▶ JWT Token Created
       │                │
       │                ▼
       │           HTTP-Only Cookie
       │           (Secure, Encrypted)
       │                │
       │                ▼
       │           Redirect to /dashboard
       │
       └─ Error ──▶ Display Error Message
                    └─ User can retry
```

## 3. Task Creation Data Flow

```
┌──────────────────────────────────────────────────────────────────┐
│                     USER SUBMITS FORM                            │
│                  (CreateTaskForm Component)                      │
│  Input: { title: "Buy milk", group_id: null }                   │
└────────────────────────┬─────────────────────────────────────────┘
                         │
                         ▼
            ┌────────────────────────────┐
            │   Client Component Action  │
            │   handleSubmit()           │
            │   setLoading(true)         │
            │   setError(null)           │
            └────────┬───────────────────┘
                     │
                     ▼
         ┌──────────────────────────────┐
         │  Call Server Action          │
         │  await createTask({          │
         │    title: "Buy milk",        │
         │    group_id: null            │
         │  })                          │
         └────────┬───────────────────────┘
                  │ (HTTP POST + JWT)
                  ▼
    ┌──────────────────────────────────┐
    │ SERVER: createTask()             │
    │ app/actions/tasks.ts             │
    │                                  │
    │ 1. Parse Input                   │
    │    createTaskSchema.parse()      │
    │    ✓ title: min 1, max 255       │
    │    ✓ group_id: optional UUID     │
    │    └─ Error? → Return error      │
    └────────┬─────────────────────────┘
             │
             ▼
    ┌──────────────────────────────────┐
    │ 2. Authenticate User             │
    │    user = await getUser()        │
    │    ├─ user found? ✓              │
    │    └─ no user? Return Unauthorized
    └────────┬─────────────────────────┘
             │
             ▼
    ┌──────────────────────────────────┐
    │ 3. Create Supabase Client        │
    │    supabase = await createClient()
    │ (This validates auth.users)      │
    └────────┬─────────────────────────┘
             │
             ▼
    ┌──────────────────────────────────┐
    │ 4. Insert Task Data              │
    │    supabase.from('tasks')        │
    │    .insert({                     │
    │      title: 'Buy milk',          │
    │      user_id: user.id,           │
    │      group_id: null,             │
    │      is_completed: false         │
    │    })                            │
    └────────┬─────────────────────────┘
             │
             ▼
    ┌──────────────────────────────────┐
    │ 5. RLS Check (Database Level)    │
    │                                  │
    │ Policy: "Users can create tasks" │
    │ WITH CHECK (user_id = auth.uid()) │
    │                                  │
    │ ✓ user.id matches auth.uid?      │
    │ ✓ Yes → Insert allowed!          │
    │ ✗ No → Policy violation error    │
    └────────┬─────────────────────────┘
             │
             ▼
    ┌──────────────────────────────────┐
    │ 6. Task Inserted Successfully    │
    │    { id, title, user_id, ... }  │
    └────────┬─────────────────────────┘
             │
             ▼
    ┌──────────────────────────────────┐
    │ 7. Revalidate Cache              │
    │    revalidatePath('/dashboard')  │
    │                                  │
    │ This triggers ISR (Incremental   │
    │ Static Regeneration) to update   │
    │ the page with new task           │
    └────────┬─────────────────────────┘
             │
             ▼
    ┌──────────────────────────────────┐
    │ 8. Return Result to Client       │
    │    { data: task, error: null }   │
    └────────┬─────────────────────────┘
             │ (HTTP Response + new data)
             ▼
    ┌──────────────────────────────────┐
    │ CLIENT: Handle Response          │
    │                                  │
    │ if (result.error) {              │
    │   setError(result.error)         │
    │ } else {                         │
    │   setTitle('')                   │
    │   // Page auto-updates via ISR   │
    │ }                                │
    │ setLoading(false)                │
    └──────────────────────────────────┘
             │
             ▼
    ┌──────────────────────────────────┐
    │ UI Updates                       │
    │ ├─ Task appears in list          │
    │ ├─ Form clears                   │
    │ ├─ No error message              │
    │ └─ Success! ✓                    │
    └──────────────────────────────────┘
```

## 4. Group Collaboration Data Flow

```
Creator Creates Group
      │
      ▼
  createGroup()
      │
      ├─ Insert into 'groups' table
      └─ Insert creator into 'group_members'
             │
             ▼
        Creator is member ✓
             │
      ▼─────┴─────▼
   
Team Member Joins (Invited)
      │
      ▼
  inviteMember(email)
      │
      ├─ Find member by email
      └─ Insert into 'group_members'
             │
             ▼
        Member has access ✓
             │
             ▼
    Now can:
    ├─ Create group tasks
    ├─ View all group tasks
    ├─ Mark tasks complete
    └─ See who completed what

Task Creator Creates Group Task
      │
      ▼
  createTask(groupId)
      │
      ├─ Insert into 'tasks' with group_id
      └─ Task accessible to all group members
             │
             ├─ Creator → Can edit/delete
             ├─ Members → Can mark complete
             └─ Non-members → Blocked by RLS

When Member Completes Task
      │
      ▼
  markTaskCompleted(taskId)
      │
      ├─ Insert into 'task_completions'
      │  (taskId, userId, now())
      │
      ├─ Creator can see:
      │  "John marked as complete"
      │  "Jane not yet completed"
      │
      └─ RLS ensures:
         Only group members can complete
```

## 5. Database Security (RLS) Flow

```
User Query: SELECT * FROM tasks

         Supabase Supabase Auth
              │
              ▼
         Get user_id from JWT
              │
              ▼
     ┌──────────────────────┐
     │  Apply RLS Policies  │
     │  (Automatically)     │
     └──────┬───────────────┘
            │
            ▼
  ┌─────────────────────────────────┐
  │ Policy: "Users can select own   │
  │ tasks"                          │
  │                                 │
  │ WHERE (                         │
  │   user_id = auth.uid() OR       │
  │   (group_id IS NOT NULL AND     │
  │    EXISTS (                     │
  │      SELECT 1 FROM group_members│
  │      WHERE group_id = tasks...  │
  │      AND user_id = auth.uid()   │
  │    ))                           │
  │ )                               │
  └──────┬────────────────────────┘
         │
         ├─ Own tasks? ✓ Include
         │
         ├─ Group task + member? ✓ Include
         │
         └─ Other user's task? ✗ Exclude (hidden)

Result: User sees ONLY their own data
        Even if they try SQL injection!
```

## 6. Component Hierarchy

```
RootLayout (with Middleware)
│
├─ (auth) Layout [Public Routes]
│  ├─ /login Page
│  │  └─ LoginPage Component
│  │     └─ Form → Server Action
│  │
│  └─ /signup Page
│     └─ SignupPage Component
│        └─ Form → Server Action
│
├─ / [Landing Page]
│  └─ Home Component
│     ├─ Navigation
│     ├─ Hero Section
│     ├─ Features Section
│     └─ CTA Section
│
└─ dashboard Layout [Protected Routes]
   ├─ Middleware ✓ Auth Check
   ├─ Sidebar Component
   │
   ├─ /dashboard Page [Personal Tasks]
   │  ├─ CreateTaskForm (Client)
   │  │  └─ createTask → Server Action
   │  └─ TaskList (Client)
   │     └─ markTaskCompleted → Server Action
   │        └─ deleteTask → Server Action
   │
   ├─ /dashboard/groups Page [Groups List]
   │  ├─ CreateGroupForm (Client)
   │  │  └─ createGroup → Server Action
   │  └─ GroupList (Client)
   │     └─ Link to /dashboard/groups/[id]
   │
   ├─ /dashboard/groups/[id] Page [Group Detail]
   │  ├─ InviteMemberForm (Client)
   │  │  └─ inviteMember → Server Action
   │  ├─ CreateTaskForm (Client)
   │  │  └─ createTask(groupId) → Server Action
   │  └─ TaskList (Client)
   │     └─ markTaskCompleted → Server Action
   │
   └─ /dashboard/profile Page [User Profile]
      └─ Profile Component (Server)
         ├─ User Stats
         ├─ Groups List
         └─ Account Info
```

## 7. URL Routing Map

```
Public Routes (No Auth Required)
├─ GET /                    Landing page
├─ GET /login               Login form
└─ GET /signup              Signup form

Protected Routes (Auth Required)
├─ GET /dashboard           Personal tasks dashboard
│
├─ GET /dashboard/groups    Groups list page
├─ GET /dashboard/groups/[id]  Group detail + tasks
│
└─ GET /dashboard/profile   User profile page

Server Actions (POST - Hidden URLs)
├─ createTask              (app/actions/tasks.ts)
├─ updateTask              (app/actions/tasks.ts)
├─ deleteTask              (app/actions/tasks.ts)
├─ markTaskCompleted       (app/actions/tasks.ts)
├─ createGroup             (app/actions/groups.ts)
├─ inviteMember            (app/actions/groups.ts)
├─ getGroups               (app/actions/groups.ts)
├─ getGroupTasks           (app/actions/groups.ts)
└─ getGroupMembers         (app/actions/groups.ts)

Note: Server Actions don't have explicit routes
They're called directly via JavaScript functions
```

---

These diagrams show how TaskFlow integrates:
- Frontend (React Components)
- Server (Next.js + Server Actions)
- Database (PostgreSQL + RLS)
- Authentication (Supabase Auth)
- Security (Validation + RLS)

All working together seamlessly! 🚀

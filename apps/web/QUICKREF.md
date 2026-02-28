# TaskFlow Developer Quick Reference

## Common Commands

```bash
# Development
npm run dev              # Start dev server (http://localhost:3000)
npm run build           # Build for production
npm run start           # Run production build
npm run lint            # Run ESLint

# Database
# Copy database.sql content to Supabase SQL Editor
```

## Quick Links

- **Local App**: http://localhost:3000
- **Supabase**: https://supabase.com/dashboard
- **Documentation**: README.md, SETUP.md, ARCHITECTURE.md
- **Database Schema**: database.sql
- **Types**: types/index.ts
- **Validations**: lib/validations/index.ts

## Key Files

| File | Purpose |
|------|---------|
| `middleware.ts` | Route protection & auth |
| `app/actions/tasks.ts` | Task server actions |
| `app/actions/groups.ts` | Group server actions |
| `lib/supabase/server.ts` | Server-side DB client |
| `lib/validations/index.ts` | Zod schemas |
| `types/index.ts` | TypeScript types |
| `database.sql` | Database setup |

## Creating a New Feature

### 1. Database (if needed)
```sql
-- Add table/field to database.sql
-- Run in Supabase SQL Editor
-- Add RLS policies
```

### 2. Type Definition
```typescript
// types/index.ts
export interface Feature {
  id: string
  name: string
}
```

### 3. Validation Schema
```typescript
// lib/validations/index.ts
const featureSchema = z.object({
  name: z.string().min(1),
})
```

### 4. Server Action
```typescript
// app/actions/features.ts
'use server'

export async function createFeature(input: FeatureInput) {
  const user = await getUser()
  if (!user) return { error: 'Unauthorized' }
  
  const { data, error } = await supabase
    .from('features')
    .insert({ ...input, user_id: user.id })
  
  revalidatePath('/dashboard')
  return { data, error }
}
```

### 5. Component
```typescript
// components/features/FeatureForm.tsx
'use client'

export function FeatureForm() {
  const [name, setName] = useState('')
  
  async function handleSubmit(e: FormEvent) {
    const result = await createFeature({ name })
  }
  
  return <form onSubmit={handleSubmit}>...</form>
}
```

### 6. Page
```typescript
// app/dashboard/features/page.tsx
import { FeatureForm } from '@/components/features/FeatureForm'

export default async function FeaturesPage() {
  return (
    <div>
      <FeatureForm />
    </div>
  )
}
```

## Component Patterns

### Form Component
```typescript
'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { serverAction } from '@/app/actions/...'

export function FormComponent() {
  const [value, setValue] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const result = await serverAction({ value })
      if (result.error) {
        setError(result.error)
      } else {
        setValue('')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <div className="text-primary">{error}</div>}
      <Input value={value} onChange={e => setValue(e.target.value)} />
      <Button type="submit" disabled={loading}>{loading ? 'Loading...' : 'Submit'}</Button>
    </form>
  )
}
```

### List Component
```typescript
'use client'

import { Item } from '@/types'

interface ListProps {
  items: Item[]
}

export function ItemList({ items }: ListProps) {
  return (
    <div className="space-y-2">
      {items.map(item => (
        <div key={item.id} className="p-4 bg-gray-700 rounded">
          {item.name}
        </div>
      ))}
    </div>
  )
}
```

### Server Action
```typescript
'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { getUser } from '@/lib/supabase/server'
import { featureSchema } from '@/lib/validations'

export async function createFeature(input: FeatureInput) {
  try {
    // 1. Validate
    const validated = featureSchema.parse(input)
    
    // 2. Authenticate
    const user = await getUser()
    if (!user) return { error: 'Unauthorized' }
    
    // 3. Execute
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('features')
      .insert({ ...validated, user_id: user.id })
      .select()
      .single()
    
    if (error) return { error: error.message }
    
    // 4. Revalidate
    revalidatePath('/dashboard')
    
    // 5. Return
    return { data }
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Failed' }
  }
}
```

## Database Operations

### Query
```typescript
const supabase = await createClient()
const { data, error } = await supabase
  .from('table_name')
  .select('*')
  .eq('user_id', user_id)
```

### Insert
```typescript
const { data, error } = await supabase
  .from('table_name')
  .insert({
    name: 'Test',
    user_id: user_id,
  })
  .select()
  .single()
```

### Update
```typescript
const { data, error } = await supabase
  .from('table_name')
  .update({ name: 'Updated' })
  .eq('id', item_id)
```

### Delete
```typescript
const { error } = await supabase
  .from('table_name')
  .delete()
  .eq('id', item_id)
```

## Styling

### Dark Theme Colors
```css
--bg-black: #000000
--bg-gray-900: #111827
--bg-gray-800: #1f2937
--bg-gray-700: #374151

--text-white: #ffffff
--text-gray-400: #9ca3af

--accent-red: #ef4444
--accent-red-600: #dc2626
```

### Common Patterns
```html
<!-- Card -->
<div class="bg-gray-800 border border-gray-700 rounded-lg p-6">
  
<!-- Button -->
<button class="bg-primary hover:bg-primary-hover text-white px-4 py-2 rounded">

<!-- Input -->
<input class="bg-gray-800 border border-gray-700 rounded px-4 py-2 text-white">

<!-- Heading -->
<h1 class="text-4xl font-bold text-white">

<!-- Text -->
<p class="text-gray-400">
```

## Debugging

### Check Authentication
```typescript
const supabase = createClient()
const { data: { user } } = await supabase.auth.getUser()
console.log('User:', user)
```

### Test Server Action
```typescript
// In browser console
const result = await window.__serverAction(input)
console.log('Result:', result)
```

### View RLS Policies
```sql
-- In Supabase SQL Editor
SELECT * FROM pg_policies WHERE tablename = 'table_name'
```

### Check Database
```sql
-- Verify data
SELECT * FROM tasks WHERE user_id = 'your_id'

-- Check RLS
SET ROLE authenticated
SET request.jwt.claims = '{"sub":"your_id"}'
SELECT * FROM tasks
```

## Common Errors

| Error | Cause | Solution |
|-------|-------|----------|
| "Unauthorized" | Missing user | Check authentication |
| "RLS policy violation" | No matching policy | Check RLS rules |
| "Not found" | Missing record | Verify data in DB |
| "Invalid input" | Zod validation failed | Check input schema |
| "Network error" | Supabase down | Check status page |

## Environment Variables

```env
# Supabase - Get from Settings > API
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...

# Server only - keep secret
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
```

## Performance Tips

1. **Use Server Components** whenever possible
2. **Index foreign keys** in database
3. **Revalidate only changed paths** with `revalidatePath`
4. **Batch database operations** when possible
5. **Use `select()` to fetch** only needed columns

## Resources

- [Next.js Docs](https://nextjs.org/docs)
- [Supabase Docs](https://supabase.com/docs)
- [Tailwind Docs](https://tailwindcss.com/docs)
- [Zod Docs](https://zod.dev)
- [React Docs](https://react.dev)

## Useful VS Code Extensions

- ES7+ React/Redux/React-Native snippets
- Tailwind CSS IntelliSense
- Supabase
- Thunder Client (API testing)
- SQL Formatter

---

**Last Updated**: 2024

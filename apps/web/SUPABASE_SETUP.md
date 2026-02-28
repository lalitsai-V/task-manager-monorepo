# Supabase Storage & Migration Setup Guide

## Step 1: Create the Attachments Storage Bucket

Go to your **Supabase Dashboard** and follow these steps:

1. Navigate to **Storage** (left sidebar)
2. Click **Create a new bucket**
3. Set the following:
   - **Bucket name**: `attachments` (must match what's in the code)
   - **Public bucket**: Toggle **ON** (we're using public URLs for simplicity)
4. Click **Create bucket**

## Step 2: Run the Migration SQL

Go to **SQL Editor** in your Supabase Dashboard:

1. Click **SQL Editor** (left sidebar)
2. Click **New Query**
3. Copy the SQL below and **paste it into the editor**:

```sql
-- Add columns if they don't exist
ALTER TABLE public.tasks
ADD COLUMN IF NOT EXISTS description text,
ADD COLUMN IF NOT EXISTS priority text DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
ADD COLUMN IF NOT EXISTS due_date timestamp with time zone,
ADD COLUMN IF NOT EXISTS attachment_url text;

-- Update existing tasks to have medium priority
UPDATE public.tasks
SET priority = 'medium'
WHERE priority IS NULL;
```

4. Click **Run** (or press Ctrl+Enter)
5. You should see: `Query executed successfully`

## Step 3: (Optional) Add Storage RLS Policies

If you want to restrict file uploads/deletes to the owner, go to **Storage > attachments > Policies** and add:

**INSERT Policy: Users can upload their own files**
```sql
CASE WHEN (bucket_id = 'attachments') THEN
  (auth.uid()::text = (storage.foldername(name))[1])
ELSE false END
```

**DELETE Policy: Users can delete their own files**
```sql
CASE WHEN (bucket_id = 'attachments') THEN
  (auth.uid()::text = (storage.foldername(name))[1])
ELSE false END
```

## Step 4: Verify in Your App

1. Start your dev server:
   ```bash
   npm run dev
   ```

2. Create a task with:
   - Title
   - Due date (optional)
   - Attachment (optional)

3. The attachment should upload and display as a link in the task list.

## Troubleshooting

- **"Bucket does not exist"**: Ensure you created the `attachments` bucket in Storage
- **"Missing column"**: Run the ALTER TABLE SQL in the SQL Editor
- **"Upload fails silently"**: Check browser console for errors; verify Supabase URL and keys are correct
- **Permission denied on upload**: Ensure the bucket is public or set up RLS policies correctly

## API Endpoint Reference

- **PUT file**: POST to `/api/uploads` with FormData containing `file`
- **Get public URL**: `https://<project-id>.supabase.co/storage/v1/object/public/attachments/<path>`

Files are stored in: `user_id/timestamp_filename`

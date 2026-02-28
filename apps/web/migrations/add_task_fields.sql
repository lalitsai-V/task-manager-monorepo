-- Migration: Add due_date and attachment_url to tasks table
-- This migration adds support for task attachments and due dates

-- Add columns if they don't exist
ALTER TABLE public.tasks
ADD COLUMN IF NOT EXISTS due_date timestamp with time zone,
ADD COLUMN IF NOT EXISTS attachment_url text;

-- Create attachments storage bucket (if not exists)
-- Execute this via Supabase Dashboard > Storage > Create new bucket
-- Name: attachments
-- Public/Private: Public (for simplicity; can change to private with signed URLs)

-- Add RLS policy for attachments bucket (execute in Supabase)
-- INSERT policy: Users can upload their own files
-- SELECT policy: Anyone can view (since public URL)
-- UPDATE policy: Users can update their own files
-- DELETE policy: Users can delete their own files

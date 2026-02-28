import { z } from 'zod';
export const createTaskSchema = z.object({
    title: z.string().min(1, 'Task title is required').max(255, 'Title too long'),
    description: z.string().max(2000, 'Description too long').optional().nullable(),
    priority: z.enum(['low', 'medium', 'high']).default('medium'),
    group_id: z.string().uuid().optional().nullable(),
    due_date: z.string().optional().nullable(),
    attachment_url: z.string().url().optional().nullable(),
});
export const updateTaskSchema = z.object({
    title: z.string().min(1, 'Task title is required').max(255, 'Title too long').optional(),
    description: z.string().max(2000, 'Description too long').optional().nullable(),
    priority: z.enum(['low', 'medium', 'high']).optional(),
    is_completed: z.boolean().optional(),
});
export const deleteTaskSchema = z.object({
    id: z.string().uuid('Invalid task ID'),
});
export const createGroupSchema = z.object({
    name: z.string().min(1, 'Group name is required').max(255, 'Name too long'),
});
export const inviteMemberSchema = z.object({
    group_id: z.string().uuid('Invalid group ID'),
    email: z.string().email('Invalid email address'),
});
export const markTaskCompletedSchema = z.object({
    task_id: z.string().uuid('Invalid task ID'),
});

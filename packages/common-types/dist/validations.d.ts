import { z } from 'zod';
export declare const createTaskSchema: z.ZodObject<{
    title: z.ZodString;
    description: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    priority: z.ZodDefault<z.ZodEnum<{
        low: "low";
        medium: "medium";
        high: "high";
    }>>;
    group_id: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    due_date: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    attachment_url: z.ZodNullable<z.ZodOptional<z.ZodString>>;
}, z.core.$strip>;
export declare const updateTaskSchema: z.ZodObject<{
    title: z.ZodOptional<z.ZodString>;
    description: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    priority: z.ZodOptional<z.ZodEnum<{
        low: "low";
        medium: "medium";
        high: "high";
    }>>;
    is_completed: z.ZodOptional<z.ZodBoolean>;
}, z.core.$strip>;
export declare const deleteTaskSchema: z.ZodObject<{
    id: z.ZodString;
}, z.core.$strip>;
export declare const createGroupSchema: z.ZodObject<{
    name: z.ZodString;
}, z.core.$strip>;
export declare const inviteMemberSchema: z.ZodObject<{
    group_id: z.ZodString;
    email: z.ZodString;
}, z.core.$strip>;
export declare const markTaskCompletedSchema: z.ZodObject<{
    task_id: z.ZodString;
}, z.core.$strip>;
export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
export type DeleteTaskInput = z.infer<typeof deleteTaskSchema>;
export type CreateGroupInput = z.infer<typeof createGroupSchema>;
export type InviteMemberInput = z.infer<typeof inviteMemberSchema>;
export type MarkTaskCompletedInput = z.infer<typeof markTaskCompletedSchema>;

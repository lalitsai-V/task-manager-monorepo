'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { getUser } from '@/lib/supabase/server'
import {
  createTaskSchema,
  updateTaskSchema,
  deleteTaskSchema,
  markTaskCompletedSchema,
} from '@taskmanager/common-types'
import type { CreateTaskInput, UpdateTaskInput } from '@taskmanager/common-types'

export async function createTask(input: CreateTaskInput) {
  try {
    const validatedInput = createTaskSchema.parse(input)
    const user = await getUser()

    if (!user) {
      return { error: 'Unauthorized' }
    }

    const supabase = await createClient()

    // If creating a task in a group, verify membership
    if (validatedInput.group_id) {
      const { data: member } = await supabase
        .from('group_members')
        .select('id')
        .eq('group_id', validatedInput.group_id)
        .eq('user_id', user.id)
        .single()

      // Also check if user is the group creator
      let isAuthorized = !!member
      if (!isAuthorized) {
        const { data: group } = await supabase
          .from('groups')
          .select('created_by')
          .eq('id', validatedInput.group_id)
          .single()
        if (group && group.created_by === user.id) isAuthorized = true
      }

      if (!isAuthorized) {
        return { error: 'You must be a member of the group to create tasks' }
      }
    }

    const { data, error } = await supabase
      .from('tasks')
      .insert({
        title: validatedInput.title,
        description: validatedInput.description || null,
        priority: validatedInput.priority || 'medium',
        group_id: validatedInput.group_id || null,
        user_id: user.id,
        is_completed: false, // Default to not completed
        due_date: validatedInput.due_date || null,
        attachment_url: validatedInput.attachment_url || null,
      })
      .select('*')
      .single()

    if (error) {
      return { error: error.message }
    }

    // Revalidate different paths based on whether it's a group task
    if (validatedInput.group_id) {
      revalidatePath(`/dashboard/groups/${validatedInput.group_id}`)
    } else {
      revalidatePath('/dashboard')
    }

    return { data }
  } catch (error) {
    if (error instanceof Error) {
      return { error: error.message }
    }
    return { error: 'Failed to create task' }
  }
}

export async function updateTask(id: string, input: UpdateTaskInput) {
  try {
    updateTaskSchema.parse(input)
    const user = await getUser()

    if (!user) {
      return { error: 'Unauthorized' }
    }

    const supabase = await createClient()

    // Check if user owns the task OR is a group member (collaborative)
    const { data: task, error: fetchError } = await supabase
      .from('tasks')
      .select('user_id, group_id')
      .eq('id', id)
      .single()

    if (fetchError || !task) {
      return { error: 'Task not found' }
    }

    let isAuthorized = task.user_id === user.id

    if (!isAuthorized && task.group_id) {
      // Check if user is a member of the group
      const { data: member } = await supabase
        .from('group_members')
        .select('id')
        .eq('group_id', task.group_id)
        .eq('user_id', user.id)
        .single()

      if (member) isAuthorized = true

      // Also check if user is group creator (if not already member, though usually is)
      if (!isAuthorized) {
        const { data: group } = await supabase
          .from('groups')
          .select('created_by')
          .eq('id', task.group_id)
          .single()

        if (group && group.created_by === user.id) isAuthorized = true
      }
    }

    if (!isAuthorized) {
      return { error: 'Unauthorized' }
    }

    const { data, error } = await supabase
      .from('tasks')
      .update(input)
      .eq('id', id)
      .select('*')
      .single()

    if (error) {
      return { error: error.message }
    }

    if (task.group_id) {
      revalidatePath(`/dashboard/groups/${task.group_id}`)
    } else {
      revalidatePath('/dashboard')
    }

    return { data }
  } catch (error) {
    if (error instanceof Error) {
      return { error: error.message }
    }
    return { error: 'Failed to update task' }
  }
}

export async function deleteTask(id: string) {
  try {
    deleteTaskSchema.parse({ id })
    const user = await getUser()

    if (!user) {
      return { error: 'Unauthorized' }
    }

    const supabase = await createClient()

    // Check if user owns the task OR is a group member (collaborative)
    const { data: task, error: fetchError } = await supabase
      .from('tasks')
      .select('user_id, group_id')
      .eq('id', id)
      .single()

    if (fetchError || !task) {
      return { error: 'Task not found' }
    }

    let isAuthorized = task.user_id === user.id

    if (!isAuthorized && task.group_id) {
      // Check if user is a member of the group
      const { data: member } = await supabase
        .from('group_members')
        .select('id')
        .eq('group_id', task.group_id)
        .eq('user_id', user.id)
        .single()

      if (member) isAuthorized = true

      // Also check if user is group creator (if not already member, though usually is)
      if (!isAuthorized) {
        const { data: group } = await supabase
          .from('groups')
          .select('created_by')
          .eq('id', task.group_id)
          .single()

        if (group && group.created_by === user.id) isAuthorized = true
      }
    }

    if (!isAuthorized) {
      return { error: 'Unauthorized' }
    }

    const { error } = await supabase.from('tasks').delete().eq('id', id)

    if (error) {
      return { error: error.message }
    }

    if (task.group_id) {
      revalidatePath(`/dashboard/groups/${task.group_id}`)
    } else {
      revalidatePath('/dashboard')
    }

    return { success: true }
  } catch (error) {
    if (error instanceof Error) {
      return { error: error.message }
    }
    return { error: 'Failed to delete task' }
  }
}

export async function markTaskCompleted(taskId: string) {
  try {
    markTaskCompletedSchema.parse({ task_id: taskId })
    const user = await getUser()

    if (!user) {
      return { error: 'Unauthorized' }
    }

    const supabase = await createClient()

    // Check if task exists
    const { data: task, error: fetchError } = await supabase
      .from('tasks')
      .select('id, group_id, user_id, is_completed')
      .eq('id', taskId)
      .single()

    if (fetchError || !task) {
      return { error: 'Task not found' }
    }

    // Check for authorization: Group members or Task owner
    let isAuthorized = task.user_id === user.id

    if (!isAuthorized && task.group_id) {
      // Check if user is a member/creator of the group
      const { data: member } = await supabase
        .from('group_members')
        .select('id')
        .eq('group_id', task.group_id)
        .eq('user_id', user.id)
        .single()

      if (member) isAuthorized = true

      if (!isAuthorized) {
        const { data: group } = await supabase
          .from('groups')
          .select('created_by')
          .eq('id', task.group_id)
          .single()

        if (group && group.created_by === user.id) isAuthorized = true
      }
    }

    if (!isAuthorized) {
      return { error: 'Unauthorized' }
    }

    // Toggle global completion status for everyone
    const newStatus = !task.is_completed
    const { error: updateError } = await supabase
      .from('tasks')
      .update({ is_completed: newStatus })
      .eq('id', taskId)

    if (updateError) {
      return { error: updateError.message }
    }

    // Optional: Keep task_completions as a log if needed, or remove it. 
    // Here we update it to reflect "who changed it last" or just maintain consistency.
    // For now, let's just insert/delete to keep history if desired, but the primary source of truth is `tasks.is_completed`.
    if (newStatus) {
      // Add record
      await supabase.from('task_completions').upsert({ task_id: taskId, user_id: user.id }, { onConflict: 'task_id,user_id' })
    } else {
      // Remove record? Or keep? Usually removing implies "not done".
      await supabase.from('task_completions').delete().eq('task_id', taskId).eq('user_id', user.id)
    }

    if (task.group_id) {
      revalidatePath(`/dashboard/groups/${task.group_id}`)
    } else {
      revalidatePath('/dashboard')
    }

    return { success: true }
  } catch (error) {
    if (error instanceof Error) {
      return { error: error.message }
    }
    return { error: 'Failed to mark task completed' }
  }
}

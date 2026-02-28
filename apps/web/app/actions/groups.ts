'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { getUser } from '@/lib/supabase/server'
import { createGroupSchema, inviteMemberSchema } from '@taskmanager/common-types'
import type { CreateGroupInput, InviteMemberInput } from '@taskmanager/common-types'

export async function createGroup(input: CreateGroupInput) {
  try {
    const validatedInput = createGroupSchema.parse(input)
    const user = await getUser()

    if (!user) {
      return { error: 'Unauthorized' }
    }

    const supabase = await createClient()

    // Create group
    const { data: groupData, error: groupError } = await supabase
      .from('groups')
      .insert({
        name: validatedInput.name,
        created_by: user.id,
      })
      .select()
      .single()

    if (groupError) {
      return { error: groupError.message }
    }

    // Creator can now see and manage the group without being in group_members
    // Members will be invited separately via inviteMember()

    revalidatePath('/dashboard/groups')

    return { data: groupData }
  } catch (error) {
    if (error instanceof Error) {
      return { error: error.message }
    }
    return { error: 'Failed to create group' }
  }
}

export async function inviteMember(input: InviteMemberInput) {
  try {
    const validatedInput = inviteMemberSchema.parse(input)
    const user = await getUser()

    if (!user) {
      return { error: 'Unauthorized' }
    }

    const supabase = await createClient()

    // Check if user is group creator (only creator can invite)
    const { data: groupData, error: groupError } = await supabase
      .from('groups')
      .select('created_by')
      .eq('id', validatedInput.group_id)
      .single()

    if (groupError || !groupData) {
      return { error: 'Group not found' }
    }

    if (groupData.created_by !== user.id) {
      return { error: 'Only group creator can invite members' }
    }

    // Call API to invite member with absolute URL
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    const response = await fetch(`${baseUrl}/api/invite-member`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        groupId: validatedInput.group_id,
        email: validatedInput.email,
      }),
    })

    const result = await response.json()

    if (!response.ok) {
      return { error: result.error || 'Failed to invite member' }
    }

    revalidatePath(`/dashboard/groups/${validatedInput.group_id}`)

    return { data: result.data }
  } catch (error) {
    if (error instanceof Error) {
      return { error: error.message }
    }
    return { error: 'Failed to invite member' }
  }
}

export async function getGroups() {
  try {
    const user = await getUser()

    if (!user) {
      return { error: 'Unauthorized' }
    }

    const supabase = await createClient()

    // Get groups user created or is a member of
    const { data: createdGroups, error: createdError } = await supabase
      .from('groups')
      .select('id, name, created_by')
      .eq('created_by', user.id)

    const { data: memberGroups, error: memberError } = await supabase
      .from('group_members')
      .select('groups(id, name, created_by)')
      .eq('user_id', user.id)

    if (createdError || memberError) {
      return { error: createdError?.message || memberError?.message }
    }

    // Combine and deduplicate
    const allGroups = [
      ...(createdGroups || []),
      ...(memberGroups?.map((item: any) => item.groups) || [])
    ]

    const uniqueGroups = Array.from(
      new Map(allGroups.map((g: any) => [g.id, g])).values()
    )

    return { data: uniqueGroups }
  } catch (error) {
    if (error instanceof Error) {
      return { error: error.message }
    }
    return { error: 'Failed to fetch groups' }
  }
}

export async function getGroupTasks(groupId: string) {
  try {
    const user = await getUser()

    if (!user) {
      return { error: 'Unauthorized' }
    }

    const supabase = await createClient()

    // Verify user is group member
    const { data: membership, error: memberError } = await supabase
      .from('group_members')
      .select('id')
      .eq('group_id', groupId)
      .eq('user_id', user.id)
      .single()

    if (memberError || !membership) {
      return { error: 'Access denied' }
    }

    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('group_id', groupId)

    if (error) {
      return { error: error.message }
    }

    return { data }
  } catch (error) {
    if (error instanceof Error) {
      return { error: error.message }
    }
    return { error: 'Failed to fetch group tasks' }
  }
}

export async function getGroupMembers(groupId: string) {
  try {
    const user = await getUser()

    if (!user) {
      return { error: 'Unauthorized' }
    }

    const supabase = await createClient()

    // Verify user is group member
    const { data: membership, error: memberError } = await supabase
      .from('group_members')
      .select('id')
      .eq('group_id', groupId)
      .eq('user_id', user.id)
      .single()

    if (memberError || !membership) {
      return { error: 'Access denied' }
    }

    const { data, error } = await supabase
      .from('group_members')
      .select('user_id')
      .eq('group_id', groupId)

    if (error) {
      return { error: error.message }
    }

    return { data: data?.map((item) => item.user_id) || [] }
  } catch (error) {
    if (error instanceof Error) {
      return { error: error.message }
    }
    return { error: 'Failed to fetch group members' }
  }
}

export async function deleteGroup(groupId: string) {
  try {
    const user = await getUser()

    if (!user) {
      return { error: 'Unauthorized' }
    }

    const supabase = await createClient()

    // Verify user is creator
    const { data: group, error: fetchError } = await supabase
      .from('groups')
      .select('created_by')
      .eq('id', groupId)
      .single()

    if (fetchError || !group) {
      return { error: 'Group not found' }
    }

    if (group.created_by !== user.id) {
      return { error: 'Only the group creator can delete this group' }
    }

    // Delete group
    const { error: deleteError } = await supabase
      .from('groups')
      .delete()
      .eq('id', groupId)

    if (deleteError) {
      return { error: deleteError.message }
    }

    revalidatePath('/dashboard/groups')
    return { success: true }
  } catch (error) {
    if (error instanceof Error) {
      return { error: error.message }
    }
    return { error: 'Failed to delete group' }
  }
}

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceRole = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceRole) {
  throw new Error('Missing Supabase environment variables')
}

export async function getGroupMembersWithDetails(groupId: string) {
  try {
    const adminClient = createClient(supabaseUrl!, supabaseServiceRole!, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })

    // Get group members
    const { data: members, error: membersError } = await adminClient
      .from('group_members')
      .select('user_id, created_at')
      .eq('group_id', groupId)
      .order('created_at', { ascending: true })

    if (membersError) {
      return { error: membersError.message }
    }

    // Get user details for each member
    const { data: users, error: usersError } = await adminClient.auth.admin.listUsers()

    if (usersError) {
      return { error: 'Failed to fetch user details' }
    }

    // Map members with their user emails
    const membersWithDetails = (members || []).map((member) => {
      const userDetail = users.users.find((u) => u.id === member.user_id)
      return {
        userId: member.user_id,
        email: userDetail?.email || 'Unknown',
        createdAt: member.created_at,
      }
    })

    return { data: membersWithDetails }
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Failed to fetch members' }
  }
}

export async function getJoinedGroupDetails(userId: string) {
  try {
    const adminClient = createClient(supabaseUrl!, supabaseServiceRole!, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })

    // Get group IDs user is a member of
    const { data: memberships, error: memberError } = await adminClient
      .from('group_members')
      .select('group_id')
      .eq('user_id', userId)

    if (memberError) {
      return { error: memberError.message }
    }

    if (!memberships || memberships.length === 0) {
      return { data: [] }
    }

    const groupIds = memberships.map((m) => m.group_id)

    // Get group details for all those groups
    const { data: groups, error: groupError } = await adminClient
      .from('groups')
      .select('id, name, created_by')
      .in('id', groupIds)

    if (groupError) {
      return { error: groupError.message }
    }

    return { data: groups || [] }
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Failed to fetch groups' }
  }
}

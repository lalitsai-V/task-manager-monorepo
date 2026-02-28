import { createClient as createAdminClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceRole = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseServiceRole) {
    return NextResponse.json(
      { error: 'Server misconfigured' },
      { status: 500 }
    )
  }

  try {
    const { groupId, email } = await request.json()

    // Validate input
    if (!groupId || !email) {
      return NextResponse.json(
        { error: 'groupId and email are required' },
        { status: 400 }
      )
    }

    // Initialize admin client for looking up users
    const adminClient = createAdminClient(supabaseUrl as string, supabaseServiceRole as string, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })

    // Look up user by email
    const { data: users, error: listError } = await adminClient.auth.admin.listUsers()

    if (listError) {
      console.error('Error listing users:', listError)
      return NextResponse.json(
        { error: 'Failed to look up user' },
        { status: 500 }
      )
    }

    const foundUser = users.users.find((u) => u.email?.toLowerCase() === email.toLowerCase())
    if (!foundUser) {
      return NextResponse.json(
        { error: 'User with this email not found' },
        { status: 404 }
      )
    }

    // Add member to group using admin client
    // This bypasses RLS policies
    const { data, error } = await adminClient
      .from('group_members')
      .insert({
        group_id: groupId,
        user_id: foundUser.id,
      })
      .select()
      .single()

    if (error) {
      // Check if it's a unique constraint error (member already exists)
      if (error.code === '23505') {
        return NextResponse.json(
          { error: 'User is already a member of this group' },
          { status: 409 }
        )
      }
      console.error('Error adding member:', error)
      return NextResponse.json(
        { error: error.message || 'Failed to add member' },
        { status: 500 }
      )
    }

    return NextResponse.json({ data }, { status: 200 })
  } catch (error) {
    console.error('Error inviting member:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}

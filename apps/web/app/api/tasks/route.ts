import { NextResponse } from 'next/server'
import { createClient, getUser } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'

export const dynamic = "force-dynamic";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceRole = process.env.SUPABASE_SERVICE_ROLE_KEY!

export async function GET(req: Request) {
  try {
    const url = new URL(req.url)
    const groupId = url.searchParams.get('groupId')
    const completedParam = url.searchParams.get('completed')
    const completedFilter = completedParam === 'true' ? true : completedParam === 'false' ? false : null

    const user = await getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    // If groupId provided, fetch group tasks
    if (groupId) {
      // Use the anon client with user session to verify authorization via RLS
      const supabase = await createClient()

      // Check membership
      const { data: membership } = await supabase
        .from('group_members')
        .select('id')
        .eq('group_id', groupId)
        .eq('user_id', user.id)
        .maybeSingle()

      let isAuthorized = !!membership

      if (!isAuthorized) {
        // Check if user is the group creator
        const { data: group } = await supabase
          .from('groups')
          .select('created_by')
          .eq('id', groupId)
          .maybeSingle()
        if (group && group.created_by === user.id) isAuthorized = true
      }

      if (!isAuthorized) {
        return NextResponse.json({ error: 'Group not found or access denied' }, { status: 404 })
      }

      // Use admin client to fetch tasks — bypasses RLS so group creator always sees tasks
      // even if they're not in group_members
      const adminClient = createAdminClient(supabaseUrl, supabaseServiceRole, {
        auth: { autoRefreshToken: false, persistSession: false },
      })

      // Note: Removed cross-schema join user:user_id (email) as it is not supported
      const { data: tasks, error: tasksError } = await adminClient
        .from('tasks')
        .select('*')
        .eq('group_id', groupId)
        .order('created_at', { ascending: false })

      if (tasksError) {
        console.error('Tasks fetch error:', tasksError)
        return NextResponse.json({ error: tasksError.message }, { status: 500 })
      }

      let result = tasks || []

      if (completedFilter !== null) {
        result = result.filter((r: any) => r.is_completed === completedFilter)
      }

      return NextResponse.json(result)
    }

    // Personal tasks (no groupId) — use user's own session
    const supabase = await createClient()
    const { data: tasks, error: tasksError } = await supabase
      .from('tasks')
      .select('*')
      .eq('user_id', user.id)
      .is('group_id', null)
      .order('created_at', { ascending: false })

    if (tasksError) return NextResponse.json({ error: tasksError.message }, { status: 500 })

    let result = tasks || []
    if (completedFilter !== null) {
      result = result.filter((r: any) => r.is_completed === completedFilter)
    }
    return NextResponse.json(result)
  } catch (error) {
    console.error('API tasks error:', error)
    return NextResponse.json({ error: 'Failed to fetch tasks' }, { status: 500 })
  }
}

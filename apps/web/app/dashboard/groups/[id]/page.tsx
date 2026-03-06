import { createClient } from '@/lib/supabase/server'
import { getUser } from '@/lib/supabase/server'
import { getGroupMembersWithDetails } from '@/lib/supabase/members'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { TaskList } from '@/components/tasks/TaskList'
import { CreateTaskForm } from '@/components/tasks/CreateTaskForm'
import { InviteMemberForm } from '@/components/groups/InviteMemberForm'
import { Card } from '@taskmanager/ui'
import { GroupDashboard } from '@/components/groups/GroupDashboard'
import { redirect } from 'next/navigation'
import type { TaskCompletion } from '@taskmanager/common-types'

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL ?? "https://placeholder.supabase.co"

const supabaseServiceRole =
  process.env.SUPABASE_SERVICE_ROLE_KEY ?? "placeholder-service-role"

export default async function GroupTasksPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await getUser()

  if (!user) {
    redirect('/login')
  }

  const resolvedParams = await params
  const groupId = resolvedParams.id

  const supabase = await createClient()

  // Verify user is group creator or member (using session client for auth)
  const { data: membership, error: memberError } = await supabase
    .from('group_members')
    .select('id')
    .eq('group_id', groupId)
    .eq('user_id', user.id)
    .maybeSingle()

  const { data: group } = await supabase.from('groups').select('*').eq('id', groupId).maybeSingle()

  // Check if user is creator or member
  const isCreator = group?.created_by === user.id
  const isMember = !memberError && !!membership

  if (!isCreator && !isMember) {
    return <div className="text-red-400">You don't have access to this group</div>
  }

  // Fetch group members with user details
  const membersResult = await getGroupMembersWithDetails(groupId)
  const groupMembers = membersResult.data || []

  // Use admin client to fetch group tasks — bypasses RLS
  // (group creator may not be in group_members, so anon client would return empty)
  const adminClient = createAdminClient(supabaseUrl, supabaseServiceRole, {
    auth: { autoRefreshToken: false, persistSession: false },
  })

  // Note: We remove the join with auth.users (user:user_id) because 
  // cross-schema joins are generally not supported in PostgREST.
  // We will resolve member info from the groupMembers array instead.
  const { data: tasks, error: tasksError } = await adminClient
    .from('tasks')
    .select('*')
    .eq('group_id', groupId)
    .order('created_at', { ascending: false })

  if (tasksError) {
    return <div className="text-red-400 p-4 bg-red-500/10 rounded-lg border border-red-500">Error loading group tasks: {tasksError.message}</div>
  }

  const groupTasks = (tasks || []) as any[]

  // Fetch all completions for group tasks (by any member) using admin client
  const groupTaskIds = groupTasks.map((t) => t.id)
  let allCompletions: any[] = []
  if (groupTaskIds.length > 0) {
    const { data: completions, error: compError } = await adminClient
      .from('task_completions')
      .select('*')
      .in('task_id', groupTaskIds)

    if (completions) {
      allCompletions = completions
    }
  }

  // Group completions by task_id
  const completionsByTask = allCompletions.reduce((acc, completion) => {
    if (!acc[completion.task_id]) {
      acc[completion.task_id] = []
    }
    acc[completion.task_id].push(completion)
    return acc
  }, {} as Record<string, TaskCompletion[]>)

  // Ensure completed tasks have completion records (for backward compatibility)
  const completedTaskIds = groupTasks.filter(t => t.is_completed).map(t => t.id)
  const tasksWithoutCompletions = completedTaskIds.filter(taskId => !completionsByTask[taskId] || completionsByTask[taskId].length === 0)

  if (tasksWithoutCompletions.length > 0) {
    // Create completion records for completed tasks that don't have any
    for (const taskId of tasksWithoutCompletions) {
      const task = groupTasks.find(t => t.id === taskId)
      if (task) {
        // Insert completion record for the task creator
        await supabase.from('task_completions').upsert(
          { task_id: taskId, user_id: task.user_id },
          { onConflict: 'task_id,user_id' }
        )

        // Add to completionsByTask for immediate use
        if (!completionsByTask[taskId]) {
          completionsByTask[taskId] = []
        }
        completionsByTask[taskId].push({
          task_id: taskId,
          user_id: task.user_id,
          completed_at: task.updated_at || task.created_at,
          user: { email: task.user?.email || 'unknown@com' }
        })
      }
    }
  }

  const activeTasks = groupTasks.filter((t) => !t.is_completed)
  const completedTasks = groupTasks.filter((t) => t.is_completed)

  return (
    <GroupDashboard
      groupId={groupId}
      groupName={group?.name || 'Group'}
      isCreator={isCreator}
      currentUserId={user.id}
    >
      <div className="space-y-8">
        <div className="grid md:grid-cols-2 gap-8">
          <Card>
            <h2 className="text-xl font-semibold text-white mb-6">Invite Member</h2>
            <InviteMemberForm groupId={groupId} />
          </Card>

          <Card>
            <h2 className="text-xl font-semibold text-white mb-6">Group Members ({groupMembers.length})</h2>
            {groupMembers.length === 0 ? (
              <p className="text-gray-400">No members joined yet.</p>
            ) : (
              <div className="space-y-2">
                {groupMembers.map((member) => (
                  <div key={member.userId} className="flex items-center justify-between p-3 bg-gray-800/50 rounded text-sm lg:text-base">
                    <div>
                      <p className="text-white text-sm font-medium truncate">{member.email}</p>
                      <p className="text-gray-400 text-xs text-[10px] lg:text-xs">
                        Joined {new Date(member.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    {member.userId === user.id && (
                      <span className="text-[10px] lg:text-xs px-2 py-1 bg-purple-500/20 text-purple-300 rounded">You</span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        <Card>
          <h2 className="text-xl font-semibold text-white mb-6">Create Task</h2>
          <CreateTaskForm groupId={groupId} />
        </Card>

        <Card>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-white">Group Tasks</h2>
            <a href={`#completed-tasks-${groupId}`} className="text-sm text-blue-400 hover:text-blue-300">Show Completed</a>
          </div>
          {groupTasks.length === 0 ? (
            <p className="text-gray-400">No tasks yet. Create one to get started!</p>
          ) : (
            <div className="space-y-6 lg:space-y-8">
              <div>
                <h3 className="text-lg font-medium text-white mb-3 lg:mb-4 flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  Active ({activeTasks.length})
                </h3>
                {activeTasks.length === 0 ? (
                  <div className="text-center py-6 lg:py-8 bg-gray-800/50 rounded-lg border border-gray-700">
                    <p className="text-gray-400">No active tasks.</p>
                  </div>
                ) : (
                  <TaskList
                    tasks={activeTasks}
                    currentUserId={user.id}
                    pollUrl={`/api/tasks?groupId=${groupId}&completed=false`}
                    groupCompletions={completionsByTask}
                    groupMembers={groupMembers}
                  />
                )}
              </div>

              <div id={`completed-tasks-${groupId}`}>
                <h3 className="text-lg font-medium text-white mb-3 lg:mb-4 flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  Completed ({completedTasks.length})
                </h3>
                {completedTasks.length === 0 ? (
                  <div className="text-center py-6 lg:py-8 bg-gray-800/50 rounded-lg border border-gray-700">
                    <p className="text-gray-400">No completed tasks.</p>
                  </div>
                ) : (
                  <TaskList
                    tasks={completedTasks}
                    currentUserId={user.id}
                    pollUrl={`/api/tasks?groupId=${groupId}&completed=true`}
                    groupCompletions={completionsByTask}
                    groupMembers={groupMembers}
                  />
                )}
              </div>
            </div>
          )}
        </Card>
      </div>
    </GroupDashboard>
  )
}


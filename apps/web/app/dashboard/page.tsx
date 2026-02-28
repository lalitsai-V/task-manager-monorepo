import { createClient } from '@/lib/supabase/server'
import { getUser } from '@/lib/supabase/server'
import { TaskList } from '@/components/tasks/TaskList'
import { CreateTaskForm } from '@/components/tasks/CreateTaskForm'
import { Card } from '@taskmanager/ui'
import type { TaskCompletion } from '@taskmanager/common-types' 

export default async function DashboardPage() {
  const user = await getUser()

  if (!user) {
    return <div>Unauthorized</div>
  }

  const supabase = await createClient()

  // Fetch personal tasks (group_id is null)
  const { data: tasks } = await supabase
    .from('tasks')
    .select('*')
    .eq('user_id', user.id)
    .is('group_id', null)
    .order('created_at', { ascending: false })

  const personalTasks = tasks || []

  // Fetch completions for current user for these tasks (for display purposes)
  const taskIds = personalTasks.map((t) => t.id)
  let personalCompletions: Record<string, TaskCompletion[]> = {}
  if (taskIds.length > 0) {
    const { data: completions } = await supabase
      .from('task_completions')
      .select(`
        task_id,
        user_id,
        completed_at,
        user:user_id (
          email
        )
      `)
      .in('task_id', taskIds)
      .eq('user_id', user.id)

    if (completions) {
      completions.forEach((c: any) => {
        if (!personalCompletions[c.task_id]) {
          personalCompletions[c.task_id] = []
        }
        personalCompletions[c.task_id].push({
          id: c.id,
          task_id: c.task_id,
          user_id: c.user_id,
          completed_at: c.completed_at,
          user: c.user || { email: user.email || 'Unknown' }
        })
      })
    }
  }

  // Ensure completed tasks have completion records (for backward compatibility)
  const completedTaskIds = personalTasks.filter(t => t.is_completed).map(t => t.id)
  const tasksWithoutCompletions = completedTaskIds.filter(taskId => !personalCompletions[taskId] || personalCompletions[taskId].length === 0)

  if (tasksWithoutCompletions.length > 0) {
    // Create completion records for completed tasks that don't have any
    for (const taskId of tasksWithoutCompletions) {
      const task = personalTasks.find(t => t.id === taskId)
      if (task) {
        // Insert completion record for the task creator (current user)
        await supabase.from('task_completions').upsert(
          { task_id: taskId, user_id: user.id },
          { onConflict: 'task_id,user_id' }
        )

        // Add to personalCompletions for immediate use
        if (!personalCompletions[taskId]) {
          personalCompletions[taskId] = []
        }
        personalCompletions[taskId].push({
          id: `${taskId}-${user.id}`,
          task_id: taskId,
          user_id: user.id,
          completed_at: task.updated_at || task.created_at,
          user: { email: user.email || 'Unknown' }
        })
      }
    }
  }

  const activeTasks = personalTasks.filter((t) => !t.is_completed)
  const completedTasks = personalTasks.filter((t) => t.is_completed)

  return (
    <div className="space-y-6 lg:space-y-8">
      <div className="pt-4 lg:pt-0">
        <h1 className="text-3xl lg:text-4xl font-bold text-white mb-2">Personal Tasks</h1>
        <p className="text-gray-400 text-sm lg:text-base">Manage your personal task list and stay organized</p>
      </div>

      <Card className="p-4 lg:p-6">
        <h2 className="text-lg lg:text-xl font-semibold text-white mb-4 lg:mb-6">Create New Task</h2>
        <CreateTaskForm />
      </Card>

      <Card className="p-4 lg:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 lg:mb-6 gap-4">
          <h2 className="text-lg lg:text-xl font-semibold text-white">Your Tasks</h2>
        </div>

        {personalTasks.length === 0 ? (
          <div className="text-center py-8 lg:py-12">
            <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <p className="text-gray-400 mb-2">No tasks yet. Create one to get started!</p>
            <p className="text-sm text-gray-500">Your tasks will appear here once you create them.</p>
          </div>
        ) : (
          <div className="space-y-6 lg:space-y-8">
            <div>
              <h3 className="text-base lg:text-lg font-medium text-white mb-3 lg:mb-4 flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                Active ({activeTasks.length})
              </h3>
              {activeTasks.length === 0 ? (
                <div className="text-center py-6 lg:py-8 bg-gray-800/50 rounded-lg border border-gray-700">
                  <p className="text-gray-400">No active tasks.</p>
                  <p className="text-sm text-gray-500 mt-1">All caught up! 🎉</p>
                </div>
              ) : (
                <TaskList tasks={activeTasks} currentUserId={user.id} pollUrl={`/api/tasks?completed=false`} groupCompletions={personalCompletions} />
              )}
            </div>

            <div>
              <h3 className="text-base lg:text-lg font-medium text-white mb-3 lg:mb-4 flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                Completed ({completedTasks.length})
              </h3>
              {completedTasks.length === 0 ? (
                <div className="text-center py-6 lg:py-8 bg-gray-800/50 rounded-lg border border-gray-700">
                  <p className="text-gray-400">No completed tasks yet.</p>
                  <p className="text-sm text-gray-500 mt-1">Complete some tasks to see them here.</p>
                </div>
              ) : (
                <TaskList tasks={completedTasks} currentUserId={user.id} pollUrl={`/api/tasks?completed=true`} groupCompletions={personalCompletions} />
              )}
            </div>
          </div>
        )}
      </Card>
    </div>
  )
}


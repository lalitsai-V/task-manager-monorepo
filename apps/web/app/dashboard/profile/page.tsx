import { createClient } from '@/lib/supabase/server'
import { getUser } from '@/lib/supabase/server'
import { getJoinedGroupDetails } from '@/lib/supabase/members'
import { Card } from '@taskmanager/ui'
import { redirect } from 'next/navigation'

export default async function ProfilePage() {
  const user = await getUser()

  if (!user) {
    redirect('/login')
  }

  const supabase = await createClient()

  // Run queries in parallel for better performance
  const [totalTasksResult, completedTasksResult, joinedGroupsResult, createdGroupsResult] = await Promise.all([
    supabase
      .from('tasks')
      .select('*', { count: 'exact' })
      .eq('user_id', user.id),
    supabase
      .from('task_completions')
      .select('*', { count: 'exact' })
      .eq('user_id', user.id),
    getJoinedGroupDetails(user.id),
    supabase
      .from('groups')
      .select('id, name')
      .eq('created_by', user.id)
  ])

  const { count: totalTasks } = totalTasksResult
  const { count: completedTasksCount } = completedTasksResult
  const joinedGroups = joinedGroupsResult.data || []
  const createdGroups = createdGroupsResult.data || []

  // Combine and deduplicate groups
  const allGroups = [...joinedGroups, ...(createdGroups || [])]
  const groups = allGroups.filter((group, index, self) => 
    index === self.findIndex(g => g.id === group.id)
  )

  return (
    <div className="space-y-6 lg:space-y-8">
      <div className="pt-4 lg:pt-0">
        <h1 className="text-3xl lg:text-4xl font-bold text-white mb-2">Profile</h1>
        <p className="text-gray-400 text-sm lg:text-base">View your account information and statistics</p>
      </div>

      <div className="grid sm:grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-8">
        <Card className="p-4 lg:p-6">
          <h2 className="text-lg lg:text-xl font-semibold text-white mb-4 lg:mb-6 flex items-center gap-2">
            <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            Account Information
          </h2>
          <div className="space-y-4 lg:space-y-6">
            <div className="p-3 lg:p-4 bg-gray-700/50 rounded-lg">
              <p className="text-sm text-gray-400 mb-1">Email Address</p>
              <p className="text-white font-medium break-all">{user.email}</p>
            </div>
            <div className="p-3 lg:p-4 bg-gray-700/50 rounded-lg">
              <p className="text-sm text-gray-400 mb-1">User ID</p>
              <p className="text-white font-medium text-sm break-all">{user.id}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4 lg:p-6">
          <h2 className="text-lg lg:text-xl font-semibold text-white mb-4 lg:mb-6 flex items-center gap-2">
            <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            Statistics
          </h2>
          <div className="space-y-4 lg:space-y-6">
            <div className="p-4 lg:p-6 bg-gradient-to-r from-primary/10 to-primary-hover/10 border border-primary/20 rounded-lg">
              <p className="text-sm text-gray-400 mb-2">Total Tasks Created</p>
              <p className="text-3xl lg:text-4xl font-bold text-primary">{totalTasks || 0}</p>
            </div>
            <div className="p-4 lg:p-6 bg-gradient-to-r from-green-500/10 to-green-600/10 border border-green-500/20 rounded-lg">
              <p className="text-sm text-gray-400 mb-2">Tasks Completed</p>
              <p className="text-3xl lg:text-4xl font-bold text-green-500">{completedTasksCount || 0}</p>
            </div>
          </div>
        </Card>
      </div>

      <Card className="p-4 lg:p-6">
        <h2 className="text-lg lg:text-xl font-semibold text-white mb-4 lg:mb-6 flex items-center gap-2">
          <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          Groups ({groups.length})
        </h2>
        {groups.length === 0 ? (
          <div className="text-center py-6 lg:py-8">
            <div className="w-12 h-12 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <p className="text-gray-400 mb-1">No groups joined yet</p>
            <p className="text-sm text-gray-500">Join groups to collaborate with team members</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-4">
            {groups.map((group) => (
              <div key={group.id} className="p-3 lg:p-4 bg-gray-700/50 rounded-lg border border-gray-600 hover:bg-gray-700/70 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0">
                    <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-white font-medium truncate">{group.name}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  )
}


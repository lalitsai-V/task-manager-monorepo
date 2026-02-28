import { createClient } from '@/lib/supabase/server'
import { getUser } from '@/lib/supabase/server'
import { getJoinedGroupDetails } from '@/lib/supabase/members'
import { CreateGroupForm } from '@/components/groups/CreateGroupForm'
import { GroupList } from '@/components/groups/GroupList'
import { Card } from '@taskmanager/ui'

export default async function GroupsPage() {
  const user = await getUser()

  if (!user) {
    return <div>Unauthorized</div>
  }

  const supabase = await createClient()

  // Fetch groups user created
  const { data: createdGroups, error: createdError } = await supabase
    .from('groups')
    .select('id, name, created_by')
    .eq('created_by', user.id)

  // Fetch groups user joined (using admin helper to bypass RLS recursion)
  const joinedResult = await getJoinedGroupDetails(user.id)
  const joinedGroups = joinedResult.data?.filter((g: any) => g.created_by !== user.id) || []

  if (createdError) {
    return <div className="text-red-400">Error loading groups</div>
  }

  return (
    <div className="space-y-6 lg:space-y-8">
      <div className="pt-4 lg:pt-0">
        <h1 className="text-3xl lg:text-4xl font-bold text-white mb-2">Groups</h1>
        <p className="text-gray-400 text-sm lg:text-base">Create or join groups to collaborate with team members</p>
      </div>

      <Card className="p-4 lg:p-6">
        <h2 className="text-lg lg:text-xl font-semibold text-white mb-4 lg:mb-6">Create New Group</h2>
        <CreateGroupForm />
      </Card>

      <Card className="p-4 lg:p-6">
        <h2 className="text-lg lg:text-xl font-semibold text-white mb-4 lg:mb-6">Your Groups ({(createdGroups?.length || 0) + joinedGroups.length})</h2>
        {!createdGroups?.length && !joinedGroups.length ? (
          <div className="text-center py-8 lg:py-12">
            <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <p className="text-gray-400 mb-2">No groups yet. Create one to get started!</p>
            <p className="text-sm text-gray-500">Groups help you collaborate with team members on shared tasks.</p>
          </div>
        ) : (
          <div className="space-y-6 lg:space-y-8">
            {createdGroups && createdGroups.length > 0 && (
              <div>
                <h3 className="text-base lg:text-lg font-medium text-blue-400 mb-3 lg:mb-4 flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  Created ({createdGroups.length})
                </h3>
                <GroupList groups={createdGroups} />
              </div>
            )}

            {joinedGroups.length > 0 && (
              <div>
                <h3 className="text-base lg:text-lg font-medium text-green-400 mb-3 lg:mb-4 flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  Joined ({joinedGroups.length})
                </h3>
                <GroupList groups={joinedGroups} />
              </div>
            )}
          </div>
        )}
      </Card>
    </div>
  )
}


import Link from 'next/link'
import { Group } from '@taskmanager/common-types'

export function GroupList({ groups }: { groups: Group[] }) {
  return (
    <div className="grid gap-4">
      {groups.map((group) => (
        <Link key={group.id} href={`/dashboard/groups/${group.id}`}>
          <div className="p-4 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors cursor-pointer group">
            <h3 className="text-lg font-semibold text-white group-hover:text-red-400 transition-colors">
              {group.name}
            </h3>
            <p className="text-sm text-gray-400 mt-1">Click to view tasks</p>
          </div>
        </Link>
      ))}
    </div>
  )
}

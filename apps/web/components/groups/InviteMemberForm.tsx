'use client'

import { useState } from 'react'
import { Button, Input } from '@taskmanager/ui'
import { inviteMember } from '@/app/actions/groups'

export function InviteMemberForm({ groupId }: { groupId: string }) {
  const [email, setEmail] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const result = await inviteMember({
        group_id: groupId,
        email,
      })

      if (result.error) {
        setError(result.error)
        return
      }

      setEmail('')
    } catch (err) {
      setError('Failed to invite member')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <div className="p-3 bg-primary/20 border border-primary rounded text-primary/70 text-sm">{error}</div>}
      <Input
        placeholder="Enter email address..."
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      <Button
        type="submit"
        variant="primary"
        disabled={loading}
        className="bg-purple-600 hover:bg-purple-700 text-white border-purple-700"
      >
        {loading ? 'Inviting...' : 'Invite Member'}
      </Button>
    </form>
  )
}


'use client'

import { useState } from 'react'
import { Button, Input } from '@taskmanager/ui'
import { createGroup } from '@/app/actions/groups'

export function CreateGroupForm() {
  const [name, setName] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const result = await createGroup({
        name,
      })

      if (result.error) {
        setError(result.error)
        return
      }

      setName('')
    } catch (err) {
      setError('Failed to create group')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <div className="p-3 bg-primary/20 border border-primary rounded text-primary/70 text-sm">{error}</div>}
      <Input
        placeholder="Enter group name..."
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
      />
      <Button type="submit" variant="primary" disabled={loading} className="!bg-purple-600 !hover:bg-purple-700 !text-white !border-purple-700">
        {loading ? 'Creating...' : 'Create Group'}
      </Button>
    </form>
  )
}


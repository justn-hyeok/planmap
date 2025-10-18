import { createServerSupabaseClient } from '@/lib/supabase/server'
import { NextRequest } from 'next/server'

export async function PUT(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient()
    const { nodes } = await request.json()

    if (!nodes || !Array.isArray(nodes)) {
      return Response.json({ error: 'Invalid nodes data' }, { status: 400 })
    }

    // Bulk update nodes
    const updates = await Promise.all(
      nodes.map(async ({ id, ...updateData }) => {
        const { data, error } = await supabase
          .from('nodes')
          .update(updateData)
          .eq('id', id)
          .select()
          .single()

        if (error) throw error
        return data
      })
    )

    return Response.json(updates)
  } catch (error) {
    console.error('Bulk update nodes error:', error)
    return Response.json(
      { error: error instanceof Error ? error.message : 'Failed to update nodes' },
      { status: 500 }
    )
  }
}
import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createServerSupabaseClient()
    const { id } = await params

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { title, content, progress, position, type, style, data } = body

    // Verify node belongs to user's mindmap
    const { data: existingNode, error: nodeError } = await supabase
      .from('nodes')
      .select('id, mindmap_id')
      .eq('id', id)
      .single()

    if (nodeError || !existingNode) {
      console.error('Node not found:', nodeError)
      return NextResponse.json({ error: 'Node not found' }, { status: 404 })
    }

    // Verify mindmap belongs to user
    const { data: mindmap, error: mindmapError } = await supabase
      .from('mindmaps')
      .select('id')
      .eq('id', (existingNode as any).mindmap_id)
      .eq('user_id', user.id)
      .single()

    if (mindmapError || !mindmap) {
      console.error('Mindmap access denied:', mindmapError)
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    // Build update object (only include defined fields)
    const updateData: any = {}
    if (title !== undefined) updateData.title = title
    if (content !== undefined) updateData.content = content
    if (progress !== undefined) updateData.progress = progress
    if (position !== undefined) updateData.position = position
    if (type !== undefined) updateData.type = type
    if (style !== undefined) updateData.style = style
    if (data !== undefined) updateData.data = data

    // Update node
    const { data: updatedNode, error } = await (supabase as any)
      .from('nodes')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Node update error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(updatedNode)
  } catch (error) {
    console.error('Node update error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createServerSupabaseClient()
    const { id } = await params

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify node belongs to user's mindmap
    const { data: existingNode, error: nodeError } = await supabase
      .from('nodes')
      .select('id, mindmap_id')
      .eq('id', id)
      .single()

    if (nodeError || !existingNode) {
      console.error('Node not found:', nodeError)
      return NextResponse.json({ error: 'Node not found' }, { status: 404 })
    }

    // Verify mindmap belongs to user
    const { data: mindmap, error: mindmapError } = await supabase
      .from('mindmaps')
      .select('id')
      .eq('id', (existingNode as any).mindmap_id)
      .eq('user_id', user.id)
      .single()

    if (mindmapError || !mindmap) {
      console.error('Mindmap access denied:', mindmapError)
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    // Delete node (edges will be deleted by CASCADE)
    const { error } = await supabase
      .from('nodes')
      .delete()
      .eq('id', id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Node delete error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
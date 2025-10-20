import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const mindmapId = searchParams.get('mindmap_id')
    const supabase = await createServerSupabaseClient()

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!mindmapId) {
      return NextResponse.json({ error: 'mindmap_id is required' }, { status: 400 })
    }

    // Verify mindmap belongs to user
    const { data: mindmap } = await supabase
      .from('mindmaps')
      .select('id')
      .eq('id', mindmapId)
      .eq('user_id', user.id)
      .single()

    if (!mindmap) {
      return NextResponse.json({ error: 'Mindmap not found' }, { status: 404 })
    }

    // Get edges for the mindmap
    const { data: edges, error } = await supabase
      .from('edges')
      .select('*')
      .eq('mindmap_id', mindmapId)
      .order('created_at', { ascending: true })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(edges)
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient()

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { mindmap_id, react_flow_id, source_node_id, target_node_id, type, style, data } = body

    // Validate required fields
    if (!mindmap_id || !source_node_id || !target_node_id) {
      return NextResponse.json({
        error: 'mindmap_id, source_node_id, and target_node_id are required'
      }, { status: 400 })
    }

    // Verify mindmap belongs to user
    const { data: mindmap } = await supabase
      .from('mindmaps')
      .select('id')
      .eq('id', mindmap_id)
      .eq('user_id', user.id)
      .single()

    if (!mindmap) {
      return NextResponse.json({ error: 'Mindmap not found' }, { status: 404 })
    }

    // Verify source and target nodes exist and belong to the mindmap
    const { data: nodes } = await supabase
      .from('nodes')
      .select('react_flow_id')
      .eq('mindmap_id', mindmap_id)
      .in('react_flow_id', [source_node_id, target_node_id])

    if (!nodes || nodes.length !== 2) {
      return NextResponse.json({
        error: 'Source or target node not found in this mindmap'
      }, { status: 400 })
    }

    // Create new edge
    const { data: edge, error } = await (supabase as any)
      .from('edges')
      .insert({
        mindmap_id,
        react_flow_id: react_flow_id || `edge-${source_node_id}-${target_node_id}-${Date.now()}`,
        source_node_id,
        target_node_id,
        type: type || 'default',
        style: style || null,
        data: data || null,
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(edge, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const edgeId = searchParams.get('id')
    const reactFlowId = searchParams.get('react_flow_id')
    const supabase = await createServerSupabaseClient()

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!edgeId && !reactFlowId) {
      return NextResponse.json({
        error: 'Either id or react_flow_id is required'
      }, { status: 400 })
    }

    // Build query based on available identifier
    let query = supabase.from('edges').select('id, mindmap_id')

    if (edgeId) {
      query = query.eq('id', edgeId)
    } else if (reactFlowId) {
      query = query.eq('react_flow_id', reactFlowId)
    } else {
      return NextResponse.json({
        error: 'Either id or react_flow_id is required'
      }, { status: 400 })
    }

    const { data: edge } = await query.single()

    if (!edge) {
      return NextResponse.json({ error: 'Edge not found' }, { status: 404 })
    }

    // Verify mindmap belongs to user
    const { data: mindmap } = await supabase
      .from('mindmaps')
      .select('id')
      .eq('id', (edge as any).mindmap_id)
      .eq('user_id', user.id)
      .single()

    if (!mindmap) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    // Delete edge
    const { error: deleteError } = await supabase
      .from('edges')
      .delete()
      .eq('id', (edge as any).id)

    if (deleteError) {
      return NextResponse.json({ error: deleteError.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
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

    // Get nodes for the mindmap
    const { data: nodes, error } = await supabase
      .from('nodes')
      .select('*')
      .eq('mindmap_id', mindmapId)
      .order('created_at', { ascending: true })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(nodes)
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
    const { mindmap_id, react_flow_id, title, content, progress, position, type, style, data } = body

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

    // Create new node
    const { data: node, error } = await (supabase as any)
      .from('nodes')
      .insert({
        mindmap_id,
        react_flow_id: react_flow_id || `node-${Date.now()}`,
        title: title || '새 노드',
        content: content || '',
        progress: progress || 0,
        position: position || { x: 0, y: 0 },
        type: type || 'default',
        style: style || null,
        data: data || null,
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(node, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
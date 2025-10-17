import { NextRequest, NextResponse } from 'next/server'
import { mockNodes } from '@/lib/mock-data'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const mindmapId = searchParams.get('mindmap_id')

  if (mindmapId) {
    const filteredNodes = mockNodes.filter(node => node.mindmap_id === mindmapId)
    return NextResponse.json(filteredNodes)
  }

  return NextResponse.json(mockNodes)
}

export async function POST(request: NextRequest) {
  const body = await request.json()

  const newNode = {
    id: `node-${Date.now()}`,
    mindmap_id: body.mindmap_id,
    title: body.title || '새 노드',
    content: body.content || '',
    progress: body.progress || 0,
    position_x: body.position_x || 0,
    position_y: body.position_y || 0,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }

  return NextResponse.json(newNode, { status: 201 })
}
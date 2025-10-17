import { NextRequest, NextResponse } from 'next/server'
import { mockMindmaps } from '@/lib/mock-data'

export async function GET() {
  return NextResponse.json(mockMindmaps)
}

export async function POST(request: NextRequest) {
  const body = await request.json()

  const newMindmap = {
    id: `mindmap-${Date.now()}`,
    title: body.title || '새 마인드맵',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    user_id: 'user-1'
  }

  return NextResponse.json(newMindmap, { status: 201 })
}
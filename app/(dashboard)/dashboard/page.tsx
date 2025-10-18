'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Plus, Search, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useMindmaps, useCreateMindmap, useDeleteMindmap } from '@/lib/hooks/use-mindmaps'
import { formatRelativeTime } from '@/lib/utils'

export default function DashboardPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const { data: mindmaps, isLoading } = useMindmaps()
  const createMindmap = useCreateMindmap()
  const deleteMindmap = useDeleteMindmap()

  // Filter mindmaps based on search query
  const filteredMindmaps = mindmaps?.filter((mindmap) =>
    mindmap.title.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleCreateMindmap = async () => {
    const title = prompt('새 마인드맵의 제목을 입력하세요:')
    if (title) {
      createMindmap.mutate({ title })
    }
  }

  const handleDeleteMindmap = async (id: string, title: string, e: React.MouseEvent) => {
    e.preventDefault() // Prevent navigation
    if (confirm(`"${title}" 마인드맵을 삭제하시겠습니까?`)) {
      deleteMindmap.mutate(id)
    }
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="text-gray-500">마인드맵 목록을 불러오는 중...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">내 마인드맵</h1>
        <Button onClick={handleCreateMindmap} disabled={createMindmap.isPending}>
          <Plus className="w-4 h-4 mr-2" />
          {createMindmap.isPending ? '생성 중...' : '새 마인드맵'}
        </Button>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <Input
          placeholder="마인드맵 검색..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Mindmaps Grid */}
      {filteredMindmaps && filteredMindmaps.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMindmaps.map((mindmap) => (
            <Card key={mindmap.id} className="hover:shadow-lg transition-shadow group">
              <Link href={`/mindmap/${mindmap.id}`}>
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg line-clamp-2 flex-1 mr-2">
                      {mindmap.title}
                    </CardTitle>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => handleDeleteMindmap(mindmap.id, mindmap.title, e)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity text-red-500 hover:text-red-700"
                      disabled={deleteMindmap.isPending}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {mindmap.description && (
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {mindmap.description}
                      </p>
                    )}
                    <div className="flex justify-between items-center text-xs text-gray-500">
                      <span>수정: {formatRelativeTime(mindmap.updated_at)}</span>
                      <span>생성: {formatRelativeTime(mindmap.created_at)}</span>
                    </div>
                    <div className="pt-2">
                      <span className="text-blue-600 text-sm font-medium">열기 →</span>
                    </div>
                  </div>
                </CardContent>
              </Link>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="text-gray-500 mb-4">
            {searchQuery ? '검색 결과가 없습니다.' : '아직 생성된 마인드맵이 없습니다.'}
          </div>
          {!searchQuery && (
            <Button onClick={handleCreateMindmap} disabled={createMindmap.isPending}>
              <Plus className="w-4 h-4 mr-2" />
              첫 번째 마인드맵 만들기
            </Button>
          )}
        </div>
      )}
    </div>
  )
}
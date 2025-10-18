'use client'

import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Slider } from '@/components/ui/slider'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { useUpdateNode, useDeleteNode } from '@/lib/hooks/use-nodes'
import { getProgressColor, validateProgress } from '@/lib/utils'
import type { Database } from '@/types/database'

type DatabaseNode = Database['public']['Tables']['nodes']['Row']

interface NodeSidebarProps {
  node: DatabaseNode | null
  isOpen: boolean
  onClose: () => void
}

export default function NodeSidebar({ node, isOpen, onClose }: NodeSidebarProps) {
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [progress, setProgress] = useState(0)

  const updateNode = useUpdateNode()
  const deleteNode = useDeleteNode()

  // Update form when node changes
  useEffect(() => {
    if (node) {
      setTitle(node.title)
      setContent(node.content || '')
      setProgress(node.progress)
    }
  }, [node])

  const handleSave = async () => {
    if (!node) return

    updateNode.mutate({
      id: node.id,
      title: title.trim() || '새 노드',
      content: content.trim(),
      progress: validateProgress(progress),
    })

    onClose()
  }

  const handleDelete = async () => {
    if (!node) return

    if (confirm('정말로 이 노드를 삭제하시겠습니까?')) {
      deleteNode.mutate(node.id)
      onClose()
    }
  }

  const progressColor = getProgressColor(progress)

  if (!isOpen || !node) {
    return null
  }

  return (
    <div className="fixed inset-y-0 right-0 w-80 bg-white shadow-lg border-l border-gray-200 z-50 overflow-y-auto">
      <div className="p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">노드 편집</h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        <div className="space-y-6">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">제목</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="노드 제목을 입력하세요"
            />
          </div>

          {/* Content */}
          <div className="space-y-2">
            <Label htmlFor="content">내용</Label>
            <Textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="학습 내용을 입력하세요"
              rows={6}
            />
          </div>

          {/* Progress */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>진도율</Label>
              <span
                className="text-sm font-medium px-2 py-1 rounded"
                style={{
                  backgroundColor: progressColor.bgColor,
                  color: progressColor.textColor,
                }}
              >
                {progress}%
              </span>
            </div>

            <Slider
              value={[progress]}
              onValueChange={(value) => setProgress(value[0])}
              max={100}
              step={1}
              className="w-full"
            />

            {/* Progress Preview */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">미리보기</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">{title || '새 노드'}</span>
                    <span
                      className="text-xs font-medium px-2 py-1 rounded-full"
                      style={{
                        backgroundColor: progressColor.color,
                        color: 'white',
                      }}
                    >
                      {progress}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="h-2 rounded-full transition-all duration-300"
                      style={{
                        width: `${progress}%`,
                        backgroundColor: progressColor.color,
                      }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Separator />

          {/* Actions */}
          <div className="space-y-2">
            <Button
              onClick={handleSave}
              className="w-full"
              disabled={updateNode.isPending}
            >
              {updateNode.isPending ? '저장 중...' : '저장'}
            </Button>

            <Button
              onClick={handleDelete}
              variant="destructive"
              className="w-full"
              disabled={deleteNode.isPending}
            >
              {deleteNode.isPending ? '삭제 중...' : '삭제'}
            </Button>
          </div>

          {/* Node Info */}
          <div className="text-xs text-gray-500 space-y-1">
            <div>생성일: {new Date(node.created_at).toLocaleDateString('ko-KR')}</div>
            <div>수정일: {new Date(node.updated_at).toLocaleDateString('ko-KR')}</div>
            <div>ID: {node.react_flow_id}</div>
          </div>
        </div>
      </div>
    </div>
  )
}
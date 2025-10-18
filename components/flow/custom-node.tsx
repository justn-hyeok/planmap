'use client'

import { memo } from 'react'
import { Handle, Position, type NodeProps } from 'reactflow'
import { getProgressColor, getProgressLevel } from '@/lib/utils'
import { Card, CardContent, CardHeader } from '@/components/ui/card'

type NodeData = {
  title: string
  content?: string
  progress: number
  onEdit?: (nodeId: string) => void
}

function StudyNode({ id, data, selected }: NodeProps<NodeData>) {
  const progressColor = getProgressColor(data.progress)
  const progressLevel = getProgressLevel(data.progress)

  const handleClick = () => {
    console.log('Node clicked:', id, 'onEdit:', data.onEdit)
    data.onEdit?.(id)
  }

  return (
    <Card
      className={`
        min-w-[200px] max-w-[300px] cursor-pointer transition-all duration-200
        ${selected ? 'ring-2 ring-blue-500 shadow-lg' : 'hover:shadow-md'}
      `}
      onClick={handleClick}
      style={{
        borderColor: progressColor.borderColor,
        backgroundColor: progressColor.bgColor,
      }}
    >
      <Handle type="target" position={Position.Top} className="w-3 h-3" />

      <CardHeader className="pb-2">
        <div className="flex items-center justify-between gap-2">
          <h3
            className="font-medium text-sm line-clamp-2 flex-1"
            style={{ color: progressColor.textColor }}
          >
            {data.title}
          </h3>
          <span
            className="text-xs font-medium px-2 py-1 rounded-full"
            style={{
              backgroundColor: progressColor.color,
              color: 'white',
            }}
          >
            {data.progress}%
          </span>
        </div>
      </CardHeader>

      {data.content && (
        <CardContent className="pt-0">
          <p className="text-xs text-gray-600 line-clamp-3">
            {data.content}
          </p>
        </CardContent>
      )}

      {/* Progress Bar */}
      <div className="px-4 pb-4">
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="h-2 rounded-full transition-all duration-300"
            style={{
              width: `${data.progress}%`,
              backgroundColor: progressColor.color,
            }}
          />
        </div>
      </div>

      <Handle type="source" position={Position.Bottom} className="w-3 h-3" />
    </Card>
  )
}

export default memo(StudyNode)
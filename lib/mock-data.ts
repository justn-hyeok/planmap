import type { Node, Edge } from 'reactflow'

export interface Mindmap {
  id: string
  title: string
  created_at: string
  updated_at: string
  user_id: string
}

export interface NodeData {
  id: string
  mindmap_id: string
  title: string
  content: string
  progress: number // 0-100
  position_x: number
  position_y: number
  created_at: string
  updated_at: string
}

export const mockMindmaps: Mindmap[] = [
  {
    id: 'mindmap-1',
    title: 'React 학습 로드맵',
    created_at: '2024-10-01T00:00:00Z',
    updated_at: '2024-10-12T00:00:00Z',
    user_id: 'user-1'
  },
  {
    id: 'mindmap-2',
    title: 'TypeScript 마스터하기',
    created_at: '2024-10-05T00:00:00Z',
    updated_at: '2024-10-10T00:00:00Z',
    user_id: 'user-1'
  },
  {
    id: 'mindmap-3',
    title: 'Next.js 풀스택 개발',
    created_at: '2024-10-08T00:00:00Z',
    updated_at: '2024-10-12T00:00:00Z',
    user_id: 'user-1'
  }
]

export const mockNodes: NodeData[] = [
  // React 학습 로드맵 노드들
  {
    id: 'node-1',
    mindmap_id: 'mindmap-1',
    title: 'React 기초',
    content: 'JSX, 컴포넌트, Props, State 학습',
    progress: 90,
    position_x: 250,
    position_y: 100,
    created_at: '2024-10-01T00:00:00Z',
    updated_at: '2024-10-12T00:00:00Z'
  },
  {
    id: 'node-2',
    mindmap_id: 'mindmap-1',
    title: 'Hooks',
    content: 'useState, useEffect, useContext, 커스텀 훅',
    progress: 75,
    position_x: 450,
    position_y: 200,
    created_at: '2024-10-02T00:00:00Z',
    updated_at: '2024-10-11T00:00:00Z'
  },
  {
    id: 'node-3',
    mindmap_id: 'mindmap-1',
    title: 'State Management',
    content: 'Context API, Redux, Zustand',
    progress: 30,
    position_x: 650,
    position_y: 300,
    created_at: '2024-10-03T00:00:00Z',
    updated_at: '2024-10-10T00:00:00Z'
  },
  {
    id: 'node-4',
    mindmap_id: 'mindmap-1',
    title: 'React Router',
    content: 'SPA 라우팅, 동적 라우팅, 네비게이션',
    progress: 60,
    position_x: 250,
    position_y: 300,
    created_at: '2024-10-04T00:00:00Z',
    updated_at: '2024-10-09T00:00:00Z'
  },
  // TypeScript 마스터하기 노드들
  {
    id: 'node-5',
    mindmap_id: 'mindmap-2',
    title: 'TypeScript 기초',
    content: '타입 시스템, 인터페이스, 제네릭',
    progress: 80,
    position_x: 300,
    position_y: 150,
    created_at: '2024-10-05T00:00:00Z',
    updated_at: '2024-10-10T00:00:00Z'
  },
  {
    id: 'node-6',
    mindmap_id: 'mindmap-2',
    title: '고급 타입',
    content: 'Utility Types, Mapped Types, Conditional Types',
    progress: 20,
    position_x: 500,
    position_y: 250,
    created_at: '2024-10-06T00:00:00Z',
    updated_at: '2024-10-09T00:00:00Z'
  }
]

// React Flow용 노드 변환 함수
export const convertToFlowNodes = (nodes: NodeData[]): Node[] => {
  return nodes.map(node => ({
    id: node.id,
    position: { x: node.position_x, y: node.position_y },
    data: {
      label: node.title,
      content: node.content,
      progress: node.progress
    },
    type: 'default'
  }))
}

// React Flow용 엣지 데이터 (임시)
export const mockEdges: Edge[] = [
  {
    id: 'edge-1-2',
    source: 'node-1',
    target: 'node-2',
    type: 'smoothstep'
  },
  {
    id: 'edge-2-3',
    source: 'node-2',
    target: 'node-3',
    type: 'smoothstep'
  },
  {
    id: 'edge-1-4',
    source: 'node-1',
    target: 'node-4',
    type: 'smoothstep'
  },
  {
    id: 'edge-5-6',
    source: 'node-5',
    target: 'node-6',
    type: 'smoothstep'
  }
]

// 진도율별 색상 반환
export const getProgressColor = (progress: number): string => {
  if (progress <= 33) return '#ef4444' // 빨강
  if (progress <= 66) return '#eab308' // 노랑
  return '#22c55e' // 초록
}
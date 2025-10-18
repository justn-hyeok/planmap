// 진도율별 색상 정의
export const PROGRESS_COLORS = {
  LOW: {
    range: [0, 33],
    color: '#ef4444', // red-500
    bgColor: '#fee2e2', // red-100
    borderColor: '#fecaca', // red-200
    textColor: '#dc2626', // red-600
  },
  MEDIUM: {
    range: [34, 66],
    color: '#f59e0b', // amber-500
    bgColor: '#fef3c7', // amber-100
    borderColor: '#fed7aa', // amber-200
    textColor: '#d97706', // amber-600
  },
  HIGH: {
    range: [67, 100],
    color: '#10b981', // emerald-500
    bgColor: '#dcfce7', // emerald-100
    borderColor: '#bbf7d0', // emerald-200
    textColor: '#059669', // emerald-600
  },
} as const

// 노드 타입 정의
export const NODE_TYPES = {
  STUDY_NODE: 'studyNode',
  DEFAULT: 'default',
} as const

// 엣지 타입 정의
export const EDGE_TYPES = {
  DEFAULT: 'default',
  STRAIGHT: 'straight',
  STEP: 'step',
  SMOOTH_STEP: 'smoothstep',
} as const

// API 엔드포인트
export const API_ENDPOINTS = {
  MINDMAPS: '/api/mindmaps',
  NODES: '/api/nodes',
  EDGES: '/api/edges',
  AUTH: '/api/auth',
} as const

// 기본 뷰포트 설정
export const DEFAULT_VIEWPORT = {
  x: 0,
  y: 0,
  zoom: 1,
} as const

// 기본 노드 위치
export const DEFAULT_NODE_POSITION = {
  x: 100,
  y: 100,
} as const

// React Query 키
export const QUERY_KEYS = {
  MINDMAPS: 'mindmaps',
  MINDMAP: 'mindmap',
  NODES: 'nodes',
  EDGES: 'edges',
  USER: 'user',
} as const

// 로컬 스토리지 키
export const STORAGE_KEYS = {
  FLOW_STATE: 'planmap_flow_state',
  USER_PREFERENCES: 'planmap_user_preferences',
} as const

// 디바운스 딜레이 (ms)
export const DEBOUNCE_DELAY = {
  AUTO_SAVE: 1000,
  SEARCH: 300,
  RESIZE: 100,
} as const
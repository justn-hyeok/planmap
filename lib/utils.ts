import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { PROGRESS_COLORS } from './constants'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * 진도율에 따른 색상을 반환
 */
export function getProgressColor(progress: number) {
  if (progress <= 33) return PROGRESS_COLORS.LOW
  if (progress <= 66) return PROGRESS_COLORS.MEDIUM
  return PROGRESS_COLORS.HIGH
}

/**
 * 진도율 레벨을 반환
 */
export function getProgressLevel(progress: number): 'low' | 'medium' | 'high' {
  if (progress <= 33) return 'low'
  if (progress <= 66) return 'medium'
  return 'high'
}

/**
 * UUID 생성
 */
export function generateId(): string {
  return crypto.randomUUID()
}

/**
 * 날짜 포맷팅
 */
export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

/**
 * 상대 시간 포맷팅
 */
export function formatRelativeTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  const now = new Date()
  const diffInMinutes = Math.floor((now.getTime() - d.getTime()) / (1000 * 60))

  if (diffInMinutes < 1) return '방금 전'
  if (diffInMinutes < 60) return `${diffInMinutes}분 전`

  const diffInHours = Math.floor(diffInMinutes / 60)
  if (diffInHours < 24) return `${diffInHours}시간 전`

  const diffInDays = Math.floor(diffInHours / 24)
  if (diffInDays < 30) return `${diffInDays}일 전`

  return formatDate(d)
}

/**
 * 디바운스 함수
 */
export function debounce<T extends (...args: any[]) => void>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout

  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => func(...args), delay)
  }
}

/**
 * 진도율 검증
 */
export function validateProgress(progress: number): number {
  return Math.max(0, Math.min(100, Math.round(progress)))
}

/**
 * 안전한 JSON 파싱
 */
export function safeJsonParse<T>(json: string, fallback: T): T {
  try {
    return JSON.parse(json)
  } catch {
    return fallback
  }
}

/**
 * 제목 슬러그화
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9가-힣]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

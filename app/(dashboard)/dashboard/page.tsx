'use client'

import Link from 'next/link'
import { mockMindmaps } from '@/lib/mock-data'

export default function DashboardPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">내 마인드맵</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mockMindmaps.map((mindmap) => (
          <Link
            key={mindmap.id}
            href={`/mindmap/${mindmap.id}`}
            className="block p-6 bg-white rounded-lg border border-gray-200 shadow-md hover:shadow-lg transition-shadow"
          >
            <h2 className="text-xl font-semibold mb-2">{mindmap.title}</h2>
            <p className="text-gray-500 text-sm mb-4">
              마지막 수정: {new Date(mindmap.updated_at).toLocaleDateString('ko-KR')}
            </p>
            <div className="flex justify-between items-center">
              <span className="text-blue-600 text-sm font-medium">열기 →</span>
              <span className="text-gray-400 text-xs">
                {new Date(mindmap.created_at).toLocaleDateString('ko-KR')} 생성
              </span>
            </div>
          </Link>
        ))}
      </div>

      <button className="mt-8 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
        새 마인드맵 만들기
      </button>
    </div>
  )
}
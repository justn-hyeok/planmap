import Link from 'next/link'
import AuthForm from '@/components/auth/auth-form'

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-4">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">Planmap</h1>
          <p className="mt-2 text-sm text-gray-600">마인드맵 기반 학습 플래너</p>
        </div>
        <AuthForm mode="login" />
        <div className="text-center">
          <p className="text-sm text-gray-600">
            계정이 없으신가요?{' '}
            <Link href="/signup" className="font-medium text-blue-600 hover:text-blue-500">
              회원가입
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
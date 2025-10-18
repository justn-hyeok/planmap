'use client'

import { useState } from 'react'
import { useAuth } from '@/lib/hooks/use-auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

interface AuthFormProps {
  mode: 'login' | 'signup'
}

export default function AuthForm({ mode }: AuthFormProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const { signIn, signUp, loading } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (mode === 'login') {
      const { error } = await signIn(email, password)
      if (error) {
        console.error('Login error:', error)
        setError(`로그인 실패: ${error.message}`)
      }
    } else {
      const { data, error } = await signUp(email, password)
      if (error) {
        console.error('Signup error:', error)
        setError(`회원가입 실패: ${error.message}`)
      } else if (data.user && !data.session) {
        setError('회원가입 완료! 이메일 확인 후 로그인해주세요.')
      }
    }
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>{mode === 'login' ? '로그인' : '회원가입'}</CardTitle>
        <CardDescription>
          {mode === 'login'
            ? 'Planmap에 로그인하여 학습 계획을 관리하세요'
            : 'Planmap 계정을 생성하여 시작하세요'
          }
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">이메일</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">비밀번호</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>
          {error && (
            <div className="text-sm text-red-500 bg-red-50 p-2 rounded">
              {error}
            </div>
          )}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? '처리 중...' : (mode === 'login' ? '로그인' : '회원가입')}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
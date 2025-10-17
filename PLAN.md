# 마인드맵 기반 학습 플래너 (planmap) 개발 계획

## 프로젝트 개요

**Horizon Studio → planmap 리메이크 프로젝트**

- **원본**: React Flow 기반 로드맵 시각화 도구
- **목표**: 마인드맵 기반 학습 플래너로 전환
- **기간**: 1주일 MVP 완성
- **과목**: 웹 프로그래밍 (소프트웨어개발과 2116 황준혁)

## 기술 스택 변경

### 기존 (Horizon Studio)
- React 18 + TypeScript
- React Flow
- Zustand + TanStack Query
- Emotion + Tailwind CSS
- Vite

### 신규 (planmap)
- **Next.js 14 (App Router)** + TypeScript
- React Flow
- Zustand + TanStack Query v5
- **shadcn/ui** + Tailwind CSS
- **Supabase** (PostgreSQL + Auth)

## 주요 기능 변경사항

### 기존 → 신규
- 로드맵 노드 → **학습 주제 노드**
- 진행률 추적 → **진도율 (0-100%) + 색상 시각화**
- 로컬/API 모드 → **Supabase 전용**
- 일반 사용자 → **개인 학습 관리**

## 개발 단계별 계획

### 1단계: 프로젝트 기반 설정
- [ ] Next.js 14 + TypeScript 프로젝트 초기화
- [ ] 폴더 구조 설계 및 생성
- [ ] shadcn/ui + Tailwind CSS 설정
- [ ] 기본 레이아웃 컴포넌트 구성

### 2단계: 백엔드 인프라
- [ ] Supabase 프로젝트 생성 및 설정
- [ ] 데이터베이스 스키마 설계
  - `mindmaps` 테이블 (id, title, user_id, created_at, updated_at)
  - `nodes` 테이블 (id, mindmap_id, title, content, progress, position_x, position_y, created_at, updated_at)
  - `edges` 테이블 (id, mindmap_id, source_node_id, target_node_id, created_at)
- [ ] Supabase 환경변수 설정
- [ ] 인증 설정 (JWT)

### 3단계: 상태 관리 및 API
- [ ] React Query v5 설정 및 Provider 구성
- [ ] Zustand 스토어 설계
  - `authStore`: 사용자 인증 상태
  - `mindmapStore`: 선택된 마인드맵, 노드, 엣지 상태
- [ ] Supabase 클라이언트 설정
- [ ] API 훅 구현 (React Query)

### 4단계: 인증 시스템
- [ ] 로그인/회원가입 페이지 구현
- [ ] Supabase Auth 통합
- [ ] 인증 미들웨어 구현
- [ ] 보호된 라우팅 설정

### 5단계: 코어 UI 컴포넌트
- [ ] 대시보드 레이아웃
- [ ] 마인드맵 목록 컴포넌트
- [ ] 마인드맵 CRUD 기능
- [ ] 반응형 네비게이션

### 6단계: React Flow 마인드맵 캔버스
- [ ] React Flow 기본 설정
- [ ] 커스텀 노드 컴포넌트 구현
  - 학습 주제 표시
  - 진도율 시각화 (0-33% 빨강, 34-66% 노랑, 67-100% 초록)
  - 노드 스타일링
- [ ] 엣지(연결선) 커스터마이징
- [ ] 드래그 앤 드롭 기능
- [ ] 줌/팬 컨트롤

### 7단계: 노드 관리 기능
- [ ] 노드 추가/삭제 기능
- [ ] 노드 상세 편집 사이드바
  - 제목 수정
  - 학습 내용 입력
  - 진도율 슬라이더 (0-100%)
- [ ] 노드 위치 저장 기능
- [ ] 실시간 진도율 색상 반영

### 8단계: 데이터 동기화
- [ ] 자동 저장 기능 (Debounce 적용)
- [ ] 실시간 데이터 동기화
- [ ] 에러 핸들링 및 로딩 상태
- [ ] 오프라인 대응 (옵션)

### 9단계: 추가 기능 (시간 여유 시)
- [ ] 마인드맵 제목 검색
- [ ] 노드 필터링 (진도율별)
- [ ] 키보드 단축키
- [ ] 마인드맵 내보내기/가져오기

### 10단계: 최적화 및 배포
- [ ] 성능 최적화
- [ ] 타입 안정성 검증
- [ ] 테스트 작성 (옵션)
- [ ] Vercel 배포 설정
- [ ] 환경별 설정 (dev/prod)

## 파일 구조 설계

```
planmap/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # 인증 관련 라우트 그룹
│   │   ├── login/
│   │   └── signup/
│   ├── (dashboard)/              # 대시보드 라우트 그룹
│   │   ├── dashboard/
│   │   └── mindmap/[id]/
│   ├── api/                      # API Routes
│   │   ├── mindmaps/
│   │   ├── nodes/
│   │   └── edges/
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components/                   # 재사용 가능한 컴포넌트
│   ├── ui/                       # shadcn/ui 컴포넌트
│   ├── auth/                     # 인증 관련 컴포넌트
│   ├── mindmap/                  # 마인드맵 관련 컴포넌트
│   │   ├── MindmapCanvas.tsx
│   │   ├── CustomNode.tsx
│   │   ├── NodeEditor.tsx
│   │   └── ProgressIndicator.tsx
│   └── layout/                   # 레이아웃 컴포넌트
├── lib/                          # 유틸리티 및 설정
│   ├── supabase.ts              # Supabase 클라이언트
│   ├── utils.ts                 # 일반 유틸리티
│   └── types.ts                 # TypeScript 타입 정의
├── store/                        # Zustand 스토어
│   ├── authStore.ts
│   └── mindmapStore.ts
├── hooks/                        # React Query 훅
│   ├── useMindmaps.ts
│   ├── useNodes.ts
│   └── useAuth.ts
└── providers/                    # Context Providers
    ├── QueryProvider.tsx
    └── AuthProvider.tsx
```

## 데이터베이스 스키마

### mindmaps 테이블
```sql
CREATE TABLE mindmaps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### nodes 테이블
```sql
CREATE TABLE nodes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mindmap_id UUID REFERENCES mindmaps(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  content TEXT DEFAULT '',
  progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  position_x FLOAT DEFAULT 0,
  position_y FLOAT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### edges 테이블
```sql
CREATE TABLE edges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mindmap_id UUID REFERENCES mindmaps(id) ON DELETE CASCADE,
  source_node_id UUID REFERENCES nodes(id) ON DELETE CASCADE,
  target_node_id UUID REFERENCES nodes(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## 주요 컴포넌트 설계

### MindmapCanvas.tsx
- React Flow 래퍼 컴포넌트
- 노드/엣지 상태 관리
- 드래그 앤 드롭 이벤트 핸들링
- 자동 저장 기능

### CustomNode.tsx
- 학습 주제 노드 UI
- 진도율 시각적 표시
- 클릭 이벤트 핸들링

### NodeEditor.tsx
- 노드 상세 편집 사이드바
- 제목, 내용, 진도율 편집
- 실시간 업데이트

### ProgressIndicator.tsx
- 진도율 색상 시스템
- 0-33%: 빨강 (#ef4444)
- 34-66%: 노랑 (#f59e0b)
- 67-100%: 초록 (#10b981)

## 핵심 기능 명세

### 진도율 시각화
```typescript
const getProgressColor = (progress: number): string => {
  if (progress <= 33) return '#ef4444'; // 빨강
  if (progress <= 66) return '#f59e0b'; // 노랑
  return '#10b981'; // 초록
};
```

### 자동 저장 (Debounce)
```typescript
const debouncedSave = useCallback(
  debounce((data: MindmapData) => {
    saveMindmap(data);
  }, 1000),
  []
);
```

## 성공 기준

### 필수 기능 완성도
- [ ] 회원가입/로그인 동작
- [ ] 마인드맵 CRUD 완성
- [ ] 노드 추가/수정/삭제 동작
- [ ] 진도율 시각화 정상 작동
- [ ] 드래그 앤 드롭 위치 저장
- [ ] 반응형 UI 구현

### 기술적 완성도
- [ ] TypeScript 타입 안정성
- [ ] React Query 상태 관리
- [ ] Supabase 연동 안정성
- [ ] 에러 핸들링 구현

### 배포 및 문서화
- [ ] Vercel 배포 성공
- [ ] README.md 작성
- [ ] 데모 영상/스크린샷 준비

## 마일스톤

- **Day 1-2**: 프로젝트 설정 및 기반 구조 (1-4단계)
- **Day 3-4**: 인증 시스템 및 기본 UI (5-6단계)
- **Day 5-6**: 마인드맵 캔버스 및 노드 기능 (7-8단계)
- **Day 7**: 최적화, 버그 수정, 배포 (10단계)

## 참고 자료

- [React Flow 공식 문서](https://reactflow.dev/)
- [Next.js 14 App Router](https://nextjs.org/docs)
- [Supabase 문서](https://supabase.com/docs)
- [shadcn/ui 컴포넌트](https://ui.shadcn.com/)
- [TanStack Query v5](https://tanstack.com/query/latest)
# Planmap 수정사항 리스트

**분석 날짜**: 2025-01-21
**현재 상태**: 핵심 기능 미완성 - Edge 관리 시스템 완전 누락

## 🚨 Critical Issues (즉시 수정 필요)

### 1. **Edge API 완전 누락**
- **파일**: `/app/api/edges/route.ts` 존재하지 않음
- **문제**: constants.ts:44에 정의된 `/api/edges` 엔드포인트 미구현
- **영향**: 노드 간 연결선 생성/저장/삭제 불가능
- **위치**:
  - `lib/constants.ts:44` - API_ENDPOINTS.EDGES 정의
  - `components/flow/flow-canvas.tsx:233` - TODO 주석만 존재

### 2. **Edge 데이터베이스 연동 누락**
- **파일**: `components/flow/flow-canvas.tsx`
- **문제**: onConnect 함수에서 edge 생성 시 DB 저장 로직 없음
- **코드**:
  ```typescript
  const onConnect = useCallback((params: Connection) => {
    setEdges((eds) => addEdge(params, eds))
    // TODO: Save edge to database  <- 미구현
  }, [setEdges])
  ```

### 3. **타입 안전성 문제**
- **파일**: 여러 API 라우트
- **문제**: `(supabase as any)` 패턴으로 타입 체크 우회
- **위치**:
  - `app/api/mindmaps/[id]/route.ts`
  - `app/api/nodes/route.ts`

## 🟡 Important Issues (단기 수정)

### 4. **스키마 불일치**
- **문제**: API와 데이터베이스 스키마 간 불일치
- **세부사항**:
  - API에서 `description` 필드 사용하지만 PLAN.md 스키마에 없음
  - nodes 테이블에 추가된 컬럼들이 문서와 불일치

### 5. **자동 저장 미구현**
- **파일**: `lib/constants.ts`
- **문제**: SAVE_SETTINGS 정의되어 있지만 실제 구현 없음
- **설정**:
  ```typescript
  AUTO_SAVE_INTERVAL: 5 * 60 * 1000, // 5분마다 자동 저장
  DEBOUNCE_DELAY: 300,
  ```

### 6. **실시간 동기화 준비 부족**
- **상태**: Supabase 클라이언트만 설정됨
- **누락**: Realtime 구독 설정 및 상태 동기화 로직

## 🟢 Nice to Have (장기 개선)

### 7. **에러 핸들링 부족**
- API 라우트에서 일관된 에러 응답 형식 없음
- 프론트엔드 에러 상태 관리 미흡

### 8. **성능 최적화 기회**
- React Flow 상태 관리 최적화 가능
- 불필요한 리렌더링 발생 가능성

## 📋 수정 우선순위 및 작업 계획

### Phase 1: 핵심 기능 복구 (Critical)
1. **Edge API 구현** ⚡
   - `/app/api/edges/route.ts` 생성
   - CRUD 작업 구현 (POST, GET, PUT, DELETE)
   - Supabase edges 테이블 연동

2. **Edge 저장 기능 구현** ⚡
   - `flow-canvas.tsx`의 onConnect에서 DB 저장 로직 추가
   - Edge 삭제 시 DB에서 제거 로직 추가

3. **타입 안전성 복구** ⚡
   - `as any` 제거
   - 적절한 타입 가드 및 에러 핸들링 추가

### Phase 2: 데이터 정합성 (Important)
4. **스키마 동기화**
   - API와 DB 스키마 일치시키기
   - 타입 정의 정확성 확보

5. **자동 저장 구현**
   - Debounce 로직으로 자동 저장 구현
   - 변경사항 추적 및 배치 저장

### Phase 3: 실시간 기능 준비 (Important)
6. **Realtime 기반 구조 설계**
   - Supabase Realtime 채널 설정
   - 실시간 상태 동기화 로직 구현

## 🔍 검증 체크리스트

각 수정사항 완료 후 확인:

- [ ] Edge 생성/삭제가 UI와 DB에서 동기화됨
- [ ] 타입 에러 0개 (npm run type-check)
- [ ] API 응답이 일관된 형식
- [ ] 자동 저장이 설정된 간격으로 작동
- [ ] 페이지 새로고침 시 모든 데이터 복원됨

## 📊 현재 구현 현황

| 기능 | 상태 | 완성도 |
|------|------|--------|
| 인증 시스템 | ✅ 완료 | 100% |
| Mindmap CRUD | ✅ 완료 | 100% |
| Node CRUD | ⚠️ 부분 완료 | 80% |
| **Edge CRUD** | ❌ **미구현** | **0%** |
| React Flow 기본 | ✅ 완료 | 90% |
| 자동 저장 | ❌ 미구현 | 0% |
| 실시간 동기화 | ❌ 미구현 | 0% |

**전체 프로젝트 완성도: 60%**

---

**다음 작업**: Edge API 구현부터 시작하여 Phase 1 완료 후 기능 테스트
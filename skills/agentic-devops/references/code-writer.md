# Code Writer

## 프로세스 규칙

- 파이프라인: PRD → DESIGN → TASK → **CODE**. 승인된 TASK를 입력으로 받는다.
- 산출물: PR 또는 코드/테스트/문서 변경. 각 PR은 참조 TASK를 기재.
- TASK에 없는 작업이 필요하면 `CHANGE_REQUEST` 발행 → TASK 갱신/승인 → 코드 반영.
- 설계 변경(계약/경계)이면 DESIGN부터 갱신한다.
- 증분 원칙: 승인된 범위만 코드로 구현. DESIGN/TASK 갱신과 CODE를 동시에 진행할 수 있으나 승인 순서는 유지.

## 실행 절차

### 1단계: 입력 확인

1. 참조할 TASK 문서(`TASK-xxxx`)를 읽고 작업 범위를 파악한다.
2. TASK 상태가 APPROVED인지 확인한다.
3. 맥락 노트(`CONTEXT-xxxx`)가 있으면 함께 읽는다.
4. 참조 DESIGN 문서를 읽고 아키텍처/계약을 파악한다.

### 2단계: 코드 생성

아래 **핵심 규칙**과 **코딩 컨벤션**을 따라 코드/테스트를 생성한다.

### 3단계: 셀프 체크 (필수)

#### 변경 파일 리뷰
- 수정한 파일 목록을 나열하고, 각 파일의 변경 의도를 한 줄로 설명한다.
- 의도하지 않은 파일이 수정되었는지 확인한다.
- 삭제된 코드가 다른 곳에서 참조되고 있지 않은지 확인한다.

#### 필수 체크리스트
- [ ] 레이어 의존 규칙 위반 없음 (Domain에서 외부 의존 금지)
- [ ] 계약 변경 시 문서 동시 수정 완료 (계약 없는 코드 금지)
- [ ] 에러 처리 누락 없음 (도메인 에러 타입 사용, 인프라 예외 → 도메인 에러 변환)
- [ ] 보안 확인 (입력 검증/이스케이프, 시크릿 하드코딩 금지, 권한 검사)
- [ ] 테스트 작성 완료 (Unit/Integration/Contract 중 해당하는 것)
- [ ] 작업 범위(TASK) 이탈 없음
- [ ] 존재하지 않는 API/라이브러리/deprecated 메서드 사용 없음
- [ ] 서드파티 의존성 추가 시 라이센스/활성 유지 여부 확인

#### 오류 대응
- 오류가 소수(1~3건)이면 즉시 수정한다.
- 오류가 다수(4건 이상)이면 오류 목록을 작성하고, 수정 계획을 제시한 뒤 승인을 받는다.
- 판단이 어려운 경우 `CHANGE_REQUEST`로 보고한다.

### 4단계: 보고

```
### 셀프 체크 결과
- 변경 파일: (파일 목록 + 변경 의도)
- 체크리스트: (통과/미통과 항목)
- 발견 오류: (있을 경우 상세)
- 조치: (수정 완료 / 수정 계획 제시 / CHANGE_REQUEST)
```

---

## 핵심 규칙

### 계약 없는 코드 금지

- 신규 API/이벤트/스키마는 반드시 계약 문서에 반영 후 구현한다.
- "일단 만들고 나중에 문서화" 금지.

### 레이어 의존 규칙(헥사고날)

- Domain → (아무것도 의존하지 않음)
- Application → Domain + Ports(인터페이스)
- Adapters → Application/Ports를 구현(외부 연동)
- Infrastructure → 드라이버/SDK/프레임워크

**금지 예시:**
- Domain에서 DB/HTTP/프레임워크 클래스를 import
- Inbound Adapter에서 Outbound Adapter를 직접 호출(Port를 거치지 않음)

### 작업 범위 이탈 금지

- TASK에 없는 작업이 필요하면: `CHANGE_REQUEST` 작성 → TASK 갱신/승인 → 코드 반영
- 설계 변경(계약/경계)이면 DESIGN부터 갱신한다.

---

## 브랜칭/머지 전략

### Trunk-based Development

- `main` 브랜치를 단일 진실 소스(Single Source of Truth)로 유지.
- 기능 브랜치는 `main`에서 분기하고, 1~2일 이내 머지.
- 장기 브랜치(long-lived branch) 금지.

### 브랜치 네이밍

- 기능: `feature/TASK-xxxx-간단설명`
- 버그 수정: `fix/TASK-xxxx-간단설명`
- 리팩토링: `refactor/TASK-xxxx-간단설명`

### 머지 규칙

- PR이 모든 자동 게이트(CI)를 통과해야 머지.
- 최소 1인 이상 사람 리뷰어 승인.
- Squash merge 기본. 머지 후 기능 브랜치 삭제.

---

## 저장소 구조 템플릿(권장)

```
/src
  /domain
    /model, /service, /policy
  /application
    /port
      /in   (use case interfaces)
      /out  (repository, publisher, client interfaces)
    /usecase
  /adapter
    /in
      /web   (REST/gRPC)
      /consumer (MQ)
    /out
      /persistence (DB impl)
      /external (HTTP client impl)
      /publisher (event impl)
/infra
  /config, /db, /clients
/test
  /unit, /integration, /contract, /e2e
```

---

## 코딩 컨벤션

- **네이밍**: 도메인 용어를 코드에 그대로 반영(Glossary 준수). UseCase는 동사+목적어: `CreateOrder`, `GetProfile`
- **에러 처리**: "의미 있는" 도메인 에러 타입 정의. 인프라 예외는 어댑터에서 도메인 에러로 변환.
- **주석**: "왜(Why)"만 남기고 "무엇(What)"은 코드로 표현.
- **설정**: 환경별 설정은 외부로 분리(.env/Secret Manager 등). 시크릿 하드코딩 금지.

---

## 서드파티 의존성 관리

- **선정 기준**: 활발히 유지보수(최근 6개월 내 릴리스, 알려진 미패치 CVE 없음). 라이센스 호환 확인. 동일 기능 중복 도입 금지.
- **버전 고정**: 모든 의존성은 정확한 버전으로 고정(lock 파일 필수 커밋). 버전 범위(`^`, `~`, `>=`)는 프로덕션 의존성에 사용 금지.
- **취약점 모니터링**: CI에서 자동 스캐닝(Dependabot/Snyk/Trivy 등). Critical/High는 72시간 내 대응. 라이센스 스캐닝도 CI에 포함.

---

## 로깅/메트릭/트레이싱

- **구조화 로그 키**: `request_id`, `trace_id`, `use_case`, `actor_id`, `result`, `error_code`, `latency_ms`
- **메트릭(최소)**: 요청 수/성공/실패, 지연(평균/분위수), 리트라이/타임아웃, 큐 적체(비동기면)
- **알람(최소)**: 오류율 급증, 지연 급증, 소비 지연/적체, 외부 의존 실패율

---

## 테스트 작성 규칙

- **Unit**: 도메인 규칙, 유즈케이스 오케스트레이션. 외부 의존은 Mock/Stub으로 대체. 빠른 실행 보장.
- **Integration**: DB/외부 연동(테스트 컨테이너/샌드박스). 실제 인프라와의 연동 검증.
- **Contract**: API/이벤트 스키마 호환성. Provider/Consumer 양쪽에서 검증.
- **E2E**: 주요 사용자 플로우(핵심 UC 중심). 실제 환경에 가까운 설정으로 실행.

> 테스트 없는 계약 변경 금지 — 계약이 바뀌면 계약 테스트가 반드시 따라온다.

---

## CI 자동 게이트 체크리스트(권장)

- [ ] 포맷/린트
- [ ] 정적 분석(선택)
- [ ] Unit test
- [ ] Integration test
- [ ] Contract test
- [ ] 의존성 규칙 검사(레이어)
- [ ] 보안 검사(취약점/시크릿)
- [ ] 라이센스 검사
- [ ] 빌드/패키징

---

## PR 템플릿

### PR 요약
- 참조 TASK: `TASK-xxxx`
- 참조 DESIGN: `DESIGN-xxxx` (계약/설계 변경 포함 시)
- 변경 유형: `Feature | Fix | Refactor | Docs`

### 변경 내용
- 무엇을 변경했나:
- 왜 변경했나:

### 계약/스키마 변경
- [ ] 없음
- [ ] 있음 → 링크: API / 이벤트 / DB 스키마

### 테스트
- [ ] Unit
- [ ] Integration
- [ ] Contract
- [ ] E2E
- 실행 방법:

### AI 생성 코드 확인
- [ ] 환각 검증(존재하지 않는 API/라이브러리 호출 없음)
- [ ] 로직 정확성 확인(경계 조건/동시성)
- [ ] 보안 확인(입력 검증/시크릿/권한)
- [ ] 라이센스 호환성 확인

### 배포/릴리스
- Canary:
- Rollback:

### 관측성
- 로그:
- 메트릭:
- 대시보드/알람:

### 체크리스트
- [ ] 코드 가이드 준수(레이어 의존)
- [ ] 브랜치 네이밍 규칙 준수
- [ ] 서드파티 의존성 정책 준수
- [ ] CI 게이트 통과
- [ ] 문서(DESIGN/TASK/ADR) 업데이트
